const userService = require('../services/user.service');

// Validar política de contraseñas (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
function validatePasswordPolicy(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

async function register(req, res) {
  try {
    let { name, email, password } = req.body;

    name = sanitizeInput(name);
    email = sanitizeInput(email).toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    if (!validatePasswordPolicy(password)) {
      return res.status(400).json({
        ok: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
      });
    }

    const newUser = await userService.createUser({ name, email, password });

    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      user: req.session.user
    });
  } catch (error) {
    // Si el error es sobre correo duplicado, podríamos lanzar mensaje genérico,
    // pero usualmente está bien decir que el correo ya está en uso.
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
}

async function login(req, res) {
  try {
    let { email, password } = req.body;

    email = sanitizeInput(email).toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = await userService.validateUser(email, password);

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.json({
      ok: true,
      message: 'Inicio de sesión correcto',
      user: req.session.user
    });
  } catch (error) {
    // Retornamos genérico "Credenciales inválidas"
    return res.status(401).json({
      ok: false,
      message: 'Credenciales inválidas'
    });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    return res.json({
      ok: true,
      message: 'Sesión cerrada'
    });
  });
}

function me(req, res) {
  if (!req.session.user) {
    return res.status(401).json({
      ok: false,
      message: 'No hay sesión activa'
    });
  }

  return res.json({
    ok: true,
    user: req.session.user
  });
}

module.exports = {
  register,
  login,
  logout,
  me
};