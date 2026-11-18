// Pantalla: cuánta tela comprar, con el plano de corte
import { buscarPrenda } from '../datos/prendas.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { construirMolde, tieneMolde } from '../moldes/registro.js';
import { ANCHOS_COMUNES, EXTRA, piezasDeMolde, planoDeCorte } from '../calculos/tela.js';
import { leerNumero, numero, metros } from '../utilidades/formato.js';
import { barraPasos } from '../utilidades/ui.js';

const COLORES = ['#A9C6E8', '#E8A0B4', '#B9D8C2', '#F2C6A0', '#CDB8E0'];

export function mostrar(main, [id]) {
  const prenda = buscarPrenda(id);
  const trabajo = leer('trabajo', { medidas: {} });
  if (!prenda || !tieneMolde(id)) return location.replace('#/prendas');
  if (prenda.medidas.some((k) => trabajo.medidas[k] == null)) return location.replace(`#/medidas/${id}/revisar`);

  const esta = location.hash;
  main.innerHTML = `${barraPasos(3, id)}<p class="ayuda">Calculando…</p>`;
  construirMolde(id, trabajo.medidas).then((molde) => {
    if (location.hash === esta) pintar(main, prenda, piezasDeMolde(molde), trabajo.tela?.ancho ?? 150);
  });
  return `#/molde/${id}`;
}

function pintar(main, prenda, piezas, anchoInicial) {
  const otroInicial = ANCHOS_COMUNES.includes(anchoInicial) ? '' : numero(anchoInicial / 100);
  main.innerHTML = `
    ${barraPasos(3, prenda.id)}
    <h1>¿Cuánta tela comprar?</h1>
    <p class="ayuda">Elige el ancho de la tela. Si no sabes, pregunta en la tienda.</p>
    <div class="selector selector-ancho" role="group" aria-label="Ancho de la tela">
      ${ANCHOS_COMUNES.map((a) => `<button type="button" data-ancho="${a}">${metros(a)}</button>`).join('')}
    </div>
    <label class="otro-ancho">Otro ancho:
      <span class="campo"><input id="otro" inputmode="decimal" autocomplete="off" placeholder="1,40" value="${otroInicial}"><span class="unidad">m</span></span>
    </label>
    <p class="error" id="error" role="alert"></p>
    <div id="resultado" aria-live="polite"></div>
    <a class="btn btn-principal btn-ancho" href="#/costos/${prenda.id}">Siguiente: costos y precio ▶</a>`;

  const $ = (s) => main.querySelector(s);
  const calcular = (ancho) => {
    main.querySelectorAll('[data-ancho]').forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.ancho) === ancho));
    const plano = planoDeCorte(piezas, ancho);
    if (plano.error) {
      $('#resultado').innerHTML = `<p class="nota">⚠️ ${plano.error} Elige una tela más ancha.</p>`;
      return;
    }
    const t = leer('trabajo', { medidas: {} });
    guardar('trabajo', { ...t, tela: { ancho, largo: plano.largo, comprar: plano.comprar } });
    $('#resultado').innerHTML = resultado(plano, piezas);
  };

  main.querySelectorAll('[data-ancho]').forEach((b) => b.addEventListener('click', () => {
    $('#otro').value = '';
    $('#error').textContent = '';
    calcular(Number(b.dataset.ancho));
  }));
  $('#otro').addEventListener('input', (e) => {
    const m = leerNumero(e.target.value);
    const cm = m > 5 ? m : m * 100; // acepta 1,40 (m) o 140 (cm)
    const valido = cm >= 50 && cm <= 300;
    $('#error').textContent = e.target.value.trim() && !valido ? 'Escribe el ancho en metros, por ejemplo 1,40.' : '';
    if (valido) calcular(Math.round(cm));
  });
  calcular(anchoInicial);
}

