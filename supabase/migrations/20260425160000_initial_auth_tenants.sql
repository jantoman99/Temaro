begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table public.tenants (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  plan text not null default 'free',
  plan_expires_at timestamptz,
  timezone text not null default 'Europe/Prague',
  locale text not null default 'cs',
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint tenants_plan_check check (plan in ('free', 'pro', 'team'))
);

create unique index tenants_slug_idx
  on public.tenants (lower(slug))
  where deleted_at is null;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.tenant_users (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default now(),
  constraint tenant_users_role_check check (role in ('owner', 'staff')),
  constraint tenant_users_tenant_user_unique unique (tenant_id, user_id)
);

create index tenant_users_user_id_idx on public.tenant_users (user_id);
create index tenant_users_tenant_id_role_idx on public.tenant_users (tenant_id, role);

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

create or replace function public.is_current_tenant_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users
    where tenant_id = public.current_tenant_id()
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.is_user_in_current_tenant(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users
    where tenant_id = public.current_tenant_id()
      and user_id = target_user_id
  );
$$;

alter table public.tenants enable row level security;
alter table public.tenants force row level security;

alter table public.users enable row level security;
alter table public.users force row level security;

alter table public.tenant_users enable row level security;
alter table public.tenant_users force row level security;

create policy tenants_select_current_tenant
  on public.tenants
  for select
  to authenticated
  using (
    deleted_at is null
    and id = public.current_tenant_id()
  );

create policy tenants_insert_owner_claim
  on public.tenants
  for insert
  to authenticated
  with check (
    id = public.current_tenant_id()
    and public.current_user_role() = 'owner'
  );

create policy tenants_update_owner
  on public.tenants
  for update
  to authenticated
  using (
    deleted_at is null
    and id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  )
  with check (
    id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy users_select_same_tenant
  on public.users
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_user_in_current_tenant(id)
  );

create policy users_insert_self
  on public.users
  for insert
  to authenticated
  with check (id = auth.uid());

create policy users_update_self
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy tenant_users_select_current_tenant
  on public.tenant_users
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy tenant_users_insert_owner
  on public.tenant_users
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and (
      public.is_current_tenant_owner()
      or (
        user_id = auth.uid()
        and role = 'owner'
        and public.current_user_role() = 'owner'
      )
    )
  );

create policy tenant_users_update_owner
  on public.tenant_users
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

revoke all on public.tenants from anon;
revoke all on public.users from anon;
revoke all on public.tenant_users from anon;

grant select, insert, update on public.tenants to authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update on public.tenant_users to authenticated;

commit;
