begin;

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

revoke all on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz) from anon;
revoke all on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz) from authenticated;

commit;
