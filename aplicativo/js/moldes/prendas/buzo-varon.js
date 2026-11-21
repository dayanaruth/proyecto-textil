// Molde: buzo deportivo de varón (pantalón con elástico). Guía «Confección de ropa deportiva» del CEA,
// b) Patronaje de buzos de varón. La tabla de la guía «tiene costuras y holgura de 4 cm».
// Delantero: A–B largo, A–C tiro, A–D cintura, C–E cadera, E–F extensión de tiro, G al centro de C y F,
//   H–I y H–J mitad de bota, I–C recta, J–F curva (línea auxiliar EJ).
// Trasero: D–K 6 cm, E–K prolongado, K–M sube 5 cm, F–L = E–F, M–N cintura del delantero + 4,
//   I–O y J–P salen 2 cm, O–N recta, P–L curva.
// Las medidas de la tabla salen de las tuyas con FORMULAS (calculadas con la misma tabla).
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

const r1 = (v) => Math.round(v * 10) / 10;

export const FORMULAS = {
  holguraCadera: 4,      // cadera (cuarto) = cadera ÷ 4 + 4 (tabla: S 27,5 · M 28,5 · L 30 · XL 31)
  holguraTiro: 4,        // tiro de la tabla = tu tiro + 4
  cinturaMenos: 1,       // cintura = cadera − 1 (lleva elástico: debe pasar por la cadera)
  extension: 6,          // extensión de tiro = cadera ÷ 6 (tabla: 3,5 … 5,5)
  auxiliar: 3.5,         // línea auxiliar de entrepierna = extensión ÷ 3,5 (tabla: 0,7 … 1,7)
  salir: 2,              // el trasero sale 2 cm en rodilla y bota
  elastico: 4,           // ancho del elástico: se dobla el doble arriba
  basta: 3,              // doblez de la basta
};
const F = FORMULAS;
const X = (d, y) => P(-d, y);   // d: distancia desde el costado (A) hacia el centro

function tabla(m) {
  const cadera = m.cadera / 4 + F.holguraCadera;
  const ext = cadera / F.extension;
  return {
    largo: m['largo-pantalon'], tiro: m.tiro + F.holguraTiro, cadera, ext,
    cintura: cadera - F.cinturaMenos, bota: m.bota / 2 - F.salir, ej: ext / F.auxiliar,
    // Trasero (la guía da los valores de talla L y talla 10; salen proporcionales a la cadera)
    k: cadera / 5, subir: cadera / 6, masCintura: cadera / 7.5,
  };
}

// Curva del tiro: recta desde la cintura y redonda al llegar a la extensión (regla curva)
function curvaTiro(arriba, esquina, punta, ext) {
  const t = Math.min(0.85, (1.5 * ext) / Math.hypot(esquina.x - arriba.x, esquina.y - arriba.y));
  const Q = P(esquina.x + (arriba.x - esquina.x) * t, esquina.y + (arriba.y - esquina.y) * t);
  return { Q, curva: { a: punta, c: esquina, b: Q } };
}
// Entrepierna: curva leve que entra hacia la línea del hilo (profundidad = línea auxiliar)
function curvaEntrepierna(abajo, punta, hondo, xHilo) {
  const mx = (abajo.x + punta.x) / 2, my = (abajo.y + punta.y) / 2;
  const dx = punta.x - abajo.x, dy = punta.y - abajo.y, l = Math.hypot(dx, dy);
  let nx = -dy / l, ny = dx / l;
  if ((xHilo - mx) * nx < 0) { nx = -nx; ny = -ny; }
  return { a: abajo, c: P(mx + nx * 2 * hondo, my + ny * 2 * hondo), b: punta };
}

