begin;

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  billing_period text not null,
  price integer not null,
  currency text not null default 'CZK',
  included_units integer,
  included_credit integer,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_plans_id_tenant_id_unique unique (id, tenant_id),
  constraint membership_plans_name_length check (char_length(trim(name)) between 1 and 120),
  constraint membership_plans_period_check check (billing_period in ('monthly', 'quarterly', 'yearly')),
  constraint membership_plans_price_positive check (price > 0),
  constraint membership_plans_currency_check check (currency in ('CZK', 'EUR')),
  constraint membership_plans_units_non_negative check (included_units is null or included_units >= 0),
  constraint membership_plans_credit_non_negative check (included_credit is null or included_credit >= 0),
  constraint membership_plans_description_length check (description is null or char_length(description) <= 500)
);

create index membership_plans_tenant_active_idx
  on public.membership_plans (tenant_id, is_active, name);

create table public.client_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  membership_plan_id uuid not null,
  client_id uuid not null,
  status text not null default 'active',
  starts_at date not null default current_date,
  current_period_start date not null default current_date,
  next_billing_date date not null,
  cancelled_at timestamptz,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_memberships_plan_tenant_fkey
    foreign key (membership_plan_id, tenant_id)
    references public.membership_plans (id, tenant_id)
    on delete restrict,
  constraint client_memberships_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete cascade,
  constraint client_memberships_status_check check (status in ('active', 'paused', 'cancelled', 'expired')),
  constraint client_memberships_dates_check check (next_billing_date > current_period_start),
  constraint client_memberships_note_length check (note is null or char_length(note) <= 500)
);

create index client_memberships_tenant_status_idx
  on public.client_memberships (tenant_id, status, next_billing_date);

create index client_memberships_tenant_client_idx
  on public.client_memberships (tenant_id, client_id, status);

alter table public.membership_plans enable row level security;
alter table public.client_memberships enable row level security;

create policy membership_plans_owner_all
  on public.membership_plans
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy client_memberships_owner_all
  on public.client_memberships
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
