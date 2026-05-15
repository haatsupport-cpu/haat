-- Transaction-safe order placement + inventory deduction via RPC
-- This should be called by backend createOrder to prevent overselling.

create or replace function public.place_order_and_deduct_inventory(
  p_user_id uuid,
  p_address_id uuid,
  p_items jsonb,
  p_totals jsonb
)
returns table (
  order_id uuid
)
language plpgsql
as $$
declare
  v_order_id uuid;
  v_product_id uuid;
  v_qty integer;
  v_needed_stock integer;

  -- Cursor variables for iterating p_items JSON
  r_item jsonb;

begin
  -- Ensure we run atomically
  -- (RPC runs inside a single transaction by default in Postgres)

  -- 1) Validate inputs shape
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'p_items must be a non-empty JSON array';
  end if;

  -- 2) Create order row first (pending)
  v_order_id := gen_random_uuid();

  insert into public.orders (
    id,
    user_id,
    address_id,
    status,
    subtotal,
    tax,
    shipping,
    total_amount
  )
  values (
    v_order_id,
    p_user_id,
    p_address_id,
    'pending',
    coalesce( (p_totals->>'subtotal')::numeric, 0 ),
    coalesce( (p_totals->>'tax')::numeric, 0 ),
    coalesce( (p_totals->>'shipping')::numeric, 0 ),
    coalesce( (p_totals->>'total_amount')::numeric, 0 )
  );

  -- 3) Insert order_items snapshot rows + validate stock with row locks
  for r_item in
    select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (r_item->>'product_id')::uuid;
    v_qty := (r_item->>'quantity')::int;

    if v_product_id is null or v_qty is null or v_qty <= 0 then
      raise exception 'Invalid cart item: product_id=% qty=%', v_product_id, v_qty;
    end if;

    -- Lock product row to prevent race updates
    select stock into v_needed_stock
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Product not found: %', v_product_id;
    end if;

    if v_needed_stock < v_qty then
      raise exception 'Insufficient stock for product %. Available: %, needed: %', v_product_id, v_needed_stock, v_qty;
    end if;

    -- Insert snapshot item
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit,
      unit_price,
      line_total
    )
    select
      v_order_id,
      p.id,
      p.name,
      v_qty,
      p.unit,
      p.price,
      (p.price * v_qty)
    from public.products p
    where p.id = v_product_id;

    -- Deduct stock
    update public.products
    set stock = stock - v_qty
    where id = v_product_id;
  end loop;

  order_id := v_order_id;
  return next;
end;
$$;

-- Ensure function is accessible (optional; RLS doesn't apply to RPC internals)
-- grant execute on function public.place_order_and_deduct_inventory(uuid, uuid, jsonb, jsonb) to authenticated;
