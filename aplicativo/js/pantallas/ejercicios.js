// Pantalla: ejercicios por niveles que se corrigen solos; el resultado se puede enviar al docente
import { NIVELES } from '../datos/ejercicios.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { compartirArchivo } from '../utilidades/compartir.js';
import { numero } from '../utilidades/formato.js';
import { esc } from '../utilidades/ui.js';

const estrellas = (bien, total) => Math.round((bien / total) * 5);
const pintarEstrellas = (n) => `<span class="estrellas" aria-label="${n} de 5 estrellas">${'★'.repeat(n)}<span>${'★'.repeat(5 - n)}</span></span>`;
const leerRespuesta = (t) => {
  const limpio = String(t).trim().replace(/[^\d,.-]/g, '').replace(',', '.');
  return limpio === '' ? NaN : Number(limpio);
};

export function mostrar(main, [nivelId]) {
  const nivel = NIVELES.find((n) => String(n.id) === nivelId);
  return nivel ? jugar(main, nivel) : lista(main);
}

function lista(main) {
  const mejores = leer('ejercicios', {});
  main.innerHTML = `
    <h1>Ejercicios para practicar</h1>
    <p class="ayuda">10 preguntas por nivel. Los números cambian cada vez, así que puedes repetirlos todas las veces que quieras.</p>
    <nav class="menu">${NIVELES.map((n) => `
      <a class="menu-item" href="#/herramientas/ejercicios/${n.id}">
        <span class="menu-icono" aria-hidden="true">${n.icono}</span>
        <span><strong>Nivel ${n.id}: ${n.nombre}</strong><small>${n.desc}</small>
          ${mejores[n.id] != null ? `<small>Tu mejor resultado: ${mejores[n.id]} de 10 ${pintarEstrellas(estrellas(mejores[n.id], 10))}</small>` : ''}</span>
      </a>`).join('')}
    </nav>`;
  return '#/herramientas';
}

