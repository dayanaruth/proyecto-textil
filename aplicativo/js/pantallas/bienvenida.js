// Pantalla: bienvenida (3 pantallas cortas la primera vez que se abre la app)
import { guardar } from '../datos/almacenamiento.js';
import { PRENDAS } from '../datos/prendas.js';
import { puedeInstalar, esIphone, instalar, instalada } from '../utilidades/pwa.js';

// Dibujo de un celular con el ícono de la app y una flecha de "instalar"
const CELULAR = `
  <svg viewBox="0 0 160 150" aria-hidden="true">
    <rect x="45" y="6" width="70" height="138" rx="12" fill="#2B2420"/>
    <rect x="50" y="18" width="60" height="114" rx="4" fill="#FBF7F2"/>
    <g transform="translate(57 26)"><rect width="20" height="20" rx="5" fill="#9E2F45"/>
      <g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="14" r="2.2"/><circle cx="13" cy="14" r="2.2"/><path d="M8.5 12 L14 5 M11.5 12 L6 5"/></g></g>
    <rect x="83" y="26" width="20" height="20" rx="5" fill="#A9C6E8"/>
    <rect x="57" y="52" width="20" height="20" rx="5" fill="#B9D8C2"/><rect x="83" y="52" width="20" height="20" rx="5" fill="#F2C6A0"/>
    <text x="67" y="84" font-size="6" text-anchor="middle" fill="#2B2420" font-family="system-ui">Mi Taller</text>
    <path d="M140 20 Q150 40 125 46" fill="none" stroke="#9E2F45" stroke-width="3" stroke-linecap="round"/>
    <path d="M128 39 L124 47 L133 48" fill="none" stroke="#9E2F45" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="114" y="114" width="44" height="24" rx="12" fill="#E3F2EC"/>
    <text x="136" y="130" font-size="11" text-anchor="middle" fill="#1E5A38" font-family="system-ui" font-weight="700">✈️ ✓</text>
  </svg>`;

const PASOS = [
  ['📏', 'Medidas', 'con dibujos'],
  ['📐', 'Molde', 'paso a paso'],
  ['🧵', 'Tela', 'cuánta comprar'],
  ['💰', 'Precio', 'cuánto cobrar'],
];

function pantallas() {
  const instalar = puedeInstalar() && !esIphone
    ? '<button type="button" class="btn btn-principal btn-ancho" data-instalar>📲 Instalar ahora</button>' : '';
  return [
    {
      titulo: '¡Bienvenida a Mi Taller!',
      texto: 'Tu ayudante para coser: saca tus moldes, calcula la tela y sabe cuánto cobrar. Hecho para el taller de Corte y Confección.',
      dibujo: `<div class="bienvenida-prendas">${PRENDAS.map((p) => `<img src="${p.img}" alt="" width="64" height="64">`).join('')}</div>`,
    },
    {
      titulo: 'Así funciona',
      texto: 'Elige la prenda y sigue los pasos. Además puedes guardar medidas, hacer cotizaciones y practicar con ejercicios.',
      dibujo: `<ol class="bienvenida-pasos">${PASOS.map(([i, t, s], n) => `
        <li><span class="bienvenida-icono">${i}</span><b>${n + 1}. ${t}</b><small>${s}</small></li>`).join('')}</ol>`,
    },
    {
      titulo: 'Tenla siempre a mano',
      texto: instalada()
        ? 'Ya la tienes instalada. Funciona aunque no tengas internet.'
        : esIphone
          ? 'En iPhone: toca Compartir (el cuadrado con la flecha) y luego «Agregar a inicio». Después funciona sin internet.'
          : 'Instálala en tu celular: queda como una app más y funciona sin internet. En Chrome: menú ⋮ → «Instalar app».',
      dibujo: `<div class="bienvenida-celular">${CELULAR}</div>${instalada() ? '' : instalar}`,
    },
  ];
}

export function mostrar(main) {
  const lista = pantallas();
  let i = 0;
  const zona = document.createElement('div');
  zona.className = 'bienvenida-zona';
  main.replaceChildren(zona);

  const terminar = () => {
    guardar('bienvenida', true);
    location.hash = '#/';
  };
  const pintar = () => {
    const p = lista[i];
    const ultima = i === lista.length - 1;
    zona.innerHTML = `
      <button type="button" class="saltar" data-saltar>Saltar</button>
      <div class="bienvenida-dibujo">${p.dibujo}</div>
      <h1>${p.titulo}</h1>
      <p class="bienvenida-texto">${p.texto}</p>
      <div class="puntos" aria-label="Pantalla ${i + 1} de ${lista.length}">${lista.map((_, n) => `<span class="${n === i ? 'activo' : ''}"></span>`).join('')}</div>
      <div class="acciones">
        ${i > 0 ? '<button type="button" class="btn btn-secundario" data-ir="-1">◀ Atrás</button>' : ''}
        <button type="button" class="btn btn-principal" data-ir="1">${ultima ? '¡Empezar! ✂️' : 'Siguiente ▶'}</button>
      </div>`;
    zona.querySelector('[data-ir="1"]').focus();
  };
  const ir = (paso) => {
    if (i + paso >= lista.length) return terminar();
    i = Math.max(0, i + paso);
    pintar();
  };

  zona.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.saltar != null) return terminar();
    if (b.dataset.instalar != null) { await instalar(); b.remove(); return; }
    if (b.dataset.ir) ir(Number(b.dataset.ir));
  });
  // Deslizar con el dedo: a la izquierda avanza, a la derecha retrocede
  let x0 = null;
  zona.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  zona.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 60) ir(dx < 0 ? 1 : -1);
  });
  pintar();
  return '#/';
}
