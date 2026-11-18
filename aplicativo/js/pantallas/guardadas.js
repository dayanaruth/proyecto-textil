// Pantalla: medidas guardadas de cada persona + "¿Para quién es?" al hacer una prenda
import * as personas from '../datos/personas.js';
import { MEDIDAS, ZONAS, medidasDe, figuraMedida, figuraZona } from '../datos/medidas.js';
import { buscarPrenda, prendaMadre } from '../datos/prendas.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { revisarMedida } from '../calculos/validacion.js';
import { AVATARES, avatar } from '../utilidades/avatares.js';
import { numero } from '../utilidades/formato.js';
import { barraPasos, esc } from '../utilidades/ui.js';
import { hayVoz, hablar } from '../utilidades/voz.js';

const cuantas = (p) => Object.keys(p.medidas).length;
const tipoDe = (p) => avatar(p.avatar).tipo;

// Ruta: #/guardadas · #/guardadas/nueva[/para/prenda | /desde-trabajo] · #/guardadas/ID[/editar | /medida/M]
export function mostrar(main, datos) {
  const [a, b, c] = datos;
  if (!a) return lista(main);
  if (a === 'nueva') return formulario(main, null, b === 'para' ? { para: c } : b === 'desde-trabajo' ? { desdeTrabajo: true } : {});
  const p = personas.buscar(a);
  if (!p) return void location.replace('#/guardadas');
  if (b === 'editar') return formulario(main, p, {});
  if (b === 'medida' && MEDIDAS[c]) return editarMedida(main, p, c);
  return ficha(main, p);
}

// ---------- Lista de personas ----------
function lista(main) {
  const todas = personas.listar();
  main.innerHTML = `
    <h1>Medidas guardadas</h1>
    <p class="ayuda">Guarda las medidas de cada persona y no tendrás que medir de nuevo en cada prenda.</p>
    ${todas.length ? `
      <ul class="personas">
        ${todas.map((p) => `
          <li><a class="persona" href="#/guardadas/${p.id}">
            <span class="avatar">${avatar(p.avatar).svg}</span>
            <span class="persona-datos"><strong>${esc(p.nombre)}</strong>
              <small>${cuantas(p)} medidas · ${personas.fecha(p.actualizado)}</small>
              ${personas.esAntigua(p) ? '<small class="antigua">⏰ Conviene volver a medir</small>' : ''}</span>
            <span class="flecha" aria-hidden="true">›</span>
          </a></li>`).join('')}
      </ul>` : `
      <div class="vacio">
        <div class="avatares-vacio">${AVATARES.slice(0, 3).map((x) => `<span class="avatar">${x.svg}</span>`).join('')}</div>
        <p>Todavía no guardaste a nadie.<br>Empieza contigo misma o con alguien de tu familia.</p>
      </div>`}
    <a class="btn btn-principal btn-ancho" href="#/guardadas/nueva">＋ Agregar persona</a>

    <section class="respaldo">
      <h2 class="subtitulo">💾 Copia de seguridad</h2>
      <p class="ayuda">Si cambias de celular o se borran los datos del navegador, con la copia recuperas todas las medidas. También sirve para pasarlas a una compañera.</p>
      <div class="acciones">
        <button type="button" class="btn btn-secundario" id="guardar-copia" ${todas.length ? '' : 'disabled'}>⬇️ Guardar copia</button>
        <label class="btn btn-secundario" for="archivo-copia">⬆️ Recuperar copia</label>
      </div>
      <input type="file" id="archivo-copia" accept=".json,application/json" hidden>
      <button type="button" class="btn btn-secundario btn-ancho" id="compartir-copia" hidden>📤 Enviar copia (WhatsApp, correo…)</button>
      <p class="aviso-respaldo" id="respaldo-mensaje" role="status"></p>
    </section>
    <p class="privacidad">🔒 Las medidas quedan solo en este celular. No se envían a internet.</p>`;

  const mensaje = (t) => { main.querySelector('#respaldo-mensaje').textContent = t; };
  main.querySelector('#guardar-copia').addEventListener('click', () => {
    const archivo = personas.copia();
    const enlace = Object.assign(document.createElement('a'), { href: URL.createObjectURL(archivo), download: archivo.name });
    enlace.click();
    URL.revokeObjectURL(enlace.href);
    mensaje(`✅ Copia guardada en Descargas: ${archivo.name}`);
  });
  const compartir = main.querySelector('#compartir-copia');
  if (todas.length && navigator.canShare?.({ files: [personas.copia()] })) {
    compartir.hidden = false;
    compartir.addEventListener('click', () => navigator.share({ files: [personas.copia()], title: 'Medidas – Mi Taller' }).catch(() => {}));
  }
  main.querySelector('#archivo-copia').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try {
      const { nuevas, actualizadas } = personas.recuperar(await archivo.text());
      lista(main);
      main.querySelector('#respaldo-mensaje').textContent = `✅ Copia recuperada: ${nuevas} personas nuevas, ${actualizadas} actualizadas.`;
    } catch (error) {
      mensaje(`⚠️ ${error.message}`);
    }
  });
  return '#/';
}

