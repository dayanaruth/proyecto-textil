// Referencias para poner precio en Bolivia (para quien no sabe cuánto cobrar).
// Son ayudas: cada taller debe medir sus tiempos (cronómetro de costura) y revisar sus precios.

// Salario mínimo nacional 2026: Bs 3.300 al mes (subió 20 % desde Bs 2.750 en 2025).
// Por ley, el día vale el sueldo ÷ 30 y la hora el día ÷ 8.
export const SALARIO_MINIMO = 3300;
export const HORA_MINIMA = SALARIO_MINIMO / 30 / 8;   // Bs 13,75

// Cuánto cobrar por hora según la experiencia (por día = hora × 8)
export const PAGO_HORA = [
  { valor: 14, nombre: 'Estoy aprendiendo', detalle: 'lo mínimo por ley: salario mínimo de Bs 3.300 al mes' },
  { valor: 18, nombre: 'Ya coso bien', detalle: 'unos Bs 145 por día' },
  { valor: 22, nombre: 'Tengo mucha experiencia', detalle: 'unos Bs 175 por día, como un maestro de otro oficio' },
];

// Horas de trabajo por prenda para una persona con máquina recta y remalladora
// (cortar, coser, planchar y terminar). [una prenda a medida, con prueba · cada prenda en un pedido grande]
// En fábrica una polera toma unos 8 minutos de costura, una camisa 21 y un pantalón 35; en un taller
// pequeño, donde una sola persona hace todo, se tarda de 4 a 5 veces más. En serie (docenas) se corta
// todo junto y se repite cada costura: cada prenda sale más rápido que una sola.
const HORAS = {
  'falda-recta': [2, 1.25],
  'falda-uniforme': [3, 1.75],
  'blusa': [2.5, 1.25],
  'vestido': [3.5, 2.5],
  'camisa-dama': [3.5, 1.75],
  'camisa-varon': [4, 2],
  'pantalon-dama': [3, 2],
  'pantalon-varon': [3, 2],
  'polera-dama': [1, 0.6],
  'polera-varon': [1, 0.6],
  'buzo-dama': [1.5, 1],
  'buzo-varon': [1.5, 1],
};
export const horasDe = (prendaId) => {
  const [medida, serie] = HORAS[prendaId] ?? [];
  return medida ? { medida, serie } : null;
};
// Desde cuántas prendas se considera trabajo en serie
export const EN_SERIE = 6;

// Precios de venta en el mercado (La Paz, inicio de clases 2026: mercados Ortega, Tumusla, Eguino, Illampu).
// Prendas de uniforme ya hechas, al detalle. Sirven para comparar: el precio cambia según la tela.
const MERCADO = {
  'falda-recta': { precio: 70, que: 'una falda de casimir de uniforme' },
  'falda-uniforme': { precio: 70, que: 'una falda de casimir de uniforme' },
  'blusa': { precio: 60, que: 'una blusa de uniforme', desde: true },
  'camisa-dama': { precio: 60, que: 'una camisa de uniforme', desde: true },
  'camisa-varon': { precio: 60, que: 'una camisa de uniforme', desde: true },
};
export const mercadoDe = (prendaId) => MERCADO[prendaId] ?? null;

// Compara el precio con el del mercado: 'parecido' (±25 %), 'caro' o 'barato'
export function compararConMercado(prendaId, precio) {
  const m = mercadoDe(prendaId);
  if (!m || !Number.isFinite(precio) || precio <= 0) return null;
  const r = precio / m.precio;
  const estado = m.desde ? (r < 0.75 ? 'barato' : r > 1.6 ? 'caro' : 'parecido') : (r < 0.75 ? 'barato' : r > 1.25 ? 'caro' : 'parecido');
  return { ...m, estado };
}
