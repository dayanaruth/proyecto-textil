// Pantalla: inicio
import { puedeInstalar, esIphone, instalar, alCambiarInstalar } from '../utilidades/pwa.js';
import { ICONOS, dibujo } from '../utilidades/iconos.js';
import { URL_ENCUESTA, mostrarInvitacionSiCorresponde } from '../utilidades/opinion.js';

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
  const invitar = mostrarInvitacionSiCorresponde();
  main.innerHTML = `
    <div class="institucion"><img class="logo-cea" src="img/logo-cea.webp" alt="Logo del C.E.A. Man Césped" width="56" height="56"><div><strong>C.E.A. «Man Césped»</strong><small>Corte y Confección · Cochabamba</small></div></div>
    <section class="bienvenida">
      <h1>¡Hola! ¿Qué vamos a hacer hoy?</h1>
      ${invitar ? `<section class="invitacion-opinion" aria-labelledby="titulo-opinion">
        <button type="button" class="cerrar-aviso" aria-label="Cerrar invitación">×</button>
        <h2 id="titulo-opinion">¿Cómo te fue con tu prenda?</h2>
        <p>Son tres preguntas sobre tu experiencia en Mi Taller.</p>
        <a class="btn btn-secundario" href="${URL_ENCUESTA}" target="_blank" rel="noopener noreferrer">Dar mi opinión</a>
      </section>` : ''}
      <a class="btn btn-principal btn-grande" href="#/prendas"><span class="icono-boton">${ICONOS.tijeras.svg}</span> Hacer una prenda</a>
    </section>
    <h2 class="subtitulo">Otras herramientas</h2>
    <nav class="menu" aria-label="Herramientas">
      ${OPCIONES.map((o) => `
        <a class="menu-item" href="#/${o.ruta}">
          ${dibujo(o.ruta, 'menu-icono')}
          <span><strong>${o.nombre}</strong><small>${o.desc}</small></span>
        </a>`).join('')}
      <a class="menu-item" href="${URL_ENCUESTA}" target="_blank" rel="noopener noreferrer">
        ${dibujo('opinion', 'menu-icono')}
        <span><strong>Dar mi opinión</strong><small>Cuéntanos cómo te fue con Mi Taller y qué mejorarías.</small></span>
      </a>
    </nav>
    <div id="instalar"></div>`;

  if (invitar) {
    const aviso = main.querySelector('.invitacion-opinion');
    const cerrar = () => {
      aviso.remove();
      main.querySelector('.bienvenida .btn-grande').focus();
    };
    aviso.querySelector('button').addEventListener('click', cerrar);
    aviso.querySelector('a').addEventListener('click', cerrar);
  }

  // Ofrecer instalar la app en el celular (solo si se puede y aún no está instalada)
  const pintarInstalar = () => {
    const zona = main.querySelector('#instalar');
    if (!zona) return;
    if (!puedeInstalar()) return void (zona.innerHTML = '');
    zona.innerHTML = esIphone
      ? '<p class="nota nota-info instalar-nota">📲 Para tenerla en tu iPhone o iPad: ábrela en <b>Safari</b>, toca <b>Compartir</b> y luego <b>«Agregar a pantalla de inicio»</b>.</p>'
      : `<button type="button" class="btn btn-secundario btn-ancho">📲 Instalar en el celular</button>
         <p class="instalar-nota">Queda como una app y funciona sin internet.</p>`;
    zona.querySelector('button')?.addEventListener('click', instalar);
  };
  alCambiarInstalar(pintarInstalar);
  pintarInstalar();
}
