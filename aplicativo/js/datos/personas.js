// Medidas guardadas de cada persona (solo en este celular, con LocalStorage + JSON)
import { leer, guardar } from './almacenamiento.js';
import { MEDIDAS } from './medidas.js';

const CLAVE = 'personas';
// Fecha de hoy según el reloj del celular (hora de Bolivia), no la de Londres (UTC)
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const listar = () => leer(CLAVE, []);
export const buscar = (id) => listar().find((p) => p.id === id);

function guardarTodas(personas) {
  if (!guardar(CLAVE, personas)) throw new Error('No se pudo guardar: el navegador no tiene espacio o está en modo privado.');
}

export function crear({ nombre, avatar, medidas = {} }) {
  const persona = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nombre: nombre.trim(), avatar, medidas: {}, fechas: {}, actualizado: hoy(),
  };
  for (const [id, valor] of Object.entries(medidas)) {
    if (MEDIDAS[id] && Number.isFinite(valor)) { persona.medidas[id] = valor; persona.fechas[id] = hoy(); }
  }
  guardarTodas([...listar(), persona]);
  return persona;
}

export function cambiar(id, cambios) {
  guardarTodas(listar().map((p) => (p.id === id ? { ...p, ...cambios, actualizado: hoy() } : p)));
}

// Guarda o quita medidas (valor null = quitar)
export function anotarMedidas(id, valores) {
  const p = buscar(id);
  if (!p) return;
  const medidas = { ...p.medidas }, fechas = { ...p.fechas };
  for (const [m, v] of Object.entries(valores)) {
    if (v == null) { delete medidas[m]; delete fechas[m]; } else { medidas[m] = v; fechas[m] = hoy(); }
  }
  cambiar(id, { medidas, fechas });
}

export const borrar = (id) => guardarTodas(listar().filter((p) => p.id !== id));

// Si las medidas tienen más de 6 meses, conviene volver a medir
export const esAntigua = (p) => (Date.now() - new Date(p.actualizado).getTime()) / 864e5 > 183;

export const fecha = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ---- Respaldo en un archivo ----
export function copia() {
  const datos = { app: 'mi-taller', version: 1, fecha: hoy(), personas: listar() };
  return new File([JSON.stringify(datos, null, 2)], `medidas-mi-taller-${hoy()}.json`, { type: 'application/json' });
}

// Recupera una copia: agrega a las personas nuevas y actualiza a las que ya estaban
export function recuperar(texto) {
  let datos;
  try { datos = JSON.parse(texto); } catch { throw new Error('El archivo no es una copia de Mi Taller.'); }
  if (datos?.app !== 'mi-taller' || !Array.isArray(datos.personas)) throw new Error('El archivo no es una copia de Mi Taller.');
  const actuales = listar();
  let nuevas = 0, actualizadas = 0;
  for (const p of datos.personas) {
    if (typeof p?.id !== 'string' || typeof p?.nombre !== 'string' || typeof p?.medidas !== 'object') continue;
    const limpia = {
      id: p.id, nombre: p.nombre.slice(0, 40), avatar: String(p.avatar ?? 'mujer'),
      medidas: Object.fromEntries(Object.entries(p.medidas).filter(([m, v]) => MEDIDAS[m] && Number.isFinite(v))),
      fechas: typeof p.fechas === 'object' && p.fechas ? p.fechas : {}, actualizado: String(p.actualizado ?? hoy()).slice(0, 10),
    };
    const i = actuales.findIndex((a) => a.id === limpia.id);
    if (i >= 0) { actuales[i] = limpia; actualizadas++; } else { actuales.push(limpia); nuevas++; }
  }
  guardarTodas(actuales);
  return { nuevas, actualizadas };
}
