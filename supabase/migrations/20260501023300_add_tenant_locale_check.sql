begin;

update public.tenants
set locale = 'cs'
where locale not in ('cs', 'sk', 'en');

alter table public.tenants
  drop constraint if exists tenants_locale_check;

alter table public.tenants
  add constraint tenants_locale_check
  check (locale in ('cs', 'sk', 'en'));

commit;
