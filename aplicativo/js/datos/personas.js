// Medidas guardadas de cada persona (solo en este celular, con LocalStorage + JSON)
import { leer, guardar } from './almacenamiento.js';
import { MEDIDAS, ZONAS, medidasDe } from './medidas.js';
import { TABLAS } from './tallas.js';

const CLAVE = 'personas';
const CLAVE_EJEMPLOS = 'personas-ejemplo-inicializadas';
const EJEMPLOS = [
  { id: 'ejemplo-mujer-m', nombre: 'Mujer · Talla M', avatar: 'mujer', tipo: 'dama' },
  { id: 'ejemplo-varon-m', nombre: 'Varón · Talla M', avatar: 'hombre', tipo: 'varon' },
];
// Fecha de hoy según el reloj del celular (hora de Bolivia), no la de Londres (UTC)
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function crearEjemplo({ id, nombre, avatar, tipo }, fecha) {
  const tabla = TABLAS[tipo].medidas.M;
  // La tabla no trae contorno de rodilla. Usamos la referencia del molde de pantalón recto.
  const base = { ...tabla, rodilla: tabla.bota + 4 };
  const ids = ZONAS.flatMap((zona) => medidasDe(zona, tipo)).filter((medida) => Number.isFinite(base[medida]));
  const medidas = Object.fromEntries(ids.map((medida) => [medida, base[medida]]));
  const fechas = Object.fromEntries(ids.map((medida) => [medida, fecha]));
  return { id, nombre, avatar, medidas, fechas, actualizado: fecha };
}

export function listar() {
  const personas = leer(CLAVE, []);
  if (leer(CLAVE_EJEMPLOS, false)) return personas;

  const fecha = hoy();
  const ejemplos = EJEMPLOS.filter(({ id }) => !personas.some((p) => p.id === id));
  const iniciales = [...personas, ...ejemplos.map((ejemplo) => crearEjemplo(ejemplo, fecha))];
  if (!ejemplos.length || guardar(CLAVE, iniciales)) guardar(CLAVE_EJEMPLOS, true);
  return iniciales;
}

export const esEjemplo = ({ id }) => EJEMPLOS.some((p) => p.id === id);
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
export const esAntigua = (p) => !esEjemplo(p) && (Date.now() - new Date(p.actualizado).getTime()) / 864e5 > 183;

export const fecha = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
