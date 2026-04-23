const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/database.sqlite');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      pizzas TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      active INTEGER DEFAULT 1
    );
  `);

  // Intenta añadir la columna 'role' a 'users' si veníamos de una versión anterior
  try {
    await dbInstance.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
  } catch (e) {
    // Si la columna ya existe, ignora el error
  }

  // Create default admin user
  const adminEmail = 'administrado@gmail.com';
  const adminExists = await dbInstance.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!adminExists) {
    const adminId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash('Admin123*', 12);
    await dbInstance.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'Administrador', adminEmail, hashedPassword, 'admin']
    );
  }

  // Seed default products if empty
  const prodCount = await dbInstance.get('SELECT COUNT(*) as count FROM products');
  if (prodCount.count === 0) {
    const defaultProducts = [
      { category: 'size', name: 'Personal', price: 15000 },
      { category: 'size', name: 'Mediana', price: 30000 },
      { category: 'size', name: 'Grande', price: 45000 },
      { category: 'dough', name: 'Delgada' },
      { category: 'dough', name: 'Tradicional' },
      { category: 'dough', name: 'Gruesa' },
      { category: 'sauce', name: 'Tomate' },
      { category: 'sauce', name: 'BBQ' },
      { category: 'sauce', name: 'Blanca' },
      { category: 'cut', name: '4 porciones' },
      { category: 'cut', name: '6 porciones' },
      { category: 'cut', name: '8 porciones' },
      { category: 'cut', name: 'Cuadrados' },
      { category: 'topping', name: 'Queso extra', price: 3500 },
      { category: 'topping', name: 'Pepperoni', price: 3500 },
      { category: 'topping', name: 'Jamón', price: 3500 },
      { category: 'topping', name: 'Champiñones', price: 3500 },
      { category: 'topping', name: 'Cebolla', price: 3500 },
      { category: 'topping', name: 'Aceitunas', price: 3500 }
    ];

    const insertStmt = await dbInstance.prepare('INSERT INTO products (id, category, name, price, active) VALUES (?, ?, ?, ?, 1)');
    for (const p of defaultProducts) {
      await insertStmt.run(crypto.randomUUID(), p.category, p.name, p.price || 0);
    }
    await insertStmt.finalize();
  }

  return dbInstance;
}

module.exports = { getDB };
