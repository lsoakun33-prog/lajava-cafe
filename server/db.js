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
      image TEXT NOT NULL,
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
    console.log('[DB] Seeding menu categories and items...');

    const insertCat = db.prepare('INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)');
    insertCat.run('cat_coffee', 'Coffee & Espresso', 'coffee', 1);
    insertCat.run('cat_non_coffee', 'Non-Coffee & Tea', 'non-coffee', 2);
    insertCat.run('cat_pastry', 'Artisan Bakery & Pastry', 'pastry', 3);
    insertCat.run('cat_main', 'Signature Mains & Bites', 'mains', 4);

    const insertItem = db.prepare(`
      INSERT INTO menu_items (id, category_id, name, description, price, image, is_available, prep_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Coffee
    insertItem.run(
      'item_01',
      'cat_coffee',
      'Noir Double Espresso',
      'Kopi pekat ristretto ganda dari single origin Mandheling pilihan dengan crema keemasan tebal.',
      28000,
      'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&auto=format&fit=crop&q=80',
      1,
      5
    );
    insertItem.run(
      'item_02',
      'cat_coffee',
      'Monochrome Charcoal Latte',
      'Perpaduan espresso premium, activated bamboo charcoal, steamed milk lembut, dengan sentuhan vanilla madagascar.',
      38000,
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      1,
      7
    );
    insertItem.run(
      'item_03',
      'cat_coffee',
      'Cold Brew Reserve',
      'Kopi seduh dingin selama 18 jam dengan notes dark chocolate, fruity plum, dan aftertaste manis alami.',
      35000,
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      1,
      5
    );
    insertItem.run(
      'item_04',
      'cat_coffee',
      'Flat White Velvet',
      'Double shot espresso dipadukan microfoam susu halus dengan rasio presisi standar barista dunia.',
      34000,
      'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80',
      1,
      6
    );

    // Non-Coffee
    insertItem.run(
      'item_05',
      'cat_non_coffee',
      'Kyoto Ceremonial Matcha',
      'Matcha murni dari Uji, Kyoto diseduh dengan susu oat dan madu hutan organik.',
      42000,
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      1,
      6
    );
    insertItem.run(
      'item_06',
      'cat_non_coffee',
      'Noir Dark Chocolate 70%',
      'Cokelat single estate Tabanan Bali dengan tingkat kepekatan 70% dan sea salt flakes.',
      36000,
      'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80',
      1,
      5
    );
    insertItem.run(
      'item_07',
      'cat_non_coffee',
      'Sparkling Yuzu Blossom',
      'Kombinasi segar sari jeruk Yuzu Jepang, sparkling water premium, dan garnish thyme segar.',
      35000,
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      1,
      4
    );

    // Bakery
    insertItem.run(
      'item_08',
      'cat_pastry',
      'Truffle Butter Croissant',
      'Croissant Prancis berlapis renyah dengan aroma truffle butter Italia dan taburan parmesan hitam.',
      32000,
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
      1,
      8
    );
    insertItem.run(
      'item_09',
      'cat_pastry',
      'Basque Burnt Cheesecake',
      'Kue keju panggang ala Spanyol dengan kerak karamel khas dan tekstur tengah yang lumer lembut.',
      45000,
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
      1,
      5
    );
    insertItem.run(
      'item_10',
      'cat_pastry',
      'Dark Pain au Chocolat',
      'Pastry lipat klasik dengan isian 2 batang batons dark chocolate Belgia kualitas artisan.',
      34000,
      'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&auto=format&fit=crop&q=80',
      1,
      8
    );

    // Mains
    insertItem.run(
      'item_11',
      'cat_main',
      'Black Angus Truffle Burger',
      'Patty daging sapi Black Angus juicy, brioche bun arang hitam, saus truffle mayo, dan keju cheddar leleh.',
      78000,
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      1,
      18
    );
    insertItem.run(
      'item_12',
      'cat_main',
      'Spaghetti Aglio Olio Salmon',
      'Pasta al dente ditumis dengan minyak zaitun extra virgin, irisan bawang putih, cabai kering, dan pan-seared salmon.',
      68000,
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
      1,
      15
    );
    insertItem.run(
      'item_13',
      'cat_main',
      'Crispy Truffle Fries',
      'Kentang goreng renyah bumbu truffle oil, taburan rosemary, bawang putih panggang, dan garlic aioli.',
      35000,
      'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      1,
      10
    );

    console.log('[DB] Menu items seeded successfully.');
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
