// Molde: vestido básico = cuerpo de la blusa (hasta la cintura) + falda recta + manga corta.
// La cintura del cuerpo y de la falda miden igual (cintura ÷ 4 + pinza), así calzan al coserlas.
// ⚠️ PROVISIONAL: usa las fórmulas de blusa.js y falda-recta.js.
import { cuerpo, manga, FORMULAS as BLUSA } from './blusa.js';
import { construir as falda, FORMULAS as FALDA } from './falda-recta.js';
import { punto as P } from '../geometria.js';
import { numero as n } from '../../utilidades/formato.js';

function marcarCierre(pieza, arriba, abajo, marca, instruccion) {
  const paso = pieza.pasos.length;
  const margen = pieza.contorno.at(-1).margen;
  const esInicio = marca === 'INICIO DEL CIERRE';
  const marcaY = esInicio ? arriba.y : abajo.y;
  const lineaX = arriba.x - margen / 2;
  return {
    ...pieza, centro: 'CENTRO ESPALDA', lineaCentro: { a: arriba, b: abajo },
    pasos: [...pieza.pasos, instruccion],
    elementos: [
      ...pieza.elementos,
      { paso, tipo: 'linea', puntos: true, p: [P(lineaX, arriba.y), P(lineaX, abajo.y)] },
      { paso, tipo: 'linea', p: [P(arriba.x - margen, marcaY), P(arriba.x + 1.2, marcaY)] },
      { paso, tipo: 'texto', p: [P(arriba.x + 5.2, marcaY + (esInicio ? 1.5 : -.65))], texto: marca, tam: .75 },
    ],
  };
}

export function construir(m) {
  // El cuerpo termina en la cintura
  const c = cuerpo({ ...m, 'largo-blusa': m['talle-espalda'] });
  const f = falda(m);
  const [faldaDel, faldaEsp] = f.piezas;
  const mangaCorta = manga(m, c.sisa);
  const centroCuerpo = c.espalda.contorno.at(-1);
  const centroFalda = faldaEsp.contorno.at(-1);
  const cintura = centroFalda.b;
  const inicioAbertura = centroFalda.a.y - FALDA.abertura;
  // La cadera es la referencia. En una falda corta se deja espacio antes de la abertura del ruedo.
  const hasta = Math.max(cintura.y, Math.min(m['altura-cadera'], inicioAbertura - 2));
  const fin = P(cintura.x, hasta);
  const tramoFalda = hasta - cintura.y;
  const finTexto = tramoFalda > 0 ? `a ${n(tramoFalda)} cm por debajo de la cintura` : 'en la unión de la cintura';
  const espalda = marcarCierre(c.espalda, centroCuerpo.b, centroCuerpo.a, 'INICIO DEL CIERRE',
    'Marca el inicio del cierre invisible en el centro de la espalda, justo debajo de la costura del escote. Baja hasta la cintura: el cierre sigue en la falda.');
  const faldaConCierre = marcarCierre(faldaEsp, cintura, fin, 'FIN DEL CIERRE',
    `Continúa el mismo cierre por el centro de la falda trasera y marca el final ${finTexto}. Haz coincidir las costuras de cintura. Cose el centro por debajo de esa marca hasta la abertura del ruedo.`);

  return {
    calculos: [
      { nombre: 'Cuerpo: ancho en el busto', formula: `busto ÷ 4 + ${String(BLUSA.holguraBusto).replace('.', ',')}`, valor: c.b.ancho },
      { nombre: 'Cuerpo: profundidad de sisa', formula: `busto ÷ 8 + ${BLUSA.sisaExtra}`, valor: c.b.ys },
      { nombre: 'Escote', formula: 'cuello ÷ 6', valor: c.b.c6 },
      ...f.calculos.map((x) => ({ ...x, nombre: `Falda: ${x.nombre.toLowerCase()}` })),
      { nombre: 'Altura de copa de la manga', formula: 'calculada para calzar en la sisa', valor: mangaCorta.alturaCopa },
    ],
    piezas: [
      { ...c.delantero, nombre: 'Delantero' },
      { ...espalda, nombre: 'Espalda' },
      { ...faldaDel, nombre: 'Falda del.', cortar: 'Cortar 1 al doblez' },
      { ...faldaConCierre, nombre: 'Falda esp.', cortar: 'Cortar 2' },
      mangaCorta,
    ],
    rectangulos: [],
    indicaciones: [`Cierre invisible: empieza en el escote de la espalda, cruza la cintura y termina ${finTexto}. Revisa la abertura en una prueba antes de coser el cierre.`],
  };
}
