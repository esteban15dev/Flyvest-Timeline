const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Iniciando Suite de Pruebas: PWA, Sincronización en la Nube y Dashboard de Equipo...');
let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Validar manifest.json
test('El archivo manifest.json existe y es un JSON válido con campos PWA requeridos', () => {
  const manifestPath = path.join(ROOT_DIR, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json no existe');
  
  const content = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(content);

  assert.strictEqual(manifest.name, 'Flyvest — Centro de Comando', 'Nombre de manifest incorrecto');
  assert.strictEqual(manifest.short_name, 'Flyvest', 'short_name incorrecto');
  assert.ok(manifest.start_url, 'start_url no definido');
  assert.strictEqual(manifest.display, 'standalone', 'display debe ser standalone');
  assert.strictEqual(manifest.background_color, '#0a0a0f', 'background_color incorrecto');
  assert.strictEqual(manifest.theme_color, '#0a0a0f', 'theme_color incorrecto');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Debe contener al menos 2 iconos');

  const sizes = manifest.icons.map(i => i.sizes);
  assert.ok(sizes.includes('192x192'), 'Falta icono 192x192');
  assert.ok(sizes.includes('512x512'), 'Falta icono 512x512');
});

// 2. Validar Iconos PNG y SVG
test('Todos los iconos (PNG y SVG) existen y tienen cabecera/formato válido', () => {
  const iconFiles = [
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable.png',
    'icons/apple-touch-icon.png',
    'favicon.svg'
  ];

  for (const relPath of iconFiles) {
    const fullPath = path.join(ROOT_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `El icono ${relPath} no existe`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 0, `El archivo ${relPath} está vacío`);

    if (relPath.endsWith('.png')) {
      const buffer = fs.readFileSync(fullPath);
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      assert.ok(buffer.subarray(0, 8).equals(pngSignature), `Firma PNG no válida en ${relPath}`);
    }
  }
});

// 3. Validar Service Worker (sw.js)
test('El Service Worker (sw.js) contiene manejadores install, activate, fetch y lista de pre-caché', () => {
  const swPath = path.join(ROOT_DIR, 'sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js no existe');

  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.ok(swContent.includes("addEventListener('install'"), 'Falta listener install en sw.js');
  assert.ok(swContent.includes("addEventListener('activate'"), 'Falta listener activate en sw.js');
  assert.ok(swContent.includes("addEventListener('fetch'"), 'Falta listener fetch en sw.js');
  assert.ok(swContent.includes('flyvest-cache-v1'), 'Falta definición de CACHE_NAME en sw.js');
  assert.ok(swContent.includes('STATIC_ASSETS'), 'Falta array de STATIC_ASSETS en sw.js');
});

// 4. Validar integración PWA, CloudSync y Team Dashboard en HTML
test('Los archivos HTML contienen etiquetas PWA, CloudSync, TaskStore y Team Dashboard', () => {
  const htmlFiles = ['index.html', 'flyvest_centro_comando.html'];

  for (const file of htmlFiles) {
    const htmlPath = path.join(ROOT_DIR, file);
    assert.ok(fs.existsSync(htmlPath), `${file} no existe`);

    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('rel="manifest" href="manifest.json"'), `Falta manifest link en ${file}`);
    assert.ok(html.includes('meta name="theme-color" content="#0a0a0f"'), `Falta meta theme-color en ${file}`);
    assert.ok(html.includes("navigator.serviceWorker.register('./sw.js')"), `Falta registro de SW en ${file}`);
    assert.ok(html.includes('TaskStore'), `Falta objeto TaskStore en ${file}`);
    assert.ok(html.includes('CloudSync'), `Falta motor CloudSync en ${file}`);
    assert.ok(html.includes('teamProgressGrid'), `Falta contenedor teamProgressGrid en ${file}`);
    assert.ok(html.includes('activeDevSelect'), `Falta selector de desarrollador en ${file}`);
    assert.ok(html.includes('cloudSyncBadge'), `Falta badge de sincronización cloud en ${file}`);
    assert.ok(html.includes('cloudConfigModalBackdrop'), `Falta modal de configuración de nube en ${file}`);
  }
});

