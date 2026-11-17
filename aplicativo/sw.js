// Service worker: guarda los archivos de la app en el celular para usarla sin internet.
// Las medidas y trabajos NO se guardan aquí (van en LocalStorage), así que
// actualizar la app nunca borra los datos de la persona.

// ⚠️ Cambiar VERSION cada vez que se publique un cambio (así el celular se actualiza)
const VERSION = 'mi-taller-v1';

const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/base.css',
  'css/componentes.css',
  'css/pantallas.css',
  'css/impresion.css',
  'js/app.js',
  'js/calculos/costos.js',
  'js/calculos/tela.js',
  'js/calculos/unidades.js',
  'js/calculos/validacion.js',
  'js/datos/almacenamiento.js',
  'js/datos/medidas.js',
  'js/datos/prendas.js',
  'js/moldes/dibujo-svg.js',
  'js/moldes/geometria.js',
  'js/moldes/impresion.js',
  'js/moldes/registro.js',
  'js/moldes/prendas/blusa.js',
  'js/moldes/prendas/camisa-dama.js',
  'js/moldes/prendas/camisa-varon.js',
  'js/moldes/prendas/falda-recta.js',
  'js/moldes/prendas/falda-uniforme.js',
  'js/moldes/prendas/pantalon-dama.js',
  'js/moldes/prendas/pantalon-varon.js',
  'js/moldes/prendas/vestido.js',
  'js/pantallas/costos.js',
  'js/pantallas/cotizaciones.js',
  'js/pantallas/elegir-prenda.js',
  'js/pantallas/guardadas.js',
  'js/pantallas/herramientas.js',
  'js/pantallas/inicio.js',
  'js/pantallas/medidas.js',
  'js/pantallas/molde.js',
  'js/pantallas/tela.js',
  'js/utilidades/formato.js',
  'js/utilidades/pwa.js',
  'js/utilidades/ui.js',
  'js/utilidades/voz.js',
  'img/iconos/icono-192.png',
  'img/iconos/icono-512.png',
  'img/iconos/icono-maskable-512.png',
  'img/iconos/icono.svg',
  'img/iconos/icono-maskable.svg',
  'img/prendas/blusa.svg',
  'img/prendas/camisa-dama.svg',
  'img/prendas/camisa-varon.svg',
  'img/prendas/falda-recta.svg',
  'img/prendas/falda-uniforme.svg',
  'img/prendas/pantalon-dama.svg',
  'img/prendas/pantalon-varon.svg',
  'img/prendas/vestido.svg',
];

// 1. Primera visita con internet: descarga y guarda todo
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS)));
});

// 2. Al activar una versión nueva, borra solo las versiones viejas de la app
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n.startsWith('mi-taller-') && n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// 3. Cada archivo se busca primero en el celular; si no está, en internet
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(request, { ignoreSearch: true }).then((guardado) => guardado ?? fetch(request).then((respuesta) => {
      if (respuesta.ok) {
        const copia = respuesta.clone();
        caches.open(VERSION).then((cache) => cache.put(request, copia));
      }
      return respuesta;
    }).catch(() => (request.mode === 'navigate' ? caches.match('index.html') : Response.error()))),
  );
});

// 4. La página pide usar la versión nueva cuando la persona toca "Actualizar"
self.addEventListener('message', (e) => {
  if (e.data === 'actualizar') self.skipWaiting();
});
