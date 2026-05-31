begin;

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid,
  client_id uuid,
  type text not null,
  channel text not null,
  recipient text not null,
  status text not null default 'pending',
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  constraint notifications_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete cascade,
  constraint notifications_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete set null,
  constraint notifications_type_check check (type in ('confirmation', 'reminder', 'cancellation', 'no_show_followup')),
  constraint notifications_channel_check check (channel in ('email', 'sms')),
  constraint notifications_status_check check (status in ('pending', 'sent', 'failed', 'skipped'))
);

create index notifications_tenant_id_scheduled_at_idx
  on public.notifications (tenant_id, scheduled_at);

create index notifications_booking_id_idx
  on public.notifications (booking_id);

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy notifications_select_current_tenant
  on public.notifications
  for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

create policy notifications_insert_current_tenant
  on public.notifications
  for insert
  to authenticated
  with check (tenant_id = public.current_tenant_id());

create policy notifications_update_current_tenant
  on public.notifications
  for update
  to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

revoke all on public.notifications from anon;
grant select, insert, update on public.notifications to authenticated;

commit;
