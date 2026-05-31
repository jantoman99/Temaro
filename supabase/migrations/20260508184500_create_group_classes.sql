begin;

create table public.group_classes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null,
  staff_id uuid,
  resource_id uuid,
  location_id uuid,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null,
  price integer,
  currency text not null default 'CZK',
  status text not null default 'scheduled',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_classes_id_tenant_id_unique unique (id, tenant_id),
  constraint group_classes_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete restrict,
  constraint group_classes_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete restrict,
  constraint group_classes_resource_tenant_fkey
    foreign key (resource_id, tenant_id)
    references public.bookable_resources (id, tenant_id)
    on delete restrict,
  constraint group_classes_location_tenant_fkey
    foreign key (location_id, tenant_id)
    references public.tenant_locations (id, tenant_id)
    on delete restrict,
  constraint group_classes_title_length check (char_length(trim(title)) between 1 and 140),
  constraint group_classes_time_check check (ends_at > starts_at),
  constraint group_classes_capacity_check check (capacity > 0 and capacity <= 1000),
  constraint group_classes_price_check check (price is null or price >= 0),
  constraint group_classes_currency_check check (currency in ('CZK', 'EUR')),
  constraint group_classes_status_check check (status in ('scheduled', 'cancelled', 'completed')),
  constraint group_classes_note_length check (note is null or char_length(note) <= 500)
);

create index group_classes_tenant_time_idx
  on public.group_classes (tenant_id, starts_at desc);

create index group_classes_tenant_status_idx
  on public.group_classes (tenant_id, status, starts_at);

create table public.group_class_attendees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_class_id uuid not null,
  client_id uuid not null,
  status text not null default 'booked',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_class_attendees_class_tenant_fkey
    foreign key (group_class_id, tenant_id)
    references public.group_classes (id, tenant_id)
    on delete cascade,
  constraint group_class_attendees_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete cascade,
  constraint group_class_attendees_unique_client unique (tenant_id, group_class_id, client_id),
  constraint group_class_attendees_status_check check (status in ('booked', 'cancelled', 'attended', 'no_show')),
  constraint group_class_attendees_note_length check (note is null or char_length(note) <= 500)
);

create index group_class_attendees_tenant_class_idx
  on public.group_class_attendees (tenant_id, group_class_id, status);

alter table public.group_classes enable row level security;
alter table public.group_class_attendees enable row level security;

create policy group_classes_owner_all
  on public.group_classes
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy group_class_attendees_owner_all
  on public.group_class_attendees
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create or replace function public.enroll_group_class(
  p_group_class_id uuid,
  p_client_id uuid,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid := public.current_tenant_id();
  v_class public.group_classes%rowtype;
  v_attendee_id uuid;
  v_active_count integer;
begin
  if v_tenant_id is null or not public.is_current_tenant_owner() then
    raise exception 'forbidden';
  end if;

  select *
    into v_class
    from public.group_classes
   where id = p_group_class_id
     and tenant_id = v_tenant_id
   for update;

  if not found then
    raise exception 'group class not found';
  end if;

  if v_class.status <> 'scheduled' then
    raise exception 'group class is not open';
  end if;

  if not exists (
    select 1
      from public.clients
     where id = p_client_id
       and tenant_id = v_tenant_id
       and deleted_at is null
  ) then
    raise exception 'client not found';
  end if;

  select count(*)::integer
    into v_active_count
    from public.group_class_attendees
   where tenant_id = v_tenant_id
     and group_class_id = p_group_class_id
     and status in ('booked', 'attended');

  if v_active_count >= v_class.capacity then
    raise exception 'group class is full';
  end if;

  insert into public.group_class_attendees (
    tenant_id,
    group_class_id,
    client_id,
    note
  )
  values (
    v_tenant_id,
    p_group_class_id,
    p_client_id,
    nullif(trim(p_note), '')
  )
  returning id into v_attendee_id;

  return v_attendee_id;
end;
$$;

revoke execute on function public.enroll_group_class(uuid, uuid, text) from anon, authenticated;
grant execute on function public.enroll_group_class(uuid, uuid, text) to authenticated;

commit;
