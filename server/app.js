const express = require('express');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const pizzaRoutes = require('./routes/pizza.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limiter for general API to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { ok: false, message: 'Demasiadas solicitudes, por favor intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Esto es CRÍTICO para que las cookies seguras funcionen detrás de un proxy (como Railway)
app.set('trust proxy', 1);

app.use(
  session({
    secret: 'mi_secreto_pizzeria_super_seguro_2026', // Consider using env vars
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // hide default connect.sid
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true if using HTTPS
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

const ordersRoutes = require('./routes/orders.routes');

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/pizza', pizzaRoutes);
app.use('/api/orders', ordersRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;