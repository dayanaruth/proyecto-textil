// Marco ilustrado animado para la bienvenida: figuras de costura en contorno con una mancha
// tipo acuarela, que llegan volando desde los costados, se dibujan solas y quedan flotando.

// Dibujos de contorno (viewBox 0 0 100 100). "t" = trazo
// Las líneas punteadas (costuras) usan la clase "trazo-fijo": no se dibujan, aparecen al final
const t = (d, extra = '', clase = 'trazo') => `<path class="${clase}"${clase === 'trazo' ? ' pathLength="1"' : ''} d="${d}"${extra}/>`;
const c = (cx, cy, r) => `<circle class="trazo" pathLength="1" cx="${cx}" cy="${cy}" r="${r}"/>`;
const FIGURAS = {
  tijeras: c(28, 74, 11) + c(52, 84, 11) + t('M35 65 L84 14') + t('M45 76 L90 32') + c(62, 46, 2),
  carrete: t('M28 14 H72 V24 H28 Z') + t('M28 76 H72 V86 H28 Z') + t('M36 24 V76 M64 24 V76')
    + t('M36 32 L64 40 M36 42 L64 50 M36 52 L64 60 M36 62 L64 70') + t('M64 46 Q84 52 80 66 T94 84'),
  maquina: t('M8 82 H92') + t('M16 82 V42 Q16 26 32 26 H72 Q86 26 86 40 V56 H72 V46 H34 V82')
    + t('M72 56 V68 M69 68 H75 M72 68 V76') + c(86, 36, 7) + t('M40 34 H62'),
  cinta: c(36, 40, 22) + c(36, 40, 8) + t('M52 56 Q72 64 64 80 T88 94')
    + t('M57 59 l3 -4 M63 63 l4 -3 M66 70 l5 -1 M65 77 l5 1 M70 86 l3 4 M78 90 l2 4'),
  alfiletero: t('M20 62 Q50 18 80 62 Z') + t('M18 62 H82 V72 Q50 82 18 72 Z')
    + t('M38 44 L30 20 M52 38 L54 12 M64 46 L76 24') + c(30, 18, 3) + c(54, 10, 3) + c(77, 22, 3),
  molde: t('M30 12 Q50 24 70 12 L84 18 Q78 34 82 44 L78 88 H22 L18 44 Q22 34 16 18 Z')
    + t('M34 20 Q50 30 66 20 L76 24 Q71 36 74 46 L71 81 H29 L26 46 Q29 36 24 24 Z', ' stroke-dasharray="4 4"', 'trazo-fijo')
    + t('M40 88 L44 70 L48 88') + t('M88 60 L96 52 M88 52 L96 60'),
  aguja: t('M18 86 L80 16') + t('M76 20 Q82 14 84 18 Q86 22 80 24')
    + t('M80 22 Q96 40 74 52 Q52 64 66 80 Q76 92 60 96'),
  botones: c(32, 34, 18) + c(26, 28, 2.5) + c(38, 28, 2.5) + c(26, 40, 2.5) + c(38, 40, 2.5)
    + c(70, 62, 13) + c(66, 62, 2) + c(74, 62, 2) + c(38, 80, 9) + c(36, 78, 1.6) + c(40, 82, 1.6),
  maniqui: t('M38 12 Q50 20 62 12 Q74 30 66 46 Q62 56 68 66 H32 Q38 56 34 46 Q26 30 38 12 Z')
    + t('M50 6 V12') + t('M50 66 V88') + t('M34 92 H66') + t('M40 26 Q50 32 60 26', ' stroke-dasharray="3 3"', 'trazo-fijo'),
  dedal: t('M32 84 V44 Q32 22 50 22 Q68 22 68 44 V84 Z') + t('M28 84 H72 V90 H28 Z')
    + c(42, 40, 1.6) + c(50, 34, 1.6) + c(58, 40, 1.6) + c(42, 52, 1.6) + c(50, 46, 1.6) + c(58, 52, 1.6) + c(46, 64, 1.6) + c(54, 64, 1.6),
};

// Dónde queda cada figura: lado, altura (% de la pantalla), tamaño, giro final, color de acuarela
const PIEZAS = [
  { f: 'tijeras', ym: 18, lado: 'izq', y: 17, t: 9, r: -12, color: '#E8A0B4' },
  { f: 'carrete', ym: 50, lado: 'izq', y: 36, t: 7.5, r: 8, color: '#A9C6E8' },
  { f: 'cinta', ym: 82, lado: 'izq', y: 55, t: 8.5, r: -6, color: '#F2D49B' },
  { f: 'botones', extra: true, lado: 'izq', y: 73, t: 7, r: 10, color: '#B9D8C2' },
  { f: 'dedal', extra: true, lado: 'izq', y: 90, t: 5.5, r: -14, color: '#CDB8E0' },
  { f: 'maquina', ym: 20, lado: 'der', y: 16, t: 10, r: 6, color: '#B9D8C2' },
  { f: 'molde', ym: 52, lado: 'der', y: 34, t: 8.5, r: -8, color: '#F2C6A0' },
  { f: 'aguja', ym: 84, lado: 'der', y: 52, t: 7.5, r: 12, color: '#E8A0B4' },
  { f: 'alfiletero', extra: true, lado: 'der', y: 70, t: 7.5, r: -6, color: '#A9C6E8' },
  { f: 'maniqui', extra: true, lado: 'der', y: 88, t: 7, r: 4, color: '#F2D49B' },
];

function crearMarco() {
  const capa = document.createElement('div');
  capa.className = 'marco-capa';
  capa.setAttribute('aria-hidden', 'true');
  capa.innerHTML = `
    <svg width="0" height="0" style="position:absolute">
      <filter id="acuarela" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7"/>
        <feDisplacementMap in="SourceGraphic" scale="22"/>
        <feGaussianBlur stdDeviation="2.5"/>
      </filter>
    </svg>
    ${PIEZAS.map((p, i) => `
      <div class="pieza pieza-${p.lado}${p.extra ? ' pieza-extra' : ''}" style="--y:${p.y}%; --ym:${p.ym ?? p.y}%; --t:${p.t}rem; --r:${p.r}deg; --d:${i * 0.12 + (p.lado === 'der' ? 0.06 : 0)}s">
        <div class="pieza-dentro" style="--f:${(i % 4) * -1.3}s">
          <svg viewBox="0 0 100 100">
            <ellipse class="mancha" cx="52" cy="54" rx="40" ry="34" fill="${p.color}" filter="url(#acuarela)"/>
            <g class="linea">${FIGURAS[p.f]}</g>
          </svg>
        </div>
      </div>`).join('')}`;
  return capa;
}

function ponerEstilos() {
  if (document.querySelector('link[href="css/marco.css"]')) return;
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'css/marco.css' }));
}

// Activa el marco en la pantalla actual (bienvenida o entrada). Las figuras llegan una vez y se quitan al salir.
// "rapido": las figuras llegan el doble de rápido (para la entrada corta)
export function activarMarco(ruta = '#/bienvenida', { rapido = false } = {}) {
  ponerEstilos();
  if (!document.querySelector('.marco-capa')) {
    const capa = crearMarco();
    capa.classList.toggle('rapido', rapido);
    document.body.prepend(capa);
  }
  document.body.classList.add('con-marco');
  const quitar = () => {
    if (location.hash.startsWith(ruta)) return window.addEventListener('hashchange', quitar, { once: true });
    document.querySelector('.marco-capa')?.remove();
    document.body.classList.remove('con-marco');
  };
  window.addEventListener('hashchange', quitar, { once: true });
}
