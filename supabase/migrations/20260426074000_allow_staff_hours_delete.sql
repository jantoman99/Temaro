begin;

create policy staff_hours_delete_owner
  on public.staff_hours
  for delete
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

grant delete on public.staff_hours to authenticated;

commit;
