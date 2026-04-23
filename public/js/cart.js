let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];

function saveCart() {
  localStorage.setItem('pizzaCart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    cartCount.textContent = cart.length;
    // Animar
    cartCount.parentElement.classList.remove('pop-anim');
    void cartCount.parentElement.offsetWidth;
    cartCount.parentElement.classList.add('pop-anim');
  }
}

function renderCartModal() {
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalDisplay = document.getElementById('cartTotalDisplay');
  
  if (!cartItemsList || !cartTotalDisplay) return;

  cartItemsList.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">El carrito está vacío. ¡Arma tu pizza!</p>';
    cartTotalDisplay.textContent = formatCurrency(0);
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    
    // Toppings text
    const toppingsList = Object.entries(item.toppings)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ');

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-details">
        <h4>Pizza ${item.size} - ${item.dough}</h4>
        <p>${item.sauce} | ${item.cut}</p>
        <p style="font-size: 0.8rem; opacity: 0.7">${toppingsList || 'Sin extras'}</p>
      </div>
      <div style="text-align: right;">
        <div class="cart-item-price mb-2">${formatCurrency(item.price)}</div>
        <button class="btn-outline btn-sm btn-danger-outline" onclick="removeFromCart(${index})">
          <i class='bx bx-trash'></i>
        </button>
      </div>
    `;
    cartItemsList.appendChild(div);
  });

  cartTotalDisplay.textContent = formatCurrency(total);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCartModal();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  const addToCartBtn = document.getElementById('addToCartBtn');
  const cartBtn = document.getElementById('cartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartModal = document.getElementById('cartModal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      // Calculate current price logic from pizza-render
      // Since it's decoupled, we calculate it here or get it from the DOM.
      // Easiest is to calculate.
      const sizePrices = { 'Personal': 15000, 'Mediana': 30000, 'Grande': 45000 };
      const basePrice = sizePrices[pizzaState.size] || 30000;
      let extraTotal = 0;
      Object.values(pizzaState.toppings).forEach(qty => {
        extraTotal += qty * 3500;
      });
      const price = basePrice + extraTotal;

      const orderItem = {
        size: pizzaState.size,
        dough: pizzaState.dough,
        sauce: pizzaState.sauce,
        cut: pizzaState.cut,
        toppings: { ...pizzaState.toppings },
        price
      };

      cart.push(orderItem);
      saveCart();

      // Animación de feedback en el botón
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = "<i class='bx bx-check'></i> ¡Añadida!";
      addToCartBtn.style.background = "#2ed573";
      
      setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.style.background = "";
      }, 1500);
    });
  }

  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', () => {
      renderCartModal();
      cartModal.classList.add('active');
    });
  }

  if (closeCartBtn && cartModal) {
    closeCartBtn.addEventListener('click', () => {
      cartModal.classList.remove('active');
    });
  }

  // Cerrar al hacer clic fuera
  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.classList.remove('active');
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (cart.length === 0) return;

      const originalText = checkoutBtn.innerHTML;
      checkoutBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Procesando...";
      checkoutBtn.disabled = true;

      const total = cart.reduce((acc, item) => acc + item.price, 0);

      try {
        const result = await apiRequest('/api/orders', 'POST', {
          pizzas: cart,
          total
        });

        if (result.ok) {
          cart = [];
          saveCart();
          cartModal.classList.remove('active');
          alert('¡Tu pedido ha sido procesado con éxito! ID: ' + result.orderId);
        } else {
          alert(result.message || 'Error al procesar el pedido');
        }
      } catch (e) {
        alert('Error de conexión');
      } finally {
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
      }
    });
  }
});
