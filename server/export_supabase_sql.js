const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.resolve(__dirname, 'database.sqlite'));

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- ====================================================================
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
`;

// Seed users
const users = db.prepare('SELECT * FROM users').all();
sql += `\n-- 1. Users (${users.length} records)\n`;
for (const u of users) {
  sql += `INSERT INTO users (id, username, password, name, role) VALUES (${escapeSql(u.id)}, ${escapeSql(u.username)}, ${escapeSql(u.password)}, ${escapeSql(u.name)}, ${escapeSql(u.role)}) ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed categories
const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
sql += `\n-- 2. Categories (${categories.length} records)\n`;
for (const c of categories) {
  sql += `INSERT INTO categories (id, name, slug, sort_order) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${c.sort_order}) ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed tables
const tables = db.prepare('SELECT * FROM tables').all();
sql += `\n-- 3. Tables (${tables.length} records)\n`;
for (const t of tables) {
  sql += `INSERT INTO tables (id, table_number, capacity, status, qr_token) VALUES (${escapeSql(t.id)}, ${escapeSql(t.table_number)}, ${t.capacity}, ${escapeSql(t.status)}, ${escapeSql(t.qr_token)}) ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed menu_items
const items = db.prepare('SELECT * FROM menu_items').all();
sql += `\n-- 4. Menu Items (${items.length} records)\n`;
for (const m of items) {
  sql += `INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock) VALUES (${escapeSql(m.id)}, ${escapeSql(m.category_id)}, ${escapeSql(m.name)}, ${escapeSql(m.description)}, ${m.price}, ${escapeSql(m.image)}, ${m.is_available}, ${m.prep_time}, ${m.stock === null ? 'NULL' : m.stock}) ON CONFLICT (id) DO NOTHING;\n`;
}

const outPath = path.resolve(__dirname, '..', 'supabase_schema.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Successfully generated ${outPath} with ${items.length} menu items and ${categories.length} categories!`);
