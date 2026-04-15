const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// =====================================================
// MÓDULO DE BASE DE DATOS (SQLite simulado con JSON)
// =====================================================
const DB_FILE = path.join(__dirname, '../database/db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [
        { id: 1, nombre: 'Maira Susana', email: 'maira@taskmanager.com', password: '1234', rol: 'admin' }
      ],
      tasks: [
        { id: 1, titulo: 'Testtt', descripcion: 'Testtt', categoria: 'academica', prioridad: 'alta', estado: 'pendiente', userId: 1, fecha_creacion: '2026-04-13' },
        { id: 2, titulo: 'Estudiar Node.js', descripcion: 'Repasar módulos y Express', categoria: 'academica', prioridad: 'media', estado: 'en progreso', userId: 1, fecha_creacion: '2026-04-13' },
        { id: 3, titulo: 'Comprar mercado', descripcion: 'Lista del supermercado', categoria: 'personal', prioridad: 'baja', estado: 'completada', userId: 1, fecha_creacion: '2026-04-12' }
      ],
      nextTaskId: 4
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// =====================================================
// MÓDULO DE AUTENTICACIÓN (Login)
// =====================================================
function handleLogin(body) {
  const db = loadDB();
  const { email, password } = body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (user) {
    return { success: true, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } };
  }
  return { success: false, message: 'Credenciales incorrectas' };
}

// =====================================================
// MÓDULO DE TAREAS (CRUD)
// =====================================================
function getTasks(userId) {
  const db = loadDB();
  return db.tasks.filter(t => t.userId === parseInt(userId));
}

function createTask(body) {
  const db = loadDB();
  const task = {
    id: db.nextTaskId++,
    titulo: body.titulo,
    descripcion: body.descripcion || '',
    categoria: body.categoria || 'personal',
    prioridad: body.prioridad || 'media',
    estado: 'pendiente',
    userId: parseInt(body.userId),
    fecha_creacion: new Date().toISOString().split('T')[0]
  };
  db.tasks.push(task);
  saveDB(db);
  return { success: true, task };
}

function updateTask(id, body) {
  const db = loadDB();
  const idx = db.tasks.findIndex(t => t.id === parseInt(id));
  if (idx === -1) return { success: false, message: 'Tarea no encontrada' };
  db.tasks[idx] = { ...db.tasks[idx], ...body };
  saveDB(db);
  return { success: true, task: db.tasks[idx] };
}

function deleteTask(id) {
  const db = loadDB();
  const idx = db.tasks.findIndex(t => t.id === parseInt(id));
  if (idx === -1) return { success: false, message: 'Tarea no encontrada' };
  db.tasks.splice(idx, 1);
  saveDB(db);
  return { success: true };
}

// =====================================================
// MÓDULO DASHBOARD (Estadísticas)
// =====================================================
function getDashboardStats(userId) {
  const db = loadDB();
  const tasks = db.tasks.filter(t => t.userId === parseInt(userId));
  return {
    total: tasks.length,
    pendientes: tasks.filter(t => t.estado === 'pendiente').length,
    enProgreso: tasks.filter(t => t.estado === 'en progreso').length,
    completadas: tasks.filter(t => t.estado === 'completada').length,
    academicas: tasks.filter(t => t.categoria === 'academica').length,
    personales: tasks.filter(t => t.categoria === 'personal').length
  };
}

// =====================================================
// SERVIDOR HTTP
// =====================================================
const FRONTEND_DIR = path.join(__dirname, '../frontend');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ---- API ROUTES ----
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};

        // POST /api/login
        if (pathname === '/api/login' && req.method === 'POST') {
          return res.end(JSON.stringify(handleLogin(data)));
        }

        // GET /api/tareas?userId=1
        if (pathname === '/api/tareas' && req.method === 'GET') {
          return res.end(JSON.stringify(getTasks(parsedUrl.query.userId)));
        }

        // POST /api/tareas
        if (pathname === '/api/tareas' && req.method === 'POST') {
          return res.end(JSON.stringify(createTask(data)));
        }

        // PUT /api/tareas/:id
        if (pathname.startsWith('/api/tareas/') && req.method === 'PUT') {
          const id = pathname.split('/')[3];
          return res.end(JSON.stringify(updateTask(id, data)));
        }

        // DELETE /api/tareas/:id
        if (pathname.startsWith('/api/tareas/') && req.method === 'DELETE') {
          const id = pathname.split('/')[3];
          return res.end(JSON.stringify(deleteTask(id)));
        }

        // GET /api/dashboard?userId=1
        if (pathname === '/api/dashboard' && req.method === 'GET') {
          return res.end(JSON.stringify(getDashboardStats(parsedUrl.query.userId)));
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));

      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ---- ARCHIVOS ESTÁTICOS (Frontend) ----
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(FRONTEND_DIR, filePath);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(FRONTEND_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
  };

  res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
  res.end(fs.readFileSync(filePath));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('=========================================');
  console.log('  SISTEMA DE GESTIÓN DE TAREAS - ACTIVO ');
  console.log('=========================================');
  console.log(`  URL: http://localhost:${PORT}`);
  console.log('  Módulos activos:');
  console.log('    ✓ Módulo Login (Autenticación)');
  console.log('    ✓ Módulo Tareas (CRUD)');
  console.log('    ✓ Módulo Dashboard (Estadísticas)');
  console.log('=========================================');
});
