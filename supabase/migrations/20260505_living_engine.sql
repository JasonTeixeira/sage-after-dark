-- Sage After Dark — Living Engine (Phase A)
-- Tables and RPCs that turn /now, /reading, /taste, /colophon, and home
-- rotation slots into editable, timestamped, living surfaces.
--
-- Editable from /admin only. Read at request time on the public site.
-- All tables prefixed with sage_after_dark_ to namespace within the project.

-- =====================================================================
-- 1. NOW STATUS — single editable row with the current operating window
-- =====================================================================
create table if not exists sage_after_dark_now_status (
  id           int primary key default 1,
  status       text not null,
  location     text not null default 'Brooklyn, NY',
  this_week    jsonb not null default '[]'::jsonb,  -- text[]
  not_doing    jsonb not null default '[]'::jsonb,  -- text[]
  updated_at   timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- =====================================================================
-- 2. ROTATION ITEMS — books, music, film, watching, listening
--    One table; `kind` discriminates. Editable, timestamped, ranked.
-- =====================================================================
create table if not exists sage_after_dark_rotation_items (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('book','music','film','listening','watching','reading')),
  title        text not null,
  by_line      text not null,            -- author / artist / director
  year_label   text,                     -- e.g. "2021" or "Substack"
  note         text,                     -- short editorial note
  shelf        text,                     -- only used for kind='book': "On building", etc.
  rank         int not null default 100, -- lower = higher in list
  active       boolean not null default true,
  added_at     timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists sage_after_dark_rotation_items_kind_idx
  on sage_after_dark_rotation_items (kind, active, rank);

-- =====================================================================
-- 3. FEATURED POSTS — editorial picks / popular reads slots
--    Slugs reference posts in the MDX corpus (validated by build).
-- =====================================================================
create table if not exists sage_after_dark_featured_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  slot         text not null check (slot in ('editor_pick','popular_read','home_hero','member_only')),
  rank         int not null default 100,
  active       boolean not null default true,
  pinned_at    timestamptz not null default now()
);

create index if not exists sage_after_dark_featured_posts_slot_idx
  on sage_after_dark_featured_posts (slot, active, rank);

-- =====================================================================
-- 4. PAGEVIEWS AGGREGATE — fast read of view counts per slug
--    The track_pageview RPC already exists; this view summarizes.
-- =====================================================================
create or replace view sage_after_dark_pageview_counts as
select
  path,
  slug,
  count(*)::int as views,
  count(distinct visitor_hash)::int as unique_visitors,
  max(created_at) as last_seen_at
from public.analytics_pageview
where ua_class is distinct from 'bot'
group by path, slug;

-- Public RPC: get views for a single slug (used by post footers and admin)
create or replace function sage_after_dark_views_for_slug(p_slug text)
returns table(views int, unique_visitors int, last_seen_at timestamptz)
language sql security definer set search_path = public as $$
  select coalesce(count(*),0)::int as views,
         coalesce(count(distinct visitor_hash),0)::int as unique_visitors,
         max(created_at) as last_seen_at
  from public.analytics_pageview
  where slug = p_slug and ua_class is distinct from 'bot'
$$;
grant execute on function sage_after_dark_views_for_slug(text) to anon, authenticated, service_role;

-- Public RPC: total tracked pageviews across the site
create or replace function sage_after_dark_total_pageviews()
returns table(views int, unique_visitors int)
language sql security definer set search_path = public as $$
  select coalesce(count(*),0)::int as views,
         coalesce(count(distinct visitor_hash),0)::int as unique_visitors
  from public.analytics_pageview
  where ua_class is distinct from 'bot'
$$;
grant execute on function sage_after_dark_total_pageviews() to anon, authenticated, service_role;

-- Public RPC: top N posts by views (used by /admin and "popular reads")
create or replace function sage_after_dark_top_posts(p_limit int default 10)
returns table(slug text, path text, views int, unique_visitors int)
language sql security definer set search_path = public as $$
  select slug, path, count(*)::int as views, count(distinct visitor_hash)::int as unique_visitors
  from public.analytics_pageview
  where slug is not null and ua_class is distinct from 'bot'
  group by slug, path
  order by views desc
  limit greatest(1, least(coalesce(p_limit, 10), 100))