function jugar(main, nivel) {
  const preguntas = nivel.crear();
  const respuestas = [];
  let i = 0;

  const pintarPregunta = () => {
    const p = preguntas[i];
    main.innerHTML = `
      <div class="progreso" role="progressbar" aria-valuenow="${i + 1}" aria-valuemax="${preguntas.length}"><span style="width:${((i + 1) / preguntas.length) * 100}%"></span></div>
      <p class="contador">Nivel ${nivel.id} · Pregunta ${i + 1} de ${preguntas.length}</p>
      <h1 class="pregunta">${p.pregunta}</h1>
      ${p.cita ? `<blockquote class="cita">${p.cita}</blockquote>` : ''}
      ${p.figura ? `<div class="figura">${p.figura}</div>` : ''}
      <form novalidate>
        ${p.tipo === 'opciones'
          ? `<div class="${p.conDibujos ? 'opciones-dibujo' : 'opciones-texto'}">${p.opciones.map((o, j) => `
              <button type="button" class="opcion" data-opcion="${j}">${o.dibujo ? `<span class="ficha-dibujo">${o.dibujo}</span>` : `<span>${o.texto}</span>`}</button>`).join('')}</div>`
          : `<div class="campo"><input id="respuesta" inputmode="decimal" autocomplete="off" aria-label="Tu respuesta"><span class="unidad">${p.unidad}</span></div>
             <button class="btn btn-principal btn-ancho">Comprobar</button>`}
      </form>
      <div id="corregir" aria-live="polite"></div>`;
    const form = main.querySelector('form');
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-opcion]');
      if (b) responder(Number(b.dataset.opcion));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = leerRespuesta(form.respuesta.value);
      if (Number.isNaN(v)) { main.querySelector('#corregir').innerHTML = '<p class="error">Escribe un número, por ejemplo 24,5.</p>'; return; }
      responder(v);
    });
    form.respuesta?.focus();
  };

  const responder = (r) => {
    const p = preguntas[i];
    const bien = p.tipo === 'opciones' ? r === p.correcta : Math.abs(r - p.respuesta) <= (p.tolerancia ?? 0.011);
    const dada = p.tipo === 'opciones' ? p.opciones[r].texto : `${numero(r)} ${p.unidad}`;
    const correcta = p.tipo === 'opciones' ? p.opciones[p.correcta].texto : `${numero(p.respuesta)} ${p.unidad}`;
    respuestas.push({ pregunta: p.pregunta, bien, dada, correcta, explicacion: p.explicacion });
    // Bloquear y marcar
    main.querySelectorAll('form button, form input').forEach((x) => { x.disabled = true; });
    if (p.tipo === 'opciones') {
      main.querySelector(`[data-opcion="${p.correcta}"]`).classList.add('opcion-bien');
      if (!bien) main.querySelector(`[data-opcion="${r}"]`).classList.add('opcion-mal');
    }
    const ultima = i === preguntas.length - 1;
    main.querySelector('#corregir').innerHTML = `
      <div class="correccion ${bien ? 'bien' : 'mal'}">
        <p class="correccion-titulo">${bien ? '✅ ¡Correcto!' : `❌ La respuesta correcta es: ${esc(correcta)}`}</p>
        <p>${p.explicacion}</p>
      </div>
      <button type="button" class="btn btn-principal btn-ancho" id="seguir">${ultima ? 'Ver mi resultado ▶' : 'Siguiente ▶'}</button>`;
    const seguir = main.querySelector('#seguir');
    seguir.focus();
    seguir.addEventListener('click', () => {
      if (ultima) return resultado();
      i++;
      pintarPregunta();
      window.scrollTo(0, 0);
    });
  };

  const resultado = () => {
    const bien = respuestas.filter((r) => r.bien).length;
    const mejores = leer('ejercicios', {});
    if (bien > (mejores[nivel.id] ?? -1)) guardar('ejercicios', { ...mejores, [nivel.id]: bien });
    const n = estrellas(bien, preguntas.length);
    const mensaje = bien === 10 ? '¡Perfecto! Dominas este nivel.' : bien >= 7 ? '¡Muy bien! Repasa los errores de abajo.' : bien >= 4 ? 'Vas bien. Lee las explicaciones y vuelve a intentarlo.' : 'Sigue practicando: lee las explicaciones y repite el nivel.';
    const errores = respuestas.filter((r) => !r.bien);
    main.innerHTML = `
      <section class="resultado-ejercicio">
        <p class="contador">Nivel ${nivel.id}: ${nivel.nombre}</p>
        <p class="puntaje">${bien} <span>de ${preguntas.length}</span></p>
        ${pintarEstrellas(n)}
        <p>${mensaje}</p>
      </section>
      ${errores.length ? `<h2 class="subtitulo">Para repasar</h2>
        <ul class="errores">${errores.map((r) => `<li><p><b>${r.pregunta}</b></p>
          <p>Tu respuesta: ${esc(r.dada)} · Correcta: <b>${esc(r.correcta)}</b></p><p class="ayuda">${r.explicacion}</p></li>`).join('')}</ul>` : ''}
      <section class="cuadro">
        <h2>📤 Enviar al docente</h2>
        <label class="bloque" for="alumna">Tu nombre<input id="alumna" class="entrada-texto" maxlength="40" value="${esc(leer('alumna', ''))}" placeholder="Nombre y apellido"></label>
        <p class="error" id="error" role="alert"></p>
        <button type="button" class="btn btn-principal btn-ancho" id="enviar">Enviar resultado como imagen</button>
        <p class="aviso-respaldo" id="mensaje" role="status"></p>
      </section>
      <a class="btn btn-secundario btn-ancho" href="#/herramientas/ejercicios/${nivel.id}" id="otra">↺ Intentar de nuevo</a>
      <a class="enlace" href="#/herramientas/ejercicios">Elegir otro nivel</a>`;
    main.querySelector('#otra').addEventListener('click', (e) => { e.preventDefault(); jugar(main, nivel); window.scrollTo(0, 0); });
    main.querySelector('#enviar').addEventListener('click', async () => {
      const nombre = main.querySelector('#alumna').value.trim();
      if (!nombre) { main.querySelector('#error').textContent = 'Escribe tu nombre para que el docente sepa de quién es.'; return; }
      main.querySelector('#error').textContent = '';
      guardar('alumna', nombre);
      const blob = await imagenResultado({ nombre, nivel, bien, total: preguntas.length, estrellas: n });
      const r = await compartirArchivo(new File([blob], `ejercicios-nivel-${nivel.id}.png`, { type: 'image/png' }), 'Resultado de ejercicios');
      main.querySelector('#mensaje').textContent = r === 'descargado' ? '✅ Imagen guardada en Descargas. Envíala al docente por WhatsApp.' : '';
    });
  };

  pintarPregunta();
  return '#/herramientas/ejercicios';
}

// Imagen con el resultado (nombre, nivel, fecha, puntaje y estrellas)
function imagenResultado({ nombre, nivel, bien, total, estrellas: n }) {
  const c = Object.assign(document.createElement('canvas'), { width: 1080, height: 760 });
  const x = c.getContext('2d');
  const f = (t, p = '') => `${p} ${t}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  const ahora = new Date();
  x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 1080, 760);
  x.fillStyle = '#9E2F45'; x.fillRect(0, 0, 1080, 150);
  x.fillStyle = '#FFFFFF'; x.font = f(48, '800'); x.fillText('✂️ Ejercicios de costura', 64, 95);
  x.fillStyle = '#2B2420'; x.font = f(44, '700'); x.fillText(nombre.slice(0, 34), 64, 240);
  x.font = f(34); x.fillStyle = '#6B5E57';
  x.fillText(`Nivel ${nivel.id}: ${nivel.nombre}`, 64, 300);
  x.fillText(`${ahora.toLocaleDateString('es-BO')} · ${ahora.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`, 64, 350);
  x.textAlign = 'center';
  x.fillStyle = '#9E2F45'; x.font = f(150, '800'); x.fillText(`${bien}`, 540, 540);
  x.fillStyle = '#6B5E57'; x.font = f(40); x.fillText(`de ${total} correctas`, 540, 600);
  x.font = f(80); x.fillStyle = '#E8A33D'; x.fillText('★'.repeat(n) + '☆'.repeat(5 - n), 540, 700);
  return new Promise((ok) => c.toBlob(ok, 'image/png'));
}
