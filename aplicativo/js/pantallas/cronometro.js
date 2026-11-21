// Pantalla: cronómetro de costura (cuánto se tarda de verdad en coser una prenda)
import * as tiempos from '../datos/tiempos.js';
import * as cotizaciones from '../datos/cotizaciones.js';
import { buscarPrenda } from '../datos/prendas.js';
import { numero } from '../utilidades/formato.js';

const PRENDAS = ['falda-recta', 'falda-uniforme', 'vestido', 'camisa-dama', 'camisa-varon', 'pantalon-dama', 'pantalon-varon', 'polera-dama', 'polera-varon', 'buzo-dama', 'buzo-varon'];
const titulo = (id) => { const p = buscarPrenda(id); return p ? p.titulo ?? p.nombre : 'Prenda'; };
const fotoDe = (id) => { const p = buscarPrenda(id); return p?.foto ?? p?.img ?? ''; };

export function mostrar(main) {
  // Contenedor propio: al cambiar de pantalla se descarta junto con sus eventos y su reloj
  const zona = document.createElement('div');
  main.replaceChildren(zona);
  let intervalo = null;
  let ultimo = null; // último tiempo terminado (para mostrar el resultado)

  const pintar = () => {
    const e = tiempos.estado();
    const corre = e.inicio != null;
    const hay = tiempos.transcurrido(e) > 0;
    const activa = corre || hay || PRENDAS.includes(e.prenda) ? e.prenda : null;
    const prom = activa ? tiempos.promedio(activa) : null;
    const opciones = activa && !PRENDAS.includes(activa) ? [...PRENDAS, activa] : PRENDAS;
    zona.innerHTML = `
      <h1>Cronómetro de costura</h1>
      <p class="ayuda">Mide cuánto tardas de verdad en coser una prenda. Así sabrás cuánto cobrar por tu trabajo.</p>
      <section class="cuadro">
        <h2>¿Qué estás cosiendo?</h2>
        <div class="elegir-prenda">${opciones.map((id) => `
          <label class="opcion-prenda"><input type="radio" name="prenda" value="${id}" ${activa === id ? 'checked' : ''} ${corre || hay ? 'disabled' : ''}>
            <img class="foto-prenda" src="${fotoDe(id)}" alt="" width="48" height="48"><span>${titulo(id)}</span></label>`).join('')}
        </div>
      </section>
      <section class="cronometro ${corre ? 'corriendo' : ''}">
        <p class="reloj" id="reloj" aria-live="off">${tiempos.reloj(tiempos.transcurrido(e))}</p>
        <p class="reloj-estado">${corre ? '⏺ Contando…' : hay ? '⏸ En pausa' : activa ? 'Listo para empezar' : 'Primero elige la prenda'}</p>
        <div class="acciones">
          ${corre
            ? '<button type="button" class="btn btn-secundario" data-accion="pausar">⏸ Pausar</button>'
            : `<button type="button" class="btn btn-principal" data-accion="empezar" ${activa ? '' : 'disabled'}>▶ ${hay ? 'Seguir' : 'Empezar'}</button>`}
          ${hay ? '<button type="button" class="btn btn-principal" data-accion="terminar">■ Terminé</button>' : ''}
        </div>
        ${hay && !corre ? '<button type="button" class="enlace enlace-boton" data-accion="reiniciar">↺ Empezar de cero (no guarda)</button>' : ''}
      </section>
      <ul class="consejos consejos-chicos">
        <li><span aria-hidden="true">📱</span>Puedes cerrar la app o apagar la pantalla: el cronómetro sigue contando.</li>
        <li><span aria-hidden="true">⏸</span>Pausa cuando dejes de coser (comer, atender a alguien) y sigue al volver.</li>
      </ul>
      ${ultimo ? resultado(ultimo) : ''}
      ${prom ? `<p class="nota nota-info">📊 ${titulo(e.prenda)}: tardas en promedio <b>${tiempos.enPalabras(prom.ms)}</b> (${prom.veces} ${prom.veces === 1 ? 'vez' : 'veces'}).</p>` : ''}
      ${historial()}`;
  };

  const resultado = (r) => {
    const horas = tiempos.horasParaCostos(r.ms);
    return `
      <section class="resultado">
        <p class="resultado-etiqueta">Tardaste</p>
        <p class="resultado-valor">${tiempos.enPalabras(r.ms)}</p>
        <p>en ${titulo(r.prenda)}</p>
        <button type="button" class="btn btn-principal btn-ancho" data-accion="usar" data-horas="${horas}">Usar ${numero(horas)} h en mis costos</button>
        <p class="resultado-detalle" id="usado"></p>
      </section>`;
  };

  const historial = () => {
    const lista = tiempos.registros();
    if (!lista.length) return '';
    return `
      <h2 class="subtitulo">Mis tiempos</h2>
      <ul class="personas">${lista.slice(0, 20).map((r) => `
        <li class="persona tiempo">
          <img class="foto-prenda" src="${fotoDe(r.prenda)}" alt="" width="40" height="40">
          <span class="persona-datos"><strong>${tiempos.enPalabras(r.ms)}</strong>
            <small>${titulo(r.prenda)} · ${new Date(r.fecha).toLocaleDateString('es-BO')}</small></span>
          <button type="button" class="quitar" data-borrar="${r.fecha}" aria-label="Borrar este tiempo">✕</button>
        </li>`).join('')}
      </ul>`;
  };

  // El reloj de la pantalla se actualiza cada segundo solo mientras se ve
  const latir = () => {
    if (!document.contains(zona)) return clearInterval(intervalo);
    const el = zona.querySelector('#reloj');
    if (!el) return;
    el.textContent = tiempos.reloj(tiempos.transcurrido());
  };

  zona.addEventListener('change', (ev) => {
    if (ev.target.name === 'prenda') { tiempos.elegirPrenda(ev.target.value); ultimo = null; pintar(); }
  });
  zona.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-accion], [data-borrar]');
    if (!b) return;
    const accion = b.dataset.accion;
    if (b.dataset.borrar) tiempos.borrarRegistro(b.dataset.borrar);
    if (accion === 'empezar') { tiempos.empezar(); ultimo = null; }
    if (accion === 'pausar') tiempos.pausar();
    if (accion === 'terminar') ultimo = tiempos.terminar();
    if (accion === 'reiniciar') tiempos.reiniciar();
    if (accion === 'usar') {
      const p = cotizaciones.preferencias();
      cotizaciones.guardarPreferencias({ ...p, horas: { ...p.horas, [ultimo.prenda]: numero(Number(b.dataset.horas)) } });
      zona.querySelector('#usado').textContent = '✅ Listo: se usará en «Calcular precio» y en «Cotizaciones» para esta prenda.';
      return;
    }
    pintar();
    window.dispatchEvent(new Event('cronometro'));
  });

  pintar();
  intervalo = setInterval(latir, 1000);
  return '#/herramientas';
}
