// Pantalla: ayuda con preguntas frecuentes (respuestas paso a paso y enlaces a cada pantalla)
import { guardar } from '../datos/almacenamiento.js';
import { puedeInstalar, esIphone, instalar, instalada } from '../utilidades/pwa.js';

const pasos = (lista) => `<ol class="pasos-ayuda">${lista.map((p) => `<li>${p}</li>`).join('')}</ol>`;
const ir = (ruta, texto) => `<a class="btn btn-secundario btn-chico" href="${ruta}">${texto} ▶</a>`;

const TEMAS = [
  { icono: '👋', nombre: 'Para empezar', preguntas: [
    ['¿Qué puedo hacer con Mi Taller?', `<p>Sacar el molde de 6 prendas con tus medidas, saber cuánta tela comprar y cuánto cobrar. También guardar medidas de tu familia, hacer cotizaciones y practicar con ejercicios.</p>`],
    ['¿Cómo hago mi primera prenda?', pasos(['En el inicio toca <b>✂️ Hacer una prenda</b>.', 'Elige la prenda (y si es para dama o varón).', 'Escribe las medidas que te pide: cada una tiene un dibujo y el botón 🔊 para escuchar.', 'Mira el molde paso a paso, luego la tela y el precio.']) + ir('#/prendas', 'Hacer una prenda')],
    ['¿Cómo instalo la app en mi celular?', `${pasos(esIphone
      ? ['Abre la app en <b>Safari</b>.', 'Toca <b>Compartir</b> (el cuadrado con la flecha hacia arriba).', 'Elige <b>«Agregar a inicio»</b>.']
      : ['Abre la app en <b>Chrome</b>.', 'Toca el menú <b>⋮</b> (los tres puntos de arriba).', 'Elige <b>«Instalar app»</b> o «Agregar a la pantalla principal».'])}
      ${instalada() ? '<p>✅ Ya la tienes instalada.</p>' : puedeInstalar() && !esIphone ? '<button type="button" class="btn btn-principal btn-chico" data-instalar>📲 Instalar ahora</button>' : ''}`],
  ] },
  { icono: '🖨️', nombre: 'Moldes e impresión', preguntas: [
    ['¿Cómo imprimo el molde en tamaño real?', pasos([
      'En el molde toca <b>🖨️ Imprimir en tamaño real</b>. Verás cómo saldrán las hojas.',
      'Toca <b>Imprimir</b>. En la ventana de la impresora elige <b>escala 100 %</b> o <b>«Tamaño real»</b>. Nunca «Ajustar a la página».',
      'Desde el celular puedes elegir <b>«Guardar como PDF»</b> y llevar el archivo a imprimir.',
      'Mide el cuadro de la primera hoja: <b>debe medir 10 × 10 cm</b>.',
      'Recorta las hojas por la línea gris y pégalas según la fila y la columna.'])],
    ['El cuadro de control no mide 10 cm, ¿qué hago?', `<p>La impresora cambió el tamaño. Vuelve a imprimir revisando que diga <b>escala 100 %</b> o <b>«Tamaño real»</b>. Si imprimes desde un PDF, desactiva «Ajustar a la página».</p>`],
    ['¿Puedo hacer el molde sin imprimir?', `<p>¡Sí! Es lo que más enseña. Sigue los pasos del molde y trázalo en papel kraft con regla y escuadra. Cada paso te dice las medidas exactas.</p>`],
  ] },
  { icono: '📋', nombre: 'Medidas y datos', preguntas: [
    ['¿Dónde se guardan mis medidas?', `<p>Solo en <b>este celular</b>. No se envían a internet y nadie más las ve.</p>`],
    ['¿Cómo paso las medidas a otro celular?', pasos([
      'Ve a <b>📋 Medidas guardadas</b>.',
      'Abajo toca <b>⬇️ Guardar copia</b> o <b>📤 Enviar copia</b> (por WhatsApp o correo).',
      'En el otro celular abre Mi Taller → Medidas guardadas → <b>⬆️ Recuperar copia</b> y elige el archivo.']) + ir('#/guardadas', 'Medidas guardadas')],
    ['¿Qué pasa si borro los datos del navegador?', `<p>Se borran las medidas, cotizaciones y tiempos guardados. Por eso conviene <b>guardar una copia</b> de vez en cuando.</p>`],
  ] },
  { icono: '📶', nombre: 'Internet', preguntas: [
    ['¿Qué hago si no tengo internet?', `<p>Nada especial: <b>la app funciona igual</b> después de abrirla una vez con internet. Arriba verás el aviso «Sin internet». Puedes sacar moldes, calcular tela y precios, y guardar medidas.</p>
      <p>Solo necesitas internet para <b>enviar</b> por WhatsApp y para recibir las mejoras de la app.</p>`],
    ['¿Cómo recibo las mejoras de la app?', `<p>Cuando haya una versión nueva, abajo aparece <b>«Hay una versión nueva de la app»</b>. Toca <b>Actualizar</b>. Tus medidas y datos no se borran.</p>`],
  ] },
  { icono: '💰', nombre: 'Precios y cotizaciones', preguntas: [
    ['¿Ganancia «del costo» o «del precio de venta»?', `<p>No es lo mismo. Si la prenda cuesta Bs 100:</p>
      <ul><li><b>30 % del costo:</b> 100 + 30 = <b>Bs 130</b> (ganas 30).</li><li><b>30 % del precio de venta:</b> 100 ÷ 0,70 = <b>Bs 142,86</b> (ganas 42,86).</li></ul>
      <p>La app te muestra los dos para que elijas.</p>` + ir('#/herramientas/ejercicios/5', 'Practicar con ejercicios')],
    ['¿Cómo sé cuántas horas tardo en coser?', `<p>Usa el <b>⏱️ Cronómetro de costura</b> mientras coses. Al terminar, el tiempo se usa solo en tus costos y cotizaciones.</p>` + ir('#/herramientas/cronometro', 'Abrir el cronómetro')],
    ['¿El cliente ve mi ganancia en la cotización?', `<p><b>No.</b> La cotización que envías solo muestra las prendas, los precios, el total, el adelanto y la fecha de entrega.</p>`],
  ] },
];

export function mostrar(main) {
  main.innerHTML = `
    <h1>Ayuda</h1>
    <p class="ayuda">Toca una pregunta para ver la respuesta.</p>
    ${TEMAS.map((t) => `
      <section class="zona">
        <header class="zona-cabeza"><span class="grupo-icono" aria-hidden="true">${t.icono}</span><div><h2>${t.nombre}</h2></div></header>
        <div class="preguntas">${t.preguntas.map(([p, r]) => `
          <details class="pregunta-ayuda"><summary>${p}</summary><div class="respuesta">${r}</div></details>`).join('')}
        </div>
      </section>`).join('')}
    <button type="button" class="btn btn-secundario btn-ancho" id="ver-bienvenida">👋 Ver la bienvenida otra vez</button>
    <section class="acerca">
      <p><b>Mi Taller</b> · versión 1.0</p>
      <p>Proyecto Integrador de Sistemas Informáticos para el área de Corte y Confección del CEA «Man Césped», Cochabamba, 2026.</p>
      <p>Las fórmulas de los moldes y las tablas de tallas son provisionales, hasta su revisión con el docente del taller.</p>
    </section>`;
  main.querySelector('[data-instalar]')?.addEventListener('click', async (e) => { await instalar(); e.target.remove(); });
  main.querySelector('#ver-bienvenida').addEventListener('click', () => {
    guardar('bienvenida', false);
    location.hash = '#/bienvenida';
  });
  return '#/';
}
