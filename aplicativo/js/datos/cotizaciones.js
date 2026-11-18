// Cotizaciones guardadas y precios que la persona usa siempre (para no escribirlos cada vez)
import { leer, guardar } from './almacenamiento.js';

const CLAVE = 'cotizaciones';
export const listar = () => leer(CLAVE, []);
export const buscar = (id) => listar().find((c) => c.id === id);

export function crear(datos) {
  const todas = listar();
  const c = {
    ...datos,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    numero: todas.reduce((n, x) => Math.max(n, x.numero ?? 0), 0) + 1,
  };
  if (!guardar(CLAVE, [c, ...todas])) throw new Error('No se pudo guardar: el navegador no tiene espacio o está en modo privado.');
  return c;
}

export const borrar = (id) => guardar(CLAVE, listar().filter((c) => c.id !== id));

// Preferencias: ancho y precio de tela, pago por hora, gastos, ganancia, precios de insumos, nombre del taller
const PREFERENCIAS = { anchoTela: 150, precioTela: '', pagoHora: '', gastosPct: '10', ganancia: '30', tipo: 'costo', horas: {}, insumos: {}, taller: '' };
export const preferencias = () => ({ ...PREFERENCIAS, ...leer('preferencias', {}) });
export const guardarPreferencias = (p) => guardar('preferencias', p);
