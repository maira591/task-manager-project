// Este módulo gestiona Usuarios.
export let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function userModule() {
  console.log('Módulo de usuarios activo');

  const logoutButton = document.querySelector('.btn-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
}

export function setCurrentUser(user) {
  currentUser = user;
  const sidebarUser = document.getElementById('sidebarUser');
  if (sidebarUser && currentUser) {
    const nombres = currentUser.nombre.split(' ');
    sidebarUser.textContent = `${nombres[0] || ''} ${nombres[1] || ''}`.trim();
  }
}

export function logout() {
  currentUser = null;
  const sidebarUser = document.getElementById('sidebarUser');
  if (sidebarUser) sidebarUser.textContent = 'Invitado';
  document.getElementById('appPage').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  const passwordInput = document.getElementById('loginPassword');
  if (passwordInput) passwordInput.value = '';
}

window.logout = logout;
