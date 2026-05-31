begin;

alter table public.clients
  add column if not exists preferred_contact_channel text not null default 'any',
  add column if not exists preferred_time_of_day text not null default 'any',
  add column if not exists preference_notes text,
  add column if not exists client_tier text not null default 'standard';

alter table public.clients
  drop constraint if exists clients_preferred_contact_channel_check,
  add constraint clients_preferred_contact_channel_check
    check (preferred_contact_channel in ('any', 'email', 'sms', 'phone'));

alter table public.clients
  drop constraint if exists clients_preferred_time_of_day_check,
  add constraint clients_preferred_time_of_day_check
    check (preferred_time_of_day in ('any', 'morning', 'afternoon', 'evening'));

alter table public.clients
  drop constraint if exists clients_preference_notes_length,
  add constraint clients_preference_notes_length
    check (preference_notes is null or char_length(preference_notes) <= 500);

alter table public.clients
  drop constraint if exists clients_tier_check,
  add constraint clients_tier_check
    check (client_tier in ('standard', 'trusted', 'risk'));

create index if not exists clients_tenant_tier_idx
  on public.clients (tenant_id, client_tier, no_show_count desc)
  where deleted_at is null;

commit;
