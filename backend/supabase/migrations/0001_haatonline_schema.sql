-- HaatOnline Supabase Postgres schema + RLS policies (initial full schema)
-- NOTE: This file is intended to be run inside Supabase SQL editor or as part of supabase migrations.
-- Requirements satisfied:
-- - UUID everywhere
-- - profiles.id references auth.users(id)
-- - product_images stored separately
-- - order_items store snapshot pricing
-- - indexes for performance
--
-- Buckets expected (configure separately in Supabase UI):
-- - product-images
-- - avatars
-- - category-images
-- - banners

-- ================
-- Enable extensions
-- ================
create extension if not exists "pgcrypto";

-- ================
-- Utility
-- ================
-- Optional: enforce UUID generation for client inserts
-- UUID DEFAULT can use gen_random_uuid()
-- (pgcrypto provides gen_random_uuid)

-- =========================
-- 1) profiles
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  photo_url text,

  role text not null default 'customer' check (role in ('customer', 'admin')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- =========================
-- 2) addresses
-- =========================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  label text, -- e.g. Home, Office
  full_name text, -- snapshot/denorm for convenience
  phone text,

  line1 text not null,
  line2 text,
  city text,
  state text,
  country text default 'Nepal',
  postal_code text,

  is_default boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint addresses_user_is_default_uniq
    unique (user_id) where is_default
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

-- =========================
-- 3) categories
-- =========================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,

  image_url text,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_is_active_idx on public.categories(is_active);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- =========================
-- 4) products
-- =========================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,

  -- store searchable tag as enum-like text; normalized tag mapping exists below too
  tag text check (tag in ('Fresh','Packaged','Frozen','Organic')) default 'Fresh',

  unit text not null default 'kg',
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),

  description text default '',
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_is_active_idx on public.products(is_active);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
-- pg_trgm extension is optional; if not available, ignore. We'll enable safely:
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_trgm') then
    create extension pg_trgm;
  end if;
exception when others then
  -- ignore; index creation might fail depending on permissions
end $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- =========================
-- 5) product_images
-- =========================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,

  -- store storage object path + public URL
  bucket text not null default 'product-images',
  object_path text not null,      -- path inside bucket
  image_url text not null,       -- optimized URL (can be signed or public)

  sort_order integer not null default 0,
  is_primary boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_images_is_primary_idx on public.product_images(product_id, is_primary);

-- Optional: ensure only one primary per product
alter table public.product_images
  add constraint product_images_single_primary
  unique (product_id) where is_primary;

-- =========================
-- 6) product_tags
-- =========================
create table if not exists public.product_tags (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,

  tag text not null, -- e.g. Fresh, Organic, etc.
  created_at timestamptz not null default now(),

  unique(product_id, tag)
);

create index if not exists product_tags_tag_idx on public.product_tags(tag);

-- =========================
-- 7) carts
-- =========================
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint carts_one_active_per_user unique (user_id) where is_active
);

create index if not exists carts_user_id_idx on public.carts(user_id);

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

-- =========================
-- 8) cart_items
-- =========================
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,

  quantity integer not null default 1 check (quantity > 0),

  -- convenience denorm
  unit text not null default 'kg',
  price numeric(12,2) not null check (price >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(cart_id, product_id)
);

create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- =========================
-- 9) orders
-- =========================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  address_id uuid references public.addresses(id) on delete set null,

  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','delivered','cancelled')),

  -- order-level totals snapshot
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,

  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_status_idx on public.orders(user_id, status);
create index if not exists orders_placed_at_idx on public.orders(placed_at);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- =========================
-- 10) order_items (snapshot pricing)
-- =========================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,

  product_id uuid references public.products(id) on delete set null,
  product_name text not null, -- snapshot

  quantity integer not null check (quantity > 0),
  unit text not null default 'kg',

  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),

  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- =========================
-- 11) reviews
-- =========================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,

  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, product_id)
);

create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- =========================
-- 12) wishlists
-- =========================
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  unique(user_id)
);

create index if not exists wishlists_user_id_idx on public.wishlists(user_id);

-- 13) coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,

  discount_type text not null default 'percent'
    check (discount_type in ('percent','fixed')),

  discount_value numeric(12,2) not null check (discount_value >= 0),

  min_order_amount numeric(12,2) not null default 0,
  max_uses integer,
  used_count integer not null default 0,

  start_at timestamptz,
  end_at timestamptz,

  is_active boolean not null default true,

  created_at timestamptz not null default now()
);

create index if not exists coupons_is_active_idx on public.coupons(is_active);

-- =========================
-- 14) admin_logs
-- =========================
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,

  action text not null,
  entity_type text,
  entity_id uuid,

  meta jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists admin_logs_admin_user_id_idx on public.admin_logs(admin_user_id);
create index if not exists admin_logs_created_at_idx on public.admin_logs(created_at);

-- =========================================================
-- RLS Policies (example policies for required tables)
-- =========================================================

-- Turn on RLS
alter table public.carts enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;

-- ================
-- carts: users can see/modify own cart
-- ================
drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own"
on public.carts
for select
using (user_id = auth.uid());

drop policy if exists "carts_modify_own" on public.carts;
create policy "carts_modify_own"
on public.carts
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ================
-- addresses: users can see/modify own addresses
-- ================
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own"
on public.addresses
for select
using (user_id = auth.uid());

drop policy if exists "addresses_modify_own" on public.addresses;
create policy "addresses_modify_own"
on public.addresses
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ================
-- wishlists: users can see/modify own wishlist rows
-- ================
drop policy if exists "wishlists_select_own" on public.wishlists;
create policy "wishlists_select_own"
on public.wishlists
for select
using (user_id = auth.uid());

drop policy if exists "wishlists_modify_own" on public.wishlists;
create policy "wishlists_modify_own"
on public.wishlists
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ================
-- orders: users can see own orders; admin handled separately via server key
-- ================
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
using (user_id = auth.uid());

drop policy if exists "orders_modify_own" on public.orders;
create policy "orders_modify_own"
on public.orders
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- For safety, only allow insert via app logic with user_id = auth.uid()
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
with check (user_id = auth.uid());

-- =========================================================
-- END
-- =========================================================
