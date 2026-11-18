// Pantalla de entrada corta: se ve cada vez que se abre la app (una vez por sesión).
// Logo del CEA y "Mi Taller" en el centro, las figuras del marco a los costados y un hilo que se cose.
// Pasa sola al inicio a los 3 segundos, o antes si se toca la pantalla.
import { activarMarco } from '../utilidades/marco.js';

const DURACION = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1500 : 3000;

export function mostrar(main) {
  const zona = document.createElement('div');
  zona.className = 'entrada-zona';
  zona.style.setProperty('--duracion', `${DURACION}ms`);
  zona.innerHTML = `
    <img class="entrada-logo" src="img/logo-cea.webp" alt="Logo del C.E.A. Man Césped" width="160" height="160">
    <h1 class="entrada-titulo">Mi Taller</h1>
    <p class="entrada-sub">Corte y Confección · C.E.A. «Man Césped»</p>
    <div class="entrada-hilo" aria-hidden="true"><span></span></div>
    <button type="button" class="entrada-tocar">Toca para entrar</button>`;
  main.replaceChildren(zona);
  activarMarco('#/entrada', { rapido: true });

  let listo = false;
  const entrar = () => {
    if (listo) return;
    listo = true;
    clearTimeout(reloj);
    if (location.hash.startsWith('#/entrada')) location.replace('#/');
  };
  const reloj = setTimeout(entrar, DURACION);
  zona.addEventListener('click', entrar);
  window.addEventListener('hashchange', () => clearTimeout(reloj), { once: true });
  return '#/';
}
