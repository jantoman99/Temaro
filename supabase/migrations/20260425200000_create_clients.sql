begin;

create table public.clients (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  no_show_count smallint not null default 0,
  is_flagged boolean not null default false,
  flag_reason text,
  is_blacklisted boolean not null default false,
  preferred_staff_id uuid,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint clients_id_tenant_id_unique unique (id, tenant_id),
  constraint clients_no_show_count_check check (no_show_count >= 0),
  constraint clients_preferred_staff_tenant_fkey
    foreign key (preferred_staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete set null
);

create index clients_tenant_id_name_idx
  on public.clients (tenant_id, full_name)
  where deleted_at is null;

create index clients_tenant_id_email_idx
  on public.clients (tenant_id, lower(email))
  where deleted_at is null and email is not null;

create index clients_tenant_id_phone_idx
  on public.clients (tenant_id, phone)
  where deleted_at is null and phone is not null;

alter table public.clients enable row level security;
alter table public.clients force row level security;

create policy clients_select_current_tenant
  on public.clients
  for select
  to authenticated
  using (
    deleted_at is null
    and tenant_id = public.current_tenant_id()
  );

create policy clients_insert_current_tenant
  on public.clients
  for insert
  to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy clients_update_current_tenant
  on public.clients
  for update
  to authenticated
  using (
    deleted_at is null
    and tenant_id = public.current_tenant_id()
  )
  with check (tenant_id = public.current_tenant_id());

revoke all on public.clients from anon;
grant select, insert, update on public.clients to authenticated;

commit;
