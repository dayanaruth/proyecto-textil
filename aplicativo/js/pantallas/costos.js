// Pantalla: costo y precio, pensada para quien casi no usa aplicaciones.
// Colores por parte (materiales, trabajo, ganancia), preguntas sencillas en cada campo, botones rápidos
// de ganancia, ejemplo, voz, marcas de "listo", avisos de lo que falta y el precio siempre a la vista.
import { buscarPrenda } from '../datos/prendas.js';
import { leer, guardar } from '../datos/almacenamiento.js';
import { calcularCostos, errorDatoMaterial, precioVenta, valor } from '../calculos/costos.js';
import { bs, numero } from '../utilidades/formato.js';
import { barraPasos, esc } from '../utilidades/ui.js';
import { hayVoz, hablar } from '../utilidades/voz.js';
import { preferencias } from '../datos/cotizaciones.js';
import { ayudaHorasYPago, conectarAyuda } from '../utilidades/ayuda-precio.js';
import { dibujo, iconoMaterial } from '../utilidades/iconos.js';
import { terminarPrenda } from '../utilidades/opinion.js';

const normal = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PALABRA = { m: 'metro', 'unid.': 'unidad', carrete: 'carrete' };
const lleno = (v) => valor(v) > 0;

// Ejemplo: la falda del afiche del taller
const EJEMPLO_PRECIOS = [['entretela', '8'], ['tela', '35'], ['cierre', '5'], ['hilo', '2,5'], ['boton', '0,5'], ['gancho', '1']];
const precioEjemplo = (nombre) => EJEMPLO_PRECIOS.find(([p]) => normal(nombre).includes(p))?.[1] ?? '3';

const VOZ = {
  mat: 'Materiales. Escribe cuánto usas de cada material y cuánto cuesta uno. Por ejemplo: usas cero coma nueve metros de tela, y un metro cuesta treinta y cinco bolivianos.',
  tra: 'Tu trabajo. Escribe cuántas horas tardas en coser la prenda y cuánto vale una hora de tu trabajo. Después, cuánto gastas en el taller: luz, máquina, agujas.',
  gan: 'Tu ganancia. Elige cuánto quieres ganar. Te mostramos el precio de venta con cada opción.',
};

// Datos iniciales: la tela calculada en el paso anterior + insumos de la prenda
function estadoInicial(prenda, trabajo) {
  const guardado = trabajo.costos;
  if (guardado && guardado.prenda === (prenda?.id ?? null)) return guardado;
  const metrosTela = trabajo.tela && prenda ? numero(trabajo.tela.comprar / 100) : '';
  const cantidades = trabajo.tela?.prendaId === prenda?.id ? trabajo.tela?.cantidades : null;
  const insumos = (prenda?.insumos ?? []).map((i) => ({ ...i, cantidad: cantidades?.[i.cantidadMolde] ?? i.cantidad, precio: '' }));
  return {
    prenda: prenda?.id ?? null,
    materiales: [{ nombre: 'Tela', cantidad: metrosTela, unidad: 'm', precio: '' }, ...insumos],
    horas: preferencias().horas[prenda?.id] ?? '', pagoHora: preferencias().pagoHora, gastos: '', ganancia: '30', tipo: 'costo',
  };
}


