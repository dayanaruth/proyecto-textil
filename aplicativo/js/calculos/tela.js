// Cálculo del metraje: acomoda las piezas sobre la tela doblada a lo largo
// (orillo con orillo). Las piezas "al doblez" van pegadas al doblez y el hilo
// siempre queda a lo largo de la tela.
import { lineaDeCorte } from '../moldes/dibujo-svg.js';
import { caja } from '../moldes/geometria.js';

export const ANCHOS_COMUNES = [90, 115, 150, 160]; // cm
export const EXTRA = 10; // cm por si la tela encoge o la cortan torcida

// Convierte el molde en piezas para acomodar (medidas en cm, con margen incluido)
export function piezasDeMolde(molde) {
  const piezas = molde.piezas.map((p) => {
    const puntos = lineaDeCorte(p);
    const c = caja(puntos);
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
  return [...piezas, ...rectangulos];
}

// Acomoda las piezas en filas sobre la tela doblada. Devuelve el largo necesario.
export function planoDeCorte(piezas, anchoTela) {
  const util = anchoTela / 2;
  const filas = [];
  const ordenadas = [...piezas].sort((a, b) => b.formas[0].alto - a.formas[0].alto);

  for (const pieza of ordenadas) {
    const caben = pieza.formas.filter((f) => f.ancho <= util);
    if (!caben.length) return { error: `La pieza «${pieza.nombre}» no entra en una tela de ${anchoTela} cm de ancho.` };

    const lugar = filas.flatMap((fila) => caben.map((forma) => ({ fila, forma })))
      .find(({ fila, forma }) => !(pieza.doblez && fila.doblez) && forma.alto <= fila.alto && fila.usado + forma.ancho <= util);

    if (lugar) {
      poner(lugar.fila, pieza, lugar.forma);
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
    anchoTela, util, largo,
    comprar: Math.ceil((largo + EXTRA) / 10) * 10,
    colocadas: filas.flatMap((f) => f.piezas),
  };
}

// Las piezas al doblez van al inicio de la fila (x = 0 es el doblez)
function poner(fila, pieza, forma) {
  const colocada = { nombre: pieza.nombre, doblez: pieza.doblez, ...forma, x: 0, y: fila.y };
  if (pieza.doblez) {
    fila.piezas.forEach((p) => { p.x += forma.ancho; });
    fila.piezas.unshift(colocada);
    fila.doblez = true;
  } else {
    colocada.x = fila.usado;
    fila.piezas.push(colocada);
  }
  fila.usado += forma.ancho;
}
