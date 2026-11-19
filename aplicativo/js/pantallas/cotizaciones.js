// Pantalla: cotizaciones "a medida" (personas guardadas) y "por tallas" (pedidos por cantidad)
import * as cotizaciones from '../datos/cotizaciones.js';
import { dibujo } from '../utilidades/iconos.js';
import * as personas from '../datos/personas.js';
import { buscarPrenda } from '../datos/prendas.js';
import { TABLAS, tablasPara } from '../datos/tallas.js';
import { telaDePrenda, precioUnidad, telaTotal } from '../calculos/cotizacion.js';
import { ANCHOS_COMUNES } from '../calculos/tela.js';
import { valor } from '../calculos/costos.js';
import { avatar } from '../utilidades/avatares.js';
import { bs, metros, numero } from '../utilidades/formato.js';
import { esc } from '../utilidades/ui.js';

const PRENDAS_MOLDE = ['falda-recta', 'falda-uniforme', 'blusa', 'vestido', 'camisa-dama', 'camisa-varon', 'pantalon-dama', 'pantalon-varon', 'polera-dama', 'polera-varon'];
const tituloDe = (id) => { const p = buscarPrenda(id); return p.titulo ?? p.nombre; };
const fechaCorta = (iso) => personas.fecha(iso);
const hoyIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const sumarDias = (iso, dias) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + dias); return d.toISOString().slice(0, 10); };

export function mostrar(main, [a, b]) {
  if (a === 'nueva' && (b === 'medida' || b === 'tallas')) return nueva(main, b);
  if (a === 'ver' && cotizaciones.buscar(b)) return ver(main, cotizaciones.buscar(b));
  return inicio(main);
}

// ---------- Inicio: elegir tipo + cotizaciones guardadas ----------
function inicio(main) {
  const todas = cotizaciones.listar();
  main.innerHTML = `
    <h1>Cotizaciones</h1>
    <p class="ayuda">Calcula el precio de un pedido y envíaselo a quien te encarga.</p>
    <div class="tipos-cotizacion">
      <a class="tipo-cotizacion" href="#/cotizaciones/nueva/medida">
        <span class="tipo-icono" aria-hidden="true">${['mujer', 'nina', 'nino'].map((x) => `<span class="avatar">${avatar(x).svg}</span>`).join('')}</span>
        <strong>A medida</strong>
        <small>Para personas con sus medidas guardadas: tú, tu familia, niñas y niños.</small>
      </a>
      <a class="tipo-cotizacion" href="#/cotizaciones/nueva/tallas">
        <span class="tipo-icono tallas-icono" aria-hidden="true"><b>S</b><b>M</b><b>L</b><b>XL</b></span>
        <strong>Por tallas</strong>
        <small>Pedidos por cantidad: docenas, uniformes de colegio.</small>
      </a>
    </div>
    <h2 class="subtitulo">Cotizaciones guardadas</h2>
    ${todas.length ? `<ul class="personas">${todas.map((c) => `
      <li><a class="persona" href="#/cotizaciones/ver/${c.id}">
        <span class="numero-cot">Nº ${c.numero}</span>
        <span class="persona-datos"><strong>${esc(c.cliente || 'Sin nombre')}</strong>
          <small>${esc(c.prendaTitulo)} · ${c.unidades} unid. · ${fechaCorta(c.fecha)}</small></span>
        <b>${bs(c.total)}</b>
      </a></li>`).join('')}</ul>` : '<p class="ayuda">Todavía no hay cotizaciones.</p>'}`;
  return '#/';
}