// ---------- Agregar o editar persona ----------
function formulario(main, p, { para, desdeTrabajo }) {
  const prenda = para ? buscarPrenda(para) : null;
  main.innerHTML = `
    ${prenda ? barraPasos(0) : ''}
    <h1>${p ? 'Cambiar datos' : 'Nueva persona'}</h1>
    <form novalidate class="form-persona">
      <label class="bloque" for="nombre">¿Cómo se llama?
        <input id="nombre" class="entrada-texto" maxlength="30" autocomplete="off" placeholder="Ej.: Yo, Mamá, Carla" value="${esc(p?.nombre ?? '')}">
      </label>
      <p class="error" id="error" role="alert"></p>
      <fieldset class="elegir-avatar">
        <legend>Elige un dibujo</legend>
        ${AVATARES.map((x, i) => `
          <label class="opcion-avatar">
            <input type="radio" name="avatar" value="${x.id}" ${(p ? p.avatar === x.id : i === 0) ? 'checked' : ''}>
            <span class="avatar">${x.svg}</span><span>${x.nombre}</span>
          </label>`).join('')}
      </fieldset>
      <button class="btn btn-principal btn-ancho">${p ? 'Guardar cambios' : desdeTrabajo ? '💾 Guardar con estas medidas' : 'Guardar y seguir ▶'}</button>
    </form>`;

  main.querySelector('#nombre').addEventListener('input', () => { main.querySelector('#error').textContent = ''; });
  main.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value.trim();
    const elegido = e.target.avatar.value;
    if (!nombre) {
      main.querySelector('#error').textContent = 'Escribe un nombre para reconocerla después.';
      return e.target.nombre.focus();
    }
    try {
      if (p) {
        personas.cambiar(p.id, { nombre, avatar: elegido });
        return void (location.hash = `#/guardadas/${p.id}`);
      }
      const t = leer('trabajo', { medidas: {} });
      const nueva = personas.crear({ nombre, avatar: elegido, medidas: desdeTrabajo ? t.medidas : {} });
      if (para) {
        guardar('trabajo', { prenda: para, persona: nueva.id, medidas: {} });
        location.hash = `#/medidas/${para}`;
      } else if (desdeTrabajo) {
        guardar('trabajo', { ...t, persona: nueva.id });
        location.hash = `#/medidas/${t.prenda}/revisar`;
      } else {
        location.hash = `#/guardadas/${nueva.id}`;
      }
    } catch (error) {
      main.querySelector('#error').textContent = error.message;
    }
  });
  if (p) return `#/guardadas/${p.id}`;
  if (para) return `#/para/${para}`;
  if (desdeTrabajo) return `#/medidas/${leer('trabajo', {}).prenda}/revisar`;
  return '#/guardadas';
}

