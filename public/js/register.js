const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('message');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    const result = await apiRequest('/api/auth/register', 'POST', {
      name,
      email,
      password
    });

    registerMessage.textContent = result.message;

    if (result.ok) {
      window.location.href = '/builder.html';
    }
  });
}