// ---------- Nueva cotización ----------
function nueva(main, tipo) {
  const pref = cotizaciones.preferencias();
  const todasPersonas = personas.listar();
  const e = {
    tipo, prenda: null, tabla: null,
    cantidades: {},                     // por persona (id) o por talla
    anchoTela: pref.anchoTela, precioTela: pref.precioTela,
    insumos: [], horas: '', pagoHora: pref.pagoHora, gastosPct: pref.gastosPct, ganancia: pref.ganancia, tipoGanancia: pref.tipo,
  };
  const cache = new Map();             // metros de tela ya calculados
  let ultimoCalculo = null;

  main.innerHTML = `
    <h1>${tipo === 'medida' ? 'Cotización a medida' : 'Cotización por tallas'}</h1>
    <p class="ayuda">Completa los pasos. El precio se calcula solo.</p>
    <form class="costos" novalidate>
      <section class="cuadro">
        <h2><span class="cuadro-num">1</span> ¿Qué prenda?</h2>
        <div class="elegir-prenda">${PRENDAS_MOLDE.map((id) => `
          <label class="opcion-prenda"><input type="radio" name="prenda" value="${id}">
            <img src="${buscarPrenda(id).img}" alt="" width="48" height="48"><span>${tituloDe(id)}</span></label>`).join('')}
        </div>
      </section>
      <section class="cuadro" id="quienes"></section>
      <section class="cuadro" id="tela-y-costos" hidden>
        <h2><span class="cuadro-num">3</span> Tela</h2>
        <p class="ayuda">Ancho de la tela:</p>
        <div class="selector selector-ancho">${ANCHOS_COMUNES.map((a) => `<button type="button" data-ancho="${a}">${metros(a)}</button>`).join('')}</div>
        <label class="bloque">Precio por metro
          <span class="campo"><span class="unidad">Bs</span><input name="precioTela" inputmode="decimal" placeholder="ej. 35" value="${esc(e.precioTela)}"></span></label>
        <h2 class="separado"><span class="cuadro-num">4</span> Costo de cada prenda</h2>
        <div id="insumos"></div>
        <div class="fila-calculo">
          <label>Horas por prenda<span class="campo"><input name="horas" inputmode="decimal" placeholder="ej. 3"><span class="unidad">h</span></span></label>
          <span class="por" aria-hidden="true">×</span>
          <label>Pago por hora<span class="campo"><span class="unidad">Bs</span><input name="pagoHora" inputmode="decimal" placeholder="ej. 10" value="${esc(e.pagoHora)}"></span></label>
        </div>
        <label class="bloque">Gastos del taller <small>Luz, máquina, agujas: % de los materiales</small>
          <span class="campo campo-corto"><input name="gastosPct" inputmode="decimal" value="${esc(e.gastosPct)}"><span class="unidad">%</span></span></label>
        <label class="bloque">Ganancia
          <span class="campo campo-corto"><input name="ganancia" inputmode="decimal" value="${esc(e.ganancia)}"><span class="unidad">%</span></span></label>
        <fieldset class="tipo-ganancia">
          <legend>Ese porcentaje es…</legend>
          <label><input type="radio" name="tipoGanancia" value="costo" ${e.tipoGanancia === 'costo' ? 'checked' : ''}> del <b>costo</b></label>
          <label><input type="radio" name="tipoGanancia" value="venta" ${e.tipoGanancia === 'venta' ? 'checked' : ''}> del <b>precio de venta</b></label>
        </fieldset>
      </section>
      <section class="cuadro" id="resultado" hidden></section>
    </form>`;

  const $ = (s) => main.querySelector(s);
  const form = $('form');

  // ----- Paso 2: personas o tallas -----
  const pintarQuienes = () => {
    const prenda = buscarPrenda(e.prenda);
    if (tipo === 'medida') {
      $('#quienes').innerHTML = `
        <h2><span class="cuadro-num">2</span> ¿Para quiénes?</h2>
        ${todasPersonas.length ? `<p class="ayuda">Marca a cada persona y cuántas prendas son para ella.</p>
          <ul class="lista-cantidades">${todasPersonas.map((p) => {
            const faltan = prenda.medidas.filter((id) => p.medidas[id] == null).length;
            return `<li class="${faltan ? 'incompleta' : ''}">
              <span class="avatar">${avatar(p.avatar).svg}</span>
              <span class="persona-datos"><strong>${esc(p.nombre)}</strong>
                <small>${faltan ? `Le faltan ${faltan} medidas · <a href="#/guardadas/${p.id}">completar</a>` : '✓ Tiene sus medidas'}</small></span>
              ${faltan ? '' : contador(p.id)}
            </li>`;
          }).join('')}</ul>`
        : '<p class="ayuda">Primero guarda las medidas de las personas.</p>'}
        <a class="enlace" href="#/guardadas/nueva">＋ Agregar persona</a>`;
    } else {
      const tablas = tablasPara(e.prenda);
      if (!tablas.includes(e.tabla)) { e.tabla = tablas[0]; e.cantidades = {}; }
      $('#quienes').innerHTML = `
        <h2><span class="cuadro-num">2</span> ¿Cuántas de cada talla?</h2>
        <div class="selector">${tablas.map((t) => `<button type="button" data-tabla="${t}" aria-pressed="${t === e.tabla}">${TABLAS[t].nombre}</button>`).join('')}</div>
        <ul class="lista-cantidades">${TABLAS[e.tabla].tallas.map((t) => `
          <li><span class="talla" aria-label="Talla ${t}">${t}</span>
            ${contador(t)}<button type="button" class="btn-docena" data-docena="${t}">+12</button></li>`).join('')}
        </ul>
        <p class="ayuda">Medidas de cada talla: tabla aproximada del taller (provisional).</p>`;
    }
  };
  const contador = (clave) => `
    <span class="contador-cant">
      <button type="button" data-menos="${clave}" aria-label="Uno menos">−</button>
      <output id="c-${clave}">${e.cantidades[clave] ?? 0}</output>
      <button type="button" data-mas="${clave}" aria-label="Uno más">＋</button>
    </span>`;

  const pintarInsumos = () => {
    $('#insumos').innerHTML = e.insumos.map((m, i) => `
      <label class="bloque">${esc(m.nombre)} <small>${numero(valor(m.cantidad))} ${esc(m.unidad)} por prenda</small>
        <span class="campo"><span class="unidad">Bs</span><input data-insumo="${i}" inputmode="decimal" placeholder="precio" value="${esc(m.precio)}"></span></label>`).join('');
  };

  // ----- Líneas de la cotización (cada persona o talla con cantidad) -----
  const lineas = () => {
    const prenda = buscarPrenda(e.prenda);
    if (tipo === 'medida') {
      return todasPersonas.filter((p) => (e.cantidades[p.id] ?? 0) > 0 && prenda.medidas.every((id) => p.medidas[id] != null))
        .map((p) => ({ clave: p.id, detalle: `${tituloDe(e.prenda)} – ${p.nombre}`, cantidad: e.cantidades[p.id], medidas: p.medidas }));
    }
    return TABLAS[e.tabla].tallas.filter((t) => (e.cantidades[t] ?? 0) > 0)
      .map((t) => ({ clave: t, detalle: `${tituloDe(e.prenda)} – talla ${t}`, cantidad: e.cantidades[t], medidas: TABLAS[e.tabla].medidas[t] }));
  };

  const actualizar = async () => {
    const lista = lineas();
    $('#tela-y-costos').hidden = !e.prenda;
    const zona = $('#resultado');
    zona.hidden = !lista.length;
    if (!lista.length) return;
    const turno = Symbol();
    ultimoCalculo = turno;
    let conMetros;
    try {
      conMetros = await Promise.all(lista.map(async (l) => {
        const clave = `${e.prenda}|${e.anchoTela}|${JSON.stringify(l.medidas)}`;
        if (!cache.has(clave)) cache.set(clave, telaDePrenda(e.prenda, l.medidas, e.anchoTela));
        return { ...l, metros: await cache.get(clave) };
      }));
    } catch (error) {
      if (ultimoCalculo === turno) zona.innerHTML = `<p class="nota">⚠️ ${esc(error.message)} Elige una tela más ancha.</p>`;
      return;
    }
    if (ultimoCalculo !== turno) return;
    const datos = { precioTela: e.precioTela, insumos: e.insumos, horas: e.horas, pagoHora: e.pagoHora, gastosPct: e.gastosPct, ganancia: e.ganancia, tipo: e.tipoGanancia };
    const filas = conMetros.map((l) => {
      const u = precioUnidad(l.metros, datos);
      return { ...l, costo: u.costo, precio: Math.ceil(u.precio) };
    });
    const valido = filas.every((f) => Number.isFinite(f.precio));
    const unidades = filas.reduce((s, f) => s + f.cantidad, 0);
    const total = filas.reduce((s, f) => s + f.precio * f.cantidad, 0);
    const costo = filas.reduce((s, f) => s + f.costo * f.cantidad, 0);
    const tela = telaTotal(filas);
    const falta = !valor(e.precioTela) || !valor(e.horas) || !valor(e.pagoHora);
    zona.innerHTML = `
      <h2><span class="cuadro-num">5</span> Resultado</h2>
      ${!valido ? '<p class="error">Revisa los números: usa solo cifras positivas, y una ganancia sobre la venta menor a 100 %.</p>' : `
      ${falta ? '<p class="nota">⚠️ Faltan el precio de la tela, las horas o el pago por hora: el precio todavía está incompleto.</p>' : ''}
      <table class="tabla-cot">
        <thead><tr><th>Prenda</th><th>Cant.</th><th>Precio c/u</th><th>Subtotal</th></tr></thead>
        <tbody>${filas.map((f) => `<tr><td>${esc(f.detalle)}<small>${numero(Math.round(f.metros * 100) / 100)} m de tela c/u</small></td>
          <td>${f.cantidad}</td><td>${bs(f.precio)}</td><td>${bs(f.precio * f.cantidad)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="3">Total (${unidades} prendas)</td><td>${bs(total)}</td></tr></tfoot>
      </table>
      <p class="nota nota-info">🧵 Tela a comprar para todo el pedido: <b>${numero(tela)} m</b> (ancho ${metros(e.anchoTela)}).<br>
        💰 Tu ganancia: <b>${bs(total - costo)}</b>. Esto no aparece en la cotización.</p>
      <h2 class="separado">Datos para enviar</h2>
      <label class="bloque" for="cliente">¿Para quién es la cotización?
        <input id="cliente" class="entrada-texto" maxlength="40" placeholder="Ej.: Sra. Juana, Colegio San José"></label>
      <label class="bloque" for="taller">Tu nombre o el de tu taller
        <input id="taller" class="entrada-texto" maxlength="40" value="${esc(pref.taller)}"></label>
      <div class="fila-calculo">
        <label>Fecha de entrega<input type="date" id="entrega" class="entrada-texto" value="${sumarDias(hoyIso(), 7)}"></label>
        <span></span>
        <label>Adelanto<span class="campo"><input id="adelanto" inputmode="decimal" value="50"><span class="unidad">%</span></span></label>
      </div>
      <label class="bloque" for="notas">Nota (opcional)
        <input id="notas" class="entrada-texto" maxlength="120" placeholder="Ej.: tela azul marino, incluye bordado"></label>
      <p class="error" id="error-cot" role="alert"></p>
      <button type="button" class="btn btn-principal btn-ancho" id="crear">📄 Crear cotización</button>`}`;
    $('#crear')?.addEventListener('click', () => {
      try {
        const nuevaPref = { ...cotizaciones.preferencias(), anchoTela: e.anchoTela, precioTela: e.precioTela, pagoHora: e.pagoHora,
          gastosPct: e.gastosPct, ganancia: e.ganancia, tipo: e.tipoGanancia, taller: $('#taller').value.trim(),
          horas: { ...cotizaciones.preferencias().horas, [e.prenda]: e.horas },
          insumos: { ...cotizaciones.preferencias().insumos, ...Object.fromEntries(e.insumos.map((m) => [m.nombre, m.precio])) } };
        cotizaciones.guardarPreferencias(nuevaPref);
        const c = cotizaciones.crear({
          tipo, fecha: hoyIso(), prendaId: e.prenda, prendaTitulo: tituloDe(e.prenda),
          cliente: $('#cliente').value.trim(), taller: $('#taller').value.trim(), entrega: $('#entrega').value,
          adelantoPct: Math.min(100, valor($('#adelanto').value) || 0), validez: 7, notas: $('#notas').value.trim(),
          lineas: filas.map((f) => ({ detalle: f.detalle, cantidad: f.cantidad, precio: f.precio })),
          unidades, total, interno: { costo, ganancia: total - costo, tela, anchoTela: e.anchoTela },
        });
        location.hash = `#/cotizaciones/ver/${c.id}`;
      } catch (error) {
        $('#error-cot').textContent = error.message;
      }
    });
  };

  // ----- Eventos -----
  form.addEventListener('change', (ev) => {
    if (ev.target.name !== 'prenda') return;
    e.prenda = ev.target.value;
    e.cantidades = {};
    e.horas = pref.horas[e.prenda] ?? '';
    form.horas.value = e.horas;
    e.insumos = (buscarPrenda(e.prenda).insumos ?? []).map((m) => ({ ...m, precio: pref.insumos[m.nombre] ?? '' }));
    pintarQuienes();
    pintarInsumos();
    marcarAncho();
    actualizar();
  });
  form.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset.insumo != null) e.insumos[el.dataset.insumo].precio = el.value;
    else if (['precioTela', 'horas', 'pagoHora', 'gastosPct', 'ganancia', 'tipoGanancia'].includes(el.name)) e[el.name] = el.value;
    else return;
    actualizar();
  });
  form.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.mas || d.menos || d.docena) {
      const clave = d.mas ?? d.menos ?? d.docena;
      e.cantidades[clave] = Math.max(0, (e.cantidades[clave] ?? 0) + (d.mas ? 1 : d.menos ? -1 : 12));
      $(`#c-${CSS.escape(clave)}`).textContent = e.cantidades[clave];
      actualizar();
    } else if (d.tabla) {
      e.tabla = d.tabla; e.cantidades = {};
      pintarQuienes(); actualizar();
    } else if (d.ancho) {
      e.anchoTela = Number(d.ancho);
      marcarAncho(); actualizar();
    }
  });
  const marcarAncho = () => main.querySelectorAll('[data-ancho]').forEach((x) => x.setAttribute('aria-pressed', Number(x.dataset.ancho) === e.anchoTela));
  return '#/cotizaciones';
}

