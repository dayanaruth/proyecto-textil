// Molde: buzo deportivo de mujer (pantalón con elástico). Guía «Confección de ropa deportiva» del CEA,
// c) Patronaje de buzos de mujer. Las medidas de cintura y cadera son anatómicas (del cuerpo).
// Delantero: A–B largo, A–C tiro, A–D cintura a rodilla, C–E 8 cm (cadera), B–F 3 cm de doblez,
//   C–U mitad de cadera, U–H extensión − 1, J al medio de H y C, K–N y K–M mitad de bota,
//   V–X y V–W mitad de rodilla, A–R 8 cm para el elástico, A–G = C–U − 1, U–G prolongada hasta I.
// Trasero: H–U' = U–H, U'–V medio cm, G–O décima parte de la cadera, U–O prolongada,
//   P–Q sube 2,5 cm (3 en tallas grandes), Q–L = I–R del delantero + 4, L–S 1 cm,
//   rodilla y bota 2 cm más a cada lado.
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

const r1 = (v) => Math.round(v * 10) / 10;

export const FORMULAS = {
  cadera: 8,             // la línea de cadera está 8 cm arriba del tiro
  basta: 3,              // doblez de la basta
  elastico: 8,           // A–R: 8 cm arriba para un elástico de 4 cm
  extensionMenos: 1,     // U–H = extensión de tiro − 1
  centroMenos: 1,        // A–G = C–U − 1
  bajarTrasero: 0.5,     // U'–V
  subirTrasero: 2.5,     // P–Q (3 cm en tallas grandes)
  masCintura: 4,         // Q–L = I–R + 4
  costadoTrasero: 1,     // L–S
  salir: 2,              // rodilla y bota del trasero
  margen: 1,             // costura (las medidas son del cuerpo)
};
const F = FORMULAS;
const X = (d, y) => P(-d, y);   // d: distancia desde el costado hacia el centro

// Tabla de la guía (talla 36): cadera 47 (mitad), extensión 4,9, rodilla 24, bota 25
function tabla(m) {
  const CD = m.cadera / 2;
  const B = (m.bota - 2 * F.salir) / 2;    // bota de la tabla: delantero + trasero = tu bota
  return {
    T: m.tiro, LCR: m['altura-rodilla'], LCT: m['largo-pantalon'], CD,
    ET: CD / 10 + 0.2, B, R: B - 1,
    subir: CD >= 51 ? 3 : F.subirTrasero,
  };
}

// En la recta que pasa por p y q, el punto a la altura y
const enRecta = (p, q, y) => P(p.x + (q.x - p.x) * ((y - p.y) / (q.y - p.y)), y);
// Curva del fondillo: de la punta del tiro sube redondeando hasta la recta del centro
function fondillo(punta, U, arriba, largo) {
  const l = Math.hypot(arriba.x - U.x, arriba.y - U.y);
  const t = Math.min(0.8, largo / l);
  const Z = P(U.x + (arriba.x - U.x) * t, U.y + (arriba.y - U.y) * t);
  return { Z, curva: { a: punta, c: U, b: Z } };
}

