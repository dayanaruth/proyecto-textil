// Pantalla: pedir medidas (una por una con dibujo, todas juntas, y revisión final)
import { buscarPrenda, prendaMadre } from '../datos/prendas.js';
import { MEDIDAS, figuraMedida } from '../datos/medidas.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { revisarMedida, avisos } from '../calculos/validacion.js';
import { numero } from '../utilidades/formato.js';
import { barraPasos } from '../utilidades/ui.js';
import { hayVoz, hablar } from '../utilidades/voz.js';

// El trabajo en curso se guarda para no perder lo escrito si se cierra la app
const trabajo = () => leer('trabajo', { medidas: {} });
function anotar(prendaId, valores) {
  const t = trabajo();
  t.prenda = prendaId;
  Object.assign(t.medidas, valores);
  guardar('trabajo', t);
}

const valorInicial = (id) => {
  const v = trabajo().medidas[id];
  return v == null ? '' : numero(v);
};

// Devuelve a dónde lleva el botón "Atrás" de la barra superior
export function mostrar(main, [id, paso = '0', modo]) {
  const prenda = buscarPrenda(id);
  const base = `#/medidas/${id}`;
  if (paso === 'revisar') return revisar(main, prenda, base);
  if (paso === 'todas') return todas(main, prenda, base);
  const i = Math.min(Math.max(parseInt(paso, 10) || 0, 0), prenda.medidas.length - 1);
  unaMedida(main, prenda, base, i, modo === 'cambiar');
  if (modo === 'cambiar') return `${base}/revisar`;
  if (i > 0) return `${base}/${i - 1}`;
  const madre = prendaMadre(id);
  return madre ? `#/prenda/${madre.id}` : '#/prendas';
}

function unaMedida(main, prenda, base, i, cambiando) {
  const lista = prenda.medidas;
  const id = lista[i];
  const def = MEDIDAS[id];
  const ultima = i === lista.length - 1;

  main.innerHTML = `
    ${barraPasos(1)}
    <p class="contador">${prenda.titulo ?? prenda.nombre} · Medida ${i + 1} de ${lista.length}</p>
    <div class="figura">${figuraMedida(id)}</div>
    <form class="form-medida" novalidate>
      <h1><label for="valor">${def.nombre}</label></h1>
      <p class="como" id="como">
        <span>${def.como}</span>
        ${hayVoz ? '<button type="button" class="btn-voz" aria-label="Escuchar la instrucción">🔊</button>' : ''}
      </p>
      <div class="campo">
        <input id="valor" inputmode="decimal" autocomplete="off" value="${valorInicial(id)}" aria-describedby="como error">
        <span class="unidad">cm</span>
      </div>
      <p class="error" id="error" role="alert"></p>
      <div class="acciones">
        ${i > 0 && !cambiando ? `<a class="btn btn-secundario" href="${base}/${i - 1}">◀ Atrás</a>` : ''}
        <button class="btn btn-principal">${cambiando ? 'Guardar ✓' : ultima ? 'Revisar ▶' : 'Siguiente ▶'}</button>
      </div>
    </form>
    ${cambiando ? '' : `<a class="enlace" href="${base}/todas">Ver todas las medidas juntas</a>`}`;

  main.querySelector('.btn-voz')?.addEventListener('click', () => hablar(`${def.nombre}. ${def.como}`));

  const form = main.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = revisarMedida(form.valor.value, def);
    if (!r.ok) return mostrarError(form.valor, main.querySelector('#error'), r.mensaje);
    anotar(prenda.id, { [id]: r.valor });
    location.hash = cambiando || ultima ? `${base}/revisar` : `${base}/${i + 1}`;
  });
}

function todas(main, prenda, base) {
  main.innerHTML = `
    ${barraPasos(1)}
    <h1>Todas las medidas</h1>
    <p class="ayuda">${prenda.titulo ?? prenda.nombre}. Escribe cada medida en centímetros.</p>
    <form novalidate>
      ${prenda.medidas.map((id) => `
        <div class="campo-fila">
          <label for="m-${id}">${MEDIDAS[id].nombre}</label>
          <small id="c-${id}">${MEDIDAS[id].como}</small>
          <div class="campo">
            <input id="m-${id}" name="${id}" inputmode="decimal" autocomplete="off"
                   value="${valorInicial(id)}" aria-describedby="c-${id} e-${id}">
            <span class="unidad">cm</span>
          </div>
          <p class="error" id="e-${id}" role="alert"></p>
        </div>`).join('')}
      <button class="btn btn-principal btn-grande">Revisar ▶</button>
    </form>
    <a class="enlace" href="${base}/0">Ver una por una, con dibujos</a>`;

  const form = main.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valores = {};
    let primerError = null;
    for (const id of prenda.medidas) {
      const input = form.elements[id];
      const r = revisarMedida(input.value, MEDIDAS[id]);
      const error = main.querySelector(`#e-${id}`);
      if (r.ok) {
        valores[id] = r.valor;
        error.textContent = '';
        input.removeAttribute('aria-invalid');
      } else {
        mostrarError(input, error, r.mensaje, false);
        primerError ??= input;
      }
    }
    anotar(prenda.id, valores); // guarda lo correcto aunque falte algo
    if (primerError) return primerError.focus();
    location.hash = `${base}/revisar`;
  });
  return `${base}/0`;
}

function revisar(main, prenda, base) {
  const m = trabajo().medidas;
  const lista = prenda.medidas;
  const falta = lista.findIndex((id) => m[id] == null);
  if (falta >= 0) {
    location.replace(`${base}/${falta}`);
    return;
  }
  main.innerHTML = `
    ${barraPasos(1)}
    <h1>Revisa las medidas</h1>
    <p class="ayuda">Si alguna está mal, toca «Cambiar».</p>
    <ul class="resumen">
      ${lista.map((id, i) => `
        <li><span>${MEDIDAS[id].nombre}</span><strong>${numero(m[id])} cm</strong>
        <a href="${base}/${i}/cambiar" aria-label="Cambiar ${MEDIDAS[id].nombre}">Cambiar</a></li>`).join('')}
    </ul>
    ${avisos(m, lista).map((t) => `<p class="nota">⚠️ ${t}</p>`).join('')}
    <a class="btn btn-principal btn-grande" href="#/molde/${prenda.id}">Ver mi molde ▶</a>`;
  return `${base}/${lista.length - 1}`;
}

function mostrarError(input, error, mensaje, enfocar = true) {
  error.textContent = mensaje;
  input.setAttribute('aria-invalid', 'true');
  if (enfocar) input.focus();
}
