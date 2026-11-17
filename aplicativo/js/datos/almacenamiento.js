// Guardar y leer datos en el celular (LocalStorage + JSON)
const PREFIJO = 'mi-taller:';

export function leer(clave, porDefecto) {
  try {
    const texto = localStorage.getItem(PREFIJO + clave);
    return texto ? JSON.parse(texto) : porDefecto;
  } catch {
    return porDefecto;
  }
}

// Devuelve false si el navegador no dejó guardar (memoria llena o modo privado)
export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}
