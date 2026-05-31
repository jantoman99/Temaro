begin;

do $$
begin
  if to_regprocedure('public.current_tenant_id()') is not null then
    execute 'alter function public.current_tenant_id() set search_path = public';
  end if;

  if to_regprocedure('public.current_user_role()') is not null then
    execute 'alter function public.current_user_role() set search_path = public';
  end if;
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

do $$
begin
  if to_regprocedure('public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)') is not null then
    execute 'revoke execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text) from public, anon, authenticated';
    execute 'grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text) to service_role';
  end if;

  if to_regprocedure('public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz)') is not null then
    execute 'revoke execute on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz) from public, anon, authenticated';
    execute 'grant execute on function public.reschedule_booking_self_service(uuid, uuid, uuid, uuid, timestamptz) to service_role';
  end if;

  if to_regprocedure('public.is_staff_available_for_booking(uuid, uuid, timestamptz, timestamptz)') is not null then
    execute 'revoke execute on function public.is_staff_available_for_booking(uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated';
    execute 'grant execute on function public.is_staff_available_for_booking(uuid, uuid, timestamptz, timestamptz) to service_role';
  end if;

  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
    execute 'grant execute on function public.rls_auto_enable() to service_role';
  end if;
end;
$$;

create index if not exists bookings_cancelled_by_idx
  on public.bookings (cancelled_by);

create index if not exists bookings_client_id_idx
  on public.bookings (client_id);

create index if not exists bookings_client_tenant_fkey_idx
  on public.bookings (client_id, tenant_id);

create index if not exists bookings_service_tenant_fkey_idx
  on public.bookings (service_id, tenant_id);

create index if not exists bookings_staff_tenant_fkey_idx
  on public.bookings (staff_id, tenant_id);

create index if not exists clients_preferred_staff_tenant_fkey_idx
  on public.clients (preferred_staff_id, tenant_id);

create index if not exists notifications_booking_tenant_fkey_idx
  on public.notifications (booking_id, tenant_id);

create index if not exists notifications_client_tenant_fkey_idx
  on public.notifications (client_id, tenant_id);

create index if not exists staff_user_id_idx
  on public.staff (user_id);

create index if not exists staff_exceptions_staff_tenant_fkey_idx
  on public.staff_exceptions (staff_id, tenant_id);

create index if not exists staff_hours_staff_tenant_fkey_idx
  on public.staff_hours (staff_id, tenant_id);

create index if not exists staff_services_service_tenant_fkey_idx
  on public.staff_services (service_id, tenant_id);

create index if not exists staff_services_staff_tenant_fkey_idx
  on public.staff_services (staff_id, tenant_id);

commit;
