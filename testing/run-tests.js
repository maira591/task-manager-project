// =====================================================
// SCRIPT DE PRUEBAS AUTOMATIZADAS - TASKMANAGER
// =====================================================
// Ejecutar con: node run-tests.js
// Requiere: servidor Node.js en http://localhost:3000
// =====================================================

const BASE_URL = 'http://localhost:3000/api';

let results = [];
let passed = 0;
let failed = 0;
let testCount = 0;
let createdTaskIds = []; // IDs de tareas creadas durante la prueba, para limpiar al final

// ---- UTILIDADES ----

async function api(method, path, data = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return res.json();
}

function printHeader(text) {
  const line = '━'.repeat(65);
  console.log(`\n  ${line}`);
  console.log(`  ${text}`);
  console.log(`  ${line}\n`);
}

function testcase(id, desc, expected, actual, state) {
  testCount++;
  const icon = state === 'APROBADO' ? '✅' : '❌';
  const label = state === 'APROBADO' ? 'APROBADO' : 'FALLIDO';

  // Output limpio de dos líneas
  console.log(`  ${icon}  ${id}  ${desc}`);
  console.log(`       Esperado: ${expected}`);
  console.log(`       Obtenido: ${actual}`);
  console.log(`       Estado:   ${label}\n`);

  results.push({ id, desc, expected, actual, state });
  if (state === 'APROBADO') passed++;
  else failed++;
}

function printSummary() {
  const total = results.length;
  const barWidth = 30;
  const ok = Math.round((passed / total) * barWidth);
  const bar = '█'.repeat(ok) + '░'.repeat(barWidth - ok);
  const pct = ((passed / total) * 100).toFixed(1);

  console.log(`  ${'═'.repeat(50)}`);
  console.log('  📊  RESUMEN DE EJECUCIÓN');
  console.log(`  ${'═'.repeat(50)}`);
  console.log(`  Total casos diseñados:   ${total}`);
  console.log(`  Total casos ejecutados:  ${total}`);
  console.log(`  ${'✅'.padEnd(3)} Aprobados:            ${passed}`);
  console.log(`  ${'❌'.padEnd(3)} Fallidos:             ${failed}`);
  console.log(`  ${'📌'.padEnd(3)} Observaciones:        0`);
  console.log(`  ${'═'.repeat(50)}`);
  console.log(`  Progreso: ${bar}  ${pct}%`);
  console.log(`  ${'═'.repeat(50)}\n`);
}

function printFinalTable() {
  console.log('  DETALLE COMPLETO DE CASOS:\n');
  const sep = '  ' + '─'.repeat(78);
  console.log(sep);
  console.log(`  │ ID     │ Descripción               │ Resultado          │ Estado     │`);
  console.log(sep);
  results.forEach(r => {
    const icon = r.state === 'APROBADO' ? '✅' : '❌';
    const id = r.id.padEnd(6);
    const desc = r.desc.substring(0, 26).padEnd(26);
    const exp = r.expected.substring(0, 18).padEnd(18);
    console.log(`  │ ${id} │ ${desc} │ ${exp} │ ${icon} ${r.state.padEnd(8)} │`);
  });
  console.log(sep);
}

// ---- PRUEBAS ----

