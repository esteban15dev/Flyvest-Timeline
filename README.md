# ⚡ Flyvest — Centro de Comando (PWA)

Centro de mando interactivo, arquitectura del sistema, plan financiero y timeline de desarrollo para el proyecto **Flyvest** (SaaS de cobranza en ruta y microcréditos).

---

## 🚀 Características

- **PWA Instalable:** Compatible con Chrome, Edge, Safari (iOS), Android y Firefox Desktop/Mobile.
- **Soporte Offline & Service Worker (`sw.js`):** Funciona sin conexión a internet mediante estrategias de almacenamiento en caché (*Stale-While-Revalidate* y pre-cacheo de assets).
- **Persistencia de Tareas:** Guarda el estado de las tareas completadas en `localStorage` y en `Cache Storage` para máxima redundancia y sincronización offline.
- **Visualizador Paso a Paso:** Desglose técnico de cada requerimiento por desarrollador (Cesar, Angel, Mujica, Esteban).
- **Indicador de Conexión en Tiempo Real:** Detección automática de estado Online / Offline.
- **Acción Rápida de Instalación:** Botón intuitivo para añadir la app al dispositivo.

---

## 📁 Estructura del Proyecto

```
Flyvest-Timeline/
├── index.html                   # Punto de entrada principal PWA
├── flyvest_centro_comando.html  # Vista interactiva del centro de comando
├── manifest.json                # Manifiesto Web App (PWA)
├── sw.js                        # Service Worker con caché offline
├── favicon.svg                  # Favicon vectorial
├── generate_icons.py            # Generador de iconos PWA en Python
├── icons/                       # Iconos en múltiples resoluciones
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable.png
│   └── apple-touch-icon.png
└── tests/                       # Suite de pruebas automatizadas
    └── pwa_tests.js
```

---

## 🧪 Ejecución de Pruebas

Para ejecutar las pruebas de integridad de la PWA, iconos, Service Worker y persistencia:

```bash
node tests/pwa_tests.js
```

---

## 💻 Servidor Local

Para probar la instalación PWA localmente con Service Workers habilitados:

```bash
# Con Node.js (npx)
npx serve .

# O con Python
python -m http.server 8080
```

Visita `http://localhost:8080` en tu navegador.
