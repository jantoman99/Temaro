begin;

alter function public.create_booking(uuid, uuid, uuid, uuid, timestamptz, text, text)
  security invoker;

alter function public.update_booking(uuid, uuid, uuid, uuid, timestamptz, text)
  security invoker;

alter function public.is_current_tenant_owner()
  security invoker;

alter function public.is_user_in_current_tenant(uuid)
  security invoker;

revoke execute on function public.is_current_tenant_owner()
  from public, anon;
grant execute on function public.is_current_tenant_owner()
  to authenticated, service_role;

revoke execute on function public.is_user_in_current_tenant(uuid)
  from public, anon;
grant execute on function public.is_user_in_current_tenant(uuid)
  to authenticated, service_role;

commit;
