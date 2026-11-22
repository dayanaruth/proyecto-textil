import { leer, guardar } from '../datos/almacenamiento.js';

export const URL_ENCUESTA = 'https://docs.google.com/forms/d/e/1FAIpQLScHEpy3C69SpdwoUCbGVbVStNaZJ1c-5eiwJ_UBvhJobyAJHA/viewform';

let prendaTerminada = false;
let invitacionVista = false;

export function terminarPrenda() {
  prendaTerminada = true;
}

export function mostrarInvitacionSiCorresponde() {
  if (!prendaTerminada) return false;
  prendaTerminada = false;
  if (invitacionVista || leer('invitacion-opinion-vista', false)) return false;
  invitacionVista = true;
  guardar('invitacion-opinion-vista', true);
  return true;
}
