// Molde: falda de uniforme con tablones (rectángulo marcado directo en la tela + pretina)
// Cada tablón: [fondo 2f] [cara] [fondo 2f]. Se dobla cada línea continua hasta la punteada de afuera.
// ⚠️ PROVISIONAL: reemplazar FORMULAS por las del docente del CEA.
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

export const FORMULAS = {
  tablones: 8,           // cantidad de tablones en toda la falda
  fondo: 4,              // profundidad de cada lado del tablón (cm)
  holguraCadera: 4,      // cm que se suman al contorno de cadera
  holguraCintura: 2,     // cm que se suman al contorno de cintura
  margen: { cintura: 1, ruedo: 5, lado: 1.5 },
  pretina: { ancho: 3.5, cruce: 3, margen: 1 },
};

const F = FORMULAS;

export function construir(m) {
  const t = F.tablones, f = F.fondo;
  const L = m['largo-falda'], AC = m['altura-cadera'];
  const cara = (m.cadera + F.holguraCadera) / t;               // ancho visible de cada tablón en la cadera
  const caraCintura = (m.cintura + F.holguraCintura) / t;     // ancho visible en la cintura
  const entra = Math.max(0, (cara - caraCintura) / 2);        // cuánto se mete cada doblez en la cintura
  const unidad = cara + 4 * f;
  const W = t * unidad;
  const pretina = { largo: m.cintura + F.pretina.cruce + 2 * F.pretina.margen, alto: 2 * F.pretina.ancho + 2 * F.pretina.margen };

  const A = P(0, 0), B = P(W, 0), C = P(0, L), D = P(W, L), E = P(0, AC), Fp = P(W, AC);
  const elementos = [
    { paso: 0, tipo: 'linea', p: [A, B] }, { paso: 0, tipo: 'linea', p: [B, D] },
    { paso: 0, tipo: 'linea', p: [D, C] }, { paso: 0, tipo: 'linea', p: [C, A] },
    { paso: 0, tipo: 'punto', p: [A], nombre: 'A' }, { paso: 0, tipo: 'punto', p: [B], nombre: 'B', der: true },
    { paso: 0, tipo: 'punto', p: [C], nombre: 'C' }, { paso: 0, tipo: 'punto', p: [D], nombre: 'D', der: true },
    { paso: 1, tipo: 'linea', p: [E, Fp], puntos: true },
    { paso: 1, tipo: 'punto', p: [E], nombre: 'E' }, { paso: 1, tipo: 'punto', p: [Fp], nombre: 'F', der: true },
  ];
  for (let i = 0; i < t; i++) {
    const u = i * unidad, d1 = u + 2 * f, d2 = d1 + cara;
    if (i > 0) elementos.push({ paso: 2, tipo: 'linea', p: [P(u, 0), P(u, L)], puntos: true });
    elementos.push(
      { paso: 2, tipo: 'linea', p: [P(d1, AC), P(d1, L)] }, { paso: 2, tipo: 'linea', p: [P(d2, AC), P(d2, L)] },
      { paso: 2, tipo: 'texto', p: [P((d1 + d2) / 2, AC + (L - AC) / 2)], texto: String(i + 1), tam: 3 },
      { paso: 3, tipo: 'linea', p: [P(d1 + entra, 0), P(d1, AC)] }, { paso: 3, tipo: 'linea', p: [P(d2 - entra, 0), P(d2, AC)] },
    );
  }

  const mg = F.margen;
  return {
    calculos: [
      { nombre: 'Cara del tablón en la cadera', formula: `(cadera + ${n(F.holguraCadera)}) ÷ ${t}`, valor: cara },
      { nombre: 'Cara del tablón en la cintura', formula: `(cintura + ${n(F.holguraCintura)}) ÷ ${t}`, valor: caraCintura },
      { nombre: 'Fondo de cada lado', formula: 'medida fija del taller', valor: f },
      { nombre: 'Cada tablón en la tela', formula: `cara + 4 × fondo`, valor: unidad },
      { nombre: 'Ancho del rectángulo', formula: `${t} tablones × ${n(unidad)}`, valor: W },
      { nombre: 'Largo', formula: 'tu medida', valor: L },
    ],
    piezas: [{
      nombre: 'Falda', cortar: 'Cortar 1 (o en paneles)', alDoblez: false, paneles: true,
      imprimir: false, escala: 2.5, verAncho: 1100,
      elementos,
      pasos: [
        `Marca un rectángulo A–B–D–C de ${n(W)} cm de ancho por ${n(L)} cm de largo (sin margen). A–B es la cintura y C–D el ruedo. Si tu tela no alcanza, en «Tela» verás en cuántos paneles cortarla.`,
        `Desde A, baja ${n(AC)} cm y marca la línea de cadera E–F.`,
        `Marca ${t} tablones de ${n(unidad)} cm. En cada uno: ${n(2 * f)} cm, línea continua, ${n(cara)} cm de cara, línea continua y otros ${n(2 * f)} cm. Entre tablón y tablón queda una línea punteada.`,
        entra > 0
          ? `Para ajustar a la cintura: arriba, mete cada línea continua ${n(entra)} cm hacia el centro del tablón y únela con la línea de cadera.`
          : 'Tu cintura y tu cadera son casi iguales: no hace falta ajustar los tablones en la cintura.',
        'Dobla cada línea continua hasta la línea punteada de afuera (los dobleces se encuentran por detrás). Hilvana arriba, cose desde la cintura hasta la línea de cadera y plancha.',
        `Agrega el margen: ${n(mg.cintura)} cm en la cintura, ${n(mg.ruedo)} cm en el ruedo y ${n(mg.lado)} cm a cada lado (ahí va la costura con el cierre). Corta por la línea de afuera.`,
      ],
      contorno: [
        { a: A, b: B, margen: mg.cintura }, { a: B, b: D, margen: mg.lado },
        { a: D, b: C, margen: mg.ruedo }, { a: C, b: A, margen: mg.lado },
      ],
      rotulo: P(W / 2, L - 6),
    }],
    rectangulos: [{ nombre: 'Pretina', cortar: 'Cortar 1', alDoblez: true, ...pretina,
      texto: `Rectángulo de ${n(pretina.largo)} × ${n(pretina.alto)} cm (ya incluye margen).` }],
  };
}
