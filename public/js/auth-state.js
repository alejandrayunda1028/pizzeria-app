document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();

    const isLogged = data.ok && data.user;
    
    // Configuración para el NavBar (ej. index.html)
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      if (isLogged) {
        navActions.innerHTML = `
          <div class="user-badge glass-panel" style="display: flex; align-items: center; gap: 10px; padding: 6px 16px; border-radius: 50px;">
            ${data.user.role === 'admin' ? '<a href="/admin.html" class="btn-outline btn-sm" style="border: none; background: transparent; padding: 4px; color: var(--primary);"><i class="bx bx-shield-quarter"></i> Admin</a>' : ''}
            <div class="avatar" style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">
              ${data.user.name.charAt(0).toUpperCase()}
            </div>
            <span style="font-weight: 600; font-family: 'Outfit', sans-serif;">${data.user.name}</span>
            <button onclick="logout()" class="btn-outline" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted); font-size: 1.2rem; display: flex; align-items: center; padding: 4px;">
              <i class='bx bx-log-out'></i>
            </button>
          </div>
        `;
      } else {
        navActions.innerHTML = `
          <a href="/login.html" class="btn btn-outline">Iniciar Sesión</a>
          <a href="/builder.html" class="btn btn-primary">Arma tu Pizza</a>
        `;
      }
    }

    // Configuración para el Builder Topbar
    const sessionInfo = document.getElementById('sessionInfo');
    const topbarActions = document.querySelector('.topbar-actions');
    if (sessionInfo) {
      if (isLogged) {
        sessionInfo.innerHTML = `Chef: <span class="text-gradient" style="font-weight: bold;">${data.user.name}</span>`;
      } else {
        sessionInfo.innerHTML = `Invitado - <a href="/login.html" style="color: var(--primary); text-decoration: underline;">Inicia sesión</a> para guardar`;
      }
    }

    if (topbarActions) {
      const logoutBtn = document.getElementById('logoutBtn');
      if (isLogged && !logoutBtn) {
        const btn = document.createElement('button');
        btn.id = 'logoutBtn';
        btn.className = 'btn-outline btn-sm btn-danger-outline';
        btn.innerHTML = `<i class='bx bx-log-out'></i> Salir`;
        btn.onclick = logout;
        topbarActions.appendChild(btn);
      } else if (!isLogged && logoutBtn) {
        logoutBtn.remove();
      } else if (logoutBtn) {
        logoutBtn.onclick = logout;
      }
    }

  } catch (error) {
    console.error('Error al verificar la sesión:', error);
  }
});

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  } catch (err) {
    console.error('Error cerrando sesión', err);
  }
}
