// Pantalla: herramientas para aprender y practicar (menú, conversor y guía de medidas)
import { UNIDADES, convertir, leerFraccion } from '../calculos/unidades.js';
import { MEDIDAS, ZONAS, medidasDe, figuraMedida, figuraZona } from '../datos/medidas.js';
import * as personas from '../datos/personas.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { revisarMedida } from '../calculos/validacion.js';
import { AVATARES, avatar } from '../utilidades/avatares.js';
import { numero } from '../utilidades/formato.js';
import { hayVoz, hablar } from '../utilidades/voz.js';
import * as diccionario from './diccionario.js';
import * as ejercicios from './ejercicios.js';

const OPCIONES = [
  { ruta: 'conversor', icono: '📏', nombre: 'Conversor de medidas', desc: 'Centímetros, metros, pulgadas y yardas' },
  { ruta: 'guia', icono: '📖', nombre: 'Cómo tomar medidas', desc: 'Consejos, el orden y práctica en pareja' },
  { ruta: 'diccionario', icono: '📚', nombre: 'Diccionario de costura', desc: 'Palabras del taller, cuellos, mangas y bolsillos' },
  { ruta: 'ejercicios', icono: '✏️', nombre: 'Ejercicios para practicar', desc: 'Pon a prueba lo que sabes, por niveles' },
];

export function mostrar(main, [a, ...resto]) {
  if (a === 'conversor') return conversor(main);
  if (a === 'guia') return guia(main, resto);
  if (a === 'diccionario') return diccionario.mostrar(main, resto);
  if (a === 'ejercicios') return ejercicios.mostrar(main, resto);
  main.innerHTML = `
    <h1>Aprender y practicar</h1>
    <p class="ayuda">Herramientas para el taller y para estudiar.</p>
    <nav class="menu">${OPCIONES.map((o) => `
      <a class="menu-item" href="#/herramientas/${o.ruta}">
        <span class="menu-icono" aria-hidden="true">${o.icono}</span>
        <span><strong>${o.nombre}</strong><small>${o.desc}</small></span>
      </a>`).join('')}
    </nav>`;
  return '#/';
}

// ---------- Conversor ----------
const fraccionOctavos = (pulgadas) => {
  const octavos = Math.round(pulgadas * 8);
  const entero = Math.floor(octavos / 8);
  let resto = octavos % 8, den = 8;
  while (resto && resto % 2 === 0) { resto /= 2; den /= 2; }
  return resto ? `${entero ? `${entero} ` : ''}${resto}/${den}` : String(entero);
};

