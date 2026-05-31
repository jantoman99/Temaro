begin;

alter table public.services
  add column deposit_type text not null default 'none',
  add column deposit_value integer not null default 0,
  add constraint services_deposit_type_check check (deposit_type in ('none', 'fixed', 'percent')),
  add constraint services_deposit_value_check check (
    (deposit_type = 'none' and deposit_value = 0)
    or (deposit_type = 'fixed' and deposit_value > 0 and deposit_value <= price)
    or (deposit_type = 'percent' and deposit_value > 0 and deposit_value <= 100)
  );

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
security invoker
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_client public.clients%rowtype;
  v_ends_at timestamptz;
  v_deposit_amount integer;
  v_booking public.bookings%rowtype;
begin
  if p_tenant_id is distinct from public.current_tenant_id() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if not public.is_current_tenant_owner() then
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
  v_deposit_amount := case v_service.deposit_type
    when 'fixed' then least(v_service.deposit_value, v_service.price)
    when 'percent' then ceil(v_service.price * v_service.deposit_value / 100.0)::integer
    else 0
  end;

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
    deposit_amount,
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
    v_deposit_amount,
    nullif(p_notes, ''),
    p_source
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function public.update_booking(
  p_tenant_id uuid,
  p_booking_id uuid,
  p_staff_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_notes text default null
)
returns public.bookings
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_booking public.bookings%rowtype;
  v_ends_at timestamptz;
  v_deposit_amount integer;
begin
  if p_tenant_id is distinct from public.current_tenant_id() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if not public.is_current_tenant_owner() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

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
  v_deposit_amount := case v_service.deposit_type
    when 'fixed' then least(v_service.deposit_value, v_service.price)
    when 'percent' then ceil(v_service.price * v_service.deposit_value / 100.0)::integer
    else 0
  end;

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
    deposit_amount = case when deposit_paid then deposit_amount else v_deposit_amount end,
    notes = nullif(p_notes, ''),
    updated_at = now()
  where id = p_booking_id
    and tenant_id = p_tenant_id
  returning * into v_booking;

  return v_booking;
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
  v_deposit_amount integer;
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
  v_deposit_amount := case v_service.deposit_type
    when 'fixed' then least(v_service.deposit_value, v_service.price)
    when 'percent' then ceil(v_service.price * v_service.deposit_value / 100.0)::integer
    else 0
  end;

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
    deposit_amount,
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
    v_deposit_amount,
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
  v_deposit_amount integer;
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
  v_deposit_amount := case v_service.deposit_type
    when 'fixed' then least(v_service.deposit_value, v_service.price)
    when 'percent' then ceil(v_service.price * v_service.deposit_value / 100.0)::integer
    else 0
  end;

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
    deposit_amount = case when deposit_paid then deposit_amount else v_deposit_amount end,
    updated_at = now()
  where id = p_booking_id
    and tenant_id = p_tenant_id
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke execute on function public.create_booking(uuid, uuid, uuid, uuid, timestamptz, text, text)
  from public, anon;
grant execute on function public.create_booking(uuid, uuid, uuid, uuid, timestamptz, text, text)
  to authenticated, service_role;

revoke execute on function public.update_booking(uuid, uuid, uuid, uuid, timestamptz, text)
  from public, anon;
grant execute on function public.update_booking(uuid, uuid, uuid, uuid, timestamptz, text)
  to authenticated, service_role;

revoke execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)
  to service_role;

revoke execute on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz)
  to service_role;

commit;
