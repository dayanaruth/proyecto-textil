// Pantalla: elegir la prenda (y dama/varón cuando corresponde)
import { PRENDAS, buscarPrenda, sirvePara } from '../datos/prendas.js';
import * as personas from '../datos/personas.js';
import { avatar } from '../utilidades/avatares.js';
import { barraPasos, esc } from '../utilidades/ui.js';

// Ruta: #/prendas[/PERSONA] y #/prenda/ID[/PERSONA]. Con PERSONA solo se ven las prendas para ella.
const quien = (id) => { const p = id ? personas.buscar(id) : null; return p ? { ...p, tipo: avatar(p.avatar).tipo } : null; };
const tarjeta = (p, persona) => `
  <a class="tarjeta" href="${p.variantes ? `#/prenda/${p.id}` : `#/para/${p.id}`}${persona ? `/${persona.id}` : ''}">
    <img src="${p.foto ?? p.img}" alt="" width="100" height="100"${p.foto ? ' class="foto"' : ''}>
    <span class="tarjeta-nombre">${p.nombre}</span>
    ${p.detalle ? `<span class="tarjeta-detalle">${p.detalle}</span>` : ''}
  </a>`;

export function lista(main, [personaId]) {
  const persona = quien(personaId);
  main.innerHTML = `
    ${barraPasos(0)}
    <h1>¿Qué prenda vas a hacer${persona ? ` para ${esc(persona.nombre)}` : ''}?</h1>
    <p class="ayuda">Toca la prenda que quieres coser.</p>
    <div class="tarjetas">${PRENDAS.filter((p) => sirvePara(p, persona?.tipo)).map((p) => tarjeta(p, persona)).join('')}</div>`;
  return persona ? `#/guardadas/${persona.id}` : undefined;
}

export function variante(main, [id, personaId]) {
  const prenda = buscarPrenda(id);
  if (!prenda?.variantes) return location.replace('#/prendas');
  const persona = quien(personaId);
  const sirven = prenda.variantes.filter((v) => sirvePara(v, persona?.tipo));
  // Para una persona ya elegida hay una sola versión (dama o varón): se salta esta pantalla
  if (persona && sirven.length === 1) return void location.replace(`#/para/${sirven[0].id}/${persona.id}`);
  main.innerHTML = `
    ${barraPasos(0)}
    <h1>${prenda.nombre}</h1>
    <p class="ayuda">¿Para quién es?</p>
    <div class="tarjetas">${sirven.map((v) => tarjeta(v, persona)).join('')}</div>`;
  return persona ? `#/prendas/${persona.id}` : '#/prendas';
}
