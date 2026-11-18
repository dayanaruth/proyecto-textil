// Cronómetro de costura: guarda la HORA de inicio (no cuenta segundos en la pantalla),
// así sigue midiendo aunque se cierre la app o se apague el celular.
import { leer, guardar } from './almacenamiento.js';

const VACIO = { prenda: null, inicio: null, acumulado: 0 };
export const estado = () => leer('cronometro', VACIO);
export const corriendo = () => estado().inicio != null;
export const transcurrido = (e = estado()) => e.acumulado + (e.inicio ? Date.now() - e.inicio : 0);

export const empezar = (prenda) => { const e = estado(); guardar('cronometro', { ...e, prenda: prenda ?? e.prenda, inicio: Date.now() }); };
export const pausar = () => { const e = estado(); guardar('cronometro', { ...e, inicio: null, acumulado: transcurrido(e) }); };
export const elegirPrenda = (prenda) => guardar('cronometro', { ...estado(), prenda });
export const reiniciar = () => guardar('cronometro', { ...VACIO, prenda: estado().prenda });

// Termina y guarda el tiempo en el historial
export function terminar() {
  const e = estado();
  const registro = { prenda: e.prenda, ms: transcurrido(e), fecha: new Date().toISOString() };
  guardar('tiempos', [registro, ...registros()]);
  guardar('cronometro', { ...VACIO, prenda: e.prenda });
  return registro;
}

export const registros = () => leer('tiempos', []);
export const borrarRegistro = (fecha) => guardar('tiempos', registros().filter((r) => r.fecha !== fecha));
export const promedio = (prenda) => {
  const lista = registros().filter((r) => r.prenda === prenda);
  return lista.length ? { ms: lista.reduce((s, r) => s + r.ms, 0) / lista.length, veces: lista.length } : null;
};

// 9 600 000 ms → "2:40:00" y "2 h 40 min"
export const reloj = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export const enPalabras = (ms) => {
  const min = Math.round(ms / 60000);
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};
// Horas para los costos, redondeadas al cuarto de hora (mínimo 0,25 h)
export const horasParaCostos = (ms) => Math.max(0.25, Math.round((ms / 3600000) * 4) / 4);
