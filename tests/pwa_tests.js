const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Iniciando Suite de Pruebas de PWA y Persistencia de Tareas...');
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
      // Validar firma PNG (\x89PNG\r\n\x1a\n)
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

// 4. Validar integración PWA en index.html y flyvest_centro_comando.html
test('Los archivos HTML contienen etiquetas PWA, Service Worker y TaskStore', () => {
  const htmlFiles = ['index.html', 'flyvest_centro_comando.html'];

  for (const file of htmlFiles) {
    const htmlPath = path.join(ROOT_DIR, file);
    assert.ok(fs.existsSync(htmlPath), `${file} no existe`);

    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('rel="manifest" href="manifest.json"'), `Falta manifest link en ${file}`);
    assert.ok(html.includes('meta name="theme-color" content="#0a0a0f"'), `Falta meta theme-color en ${file}`);
    assert.ok(html.includes('apple-mobile-web-app-capable'), `Falta meta iOS en ${file}`);
    assert.ok(html.includes("navigator.serviceWorker.register('./sw.js')"), `Falta registro de SW en ${file}`);
    assert.ok(html.includes('TaskStore'), `Falta objeto TaskStore en ${file}`);
    assert.ok(html.includes('pwaStatusBadge'), `Falta indicador de estado PWA en ${file}`);
    assert.ok(html.includes('installPwaBtn'), `Falta botón de instalación en ${file}`);
  }
});

// 5. Simulación de lógica de negocio y persistencia de TaskStore
test('Simulación de persistencia y cálculo de progreso de tareas', () => {
  const mockTasks = [
    { dev: 1, text: 'Task 1' },
    { dev: 1, text: 'Task 2' },
    { dev: 2, text: 'Task 3' },
    { dev: 3, text: 'Task 4' }
  ];

  let storage = {};
  const mockLocalStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = v; },
    clear: () => { storage = {}; }
  };

  const STORAGE_KEY = 'flyvest-tasks-v3';

  // Test set empty
  let completed = new Set(JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]'));
  assert.strictEqual(completed.size, 0, 'Inicialmente debe estar vacío');

  // Toggle task 0
  completed.add(0);
  mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));

  // Reload from storage
  let reloaded = new Set(JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]'));
  assert.strictEqual(reloaded.size, 1, 'Debe haber 1 tarea guardada');
  assert.ok(reloaded.has(0), 'La tarea 0 debe estar completada');

  // Toggle task 2
  reloaded.add(2);
  mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([...reloaded]));

  // Verify progress
  const total = mockTasks.length;
  const doneCount = reloaded.size;
  const percent = Math.round((doneCount / total) * 100);
  assert.strictEqual(percent, 50, 'Progreso general debe ser 50% con 2 de 4 tareas');

  // Filter Dev 1
  const dev1Tasks = mockTasks.filter(t => t.dev === 1);
  const dev1Done = dev1Tasks.filter((t, i) => reloaded.has(mockTasks.indexOf(t))).length;
  const dev1Percent = Math.round((dev1Done / dev1Tasks.length) * 100);
  assert.strictEqual(dev1Percent, 50, 'Progreso de Dev 1 debe ser 50% (1 de 2)');
});

console.log(`\n================================`);
console.log(`Resultados: ${passedTests}/${totalTests} pruebas exitosas.`);
console.log(`================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
