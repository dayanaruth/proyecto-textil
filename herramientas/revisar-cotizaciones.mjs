import assert from 'node:assert/strict';
import { calcularPedido, pendientes, telaDePrenda, telaDelPedido } from '../aplicativo/js/calculos/cotizacion.js';
import { TABLAS } from '../aplicativo/js/datos/tallas.js';
import * as guardadas from '../aplicativo/js/datos/cotizaciones.js';

const datos = { precioTela: '30', insumos: [
  { nombre: 'Rib', cantidad: '0,1', unidad: 'm', precio: '20', alcance: 'prenda' },
  { nombre: 'Hilo', cantidad: '2', unidad: 'carrete', precio: '3', alcance: 'prenda' },
], horas: '0,75', pagoHora: '18', gastosPct: '10', ganancia: '30', tipo: 'costo' };
const lineas = [];
for (const [talla, cantidad] of [['S', 2], ['M', 3], ['L', 5], ['XL', 1]]) {
  const medidas = TABLAS.varon.medidas[talla];
  lineas.push({ talla, cantidad, medidas, metros: await telaDePrenda('polera-varon', medidas, 150) });
}
const pedido = await telaDelPedido('polera-varon', lineas, 150);
const resultado = calcularPedido(pedido.lineas, datos);
assert.equal(resultado.unidades, 11);
assert.equal(resultado.tela, 11.8);
assert.ok(Math.abs(resultado.costo - 634.7) < 1e-8);
assert.equal(resultado.total, 832);
assert.deepEqual(resultado.filas.map((f) => f.precio), [71, 74, 76, 88]);
const porHorasTotales = calcularPedido(pedido.lineas, { ...datos, alcanceHoras: 'pedido', horas: '8,25' });
assert.equal(porHorasTotales.manoDeObra, 148.5);
assert.equal(porHorasTotales.total, resultado.total);
const porMontoFijo = { ...datos, alcanceHoras: 'pedido', cobroTrabajo: 'fijo', horas: '', pagoHora: '', pagoPedido: '108' };
const resultadoFijo = calcularPedido(pedido.lineas, porMontoFijo);
assert.equal(resultadoFijo.manoDeObra, 108);
assert.ok(Math.abs(resultadoFijo.costo - resultado.costo + 40.5) < 1e-8);
assert.deepEqual(pendientes(porMontoFijo), []);
assert.ok(pendientes({ ...porMontoFijo, pagoPedido: '' }).includes('Pago por todo el pedido'));
const porPrenda = { ...porMontoFijo, cobroTrabajo: 'prenda', pagoPrenda: '35', gastosPct: '0', ganancia: '0' };
assert.equal(calcularPedido([{ ...pedido.lineas[0], cantidad: 1 }], { ...porPrenda, pagoPrenda: '50' }).manoDeObra, 50);
assert.equal(calcularPedido(pedido.lineas, porPrenda).manoDeObra, 11 * 35);
assert.deepEqual(pendientes(porPrenda), []);
assert.deepEqual(pendientes({ ...porPrenda, gastosPct: '', ganancia: '', pagoHora: '', horas: '' }), []);
assert.ok(pendientes({ ...porPrenda, pagoPrenda: '' }).includes('Cobro de confección por prenda'));
const una = calcularPedido([{ ...pedido.lineas[0], cantidad: 1 }], { ...porPrenda, pagoPrenda: '50' });
const loteSerie = calcularPedido(pedido.lineas, porPrenda);
assert.equal(una.manoDeObra, 50);
assert.equal(loteSerie.manoDeObra, 385);
assert.ok(Math.abs(loteSerie.porcentajeMinimo - 100 * 385 / (loteSerie.materiales + 385)) < 1e-8);
const mayorGanancia = calcularPedido(pedido.lineas, { ...porPrenda, porcentajeFijo: String(loteSerie.porcentajeMinimo + 5) });
assert.ok(mayorGanancia.total > loteSerie.total);
assert.ok(mayorGanancia.filas.every((fila, i) => fila.precio >= loteSerie.filas[i].precio));
assert.equal(calcularPedido(pedido.lineas, { ...porPrenda, porcentajeFijo: '0' }).total, loteSerie.total);
const telaMasCara = calcularPedido(pedido.lineas, { ...porPrenda, precioTela: '40', porcentajeFijo: null });
assert.equal(telaMasCara.manoDeObra, loteSerie.manoDeObra);
assert.ok(telaMasCara.materiales > loteSerie.materiales);
assert.ok(telaMasCara.porcentajeMinimo < loteSerie.porcentajeMinimo);
assert.equal(telaMasCara.porcentajeGanancia, telaMasCara.porcentajeMinimo);
assert.ok(telaMasCara.total > loteSerie.total);
assert.ok(telaMasCara.total - loteSerie.total < telaMasCara.materiales - loteSerie.materiales + pedido.lineas.length * 2);
assert.ok(pendientes({ ...porPrenda, porcentajeFijo: '100' }).length);
assert.deepEqual(pendientes(datos), []);
assert.ok(pendientes({ ...datos, precioTela: '' }).length);
assert.ok(pendientes({ ...datos, insumos: [{ ...datos.insumos[0], precio: '' }] }).length);
assert.deepEqual(pendientes({ ...datos, telaCliente: true, precioTela: '', insumos: [{ ...datos.insumos[0], cliente: true, precio: '' }] }), []);
assert.ok(pendientes({ ...datos, tipo: 'venta', ganancia: '100' }).length);
assert.ok(pendientes({ ...datos, horas: '-1' }).length);
assert.ok(pendientes({ ...datos, insumos: [{ ...datos.insumos[0], cantidad: 'abc' }] }).length);
const lote = { ...datos, insumos: [{ ...datos.insumos[1], alcance: 'pedido' }] };
const sinInsumos = calcularPedido(pedido.lineas, { ...datos, insumos: [] });
assert.ok(Math.abs(calcularPedido(pedido.lineas, lote).costo - sinInsumos.costo - 6.6) < 1e-8);
assert.ok(Math.abs(calcularPedido(pedido.lineas, { ...lote, insumos: [{ ...lote.insumos[0], cliente: true, precio: '' }] }).costo - sinInsumos.costo) < 1e-8);
assert.equal(calcularPedido([], datos).tela, 0);

// Al retomar un borrador se reemplaza el registro; las cotizaciones anteriores no cambian.
const memoria = new Map();
globalThis.localStorage = { getItem: (k) => memoria.get(k) ?? null, setItem: (k, v) => memoria.set(k, v) };
const anterior = guardadas.crear({ total: 100, estado: 'final' });
const borrador = guardadas.crear({ estado: 'borrador', formulario: { precioTela: '' } });
const final = guardadas.crear({ estado: 'final', total: 832 }, borrador.id);
assert.equal(final.id, borrador.id);
assert.equal(final.numero, borrador.numero);
assert.equal(guardadas.listar().length, 2);
assert.equal(guardadas.buscar(anterior.id).total, 100);
assert.throws(() => guardadas.crear({ estado: 'final' }, anterior.id));
globalThis.localStorage.setItem = () => { throw new Error('Sin espacio'); };
assert.throws(() => guardadas.crear({ estado: 'borrador' }), /No se pudo guardar/);
console.log('✅ Cotizaciones: reserva, pedido de 11 prendas, materiales por lote, aportes, validación y borradores.');
