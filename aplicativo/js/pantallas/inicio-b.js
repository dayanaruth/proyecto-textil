// Pantalla: inicio animado (versión de prueba para comparar con el inicio actual)
// Aguja que cose sola, saludo según la hora, consejos que cambian, vitrina de prendas y mosaico de herramientas.
import { PRENDAS } from '../datos/prendas.js';
import { leer } from '../datos/almacenamiento.js';
import { listar as listarPersonas } from '../datos/personas.js';
import { avatar } from '../utilidades/avatares.js';
import { esc } from '../utilidades/ui.js';

const CONSEJOS = [
  'La flecha del hilo del molde va paralela al orillo de la tela.',
  'Lava las telas de algodón antes de cortar: encogen con la primera lavada.',
  'La cinta métrica debe quedar ajustada, pero sin apretar: que pase un dedo.',
  'Ganar 30 % del costo no es lo mismo que 30 % del precio de venta.',
  'Marca los piquetes: te dicen dónde unir cada pieza.',
  'Ata una cinta en la cintura para tomar mejor los largos.',
  'Corregir el molde de papel es gratis; la tela, no.',
  'Mide cuánto tardas con el cronómetro y cobra tu trabajo de verdad.',
];

// Recorrido del hilo: la aguja lo sigue y la puntada aparece detrás
const CAMINO = 'M-10 78 C 50 30, 110 112, 175 70 S 290 30, 370 72';
const sinMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function escenaCostura() {
  const animar = !sinMovimiento();
  return `
  <svg class="escena" viewBox="0 0 360 120" aria-hidden="true">
    <defs>
      <linearGradient id="borde-tela"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff" stop-opacity=".16"/><stop offset=".88" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="hilo-cosido"><path d="${CAMINO}" fill="none" stroke="#fff" stroke-width="10" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${animar ? 100 : 0}">
        ${animar ? '<animate attributeName="stroke-dashoffset" values="100;0;0" keyTimes="0;.8;1" dur="7s" repeatCount="indefinite"/>' : ''}
      </path></mask>
    </defs>
    <path d="M-10 60 Q90 40 180 58 T370 52 V120 H-10 Z" fill="url(#borde-tela)"/>
    <path d="${CAMINO}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-dasharray="2 8"/>
    <path d="${CAMINO}" fill="none" stroke="#FFE3A3" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6" mask="url(#hilo-cosido)"/>
    <g class="boton-flota" style="--d:0s"><circle cx="40" cy="28" r="9" fill="#FFE3A3"/><g fill="#9E2F45"><circle cx="37" cy="25" r="1.4"/><circle cx="43" cy="25" r="1.4"/><circle cx="37" cy="31" r="1.4"/><circle cx="43" cy="31" r="1.4"/></g></g>
    <g class="boton-flota" style="--d:-1.5s"><circle cx="318" cy="100" r="7" fill="#B9D8C2"/><g fill="#2E5E4E"><circle cx="316" cy="98" r="1.1"/><circle cx="320" cy="98" r="1.1"/><circle cx="316" cy="102" r="1.1"/><circle cx="320" cy="102" r="1.1"/></g></g>
    <g class="aguja" ${animar ? '' : 'transform="translate(175 70)"'}>
      ${animar ? `<animateMotion dur="7s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;.8;1" calcMode="linear" path="${CAMINO}"/>` : ''}
      <g transform="translate(-36 -4) scale(1.35)">
        <path d="M0 3 L40 1.2 Q46 3 40 4.8 Z" fill="#E9E4DE" stroke="#6B5E57" stroke-width=".6"/>
        <ellipse cx="35" cy="3" rx="2.6" ry="1" fill="#9E2F45"/>
      </g>
    </g>
  </svg>`;
}

function saludo() {
  const h = new Date().getHours();
  return h < 12 ? '¡Buenos días' : h < 19 ? '¡Buenas tardes' : '¡Buenas noches';
}

const MOSAICO = [
  { ruta: 'guardadas', icono: '📋', nombre: 'Medidas guardadas', color: 'rosa', grande: true },
  { ruta: 'cotizaciones', icono: '📄', nombre: 'Cotizaciones', color: 'azul' },
  { ruta: 'costos', icono: '💰', nombre: 'Calcular precio', color: 'amarillo' },
  { ruta: 'tela', icono: '🧵', nombre: 'Calcular tela', color: 'verde' },
  { ruta: 'ayuda', icono: '❓', nombre: 'Ayuda', color: 'gris' },
  { ruta: 'herramientas', icono: '📏', nombre: 'Aprender y practicar', color: 'lila', grande: true },
];

export function mostrar(main) {
  const nombre = leer('alumna', '').split(' ')[0];
  const personas = listarPersonas().slice(0, 3);
  const prendas = PRENDAS.map((p) => `
    <a class="vitrina-prenda" href="${p.variantes ? `#/prenda/${p.id}` : `#/para/${p.id}`}">
      <img src="${p.img}" alt="" width="72" height="72"><span>${p.nombre}</span></a>`).join('');

  const zona = document.createElement('div');
  zona.className = 'inicio-b';
  main.replaceChildren(zona);
  zona.innerHTML = `
    <section class="heroe">
      <div class="heroe-texto">
        <p class="heroe-saludo">${saludo()}${nombre ? `, ${esc(nombre)}` : ''}! 👋</p>
        <h1>¿Qué vamos a coser hoy?</h1>
      </div>
      ${escenaCostura()}
      <a class="btn btn-grande btn-heroe" href="#/prendas"><span aria-hidden="true">✂️</span> Hacer una prenda</a>
    </section>

    <section class="sabias" aria-live="polite">
      <span class="sabias-icono" aria-hidden="true">💡</span>
      <p><b>¿Sabías que…?</b> <span id="consejo">${CONSEJOS[0]}</span></p>
    </section>

    <h2 class="subtitulo">Elige tu próxima prenda</h2>
    <div class="vitrina" aria-label="Prendas"><div class="vitrina-pista">${prendas}${prendas.replaceAll('<a ', '<a tabindex="-1" aria-hidden="true" ')}</div></div>

    <h2 class="subtitulo">Herramientas</h2>
    <nav class="mosaico">${MOSAICO.map((m, i) => `
      <a class="mosaico-cuadro ${m.color} ${m.grande ? 'grande' : ''}" href="#/${m.ruta}" style="--i:${i}">
        <span class="mosaico-icono" aria-hidden="true">${m.icono}</span>
        <strong>${m.nombre}</strong>
        ${m.ruta === 'guardadas' && personas.length ? `<span class="mini-avatares">${personas.map((p) => `<span class="avatar">${avatar(p.avatar).svg}</span>`).join('')}</span>` : ''}
      </a>`).join('')}
    </nav>
    <a class="enlace" href="#/">Volver al inicio actual</a>`;

  // Un consejo nuevo cada 6 segundos (se detiene al salir de la pantalla)
  let n = 0;
  const cambiar = setInterval(() => {
    const el = zona.querySelector('#consejo');
    if (!document.contains(zona) || !el) return clearInterval(cambiar);
    el.classList.add('saliendo');
    setTimeout(() => {
      n = (n + 1) % CONSEJOS.length;
      el.textContent = CONSEJOS[n];
      el.classList.remove('saliendo');
    }, 350);
  }, 6000);
  return '#/';
}
