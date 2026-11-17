// Pantalón recto (dama y varón): delantero, espalda, pretina y vista de bragueta.
// Método del afiche del buzo del taller: líneas de cadera, tiro, rodilla y largo;
// extensión del tiro; anchos de rodilla y bota centrados en la línea de plancha.
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

const MARGEN = { cintura: 1, costado: 1.5, entrepierna: 1.5, tiro: 1, ruedo: 4, centro: 1.5 };

function pieza(m, F, cual) {
  const del = cual === 'delantero';
  const K = m.cadera, AC = m['altura-cadera'], YR = m['altura-rodilla'], L = m['largo-pantalon'], Bo = m.bota;
  const holgura = F.holguraCadera[cual];
  const W = K / 4 + holgura;                                   // ancho en la cadera
  const divTiro = del ? F.tiro.delantero : F.tiro.espalda;
  const ext = K / divTiro;                                    // extensión del tiro
  const yX = m.tiro + (del ? 0 : F.bajadaTiroEspalda);
  const xc = (W - ext) / 2;                                   // línea de plancha (hilo)
  const lado = del ? -1 : 1;
  const rodilla = Bo + F.rodillaExtra;
  const k = (rodilla / 2 + lado) / 2, b = (Bo / 2 + lado) / 2;
  const pinza = F.pinza[cual];
  const anchoCintura = (m.cintura + F.holguraCintura) / 4 + pinza;

  const Cw = del ? P(F.entradaDelantero, 0) : P(F.entradaEspalda, -F.subidaEspalda);
  const Sw = P(Cw.x + Math.sqrt(Math.max(0, anchoCintura ** 2 - Cw.y ** 2)), 0);
  const Ch = P(0, AC), Sh = P(W, AC), X = P(-ext, yX);
  const KO = P(xc + k, YR), KI = P(xc - k, YR), HO = P(xc + b, L), HI = P(xc - b, L);
  const cadera = { a: Sw, c: P(Math.max(W, Sw.x), AC * 0.4), b: Sh };
  const tiro = { a: Ch, c: P(0, yX), b: X };
  const entrepierna = { a: X, c: P(KI.x, yX + (YR - yX) * 0.35), b: KI };

  // Pinza: delantero en la línea de plancha; espalda en el medio de la cintura
  const enCintura = (x) => P(x, Cw.y + (Sw.y - Cw.y) * ((x - Cw.x) / (Sw.x - Cw.x)));
  const xp = del ? xc : (Cw.x + Sw.x) / 2;
  const largoPinza = del ? F.largoPinza.delantero : F.largoPinza.espalda;
  const pinzas = pinza >= 0.5
    ? [{ paso: 6, tipo: 'pinza', p: [enCintura(xp - pinza / 2), P(xp, enCintura(xp).y + largoPinza), enCintura(xp + pinza / 2)] }] : [];

  const guiaX1 = -ext - 2, guiaX2 = W + 2;
  const guia = (y, texto) => [
    { paso: 0, tipo: 'linea', p: [P(guiaX1, y), P(guiaX2, y)], puntos: true },
    { paso: 0, tipo: 'texto', p: [P(guiaX2 + 5, y + 0.6)], texto, tam: 1.6 },
  ];
  const mg = MARGEN;
  const nombreTiro = `cadera ÷ ${divTiro}`;

  return {
    nombre: del ? 'Delantero' : 'Espalda', cortar: 'Cortar 2', alDoblez: false,
    centro: del ? 'CENTRO · CIERRE' : 'CENTRO', lineaCentro: { a: Cw, b: Ch },
    elementos: [
      { paso: 0, tipo: 'linea', p: [P(0, 0), P(0, L)], puntos: true },
      ...guia(0, 'Cintura'), ...guia(AC, 'Cadera'), ...guia(yX, 'Tiro'), ...guia(YR, 'Rodilla'), ...guia(L, 'Largo'),
      { paso: 1, tipo: 'linea', p: [Ch, Sh] }, { paso: 1, tipo: 'punto', p: [Sh], nombre: 'B', der: true },
      { paso: 1, tipo: 'linea', p: [P(0, yX), X] }, { paso: 1, tipo: 'punto', p: [X], nombre: 'C' },
      { paso: 2, tipo: 'linea', p: [P(xc, -2), P(xc, L)], puntos: true },
      { paso: 3, tipo: 'linea', p: [KI, KO] }, { paso: 3, tipo: 'linea', p: [HI, HO] },
      { paso: 4, tipo: 'linea', p: [Cw, Sw] }, { paso: 4, tipo: 'linea', p: [Ch, Cw] }, { paso: 4, tipo: 'curva', p: [cadera.a, cadera.c, cadera.b] },
      { paso: 4, tipo: 'punto', p: [Cw], nombre: 'A' }, { paso: 4, tipo: 'punto', p: [Sw], nombre: 'D', der: true },
      { paso: 5, tipo: 'curva', p: [tiro.a, tiro.c, tiro.b] }, { paso: 5, tipo: 'curva', p: [entrepierna.a, entrepierna.c, entrepierna.b] },
      { paso: 5, tipo: 'linea', p: [KI, HI] }, { paso: 5, tipo: 'linea', p: [Sh, KO] }, { paso: 5, tipo: 'linea', p: [KO, HO] },
      ...pinzas,
    ],
    pasos: [
      `Traza una línea vertical y, desde la cintura hacia abajo, marca: cadera ${n(AC)} cm, tiro ${n(yX)} cm, rodilla ${n(YR)} cm y largo ${n(L)} cm. Traza una línea horizontal en cada una.`,
      `Cadera: hacia la derecha mide cadera ÷ 4 + ${n(holgura)} = ${n(W)} cm (punto B). Tiro: hacia la izquierda sal ${nombreTiro} = ${n(ext)} cm (punto C).${del ? '' : ` En la espalda el tiro baja ${n(F.bajadaTiroEspalda)} cm más.`}`,
      `Línea de plancha: a la mitad entre C y el costado (a ${n(xc)} cm del centro). Es el hilo de la tela.`,
      `Rodilla: ${n(k)} cm a cada lado de la línea de plancha. Ruedo: ${n(b)} cm a cada lado (bota de ${n(Bo)} cm).`,
      `Cintura: ${del ? `entra ${n(F.entradaDelantero)} cm en el centro` : `entra ${n(F.entradaEspalda)} cm en el centro y sube ${n(F.subidaEspalda)} cm`} (punto A) y mide (cintura + ${n(F.holguraCintura)}) ÷ 4${pinza ? ` + ${n(pinza)} de pinza` : ''} = ${n(anchoCintura)} cm hasta D. Une A con la línea de cadera y D con B con una curva.`,
      'Tiro: une el centro con C con una curva. Entrepierna: de C baja con una curva suave hasta la rodilla y recto al ruedo. Costado: une B con la rodilla y el ruedo.',
      pinzas.length
        ? `Pinza: ${del ? 'sobre la línea de plancha' : 'en el medio de la cintura'}, ${n(pinza)} cm de ancho y ${n(largoPinza)} cm de largo.`
        : 'Este delantero no lleva pinza.',
      `Agrega el margen: ${n(mg.cintura)} cm en la cintura, ${n(mg.costado)} en el costado y la entrepierna, ${n(mg.tiro)} en el tiro, ${n(mg.centro)} en el centro y ${n(mg.ruedo)} en el ruedo.`,
    ],
    contorno: [
      { a: Cw, b: Sw, margen: mg.cintura }, { ...cadera, margen: mg.costado },
      { a: Sh, b: KO, margen: mg.costado }, { a: KO, b: HO, margen: mg.costado },
      { a: HO, b: HI, margen: mg.ruedo }, { a: HI, b: KI, margen: mg.entrepierna },
      { a: KI, c: entrepierna.c, b: X, margen: mg.entrepierna }, { a: X, c: tiro.c, b: Ch, margen: mg.tiro },
      { a: Ch, b: Cw, margen: mg.centro },
    ],
    rotulo: P(xc + 1, (yX + YR) / 2),
    hilo: [P(xc + 2.5, YR + 3), P(xc + 2.5, L - 6)],
    datos: { W, ext, xc, k, b, anchoCintura },
  };
}

