function animateSizeChange() {
  renderSize();
  updateSummary();

  const { pizza } = getPizzaElements();
  if (!pizza) return;

  const scales = {
    'Personal': '0.7',
    'Mediana': '1',
    'Grande': '1.3'
  };
  
  const targetScale = scales[pizzaState.size] || '1';

  // The CSS will handle the smooth transition of --pizza-scale if we set it, 
  // but let's add a slight bounce via animate() for extra "wow" factor
  pizza.animate(
    [
      { transform: `scale(${parseFloat(targetScale) * 0.95})` },
      { transform: `scale(${parseFloat(targetScale) * 1.05})` },
      { transform: `scale(${targetScale})` }
    ],
    {
      duration: 500,
      easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      fill: 'forwards' // Leave it at the target scale until CSS catches up
    }
  );
}

function animateDoughChange() {
  renderDough();
  updateSummary();

  const { dough } = getPizzaElements();
  if (!dough) return;

  dough.animate(
    [
      { transform: 'scale(0.94)' },
      { transform: 'scale(1.03)' },
      { transform: 'scale(1)' }
    ],
    {
      duration: 420,
      easing: 'ease-out'
    }
  );
}

function animateSauceChange() {
  renderSauce();
  updateSummary();

  const { sauce } = getPizzaElements();
  if (!sauce) return;

  sauce.animate(
    [
      { opacity: 0.4, transform: 'scale(0.92)' },
      { opacity: 1, transform: 'scale(1.02)' },
      { opacity: 1, transform: 'scale(1)' }
    ],
    {
      duration: 450,
      easing: 'ease-out'
    }
  );
}

function animateDoughChange() {
  renderDough();
  updateSummary();

  const { dough } = getPizzaElements();
  if (!dough) return;

  dough.animate(
    [
      { transform: 'scale(0.94)' },
      { transform: 'scale(1.03)' },
      { transform: 'scale(1)' }
    ],
    {
      duration: 420,
      easing: 'ease-out'
    }
  );
}

function animateSauceChange() {
  renderSauce();
  updateSummary();

  const { sauce } = getPizzaElements();
  if (!sauce) return;

  sauce.animate(
    [
      { opacity: 0.4, transform: 'scale(0.92)' },
      { opacity: 1, transform: 'scale(1.02)' },
      { opacity: 1, transform: 'scale(1)' }
    ],
    {
      duration: 450,
      easing: 'ease-out'
    }
  );
}

function animateToppingFall(toppingName, newQty, oldQty) {
  renderDough();
  renderSauce();
  renderToppings(toppingName); // Renderiza todo excepto el que cae
  renderCuts();
  updateSummary();

  const { toppings } = getPizzaElements();
  if (!toppings) return;

  ensureToppingLayout(toppingName, newQty);
  const layout = pizzaState.toppingLayout[toppingName];
  
  const maxAnim = Math.min(newQty, 5);
  const minAnim = Math.min(oldQty, 5);

  // Renderizar las porciones viejas estáticas
  for (let b = 0; b < minAnim; b++) {
    layout[b].forEach((position) => {
      const piece = createToppingPiece(toppingName, position, b);
      toppings.appendChild(piece);
    });
  }

  // Animar las porciones nuevas
  for (let b = minAnim; b < maxAnim; b++) {
    layout[b].forEach((position, index) => {
      const piece = createToppingPiece(toppingName, position, b);
      piece.style.opacity = '0';
      toppings.appendChild(piece);

      const randomX = (Math.random() - 0.5) * 70;

      piece.animate(
        [
          {
            transform: `translate(calc(-50% + ${randomX}px), -220px) scale(0.4)`,
            opacity: 0
          },
          {
            transform: 'translate(-50%, -50%) scale(1.08)',
            opacity: 1,
            offset: 0.82
          },
          {
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1
          }
        ],
        {
          duration: 650 + Math.random() * 300,
          delay: index * 40,
          easing: 'ease-out',
          fill: 'forwards'
        }
      );
    });
  }
}

