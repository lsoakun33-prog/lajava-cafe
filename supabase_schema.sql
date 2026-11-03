-- ====================================================================
-- LA JAVA CAFE & RESTO — POSTGRESQL SCHEMA FOR SUPABASE
-- Generated for Production Deployment (Vercel + Render + Supabase)
-- ====================================================================

-- 1. Enable UUID Extension (Optional utility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if needed (Clean rebuild)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS waiter_calls CASCADE;

-- 3. Create Tables
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  is_available INTEGER DEFAULT 1,
  prep_time INTEGER DEFAULT 15,
  stock INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
  id TEXT PRIMARY KEY,
  table_number TEXT UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'AVAILABLE',
  qr_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  table_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_notes TEXT,
  status TEXT DEFAULT 'PENDING',
  payment_method TEXT DEFAULT 'CASHIER',
  payment_status TEXT DEFAULT 'UNPAID',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  cancel_reason TEXT,
  table_token TEXT,
  device_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

CREATE TABLE waiter_calls (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  call_type TEXT NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for lightning fast queries
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_orders_device_id ON orders(device_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_waiter_calls_status ON waiter_calls(status);

-- ====================================================================
-- SEED DATA (Imported from SQLite)
-- ====================================================================

-- 1. Users (1 records)
INSERT INTO users (id, username, password, name, role) VALUES ('usr_admin_01', 'admin', '$2b$10$WWytNVbySvK5KqDZLpTWQOYaxJMQryWG11sU9Z4.Y2PmCi7wgj7A2', 'Head Administrator', 'admin') ON CONFLICT (id) DO NOTHING;

-- 2. Categories (9 records)
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_signature_coffee', 'Signature & Seasonal Coffee', 'signature-coffee', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_classic_coffee', 'Classic & Manual Brew', 'classic-coffee', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_milk_blended', 'Milk Based & Blended', 'milk-blended', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_tea_refresher', 'Tea, Mocktail & Juice', 'tea-refresher', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_rice_main', 'Rice Selection & Nasi Goreng', 'rice-main', 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_chinese_noodle', 'Chinese Food & Indomie', 'chinese-noodle', 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_family_style', 'Family Style (Sharing)', 'family-style', 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_snack_salad', 'Snacks, Salad & Bubur', 'snack-salad', 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('cat_dessert_beer', 'Ice Cream & Beer', 'dessert-beer', 9) ON CONFLICT (id) DO NOTHING;

-- 3. Tables (12 records)
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_1', 'Meja 01', 2, 'AVAILABLE', 'qr_token_1_1792083540134') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_2', 'Meja 02', 2, 'AVAILABLE', 'qr_token_2_1792083540134') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_3', 'Meja 03', 2, 'AVAILABLE', 'qr_token_3_1792083540134') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_4', 'Meja 04', 2, 'AVAILABLE', 'qr_token_4_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_5', 'Meja 05', 4, 'AVAILABLE', 'qr_token_5_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_6', 'Meja 06', 4, 'AVAILABLE', 'qr_token_6_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_7', 'Meja 07', 4, 'AVAILABLE', 'qr_token_7_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_8', 'Meja 08', 4, 'AVAILABLE', 'qr_token_8_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_9', 'Meja 09', 4, 'AVAILABLE', 'qr_token_9_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_10', 'Meja 10', 4, 'AVAILABLE', 'qr_token_10_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_vip1', 'VIP Room 01', 8, 'AVAILABLE', 'qr_token_vip1_1792083540135') ON CONFLICT (id) DO NOTHING;
INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES ('tbl_3a2a307d', 'Meja 11', 4, 'AVAILABLE', 'qr_6911d6cd-38e') ON CONFLICT (id) DO NOTHING;

-- 4. Menu Items (191 records)
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_seas_01', 'cat_signature_coffee', 'Butterscotch Latte', 'Espresso and milk blended with sweet butterscotch and buttery caramel flavors.', 35000, '', 1, 5, 47) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_seas_02', 'cat_signature_coffee', 'Mont Blanc', 'Refreshing coffee with bright citrus notes, finished with velvety vanilla cream.', 38000, '', 1, 6, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_seas_03', 'cat_signature_coffee', 'Dirty Latte', 'Chilled milk layered with a rich espresso shot.', 30000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_01', 'cat_signature_coffee', 'Amber Drip', 'Smooth honey sweetness, bright citrus, clean espresso finish.', 30000, '', 1, 5, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_02', 'cat_signature_coffee', 'Midnight Citrus', 'Bright citrus with delicate floral hints and a clean coffee finish.', 35000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_03', 'cat_signature_coffee', 'Tropic Noir', 'Fresh orange notes, smooth coconut, rich espresso body.', 33000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_04', 'cat_signature_coffee', 'Kyoto Cooler', 'Citrus-bright with soft honey sweetness, floral aroma, and a mellow cold brew base.', 30000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_05', 'cat_signature_coffee', 'Honeyburn', 'Spiced warmth, citrus brightness, earthy coffee tones, herbaceous hints, and a subtle heat.', 30000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_06', 'cat_signature_coffee', 'Sweet Shock', 'Sweet tropical candy, crisp apple, bubble gum-like notes, and a zesty finish.', 30000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_07', 'cat_signature_coffee', 'Bright Black', 'Deep espresso punch, fizzy citrus, smooth vanilla, and a refreshing sparkle.', 35000, '', 1, 5, 49) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sig_08', 'cat_signature_coffee', 'Island Kick', 'Pineapple sweetness, coconut roundness, tangy lemon, and a bold coffee backbone.', 30000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bar_01', 'cat_signature_coffee', 'Berry Cold Brew', 'Fermented arabica coffee, mix with blueberry flavor.', 27000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bar_02', 'cat_signature_coffee', 'Salt Caramond', 'Salted caramel, almond, hint of himalayan salt & nuts.', 30000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bar_03', 'cat_signature_coffee', 'Pink Berries', 'Coconut milk, rum, hint of lemon & citrus, blueberry.', 28000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bar_04', 'cat_signature_coffee', 'Fantasy Island', 'Coffee with the freshness of lychee, hint of citrus & lemon.', 35000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bar_05', 'cat_signature_coffee', 'Lemonade On The Rock', 'Double shots espresso with lemon flavor.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bar_06', 'cat_signature_coffee', 'Tropical Summer', 'Coffee with soda, mint, lemon and hint of caramel.', 30000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_01', 'cat_classic_coffee', 'Espresso', 'Ekstraksi kopi murni dengan aroma pekat dan krema tebal keemasan.', 15000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_02', 'cat_classic_coffee', 'Double Espresso', 'Dua shot espresso murni pekat untuk suntikan kafein maksimal.', 20000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_03', 'cat_classic_coffee', 'Flatwhite', 'Espresso pekat berpadu steamed milk dengan microfoam ekstra halus.', 25000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_04', 'cat_classic_coffee', 'Macchiato', 'Espresso kaya rasa dengan sentuhan lembut busa susu di atasnya.', 25000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_05', 'cat_classic_coffee', 'Piccolo', 'Ristretto shot dengan rasio steamed milk seimbang dalam gelas kecil.', 25000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_06', 'cat_classic_coffee', 'Split (Espresso + Cappuccino)', 'Satu shot single espresso dinikmati berdampingan dengan satu cangkir cappuccino.', 35000, '', 1, 6, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_07', 'cat_classic_coffee', 'Cappuccino (Regular)', 'Espresso berpadu susu hangat dengan lapisan busa susu tebal dan taburan kakao.', 25000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_08', 'cat_classic_coffee', 'Cappuccino (Large)', 'Cappuccino porsi besar nikmat hangat atau dingin.', 30000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_09', 'cat_classic_coffee', 'Americano (Regular)', 'Espresso kaya rasa yang diencerkan dengan air panas atau dingin segar.', 20000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_10', 'cat_classic_coffee', 'Americano (Large)', 'Americano ukuran besar penyegar hari.', 25000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_11', 'cat_classic_coffee', 'Latte (Regular)', 'Kombinasi klasik espresso lembut dan susu steamed hangat dengan latte art.', 25000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_cls_12', 'cat_classic_coffee', 'Latte (Large)', 'Caffe latte ukuran besar lembut memanjakan lidah.', 30000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_01', 'cat_classic_coffee', 'V60', 'Seduhan manual pour-over V60 dengan biji kopi single origin pilihan berkarakter bersih dan kompleks.', 27000, '', 1, 7, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_02', 'cat_classic_coffee', 'Vietnam Dripp', 'Seduhan kopi tetes tradisional khas Vietnam berpadu manis legitnya susu kental manis.', 20000, '', 1, 6, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_03', 'cat_classic_coffee', 'Kalita Wave', 'Pour-over dengan flat-bottom Kalita Wave untuk ekstraksi kopi yang merata, manis, dan seimbang.', 27000, '', 1, 7, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_04', 'cat_classic_coffee', 'V60 Japanese Iced', 'Metode pour-over V60 dingin langsung menetes ke es batu untuk mengunci aroma buah dan kesegaran.', 27000, '', 1, 7, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_01', 'cat_classic_coffee', 'La Java Kopi', 'Kopi hitam otentik khas racikan barista La Java. (Regular: 15K | Large: 20K)', 15000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_02', 'cat_classic_coffee', 'La Java Kopi Susu', 'Kopi susu signature La Java yang creamy, gurih, dan legit pas. (Regular: 18K | Large: 23K)', 18000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_03', 'cat_classic_coffee', 'Palm Sugar Latte', 'Espresso berpadu susu segar dan manis alami gula aren murni. (Regular: 20K | Large: 25K)', 20000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_04', 'cat_classic_coffee', 'Coconut Coffee', 'Sensasi unik kopi berpadu gurihnya air kelapa segar dan susu. (Regular: 20K | Large: 25K)', 20000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_05', 'cat_classic_coffee', 'Java Creamy Latte', 'Latte lembut ekstra creamy dengan sentuhan manis lembut khas Jawa. (Regular: 20K | Large: 25K)', 20000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_06', 'cat_classic_coffee', 'Kopi Rum', 'Kopi susu dengan aroma rum yang wangi dan menggoda (Non-Alkohol). (Regular: 23K | Large: 28K)', 23000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_07', 'cat_classic_coffee', 'Cold Brew Black', 'Seduhan kopi dingin selama 18 jam, rasa halus tanpa asam berlebih. (Regular: 23K | Large: 28K)', 23000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_08', 'cat_classic_coffee', 'Cold Brew Milk', 'Cold brew kopi dipadukan dengan susu segar manis creamy. (Regular: 27K | Large: 32K)', 27000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_09', 'cat_classic_coffee', 'Kopi Rum Oreo / Regal', 'Kopi rum dipadukan topping biskuit oreo atau regal renyah. (Regular: 25K | Large: 30K)', 25000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_10', 'cat_classic_coffee', 'Mocha Latte', 'Perpaduan seimbang espresso pekat, cokelat premium, dan susu creamy. (Regular: 30K | Large: 37K)', 30000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_sfy_11', 'cat_classic_coffee', 'Seasalt / Hazelnut Latte', 'Latte dengan sentuhan gurih seasalt atau harum manis hazelnut. (Regular: 30K | Large: 37K)', 30000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_001', 'cat_milk_blended', 'Thai Tea', 'Teh Thailand otentik dengan aroma rempah khas dan susu kental manis legit. (Regular: 18K | Large: 25K)', 18000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_002', 'cat_milk_blended', 'Rum Oreo', 'Susu segar creamy dengan aroma rum (non-alkohol) dan taburan remah Oreo. (Regular: 20K | Large: 25K)', 20000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_003', 'cat_milk_blended', 'Rum Regal', 'Susu segar beraroma rum harum berpadu biskuit Marie Regal manis lembut. (Regular: 25K | Large: 25K)', 25000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_004', 'cat_milk_blended', 'Greentea Matcha', 'Matcha hijau jepang berkualitas dengan susu segar creamy harum. (Regular: 25K | Large: 30K)', 25000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_005', 'cat_milk_blended', 'Taro Milk', 'Minuman talas ungu manis lembut berpadu susu creamy memanjakan lidah. (Regular: 25K | Large: 30K)', 25000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_006', 'cat_milk_blended', 'Red Velvet', 'Minuman red velvet gurih manis beraroma cokelat vanila lembut. (Regular: 25K | Large: 30K)', 25000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_007', 'cat_milk_blended', 'Chocolate Milk', 'Cokelat pekat pilihan diseduh dengan susu segar kaya rasa. (Regular: 25K | Large: 30K)', 25000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_008', 'cat_milk_blended', 'Seasalt Choco', 'Cokelat kaya rasa dengan krim gurih seasalt yang kontras nikmat. (Regular: 27K | Large: 32K)', 27000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mb_009', 'cat_milk_blended', 'Hazelnut Choco', 'Cokelat berpadu gurih dan harumnya kacang hazelnut panggang. (Regular: 27K | Large: 32K)', 27000, '', 1, 5, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bld_01', 'cat_milk_blended', 'Mango Cheesecake Blend', 'Es blend buah mangga manis berpadu gurih krim keju cheesecake lembut.', 30000, '', 1, 6, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bld_02', 'cat_milk_blended', 'Chocolate Blend', 'Cokelat pekat di-blend halus dengan es dingin segar bertabur choco crunch.', 25000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bld_03', 'cat_milk_blended', 'Cookies and Cream Blend', 'Susu vanilla manis berpadu renyahnya biskuit Oreo diblend hingga creamy.', 30000, '', 1, 6, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bld_04', 'cat_milk_blended', 'Strawberry Cheesecake Blend', 'Sensasi asam manis strawberry segar berpadu gurihnya keju cheesecake lembut.', 30000, '', 1, 6, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bld_05', 'cat_milk_blended', 'Greentea Blend', 'Matcha hijau aromatik di-blend creamy dingin dengan sensasi manis menyegarkan.', 28000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_bld_06', 'cat_milk_blended', 'Blonde Regal Blend', 'Susu vanilla manis berpadu renyah lembut biskuit Marie Regal legendaris.', 28000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_01', 'cat_tea_refresher', 'Sunset Bliss', 'Mocktail buah tropis segar berwarna gradasi jingga sunset yang manis dan menyegarkan.', 28000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_02', 'cat_tea_refresher', 'Lemonade', 'Minuman perasan lemon asli segar dingin pelepas dahaga.', 22000, '', 1, 3, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_03', 'cat_tea_refresher', 'Lemon Squash', 'Perasan lemon segar berpadu soda berkarbonasi dingin yang menggugah selera.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_04', 'cat_tea_refresher', 'Strawberry Mint Mojito', 'Perpaduan strawberry asli manis, daun mint segar, perasan jeruk nipis, dan sparkling soda.', 25000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_05', 'cat_tea_refresher', 'Green Lantern', 'Minuman segar hijau cerah dengan sensasi melon, mint, dan soda dingin.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_06', 'cat_tea_refresher', 'Leci Mint Mojito', 'Buah leci utuh segar dengan daun mint dingin dan sensasi sparkling soda.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_mkt_07', 'cat_tea_refresher', 'Summer Breeze', 'Mocktail citrus mangga segar yang membawa nuansa musim panas tropis ceria.', 28000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_01', 'cat_tea_refresher', 'Lychee Tea', 'Teh melati dingin dengan sirup buah leci manis harum dan buah leci utuh.', 23000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_02', 'cat_tea_refresher', 'Peach Strawberry Tea', 'Perpaduan manis teh buah persik dan asam segar strawberry dingin.', 23000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_03', 'cat_tea_refresher', 'Magical Lemonade Tea', 'Teh bunga telang ungu dengan sari lemon segar yang berubah warna memikat.', 23000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_04', 'cat_tea_refresher', 'Lemon Tea', 'Teh segar dengan perasan jeruk lemon asli nikmat dingin atau hangat.', 15000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_05', 'cat_tea_refresher', 'Lemongrass Tea', 'Teh serai aromatik menenangkan disajikan hangat atau dingin.', 15000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_06', 'cat_tea_refresher', 'Passion Fruit Tea', 'Teh rasa buah markisa segar asam manis menyegarkan.', 23000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_07', 'cat_tea_refresher', 'Lychee Strawberry Tea', 'Kombinasi teh buah leci manis dan strawberry harum dingin.', 23000, '', 1, 4, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_08', 'cat_tea_refresher', 'Peach Tea', 'Teh buah persik manis segar pelepas dahaga.', 23000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_09', 'cat_tea_refresher', 'Mango Tea', 'Teh wangi dengan sentuhan rasa buah mangga tropis manis.', 23000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tea_10', 'cat_tea_refresher', 'Original Tea (Es / Hangat)', 'Seduhan teh melati klasik wangi khas Jawa disajikan manis atau tawar.', 10000, '', 1, 2, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tpot_01', 'cat_tea_refresher', 'Butterfly Pea Tea (Teapot Refill)', 'Seduhan teh bunga telang ungu dalam teko kaca elegan, bisa refill air panas.', 20000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tpot_02', 'cat_tea_refresher', 'Chamomile Tea (Teapot Refill)', 'Teh bunga chamomile harum menenangkan untuk relaksasi tubuh dan pikiran.', 20000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tpot_03', 'cat_tea_refresher', 'Ginger Tea (Teapot Refill)', 'Seduhan teh jahe hangat menyehatkan tubuh dengan aroma pedas rempah alami.', 20000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tpot_04', 'cat_tea_refresher', 'Peppermint Tea (Teapot Refill)', 'Teh daun mint segar dingin melegakan tenggorokan dalam teko hangat.', 20000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tpot_05', 'cat_tea_refresher', 'Oolong Tea (Teapot Refill)', 'Teh oolong premium bercita rasa khas oriental yang kaya antioksidan.', 20000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_tpot_06', 'cat_tea_refresher', 'Jasmine Greentea (Teapot Refill)', 'Teh hijau melati wangi lembut disajikan dalam teko teh hangat.', 20000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_01', 'cat_tea_refresher', 'Mango Juice', 'Jus buah mangga segar murni manis kental menyegarkan.', 25000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_02', 'cat_tea_refresher', 'Pineapple Juice', 'Jus buah nanas manis asam segar kaya vitamin C.', 25000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_03', 'cat_tea_refresher', 'Dragonfruit Juice', 'Jus buah naga merah segar alami kaya serat dan antioksidan.', 25000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_04', 'cat_tea_refresher', 'Watermelon Juice', 'Jus semangka merah segar manis alami penghilang dahaga nomor satu.', 25000, '', 1, 5, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_05', 'cat_tea_refresher', 'Mineral Water 600ml', 'Air mineral kemasan botol higienis dan menyegarkan.', 10000, '', 1, 1, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_06', 'cat_tea_refresher', 'Lime Water', 'Air perasan jeruk nipis segar dingin kaya vitamin.', 10000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_07', 'cat_tea_refresher', 'Lemon Water', 'Air perasan lemon segar murni dingin.', 15000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_08', 'cat_tea_refresher', 'Air Hangat', 'Air putih hangat bersih higienis.', 5000, '', 1, 1, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_jce_09', 'cat_tea_refresher', 'Air Es', 'Air putih dingin dengan es batu segar.', 5000, '', 1, 1, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_01', 'cat_rice_main', 'Nasi Brokoli Ca Sapi', 'Nasi putih disajikan dengan tumis brokoli renyah dan irisan daging sapi empuk saus gurih.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_02', 'cat_rice_main', 'Nasi Brokoli Ca Ayam', 'Nasi putih dengan tumis brokoli segar dan potongan ayam empuk gurih.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_03', 'cat_rice_main', 'Nasi Cumi Saus Padang', 'Nasi putih dengan olahan cumi segar saus padang kaya rempah pedas manis gurih.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_04', 'cat_rice_main', 'Nasi Cumi Saus Mentega', 'Nasi putih dengan cumi empuk saus mentega gurih harum berbalut bawang bombay.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_05', 'cat_rice_main', 'Nasi Brokoli Ca Bawang Putih', 'Nasi putih dengan tumisan brokoli segar bertabur bawang putih wangi.', 30000, '', 1, 10, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_06', 'cat_rice_main', 'Nasi Ayam Kecap', 'Nasi putih dengan ayam fillet empuk masak kecap manis gurih rempah pilihan.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_07', 'cat_rice_main', 'Nasi Ayam Lada Hitam', 'Nasi putih dengan tumisan ayam saus lada hitam pedas aromatik disajikan dengan telur.', 35000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_08', 'cat_rice_main', 'Nasi Sapi Lada Hitam', 'Nasi putih dengan irisan daging sapi empuk berbalut saus lada hitam mantap.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_09', 'cat_rice_main', 'Nasi Ayam Mentega', 'Nasi putih dengan ayam saus mentega gurih manis harum dan telur dadar.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_10', 'cat_rice_main', 'Nasi Ayam Geprek', 'Nasi putih dengan ayam renyah digeprek sambal pedas mantap dan telur ceplok.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_11', 'cat_rice_main', 'Nasi Ayam Teriyaki', 'Nasi putih dengan ayam saus teriyaki gurih manis khas Jepang dan telur dadar.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_12', 'cat_rice_main', 'Nasi Ayam Sechuan', 'Nasi putih dengan ayam saus sechuan bercita rasa pedas gurih oriental.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_13', 'cat_rice_main', 'Nasi Sapi Kecap', 'Nasi putih disajikan bersama daging sapi empuk masak bumbu kecap gurih.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_14', 'cat_rice_main', 'Nasi Sapi Sechuan', 'Nasi putih dengan irisan daging sapi empuk saus sechuan pedas nikmat.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_15', 'cat_rice_main', 'Nasi Ayam Asam Manis', 'Nasi putih dengan ayam fillet krispi berlumur saus asam manis segar.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_16', 'cat_rice_main', 'Nasi Ayam Saus Tiram', 'Nasi putih dengan ayam empuk bersaus tiram kental gurih aromatik.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_17', 'cat_rice_main', 'Nasi Ayam Rica-Rica', 'Nasi putih dengan ayam bumbu rica-rica pedas rempah nusantara.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_18', 'cat_rice_main', 'Nasi Udang Saus Mentega', 'Nasi putih dengan udang segar berbalut saus mentega gurih harum.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_19', 'cat_rice_main', 'Nasi Udang Saus Padang', 'Nasi putih dengan udang empuk bumbu saus padang pedas gurih kaya rempah.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_20', 'cat_rice_main', 'Nasi Sapi Rica-Rica', 'Nasi putih dengan daging sapi empuk saus rica-rica pedas menggugah selera.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_21', 'cat_rice_main', 'Nasi Sapi Saus Tiram', 'Nasi putih disajikan dengan irisan daging sapi saus tiram kaya rasa.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_22', 'cat_rice_main', 'Nasi Cumi Saus Tiram', 'Nasi putih dengan cumi segar olahan saus tiram gurih.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_23', 'cat_rice_main', 'Nasi Cumi Asam Manis', 'Nasi putih dengan cumi segar bersaus asam manis lezat.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_rc_24', 'cat_rice_main', 'Nasi Cumi Rica-Rica', 'Nasi putih dengan cumi bumbu rica-rica pedas gurih sedap.', 45000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ng_01', 'cat_rice_main', 'Nasi Goreng Mawut', 'Ayam fillet, mie kuning, telur, bakso sapi, daun bawang, wortel, kubis, toge, dan kerupuk.', 35000, '', 1, 12, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ng_02', 'cat_rice_main', 'Nasi Goreng Hongkong', 'Ayam fillet, telur, sosis sapi, bakso sapi, udang cacah, mix vegetable, slice telur dadar, dan kerupuk.', 35000, '', 1, 12, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ng_03', 'cat_rice_main', 'Nasi Goreng Mentega', 'Nasi goreng harum mentega dengan mix vegetable, chicken popcorn renyah, dan telur ceplok.', 35000, '', 1, 12, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ng_04', 'cat_rice_main', 'Nasi Goreng Spesial', 'Ayam fillet, telur, bakso sapi, daun bawang, telur ceplok, dan kerupuk renyah.', 35000, '', 1, 12, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ng_05', 'cat_rice_main', 'Nasi Goreng Seafood', 'Cumi, udang segar, bakso ikan, telur campur, daun bawang, dan kerupuk renyah.', 40000, '', 1, 15, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_01', 'cat_chinese_noodle', 'Bihun Goreng Ayam', 'Bihun goreng oriental dengan suwiran ayam, sayuran segar, dan bumbu gurih harum.', 35000, '', 1, 12, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_02', 'cat_chinese_noodle', 'Bihun Goreng Seafood', 'Bihun goreng oriental dengan udang, cumi segar, dan bakso ikan gurih sedap.', 40000, '', 1, 15, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_03', 'cat_chinese_noodle', 'Mie Goreng Ayam', 'Mie goreng kenyal bertabur ayam empuk, telur, dan sayuran dengan bumbu oriental sedap.', 35000, '', 1, 12, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_04', 'cat_chinese_noodle', 'Mie Goreng Seafood', 'Mie goreng lezat dengan udang, cumi segar, dan bakso ikan gurih nikmat.', 40000, '', 1, 15, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_05', 'cat_chinese_noodle', 'Kwetiaw Goreng Ayam', 'Kwetiaw goreng harum aroma wokhei dengan potongan ayam lezat dan telur.', 35000, '', 1, 12, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_06', 'cat_chinese_noodle', 'Kwetiaw Goreng Seafood', 'Kwetiaw goreng seafood gurih dengan udang, cumi, dan sayuran hijau segar.', 40000, '', 1, 15, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_07', 'cat_chinese_noodle', 'Kwetiaw Siram Ayam', 'Kwetiaw kenyal disiram kuah kental telur gurih berisi irisan ayam empuk.', 35000, '', 1, 15, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_08', 'cat_chinese_noodle', 'Kwetiaw Siram Seafood', 'Kwetiaw disiram kuah kental telur gurih dengan udang dan cumi segar.', 40000, '', 1, 15, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_09', 'cat_chinese_noodle', 'Mie / Bihun Godog', 'Mie atau bihun kuah berkaldu gurih hangat disajikan dengan telur dan sayuran segar.', 35000, '', 1, 12, 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_10', 'cat_chinese_noodle', 'Nasi Mapo Tahu', 'Nasi putih dengan tahu sutra lembut saus mapo pedas gurih manis khas oriental.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_11', 'cat_chinese_noodle', 'Nasi Capcay Ayam', 'Nasi putih disiram aneka sayuran capcay segar kuah kental dengan potongan ayam.', 35000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_12', 'cat_chinese_noodle', 'Nasi Capcay Seafood', 'Nasi putih disiram capcay kuah kental gurih berpadu udang segar dan cumi empuk.', 40000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_chn_13', 'cat_chinese_noodle', 'Nasi Mun Tahu', 'Nasi putih dengan mun tahu sutra cincang kuah telur lembut bertabur daun bawang wangi.', 40000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_idm_01', 'cat_chinese_noodle', 'Indomie Kuah (Level 1/2/3)', 'Indomie kuah hangat gurih dengan sayuran segar, bisa pilih tingkat kepedasan Level 1/2/3.', 15000, '', 1, 8, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_idm_02', 'cat_chinese_noodle', 'Indomie Goreng (Level 1/2/3)', 'Indomie goreng klasik disajikan dengan telur mata sapi dan sayuran, level pedas 1/2/3.', 15000, '', 1, 8, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_idm_03', 'cat_chinese_noodle', 'Indomie Kuah Susu (Level 1/2/3)', 'Indomie kuah dengan kuah susu creamy gurih berpadu rempah nikmat, level 1/2/3.', 22000, '', 1, 8, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_idm_04', 'cat_chinese_noodle', 'Indomie Kuah Susu Keju (Level 1/2/3)', 'Indomie kuah susu ekstra creamy bertabur parutan keju melimpah, level pedas 1/2/3.', 25000, '', 1, 8, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_idm_05', 'cat_chinese_noodle', 'Indomie Jumbo Goreng/Kuah (Level 1/2/3)', 'Porsi jumbo Indomie (goreng/kuah) lebih puas dan mengenyangkan, level 1/2/3.', 18000, '', 1, 8, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_idm_06', 'cat_chinese_noodle', 'Extra Telur (Topping)', 'Tambahan telur ceplok / dadar / rebus sesuai selera.', 5000, '', 1, 3, 99) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_01', 'cat_family_style', 'Brokoli Bawang Putih (Sharing)', 'Porsi sharing brokoli segar ditumis renyah beraroma bawang putih wangi gurih.', 45000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_02', 'cat_family_style', 'Brokoli Sapi (Sharing)', 'Porsi sharing tumisan brokoli hijau berpadu irisan daging sapi empuk saus gurih.', 60000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_03', 'cat_family_style', 'Capcay Seafood (Sharing)', 'Porsi sharing aneka sayuran segar lengkap dimasak dengan udang, cumi, dan bakso ikan.', 60000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_04', 'cat_family_style', 'Capcay Ayam (Sharing)', 'Porsi sharing aneka sayuran capcay segar berpadu potongan daging ayam lezat.', 50000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_05', 'cat_family_style', 'Mie Goreng Seafood (Sharing)', 'Porsi besar mie goreng seafood cocok untuk santap bersama keluarga.', 65000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_06', 'cat_family_style', 'Mie Goreng Ayam (Sharing)', 'Porsi besar mie goreng ayam gurih manis oriental untuk dinikmati bersama.', 55000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_07', 'cat_family_style', 'Brokoli Ayam (Sharing)', 'Porsi sharing tumis brokoli renyah dengan potongan daging ayam empuk.', 50000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_08', 'cat_family_style', 'Ayam Mentega (Sharing)', 'Porsi sharing ayam goreng saus mentega harum gurih bertabur bawang bombay.', 55000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_09', 'cat_family_style', 'Sapi Lada Hitam (Sharing)', 'Porsi sharing daging sapi empuk lada hitam pedas aromatik khas chef La Java.', 80000, '', 1, 18, 20) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_10', 'cat_family_style', 'Ayam Lada Hitam (Sharing)', 'Porsi sharing ayam empuk bersaus lada hitam gurih pedas hangat.', 55000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_11', 'cat_family_style', 'Ayam Nanking (Sharing)', 'Porsi sharing olahan ayam cincang goreng khas nanking dengan saus asam manis gurih.', 55000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_12', 'cat_family_style', 'Bistik Sapi (Sharing)', 'Porsi sharing bistik daging sapi empuk disajikan dengan kentang, wortel, dan buncis saus manis gurih.', 60000, '', 1, 20, 20) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_13', 'cat_family_style', 'Udang/Cumi Goreng Tepung (Sharing)', 'Porsi sharing cumi dan udang goreng tepung renyah keemasan dengan saus cocolan.', 65000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_14', 'cat_family_style', 'Ayam Asam Manis / Rica / Tiram (Sharing)', 'Porsi sharing ayam empuk dengan pilihan saus asam manis, rica-rica pedas, atau saus tiram.', 55000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_15', 'cat_family_style', 'Udang/Cumi Asam Manis / Rica / Tiram (Sharing)', 'Porsi sharing seafood udang & cumi dengan pilihan saus asam manis, rica pedas, atau saus tiram.', 65000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_16', 'cat_family_style', 'Udang/Cumi Saus Padang / Mentega (Sharing)', 'Porsi sharing udang & cumi dengan pilihan bumbu saus padang pedas atau saus mentega harum.', 65000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_17', 'cat_family_style', 'Sapi Rica-Rica / Saus Tiram (Sharing)', 'Porsi sharing daging sapi premium empuk dengan bumbu rica-rica pedas atau saus tiram kental.', 80000, '', 1, 20, 20) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_18', 'cat_family_style', 'Sapo Tahu Ayam (Sharing)', 'Porsi sharing sapo tahu jepang sutra dengan potongan ayam, sayuran, dan kuah kental gurih.', 55000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_19', 'cat_family_style', 'Sapo Tahu Seafood (Sharing)', 'Porsi sharing sapo tahu sutra dengan udang, cumi, sayuran segar, dan kuah kental sedap.', 65000, '', 1, 18, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_20', 'cat_family_style', 'Fu Yung Hai (Sharing)', 'Telur dadar tebal khas oriental isi daging & sayuran berbalut saus asam manis lezat dengan kacang polong.', 40000, '', 1, 15, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_21', 'cat_family_style', 'Ayam Teriyaki (Sharing)', 'Porsi sharing ayam fillet saus teriyaki gurih manis khas oriental.', 55000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_22', 'cat_family_style', 'Tauge Ca Ikan Asin (Sharing)', 'Porsi sharing tauge segar ditumis renyah berpadu gurihnya ikan asin pilihan.', 30000, '', 1, 10, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_23', 'cat_family_style', 'Soup Jagung (Sharing)', 'Sup jagung manis kental gurih hangat bertabur telur serabut lembut.', 30000, '', 1, 12, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_fam_24', 'cat_family_style', 'Mun Tahu (Sharing)', 'Porsi sharing tahu sutra cincang lembut kuah gurih bertabur daun bawang.', 55000, '', 1, 15, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_01', 'cat_snack_salad', 'Egg Garden Salad', 'Salad sayuran segar dengan telur rebus, kubis ungu, wortel serut, timun, dan dressing spesial.', 35000, '', 1, 8, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_02', 'cat_snack_salad', 'Chicken Garden Salad', 'Salad sayur segar dengan potongan dada ayam panggang, jagung manis, kubis ungu, dan saus gurih.', 40000, '', 1, 10, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_03', 'cat_snack_salad', 'Bubur Ubi La Java (Reguler)', 'Bubur creamy tanpa kuah dengan sentuhan rempah rumahan: Ubi Kuning, Daging Ayam, Kacang Teri, Tahu Kuning. Porsi reguler.', 20000, '', 1, 8, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_04', 'cat_snack_salad', 'Bubur Ubi La Java (Large)', 'Bubur creamy tanpa kuah dengan sentuhan rempah rumahan: Ubi Kuning, Daging Ayam, Kacang Teri, Tahu Kuning. Porsi large mantap.', 35000, '', 1, 8, 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_05', 'cat_snack_salad', 'Tahu Isi', 'Tahu goreng renyah isi sayuran gurih dengan bumbu spesial dan cabai rawit hijau.', 20000, '', 1, 10, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_06', 'cat_snack_salad', 'Mendoan', 'Tempe mendoan lembut khas Banyumas dengan daun bawang disajikan bersama sambal kecap pedas.', 20000, '', 1, 10, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_07', 'cat_snack_salad', 'Jamur Crispy', 'Jamur tiram goreng tepung super renyah dan gurih, disajikan dengan saus cocolan.', 20000, '', 1, 10, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_08', 'cat_snack_salad', 'Chicken Popcorn', 'Potongan ayam fillet crispy renyah seukuran gigitan dengan bumbu gurih meresap.', 25000, '', 1, 12, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_09', 'cat_snack_salad', 'Potato Chips', 'Keripik kentang tipis renyah dengan taburan bumbu gurih khas La Java.', 20000, '', 1, 8, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_10', 'cat_snack_salad', 'French Fries', 'Kentang goreng klasik renyah keemasan bertabur garam gurih disajikan dengan saus.', 20000, '', 1, 8, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_11', 'cat_snack_salad', 'Onion Rings', 'Bawang bombay berbalut tepung renyah keemasan disajikan dengan saus spesial.', 20000, '', 1, 10, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_snk_12', 'cat_snack_salad', 'Bakwan Jagung', 'Bakwan jagung manis renyah dan empuk dengan daun seledri dan rempah pilihan.', 20000, '', 1, 10, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ic_01', 'cat_dessert_beer', 'Ice Cream Mix (Vanilla & Chocolate)', 'Dua scoop es krim paduan vanila lembut dan cokelat pekat nikmat.', 19000, '', 1, 3, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ic_02', 'cat_dessert_beer', 'Classic Affogato', 'Satu scoop es krim vanila manis disiram single shot espresso panas pekat.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ic_03', 'cat_dessert_beer', 'Ice Cream Vanilla', 'Es krim vanila klasik lembut dengan rasa manis creamy yang pas.', 18000, '', 1, 3, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ic_04', 'cat_dessert_beer', 'Choco Coco Ice Cream', 'Es krim cokelat bertabur kelapa sangrai dan sirup cokelat lezat.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ic_05', 'cat_dessert_beer', 'Ice Cream Chocolate', 'Es krim cokelat pekat kaya rasa favorit semua kalangan.', 18000, '', 1, 3, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ic_06', 'cat_dessert_beer', 'Mocha Affogato', 'Es krim vanila disiram paduan espresso panas dan saus cokelat mocha mantap.', 25000, '', 1, 4, 50) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_01', 'cat_dessert_beer', 'Bintang Radler', 'Bir berkarbonasi rasa lemon segar dengan kadar alkohol rendah, disajikan dingin.', 35000, '', 1, 2, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_02', 'cat_dessert_beer', 'Bintang Small', 'Bir pilsener khas Indonesia ukuran botol kecil (330ml), segar disajikan dalam gelas es dingin.', 35000, '', 1, 2, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_03', 'cat_dessert_beer', 'Bintang Arak Madu', 'Racikan bir bintang dengan sentuhan arak dan madu alami manis legit.', 38000, '', 1, 3, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_04', 'cat_dessert_beer', 'Heineken Small', 'Bir lager premium asal Belanda ukuran botol kecil (330ml) dengan rasa khas berkelas.', 35000, '', 1, 2, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_05', 'cat_dessert_beer', 'Prost Small', 'Bir pilsener segar rasa halus ukuran botol kecil (330ml).', 30000, '', 1, 2, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_06', 'cat_dessert_beer', 'Guinness Small', 'Bir hitam stout asal Irlandia dengan aroma malt sangrai khas dan busa pekat (330ml).', 38000, '', 1, 2, 48) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_07', 'cat_dessert_beer', 'Bintang Large', 'Bir pilsener Bintang botol besar (620ml) cocok untuk dinikmati bersama teman.', 50000, '', 1, 2, 36) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_08', 'cat_dessert_beer', 'Prost Large', 'Bir Prost botol besar (620ml) segar dan memuaskan.', 47000, '', 1, 2, 36) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_09', 'cat_dessert_beer', 'Heineken Large', 'Bir Heineken premium botol besar (620ml) dingin mantap.', 58000, '', 1, 2, 36) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES ('item_ber_10', 'cat_dessert_beer', 'Guinness Large', 'Bir hitam stout Guinness botol besar (620ml) pekat dan nikmat.', 58000, '', 1, 2, 36) ON CONFLICT (id) DO NOTHING;
