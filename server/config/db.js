const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/database.sqlite');
const dataDir = path.dirname(dbPath);

// Asegurar que el directorio de la base de datos exista
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
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      pizzas TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  return dbInstance;
}

module.exports = { getDB };
