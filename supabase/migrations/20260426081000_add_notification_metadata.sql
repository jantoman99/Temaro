begin;

alter table public.notifications
  add column metadata jsonb not null default '{}'::jsonb;

commit;
