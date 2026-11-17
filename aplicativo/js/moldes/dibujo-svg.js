// Dibuja una pieza del molde en SVG, en centímetros reales
import { aPoligono, agregarMargen, caja } from './geometria.js';

const COLOR = { tinta: '#2B2420', guia: '#A39890', actual: '#9E2F45' };
const r = (v) => Math.round(v * 100) / 100;
const ruta = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${r(p.x)} ${r(p.y)}`).join(' ');

function trazo(el, color, grosor) {
  const [a, b, c] = el.p;
  const estilo = `fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round"`;
  if (el.tipo === 'curva') return `<path ${estilo} d="M${r(a.x)} ${r(a.y)} Q${r(b.x)} ${r(b.y)} ${r(c.x)} ${r(c.y)}"/>`;
  if (el.tipo === 'punto') {
    const dx = el.der ? 0.7 : -0.7;
    return `<circle cx="${r(a.x)}" cy="${r(a.y)}" r=".45" fill="${color}"/>
      <text x="${r(a.x + dx)}" y="${r(a.y - 0.5)}" font-size="2.2" font-weight="700" fill="${color}"
            text-anchor="${el.der ? 'start' : 'end'}">${el.nombre}</text>`;
  }
  return `<path ${estilo} d="${ruta(el.tipo === 'pinza' ? [a, b, c] : [a, b])}"/>`;
}

// Línea por donde se corta la tela (contorno + margen de costura)
export const lineaDeCorte = (pieza) => agregarMargen(aPoligono(pieza.contorno));
const corte = lineaDeCorte;

// Contenido del dibujo hasta el paso indicado (el último paso = molde terminado)
export function contenidoPieza(pieza, paso = pieza.pasos.length - 1) {
  const terminado = paso >= pieza.pasos.length - 1;
  const partes = pieza.elementos
    .filter((el) => el.paso <= paso)
    .map((el) => trazo(el, terminado ? COLOR.tinta : el.paso === paso ? COLOR.actual : COLOR.guia,
      el.paso === paso && !terminado ? 0.3 : 0.15));

  if (terminado) {
    const [h1, h2] = pieza.hilo;
    const largo = pieza.contorno.at(-1);
    const medio = (largo.a.y + largo.b.y) / 2;
    partes.unshift(`<path d="${ruta(corte(pieza))} Z" fill="#9E2F45" fill-opacity=".06" stroke="${COLOR.actual}" stroke-width=".2"/>`);
    partes.push(`
      <path d="M${r(h1.x)} ${r(h1.y)} V${r(h2.y)} M${r(h1.x - .6)} ${r(h1.y + 1)} L${r(h1.x)} ${r(h1.y)} L${r(h1.x + .6)} ${r(h1.y + 1)}
               M${r(h2.x - .6)} ${r(h2.y - 1)} L${r(h2.x)} ${r(h2.y)} L${r(h2.x + .6)} ${r(h2.y - 1)}" fill="none" stroke="${COLOR.tinta}" stroke-width=".15"/>
      <text x="${r(h1.x + .8)}" y="${r((h1.y + h2.y) / 2)}" font-size="1.6" fill="${COLOR.tinta}">HILO</text>
      <text x="${r(pieza.rotulo.x)}" y="${r(pieza.rotulo.y)}" font-size="3" font-weight="700" text-anchor="middle" fill="${COLOR.tinta}">${pieza.nombre.toUpperCase()}</text>
      <text x="${r(pieza.rotulo.x)}" y="${r(pieza.rotulo.y + 2.8)}" font-size="1.8" text-anchor="middle" fill="${COLOR.tinta}">${pieza.cortar}</text>
      <text transform="translate(${r(largo.a.x + 1.8)} ${r(medio)}) rotate(-90)" font-size="1.6" text-anchor="middle" fill="${COLOR.tinta}">${pieza.centro}</text>`);
  }
  return partes.join('');
}

// Espacio que ocupa la pieza terminada (con margen y letras)
export const cajaPieza = (pieza) =>
  caja([...corte(pieza), ...pieza.elementos.flatMap((el) => el.p)], 2.5);

// SVG para la pantalla: se ajusta al ancho disponible
export function svgPieza(pieza, paso) {
  const c = cajaPieza(pieza);
  return `<svg viewBox="${r(c.x)} ${r(c.y)} ${r(c.ancho)} ${r(c.alto)}" role="img"
    aria-label="Molde ${pieza.nombre}" font-family="system-ui, sans-serif">${contenidoPieza(pieza, paso)}</svg>`;
}
