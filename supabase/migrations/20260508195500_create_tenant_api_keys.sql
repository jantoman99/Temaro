begin;

create table public.tenant_api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  token_hash text not null,
  token_prefix text not null,
  token_last4 text not null,
  scopes text[] not null default array['bookings:read']::text[],
  created_by uuid references public.users(id) on delete set null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tenant_api_keys_hash_unique unique (token_hash),
  constraint tenant_api_keys_name_length check (char_length(name) between 1 and 80),
  constraint tenant_api_keys_hash_check check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint tenant_api_keys_prefix_check check (token_prefix ~ '^tmro_[A-Za-z0-9_-]{8}$'),
  constraint tenant_api_keys_last4_check check (token_last4 ~ '^[A-Za-z0-9]{4}$'),
  constraint tenant_api_keys_scopes_check check (
    array_length(scopes, 1) > 0
    and scopes <@ array['bookings:read']::text[]
  )
);

create index tenant_api_keys_tenant_idx
  on public.tenant_api_keys (tenant_id, revoked_at, created_at desc);

alter table public.tenant_api_keys enable row level security;

create policy tenant_api_keys_owner_select
  on public.tenant_api_keys
  for select
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy tenant_api_keys_owner_insert
  on public.tenant_api_keys
  for insert
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy tenant_api_keys_owner_update
  on public.tenant_api_keys
  for update
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
