begin;

create table public.booking_events (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null,
  actor_user_id uuid references public.users(id) on delete set null,
  actor_type text not null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint booking_events_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete cascade,
  constraint booking_events_actor_type_check check (actor_type in ('owner', 'staff', 'client', 'system')),
  constraint booking_events_event_type_check check (
    event_type in (
      'created',
      'confirmed',
      'rejected',
      'rescheduled',
      'cancelled',
      'completed',
      'no_show'
    )
  )
);

create index booking_events_tenant_booking_created_idx
  on public.booking_events (tenant_id, booking_id, created_at desc);

alter table public.booking_events enable row level security;
alter table public.booking_events force row level security;

create policy booking_events_select_current_tenant
  on public.booking_events
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy booking_events_insert_current_tenant
  on public.booking_events
  for insert
  to authenticated
  with check (
    tenant_id = public.current_tenant_id()
    and public.is_current_tenant_owner()
  );

revoke all on public.booking_events from anon;
grant select, insert on public.booking_events to authenticated;

commit;
