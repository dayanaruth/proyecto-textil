import { dibujoMedida } from './figurin.js';
// Catálogo único de medidas: nombre, cómo tomarla, rango válido (cm) y dibujo
export const MEDIDAS = {
  'cintura': {
    nombre: 'Contorno de cintura', min: 40, max: 150,
    como: 'Rodea con la cinta la parte más delgada de la cintura, sin apretar.',
  },
  'cadera': {
    nombre: 'Contorno de cadera', min: 45, max: 170,
    como: 'Rodea la parte más ancha de la cadera, con los pies juntos.',
  },
  'altura-cadera': {
    nombre: 'Altura de cadera', min: 8, max: 30,
    como: 'Mide de costado, desde la cintura hasta la parte más ancha de la cadera.',
  },
  'largo-falda': {
    nombre: 'Largo de falda', min: 20, max: 120,
    como: 'Mide de costado, desde la cintura hasta donde quieres que llegue la falda.',
  },
  'busto': {
    nombre: 'Contorno de busto', min: 45, max: 160,
    como: 'Rodea la parte más alta del busto, pasando por debajo de los brazos, sin apretar.',
  },
  'cuello': {
    nombre: 'Contorno de cuello', min: 20, max: 55,
    como: 'Rodea la base del cuello, donde se apoya el cuello de una camisa.',
  },
  'talle-espalda': {
    nombre: 'Talle de espalda', min: 18, max: 55,
    como: 'Por la espalda, desde el hueso de la base del cuello hasta la cintura.',
  },
  'talle-delantero': {
    nombre: 'Talle delantero', min: 18, max: 60,
    como: 'Desde el cuello, junto al hombro, pasando por el punto más alto del busto, hasta la cintura.',
  },
  'ancho-espalda': {
    nombre: 'Ancho de espalda', min: 18, max: 55,
    como: 'Por la espalda, de un brazo al otro, a unos 10 cm debajo del cuello.',
  },
  'busto-a-busto': {
    nombre: 'Busto a busto', min: 8, max: 28,
    como: 'Distancia entre las dos puntas del busto.',
  },
  'alto-busto': {
    nombre: 'Alto de busto', min: 12, max: 38,
    como: 'Desde el cuello, junto al hombro, hasta la punta del busto.',
  },
  'largo-blusa': {
    nombre: 'Largo de blusa', min: 28, max: 95,
    como: 'Por la espalda, desde la base del cuello hasta donde quieres que llegue la blusa.',
  },
  'largo-polera': {
    nombre: 'Largo de polera', min: 30, max: 100,
    como: 'Desde el hombro, junto al cuello, hasta donde quieres que llegue la polera (a la cadera: unos 60 a 75 cm).',
  },
  'contorno-brazo': {
    nombre: 'Contorno de brazo', min: 14, max: 55,
    como: 'Rodea la parte más ancha del brazo, debajo de la axila, sin apretar.',
  },
  'largo-manga': {
    nombre: 'Largo de manga', min: 6, max: 75,
    como: 'Desde la punta del hombro hasta donde quieres que llegue la manga (corta: unos 20 cm).',
  },
  'pecho': {
    nombre: 'Contorno de pecho', min: 45, max: 160,
    como: 'Rodea la parte más ancha del pecho, por debajo de los brazos, sin apretar.',
  },
  'largo-camisa': {
    nombre: 'Largo de camisa', min: 30, max: 100,
    como: 'Por la espalda, desde la base del cuello hasta donde quieres que llegue la camisa.',
  },
  'largo-manga-larga': {
    nombre: 'Largo de manga', min: 22, max: 85,
    como: 'Con el brazo un poco doblado, desde la punta del hombro hasta el hueso de la muñeca.',
  },
  'muneca': {
    nombre: 'Contorno de muñeca', min: 9, max: 30,
    como: 'Rodea la muñeca, justo encima del hueso.',
  },
  'tiro': {
    nombre: 'Altura de tiro', min: 14, max: 40,
    como: 'Sentada en una silla dura: de costado, desde la cintura hasta el asiento.',
  },
  'altura-rodilla': {
    nombre: 'Altura de rodilla', min: 22, max: 75,
    como: 'De costado, desde la cintura hasta la mitad de la rodilla.',
  },
  'largo-pantalon': {
    nombre: 'Largo de pantalón', min: 40, max: 125,
    como: 'De costado, desde la cintura hasta donde quieres que llegue el pantalón (con zapatos).',
  },
  'rodilla': {
    nombre: 'Contorno de rodilla', min: 22, max: 70,
    como: 'Rodea la rodilla por la mitad, con la pierna estirada y sin apretar.',
  },
  'bota': {
    nombre: 'Ancho de bota', min: 20, max: 70,
    como: 'Contorno que quieres en el ruedo del pantalón. Recto: unos 40 a 46 cm.',
  },
};

