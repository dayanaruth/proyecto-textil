// Polera (tejido de punto): delantero y espalda al doblez, manga corta y tira de cuello.
// Método de la guía «Confección de ropa deportiva» del CEA y del cuaderno del taller.
// Lo que comparten la polera de varón y la de dama: sisa, manga, tira de cuello y armado de piezas.
import { punto as P, largoTramo } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

export const r1 = (v) => Math.round(v * 10) / 10;

// Márgenes: la polera se cose con remalle (costuras angostas)
export const MARGEN = { escote: 0.7, hombro: 1, sisa: 1, costado: 1, ruedo: 2.5, manga: 2.5 };

// Sisa: de la punta del hombro J a la línea de pecho F, «entrando» hasta la línea xLinea
// (guía: entrar medio cm en la línea del ancho de espalda). Son dos curvas seguidas.
export function sisaCurva(J, F, xLinea) {
  const M = P(Math.min(xLinea, F.x - 1), J.y + (F.y - J.y) * 0.6);
  return [{ a: J, c: P(M.x, (J.y + M.y) / 2), b: M }, { a: M, c: P(M.x, F.y), b: F }];
}
export const largoSisa = (sisa) => sisa.reduce((s, t) => s + largoTramo(t), 0);

// Escotes: atrás casi plano, adelante redondo y más hondo
export const escoteEspalda = (centro, cuello) => ({ a: centro, c: P(cuello.x * 0.7, centro.y), b: cuello });
export const escoteDelantero = (centro, cuello) =>
  ({ a: centro, c: P(cuello.x * 0.55, centro.y), c2: P(cuello.x, cuello.y + (centro.y - cuello.y) * 0.45), b: cuello });

// Arma una pieza del cuerpo (al doblez) a partir de sus partes
export function piezaCuerpo({ nombre, escote, hombro, sisa, lado, yR, elementos, pasos }) {
  const centro = escote.a, X = lado.at(-1), R0 = P(0, yR);
  const U = sisa.at(-1).b;
  // El nombre va arriba al centro y la flecha del hilo debajo (no choca con DOBLEZ ni con las letras del costado)
  const rotulo = P(U.x * 0.55, U.y + (yR - U.y) * 0.3);
  return {
    nombre, cortar: 'Cortar 1 al doblez', alDoblez: true, centro: 'DOBLEZ',
    elementos, pasos,
    contorno: [
      { ...escote, margen: MARGEN.escote },
      { a: hombro.a, b: hombro.b, margen: MARGEN.hombro },
      ...sisa.map((t) => ({ ...t, margen: MARGEN.sisa })),
      ...lado.slice(1).map((q, i) => ({ a: lado[i], b: q, margen: MARGEN.costado })),
      { a: X, b: R0, margen: MARGEN.ruedo },
      { a: R0, b: centro, margen: 0 },
    ],
    rotulo,
    hilo: [P(U.x * 0.6, rotulo.y + 6), P(U.x * 0.6, Math.max(rotulo.y + 12, yR - 5))],
  };
}

