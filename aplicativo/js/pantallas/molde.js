// Pantalla: molde dibujado con trazado paso a paso e impresión a tamaño real
import { buscarPrenda } from '../datos/prendas.js';
import { leer } from '../datos/almacenamiento.js';
import { svgPieza } from '../moldes/dibujo-svg.js';
import { construirMolde } from '../moldes/registro.js';
import { numero } from '../utilidades/formato.js';
import { barraPasos } from '../utilidades/ui.js';
import { hayVoz, hablar } from '../utilidades/voz.js';

export function mostrar(main, [id]) {
  const prenda = buscarPrenda(id);
  const medidas = leer('trabajo', { medidas: {} }).medidas;
  if (prenda.medidas.some((k) => medidas[k] == null)) {
    location.replace(`#/medidas/${id}/revisar`);
    return;
  }
  const esta = location.hash;
  main.innerHTML = `${barraPasos(2)}<p class="ayuda">Preparando el molde…</p>`;
  construirMolde(id, medidas).then((molde) => {
    if (location.hash === esta) pintar(main, prenda, molde);
  });
  return `#/medidas/${id}/revisar`;
}

function pintar(main, prenda, molde) {
  const titulo = prenda.titulo ?? prenda.nombre;
  let pieza = 0, paso = 0;

  main.innerHTML = `
    ${barraPasos(2)}
    <h1>Tu molde: ${titulo}</h1>
    <p class="ayuda">Sigue los pasos para trazarlo en papel, o imprímelo en tamaño real.</p>
    <div class="selector" role="group" aria-label="Pieza del molde">
      ${molde.piezas.map((p, i) => `<button type="button" data-pieza="${i}">${p.nombre}</button>`).join('')}
    </div>
    <div class="lienzo-molde" id="dibujo"></div>
    <div class="paso-caja" aria-live="polite">
      <p class="paso-num" id="paso-num"></p>
      <p class="como"><span id="paso-texto"></span>
        ${hayVoz ? '<button type="button" class="btn-voz" aria-label="Escuchar el paso">🔊</button>' : ''}</p>
      <div class="acciones">
        <button type="button" class="btn btn-secundario" id="anterior">◀ Anterior</button>
        <button type="button" class="btn btn-principal" id="siguiente"></button>
      </div>
    </div>
    ${molde.rectangulos.map((x) => `<p class="nota nota-info">📏 <b>${x.nombre}</b> (${x.cortar}): ${x.texto}</p>`).join('')}
    <details class="calculos">
      <summary>¿De dónde salen las medidas?</summary>
      <table>${molde.calculos.map((c) => `
        <tr><td>${c.nombre}<small>${c.formula}</small></td><td>${numero(c.valor)} cm</td></tr>`).join('')}
      </table>
    </details>
    <button type="button" class="btn btn-secundario btn-ancho" id="imprimir">🖨️ Imprimir en tamaño real</button>
    <a class="btn btn-principal btn-ancho" href="#/tela/${prenda.id}">Siguiente: calcular tela ▶</a>
    <p class="provisional">Fórmulas provisionales, pendientes de revisión con el docente del taller.</p>`;

  const $ = (s) => main.querySelector(s);
  const actualizar = () => {
    const p = molde.piezas[pieza];
    const ultimo = p.pasos.length - 1;
    $('#dibujo').innerHTML = svgPieza(p, paso);
    $('#paso-num').textContent = `${p.nombre} · Paso ${paso + 1} de ${p.pasos.length}${paso === ultimo ? ' · ¡Terminado!' : ''}`;
    $('#paso-texto').textContent = p.pasos[paso];
    $('#anterior').disabled = paso === 0;
    $('#siguiente').textContent = paso === ultimo ? '↺ Repetir' : 'Siguiente ▶';
    main.querySelectorAll('[data-pieza]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.pieza == pieza));
  };

  $('#anterior').addEventListener('click', () => { paso--; actualizar(); });
  $('#siguiente').addEventListener('click', () => {
    paso = paso === molde.piezas[pieza].pasos.length - 1 ? 0 : paso + 1;
    actualizar();
  });
  main.querySelectorAll('[data-pieza]').forEach((b) => b.addEventListener('click', () => {
    pieza = Number(b.dataset.pieza);
    paso = Math.min(paso, molde.piezas[pieza].pasos.length - 1);
    actualizar();
  }));
  $('.btn-voz')?.addEventListener('click', () => hablar($('#paso-texto').textContent));
  $('#imprimir').addEventListener('click', async () => {
    const { imprimir } = await import('../moldes/impresion.js');
    imprimir(titulo, molde);
  });
  actualizar();
}
