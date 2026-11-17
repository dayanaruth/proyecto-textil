// Molde: vestido básico = cuerpo de la blusa (hasta la cintura) + falda recta + manga corta.
// La cintura del cuerpo y de la falda miden igual (cintura ÷ 4 + pinza), así calzan al coserlas.
// ⚠️ PROVISIONAL: usa las fórmulas de blusa.js y falda-recta.js.
import { cuerpo, manga } from './blusa.js';
import { construir as falda } from './falda-recta.js';

export function construir(m) {
  // El cuerpo termina en la cintura
  const c = cuerpo({ ...m, 'largo-blusa': m['talle-espalda'] });
  const f = falda(m);
  const [faldaDel, faldaEsp] = f.piezas;
  const mangaCorta = manga(m, c.sisa);

  return {
    calculos: [
      { nombre: 'Cuerpo: ancho en el busto', formula: 'busto ÷ 4 + 1', valor: c.b.ancho },
      { nombre: 'Cuerpo: profundidad de sisa', formula: 'busto ÷ 8 + 11', valor: c.b.ys },
      { nombre: 'Escote', formula: 'cuello ÷ 6', valor: c.b.c6 },
      ...f.calculos.map((x) => ({ ...x, nombre: `Falda: ${x.nombre.toLowerCase()}` })),
      { nombre: 'Altura de copa de la manga', formula: 'calculada para calzar en la sisa', valor: mangaCorta.alturaCopa },
    ],
    piezas: [
      { ...c.delantero, nombre: 'Delantero' },
      { ...c.espalda, nombre: 'Espalda' },
      { ...faldaDel, nombre: 'Falda del.', cortar: 'Cortar 1 al doblez' },
      { ...faldaEsp, nombre: 'Falda esp.', cortar: 'Cortar 2' },
      mangaCorta,
    ],
    rectangulos: [],
  };
}