function delantero(t) {
  const A = X(0, 0), R = X(0, -F.elastico), B = X(0, t.LCT), C = X(0, t.T), D = X(0, t.LCR), E = X(0, t.T - F.cadera);
  const U = X(t.CD / 2, t.T), H = X(t.CD / 2 + t.ET - F.extensionMenos, t.T);
  const J = X(-H.x / 2, t.T), K = P(J.x, t.LCT), V = P(J.x, t.LCR), Lp = P(J.x, -F.elastico);
  const N = P(K.x + t.B / 2, t.LCT), M = P(K.x - t.B / 2, t.LCT);
  const Xr = P(V.x + t.R / 2, t.LCR), W = P(V.x - t.R / 2, t.LCR);
  const G = X(t.CD / 2 - F.centroMenos, 0), I = enRecta(U, G, -F.elastico);
  const { Z, curva } = fondillo(H, U, I, 1.6 * t.ET);
  const entre = { a: W, c: P(W.x, t.T + (t.LCR - t.T) * 0.35), b: H };
  const guia = (y) => ({ tipo: 'linea', p: [P(H.x - 2, y), P(2, y)], puntos: true });
  const mg = F.margen;
  return {
    puntos: { U, H, G, I, R, Xr, W, N, M },
    pieza: {
      nombre: 'Delantero', cortar: 'Cortar 2', alDoblez: false,
      elementos: [
        { paso: 0, tipo: 'linea', p: [R, B] },
        ...[0, t.T, t.LCR, t.LCT, t.T - F.cadera].map((y) => ({ ...guia(y), paso: 0 })),
        ...[[A, 'A'], [E, 'E'], [C, 'C'], [D, 'D'], [B, 'B']].map(([p, nombre]) => ({ paso: 0, tipo: 'punto', p: [p], nombre, der: true })),
        { paso: 1, tipo: 'punto', p: [U], nombre: 'U' }, { paso: 1, tipo: 'punto', p: [H], nombre: 'H' },
        { paso: 2, tipo: 'linea', p: [K, Lp], puntos: true },
        { paso: 2, tipo: 'punto', p: [J], nombre: 'J' }, { paso: 2, tipo: 'punto', p: [K], nombre: 'K' },
        { paso: 3, tipo: 'linea', p: [N, M] }, { paso: 3, tipo: 'linea', p: [C, Xr] }, { paso: 3, tipo: 'linea', p: [Xr, N] },
        { paso: 3, tipo: 'linea', p: [W, M] }, { paso: 3, tipo: 'curva', p: [entre.a, entre.c, entre.b] },
        { paso: 3, tipo: 'punto', p: [N], nombre: 'N', der: true }, { paso: 3, tipo: 'punto', p: [M], nombre: 'M' },
        { paso: 3, tipo: 'punto', p: [Xr], nombre: 'X' }, { paso: 3, tipo: 'punto', p: [W], nombre: 'W' },
        { paso: 4, tipo: 'linea', p: [R, I] }, { paso: 4, tipo: 'linea', p: [Z, I] }, { paso: 4, tipo: 'curva', p: [H, U, Z] },
        { paso: 4, tipo: 'punto', p: [R], nombre: 'R', der: true }, { paso: 4, tipo: 'punto', p: [G], nombre: 'G' }, { paso: 4, tipo: 'punto', p: [I], nombre: 'I' },
      ],
      pasos: [
        `Traza un ángulo recto en A. De A a B el largo de cintura al tobillo (${n(r1(t.LCT))} cm), de A a C el tiro (${n(r1(t.T))} cm) y de A a D la cintura a la rodilla (${n(r1(t.LCR))} cm). De C sube ${n(F.cadera)} cm (E, cadera). Escuadra todas las líneas.`,
        `De C a U la mitad de la cadera: ${n(r1(t.CD))} ÷ 2 = ${n(r1(t.CD / 2))} cm. De U a H la extensión de tiro menos ${n(F.extensionMenos)}: ${n(r1(t.ET))} − ${n(F.extensionMenos)} = ${n(r1(t.ET - F.extensionMenos))} cm.`,
        `J está al medio de H y C (${n(r1(-J.x))} cm de C). De B a K la misma medida. Une K con J y prolonga hasta arriba: es la línea del hilo.`,
        `Bota: de K a N y de K a M ${n(r1(t.B / 2))} cm (mitad de bota). Rodilla: de V a X y de V a W ${n(r1(t.R / 2))} cm. Une C, X y N (costado), y W con M; de W sube con una curva hasta H (entrepierna).`,
        `Arriba sube ${n(F.elastico)} cm (R) para el elástico. De A a G la mitad de cadera menos ${n(F.centroMenos)}: ${n(r1(-G.x))} cm. Une U con G y prolonga hasta I. Haz la curva del fondillo de H a la recta U–G.`,
        `Agrega ${n(F.margen)} cm de costura en costados, entrepierna y fondillo, y ${n(F.basta)} cm abajo para el doblez de la basta. Arriba ya está el espacio del elástico.`,
      ],
      contorno: [
        { a: I, b: R, margen: 0 }, { a: R, b: C, margen: mg }, { a: C, b: Xr, margen: mg }, { a: Xr, b: N, margen: mg },
        { a: N, b: M, margen: F.basta }, { a: M, b: W, margen: mg }, { ...entre, margen: mg },
        { a: H, c: U, b: Z, margen: mg }, { a: Z, b: I, margen: mg },
      ],
      rotulo: P(J.x, t.T + (t.LCR - t.T) * 0.45),
      hilo: [P(J.x + 3, t.LCR + 4), P(J.x + 3, t.LCT - 6)],
    },
    t,
  };
}

