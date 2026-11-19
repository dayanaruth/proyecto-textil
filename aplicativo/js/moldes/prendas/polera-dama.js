// Molde: polera de dama (entallada). Guía «Confección de ropa deportiva» del CEA, b) Polera de mujer:
// 1. Parte del patrón base de la espalda (el de la blusa).
// 2. Añadir 1 cm de holgura al hombro, busto, cintura y cadera.
// 3. Disminuir el hombro 1,5 cm del lado del cuello (I–P).  4. Bajar el escote de espalda 0,5 cm (J–Q).
// 5. Escote delantero: de Q baja lo mismo que mide Q–P, más 1 cm.  6. Cavar la sisa delantera 1 cm.
// La pinza de la blusa no se cose en la polera: su ancho (3 cm) queda en la cintura del costado.
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';
import { FORMULAS as BLUSA } from './blusa.js';
import { r1, MARGEN, sisaCurva, largoSisa, escoteEspalda, escoteDelantero, piezaCuerpo, manga, tiraCuello } from './polera-comun.js';

export const FORMULAS = {
  holgura: 1,            // en hombro, busto, cintura y cadera
  achicarHombro: 1.5,    // del lado del cuello: el escote queda más ancho
  bajarEscote: 0.5,      // escote de espalda
  escoteDelanteroExtra: 1,
  cavarSisa: 1,          // sisa delantera
  brazoExtra: 2,         // boca de manga (mitad) = brazo ÷ 2 + 2
};
const F = FORMULAS;

function base(m) {
  const c6 = m.cuello / 6;
  const busto = m.busto / 4 + F.holgura;
  const ys = m.busto / 8 + BLUSA.sisaExtra;
  const hombroX = m['ancho-espalda'] / 2 + BLUSA.hombroExtra.espalda + F.holgura;
  const R = P(hombroX, BLUSA.caidaHombro.espalda);
  const B = P(c6, 0);                                            // punto del cuello de la base
  const d = Math.hypot(R.x - B.x, R.y - B.y);
  const Pc = P(B.x + (R.x - B.x) * F.achicarHombro / d, B.y + (R.y - B.y) * F.achicarHombro / d);
  const yQ = BLUSA.escoteEspalda + F.bajarEscote;
  const QP = Math.hypot(Pc.x, Pc.y - yQ);
  const yW = BLUSA.escoteEspalda + m['talle-espalda'], yH = yW + m['altura-cadera'], yR = m['largo-polera'];
  const cintura = m.cintura / 4 + BLUSA.pinzaCintura + F.holgura;
  const cadera = m.cadera / 4 + F.holgura;
  return { c6, busto, ys, R, Pc, yQ, QP, yW, yH, yR, cintura: Math.min(cintura, Math.max(busto, cadera)), cadera };
}

// Costado: sisa → cintura → cadera → basta (si la polera es corta, termina antes)
function costado(b) {
  const U = P(b.busto, b.ys), V = P(b.cintura, b.yW), W = P(b.cadera, b.yH);
  const entre = (p, q, y) => P(p.x + (q.x - p.x) * ((y - p.y) / (q.y - p.y)), y);
  if (b.yR <= b.yW) return [U, entre(U, V, b.yR)];
  if (b.yR <= b.yH) return [U, V, entre(V, W, b.yR)];
  return [U, V, W, P(W.x, b.yR)];
}

