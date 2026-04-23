const pizzaState = {
  user: null,
  size: 'Mediana',
  dough: 'Tradicional',
  sauce: 'Tomate',
  toppings: {},
  cut: '8 porciones',
  options: null,
  toppingLayout: {}
};

function setPizzaOptions(options) {
  pizzaState.options = options;
}

function setSize(size) {
  pizzaState.size = size;
}

function setDough(dough) {
  pizzaState.dough = dough;
}

function setSauce(sauce) {
  pizzaState.sauce = sauce;
}

function setCut(cut) {
  pizzaState.cut = cut;
}

function updateToppingQuantity(topping, quantity) {
  if (quantity <= 0) {
    delete pizzaState.toppings[topping];
    delete pizzaState.toppingLayout[topping];
  } else {
    pizzaState.toppings[topping] = quantity;
  }
}

function resetPizzaState() {
  pizzaState.size = 'Mediana';
  pizzaState.dough = 'Tradicional';
  pizzaState.sauce = 'Tomate';
  pizzaState.toppings = {};
  pizzaState.cut = '8 porciones';
  pizzaState.toppingLayout = {};
}