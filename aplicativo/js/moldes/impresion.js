// La vista previa, la impresión y el PDF comparten el mismo dibujo en centímetros.
import { contenidoPieza, cajaPieza } from './dibujo-svg.js';

const FORMATOS = {
  carta: { nombre: 'Carta', medida: '21,6 × 27,9 cm', ancho: 21.59, alto: 27.94 },
  a4: { nombre: 'A4', medida: '21 × 29,7 cm', ancho: 21, alto: 29.7 },
  oficio: { nombre: 'Oficio', medida: '21,6 × 33 cm', ancho: 21.59, alto: 33.02 },
  plotter: { nombre: 'Ploteo', medida: 'rollo de 90 cm', ancho: 90 },
};
const MARGEN = 1;
const CABECERA = 1.3;
const r = (v) => Math.round(v * 100) / 100;
const escapar = (texto) => String(texto).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function grupoRectangular(pieza) {
  // Si se corta al doblez, el papel lleva media pieza.
  const ancho = r(pieza.alto);
  const alto = r(pieza.largo / (pieza.alDoblez ? 2 : 1));
  const caja = { x: -.6, y: -.2, ancho: ancho + 1.2, alto: alto + .4 };
  const doblez = pieza.alDoblez ? `
    <path d="M0 0 H${ancho}" stroke="#333" stroke-width=".09" stroke-dasharray=".3 .2"/>
    ${textoSVG(ancho / 2, .85, .4, 'DOBLEZ DE LA TELA', 'text-anchor="middle"')}` : pieza.doblezMitad ? `
    <path d="M${r(ancho / 2)} 0 V${alto}" stroke="#555" stroke-width=".06" stroke-dasharray=".3 .2"/>
    ${textoSVG(ancho / 2 + .25, 2, .4, 'DOBLAR AL COSER')}` : '';
  const dibujo = `
    <rect data-contorno-rectangular width="${ancho}" height="${alto}" fill="none" stroke="#9E2F45" stroke-width=".08"/>
    ${doblez}`;
  return { pieza, caja, dibujo, rectangular: true };
}

function textoSVG(x, y, tam, texto, atributos = '') {
  return `<text x="${r(x)}" y="${r(y)}" font-size="${tam}" ${atributos}>${escapar(texto)}</text>`;
}

function dividirLineas(texto, ancho, tam, medidor) {
  medidor.font = `${tam * 100}px Arial`;
  const lineas = [];
  let linea = '';
  for (const palabra of texto.split(/\s+/)) {
    const intento = linea ? `${linea} ${palabra}` : palabra;
    if (linea && medidor.measureText(intento).width > (ancho - .4) * 100) {
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = intento;
    }
  }
  if (linea) lineas.push(linea);
  return lineas;
}

