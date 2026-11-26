// Pantalla: cotizaciones "a medida" (personas guardadas) y "por tallas" (pedidos por cantidad)
import * as cotizaciones from '../datos/cotizaciones.js';
import { dibujo } from '../utilidades/iconos.js';
import * as personas from '../datos/personas.js';
import { PRENDAS, RIB_CUELLO, buscarPrenda, prendaMadre, sirvePara } from '../datos/prendas.js';
import { TABLAS, tablasPara } from '../datos/tallas.js';
import { corteDePrenda, telaDelPedido, calcularPedido, manoDeObraPedido, pendientes } from '../calculos/cotizacion.js';
import { compararConMercado } from '../datos/referencias.js';
import { ANCHOS_COMUNES } from '../calculos/tela.js';
import { valor } from '../calculos/costos.js';
import { avatar } from '../utilidades/avatares.js';
import { bs, metros, numero } from '../utilidades/formato.js';
import { esc } from '../utilidades/ui.js';

const NOMBRES_COTIZACION = { polera: 'Poleras básicas', buzo: 'Buzos deportivos', camisa: 'Camisas', pantalon: 'Pantalones' };
const tituloDe = (id) => NOMBRES_COTIZACION[id] ?? buscarPrenda(id).nombre;
const imagenDe = (prenda) => prenda.foto ?? prenda.img;

function gruposDeTallas(prenda) {
  if (!prenda.variantes) return tablasPara(prenda.id).map((tabla) => ({ id: tabla, tabla, nombre: TABLAS[tabla].nombre, prendaId: prenda.id }));
  const adultos = prenda.variantes.map((v) => ({ id: v.para, tabla: v.para, nombre: v.nombre, prendaId: v.id }));
  const menores = prenda.variantes.map((v) => ({ id: `ninos-${v.para}`, tabla: 'ninos', nombre: v.para === 'dama' ? 'Niñas' : 'Niños', prendaId: v.id }));
  return [...adultos, ...menores];
}

function sugerirInsumos(prenda, precios) {
  const materiales = (prenda.variantes ?? [prenda]).flatMap((modelo) => modelo.insumos ?? []);
  return materiales.filter((insumo, i) => materiales.findIndex((m) => m.nombre === insumo.nombre) === i).map((insumo) => {
    const hilo = insumo.nombre === 'Hilo';
    return {
      ...insumo, precio: precios[insumo.nombre] ?? '', cliente: false,
      alcance: hilo || insumo.cantidadMolde ? 'pedido' : 'prenda',
    };
  });
}
const fechaCorta = (iso) => personas.fecha(iso);
const hoyIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const sumarDias = (iso, dias) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + dias); return d.toISOString().slice(0, 10); };

