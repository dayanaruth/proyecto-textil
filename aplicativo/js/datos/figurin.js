// Dibujo de "dónde medir": el figurín (img/figurin.webp, 736 × 1308 px) con las indicaciones encima:
// la vista (de frente / por la espalda), la cinta métrica amarilla (en los contornos la parte de atrás va
// punteada), los puntos ① empieza → ② termina y notas cortas. Las coordenadas son píxeles del figurín.

const CINTA = '#E9B949', TINTA = '#3B2A25', VINO = '#9E2F45', VERDE = '#2E7A4E', FONDO = '#F6F6F6';
const T = 22; // tamaño de letra
let K = 1;    // escala de letras, cinta y puntos (en el cuerpo entero la figura se ve más chica: K = 2)

// Curva suave que pasa por los puntos (Catmull-Rom → Bézier)
function suave(pts) {
  const p = [pts[0], ...pts, pts.at(-1)];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [a, b, c, e] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const r = (v) => Math.round(v * 10) / 10;
    d += ` C${r(b[0] + (c[0] - a[0]) / 6)} ${r(b[1] + (c[1] - a[1]) / 6)} ${r(c[0] - (e[0] - b[0]) / 6)} ${r(c[1] - (e[1] - b[1]) / 6)} ${c[0]} ${c[1]}`;
  }
  return d;
}

// ---- Cinta métrica, puntos y notas ----
const marcas = (d) => `<path d="${d}" fill="none" stroke="${CINTA}" stroke-width="${13 * K}" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${13 * K}" stroke-dasharray="${1.6 * K} ${7 * K}" opacity=".55"/>`;
// Contorno: adelante la cinta, atrás punteada (pasa por detrás). "giro" inclina la cinta (brazo, muñeca)
const contorno = (cx, cy, rx, ry, giro = 0) => `<g${giro ? ` transform="rotate(${giro} ${cx} ${cy})"` : ''}>
  <path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}" fill="none" stroke="${TINTA}" stroke-width="3.5" stroke-dasharray="6 6"/>
  ${marcas(`M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`)}</g>`;
const largo = (...pts) => marcas(pts.length > 2 ? suave(pts) : `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`);
const punto = (x, y, n, color) => `<circle cx="${x}" cy="${y}" r="${15 * K}" fill="${color}" stroke="#fff" stroke-width="${4 * K}"/>
  <text x="${x}" y="${y + 8 * K}" font-size="${22 * K}" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>`;
const de = (p, q) => punto(...p, '1', VERDE) + punto(...q, '2', VINO);     // ① empieza → ② termina
const nota = (x, y, lineas, ancla = 'start', tam = T * K) => `<g class="fm-nota">${[].concat(lineas).map((texto, i) => `<text x="${x}" y="${y + i * tam * 1.15}"
  font-size="${tam}" font-weight="800" fill="${TINTA}" text-anchor="${ancla}" paint-order="stroke" stroke="${FONDO}" stroke-width="${tam * 0.35}"
  stroke-linejoin="round">${texto}</text>`).join('')}</g>`;
const guia = (y, texto, x1 = 150, x2 = 560) => `<path d="M${x1} ${y} H${x2}" stroke="${VINO}" stroke-width="${3 * K}" stroke-dasharray="${12 * K} ${8 * K}"/>${nota(x2 + 8, y + 8 * K, texto)}`;
const flecha = (x1, y1, x2, y2) => `<g class="fm-nota"><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${TINTA}" stroke-width="${3 * K}"/><circle cx="${x2}" cy="${y2}" r="${5 * K}" fill="${TINTA}"/></g>`;

// Vista de espalda: la misma figura, tapando el busto y la clavícula y redibujando las líneas punteadas
const ESPALDA = `
  <rect x="260" y="239" width="88" height="44" fill="${FONDO}"/><rect x="364" y="239" width="94" height="44" fill="${FONDO}"/>
  <path d="M300 239 L304 283 M412 239 L408 283" stroke="#555" stroke-width="2" stroke-dasharray="8 6"/>
  <rect x="286" y="122" width="138" height="26" fill="${FONDO}"/><path d="M355 122 V148" stroke="#555" stroke-width="2" stroke-dasharray="8 6"/>`;

