export function showSection(name, event) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const target = document.getElementById('section' + name.charAt(0).toUpperCase() + name.slice(1));
  if (target) {
    target.classList.add('active');
  }

  const titles = { dashboard: 'Dashboard', tareas: 'Mis Tareas', nueva: 'Nueva Tarea' };
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = titles[name] || pageTitle.textContent;
  }

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  if (name === 'dashboard' && window.loadDashboard) {
    window.loadDashboard();
  }

  if (name === 'tareas' && window.loadTasks) {
    window.loadTasks();
  }
}

export function setDate() {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('topbarDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-CO', opts);
  }
}

export function navigationModule() {
  document.querySelectorAll('.nav-link').forEach(link => {
    const section = link.dataset.section;
    if (section) {
      link.addEventListener('click', event => {
        event.preventDefault();
        showSection(section, event);
      });
    }
  });
}

window.showSection = showSection;
