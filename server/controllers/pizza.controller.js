const { getDB } = require('../config/db');

async function getOptions(req, res) {
  try {
    const db = await getDB();
    const products = await db.all('SELECT category, name, price FROM products WHERE active = 1');

    const options = {
      sizes: products.filter(p => p.category === 'size').map(p => ({ name: p.name, price: p.price })),
      doughs: products.filter(p => p.category === 'dough').map(p => p.name),
      sauces: products.filter(p => p.category === 'sauce').map(p => p.name),
      toppings: products.filter(p => p.category === 'topping').map(p => p.name),
      cuts: products.filter(p => p.category === 'cut').map(p => p.name)
    };

    // To keep backward compatibility with frontend that expects array of strings for sizes if it doesn't read price from here
    const legacyOptions = {
      sizes: options.sizes.map(s => s.name),
      doughs: options.doughs,
      sauces: options.sauces,
      toppings: options.toppings,
      cuts: options.cuts,
      pricing: {
        sizes: options.sizes.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.price }), {}),
        toppings: products.filter(p => p.category === 'topping').reduce((acc, curr) => ({ ...acc, [curr.name]: curr.price }), {})
      }
    };

    return res.json({
      ok: true,
      options: legacyOptions
    });
  } catch (error) {
    console.error('Error fetching pizza options:', error);
    res.status(500).json({ ok: false, message: 'Error interno al cargar opciones' });
  }
}

module.exports = {
  getOptions
};