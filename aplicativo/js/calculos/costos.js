// Costos en 3 cuadros (como en el taller) y precio de venta
// Cuadro 1: materiales · Cuadro 2: mano de obra y gastos · Cuadro 3: resumen y precio
import { leerNumero } from '../utilidades/formato.js';

// Lee un número escrito; vacío = 0, inválido o negativo = NaN
export const valor = (texto) => {
  if (!String(texto ?? '').trim()) return 0;
  const n = leerNumero(texto);
  return n >= 0 ? n : NaN;
};

export function calcularCostos({ materiales, horas, pagoHora, gastos }) {
  const subtotales = materiales.map((m) => valor(m.cantidad) * valor(m.precio));
  const totalMateriales = subtotales.reduce((s, v) => s + v, 0);
  const manoDeObra = valor(horas) * valor(pagoHora);
  const gastosTaller = valor(gastos);
  const total = totalMateriales + manoDeObra + gastosTaller;
  return { subtotales, totalMateriales, manoDeObra, gastosTaller, manoYGastos: manoDeObra + gastosTaller, total };
}

// "costo": la ganancia es un % del costo (recargo): 100 + 30 % = 130
// "venta": la ganancia es un % del precio de venta (margen): 100 ÷ (1 − 0,30) = 142,86
export function precioVenta(costo, porcentaje, tipo) {
  const p = porcentaje / 100;
  if (tipo === 'venta') return p < 1 ? costo / (1 - p) : NaN;
  return costo * (1 + p);
}