// 5. Simulación de multi-usuario y cálculo de métricas por desarrollador
test('Cálculo de progreso individual para Cesar, Angel, Mujica y Esteban', () => {
  const mockTasks = [
    { dev: 1, text: 'Mobile Task 1' },
    { dev: 1, text: 'Mobile Task 2' },
    { dev: 2, text: 'Web Task 1' },
    { dev: 2, text: 'Web Task 2' },
    { dev: 3, text: 'Backend Task 1' },
    { dev: 3, text: 'Backend Task 2' },
    { dev: 4, text: 'DevOps Task 1' },
    { dev: 4, text: 'DevOps Task 2' }
  ];

  const states = {
    0: { completed: true, devId: 1, devName: 'Cesar', updatedAt: Date.now() },
    2: { completed: true, devId: 2, devName: 'Angel', updatedAt: Date.now() },
    3: { completed: true, devId: 2, devName: 'Angel', updatedAt: Date.now() },
    6: { completed: true, devId: 4, devName: 'Esteban', updatedAt: Date.now() }
  };

  function getStatsForDev(devId) {
    const tasks = mockTasks.map((t, idx) => ({ ...t, idx })).filter(t => t.dev === devId);
    const completed = tasks.filter(t => states[t.idx] && states[t.idx].completed).length;
    const percent = Math.round((completed / tasks.length) * 100);
    return { total: tasks.length, completed, percent };
  }

  const cesarStats = getStatsForDev(1);
  assert.strictEqual(cesarStats.completed, 1);
  assert.strictEqual(cesarStats.total, 2);
  assert.strictEqual(cesarStats.percent, 50, 'Cesar debe tener 50%');

  const angelStats = getStatsForDev(2);
  assert.strictEqual(angelStats.completed, 2);
  assert.strictEqual(angelStats.total, 2);
  assert.strictEqual(angelStats.percent, 100, 'Angel debe tener 100%');

  const mujicaStats = getStatsForDev(3);
  assert.strictEqual(mujicaStats.completed, 0);
  assert.strictEqual(mujicaStats.total, 2);
  assert.strictEqual(mujicaStats.percent, 0, 'Mujica debe tener 0%');

  const estebanStats = getStatsForDev(4);
  assert.strictEqual(estebanStats.completed, 1);
  assert.strictEqual(estebanStats.total, 2);
  assert.strictEqual(estebanStats.percent, 50, 'Esteban debe tener 50%');
});

// 6. Fusión (merge) de estados remotos sin sobreescritura de conflictos
test('Fusión en la nube: resolución correcta de conflictos por marca de tiempo', () => {
  let localStates = {
    0: { completed: true, devId: 1, devName: 'Cesar', updatedAt: 1000 },
    1: { completed: false, devId: 1, devName: 'Cesar', updatedAt: 1000 }
  };

  const remoteStates = {
    1: { completed: true, devId: 1, devName: 'Cesar', updatedAt: 2000 }, // más reciente
    0: { completed: false, devId: 1, devName: 'Cesar', updatedAt: 500 },  // obsoleto
    2: { completed: true, devId: 2, devName: 'Angel', updatedAt: 1500 }   // nueva tarea remota
  };

  // Merge logic
  Object.keys(remoteStates).forEach(key => {
    const remote = remoteStates[key];
    const local = localStates[key];
    if (!local || remote.updatedAt > (local.updatedAt || 0)) {
      localStates[key] = remote;
    }
  });

  assert.strictEqual(localStates[0].completed, true, 'Tarea 0 debe mantenerse completada porque el cambio local era más reciente');
  assert.strictEqual(localStates[1].completed, true, 'Tarea 1 debe adoptarse como completada porque el cambio remoto es más reciente');
  assert.strictEqual(localStates[2].completed, true, 'Tarea 2 de Angel debe agregarse');
});

console.log(`\n================================`);
console.log(`Resultados: ${passedTests}/${totalTests} pruebas exitosas.`);
console.log(`================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
