begin;

create table public.empty_slot_recovery_offers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null,
  staff_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  discount_percent integer not null default 0,
  status text not null default 'draft',
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint empty_slot_recovery_offers_id_tenant_id_unique unique (id, tenant_id),
  constraint empty_slot_recovery_offers_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete cascade,
  constraint empty_slot_recovery_offers_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete restrict,
  constraint empty_slot_recovery_offers_time_check check (ends_at > starts_at),
  constraint empty_slot_recovery_offers_discount_check check (discount_percent >= 0 and discount_percent <= 100),
  constraint empty_slot_recovery_offers_status_check check (status in ('draft', 'ready', 'sent', 'expired', 'cancelled')),
  constraint empty_slot_recovery_offers_note_length check (note is null or char_length(note) <= 500)
);

create index empty_slot_recovery_offers_tenant_time_idx
  on public.empty_slot_recovery_offers (tenant_id, starts_at desc);

create table public.empty_slot_recovery_recipients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  offer_id uuid not null,
  client_id uuid not null,
  status text not null default 'selected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint empty_slot_recovery_recipients_offer_tenant_fkey
    foreign key (offer_id, tenant_id)
    references public.empty_slot_recovery_offers (id, tenant_id)
    on delete cascade,
  constraint empty_slot_recovery_recipients_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete cascade,
  constraint empty_slot_recovery_recipients_unique_client unique (tenant_id, offer_id, client_id),
  constraint empty_slot_recovery_recipients_status_check check (status in ('selected', 'sent', 'booked', 'skipped'))
);

create index empty_slot_recovery_recipients_tenant_offer_idx
  on public.empty_slot_recovery_recipients (tenant_id, offer_id, status);

alter table public.empty_slot_recovery_offers enable row level security;
alter table public.empty_slot_recovery_recipients enable row level security;

create policy empty_slot_recovery_offers_owner_all
  on public.empty_slot_recovery_offers
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy empty_slot_recovery_recipients_owner_all
  on public.empty_slot_recovery_recipients
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