export function mostrar(main, [id]) {
  const prenda = id ? buscarPrenda(id) : null;
  let e = estadoInicial(prenda, leer('trabajo', { medidas: {} }));
  let esEjemplo = false;
  const titulo = prenda ? `: ${prenda.titulo ?? prenda.nombre}` : '';
  const voz = (k) => (hayVoz ? `<button type="button" class="voz-c" data-voz="${k}" aria-label="Escuchar qué hacer">🔊</button>` : '');

  const dibujar = () => {
    main.innerHTML = `
      ${prenda ? barraPasos(4, prenda.id) : ''}
      <h1>Costo y precio${titulo}</h1>
      <p class="ayuda">Responde las preguntas. El precio se calcula solo.</p>
      <div class="acciones-c">
        <button type="button" class="btn-c" id="ejemplo">👀 Ver un ejemplo</button>
        <button type="button" class="btn-c" id="borrar">🧹 Borrar y empezar</button>
      </div>
      ${esEjemplo ? '<p class="nota nota-info">👀 Este es un ejemplo con la falda del afiche del taller. Cambia los números por los tuyos, o toca «Borrar y empezar».</p>' : ''}
      <form class="form-precio" novalidate>

        <section class="parte azul">
          <header>${dibujo('hilo', 'parte-icono')}
            <div><h2>1. Materiales <span class="listo" id="ok-mat" hidden>✅</span></h2><small>Lo que compras para hacer la prenda</small></div>
            ${voz('mat')}<b class="parte-total" id="t-materiales"></b></header>
          <div id="materiales">${e.materiales.map((m, i) => `
            <div class="mat" role="group" aria-labelledby="material-${i}">
              <div class="mat-cabeza">
                ${dibujo(iconoMaterial(m.nombre), 'mat-icono')}
                <h3 class="mat-nombre" id="material-${i}">${esc(m.nombre.trim() || 'Material adicional')}</h3>
                <button type="button" class="quitar-c" data-quitar="${i}" aria-label="Quitar ${esc(m.nombre.trim() || 'material adicional')}">✕</button>
              </div>
              <div class="cuenta">
                <label class="pregunta-c">¿Cuánto usas?
                  <span class="campo"><input data-i="${i}" data-campo="cantidad" inputmode="decimal" enterkeyhint="next" required aria-describedby="error-cantidad-${i}" placeholder="0" value="${esc(m.cantidad)}"><span class="unidad">${esc(m.unidad)}</span></span></label>
                <span class="por" aria-hidden="true">×</span>
                <label class="pregunta-c">¿Cuánto cuesta 1 ${PALABRA[m.unidad] ?? esc(m.unidad)}?
                  <span class="campo"><span class="unidad">Bs</span><input data-i="${i}" data-campo="precio" inputmode="decimal" enterkeyhint="next" required aria-describedby="error-precio-${i}" placeholder="0" value="${esc(m.precio)}"></span></label>
                <b class="cuenta-res" id="s-${i}"></b>
              </div>
              <small class="error-material" id="error-cantidad-${i}"></small>
              <small class="error-material" id="error-precio-${i}"></small>
            </div>`).join('')}
          </div>
          <details class="nuevo-material">
            <summary class="btn-agregar">＋ Agregar otro material</summary>
            <label class="pregunta-c" for="nombre-nuevo">Nombre del nuevo material</label>
            <div class="campo"><input id="nombre-nuevo" enterkeyhint="done" placeholder="Ej. Etiqueta">
              <button type="button" class="btn-c" id="agregar">Agregar</button></div>
          </details>
          <p class="falta" id="falta-mat" role="status"></p>
        </section>

        <section class="parte verde">
          <header>${dibujo('cronometro', 'parte-icono')}
            <div><h2>2. Tu trabajo y el taller <span class="listo" id="ok-tra" hidden>✅</span></h2><small>Las horas que coses y los gastos del taller</small></div>
            ${voz('tra')}<b class="parte-total" id="t-trabajo"></b></header>
          <div class="cuenta">
            <label class="pregunta-c">¿Cuántas horas tardas?
              <span class="campo"><input name="horas" inputmode="decimal" placeholder="0" value="${esc(e.horas)}"><span class="unidad">horas</span></span></label>
            <span class="por" aria-hidden="true">×</span>
            <label class="pregunta-c">¿Cuánto vale tu hora?
              <span class="campo"><span class="unidad">Bs</span><input name="pagoHora" inputmode="decimal" placeholder="0" value="${esc(e.pagoHora)}"></span></label>
            <b class="cuenta-res" id="t-mano"></b>
          </div>
          ${ayudaHorasYPago(e.prenda)}
          <p class="cuenta-pie">⏱️ Lo mejor es medir tu tiempo con el <a href="#/herramientas/cronometro">cronómetro de costura</a>.</p>
          <label class="pregunta-c pregunta-sola">🏠 ¿Cuánto gastas en el taller por esta prenda? <small>Luz, máquina, agujas…</small>
            <span class="campo"><span class="unidad">Bs</span><input name="gastos" inputmode="decimal" placeholder="0" value="${esc(e.gastos)}"></span></label>
          <button type="button" class="enlace-chico" id="sugerir-gastos">¿No sabes? Usar el 10 % de los materiales</button>
          <p class="falta" id="falta-tra" role="status"></p>
        </section>

        <section class="parte dorado">
          <header>${dibujo('monedas', 'parte-icono')}
            <div><h2>3. Tu ganancia <span class="listo" id="ok-gan" hidden>✅</span></h2><small>¿Cuánto quieres ganar?</small></div>
            ${voz('gan')}</header>
          <div class="chips" role="group" aria-label="Ganancia">
            ${['20', '30', '50'].map((p) => `<button type="button" class="chip" data-pct="${p}">${p} %</button>`).join('')}
            <label class="chip-otro">Otro <span class="campo"><input name="ganancia" inputmode="decimal" placeholder="0" value="${esc(e.ganancia)}" aria-label="Otro porcentaje de ganancia"><span class="unidad">%</span></span></label>
          </div>
          <p class="pregunta-c">¿Ese porcentaje es del costo o del precio de venta?</p>
          <div class="opciones-ganancia" role="radiogroup" aria-label="Ese porcentaje es">
            <button type="button" role="radio" data-tipo="costo"><span class="op-titulo">del costo</span><span class="op-precio" id="op-costo"></span><span class="op-gana" id="gana-costo"></span></button>
            <button type="button" role="radio" data-tipo="venta"><span class="op-titulo">del precio de venta</span><span class="op-precio" id="op-venta"></span><span class="op-gana" id="gana-venta"></span></button>
          </div>
          <p class="ganarias" id="ganarias"></p>
          <p class="error" id="error" role="alert"></p>
        </section>

        <section class="parte formula">
          <h2>Así se forma tu precio</h2>
          <div class="suma">
            <span class="bloque-c azul"><small>🧵 Materiales</small><b id="f-mat"></b></span><span class="signo">+</span>
            <span class="bloque-c verde"><small>✋ Trabajo</small><b id="f-tra"></b></span><span class="signo">=</span>
            <span class="bloque-c gris"><small>Costo</small><b id="f-cos"></b></span>
          </div>
          <div class="suma">
            <span class="bloque-c gris"><small>Costo</small><b id="f-cos2"></b></span><span class="signo">+</span>
            <span class="bloque-c dorado"><small>💰 Ganancia</small><b id="f-gan"></b></span><span class="signo">=</span>
            <span class="bloque-c precio"><small>Precio</small><b id="f-pre"></b></span>
          </div>
          <p class="redondeo" id="redondeo"></p>
        </section>
      </form>

      <div class="barra-precio" aria-live="polite">
        <div class="barra-precio-textos"><span>Costo <b id="b-costo"></b></span><span class="flecha-precio">→</span><span>Precio <b class="b-precio" id="b-precio"></b></span></div>
        <div class="barra-colores" aria-hidden="true"><span class="azul" id="seg-mat"></span><span class="verde" id="seg-tra"></span><span class="dorado" id="seg-gan"></span></div>
        <div class="leyenda" aria-hidden="true"><span class="azul">Materiales</span><span class="verde">Trabajo</span><span class="dorado">Ganancia</span></div>
      </div>
      <a class="btn btn-principal btn-ancho" id="terminar" href="#/">✓ Terminar</a>`;
    conectar();
    actualizar();
  };

  const $ = (s) => main.querySelector(s);
  const poner = (sel, v) => { $(sel).textContent = Number.isFinite(v) ? bs(v) : '—'; };

  function validarCampo(input, mostrar) {
    const mensaje = errorDatoMaterial(input.value, input.dataset.campo);
    input.setCustomValidity(mensaje);
    const visible = mostrar && Boolean(mensaje);
    input.setAttribute('aria-invalid', String(visible));
    $('#' + input.getAttribute('aria-describedby')).textContent = visible ? mensaje : '';
    return !mensaje;
  }

  const actualizar = () => {
    const c = calcularCostos(e);
    const g = valor(e.ganancia);
    const precio = precioVenta(c.total, g, e.tipo);
    const pCosto = precioVenta(c.total, g, 'costo');
    const pVenta = precioVenta(c.total, g, 'venta');
    const malo = !Number.isFinite(c.total) || !Number.isFinite(precio);

    c.subtotales.forEach((s, i) => { $(`#s-${i}`).textContent = Number.isFinite(s) ? `= ${bs(s)}` : '—'; });
    poner('#t-materiales', c.totalMateriales);
    poner('#t-trabajo', c.manoYGastos);
    $('#t-mano').textContent = Number.isFinite(c.manoDeObra) ? `= ${bs(c.manoDeObra)}` : '—';

    // ✅ y avisos de lo que falta (en palabras sencillas)
    const sinPrecio = e.materiales.filter((m, i) => !Number.isFinite(c.subtotales[i])).map((m) => m.nombre || 'material adicional');
    const faltaTra = [!lleno(e.horas) && 'las horas que tardas', !lleno(e.pagoHora) && 'cuánto vale tu hora'].filter(Boolean);
    $('#ok-mat').hidden = sinPrecio.length > 0 || !e.materiales.length;
    $('#ok-tra').hidden = faltaTra.length > 0;
    $('#ok-gan').hidden = !(g > 0) || malo;
    $('#falta-mat').textContent = sinPrecio.length ? `✍️ Falta completar: ${sinPrecio.join(', ')}.` : '';
    $('#falta-tra').textContent = faltaTra.length ? `✍️ Falta: ${faltaTra.join(' y ')}.` : '';

    main.querySelectorAll('[data-pct]').forEach((b) => b.setAttribute('aria-pressed', valor(b.dataset.pct) === g));
    poner('#op-costo', pCosto); poner('#op-venta', pVenta);
    $('#gana-costo').textContent = Number.isFinite(pCosto) ? `ganas ${bs(pCosto - c.total)}` : '';
    $('#gana-venta').textContent = Number.isFinite(pVenta) ? `ganas ${bs(pVenta - c.total)}` : g >= 100 ? 'menos de 100 %' : '';
    main.querySelectorAll('[data-tipo]').forEach((b) => b.setAttribute('aria-checked', b.dataset.tipo === e.tipo));
    $('#ganarias').innerHTML = malo || !c.total ? '' : `Ganarías <b>${bs(precio - c.total)}</b> por prenda`;
    $('#error').textContent = sinPrecio.length ? '' : !Number.isFinite(c.total) || !Number.isFinite(g)
      ? 'Revisa los números: usa solo cifras, por ejemplo 12,50.'
      : !Number.isFinite(precio) ? 'La ganancia sobre el precio de venta debe ser menor a 100 %.' : '';

    poner('#f-mat', c.totalMateriales); poner('#f-tra', c.manoYGastos);
    poner('#f-cos', c.total); poner('#f-cos2', c.total);
    poner('#f-gan', malo ? NaN : precio - c.total); poner('#f-pre', malo ? NaN : precio);
    $('#redondeo').textContent = malo || !c.total ? '' : `💡 Puedes cobrar ${bs(Math.ceil(precio))} redondeando.`;

    poner('#b-costo', c.total); poner('#b-precio', malo ? NaN : precio);
    const total = malo || !precio ? 0 : precio;
    const pct = (v) => (total ? `${Math.max(0, (v / total) * 100)}%` : '0%');
    $('#seg-mat').style.width = pct(c.totalMateriales);
    $('#seg-tra').style.width = pct(c.manoYGastos);
    $('#seg-gan').style.width = pct(malo ? 0 : precio - c.total);

    const t = leer('trabajo', { medidas: {} });
    guardar('trabajo', { ...t, costos: e, resumen: { costo: c.total, precio } });
  };

  const conectar = () => {
    const form = $('form');
    const campos = Array.from(form.querySelectorAll('#materiales input'));
    campos.forEach((input) => validarCampo(input, false));
    $('#terminar').addEventListener('click', (ev) => {
      const primero = campos.find((input) => !input.validity.valid);
      if (primero) {
        ev.preventDefault();
        validarCampo(primero, true);
        primero.focus();
        return;
      }
      if (prenda) terminarPrenda();
    });
    form.addEventListener('focusout', (ev) => {
      if (ev.target.dataset.campo) validarCampo(ev.target, true);
    });
    form.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' || ev.isComposing) return;
      const el = ev.target;
      if (el.id === 'nombre-nuevo') {
        ev.preventDefault();
        $('#agregar').click();
      } else if (el.dataset.campo) {
        ev.preventDefault();
        if (validarCampo(el, true)) (campos[campos.indexOf(el) + 1] ?? form.elements.horas).focus();
      }
    });
    form.addEventListener('input', (ev) => {
      const el = ev.target;
      if (el.dataset.campo) {
        e.materiales[el.dataset.i][el.dataset.campo] = el.value;
        validarCampo(el, el.getAttribute('aria-invalid') === 'true' || Boolean(el.value.trim()));
      } else if (el.name) e[el.name] = el.value;
      else { el.setCustomValidity(''); return; }
      actualizar();
    });
    form.addEventListener('submit', (ev) => ev.preventDefault());
    const ayuda = main.querySelector('.ayuda-precio');
    if (ayuda) conectarAyuda(ayuda, { horas: () => $('[name="horas"]'), pago: () => $('[name="pagoHora"]') });
    main.addEventListener('click', alTocar);
  };

  // Un solo manejador para todos los botones (se quita y vuelve a poner al redibujar)
  function alTocar(ev) {
    const b = ev.target.closest('button');
    if (!b || !main.contains(b)) return;
    if (b.dataset.voz) return hablar(VOZ[b.dataset.voz]);
    if (b.dataset.tipo) { e.tipo = b.dataset.tipo; return actualizar(); }
    if (b.dataset.pct) { e.ganancia = b.dataset.pct; $('[name="ganancia"]').value = b.dataset.pct; return actualizar(); }
    if (b.id === 'sugerir-gastos') {
      const { totalMateriales } = calcularCostos(e);
      e.gastos = Number.isFinite(totalMateriales) ? numero(Math.round(totalMateriales * 10) / 100) : '';
      $('[name="gastos"]').value = e.gastos;
      return actualizar();
    }
    let redibujar = false;
    if (b.dataset.quitar != null) { e.materiales.splice(Number(b.dataset.quitar), 1); redibujar = true; }
    if (b.id === 'agregar') {
      const campo = $('#nombre-nuevo');
      const nombre = campo.value.trim();
      if (!nombre) {
        campo.setCustomValidity('Escribe el nombre del material.');
        campo.reportValidity();
        return;
      }
      e.materiales.push({ nombre, cantidad: '1', unidad: 'unid.', precio: '' });
      redibujar = true;
    }
    if (b.id === 'ejemplo') {
      e = { ...e, materiales: e.materiales.map((m) => ({ ...m, cantidad: m.cantidad || '0,9', precio: precioEjemplo(m.nombre) })),
        horas: '2', pagoHora: '14', ganancia: '30', tipo: 'costo' };
      const { totalMateriales } = calcularCostos(e);
      e.gastos = numero(Math.round(totalMateriales * 10) / 100);
      esEjemplo = true; redibujar = true;
    }
    if (b.id === 'borrar') {
      const t = leer('trabajo', { medidas: {} });
      e = estadoInicial(prenda, { ...t, costos: null });
      esEjemplo = false; redibujar = true;
    }
    if (redibujar) {
      main.removeEventListener('click', alTocar);
      dibujar();
      if (b.id === 'agregar') main.querySelector(`[data-i="${e.materiales.length - 1}"][data-campo="cantidad"]`).focus();
    }
  }

  // Al salir de esta pantalla se quita el manejador de botones
  window.addEventListener('hashchange', () => main.removeEventListener('click', alTocar), { once: true });
  dibujar();
  return prenda ? `#/tela/${prenda.id}` : '#/';
}