function trasero(t, f) {
  const { U, H, G, I, R, Xr, W, N, M } = f.puntos;
  const U2 = P(H.x - (U.x - H.x), t.T), V = P(U2.x, t.T + F.bajarTrasero);
  const O = P(G.x + t.CD / 10, 0);
  const Pp = enRecta(U, O, -F.elastico);
  const dl = Math.hypot(Pp.x - U.x, Pp.y - U.y);
  const Q = P(Pp.x + (Pp.x - U.x) / dl * t.subir, Pp.y + (Pp.y - U.y) / dl * t.subir);
  const IR = Math.hypot(I.x - R.x, I.y - R.y);
  const ancho = IR + F.masCintura;
  const L = P(Q.x + Math.sqrt(Math.max(0, ancho ** 2 - (Q.y + F.elastico) ** 2)), -F.elastico);
  const S = P(L.x + F.costadoTrasero, L.y);
  const T2 = P(Xr.x + F.salir, Xr.y), W2 = P(W.x - F.salir, W.y), N2 = P(N.x + F.salir, N.y), M2 = P(M.x - F.salir, M.y);
  const { Z, curva } = fondillo(V, U, Q, 2.2 * t.ET);
  const entre = { a: W2, c: P(W2.x, t.T + (t.LCR - t.T) * 0.35), b: V };
  const mg = F.margen;
  const base = { tipo: 'linea', puntos: true };
  return {
    nombre: 'Trasero', cortar: 'Cortar 2', alDoblez: false,
    elementos: [
      { ...base, paso: 0, p: [R, I] }, { ...base, paso: 0, p: [I, U] }, { ...base, paso: 0, p: [R, Xr] }, { ...base, paso: 0, p: [Xr, N] },
      { ...base, paso: 0, p: [W, M] }, { ...base, paso: 0, p: [M, N] },
      { paso: 0, tipo: 'punto', p: [U], nombre: 'U' }, { paso: 0, tipo: 'punto', p: [G], nombre: 'G' },
      { paso: 1, tipo: 'punto', p: [V], nombre: 'V' }, { paso: 1, tipo: 'punto', p: [H], nombre: 'H' },
      { paso: 2, tipo: 'linea', p: [U, Q] }, { paso: 2, tipo: 'punto', p: [O], nombre: 'O' },
      { paso: 2, tipo: 'punto', p: [Pp], nombre: 'P', der: true }, { paso: 2, tipo: 'punto', p: [Q], nombre: 'Q' },
      { paso: 3, tipo: 'linea', p: [Q, S] }, { paso: 3, tipo: 'punto', p: [L], nombre: 'L' }, { paso: 3, tipo: 'punto', p: [S], nombre: 'S', der: true },
      { paso: 4, tipo: 'linea', p: [S, T2] }, { paso: 4, tipo: 'linea', p: [T2, N2] }, { paso: 4, tipo: 'linea', p: [N2, M2] },
      { paso: 4, tipo: 'linea', p: [M2, W2] }, { paso: 4, tipo: 'curva', p: [entre.a, entre.c, entre.b] }, { paso: 4, tipo: 'curva', p: [V, U, Z] },
      { paso: 4, tipo: 'punto', p: [T2], nombre: 'T', der: true },
    ],
    pasos: [
      'Recorta el delantero y cálcalo encima (líneas punteadas).',
      `De H a U' la misma medida que de U a H (${n(r1(-(H.x - U.x)))} cm) y de U' baja ${n(F.bajarTrasero)} cm: punto V (la punta del tiro de atrás).`,
      `De G a O camina la décima parte de la cadera: ${n(r1(t.CD))} ÷ 10 = ${n(r1(t.CD / 10))} cm hacia el costado. Une U con O y prolonga hacia arriba hasta P. De P a Q sube ${n(t.subir)} cm.`,
      `De Q a L la medida I–R del delantero (${n(r1(IR))} cm) + ${n(F.masCintura)} = ${n(r1(ancho))} cm. De L a S ${n(F.costadoTrasero)} cm.`,
      `En la rodilla y la bota aumenta ${n(F.salir)} cm a cada lado. Une S con T (costado) y baja a la bota. Haz la entrepierna hasta V y la curva del fondillo de V a la recta U–Q.`,
      `Agrega ${n(F.margen)} cm de costura en costados, entrepierna y fondillo, y ${n(F.basta)} cm abajo para la basta. Arriba ya está el espacio del elástico.`,
    ],
    contorno: [
      { a: Q, b: S, margen: 0 }, { a: S, b: T2, margen: mg }, { a: T2, b: N2, margen: mg }, { a: N2, b: M2, margen: F.basta },
      { a: M2, b: W2, margen: mg }, { ...entre, margen: mg }, { a: V, c: U, b: Z, margen: mg }, { a: Z, b: Q, margen: mg },
    ],
    rotulo: P((V.x + T2.x) / 2 + 2, t.T + (t.LCR - t.T) * 0.45),
    hilo: [P((V.x + T2.x) / 2 + 5, t.LCR + 4), P((V.x + T2.x) / 2 + 5, t.LCT - 6)],
    datos: { IR, ancho },
  };
}

