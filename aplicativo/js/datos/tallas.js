// Tablas de tallas para cotizar por cantidad (pedidos por docena, uniformes).
// ⚠️ PROVISIONAL: medidas aproximadas; reemplazar por la tabla del docente del CEA.
const fila = (tallas, valores) => Object.fromEntries(tallas.map((t, i) => [t, valores[i]]));
const crear = (tallas, medidas) => ({
  tallas,
  medidas: Object.fromEntries(tallas.map((t) => [t, Object.fromEntries(Object.entries(medidas).map(([id, v]) => [id, fila(tallas, v)[t]]))])),
});

const ADULTO = ['S', 'M', 'L', 'XL'];
const NINOS = ['4', '6', '8', '10', '12', '14'];

export const TABLAS = {
  dama: { nombre: 'Dama', ...crear(ADULTO, {
    'busto': [84, 90, 96, 104], 'cintura': [66, 72, 78, 86], 'cadera': [90, 96, 102, 110], 'cuello': [34, 36, 38, 40],
    'talle-espalda': [39, 40, 41, 42], 'talle-delantero': [42, 44, 46, 48], 'ancho-espalda': [33, 35, 37, 39],
    'busto-a-busto': [17, 18, 19, 20], 'alto-busto': [25, 26, 27, 28], 'altura-cadera': [19, 20, 20, 21],
    'contorno-brazo': [26, 28, 30, 33], 'muneca': [15, 15.5, 16, 17], 'tiro': [25, 26, 27, 28], 'altura-rodilla': [56, 57, 58, 59],
    'largo-falda': [55, 55, 57, 57], 'largo-blusa': [58, 60, 62, 64], 'largo-camisa': [62, 64, 66, 68], 'largo-pantalon': [100, 101, 102, 103],
    'largo-manga': [20, 20, 21, 21], 'largo-manga-larga': [57, 58, 59, 60], 'bota': [40, 42, 44, 46], 'pecho': [84, 90, 96, 104],
  }) },
  varon: { nombre: 'Varón', ...crear(ADULTO, {
    'pecho': [92, 98, 104, 112], 'cintura': [76, 82, 88, 96], 'cadera': [92, 98, 104, 110], 'cuello': [37, 39, 41, 43],
    'ancho-espalda': [40, 42, 44, 46], 'talle-espalda': [43, 44, 45, 46], 'altura-cadera': [18, 19, 20, 21],
    'contorno-brazo': [29, 31, 33, 35], 'muneca': [16.5, 17, 17.5, 18], 'tiro': [25, 26, 27, 28], 'altura-rodilla': [56, 57, 58, 59],
    'largo-camisa': [72, 74, 76, 78], 'largo-manga-larga': [60, 61, 62, 63], 'largo-pantalon': [102, 104, 106, 108], 'bota': [42, 44, 46, 48],
  }) },
  ninos: { nombre: 'Niñas y niños', ...crear(NINOS, {
    'busto': [56, 60, 64, 70, 76, 80], 'pecho': [56, 60, 64, 70, 76, 80], 'cintura': [52, 54, 57, 60, 63, 66], 'cadera': [58, 63, 68, 74, 80, 86],
    'cuello': [27, 28, 29, 31, 32, 34], 'talle-espalda': [25, 27, 29, 31, 33, 35], 'talle-delantero': [26, 28, 30, 33, 35, 38],
    'ancho-espalda': [25, 26, 28, 30, 32, 34], 'busto-a-busto': [12, 13, 14, 15, 16, 17], 'alto-busto': [16, 17, 19, 21, 22, 24],
    'altura-cadera': [12, 13, 14, 15, 16, 17], 'contorno-brazo': [18, 19, 20, 22, 23, 25], 'muneca': [12, 12.5, 13, 13.5, 14, 14.5],
    'tiro': [18, 19, 20, 21, 22, 23], 'altura-rodilla': [32, 36, 40, 44, 47, 50], 'largo-falda': [30, 33, 36, 40, 43, 46],
    'largo-blusa': [36, 40, 44, 48, 52, 55], 'largo-camisa': [42, 46, 50, 54, 58, 62], 'largo-pantalon': [62, 70, 78, 86, 92, 96],
    'largo-manga': [12, 13, 14, 15, 16, 18], 'largo-manga-larga': [32, 36, 40, 44, 48, 52], 'bota': [32, 34, 36, 38, 40, 42],
  }) },
};

// Qué tablas sirven para cada prenda (las de varón no tienen medidas de busto, falda, etc.)
export const tablasPara = (prendaId) => (prendaId.endsWith('-varon') ? ['varon', 'ninos'] : ['dama', 'ninos']);
