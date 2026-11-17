// Piezas de interfaz que usan varias pantallas

// Protege el texto escrito por la persona antes de ponerlo en la página
export const esc = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const PASOS = ['Prenda', 'Medidas', 'Molde', 'Tela', 'Precio'];

// Barra de pasos; "actual" empieza en 0 (Prenda)
export const barraPasos = (actual) => `
  <ol class="pasos" aria-label="Pasos">
    ${PASOS.map((paso, i) => `
      <li class="${i < actual ? 'hecho' : i === actual ? 'actual' : ''}"${i === actual ? ' aria-current="step"' : ''}>
        <span>${i + 1}</span>${paso}
      </li>`).join('')}
  </ol>`;