function delantero(t) {
  const A = X(0, 0), B = X(0, t.largo), C = X(0, t.tiro), D = X(t.cintura, 0), E = X(t.cadera, t.tiro);
  const Fp = X(t.cadera + t.ext, t.tiro), G = X((t.cadera + t.ext) / 2, t.tiro), H = P(G.x, t.largo);
  const I = P(H.x + t.bota / 2, t.largo), J = P(H.x - t.bota / 2, t.largo);
  const { Q, curva } = curvaTiro(D, E, Fp, t.ext);
  const entre = curvaEntrepierna(J, Fp, t.ej, G.x);
  const guia = (y) => ({ tipo: 'linea', p: [P(Fp.x - 2, y), P(2, y)], puntos: true });
  return {
    puntos: { A, B, C, D, E, Fp, G, H, I, J, Q },
    pieza: {
      nombre: 'Delantero', cortar: 'Cortar 2', alDoblez: false,
      elementos: [
        { paso: 0, tipo: 'linea', p: [A, C] }, { ...guia(0), paso: 0 }, { ...guia(t.tiro), paso: 0 }, { ...guia(t.largo), paso: 0 },
        { paso: 0, tipo: 'punto', p: [A], nombre: 'A', der: true }, { paso: 0, tipo: 'punto', p: [C], nombre: 'C', der: true },
        { paso: 0, tipo: 'punto', p: [B], nombre: 'B', der: true },
        { paso: 1, tipo: 'linea', p: [A, D] },
        { paso: 1, tipo: 'punto', p: [D], nombre: 'D' }, { paso: 1, tipo: 'punto', p: [E], nombre: 'E' }, { paso: 1, tipo: 'punto', p: [Fp], nombre: 'F' },
        { paso: 2, tipo: 'linea', p: [D, Q] }, { paso: 2, tipo: 'curva', p: [Q, E, Fp] },
        { paso: 3, tipo: 'linea', p: [H, P(G.x, 0)], puntos: true },
        { paso: 3, tipo: 'punto', p: [G], nombre: 'G', der: true }, { paso: 3, tipo: 'punto', p: [H], nombre: 'H', der: true },
        { paso: 4, tipo: 'linea', p: [C, I] }, { paso: 4, tipo: 'linea', p: [I, J] },
        { paso: 4, tipo: 'curva', p: [entre.a, entre.c, entre.b] },
        { paso: 4, tipo: 'punto', p: [I], nombre: 'I', der: true }, { paso: 4, tipo: 'punto', p: [J], nombre: 'J' },
      ],
      pasos: [
        `Traza un ángulo recto en A. De A a B el largo total: ${n(r1(t.largo))} cm. De A a C el tiro: tu tiro + ${n(F.holguraTiro)} = ${n(r1(t.tiro))} cm. Escuadra en A, B y C (líneas hacia la izquierda).`,
        `De A a D la cintura: cadera − ${n(F.cinturaMenos)} = ${n(r1(t.cintura))} cm. De C a E la cadera: cadera ÷ 4 + ${n(F.holguraCadera)} = ${n(r1(t.cadera))} cm. De E a F la extensión de tiro: cadera ÷ ${F.extension} = ${n(r1(t.ext))} cm.`,
        'Curva del tiro: une D con F bajando recto y redondeando al llegar a F (regla curva).',
        `G está al centro de C y F (${n(r1((t.cadera + t.ext) / 2))} cm de C). De B a H la misma medida que de C a G. Une H con G con una recta hasta la cintura: es la línea del hilo.`,
        `Bota: de H a I y de H a J mide la mitad de la bota: ${n(r1(t.bota / 2))} cm a cada lado (bota de ${n(r1(t.bota))} cm). Une I con C (costado) y J con F con una curva que entra ${n(r1(t.ej))} cm (entrepierna).`,
        `Agrega ${n(2 * F.elastico)} cm arriba para doblar y meter el elástico de ${n(F.elastico)} cm, y ${n(F.basta)} cm abajo para la basta. Los costados no llevan margen: la medida ya incluye la costura.`,
      ],
      contorno: [
        { a: D, b: A, margen: 2 * F.elastico }, { a: A, b: C, margen: 0 }, { a: C, b: I, margen: 0 },
        { a: I, b: J, margen: F.basta }, { ...entre, margen: 0 }, { a: Fp, c: E, b: Q, margen: 0 }, { a: Q, b: D, margen: 0 },
      ],
      rotulo: P(G.x, t.tiro + (t.largo - t.tiro) * 0.3),
      hilo: [P(G.x + 3, t.tiro + (t.largo - t.tiro) * 0.4), P(G.x + 3, t.largo - 6)],
    },
  };
}

