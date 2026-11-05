-- ====================================================================
-- DIMSUMMENTAI MAMIFFAYY - SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- ====================================================================
-- Script ini membuat seluruh tabel yang dibutuhkan, index performa,
-- Row Level Security (RLS) policies, dan seed data awal.
-- Jalankan file ini langsung di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. TABEL: STORE SETTINGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'Dimsummentai Mamifayy',
  store_tagline TEXT DEFAULT 'Dimsum Mentai Gurih, Creamy & Ditorch Sempurna',
  store_address TEXT DEFAULT 'Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07',
  admin_phone TEXT DEFAULT '6281234567890',
  qris_holder TEXT DEFAULT 'Dimsummentai Mamifayy',
  qris_bank TEXT DEFAULT 'BCA / QRIS Nasional',
  opening_hours TEXT DEFAULT 'Buka Setiap Hari: 10.00 - 21.00 WIB',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 3. TABEL: PRODUCTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT NOT NULL,
  portions JSONB NOT NULL DEFAULT '[]'::jsonb,
  allowed_toppings JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 4. TABEL: CUSTOMERS (CRM & LOYALTY)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT DEFAULT '123',
  phone TEXT,
  address TEXT DEFAULT '',
  points INTEGER NOT NULL DEFAULT 0,
  redeemed_rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0,
  last_order_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  favorite_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag TEXT NOT NULL DEFAULT 'baru', -- 'baru' | 'loyal' | 'lama_tidak_order'
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- ====================================================================
-- 5. TABEL: ORDERS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT DEFAULT '',
  customer_notes TEXT DEFAULT '',
  delivery_type TEXT NOT NULL DEFAULT 'pickup', -- 'kurir_toko' | 'pickup'
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'qris', -- 'qris' | 'cod'
  payment_status TEXT NOT NULL DEFAULT 'menunggu_pembayaran', -- 'menunggu_pembayaran' | 'lunas'
  status TEXT NOT NULL DEFAULT 'menunggu_konfirmasi',
  items_total INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  voucher_code TEXT DEFAULT '',
  points_used INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 5,
  total_amount INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'website', -- 'website' | 'whatsapp' | 'instagram' | 'outlet'
  admin_notes TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ====================================================================
