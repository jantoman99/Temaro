begin;

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code_hash text not null,
  code_last4 text not null,
  label text not null,
  initial_amount integer not null,
  remaining_amount integer not null,
  currency text not null default 'CZK',
  status text not null default 'active',
  expires_at timestamptz,
  issued_to_name text,
  issued_to_email text,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vouchers_id_tenant_id_unique unique (id, tenant_id),
  constraint vouchers_code_hash_unique unique (tenant_id, code_hash),
  constraint vouchers_label_length check (char_length(trim(label)) between 1 and 120),
  constraint vouchers_amount_positive check (initial_amount > 0),
  constraint vouchers_remaining_non_negative check (remaining_amount >= 0 and remaining_amount <= initial_amount),
  constraint vouchers_currency_check check (currency in ('CZK', 'EUR')),
  constraint vouchers_status_check check (status in ('active', 'redeemed', 'expired', 'cancelled')),
  constraint vouchers_code_last4_check check (code_last4 ~ '^[A-Z0-9]{4}$'),
  constraint vouchers_email_length check (issued_to_email is null or char_length(issued_to_email) <= 254),
  constraint vouchers_note_length check (note is null or char_length(note) <= 500)
);

create index vouchers_tenant_status_idx
  on public.vouchers (tenant_id, status, created_at desc);

create table public.voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  voucher_id uuid not null,
  booking_id uuid,
  amount integer not null,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint voucher_redemptions_voucher_tenant_fkey
    foreign key (voucher_id, tenant_id)
    references public.vouchers (id, tenant_id)
    on delete cascade,
  constraint voucher_redemptions_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete set null,
  constraint voucher_redemptions_amount_positive check (amount > 0),
  constraint voucher_redemptions_note_length check (note is null or char_length(note) <= 500)
);

create index voucher_redemptions_tenant_created_idx
  on public.voucher_redemptions (tenant_id, created_at desc);

create index voucher_redemptions_tenant_voucher_created_idx
  on public.voucher_redemptions (tenant_id, voucher_id, created_at desc);

alter table public.vouchers enable row level security;
alter table public.voucher_redemptions enable row level security;

create policy vouchers_owner_select
  on public.vouchers
  for select
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy vouchers_owner_insert
  on public.vouchers
  for insert
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy vouchers_owner_update
  on public.vouchers
  for update
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner())
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy voucher_redemptions_owner_select
  on public.voucher_redemptions
  for select
  using (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create policy voucher_redemptions_owner_insert
  on public.voucher_redemptions
  for insert
  with check (tenant_id = public.current_tenant_id() and public.is_current_tenant_owner());

create or replace function public.redeem_voucher(
  p_code_hash text,
  p_amount integer,
  p_booking_id uuid default null,
  p_note text default null
)
returns public.voucher_redemptions
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid := public.current_tenant_id();
  v_voucher public.vouchers;
  v_redemption public.voucher_redemptions;
  v_remaining integer;
begin
  if v_tenant_id is null then
    raise exception 'tenant context is required';
  end if;

  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select *
    into v_voucher
  from public.vouchers
  where tenant_id = v_tenant_id
    and code_hash = p_code_hash
    and status = 'active'
    and (expires_at is null or expires_at > now())
  for update;

  if not found then
    raise exception 'voucher not found';
  end if;

  if v_voucher.remaining_amount < p_amount then
    raise exception 'voucher has insufficient balance';
  end if;

  v_remaining := v_voucher.remaining_amount - p_amount;

  update public.vouchers
    set remaining_amount = v_remaining,
        status = case when v_remaining = 0 then 'redeemed' else status end,
        updated_at = now()
  where id = v_voucher.id
    and tenant_id = v_tenant_id;

  insert into public.voucher_redemptions (
    tenant_id,
    voucher_id,
    booking_id,
    amount,
    note,
    created_by
  )
  values (
    v_tenant_id,
    v_voucher.id,
    p_booking_id,
    p_amount,
    nullif(trim(coalesce(p_note, '')), ''),
    auth.uid()
  )
  returning * into v_redemption;

  return v_redemption;
end;
$$;

commit;