function trasero(t, f) {
  const { D, E, Fp, I, J, G } = f.puntos;
  const K = P(D.x + t.k, 0);
  const dl = Math.hypot(K.x - E.x, K.y - E.y);
  const M = P(K.x + (K.x - E.x) / dl * t.subir, K.y + (K.y - E.y) / dl * t.subir);
  const L = P(Fp.x - t.ext, t.tiro);
  const anchoCintura = t.cintura + t.masCintura;
  const N = P(M.x + Math.sqrt(Math.max(0, anchoCintura ** 2 - M.y ** 2)), 0);
  const O = P(I.x + F.salir, t.largo), Pp = P(J.x - F.salir, t.largo);
  const { Q, curva } = curvaTiro(M, E, L, 2 * t.ext);
  const entre = curvaEntrepierna(Pp, L, t.ej, G.x);
  const base = { tipo: 'linea', puntos: true };
  return {
    nombre: 'Trasero', cortar: 'Cortar 2', alDoblez: false,
    elementos: [
      { ...base, paso: 0, p: [P(L.x - 2, 0), P(N.x + 2, 0)] }, { ...base, paso: 0, p: [P(L.x - 2, t.tiro), P(N.x + 2, t.tiro)] },
      { ...base, paso: 0, p: [P(Pp.x - 2, t.largo), P(O.x + 2, t.largo)] },
      { ...base, paso: 0, p: [f.puntos.A, f.puntos.C] }, { ...base, paso: 0, p: [f.puntos.C, I] },
      { paso: 0, tipo: 'punto', p: [D], nombre: 'D' }, { paso: 0, tipo: 'punto', p: [E], nombre: 'E' }, { paso: 0, tipo: 'punto', p: [Fp], nombre: 'F' },
      { paso: 1, tipo: 'linea', p: [E, M] },
      { paso: 1, tipo: 'punto', p: [K], nombre: 'K', der: true }, { paso: 1, tipo: 'punto', p: [M], nombre: 'M' },
      { paso: 2, tipo: 'curva', p: [L, E, Q] }, { paso: 2, tipo: 'punto', p: [L], nombre: 'L' },
      { paso: 3, tipo: 'linea', p: [M, N] }, { paso: 3, tipo: 'punto', p: [N], nombre: 'N', der: true },
      { paso: 4, tipo: 'linea', p: [N, O] }, { paso: 4, tipo: 'linea', p: [O, Pp] },
      { paso: 4, tipo: 'curva', p: [entre.a, entre.c, entre.b] },
      { paso: 4, tipo: 'punto', p: [O], nombre: 'O', der: true }, { paso: 4, tipo: 'punto', p: [Pp], nombre: 'P' },
    ],
    pasos: [
      'Calca el delantero (puntos D, E y F, y las líneas de cintura, tiro y basta) y prolonga las líneas a los dos lados.',
      `De D a K camina ${n(r1(t.k))} cm hacia el costado. Une E con K y prolonga hacia arriba: de K a M sube ${n(r1(t.subir))} cm.`,
      `De F a L la misma medida que de E a F (${n(r1(t.ext))} cm). Haz la curva del tiro de L hasta la línea E–M.`,
      `De M a N la cintura del delantero + ${n(r1(t.masCintura))} = ${n(r1(anchoCintura))} cm, hasta la línea de cintura. Une M con N con una recta.`,
      `De I a O y de J a P sal ${n(F.salir)} cm a cada lado. Une O con N (costado) con una recta, y P con L con la regla curva (entrepierna).`,
      `Agrega ${n(2 * F.elastico)} cm arriba para el elástico y ${n(F.basta)} cm en la basta. Los costados ya incluyen la costura.`,
    ],
    contorno: [
      { a: M, b: N, margen: 2 * F.elastico }, { a: N, b: O, margen: 0 }, { a: O, b: Pp, margen: F.basta },
      { ...entre, margen: 0 }, { a: L, c: E, b: Q, margen: 0 }, { a: Q, b: M, margen: 0 },
    ],
    rotulo: P((G.x + O.x) / 2 - 2, t.tiro + (t.largo - t.tiro) * 0.3),
    hilo: [P(G.x + 4, t.tiro + (t.largo - t.tiro) * 0.4), P(G.x + 4, t.largo - 6)],
    datos: { K, M, N, L, anchoCintura },
  };
}

export function construir(m) {
  const largoElastico = m.cintura - 5;
  const t = tabla(m);
  const del = delantero(t);
  const tra = trasero(t, del);
  return {
    calculos: [
      { nombre: 'Tiro', formula: `tu tiro + ${n(F.holguraTiro)}`, valor: t.tiro },
      { nombre: 'Cadera (cuarto)', formula: `cadera ÷ 4 + ${n(F.holguraCadera)}`, valor: t.cadera },
      { nombre: 'Cintura (cuarto)', formula: `cadera − ${n(F.cinturaMenos)}`, valor: t.cintura },
      { nombre: 'Extensión de tiro', formula: `cadera ÷ ${F.extension}`, valor: t.ext },
      { nombre: 'Ancho de pierna', formula: 'cadera + extensión', valor: t.cadera + t.ext },
      { nombre: 'Bota (delantero)', formula: `bota ÷ 2 − ${n(F.salir)}`, valor: t.bota },
      { nombre: 'Línea auxiliar de entrepierna', formula: `extensión ÷ ${n(F.auxiliar)}`, valor: t.ej },
      { nombre: 'Trasero: D a K', formula: 'cadera ÷ 5', valor: t.k },
      { nombre: 'Trasero: K a M (subir)', formula: 'cadera ÷ 6', valor: t.subir },
      { nombre: 'Trasero: cintura', formula: 'cintura + cadera ÷ 7,5', valor: tra.datos.anchoCintura },
      { nombre: 'Largo del elástico', formula: 'tu cintura − 5', valor: largoElastico },
    ],
    piezas: [del.pieza, tra],
    rectangulos: [],
    elastico: largoElastico / 100,
  };
}
