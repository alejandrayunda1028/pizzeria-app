document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar Blur Effect on Scroll ---
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(19, 19, 26, 0.9)'; // Darker glass on scroll
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.background = 'var(--glass-bg)';
      navbar.style.boxShadow = 'none';
    }
  });

  // --- Scroll Animations (Intersection Observer) ---
  // Seleccionamos los elementos que queremos animar
  const animatedElements = document.querySelectorAll('.feature-card, .pizza-card, .cta-box, .section-title');
  
  // Añadimos la clase base de animación a todos
  animatedElements.forEach(el => el.classList.add('fade-up'));

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // 15% del elemento debe ser visible para disparar la animación
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Dejar de observar una vez que ya apareció
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
  
  // --- Hero Pizza Parallax (Sutil) ---
  const heroPizza = document.getElementById('heroPizza');
  
  document.addEventListener('mousemove', (e) => {
    if(!heroPizza) return;
    const x = (window.innerWidth - e.pageX * 2) / 90;
    const y = (window.innerHeight - e.pageY * 2) / 90;
    
    // Solo aplicamos transform además de la animación 'float' en css
    heroPizza.style.transform = `translate(${x}px, ${y}px)`;
  });
});
