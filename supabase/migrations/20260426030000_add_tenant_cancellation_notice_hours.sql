begin;

alter table public.tenants
  add column cancellation_notice_hours smallint not null default 0;

alter table public.tenants
  add constraint tenants_cancellation_notice_hours_check
  check (cancellation_notice_hours between 0 and 168);

comment on column public.tenants.cancellation_notice_hours is
  'Kolik hodin pred terminem je jeste mozne zrusit rezervaci pres self-service odkaz. 0 = bez omezeni.';

commit;
