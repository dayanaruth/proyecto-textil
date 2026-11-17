// Geometría del molde (todo en cm). Un contorno es una lista de tramos:
// { a, b, margen } recto, o { a, c, b, margen } curvo (c = punto de control).
export const punto = (x, y) => ({ x, y });

// Punto de una curva suave (Bézier cuadrática) en t ∈ [0, 1]
const enCurva = ({ a, c, b }, t) => punto(
  (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
  (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
);

// Convierte el contorno en puntos (las curvas en tramos cortos), con el margen de cada tramo
export function aPoligono(tramos, divisiones = 12) {
  const puntos = [];
  const margenes = [];
  for (const t of tramos) {
    const n = t.c ? divisiones : 1;
    for (let i = 0; i < n; i++) {
      puntos.push(t.c ? enCurva(t, i / n) : t.a);
      margenes.push(t.margen ?? 0);
    }
  }
  return { puntos, margenes };
}

// Línea de corte: cada lado del molde se mueve hacia afuera según su margen
export function agregarMargen({ puntos, margenes }) {
  const n = puntos.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p = puntos[i], q = puntos[(i + 1) % n];
    area += p.x * q.y - q.x * p.y;
  }
  const signo = area > 0 ? 1 : -1;
  const lados = puntos.map((p, i) => {
    const q = puntos[(i + 1) % n];
    const d = punto(q.x - p.x, q.y - p.y);
    const l = Math.hypot(d.x, d.y) || 1;
    const m = margenes[i];
    return { o: punto(p.x + (signo * d.y / l) * m, p.y + (-signo * d.x / l) * m), d };
  });
  return lados.map((lado, i) => cruce(lados[(i - 1 + n) % n], lado));
}

// Punto donde se cruzan dos líneas (si son paralelas, el inicio de la segunda)
function cruce(l1, l2) {
  const det = l1.d.x * l2.d.y - l1.d.y * l2.d.x;
  if (Math.abs(det) < 1e-9) return l2.o;
  const t = ((l2.o.x - l1.o.x) * l2.d.y - (l2.o.y - l1.o.y) * l2.d.x) / det;
  return punto(l1.o.x + t * l1.d.x, l1.o.y + t * l1.d.y);
}

// Rectángulo que encierra un grupo de puntos
export function caja(puntos, relleno = 0) {
  const xs = puntos.map((p) => p.x), ys = puntos.map((p) => p.y);
  const x = Math.min(...xs) - relleno, y = Math.min(...ys) - relleno;
  return { x, y, ancho: Math.max(...xs) + relleno - x, alto: Math.max(...ys) + relleno - y };
}
