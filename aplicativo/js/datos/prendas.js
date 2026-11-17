// Catálogo de las prendas: nombre, dibujo y variantes (dama/varón)
// "medidas": lo que se pide, en orden (ids de datos/medidas.js)
const img = (nombre) => `img/prendas/${nombre}.svg`;
const FALDA = ['cintura', 'cadera', 'altura-cadera', 'largo-falda'];
// "insumos": materiales sugeridos para el cuadro de costos (además de la tela)
const INSUMOS_FALDA = [
  { nombre: 'Cierre', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
  { nombre: 'Botón o gancho', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Entretela', cantidad: '0,1', unidad: 'm' },
];

export const PRENDAS = [
  { id: 'blusa', nombre: 'Blusa básica', img: img('blusa') },
  { id: 'falda-recta', nombre: 'Falda recta', img: img('falda-recta'), medidas: FALDA, insumos: INSUMOS_FALDA },
  {
    id: 'camisa', nombre: 'Camisa básica', detalle: 'Dama o varón', img: img('camisa-varon'),
    variantes: [
      { id: 'camisa-dama', nombre: 'Dama', titulo: 'Camisa de dama', img: img('camisa-dama') },
      { id: 'camisa-varon', nombre: 'Varón', titulo: 'Camisa de varón', img: img('camisa-varon') },
    ],
  },
  {
    id: 'pantalon', nombre: 'Pantalón recto', detalle: 'Dama o varón', img: img('pantalon-dama'),
    variantes: [
      { id: 'pantalon-dama', nombre: 'Dama', titulo: 'Pantalón de dama', img: img('pantalon-dama') },
      { id: 'pantalon-varon', nombre: 'Varón', titulo: 'Pantalón de varón', img: img('pantalon-varon') },
    ],
  },
  { id: 'falda-uniforme', nombre: 'Falda de uniforme', detalle: 'Con tablones', img: img('falda-uniforme'), medidas: FALDA, insumos: INSUMOS_FALDA },
  { id: 'vestido', nombre: 'Vestido básico', img: img('vestido') },
];

// Busca una prenda o una variante por su id
export const buscarPrenda = (id) =>
  PRENDAS.flatMap((p) => [p, ...(p.variantes ?? [])]).find((p) => p.id === id);

// Devuelve la prenda "madre" de una variante (camisa-dama → camisa)
export const prendaMadre = (id) => PRENDAS.find((p) => p.variantes?.some((v) => v.id === id));
