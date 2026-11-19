// Molde: polera de varón (cuerpo recto). Guía «Confección de ropa deportiva» del CEA, puntos A–K:
// A–B largo, A–C y B–D cuarto de pecho, A–H escote de espalda, A–I alto de escote, I–K escote delantero,
// A–E ancho de espalda, E–J caída de hombro, C–F sisa, curva J–F entrando medio cm.
// Las medidas de la tabla de la guía salen de las tuyas con las reglas de FORMULAS
// (cuaderno del taller: tórax ÷ 4 + 1, sisa = tórax ÷ 4, cuello ÷ 6, ancho de espalda ÷ 2).
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';
import { r1, MARGEN, sisaCurva, largoSisa, escoteEspalda, escoteDelantero, piezaCuerpo, manga, tiraCuello } from './polera-comun.js';

export const FORMULAS = {
  holguraPecho: 1,       // cuarto de pecho = pecho ÷ 4 + 1
  escoteExtra: 1,        // ancho de escote = cuello ÷ 6 + 1 (en la tabla: 7,5 a 8,5 en adultos)
  hombroExtra: 1.5,      // ancho de espalda ÷ 2 + 1,5 (en la tabla: S 21, M 22,5, L 24)
  entrarSisa: 0.5,       // la curva de la sisa entra medio cm
  brazoExtra: 3,         // boca de manga (mitad) = brazo ÷ 2 + 3
  caida: 7.5,            // caída de hombro = cuarto de pecho ÷ 7,5 (tabla: 2,3 en talla 8 … 4 en XL)
};
// Hondo de sisa: pecho ÷ 4 + 0,5; en niños la sisa es más honda: pecho ÷ 8 + 11,5 (se usa la mayor).
// Copa de manga: hondo de sisa ÷ 2 − 4,5. Con estas reglas sale la tabla de la guía (talla 8 a XXL) con 1 cm o menos de diferencia.
const hondoSisa = (pecho) => Math.max(pecho / 4, pecho / 8 + 11) + 0.5;
const copaDe = (sisa) => sisa / 2 - 4.5;
const F = FORMULAS;

function medidasGuia(m) {
  const cuarto = m.pecho / 4 + F.holguraPecho;
  const escote = m.cuello / 6 + F.escoteExtra;
  const sisa = hondoSisa(m.pecho);
  return {
    L: m['largo-polera'], cuarto, escote, altoEscote: escote / 5, sisa,
    formulaSisa: m.pecho / 8 + 11 > m.pecho / 4 ? 'pecho ÷ 8 + 11,5 (talla de niño)' : 'pecho ÷ 4 + 0,5',
    espalda: Math.min(m['ancho-espalda'] / 2 + F.hombroExtra, cuarto - 2),
    caida: cuarto / F.caida,
  };
}