-- 6. TABEL: ORDER ITEMS (RELASIONAL)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  portion INTEGER NOT NULL,
  topping TEXT DEFAULT '',
  topping_name TEXT DEFAULT '',
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ====================================================================
-- 7. TABEL: OTPS (AUTHENTICATION CODES UNTUK SERVERLESS RESILIENCE)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.otps (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otps_phone_expires ON public.otps(phone, expires_at);

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Policy store_settings
DROP POLICY IF EXISTS "store_settings_public_select" ON public.store_settings;
CREATE POLICY "store_settings_public_select" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "store_settings_all" ON public.store_settings;
CREATE POLICY "store_settings_all" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Policy products
DROP POLICY IF EXISTS "products_public_select" ON public.products;
CREATE POLICY "products_public_select" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_all" ON public.products;
CREATE POLICY "products_all" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Policy customers
DROP POLICY IF EXISTS "customers_public_select" ON public.customers;
CREATE POLICY "customers_public_select" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "customers_public_insert" ON public.customers;
CREATE POLICY "customers_public_insert" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "customers_public_update" ON public.customers;
CREATE POLICY "customers_public_update" ON public.customers FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "customers_service_all" ON public.customers;
CREATE POLICY "customers_service_all" ON public.customers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy orders
DROP POLICY IF EXISTS "orders_public_select" ON public.orders;
CREATE POLICY "orders_public_select" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
CREATE POLICY "orders_public_insert" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "orders_public_update" ON public.orders;
CREATE POLICY "orders_public_update" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_public_delete" ON public.orders;
CREATE POLICY "orders_public_delete" ON public.orders FOR DELETE USING (true);

DROP POLICY IF EXISTS "orders_service_all" ON public.orders;
CREATE POLICY "orders_service_all" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy order_items
DROP POLICY IF EXISTS "order_items_public_select" ON public.order_items;
CREATE POLICY "order_items_public_select" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "order_items_public_insert" ON public.order_items;
CREATE POLICY "order_items_public_insert" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_public_update" ON public.order_items;
CREATE POLICY "order_items_public_update" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_public_delete" ON public.order_items;
CREATE POLICY "order_items_public_delete" ON public.order_items FOR DELETE USING (true);

DROP POLICY IF EXISTS "order_items_service_all" ON public.order_items;
CREATE POLICY "order_items_service_all" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy otps
DROP POLICY IF EXISTS "otps_public_all" ON public.otps;
CREATE POLICY "otps_public_all" ON public.otps FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 9. SEED DATA AWAL (DEFAULT VALUES)
-- ====================================================================

-- Store Settings
INSERT INTO public.store_settings (id, store_name, store_tagline, store_address, admin_phone, qris_holder, qris_bank, opening_hours)
VALUES (
  'default',
  'Dimsummentai Mamifayy',
  'Dimsum Mentai Gurih, Creamy & Ditorch Sempurna',
  'Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07',
  '6281234567890',
  'Dimsummentai Mamifayy',
  'BCA / QRIS Nasional',
  'Buka Setiap Hari: 10.00 - 21.00 WIB'
)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  store_tagline = EXCLUDED.store_tagline,
  store_address = EXCLUDED.store_address,
  admin_phone = EXCLUDED.admin_phone,
  qris_holder = EXCLUDED.qris_holder,
  qris_bank = EXCLUDED.qris_bank,
  opening_hours = EXCLUDED.opening_hours;

-- Products
INSERT INTO public.products (id, name, category, description, image, portions, allowed_toppings, is_available)
VALUES
  (
    'prod-mentai',
    'Dimsum Mentai Spesial Mamifayy',
    'Signature',
    'Dimsum lembut dipadu saus mentai gurih creamy khas Mamifayy yang ditorch hingga harum menggoda.',
    '/images/products/dimsum-mentai.jpg',
    '[{"pcs": 6, "price": 26000}, {"pcs": 8, "price": 34000}, {"pcs": 10, "price": 42000}, {"pcs": 16, "price": 65000}]'::jsonb,
    '[{"id": "original", "name": "Original Mentai", "price": 0}, {"id": "mozzarella", "name": "Extra Keju Mozzarella", "price": 5000}, {"id": "melting", "name": "Extra Keju Melting (Torched)", "price": 6000}]'::jsonb,
    true
  ),
  (
    'prod-ayam',
    'Dimsum Ayam Original Mamifayy',
    'Klasik',
    'Dimsum olahan daging ayam asli padat dan juicy, disajikan dengan saus cocolan asam manis pedas.',
    '/images/products/dimsum-ayam.jpg',
    '[{"pcs": 4, "price": 16000}, {"pcs": 6, "price": 23000}, {"pcs": 8, "price": 30000}, {"pcs": 10, "price": 37000}, {"pcs": 16, "price": 58000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'prod-platter',
    'Mix Platter Party Box',
    'Favorit',
    'Kombinasi lengkap aneka varian dimsum kukus & goreng dengan siraman mentai torch melimpah.',
    '/images/products/mix-platter.jpg',
    '[{"pcs": 8, "price": 35000}, {"pcs": 10, "price": 44000}, {"pcs": 16, "price": 68000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'prod-pangsit',
    'Pangsit Goreng Renyah Mamifayy',
    'Gorengan',
    'Kulit pangsit renyah keemasan dengan isian daging ayam tebal gurih, sangat cocok untuk camilan.',
    '/images/products/pangsit-goreng.jpg',
    '[{"pcs": 4, "price": 14000}, {"pcs": 6, "price": 20000}, {"pcs": 8, "price": 26000}, {"pcs": 10, "price": 32000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'tart-1',
    'PAKET TART 1',
    'Dimsum Tart',
    '8 pcs dimsum mentai spesial berhias pita cantik & lilin mini.',
    '/images/products/tart-1.jpg',
    '[{"pcs": 8, "price": 40000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'tart-2',
    'PAKET TART 2',
    'Dimsum Tart',
    '10 pcs dimsum mentai lezat dengan lelehan saus mentai gurih melimpah.',
    '/images/products/tart-2.jpg',
    '[{"pcs": 10, "price": 50000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'tart-3',
    'PAKET TART 3',
    'Dimsum Tart',
    'Mentai special love bentuk hati eksklusif penuh cinta.',
    '/images/products/tart-3.jpg',
    '[{"pcs": 10, "price": 60000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'tart-4',
    'PAKET TART 4',
    'Dimsum Tart',
    '16 pcs dimsum mentai porsi jumbo untuk perayaan bersama keluarga & teman.',
    '/images/products/tart-4.jpg',
    '[{"pcs": 16, "price": 80000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'tart-5',
    'PAKET TART 5',
    'Dimsum Tart',
    'Mentai special cake bertingkat estetik pengganti kue ulang tahun biasa.',
    '/images/products/tart-5.jpg',
    '[{"pcs": 14, "price": 75000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'platter-reguler',
    'MIX PLATTER REGULER',
    'Dimsum Tart',
    'Mentai isi 2, dimsum ori 3, pangsit crispy 4.',
    '/images/products/platter-reguler.jpg',
    '[{"pcs": 9, "price": 30000}]'::jsonb,
    '[]'::jsonb,
    true
  ),
  (
    'platter-large',
    'MIX PLATTER LARGE',
    'Dimsum Tart',
    '6 pcs dimsum mentai, pangsit selimut, dimsum ori 3, pangsit goreng 3.',
    '/images/products/platter-large.jpg',
    '[{"pcs": 14, "price": 55000}]'::jsonb,
    '[]'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Customers
INSERT INTO public.customers (id, name, password, phone, address, points, redeemed_rewards, total_orders, total_spent, last_order_date, favorite_items, tag, notes)
VALUES
  (
    'cust-1',
    'Siti Rahma',
    '123',
    '6281298765432',
    'Jl. Melati No. 14, RT 02/05, Kebon Jeruk',
    280,
    '[]'::jsonb,
    4,
    168000,
    NOW() - INTERVAL '2 days',
    '["Dimsum Mentai Spesial (isi 10)", "Extra Keju Melting"]'::jsonb,
    'loyal',
    'Pelanggan setia, suka extra torch mentai gurih.'
  ),
  (
    'cust-2',
    'Budi Santoso',
    '123',
    '6285712345678',
    'Komplek Permata Blok B3 No. 8',
    150,
    '[]'::jsonb,
    2,
    86000,
    NOW() - INTERVAL '20 days',
    '["Mix Platter Party Box (isi 8)"]'::jsonb,
    'lama_tidak_order',
    'Sudah >14 hari belum order lagi. Perlu disapa promo akhir pekan!'
  ),
  (
    'cust-3',
    'Amanda Putri',
    '123',
    '6281355554321',
    'Jl. Kemang Raya No. 45, Jaksel',
    100,
    '[]'::jsonb,
    1,
    39000,
    NOW() - INTERVAL '1 days',
    '["Dimsum Ayam Original (isi 6)"]'::jsonb,
    'baru',
    'Order perdana via web Instagram bio.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Orders
INSERT INTO public.orders (
  id, order_number, customer_name, customer_phone, customer_address, customer_notes,
  delivery_type, delivery_fee, payment_method, payment_status, status,
  items_total, discount_amount, voucher_code, points_used, points_earned, total_amount, channel,
  items, created_at, updated_at
)
VALUES
  (
    'ord-101',
    'MF-261102-001',
    'Siti Rahma',
    '6281298765432',
    'Jl. Melati No. 14, RT 02/05, Kebon Jeruk',
    'Pagar warna hitam, titip satpam jika tidak ada orang',
    'kurir_toko',
    10000,
    'qris',
    'lunas',
    'selesai',
    48000,
    0,
    '',
    0,
    5,
    58000,
    'website',
    '[{"id": "item-1", "productId": "prod-mentai", "productName": "Dimsum Mentai Spesial Mamifayy", "portion": 10, "topping": "melting", "toppingName": "Extra Keju Melting (Torched)", "unitPrice": 48000, "quantity": 1, "subtotal": 48000}]'::jsonb,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'ord-102',
    'MF-261102-002',
    'Dimas Kurniawan',
    '6281987654321',
    'Jl. Anggrek No. 12 (Dekat Alfamart)',
    'Minta saus mentai jangan terlalu gosong ya min',
    'kurir_toko',
    0,
    'cod',
    'menunggu_pembayaran',
    'menunggu_konfirmasi',
    98000,
    5000,
    'POIN5K',
    5,
    10,
    93000,
    'website',
    '[{"id": "item-2", "productId": "prod-mentai", "productName": "Dimsum Mentai Spesial Mamifayy", "portion": 8, "topping": "mozzarella", "toppingName": "Extra Keju Mozzarella", "unitPrice": 39000, "quantity": 2, "subtotal": 78000}, {"id": "item-3", "productId": "prod-pangsit", "productName": "Pangsit Goreng Renyah Mamifayy", "portion": 6, "topping": "original", "toppingName": "Original Crispy", "unitPrice": 20000, "quantity": 1, "subtotal": 20000}]'::jsonb,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Order Items
INSERT INTO public.order_items (id, order_id, product_id, product_name, portion, topping, topping_name, unit_price, quantity, subtotal)
VALUES
  ('item-1', 'ord-101', 'prod-mentai', 'Dimsum Mentai Spesial Mamifayy', 10, 'melting', 'Extra Keju Melting (Torched)', 48000, 1, 48000),
  ('item-2', 'ord-102', 'prod-mentai', 'Dimsum Mentai Spesial Mamifayy', 8, 'mozzarella', 'Extra Keju Mozzarella', 39000, 2, 78000),
  ('item-3', 'ord-102', 'prod-pangsit', 'Pangsit Goreng Renyah Mamifayy', 6, 'original', 'Original Crispy', 20000, 1, 20000)
ON CONFLICT (id) DO NOTHING;
