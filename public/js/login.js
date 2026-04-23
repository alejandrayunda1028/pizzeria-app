const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const btnShowLogin = document.getElementById('btnShowLogin');
const btnShowRegister = document.getElementById('btnShowRegister');
const authMessage = document.getElementById('authMessage');
const authSubtitle = document.querySelector('.auth-subtitle');

// Toggle Logic
function switchTab(tab) {
  authMessage.textContent = '';
  authMessage.className = 'auth-message';
  
  if (tab === 'login') {
    btnShowLogin.classList.add('active');
    btnShowRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    authSubtitle.textContent = 'Ingresa para crear tu pizza ideal';
  } else {
    btnShowRegister.classList.add('active');
    btnShowLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    authSubtitle.textContent = 'Únete y descubre la mejor pizza';
  }
}

btnShowLogin.addEventListener('click', () => switchTab('login'));
btnShowRegister.addEventListener('click', () => switchTab('register'));

// Helper to show message
function showMessage(msg, isError = false) {
  authMessage.textContent = msg;
  authMessage.className = `auth-message ${isError ? 'error' : 'success'}`;
}

// Login Submit
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Entrando...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      const result = await apiRequest('/api/auth/login', 'POST', { email, password });

      if (result.ok) {
        showMessage('¡Acceso exitoso! Redirigiendo...', false);
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/index.html';
        
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 800);
      } else {
        showMessage(result.message || 'Error al iniciar sesión', true);
      }
    } catch (error) {
      showMessage('Error de conexión', true);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Register Password Validation
const regPassword = document.getElementById('regPassword');
const hintLength = document.getElementById('hint-length');
const hintUpper = document.getElementById('hint-upper');
const hintLower = document.getElementById('hint-lower');
const hintNumber = document.getElementById('hint-number');
const hintSpecial = document.getElementById('hint-special');

let isPasswordValid = false;

if (regPassword) {
  regPassword.addEventListener('input', (e) => {
    const val = e.target.value;
    
    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /\d/.test(val);
    const hasSpecial = /[\W_]/.test(val);
    
    hintLength.classList.toggle('valid', hasLength);
    hintUpper.classList.toggle('valid', hasUpper);
    hintLower.classList.toggle('valid', hasLower);
    hintNumber.classList.toggle('valid', hasNumber);
    hintSpecial.classList.toggle('valid', hasSpecial);

    isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
  });
}

// Register Submit
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    if (!isPasswordValid) {
      showMessage('La contraseña no cumple con los requisitos mínimos', true);
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Creando...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(registerForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');

      const result = await apiRequest('/api/auth/register', 'POST', { name, email, password });

      if (result.ok) {
        showMessage('¡Cuenta creada exitosamente! Por favor inicia sesión.', false);
        setTimeout(() => {
          switchTab('login');
          const loginEmailInput = loginForm.querySelector('input[name="email"]');
          if (loginEmailInput) loginEmailInput.value = email;
        }, 1500);
      } else {
        showMessage(result.message || 'Error al registrarse', true);
      }
    } catch (error) {
      showMessage('Error de conexión', true);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Check if tab is passed in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('tab') === 'register') {
  switchTab('register');
}