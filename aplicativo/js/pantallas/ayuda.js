// Pantalla: ayuda con preguntas frecuentes (respuestas paso a paso y enlaces a cada pantalla)
import { guardar } from '../datos/almacenamiento.js';
import { dibujo } from '../utilidades/iconos.js';
import { puedeInstalar, esIphone, instalar, instalada } from '../utilidades/pwa.js';

// Dirección pública de la app (la misma del código QR)
const URL_APP = 'https://tallerdigitalberk.github.io/proyecto-textil/';

const pasos = (lista) => `<ol class="pasos-ayuda">${lista.map((p) => `<li>${p}</li>`).join('')}</ol>`;
const ir = (ruta, texto) => `<a class="btn btn-secundario btn-chico" href="${ruta}">${texto} ▶</a>`;

const TEMAS = [
  { icono: 'maquina', nombre: 'Para empezar', preguntas: [
    ['¿Qué puedo hacer con Mi Taller?', `<p>Sacar el molde de 8 prendas con tus medidas, saber cuánta tela comprar y cuánto cobrar. También guardar medidas de tu familia, hacer cotizaciones y practicar con ejercicios.</p>`],
    ['¿Cómo hago mi primera prenda?', pasos(['En el inicio toca <b>✂️ Hacer una prenda</b>.', 'Elige la prenda (y si es para dama o varón).', 'Escribe las medidas que te pide: cada una tiene un dibujo y el botón 🔊 para escuchar.', 'Mira el molde paso a paso, luego la tela y el precio.']) + ir('#/prendas', 'Hacer una prenda')],
    ['¿Cómo instalo la app en mi celular?', `${pasos(esIphone
      ? ['Abre la app en <b>Safari</b>.', 'Toca <b>Compartir</b> (el cuadrado con la flecha hacia arriba).', 'Elige <b>«Agregar a pantalla de inicio»</b> (si no aparece, baja un poco en la lista).']
      : ['Abre la app en <b>Chrome</b>.', 'Toca el menú <b>⋮</b> (los tres puntos de arriba).', 'Elige <b>«Instalar app»</b> o «Agregar a la pantalla principal».'])}
      ${instalada() ? '<p>✅ Ya la tienes instalada.</p>' : puedeInstalar() && !esIphone ? '<button type="button" class="btn btn-principal btn-chico" data-instalar>📲 Instalar ahora</button>' : ''}`],
  ] },
  { icono: 'molde', nombre: 'Moldes e impresión', preguntas: [
    ['¿Cómo imprimo el molde en tamaño real?', pasos([
      'En el molde toca <b>🖨️ Imprimir en tamaño real</b>. Verás cómo saldrán las hojas.',
      'Toca <b>Imprimir</b>. En la ventana de la impresora elige <b>escala 100 %</b> o <b>«Tamaño real»</b>. Nunca «Ajustar a la página».',
      'Desde el celular puedes elegir <b>«Guardar como PDF»</b> y llevar el archivo a imprimir.',
      'Mide el cuadro de la primera hoja: <b>debe medir 10 × 10 cm</b>.',
      'Recorta las hojas por la línea gris y pégalas según la fila y la columna.'])],
    ['El cuadro de control no mide 10 cm, ¿qué hago?', `<p>La impresora cambió el tamaño. Vuelve a imprimir revisando que diga <b>escala 100 %</b> o <b>«Tamaño real»</b>. Si imprimes desde un PDF, desactiva «Ajustar a la página».</p>`],
    ['¿Puedo hacer el molde sin imprimir?', `<p>¡Sí! Es lo que más enseña. Sigue los pasos del molde y trázalo en papel kraft con regla y escuadra. Cada paso te dice las medidas exactas.</p>`],
  ] },
  { icono: 'guardadas', nombre: 'Medidas y datos', preguntas: [
    ['¿Dónde se guardan mis medidas?', `<p>Solo en <b>este celular</b>. No se envían a internet y nadie más las ve.</p>`],
    ['¿Cómo paso las medidas a otro celular?', pasos([
      'Ve a <b>📋 Medidas guardadas</b>.',
      'Abajo toca <b>⬇️ Guardar copia</b> o <b>📤 Enviar copia</b> (por WhatsApp o correo).',
      'En el otro celular abre Mi Taller → Medidas guardadas → <b>⬆️ Recuperar copia</b> y elige el archivo.']) + ir('#/guardadas', 'Medidas guardadas')],
    ['Tengo iPhone, ¿se pueden borrar mis medidas?', `<p>En iPhone conviene <b>instalar la app</b> (Safari → Compartir → «Agregar a pantalla de inicio»).
      Si solo la usas dentro de Safari y pasas <b>más de 7 días sin abrirla</b>, Safari puede borrar lo guardado.</p>
      <p>Ojo: la app instalada y Safari guardan sus datos por separado. Si ya tenías medidas en Safari, pásalas con <b>Guardar copia</b> y <b>Recuperar copia</b>.</p>`],
    ['¿Qué pasa si borro los datos del navegador?', `<p>Se borran las medidas, cotizaciones y tiempos guardados. Por eso conviene <b>guardar una copia</b> de vez en cuando.</p>`],
  ] },
  { icono: 'celular', nombre: 'Internet', preguntas: [
    ['¿Qué hago si no tengo internet?', `<p>Nada especial: <b>la app funciona igual</b> después de abrirla una vez con internet. Arriba verás el aviso «Sin internet». Puedes sacar moldes, calcular tela y precios, y guardar medidas.</p>
      <p>Solo necesitas internet para <b>enviar</b> por WhatsApp y para recibir las mejoras de la app.</p>`],
    ['¿Cómo recibo las mejoras de la app?', `<p>Cuando haya una versión nueva, abajo aparece <b>«Hay una versión nueva de la app»</b>. Toca <b>Actualizar</b>. Tus medidas y datos no se borran.</p>`],
  ] },
  { icono: 'costos', nombre: 'Precios y cotizaciones', preguntas: [
    ['¿Cuánto cobro por mi hora de trabajo?', `<p>Lo mínimo por ley en Bolivia (2026) es <b>Bs 13,75 por hora</b>: el salario mínimo de Bs 3.300 al mes ÷ 30 días ÷ 8 horas.
      Si ya coses bien, unos <b>Bs 18</b>; con mucha experiencia, unos <b>Bs 22</b>.</p>
      <p>En <b>Costo y precio</b> y en <b>Cotizaciones</b> toca «¿No sabes cuánto cobrar por hora?»: hay botones y una calculadora.</p>`],
    ['¿Por qué en una docena cada prenda sale más barata?', `<p>Porque se trabaja <b>en serie</b>: se corta todo junto y se repite la misma costura, así cada prenda toma menos tiempo.
      Y la tela se aprovecha mejor acomodando las piezas de todas las prendas juntas. La app ya lo calcula así.</p>`],
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
    <section class="compartir-app">
      <img class="qr-chico" src="img/qr-mi-taller.svg" alt="Código QR para abrir Mi Taller" width="160" height="160">
      <div>
        <h2>📲 Comparte Mi Taller</h2>
        <p>Pide a tu compañera que apunte la <b>cámara de su celular</b> a este código.</p>
        <div class="compartir-botones">
          <button type="button" class="btn btn-principal" id="qr-grande">🔍 Mostrar en grande</button>
          <button type="button" class="btn btn-secundario" id="enviar-enlace">📤 Enviar el enlace</button>
        </div>
        <p class="aviso-respaldo" id="enlace-mensaje" role="status"></p>
      </div>
    </section>
    <dialog class="dialogo dialogo-qr" id="dialogo-qr">
      <h2>Escanea con la cámara</h2>
      <img src="img/qr-mi-taller.svg" alt="Código QR para abrir Mi Taller" width="320" height="320">
      <p>o escribe: <b>${URL_APP.slice('https://'.length, -1)}</b></p>
      <button type="button" class="btn btn-principal btn-ancho" id="cerrar-qr">Listo</button>
    </dialog>
    <p class="ayuda">Toca una pregunta para ver la respuesta.</p>
    ${TEMAS.map((t) => `
      <section class="zona">
        <header class="zona-cabeza">${dibujo(t.icono, 'grupo-icono')}<div><h2>${t.nombre}</h2></div></header>
        <div class="preguntas">${t.preguntas.map(([p, r]) => `
          <details class="pregunta-ayuda"><summary>${p}</summary><div class="respuesta">${r}</div></details>`).join('')}
        </div>
      </section>`).join('')}
    <button type="button" class="btn btn-secundario btn-ancho" id="ver-bienvenida">👋 Ver la bienvenida otra vez</button>
    <section class="acerca">
      <img class="logo-cea" src="img/logo-cea.webp" alt="Logo del C.E.A. Man Césped" width="72" height="72">
      <p><b>Mi Taller</b> · versión 1.0</p>
      <p>Proyecto Integrador de Sistemas Informáticos para el área de Corte y Confección del CEA «Man Césped», Cochabamba, 2026.</p>
      <p>Las fórmulas de los moldes y las tablas de tallas son provisionales, hasta su revisión con el docente del taller.</p>
    </section>`;
  main.querySelector('[data-instalar]')?.addEventListener('click', async (e) => { await instalar(); e.target.remove(); });
  // Compartir: QR en grande o enviar el enlace (WhatsApp en el celular; copiar en la PC)
  const dialogo = main.querySelector('#dialogo-qr');
  main.querySelector('#qr-grande').addEventListener('click', () => dialogo.showModal());
  main.querySelector('#cerrar-qr').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
  main.querySelector('#enviar-enlace').addEventListener('click', async () => {
    const mensaje = main.querySelector('#enlace-mensaje');
    const datos = { title: 'Mi Taller', text: 'Mi Taller: moldes, tela y precios para Corte y Confección. Ábrela aquí:', url: URL_APP };
    if (navigator.share) {
      try { await navigator.share(datos); } catch { /* la persona canceló */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(URL_APP);
      mensaje.textContent = '✅ Enlace copiado. Pégalo en WhatsApp o donde quieras.';
    } catch {
      mensaje.textContent = `Copia este enlace: ${URL_APP}`;
    }
  });

  main.querySelector('#ver-bienvenida').addEventListener('click', () => {
    guardar('bienvenida', false);
    location.hash = '#/bienvenida';
  });
  return '#/';
}