function pieza(m, b, cual) {
  const del = cual === 'delantero';
  const A = P(0, 0), Bc = P(0, b.yR);
  const Q = P(0, b.yQ), D = P(0, b.yQ + b.QP + F.escoteDelanteroExtra);
  const centro = del ? D : Q;
  const curvaEscote = del ? escoteDelantero(D, b.Pc) : escoteEspalda(Q, b.Pc);
  const lado = costado(b);
  const U = lado[0];
  const linea = m['ancho-espalda'] / 2 + F.holgura - (del ? F.cavarSisa : 0);
  const curvaSisa = sisaCurva(b.R, U, linea);
  const nombres = ['U', 'V', 'W', 'X'];

  const elementos = [
    { paso: 0, tipo: 'linea', p: [A, Bc] }, { paso: 0, tipo: 'punto', p: [A], nombre: 'A' }, { paso: 0, tipo: 'punto', p: [Bc], nombre: 'B' },
    { paso: 1, tipo: 'curva', p: Object.values(curvaEscote) },
    { paso: 1, tipo: 'punto', p: [b.Pc], nombre: 'P', der: true }, { paso: 1, tipo: 'punto', p: [centro], nombre: del ? 'D' : 'Q' },
    { paso: 2, tipo: 'linea', p: [b.Pc, b.R] }, { paso: 2, tipo: 'punto', p: [b.R], nombre: 'R', der: true },
    { paso: 3, tipo: 'linea', p: [P(0, b.ys), U], puntos: true },
    ...curvaSisa.map((t) => ({ paso: 3, tipo: 'curva', p: [t.a, t.c, t.b] })),
    { paso: 3, tipo: 'punto', p: [U], nombre: 'U', der: true },
    ...lado.slice(1).map((q, i) => ({ paso: 4, tipo: 'linea', p: [lado[i], q] })),
    ...lado.slice(1).map((q, i) => ({ paso: 4, tipo: 'punto', p: [q], nombre: nombres[i + 1], der: true })),
    { paso: 4, tipo: 'linea', p: [lado.at(-1), Bc] },
  ];
  const pasos = [
    `Traza un ángulo recto en A. De A baja el largo de la polera: ${n(r1(b.yR))} cm (punto B). Es el centro ${del ? 'del delantero' : 'de la espalda'}: va al doblez.`,
    del
      ? `Escote: marca P igual que en la espalda (${n(r1(b.Pc.x))} cm del centro). Por el centro baja hasta Q (${n(r1(b.yQ))} cm) y desde Q baja lo que mide Q–P (${n(r1(b.QP))} cm) más ${n(F.escoteDelanteroExtra)} cm: punto D. Une D con P con una curva redonda.`
      : `Escote: de A mide cuello ÷ 6 = ${n(r1(b.c6))} cm y sigue ${n(F.achicarHombro)} cm más sobre la línea del hombro (punto P: el hombro se achica). Por el centro baja ${n(BLUSA.escoteEspalda)} + ${n(F.bajarEscote)} = ${n(r1(b.yQ))} cm (punto Q). Une Q con P con una curva suave.`,
    `Hombro: de A mide ancho de espalda ÷ 2 + ${n(BLUSA.hombroExtra.espalda)} + ${n(F.holgura)} de holgura = ${n(r1(b.R.x))} cm y baja ${n(BLUSA.caidaHombro.espalda)} cm (punto R). Une P con R.`,
    `Sisa: baja busto ÷ 8 + ${n(BLUSA.sisaExtra)} = ${n(r1(b.ys))} cm y mide busto ÷ 4 + ${n(F.holgura)} = ${n(r1(b.busto))} cm (punto U). Une R con U con la regla curva${del ? `, cavando ${n(F.cavarSisa)} cm más que en la espalda (sisa delantera)` : ''}.`,
    `Costado: baja el talle de espalda y mide cintura ÷ 4 + ${n(BLUSA.pinzaCintura + F.holgura)} = ${n(r1(b.cintura))} cm (punto V: la pinza de la blusa no se cose, queda como holgura). ${n(r1(m['altura-cadera']))} cm más abajo mide cadera ÷ 4 + ${n(F.holgura)} = ${n(r1(b.cadera))} cm (punto W). Une U, V y W y baja hasta la basta.`,
    `Agrega el margen: ${n(MARGEN.escote)} cm en el escote, ${n(MARGEN.hombro)} cm en hombro, sisa y costado, y ${n(MARGEN.ruedo)} cm en la basta. El centro va al doblez, sin margen.`,
  ];
  return {
    pieza: piezaCuerpo({ nombre: del ? 'Delantero' : 'Espalda', escote: curvaEscote, hombro: { a: b.Pc, b: b.R }, sisa: curvaSisa, lado, yR: b.yR, elementos, pasos }),
    escote: curvaEscote, sisa: curvaSisa,
  };
}

export function construir(m) {
  const b = base(m);
  const del = pieza(m, b, 'delantero'), esp = pieza(m, b, 'espalda');
  const sisa = (largoSisa(del.sisa) + largoSisa(esp.sisa)) / 2;
  const mangaCorta = manga({
    sisa, copa: b.ys / 2, largo: m['largo-manga'], boca: m['contorno-brazo'] / 2 + F.brazoExtra,
    formulaCopa: 'hondo de sisa ÷ 2', formulaBoca: `brazo ÷ 2 + ${n(F.brazoExtra)}`,
  });
  const cuello = tiraCuello(esp.escote, del.escote);
  return {
    calculos: [
      { nombre: 'Ancho en el busto', formula: `busto ÷ 4 + ${n(F.holgura)}`, valor: b.busto },
      { nombre: 'Hondo de sisa', formula: `busto ÷ 8 + ${n(BLUSA.sisaExtra)}`, valor: b.ys },
      { nombre: 'Ancho en la cintura', formula: `cintura ÷ 4 + ${n(BLUSA.pinzaCintura + F.holgura)}`, valor: b.cintura },
      { nombre: 'Ancho en la cadera', formula: `cadera ÷ 4 + ${n(F.holgura)}`, valor: b.cadera },
      { nombre: 'Escote (ancho)', formula: `cuello ÷ 6 + ${n(F.achicarHombro)} sobre el hombro`, valor: b.Pc.x },
      { nombre: 'Escote delantero (hondo)', formula: 'Q–P + 1, desde Q', valor: b.yQ + b.QP + F.escoteDelanteroExtra },
      { nombre: 'Sisa medida en el molde', formula: 'curva R–U', valor: sisa },
      { nombre: 'Copa de manga', formula: 'hondo de sisa ÷ 2', valor: mangaCorta.datos.copa },
      { nombre: 'Boca de manga (mitad)', formula: `brazo ÷ 2 + ${n(F.brazoExtra)}`, valor: mangaCorta.datos.boca },
      { nombre: 'Escote completo', formula: 'medido en el molde', valor: cuello.escote },
    ],
    piezas: [del.pieza, esp.pieza, mangaCorta],
    rectangulos: [cuello.rectangulo],
  };
}
