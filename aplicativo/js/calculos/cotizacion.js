// Cálculos de la cotización: tela por prenda (con su molde real), costo y precio por unidad
import { construirMolde } from '../moldes/registro.js';
import { piezasDeMolde, planoDeCorte, planoDosDobleces } from './tela.js';
import { precioVenta, valor } from './costos.js';

// Metros de tela que ocupa UNA prenda con esas medidas (sin la reserva)
export async function telaDePrenda(prendaId, medidas, anchoTela) {
  return (await corteDePrenda(prendaId, medidas, anchoTela)).metros;
}

export async function corteDePrenda(prendaId, medidas, anchoTela, ribAparte = false) {
  const molde = await construirMolde(prendaId, medidas);
  const rectangulos = ribAparte ? molde.rectangulos.filter((p) => p.materialAlternativo !== 'rib') : molde.rectangulos;
  const piezas = piezasDeMolde({ ...molde, rectangulos });
  const plano = planoDeCorte(piezas, anchoTela);
  if (plano.error) throw new Error(plano.error);
  return { metros: plano.largo / 100, piezas, cantidades: { botones: molde.botones, elastico: molde.elastico } };
}

// Tela de TODO el pedido, cortando las prendas juntas (como en el taller). Se prueban tres formas y
// se usa la que gasta menos: prenda por prenda, todas juntas con un doblez, o con los dos orillos al centro.
// lineas: [{ prendaId?, medidas, cantidad, metros, piezas? }]. Devuelve los metros
// de cada línea ya ajustados (por prenda) y cómo doblar la tela.
export async function telaDelPedido(prendaId, lineas, anchoTela) {
  const unaPorUna = lineas.reduce((s, l) => s + l.metros * l.cantidad, 0);
  const todas = [];
  for (const l of lineas) {
    const piezas = l.piezas ?? piezasDeMolde(await construirMolde(l.prendaId ?? prendaId, l.medidas));
    for (let i = 0; i < l.cantidad; i++) todas.push(...piezas);
  }
  const juntas = planoDeCorte(todas, anchoTela);
  const dos = planoDosDobleces(todas, anchoTela);
  const opciones = [
    { metros: unaPorUna, doblez: 'uno' },
    ...(juntas.error ? [] : [{ metros: juntas.largo / 100, doblez: 'uno' }]),
    ...(dos ? [{ metros: dos.largo / 100, doblez: 'dos' }] : []),
  ];
  const mejor = opciones.reduce((a, b) => (b.metros < a.metros ? b : a));
  const factor = unaPorUna ? mejor.metros / unaPorUna : 1;
  return { lineas: lineas.map((l) => ({ ...l, metros: l.metros * factor })), doblez: mejor.doblez, ahorro: 1 - factor };
}

export function manoDeObraPedido(d, unidades) {
  if (!unidades) return 0;
  if (d.cobroTrabajo === 'fijo') return valor(d.pagoPedido);
  const horas = valor(d.horas) * (d.alcanceHoras === 'pedido' ? 1 : unidades);
  return horas * valor(d.pagoHora);
}

// Costo y precio de una unidad. Los gastos del pedido se reparten entre las prendas.
export function precioUnidad(metros, d, unidades = 1) {
  const tela = d.telaCliente ? 0 : metros * valor(d.precioTela);
  const insumos = d.insumos.reduce((s, i) => s + (i.cliente ? 0 : valor(i.cantidad) * valor(i.precio) / (i.alcance === 'pedido' ? unidades : 1)), 0);
  const materiales = tela + insumos;
  const manoDeObra = manoDeObraPedido(d, unidades) / unidades;
  const gastos = materiales * (valor(d.gastosPct) / 100);
  const costo = materiales + manoDeObra + gastos;
  const precio = precioVenta(costo, valor(d.ganancia), d.tipo);
  return { tela, insumos, materiales, manoDeObra, gastos, costo, precio };
}

// Tela total a comprar para el pedido: suma de todas las prendas + 5 % de reserva (mín. 10 cm), redondeado a 10 cm
export function telaTotal(lineas) {
  const metros = lineas.reduce((s, l) => s + l.metros * l.cantidad, 0);
  if (!metros) return 0;
  return Math.ceil((metros + Math.max(0.1, metros * 0.05)) * 10) / 10;
}

// Reparte la compra completa (reserva incluida) según el consumo de cada talla.
export function calcularPedido(lineas, datos) {
  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const neto = lineas.reduce((s, l) => s + l.metros * l.cantidad, 0);
  const tela = telaTotal(lineas);
  const filas = lineas.map((l) => {
    const metrosCobrados = neto ? l.metros * tela / neto : 0;
    const u = precioUnidad(metrosCobrados, datos, unidades);
    return { ...l, metrosCobrados, materiales: u.materiales, gastos: u.gastos, costo: u.costo, precio: Math.ceil(u.precio) };
  });
  const total = filas.reduce((s, f) => s + f.precio * f.cantidad, 0);
  const costo = filas.reduce((s, f) => s + f.costo * f.cantidad, 0);
  const materiales = filas.reduce((s, f) => s + f.materiales * f.cantidad, 0);
  const gastos = filas.reduce((s, f) => s + f.gastos * f.cantidad, 0);
  return { filas, unidades, tela, neto, total, costo, materiales, gastos, manoDeObra: manoDeObraPedido(datos, unidades) };
}

export function pendientes(datos) {
  const errores = [];
  const numero = (v, nombre, positivo = false) => {
    if (!String(v ?? '').trim() || !Number.isFinite(valor(v)) || (positivo && valor(v) <= 0)) errores.push(nombre);
  };
  if (!datos.telaCliente) numero(datos.precioTela, 'Precio de la tela', true);
  if (datos.cobroTrabajo === 'fijo') {
    if (String(datos.horas ?? '').trim()) numero(datos.horas, 'Horas estimadas del pedido', true);
    numero(datos.pagoPedido, 'Pago por todo el pedido', true);
  } else {
    numero(datos.horas, datos.alcanceHoras === 'pedido' ? 'Horas de todo el pedido' : 'Horas por prenda', true);
    numero(datos.pagoHora, 'Pago por hora', true);
  }
  numero(datos.gastosPct, 'Gastos del taller (puedes poner 0)');
  numero(datos.ganancia, 'Ganancia (puedes poner 0)');
  if (datos.tipo === 'venta' && valor(datos.ganancia) >= 100) errores.push('La ganancia sobre venta debe ser menor a 100 %');
  datos.insumos.forEach((m, i) => {
    const nombre = m.nombre.trim() || `Material ${i + 1}`;
    if (!m.nombre.trim()) errores.push(`Nombre del material ${i + 1}`);
    if (!m.unidad.trim()) errores.push(`Unidad de ${nombre}`);
    numero(m.cantidad, `Cantidad de ${nombre}`, true);
    if (!m.cliente) numero(m.precio, `Precio de ${nombre} (o marca que lo aporta el cliente)`, true);
  });
  return errores;
}
