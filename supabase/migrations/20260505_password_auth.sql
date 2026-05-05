-- p29 — password auth + onboarding pipeline
--
-- Adds: password_hash + profile fields on members, password_resets table,
-- and SECURITY DEFINER RPCs to register, login, and reset.
--
-- Magic-link login keeps working unchanged.

-- ---------- 1. extend members ----------
alter table public.sage_after_dark_members
  add column if not exists password_hash text,
  add column if not exists name text,
  add column if not exists referrer text,                 -- "where did you hear about us"
  add column if not exists email_verified_at timestamptz, -- set on first successful magic-link or signup
  add column if not exists last_login_at timestamptz;

-- A "registered but not subscribed" reader is a real row now.
-- Status values we use: 'registered' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
-- Drop the existing CHECK if any (idempotent re-create).
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='sage_after_dark_members'
      and constraint_name='sage_after_dark_members_status_check'
  ) then
    alter table public.sage_after_dark_members
      drop constraint sage_after_dark_members_status_check;
  end if;
end$$;

-- ---------- 2. password_resets ----------
create table if not exists public.sage_after_dark_password_resets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  purpose text not null default 'reset'  -- 'reset' | 'set' (initial password)
);

create index if not exists sage_after_dark_password_resets_email_idx
  on public.sage_after_dark_password_resets (email);
create index if not exists sage_after_dark_password_resets_expires_idx
  on public.sage_after_dark_password_resets (expires_at);

alter table public.sage_after_dark_password_resets enable row level security;

-- ---------- 3. RPCs ----------

-- Helper: verify the admin/webhook secret (already exists from earlier migration).
-- We rely on sage_after_dark_check_admin_secret(p_secret).

-- 3a. Register a new member with a password hash. Idempotent on email:
-- if a member exists with no password, set the password and profile fields.
-- If the email already has a password, raise.
create or replace function public.sage_after_dark_register_member(
  p_email text,
  p_password_hash text,
  p_name text,
  p_referrer text
) returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_existing_pw text;
begin
  if p_email is null or p_email = '' then raise exception 'invalid_email'; end if;
  if p_password_hash is null or length(p_password_hash) < 20 then raise exception 'invalid_hash'; end if;

  select id, password_hash into v_id, v_existing_pw
  from public.sage_after_dark_members
  where lower(email) = lower(p_email)
  limit 1;

  if v_id is null then
    insert into public.sage_after_dark_members
      (email, status, password_hash, name, referrer, email_verified_at)
    values
      (lower(p_email), 'registered', p_password_hash,
       nullif(trim(p_name), ''), nullif(trim(p_referrer), ''), now())
    returning id into v_id;
    return v_id;
  end if;

  if v_existing_pw is not null and length(v_existing_pw) > 0 then
    raise exception 'email_taken';
  end if;

  -- Member exists (e.g. via Stripe webhook) but has no password yet — set it.
  update public.sage_after_dark_members
  set password_hash = p_password_hash,
      name = coalesce(nullif(trim(p_name), ''), name),
      referrer = coalesce(nullif(trim(p_referrer), ''), referrer),
      email_verified_at = coalesce(email_verified_at, now()),
      updated_at = now()
  where id = v_id;
  return v_id;
end$$;

