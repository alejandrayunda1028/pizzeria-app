const DOUGH_STYLES = {
  Delgada: {
    background: '#f3cd8f',
    border: '#d89b5b'
  },
  Tradicional: {
    background: '#efc27b',
    border: '#d89a59'
  },
  Gruesa: {
    background: '#dca05f',
    border: '#b87438'
  }
};

const SAUCE_STYLES = {
  Tomate: 'rgba(198, 40, 40, 0.78)',
  BBQ: 'rgba(110, 56, 28, 0.80)',
  Blanca: 'rgba(246, 241, 214, 0.88)'
};

const TOPPING_CONFIG = {
  'Queso extra': { amount: 18, className: 'topping-queso-extra' },
  Pepperoni: { amount: 12, className: 'topping-pepperoni' },
  Jamón: { amount: 12, className: 'topping-jamón' },
  Champiñones: { amount: 10, className: 'topping-champiñones' },
  Cebolla: { amount: 12, className: 'topping-cebolla' },
  Aceitunas: { amount: 14, className: 'topping-aceitunas' }
};

function getPizzaElements() {
  return {
    pizza: document.getElementById('pizzaCanvas'),
    dough: document.querySelector('.dough'),
    sauce: document.querySelector('.sauce'),
    toppings: document.querySelector('.toppings'),
    cuts: document.querySelector('.cuts')
  };
}

function renderDough() {
  const { dough } = getPizzaElements();
  if (!dough) return;

  const style = DOUGH_STYLES[pizzaState.dough];
  dough.style.background = style.background;
  dough.style.borderColor = style.border;
}

function renderSauce() {
  const { sauce } = getPizzaElements();
  if (!sauce) return;

  sauce.style.background = SAUCE_STYLES[pizzaState.sauce];
}

function getCutAngles(cut) {
  if (cut === '4 porciones') return [0, 90];
  if (cut === '6 porciones') return [0, 60, 120];
  if (cut === '8 porciones') return [0, 45, 90, 135];
  if (cut === 'Cuadrados') return [0, 90, 35, -35];
  return [0, 45, 90, 135];
}

function renderCuts() {
  const { cuts } = getPizzaElements();
  if (!cuts) return;

  cuts.innerHTML = '';

  const angles = getCutAngles(pizzaState.cut);

  angles.forEach((angle) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '50%';
    wrapper.style.left = '50%';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    wrapper.style.pointerEvents = 'none';

    const line = document.createElement('div');
    line.className = 'cut-line';
    line.style.position = 'absolute';
    line.style.left = '50%';
    line.style.top = '7%';
    line.style.transform = 'translateX(-50%)';
    line.style.height = '86%';
    line.style.background = 'rgba(90, 40, 10, 0.6)';

    wrapper.appendChild(line);
    cuts.appendChild(wrapper);
  });
}

function randomPointInsidePizza(radiusPercent) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * radiusPercent;

  return {
    x: 50 + Math.cos(angle) * distance,
    y: 50 + Math.sin(angle) * distance
  };
}

function ensureToppingLayout(toppingName, maxQty) {
  if (!pizzaState.toppingLayout[toppingName]) {
    pizzaState.toppingLayout[toppingName] = [];
  }
  
  const layout = pizzaState.toppingLayout[toppingName];
  const config = TOPPING_CONFIG[toppingName];
  
  // Generar batches hasta llegar a maxQty (con un límite visual de 5)
  const visualQty = Math.min(maxQty, 5);
  
  while (layout.length < visualQty) {
    const batch = [];
    for (let i = 0; i < config.amount; i += 1) {
      batch.push(randomPointInsidePizza(33)); // 33% del tamaño de la pizza
    }
    layout.push(batch);
  }
}

function createToppingPiece(toppingName, position, batchIndex = 0) {
  const config = TOPPING_CONFIG[toppingName];
  const piece = document.createElement('div');

  piece.className = `topping-piece ${config.className}`;
  piece.style.left = `${position.x}%`;
  piece.style.top = `${position.y}%`;
  piece.dataset.batch = batchIndex; // Para poder identificarlas al animar

  return piece;
}

function renderToppings(exceptTopping = null) {
  const { toppings } = getPizzaElements();
  if (!toppings) return;

  toppings.innerHTML = '';

  Object.entries(pizzaState.toppings).forEach(([toppingName, qty]) => {
    if (toppingName === exceptTopping) return;

    ensureToppingLayout(toppingName, qty);

    const layout = pizzaState.toppingLayout[toppingName];
    const visualQty = Math.min(qty, 5);

    // Iterar sobre los batches que corresponden a la cantidad actual
    for (let b = 0; b < visualQty; b++) {
      const positions = layout[b];
      positions.forEach((position) => {
        const piece = createToppingPiece(toppingName, position, b);
        toppings.appendChild(piece);
      });
    }
  });
}

function updateSummary() {
  const summarySize = document.getElementById('summarySize');
  const summaryDough = document.getElementById('summaryDough');
  const summarySauce = document.getElementById('summarySauce');
  const summaryToppings = document.getElementById('summaryToppings');
  const summaryCut = document.getElementById('summaryCut');
  const summaryTotal = document.getElementById('summaryTotal');

  const sizePrices = {
    'Personal': 15000,
    'Mediana': 30000,
    'Grande': 45000
  };

  const basePrice = sizePrices[pizzaState.size] || 30000;
  const toppingPrice = 3500;

  if (summarySize) {
    summarySize.innerHTML = `<span class="val-text">${pizzaState.size}</span> <span class="price-tag">${formatCurrency(basePrice)}</span>`;
  }
  if (summaryDough) {
    summaryDough.innerHTML = `<span class="val-text">${pizzaState.dough}</span>`;
  }
  if (summarySauce) {
    summarySauce.innerHTML = `<span class="val-text">${pizzaState.sauce}</span>`;
  }
  if (summaryCut) {
    summaryCut.innerHTML = `<span class="val-text">${pizzaState.cut}</span>`;
  }

  const toppingKeys = Object.keys(pizzaState.toppings);

  if (summaryToppings) {
    if (toppingKeys.length > 0) {
      summaryToppings.innerHTML = toppingKeys.map(t => {
        const qty = pizzaState.toppings[t];
        const extraCost = toppingPrice * qty;
        return `<div class="topping-item-summary">
          <span class="qty">${qty}x</span> 
          <span class="t-name">${t}</span> 
          <span class="price-tag">+${formatCurrency(extraCost)}</span>
        </div>`;
      }).join('');
    } else {
      summaryToppings.innerHTML = '<span class="empty-val">Sin ingredientes extra</span>';
    }
  }

  if (summaryTotal) {
    let extraTotal = 0;
    Object.values(pizzaState.toppings).forEach(qty => {
      extraTotal += qty * toppingPrice;
    });
    const total = basePrice + extraTotal;
    summaryTotal.textContent = formatCurrency(total);
    
    // Microinteraction
    summaryTotal.classList.remove('pop-anim');
    void summaryTotal.offsetWidth; 
    summaryTotal.classList.add('pop-anim');
  }
}

function renderSize() {
  const { pizza } = getPizzaElements();
  if (!pizza) return;
  
  const scales = {
    'Personal': '0.7',
    'Mediana': '1',
    'Grande': '1.3'
  };
  
  // Set css custom property to scale the pizza smoothly via CSS
  pizza.style.setProperty('--pizza-scale', scales[pizzaState.size] || '1');
}

function renderPizza() {
  renderSize();
  renderDough();
  renderSauce();
  renderToppings();
  renderCuts();
  updateSummary();
}