// ---------- Ver una cotización (lo que se envía al cliente) ----------
function documento(c) {
  const adelanto = Math.round(c.total * c.adelantoPct) / 100;
  return `
    <article class="documento-cot">
      <header><p class="doc-titulo">COTIZACIÓN</p><p>Nº ${c.numero} · ${fechaCorta(c.fecha)}</p></header>
      ${c.taller ? `<p><b>De:</b> ${esc(c.taller)}</p>` : ''}
      ${c.cliente ? `<p><b>Para:</b> ${esc(c.cliente)}</p>` : ''}
      <table class="tabla-cot">
        <thead><tr><th>Detalle</th><th>Cant.</th><th>Precio c/u</th><th>Subtotal</th></tr></thead>
        <tbody>${c.lineas.map((l) => `<tr><td>${esc(l.detalle)}</td><td>${l.cantidad}</td><td>${bs(l.precio)}</td><td>${bs(l.precio * l.cantidad)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="3">TOTAL</td><td>${bs(c.total)}</td></tr></tfoot>
      </table>
      <ul class="doc-datos">
        ${c.adelantoPct ? `<li>Adelanto (${numero(c.adelantoPct)} %): <b>${bs(adelanto)}</b></li><li>Saldo al entregar: <b>${bs(c.total - adelanto)}</b></li>` : ''}
        ${c.entrega ? `<li>Fecha de entrega: <b>${fechaCorta(c.entrega)}</b></li>` : ''}
        <li>Precio válido hasta el ${fechaCorta(sumarDias(c.fecha, c.validez))}</li>
        ${c.notas ? `<li>Nota: ${esc(c.notas)}</li>` : ''}
      </ul>
    </article>`;
}

function ver(main, c) {
  main.innerHTML = `
    ${documento(c)}
    <p class="nota nota-info">🔒 Solo para ti: costo ${bs(c.interno.costo)} · tu ganancia ${bs(c.interno.ganancia)} · tela a comprar ${numero(c.interno.tela)} m (ancho ${metros(c.interno.anchoTela)}).</p>
    <button type="button" class="btn btn-principal btn-ancho" id="enviar">📤 Enviar como imagen (WhatsApp)</button>
    <button type="button" class="btn btn-secundario btn-ancho" id="imprimir">🖨️ Imprimir o guardar PDF</button>
    <button type="button" class="btn btn-peligro btn-ancho" id="borrar">🗑️ Borrar cotización</button>
    <dialog class="dialogo" id="confirmar">
      ${dibujo('papelera', 'dialogo-icono')}<h2>¿Borrar la cotización Nº ${c.numero}?</h2>
      <p>Esto no se puede deshacer.</p>
      <div class="acciones"><button type="button" class="btn btn-secundario" data-r="no">No, volver</button>
        <button type="button" class="btn btn-peligro" data-r="si">Sí, borrar</button></div>
    </dialog>
    <p class="aviso-respaldo" id="mensaje" role="status"></p>`;

  const $ = (s) => main.querySelector(s);
  $('#enviar').addEventListener('click', async () => {
    const blob = await imagen(c);
    const archivo = new File([blob], `cotizacion-${c.numero}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [archivo] })) {
      navigator.share({ files: [archivo], title: `Cotización Nº ${c.numero}` }).catch(() => {});
    } else {
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: archivo.name });
      a.click(); URL.revokeObjectURL(a.href);
      $('#mensaje').textContent = `✅ Imagen guardada en Descargas: ${archivo.name}. Envíala por WhatsApp desde ahí.`;
    }
  });
  $('#imprimir').addEventListener('click', () => {
    document.querySelector('#impresion')?.remove();
    const zona = Object.assign(document.createElement('div'), { id: 'impresion', innerHTML: `<section class="hoja">${documento(c)}</section>` });
    document.body.append(zona);
    window.addEventListener('afterprint', () => zona.remove(), { once: true });
    window.print();
  });
  const dialogo = $('#confirmar');
  $('#borrar').addEventListener('click', () => dialogo.showModal());
  dialogo.addEventListener('click', (ev) => {
    const r = ev.target.closest('[data-r]')?.dataset.r;
    if (r === 'no' || ev.target === dialogo) dialogo.close();
    if (r === 'si') { cotizaciones.borrar(c.id); dialogo.close(); location.hash = '#/cotizaciones'; }
  });
  return '#/cotizaciones';
}

