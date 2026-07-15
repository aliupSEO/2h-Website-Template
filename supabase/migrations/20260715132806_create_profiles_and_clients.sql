-- Hub auth roles (usage) vs business clients (separate domain table).
-- Roles: admin | manager | user  — app labels: ADMIN | MANAGER | USER.
-- "Client" is a CRM table, not an auth role.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('admin', 'manager', 'user');

create type public.client_status as enum ('active', 'inactive', 'draft');

create type public.client_file_kind as enum ('logo', 'asset', 'document');

-- ---------------------------------------------------------------------------
-- Shared trigger helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users) — role lives here
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'user',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_email_not_blank check (length(trim(email)) > 0)
);

create index profiles_role_idx on public.profiles (role);
create index profiles_email_idx on public.profiles (email);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Role helpers (after profiles exists)
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.has_app_role(allowed public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role = any (allowed)
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

-- Auto-create profile when a Supabase Auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role public.app_role := 'user';
begin
  begin
    if new.raw_user_meta_data ? 'role' then
      next_role := (new.raw_user_meta_data ->> 'role')::public.app_role;
    end if;
  exception
    when others then
      next_role := 'user';
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    next_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Clients (CRM — not an auth role)
-- ---------------------------------------------------------------------------

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  status public.client_status not null default 'draft',
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clients_name_not_blank check (length(trim(name)) > 0),
  constraint clients_email_not_blank check (length(trim(email)) > 0)
);

create index clients_status_idx on public.clients (status);
create index clients_email_idx on public.clients (email);
create index clients_name_idx on public.clients (name);
create index clients_created_by_idx on public.clients (created_by);

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Client links & files
-- ---------------------------------------------------------------------------

create table public.client_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint client_links_title_not_blank check (length(trim(title)) > 0),
  constraint client_links_url_not_blank check (length(trim(url)) > 0)
);

create index client_links_client_id_idx on public.client_links (client_id);

create table public.client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  kind public.client_file_kind not null,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  -- Supabase Storage object path (bucket e.g. client-files); never store data URLs here
  storage_path text not null,
  created_at timestamptz not null default now(),

  constraint client_files_name_not_blank check (length(trim(name)) > 0),
  constraint client_files_storage_path_not_blank check (length(trim(storage_path)) > 0)
);

create index client_files_client_id_idx on public.client_files (client_id);
create index client_files_kind_idx on public.client_files (kind);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_links enable row level security;
alter table public.client_files enable row level security;

-- Profiles
create policy "profiles_select_own_or_staff"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_app_role(array['admin', 'manager']::public.app_role[])
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select p.role from public.profiles p where p.id = auth.uid())
);

create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.has_app_role(array['admin']::public.app_role[]))
with check (public.has_app_role(array['admin']::public.app_role[]));

-- Clients
create policy "clients_select_authenticated"
on public.clients
for select
to authenticated
using (
  public.has_app_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy "clients_insert_staff"
on public.clients
for insert
to authenticated
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));

create policy "clients_update_staff"
on public.clients
for update
to authenticated
using (public.has_app_role(array['admin', 'manager']::public.app_role[]))
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));

create policy "clients_delete_admin"
on public.clients
for delete
to authenticated
using (public.has_app_role(array['admin']::public.app_role[]));

-- Links / files follow client access
create policy "client_links_select_authenticated"
on public.client_links
for select
to authenticated
using (
  public.has_app_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy "client_links_write_staff"
on public.client_links
for all
to authenticated
using (public.has_app_role(array['admin', 'manager']::public.app_role[]))
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));

create policy "client_files_select_authenticated"
on public.client_files
for select
to authenticated
using (
  public.has_app_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy "client_files_write_staff"
on public.client_files
for all
to authenticated
using (public.has_app_role(array['admin', 'manager']::public.app_role[]))
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));
