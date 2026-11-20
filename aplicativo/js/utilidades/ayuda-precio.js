// Ayuda para quien no sabe cuántas horas poner ni cuánto cobrar por hora (Costo y precio, Cotizaciones).
// Usa las referencias de Bolivia de datos/referencias.js. Los botones llenan los campos de horas y pago.
import { PAGO_HORA, HORA_MINIMA, SALARIO_MINIMO, horasDe } from '../datos/referencias.js';
import { numero, leerNumero } from './formato.js';

const DIAS_DE_TRABAJO = 26; // 6 días por semana
const horasTexto = (h) => `${numero(h)} ${h === 1 ? 'hora' : 'horas'}`;

// serie: true si es un pedido grande (docenas); entonces se sugiere primero el tiempo en serie
export function ayudaHorasYPago(prendaId, { serie = false } = {}) {
  const h = prendaId ? horasDe(prendaId) : null;
  const opciones = h ? (serie ? [[h.serie, 'cada una, en serie'], [h.medida, 'si fuera una sola']] : [[h.medida, 'a medida'], [h.serie, 'cada una, si haces varias']]) : [];
  return `
    <div class="ayuda-precio">
      ${h ? `<p class="ayuda-ref">⏱️ <b>¿Cuánto se tarda?</b> Referencia para una persona con máquina recta y remalladora:</p>
      <div class="chips">${opciones.map(([v, t]) => `<button type="button" class="chip" data-usar-horas="${v}">${horasTexto(v)} <small>${t}</small></button>`).join('')}</div>` : ''}
      <details class="ayuda-ref">
        <summary>💵 ¿No sabes cuánto cobrar por hora?</summary>
        <p>Lo mínimo por ley en Bolivia es <b>Bs ${numero(HORA_MINIMA)} por hora</b>: el salario mínimo 2026 (Bs ${numero(SALARIO_MINIMO)} al mes) ÷ 30 días ÷ 8 horas. Elige según tu experiencia:</p>
        <div class="chips chips-pago">${PAGO_HORA.map((p) => `
          <button type="button" class="chip" data-usar-pago="${p.valor}"><b>Bs ${p.valor}</b> ${p.nombre}<small>${p.detalle}</small></button>`).join('')}</div>
        <p class="ayuda">O calcula tu hora: lo que quieres ganar al mes ÷ las horas que coses al mes (${DIAS_DE_TRABAJO} días).</p>
        <div class="fila-calculo">
          <label>Quiero ganar al mes<span class="campo"><span class="unidad">Bs</span><input data-calc="mes" inputmode="decimal" placeholder="${SALARIO_MINIMO}"></span></label>
          <span class="por" aria-hidden="true">÷</span>
          <label>Horas que coso al día<span class="campo"><input data-calc="horas" inputmode="decimal" placeholder="8"><span class="unidad">h</span></span></label>
        </div>
        <p class="calc-hora" role="status"></p>
      </details>
    </div>`;
}

// Conecta los botones: "horas" y "pago" son los campos a llenar (se avisa con un evento input)
export function conectarAyuda(raiz, { horas, pago }) {
  const poner = (campo, v) => {
    campo.value = numero(v);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  };
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-usar-horas], [data-usar-pago]');
    if (!b) return;
    e.preventDefault();
    if (b.dataset.usarHoras) poner(horas(), Number(b.dataset.usarHoras));
    if (b.dataset.usarPago) poner(pago(), Number(b.dataset.usarPago));
  });
  raiz.addEventListener('input', (e) => {
    if (!e.target.dataset.calc) return;
    e.stopPropagation();
    const zona = e.target.closest('details');
    const mes = leerNumero(zona.querySelector('[data-calc="mes"]').value);
    const h = leerNumero(zona.querySelector('[data-calc="horas"]').value);
    const res = zona.querySelector('.calc-hora');
    if (!(mes > 0 && h > 0 && h <= 16)) { res.innerHTML = ''; return; }
    const hora = Math.round((mes / (h * DIAS_DE_TRABAJO)) * 2) / 2;
    res.innerHTML = `Tu hora vale unos <b>Bs ${numero(hora)}</b>${hora < HORA_MINIMA ? ' (menos que el mínimo por ley)' : ''}.
      <button type="button" class="chip" data-usar-pago="${hora}">Usar Bs ${numero(hora)}</button>`;
  }, true);
}
