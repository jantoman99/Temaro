begin;

alter table public.tenants
  add column public_description text,
  add column logo_url text,
  add column cover_image_url text,
  add column brand_color text;

alter table public.tenants
  add constraint tenants_public_description_length_check
  check (public_description is null or char_length(public_description) <= 280);

alter table public.tenants
  add constraint tenants_logo_url_length_check
  check (logo_url is null or char_length(logo_url) <= 500);

alter table public.tenants
  add constraint tenants_cover_image_url_length_check
  check (cover_image_url is null or char_length(cover_image_url) <= 500);

alter table public.tenants
  add constraint tenants_brand_color_format_check
  check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$');

commit;
