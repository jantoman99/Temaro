begin;

create table public.tenant_locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  address text,
  city text,
  region text,
  postal_code text,
  country_code text not null default 'CZ',
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_locations_id_tenant_id_unique unique (id, tenant_id),
  constraint tenant_locations_name_length check (char_length(trim(name)) between 1 and 120),
  constraint tenant_locations_country_check check (country_code ~ '^[A-Z]{2}$'),
  constraint tenant_locations_coordinates_check check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  ),
  constraint tenant_locations_contact_length check (
    (phone is null or char_length(phone) <= 40)
    and (email is null or char_length(email) <= 254)
  )
);

create unique index tenant_locations_primary_unique_idx
  on public.tenant_locations (tenant_id)
  where is_primary = true and is_active = true;

create index tenant_locations_tenant_active_idx
  on public.tenant_locations (tenant_id, is_active, city, name);

alter table public.tenant_locations enable row level security;

create policy tenant_locations_owner_all
  on public.tenant_locations
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