function pieza(g, cual) {
  const del = cual === 'delantero';
  const { L, cuarto, escote, altoEscote, sisa, espalda, caida, formulaSisa } = g;
  const A = P(0, 0), B = P(0, L), C = P(cuarto, 0), D = P(cuarto, L);
  const H = P(escote, 0), I = P(0, altoEscote), K = P(0, altoEscote + escote);
  const E = P(espalda, 0), J = P(espalda, caida), Fp = P(cuarto, sisa), G = P(0, sisa);
  const curvaEscote = del ? escoteDelantero(K, H) : escoteEspalda(I, H);
  const curvaSisa = sisaCurva(J, Fp, espalda - F.entrarSisa);
  const centro = del ? K : I;

  const elementos = [
    { paso: 0, tipo: 'linea', p: [A, B] }, { paso: 0, tipo: 'punto', p: [A], nombre: 'A' }, { paso: 0, tipo: 'punto', p: [B], nombre: 'B' },
    { paso: 1, tipo: 'linea', p: [A, C], puntos: true }, { paso: 1, tipo: 'linea', p: [B, D] }, { paso: 1, tipo: 'linea', p: [C, Fp], puntos: true },
    { paso: 1, tipo: 'punto', p: [C], nombre: 'C', der: true }, { paso: 1, tipo: 'punto', p: [D], nombre: 'D', der: true },
    { paso: 2, tipo: 'curva', p: Object.values(curvaEscote) },
    { paso: 2, tipo: 'punto', p: [H], nombre: 'H', der: true }, { paso: 2, tipo: 'punto', p: [I], nombre: 'I', der: true },
    ...(del ? [{ paso: 2, tipo: 'punto', p: [K], nombre: 'K' }] : []),
    { paso: 3, tipo: 'linea', p: [E, P(espalda, sisa)], puntos: true }, { paso: 3, tipo: 'linea', p: [H, J] },
    { paso: 3, tipo: 'punto', p: [E], nombre: 'E', der: true }, { paso: 3, tipo: 'punto', p: [J], nombre: 'J', der: true },
    { paso: 4, tipo: 'linea', p: [G, Fp], puntos: true },
    ...curvaSisa.map((t) => ({ paso: 4, tipo: 'curva', p: [t.a, t.c, t.b] })),
    { paso: 4, tipo: 'linea', p: [Fp, D] },
    { paso: 4, tipo: 'punto', p: [Fp], nombre: 'F', der: true }, { paso: 4, tipo: 'punto', p: [G], nombre: 'G' },
  ];
  const pasos = [
    `Traza un ángulo recto en A. De A baja el largo de la polera: ${n(r1(L))} cm (punto B). Es el centro ${del ? 'del delantero' : 'de la espalda'}: va al doblez de la tela.`,
    `De A y de B mide hacia la derecha el cuarto de pecho: pecho ÷ 4 + ${n(F.holguraPecho)} = ${n(r1(cuarto))} cm (puntos C y D). Une B con D.`,
    del
      ? `Escote delantero: de A mide ${n(r1(escote))} cm a la derecha (punto H). Por el centro baja ${n(r1(altoEscote))} cm (punto I) y ${n(r1(escote))} cm más (punto K). Une K con H con una curva redonda.`
      : `Escote de espalda: de A mide cuello ÷ 6 + ${n(F.escoteExtra)} = ${n(r1(escote))} cm a la derecha (punto H). Por el centro baja ${n(r1(altoEscote))} cm (punto I). Une I con H con una curva suave.`,
    `Hombro: de A mide ancho de espalda ÷ 2 + ${n(F.hombroExtra)} = ${n(r1(espalda))} cm (punto E) y escuadra hacia abajo. De E baja ${n(r1(caida))} cm de caída de hombro (punto J). Une H con J.`,
    `Sisa: de C baja el hondo de sisa, ${formulaSisa} = ${n(r1(sisa))} cm (punto F) y traza la línea de pecho hasta G. Une J con F con la regla curva, entrando ${n(F.entrarSisa)} cm en la línea de E. Une F con D: es el costado.`,
    `Agrega el margen: ${n(MARGEN.escote)} cm en el escote, ${n(MARGEN.hombro)} cm en hombro, sisa y costado, y ${n(MARGEN.ruedo)} cm en la basta. El centro va al doblez, sin margen.`,
  ];
  return {
    pieza: piezaCuerpo({ nombre: del ? 'Delantero' : 'Espalda', escote: { ...curvaEscote, a: centro }, hombro: { a: H, b: J }, sisa: curvaSisa, lado: [Fp, D], yR: L, elementos, pasos }),
    escote: curvaEscote, sisa: curvaSisa,
  };
}

export function construir(m) {
  const g = medidasGuia(m);
  const del = pieza(g, 'delantero'), esp = pieza(g, 'espalda');
  const sisa = (largoSisa(del.sisa) + largoSisa(esp.sisa)) / 2;
  const mangaCorta = manga({
    sisa, copa: copaDe(g.sisa), largo: m['largo-manga'], boca: m['contorno-brazo'] / 2 + F.brazoExtra,
    formulaCopa: 'hondo de sisa ÷ 2 − 4,5', formulaBoca: `brazo ÷ 2 + ${n(F.brazoExtra)}`,
  });
  const cuello = tiraCuello(esp.escote, del.escote);
  return {
    calculos: [
      { nombre: 'Cuarto de pecho', formula: `pecho ÷ 4 + ${n(F.holguraPecho)}`, valor: g.cuarto },
      { nombre: 'Escote (ancho)', formula: `cuello ÷ 6 + ${n(F.escoteExtra)}`, valor: g.escote },
      { nombre: 'Alto de escote (espalda)', formula: 'escote ÷ 5', valor: g.altoEscote },
      { nombre: 'Escote delantero (hondo)', formula: 'alto de escote + escote', valor: g.altoEscote + g.escote },
      { nombre: 'Ancho de espalda', formula: `ancho de espalda ÷ 2 + ${n(F.hombroExtra)}`, valor: g.espalda },
      { nombre: 'Caída de hombro', formula: `cuarto de pecho ÷ ${n(F.caida)}`, valor: g.caida },
      { nombre: 'Hondo de sisa', formula: 'pecho ÷ 4 + 0,5 (niños: pecho ÷ 8 + 11,5)', valor: g.sisa },
      { nombre: 'Sisa medida en el molde', formula: 'curva J–F', valor: sisa },
      { nombre: 'Copa de manga', formula: 'hondo de sisa ÷ 2 − 4,5', valor: mangaCorta.datos.copa },
      { nombre: 'Boca de manga (mitad)', formula: `brazo ÷ 2 + ${n(F.brazoExtra)}`, valor: mangaCorta.datos.boca },
      { nombre: 'Escote completo', formula: 'medido en el molde', valor: cuello.escote },
    ],
    piezas: [del.pieza, esp.pieza, mangaCorta],
    rectangulos: [cuello.rectangulo],
  };
}