function resultado(plano, piezas) {
  const comparar = ANCHOS_COMUNES.map((a) => ({ a, p: planoDeCorte(piezas, a) }));
  return `
    <div class="resultado">
      <p class="resultado-etiqueta">Compra</p>
      <p class="resultado-valor">${metros(plano.comprar)}</p>
      <p>de tela de ${metros(plano.anchoTela)} de ancho</p>
      <p class="resultado-detalle">Las piezas ocupan ${metros(plano.largo)}. Se agregan unos ${EXTRA} cm por si la tela encoge o la cortan torcida.</p>
    </div>
    ${plano.notas.map((t) => `<p class="nota nota-info">✂️ ${t}</p>`).join('')}
    <h2 class="subtitulo">Cómo acomodar las piezas</h2>
    <p class="ayuda">Dobla la tela a lo largo, orillo con orillo. Las piezas «al doblez» van pegadas al doblez.</p>
    <div class="lienzo-molde lienzo-tela">${dibujoPlano(plano)}</div>
    <a class="btn btn-secundario btn-ancho" href="#/herramientas/lista">✅ Antes de cortar, revisa la lista</a>
    <details class="calculos">
      <summary>¿Y con otro ancho de tela?</summary>
      <table>${comparar.map(({ a, p }) => `
        <tr><td>Tela de ${metros(a)}</td><td>${p.error ? 'No entra' : `Comprar ${metros(p.comprar)}`}</td></tr>`).join('')}
      </table>
    </details>`;
}

function dibujoPlano({ util, largo, colocadas }) {
  const r = (v) => Math.round(v * 10) / 10;
  const piezas = colocadas.map((c, i) => {
    const forma = c.puntos && !c.atravesada
      ? `<path d="${c.puntos.map((p, j) => `${j ? 'L' : 'M'}${r(c.x + p.x)} ${r(c.y + p.y)}`).join(' ')} Z"`
      : `<rect x="${r(c.x)}" y="${r(c.y)}" width="${r(c.ancho)}" height="${r(c.alto)}"`;
    const tam = Math.min(3, c.ancho / 6, c.alto / 2);
    return `${forma} fill="${COLORES[i % COLORES.length]}" stroke="#2B2420" stroke-width=".3"/>
      <text x="${r(c.x + c.ancho / 2)}" y="${r(c.y + c.alto / 2)}" font-size="${r(tam)}" font-weight="700"
            text-anchor="middle" dominant-baseline="middle" fill="#2B2420">${c.nombre}</text>`;
  }).join('');
  return `<svg viewBox="-6 -5 ${r(util + 20)} ${r(largo + 10)}" role="img" font-family="system-ui, sans-serif"
      aria-label="Plano de corte: ${colocadas.map((c) => c.nombre).join(', ')}">
    <rect x="0" y="0" width="${r(util)}" height="${r(largo)}" fill="#F4EEE6" stroke="#8A7A6E" stroke-width=".3"/>
    ${piezas}
    <path d="M0 0 V${r(largo)}" stroke="#9E2F45" stroke-width=".8" stroke-dasharray="2 1.5"/>
    <text transform="translate(-2 ${r(largo / 2)}) rotate(-90)" font-size="3" text-anchor="middle" fill="#9E2F45" font-weight="700">DOBLEZ</text>
    <text transform="translate(${r(util + 3.5)} ${r(largo / 2)}) rotate(90)" font-size="3" text-anchor="middle" fill="#6B5E57">ORILLOS</text>
    <path d="M${r(util + 9)} 0 V${r(largo)} M${r(util + 7.5)} 0 H${r(util + 10.5)} M${r(util + 7.5)} ${r(largo)} H${r(util + 10.5)}" stroke="#2B2420" stroke-width=".4"/>
    <text transform="translate(${r(util + 12.5)} ${r(largo / 2)}) rotate(90)" font-size="3" text-anchor="middle" fill="#2B2420">${metros(largo)}</text>
  </svg>`;
}
