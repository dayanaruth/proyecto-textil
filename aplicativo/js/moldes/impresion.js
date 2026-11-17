// Imprime el molde a tamaño real: lo divide en hojas que sirven en A4 y en Carta
import { contenidoPieza, cajaPieza } from './dibujo-svg.js';

const HOJA = { ancho: 19, alto: 24.5 }; // cm útiles de cada hoja
const r = (v) => Math.round(v * 100) / 100;

function hojasDe(pieza) {
  const c = cajaPieza(pieza);
  const columnas = Math.ceil(c.ancho / HOJA.ancho), filas = Math.ceil(c.alto / HOJA.alto);
  const hojas = [];
  for (let f = 0; f < filas; f++) {
    for (let k = 0; k < columnas; k++) {
      hojas.push({ fila: f + 1, columna: k + 1, x: c.x + k * HOJA.ancho, y: c.y + f * HOJA.alto });
    }
  }
  return { pieza, columnas, filas, hojas };
}

export function imprimir(titulo, molde) {
  const grupos = molde.piezas.filter((p) => p.imprimir !== false).map(hojasDe);
  const total = 1 + grupos.reduce((s, g) => s + g.hojas.length, 0);
  let numero = 1;

  const paginas = grupos.flatMap(({ pieza, hojas }) => {
    const dibujo = contenidoPieza(pieza);
    return hojas.map((h) => `
      <section class="hoja">
        <p class="hoja-titulo">${titulo} · <b>${pieza.nombre}</b> · fila ${h.fila}, columna ${h.columna} · hoja ${++numero} de ${total}</p>
        <svg width="${HOJA.ancho}cm" height="${HOJA.alto}cm" viewBox="${r(h.x)} ${r(h.y)} ${HOJA.ancho} ${HOJA.alto}" font-family="system-ui, sans-serif">
          ${dibujo}
          <rect x="${r(h.x)}" y="${r(h.y)}" width="${HOJA.ancho}" height="${HOJA.alto}" fill="none" stroke="#999" stroke-width=".05" stroke-dasharray=".4 .3"/>
          <text x="${r(h.x + .5)}" y="${r(h.y + 1.2)}" font-size="1" fill="#999">${pieza.nombre} ${h.fila}-${h.columna}</text>
        </svg>
      </section>`);
  });

  const portada = `
    <section class="hoja">
      <h1>Molde: ${titulo}</h1>
      <ol>
        <li>Imprime en <b>tamaño real</b> (escala 100 %, sin "ajustar a la página").</li>
        <li>Mide el cuadro de abajo: <b>debe medir 10 × 10 cm</b>. Si no, revisa la escala.</li>
        <li>Recorta cada hoja por la línea punteada gris y pégalas según fila y columna.</li>
        <li>Recorta el molde por la línea de afuera (ya incluye el margen de costura).</li>
      </ol>
      <div class="cuadro-control">10 cm</div>
      <ul>
        ${grupos.map((g) => `<li><b>${g.pieza.nombre}</b>: ${g.filas} filas × ${g.columnas} columnas (${g.hojas.length} hojas)</li>`).join('')}
        ${molde.rectangulos.map((x) => `<li><b>${x.nombre}</b>: ${x.texto}</li>`).join('')}
      </ul>
    </section>`;

  // Vista previa propia: se ven las hojas antes de gastar papel (funciona en cualquier navegador)
  document.querySelector('#impresion')?.remove();
  document.querySelector('.barra-impresion')?.remove();
  const zona = document.createElement('div');
  zona.id = 'impresion';
  zona.className = 'vista-previa';
  zona.innerHTML = portada + paginas.join('');
  const barra = document.createElement('div');
  barra.className = 'barra-impresion';
  barra.innerHTML = `
    <p><b>Vista previa</b><small>${total} hojas · Carta o A4</small></p>
    <button type="button" class="btn btn-secundario" data-accion="cerrar">Cerrar</button>
    <button type="button" class="btn btn-principal" data-accion="imprimir">🖨️ Imprimir</button>`;

  // Las hojas miden 21,6 cm de ancho: se achican para que entren en la pantalla
  const ajustar = () => {
    const anchoHoja = (21.6 / 2.54) * 96;
    zona.style.setProperty('--zoom', Math.min(1, (window.innerWidth - 32) / anchoHoja).toFixed(3));
  };
  const cerrar = () => {
    zona.remove();
    barra.remove();
    window.removeEventListener('resize', ajustar);
    document.removeEventListener('keydown', teclas);
  };
  const teclas = (e) => { if (e.key === 'Escape') cerrar(); };
  barra.addEventListener('click', (e) => {
    const accion = e.target.closest('[data-accion]')?.dataset.accion;
    if (accion === 'cerrar') cerrar();
    if (accion === 'imprimir') window.print();
  });
  window.addEventListener('resize', ajustar);
  document.addEventListener('keydown', teclas);
  ajustar();
  document.body.append(barra, zona);
  barra.querySelector('[data-accion="imprimir"]').focus();
}
