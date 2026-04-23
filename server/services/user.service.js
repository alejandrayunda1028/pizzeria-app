const bcrypt = require('bcryptjs');
const { getDB } = require('../config/db');

async function createUser({ name, email, password }) {
  const db = await getDB();

  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (existingUser) {
    throw new Error('El correo ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = Date.now().toString();

  await db.run(
    'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
    [id, name, email, hashedPassword]
  );

  return { id, name, email };
}

async function validateUser(email, password) {
  const db = await getDB();

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Credenciales inválidas');
  }

  return { id: user.id, name: user.name, email: user.email };
}

module.exports = {
  createUser,
  validateUser
};