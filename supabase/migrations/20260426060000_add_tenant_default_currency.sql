begin;

alter table public.tenants
  add column default_currency text not null default 'CZK';

alter table public.tenants
  add constraint tenants_default_currency_check
  check (default_currency in ('CZK', 'EUR'));

comment on column public.tenants.default_currency is
  'Default currency used when creating new services.';

commit;