$$;
grant execute on function sage_after_dark_top_posts(int) to anon, authenticated, service_role;

-- =====================================================================
-- 5. RPCs (SECURITY DEFINER, callable from anon for reads, server for writes)
-- =====================================================================

-- Public: read the current /now status
create or replace function sage_after_dark_get_now_status()
returns table(status text, location text, this_week jsonb, not_doing jsonb, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select status, location, this_week, not_doing, updated_at
  from sage_after_dark_now_status where id = 1
$$;
grant execute on function sage_after_dark_get_now_status() to anon, authenticated, service_role;

-- Public: read rotation items by kind
create or replace function sage_after_dark_get_rotation(p_kind text)
returns table(
  id uuid, title text, by_line text, year_label text, note text,
  shelf text, rank int, added_at timestamptz, updated_at timestamptz
)
language sql security definer set search_path = public as $$
  select id, title, by_line, year_label, note, shelf, rank, added_at, updated_at
  from sage_after_dark_rotation_items
  where kind = p_kind and active = true
  order by rank asc, added_at desc
$$;
grant execute on function sage_after_dark_get_rotation(text) to anon, authenticated, service_role;

-- Public: read featured posts by slot
create or replace function sage_after_dark_get_featured(p_slot text)
returns table(slug text, rank int, pinned_at timestamptz)
language sql security definer set search_path = public as $$
  select slug, rank, pinned_at
  from sage_after_dark_featured_posts
  where slot = p_slot and active = true
  order by rank asc, pinned_at desc
$$;
grant execute on function sage_after_dark_get_featured(text) to anon, authenticated, service_role;

-- Admin: upsert /now status (called from admin, server-side, with service-role key)
create or replace function sage_after_dark_upsert_now_status(
  p_status text, p_location text, p_this_week jsonb, p_not_doing jsonb
) returns void language sql security definer set search_path = public as $$
  insert into sage_after_dark_now_status (id, status, location, this_week, not_doing, updated_at)
  values (1, p_status, p_location, p_this_week, p_not_doing, now())
  on conflict (id) do update set
    status = excluded.status,
    location = excluded.location,
    this_week = excluded.this_week,
    not_doing = excluded.not_doing,
    updated_at = now()
$$;
grant execute on function sage_after_dark_upsert_now_status(text, text, jsonb, jsonb) to service_role;

-- Admin: insert rotation item
create or replace function sage_after_dark_add_rotation(
  p_kind text, p_title text, p_by text, p_year text, p_note text, p_shelf text, p_rank int
) returns uuid language sql security definer set search_path = public as $$
  insert into sage_after_dark_rotation_items (kind, title, by_line, year_label, note, shelf, rank)
  values (p_kind, p_title, p_by, p_year, p_note, p_shelf, p_rank)
  returning id
$$;
grant execute on function sage_after_dark_add_rotation(text, text, text, text, text, text, int) to service_role;

-- Admin: deactivate rotation item (soft delete)
create or replace function sage_after_dark_deactivate_rotation(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update sage_after_dark_rotation_items set active = false, updated_at = now() where id = p_id
$$;
grant execute on function sage_after_dark_deactivate_rotation(uuid) to service_role;

-- Admin: pin a post to a slot
create or replace function sage_after_dark_pin_post(p_slug text, p_slot text, p_rank int)
returns uuid language sql security definer set search_path = public as $$
  insert into sage_after_dark_featured_posts (slug, slot, rank)
  values (p_slug, p_slot, p_rank)
  returning id
$$;
grant execute on function sage_after_dark_pin_post(text, text, int) to service_role;

-- Admin: unpin
create or replace function sage_after_dark_unpin_post(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update sage_after_dark_featured_posts set active = false where id = p_id
$$;
grant execute on function sage_after_dark_unpin_post(uuid) to service_role;

-- =====================================================================
-- 6. SEED DATA — port the current site-data.ts contents so nothing is lost
-- =====================================================================

-- /now seed
insert into sage_after_dark_now_status (id, status, location, this_week, not_doing, updated_at)
values (
  1,
  'Heads-down on Trayd v2 onboarding + the first 12 episodes of Trayd, In Public.',
  'Brooklyn, NY',
  '["Ship Trayd v2 paywall + checkout flow","Write EP 02 of Trayd, In Public (subject: the first pricing call I lost on purpose)","Record one tutorial: atomic-swap deploys end-to-end","First 100 newsletter subscribers — founding window now open"]'::jsonb,
  '["Twitter/X scroll (one window/day)","New side projects (two killed in April)","Podcast appearances until the launch ships"]'::jsonb,
  now()
)
on conflict (id) do nothing;

-- Music (taste)
insert into sage_after_dark_rotation_items (kind, title, by_line, year_label, note, rank)
values
  ('music', 'Promises', 'Floating Points & Pharoah Sanders', '2021', 'Best ambient album of the decade. Writing music; thinking music.', 10),
  ('music', 'All Melody', 'Nils Frahm', '2018', 'I have written more words to this album than any other.', 20),
  ('music', 'Since I Left You', 'The Avalanches', '2000', 'Sample-based maximalism that aged perfectly. Joy as engineering.', 30)
on conflict do nothing;

-- Film (taste)
insert into sage_after_dark_rotation_items (kind, title, by_line, year_label, note, rank)
values
  ('film', 'Severance', 'Apple TV / Dan Erickson', '2022–', 'A show about software people written by someone who knows software people.', 10),
  ('film', 'The Bear', 'Christopher Storer', '2022–', 'Operations as character study. Required viewing for founders.', 20),
  ('film', 'Slow Horses', 'Apple TV / Mick Herron', '2022–', 'Office politics + spycraft. The best ''work'' show on TV.', 30)
on conflict do nothing;

-- Books (taste)
insert into sage_after_dark_rotation_items (kind, title, by_line, year_label, note, rank)
values
  ('book', 'Working in Public', 'Nadia Eghbal', '2020', 'The book I most often hand to founders. Maintenance > novelty.', 10),
  ('book', 'The Mom Test', 'Rob Fitzpatrick', '2013', 'Customer interviews without the lying. Re-read every six months.', 20),
  ('book', 'Working', 'Studs Terkel', '1974', 'What every job sounds like from the inside. Read once a year, slowly.', 30)
on conflict do nothing;

-- Reading shelves
insert into sage_after_dark_rotation_items (kind, title, by_line, shelf, rank)
values
  ('reading', 'Working in Public', 'Nadia Eghbal', 'On building', 10),
  ('reading', 'The Mom Test', 'Rob Fitzpatrick', 'On building', 20),
  ('reading', 'High Output Management', 'Andy Grove', 'On building', 30),
  ('reading', 'An Elegant Puzzle', 'Will Larson', 'On building', 40),
  ('reading', 'The Goal', 'Eliyahu Goldratt', 'On building', 50),
  ('reading', 'On Writing Well', 'William Zinsser', 'On writing', 10),
  ('reading', 'Several Short Sentences About Writing', 'Verlyn Klinkenborg', 'On writing', 20),
  ('reading', 'Bird by Bird', 'Anne Lamott', 'On writing', 30),
  ('reading', 'The Art of Memoir', 'Mary Karr', 'On craft', 10),
  ('reading', 'Show Your Work', 'Austin Kleon', 'On craft', 20),
  ('reading', 'Working', 'Studs Terkel', 'On craft', 30),
  ('reading', 'Status and Culture', 'W. David Marx', 'On taste', 10),
  ('reading', 'How to Write One Song', 'Jeff Tweedy', 'On taste', 20),
  ('reading', 'Just Kids', 'Patti Smith', 'On taste', 30),
  ('reading', 'Thinking in Systems', 'Donella Meadows', 'On systems', 10),
  ('reading', 'Antifragile', 'Nassim Taleb', 'On systems', 20),
  ('reading', 'The Power Broker', 'Robert Caro', 'On systems', 30)
on conflict do nothing;

-- Listening (currently — distinct from "music" all-time)
insert into sage_after_dark_rotation_items (kind, title, by_line, year_label, note, rank)
values
  ('listening', 'Promises', 'Floating Points', '2021', null, 10),
  ('listening', 'All Melody', 'Nils Frahm', '2018', null, 20)
on conflict do nothing;

-- Watching (currently)
insert into sage_after_dark_rotation_items (kind, title, by_line, year_label, note, rank)
values
  ('watching', 'Severance S2', 'Apple TV', '2026', null, 10),
  ('watching', 'Slow Horses S4', 'Apple TV', '2026', null, 20)
on conflict do nothing;
