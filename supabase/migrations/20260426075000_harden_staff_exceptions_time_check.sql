begin;

alter table public.staff_exceptions
  drop constraint staff_exceptions_time_check;

alter table public.staff_exceptions
  add constraint staff_exceptions_time_check
  check (
    (
      is_working = false
      and start_time is null
      and end_time is null
    )
    or (
      is_working = true
      and start_time is not null
      and end_time is not null
      and start_time < end_time
    )
  );

commit;
