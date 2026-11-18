// Conversión entre cm, metros, pulgadas y yardas (todo pasa por centímetros)
export const UNIDADES = {
  cm: { nombre: 'Centímetros', corto: 'cm', aCm: 1 },
  m: { nombre: 'Metros', corto: 'm', aCm: 100 },
  pulgada: { nombre: 'Pulgadas', corto: 'pulg.', aCm: 2.54 },
  yarda: { nombre: 'Yardas', corto: 'yd', aCm: 91.44 },
};

export const convertir = (valor, de, a) => (valor * UNIDADES[de].aCm) / UNIDADES[a].aCm;

// Lee "12", "12,5", "1/2" o "1 1/2" (como vienen las pulgadas en revistas y moldes)
export function leerFraccion(texto) {
  const t = String(texto).trim().replace(',', '.');
  let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = t.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  return t === '' ? NaN : Number(t);
}