function portada(titulo, molde, grupos, papel, ancho, alto) {
  const enRollo = !papel.alto;
  const medidor = document.createElement('canvas').getContext('2d');
  const paginas = [];
  const tam = .37;
  const interlineado = .52;
  let contenido = textoSVG(.1, .7, .62, `Molde · ${titulo}`, 'font-weight="bold"');
  contenido += textoSVG(.1, 1.37, .42, `${papel.nombre} · ${papel.medida}`);
  let y = 2.1;
  const instrucciones = [
    'Imprime a tamaño real (100 % de escala). Desactiva «Ajustar a la página».',
    'Mide el cuadro de control. Cada lado debe medir 10 cm antes de cortar.',
    enRollo
      ? 'Envía este PDF a la imprenta y pide ploteo en rollo de 90 cm a escala 100 %.'
      : 'Para armar cada pieza, corta por la línea gris punteada y une las hojas según su fila y columna.',
    'Corta la tela por el borde exterior del molde, que incluye el margen de costura.',
  ];
  for (const [i, texto] of instrucciones.entries()) {
    for (const linea of dividirLineas(`${i + 1}. ${texto}`, ancho, tam, medidor)) {
      contenido += textoSVG(.1, y, tam, linea);
      y += interlineado;
    }
  }
  y = r(y + .22);
  contenido += `<rect x=".1" y="${y}" width="10" height="10" fill="none" stroke="#444" stroke-width=".025"/>`;
  contenido += textoSVG(5.1, y + 5, .47, '10 × 10 cm', 'text-anchor="middle"');
  y += 10.85;

  const notas = [
    ...(enRollo && grupos.some(({ columnas }) => columnas > 1)
      ? ['Si una pieza ocupa varias columnas, recorta por la línea gris y únelas en orden.'] : []),
    ...grupos.map(({ pieza, filas, columnas }) => filas * columnas === 1
      ? `${pieza.nombre} · 1 hoja`
      : `${pieza.nombre} · ${filas} filas × ${columnas} columnas (${filas * columnas} hojas)`),
    ...molde.rectangulos.map(({ nombre, cortar, texto }) => `${nombre} (${cortar}) · ${texto}`),
    ...(molde.indicaciones ?? []),
  ];
  for (const nota of notas) {
    const lineas = dividirLineas(`• ${nota}`, ancho, tam, medidor);
    if (y + lineas.length * interlineado > alto) {
      paginas.push({ alto, contenido });
      contenido = textoSVG(.1, .7, .62, `Piezas y notas · ${titulo}`, 'font-weight="bold"');
      y = 1.5;
    }
    for (const linea of lineas) {
      contenido += textoSVG(.1, y, tam, linea);
      y += interlineado;
    }
    y += .12;
  }
  paginas.push({ alto: enRollo ? r(y + .45) : alto, contenido });
  return paginas;
}

