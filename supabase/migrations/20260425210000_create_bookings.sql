begin;

create extension if not exists btree_gist with schema extensions;

create table public.bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  staff_id uuid not null,
  service_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed',
  deposit_amount integer not null default 0,
  deposit_paid boolean not null default false,
  deposit_paid_at timestamptz,
  notes text,
  source text not null default 'manual',
  cancellation_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_id_tenant_id_unique unique (id, tenant_id),
  constraint bookings_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete restrict,
  constraint bookings_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete restrict,
  constraint bookings_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete set null,
  constraint bookings_time_check check (starts_at < ends_at),
  constraint bookings_status_check check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  constraint bookings_source_check check (source in ('manual', 'online', 'instagram')),
  constraint bookings_deposit_amount_check check (deposit_amount >= 0)
);

create index bookings_starts_at_idx on public.bookings (tenant_id, starts_at);
create index bookings_staff_idx on public.bookings (tenant_id, staff_id, starts_at);
create index bookings_client_idx on public.bookings (tenant_id, client_id, starts_at);

alter table public.bookings
  add constraint bookings_no_staff_overlap
  exclude using gist (
    tenant_id with =,
    staff_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

alter table public.bookings enable row level security;
alter table public.bookings force row level security;

create policy bookings_select_current_tenant
  on public.bookings
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy bookings_insert_current_tenant
  on public.bookings
  for insert
  to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy bookings_update_current_tenant
  on public.bookings
  for update
  to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

create or replace function public.create_booking(
  p_tenant_id uuid,
  p_client_id uuid,
  p_staff_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_notes text default null,
  p_source text default 'manual'
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_client public.clients%rowtype;
  v_ends_at timestamptz;
  v_booking public.bookings%rowtype;
begin
  if p_tenant_id is distinct from public.current_tenant_id() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_starts_at <= now() then
    raise exception 'Booking cannot start in the past' using errcode = '22023';
  end if;

  select *
  into v_service
  from public.services
  where id = p_service_id
    and tenant_id = p_tenant_id
    and deleted_at is null
    and is_active = true
  for share;

  if not found then
    raise exception 'Service not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.staff_services
    where tenant_id = p_tenant_id
      and staff_id = p_staff_id
      and service_id = p_service_id
  ) then
    raise exception 'Staff cannot provide service' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.staff
    where id = p_staff_id
      and tenant_id = p_tenant_id
      and deleted_at is null
      and is_active = true
  ) then
    raise exception 'Staff not found' using errcode = 'P0002';
  end if;

  if p_client_id is not null then
    select *
    into v_client
    from public.clients
    where id = p_client_id
      and tenant_id = p_tenant_id
      and deleted_at is null
    for share;

    if not found then
      raise exception 'Client not found' using errcode = 'P0002';
    end if;

    if v_client.is_blacklisted then
      raise exception 'Booking unavailable' using errcode = '42501';
    end if;
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_minutes + v_service.buffer_minutes);

  if exists (
    select 1
    from public.bookings
    where tenant_id = p_tenant_id
      and staff_id = p_staff_id
      and status in ('pending', 'confirmed')
      and tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, v_ends_at, '[)')
    for update
  ) then
    raise exception 'Time slot unavailable' using errcode = '23P01';
  end if;

  insert into public.bookings (
    tenant_id,
    client_id,
    staff_id,
    service_id,
    starts_at,
    ends_at,
    notes,
    source
  )
  values (
    p_tenant_id,
    p_client_id,
    p_staff_id,
    p_service_id,
    p_starts_at,
    v_ends_at,
    nullif(p_notes, ''),
    p_source
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.create_booking(uuid, uuid, uuid, uuid, timestamptz, text, text)
  to authenticated;

create or replace function public.create_public_booking(
  p_tenant_slug text,
  p_staff_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text default null,
  p_client_email text default null,
  p_notes text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_service public.services%rowtype;
  v_client public.clients%rowtype;
  v_client_id uuid;
  v_ends_at timestamptz;
  v_booking public.bookings%rowtype;
begin
  select id
  into v_tenant_id
  from public.tenants
  where slug = p_tenant_slug
    and deleted_at is null;

  if not found then
    raise exception 'Booking unavailable' using errcode = 'P0002';
  end if;

  if p_starts_at <= now() then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

  if length(trim(p_client_name)) < 2 or length(trim(p_client_name)) > 100 then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

  select *
  into v_service
  from public.services
  where id = p_service_id
    and tenant_id = v_tenant_id
    and deleted_at is null
    and is_active = true
  for share;

  if not found then
    raise exception 'Booking unavailable' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.staff
    where id = p_staff_id
      and tenant_id = v_tenant_id
      and deleted_at is null
      and is_active = true
  ) then
    raise exception 'Booking unavailable' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.staff_services
    where tenant_id = v_tenant_id
      and staff_id = p_staff_id
      and service_id = p_service_id
  ) then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

  select *
  into v_client
  from public.clients
  where tenant_id = v_tenant_id
    and deleted_at is null
    and (
      (nullif(trim(p_client_email), '') is not null and lower(email) = lower(trim(p_client_email)))
      or (nullif(trim(p_client_phone), '') is not null and phone = trim(p_client_phone))
    )
  order by created_at asc
  limit 1
  for update;

  if found then
    if v_client.is_blacklisted then
      raise exception 'Booking unavailable' using errcode = '42501';
    end if;

    v_client_id := v_client.id;

    update public.clients
    set
      full_name = trim(p_client_name),
      phone = coalesce(nullif(trim(p_client_phone), ''), phone),
      email = coalesce(nullif(lower(trim(p_client_email)), ''), email)
    where id = v_client_id
      and tenant_id = v_tenant_id;
  else
    insert into public.clients (
      tenant_id,
      full_name,
      phone,
      email
    )
    values (
      v_tenant_id,
      trim(p_client_name),
      nullif(trim(p_client_phone), ''),
      nullif(lower(trim(p_client_email)), '')
    )
    returning id into v_client_id;
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_minutes + v_service.buffer_minutes);

  if exists (
    select 1
    from public.bookings
    where tenant_id = v_tenant_id
      and staff_id = p_staff_id
      and status in ('pending', 'confirmed')
      and tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, v_ends_at, '[)')
    for update
  ) then
    raise exception 'Booking unavailable' using errcode = '23P01';
  end if;

  insert into public.bookings (
    tenant_id,
    client_id,
    staff_id,
    service_id,
    starts_at,
    ends_at,
    notes,
    source
  )
  values (
    v_tenant_id,
    v_client_id,
    p_staff_id,
    p_service_id,
    p_starts_at,
    v_ends_at,
    nullif(trim(p_notes), ''),
    'online'
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)
  to anon, authenticated;

revoke all on public.bookings from anon;
grant select, insert, update on public.bookings to authenticated;

commit;
