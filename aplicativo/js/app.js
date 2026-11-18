// Punto de entrada: navegación entre pantallas con la dirección (#/ruta/dato)
import * as inicio from './pantallas/inicio.js';
import * as elegirPrenda from './pantallas/elegir-prenda.js';
import * as medidas from './pantallas/medidas.js';
import * as molde from './pantallas/molde.js';
import * as tela from './pantallas/tela.js';
import * as costos from './pantallas/costos.js';
import * as guardadas from './pantallas/guardadas.js';
import * as cotizaciones from './pantallas/cotizaciones.js';
import * as herramientas from './pantallas/herramientas.js';
import * as bienvenida from './pantallas/bienvenida.js';
import * as ayuda from './pantallas/ayuda.js';
import * as marco from './pantallas/marco.js';
import { leer } from './datos/almacenamiento.js';
import { tieneMolde } from './moldes/registro.js';
import { iniciarPwa } from './utilidades/pwa.js';
import * as tiempos from './datos/tiempos.js';
import { buscarPrenda, prendaMadre } from './datos/prendas.js';

const main = document.getElementById('app');
const atras = document.getElementById('atras');
const irInicio = document.getElementById('ir-inicio');

// Cada pantalla puede devolver a dónde lleva "Atrás"
const RUTAS = {
  inicio: inicio.mostrar,
  prendas: elegirPrenda.lista,
  prenda: elegirPrenda.variante,
  medidas: (main, datos) => (buscarPrenda(datos[0])?.medidas ? medidas.mostrar(main, datos) : pronto(main, datos)),
  molde: (main, datos) => (tieneMolde(datos[0]) ? molde.mostrar(main, datos) : pronto(main, datos)),
  tela: tela.mostrar,
  costos: costos.mostrar,
  guardadas: guardadas.mostrar,
  para: guardadas.para,
  cotizaciones: cotizaciones.mostrar,
  herramientas: herramientas.mostrar,
  bienvenida: bienvenida.mostrar,
  ayuda: ayuda.mostrar,
  marco: marco.mostrar, // vista de prueba: marco ilustrado animado
};

// Pantalla temporal para lo que aún no está hecho
function pronto(main, [id]) {
  const prenda = buscarPrenda(id);
  main.innerHTML = `
    <div class="aviso">
      <p class="aviso-icono" aria-hidden="true">🚧</p>
      <h1>${prenda ? prenda.titulo ?? prenda.nombre : 'Muy pronto'}</h1>
      <p>Esta parte todavía está en construcción.</p>
      <a class="btn btn-principal" href="#/">Volver al inicio</a>
    </div>`;
}

// "Atrás" siempre lleva a la pantalla anterior del camino, no del historial
function destinoAtras(ruta, [id]) {
  if (ruta === 'prenda') return '#/prendas';
  if (ruta === 'molde') return `#/medidas/${id}/revisar`;
  if (ruta === 'tela') return `#/molde/${id}`;
  if (ruta === 'medidas') {
    const madre = prendaMadre(id);
    return madre ? `#/prenda/${madre.id}` : '#/prendas';
  }
  return '#/';
}

function navegar() {
  const [ruta = '', ...datos] = location.hash.replace(/^#\/?/, '').split('/');
  const nombre = ruta || 'inicio';
  // La primera vez que se abre la app, se muestra la bienvenida
  if (nombre === 'inicio' && !leer('bienvenida', false)) return location.replace('#/bienvenida');
  const destino = (RUTAS[nombre] ?? pronto)(main, datos);
  const sinBotones = nombre === 'inicio' || nombre === 'bienvenida';
  atras.hidden = sinBotones;
  irInicio.hidden = sinBotones;
  atras.href = destino ?? destinoAtras(nombre, datos);
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

// Relojito arriba mientras el cronómetro de costura cuenta (menos en su propia pantalla)
const relojBarra = document.getElementById('reloj-barra');
function actualizarReloj() {
  const visible = tiempos.corriendo() && !location.hash.startsWith('#/herramientas/cronometro');
  relojBarra.hidden = !visible;
  if (visible) relojBarra.querySelector('span').textContent = tiempos.reloj(tiempos.transcurrido()).replace(/:\d\d$/, '');
}
setInterval(actualizarReloj, 15000);
window.addEventListener('cronometro', actualizarReloj);
window.addEventListener('hashchange', actualizarReloj);
actualizarReloj();

window.addEventListener('hashchange', navegar);
navegar();
iniciarPwa();
