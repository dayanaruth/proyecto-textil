// Cálculo del metraje: acomoda las piezas sobre la tela doblada a lo largo
// (orillo con orillo). Las piezas "al doblez" van pegadas al doblez y el hilo
// siempre queda a lo largo de la tela.
import { lineaDeCorte } from '../moldes/dibujo-svg.js';
import { caja } from '../moldes/geometria.js';
import { numero } from '../utilidades/formato.js';

export const ANCHOS_COMUNES = [90, 115, 150, 160]; // cm
export const EXTRA = 10; // cm por si la tela encoge o la cortan torcida

// Convierte el molde en piezas para acomodar (medidas en cm, con margen incluido)
export function piezasDeMolde(molde) {
  const piezas = molde.piezas.map((p) => {
    const puntos = lineaDeCorte(p);
    const c = caja(puntos);
    if (p.paneles) return { nombre: p.nombre, paneles: true, ancho: c.ancho, alto: c.alto };
    return {
      nombre: p.nombre, doblez: p.alDoblez,
      formas: [{ ancho: c.ancho, alto: c.alto, puntos: puntos.map((q) => ({ x: q.x - c.x, y: q.y - c.y })) }],
    };
  });
  const rectangulos = molde.rectangulos.map((x) => ({
    nombre: x.nombre, doblez: x.alDoblez,
    // Al doblez, el rectángulo se dibuja a la mitad: a lo largo o atravesado
    formas: x.alDoblez
      ? [{ ancho: x.alto / 2, alto: x.largo }, { ancho: x.largo / 2, alto: x.alto, atravesada: true }]
      : [{ ancho: x.alto, alto: x.largo }, { ancho: x.largo, alto: x.alto, atravesada: true }],
  }));
  const repetir = (lista, fuente) => lista.flatMap((p, i) => Array.from({ length: fuente[i].alDoblez ? fuente[i].cantidad ?? 1 : 1 }, () => p));
  return [...repetir(piezas, molde.piezas), ...repetir(rectangulos, molde.rectangulos)];
}

// Una pieza muy ancha (falda de tablones) se corta en paneles que se unen con costura.
// En la tela doblada cada corte da 2 paneles; cada panel lleva margen de unión a los dos lados.
const UNION = 1.5;
function dividirEnPaneles(pieza, util) {
  const neto = pieza.ancho - 2 * UNION;
  const cortes = Math.ceil(neto / (2 * (util - 2 * UNION)));
  const ancho = neto / (2 * cortes) + 2 * UNION;
  const nota = `La ${pieza.nombre.toLowerCase()} se corta en ${2 * cortes} paneles de ${numero(Math.round(ancho * 10) / 10)} × ${numero(Math.round(pieza.alto * 10) / 10)} cm. Únelos con costuras de ${numero(UNION)} cm escondidas dentro de un tablón (en una va el cierre).`;
  const paneles = Array.from({ length: cortes }, (_, i) => ({
    nombre: cortes > 1 ? `Paneles ${i + 1}` : 'Paneles', doblez: false, formas: [{ ancho, alto: pieza.alto }],
  }));
  return { paneles, nota };
}

