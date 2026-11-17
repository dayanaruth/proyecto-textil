// Molde: falda recta (delantero al doblez, espalda con cierre, pretina)
// ⚠️ PROVISIONAL: método estándar. Reemplazar FORMULAS por las del docente del CEA.
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

export const FORMULAS = {
  holguraCadera: 1,        // cm que se suman a cadera ÷ 4
  pinzaMaxima: 3,          // ancho máximo de la pinza
  subidaCostado: 1,        // cuánto sube la cintura en el costado
  bajadaEspalda: 1,        // cuánto baja la cintura en el centro de la espalda
  largoPinza: { delantero: 9, espalda: 12 },
  margen: { cintura: 1, costado: 1.5, ruedo: 4, centroEspalda: 2 },
  pretina: { ancho: 3, cruce: 3, margen: 1 },
};

const F = FORMULAS;

export function construir(m) {
  const ancho = m.cadera / 4 + F.holguraCadera;
  const pinza = Math.min(F.pinzaMaxima, Math.max(0, ancho - m.cintura / 4));
  const cintura = m.cintura / 4 + pinza;
  const pretina = { largo: m.cintura + F.pretina.cruce + 2 * F.pretina.margen, alto: 2 * F.pretina.ancho + 2 * F.pretina.margen };

  return {
    calculos: [
      { nombre: 'Ancho de cadera', formula: `cadera ÷ 4 + ${n(F.holguraCadera)}`, valor: ancho },
      { nombre: 'Ancho de cintura', formula: 'cintura ÷ 4 + pinza', valor: cintura },
      { nombre: 'Pinza', formula: `lo que sobra, hasta ${n(F.pinzaMaxima)} cm`, valor: pinza },
      { nombre: 'Altura de cadera', formula: 'tu medida', valor: m['altura-cadera'] },
      { nombre: 'Largo', formula: 'tu medida', valor: m['largo-falda'] },
    ],
    piezas: [mitad('delantero', m, ancho, cintura, pinza), mitad('espalda', m, ancho, cintura, pinza)],
    rectangulos: [{ nombre: 'Pretina', cortar: 'Cortar 1', alDoblez: true, ...pretina,
      texto: `Rectángulo de ${n(pretina.largo)} × ${n(pretina.alto)} cm (ya incluye margen). No hace falta imprimirla.` }],
  };
}

function mitad(cual, m, ancho, cintura, pinza) {
  const espalda = cual === 'espalda';
  const L = m['largo-falda'], AC = m['altura-cadera'];
  const A = P(0, 0), B = P(0, L), D = P(0, AC), E = P(ancho, AC), Fp = P(ancho, L);
  const A1 = espalda ? P(0, F.bajadaEspalda) : A;
  const G = P(cintura, -F.subidaCostado);
  const control = P(ancho, G.y + (E.y - G.y) * 0.4);
  const mg = F.margen;

  // Pinza en el medio de la cintura
  const enCintura = (x) => P(x, A1.y + (G.y - A1.y) * (x / cintura));
  const xp = cintura / 2;
  const hayPinza = pinza >= 0.5;
  const largoPinza = F.largoPinza[cual];

  const elementos = [
    { paso: 0, tipo: 'linea', p: [A, B] },
    { paso: 0, tipo: 'punto', p: [A], nombre: 'A' }, { paso: 0, tipo: 'punto', p: [B], nombre: 'B' },
    { paso: 1, tipo: 'linea', p: [D, E] },
    { paso: 1, tipo: 'punto', p: [D], nombre: 'D' }, { paso: 1, tipo: 'punto', p: [E], nombre: 'E', der: true },
    { paso: 2, tipo: 'linea', p: [B, Fp] }, { paso: 2, tipo: 'linea', p: [E, Fp] },
    { paso: 2, tipo: 'punto', p: [Fp], nombre: 'F', der: true },
    { paso: 3, tipo: 'linea', p: [A1, G] },
    { paso: 3, tipo: 'punto', p: [G], nombre: 'G', der: true },
    ...(espalda ? [{ paso: 3, tipo: 'punto', p: [A1], nombre: 'A1' }] : []),
    { paso: 4, tipo: 'curva', p: [G, control, E] },
    ...(hayPinza ? [{ paso: 5, tipo: 'pinza', p: [enCintura(xp - pinza / 2), P(xp, enCintura(xp).y + largoPinza), enCintura(xp + pinza / 2)] }] : []),
  ];

  const pasos = [
    `Traza una línea recta hacia abajo, de A a B, del largo de la falda: ${n(L)} cm. ${espalda ? 'Es el centro de la espalda, donde va el cierre.' : 'Es el centro del delantero: irá al doblez de la tela.'}`,
    `Desde A, baja ${n(AC)} cm (altura de cadera) y marca D. Desde D, traza hacia la derecha D–E = cadera ÷ 4 + ${n(F.holguraCadera)} = ${n(ancho)} cm.`,
    `Desde B, traza hacia la derecha B–F = ${n(ancho)} cm. Une E con F con una línea recta: es el costado.`,
    `${espalda ? `Baja ${n(F.bajadaEspalda)} cm desde A y marca A1. Desde A1` : 'Desde A'}, mide hacia la derecha cintura ÷ 4 + pinza = ${n(cintura)} cm, sube ${n(F.subidaCostado)} cm y marca G. Une ${espalda ? 'A1' : 'A'} con G: es la cintura.`,
    'Une G con E con una curva suave hacia afuera: es la curva de la cadera.',
    hayPinza
      ? `Pinza: en el medio de la cintura marca ${n(pinza)} cm de ancho y baja ${n(largoPinza)} cm por el centro. Une las puntas con la parte de abajo.`
      : 'Con estas medidas no hace falta pinza: la cintura y la cadera son casi iguales.',
    `Agrega el margen de costura: ${n(mg.cintura)} cm en la cintura, ${n(mg.costado)} cm en el costado y ${n(mg.ruedo)} cm en el ruedo. ${espalda ? `En el centro de la espalda, ${n(mg.centroEspalda)} cm para el cierre.` : 'El doblez no lleva margen.'} Recorta por la línea de afuera.`,
  ];

  return {
    nombre: espalda ? 'Espalda' : 'Delantero',
    cortar: espalda ? 'Cortar 2' : 'Cortar 1 al doblez',
    alDoblez: !espalda,
    centro: espalda ? 'CENTRO ESPALDA · CIERRE' : 'DOBLEZ',
    elementos,
    pasos,
    contorno: [
      { a: A1, b: G, margen: mg.cintura },
      { a: G, c: control, b: E, margen: mg.costado },
      { a: E, b: Fp, margen: mg.costado },
      { a: Fp, b: B, margen: mg.ruedo },
      { a: B, b: A1, margen: espalda ? mg.centroEspalda : 0 },
    ],
    rotulo: P(ancho / 2, AC + (L - AC) * 0.3),
    hilo: [P(ancho * 0.75, AC + 4), P(ancho * 0.75, L - 6)],
  };
}
