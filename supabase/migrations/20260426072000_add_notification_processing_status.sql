begin;

alter table public.notifications
  drop constraint notifications_status_check;

alter table public.notifications
  add constraint notifications_status_check
  check (status in ('pending', 'processing', 'sent', 'failed', 'skipped'));

commit;