function conversor(main) {
  let de = leer('conversor-unidad', 'cm');
  main.innerHTML = `
    <h1>Conversor de medidas</h1>
    <p class="ayuda">Escribe una medida y elige en qué está. También puedes escribir fracciones: 1 1/2.</p>
    <div class="campo"><input id="valor" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Medida"></div>
    <div class="selector" role="group" aria-label="Está en">${Object.entries(UNIDADES).map(([id, u]) => `
      <button type="button" data-de="${id}">${u.nombre}</button>`).join('')}</div>
    <p class="error" id="error" role="alert"></p>
    <div class="resultados-conv" id="resultados" aria-live="polite"></div>
    <div class="regla" id="regla"></div>
    <section class="cuadro equivalencias">
      <h2>Para recordar</h2>
      <ul>
        <li><b>1 metro</b> = 100 centímetros</li>
        <li><b>1 pulgada</b> = 2,54 centímetros</li>
        <li><b>1 yarda</b> = 36 pulgadas = 91,44 cm (casi un metro)</li>
        <li><b>1 metro</b> ≈ 1,09 yardas ≈ 39,4 pulgadas</li>
      </ul>
    </section>`;
  const $ = (s) => main.querySelector(s);
  const actualizar = () => {
    main.querySelectorAll('[data-de]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.de === de));
    const texto = $('#valor').value;
    const v = leerFraccion(texto);
    $('#error').textContent = texto.trim() && !(v >= 0) ? 'Escribe solo números, por ejemplo 32, 1,5 o 1 1/2.' : '';
    if (!(v >= 0)) { $('#resultados').innerHTML = ''; $('#regla').innerHTML = ''; return; }
    $('#resultados').innerHTML = Object.entries(UNIDADES).filter(([id]) => id !== de).map(([id, u]) => {
      const r = convertir(v, de, id);
      // En pulgadas también se muestra la fracción más cercana (en octavos), como en las reglas de costura
      const extra = id === 'pulgada' && r % 1 > 0.001 ? `<small>≈ ${fraccionOctavos(r)} pulg.</small>` : '';
      return `<div class="resultado-conv"><b>${numero(Math.round(r * 100) / 100)}</b><span>${u.nombre}</span>${extra}</div>`;
    }).join('');
    // Regla: muestra el largo en centímetros
    const cm = convertir(v, de, 'cm');
    const tope = [10, 20, 50, 100, 150, 200, 300, 500, 1000].find((t) => t >= cm) ?? Math.ceil(cm / 100) * 100;
    const paso = tope / 10;
    $('#regla').innerHTML = `
      <svg viewBox="-4 0 108 26" role="img" aria-label="${numero(Math.round(cm * 10) / 10)} centímetros en la regla">
        <rect x="0" y="2" width="100" height="10" rx="1" fill="#F4EEE6" stroke="#8A7A6E" stroke-width=".3"/>
        <rect x="0" y="2" width="${Math.min(100, (cm / tope) * 100)}" height="10" rx="1" fill="#9E2F45" fill-opacity=".75"/>
        ${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 10} 12 V15" stroke="#2B2420" stroke-width=".3"/>
          <text x="${i * 10}" y="20" font-size="3" text-anchor="middle" fill="#6B5E57">${numero(i * paso)}</text>`).join('')}
        <text x="50" y="25.5" font-size="3" text-anchor="middle" fill="#6B5E57">centímetros</text>
      </svg>`;
  };
  main.querySelector('.selector').addEventListener('click', (e) => {
    const b = e.target.closest('[data-de]');
    if (!b) return;
    de = b.dataset.de;
    guardar('conversor-unidad', de);
    actualizar();
  });
  $('#valor').addEventListener('input', actualizar);
  actualizar();
  return '#/herramientas';
}

// ---------- Guía de medidas ----------
const CONSEJOS = [
  ['📏', 'Usa una cinta métrica que no esté estirada ni rota.'],
  ['👕', 'La persona debe tener ropa delgada, sin chompa ni cinturón.'],
  ['🧍', 'Postura natural: de pie, mirando al frente, sin meter la panza.'],
  ['🎀', 'Ata una cinta o elástico en la cintura: así marcas dónde está y mides mejor los largos.'],
  ['✋', 'La cinta ajustada pero sin apretar: debe pasar un dedo por debajo.'],
  ['📝', 'Escribe cada medida en el momento. No confíes en la memoria.'],
];
const ordenDe = (tipo) => ZONAS.flatMap((z) => medidasDe(z, tipo));

function guia(main, [a, b, c]) {
  if (a === 'ver' && MEDIDAS[b]) return verMedida(main, b);
  if (a === 'practica') return practica(main, b, c);
  main.innerHTML = `
    <h1>Cómo tomar medidas</h1>
    <section class="cuadro">
      <h2>Antes de empezar</h2>
      <ul class="consejos">${CONSEJOS.map(([i, t]) => `<li><span aria-hidden="true">${i}</span>${t}</li>`).join('')}</ul>
    </section>
    <a class="btn btn-principal btn-ancho" href="#/herramientas/guia/practica">👭 Practicar en pareja</a>
    <p class="ayuda centrada">La app te guía medida por medida y al final las guarda.</p>
    <h2 class="subtitulo">Las medidas, en orden</h2>
    ${ZONAS.map((z) => `
      <section class="zona">
        <header class="zona-cabeza"><span class="zona-figura">${figuraZona(z.id)}</span><div><h2>${z.nombre}</h2></div></header>
        <ul class="filas-medida">${z.medidas.map((id) => `
          <li><a href="#/herramientas/guia/ver/${id}"><span class="mini-figura">${figuraMedida(id)}</span>
            <span class="fila-nombre">${MEDIDAS[id].nombre}</span><span class="flecha" aria-hidden="true">›</span></a></li>`).join('')}
        </ul>
      </section>`).join('')}`;
  return '#/herramientas';
}

function verMedida(main, id) {
  const orden = ZONAS.flatMap((z) => z.medidas);
  const i = orden.indexOf(id);
  const def = MEDIDAS[id];
  main.innerHTML = `
    <p class="contador">Medida ${i + 1} de ${orden.length}</p>
    <div class="figura">${figuraMedida(id)}</div>
    <h1>${def.nombre}</h1>
    <p class="como"><span>${def.como}</span>${hayVoz ? '<button type="button" class="btn-voz" aria-label="Escuchar">🔊</button>' : ''}</p>
    <div class="acciones">
      ${i > 0 ? `<a class="btn btn-secundario" href="#/herramientas/guia/ver/${orden[i - 1]}">◀ Anterior</a>` : ''}
      ${i < orden.length - 1 ? `<a class="btn btn-principal" href="#/herramientas/guia/ver/${orden[i + 1]}">Siguiente ▶</a>` : ''}
    </div>`;
  main.querySelector('.btn-voz')?.addEventListener('click', () => hablar(`${def.nombre}. ${def.como}`));
  return '#/herramientas/guia';
}

// Práctica en pareja: #/herramientas/guia/practica[/dama|varon[/N|fin]]
function practica(main, tipo, paso) {
  if (tipo !== 'dama' && tipo !== 'varon') {
    main.innerHTML = `
      <h1>Practicar en pareja</h1>
      <p class="ayuda">Mide a tu compañera o compañero siguiendo los pasos. ¿A quién vas a medir?</p>
      <div class="tarjetas">
        ${[['dama', 'mujer', 'Mujer o niña'], ['varon', 'hombre', 'Varón o niño']].map(([t, av, txt]) => `
          <a class="tarjeta tarjeta-persona" href="#/herramientas/guia/practica/${t}/0">
            <span class="avatar">${avatar(av).svg}</span><span class="tarjeta-nombre">${txt}</span>
            <span class="tarjeta-detalle">${ordenDe(t).length} medidas</span></a>`).join('')}
      </div>`;
    guardar('practica', { tipo: null, medidas: {} });
    return '#/herramientas/guia';
  }
  const orden = ordenDe(tipo);
  const estado = leer('practica', { medidas: {} });
  if (estado.tipo !== tipo) guardar('practica', { tipo, medidas: {} });
  if (paso === 'fin') return finPractica(main, tipo, orden);
  const i = Math.min(Math.max(parseInt(paso, 10) || 0, 0), orden.length - 1);
  const id = orden[i];
  const def = MEDIDAS[id];
  const actual = leer('practica', { medidas: {} }).medidas[id];
  const siguiente = i < orden.length - 1 ? `#/herramientas/guia/practica/${tipo}/${i + 1}` : `#/herramientas/guia/practica/${tipo}/fin`;
  main.innerHTML = `
    <div class="progreso" role="progressbar" aria-valuenow="${i + 1}" aria-valuemax="${orden.length}"><span style="width:${((i + 1) / orden.length) * 100}%"></span></div>
    <p class="contador">Medida ${i + 1} de ${orden.length}</p>
    <div class="figura">${figuraMedida(id)}</div>
    <form class="form-medida" novalidate>
      <h1><label for="valor">${def.nombre}</label></h1>
      <p class="como" id="como"><span>${def.como}</span>${hayVoz ? '<button type="button" class="btn-voz" aria-label="Escuchar">🔊</button>' : ''}</p>
      <div class="campo"><input id="valor" inputmode="decimal" autocomplete="off" value="${actual != null ? numero(actual) : ''}" aria-describedby="como error"><span class="unidad">cm</span></div>
      <p class="error" id="error" role="alert"></p>
      <div class="acciones">
        <a class="btn btn-secundario" href="${siguiente}">Saltar</a>
        <button class="btn btn-principal">Siguiente ▶</button>
      </div>
    </form>`;
  main.querySelector('.btn-voz')?.addEventListener('click', () => hablar(`${def.nombre}. ${def.como}`));
  const form = main.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = revisarMedida(form.valor.value, def);
    if (!r.ok) { main.querySelector('#error').textContent = r.mensaje; return form.valor.focus(); }
    const s = leer('practica', { tipo, medidas: {} });
    guardar('practica', { ...s, tipo, medidas: { ...s.medidas, [id]: r.valor } });
    location.hash = siguiente;
  });
  return i > 0 ? `#/herramientas/guia/practica/${tipo}/${i - 1}` : '#/herramientas/guia/practica';
}

