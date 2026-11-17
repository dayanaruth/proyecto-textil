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
// Medidas de la blusa en el orden de los afiches del taller
const BLUSA = ['busto', 'cintura', 'cadera', 'cuello', 'talle-espalda', 'talle-delantero', 'ancho-espalda',
  'busto-a-busto', 'alto-busto', 'altura-cadera', 'largo-blusa', 'contorno-brazo', 'largo-manga'];
const INSUMOS_BLUSA = [
  { nombre: 'Cierre invisible', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
  { nombre: 'Entretela (escote)', cantidad: '0,1', unidad: 'm' },
];
// Vestido: como la blusa, pero en vez del largo de blusa pide el largo de la falda
const VESTIDO = BLUSA.map((id) => (id === 'largo-blusa' ? 'largo-falda' : id));
// Camisas: dama parte de la blusa; varón tiene cuerpo recto
const CAMISA_DAMA = [...BLUSA.filter((id) => !['largo-blusa', 'largo-manga'].includes(id)), 'largo-camisa', 'largo-manga-larga', 'muneca'];
const CAMISA_VARON = ['pecho', 'cadera', 'cuello', 'ancho-espalda', 'largo-camisa', 'contorno-brazo', 'largo-manga-larga', 'muneca'];
const INSUMOS_CAMISA = (botones) => [
  { nombre: 'Botones', cantidad: String(botones), unidad: 'unid.' },
  { nombre: 'Entretela (cuello y puños)', cantidad: '0,3', unidad: 'm' },
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
];
const PANTALON = ['cintura', 'cadera', 'altura-cadera', 'tiro', 'altura-rodilla', 'largo-pantalon', 'bota'];
const INSUMOS_PANTALON = [
  { nombre: 'Cierre (18 cm)', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Botón o gancho', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Entretela (pretina)', cantidad: '0,15', unidad: 'm' },
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
];
const INSUMOS_VESTIDO = [
  { nombre: 'Cierre invisible (50 cm)', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Hilo', cantidad: '2', unidad: 'carrete' },
  { nombre: 'Entretela (escote)', cantidad: '0,1', unidad: 'm' },
];

export const PRENDAS = [
  { id: 'blusa', nombre: 'Blusa básica', img: img('blusa'), medidas: BLUSA, insumos: INSUMOS_BLUSA },
  { id: 'falda-recta', nombre: 'Falda recta', img: img('falda-recta'), medidas: FALDA, insumos: INSUMOS_FALDA },
  {
    id: 'camisa', nombre: 'Camisa básica', detalle: 'Dama o varón', img: img('camisa-varon'),
    variantes: [
      { id: 'camisa-dama', nombre: 'Dama', titulo: 'Camisa de dama', img: img('camisa-dama'), medidas: CAMISA_DAMA, insumos: INSUMOS_CAMISA(8) },
      { id: 'camisa-varon', nombre: 'Varón', titulo: 'Camisa de varón', img: img('camisa-varon'), medidas: CAMISA_VARON, insumos: INSUMOS_CAMISA(10) },
    ],
  },
  {
    id: 'pantalon', nombre: 'Pantalón recto', detalle: 'Dama o varón', img: img('pantalon-dama'),
    variantes: [
      { id: 'pantalon-dama', nombre: 'Dama', titulo: 'Pantalón de dama', img: img('pantalon-dama'), medidas: PANTALON, insumos: INSUMOS_PANTALON },
      { id: 'pantalon-varon', nombre: 'Varón', titulo: 'Pantalón de varón', img: img('pantalon-varon'), medidas: PANTALON, insumos: INSUMOS_PANTALON },
    ],
  },
  { id: 'falda-uniforme', nombre: 'Falda de uniforme', detalle: 'Con tablones', img: img('falda-uniforme'), medidas: FALDA, insumos: INSUMOS_FALDA },
  { id: 'vestido', nombre: 'Vestido básico', img: img('vestido'), medidas: VESTIDO, insumos: INSUMOS_VESTIDO },
];

// Busca una prenda o una variante por su id
export const buscarPrenda = (id) =>
  PRENDAS.flatMap((p) => [p, ...(p.variantes ?? [])]).find((p) => p.id === id);

// Devuelve la prenda "madre" de una variante (camisa-dama → camisa)
export const prendaMadre = (id) => PRENDAS.find((p) => p.variantes?.some((v) => v.id === id));
