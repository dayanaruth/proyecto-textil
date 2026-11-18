// Pantalla: diccionario de costura con dibujos + galería de cuellos, mangas y bolsillos
import { PALABRAS, GALERIA } from '../datos/diccionario.js';
import { hayVoz, hablar } from '../utilidades/voz.js';

const SECCIONES = [
  { id: 'palabras', nombre: 'Palabras' },
  { id: 'cuellos', nombre: 'Cuellos' },
  { id: 'mangas', nombre: 'Mangas' },
  { id: 'bolsillos', nombre: 'Bolsillos' },
];
// Para buscar sin importar tildes ni mayúsculas
const normal = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function mostrar(main, [seccion = 'palabras']) {
  if (!SECCIONES.some((s) => s.id === seccion)) seccion = 'palabras';
  const lista = seccion === 'palabras' ? PALABRAS.map((p) => ({ nombre: p.palabra, que: p.que, dibujo: p.dibujo })) : GALERIA[seccion];
  main.innerHTML = `
    <h1>Diccionario de costura</h1>
    <div class="selector" role="group" aria-label="Sección">${SECCIONES.map((s) => `
      <a class="selector-enlace" href="#/herramientas/diccionario/${s.id}" aria-current="${s.id === seccion}">${s.nombre}</a>`).join('')}</div>
    ${seccion === 'palabras' ? '<input id="buscar" class="entrada-texto" type="search" placeholder="🔍 Buscar una palabra: sisa, pinza…" aria-label="Buscar palabra">' : ''}
    <p class="ayuda" id="sin-resultados" hidden>No encontramos esa palabra.</p>
    <div class="fichas">${lista.map((x, i) => `
      <article class="ficha-palabra" data-buscar="${normal(`${x.nombre} ${x.que}`)}">
        <div class="ficha-dibujo">${x.dibujo}</div>
        <div class="ficha-texto">
          <h2>${x.nombre}</h2>
          <p>${x.que}</p>
          ${hayVoz ? `<button type="button" class="btn-voz btn-voz-chico" data-leer="${i}" aria-label="Escuchar ${x.nombre}">🔊</button>` : ''}
        </div>
      </article>`).join('')}
    </div>`;
  main.querySelector('.fichas').addEventListener('click', (e) => {
    const i = e.target.closest('[data-leer]')?.dataset.leer;
    if (i != null) hablar(`${lista[i].nombre}. ${lista[i].que}`);
  });
  main.querySelector('#buscar')?.addEventListener('input', (e) => {
    const q = normal(e.target.value.trim());
    let visibles = 0;
    main.querySelectorAll('.ficha-palabra').forEach((f) => {
      const ver = !q || f.dataset.buscar.includes(q);
      f.hidden = !ver;
      visibles += ver;
    });
    main.querySelector('#sin-resultados').hidden = visibles > 0;
  });
  return '#/herramientas';
}
