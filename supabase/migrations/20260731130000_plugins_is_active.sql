-- Plugin active / inactive flag
alter table public.plugins
  add column if not exists is_active boolean not null default true;

create index if not exists plugins_is_active_idx on public.plugins (is_active);
