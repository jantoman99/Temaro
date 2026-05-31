begin;

drop policy if exists users_select_same_tenant on public.users;
create policy users_select_same_tenant
  on public.users
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or public.is_user_in_current_tenant(id)
  );

drop policy if exists users_insert_self on public.users;
create policy users_insert_self
  on public.users
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists users_update_self on public.users;
create policy users_update_self
  on public.users
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists tenant_users_insert_owner on public.tenant_users;
create policy tenant_users_insert_owner
  on public.tenant_users
  for insert
  to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (
      (select public.is_current_tenant_owner())
      or (
        user_id = (select auth.uid())
        and role = 'owner'
        and (select public.current_user_role()) = 'owner'
      )
    )
  );

commit;
