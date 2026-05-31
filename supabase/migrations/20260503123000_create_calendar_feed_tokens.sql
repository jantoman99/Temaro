begin;

create table public.calendar_feed_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  token_hash text not null unique,
  name text not null default 'Hlavní iCal feed',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint calendar_feed_tokens_hash_check check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint calendar_feed_tokens_name_check check (char_length(name) between 1 and 120),
  constraint calendar_feed_tokens_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete cascade
);

create index calendar_feed_tokens_tenant_active_idx
  on public.calendar_feed_tokens (tenant_id, revoked_at);

create index calendar_feed_tokens_staff_tenant_fkey_idx
  on public.calendar_feed_tokens (staff_id, tenant_id);

alter table public.calendar_feed_tokens enable row level security;
alter table public.calendar_feed_tokens force row level security;

create policy calendar_feed_tokens_select_owner
  on public.calendar_feed_tokens
  for select
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy calendar_feed_tokens_insert_owner
  on public.calendar_feed_tokens
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy calendar_feed_tokens_update_owner
  on public.calendar_feed_tokens
  for update
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

revoke all on public.calendar_feed_tokens from anon;
grant select, insert, update on public.calendar_feed_tokens to authenticated;

commit;
