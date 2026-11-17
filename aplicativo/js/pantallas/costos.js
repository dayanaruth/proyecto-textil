// Pantalla: costos en 3 cuadros y precio de venta sugerido
import { buscarPrenda } from '../datos/prendas.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { calcularCostos, precioVenta, valor } from '../calculos/costos.js';
import { bs, numero } from '../utilidades/formato.js';
import { barraPasos, esc } from '../utilidades/ui.js';

// Datos iniciales: la tela calculada en el paso anterior + insumos de la prenda
function estadoInicial(prenda, trabajo) {
  const guardado = trabajo.costos;
  if (guardado && guardado.prenda === (prenda?.id ?? null)) return guardado;
  const metrosTela = trabajo.tela && prenda ? numero(trabajo.tela.comprar / 100) : '';
  return {
    prenda: prenda?.id ?? null,
    materiales: [{ nombre: 'Tela', cantidad: metrosTela, unidad: 'm', precio: '' }, ...(prenda?.insumos ?? []).map((i) => ({ ...i, precio: '' }))],
    horas: '', pagoHora: '', gastos: '', ganancia: '30', tipo: 'costo',
  };
}

export function mostrar(main, [id]) {
  const prenda = id ? buscarPrenda(id) : null;
  const trabajo = leer('trabajo', { medidas: {} });
  const e = estadoInicial(prenda, trabajo);
  const titulo = prenda ? `: ${prenda.titulo ?? prenda.nombre}` : '';

  main.innerHTML = `
    ${prenda ? barraPasos(4) : ''}
    <h1>Costo y precio${titulo}</h1>
    <p class="ayuda">Escribe los precios en bolivianos. Los totales se calculan solos.</p>
    <form class="costos" novalidate>
      <section class="cuadro">
        <h2><span class="cuadro-num">1</span> Materiales</h2>
        <div id="materiales"></div>
        <button type="button" class="btn btn-secundario btn-ancho" id="agregar">＋ Agregar material</button>
        <p class="total">Total materiales <b id="t-materiales"></b></p>
      </section>
      <section class="cuadro">
        <h2><span class="cuadro-num">2</span> Mano de obra y gastos</h2>
        <div class="fila-calculo">
          <label>Horas de trabajo<span class="campo"><input name="horas" inputmode="decimal" placeholder="ej. 3" value="${esc(e.horas)}"><span class="unidad">h</span></span></label>
          <span class="por" aria-hidden="true">×</span>
          <label>Pago por hora<span class="campo"><span class="unidad">Bs</span><input name="pagoHora" inputmode="decimal" placeholder="ej. 10" value="${esc(e.pagoHora)}"></span></label>
        </div>
        <p class="subtotal">Mano de obra <b id="t-mano"></b></p>
        <label class="bloque">Gastos del taller <small>Luz, máquina, agujas, alquiler…</small>
          <span class="campo"><span class="unidad">Bs</span><input name="gastos" inputmode="decimal" placeholder="ej. 5" value="${esc(e.gastos)}"></span>
        </label>
        <button type="button" class="enlace enlace-boton" id="sugerir-gastos">¿No sabes? Usar el 10 % de los materiales</button>
        <p class="total">Total mano de obra y gastos <b id="t-mano-gastos"></b></p>
      </section>
      <section class="cuadro">
        <h2><span class="cuadro-num">3</span> Resumen y precio</h2>
        <p class="total">Costo para producir <b id="t-costo"></b></p>
        <label class="bloque">¿Cuánto quieres ganar?
          <span class="campo campo-corto"><input name="ganancia" inputmode="decimal" value="${esc(e.ganancia)}"><span class="unidad">%</span></span>
        </label>
        <fieldset class="tipo-ganancia">
          <legend>Ese porcentaje es…</legend>
          <label><input type="radio" name="tipo" value="costo" ${e.tipo === 'costo' ? 'checked' : ''}> del <b>costo</b> (se suma al costo)</label>
          <label><input type="radio" name="tipo" value="venta" ${e.tipo === 'venta' ? 'checked' : ''}> del <b>precio de venta</b></label>
        </fieldset>
        <p class="error" id="error" role="alert"></p>
        <div class="resultado" aria-live="polite">
          <p class="resultado-etiqueta">Precio de venta sugerido</p>
          <p class="resultado-valor" id="precio"></p>
          <p id="ganas"></p>
          <p class="resultado-detalle" id="redondeo"></p>
        </div>
        <p class="nota nota-info" id="comparacion"></p>
      </section>
    </form>
    <a class="btn btn-principal btn-ancho" href="#/">✓ Terminar</a>`;

  const form = main.querySelector('form');
  const $ = (s) => main.querySelector(s);

  const pintarMateriales = () => {
    $('#materiales').innerHTML = e.materiales.map((m, i) => `
      <div class="material">
        <div class="material-cabeza">
          <input data-i="${i}" data-campo="nombre" value="${esc(m.nombre)}" aria-label="Material" placeholder="Nombre del material">
          <button type="button" class="quitar" data-quitar="${i}" aria-label="Quitar ${esc(m.nombre)}">✕</button>
        </div>
        <div class="material-cuenta">
          <span class="campo"><input data-i="${i}" data-campo="cantidad" inputmode="decimal" value="${esc(m.cantidad)}" aria-label="Cantidad de ${esc(m.nombre)}"><span class="unidad">${esc(m.unidad)}</span></span>
          <span class="por" aria-hidden="true">×</span>
          <span class="campo"><span class="unidad">Bs</span><input data-i="${i}" data-campo="precio" inputmode="decimal" value="${esc(m.precio)}" placeholder="precio" aria-label="Precio por ${esc(m.unidad)} de ${esc(m.nombre)}"></span>
          <b class="material-subtotal" id="s-${i}"></b>
        </div>
      </div>`).join('');
  };

  const actualizar = () => {
    const c = calcularCostos(e);
    const ganancia = valor(e.ganancia);
    const precio = precioVenta(c.total, ganancia, e.tipo);
    const otro = precioVenta(c.total, ganancia, e.tipo === 'costo' ? 'venta' : 'costo');

    c.subtotales.forEach((s, i) => { $(`#s-${i}`).textContent = Number.isNaN(s) ? '—' : `= ${bs(s)}`; });
    const mostrarBs = (sel, v) => { $(sel).textContent = Number.isNaN(v) ? '—' : bs(v); };
    mostrarBs('#t-materiales', c.totalMateriales);
    mostrarBs('#t-mano', c.manoDeObra);
    mostrarBs('#t-mano-gastos', c.manoYGastos);
    mostrarBs('#t-costo', c.total);

    const hayError = Number.isNaN(c.total) || Number.isNaN(precio);
    $('#error').textContent = Number.isNaN(c.total)
      ? 'Revisa los números: usa solo cifras positivas, por ejemplo 12,50.'
      : Number.isNaN(precio) ? 'La ganancia sobre el precio de venta debe ser menor a 100 %.' : '';
    $('#precio').textContent = hayError ? '—' : bs(precio);
    $('#ganas').textContent = hayError ? '' : `Ganas ${bs(precio - c.total)} por prenda`;
    $('#redondeo').textContent = hayError || c.total === 0 ? '' : `Puedes cobrar ${bs(Math.ceil(precio))} redondeando.`;
    $('#comparacion').textContent = hayError || c.total === 0 || Number.isNaN(otro) ? '' : e.tipo === 'costo'
      ? `Ojo: no es lo mismo. Si el ${numero(ganancia)} % fuera del precio de venta, cobrarías ${bs(otro)}.`
      : `Ojo: no es lo mismo. Si el ${numero(ganancia)} % se sumara al costo, cobrarías ${bs(otro)}.`;
    $('#comparacion').hidden = !$('#comparacion').textContent;

    const t = leer('trabajo', { medidas: {} });
    guardar('trabajo', { ...t, costos: e, resumen: { costo: c.total, precio } });
  };

  form.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset.campo) e.materiales[el.dataset.i][el.dataset.campo] = el.value;
    else if (el.name) e[el.name] = el.value;
    actualizar();
  });
  form.addEventListener('submit', (ev) => ev.preventDefault());
  $('#materiales').addEventListener('click', (ev) => {
    const i = ev.target.dataset.quitar;
    if (i == null) return;
    e.materiales.splice(Number(i), 1);
    pintarMateriales();
    actualizar();
  });
  $('#agregar').addEventListener('click', () => {
    e.materiales.push({ nombre: '', cantidad: '1', unidad: 'unid.', precio: '' });
    pintarMateriales();
    actualizar();
    main.querySelector(`[data-i="${e.materiales.length - 1}"][data-campo="nombre"]`).focus();
  });
  $('#sugerir-gastos').addEventListener('click', () => {
    const { totalMateriales } = calcularCostos(e);
    e.gastos = Number.isNaN(totalMateriales) ? '' : numero(Math.round(totalMateriales * 10) / 100);
    form.gastos.value = e.gastos;
    actualizar();
  });

  pintarMateriales();
  actualizar();
  return prenda ? `#/tela/${prenda.id}` : '#/';
}
