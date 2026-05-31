begin;

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid not null,
  staff_id uuid,
  preferred_from timestamptz,
  preferred_to timestamptz,
  client_name text not null,
  client_phone text,
  client_email text,
  notes text,
  source text not null default 'online',
  source_detail text,
  source_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  offered_booking_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_entries_service_tenant_fkey foreign key (service_id, tenant_id)
    references public.services(id, tenant_id) on delete cascade,
  constraint waitlist_entries_staff_tenant_fkey foreign key (staff_id, tenant_id)
    references public.staff(id, tenant_id) on delete set null,
  constraint waitlist_entries_offered_booking_tenant_fkey foreign key (offered_booking_id, tenant_id)
    references public.bookings(id, tenant_id) on delete set null,
  constraint waitlist_entries_client_contact_check check (
    nullif(trim(coalesce(client_phone, '')), '') is not null
    or nullif(trim(coalesce(client_email, '')), '') is not null
  ),
  constraint waitlist_entries_client_name_check check (
    char_length(trim(client_name)) between 2 and 100
  ),
  constraint waitlist_entries_client_phone_check check (
    client_phone is null or client_phone ~ '^\+?[0-9]{9,20}$'
  ),
  constraint waitlist_entries_client_email_check check (
    client_email is null or client_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint waitlist_entries_notes_length_check check (
    notes is null or char_length(notes) <= 500
  ),
  constraint waitlist_entries_source_check check (
    source in ('online', 'instagram', 'qr', 'widget', 'catalog', 'google', 'referral')
  ),
  constraint waitlist_entries_source_detail_length_check check (
    source_detail is null or char_length(source_detail) <= 120
  ),
  constraint waitlist_entries_source_metadata_object_check check (
    jsonb_typeof(source_metadata) = 'object' and char_length(source_metadata::text) <= 2000
  ),
  constraint waitlist_entries_status_check check (
    status in ('active', 'offered', 'booked', 'cancelled', 'expired')
  ),
  constraint waitlist_entries_preferred_window_check check (
    preferred_from is null or preferred_to is null or preferred_from < preferred_to
  )
);

create index if not exists waitlist_entries_tenant_status_idx
  on public.waitlist_entries(tenant_id, status, created_at desc);

create index if not exists waitlist_entries_service_idx
  on public.waitlist_entries(tenant_id, service_id, status, created_at desc);

create unique index if not exists waitlist_entries_active_email_unique_idx
  on public.waitlist_entries(
    tenant_id,
    service_id,
    coalesce(staff_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(client_email)
  )
  where status = 'active' and client_email is not null;

create unique index if not exists waitlist_entries_active_phone_unique_idx
  on public.waitlist_entries(
    tenant_id,
    service_id,
    coalesce(staff_id, '00000000-0000-0000-0000-000000000000'::uuid),
    client_phone
  )
  where status = 'active' and client_phone is not null;

alter table public.waitlist_entries enable row level security;
alter table public.waitlist_entries force row level security;

drop policy if exists waitlist_entries_select_owner on public.waitlist_entries;
create policy waitlist_entries_select_owner
  on public.waitlist_entries
  for select
  to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.is_current_tenant_owner())
  );

drop policy if exists waitlist_entries_insert_owner on public.waitlist_entries;
create policy waitlist_entries_insert_owner
  on public.waitlist_entries
  for insert
  to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.is_current_tenant_owner())
  );

drop policy if exists waitlist_entries_update_owner on public.waitlist_entries;
create policy waitlist_entries_update_owner
  on public.waitlist_entries
  for update
  to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.is_current_tenant_owner())
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.is_current_tenant_owner())
  );

revoke all on public.waitlist_entries from public, anon;
grant select, insert, update on public.waitlist_entries to authenticated;

create or replace function public.create_waitlist_entry(
  p_tenant_slug text,
  p_service_id uuid,
  p_staff_id uuid default null,
  p_client_name text default '',
  p_client_phone text default null,
  p_client_email text default null,
  p_notes text default null,
  p_source text default 'online',
  p_source_detail text default null,
  p_source_metadata jsonb default '{}'::jsonb
)
returns public.waitlist_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_client public.clients%rowtype;
  v_client_id uuid;
  v_source text;
  v_source_metadata jsonb;
  v_waitlist public.waitlist_entries%rowtype;
