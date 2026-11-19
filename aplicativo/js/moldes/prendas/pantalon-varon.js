// Molde: pantalón recto de varón (delantero sin pinza, más holgura, cierre delantero)
// ⚠️ PROVISIONAL: reemplazar FORMULAS por las del docente del CEA.
import { construirPantalon } from './pantalon-comun.js';

export const FORMULAS = {
  holguraCadera: { delantero: 1, espalda: 3 },  // se suman a cadera ÷ 4
  holguraCintura: 2,
  tiro: { delantero: 20, espalda: 10 },         // extensión del tiro = cadera ÷ este número (guía de buzo de varón)
  bajadaTiroEspalda: 1,
  entradaDelantero: 1,
  entradaEspalda: 3,
  subidaEspalda: 3,
  rodillaExtra: 4,                              // contorno de rodilla = bota + 4
  pinza: { delantero: 0, espalda: 2 },
  largoPinza: { delantero: 9, espalda: 11 },
  pretina: { ancho: 4, cruce: 4 },
  bragueta: 4,
};

export const construir = (m) => construirPantalon(m, FORMULAS);
