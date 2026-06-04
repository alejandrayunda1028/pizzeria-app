document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar: mantiene el gradiente rojo siempre, solo refuerza sombra al hacer scroll ---
  const navbar = document.querySelector('.navbar');
  const NAV_BG = 'linear-gradient(135deg, #B83008 0%, #D93B0A 60%, #E84B1C 100%)';

  // Establece el fondo correcto desde el primer momento (evita parpadeo)
  navbar.style.background = NAV_BG;

  window.addEventListener('scroll', () => {
    navbar.style.background = NAV_BG;
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 6px 32px rgba(150, 30, 0, 0.55)';
    } else {
      navbar.style.boxShadow = '0 4px 24px rgba(180, 40, 0, 0.40)';
    }
  }, { passive: true });

  // --- Scroll Animations (Intersection Observer) ---
  const animatedElements = document.querySelectorAll('.feature-card, .pizza-card, .cta-box, .section-title');
  animatedElements.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.12 });

  animatedElements.forEach(el => observer.observe(el));

  // --- Hero Pizza Parallax (sutil) ---
  const heroPizza = document.getElementById('heroPizza');
  document.addEventListener('mousemove', (e) => {
    if (!heroPizza) return;
    const x = (window.innerWidth  - e.pageX * 2) / 90;
    const y = (window.innerHeight - e.pageY * 2) / 90;
    heroPizza.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });

});
