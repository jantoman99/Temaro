begin;

alter table public.tenants
  add column review_url text;

alter table public.tenants
  add constraint tenants_review_url_format_check
  check (
    review_url is null
    or review_url ~* '^https?://'
  );

commit;
