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
};

export const figuraMedida = (id) => `
  <svg viewBox="0 0 120 200" role="img" aria-label="Dónde medir: ${MEDIDAS[id].nombre}">
    ${CUERPO}
    <g fill="none" stroke="#9E2F45" stroke-width="2.5" stroke-linecap="round">${MARCAS[id] ?? ''}</g>
  </svg>`;
