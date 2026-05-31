begin;

alter table public.notifications
  add column processing_started_at timestamptz;

create index notifications_processing_started_at_idx
  on public.notifications (processing_started_at)
  where status = 'processing';

commit;
