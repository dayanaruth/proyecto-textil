// Piezas y ajustes que comparten la camisa de dama y la de varón.
// ⚠️ PROVISIONAL: reemplazar FORMULAS por las del docente del CEA.
import { punto as P, largoTramo } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

export const FORMULAS = {
  cruce: 2,            // cm que pasa un delantero sobre el otro (donde van los botones)
  vista: 5,            // vista incorporada que se dobla hacia adentro
  entreBotones: 9,     // distancia entre botones
  pieCuello: 3.5,      // alto terminado del pie de cuello
  cuello: 6,           // alto terminado del cuello (la pala)
  cruceCuello: 2,      // el pie de cuello pasa un poco para el botón
  holguraMuneca: 3,    // cm que se suman al contorno de muñeca para el puño
  cruceMuneca: 2,      // cruce del puño para el botón
  anchoPuno: 6,        // alto terminado del puño
  margen: 1,
};
const F = FORMULAS;

// Convierte un delantero "al doblez" en delantero con cruce, vista y botones (se corta 2)
export function agregarBotones(pieza, yPrimerBoton, yUltimoBoton) {
  const { a: A, b: R0 } = pieza.lineaCentro;
  const borde = -(F.cruce + F.vista);
  const X1 = P(borde, A.y), X2 = P(borde, R0.y);
  const paso = pieza.pasos.length - 1; // se agrega antes del paso de margen
  const botones = [];
  for (let y = yPrimerBoton; y <= yUltimoBoton; y += F.entreBotones) botones.push(P(0, y));

  const i = pieza.contorno.findIndex((t) => t.a === A && t.b === R0);
  const contorno = [...pieza.contorno];
  contorno.splice(i, 1, { a: A, b: X1, margen: 1 }, { a: X1, b: X2, margen: 1 }, { a: X2, b: R0, margen: 1.5 });

  const pasos = [...pieza.pasos];
  pasos.splice(paso, 0, `Botones: a la izquierda del centro agrega ${n(F.cruce)} cm de cruce (línea punteada, ahí se dobla) y ${n(F.vista)} cm de vista. Marca ${botones.length} botones sobre el centro, cada ${n(F.entreBotones)} cm.`);
  pasos[pasos.length - 1] = pasos.at(-1).replace('El doblez no lleva margen.', 'La vista lleva 1 cm.');

  return {
    ...pieza,
    cortar: 'Cortar 2', alDoblez: false, centro: 'CENTRO · BOTONES',
    contorno, pasos,
    elementos: [
      ...pieza.elementos,
      { paso, tipo: 'linea', p: [A, X1] }, { paso, tipo: 'linea', p: [X1, X2] }, { paso, tipo: 'linea', p: [X2, R0] },
      { paso, tipo: 'linea', p: [P(-F.cruce, A.y), P(-F.cruce, R0.y)], puntos: true },
      ...botones.map((b) => ({ paso, tipo: 'punto', p: [b], nombre: '' })),
    ],
    botones: botones.length,
  };
}

// La espalda de la blusa (con cierre) pasa a cortarse al doblez
export function espaldaAlDoblez(pieza) {
  const contorno = pieza.contorno.map((t, i) => (i === pieza.contorno.length - 1 ? { ...t, margen: 0 } : t));
  const pasos = [...pieza.pasos];
  pasos[pasos.length - 1] = pasos.at(-1).replace(/en el ruedo y [\d,]+ en el centro \(cierre\)\./, 'en el ruedo. El centro va al doblez: no lleva margen.');
  return { ...pieza, contorno, pasos, cortar: 'Cortar 1 al doblez', alDoblez: true, centro: 'DOBLEZ' };
}

// Pie de cuello, cuello y puño: rectángulos con el largo justo del escote y de la muñeca
export function cuelloYPuno(escoteMitad, muneca) {
  const escote = Math.round(2 * escoteMitad * 10) / 10;
  const pie = { largo: escote + F.cruceCuello + 2 * F.margen, alto: F.pieCuello + 2 * F.margen };
  const pala = { largo: escote + 2 * F.margen, alto: F.cuello + 2 * F.margen };
  const puno = { largo: muneca + F.holguraMuneca + F.cruceMuneca + 2 * F.margen, alto: 2 * F.anchoPuno + 2 * F.margen };
  return {
    escote,
    rectangulos: [
      { nombre: 'Pie de cuello', cortar: 'Cortar 2 al doblez', alDoblez: true, cantidad: 2, ...pie,
        texto: `${n(pie.largo)} × ${n(pie.alto)} cm. Mide lo mismo que tu escote (${n(escote)} cm) + ${n(F.cruceCuello)} cm para el botón (ya incluye margen). Redondea las puntas.` },
      { nombre: 'Cuello', cortar: 'Cortar 2 al doblez', alDoblez: true, cantidad: 2, ...pala,
        texto: `${n(pala.largo)} × ${n(pala.alto)} cm (ya incluye margen). Corta las puntas en diagonal o redondas, como prefieras.` },
      { nombre: 'Puño', cortar: 'Cortar 2', alDoblez: false, ...puno,
        texto: `${n(puno.largo)} × ${n(puno.alto)} cm (se dobla a la mitad). Muñeca + ${n(F.holguraMuneca)} de holgura + ${n(F.cruceMuneca)} de cruce (ya incluye margen).` },
    ],
    largoPuno: muneca + F.holguraMuneca,
    anchoPuno: F.anchoPuno,
  };
}

// Mitad del escote: delantero + espalda (el primer tramo de cada contorno es el escote)
export const mitadEscote = (...piezas) => piezas.reduce((s, p) => s + largoTramo(p.contorno[0]), 0);
