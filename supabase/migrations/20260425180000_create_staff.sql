begin;

create table public.staff (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  bio text,
  avatar_url text,
  color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint staff_id_tenant_id_unique unique (id, tenant_id),
  constraint staff_color_check check (color is null or color ~ '^#[0-9A-Fa-f]{6}$')
);

create index staff_tenant_id_name_idx
  on public.staff (tenant_id, name)
  where deleted_at is null;

create table public.staff_hours (
  id uuid primary key default extensions.gen_random_uuid(),
  staff_id uuid not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  is_working boolean not null default true,
  constraint staff_hours_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete cascade,
  constraint staff_hours_day_of_week_check check (day_of_week between 0 and 6),
  constraint staff_hours_time_check check (start_time < end_time),
  constraint staff_hours_staff_day_unique unique (staff_id, day_of_week)
);

create index staff_hours_tenant_id_staff_id_idx
  on public.staff_hours (tenant_id, staff_id);

create table public.staff_exceptions (
  id uuid primary key default extensions.gen_random_uuid(),
  staff_id uuid not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  date date not null,
  is_working boolean not null default false,
  start_time time,
  end_time time,
  note text,
  constraint staff_exceptions_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete cascade,
  constraint staff_exceptions_time_check check (
    (start_time is null and end_time is null)
    or (start_time is not null and end_time is not null and start_time < end_time)
  ),
  constraint staff_exceptions_staff_date_unique unique (staff_id, date)
);

create index staff_exceptions_tenant_id_date_idx
  on public.staff_exceptions (tenant_id, date);

alter table public.staff enable row level security;
alter table public.staff force row level security;

alter table public.staff_hours enable row level security;
alter table public.staff_hours force row level security;

alter table public.staff_exceptions enable row level security;
alter table public.staff_exceptions force row level security;

create policy staff_select_current_tenant
  on public.staff
  for select
  to authenticated
  using (
    deleted_at is null
    and tenant_id = public.current_tenant_id()
  );

create policy staff_insert_owner
  on public.staff
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy staff_update_owner
  on public.staff
  for update
  to authenticated
  using (
    deleted_at is null
    and tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy staff_hours_select_current_tenant
  on public.staff_hours
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy staff_hours_insert_owner
  on public.staff_hours
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy staff_hours_update_owner
  on public.staff_hours
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

create policy staff_exceptions_select_current_tenant
  on public.staff_exceptions
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy staff_exceptions_insert_owner
  on public.staff_exceptions
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy staff_exceptions_update_owner
  on public.staff_exceptions
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

revoke all on public.staff from anon;
revoke all on public.staff_hours from anon;
revoke all on public.staff_exceptions from anon;

grant select, insert, update on public.staff to authenticated;
grant select, insert, update on public.staff_hours to authenticated;
grant select, insert, update on public.staff_exceptions to authenticated;

commit;