// Manga de la guía: A–B largo, A–C copa, diagonal A–D = sisa del cuerpo, B–E boca de manga.
// La copa: la diagonal se divide en 3; la curva cruza en G (1/3) y sale hacia afuera cerca de A (F).
// Se dibuja la manga entera (la guía la traza a la mitad en papel doble).
export function manga({ sisa, copa, largo, boca, formulaCopa, formulaBoca }) {
  const h = Math.min(copa, sisa - 3);
  const w = Math.sqrt(sisa ** 2 - h ** 2);
  const bo = Math.min(boca, w - 0.5);
  const A = P(0, 0), C = P(0, h), B = P(0, largo);
  const D = P(-w, h), D2 = P(w, h), E = P(-bo, largo), E2 = P(bo, largo);
  // Curva de la copa (mitad izquierda): cruza la diagonal en 1/3 y llega a A sin pico
  const len = Math.hypot(w, h);
  const nx = -h / len, ny = -w / len;                       // hacia afuera de la manga
  const o2 = (h * len) / (3 * w), o1 = -o2 / 2;
  const sobre = (t, o) => P(D.x + w * t + nx * o, D.y - h * t + ny * o);
  const copaIzq = { a: D, c: sobre(1 / 3, o1), c2: sobre(2 / 3, o2), b: A };
  const espejo = (q) => P(-q.x, q.y);
  const copaDer = { a: A, c: espejo(copaIzq.c2), c2: espejo(copaIzq.c), b: D2 };
  const G = sobre(1 / 3, 0), Fs = sobre(2 / 3, o2 / 3);     // F: la copa sale ~1/3 de o2 en ese punto
  const costado = (de, a, signo) => ({ a: de, c: P((de.x + a.x) / 2 + signo * 0.6, (de.y + a.y) / 2), b: a });
  const izq = costado(E, D, 1), der = costado(D2, E2, -1);
  return {
    nombre: 'Manga', cortar: 'Cortar 2', alDoblez: false,
    elementos: [
      { paso: 0, tipo: 'linea', p: [A, B] }, { paso: 0, tipo: 'punto', p: [A], nombre: 'A' },
      { paso: 0, tipo: 'punto', p: [C], nombre: 'C' }, { paso: 0, tipo: 'punto', p: [B], nombre: 'B' },
      { paso: 0, tipo: 'linea', p: [D, D2], puntos: true },
      { paso: 1, tipo: 'linea', p: [A, D], puntos: true }, { paso: 1, tipo: 'linea', p: [A, D2], puntos: true },
      { paso: 1, tipo: 'punto', p: [D], nombre: 'D' }, { paso: 1, tipo: 'punto', p: [D2], nombre: 'D', der: true },
      { paso: 2, tipo: 'linea', p: [E, E2] },
      { paso: 2, tipo: 'curva', p: [izq.a, izq.c, izq.b] }, { paso: 2, tipo: 'curva', p: [der.a, der.c, der.b] },
      { paso: 2, tipo: 'punto', p: [E], nombre: 'E' }, { paso: 2, tipo: 'punto', p: [E2], nombre: 'E', der: true },
      { paso: 3, tipo: 'curva', p: [copaIzq.a, copaIzq.c, copaIzq.c2, copaIzq.b] },
      { paso: 3, tipo: 'curva', p: [copaDer.a, copaDer.c, copaDer.c2, copaDer.b] },
      { paso: 3, tipo: 'punto', p: [G], nombre: 'G' }, { paso: 3, tipo: 'punto', p: [Fs], nombre: 'F' },
    ],
    pasos: [
      `Traza la línea del centro: de A a B el largo de manga (${n(r1(largo))} cm). De A a C la copa: ${formulaCopa} = ${n(r1(h))} cm. Escuadra en C y en B (líneas a los dos lados).`,
      `De A a D mide en diagonal la sisa del cuerpo (${n(r1(sisa))} cm): pon la cinta en A y gírala hasta tocar la línea de C. Haz lo mismo al otro lado. Así D–D mide ${n(r1(2 * w))} cm.`,
      `Boca de manga: de B mide ${formulaBoca} = ${n(r1(bo))} cm a cada lado (puntos E). Une D con E con una curva leve.`,
      'Copa: divide la diagonal A–D en 3 partes. Cerca de D la curva entra un poquito y cruza la diagonal en G; cerca de A sale hacia afuera (F) y llega a A plana. Igual al otro lado.',
      `Agrega el margen: ${n(MARGEN.sisa)} cm en la copa, ${n(MARGEN.costado)} en los costados y ${n(MARGEN.manga)} en la basta.`,
    ],
    contorno: [
      { ...izq, margen: MARGEN.costado }, { ...copaIzq, margen: MARGEN.sisa }, { ...copaDer, margen: MARGEN.sisa },
      { ...der, margen: MARGEN.costado }, { a: E2, b: E, margen: MARGEN.manga },
    ],
    rotulo: P(-w * 0.45, h + (largo - h) * 0.45),
    hilo: [P(w * 0.45, h + 2), P(w * 0.45, Math.max(h + 6, largo - 3))],
    datos: { copa: h, ancho: 2 * w, boca: bo },
  };
}

// Tira de cuello: escote completo × 0,9 (el tejido de punto se estira), doblada a lo largo
export function tiraCuello(escoteEsp, escoteDel) {
  const escote = 2 * (largoTramo(escoteEsp) + largoTramo(escoteDel));
  const largo = escote * 0.9 + 2, alto = 2 * 2.5 + 2 * MARGEN.escote;
  return {
    escote,
    rectangulo: {
      nombre: 'Tira de cuello', cortar: 'Cortar 1', alDoblez: false, largo, alto,
      texto: `Rectángulo de ${n(r1(largo))} × ${n(r1(alto))} cm, mejor en tela rib (ya incluye margen). Es el escote (${n(r1(escote))} cm) × 0,9 para que quede pegado al cuello. Se dobla a lo largo.`,
    },
  };
}
