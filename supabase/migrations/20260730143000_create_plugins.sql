-- Hub plugins catalog with one private file per plugin in storage bucket `hub-plugins`.

create table public.plugins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  file_name text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  storage_path text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint plugins_name_not_blank check (length(trim(name)) > 0)
);

create index plugins_name_idx on public.plugins (name);

create trigger plugins_set_updated_at
before update on public.plugins
for each row
execute function public.set_updated_at();

alter table public.plugins enable row level security;

create policy "plugins_select_authenticated"
on public.plugins
for select
to authenticated
using (
  public.has_app_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy "plugins_write_staff"
on public.plugins
for insert
to authenticated
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));

create policy "plugins_update_staff"
on public.plugins
for update
to authenticated
using (public.has_app_role(array['admin', 'manager']::public.app_role[]))
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));

create policy "plugins_delete_admin"
on public.plugins
for delete
to authenticated
using (public.has_app_role(array['admin']::public.app_role[]));

-- Private storage bucket (50 MB per file)
insert into storage.buckets (id, name, public, file_size_limit)
values ('hub-plugins', 'hub-plugins', false, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

create policy "hub_plugins_storage_select_authenticated"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy "hub_plugins_storage_write_staff"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['admin', 'manager']::public.app_role[])
);

create policy "hub_plugins_storage_update_staff"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['admin', 'manager']::public.app_role[])
)
with check (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['admin', 'manager']::public.app_role[])
);

create policy "hub_plugins_storage_delete_staff"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['admin', 'manager']::public.app_role[])
);
