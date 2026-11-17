// Formato boliviano: coma decimal (68,5) y Bs
const NUM = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 });

const DOS = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const numero = (valor) => NUM.format(valor);

// Centímetros a metros con dos decimales: 90 → "0,90 m"
export const metros = (cm) => `${DOS.format(cm / 100)} m`;

// Bolivianos con dos decimales: 87.1 → "Bs 87,10"
export const bs = (valor) => `Bs ${DOS.format(valor)}`;

// Acepta "68", "68,5", "68.5" o "68 cm"; devuelve NaN si no es un número
export const leerNumero = (texto) => {
  const limpio = String(texto).trim().replace(/\s*cm$/i, '').replace(',', '.');
  return limpio === '' ? NaN : Number(limpio);
};
