import { setCurrentUser } from './users.js';
import { bootstrapDashboard } from './dashboard.js';
import { setDate, showSection } from './navigation.js';

const API = 'http://localhost:3000/api';

export function login() {
  console.log('Módulo de login activo');

  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('loginPage').classList.contains('active')) {
      handleLogin();
    }
  });
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  if (!email || !password) {
    errorDiv.textContent = 'Por favor ingresa tu correo y contraseña.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      setCurrentUser(data.user);
      errorDiv.style.display = 'none';
      document.getElementById('loginPage').classList.remove('active');
      document.getElementById('appPage').classList.add('active');
      showSection('dashboard');
      setDate();
      await bootstrapDashboard();
    } else {
      errorDiv.textContent = data.message || 'Credenciales incorrectas.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexión. Verifica que el servidor esté activo.';
    errorDiv.style.display = 'block';
  }
}