// ---------- Ficha de una persona ----------
function ficha(main, p) {
  const tipo = tipoDe(p);
  main.innerHTML = `
    <section class="ficha-cabeza">
      <span class="avatar avatar-grande">${avatar(p.avatar).svg}</span>
      <div><h1>${esc(p.nombre)}</h1>
        <p class="ayuda">${cuantas(p)} medidas · actualizado el ${personas.fecha(p.actualizado)}</p>
        <a class="enlace-chico" href="#/guardadas/${p.id}/editar">✏️ Cambiar nombre o dibujo</a></div>
    </section>
    ${personas.esAntigua(p) ? '<p class="nota">⏰ Estas medidas tienen más de 6 meses. El cuerpo cambia: conviene volver a medir.</p>' : ''}
    <a class="btn btn-principal btn-ancho" href="#/prendas">✂️ Hacer una prenda para ${esc(p.nombre)}</a>
    <p class="ayuda centrada">Toca una medida para agregarla o cambiarla.</p>
    ${ZONAS.map((z) => {
      const ids = medidasDe(z, tipo);
      const tiene = ids.filter((id) => p.medidas[id] != null).length;
      return `
      <section class="zona">
        <header class="zona-cabeza">
          <span class="zona-figura">${figuraZona(z.id)}</span>
          <div><h2>${z.nombre}</h2><small>${tiene} de ${ids.length} medidas</small></div>
        </header>
        <ul class="filas-medida">
          ${ids.map((id) => `
            <li><a href="#/guardadas/${p.id}/medida/${id}">
              <span class="mini-figura">${figuraMedida(id)}</span>
              <span class="fila-nombre">${MEDIDAS[id].nombre}</span>
              ${p.medidas[id] != null ? `<b>${numero(p.medidas[id])} cm</b>` : '<span class="agregar">＋ Agregar</span>'}
            </a></li>`).join('')}
        </ul>
      </section>`;
    }).join('')}
    <button type="button" class="btn btn-peligro btn-ancho" id="borrar">🗑️ Borrar a ${esc(p.nombre)}</button>
    <dialog class="dialogo" id="confirmar">
      <p class="dialogo-icono" aria-hidden="true">🗑️</p>
      <h2>¿Borrar a ${esc(p.nombre)}?</h2>
      <p>Se borrarán sus ${cuantas(p)} medidas. Esto no se puede deshacer.</p>
      <div class="acciones">
        <button type="button" class="btn btn-secundario" data-respuesta="no">No, volver</button>
        <button type="button" class="btn btn-peligro" data-respuesta="si">Sí, borrar</button>
      </div>
    </dialog>`;

  const dialogo = main.querySelector('#confirmar');
  main.querySelector('#borrar').addEventListener('click', () => dialogo.showModal());
  dialogo.addEventListener('click', (e) => {
    const r = e.target.closest('[data-respuesta]')?.dataset.respuesta;
    if (r === 'no' || e.target === dialogo) dialogo.close();
    if (r === 'si') {
      personas.borrar(p.id);
      const t = leer('trabajo', { medidas: {} });
      if (t.persona === p.id) guardar('trabajo', { ...t, persona: null });
      dialogo.close();
      location.hash = '#/guardadas';
    }
  });
  return '#/guardadas';
}

