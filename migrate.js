const fs = require('fs/promises');
const path = require('path');
const { getDB } = require('./server/config/db');

async function migrate() {
  try {
    const usersFilePath = path.join(__dirname, 'server/data/users.json');
    const data = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(data);

    const db = await getDB();

    for (const user of users) {
      const existing = await db.get('SELECT * FROM users WHERE email = ?', user.email);
      if (!existing) {
        await db.run(
          'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
          [user.id, user.name, user.email, user.password]
        );
        console.log(`Migrated user: ${user.email}`);
      }
    }
    console.log('Migration complete');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No users.json found. Skipping migration.');
    } else {
      console.error('Migration error:', error);
    }
  }
}

migrate();