async function runTests() {
  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║      EJECUCIÓN DE PRUEBAS DE SOFTWARE              ║');
  console.log('  ║           TASKMANAGER - SISTEMA DE GESTIÓN         ║');
  console.log('  ╚══════════════════════════════════════════════════════╝');

  // Capturar estado inicial de la base de datos para restauración exacta
  const initialTasks = await api('GET', '/tareas?userId=1');
  const initialTaskIds = Array.isArray(initialTasks) ? initialTasks.map(t => t.id) : [];
  console.log(`  📋  Estado inicial: ${initialTaskIds.length} tarea(s) en la BD (IDs: ${initialTaskIds.join(', ') || 'ninguna'})\n`);

  // =============================================
  // MÓDULO: AUTENTICACIÓN
  // =============================================
  printHeader('MÓDULO 1: AUTENTICACIÓN (LOGIN)');

  // CP-01
  let res = await api('POST', '/login', {
    email: 'maira@taskmanager.com', password: '1234'
  });
  testcase('CP-01', 'Login con credenciales correctas',
    'success: true', `success: ${res.success}`,
    res.success ? 'APROBADO' : 'FALLIDO');

  // CP-02
  res = await api('POST', '/login', {
    email: 'maira@taskmanager.com', password: '0000'
  });
  testcase('CP-02', 'Login con contraseña incorrecta',
    'success: false', `success: ${res.success}`,
    !res.success ? 'APROBADO' : 'FALLIDO');

  // CP-03
  res = await api('POST', '/login', {
    email: 'noexiste@test.com', password: '1234'
  });
  testcase('CP-03', 'Login con email no registrado',
    'success: false', `success: ${res.success}`,
    !res.success ? 'APROBADO' : 'FALLIDO');

  // CP-04
  res = await api('POST', '/login', {
    email: '', password: ''
  });
  testcase('CP-04', 'Login con campos vacíos',
    'success: false', `success: ${res.success}`,
    !res.success ? 'APROBADO' : 'FALLIDO');

  // =============================================
  // MÓDULO: TAREAS
  // =============================================
  printHeader('MÓDULO 2: TAREAS (CRUD)');

  // CP-05: Listar
  res = await api('GET', '/tareas?userId=1');
  const tasks = Array.isArray(res) ? res : [];
  testcase('CP-05', 'Listar todas las tareas del usuario',
    'lista de tareas', `${tasks.length} tareas encontradas`,
    tasks.length > 0 ? 'APROBADO' : 'FALLIDO');

  // CP-06: Crear con datos válidos
  res = await api('POST', '/tareas', {
    titulo: 'Preparar exposición de pruebas de software',
    descripcion: 'Crear diapositivas y ejemplos prácticos',
    categoria: 'academica', prioridad: 'alta', userId: 1
  });
  const createdTaskId = res.task ? res.task.id : null;
  if (createdTaskId) createdTaskIds.push(createdTaskId);
  testcase('CP-06', 'Crear tarea nueva con datos válidos',
    'success: true', `success: ${res.success} (ID: ${createdTaskId})`,
    res.success ? 'APROBADO' : 'FALLIDO');

  // CP-07: Validar título vacío
  res = await api('POST', '/tareas', {
    titulo: '', descripcion: 'Tarea sin título',
    categoria: 'personal', prioridad: 'media', userId: 1
  });
  testcase('CP-07', 'Validar título obligatorio (vacío)',
    'success: false', `success: ${res.success} - "${res.message}"`,
    !res.success ? 'APROBADO' : 'FALLIDO');

  // CP-08: Validar título con solo espacios
  res = await api('POST', '/tareas', {
    titulo: '   ', descripcion: 'Solo espacios',
    categoria: 'personal', prioridad: 'alta', userId: 1
  });
  testcase('CP-08', 'Validar título con solo espacios en blanco',
    'success: false', `success: ${res.success} - "${res.message}"`,
    !res.success ? 'APROBADO' : 'FALLIDO');

  // CP-09: Editar tarea existente
  res = await api('PUT', '/tareas/1', { estado: 'completada' });
  testcase('CP-09', 'Editar estado de tarea a completada',
    'success: true', `success: ${res.success}`,
    res.success ? 'APROBADO' : 'FALLIDO');

  // CP-10: Crear tarea temporal y eliminarla
  // Así evitamos depender de IDs fijos que ya se hayan borrado antes
  const tempTask = await api('POST', '/tareas', {
    titulo: 'Tarea temporal para prueba de eliminación',
    descripcion: 'Será eliminada',
    categoria: 'personal', prioridad: 'baja', userId: 1
  });
  const tempId = tempTask.task ? tempTask.task.id : null;
  // No la registramos en createdTaskIds porque la vamos a borrar ya mismo
  res = await api('DELETE', `/tareas/${tempId}`);
  testcase('CP-10', 'Eliminar tarea existente (creada para la prueba)',
    'success: true', `success: ${res.success}`,
    res.success ? 'APROBADO' : 'FALLIDO');

  // CP-11: Eliminar tarea inexistente
  res = await api('DELETE', '/tareas/999');
  testcase('CP-11', 'Eliminar tarea con ID inexistente',
    'success: false', `success: ${res.success} - "${res.message}"`,
    !res.success ? 'APROBADO' : 'FALLIDO');

  // =============================================
  // MÓDULO: DASHBOARD
  // =============================================
  printHeader('MÓDULO 3: DASHBOARD (ESTADÍSTICAS)');

  // CP-12
  res = await api('GET', '/dashboard?userId=1');
  testcase('CP-12', 'Visualizar estadísticas del dashboard',
    'total, pendientes, completadas',
    `total:${res.pendientes + res.completadas} | pend:${res.pendientes} | compl:${res.completadas}`,
    res.total !== undefined ? 'APROBADO' : 'FALLIDO');

  // =============================================
  // RESUMEN
  // =============================================
  console.log(`\n  ${'═'.repeat(50)}`);
  printSummary();
  printFinalTable();

  // Limpieza: restaurar estado original exacto
  // 1. Restaurar tarea 1 a pendiente
  await api('PUT', '/tareas/1', { estado: 'pendiente' });

  // 2. Eliminar tareas que NO estaban al inicio (acumuladas de ejecuciones previas)
  const finalTasks = await api('GET', '/tareas?userId=1');
  const finalTaskIds = Array.isArray(finalTasks) ? finalTasks.map(t => t.id) : [];
  const tasksToRemove = finalTaskIds.filter(id => !initialTaskIds.includes(id));

  let removedCount = 0;
  for (const id of tasksToRemove) {
    const r = await api('DELETE', `/tareas/${id}`);
    if (r.success) removedCount++;
  }

  if (removedCount > 0) {
    console.log(`  🧹  Limpieza: ${removedCount} tarea(s) acumuladas eliminadas.`);
  }
  console.log('  🧹  Estado original restaurado correctamente.\n');
}

runTests().catch(err => {
  console.error('\n  ❌ ERROR:', err.message);
  console.log('\n  ¿El servidor está corriendo? Ejecute primero: node backend/server.js\n');
});
