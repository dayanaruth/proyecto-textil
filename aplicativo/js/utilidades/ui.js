// Piezas de interfaz que usan varias pantallas

// Protege el texto escrito por la persona antes de ponerlo en la página
export const esc = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const PASOS = ['Prenda', 'Medidas', 'Molde', 'Tela', 'Precio'];

// Barra de pasos; "actual" empieza en 0 (Prenda). Con la prenda, los pasos ya hechos se pueden tocar.
const destinos = (id) => ['#/prendas', `#/medidas/${id}/revisar`, `#/molde/${id}`, `#/tela/${id}`, `#/costos/${id}`];

export const barraPasos = (actual, id) => `
  <ol class="pasos" aria-label="Pasos">
    ${PASOS.map((paso, i) => {
      const contenido = `<span>${i + 1}</span>${paso}`;
      const enlace = id && i < actual ? `<a href="${destinos(id)[i]}" aria-label="Volver a ${paso}">${contenido}</a>` : contenido;
      return `<li class="${i < actual ? 'hecho' : i === actual ? 'actual' : ''}"${i === actual ? ' aria-current="step"' : ''}>${enlace}</li>`;
    }).join('')}
  </ol>`;
