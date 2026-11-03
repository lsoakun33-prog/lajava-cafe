const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable Foreign Keys & WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT '',
      is_available INTEGER DEFAULT 1,
      prep_time INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      table_number TEXT UNIQUE NOT NULL,
      capacity INTEGER DEFAULT 4,
      status TEXT DEFAULT 'AVAILABLE',
      qr_token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      table_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_notes TEXT,
      status TEXT DEFAULT 'PENDING',
      payment_method TEXT DEFAULT 'CASHIER',
      payment_status TEXT DEFAULT 'UNPAID',
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      item_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS waiter_calls (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL,
      call_type TEXT NOT NULL,
      note TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME
    );
  `);

  // Safe schema migrations for existing databases
  try {
    db.prepare('ALTER TABLE orders ADD COLUMN cancel_reason TEXT').run();
  } catch (_) {}
  try {
    db.prepare('ALTER TABLE orders ADD COLUMN table_token TEXT').run();
  } catch (_) {}
  try {
    db.prepare('ALTER TABLE menu_items ADD COLUMN stock INTEGER DEFAULT NULL').run();
  } catch (_) {}
  try {
    db.prepare('ALTER TABLE orders ADD COLUMN device_id TEXT').run();
  } catch (_) {}
  try {
    db.prepare('ALTER TABLE orders ADD COLUMN ip_address TEXT').run();
  } catch (_) {}
  try {
    db.prepare('ALTER TABLE orders ADD COLUMN user_agent TEXT').run();
  } catch (_) {}
  try {
    db.prepare('CREATE INDEX IF NOT EXISTS idx_orders_device_id ON orders(device_id)').run();
  } catch (_) {}
  try {
    db.prepare('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)').run();
  } catch (_) {}

  seedInitialData();
}

function seedInitialData() {
  // 1. Seed Admin User if not exists
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('usr_admin_01', 'admin', hash, 'Head Administrator', 'admin');
    console.log('[DB] Default admin created: user="admin", pass="admin123"');
  }

  // 2. Seed Categories & Menu Items if empty
  const categoryCount = db.prepare('SELECT count(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    console.log('[DB] Seeding official La Java menu categories and items...');
    const menuData = require('./lajava_menu_data');

    const insertCat = db.prepare('INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)');
    const insertItem = db.prepare(`
      INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedTx = db.transaction(() => {
      for (const cat of menuData.categories) {
        insertCat.run(cat.id, cat.name, cat.slug, cat.sort_order);
      }
      for (const item of menuData.items) {
        insertItem.run(
          item.id,
          item.category_id,
          item.name,
          item.description,
          item.price,
          item.image,
          item.is_available ?? 1,
          item.prep_time ?? 15,
          item.stock ?? 50
        );
      }
    });

    seedTx();
    console.log(`[DB] Successfully seeded ${menuData.categories.length} categories and ${menuData.items.length} menu items.`);
  }

  // 3. Seed Tables if empty
  const tableCount = db.prepare('SELECT count(*) as count FROM tables').get().count;
  if (tableCount === 0) {
    console.log('[DB] Seeding tables...');
    const insertTable = db.prepare('INSERT INTO tables (id, table_number, capacity, qr_token) VALUES (?, ?, ?, ?)');
    for (let i = 1; i <= 10; i++) {
      const numStr = i < 10 ? `Meja 0${i}` : `Meja ${i}`;
      insertTable.run(`tbl_${i}`, numStr, i <= 4 ? 2 : 4, `qr_token_${i}_${Date.now()}`);
    }
    insertTable.run('tbl_vip1', 'VIP Room 01', 8, `qr_token_vip1_${Date.now()}`);
    console.log('[DB] 11 tables seeded.');
  }
}

initDatabase();

module.exports = db;