function animateToppingRemove(toppingName, newQty, oldQty) {
  const { toppings } = getPizzaElements();
  if (!toppings) return;

  updateSummary();

  // Encontrar todas las piezas de este topping en el DOM
  const pieces = toppings.querySelectorAll(`.topping-piece`);
  let hasAnim = false;

  pieces.forEach(piece => {
    // Si la pieza pertenece al topping actual y a un batch que debe eliminarse
    if (piece.classList.contains(TOPPING_CONFIG[toppingName].className)) {
      const batch = parseInt(piece.dataset.batch);
      if (batch >= newQty) {
        hasAnim = true;
        const anim = piece.animate(
          [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
          ],
          {
            duration: 300,
            easing: 'ease-in',
            fill: 'forwards'
          }
        );
        
        anim.onfinish = () => piece.remove();
      }
    }
  });

  // Si se quitó todo pero no hubo animación (ej. rebasaba el límite visual), simplemente renderizar de nuevo
  if (!hasAnim) {
    renderPizza();
  }
}

// Reproducir sonido sutil de corte
function playSliceSound() {
  try {
    // Creamos un oscilador para simular un sonido rápido de "corte" tipo swish
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {
    // Fallback silencioso si el navegador bloquea el AudioContext sin interacción previa
  }
}

function animateCut() {
  const { pizza, cuts } = getPizzaElements();
  if (!cuts || !pizza) return;

  cuts.innerHTML = '';
  updateSummary();

  const angles = getCutAngles(pizzaState.cut);

  angles.forEach((angle, index) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '50%';
    wrapper.style.left = '50%';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    wrapper.style.pointerEvents = 'none';

    // Línea principal
    const line = document.createElement('div');
    line.className = 'cut-line anim';
    line.style.position = 'absolute';
    line.style.left = '50%';
    line.style.top = '7%';
    line.style.transform = 'translateX(-50%)';
    line.style.height = '0%'; 
    line.style.background = '#F9C32C'; // Color de brillo dorado del tema
    line.style.boxShadow = '0 0 15px #F3501D, 0 0 30px #F9C32C';
    line.style.borderRadius = '999px';

    // Chispa en la punta
    const spark = document.createElement('div');
    spark.style.position = 'absolute';
    spark.style.left = '50%';
    spark.style.top = '7%';
    spark.style.transform = 'translate(-50%, -50%)';
    spark.style.width = '8px';
    spark.style.height = '8px';
    spark.style.background = '#fff';
    spark.style.borderRadius = '50%';
    spark.style.boxShadow = '0 0 20px 8px #F9C32C';
    spark.style.opacity = '0';

    wrapper.appendChild(line);
    wrapper.appendChild(spark);
    cuts.appendChild(wrapper);

    const delay = index * 200;
    const duration = 250;

    // Animar la línea creciendo
    line.animate([
      { height: '0%' },
      { height: '86%' }
    ], {
      duration: duration,
      delay: delay,
      easing: 'ease-in-out',
      fill: 'forwards'
    }).onfinish = () => {
      // Al terminar, la línea se apaga y queda como marca/sombra estática
      line.style.background = 'rgba(90, 40, 10, 0.6)';
      line.style.boxShadow = 'none';
      
      playSliceSound();
      
      // Microinteracción: vibración y rebote de la pizza
      pizza.animate([
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(0.97) rotate(-1deg)' },
        { transform: 'scale(1.02) rotate(1deg)' },
        { transform: 'scale(1) rotate(0deg)' }
      ], { duration: 300, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' });
    };

    // Animar chispa moviéndose en la punta
    spark.animate([
      { top: '7%', opacity: 1, transform: 'translate(-50%, -50%) scale(0)' },
      { top: '50%', opacity: 1, transform: 'translate(-50%, -50%) scale(1.5)' },
      { top: '93%', opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      { top: '93%', opacity: 0, transform: 'translate(-50%, -50%) scale(2.5)' }
    ], {
      duration: duration,
      delay: delay,
      easing: 'linear',
      fill: 'forwards'
    });
  });
}