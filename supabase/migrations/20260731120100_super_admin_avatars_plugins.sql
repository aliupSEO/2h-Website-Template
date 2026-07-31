-- Promote Ali, tighten profile RLS, grant super_admin staff privileges,
-- avatars bucket, and remove hub-plugins size limit.

update public.profiles
set role = 'super_admin'
where email = 'ali@2hws.at';

-- Profiles: staff select includes super_admin
drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "profiles_admin_all" on public.profiles;

create policy "profiles_super_admin_all"
on public.profiles
for all
to authenticated
using (public.has_app_role(array['super_admin']::public.app_role[]))
with check (public.has_app_role(array['super_admin']::public.app_role[]));

create policy "profiles_admin_manage_below"
on public.profiles
for all
to authenticated
using (
  public.has_app_role(array['admin']::public.app_role[])
  and role = any (array['manager', 'user']::public.app_role[])
)
with check (
  public.has_app_role(array['admin']::public.app_role[])
  and role = any (array['manager', 'user']::public.app_role[])
);

-- Clients: give super_admin the same access as admin
drop policy if exists "clients_select_authenticated" on public.clients;
create policy "clients_select_authenticated"
on public.clients
for select
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager', 'user']::public.app_role[])
);

drop policy if exists "clients_insert_staff" on public.clients;
create policy "clients_insert_staff"
on public.clients
for insert
to authenticated
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "clients_update_staff" on public.clients;
create policy "clients_update_staff"
on public.clients
for update
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
)
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "clients_delete_admin" on public.clients;
create policy "clients_delete_admin"
on public.clients
for delete
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin']::public.app_role[])
);

-- Client links
drop policy if exists "client_links_select_authenticated" on public.client_links;
create policy "client_links_select_authenticated"
on public.client_links
for select
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager', 'user']::public.app_role[])
);

drop policy if exists "client_links_write_staff" on public.client_links;
create policy "client_links_write_staff"
on public.client_links
for all
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
)
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

-- Client files
drop policy if exists "client_files_select_authenticated" on public.client_files;
create policy "client_files_select_authenticated"
on public.client_files
for select
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager', 'user']::public.app_role[])
);

drop policy if exists "client_files_write_staff" on public.client_files;
create policy "client_files_write_staff"
on public.client_files
for all
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
)
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

-- Templates
drop policy if exists "templates_select_authenticated" on public.templates;
create policy "templates_select_authenticated"
on public.templates
for select
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager', 'user']::public.app_role[])
);

drop policy if exists "templates_write_staff" on public.templates;
create policy "templates_write_staff"
on public.templates
for all
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
)
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "templates_delete_admin" on public.templates;
create policy "templates_delete_admin"
on public.templates
for delete
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin']::public.app_role[])
);

-- Plugins table
drop policy if exists "plugins_select_authenticated" on public.plugins;
create policy "plugins_select_authenticated"
on public.plugins
for select
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager', 'user']::public.app_role[])
);

drop policy if exists "plugins_write_staff" on public.plugins;
create policy "plugins_write_staff"
on public.plugins
for insert
to authenticated
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "plugins_update_staff" on public.plugins;
create policy "plugins_update_staff"
on public.plugins
for update
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
)
with check (
  public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "plugins_delete_admin" on public.plugins;
create policy "plugins_delete_admin"
on public.plugins
for delete
to authenticated
using (
  public.has_app_role(array['super_admin', 'admin']::public.app_role[])
);

-- Plugins storage
drop policy if exists "hub_plugins_storage_select_authenticated" on storage.objects;
create policy "hub_plugins_storage_select_authenticated"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['super_admin', 'admin', 'manager', 'user']::public.app_role[])
);

drop policy if exists "hub_plugins_storage_write_staff" on storage.objects;
create policy "hub_plugins_storage_write_staff"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "hub_plugins_storage_update_staff" on storage.objects;
create policy "hub_plugins_storage_update_staff"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
)
with check (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

drop policy if exists "hub_plugins_storage_delete_staff" on storage.objects;
create policy "hub_plugins_storage_delete_staff"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'hub-plugins'
  and public.has_app_role(array['super_admin', 'admin', 'manager']::public.app_role[])
);

-- Remove plugin file size cap
update storage.buckets
set file_size_limit = null
where id = 'hub-plugins';

-- Public avatars bucket (users manage only their own folder)
insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 5242880)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
