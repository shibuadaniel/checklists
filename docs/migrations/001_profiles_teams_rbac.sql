-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 001 — profiles + teams RBAC
--
-- Run once in Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Teams ─────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

-- ── 2. Profiles (1-to-1 with auth.users) ─────────────────────────────────
create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text,
  full_name  text not null default '',
  role       text not null default 'team_member'
               check (role in ('administrator','team_lead','team_member','executive')),
  team_id    uuid references public.teams(id) on delete set null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 3. Enable RLS ─────────────────────────────────────────────────────────
alter table public.teams    enable row level security;
alter table public.profiles enable row level security;

-- ── 4. Helper: get caller's role (security definer avoids recursive RLS) ──
create or replace function public.get_my_role()
returns text
language sql security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── 5. Teams policies ─────────────────────────────────────────────────────
drop policy if exists "teams: authenticated read"   on public.teams;
drop policy if exists "teams: admin/exec insert"    on public.teams;
drop policy if exists "teams: admin/exec delete"    on public.teams;

create policy "teams: authenticated read"
  on public.teams for select
  to authenticated using (true);

create policy "teams: admin/exec insert"
  on public.teams for insert
  to authenticated
  with check (public.get_my_role() in ('administrator', 'executive'));

create policy "teams: admin/exec delete"
  on public.teams for delete
  to authenticated
  using (public.get_my_role() in ('administrator', 'executive'));

-- ── 6. Profiles policies ──────────────────────────────────────────────────
drop policy if exists "profiles: authenticated read all" on public.profiles;
drop policy if exists "profiles: own update"             on public.profiles;
drop policy if exists "profiles: admin update any"       on public.profiles;

-- Any logged-in user can read all profiles (small-team app; no PII concern)
create policy "profiles: authenticated read all"
  on public.profiles for select
  to authenticated using (true);

-- Any user may update their own profile (avatar_url, full_name, etc.)
create policy "profiles: own update"
  on public.profiles for update
  to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins / execs may update any profile (for role & team assignment)
create policy "profiles: admin update any"
  on public.profiles for update
  to authenticated
  using  (public.get_my_role() in ('administrator', 'executive'));

-- ── 7. Auto-create profile on signup ──────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'team_member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 8. Back-fill existing auth users who don't have a profile yet ─────────
insert into public.profiles (id, email, full_name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'role', 'team_member')
from auth.users
on conflict (id) do nothing;

-- ── 9. Seed the four persona test accounts ───────────────────────────────
-- After creating the users in Supabase Auth, set their roles here.
-- Replace the UUIDs with the actual user IDs from Authentication → Users.
--
-- UPDATE public.profiles SET role = 'administrator' WHERE email = 'admin@example.com';
-- UPDATE public.profiles SET role = 'executive'     WHERE email = 'exec@example.com';
-- UPDATE public.profiles SET role = 'team_lead'     WHERE email = 'lead@example.com';
-- UPDATE public.profiles SET role = 'team_member'   WHERE email = 'member@example.com';
