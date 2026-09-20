-- ==============================================================================
-- SCHEMA SUPABASE: SISTEM POS & INVENTARIS TOKO BANGUNAN
-- Arsitektur: Multi-Role (Admin PC & Kasir Mobile PWA) dengan Realtime & RLS
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. ENUM ROLES & PAYMENT STATUS
create type user_role as enum ('admin', 'kasir', 'gudang', 'driver');
create type payment_method_enum as enum ('cash', 'qris', 'transfer', 'tempo');
create type transaction_status_enum as enum ('paid', 'pending', 'credit', 'cancelled');
create type shift_status_enum as enum ('active', 'closed');

-- 3. PROFILES / EMPLOYEES TABLE
create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role user_role not null default 'kasir',
  email text unique not null,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- 4. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  icon text,
  created_at timestamp with time zone default now()
);

-- 5. PRODUCTS TABLE (Material Bangunan)
create table if not exists public.products (
  id text primary key default ('prod-' || substr(uuid_generate_v4()::text, 1, 8)),
  sku text not null unique,
  barcode text unique,
  name text not null,
  category_id text references public.categories(id) on delete set null,
  category text not null,
  unit text not null, -- Sak, Batang, Pail, Meter, Dus, Pcs, Kg
  cost_price numeric(12, 2) not null check (cost_price >= 0),
  selling_price numeric(12, 2) not null check (selling_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 10 check (min_stock >= 0),
  location text,
  image_url text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. SHIFTS TABLE (PWA Kasir Shift Tracking)
create table if not exists public.shifts (
  id text primary key default ('shift-' || substr(uuid_generate_v4()::text, 1, 8)),
  cashier_id uuid references public.employees(id) on delete set null,
  cashier_name text not null,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  starting_cash numeric(12, 2) not null default 0,
  total_sales numeric(12, 2) not null default 0,
  cash_sales numeric(12, 2) not null default 0,
  qris_sales numeric(12, 2) not null default 0,
  tempo_sales numeric(12, 2) not null default 0,
  expected_cash numeric(12, 2) not null default 0,
  actual_cash numeric(12, 2),
  discrepancy numeric(12, 2),
  status shift_status_enum not null default 'active',
  notes text,
  created_at timestamp with time zone default now()
);

-- 7. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id text primary key default ('trx-' || substr(uuid_generate_v4()::text, 1, 8)),
  invoice_number text not null unique,
  shift_id text references public.shifts(id) on delete set null,
  cashier_name text not null,
  customer_name text,
  customer_phone text,
  payment_method payment_method_enum not null default 'cash',
  status transaction_status_enum not null default 'paid',
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  paid_amount numeric(12, 2) not null default 0,
  change_amount numeric(12, 2) not null default 0,
  notes text,
  created_at timestamp with time zone default now()
);

-- 8. TRANSACTION ITEMS TABLE
create table if not exists public.transaction_items (
  id uuid primary key default uuid_generate_v4(),
  transaction_id text not null references public.transactions(id) on delete cascade,
  product_id text references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0)
);

-- 9. TRIGGER FOR AUTO-DECREASING STOCK UPON TRANSACTION
create or replace function deduct_product_stock()
returns trigger as $$
begin
  update public.products
  set stock = stock - new.quantity,
      updated_at = now()
  where id = new.product_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_deduct_stock on public.transaction_items;
create trigger trigger_deduct_stock
after insert on public.transaction_items
for each row execute function deduct_product_stock();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.shifts enable row level security;
alter table public.employees enable row level security;
alter table public.categories enable row level security;

-- READ: Everyone authenticated (or public in anon demo mode) can view products & categories
create policy "Allow read products for authenticated users"
  on public.products for select using (true);

create policy "Allow read categories for authenticated users"
  on public.categories for select using (true);

-- WRITE: Kasir & Admin can insert transactions
create policy "Allow insert transactions for cashier & admin"
  on public.transactions for insert with check (true);

create policy "Allow insert transaction items"
  on public.transaction_items for insert with check (true);

-- REALTIME PUBLICATION ENABLEMENT
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.shifts;
