begin;

create table public.services (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes smallint not null,
  price integer not null,
  currency text not null default 'CZK',
  buffer_minutes smallint not null default 0,
  is_active boolean not null default true,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint services_id_tenant_id_unique unique (id, tenant_id),
  constraint services_duration_minutes_check check (duration_minutes > 0 and duration_minutes <= 1440),
  constraint services_buffer_minutes_check check (buffer_minutes >= 0 and buffer_minutes <= 240),
  constraint services_price_check check (price >= 0),
  constraint services_currency_check check (currency in ('CZK', 'EUR'))
);

create index services_tenant_id_position_idx
  on public.services (tenant_id, position, name)
  where deleted_at is null;

alter table public.services enable row level security;
alter table public.services force row level security;

create policy services_select_current_tenant
  on public.services
  for select
  to authenticated
  using (
    deleted_at is null
    and tenant_id = public.current_tenant_id()
  );

create policy services_insert_owner
  on public.services
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy services_update_owner
  on public.services
  for update
  to authenticated
  using (
    deleted_at is null
    and tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

revoke all on public.services from anon;
grant select, insert, update on public.services to authenticated;

commit;
