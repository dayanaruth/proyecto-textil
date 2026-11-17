// Revisión de medidas: vacías, que no son números, fuera de rango, incoherentes
import { leerNumero, numero } from '../utilidades/formato.js';

// Revisa una medida escrita por la persona. Devuelve { ok, valor } o { ok: false, mensaje }
export function revisarMedida(texto, def) {
  if (!String(texto).trim()) return { ok: false, mensaje: 'Escribe la medida para seguir.' };
  const valor = leerNumero(texto);
  if (Number.isNaN(valor)) return { ok: false, mensaje: 'Escribe solo números, por ejemplo 68 o 68,5.' };
  if (valor < def.min || valor > def.max) {
    const quiso = valor / 10 >= def.min && valor / 10 <= def.max ? ` ¿Quisiste escribir ${numero(valor / 10)}?` : '';
    return { ok: false, mensaje: `Revisa la medida: suele estar entre ${def.min} y ${def.max} cm.${quiso}` };
  }
  return { ok: true, valor };
}

// Avisos cuando dos medidas no cuadran entre sí (no impiden seguir)
const REGLAS = [
  { usa: ['cintura', 'cadera'], falla: (m) => m.cintura > m.cadera,
    texto: 'La cintura es más grande que la cadera. Revisa si está bien.' },
  { usa: ['altura-cadera', 'largo-falda'], falla: (m) => m['altura-cadera'] >= m['largo-falda'],
    texto: 'El largo de la falda es menor que la altura de cadera. Revisa si está bien.' },
  { usa: ['talle-delantero', 'talle-espalda'], falla: (m) => m['talle-delantero'] < m['talle-espalda'],
    texto: 'El talle delantero suele ser más largo que el de espalda (pasa por el busto). Revisa si está bien.' },
  { usa: ['alto-busto', 'talle-delantero'], falla: (m) => m['alto-busto'] >= m['talle-delantero'],
    texto: 'El alto de busto debe ser menor que el talle delantero. Revisa las dos medidas.' },
  { usa: ['busto', 'ancho-espalda'], falla: (m) => m['ancho-espalda'] > m.busto / 2,
    texto: 'El ancho de espalda parece muy grande comparado con el busto. Revisa si está bien.' },
  { usa: ['altura-cadera', 'tiro'], falla: (m) => m['altura-cadera'] >= m.tiro,
    texto: 'La altura de cadera debe ser menor que el tiro. Revisa las dos medidas.' },
  { usa: ['tiro', 'altura-rodilla'], falla: (m) => m.tiro >= m['altura-rodilla'],
    texto: 'El tiro debe ser menor que la altura de rodilla. Revisa las dos medidas.' },
  { usa: ['altura-rodilla', 'largo-pantalon'], falla: (m) => m['altura-rodilla'] >= m['largo-pantalon'],
    texto: 'La rodilla debe estar más arriba que el largo del pantalón. Revisa las dos medidas.' },
];

export const avisos = (medidas, ids) =>
  REGLAS.filter((r) => r.usa.every((id) => ids.includes(id)) && r.falla(medidas)).map((r) => r.texto);