revoke all on function public.sage_after_dark_register_member(text, text, text, text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_register_member(text, text, text, text) to anon, authenticated;

-- 3b. Look up the password hash + profile by email.
create or replace function public.sage_after_dark_get_password(p_email text)
returns table (
  email text,
  password_hash text,
  status text,
  name text,
  email_verified_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select email, password_hash, status, name, email_verified_at
  from public.sage_after_dark_members
  where lower(email) = lower(p_email)
  limit 1;
$$;

revoke all on function public.sage_after_dark_get_password(text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_get_password(text) to anon, authenticated;

-- 3c. Mark a successful login.
create or replace function public.sage_after_dark_record_login(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sage_after_dark_members
  set last_login_at = now(), updated_at = now()
  where lower(email) = lower(p_email);
$$;
revoke all on function public.sage_after_dark_record_login(text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_record_login(text) to anon, authenticated;

-- 3d. Issue a password reset / set token.
-- p_purpose: 'reset' (member exists with password) or 'set' (admin-seeded, no password yet).
-- The caller stores the SHA-256 hash of the random token so we never see the plaintext.
create or replace function public.sage_after_dark_create_password_reset(
  p_email text,
  p_token_hash text,
  p_purpose text,
  p_ttl_minutes int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email is null or p_email = '' then raise exception 'invalid_email'; end if;
  if p_token_hash is null or length(p_token_hash) < 32 then raise exception 'invalid_token'; end if;
  if p_purpose not in ('reset','set') then raise exception 'invalid_purpose'; end if;

  insert into public.sage_after_dark_password_resets
    (email, token_hash, expires_at, purpose)
  values
    (lower(p_email), p_token_hash,
     now() + make_interval(mins => greatest(5, least(120, p_ttl_minutes))),
     p_purpose);
end$$;
revoke all on function public.sage_after_dark_create_password_reset(text, text, text, int) from public, anon, authenticated;
grant execute on function public.sage_after_dark_create_password_reset(text, text, text, int) to anon, authenticated;

-- 3e. Consume a reset token: returns the email if valid+unconsumed+unexpired, else null.
-- Marks consumed_at on success.
create or replace function public.sage_after_dark_consume_password_reset(
  p_token_hash text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  update public.sage_after_dark_password_resets
  set consumed_at = now()
  where token_hash = p_token_hash
    and consumed_at is null
    and expires_at > now()
  returning email into v_email;

  return v_email;
end$$;
revoke all on function public.sage_after_dark_consume_password_reset(text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_consume_password_reset(text) to anon, authenticated;

-- 3f. Update password hash (used by both reset and set flows after token consumption).
-- Caller must have just consumed a valid reset token for this email.
create or replace function public.sage_after_dark_set_password(
  p_email text,
  p_password_hash text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_password_hash is null or length(p_password_hash) < 20 then raise exception 'invalid_hash'; end if;

  select id into v_id from public.sage_after_dark_members
  where lower(email) = lower(p_email)
  limit 1;

  if v_id is null then
    -- Auto-create a 'registered' row (e.g. first-time admin set-password).
    insert into public.sage_after_dark_members (email, status, password_hash, email_verified_at)
    values (lower(p_email), 'registered', p_password_hash, now());
    return;
  end if;

  update public.sage_after_dark_members
  set password_hash = p_password_hash,
      email_verified_at = coalesce(email_verified_at, now()),
      updated_at = now()
  where id = v_id;
end$$;
revoke all on function public.sage_after_dark_set_password(text, text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_set_password(text, text) to anon, authenticated;

-- 3g. Profile update (display name).
create or replace function public.sage_after_dark_update_profile(
  p_email text,
  p_name text,
  p_referrer text
) returns void
language sql
security definer
set search_path = public
as $$
  update public.sage_after_dark_members
  set name = nullif(trim(p_name), ''),
      referrer = nullif(trim(p_referrer), ''),
      updated_at = now()
  where lower(email) = lower(p_email);
$$;
revoke all on function public.sage_after_dark_update_profile(text, text, text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_update_profile(text, text, text) to anon, authenticated;

-- 3h. Whoami — small public profile for the signed-in member.
create or replace function public.sage_after_dark_whoami(p_email text)
returns table (
  email text,
  name text,
  status text,
  plan text,
  current_period_end timestamptz,
  has_password boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select email, name, status, plan, current_period_end,
         (password_hash is not null and length(password_hash) > 0) as has_password,
         created_at
  from public.sage_after_dark_members
  where lower(email) = lower(p_email)
  limit 1;
$$;
revoke all on function public.sage_after_dark_whoami(text) from public, anon, authenticated;
grant execute on function public.sage_after_dark_whoami(text) to anon, authenticated;
