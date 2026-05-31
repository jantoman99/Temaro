begin;

create table public.booking_payments (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null,
  amount integer not null,
  currency text not null default 'CZK',
  payment_scope text not null default 'full',
  method text not null,
  status text not null default 'paid',
  provider text,
  provider_payment_id text,
  note text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_payments_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete cascade,
  constraint booking_payments_amount_check check (amount > 0),
  constraint booking_payments_currency_check check (currency in ('CZK', 'EUR')),
  constraint booking_payments_scope_check check (payment_scope in ('deposit', 'remaining', 'full', 'other')),
  constraint booking_payments_method_check check (method in ('cash', 'card_terminal', 'online_card', 'bank_transfer', 'voucher', 'other')),
  constraint booking_payments_status_check check (status in ('pending', 'paid', 'refunded', 'failed')),
  constraint booking_payments_paid_at_check check (
    (status = 'paid' and paid_at is not null)
    or (status <> 'paid')
  ),
  constraint booking_payments_refunded_at_check check (
    (status = 'refunded' and refunded_at is not null)
    or (status <> 'refunded')
  )
);

create index booking_payments_tenant_booking_created_idx
  on public.booking_payments (tenant_id, booking_id, created_at desc);

create index booking_payments_tenant_paid_at_idx
  on public.booking_payments (tenant_id, paid_at desc)
  where status = 'paid';

create unique index booking_payments_provider_payment_unique_idx
  on public.booking_payments (provider, provider_payment_id)
  where provider is not null and provider_payment_id is not null;

alter table public.booking_payments enable row level security;
alter table public.booking_payments force row level security;

create policy booking_payments_select_owner
  on public.booking_payments
  for select
  to authenticated
  using (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy booking_payments_insert_owner
  on public.booking_payments
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

create policy booking_payments_update_owner
  on public.booking_payments
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

revoke all on public.booking_payments from anon;
grant select, insert, update on public.booking_payments to authenticated;

alter table public.booking_events
  drop constraint booking_events_event_type_check;

alter table public.booking_events
  add constraint booking_events_event_type_check check (
    event_type in (
      'created',
      'confirmed',
      'rejected',
      'rescheduled',
      'cancelled',
      'completed',
      'no_show',
      'payment_recorded'
    )
  );

commit;
