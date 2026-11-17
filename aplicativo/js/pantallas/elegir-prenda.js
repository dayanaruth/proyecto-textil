// Pantalla: elegir la prenda (y dama/varón cuando corresponde)
import { PRENDAS, buscarPrenda } from '../datos/prendas.js';
import { barraPasos } from '../utilidades/ui.js';

const tarjeta = (p) => `
  <a class="tarjeta" href="${p.variantes ? `#/prenda/${p.id}` : `#/medidas/${p.id}`}">
    <img src="${p.img}" alt="" width="100" height="100">
    <span class="tarjeta-nombre">${p.nombre}</span>
    ${p.detalle ? `<span class="tarjeta-detalle">${p.detalle}</span>` : ''}
  </a>`;

export function lista(main) {
  main.innerHTML = `
    ${barraPasos(0)}
    <h1>¿Qué prenda vas a hacer?</h1>
    <p class="ayuda">Toca la prenda que quieres coser.</p>
    <div class="tarjetas">${PRENDAS.map(tarjeta).join('')}</div>`;
}

export function variante(main, [id]) {
  const prenda = buscarPrenda(id);
  if (!prenda?.variantes) return location.replace('#/prendas');
  main.innerHTML = `
    ${barraPasos(0)}
    <h1>${prenda.nombre}</h1>
    <p class="ayuda">¿Para quién es?</p>
    <div class="tarjetas">${prenda.variantes.map(tarjeta).join('')}</div>`;
}