export function mostrar(main, [a, b]) {
  if (a === 'nueva' && (b === 'medida' || b === 'tallas')) return nueva(main, b);
  const guardada = cotizaciones.buscar(b);
  if (a === 'ver' && guardada) return guardada.estado === 'borrador' ? nueva(main, guardada.tipo, guardada) : ver(main, guardada);
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
        <span class="persona-datos"><strong>${esc(c.cliente || c.prendaTitulo)}</strong>
          <small>${c.cliente ? `${esc(c.prendaTitulo)} · ` : ''}${c.unidades} unid. · ${fechaCorta(c.fecha)}</small></span>
        <b>${c.estado === 'borrador' ? 'Borrador · continuar' : bs(c.total)}</b>
      </a></li>`).join('')}</ul>` : '<p class="ayuda">Todavía no hay cotizaciones.</p>'}`;
  return '#/';
}

// ---------- Nueva cotización ----------
function nueva(main, tipo, borrador = null) {
  const pref = cotizaciones.preferencias();
  const personasPara = (prenda) => personas.listar().filter((p) => sirvePara(prenda, avatar(p.avatar).tipo));
  const moldePara = (prenda, persona) => prenda.variantes?.find((v) => v.para === avatar(persona.avatar).tipo) ?? prenda;
  const e = {
    tipo, prenda: null,
    cantidades: {},                     // por persona (id) o por grupo y talla
    anchoTela: pref.anchoTela, precioTela: pref.precioTela,
    telaCliente: false,
    insumos: [], horas: '', alcanceHoras: 'pedido', cobroTrabajo: 'prenda', pagoHora: pref.pagoHora, pagoPedido: '', pagoPrenda: '', porcentajeFijo: null,
    gastosPct: '0', ganancia: '0', tipoGanancia: pref.tipo,
  };
  if (borrador) Object.assign(e, JSON.parse(JSON.stringify(borrador.formulario)));
  if (e.pagoSerie && Object.values(e.cantidades).reduce((s, n) => s + Number(n || 0), 0) > 1) {
    e.pagoPrenda = e.pagoSerie;
    e.porcentajeFijo = null;
  }
  delete e.pagoSerie;
  if (e.cobroTrabajo !== 'prenda') {
    const unidadesGuardadas = Object.values(e.cantidades).reduce((s, n) => s + Number(n || 0), 0);
    const totalGuardado = e.cobroTrabajo === 'fijo' ? valor(e.pagoPedido)
      : valor(e.horas) * valor(e.pagoHora) * (e.alcanceHoras === 'pedido' ? 1 : unidadesGuardadas);
    const porUnidad = unidadesGuardadas && Number.isFinite(totalGuardado) && totalGuardado > 0 ? String(totalGuardado / unidadesGuardadas) : '';
    e.pagoPrenda ||= porUnidad;
    e.cobroTrabajo = 'prenda';
    e.porcentajeFijo = null;
  }
  if (e.prenda) {
    const original = buscarPrenda(e.prenda);
    const madre = prendaMadre(e.prenda);
    if (tipo === 'tallas' && e.tabla && Object.keys(e.cantidades).some((clave) => !clave.includes(':'))) {
      const grupo = e.tabla === 'ninos' && madre ? `ninos-${original.para}` : e.tabla;
      e.cantidades = Object.fromEntries(Object.entries(e.cantidades).map(([talla, n]) => [talla.includes(':') ? talla : `${grupo}:${talla}`, n]));
    }
    if (madre) e.prenda = madre.id;
    for (const actual of e.insumos) {
      if (e.prenda === 'polera' && actual.nombre === RIB_CUELLO.nombre) actual.materialAlternativo = 'rib';
      if (actual.nombre === 'Botones' && actual.cantidadesPorMolde) {
        delete actual.cantidadesPorMolde;
        actual.cantidadMolde = 'botones';
      }
    }
  }
  delete e.tabla;
  const cache = new Map();             // metros de tela ya calculados (una prenda y pedido completo)
  let ultimoCalculo = null;

  main.innerHTML = `
    <div class="cot-editor">
    <h1>${tipo === 'medida' ? 'Cotización a medida' : 'Cotización por tallas'}</h1>
    <p class="ayuda">Elige una prenda y completa el pedido. El precio se calcula al instante.</p>
    <div id="prenda-elegida" class="cot-seleccion" hidden></div>
    <form class="costos" novalidate>
      <section class="cuadro cot-pedido" id="elegir-modelo">
        <h2>¿Qué vas a confeccionar?</h2><p class="ayuda">Elige una tarjeta. Los materiales cambiarán según esta prenda.</p>
        <div class="elegir-prenda">${PRENDAS.map((prenda) => `
          <label class="opcion-prenda" data-modelo="${prenda.id}"><input type="radio" name="prenda" value="${prenda.id}"><span class="cot-marca" aria-hidden="true">✓</span>
            <img class="foto-prenda" src="${imagenDe(prenda)}" alt="" width="72" height="72"><span>${tituloDe(prenda.id)}</span></label>`).join('')}
        </div>
      </section>
      <section class="cuadro" id="quienes" hidden></section>
      <section class="cuadro cot-materiales" id="tela-y-costos" hidden>
        <div class="cot-cabecera">${dibujo('hilo', 'parte-icono')}<div><small>1. MATERIALES</small><h2>Tela y complementos</h2></div><b class="cot-cabecera-total" id="total-materiales-arriba">—</b></div><p class="ayuda">Calculamos la tela según las tallas. La reserva también se incluye en el costo.</p><h3>Tela principal</h3>
        <p class="ayuda">Ancho de la tela:</p>
        <div class="selector selector-ancho">${ANCHOS_COMUNES.map((a) => `<button type="button" data-ancho="${a}">${metros(a)}</button>`).join('')}</div>
        <label class="bloque">Precio por metro
          <span class="campo"><span class="unidad">Bs</span><input name="precioTela" inputmode="decimal" placeholder="ej. 35" value="${esc(e.precioTela)}"></span></label>
        <label class="bloque"><input type="checkbox" name="telaCliente" ${e.telaCliente ? 'checked' : ''}> La tela la aporta el cliente (no se cobra)</label>
        <h3 class="separado" id="titulo-materiales">Complementos de la prenda</h3>
        <p class="ayuda" id="alcance-buzo" hidden>El molde del buzo corresponde al pantalón deportivo.</p>
        <p class="ayuda">Escribe el precio de cada material que vas a usar.</p>
        <details class="cot-ayuda"><summary>¿Cómo calculo el hilo?</summary><p class="ayuda">Indica los carretes que usarás para todo el pedido, o el consumo por prenda. No hace falta comprar carretes nuevos para cada polera.</p></details>
        <div id="insumos"></div>
        <button type="button" class="btn btn-secundario btn-ancho" id="agregar-rib" hidden>Agregar rib para el cuello</button>
        <button type="button" class="btn-agregar" id="agregar-material">＋ Agregar material o servicio</button>
        <p class="resumen-materiales">Total de materiales del pedido <strong id="total-materiales-cot">—</strong></p>
      </section>
      <section class="cuadro cot-trabajo" id="trabajo-precio" hidden>
        <div class="cot-cabecera">${dibujo('cronometro', 'parte-icono')}<div><small>2. TU TRABAJO</small><h2>Confección del pedido</h2></div><b class="cot-cabecera-total" id="total-trabajo-arriba">—</b></div>
        <p class="ayuda">Escribe el monto que cobrarás por confeccionar cada prenda de este pedido. Si haces varias en serie, usa tu precio por cantidad.</p>
          <label class="bloque">Confección por cada prenda<span class="campo"><span class="unidad">Bs</span><input name="pagoPrenda" inputmode="decimal" placeholder="Ej.: 30" value="${esc(e.pagoPrenda)}"></span></label>
        <p class="cot-mano-obra" id="total-trabajo" role="status"></p>
      </section>
      <section class="cuadro cot-ganancia" id="ganancia-pedido" hidden>
        <div class="cot-cabecera">${dibujo('monedas', 'parte-icono')}<div><small>3. TU GANANCIA</small><h2>Porcentaje del pedido</h2></div></div>
        <p class="ayuda">El cobro por confección ya está incluido. Puedes subir su porcentaje si deseas cobrar más.</p>
          <label class="bloque">Porcentaje de ganancia sobre el precio de venta
            <span class="campo campo-corto"><input name="porcentajeFijo" inputmode="decimal" aria-describedby="minimo-cot"><span class="unidad">%</span></span></label>
          <div class="botones-ganancia"><button type="button" class="btn btn-secundario" data-subir-ganancia="1">＋ 1 %</button>
            <button type="button" class="btn btn-secundario" data-subir-ganancia="5">＋ 5 %</button>
            <button type="button" class="btn btn-secundario" id="ganancia-minima-cot">Volver al mínimo</button></div>
          <p class="ayuda" id="minimo-cot"></p>
          <p class="precio-final-ganancia"><span>Precio final del pedido</span><strong id="precio-final-cot">—</strong></p>
      </section>
      <section class="cuadro cot-resumen" id="resultado" hidden></section>
      <div id="acciones-cotizacion" class="cot-acciones">
        <p id="estado-cot" role="status">Elige una prenda y sus cantidades.</p>
        <p class="error" id="error-cot" role="alert"></p>
        <button type="button" class="btn btn-principal btn-ancho" id="crear" disabled>Guardar cotización</button>
        <button type="button" class="btn btn-secundario btn-ancho" id="guardar-borrador">Guardar borrador</button>
        ${borrador ? '<button type="button" class="btn btn-peligro btn-ancho" id="borrar-borrador">Eliminar borrador</button>' : ''}
      </div>
    </form>
    <div class="barra-precio" id="barra-precio-cot" hidden aria-live="polite">
      <div class="barra-precio-textos"><span>Te cuesta en materiales <b id="b-costo-cot">—</b></span><span class="flecha-precio">→</span><span>Venderías por <b class="b-precio" id="b-precio-cot">—</b></span></div>
      <div class="barra-colores" aria-hidden="true"><span class="azul" id="seg-mat-cot"></span><span class="verde" id="seg-tra-cot"></span><span class="dorado" id="seg-extra-cot"></span></div>
      <div class="leyenda" aria-hidden="true"><span class="azul">Materiales</span><span class="verde">Confección</span><span class="dorado">Aumento y redondeo</span></div>
    </div>
    </div>`;

  const $ = (s) => main.querySelector(s);
  const form = $('form');
  let resultado = null;
  let calculando = false;
  const datosCalculo = () => ({ ...e, tipo: e.tipoGanancia });
  const revisar = () => {
    const faltan = e.prenda ? pendientes(datosCalculo()) : ['Elige una prenda'];
    if (e.prenda && !resultado?.unidades) faltan.unshift('Indica las cantidades y comprueba el ancho de tela');
    if (resultado && !Number.isFinite(resultado.total)) faltan.push('Revisa los importes');
    $('#crear').disabled = calculando || faltan.length > 0;
    $('#estado-cot').textContent = calculando ? 'Calculando…' : faltan.length ? 'Pendiente: ' + faltan.join('; ') + '. Puedes guardar un borrador.' : 'Todo listo para crear la cotización.';
    return faltan;
  };
  const guardar = (esBorrador) => {
    try {
      if (!esBorrador && (calculando || revisar().length)) return;
      const r = resultado;
      const c = cotizaciones.crear({
        estado: esBorrador ? 'borrador' : 'final',
        ...(esBorrador ? { formulario: JSON.parse(JSON.stringify(e)), cliente: borrador?.cliente } : {}),
        tipo, fecha: hoyIso(), prendaId: e.prenda, prendaTitulo: e.prenda ? tituloDe(e.prenda) : 'Prenda pendiente',
        aportesCliente: [...(e.telaCliente ? ['Tela'] : []), ...e.insumos.filter((m) => m.cliente).map((m) => m.nombre.trim())],
        validez: 7,
        lineas: esBorrador ? [] : r.filas.map((f) => ({ detalle: f.detalle, cantidad: f.cantidad, precio: f.precio })),
        unidades: r?.unidades ?? Object.values(e.cantidades).reduce((s, n) => s + n, 0), total: esBorrador ? null : r.total,
        interno: esBorrador ? null : { costo: r.materiales, ganancia: r.total - r.materiales, manoDeObra: r.manoDeObra, tela: r.tela, anchoTela: e.anchoTela },
      }, borrador?.id);
      if (!esBorrador) cotizaciones.guardarPreferencias({ ...cotizaciones.preferencias(), anchoTela: e.anchoTela,
        precioTela: e.telaCliente ? '' : e.precioTela, ...(e.cobroTrabajo === 'hora' ? { pagoHora: e.pagoHora } : {}),
        gastosPct: e.gastosPct, ganancia: e.ganancia,
        tipo: e.tipoGanancia,
        insumos: { ...cotizaciones.preferencias().insumos, ...Object.fromEntries(e.insumos.filter((m) => !m.cliente).map((m) => [m.nombre.trim(), m.precio])) } });
      const destino = esBorrador ? '#/cotizaciones' : '#/cotizaciones/ver/' + c.id;
      // Al finalizar el borrador se conserva su ID y la ruta puede ser la misma.
      if (location.hash === destino) window.dispatchEvent(new Event('hashchange'));
      else location.hash = destino;
    } catch (error) { $('#error-cot').textContent = error.message; }
  };
  form.addEventListener('submit', (ev) => ev.preventDefault());
  $('#crear').addEventListener('click', () => guardar(false));
  $('#guardar-borrador').addEventListener('click', () => guardar(true));
  $('#borrar-borrador')?.addEventListener('click', () => {
    if (confirm('¿Eliminar este borrador?')) {
      if (cotizaciones.borrar(borrador.id)) location.hash = '#/cotizaciones';
      else $('#error-cot').textContent = 'No se pudo eliminar el borrador.';
    }
  });

  // ----- Paso 2: personas o tallas -----
  const pintarQuienes = () => {
    $('#quienes').hidden = false;
    const prenda = buscarPrenda(e.prenda);
    if (tipo === 'medida') {
      const todasPersonas = personasPara(prenda);
      $('#quienes').innerHTML = `
        <h2>¿Para quiénes?</h2>
        ${todasPersonas.length ? `<p class="ayuda">Marca a cada persona y cuántas prendas son para ella.</p>
          <ul class="lista-cantidades">${todasPersonas.map((p) => {
            const faltan = moldePara(prenda, p).medidas.filter((id) => p.medidas[id] == null).length;
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
      const grupos = gruposDeTallas(prenda);
      const tieneCantidades = Object.values(e.cantidades).some((n) => n > 0);
      $('#quienes').innerHTML = `
        <h2>¿Cuántas de cada talla?</h2>
        ${prenda.variantes ? '<p class="ayuda">Agrega tallas de distintos grupos en el mismo pedido.</p>' : ''}
        ${grupos.map((grupo, i) => {
          const tabla = TABLAS[grupo.tabla];
          const abierto = tabla.tallas.some((talla) => e.cantidades[`${grupo.id}:${talla}`] > 0) || (!tieneCantidades && i === 0);
          return `<details class="cot-grupo" ${abierto ? 'open' : ''}>
            <summary>${grupo.nombre}<span data-total-grupo="${grupo.id}"></span></summary>
            <ul class="lista-cantidades">${tabla.tallas.map((talla) => {
              const clave = `${grupo.id}:${talla}`;
              return `<li><span class="talla" aria-label="Talla ${talla}">${talla}</span>
                ${contador(clave)}<button type="button" class="btn-docena" data-docena="${clave}">+12</button></li>`;
            }).join('')}</ul>
          </details>`;
        }).join('')}
        <p class="ayuda">Medidas de cada talla: tabla aproximada del taller (provisional).</p>`;
    }
  };
  const contador = (clave) => `
    <span class="contador-cant">
      <button type="button" data-menos="${clave}" aria-label="Uno menos">−</button>
      <output id="c-${clave}">${e.cantidades[clave] ?? 0}</output>
      <button type="button" data-mas="${clave}" aria-label="Uno más">＋</button>
    </span>`;

  const pintarDatosInsumo = (fila, material) => {
    const nombre = material.nombre.trim() || 'Nuevo material';
    fila.querySelector('.material-cot-nombre').textContent = nombre;
    const alcance = material.alcance === 'pedido' ? 'para todo el pedido' : 'por prenda';
    const cantidad = material.cantidadMolde && !material.cantidad
      ? 'Cantidad según el molde'
      : `${material.cantidad} ${material.unidad} ${alcance}${material.cantidadMolde ? ' (calculado)' : ''}`;
    fila.querySelector('.material-cot-cantidad').textContent = cantidad;
    const editar = fila.querySelector('[data-editar-insumo]');
    editar.setAttribute('aria-label', editar.getAttribute('aria-expanded') === 'true' ? `Listo con ${nombre}` : `Editar ${nombre}`);
    const precio = fila.querySelector('[data-campo="precio"]');
    precio.setAttribute('aria-label', `Precio por unidad de ${nombre} en bolivianos`);
    precio.disabled = material.cliente;
    fila.querySelector('.material-cot-precio').hidden = material.cliente;
    fila.querySelector('.material-cot-aporte').hidden = !material.cliente;
  };

  const pintarInsumos = (editar = -1) => {
    $('#insumos').innerHTML = e.insumos.map((m, i) => {
      const campo = (nombre) => `data-insumo="${i}" data-campo="${nombre}"`;
      const abierto = i === editar;
      return `<div class="material-cot">
        <div class="material-cot-cabecera">
          <div><strong class="material-cot-nombre"></strong><small class="material-cot-cantidad"></small></div>
          <button type="button" class="material-cot-editar" data-editar-insumo="${i}" aria-expanded="${abierto}" aria-controls="ajustes-insumo-${i}">${abierto ? 'Listo' : 'Editar'}</button>
        </div>
        <label class="campo material-cot-precio"><span class="unidad" aria-hidden="true">Bs</span><input ${campo('precio')} inputmode="decimal" placeholder="Precio por unidad" value="${esc(m.precio)}"></label>
        <small class="material-cot-aporte" hidden>Lo aporta el cliente</small>
        <div class="material-cot-ajustes" id="ajustes-insumo-${i}" ${abierto ? '' : 'hidden'}>
          <label>Nombre<input ${campo('nombre')} maxlength="60" value="${esc(m.nombre)}" placeholder="Ej.: Estampado"></label>
          <div class="material-cot-grid">
            <label>Cantidad<input ${campo('cantidad')} inputmode="decimal" value="${esc(m.cantidad)}"></label>
            <label>Unidad<input ${campo('unidad')} maxlength="20" value="${esc(m.unidad)}"></label>
          </div>
          <label>¿Para cuántas prendas?<select ${campo('alcance')}><option value="prenda" ${m.alcance !== 'pedido' ? 'selected' : ''}>Para cada prenda</option><option value="pedido" ${m.alcance === 'pedido' ? 'selected' : ''}>Para todo el pedido</option></select></label>
          <label class="material-cot-checkbox"><input type="checkbox" ${campo('cliente')} ${m.cliente ? 'checked' : ''}> Lo aporta el cliente</label>
          <button type="button" class="btn btn-secundario" data-quitar="${i}">Quitar material</button>
        </div>
      </div>`;
    }).join('') || '<p class="ayuda">Sin materiales adicionales. Puedes agregarlos abajo.</p>';
    $('#insumos').querySelectorAll('.material-cot').forEach((fila, i) => pintarDatosInsumo(fila, e.insumos[i]));
  };

  // ----- Líneas de la cotización (cada persona o talla con cantidad) -----
  const lineas = () => {
    if (!e.prenda) return [];
    const prenda = buscarPrenda(e.prenda);
    if (tipo === 'medida') {
      return personasPara(prenda).flatMap((persona) => {
        const molde = moldePara(prenda, persona);
        const cantidad = e.cantidades[persona.id] ?? 0;
        if (!cantidad || molde.medidas.some((id) => persona.medidas[id] == null)) return [];
        return [{ prendaId: molde.id, detalle: `${molde.titulo ?? molde.nombre} – ${persona.nombre}`, cantidad, medidas: persona.medidas }];
      });
    }
    return gruposDeTallas(prenda).flatMap((grupo) => TABLAS[grupo.tabla].tallas.flatMap((talla) => {
      const cantidad = e.cantidades[`${grupo.id}:${talla}`] ?? 0;
      if (!cantidad) return [];
      const etiqueta = `Talla ${talla}${prenda.variantes ? ` · ${grupo.nombre}` : ''}`;
      return [{ grupoId: grupo.id, prendaId: grupo.prendaId, etiqueta, detalle: `${tituloDe(e.prenda)} – ${etiqueta}`, cantidad, medidas: TABLAS[grupo.tabla].medidas[talla] }];
    }));
  };

  const pintarTrabajo = (unidades) => {
    const importe = manoDeObraPedido(datosCalculo(), unidades);
    $('#total-trabajo-arriba').textContent = importe > 0 && Number.isFinite(importe) ? bs(importe) : '—';
    $('#total-trabajo').textContent = importe > 0 && Number.isFinite(importe)
      ? `Mano de obra para ${unidades} ${unidades === 1 ? 'prenda' : 'prendas'}: ${bs(importe)}`
      : 'El total de mano de obra aparecerá al completar el pago.';
  };

  const actualizar = async () => {
    const turno = Symbol();
    ultimoCalculo = turno;
    resultado = null;
    calculando = true;
    revisar();
    const lista = lineas();
    const unidadesPedido = lista.reduce((s, l) => s + l.cantidad, 0);
    const ribAparte = e.insumos.some((material) => material.materialAlternativo === 'rib');
    $('#agregar-rib').hidden = e.prenda !== 'polera' || ribAparte;
    $('#alcance-buzo').hidden = e.prenda !== 'buzo';
    pintarTrabajo(unidadesPedido);
    main.querySelectorAll('[data-total-grupo]').forEach((elemento) => {
      const cantidad = lista.filter((l) => l.grupoId === elemento.dataset.totalGrupo).reduce((s, l) => s + l.cantidad, 0);
      elemento.textContent = cantidad ? ` (${cantidad})` : '';
    });
    $('#prenda-elegida').hidden = !e.prenda;
    $('#prenda-elegida').innerHTML = e.prenda ? `<img class="foto-prenda" src="${imagenDe(buscarPrenda(e.prenda))}" alt="" width="44" height="44"><div><small>ESTÁS COTIZANDO</small><strong>${tituloDe(e.prenda)}</strong></div><b>${unidadesPedido} ${unidadesPedido === 1 ? 'prenda' : 'prendas'}</b>` : '';
    $('#titulo-materiales').textContent = e.prenda ? 'Complementos · ' + tituloDe(e.prenda) : 'Complementos';
    main.querySelectorAll('[data-modelo]').forEach((x) => x.classList.toggle('seleccionada', x.dataset.modelo === e.prenda));
    form.elements.precioTela.disabled = e.telaCliente;
    $('#tela-y-costos').hidden = !e.prenda;
    $('#trabajo-precio').hidden = !e.prenda;
    $('#ganancia-pedido').hidden = !e.prenda;
    $('#barra-precio-cot').hidden = true;
    const zona = $('#resultado');
    zona.hidden = !lista.length;
    if (!lista.length) { $('#total-materiales-cot').textContent = '—'; $('#total-materiales-arriba').textContent = '—'; $('#precio-final-cot').textContent = '—'; calculando = false; revisar(); return; }
    zona.innerHTML = '<p role="status">Calculando el pedido…</p>';
    let conMetros;
    try {
      conMetros = await Promise.all(lista.map(async (l) => {
        const clave = `${l.prendaId}|${e.anchoTela}|${ribAparte}|${JSON.stringify(l.medidas)}`;
        if (!cache.has(clave)) cache.set(clave, corteDePrenda(l.prendaId, l.medidas, e.anchoTela, ribAparte));
        return { ...l, ...await cache.get(clave) };
      }));
    } catch (error) {
      if (ultimoCalculo === turno && zona.isConnected) { zona.innerHTML = `<p class="nota">⚠️ ${esc(error.message)} Elige una tela más ancha.</p>`; calculando = false; revisar(); }
      return;
    }
    if (ultimoCalculo !== turno || !zona.isConnected) return;
    e.insumos.forEach((material, i) => {
      if (!material.cantidadMolde) return;
      const cantidad = conMetros.reduce((s, l) => s + l.cantidad * (l.cantidades[material.cantidadMolde] ?? 0), 0);
      material.cantidad = String(Number(cantidad.toFixed(4)));
      const campo = $(`[data-insumo="${i}"][data-campo="cantidad"]`);
      campo.value = material.cantidad;
      pintarDatosInsumo(campo.closest('.material-cot'), material);
    });
    let pedido;
    try {
      const clave = `pedido|${e.anchoTela}|${ribAparte}|${JSON.stringify(conMetros.map((l) => [l.prendaId, l.medidas, l.cantidad]))}`;
      if (!cache.has(clave)) cache.set(clave, telaDelPedido(e.prenda, conMetros, e.anchoTela));
      pedido = await cache.get(clave);
    } catch {
      pedido = { lineas: conMetros, doblez: 'uno', ahorro: 0 };
    }
    if (ultimoCalculo !== turno || !zona.isConnected) return;
    conMetros = conMetros.map((linea, i) => ({ ...linea, metros: pedido.lineas[i].metros }));
    const datos = datosCalculo();
    resultado = calcularPedido(conMetros, datos);
    calculando = false;
    const { filas, unidades, total, tela, materiales, manoDeObra } = resultado;
    const minimo = resultado.porcentajeMinimo;
    const etiquetaExtra = resultado.porcentajeGanancia > minimo ? 'Aumento y redondeo' : 'Redondeo';
    if (document.activeElement !== form.elements.porcentajeFijo)
      form.elements.porcentajeFijo.value = numero(Math.round(resultado.porcentajeGanancia * 100) / 100);
    $('#minimo-cot').textContent = `Mínimo: ${numero(Math.round(minimo * 100) / 100)} %. Sale del cobro de confección dividido entre materiales + confección. No puedes bajarlo.`;
    $('#total-materiales-cot').textContent = bs(materiales);
    $('#total-materiales-arriba').textContent = bs(materiales);
    $('#precio-final-cot').textContent = Number.isFinite(total) ? bs(total) : '—';
    $('#barra-precio-cot').hidden = !Number.isFinite(total);
    $('#b-costo-cot').textContent = bs(materiales);
    $('#b-precio-cot').textContent = Number.isFinite(total) ? bs(total) : '—';
    $('#seg-mat-cot').style.width = total > 0 ? `${materiales / total * 100}%` : '0%';
    $('#seg-tra-cot').style.width = total > 0 ? `${manoDeObra / total * 100}%` : '0%';
    $('#seg-extra-cot').style.width = total > 0 ? `${Math.max(0, total - materiales - manoDeObra) / total * 100}%` : '0%';
    const valido = Number.isFinite(total);
    const faltantes = pendientes(datos);
    const falta = faltantes.length > 0;
    revisar();
    const mercado = falta || !unidades ? null : compararConMercado(filas[0].prendaId, total / unidades);
    const MERCADO_TEXTO = {
      parecido: '✅ Tu precio está cerca del mercado.',
      caro: '⬆️ Tu precio está bastante más alto. Revisa el cobro de confección en serie y el porcentaje de ganancia.',
      barato: '⬇️ Tu precio está bastante más bajo. Revisa que estés cobrando tu trabajo y todos los materiales.',
    };
    zona.innerHTML = `
      <div class="cot-cabecera">${dibujo('costos', 'parte-icono')}<div><small>RESUMEN DEL PEDIDO</small><h2>${tituloDe(e.prenda)}</h2></div></div>
      ${!valido ? '<p class="error">Revisa los números: usa solo cifras positivas, y una ganancia sobre la venta menor a 100 %.</p>' : `
      ${falta ? `<p class="nota">⚠️ Estimación incompleta. Falta: ${faltantes.map(esc).join('; ')}.</p>` : ''}
      <div class="cot-totales"><div><small>Te cuesta en materiales</small><strong>${bs(materiales)}</strong></div><div><small>Confección y ganancia</small><strong>${bs(total - materiales)}</strong></div><div class="cot-total-venta"><small>${falta ? 'Precio provisional' : 'Venderías el pedido por'}</small><strong>${bs(total)}</strong><span>${unidades} prendas · reserva incluida</span></div></div>
      <div class="barra-desglose-cot" aria-label="Composición del precio"><div class="segmentos-cot"><span class="azul" style="width:${total > 0 ? materiales / total * 100 : 0}%"></span><span class="verde" style="width:${total > 0 ? manoDeObra / total * 100 : 0}%"></span><span class="dorado" style="width:${total > 0 ? Math.max(0, (total - materiales - manoDeObra) / total * 100) : 0}%"></span></div><small>🧵 Materiales ${bs(materiales)} · ✂️ Confección ${bs(manoDeObra)} · 💰 ${etiquetaExtra} ${bs(total - materiales - manoDeObra)}</small></div>
      <dl class="cot-desglose" aria-label="Desglose del costo de producción">
        <div><dt>Materiales</dt><dd>${bs(materiales)}</dd></div>
        <div><dt>Mano de obra del pedido</dt><dd>${bs(manoDeObra)}</dd></div>
        <div><dt>${etiquetaExtra}</dt><dd>${bs(total - materiales - manoDeObra)}</dd></div>
      </dl>
      <table class="tabla-cot">
        <thead><tr><th>Prenda</th><th>Cant.</th><th>Precio c/u</th><th>Subtotal</th></tr></thead>
        <tbody>${filas.map((f) => `<tr><td>${esc(f.etiqueta ?? f.detalle)}<small>${numero(Math.round(f.metros * 100) / 100)} m de corte c/u</small></td>
          <td>${f.cantidad}</td><td>${bs(f.precio)}</td><td>${bs(f.precio * f.cantidad)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="3">Total (${unidades} prendas)</td><td>${bs(total)}</td></tr></tfoot>
      </table>
      <details class="cot-ayuda"><summary>Ver tela y detalles del cálculo</summary>
      ${mercado ? `<p class="nota ${mercado.estado === 'parecido' ? 'nota-info' : ''}">📊 En La Paz (2026) ${mercado.que} se vende ${mercado.desde ? 'desde' : 'a unos'} <b>Bs ${mercado.precio}</b>. Tu precio por prenda: <b>${bs(total / unidades)}</b>.<br>${MERCADO_TEXTO[mercado.estado]}</p>` : ''}
      <p class="nota nota-info">🧵 Tela a comprar para todo el pedido: <b>${numero(tela)} m</b> (ancho ${metros(e.anchoTela)}). Reserva incluida en el cálculo${e.telaCliente ? "; la tela la aporta el cliente" : " y en el costo"}.
        ${pedido.doblez === 'dos' ? '<br>✂️ Dobla la tela con <b>los dos orillos al centro</b>: así los delanteros y espaldas van lado a lado, cada uno en su doblez. Las piezas anchas (como las mangas) se cortan después con la tela doblada como siempre.' : ''}<br>
        El costo y la ganancia son solo para ti; no aparecen en el documento del cliente.</p></details>
      `}`;
  };

  // ----- Eventos -----
  form.addEventListener('change', (ev) => {
    if (ev.target.name !== 'prenda') return;
    e.prenda = ev.target.value;
    e.cantidades = {};
    e.porcentajeFijo = null;
    e.insumos = sugerirInsumos(buscarPrenda(e.prenda), pref.insumos);
    pintarQuienes();
    pintarInsumos();
    marcarAncho();
    actualizar();
  });
  form.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset.insumo != null) {
      const material = e.insumos[el.dataset.insumo];
      if (el.dataset.campo === 'cantidad' || el.dataset.campo === 'alcance') delete material.cantidadMolde;
      material[el.dataset.campo] = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.campo !== 'precio') pintarDatosInsumo(el.closest('.material-cot'), material);
    }
    else if (el.name === 'telaCliente') e.telaCliente = el.checked;
    else if (['precioTela', 'pagoPrenda', 'porcentajeFijo'].includes(el.name)) e[el.name] = el.value;
    else return;
    if (el.name !== 'porcentajeFijo') e.porcentajeFijo = null;
    actualizar();
  });
  form.addEventListener('focusout', (ev) => {
    if (ev.target.name !== 'porcentajeFijo' || !resultado) return;
    if (valor(e.porcentajeFijo) < resultado.porcentajeMinimo) {
      e.porcentajeFijo = null;
      actualizar();
    }
  });
  form.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.subirGanancia && resultado) {
      const actual = Math.max(resultado.porcentajeMinimo, resultado.porcentajeGanancia);
      e.porcentajeFijo = String(Math.min(99.99, Math.round((actual + Number(d.subirGanancia)) * 100) / 100));
      actualizar();
      return;
    }
    if (b.id === 'ganancia-minima-cot') { e.porcentajeFijo = null; actualizar(); return; }
    if (b.id === 'agregar-material' || b.id === 'agregar-rib') {
      e.porcentajeFijo = null;
      const esRib = b.id === 'agregar-rib';
      e.insumos.push(esRib ? { ...RIB_CUELLO, precio: '' } : { nombre: '', cantidad: '1', unidad: 'unid.', alcance: 'prenda', precio: '', cliente: false });
      pintarInsumos(esRib ? -1 : e.insumos.length - 1); actualizar();
      $('#insumos').lastElementChild.querySelector(`[data-campo="${esRib ? 'precio' : 'nombre'}"]`).focus();
    } else if (b.hasAttribute('data-editar-insumo')) {
      const fila = b.closest('.material-cot');
      const ajustes = fila.querySelector('.material-cot-ajustes');
      ajustes.hidden = !ajustes.hidden;
      b.setAttribute('aria-expanded', String(!ajustes.hidden));
      b.textContent = ajustes.hidden ? 'Editar' : 'Listo';
      pintarDatosInsumo(fila, e.insumos[d.editarInsumo]);
    } else if (d.quitar != null) {
      e.porcentajeFijo = null;
      e.insumos.splice(Number(d.quitar), 1); pintarInsumos(); actualizar();
      $('#agregar-material').focus();
    } else if (d.mas || d.menos || d.docena) {
      e.porcentajeFijo = null;
      const clave = d.mas ?? d.menos ?? d.docena;
      e.cantidades[clave] = Math.max(0, (e.cantidades[clave] ?? 0) + (d.mas ? 1 : d.menos ? -1 : 12));
      $(`#c-${CSS.escape(clave)}`).textContent = e.cantidades[clave];
      actualizar();
    } else if (d.ancho) {
      e.porcentajeFijo = null;
      e.anchoTela = Number(d.ancho);
      marcarAncho(); actualizar();
    }
  });
  const marcarAncho = () => main.querySelectorAll('[data-ancho]').forEach((x) => x.setAttribute('aria-pressed', Number(x.dataset.ancho) === e.anchoTela));
  if (e.prenda) {
    const opcion = form.querySelector(`[name="prenda"][value="${CSS.escape(e.prenda)}"]`);
    if (opcion) opcion.checked = true;
    pintarQuienes(); pintarInsumos(); marcarAncho();
  }
  actualizar();
  return '#/cotizaciones';
}

