import { getCurrentUser } from './users.js';

const API = 'http://localhost:3000/api';

let allTasks = [];

export async function loadTasks() {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        const res = await fetch(`${API}/tareas?userId=${currentUser.id}`);
        const tasks = await res.json();
        allTasks = tasks;
        renderTasks(tasks);
    } catch (err) {
        console.error('Error cargando tareas:', err);
    }
}

export function renderTasks(tasks) {
    const container = document.getElementById('tasksList');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:40px;">No hay tareas que mostrar.</div>';
        return;
    }

    container.innerHTML = tasks.map(task => `
    <div class="task-card" id="task-${task.id}">
      <div class="task-checkbox ${task.estado === 'completada' ? 'checked' : ''}" onclick="toggleTask(${task.id})">
        ${task.estado === 'completada' ? '✓' : ''}
      </div>
      <div class="task-body">
        <div class="task-title ${task.estado === 'completada' ? 'done' : ''}">${task.titulo}</div>
        <div class="task-meta">
          <span class="tag tag-${task.categoria}">${task.categoria === 'academica' ? '📚 Académica' : '🏠 Personal'}</span>
          <span class="tag tag-${task.prioridad}">${task.prioridad === 'alta' ? '🔴' : task.prioridad === 'media' ? '🟡' : '🟢'} ${task.prioridad}</span>
          <span class="tag tag-${task.estado.replace(' ', '')}">${task.estado}</span>
        </div>
        ${task.descripcion ? `<div style="font-size:13px;color:#6B7280;margin-top:6px;">${task.descripcion}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn btn-sm" onclick="openEdit(${task.id})" style="background:#EEF2FF;color:#4F46E5;">✏️ Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

export function filterTasks() {
    const estado = document.getElementById('filterEstado').value;
    const categoria = document.getElementById('filterCategoria').value;
    let filtered = allTasks;
    if (estado) filtered = filtered.filter(t => t.estado === estado);
    if (categoria) filtered = filtered.filter(t => t.categoria === categoria);
    renderTasks(filtered);
}

export async function toggleTask(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    const newEstado = task.estado === 'completada' ? 'pendiente' : 'completada';
    await fetch(`${API}/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado })
    });
    await loadTasks();
    if (window.refreshDashboard) await window.refreshDashboard();
}

export async function deleteTask(id) {
    await fetch(`${API}/tareas/${id}`, {
        method: 'DELETE'
    });
    await loadTasks();
    if (window.refreshDashboard) await window.refreshDashboard();
}

export async function createTask() {
    const titulo = document.getElementById('newTitle').value.trim();
    const desc = document.getElementById('newDesc').value.trim();
    const categoria = document.getElementById('newCategoria').value;
    const prioridad = document.getElementById('newPrioridad').value;
    const msgDiv = document.getElementById('formMsg');
    const currentUser = getCurrentUser();

    if (!titulo) {
        msgDiv.textContent = 'El título es obligatorio.';
        msgDiv.className = 'form-msg error';
        msgDiv.style.display = 'block';
        return;
    }

    if (!currentUser) {
        msgDiv.textContent = 'Debes iniciar sesión para crear una tarea.';
        msgDiv.className = 'form-msg error';
        msgDiv.style.display = 'block';
        return;
    }

    const res = await fetch(`${API}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion: desc, categoria, prioridad, userId: currentUser.id })
    });
    const data = await res.json();

    if (data.success) {
        document.getElementById('newTitle').value = '';
        document.getElementById('newDesc').value = '';
        msgDiv.textContent = '✓ Tarea creada exitosamente.';
        msgDiv.className = 'form-msg success';
        msgDiv.style.display = 'block';
        setTimeout(() => msgDiv.style.display = 'none', 3000);
        await loadTasks();
        if (window.refreshDashboard) await window.refreshDashboard();
    }
}
export function openEdit(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    document.getElementById('editId').value = id;
    document.getElementById('editTitle').value = task.titulo;
    document.getElementById('editDesc').value = task.descripcion;
    document.getElementById('editEstado').value = task.estado;
    document.getElementById('editPrioridad').value = task.prioridad;
    document.getElementById('editModal').style.display = 'flex';
}

export function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

export async function saveEdit() {
    const id = document.getElementById('editId').value;
    const titulo = document.getElementById('editTitle').value.trim();
    const descripcion = document.getElementById('editDesc').value;
    const estado = document.getElementById('editEstado').value;
    const prioridad = document.getElementById('editPrioridad').value;

    await fetch(`${API}/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, estado, prioridad })
    });
    closeModal();
    await loadTasks();
    if (window.refreshDashboard) await window.refreshDashboard();
}

// Exponer algunas funciones para handlers inline.
window.toggleTask = toggleTask;
window.openEdit = openEdit;
window.deleteTask = deleteTask;
window.closeModal = closeModal;
window.saveEdit = saveEdit;
window.filterTasks = filterTasks;
window.createTask = createTask;
window.loadTasks = loadTasks;
