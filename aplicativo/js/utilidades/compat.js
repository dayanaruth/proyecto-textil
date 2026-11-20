// Compatibilidad con celulares más antiguos (sobre todo iPhone con iOS 14 y 15.0–15.3).
// Se carga antes que todo lo demás. Si el celular ya lo tiene, no cambia nada.

// lista.at(-1): el último elemento (iOS 15.4+)
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    value(i) { const n = Math.trunc(i) || 0; return this[n < 0 ? this.length + n : n]; },
    configurable: true, writable: true,
  });
}
if (!String.prototype.at) {
  Object.defineProperty(String.prototype, 'at', {
    value(i) { const n = Math.trunc(i) || 0; return this[n < 0 ? this.length + n : n]; },
    configurable: true, writable: true,
  });
}

// Ventanas de "¿Borrar?" y el QR grande (<dialog>, iOS 15.4+): si no existen, se muestran igual
if (typeof HTMLDialogElement === 'undefined') {
  const abrir = function abrir() { this.setAttribute('open', ''); this.classList.add('dialogo-abierto'); };
  const cerrar = function cerrar() { this.removeAttribute('open'); this.classList.remove('dialogo-abierto'); };
  // Los <dialog> se crean después con innerHTML: se les agrega showModal/close al aparecer
  const preparar = (d) => { if (!d.showModal) Object.assign(d, { showModal: abrir, show: abrir, close: cerrar }); };
  new MutationObserver(() => document.querySelectorAll('dialog').forEach(preparar))
    .observe(document.documentElement, { childList: true, subtree: true });
}

// Pedir que el navegador no borre lo guardado (en iPhone, Safari borra datos de sitios que no se abren en 7 días)
navigator.storage?.persist?.().catch(() => {});
