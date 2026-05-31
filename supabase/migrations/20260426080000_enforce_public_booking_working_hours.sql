begin;

alter table public.tenants
  drop constraint if exists tenants_timezone_check;

alter table public.tenants
  add constraint tenants_timezone_check
  check (timezone in ('Europe/Prague', 'Europe/Bratislava', 'UTC'));

create or replace function public.is_staff_available_for_booking(
  p_tenant_id uuid,
  p_staff_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_time_zone text;
  v_local_start timestamp;
  v_local_end timestamp;
  v_local_date date;
  v_day_of_week integer;
  v_start_time time;
  v_end_time time;
  v_exception public.staff_exceptions%rowtype;
  v_regular_hours public.staff_hours%rowtype;
begin
  if p_starts_at >= p_ends_at then
    return false;
  end if;

  select coalesce(timezone, 'Europe/Prague')
  into v_time_zone
  from public.tenants
  where id = p_tenant_id
    and deleted_at is null;

  if not found then
    return false;
  end if;

  v_local_start := p_starts_at at time zone v_time_zone;
  v_local_end := p_ends_at at time zone v_time_zone;

  if v_local_start::date <> v_local_end::date then
    return false;
  end if;

  v_local_date := v_local_start::date;
  v_day_of_week := (extract(dow from v_local_date)::integer + 6) % 7;
  v_start_time := v_local_start::time;
  v_end_time := v_local_end::time;

  select *
  into v_exception
  from public.staff_exceptions
  where tenant_id = p_tenant_id
    and staff_id = p_staff_id
    and date = v_local_date;

  if found then
    if not v_exception.is_working then
      return false;
    end if;

    return (
      v_exception.start_time is not null
      and v_exception.end_time is not null
      and v_exception.start_time <= v_start_time
      and v_exception.end_time >= v_end_time
    );
  end if;

  select *
  into v_regular_hours
  from public.staff_hours
  where tenant_id = p_tenant_id
    and staff_id = p_staff_id
    and day_of_week = v_day_of_week
    and is_working = true;

  if not found then
    return false;
  end if;

  return (
    v_regular_hours.start_time <= v_start_time
    and v_regular_hours.end_time >= v_end_time
  );
end;
$$;

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

  if not public.is_staff_available_for_booking(v_tenant_id, p_staff_id, p_starts_at, v_ends_at) then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

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
    status,
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
    'pending',
    nullif(trim(p_notes), ''),
    'online'
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function public.reschedule_booking_self_service(
  p_tenant_id uuid,
  p_booking_id uuid,
  p_staff_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_booking public.bookings%rowtype;
  v_ends_at timestamptz;
begin
  if p_starts_at <= now() then
    raise exception 'Booking cannot start in the past' using errcode = '22023';
  end if;

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
    and tenant_id = p_tenant_id
    and status in ('pending', 'confirmed')
  for update;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
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
    from public.staff
    where id = p_staff_id
      and tenant_id = p_tenant_id
      and deleted_at is null
      and is_active = true
  ) then
    raise exception 'Staff not found' using errcode = 'P0002';
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

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_minutes + v_service.buffer_minutes);

  if not public.is_staff_available_for_booking(p_tenant_id, p_staff_id, p_starts_at, v_ends_at) then
    raise exception 'Time slot unavailable' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.bookings
    where tenant_id = p_tenant_id
      and id <> p_booking_id
      and staff_id = p_staff_id
      and status in ('pending', 'confirmed')
      and tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, v_ends_at, '[)')
    for update
  ) then
    raise exception 'Time slot unavailable' using errcode = '23P01';
  end if;

  update public.bookings
  set
    staff_id = p_staff_id,
    service_id = p_service_id,
    starts_at = p_starts_at,
    ends_at = v_ends_at,
    updated_at = now()
  where id = p_booking_id
    and tenant_id = p_tenant_id
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)
  from public, anon, authenticated;

grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)
  to service_role;

revoke execute on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz)
  from public, anon, authenticated;

grant execute on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz)
  to service_role;

revoke execute on function public.is_staff_available_for_booking(uuid, uuid, timestamptz, timestamptz)
  from public, anon, authenticated;

grant execute on function public.is_staff_available_for_booking(uuid, uuid, timestamptz, timestamptz)
  to service_role;

commit;
