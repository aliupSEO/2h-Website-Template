-- Encrypted Hub environment variables (values only accessible via BFF + ENV_SECRETS_KEY).

create table public.hub_env_vars (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  value_ciphertext text not null,
  value_iv text not null,
  value_tag text not null,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint hub_env_vars_key_format check (key ~ '^[A-Za-z_][A-Za-z0-9_]*$'),
  constraint hub_env_vars_key_unique unique (key)
);

create index hub_env_vars_key_idx on public.hub_env_vars (key);
create index hub_env_vars_updated_at_idx on public.hub_env_vars (updated_at desc);

create trigger hub_env_vars_set_updated_at
before update on public.hub_env_vars
for each row
execute function public.set_updated_at();

alter table public.hub_env_vars enable row level security;

-- No policies for authenticated/anon: only service role (BFF) can access rows.
