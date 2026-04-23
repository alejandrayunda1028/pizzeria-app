const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const crypto = require('crypto');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, message: 'No autenticado' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ ok: false, message: 'Acceso denegado' });
  }
  next();
};

// --- DASHBOARD STATS ---
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const totalOrdersResult = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalSalesResult = await db.get('SELECT SUM(total) as sum FROM orders');
    
    // Pedidos del día (simplificado usando LIKE con la fecha actual)
    const today = new Date().toISOString().split('T')[0];
    const todayOrdersResult = await db.get('SELECT COUNT(*) as count FROM orders WHERE created_at LIKE ?', [`${today}%`]);

    res.json({
      ok: true,
      stats: {
        totalOrders: totalOrdersResult.count,
        totalSales: totalSalesResult.sum || 0,
        todayOrders: todayOrdersResult.count
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ ok: false, message: 'Error al obtener estadísticas' });
  }
});

// --- ORDERS MANAGEMENT ---
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const orders = await db.all(`
      SELECT o.id, o.pizzas, o.total, o.status, o.created_at, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    res.json({ ok: true, orders });
  } catch (error) {
    console.error('Admin Orders Error:', error);
    res.status(500).json({ ok: false, message: 'Error al obtener pedidos' });
  }
});

router.put('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const { status } = req.body;
    const orderId = req.params.id;

    if (!['pendiente', 'en preparación', 'en camino', 'entregado'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'Estado inválido' });
    }

    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    res.json({ ok: true, message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Admin Update Order Status Error:', error);
    res.status(500).json({ ok: false, message: 'Error al actualizar el pedido' });
  }
});

// --- PRODUCTS MANAGEMENT ---
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const products = await db.all('SELECT * FROM products ORDER BY category, name');
    res.json({ ok: true, products });
  } catch (error) {
    console.error('Admin Products Error:', error);
    res.status(500).json({ ok: false, message: 'Error al obtener productos' });
  }
});

router.post('/products', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const { category, name, price, active } = req.body;

    if (!category || !name) {
      return res.status(400).json({ ok: false, message: 'Categoría y nombre son obligatorios' });
    }

    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO products (id, category, name, price, active) VALUES (?, ?, ?, ?, ?)',
      [id, category, name, price || 0, active !== undefined ? active : 1]
    );

    res.json({ ok: true, message: 'Producto creado', product: { id, category, name, price, active } });
  } catch (error) {
    console.error('Admin Create Product Error:', error);
    res.status(500).json({ ok: false, message: 'Error al crear producto' });
  }
});

router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const { category, name, price, active } = req.body;
    const productId = req.params.id;

    await db.run(
      'UPDATE products SET category = ?, name = ?, price = ?, active = ? WHERE id = ?',
      [category, name, price || 0, active !== undefined ? active : 1, productId]
    );

    res.json({ ok: true, message: 'Producto actualizado' });
  } catch (error) {
    console.error('Admin Update Product Error:', error);
    res.status(500).json({ ok: false, message: 'Error al actualizar producto' });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const productId = req.params.id;

    await db.run('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (error) {
    console.error('Admin Delete Product Error:', error);
    res.status(500).json({ ok: false, message: 'Error al eliminar producto' });
  }
});

module.exports = router;
