begin;

alter table public.tenants
  add column if not exists public_latitude double precision,
  add column if not exists public_longitude double precision;

alter table public.tenants
  drop constraint if exists tenants_public_coordinates_check,
  add constraint tenants_public_coordinates_check
    check (
      (public_latitude is null and public_longitude is null)
      or (
        public_latitude between -90 and 90
        and public_longitude between -180 and 180
      )
    );

create index if not exists tenants_public_coordinates_idx
  on public.tenants (public_latitude, public_longitude)
  where is_publicly_listed = true
    and public_latitude is not null
    and public_longitude is not null
    and deleted_at is null;

commit;
