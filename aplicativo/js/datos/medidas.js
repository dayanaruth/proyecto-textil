// Catálogo único de medidas: nombre, cómo tomarla, rango válido (cm) y dibujo
export const MEDIDAS = {
  'cintura': {
    nombre: 'Contorno de cintura', min: 40, max: 150,
    como: 'Rodea con la cinta la parte más delgada de la cintura, sin apretar.',
  },
  'cadera': {
    nombre: 'Contorno de cadera', min: 50, max: 170,
    como: 'Rodea la parte más ancha de la cadera, con los pies juntos.',
  },
  'altura-cadera': {
    nombre: 'Altura de cadera', min: 10, max: 30,
    como: 'Mide de costado, desde la cintura hasta la parte más ancha de la cadera.',
  },
  'largo-falda': {
    nombre: 'Largo de falda', min: 30, max: 120,
    como: 'Mide de costado, desde la cintura hasta donde quieres que llegue la falda.',
  },
  'busto': {
    nombre: 'Contorno de busto', min: 60, max: 160,
    como: 'Rodea la parte más alta del busto, pasando por debajo de los brazos, sin apretar.',
  },
  'cuello': {
    nombre: 'Contorno de cuello', min: 25, max: 55,
    como: 'Rodea la base del cuello, donde se apoya el cuello de una camisa.',
  },
  'talle-espalda': {
    nombre: 'Talle de espalda', min: 30, max: 55,
    como: 'Por la espalda, desde el hueso de la base del cuello hasta la cintura.',
  },
  'talle-delantero': {
    nombre: 'Talle delantero', min: 32, max: 60,
    como: 'Desde el cuello, junto al hombro, pasando por el punto más alto del busto, hasta la cintura.',
  },
  'ancho-espalda': {
    nombre: 'Ancho de espalda', min: 25, max: 55,
    como: 'Por la espalda, de un brazo al otro, a unos 10 cm debajo del cuello.',
  },
  'busto-a-busto': {
    nombre: 'Busto a busto', min: 12, max: 28,
    como: 'Distancia entre las dos puntas del busto.',
  },
  'alto-busto': {
    nombre: 'Alto de busto', min: 18, max: 38,
    como: 'Desde el cuello, junto al hombro, hasta la punta del busto.',
  },
  'largo-blusa': {
    nombre: 'Largo de blusa', min: 40, max: 95,
    como: 'Por la espalda, desde la base del cuello hasta donde quieres que llegue la blusa.',
  },
  'contorno-brazo': {
    nombre: 'Contorno de brazo', min: 18, max: 55,
    como: 'Rodea la parte más ancha del brazo, debajo de la axila, sin apretar.',
  },
  'largo-manga': {
    nombre: 'Largo de manga', min: 8, max: 75,
    como: 'Desde la punta del hombro hasta donde quieres que llegue la manga (corta: unos 20 cm).',
  },
  'pecho': {
    nombre: 'Contorno de pecho', min: 60, max: 160,
    como: 'Rodea la parte más ancha del pecho, por debajo de los brazos, sin apretar.',
  },
  'largo-camisa': {
    nombre: 'Largo de camisa', min: 45, max: 100,
    como: 'Por la espalda, desde la base del cuello hasta donde quieres que llegue la camisa.',
  },
  'largo-manga-larga': {
    nombre: 'Largo de manga', min: 35, max: 85,
    como: 'Con el brazo un poco doblado, desde la punta del hombro hasta el hueso de la muñeca.',
  },
  'muneca': {
    nombre: 'Contorno de muñeca', min: 10, max: 30,
    como: 'Rodea la muñeca, justo encima del hueso.',
  },
  'tiro': {
    nombre: 'Altura de tiro', min: 18, max: 40,
    como: 'Sentada en una silla dura: de costado, desde la cintura hasta el asiento.',
  },
  'altura-rodilla': {
    nombre: 'Altura de rodilla', min: 40, max: 75,
    como: 'De costado, desde la cintura hasta la mitad de la rodilla.',
  },
  'largo-pantalon': {
    nombre: 'Largo de pantalón', min: 60, max: 125,
    como: 'De costado, desde la cintura hasta donde quieres que llegue el pantalón (con zapatos).',
  },
  'bota': {
    nombre: 'Ancho de bota', min: 26, max: 70,
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

const flecha = (x, y1, y2, desde1, desde2) => `
  <path stroke-width="1.2" stroke-dasharray="3 3" d="M${desde1} ${y1} H${x} M${desde2} ${y2} H${x}"/>
  <path d="M${x} ${y1} V${y2} M${x - 3} ${y1 + 4} L${x} ${y1} L${x + 3} ${y1 + 4} M${x - 3} ${y2 - 4} L${x} ${y2} L${x + 3} ${y2 - 4}"/>`;

const MARCAS = {
  'cintura': '<ellipse cx="60" cy="80" rx="14" ry="3.5"/>',
  'cadera': '<ellipse cx="60" cy="104" rx="25" ry="4"/>',
  'altura-cadera': flecha(104, 80, 104, 72, 84),
  'largo-falda': `<path fill="#9E2F45" fill-opacity=".15" stroke="none" d="M48 80 H72 L86 146 H34 Z"/>${flecha(104, 80, 146, 72, 86)}`,
  'busto': '<ellipse cx="60" cy="60" rx="20" ry="4"/>',
  'cuello': '<ellipse cx="60" cy="32" rx="6.5" ry="2"/>',
  'talle-espalda': flecha(104, 34, 80, 65, 72),
  'talle-delantero': '<path d="M56 34 Q50 46 51 60 Q52 72 53 80"/><circle cx="56" cy="34" r="1.5" fill="#9E2F45"/><circle cx="53" cy="80" r="1.5" fill="#9E2F45"/>',
  'ancho-espalda': '<path d="M42 48 H78 M46 45 L42 48 L46 51 M74 45 L78 48 L74 51"/>',
  'busto-a-busto': '<path d="M51 60 H69"/><circle cx="51" cy="60" r="1.6" fill="#9E2F45"/><circle cx="69" cy="60" r="1.6" fill="#9E2F45"/>',
  'alto-busto': '<path d="M56 34 L51 60"/><circle cx="56" cy="34" r="1.5" fill="#9E2F45"/><circle cx="51" cy="60" r="1.6" fill="#9E2F45"/>',
  'largo-blusa': `<path fill="#9E2F45" fill-opacity=".15" stroke="none" d="M38 40 H82 L78 52 Q80 64 72 80 Q86 92 85 112 H35 Q34 92 48 80 Q40 64 42 52 Z"/>${flecha(104, 34, 112, 65, 85)}`,
  'contorno-brazo': '<ellipse cx="85" cy="58" rx="5" ry="2"/>',
  'largo-manga': `<path fill="#9E2F45" fill-opacity=".15" stroke="none" d="M80 40 L90 44 L93 64 L83 66 L79 50 Z"/><path d="M82 40 L88 66 M80 41 L84 39 M86 66 L90 66"/>`,
  'pecho': '<ellipse cx="60" cy="58" rx="21" ry="4"/>',
  'largo-camisa': `<path fill="#9E2F45" fill-opacity=".15" stroke="none" d="M38 40 H82 L78 52 Q80 64 72 80 Q86 92 85 116 H35 Q34 92 48 80 Q40 64 42 52 Z"/>${flecha(104, 34, 116, 65, 85)}`,
  'largo-manga-larga': '<path d="M83 40 L91 70 L90 97"/><circle cx="83" cy="40" r="1.5" fill="#9E2F45"/><circle cx="90" cy="97" r="1.5" fill="#9E2F45"/>',
  'muneca': '<ellipse cx="90" cy="95" rx="3.5" ry="1.5"/>',
  'tiro': `<path fill="#9E2F45" fill-opacity=".15" stroke="none" d="M48 80 H72 Q86 92 84 104 L82 114 H38 L36 104 Q34 92 48 80 Z"/>${flecha(104, 80, 114, 72, 61)}`,
  'altura-rodilla': `${flecha(104, 80, 150, 72, 76)}<path d="M62 150 H76" stroke-width="2"/>`,
  'largo-pantalon': `<path fill="#9E2F45" fill-opacity=".15" stroke="none" d="M48 80 H72 Q86 92 84 104 L76 150 L71 190 H62 L60 114 L58 190 H49 L44 150 L36 104 Q34 92 48 80 Z"/>${flecha(104, 80, 190, 72, 71)}`,
  'bota': '<ellipse cx="66.5" cy="186" rx="6.5" ry="1.8"/><ellipse cx="53.5" cy="186" rx="6.5" ry="1.8"/>',
};

export const figuraMedida = (id) => `
  <svg viewBox="0 0 120 200" role="img" aria-label="Dónde medir: ${MEDIDAS[id].nombre}">
    ${CUERPO}
    <g fill="none" stroke="#9E2F45" stroke-width="2.5" stroke-linecap="round">${MARCAS[id] ?? ''}</g>
  </svg>`;

// ---- Zonas del cuerpo: para ordenar las medidas guardadas de cada persona ----
// "solo": la medida se muestra solo para ese tipo de persona (dama o varón)
export const ZONAS = [
  { id: 'torso', nombre: 'Torso', medidas: ['busto', 'pecho', 'cuello', 'ancho-espalda', 'talle-espalda', 'talle-delantero', 'busto-a-busto', 'alto-busto'] },
  { id: 'cintura', nombre: 'Cintura y cadera', medidas: ['cintura', 'cadera', 'altura-cadera'] },
  { id: 'piernas', nombre: 'Piernas', medidas: ['tiro', 'altura-rodilla', 'bota'] },
  { id: 'brazos', nombre: 'Brazos', medidas: ['contorno-brazo', 'muneca'] },
  { id: 'largos', nombre: 'Largos de las prendas', medidas: ['largo-blusa', 'largo-camisa', 'largo-falda', 'largo-pantalon', 'largo-manga', 'largo-manga-larga'] },
];
const SOLO_DAMA = ['busto', 'talle-delantero', 'busto-a-busto', 'alto-busto', 'largo-blusa', 'largo-falda', 'largo-manga'];
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