export function construir(m) {
  const largoElastico = m.cintura - 5;
  const del = delantero(tabla(m));
  const t = del.t;
  const tra = trasero(t, del);
  return {
    calculos: [
      { nombre: 'Cadera (mitad)', formula: 'cadera ÷ 2', valor: t.CD },
      { nombre: 'C a U', formula: 'mitad de cadera ÷ 2', valor: t.CD / 2 },
      { nombre: 'Extensión de tiro', formula: 'mitad de cadera ÷ 10 + 0,2', valor: t.ET },
      { nombre: 'U a H', formula: `extensión − ${n(F.extensionMenos)}`, valor: t.ET - F.extensionMenos },
      { nombre: 'A a G (centro)', formula: `C–U − ${n(F.centroMenos)}`, valor: t.CD / 2 - F.centroMenos },
      { nombre: 'Bota (delantero)', formula: `(bota − ${n(2 * F.salir)}) ÷ 2`, valor: t.B },
      { nombre: 'Rodilla (delantero)', formula: 'bota − 1', valor: t.R },
      { nombre: 'Trasero: G a O', formula: 'mitad de cadera ÷ 10', valor: t.CD / 10 },
      { nombre: 'Trasero: Q a L', formula: `I–R + ${n(F.masCintura)}`, valor: tra.datos.ancho },
      { nombre: 'Largo del elástico', formula: 'tu cintura − 5', valor: largoElastico },
    ],
    piezas: [del.pieza, tra],
    rectangulos: [],
    elastico: largoElastico / 100,
  };
}
