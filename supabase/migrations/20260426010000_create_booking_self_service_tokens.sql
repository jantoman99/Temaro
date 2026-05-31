begin;

create table public.booking_self_service_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null,
  token_hash text not null unique,
  purpose text not null default 'manage_booking',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint booking_self_service_tokens_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete cascade,
  constraint booking_self_service_tokens_purpose_check
    check (purpose in ('manage_booking'))
);

create index booking_self_service_tokens_booking_idx
  on public.booking_self_service_tokens (tenant_id, booking_id);

create index booking_self_service_tokens_expires_idx
  on public.booking_self_service_tokens (expires_at);

alter table public.booking_self_service_tokens enable row level security;
alter table public.booking_self_service_tokens force row level security;

revoke all on public.booking_self_service_tokens from anon;
revoke all on public.booking_self_service_tokens from authenticated;

commit;