// Acomoda las piezas en filas sobre la tela doblada. Devuelve el largo necesario.
export function planoDeCorte(todas, anchoTela) {
  const util = anchoTela / 2;
  const notas = [];
  const piezas = todas.flatMap((p) => {
    if (!p.paneles) return [p];
    const { paneles, nota } = dividirEnPaneles(p, util);
    notas.push(nota);
    return paneles;
  });
  const filas = [];
  const ordenadas = [...piezas].sort((a, b) => b.formas[0].alto - a.formas[0].alto);

  for (const pieza of ordenadas) {
    const caben = pieza.formas.filter((f) => f.ancho <= util);
    if (!caben.length) return { error: `La pieza «${pieza.nombre}» no entra en una tela de ${anchoTela} cm de ancho.` };

    const lugar = filas.flatMap((fila) => caben.map((forma) => ({ fila, forma })))
      .find(({ fila, forma }) => !(pieza.doblez && fila.doblez) && forma.alto <= fila.alto && fila.usado + forma.ancho <= util);

    const encaje = lugar || pieza.doblez || !pieza.formas[0].puntos ? null : buscarEncaje(filas, pieza.formas[0], util);
    if (lugar) {
      poner(lugar.fila, pieza, lugar.forma);
    } else if (encaje) {
      poner(encaje.fila, pieza, encaje.forma, encaje.x);
      if (encaje.forma.girada && !notas.includes(AVISO_GIRO)) notas.push(AVISO_GIRO);
    } else {
      const forma = caben.reduce((a, b) => (b.alto < a.alto ? b : a));
      const y = filas.reduce((s, f) => s + f.alto, 0);
      const fila = { y, alto: forma.alto, usado: 0, doblez: false, piezas: [] };
      filas.push(fila);
      poner(fila, pieza, forma);
    }
  }

  const largo = filas.reduce((s, f) => s + f.alto, 0);
  return {
    anchoTela, util, largo, notas,
    comprar: Math.ceil((largo + EXTRA) / 10) * 10,
    colocadas: filas.flatMap((f) => f.piezas),
  };
}

// Las piezas al doblez van al inicio de la fila (x = 0 es el doblez)
function poner(fila, pieza, forma, xEncaje) {
  const colocada = { nombre: pieza.nombre, doblez: pieza.doblez, ...forma, x: 0, y: fila.y };
  if (pieza.doblez) {
    fila.piezas.forEach((p) => { p.x += forma.ancho; });
    fila.piezas.unshift(colocada);
    fila.doblez = true;
    fila.usado += forma.ancho;
  } else {
    colocada.x = xEncaje ?? fila.usado;
    fila.piezas.push(colocada);
    fila.usado = colocada.x + forma.ancho;
  }
}

// ---- Encaje: dos piezas se acercan según su forma real (no su rectángulo) ----
const AVISO_GIRO = 'Algunas piezas van al revés para aprovechar la tela. Si tu tela tiene pelo o un dibujo con dirección, ponlas todas en el mismo sentido (necesitarás un poco más).';
const SEPARACION = 0.3; // cm entre piezas

// Dónde empieza y termina la pieza a cierta altura y
function anchoEn(puntos, y) {
  let min = Infinity, max = -Infinity;
  puntos.forEach((p, i) => {
    const q = puntos[(i + 1) % puntos.length];
    if ((p.y <= y && q.y >= y) || (q.y <= y && p.y >= y)) {
      const x = p.y === q.y ? Math.min(p.x, q.x) : p.x + ((y - p.y) / (q.y - p.y)) * (q.x - p.x);
      const x2 = p.y === q.y ? Math.max(p.x, q.x) : x;
      min = Math.min(min, x); max = Math.max(max, x2);
    }
  });
  return min <= max ? { min, max } : null;
}

const girar = (f) => ({ ...f, girada: true, puntos: f.puntos.map((p) => ({ x: f.ancho - p.x, y: f.alto - p.y })) });

// Lo más a la izquierda que puede ir "forma" a la derecha de la pieza "previa" sin pisarla
function xJunto(previa, forma) {
  let x = previa.x;
  for (let y = 0; y <= Math.min(previa.alto, forma.alto); y += 0.5) {
    const a = anchoEn(previa.puntos, y), b = anchoEn(forma.puntos, y);
    if (a && b) x = Math.max(x, previa.x + a.max - b.min + SEPARACION);
  }
  return x;
}

function buscarEncaje(filas, forma, util) {
  for (const fila of filas) {
    const previa = fila.piezas.at(-1);
    if (!previa?.puntos || forma.alto > fila.alto) continue;
    const opciones = [forma, girar(forma)]
      .map((f) => ({ fila, forma: f, x: xJunto(previa, f) }))
      .filter((o) => o.x + o.forma.ancho <= util)
      .sort((a, b) => a.x - b.x);
    if (opciones.length) return opciones[0];
  }
  return null;
}
