begin;

create table public.staff_commission_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null,
  rule_type text not null default 'percent_paid_revenue',
  percent_bps integer not null default 0,
  fixed_amount integer not null default 0,
  currency text not null default 'CZK',
  is_active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_commission_rules_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete cascade,
  constraint staff_commission_rules_unique_staff unique (tenant_id, staff_id),
  constraint staff_commission_rules_type_check check (rule_type in ('percent_paid_revenue', 'fixed_completed_booking')),
  constraint staff_commission_rules_percent_check check (percent_bps >= 0 and percent_bps <= 10000),
  constraint staff_commission_rules_fixed_amount_check check (fixed_amount >= 0),
  constraint staff_commission_rules_currency_check check (currency in ('CZK', 'EUR')),
  constraint staff_commission_rules_note_length check (note is null or char_length(note) <= 500)
);

create index staff_commission_rules_tenant_active_idx
  on public.staff_commission_rules (tenant_id, is_active, staff_id);

alter table public.staff_commission_rules enable row level security;

create policy staff_commission_rules_owner_all
  on public.staff_commission_rules
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
