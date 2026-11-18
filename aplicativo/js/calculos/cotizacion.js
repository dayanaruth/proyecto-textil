// Cálculos de la cotización: tela por prenda (con su molde real), costo y precio por unidad
import { construirMolde } from '../moldes/registro.js';
import { piezasDeMolde, planoDeCorte } from './tela.js';
import { precioVenta, valor } from './costos.js';

// Metros de tela que ocupa UNA prenda con esas medidas (sin la reserva)
export async function telaDePrenda(prendaId, medidas, anchoTela) {
  const molde = await construirMolde(prendaId, medidas);
  const plano = planoDeCorte(piezasDeMolde(molde), anchoTela);
  if (plano.error) throw new Error(plano.error);
  return plano.largo / 100;
}

// Costo y precio de una unidad
// datos: { precioTela, insumos: [{cantidad, precio}], horas, pagoHora, gastosPct, ganancia, tipo }
export function precioUnidad(metros, d) {
  const tela = metros * valor(d.precioTela);
  const insumos = d.insumos.reduce((s, i) => s + valor(i.cantidad) * valor(i.precio), 0);
  const materiales = tela + insumos;
  const manoDeObra = valor(d.horas) * valor(d.pagoHora);
  const gastos = materiales * (valor(d.gastosPct) / 100);
  const costo = materiales + manoDeObra + gastos;
  const precio = precioVenta(costo, valor(d.ganancia), d.tipo);
  return { tela, insumos, materiales, manoDeObra, gastos, costo, precio };
}

// Tela total a comprar para el pedido: suma de todas las prendas + 5 % de reserva (mín. 10 cm), redondeado a 10 cm
export function telaTotal(lineas) {
  const metros = lineas.reduce((s, l) => s + l.metros * l.cantidad, 0);
  return Math.ceil((metros + Math.max(0.1, metros * 0.05)) * 10) / 10;
}
