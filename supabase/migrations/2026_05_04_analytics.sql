-- ============================================================
-- Analytics tables — pageviews, completion events, popular posts
-- All inserts flow through SECURITY DEFINER RPCs so the anon
-- key never touches table privileges directly.
-- Idempotent — safe to re-run.
-- ============================================================

create table if not exists public.analytics_pageview (
  id              bigserial primary key,
  path            text not null,
  pillar          text,
  template        text,
  slug            text,
  referrer        text,
  ua_class        text,           -- "mobile" | "tablet" | "desktop" | "bot"
  country         text,
  visitor_hash    text,           -- daily-rotated salted hash (no PII)
  created_at      timestamptz not null default now()
);

create index if not exists analytics_pageview_path_idx        on public.analytics_pageview (path);
create index if not exists analytics_pageview_created_at_idx  on public.analytics_pageview (created_at desc);
create index if not exists analytics_pageview_slug_idx        on public.analytics_pageview (slug) where slug is not null;

create table if not exists public.analytics_event (
  id              bigserial primary key,
  kind            text not null,  -- "scroll_25" | "scroll_50" | "scroll_75" | "read_complete" | "share" | "outbound"
  path            text not null,
  slug            text,
  meta            jsonb,
  visitor_hash    text,
  created_at      timestamptz not null default now()
);

create index if not exists analytics_event_kind_idx        on public.analytics_event (kind);
create index if not exists analytics_event_created_at_idx  on public.analytics_event (created_at desc);
create index if not exists analytics_event_slug_idx        on public.analytics_event (slug) where slug is not null;

-- Stripe webhook idempotency table — prevents double processing
create table if not exists public.stripe_event_log (
  event_id        text primary key,
  event_type      text not null,
  received_at     timestamptz not null default now()
);

-- Lock down direct table access; only the RPCs below are exposed.
alter table public.analytics_pageview enable row level security;
alter table public.analytics_event    enable row level security;
alter table public.stripe_event_log   enable row level security;

-- No policies → anon/authenticated cannot select/insert directly.

-- ------------------------------------------------------------
-- RPC: record a pageview
-- ------------------------------------------------------------
create or replace function public.sage_after_dark_track_pageview(
  p_path         text,
  p_pillar       text,
  p_template     text,
  p_slug         text,
  p_referrer     text,
  p_ua_class     text,
  p_visitor_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Cheap server-side validation
  if p_path is null or length(p_path) = 0 or length(p_path) > 512 then
    raise exception 'invalid_path';
  end if;
  if p_ua_class = 'bot' then
    return; -- silently drop bot traffic
  end if;

  insert into public.analytics_pageview
    (path, pillar, template, slug, referrer, ua_class, visitor_hash)
  values
    (p_path,
     nullif(p_pillar, ''),
     nullif(p_template, ''),
     nullif(p_slug, ''),
     nullif(left(coalesce(p_referrer, ''), 512), ''),
     nullif(p_ua_class, ''),
     nullif(p_visitor_hash, ''));
end;
$$;

revoke all on function public.sage_after_dark_track_pageview(text,text,text,text,text,text,text) from public;
grant  execute on function public.sage_after_dark_track_pageview(text,text,text,text,text,text,text) to anon, authenticated;

-- ------------------------------------------------------------
-- RPC: record an event (scroll milestones, completion, share, outbound)
-- ------------------------------------------------------------
create or replace function public.sage_after_dark_track_event(
  p_kind         text,
  p_path         text,
  p_slug         text,
  p_meta         jsonb,
  p_visitor_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind is null or length(p_kind) = 0 or length(p_kind) > 64 then
    raise exception 'invalid_kind';
  end if;
  if p_path is null or length(p_path) = 0 or length(p_path) > 512 then
    raise exception 'invalid_path';
  end if;
  if p_kind not in (
    'scroll_25','scroll_50','scroll_75','read_complete','share','outbound','dwell_60s'
  ) then
    raise exception 'unknown_kind';
  end if;

  insert into public.analytics_event (kind, path, slug, meta, visitor_hash)
  values
    (p_kind, p_path, nullif(p_slug, ''), p_meta, nullif(p_visitor_hash, ''));
end;
$$;

revoke all on function public.sage_after_dark_track_event(text,text,text,jsonb,text) from public;
grant  execute on function public.sage_after_dark_track_event(text,text,text,jsonb,text) to anon, authenticated;

-- ------------------------------------------------------------
-- RPC: top posts (last N days). Read-only; anon allowed.
-- ------------------------------------------------------------
create or replace function public.sage_after_dark_popular_posts(
  p_days int default 30,
  p_limit int default 10
)
returns table (
  slug text,
  pillar text,
  template text,
  views bigint,
  completions bigint,
  completion_rate numeric
)
language sql
security definer
set search_path = public
stable
as $$
  with views as (
    select slug, pillar, template, count(*) as v
    from public.analytics_pageview
    where slug is not null
      and created_at >= now() - make_interval(days => greatest(1, least(365, p_days)))
    group by slug, pillar, template
  ),
  comp as (
    select slug, count(*) as c
    from public.analytics_event
    where kind = 'read_complete'
      and created_at >= now() - make_interval(days => greatest(1, least(365, p_days)))
      and slug is not null
    group by slug
  )
  select v.slug,
         v.pillar,
         v.template,
         v.v as views,
         coalesce(c.c, 0) as completions,
         case when v.v > 0 then round(coalesce(c.c, 0)::numeric / v.v, 4) else 0 end as completion_rate
  from views v
  left join comp c using (slug)
  order by v.v desc
  limit greatest(1, least(100, p_limit));
$$;

revoke all on function public.sage_after_dark_popular_posts(int,int) from public;
grant  execute on function public.sage_after_dark_popular_posts(int,int) to anon, authenticated;

-- ------------------------------------------------------------
-- RPC: stripe event idempotency check + record
-- Returns true on first sight, false if already processed.
-- ------------------------------------------------------------
create or replace function public.sage_after_dark_stripe_event_record(
  p_event_id   text,
  p_event_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int := 0;
begin
  insert into public.stripe_event_log (event_id, event_type)
  values (p_event_id, p_event_type)
  on conflict (event_id) do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted > 0;
end;
$$;

revoke all on function public.sage_after_dark_stripe_event_record(text,text) from public;
grant  execute on function public.sage_after_dark_stripe_event_record(text,text) to anon, authenticated;