// ---- Dibujo: figura del cuerpo + marca de dónde medir ----
const CUERPO = `
  <g fill="#E9DCCF" stroke="#8A7A6E" stroke-width="1.2" stroke-linejoin="round">
    <circle cx="60" cy="18" r="11"/>
    <path d="M55 28 V34 M65 28 V34" fill="none"/>
    <path d="M38 40 L30 70 L28 98 L33 99 L36 72 L42 52 Z M82 40 L90 70 L92 98 L87 99 L84 72 L78 52 Z"/>
    <path d="M55 34 L65 34 L82 40 L78 52 Q80 64 72 80 Q86 92 84 104 L76 150 L71 188 L75 193 L62 193 L61 150 L60 114
             L59 150 L58 193 L45 193 L49 188 L44 150 L36 104 Q34 92 48 80 Q40 64 42 52 L38 40 Z"/>
  </g>`;

// Dónde medir: el figurín con la cinta métrica y los puntos ① ② (js/datos/figurin.js)
export const figuraMedida = (id) => dibujoMedida(id, MEDIDAS[id].nombre);

// ---- Zonas del cuerpo: para ordenar las medidas guardadas de cada persona ----
// "solo": la medida se muestra solo para ese tipo de persona (dama o varón)
export const ZONAS = [
  { id: 'torso', nombre: 'Torso', medidas: ['busto', 'pecho', 'cuello', 'ancho-espalda', 'talle-espalda', 'talle-delantero', 'busto-a-busto', 'alto-busto'] },
  { id: 'cintura', nombre: 'Cintura y cadera', medidas: ['cintura', 'cadera', 'altura-cadera'] },
  { id: 'piernas', nombre: 'Piernas', medidas: ['tiro', 'altura-rodilla', 'rodilla', 'bota'] },
  { id: 'brazos', nombre: 'Brazos', medidas: ['contorno-brazo', 'muneca'] },
  { id: 'largos', nombre: 'Largos de las prendas', medidas: ['largo-blusa', 'largo-camisa', 'largo-falda', 'largo-pantalon', 'largo-polera', 'largo-manga', 'largo-manga-larga'] },
];
const SOLO_DAMA = ['busto', 'talle-delantero', 'busto-a-busto', 'alto-busto', 'largo-blusa', 'largo-falda'];
export const medidasDe = (zona, tipo) =>
  zona.medidas.filter((id) => (tipo === 'varon' ? !SOLO_DAMA.includes(id) : id !== 'pecho'));

const RESALTE = {
  torso: '<path d="M38 40 L55 34 H65 L82 40 L78 52 Q80 64 72 80 H48 Q40 64 42 52 Z"/>',
  cintura: '<path d="M48 76 H72 Q86 92 84 108 L83 113 H37 L36 108 Q34 92 48 76 Z"/>',
  piernas: '<path d="M37 112 H83 L76 150 L71 188 L75 193 L62 193 L60 116 L58 193 L45 193 L49 188 L44 150 Z"/>',
  brazos: '<path d="M38 40 L30 70 L28 98 L33 99 L36 72 L42 52 Z M82 40 L90 70 L92 98 L87 99 L84 72 L78 52 Z"/>',
  largos: '<path d="M38 40 H82 L84 108 L76 150 L71 190 H49 L44 150 L36 108 Z"/>',
};

export const figuraZona = (id) => `
  <svg viewBox="0 0 120 200" aria-hidden="true">
    ${CUERPO}
    <g fill="#9E2F45" fill-opacity=".45" stroke="#9E2F45" stroke-width="1.5">${RESALTE[id] ?? ''}</g>
  </svg>`;
