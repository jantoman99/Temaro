begin;

alter table public.tenants
  add column industry text not null default 'hair';

alter table public.tenants
  add constraint tenants_industry_check
  check (
    industry in (
      'hair',
      'beauty',
      'nails',
      'massage_wellness',
      'private_fitness',
      'physio',
      'pet_grooming',
      'other'
    )
  );

create index tenants_public_listing_industry_city_idx
  on public.tenants (industry, lower(public_city), lower(name))
  where is_publicly_listed = true and deleted_at is null;

commit;
