begin;

drop policy if exists bookings_select_current_tenant on public.bookings;
drop policy if exists bookings_insert_current_tenant on public.bookings;
drop policy if exists bookings_update_current_tenant on public.bookings;

create policy bookings_select_current_tenant_or_own_staff
  on public.bookings
  for select
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and (
      public.is_current_tenant_owner()
      or exists (
        select 1
        from public.staff
        where staff.tenant_id = bookings.tenant_id
          and staff.id = bookings.staff_id
          and staff.user_id = auth.uid()
          and staff.deleted_at is null
          and staff.is_active = true
      )
    )
  );

create policy bookings_insert_owner
  on public.bookings
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy bookings_update_owner
  on public.bookings
  for update
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

drop policy if exists booking_events_select_current_tenant on public.booking_events;
drop policy if exists booking_events_insert_current_tenant on public.booking_events;

create policy booking_events_select_current_tenant_or_own_staff
  on public.booking_events
  for select
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and (
      public.is_current_tenant_owner()
      or exists (
        select 1
        from public.bookings
        join public.staff
          on staff.tenant_id = bookings.tenant_id
         and staff.id = bookings.staff_id
        where bookings.tenant_id = booking_events.tenant_id
          and bookings.id = booking_events.booking_id
          and staff.user_id = auth.uid()
          and staff.deleted_at is null
          and staff.is_active = true
      )
    )
  );

create policy booking_events_insert_owner
  on public.booking_events
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
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
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_booking public.bookings%rowtype;
  v_ends_at timestamptz;
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
    notes = nullif(p_notes, ''),
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

commit;
