import { type SQLiteDatabase } from 'expo-sqlite';

export const createTables = async (db: SQLiteDatabase) => {
  try {
    // Users Table
    // Users Table
    // DEV ONLY: Drop table removed for persistence

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        cell_number TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // OTPs Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS otps (
        otp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL, -- email or cell_number
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Products Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_urls TEXT,
        stock_quantity INTEGER DEFAULT 0,
        category_id INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Cart Items Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart_items (
        cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER CHECK (quantity > 0),
        added_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      );
    `);

    // Orders Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_date TEXT DEFAULT (datetime('now')),
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'Pending',
        shipping_address TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

    // Order Items Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS order_items (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER,
        price_at_purchase REAL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id)
      );
    `);

    console.log('Tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};
