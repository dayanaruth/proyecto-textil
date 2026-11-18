// Dibujos para reconocer a cada persona de un vistazo (sin fotos: no pesan y cuidan la privacidad)
const PIEL = '#F1C9A5';
const pelo = {
  largo: '<path fill="#5B3A29" d="M17 28 Q17 11 32 11 Q47 11 47 28 V46 H17 Z"/>',
  corto: '<path fill="#3E2A20" d="M20 25 Q20 12 32 12 Q44 12 44 25 Q39 18 32 19 Q25 18 20 25 Z"/>',
  flequillo: '<path fill="#5B3A29" d="M21 23 Q22 13 32 13 Q42 13 43 23 Q37 18 32 20 Q27 18 21 23 Z"/>',
  colitas: '<circle cx="17" cy="25" r="5" fill="#7A4B2E"/><circle cx="47" cy="25" r="5" fill="#7A4B2E"/><path fill="#7A4B2E" d="M21 24 Q21 13 32 13 Q43 13 43 24 Q37 18 32 19 Q27 18 21 24 Z"/>',
  monito: '<circle cx="32" cy="11" r="5.5" fill="#B9B4AE"/><path fill="#B9B4AE" d="M20 25 Q20 13 32 13 Q44 13 44 25 Q38 18 32 19 Q26 18 20 25 Z"/>',
  gorra: '<path fill="#3E2A20" d="M21 24 Q21 14 32 14 Q43 14 43 24 Q38 19 32 20 Q26 19 21 24 Z"/>',
};

const dibujo = ({ fondo, ropa, atras = '', adelante = '', chico = false }) => {
  const cabeza = chico ? 10 : 11;
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="${fondo}"/>
    ${atras}
    <path fill="${ropa}" d="M${chico ? 16 : 13} 64 Q${chico ? 17 : 15} 44 32 43 Q${chico ? 47 : 49} 44 ${chico ? 48 : 51} 64 Z"/>
    <rect x="28" y="34" width="8" height="9" rx="3" fill="${PIEL}"/>
    <circle cx="32" cy="26" r="${cabeza}" fill="${PIEL}"/>
    ${adelante}
    <circle cx="28" cy="27" r="1.3" fill="#2B2420"/><circle cx="36" cy="27" r="1.3" fill="#2B2420"/>
    <path d="M28.5 31.5 Q32 34 35.5 31.5" fill="none" stroke="#2B2420" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
};

export const AVATARES = [
  { id: 'mujer', nombre: 'Mujer', tipo: 'dama', svg: dibujo({ fondo: '#F6E3E7', ropa: '#E8A0B4', atras: pelo.largo, adelante: pelo.flequillo }) },
  { id: 'hombre', nombre: 'Varón', tipo: 'varon', svg: dibujo({ fondo: '#E2ECF7', ropa: '#6C8EBF', adelante: pelo.corto }) },
  { id: 'senora', nombre: 'Señora', tipo: 'dama', svg: dibujo({ fondo: '#EEE6F3', ropa: '#8B6F9E', adelante: pelo.monito }) },
  { id: 'nina', nombre: 'Niña', tipo: 'dama', svg: dibujo({ fondo: '#FCEBDD', ropa: '#F2B98A', adelante: pelo.colitas, chico: true }) },
  { id: 'nino', nombre: 'Niño', tipo: 'varon', svg: dibujo({ fondo: '#E3F2EC', ropa: '#7FB7A4', adelante: pelo.gorra, chico: true }) },
];

export const avatar = (id) => AVATARES.find((a) => a.id === id) ?? AVATARES[0];
