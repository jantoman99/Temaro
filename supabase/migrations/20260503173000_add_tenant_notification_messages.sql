begin;

alter table public.tenants
  add column confirmation_message text,
  add column reminder_message text,
  add column cancellation_message text;

alter table public.tenants
  add constraint tenants_confirmation_message_length_check
  check (confirmation_message is null or char_length(confirmation_message) <= 500);

alter table public.tenants
  add constraint tenants_reminder_message_length_check
  check (reminder_message is null or char_length(reminder_message) <= 500);

alter table public.tenants
  add constraint tenants_cancellation_message_length_check
  check (cancellation_message is null or char_length(cancellation_message) <= 500);

commit;