// Puntos del cuerpo en el figurín
const CUELLO = [355, 101], JUNTO_CUELLO = [376, 104], HOMBRO = [470, 116], MUNECA = [626, 612];
const CINTURA_LADO = [428, 390], CADERA_LADO = [477, 562];
const COSTADO = [CINTURA_LADO, [462, 480], CADERA_LADO, [470, 700]];    // de la cintura bajando por el costado
const BRAZO = [HOMBRO, [505, 150], [538, 250], [568, 380], [598, 500], MUNECA];

// ---- Cada medida: vista, parte de la figura que se muestra y qué se dibuja ----
const TORSO = '0 0 736 650', BRAZOS = '0 0 736 720', HASTA_CADERA = '0 0 736 760', ENTERA = '0 0 736 1308';
const M = {
  'cintura': { caja: TORSO, dibujo: () => contorno(357, 390, 69, 13) + nota(560, 455, ['la parte', 'más delgada']) + flecha(600, 470, 428, 392) },
  'cadera': { caja: TORSO, dibujo: () => contorno(356, 562, 121, 15) + nota(500, 470, ['la parte', 'más ancha']) + flecha(540, 490, 478, 560) },
  'altura-cadera': { caja: TORSO, dibujo: () => guia(390, 'cintura', 150, 600) + guia(562, 'cadera', 150, 600) + largo(CINTURA_LADO, [462, 480], CADERA_LADO)
    + de(CINTURA_LADO, CADERA_LADO) + nota(495, 470, ['por el', 'costado']) },
  'largo-falda': { caja: ENTERA, dibujo: () => guia(390, 'cintura', 150, 520) + largo(...COSTADO, [455, 860]) + de(CINTURA_LADO, [455, 860])
    + nota(490, 930, ['hasta', 'donde', 'quieres']) },
  'busto': { caja: TORSO, dibujo: () => contorno(358, 242, 101, 13) + nota(20, 300, ['por la parte', 'más alta', 'del busto']) + flecha(130, 320, 258, 246) },
  'pecho': { caja: TORSO, dibujo: () => contorno(358, 242, 101, 13) + nota(20, 300, ['la parte más', 'ancha, bajo', 'los brazos']) + flecha(130, 320, 258, 246) },
  'cuello': { caja: '200 0 330 220', zoom: true, dibujo: () => contorno(356, 101, 35, 8) + nota(420, 170, ['en la base', 'del cuello'], 'start', 20) + flecha(440, 155, 392, 104) },
  'talle-espalda': { caja: TORSO, espalda: true, dibujo: () => guia(390, 'cintura') + largo(CUELLO, [355, 390]) + de(CUELLO, [355, 390]) + nota(372, 80, 'hueso del cuello') },
  'talle-delantero': { caja: TORSO, dibujo: () => guia(390, 'cintura') + largo(JUNTO_CUELLO, [398, 180], [405, 258], [405, 390]) + de(JUNTO_CUELLO, [405, 390])
    + nota(420, 80, 'junto al cuello') + nota(470, 290, ['pasa por', 'el busto']) },
  'ancho-espalda': { caja: TORSO, espalda: true, dibujo: () => largo([250, 180], [460, 180]) + de([250, 180], [460, 180]) + nota(355, 155, 'de axila a axila, por atrás', 'middle') },
  'busto-a-busto': { caja: TORSO, dibujo: () => largo([306, 258], [406, 258]) + de([306, 258], [406, 258]) + nota(356, 320, ['de punta a punta', 'del busto'], 'middle') },
  'alto-busto': { caja: TORSO, dibujo: () => largo(JUNTO_CUELLO, [395, 190], [406, 258]) + de(JUNTO_CUELLO, [406, 258]) + nota(420, 80, 'junto al cuello')
    + nota(430, 300, ['hasta la punta', 'del busto']) },
  'largo-blusa': { caja: HASTA_CADERA, espalda: true, dibujo: () => largo(CUELLO, [355, 590]) + de(CUELLO, [355, 590]) + nota(372, 80, 'base del cuello')
    + nota(375, 640, ['hasta donde quieres', 'que llegue la blusa']) },
  'largo-camisa': { caja: HASTA_CADERA, espalda: true, dibujo: () => largo(CUELLO, [355, 620]) + de(CUELLO, [355, 620]) + nota(372, 80, 'base del cuello')
    + nota(375, 670, ['hasta donde quieres', 'que llegue la camisa']) },
  'largo-polera': { caja: HASTA_CADERA, dibujo: () => largo(JUNTO_CUELLO, [392, 250], [398, 390], [398, 600]) + de(JUNTO_CUELLO, [398, 600])
    + nota(420, 80, 'junto al cuello') + nota(418, 650, ['hasta donde quieres', 'que llegue la polera']) },
  'contorno-brazo': { caja: TORSO, dibujo: () => contorno(505, 255, 33, 8, -21) + nota(560, 330, ['la parte más', 'ancha del brazo']) + flecha(585, 320, 530, 262) },
  'largo-manga': { caja: TORSO, dibujo: () => largo(HOMBRO, [505, 150], [524, 200], [538, 250]) + de(HOMBRO, [538, 250])
    + nota(480, 80, 'punta del hombro') + nota(560, 280, ['donde termina', 'la manga']) },
  'largo-manga-larga': { caja: BRAZOS, dibujo: () => largo(...BRAZO) + de(HOMBRO, MUNECA) + nota(480, 80, 'punta del hombro') + nota(470, 690, ['hasta el hueso', 'de la muñeca']) },
  'muneca': { caja: BRAZOS, dibujo: () => contorno(626, 612, 19, 5, -20) + nota(440, 560, ['encima del', 'hueso']) + flecha(540, 572, 605, 610) },
  'tiro': { caja: TORSO, dibujo: () => guia(390, 'cintura', 150, 600) + largo([355, 392], [355, 576]) + de([355, 392], [355, 576])
    + nota(40, 470, ['o sentada, de', 'costado: de la', 'cintura hasta', 'la silla']) },
  'altura-rodilla': { caja: ENTERA, dibujo: () => guia(390, 'cintura', 150, 520) + guia(900, 'rodilla', 150, 520) + largo(...COSTADO, [445, 900])
    + de(CINTURA_LADO, [445, 900]) + nota(500, 680, ['por el', 'costado']) },
  'largo-pantalon': { caja: ENTERA, dibujo: () => guia(390, 'cintura', 150, 520) + largo(...COSTADO, [448, 900], [440, 1050], [430, 1262])
    + de(CINTURA_LADO, [430, 1262]) + nota(480, 1060, ['hasta', 'donde', 'quieres']) },
  'rodilla': { caja: '0 600 736 500', dibujo: () => contorno(412, 900, 34, 8) + nota(500, 820, ['por la mitad', 'de la rodilla']) + flecha(520, 835, 446, 898) },
  'bota': { caja: '0 900 736 408', dibujo: () => contorno(408, 1255, 26, 6) + nota(470, 1110, ['el contorno que', 'quieres en el', 'ruedo']) + flecha(500, 1170, 434, 1253) },
};

const vista = (m) => (m.espalda ? 'POR LA ESPALDA' : 'DE FRENTE');

export function dibujoMedida(id, nombre = '') {
  const m = M[id];
  if (!m) return '';
  const [x0, y0, , alto] = m.caja.split(' ').map(Number);
  K = m.zoom ? 1 : Math.max(1, Math.round(alto / 650));
  return `
    <svg viewBox="${m.caja}" role="img" aria-label="Dónde medir: ${nombre}" font-family="Nunito, system-ui, sans-serif" style="background:${FONDO}">
      <image href="img/figurin.webp" width="736" height="1308"/>
      ${m.espalda ? ESPALDA : ''}
      ${m.dibujo()}
      ${m.zoom ? '' : `<g class="fm-nota"><rect x="${x0 + 14 * K}" y="${y0 + 14 * K}" width="${(vista(m).length * 15 + 34) * K}" height="${40 * K}" rx="${20 * K}" fill="${VINO}"/>
        <text x="${x0 + 31 * K}" y="${y0 + 41 * K}" font-size="${21 * K}" font-weight="800" fill="#fff">${vista(m)}</text></g>`}
    </svg>`;
}
