// App instalable y sin internet: registra el service worker, avisa de
// versiones nuevas, muestra "Sin internet" y ofrece el botón "Instalar"
let pedidoInstalar = null;
let aviso = () => {};

// Botón de instalar: Android/Chrome lo permite; en iPhone se explica cómo
export const esIphone = /iphone|ipad|ipod/i.test(navigator.userAgent);
export const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const puedeInstalar = () => !instalada() && (pedidoInstalar !== null || esIphone);
export const alCambiarInstalar = (fn) => { aviso = fn; };

export async function instalar() {
  if (!pedidoInstalar) return false;
  pedidoInstalar.prompt();
  await pedidoInstalar.userChoice;
  pedidoInstalar = null;
  aviso();
  return true;
}

export function mostrarBarra(texto, boton, accion) {
  document.querySelector('.barra-aviso')?.remove();
  const barra = document.createElement('div');
  barra.className = 'barra-aviso';
  barra.setAttribute('role', 'status');
  barra.innerHTML = `<span>${texto}</span>${boton ? `<button type="button" class="btn btn-principal">${boton}</button>` : ''}
    <button type="button" class="cerrar-aviso" aria-label="Cerrar aviso (se actualiza la próxima vez que abras la app)">✕</button>`;
  barra.querySelector('.btn')?.addEventListener('click', accion);
  // Cerrar: el aviso se va; la versión nueva queda esperando y se usa al volver a abrir la app
  barra.querySelector('.cerrar-aviso').addEventListener('click', () => barra.remove());
  document.body.append(barra);
}

export function iniciarPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pedidoInstalar = e;
    aviso();
  });
  window.addEventListener('appinstalled', () => aviso());

  // Aviso de "Sin internet" (la app sigue funcionando)
  const conexion = () => document.body.classList.toggle('sin-internet', !navigator.onLine);
  window.addEventListener('online', conexion);
  window.addEventListener('offline', conexion);
  conexion();

  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then((registro) => {
    const avisarSiHayNueva = (sw) => {
      if (!sw || !navigator.serviceWorker.controller) return; // primera instalación: no hay nada que avisar
      const listo = () => sw.state === 'installed' && mostrarBarra('Hay una versión nueva de la app.', 'Actualizar', () => sw.postMessage('actualizar'));
      sw.addEventListener('statechange', listo);
      listo();
    };
    avisarSiHayNueva(registro.waiting);
    registro.addEventListener('updatefound', () => avisarSiHayNueva(registro.installing));
  }).catch(() => { /* sin service worker la app igual funciona con internet */ });

  // Cuando la versión nueva toma el control, recargar una sola vez
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return;
    recargando = true;
    location.reload();
  });
}