// ---------- Agregar o cambiar una medida ----------
function editarMedida(main, p, id) {
  const def = MEDIDAS[id];
  const actual = p.medidas[id];
  main.innerHTML = `
    <p class="contador">👤 ${esc(p.nombre)}</p>
    <div class="figura">${figuraMedida(id)}</div>
    <form class="form-medida" novalidate>
      <h1><label for="valor">${def.nombre}</label></h1>
      <p class="como" id="como"><span>${def.como}</span>
        ${hayVoz ? '<button type="button" class="btn-voz" aria-label="Escuchar la instrucción">🔊</button>' : ''}</p>
      <div class="campo">
        <input id="valor" inputmode="decimal" autocomplete="off" value="${actual != null ? numero(actual) : ''}" aria-describedby="como error">
        <span class="unidad">cm</span>
      </div>
      <p class="error" id="error" role="alert"></p>
      <div class="acciones">
        ${actual != null ? '<button type="button" class="btn btn-secundario" id="quitar">Quitar</button>' : ''}
        <button class="btn btn-principal">Guardar ✓</button>
      </div>
    </form>`;
  main.querySelector('.btn-voz')?.addEventListener('click', () => hablar(`${def.nombre}. ${def.como}`));
  main.querySelector('#quitar')?.addEventListener('click', () => {
    personas.anotarMedidas(p.id, { [id]: null });
    location.hash = `#/guardadas/${p.id}`;
  });
  const form = main.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = revisarMedida(form.valor.value, def);
    if (!r.ok) {
      main.querySelector('#error').textContent = r.mensaje;
      form.valor.setAttribute('aria-invalid', 'true');
      return form.valor.focus();
    }
    personas.anotarMedidas(p.id, { [id]: r.valor });
    location.hash = `#/guardadas/${p.id}`;
  });
  return `#/guardadas/${p.id}`;
}

// ---------- "¿Para quién es?" al elegir una prenda ----------
// Ruta: #/para/PRENDA (elegir) · #/para/PRENDA/PERSONA (elegida) · #/para/PRENDA/sola (sin guardar)
export function para(main, [prendaId, elegida]) {
  const prenda = buscarPrenda(prendaId);
  if (!prenda?.medidas) return void location.replace('#/prendas');
  const todas = personas.listar();
  const madre = prendaMadre(prendaId);
  const volver = madre ? `#/prenda/${madre.id}` : '#/prendas';

  if (elegida === 'sola' || (!elegida && !todas.length)) {
    const t = leer('trabajo', { medidas: {} });
    guardar('trabajo', { prenda: prendaId, persona: null, medidas: t.persona ? {} : t.medidas });
    return void location.replace(`#/medidas/${prendaId}`);
  }
  if (elegida) {
    const p = personas.buscar(elegida);
    if (!p) return void location.replace(`#/para/${prendaId}`);
    guardar('trabajo', { prenda: prendaId, persona: p.id, medidas: { ...p.medidas } });
    const falta = prenda.medidas.findIndex((id) => p.medidas[id] == null);
    return void location.replace(falta < 0 ? `#/medidas/${prendaId}/revisar` : `#/medidas/${prendaId}/${falta}`);
  }

  main.innerHTML = `
    ${barraPasos(0)}
    <h1>¿Para quién es?</h1>
    <p class="ayuda">${prenda.titulo ?? prenda.nombre}. Si eliges a alguien guardado, solo te pediremos las medidas que falten.</p>
    <div class="tarjetas">
      ${todas.map((p) => {
        const faltan = prenda.medidas.filter((id) => p.medidas[id] == null).length;
        return `
        <a class="tarjeta tarjeta-persona" href="#/para/${prendaId}/${p.id}">
          <span class="avatar">${avatar(p.avatar).svg}</span>
          <span class="tarjeta-nombre">${esc(p.nombre)}</span>
          <span class="tarjeta-detalle ${faltan ? '' : 'completa'}">${faltan ? `Faltan ${faltan} medidas` : '✓ Tiene todas'}</span>
        </a>`;
      }).join('')}
      <a class="tarjeta tarjeta-persona" href="#/guardadas/nueva/para/${prendaId}">
        <span class="avatar avatar-nuevo" aria-hidden="true">＋</span>
        <span class="tarjeta-nombre">Otra persona</span>
        <span class="tarjeta-detalle">Se guardará</span>
      </a>
    </div>
    <a class="enlace" href="#/para/${prendaId}/sola">Solo esta vez, sin guardar</a>`;
  return volver;
}