function prepararPaginas(titulo, molde, originales, papel) {
  const ancho = r(papel.ancho - 2 * MARGEN);
  // Deja un pequeño espacio por el redondeo de centímetros a píxeles al imprimir.
  const alto = papel.alto ? r(papel.alto - 2 * MARGEN - .07) : Infinity;
  const grupos = originales.map((grupo) => {
    const altoCorte = papel.alto ? r(alto - CABECERA) : r(grupo.caja.alto + .02);
    return {
      ...grupo, altoCorte, filas: Math.ceil(grupo.caja.alto / altoCorte),
      columnas: Math.ceil(grupo.caja.ancho / ancho),
    };
  });
  const paginas = portada(titulo, molde, grupos, papel, ancho, alto);
  const secciones = [];
  for (const { pieza, caja, dibujo, rectangular, altoCorte, filas, columnas } of grupos) {
    for (let fila = 0; fila < filas; fila++) {
      for (let columna = 0; columna < columnas; columna++) {
        const partes = filas * columnas > 1 ? ` · fila ${fila + 1}, columna ${columna + 1}` : '';
        const anchoSeccion = papel.alto ? ancho : Math.min(ancho, Math.max(7, r(caja.ancho - columna * ancho + .02)));
        const x = r(caja.x + columna * ancho);
        const y = r(caja.y + fila * altoCorte);
        const tituloPieza = `${pieza.nombre}${partes}`;
        const cortar = papel.alto && rectangular && pieza.alDoblez
          ? `${pieza.cortar} · Alinea el borde marcado con el doblez de la tela` : pieza.cortar;
        const recuadro = papel.alto || partes
          ? `<rect x="0" y="${CABECERA}" width="${anchoSeccion}" height="${altoCorte}"
               fill="none" stroke="#888" stroke-width=".04" stroke-dasharray=".4 .3"/>` : '';
        const id = `corte-hoja-${secciones.length}`;
        secciones.push({
          ancho: anchoSeccion, alto: r(CABECERA + altoCorte),
          contenido: `
            <defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse">
              <rect x="0" y="${CABECERA}" width="${anchoSeccion}" height="${altoCorte}"/>
            </clipPath></defs>
            <g clip-path="url(#${id})">
              <g transform="translate(${r(-x)} ${r(CABECERA - y)})">${dibujo}</g>
            </g>
            ${recuadro}`,
          tituloPieza, cortar,
        });
      }
    }
  }
  const filas = papel.alto
    ? secciones.map((seccion) => ({ alto: seccion.alto, piezas: [{ x: 0, ...seccion }] }))
    : ordenarEnRollo(secciones, ancho);
  const total = paginas.length + filas.length;
  for (const fila of filas) {
    const numero = paginas.length + 1;
    const tituloHoja = `${titulo} · hoja ${numero} de ${total}`;
    const contenido = fila.piezas.map(({ x, tituloPieza, cortar, contenido }) => `
      <g transform="translate(${x} 0)">
        ${textoSVG(.1, .35, .35, papel.alto ? `${titulo} · ${tituloPieza} · hoja ${numero} de ${total}` : tituloPieza, 'font-weight="bold"')}
        ${textoSVG(.1, .9, .33, cortar)}
        ${contenido}
      </g>`).join('');
    const cabecera = papel.alto ? '' : textoSVG(.1, .35, .35, tituloHoja, 'font-weight="bold"');
    const margen = papel.alto ? 0 : .85;
    paginas.push({ alto: r(fila.alto + margen), contenido: `${cabecera}<g transform="translate(0 ${margen})">${contenido}</g>` });
  }
  return paginas.map((pagina) => ({
    ancho: papel.ancho, alto: papel.alto ?? r(pagina.alto + 2 * MARGEN),
    dibujo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${pagina.alto}"
      width="${ancho}" height="${pagina.alto}" font-family="Helvetica, Arial, sans-serif">${pagina.contenido}</svg>`,
  }));
}

function ordenarEnRollo(secciones, ancho) {
  const filas = [];
  for (const seccion of [...secciones].sort((a, b) => b.alto - a.alto)) {
    let fila = filas.find(({ usado }) => r(usado + seccion.ancho) <= ancho);
    if (!fila) {
      fila = { usado: 0, alto: seccion.alto, piezas: [] };
      filas.push(fila);
    }
    fila.piezas.push({ x: fila.usado, ...seccion });
    fila.usado = r(fila.usado + seccion.ancho + 1);
  }
  return filas;
}

async function descargarPDF(titulo, formato, paginas) {
  const { jsPDF } = await import('../vendor/pdf.js');
  const plantilla = document.createElement('template');
  let pdf;
  for (const { ancho, alto, dibujo } of paginas) {
    const orientacion = ancho > alto ? 'landscape' : 'portrait';
    if (pdf) pdf.addPage([ancho, alto], orientacion);
    else pdf = new jsPDF({ unit: 'cm', format: [ancho, alto], orientation: orientacion, compress: true });
    plantilla.innerHTML = dibujo;
    const svg = plantilla.content.firstElementChild;
    await pdf.svg(svg, {
      x: MARGEN, y: MARGEN, width: Number(svg.getAttribute('width')), height: Number(svg.getAttribute('height')),
    });
  }
  pdf.setProperties({ title: `Molde · ${titulo}` });
  const nombre = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  pdf.save(`molde-${nombre}-${formato}.pdf`);
}

export function imprimir(titulo, molde) {
  const grupos = [
    ...molde.piezas.filter((p) => p.imprimir !== false)
      .map((pieza) => ({ pieza, dibujo: contenidoPieza(pieza), caja: cajaPieza(pieza) })),
    ...molde.rectangulos.filter((p) => p.imprimir === true).map(grupoRectangular),
  ];
  const dialogo = document.createElement('dialog');
  dialogo.id = 'impresion';
  dialogo.className = 'dialogo-impresion';
  dialogo.setAttribute('aria-labelledby', 'titulo-impresion');
  dialogo.innerHTML = `
    <style></style>
    <header class="barra-impresion">
      <div class="formato-impresion">
        <h2 id="titulo-impresion">Imprimir o descargar molde</h2>
        <label for="formato-papel">Formato de papel</label>
        <select id="formato-papel" autofocus>
          ${Object.entries(FORMATOS).map(([clave, papel]) =>
            `<option value="${clave}">${papel.nombre} · ${papel.medida}</option>`).join('')}
        </select>
      </div>
      <div class="formato-impresion">
        <label for="pieza-impresion">Qué deseas imprimir</label>
        <select id="pieza-impresion">
          <option value="todas">Todo el molde</option>
          ${grupos.map(({ pieza }, indice) =>
            `<option value="${indice}">${escapar(pieza.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="acciones-impresion">
        <button type="button" class="btn btn-secundario" data-cerrar>Cerrar</button>
        <button type="button" class="btn btn-secundario" data-imprimir>Imprimir</button>
        <button type="button" class="btn btn-principal" data-descargar>Descargar PDF</button>
      </div>
      <p class="estado-impresion" role="status"></p>
    </header>
    <div class="vista-previa"></div>`;

  const formato = dialogo.querySelector('#formato-papel');
  const seleccion = dialogo.querySelector('#pieza-impresion');
  const zona = dialogo.querySelector('.vista-previa');
  const estado = dialogo.querySelector('.estado-impresion');
  const botonImprimir = dialogo.querySelector('[data-imprimir]');
  const botonDescargar = dialogo.querySelector('[data-descargar]');
  let paginas;
  let tituloPDF;
  function ajustar() {
    const anchoHoja = FORMATOS[formato.value].ancho * 96 / 2.54;
    const anchoDisponible = zona.clientWidth - 24;
    zona.style.setProperty('--zoom', Math.min(1, anchoDisponible / anchoHoja).toFixed(4));
  }
  function mostrar() {
    const papel = FORMATOS[formato.value];
    const todos = seleccion.value === 'todas';
    const elegidos = todos ? grupos : [grupos[Number(seleccion.value)]];
    const moldeElegido = todos ? molde : {
      ...molde,
      rectangulos: molde.rectangulos.filter((pieza) => elegidos.some((grupo) => grupo.pieza === pieza)),
    };
    tituloPDF = todos ? titulo : `${titulo} · ${elegidos[0].pieza.nombre}`;
    paginas = prepararPaginas(titulo, moldeElegido, elegidos, papel);
    dialogo.querySelector('style').textContent = papel.alto
      ? `@page { size: ${papel.ancho}cm ${papel.alto}cm; margin: ${MARGEN}cm; }` : '';
    dialogo.style.setProperty('--ancho-hoja', `${papel.ancho}cm`);
    zona.innerHTML = paginas.map(({ alto, dibujo }) =>
      `<section class="hoja" style="--alto-hoja:${alto}cm">${dibujo}</section>`).join('');
    zona.scrollTop = 0;
    botonImprimir.hidden = !papel.alto;
    estado.textContent = papel.alto
      ? `${paginas.length} hojas · Imprime al 100 % de escala.`
      : `${paginas.length} páginas · Envía el PDF a la imprenta para plotear al 100 %.`;
    ajustar();
  }
  dialogo.querySelector('[data-cerrar]').addEventListener('click', () => dialogo.close());
  botonImprimir.addEventListener('click', () => window.print());
  botonDescargar.addEventListener('click', async () => {
    const instruccion = estado.textContent;
    formato.disabled = seleccion.disabled = botonDescargar.disabled = true;
    estado.textContent = 'Preparando PDF…';
    try {
      await descargarPDF(tituloPDF, formato.value, paginas);
      estado.textContent = instruccion;
    } catch (error) {
      console.error(error);
      estado.textContent = 'No se pudo descargar el PDF. Vuelve a intentarlo.';
    } finally {
      formato.disabled = seleccion.disabled = botonDescargar.disabled = false;
    }
  });
  formato.addEventListener('change', mostrar);
  seleccion.addEventListener('change', mostrar);
  dialogo.addEventListener('close', () => {
    window.removeEventListener('resize', ajustar);
    dialogo.remove();
  });
  document.body.append(dialogo);
  dialogo.showModal();
  mostrar();
  window.addEventListener('resize', ajustar);
}
