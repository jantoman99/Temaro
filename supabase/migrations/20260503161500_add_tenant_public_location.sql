begin;

alter table public.tenants
  add column public_address text,
  add column public_city text,
  add column public_region text,
  add column public_postal_code text,
  add column public_country_code text not null default 'CZ',
  add column public_map_url text,
  add column is_publicly_listed boolean not null default false;

alter table public.tenants
  add constraint tenants_public_address_length_check
  check (public_address is null or char_length(public_address) <= 180);

alter table public.tenants
  add constraint tenants_public_city_length_check
  check (public_city is null or char_length(public_city) <= 90);

alter table public.tenants
  add constraint tenants_public_region_length_check
  check (public_region is null or char_length(public_region) <= 90);

alter table public.tenants
  add constraint tenants_public_postal_code_length_check
  check (public_postal_code is null or char_length(public_postal_code) <= 20);

alter table public.tenants
  add constraint tenants_public_country_code_format_check
  check (public_country_code ~ '^[A-Z]{2}$');

alter table public.tenants
  add constraint tenants_public_map_url_length_check
  check (public_map_url is null or char_length(public_map_url) <= 500);

alter table public.tenants
  add constraint tenants_public_map_url_format_check
  check (public_map_url is null or public_map_url ~ '^https?://');

create index tenants_public_listing_city_idx
  on public.tenants (lower(public_city), lower(name))
  where is_publicly_listed = true and deleted_at is null;

commit;
