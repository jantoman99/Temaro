begin;

create table public.bookable_resources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  resource_type text not null default 'room',
  capacity integer not null default 1,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookable_resources_id_tenant_id_unique unique (id, tenant_id),
  constraint bookable_resources_name_length check (char_length(trim(name)) between 1 and 120),
  constraint bookable_resources_type_check check (resource_type in ('room', 'chair', 'equipment', 'vehicle', 'other')),
  constraint bookable_resources_capacity_positive check (capacity > 0 and capacity <= 1000),
  constraint bookable_resources_description_length check (description is null or char_length(description) <= 500)
);

create index bookable_resources_tenant_active_idx
  on public.bookable_resources (tenant_id, is_active, name);

create table public.service_resources (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null,
  resource_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, service_id, resource_id),
  constraint service_resources_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete cascade,
  constraint service_resources_resource_tenant_fkey
    foreign key (resource_id, tenant_id)
    references public.bookable_resources (id, tenant_id)
    on delete cascade
);

create index service_resources_tenant_resource_idx
  on public.service_resources (tenant_id, resource_id);

alter table public.bookable_resources enable row level security;
alter table public.service_resources enable row level security;

create policy bookable_resources_owner_all
  on public.bookable_resources
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy service_resources_owner_all
  on public.service_resources
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
