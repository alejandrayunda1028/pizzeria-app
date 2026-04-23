function getOptions(req, res) {
  return res.json({
    ok: true,
    options: {
      sizes: ['Personal', 'Mediana', 'Grande'],
      doughs: ['Delgada', 'Tradicional', 'Gruesa'],
      sauces: ['Tomate', 'BBQ', 'Blanca'],
      toppings: ['Queso extra', 'Pepperoni', 'Jamón', 'Champiñones', 'Cebolla', 'Aceitunas'],
      cuts: ['4 porciones', '6 porciones', '8 porciones', 'Cuadrados']
    }
  });
}

module.exports = {
  getOptions
};