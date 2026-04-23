const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, '../data/users.json');

async function readUsers() {
  const data = await fs.readFile(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

async function saveUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

async function createUser({ name, email, password }) {
  const users = await readUsers();

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    throw new Error('El correo ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}

async function validateUser(email, password) {
  const users = await readUsers();

  const user = users.find((item) => item.email === email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Credenciales inválidas');
  }

  return user;
}

module.exports = {
  createUser,
  validateUser
};