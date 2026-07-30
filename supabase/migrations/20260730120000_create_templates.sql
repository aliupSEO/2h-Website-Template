-- Starter templates catalog (GitHub repo + copyable URL), grouped by category.

create type public.template_category as enum ('websites', 'apps');

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  git_repository text not null,
  url text not null,
  category public.template_category not null,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint templates_name_not_blank check (length(trim(name)) > 0),
  constraint templates_git_repository_not_blank check (length(trim(git_repository)) > 0),
  constraint templates_url_not_blank check (length(trim(url)) > 0)
);

create index templates_category_idx on public.templates (category);
create index templates_name_idx on public.templates (name);
create index templates_git_repository_idx on public.templates (git_repository);

create trigger templates_set_updated_at
before update on public.templates
for each row
execute function public.set_updated_at();

alter table public.templates enable row level security;

create policy "templates_select_authenticated"
on public.templates
for select
to authenticated
using (
  public.has_app_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy "templates_write_staff"
on public.templates
for all
to authenticated
using (public.has_app_role(array['admin', 'manager']::public.app_role[]))
with check (public.has_app_role(array['admin', 'manager']::public.app_role[]));

create policy "templates_delete_admin"
on public.templates
for delete
to authenticated
using (public.has_app_role(array['admin']::public.app_role[]));
