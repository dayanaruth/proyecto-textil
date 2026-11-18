// Diccionario de costura: palabras del taller y galería de cuellos, mangas y bolsillos.
// Cada dibujo usa figuras simples (cuerpo de blusa, falda, pantalón, camisa, tela)
// y marca en rojo la parte que explica.
const TINTA = '#2B2420', TELA = '#F2E6DA', ROJO = '#9E2F45';
const svg = (contenido) => `<svg viewBox="0 0 100 70" aria-hidden="true"><g stroke="${TINTA}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">${contenido}</g></svg>`;
const rojo = (d, extra = '') => `<path d="${d}" fill="none" stroke="${ROJO}" stroke-width="3"${extra}/>`;
const relleno = (d) => `<path d="${d}" fill="${ROJO}" fill-opacity=".3" stroke="${ROJO}" stroke-width="2"/>`;
const flecha = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${ROJO}" stroke-width="2" marker-start="url(#f)" marker-end="url(#f)"/>`;
const puntas = `<defs><marker id="f" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 Z" fill="${ROJO}" stroke="none"/></marker></defs>`;

// Figuras base
const BLUSA = `<path fill="${TELA}" d="M30 8 Q50 20 70 8 L82 12 Q76 26 80 34 L77 62 H23 L20 34 Q24 26 18 12 Z"/>`;
const FALDA = `<path fill="${TELA}" d="M30 13 H70 L77 64 H23 Z"/><rect x="30" y="6" width="40" height="7" fill="${TELA}"/>`;
const PANTALON = `<path fill="${TELA}" d="M28 10 H72 L76 66 H56 L50 30 L44 66 H24 Z"/><rect x="28" y="4" width="44" height="6" fill="${TELA}"/>`;
const CAMISA = `<path fill="${TELA}" d="M30 10 L40 6 L50 16 L60 6 L70 10 L82 14 L80 66 H20 L18 14 Z"/><path fill="#fff" d="M40 6 L50 16 L60 6 L57 3 L50 11 L43 3 Z"/>`;
const TELA_RECT = `<rect x="8" y="10" width="84" height="50" fill="${TELA}"/>`;
const BRAZOS = `<path fill="${TELA}" d="M18 12 L6 40 L13 43 L22 22 Z M82 12 L94 40 L87 43 L78 22 Z"/>`;

export const PALABRAS = [
  { id: 'holgura', palabra: 'Holgura', que: 'Espacio extra que se deja entre el cuerpo y la prenda para poder moverse y respirar. Sin holgura la prenda queda apretada.',
    dibujo: svg(`${puntas}${BLUSA}<path d="M34 14 Q50 22 66 14 L70 32 L68 60 H32 L30 32 Z" fill="none" stroke-dasharray="2 2"/>${flecha(68, 46, 77, 46)}`) },
  { id: 'pinza', palabra: 'Pinza', que: 'Doblez cosido en forma de triángulo que quita tela para dar forma al cuerpo: busto, cintura, cadera.',
    dibujo: svg(`${BLUSA}${relleno('M36 62 L40 40 L44 62 Z M56 62 L60 40 L64 62 Z')}`) },
  { id: 'sisa', palabra: 'Sisa', que: 'Curva del molde por donde pasa el brazo y donde se cose la manga.',
    dibujo: svg(`${BLUSA}${rojo('M82 12 Q76 26 80 34 M18 12 Q24 26 20 34')}`) },
  { id: 'escote', palabra: 'Escote', que: 'Abertura de la prenda alrededor del cuello. Puede ser redondo, en V, cuadrado…',
    dibujo: svg(`${BLUSA}${rojo('M30 8 Q50 20 70 8')}`) },
  { id: 'talle', palabra: 'Talle', que: 'Largo del cuerpo desde la base del cuello hasta la cintura. Se mide adelante (talle delantero) y atrás (talle de espalda).',
    dibujo: svg(`${puntas}${BLUSA}${flecha(50, 16, 50, 61)}`) },
  { id: 'hilo', palabra: 'Sentido del hilo', que: 'Dirección de los hilos de la tela, paralela al orillo. La flecha del molde debe ir en ese sentido para que la prenda caiga bien.',
    dibujo: svg(`${puntas}${TELA_RECT}<path d="M8 10 H92 M8 60 H92" stroke="${TINTA}" stroke-width="2.5"/>${flecha(22, 35, 78, 35)}`) },
  { id: 'orillo', palabra: 'Orillo', que: 'Borde de la tela que viene terminado de fábrica y no se deshilacha. Va a lo largo de toda la tela.',
    dibujo: svg(`${TELA_RECT}${rojo('M8 10 H92 M8 60 H92')}`) },
  { id: 'doblez', palabra: 'Al doblez', que: 'La pieza se apoya en el doblez de la tela y se corta sin cortar ese lado. Al abrirla sale entera y simétrica.',
    dibujo: svg(`${TELA_RECT}<path d="M30 16 H62 L66 54 H30 Z" fill="#fff"/>${rojo('M30 10 V60', ' stroke-dasharray="4 3"')}`) },
  { id: 'margen', palabra: 'Margen de costura', que: 'Tela que se deja por fuera de la línea de costura para poder coser. Se corta por la línea de afuera.',
    dibujo: svg(`<rect x="18" y="10" width="64" height="50" fill="${TELA}" stroke="${ROJO}" stroke-width="2.5"/><rect x="25" y="17" width="50" height="36" fill="none" stroke-dasharray="3 2"/>`) },
  { id: 'piquete', palabra: 'Piquete', que: 'Pequeño corte o marca en el borde del molde que indica dónde deben coincidir dos piezas al coser.',
    dibujo: svg(`<path d="M10 20 H90 V60 H10 Z" fill="${TELA}"/>${relleno('M30 20 L33 27 L36 20 Z M64 20 L67 27 L70 20 Z')}`) },
  { id: 'entretela', palabra: 'Entretela', que: 'Tela delgada que se pega o cose por dentro del cuello, puños o pretina para darles firmeza.',
    dibujo: svg(`<rect x="14" y="24" width="72" height="22" rx="4" fill="${TELA}"/>${relleno('M20 28 H80 V42 H20 Z')}`) },
  { id: 'pretina', palabra: 'Pretina', que: 'Tira de tela que se cose en la cintura de faldas y pantalones.',
    dibujo: svg(`${FALDA}${relleno('M30 6 H70 V13 H30 Z')}`) },
  { id: 'ruedo', palabra: 'Ruedo (basta)', que: 'Borde de abajo de la prenda, doblado hacia adentro y cosido.',
    dibujo: svg(`${FALDA}${relleno('M24 57 H76 L77 64 H23 Z')}`) },
  { id: 'tablon', palabra: 'Tablón', que: 'Pliegue doble que se dobla hacia los dos lados. Es típico de las faldas de uniforme.',
    dibujo: svg(`<path fill="${TELA}" d="M14 10 H86 L92 62 H8 Z"/>${rojo('M36 10 L34 62 M50 10 L50 62 M64 10 L66 62')}<path d="M43 10 L42 62 M57 10 L58 62" stroke-dasharray="2 2"/>`) },
  { id: 'tiro', palabra: 'Tiro', que: 'Curva del pantalón que va de la cintura a la entrepierna. Hay tiro delantero y tiro de espalda.',
    dibujo: svg(`${PANTALON}${rojo('M50 10 V22 Q50 30 46 32')}`) },
  { id: 'bota', palabra: 'Bota', que: 'Ancho del ruedo del pantalón, abajo en cada pierna.',
    dibujo: svg(`${PANTALON}${rojo('M24 66 H44 M56 66 H76')}`) },
  { id: 'plancha', palabra: 'Línea de plancha', que: 'Línea al centro de cada pierna del pantalón. Sigue el sentido del hilo y es donde va el filo al planchar.',
    dibujo: svg(`${PANTALON}${rojo('M35 10 V66 M65 10 V66', ' stroke-dasharray="4 3"')}`) },
  { id: 'canesu', palabra: 'Canesú', que: 'Pieza de arriba de la espalda de la camisa, entre los hombros. Va doble.',
    dibujo: svg(`${CAMISA}${relleno('M30 10 L40 6 L60 6 L70 10 L82 14 L81 22 H19 L18 14 Z')}`) },
  { id: 'cruce', palabra: 'Cruce', que: 'Parte en que un delantero pasa sobre el otro para poner botones y ojales.',
    dibujo: svg(`${CAMISA}${relleno('M47 16 H53 V66 H47 Z')}<g fill="${TINTA}" stroke="none"><circle cx="50" cy="26" r="1.5"/><circle cx="50" cy="38" r="1.5"/><circle cx="50" cy="50" r="1.5"/></g>`) },
  { id: 'vista', palabra: 'Vista', que: 'Tira de tela que va por dentro del borde (delantero, escote) para terminarlo limpio.',
    dibujo: svg(`${CAMISA}${relleno('M50 16 H60 V66 H50 Z')}<path d="M50 16 V66" stroke-dasharray="3 2"/>`) },
];

// Galería de modelos (como el afiche del taller, con dibujos propios)
const CUELLO = (d, extra = '') => svg(`${BLUSA}${extra}${relleno(d)}`);
const MANGA = (d) => svg(`<path fill="${TELA}" d="M32 8 Q50 18 68 8 L72 12 V64 H28 V12 Z"/>${relleno(d)}`);
export const GALERIA = {
  cuellos: [
    { nombre: 'Redondo', que: 'Escote redondo sin cuello, terminado con vista o sesgo.', dibujo: CUELLO('M30 8 Q50 22 70 8 L68 7 Q50 18 32 7 Z') },
    { nombre: 'En V', que: 'El escote baja en punta por adelante.', dibujo: CUELLO('M30 8 L50 30 L70 8 L67 8 L50 26 L33 8 Z') },
    { nombre: 'Cuadrado', que: 'Escote recto con esquinas.', dibujo: CUELLO('M32 8 V22 H68 V8 H65 V19 H35 V8 Z') },
    { nombre: 'Mao', que: 'Tira recta que sube alrededor del cuello, sin doblez.', dibujo: CUELLO('M33 2 H67 V10 Q50 18 33 10 Z') },
    { nombre: 'Bebé (Peter Pan)', que: 'Cuello plano y redondeado que cae sobre los hombros.', dibujo: CUELLO('M30 8 Q50 20 70 8 Q74 20 60 24 Q50 22 50 18 Q50 22 40 24 Q26 20 30 8 Z') },
    { nombre: 'Camisero', que: 'Cuello con pie de cuello y puntas, como el de la camisa.', dibujo: svg(`${CAMISA}${relleno('M40 6 L50 16 L60 6 L57 3 L50 11 L43 3 Z')}`) },
  ],
  mangas: [
    { nombre: 'Corta', que: 'Llega a la mitad del brazo, más o menos.', dibujo: MANGA('M72 12 L90 24 L84 34 L72 26 Z M28 12 L10 24 L16 34 L28 26 Z') },
    { nombre: 'Larga con puño', que: 'Llega a la muñeca y termina en un puño con botón.', dibujo: MANGA('M72 12 L84 58 L76 60 L70 30 Z M28 12 L16 58 L24 60 L30 30 Z') },
    { nombre: 'Abullonada (Julieta)', que: 'Con volumen fruncido en la copa.', dibujo: MANGA('M72 12 Q96 10 88 30 L76 28 Z M28 12 Q4 10 12 30 L24 28 Z') },
    { nombre: 'Mariposa (capa)', que: 'Cae suelta y amplia sobre el hombro.', dibujo: MANGA('M72 10 Q92 16 94 34 Q82 30 72 24 Z M28 10 Q8 16 6 34 Q18 30 28 24 Z') },
    { nombre: 'Ranglán', que: 'La costura va en diagonal del cuello a la axila; no tiene sisa redonda.', dibujo: svg(`<path fill="${TELA}" d="M32 8 Q50 18 68 8 L72 12 V64 H28 V12 Z"/>${relleno('M40 10 L28 30 L12 52 L20 56 L30 36 Z M60 10 L72 30 L88 52 L80 56 L70 36 Z')}`) },
  ],
  bolsillos: [
    { nombre: 'De parche', que: 'Pieza cosida por encima de la prenda.', dibujo: svg(`${CAMISA}${relleno('M58 26 H70 V40 L64 43 L58 40 Z')}`) },
    { nombre: 'Con tapa', que: 'Bolsillo de parche con una tapa encima que se abotona.', dibujo: svg(`${CAMISA}${relleno('M58 30 H70 V42 H58 Z')}<path d="M57 25 H71 V31 L64 34 L57 31 Z" fill="${ROJO}" stroke="${ROJO}"/>`) },
    { nombre: 'Lateral (de costado)', que: 'Va escondido en la costura del costado.', dibujo: svg(`${PANTALON}${relleno('M28 12 Q36 14 36 24 L28 26 Z M72 12 Q64 14 64 24 L72 26 Z')}`) },
    { nombre: 'Canguro', que: 'Bolsillo grande al frente, abierto a los dos lados.', dibujo: svg(`${CAMISA}${relleno('M32 44 L38 36 H62 L68 44 V58 H32 Z')}`) },
  ],
};