// Dibuja la cotización como imagen para enviarla por WhatsApp
function imagen(c) {
  const ancho = 1080, m = 64;
  const lineasTexto = [];
  const lienzo = document.createElement('canvas');
  const ctx = lienzo.getContext('2d');
  const fuente = (t, p = '') => `${p} ${t}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  const adelanto = Math.round(c.total * c.adelantoPct) / 100;
  // Medir el alto que hace falta
  const alto = 330 + c.lineas.length * 70 + 120 + 5 * 52 + (c.cliente ? 50 : 0) + (c.taller ? 50 : 0) + 80;
  lienzo.width = ancho; lienzo.height = alto;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, ancho, alto);
  ctx.fillStyle = '#9E2F45'; ctx.fillRect(0, 0, ancho, 170);
  ctx.fillStyle = '#FFFFFF'; ctx.font = fuente(56, '800'); ctx.fillText('COTIZACIÓN', m, 95);
  ctx.font = fuente(32); ctx.fillText(`Nº ${c.numero} · ${fechaCorta(c.fecha)}`, m, 145);
  let y = 230;
  const texto = (t, x, tam = 32, peso = '', color = '#2B2420', alinear = 'left') => {
    ctx.font = fuente(tam, peso); ctx.fillStyle = color; ctx.textAlign = alinear; ctx.fillText(t, x, y); ctx.textAlign = 'left';
  };
  const corto = (t, max) => { ctx.font = fuente(30); let s = t; while (ctx.measureText(s).width > max && s.length > 3) s = `${s.slice(0, -2)}…`; return s; };
  if (c.taller) { texto(`De: ${c.taller}`, m); y += 50; }
  if (c.cliente) { texto(`Para: ${c.cliente}`, m, 32, '700'); y += 50; }
  y += 20;
  // Columnas: detalle a la izquierda; cantidad, precio y subtotal alineados a la derecha
  const col = [m, 600, 800, ancho - m];
  texto('Detalle', col[0], 26, '700', '#6B5E57'); texto('Cant.', col[1], 26, '700', '#6B5E57', 'right'); texto('C/u', col[2], 26, '700', '#6B5E57', 'right'); texto('Subtotal', col[3], 26, '700', '#6B5E57', 'right');
  y += 20; ctx.fillStyle = '#E5DAD0'; ctx.fillRect(m, y, ancho - 2 * m, 3); y += 50;
  for (const l of c.lineas) {
    texto(corto(l.detalle, 440), col[0], 30); texto(String(l.cantidad), col[1], 30, '', '#2B2420', 'right'); texto(bs(l.precio), col[2], 30, '', '#2B2420', 'right'); texto(bs(l.precio * l.cantidad), col[3], 30, '', '#2B2420', 'right');
    y += 70;
  }
  ctx.fillStyle = '#E5DAD0'; ctx.fillRect(m, y - 45, ancho - 2 * m, 3);
  y += 15; texto('TOTAL', m, 40, '800'); texto(bs(c.total), ancho - m, 44, '800', '#9E2F45', 'right'); y += 80;
  if (c.adelantoPct) { lineasTexto.push(`Adelanto (${numero(c.adelantoPct)} %): ${bs(adelanto)}`, `Saldo al entregar: ${bs(c.total - adelanto)}`); }
  if (c.entrega) lineasTexto.push(`Fecha de entrega: ${fechaCorta(c.entrega)}`);
  lineasTexto.push(`Precio válido hasta el ${fechaCorta(sumarDias(c.fecha, c.validez))}`);
  if (c.notas) lineasTexto.push(corto(`Nota: ${c.notas}`, ancho - 2 * m));
  for (const t of lineasTexto) { texto(t, m, 30); y += 52; }
  const final = Object.assign(document.createElement('canvas'), { width: ancho, height: Math.min(alto, y + 10) });
  final.getContext('2d').drawImage(lienzo, 0, 0);
  return new Promise((ok) => final.toBlob(ok, 'image/png'));
}
