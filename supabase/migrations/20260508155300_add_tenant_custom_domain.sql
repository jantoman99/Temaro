begin;

alter table public.tenants
  add column if not exists custom_domain text,
  add column if not exists custom_domain_status text not null default 'none',
  add column if not exists custom_domain_verification_token text,
  add column if not exists custom_domain_verified_at timestamptz;

alter table public.tenants
  drop constraint if exists tenants_custom_domain_format_check,
  add constraint tenants_custom_domain_format_check
    check (
      custom_domain is null
      or (
        char_length(custom_domain) <= 253
        and custom_domain = lower(custom_domain)
        and custom_domain !~ '^https?://'
        and custom_domain !~ '/'
        and custom_domain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
      )
    );

alter table public.tenants
  drop constraint if exists tenants_custom_domain_status_check,
  add constraint tenants_custom_domain_status_check
    check (custom_domain_status in ('none', 'pending', 'active'));

alter table public.tenants
  drop constraint if exists tenants_custom_domain_token_check,
  add constraint tenants_custom_domain_token_check
    check (
      custom_domain_verification_token is null
      or custom_domain_verification_token ~ '^temaro-domain-verification=[a-f0-9]{32}$'
    );

create unique index if not exists tenants_custom_domain_unique_idx
  on public.tenants (custom_domain)
  where custom_domain is not null and deleted_at is null;

create index if not exists tenants_custom_domain_active_idx
  on public.tenants (custom_domain)
  where custom_domain_status = 'active' and deleted_at is null;

commit;
