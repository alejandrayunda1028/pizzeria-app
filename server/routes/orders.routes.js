const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDB } = require('../config/db');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, message: 'No autenticado' });
  }
  next();
};

router.post('/', requireAuth, async (req, res) => {
  try {
    const { pizzas, total } = req.body;
    
    if (!pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
      return res.status(400).json({ ok: false, message: 'El carrito está vacío' });
    }

    const db = await getDB();
    const orderId = crypto.randomUUID();
    const userId = req.session.user.id;

    await db.run(
      'INSERT INTO orders (id, user_id, pizzas, total) VALUES (?, ?, ?, ?)',
      [orderId, userId, JSON.stringify(pizzas), total]
    );

    res.status(201).json({ 
      ok: true, 
      message: 'Pedido realizado con éxito',
      orderId 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ ok: false, message: 'Error interno al procesar el pedido' });
  }
});

router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const userId = req.session.user.id;
    
    const orders = await db.all(
      'SELECT id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ ok: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ ok: false, message: 'Error interno al obtener pedidos' });
  }
});

module.exports = router;
