begin;

create table public.referral_programs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  reward_type text not null default 'credit',
  referrer_reward_amount integer not null default 0,
  referred_reward_amount integer not null default 0,
  currency text not null default 'CZK',
  max_uses_per_code integer,
  is_active boolean not null default true,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_programs_id_tenant_id_unique unique (id, tenant_id),
  constraint referral_programs_name_length check (char_length(trim(name)) between 1 and 140),
  constraint referral_programs_reward_type_check check (reward_type in ('credit', 'discount', 'manual')),
  constraint referral_programs_amounts_check check (referrer_reward_amount >= 0 and referred_reward_amount >= 0),
  constraint referral_programs_currency_check check (currency in ('CZK', 'EUR')),
  constraint referral_programs_max_uses_check check (max_uses_per_code is null or max_uses_per_code > 0),
  constraint referral_programs_note_length check (note is null or char_length(note) <= 500)
);

create index referral_programs_tenant_active_idx
  on public.referral_programs (tenant_id, is_active, created_at desc);

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  program_id uuid not null,
  client_id uuid,
  code_hash text not null,
  code_last4 text not null,
  label text,
  uses_count integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_codes_program_tenant_fkey
    foreign key (program_id, tenant_id)
    references public.referral_programs (id, tenant_id)
    on delete cascade,
  constraint referral_codes_client_tenant_fkey
    foreign key (client_id, tenant_id)
    references public.clients (id, tenant_id)
    on delete set null,
  constraint referral_codes_hash_unique unique (code_hash),
  constraint referral_codes_last4_check check (code_last4 ~ '^[A-Z0-9]{4}$'),
  constraint referral_codes_label_length check (label is null or char_length(label) <= 140),
  constraint referral_codes_uses_count_check check (uses_count >= 0)
);

create index referral_codes_tenant_program_idx
  on public.referral_codes (tenant_id, program_id, created_at desc);

create index referral_codes_tenant_client_idx
  on public.referral_codes (tenant_id, client_id)
  where client_id is not null;

alter table public.referral_programs enable row level security;
alter table public.referral_codes enable row level security;

create policy referral_programs_owner_all
  on public.referral_programs
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy referral_codes_owner_all
  on public.referral_codes
  for all
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

commit;
