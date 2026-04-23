document.addEventListener('DOMContentLoaded', initBuilder);

async function initBuilder() {
  const sessionOk = await validateSession();
  if (!sessionOk) return;

  await loadOptions();
  renderAllControls();
  renderPizza();
  bindTopbarActions();
}

async function validateSession() {
  const result = await apiRequest('/api/auth/me');

  if (!result.ok) {
    window.location.href = '/login.html';
    return false;
  }

  pizzaState.user = result.user;

  const sessionInfo = document.getElementById('sessionInfo');
  if (sessionInfo) {
    sessionInfo.textContent = `Hola, ${result.user.name}. Personaliza tu pizza paso a paso.`;
  }

  return true;
}

async function loadOptions() {
  const result = await apiRequest('/api/pizza/options');

  if (!result.ok) {
    alert('No se pudieron cargar las opciones de la pizza');
    return;
  }

  setPizzaOptions(result.options);
}

function renderAllControls() {
  if (!pizzaState.options) return;

  renderButtonGroup({
    containerId: 'sizeOptions',
    items: pizzaState.options.sizes,
    activeValue: pizzaState.size,
    onSelect: handleSizeSelect
  });

  renderButtonGroup({
    containerId: 'doughOptions',
    items: pizzaState.options.doughs,
    activeValue: pizzaState.dough,
    onSelect: handleDoughSelect
  });

  renderButtonGroup({
    containerId: 'sauceOptions',
    items: pizzaState.options.sauces,
    activeValue: pizzaState.sauce,
    onSelect: handleSauceSelect
  });

  renderButtonGroup({
    containerId: 'cutOptions',
    items: pizzaState.options.cuts,
    activeValue: pizzaState.cut,
    onSelect: handleCutSelect
  });

  renderToppingControls();
}

function renderButtonGroup({ containerId, items, activeValue, onSelect }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `option-btn ${item === activeValue ? 'active' : ''}`;
    button.textContent = item;

    button.addEventListener('click', () => {
      onSelect(item);
    });

    container.appendChild(button);
  });
}

function getToppingIcon(topping) {
  const icons = {
    'Queso extra': 'bx-cheese',
    'Pepperoni': 'bx-circle',
    'Jamón': 'bx-stop',
    'Champiñones': 'bx-cloud',
    'Cebolla': 'bx-target-lock',
    'Aceitunas': 'bx-aperture'
  };
  return icons[topping] || 'bx-food-menu';
}

function renderToppingControls() {
  const container = document.getElementById('toppingOptions');
  if (!container) return;

  container.innerHTML = '';

  pizzaState.options.toppings.forEach((topping) => {
    const qty = pizzaState.toppings[topping] || 0;
    const isActive = qty > 0;

    const card = document.createElement('div');
    card.className = `topping-card-qty ${isActive ? 'active' : ''}`;

    // Contenedor info
    const info = document.createElement('div');
    info.className = 'topping-info';
    info.innerHTML = `<i class='bx ${getToppingIcon(topping)}'></i> <span>${topping}</span>`;

    // Controles de cantidad
    const controls = document.createElement('div');
    controls.className = 'qty-controls';

    const btnMinus = document.createElement('button');
    btnMinus.className = 'qty-btn minus';
    btnMinus.innerHTML = "<i class='bx bx-minus'></i>";
    btnMinus.disabled = qty === 0;
    btnMinus.addEventListener('click', (e) => {
      e.currentTarget.animate([{transform: 'scale(0.8)'}, {transform: 'scale(1)'}], {duration: 200});
      card.animate([{transform: 'scale(0.98)'}, {transform: 'scale(1)'}], {duration: 200});
      handleToppingQuantity(topping, qty - 1);
    });

    const display = document.createElement('span');
    display.className = 'qty-display';
    display.textContent = qty;

    const btnPlus = document.createElement('button');
    btnPlus.className = 'qty-btn plus';
    btnPlus.innerHTML = "<i class='bx bx-plus'></i>";
    btnPlus.addEventListener('click', (e) => {
      e.currentTarget.animate([{transform: 'scale(0.8)'}, {transform: 'scale(1)'}], {duration: 200});
      card.animate([{transform: 'scale(0.98)'}, {transform: 'scale(1)'}], {duration: 200});
      handleToppingQuantity(topping, qty + 1);
    });

    controls.appendChild(btnMinus);
    controls.appendChild(display);
    controls.appendChild(btnPlus);

    card.appendChild(info);
    card.appendChild(controls);

    container.appendChild(card);
  });
}

function handleSizeSelect(size) {
  if (pizzaState.size === size) return;
  setSize(size);
  renderAllControls();
  if (typeof animateSizeChange === 'function') animateSizeChange();
}

function handleDoughSelect(dough) {
  if (pizzaState.dough === dough) return;
  setDough(dough);
  renderAllControls();
  animateDoughChange();
}

function handleSauceSelect(sauce) {
  if (pizzaState.sauce === sauce) return;
  setSauce(sauce);
  renderAllControls();
  animateSauceChange();
}

function handleToppingQuantity(topping, newQty) {
  const oldQty = pizzaState.toppings[topping] || 0;
  if (newQty < 0) return;
  
  updateToppingQuantity(topping, newQty);
  renderAllControls(); // actualiza botones

  if (newQty > oldQty) {
    // Añadió más (animar caída de piezas nuevas)
    animateToppingFall(topping, newQty, oldQty);
  } else if (newQty < oldQty) {
    // Quitó (animar desaparición)
    animateToppingRemove(topping, newQty, oldQty);
  }
}

function handleCutSelect(cut) {
  if (pizzaState.cut === cut) return;
  setCut(cut);
  renderAllControls();
  animateCut();
}

function bindTopbarActions() {
  const resetPizzaBtn = document.getElementById('resetPizzaBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (resetPizzaBtn) {
    resetPizzaBtn.addEventListener('click', () => {
      resetPizzaState();
      renderAllControls();
      renderPizza();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await apiRequest('/api/auth/logout', 'POST');
      window.location.href = '/login.html';
    });
  }
}