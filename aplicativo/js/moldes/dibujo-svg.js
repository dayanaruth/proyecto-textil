// Dibuja una pieza del molde en SVG, en centímetros reales.
// Elementos: linea, curva (3 puntos) o curva suave (4 puntos), pinza, punto (con letra) y texto.
// "puntos: true" dibuja la línea punteada. "pieza.escala" agranda letras y trazos (piezas grandes).
import { aPoligono, agregarMargen, caja } from './geometria.js';

const COLOR = { tinta: '#2B2420', guia: '#A39890', actual: '#9E2F45' };
const r = (v) => Math.round(v * 100) / 100;
const ruta = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${r(p.x)} ${r(p.y)}`).join(' ');

function trazo(el, color, grosor, k) {
  const [a, b, c, d] = el.p;
  const punteado = el.puntos ? ` stroke-dasharray="${r(0.8 * k)} ${r(0.6 * k)}"` : '';
  const estilo = `fill="none" stroke="${color}" stroke-width="${r(grosor * k)}" stroke-linecap="round" stroke-linejoin="round"${punteado}`;
  if (el.tipo === 'curva') {
    return d
      ? `<path ${estilo} d="M${r(a.x)} ${r(a.y)} C${r(b.x)} ${r(b.y)} ${r(c.x)} ${r(c.y)} ${r(d.x)} ${r(d.y)}"/>`
      : `<path ${estilo} d="M${r(a.x)} ${r(a.y)} Q${r(b.x)} ${r(b.y)} ${r(c.x)} ${r(c.y)}"/>`;
  }
  if (el.tipo === 'punto') {
    const dx = (el.der ? 0.7 : -0.7) * k;
    return `<circle cx="${r(a.x)}" cy="${r(a.y)}" r="${r(0.45 * k)}" fill="${color}"/>
      <text x="${r(a.x + dx)}" y="${r(a.y - 0.5 * k)}" font-size="${r(2.2 * k)}" font-weight="700" fill="${color}"
            text-anchor="${el.der ? 'start' : 'end'}">${el.nombre}</text>`;
  }
  if (el.tipo === 'texto') {
    return `<text x="${r(a.x)}" y="${r(a.y)}" font-size="${r((el.tam ?? 2) * k)}" font-weight="700" fill="${color}" text-anchor="middle">${el.texto}</text>`;
  }
  return `<path ${estilo} d="${ruta(el.tipo === 'pinza' ? [a, b, c] : [a, b])}"/>`;
}

// Línea por donde se corta la tela (contorno + margen de costura)
export const lineaDeCorte = (pieza) => agregarMargen(aPoligono(pieza.contorno));

// Contenido del dibujo hasta el paso indicado (el último paso = molde terminado)
export function contenidoPieza(pieza, paso = pieza.pasos.length - 1) {
  const k = pieza.escala ?? 1;
  const terminado = paso >= pieza.pasos.length - 1;
  const partes = pieza.elementos
    .filter((el) => el.paso <= paso)
    .map((el) => trazo(el, terminado ? COLOR.tinta : el.paso === paso ? COLOR.actual : COLOR.guia,
      el.paso === paso && !terminado ? 0.3 : 0.15, k));

  if (terminado) {
    const texto = (x, y, tam, contenido, extra = '') =>
      `<text x="${r(x)}" y="${r(y)}" font-size="${r(tam * k)}" text-anchor="middle" fill="${COLOR.tinta}"${extra}>${contenido}</text>`;
    partes.unshift(`<path d="${ruta(lineaDeCorte(pieza))} Z" fill="#9E2F45" fill-opacity=".06" stroke="${COLOR.actual}" stroke-width="${r(0.2 * k)}"/>`);
    partes.push(texto(pieza.rotulo.x, pieza.rotulo.y, 3, pieza.nombre.toUpperCase(), ' font-weight="700"'));
    partes.push(texto(pieza.rotulo.x, pieza.rotulo.y + 2.8 * k, 1.8, pieza.cortar));
    if (pieza.hilo) {
      const [h1, h2] = pieza.hilo;
      const f = 0.6 * k, g = 1 * k;
      partes.push(`
        <path d="M${r(h1.x)} ${r(h1.y)} V${r(h2.y)} M${r(h1.x - f)} ${r(h1.y + g)} L${r(h1.x)} ${r(h1.y)} L${r(h1.x + f)} ${r(h1.y + g)}
                 M${r(h2.x - f)} ${r(h2.y - g)} L${r(h2.x)} ${r(h2.y)} L${r(h2.x + f)} ${r(h2.y - g)}" fill="none" stroke="${COLOR.tinta}" stroke-width="${r(0.15 * k)}"/>
        <text x="${r(h1.x + 0.8 * k)}" y="${r((h1.y + h2.y) / 2)}" font-size="${r(1.6 * k)}" fill="${COLOR.tinta}">HILO</text>`);
    }
    if (pieza.centro) {
      const lado = pieza.lineaCentro ?? pieza.contorno.at(-1);
      partes.push(texto(0, 0, 1.6, pieza.centro, ` transform="translate(${r(lado.a.x + 1.8 * k)} ${r((lado.a.y + lado.b.y) / 2)}) rotate(-90)"`));
    }
  }
  return partes.join('');
}

// Espacio que ocupa la pieza terminada (con margen y letras)
export const cajaPieza = (pieza) =>
  caja([...lineaDeCorte(pieza), ...pieza.elementos.flatMap((el) => el.p)], 2.5 * (pieza.escala ?? 1));

// SVG para la pantalla: se ajusta al ancho; las piezas muy anchas se deslizan de lado
export function svgPieza(pieza, paso) {
  const c = cajaPieza(pieza);
  const ancho = pieza.verAncho ? ` style="min-width:${pieza.verAncho}px"` : '';
  return `<svg viewBox="${r(c.x)} ${r(c.y)} ${r(c.ancho)} ${r(c.alto)}"${ancho} role="img"
    aria-label="Molde ${pieza.nombre}" font-family="system-ui, sans-serif">${contenidoPieza(pieza, paso)}</svg>`;
}
