begin;

alter table public.tenants
  add column if not exists public_gallery_image_urls text[] not null default '{}'::text[],
  add column if not exists public_amenities text[] not null default '{}'::text[],
  add column if not exists social_instagram_url text,
  add column if not exists social_facebook_url text,
  add column if not exists social_tiktok_url text,
  add column if not exists social_website_url text;

alter table public.tenants
  drop constraint if exists tenants_public_gallery_image_urls_limit_check,
  add constraint tenants_public_gallery_image_urls_limit_check
  check (
    coalesce(array_length(public_gallery_image_urls, 1), 0) <= 6
    and char_length(array_to_string(public_gallery_image_urls, '')) <= 3000
  );

alter table public.tenants
  drop constraint if exists tenants_public_amenities_limit_check,
  add constraint tenants_public_amenities_limit_check
  check (
    coalesce(array_length(public_amenities, 1), 0) <= 10
    and char_length(array_to_string(public_amenities, '')) <= 500
  );

alter table public.tenants
  drop constraint if exists tenants_social_instagram_url_format_check,
  add constraint tenants_social_instagram_url_format_check
  check (social_instagram_url is null or social_instagram_url ~* '^https?://');

alter table public.tenants
  drop constraint if exists tenants_social_facebook_url_format_check,
  add constraint tenants_social_facebook_url_format_check
  check (social_facebook_url is null or social_facebook_url ~* '^https?://');

alter table public.tenants
  drop constraint if exists tenants_social_tiktok_url_format_check,
  add constraint tenants_social_tiktok_url_format_check
  check (social_tiktok_url is null or social_tiktok_url ~* '^https?://');

alter table public.tenants
  drop constraint if exists tenants_social_website_url_format_check,
  add constraint tenants_social_website_url_format_check
  check (social_website_url is null or social_website_url ~* '^https?://');

commit;
