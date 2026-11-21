// Catálogo de las prendas: nombre, dibujo y variantes (dama/varón)
// "medidas": lo que se pide, en orden (ids de datos/medidas.js)
const img = (nombre) => `img/prendas/${nombre}.svg`;
const foto = (nombre) => `img/fotos/${nombre}.webp`;
const FALDA = ['cintura', 'cadera', 'altura-cadera', 'largo-falda'];
// "insumos": materiales sugeridos para el cuadro de costos (además de la tela)
const INSUMOS_FALDA = [
  { nombre: 'Cierre (15 cm)', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
  { nombre: 'Botón o gancho', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Entretela', cantidad: '0,1', unidad: 'm' },
];
// Medidas de la blusa en el orden de los afiches del taller
const BLUSA = ['busto', 'cintura', 'cadera', 'cuello', 'talle-espalda', 'talle-delantero', 'ancho-espalda',
  'busto-a-busto', 'alto-busto', 'altura-cadera', 'largo-blusa', 'contorno-brazo', 'largo-manga'];
const INSUMOS_BLUSA = [
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
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
const PANTALON = ['cintura', 'cadera', 'altura-cadera', 'tiro', 'altura-rodilla', 'rodilla', 'largo-pantalon', 'bota'];
const INSUMOS_PANTALON = [
  { nombre: 'Cierre (20 cm)', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Botón o gancho', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Entretela (pretina)', cantidad: '0,15', unidad: 'm' },
  { nombre: 'Hilo', cantidad: '1', unidad: 'carrete' },
];
// Poleras (tejido de punto): método de la guía de ropa deportiva del CEA
const POLERA_VARON = ['pecho', 'cuello', 'ancho-espalda', 'largo-polera', 'contorno-brazo', 'largo-manga'];
const POLERA_DAMA = ['busto', 'cintura', 'cadera', 'cuello', 'talle-espalda', 'ancho-espalda', 'altura-cadera', 'largo-polera', 'contorno-brazo', 'largo-manga'];
const INSUMOS_POLERA = [
  { nombre: 'Rib para el cuello', cantidad: '0,1', unidad: 'm' },
  { nombre: 'Hilo', cantidad: '2', unidad: 'carrete' },
];
// Buzos (pantalón deportivo con elástico): guía de ropa deportiva del CEA
const BUZO_VARON = ['cintura', 'cadera', 'tiro', 'largo-pantalon', 'bota'];
const BUZO_DAMA = ['cintura', 'cadera', 'tiro', 'altura-rodilla', 'largo-pantalon', 'bota'];
const INSUMOS_BUZO = [
  { nombre: 'Elástico (4 cm)', cantidad: '1', unidad: 'm' },
  { nombre: 'Hilo', cantidad: '2', unidad: 'carrete' },
];
const INSUMOS_VESTIDO = [
  { nombre: 'Cierre invisible (50 cm)', cantidad: '1', unidad: 'unid.' },
  { nombre: 'Hilo', cantidad: '2', unidad: 'carrete' },
  { nombre: 'Entretela (escote)', cantidad: '0,1', unidad: 'm' },
];

export const PRENDAS = [
  { id: 'blusa', para: 'dama', nombre: 'Blusa básica', img: img('blusa'), foto: foto('blusa'), medidas: BLUSA, insumos: INSUMOS_BLUSA },
  { id: 'falda-recta', para: 'dama', nombre: 'Falda recta', img: img('falda-recta'), foto: foto('falda-recta'), medidas: FALDA, insumos: INSUMOS_FALDA },
  {
    id: 'camisa', nombre: 'Camisa básica', detalle: 'Dama o varón', img: img('camisa-varon'), foto: foto('camisa'),
    variantes: [
      { id: 'camisa-dama', nombre: 'Dama', para: 'dama', titulo: 'Camisa de dama', img: img('camisa-dama'), foto: foto('camisa-dama'), medidas: CAMISA_DAMA, insumos: INSUMOS_CAMISA(8) },
      { id: 'camisa-varon', nombre: 'Varón', para: 'varon', titulo: 'Camisa de varón', img: img('camisa-varon'), foto: foto('camisa-varon'), medidas: CAMISA_VARON, insumos: INSUMOS_CAMISA(10) },
    ],
  },
  {
    id: 'pantalon', nombre: 'Pantalón recto', detalle: 'Dama o varón', img: img('pantalon-dama'), foto: foto('pantalon-dama'),
    variantes: [
      { id: 'pantalon-dama', nombre: 'Dama', para: 'dama', titulo: 'Pantalón de dama', img: img('pantalon-dama'), foto: foto('pantalon-dama'), medidas: PANTALON, insumos: INSUMOS_PANTALON },
      { id: 'pantalon-varon', nombre: 'Varón', para: 'varon', titulo: 'Pantalón de varón', img: img('pantalon-varon'), foto: foto('pantalon-varon'), medidas: PANTALON, insumos: INSUMOS_PANTALON },
    ],
  },
  { id: 'falda-uniforme', para: 'dama', nombre: 'Falda de uniforme', detalle: 'Con tablones', img: img('falda-uniforme'), foto: foto('falda-uniforme'), medidas: FALDA, insumos: INSUMOS_FALDA },
  { id: 'vestido', para: 'dama', nombre: 'Vestido básico', img: img('vestido'), foto: foto('vestido'), medidas: VESTIDO, insumos: INSUMOS_VESTIDO },
  {
    id: 'polera', nombre: 'Polera', detalle: 'Dama o varón', img: img('polera-varon'),
    variantes: [
      { id: 'polera-dama', nombre: 'Dama', para: 'dama', titulo: 'Polera de dama', img: img('polera-dama'), medidas: POLERA_DAMA, insumos: INSUMOS_POLERA },
      { id: 'polera-varon', nombre: 'Varón', para: 'varon', titulo: 'Polera de varón', img: img('polera-varon'), medidas: POLERA_VARON, insumos: INSUMOS_POLERA },
    ],
  },
  {
    id: 'buzo', nombre: 'Buzo deportivo', detalle: 'Dama o varón', img: img('buzo-varon'), foto: 'img/fotos/buzo-dama.png',
    variantes: [
      { id: 'buzo-dama', nombre: 'Dama', para: 'dama', titulo: 'Buzo de dama', img: img('buzo-dama'), foto: 'img/fotos/buzo-dama.png', medidas: BUZO_DAMA, insumos: INSUMOS_BUZO },
      { id: 'buzo-varon', nombre: 'Varón', para: 'varon', titulo: 'Buzo de varón', img: img('buzo-varon'), foto: 'img/fotos/buzo-varon.png', medidas: BUZO_VARON, insumos: INSUMOS_BUZO },
    ],
  },
];

// Busca una prenda o una variante por su id
export const buscarPrenda = (id) =>
  PRENDAS.flatMap((p) => [p, ...(p.variantes ?? [])]).find((p) => p.id === id);

// ¿La prenda sirve para este tipo de persona? ('dama' o 'varon'; sin tipo, sirve siempre)
// Una prenda con variantes sirve si alguna de sus variantes sirve.
export const sirvePara = (prenda, tipo) =>
  !tipo || (prenda.variantes ? prenda.variantes.some((v) => sirvePara(v, tipo)) : prenda.para === tipo);
export const NOMBRE_TIPO = { dama: 'mujeres y niñas', varon: 'varones y niños' };

// Devuelve la prenda "madre" de una variante (camisa-dama → camisa)
export const prendaMadre = (id) => PRENDAS.find((p) => p.variantes?.some((v) => v.id === id));