begin
  v_source := coalesce(nullif(trim(p_source), ''), 'online');
  v_source_metadata := coalesce(p_source_metadata, '{}'::jsonb);

  if v_source not in ('online', 'instagram', 'qr', 'widget', 'catalog', 'google', 'referral') then
    raise exception 'Waitlist unavailable' using errcode = '22023';
  end if;

  if jsonb_typeof(v_source_metadata) <> 'object' or char_length(v_source_metadata::text) > 2000 then
    raise exception 'Waitlist unavailable' using errcode = '22023';
  end if;

  if p_source_detail is not null and char_length(trim(p_source_detail)) > 120 then
    raise exception 'Waitlist unavailable' using errcode = '22023';
  end if;

  if length(trim(p_client_name)) < 2 or length(trim(p_client_name)) > 100 then
    raise exception 'Waitlist unavailable' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_client_phone, '')), '') is null
    and nullif(trim(coalesce(p_client_email, '')), '') is null then
    raise exception 'Waitlist unavailable' using errcode = '22023';
  end if;

  select id
  into v_tenant_id
  from public.tenants
  where slug = p_tenant_slug
    and deleted_at is null;

  if not found then
    raise exception 'Waitlist unavailable' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.services
    where id = p_service_id
      and tenant_id = v_tenant_id
      and deleted_at is null
      and is_active = true
  ) then
    raise exception 'Waitlist unavailable' using errcode = 'P0002';
  end if;

  if p_staff_id is not null then
    if not exists (
      select 1
      from public.staff
      where id = p_staff_id
        and tenant_id = v_tenant_id
        and deleted_at is null
        and is_active = true
    ) then
      raise exception 'Waitlist unavailable' using errcode = 'P0002';
    end if;

    if not exists (
      select 1
      from public.staff_services
      where tenant_id = v_tenant_id
        and staff_id = p_staff_id
        and service_id = p_service_id
    ) then
      raise exception 'Waitlist unavailable' using errcode = '22023';
    end if;
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
      raise exception 'Waitlist unavailable' using errcode = '42501';
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

  select *
  into v_waitlist
  from public.waitlist_entries
  where tenant_id = v_tenant_id
    and service_id = p_service_id
    and coalesce(staff_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(p_staff_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and status = 'active'
    and (
      (nullif(trim(p_client_email), '') is not null and lower(client_email) = lower(trim(p_client_email)))
      or (nullif(trim(p_client_phone), '') is not null and client_phone = trim(p_client_phone))
    )
  order by created_at asc
  limit 1
  for update;

  if found then
    update public.waitlist_entries
    set
      client_id = v_client_id,
      client_name = trim(p_client_name),
      client_phone = coalesce(nullif(trim(p_client_phone), ''), client_phone),
      client_email = coalesce(nullif(lower(trim(p_client_email)), ''), client_email),
      notes = nullif(trim(p_notes), ''),
      source = v_source,
      source_detail = nullif(trim(p_source_detail), ''),
      source_metadata = v_source_metadata,
      updated_at = now()
    where id = v_waitlist.id
      and tenant_id = v_tenant_id
    returning * into v_waitlist;

    return v_waitlist;
  end if;

  insert into public.waitlist_entries (
    tenant_id,
    client_id,
    service_id,
    staff_id,
    client_name,
    client_phone,
    client_email,
    notes,
    source,
    source_detail,
    source_metadata
  )
  values (
    v_tenant_id,
    v_client_id,
    p_service_id,
    p_staff_id,
    trim(p_client_name),
    nullif(trim(p_client_phone), ''),
    nullif(lower(trim(p_client_email)), ''),
    nullif(trim(p_notes), ''),
    v_source,
    nullif(trim(p_source_detail), ''),
    v_source_metadata
  )
  returning * into v_waitlist;

  return v_waitlist;
end;
$$;

revoke execute on function public.create_waitlist_entry(text, uuid, uuid, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_waitlist_entry(text, uuid, uuid, text, text, text, text, text, text, jsonb)
  to service_role;

commit;
