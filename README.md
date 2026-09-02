# ⚡ Flyvest — Centro de Comando (PWA con Sincronización en la Nube)

Centro de mando interactivo, arquitectura del sistema, plan financiero, timeline de desarrollo y **seguimiento de avance de equipo en la nube** para el proyecto **Flyvest** (SaaS de cobranza en ruta y microcréditos).

---

## 🚀 Características Principales

- **☁️ Sincronización en la Nube Multi-usuario:** Guarda y sincroniza en tiempo real las tareas completadas por cada miembro del equipo (**Cesar, Angel, Mujica y Esteban**).
- **👥 Panel de Progreso del Equipo:** 4 tarjetas interactivas con el porcentaje de avance, tareas finalizadas y métricas individuales por desarrollador.
- **👤 Selector de Perfil Activo:** Permite identificarte como el desarrollador que realiza las tareas (*"Soy Cesar"*, *"Soy Angel"*, *"Soy Mujica"*, *"Soy Esteban"* o *"Modo Observador"*).
- **⚡ Compatibilidad con Supabase & Cloud API:** Integración directa con base de datos Supabase o almacenamiento en la nube automático sin configuración previa.
- **📱 PWA Instalable:** Compatible con Chrome, Edge, Safari (iOS), Android y Firefox Desktop/Mobile con soporte de pantalla completa.
- **📶 Arquitectura Offline-First:** Funciona sin conexión a internet mediante Service Worker (`sw.js`) y `Cache Storage`. Al recuperar conexión, sincroniza automáticamente los cambios pendientes.
- **📋 Visualizador Técnico Paso a Paso:** Desglose de arquitectura, archivos a modificar, comandos y entregable esperado por cada tarea.

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

Para ejecutar las pruebas automatizadas (PWA, Service Worker, multi-usuario, cálculo de métricas y resolución de conflictos):

```bash
node tests/pwa_tests.js
```

---

## 💻 Servidor Local

Para probar la PWA localmente con Service Workers y sincronización activa:

```bash
# Con Node.js (npx)
npx serve .

# O con Python
python -m http.server 8080
```

Visita `http://localhost:8080` en tu navegador.
