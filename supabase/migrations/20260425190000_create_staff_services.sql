begin;

create table public.staff_services (
  staff_id uuid not null,
  service_id uuid not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  primary key (staff_id, service_id),
  constraint staff_services_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete cascade,
  constraint staff_services_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete cascade
);

create index staff_services_tenant_id_service_id_idx
  on public.staff_services (tenant_id, service_id);

alter table public.staff_services enable row level security;
alter table public.staff_services force row level security;

create policy staff_services_select_current_tenant
  on public.staff_services
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy staff_services_insert_owner
  on public.staff_services
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy staff_services_delete_owner
  on public.staff_services
  for delete
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

revoke all on public.staff_services from anon;
grant select, insert, delete on public.staff_services to authenticated;

commit;
