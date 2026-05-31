begin;

alter table public.bookings
  drop constraint if exists bookings_source_check;

alter table public.bookings
  add column source_detail text,
  add column source_metadata jsonb not null default '{}'::jsonb,
  add constraint bookings_source_check check (
    source in ('manual', 'online', 'instagram', 'qr', 'widget', 'catalog', 'google', 'referral')
  ),
  add constraint bookings_source_detail_length_check check (
    source_detail is null or char_length(source_detail) <= 120
  ),
  add constraint bookings_source_metadata_object_check check (
    jsonb_typeof(source_metadata) = 'object'
    and char_length(source_metadata::text) <= 2000
  );

create index bookings_source_idx
  on public.bookings (tenant_id, source, starts_at);

create or replace function public.create_public_booking(
  p_tenant_slug text,
  p_staff_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text default null,
  p_client_email text default null,
  p_notes text default null,
  p_source text default 'online',
  p_source_detail text default null,
  p_source_metadata jsonb default '{}'::jsonb
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
  v_source text;
  v_source_metadata jsonb;
  v_booking public.bookings%rowtype;
begin
  v_source := coalesce(nullif(trim(p_source), ''), 'online');
  v_source_metadata := coalesce(p_source_metadata, '{}'::jsonb);

  if v_source not in ('online', 'instagram', 'qr', 'widget', 'catalog', 'google', 'referral') then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

  if jsonb_typeof(v_source_metadata) <> 'object' or char_length(v_source_metadata::text) > 2000 then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

  if p_source_detail is not null and char_length(trim(p_source_detail)) > 120 then
    raise exception 'Booking unavailable' using errcode = '22023';
  end if;

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
    source,
    source_detail,
    source_metadata
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
    v_source,
    nullif(trim(p_source_detail), ''),
    v_source_metadata
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)
  from public, anon, authenticated;
drop function if exists public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text);
revoke execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text, text, text, jsonb)
  to service_role;

commit;
