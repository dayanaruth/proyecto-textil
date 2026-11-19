// Pantalla: inicio
import { puedeInstalar, esIphone, instalar, alCambiarInstalar } from '../utilidades/pwa.js';
import { ICONOS, dibujo } from '../utilidades/iconos.js';

// El ícono de cada opción es un dibujo propio (js/utilidades/iconos.js), con el mismo nombre que la ruta
const OPCIONES = [
  { ruta: 'guardadas', nombre: 'Medidas guardadas', desc: 'Tuyas, de tu familia o compañeras' },
  { ruta: 'tela', nombre: 'Calcular tela', desc: '¿Cuántos metros comprar?' },
  { ruta: 'costos', nombre: 'Calcular precio', desc: 'Costo y precio de venta' },
  { ruta: 'cotizaciones', nombre: 'Cotizaciones', desc: 'Enviar el precio a quien te encarga' },
  { ruta: 'herramientas', nombre: 'Aprender y practicar', desc: 'Conversor, guía, diccionario, ejercicios…' },
  { ruta: 'ayuda', nombre: 'Ayuda', desc: 'Preguntas frecuentes e instalación' },
];

export function mostrar(main) {
  main.innerHTML = `
    <div class="institucion"><img class="logo-cea" src="img/logo-cea.webp" alt="Logo del C.E.A. Man Césped" width="56" height="56"><div><strong>C.E.A. «Man Césped»</strong><small>Corte y Confección · Cochabamba</small></div></div>
    <section class="bienvenida">
      <h1>¡Hola! ¿Qué vamos a hacer hoy?</h1>
      <a class="btn btn-principal btn-grande" href="#/prendas"><span class="icono-boton">${ICONOS.tijeras.svg}</span> Hacer una prenda</a>
    </section>
    <h2 class="subtitulo">Otras herramientas</h2>
    <nav class="menu" aria-label="Herramientas">
      ${OPCIONES.map((o) => `
        <a class="menu-item" href="#/${o.ruta}">
          ${dibujo(o.ruta, 'menu-icono')}
          <span><strong>${o.nombre}</strong><small>${o.desc}</small></span>
        </a>`).join('')}
    </nav>
    <div id="instalar"></div>`;

  // Ofrecer instalar la app en el celular (solo si se puede y aún no está instalada)
  const pintarInstalar = () => {
    const zona = main.querySelector('#instalar');
    if (!zona) return;
    if (!puedeInstalar()) return void (zona.innerHTML = '');
    zona.innerHTML = esIphone
      ? '<p class="nota nota-info instalar-nota">📲 Para tenerla en tu iPhone: toca <b>Compartir</b> y luego <b>«Agregar a inicio»</b>.</p>'
      : `<button type="button" class="btn btn-secundario btn-ancho">📲 Instalar en el celular</button>
         <p class="instalar-nota">Queda como una app y funciona sin internet.</p>`;
    zona.querySelector('button')?.addEventListener('click', instalar);
  };
  alCambiarInstalar(pintarInstalar);
  pintarInstalar();
}
