begin;

alter table public.notifications
  drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'confirmation',
      'reminder',
      'cancellation',
      'no_show_followup',
      'owner_booking_created',
      'reschedule'
    )
  );

commit;
