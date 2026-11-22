// Íconos dibujados a mano para Mi Taller (en vez de emojis): contorno café,
// colores suaves y detalles de costura. Cada uno trae su color de fondo.
const TRAZO = 'fill="none" stroke="#3B2A25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const svg = (contenido) => `<svg viewBox="0 0 48 48" ${TRAZO} aria-hidden="true" focusable="false">${contenido}</svg>`;
const LINEA = 'stroke="#B79E8F" stroke-width="1.5"';
const PUNTADA = 'stroke="#9E2F45" stroke-width="1.3" stroke-dasharray="2 2.2"';

export const ICONOS = {
  // Libreta con una cinta métrica encima
  guardadas: {
    fondo: '#FCE3EA',
    svg: svg(`
      <rect x="11" y="6" width="25" height="32" rx="3" fill="#FFF8EE"/>
      <path d="M16 6v32" stroke-width="1.6"/>
      <path d="M11 9h5v26h-5" fill="#E8A0B4" stroke="none"/>
      <rect x="11" y="6" width="25" height="32" rx="3"/>
      <path d="M20 13h11M20 18h11M20 23h7" ${LINEA}/>
      <path d="M30.5 26.2c-1-1.3-3-.6-2.6 1 .3 1.2 2.6 2.6 2.6 2.6s2.3-1.4 2.6-2.6c.4-1.6-1.6-2.3-2.6-1z" fill="#E8A0B4" stroke-width="1.2"/>
      <g transform="rotate(-16 24 36)">
        <rect x="3" y="32" width="42" height="8" rx="2" fill="#F6D06B"/>
        <path d="M8 32v3M12 32v2M16 32v3M20 32v2M24 32v4M28 32v2M32 32v3M36 32v2M40 32v3" stroke-width="1.2"/>
      </g>`),
  },
  // Rollo de tela con lunares que se desenrolla, con una costura
  tela: {
    fondo: '#E3EEF9',
    svg: svg(`
      <path d="M11 24v15q4 3 7.5 0t7.5 0 7.5 0 2.5-1V24z" fill="#F3C3D1"/>
      <path d="M14 33h20" ${PUNTADA}/>
      <path d="M37 9H11a4 7.5 0 0 0 0 15h26" fill="#E8A0B4"/>
      <ellipse cx="37" cy="16.5" rx="4" ry="7.5" fill="#F3C3D1"/>
      <ellipse cx="37" cy="16.5" rx="1.4" ry="2.6" fill="#FFF8EE" stroke-width="1.4"/>
      <g fill="#FFF8EE" stroke="none"><circle cx="15" cy="13" r="1.4"/><circle cx="21" cy="19" r="1.4"/><circle cx="27" cy="12.5" r="1.4"/><circle cx="31" cy="19.5" r="1.4"/><circle cx="17" cy="29" r="1.2"/><circle cx="27" cy="28" r="1.2"/><circle cx="22" cy="37" r="1.2"/></g>`),
  },
  // Etiqueta de precio con «Bs», un hilo y una moneda
  costos: {
    fondo: '#FFF1CC',
    svg: svg(`
      <path d="M33 14.5q6-10 11-6" stroke="#9E2F45" stroke-width="1.6"/>
      <path d="M24 7h13q3 0 3 3v14L24.1 40a3 3 0 0 1-4.2 0L7.5 27.6a3 3 0 0 1 0-4.2z" fill="#F6D06B"/>
      <path d="M25.6 11h10.4v11.6L22 36.6 11.3 25.9z" ${PUNTADA} stroke="#B5852A"/>
      <circle cx="32" cy="15.5" r="2.4" fill="#FFF8EE" stroke-width="1.6"/>
      <text x="21.5" y="29" transform="rotate(-45 21.5 25.5)" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="10.5" fill="#3B2A25" stroke="none" text-anchor="middle">Bs</text>
      <circle cx="38" cy="37" r="6.5" fill="#E9B949"/>
      <circle cx="38" cy="37" r="3.8" stroke="#B5852A" stroke-width="1.3"/>`),
  },
  // Hoja de cotización con un lápiz escribiendo
  cotizaciones: {
    fondo: '#E6F3EA',
    svg: svg(`
      <path d="M8 5h20l8 8v30H8z" fill="#FFF8EE"/>
      <path d="M28 5v8h8" fill="#EADFD2"/>
      <path d="M13 15h10M13 21h16M13 27h9" ${LINEA}/>
      <rect x="12" y="32" width="11" height="6" rx="3" fill="#B9D8C2" stroke-width="1.5"/>
      <g transform="translate(-4 1) rotate(42 34 30)">
        <path d="M31 16h6v17h-6z" fill="#F6D06B"/>
        <path d="M31 13h6v3h-6z" fill="#E8A0B4"/>
        <path d="M31 33l3 6 3-6z" fill="#F2C6A0"/>
        <path d="M33.4 37.8l.6 1.2.6-1.2z" fill="#3B2A25"/>
        <path d="M34 18v13" stroke="#D9A93A" stroke-width="1.2"/>
      </g>`),
  },
  // Libro abierto con aguja e hilo, y una chispita
  herramientas: {
    fondo: '#EEE6F7',
    svg: svg(`
      <path d="M4 18v22q10-3 20 2 10-5 20-2V18" fill="#A9C6E8"/>
      <path d="M24 18q-8-5-17-3v23q9-2 17 2z" fill="#FFF8EE"/>
      <path d="M24 18q8-5 17-3v23q-9-2-17 2z" fill="#FFF8EE"/>
      <path d="M11 21q5-1 9 1M11 26q5-1 9 1M11 31q5-1 9 1M28 22q4-2 9-1M28 27q4-2 9-1" ${LINEA} stroke-width="1.3"/>
      <path d="M28 31.5q4.5-2 9-1" ${PUNTADA}/>
      <path d="M27 11L42 3" stroke="#8A8F98" stroke-width="2.2"/>
      <ellipse cx="39.6" cy="4.3" rx="1.6" ry=".7" transform="rotate(-28 39.6 4.3)" stroke="#3B2A25" stroke-width="1"/>
      <path d="M40 4.2q6 4 0 8t-8 2.5q-4-1.5-8 3" stroke="#9E2F45" stroke-width="1.6"/>
      <path d="M11 4l1.2 2.8 2.8 1.2-2.8 1.2L11 12l-1.2-2.8L7 8l2.8-1.2z" fill="#F6D06B" stroke-width="1.3"/>`),
  },
  // Carrete de hilo cuyo hilo dibuja un signo de pregunta
  ayuda: {
    fondo: '#FDE8DA',
    svg: svg(`
      <rect x="9" y="28" width="14" height="12" fill="#E8A0B4"/>
      <path d="M9 32l14-3M9 36l14-3M9 40l14-3" stroke="#C26F87" stroke-width="1.2"/>
      <rect x="6" y="24" width="20" height="4.5" rx="2" fill="#D9B48F"/>
      <rect x="6" y="39.5" width="20" height="4.5" rx="2" fill="#D9B48F"/>
      <path d="M22 31q-7-8 0-15 2-10 12-10 9 0 9 8 0 6-5.5 8.5T33 30v2" stroke="#9E2F45" stroke-width="3"/>
      <circle cx="33" cy="38.5" r="2.4" fill="#9E2F45" stroke="none"/>`),
  },
  opinion: {
    fondo: '#EEE6F7',
    svg: svg(`
      <path d="M11 8h26a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H22l-11 8v-8a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5z" fill="#D8C5E8"/>
      <path d="M13 16h22M13 22h16" stroke-width="2.2"/>`),
  },
  // Cinta métrica en su estuche redondo
  conversor: {
    fondo: '#FFF1CC',
    svg: svg(`
      <path d="M20 32h22v8H20z" fill="#F6D06B"/>
      <path d="M25 32v3M29 32v2M33 32v3M37 32v2" stroke-width="1.2"/>
      <path d="M42 30v12" stroke-width="2.6"/>
      <circle cx="20" cy="21" r="14" fill="#E8A0B4"/>
      <circle cx="20" cy="21" r="10" ${PUNTADA}/>
      <circle cx="20" cy="21" r="5" fill="#FFF8EE"/>
      <circle cx="20" cy="21" r="1.8" fill="#9E2F45" stroke="none"/>`),
  },
  // Maniquí con la cinta en la cintura
  guia: {
    fondo: '#FCE3EA',
    svg: svg(`
      <path d="M24 34v7M16 43h16" stroke-width="2.4"/>
      <rect x="21.5" y="4" width="5" height="4.5" rx="1.5" fill="#D9B48F"/>
      <path d="M24 8c6 0 11 0 11 3 0 4-4 6-4 9 0 4 4 6 3 10-1 3-5 4-10 4s-9-1-10-4c-1-4 3-6 3-10 0-3-4-5-4-9 0-3 5-3 11-3z" fill="#EBDCCB"/>
      <path d="M24 11v8M24 25v7" ${PUNTADA}/>
      <path d="M16.6 20.5q7.4 3.5 14.8 0" stroke-width="5"/>
      <path d="M16.6 20.5q7.4 3.5 14.8 0" stroke="#F6D06B" stroke-width="2.6"/>`),
  },
  // Libro cerrado con «Aa» y su cintita
  diccionario: {
    fondo: '#E3EEF9',
    svg: svg(`
      <rect x="13" y="8" width="26" height="34" rx="2" fill="#FFF8EE"/>
      <path d="M28 38v7l2.5-2 2.5 2v-7" fill="#E8A0B4"/>
      <rect x="9" y="4" width="26" height="34" rx="2.5" fill="#A9C6E8"/>
      <path d="M14 4v34" stroke-width="1.6"/>
      <rect x="18" y="11" width="13" height="11" rx="2" fill="#FFF8EE" stroke-width="1.6"/>
      <text x="24.5" y="19.8" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="8.5" fill="#3B2A25" stroke="none" text-anchor="middle">Aa</text>
      <path d="M18 29h13" ${PUNTADA}/>`),
  },
  // Hoja de ejercicios con casillas marcadas y una estrella
  ejercicios: {
    fondo: '#E6F3EA',
    svg: svg(`
      <rect x="7" y="5" width="27" height="36" rx="3" fill="#FFF8EE"/>
      <rect x="11" y="11" width="6" height="6" rx="1.5" fill="#B9D8C2" stroke-width="1.6"/>
      <rect x="11" y="20" width="6" height="6" rx="1.5" fill="#B9D8C2" stroke-width="1.6"/>
      <rect x="11" y="29" width="6" height="6" rx="1.5" fill="#FFF8EE" stroke-width="1.6"/>
      <path d="M12.3 14l1.6 1.6 2.8-3.2M12.3 23l1.6 1.6 2.8-3.2" stroke="#2E7A4E" stroke-width="1.8"/>
      <path d="M20 14h10M20 23h10M20 32h6" ${LINEA}/>
      <path d="M37 28l2.1 5.1 5.5.4-4.2 3.6 1.3 5.4-4.7-2.9-4.7 2.9 1.3-5.4-4.2-3.6 5.5-.4z" fill="#F6D06B"/>`),
  },
  // Cronómetro con borde cosido
  cronometro: {
    fondo: '#FDE8DA',
    svg: svg(`
      <rect x="20.5" y="3" width="7" height="5" rx="1.5" fill="#D9B48F"/>
      <path d="M35.5 12.5l3-3" stroke-width="3.2"/>
      <circle cx="24" cy="26" r="17" fill="#F2C6A0"/>
      <circle cx="24" cy="26" r="14.5" ${PUNTADA}/>
      <circle cx="24" cy="26" r="12" fill="#FFF8EE"/>
      <path d="M24 16v2M34 26h-2M24 36v-2M14 26h2" stroke-width="1.6"/>
      <path d="M24 26v-7M24 26l5 3" stroke="#9E2F45" stroke-width="2.2"/>
      <circle cx="24" cy="26" r="1.6" fill="#3B2A25" stroke="none"/>`),
  },
  // Portapapeles con la lista marcada
  lista: {
    fondo: '#EEE6F7',
    svg: svg(`
      <rect x="8" y="7" width="32" height="38" rx="3" fill="#D9B48F"/>
      <rect x="12" y="12" width="24" height="29" rx="1.5" fill="#FFF8EE"/>
      <rect x="17" y="4" width="14" height="7" rx="2" fill="#A9C6E8"/>
      <circle cx="24" cy="7.5" r="1.3" fill="#FFF8EE" stroke-width="1.2"/>
      <path d="M15.5 19l2 2 3.5-4M15.5 26l2 2 3.5-4M15.5 33l2 2 3.5-4" stroke="#2E7A4E" stroke-width="2"/>
      <path d="M24 19.5h8M24 26.5h8M24 33.5h6" ${LINEA}/>`),
  },
  // Pieza de molde en papel, con línea de costura, piquete y hilo recto
  molde: {
    fondo: '#FCE3EA',
    svg: svg(`
      <path d="M9 6h14q1 6 8 6l7-2-1 12q-3 4-1 8l2 12H9z" fill="#F7E6C4"/>
      <path d="M12 9h8.5q2 6 10.5 6l3.8-1-.7 7.5q-3 4.5-.6 9l1.5 8.5H12z" ${PUNTADA}/>
      <path d="M21 19v16M19 21.5l2-3 2 3M19 32.5l2 3 2-3" stroke-width="1.5"/>
      <path d="M9 24l3 1.5L9 27" stroke-width="1.5"/>`),
  },
  // Alfiletero de tomate con alfileres
  alfiletero: {
    fondo: '#E6F3EA',
    svg: svg(`
      <path d="M17 24L10 9M31 23l7-14M34 28l9-8" stroke="#8A8F98" stroke-width="1.6"/>
      <circle cx="10" cy="9" r="2.6" fill="#F6D06B"/>
      <circle cx="38" cy="9" r="2.6" fill="#A9C6E8"/>
      <circle cx="43" cy="20" r="2.6" fill="#CDB8E0"/>
      <ellipse cx="24" cy="31" rx="17" ry="12" fill="#E8A0B4"/>
      <path d="M24 20v22M14 22.5q-4 8.5 0 17M34 22.5q4 8.5 0 17" stroke="#C26F87" stroke-width="1.4"/>
      <path d="M24 20l-6-3.5 4.5.3L24 12l1.5 4.8 4.5-.3z" fill="#B9D8C2" stroke-width="1.5"/>`),
  },
  // Máquina de coser con tela bajo la aguja
  maquina: {
    fondo: '#FCE3EA',
    svg: svg(`
      <rect x="4" y="37" width="40" height="6" rx="2" fill="#D9B48F"/>
      <path d="M9 37V14q0-4 4-4h23q4 0 4 4v13h-7v-9H17v19z" fill="#E8A0B4"/>
      <path d="M14 14h20" ${PUNTADA} stroke="#FFF8EE"/>
      <rect x="22" y="4" width="6" height="6" rx="1.2" fill="#A9C6E8"/>
      <circle cx="13" cy="27" r="2.2" fill="#FFF8EE" stroke-width="1.5"/>
      <path d="M24 34h17v3H24z" fill="#A9C6E8" stroke-width="1.5"/>
      <path d="M36.5 27v5" stroke="#6B5E57" stroke-width="1.8"/>
      <path d="M33.5 32.5h6" stroke-width="2"/>`),
  },
  // Celular que funciona: wifi y una marca de «bien»
  celular: {
    fondo: '#E3EEF9',
    svg: svg(`
      <rect x="11" y="5" width="22" height="38" rx="4" fill="#FFF8EE"/>
      <rect x="14.5" y="10" width="15" height="26" rx="1.5" fill="#A9C6E8" stroke-width="1.6"/>
      <circle cx="22" cy="39.5" r="1.3" fill="#3B2A25" stroke="none"/>
      <path d="M18.5 24.5a5 5 0 0 1 7 0M16 21.3a8.5 8.5 0 0 1 12 0" stroke-width="1.8"/>
      <circle cx="22" cy="28" r="1.6" fill="#3B2A25" stroke="none"/>
      <circle cx="35" cy="35" r="7.5" fill="#B9D8C2"/>
      <path d="M31.8 35.2l2.2 2.2 4.3-4.6" stroke="#2E7A4E" stroke-width="2.2"/>`),
  },
  // Carrete de hilo con aguja enhebrada
  hilo: {
    fondo: '#E3EEF9',
    svg: svg(`
      <rect x="14" y="11" width="16" height="26" fill="#A9C6E8"/>
      <path d="M14 17l16-3M14 22l16-3M14 27l16-3M14 32l16-3M14 37l16-3" stroke="#7FA3CC" stroke-width="1.2"/>
      <rect x="11" y="6" width="22" height="5" rx="2" fill="#D9B48F"/>
      <rect x="11" y="37" width="22" height="5" rx="2" fill="#D9B48F"/>
      <path d="M30 24c7 0 6-9 11.5-6.5" stroke="#9E2F45" stroke-width="1.5"/>
      <path d="M33 42L43 15" stroke="#8A8F98" stroke-width="2.2"/>
      <ellipse cx="42.2" cy="17.4" rx="1.5" ry=".6" transform="rotate(-70 42.2 17.4)" stroke-width="1"/>`),
  },
  // Monedas que suben: la ganancia
  monedas: {
    fondo: '#FFF1CC',
    svg: svg(`
      <path d="M6 36v4a10 4 0 0 0 20 0v-4" fill="#E9B949"/><ellipse cx="16" cy="36" rx="10" ry="4" fill="#F6D06B"/>
      <path d="M6 30v4a10 4 0 0 0 20 0v-4" fill="#E9B949"/><ellipse cx="16" cy="30" rx="10" ry="4" fill="#F6D06B"/>
      <path d="M6 24v4a10 4 0 0 0 20 0v-4" fill="#E9B949"/><ellipse cx="16" cy="24" rx="10" ry="4" fill="#F6D06B"/>
      <path d="M28 38v4a8 3.2 0 0 0 16 0v-4" fill="#E9B949"/><ellipse cx="36" cy="38" rx="8" ry="3.2" fill="#F6D06B"/>
      <path d="M36 30V8M30.5 13.5L36 8l5.5 5.5" stroke="#2E7A4E" stroke-width="2.8"/>`),
  },
  // Cierre (cremallera) con su jalador
  cierre: {
    fondo: '#E3EEF9',
    svg: svg(`
      <rect x="16" y="4" width="16" height="40" rx="2" fill="#A9C6E8"/>
      <path d="M21 8h3M24 11h3M21 14h3M24 17h3M21 20h3" stroke="#6B5E57" stroke-width="2"/>
      <path d="M19 34h3M26 34h3M18.5 39h3M26.5 39h3" stroke="#6B5E57" stroke-width="2"/>
      <path d="M19.5 23h9l-1.5 7h-6z" fill="#F6D06B"/>
      <path d="M24 30v5" stroke-width="2.6"/>
      <circle cx="24" cy="37.5" r="2.5" fill="#F6D06B" stroke-width="1.6"/>`),
  },
  // Botón de cuatro agujeros cosido
  boton: {
    fondo: '#FCE3EA',
    svg: svg(`
      <circle cx="24" cy="24" r="17" fill="#E8A0B4"/>
      <circle cx="24" cy="24" r="12.5" stroke="#C26F87" stroke-width="1.5"/>
      <g fill="#FFF8EE" stroke-width="1.4"><circle cx="20" cy="20" r="2.4"/><circle cx="28" cy="20" r="2.4"/><circle cx="20" cy="28" r="2.4"/><circle cx="28" cy="28" r="2.4"/></g>
      <path d="M20 20l8 8M28 20l-8 8" stroke="#9E2F45" stroke-width="1.8"/>`),
  },
  // Gancho de falda
  gancho: {
    fondo: '#EEE6F7',
    svg: svg(`
      <path d="M9 17h17q10 0 10 8t-9 8h-3" stroke-width="5.4"/>
      <path d="M9 17h17q10 0 10 8t-9 8h-3" stroke="#C7CBD1" stroke-width="2.8"/>
      <path d="M11 12q-6 5 0 10" stroke-width="5"/><path d="M11 12q-6 5 0 10" stroke="#C7CBD1" stroke-width="2.4"/>
      <path d="M14 31h10" ${PUNTADA}/>`),
  },
  // Elástico ondulado
  elastico: {
    fondo: '#FDE8DA',
    svg: svg(`
      <rect x="4" y="15" width="40" height="18" rx="3" fill="#F6D06B"/>
      <path d="M7 20.5q4-3 8 0t8 0 8 0 8 0 4 0M7 27.5q4-3 8 0t8 0 8 0 8 0 4 0" stroke="#B5852A" stroke-width="1.5"/>`),
  },
  // Moño de cinta (encaje, adornos)
  encaje: {
    fondo: '#FCE3EA',
    svg: svg(`
      <path d="M22 27l-6 14 4-1.5 2 3.5 3-15M26 27l6 14-4-1.5-2 3.5-3-15" fill="#E8A0B4"/>
      <path d="M24 24C16 13 5 15 7 24c-2 9 9 11 17 0zM24 24c8-11 19-9 17 0 2 9-9 11-17 0z" fill="#E8A0B4"/>
      <path d="M11 24h7M30 24h7" ${PUNTADA}/>
      <rect x="20.5" y="20" width="7" height="8" rx="2.5" fill="#C26F87"/>`),
  },
  // Cajita (cualquier otro material)
  paquete: {
    fondo: '#FDE8DA',
    svg: svg(`
      <path d="M8 17l16 6v19L8 36z" fill="#D9B48F"/>
      <path d="M24 23l16-6v19l-16 6z" fill="#C9A27C"/>
      <path d="M8 17l16-6 16 6-16 6z" fill="#EBCBA5"/>
      <path d="M16 14l16 6v6" stroke="#9E2F45" stroke-width="2.4"/>`),
  },
  // Basurero (para borrar)
  papelera: {
    fondo: '#FCE3EA',
    svg: svg(`
      <path d="M14 15l2 27h16l2-27z" fill="#A9C6E8"/>
      <path d="M20 20l.6 17M24 20v17M28 20l-.6 17" stroke="#7FA3CC" stroke-width="1.6"/>
      <path d="M10 13h28" stroke-width="2.6"/>
      <path d="M20 13V9h8v4" stroke-width="2"/>`),
  },
  // Escarapela con estrella (¡terminaste!)
  medalla: {
    fondo: '#FFF1CC',
    svg: svg(`
      <path d="M18 28l-5 16 5-3 3 4 4-13" fill="#E8A0B4"/>
      <path d="M30 28l5 16-5-3-3 4-4-13" fill="#A9C6E8"/>
      <circle cx="24" cy="20" r="15" fill="#F6D06B"/>
      <circle cx="24" cy="20" r="12" ${PUNTADA}/>
      <circle cx="24" cy="20" r="8.5" fill="#FFF8EE"/>
      <path d="M24 14.5l1.5 3.6 3.9.3-3 2.6.9 3.8-3.3-2-3.3 2 .9-3.8-3-2.6 3.9-.3z" fill="#9E2F45" stroke="none"/>`),
  },
  // Tijeras para el botón principal (sobre fondo vino)
  tijeras: {
    fondo: '#FDE8DA',
    svg: `<svg viewBox="0 0 48 48" fill="none" stroke="#3B2A25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d="M17 17.6L24 24M17 30.4L24 24" stroke-width="4.4"/><path d="M17 17.6L24 24M17 30.4L24 24" stroke="#F6D06B" stroke-width="2"/>
      <path d="M22 25.8L43 6.5" stroke-width="5"/><path d="M22 25.8L43 6.5" stroke="#F4F1EC" stroke-width="2.6"/>
      <path d="M22 22.2L43 41.5" stroke-width="5"/><path d="M22 22.2L43 41.5" stroke="#E4E0DA" stroke-width="2.6"/>
      <circle cx="24" cy="24" r="2" fill="#9E2F45" stroke-width="1.2"/>
      <circle cx="12" cy="13" r="6.5" fill="#F6D06B"/><circle cx="12" cy="13" r="2.8" fill="#9E2F45" stroke-width="1.5"/>
      <circle cx="12" cy="35" r="6.5" fill="#F6D06B"/><circle cx="12" cy="35" r="2.8" fill="#9E2F45" stroke-width="1.5"/></svg>`,
  },
};

// Dibujo dentro de su cuadrito de color. «clase» da el tamaño según dónde va (menu-icono, grupo-icono…)
export function dibujo(nombre, clase = '') {
  const i = ICONOS[nombre] ?? ICONOS.paquete;
  return `<span class="dibujo ${clase}" style="--fondo-icono:${i.fondo}" aria-hidden="true">${i.svg}</span>`;
}

// Ícono de un material según su nombre ("entretela" va antes que "tela" porque la contiene)
const MATERIALES = [['entretela', 'tela'], ['tela', 'tela'], ['cierre', 'cierre'], ['hilo', 'hilo'], ['boton', 'boton'],
  ['gancho', 'gancho'], ['elastico', 'elastico'], ['encaje', 'encaje'], ['cinta', 'encaje']];
export function iconoMaterial(nombre) {
  const t = String(nombre).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return MATERIALES.find(([p]) => t.includes(p))?.[1] ?? 'paquete';
}
