import { getCurrentUser } from './users.js';
import { loadTasks } from './tasks.js';
import { setDate } from './navigation.js';

const API = 'http://localhost:3000/api';

export function dashboard() {
  console.log('Módulo de dashboard activo');
}

export async function loadDashboard() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const res = await fetch(`${API}/dashboard?userId=${currentUser.id}`);
    const stats = await res.json();

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statPending').textContent = stats.pendientes;
    document.getElementById('statProgress').textContent = stats.enProgreso;
    document.getElementById('statDone').textContent = stats.completadas;
    document.getElementById('numAcademica').textContent = stats.academicas;
    document.getElementById('numPersonal').textContent = stats.personales;

    const total = stats.total || 1;
    document.getElementById('barAcademica').style.width = ((stats.academicas / total) * 100) + '%';
    document.getElementById('barPersonal').style.width = ((stats.personales / total) * 100) + '%';

    const pct = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0;
    document.getElementById('summaryPercent').textContent = pct + '%';
    document.getElementById('summaryToday').textContent = stats.pendientes + ' tareas';
    document.getElementById('summaryHigh').textContent = '—';
  } catch (err) {
    console.error('Error cargando dashboard:', err);
  }
}

window.refreshDashboard = loadDashboard;

export async function bootstrapDashboard() {
  setDate();
  await loadDashboard();
  await loadTasks();
}