function finPractica(main, tipo, orden) {
  const { medidas } = leer('practica', { medidas: {} });
  const tomadas = orden.filter((id) => medidas[id] != null);
  const avatares = AVATARES.filter((a) => a.tipo === tipo);
  main.innerHTML = `
    <p class="aviso-icono centrada" aria-hidden="true">🎉</p>
    <h1 class="centrada">¡Terminaste!</h1>
    <p class="ayuda centrada">Tomaste ${tomadas.length} de ${orden.length} medidas.</p>
    ${tomadas.length ? `
    <ul class="resumen">${tomadas.map((id) => `<li><span>${MEDIDAS[id].nombre}</span><strong>${numero(medidas[id])} cm</strong><span></span></li>`).join('')}</ul>
    <form novalidate class="cuadro">
      <h2>Guardar estas medidas</h2>
      <label class="bloque" for="nombre">¿De quién son?<input id="nombre" class="entrada-texto" maxlength="30" placeholder="Ej.: Carla"></label>
      <fieldset class="elegir-avatar">${avatares.map((x, i) => `
        <label class="opcion-avatar"><input type="radio" name="avatar" value="${x.id}" ${i === 0 ? 'checked' : ''}><span class="avatar">${x.svg}</span><span>${x.nombre}</span></label>`).join('')}
      </fieldset>
      <p class="error" id="error" role="alert"></p>
      <button class="btn btn-principal btn-ancho">💾 Guardar en Medidas guardadas</button>
    </form>` : ''}
    <a class="enlace" href="#/herramientas/guia/practica">Empezar otra práctica</a>`;
  main.querySelector('form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value.trim();
    if (!nombre) { main.querySelector('#error').textContent = 'Escribe de quién son las medidas.'; return; }
    try {
      const p = personas.crear({ nombre, avatar: e.target.avatar.value, medidas });
      guardar('practica', { tipo: null, medidas: {} });
      location.hash = `#/guardadas/${p.id}`;
    } catch (error) {
      main.querySelector('#error').textContent = error.message;
    }
  });
  return `#/herramientas/guia/practica/${tipo}/${orden.length - 1}`;
}