// ---------- Ver una cotización (lo que se envía al cliente) ----------
function documento(c) {
  const adelanto = Math.round(c.total * (c.adelantoPct ?? 0)) / 100;
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
        ${(c.aportesCliente ?? []).map((nombre) => `<li>Aporta el cliente: ${esc(nombre)}</li>`).join('')}
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
  const adelanto = Math.round(c.total * (c.adelantoPct ?? 0)) / 100;
  // Medir el alto que hace falta
  const alto = (c.aportesCliente?.length ?? 0) * 52 + 330 + c.lineas.length * 70 + 120 + 5 * 52 + (c.cliente ? 50 : 0) + (c.taller ? 50 : 0) + 80;
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
  for (const nombre of c.aportesCliente ?? []) lineasTexto.push(corto('Aporta el cliente: ' + nombre, ancho - 2 * m));
  if (c.notas) lineasTexto.push(corto(`Nota: ${c.notas}`, ancho - 2 * m));
  for (const t of lineasTexto) { texto(t, m, 30); y += 52; }
  const final = Object.assign(document.createElement('canvas'), { width: ancho, height: Math.min(alto, y + 10) });
  final.getContext('2d').drawImage(lienzo, 0, 0);
  return new Promise((ok) => final.toBlob(ok, 'image/png'));
}
