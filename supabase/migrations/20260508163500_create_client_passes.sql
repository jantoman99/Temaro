begin;

create table public.service_packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  package_type text not null,
  service_id uuid,
  total_units integer,
  credit_amount integer,
  price integer not null,
  currency text not null default 'CZK',
  validity_days integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_packages_id_tenant_id_unique unique (id, tenant_id),
  constraint service_packages_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete set null,
  constraint service_packages_name_length check (char_length(trim(name)) between 1 and 120),
  constraint service_packages_type_check check (package_type in ('sessions', 'credit')),
  constraint service_packages_units_check check (
    (package_type = 'sessions' and total_units is not null and total_units > 0 and credit_amount is null)
    or (package_type = 'credit' and credit_amount is not null and credit_amount > 0 and total_units is null)
  ),
  constraint service_packages_price_non_negative check (price >= 0),
  constraint service_packages_currency_check check (currency in ('CZK', 'EUR')),
  constraint service_packages_validity_days_positive check (validity_days is null or validity_days > 0)
);

create index service_packages_tenant_active_idx
  on public.service_packages (tenant_id, is_active, name);

create table public.client_passes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  package_id uuid not null,
  client_id uuid not null,
  package_type text not null,
  remaining_units integer,
  remaining_credit integer,
  status text not null default 'active',
  purchased_at timestamptz not null default now(),
  expires_at timestamptz,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_passes_package_tenant_fkey
    foreign key (package_id, tenant_id)
    references public.service_packages (id, tenant_id)
    on delete restrict,
  constraint client_passes_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete cascade,
  constraint client_passes_type_check check (package_type in ('sessions', 'credit')),
  constraint client_passes_balance_check check (
    (package_type = 'sessions' and remaining_units is not null and remaining_units >= 0 and remaining_credit is null)
    or (package_type = 'credit' and remaining_credit is not null and remaining_credit >= 0 and remaining_units is null)
  ),
  constraint client_passes_status_check check (status in ('active', 'used_up', 'expired', 'cancelled')),
  constraint client_passes_note_length check (note is null or char_length(note) <= 500)
);

create index client_passes_tenant_status_idx
  on public.client_passes (tenant_id, status, created_at desc);

create index client_passes_tenant_client_idx
  on public.client_passes (tenant_id, client_id, status);

create table public.client_pass_redemptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_pass_id uuid not null,
  booking_id uuid,
  units_used integer,
  credit_used integer,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint client_pass_redemptions_pass_tenant_fkey
    foreign key (client_pass_id, tenant_id)
    references public.client_passes (id, tenant_id)
    on delete cascade,
  constraint client_pass_redemptions_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete set null,
  constraint client_pass_redemptions_usage_check check (
    (units_used is not null and units_used > 0 and credit_used is null)
    or (credit_used is not null and credit_used > 0 and units_used is null)
  ),
  constraint client_pass_redemptions_note_length check (note is null or char_length(note) <= 500)
);

create index client_pass_redemptions_tenant_created_idx
  on public.client_pass_redemptions (tenant_id, created_at desc);

alter table public.service_packages enable row level security;
alter table public.client_passes enable row level security;
alter table public.client_pass_redemptions enable row level security;

create policy service_packages_owner_all
  on public.service_packages
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy client_passes_owner_all
  on public.client_passes
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy client_pass_redemptions_owner_select
  on public.client_pass_redemptions
  for select
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy client_pass_redemptions_owner_insert
  on public.client_pass_redemptions
  for insert
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create or replace function public.redeem_client_pass(
  p_client_pass_id uuid,
  p_units_used integer default null,
  p_credit_used integer default null,
  p_booking_id uuid default null,
  p_note text default null
)
returns public.client_pass_redemptions
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid := public.current_tenant_id();
  v_pass public.client_passes;
  v_redemption public.client_pass_redemptions;
  v_remaining_units integer;
  v_remaining_credit integer;
begin
  if v_tenant_id is null then
    raise exception 'tenant context is required';
  end if;

  if (p_units_used is null and p_credit_used is null)
    or (p_units_used is not null and p_credit_used is not null)
    or coalesce(p_units_used, p_credit_used) <= 0 then
    raise exception 'exactly one positive usage value is required';
  end if;

  select *
    into v_pass
  from public.client_passes
  where id = p_client_pass_id
    and tenant_id = v_tenant_id
    and status = 'active'
    and (expires_at is null or expires_at > now())
  for update;

  if not found then
    raise exception 'client pass not found';
  end if;

  if v_pass.package_type = 'sessions' then
    if p_credit_used is not null then
      raise exception 'credit cannot be used on session pass';
    end if;

    if v_pass.remaining_units < p_units_used then
      raise exception 'client pass has insufficient sessions';
    end if;

    v_remaining_units := v_pass.remaining_units - p_units_used;

    update public.client_passes
      set remaining_units = v_remaining_units,
          status = case when v_remaining_units = 0 then 'used_up' else status end,
          updated_at = now()
    where id = v_pass.id
      and tenant_id = v_tenant_id;
  else
    if p_units_used is not null then
      raise exception 'sessions cannot be used on credit pass';
    end if;

    if v_pass.remaining_credit < p_credit_used then
      raise exception 'client pass has insufficient credit';
    end if;

    v_remaining_credit := v_pass.remaining_credit - p_credit_used;

    update public.client_passes
      set remaining_credit = v_remaining_credit,
          status = case when v_remaining_credit = 0 then 'used_up' else status end,
          updated_at = now()
    where id = v_pass.id
      and tenant_id = v_tenant_id;
  end if;

  insert into public.client_pass_redemptions (
    tenant_id,
    client_pass_id,
    booking_id,
    units_used,
    credit_used,
    note,
    created_by
  )
  values (
    v_tenant_id,
    v_pass.id,
    p_booking_id,
    p_units_used,
    p_credit_used,
    nullif(trim(coalesce(p_note, '')), ''),
    auth.uid()
  )
  returning * into v_redemption;

  return v_redemption;
end;
$$;

commit;
