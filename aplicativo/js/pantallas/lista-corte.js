// Pantalla: lista de control antes de cortar la tela (evita errores que cuestan tela)
import { leer, guardar } from '../datos/almacenamiento.js';

const GRUPOS = [
  { nombre: 'La tela', icono: '🧵', items: [
    ['lavada', 'Lavé la tela (si es algodón, jean o lino)', 'Estas telas encogen con la primera lavada. Si cortas antes, la prenda queda chica después.'],
    ['planchada', 'Planché la tela', 'Las arrugas cambian las medidas y el molde no queda bien puesto.'],
    ['fallas', 'Revisé que no tenga manchas, hilos jalados ni huecos', 'Así evitas que una falla quede en el medio de una pieza.'],
    ['reves', 'Sé cuál es el derecho y el revés', 'Si cortas una pieza al revés, el color o el dibujo no coinciden con las otras.'],
  ] },
  { nombre: 'El molde', icono: '📐', items: [
    ['piezas', 'Tengo todas las piezas del molde', 'Cuenta las piezas: delantero, espalda, mangas, pretina… Que no falte ninguna.'],
    ['medidas', 'Revisé las medidas del molde', 'Compara el molde con las medidas de la persona antes de cortar: corregir el papel es gratis, la tela no.'],
    ['margen', 'El molde tiene margen de costura', 'Sin margen, la prenda queda más chica al coser.'],
    ['nombres', 'Cada pieza dice su nombre y cuántas cortar', 'Ejemplo: «Delantero – cortar 1 al doblez». Así no te confundes.'],
  ] },
  { nombre: 'Al acomodar', icono: '📏', items: [
    ['doblez', 'La tela está doblada orillo con orillo', 'El doblez debe quedar recto y parejo para que las piezas salgan iguales.'],
    ['hilo', 'La flecha del hilo está paralela al orillo', 'Mide con una regla la distancia de la flecha al orillo en sus dos puntas: tiene que ser la misma.'],
    ['aldoblez', 'Las piezas «al doblez» están pegadas al doblez', 'Si quedan separadas, la pieza sale partida o más ancha.'],
    ['direccion', 'Si la tela tiene pelo o dibujo con dirección, todas las piezas van en el mismo sentido', 'Si no, una pieza se ve de otro color o con el dibujo de cabeza.'],
    ['alfileres', 'Sujeté el molde con alfileres o pesas', 'Así no se mueve mientras cortas.'],
  ] },
  { nombre: 'Al cortar', icono: '✂️', items: [
    ['tijera', 'Uso la tijera solo para tela, bien afilada', 'Una tijera sin filo mastica la tela y el corte sale chueco.'],
    ['piquetes', 'Marqué los piquetes', 'Son las señales para unir las piezas en el lugar correcto.'],
    ['pinzas', 'Marqué las pinzas y bolsillos con tiza o papel carbón', 'Después de sacar el molde ya no sabrás dónde iban.'],
    ['revisar', 'Revisé todo antes de sacar el molde', 'Confirma que cortaste todas las piezas y las veces que dice el molde.'],
  ] },
];
const TOTAL = GRUPOS.reduce((s, g) => s + g.items.length, 0);

export function mostrar(main) {
  const zona = document.createElement('div');
  main.replaceChildren(zona);
  const marcadas = new Set(leer('lista-corte', []));

  const pintar = () => {
    const listo = marcadas.size === TOTAL;
    zona.innerHTML = `
      <h1>Antes de cortar</h1>
      <p class="ayuda">Marca cada punto antes de meter la tijera. Toca «¿Por qué?» para saber la razón.</p>
      <div class="progreso" role="progressbar" aria-valuenow="${marcadas.size}" aria-valuemax="${TOTAL}"><span style="width:${(marcadas.size / TOTAL) * 100}%"></span></div>
      <p class="contador">${marcadas.size} de ${TOTAL} listos</p>
      ${listo ? '<p class="resultado listo-cortar">✅ ¡Todo listo! Ya puedes cortar.</p>' : ''}
      ${GRUPOS.map((g) => `
        <section class="zona">
          <header class="zona-cabeza"><span class="grupo-icono" aria-hidden="true">${g.icono}</span>
            <div><h2>${g.nombre}</h2><small>${g.items.filter(([id]) => marcadas.has(id)).length} de ${g.items.length}</small></div></header>
          <ul class="lista-control">${g.items.map(([id, texto, porque]) => `
            <li>
              <label class="control"><input type="checkbox" value="${id}" ${marcadas.has(id) ? 'checked' : ''}><span>${texto}</span></label>
              <details><summary>¿Por qué?</summary><p>${porque}</p></details>
            </li>`).join('')}
          </ul>
        </section>`).join('')}
      <button type="button" class="btn btn-secundario btn-ancho" id="limpiar" ${marcadas.size ? '' : 'disabled'}>↺ Desmarcar todo (para la próxima prenda)</button>
      <a class="enlace" href="#/herramientas/diccionario">¿No sabes qué es orillo, piquete o al doblez? Mira el diccionario</a>`;
  };

  zona.addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;
    if (e.target.checked) marcadas.add(e.target.value); else marcadas.delete(e.target.value);
    guardar('lista-corte', [...marcadas]);
    const y = window.scrollY;
    pintar();
    window.scrollTo(0, y);
    zona.querySelector(`input[value="${e.target.value}"]`)?.focus({ preventScroll: true });
  });
  zona.addEventListener('click', (e) => {
    if (e.target.id !== 'limpiar') return;
    marcadas.clear();
    guardar('lista-corte', []);
    pintar();
  });
  pintar();
  return '#/herramientas';
}
