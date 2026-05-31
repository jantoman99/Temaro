begin;

create table public.inventory_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  sku text,
  unit text not null default 'ks',
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 0,
  purchase_price integer,
  retail_price integer,
  currency text not null default 'CZK',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_products_id_tenant_id_unique unique (id, tenant_id),
  constraint inventory_products_name_length check (char_length(trim(name)) between 1 and 120),
  constraint inventory_products_sku_length check (sku is null or char_length(trim(sku)) between 1 and 80),
  constraint inventory_products_unit_length check (char_length(trim(unit)) between 1 and 24),
  constraint inventory_products_stock_non_negative check (stock_quantity >= 0),
  constraint inventory_products_low_stock_non_negative check (low_stock_threshold >= 0),
  constraint inventory_products_purchase_price_non_negative check (purchase_price is null or purchase_price >= 0),
  constraint inventory_products_retail_price_non_negative check (retail_price is null or retail_price >= 0),
  constraint inventory_products_currency_check check (currency in ('CZK', 'EUR'))
);

create unique index inventory_products_tenant_sku_unique_idx
  on public.inventory_products (tenant_id, lower(sku))
  where sku is not null;

create index inventory_products_tenant_active_idx
  on public.inventory_products (tenant_id, is_active, name);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null,
  quantity_delta integer not null,
  reason text not null,
  note text,
  booking_id uuid,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint inventory_movements_product_tenant_fkey
    foreign key (product_id, tenant_id)
    references public.inventory_products (id, tenant_id)
    on delete cascade,
  constraint inventory_movements_booking_tenant_fkey
    foreign key (booking_id, tenant_id)
    references public.bookings (id, tenant_id)
    on delete set null,
  constraint inventory_movements_delta_not_zero check (quantity_delta <> 0),
  constraint inventory_movements_reason_check check (reason in ('purchase', 'usage', 'sale', 'adjustment', 'waste', 'return')),
  constraint inventory_movements_note_length check (note is null or char_length(note) <= 500)
);

create index inventory_movements_tenant_product_created_idx
  on public.inventory_movements (tenant_id, product_id, created_at desc);

create index inventory_movements_tenant_created_idx
  on public.inventory_movements (tenant_id, created_at desc);

alter table public.inventory_products enable row level security;
alter table public.inventory_movements enable row level security;

create policy "Inventory products are visible to tenant users"
  on public.inventory_products
  for select
  using (tenant_id = public.current_tenant_id());

create policy "Owners manage inventory products"
  on public.inventory_products
  for all
  using (
    tenant_id = public.current_tenant_id()
    and exists (
      select 1
      from public.tenant_users
      where tenant_id = public.current_tenant_id()
        and user_id = auth.uid()
        and role = 'owner'
    )
  )
  with check (
    tenant_id = public.current_tenant_id()
    and exists (
      select 1
      from public.tenant_users
      where tenant_id = public.current_tenant_id()
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "Inventory movements are visible to tenant users"
  on public.inventory_movements
  for select
  using (tenant_id = public.current_tenant_id());

create policy "Owners insert inventory movements"
  on public.inventory_movements
  for insert
  with check (
    tenant_id = public.current_tenant_id()
    and exists (
      select 1
      from public.tenant_users
      where tenant_id = public.current_tenant_id()
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create or replace function public.record_inventory_movement(
  p_product_id uuid,
  p_quantity_delta integer,
  p_reason text,
  p_note text default null,
  p_booking_id uuid default null
)
returns public.inventory_movements
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid := public.current_tenant_id();
  v_product public.inventory_products;
  v_new_quantity integer;
  v_movement public.inventory_movements;
begin
  if v_tenant_id is null then
    raise exception 'tenant context is required';
  end if;

  if p_quantity_delta = 0 then
    raise exception 'quantity delta must not be zero';
  end if;

  if p_reason not in ('purchase', 'usage', 'sale', 'adjustment', 'waste', 'return') then
    raise exception 'invalid movement reason';
  end if;

  select *
    into v_product
  from public.inventory_products
  where id = p_product_id
    and tenant_id = v_tenant_id
    and is_active = true
  for update;

  if not found then
    raise exception 'product not found';
  end if;

  v_new_quantity := v_product.stock_quantity + p_quantity_delta;

  if v_new_quantity < 0 then
    raise exception 'inventory stock cannot be negative';
  end if;

  update public.inventory_products
    set stock_quantity = v_new_quantity,
        updated_at = now()
  where id = p_product_id
    and tenant_id = v_tenant_id;

  insert into public.inventory_movements (
    tenant_id,
    product_id,
    quantity_delta,
    reason,
    note,
    booking_id,
    created_by
  )
  values (
    v_tenant_id,
    p_product_id,
    p_quantity_delta,
    p_reason,
    nullif(trim(coalesce(p_note, '')), ''),
    p_booking_id,
    auth.uid()
  )
  returning * into v_movement;

  return v_movement;
end;
$$;

commit;