export function construirPantalon(m, F) {
  const del = pieza(m, F, 'delantero'), esp = pieza(m, F, 'espalda');
  const pretina = { largo: m.cintura + F.holguraCintura + F.pretina.cruce + 2, alto: 2 * F.pretina.ancho + 2 };
  const bragueta = { largo: m['altura-cadera'] + 2, alto: 2 * F.bragueta + 2 };
  return {
    calculos: [
      { nombre: 'Delantero: ancho de cadera', formula: `cadera ÷ 4 + ${n(F.holguraCadera.delantero)}`, valor: del.datos.W },
      { nombre: 'Espalda: ancho de cadera', formula: `cadera ÷ 4 + ${n(F.holguraCadera.espalda)}`, valor: esp.datos.W },
      { nombre: 'Tiro delantero', formula: `cadera ÷ ${F.tiro.delantero}`, valor: del.datos.ext },
      { nombre: 'Tiro de espalda', formula: `cadera ÷ ${F.tiro.espalda}`, valor: esp.datos.ext },
      { nombre: 'Cintura delantera', formula: `(cintura + ${n(F.holguraCintura)}) ÷ 4 + pinza`, valor: del.datos.anchoCintura },
      { nombre: 'Cintura de espalda', formula: `(cintura + ${n(F.holguraCintura)}) ÷ 4 + pinza`, valor: esp.datos.anchoCintura },
      { nombre: 'Rodilla (pierna completa)', formula: `bota + ${n(F.rodillaExtra)}`, valor: m.bota + F.rodillaExtra },
    ],
    piezas: [del, esp],
    rectangulos: [
      { nombre: 'Pretina', cortar: 'Cortar 1', alDoblez: true, ...pretina,
        texto: `${n(pretina.largo)} × ${n(pretina.alto)} cm (ya incluye margen y ${n(F.pretina.cruce)} cm de cruce).` },
      { nombre: 'Vista de bragueta', cortar: 'Cortar 2', alDoblez: false, ...bragueta,
        texto: `${n(bragueta.largo)} × ${n(bragueta.alto)} cm (se dobla a la mitad). Para el cierre delantero.` },
    ],
  };
}
