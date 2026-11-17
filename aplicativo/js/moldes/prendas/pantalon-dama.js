// Molde: pantalón recto de dama (pinzas adelante y atrás, cierre delantero)
// ⚠️ PROVISIONAL: reemplazar FORMULAS por las del docente del CEA.
import { construirPantalon } from './pantalon-comun.js';

export const FORMULAS = {
  holguraCadera: { delantero: 0, espalda: 2 },  // se suman a cadera ÷ 4
  holguraCintura: 1,
  tiro: { delantero: 16, espalda: 8 },          // extensión del tiro = cadera ÷ este número
  bajadaTiroEspalda: 1,
  entradaDelantero: 1,
  entradaEspalda: 3,
  subidaEspalda: 2.5,
  rodillaExtra: 4,                              // contorno de rodilla = bota + 4
  pinza: { delantero: 2, espalda: 3 },
  largoPinza: { delantero: 9, espalda: 12 },
  pretina: { ancho: 4, cruce: 4 },
  bragueta: 4,
};

export const construir = (m) => construirPantalon(m, FORMULAS);
