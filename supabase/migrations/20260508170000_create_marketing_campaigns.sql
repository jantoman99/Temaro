begin;

create table public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  channel text not null,
  segment text not null,
  subject text,
  message text not null,
  status text not null default 'draft',
  scheduled_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_campaigns_name_length check (char_length(trim(name)) between 1 and 120),
  constraint marketing_campaigns_channel_check check (channel in ('email', 'sms')),
  constraint marketing_campaigns_segment_check check (segment in ('all', 'inactive_60d', 'flagged', 'no_show_risk', 'last_visit_30d')),
  constraint marketing_campaigns_status_check check (status in ('draft', 'scheduled', 'sent', 'cancelled')),
  constraint marketing_campaigns_subject_length check (subject is null or char_length(subject) <= 120),
  constraint marketing_campaigns_message_length check (char_length(message) between 1 and 1000)
);

create index marketing_campaigns_tenant_status_idx
  on public.marketing_campaigns (tenant_id, status, created_at desc);

create table public.last_minute_offers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid,
  staff_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  discount_percent integer not null default 0,
  note text,
  status text not null default 'draft',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint last_minute_offers_service_tenant_fkey
    foreign key (service_id, tenant_id)
    references public.services (id, tenant_id)
    on delete set null,
  constraint last_minute_offers_staff_tenant_fkey
    foreign key (staff_id, tenant_id)
    references public.staff (id, tenant_id)
    on delete set null,
  constraint last_minute_offers_time_check check (ends_at > starts_at),
  constraint last_minute_offers_discount_check check (discount_percent between 0 and 90),
  constraint last_minute_offers_status_check check (status in ('draft', 'published', 'cancelled', 'expired')),
  constraint last_minute_offers_note_length check (note is null or char_length(note) <= 500)
);

create index last_minute_offers_tenant_status_time_idx
  on public.last_minute_offers (tenant_id, status, starts_at);

alter table public.marketing_campaigns enable row level security;
alter table public.last_minute_offers enable row level security;

create policy marketing_campaigns_owner_all
  on public.marketing_campaigns
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy last_minute_offers_owner_all
  on public.last_minute_offers
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
