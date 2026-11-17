// Geometría del molde (todo en cm). Un contorno es una lista de tramos:
// { a, b, margen } recto, { a, c, b, margen } curvo, o { a, c, c2, b, margen } curva suave.
export const punto = (x, y) => ({ x, y });

// Punto de una curva (Bézier cuadrática o cúbica) en t ∈ [0, 1]
function enCurva({ a, c, c2, b }, t) {
  const u = 1 - t;
  if (c2) {
    return punto(
      u ** 3 * a.x + 3 * u * u * t * c.x + 3 * u * t * t * c2.x + t ** 3 * b.x,
      u ** 3 * a.y + 3 * u * u * t * c.y + 3 * u * t * t * c2.y + t ** 3 * b.y,
    );
  }
  return punto(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y);
}

// Corta una curva suave (4 puntos) a cierta altura y: devuelve [parte de arriba, parte de abajo]
export function partirCurvaEnY(t, y) {
  let bajo = 0, alto = 1;
  const sube = enCurva(t, 1).y > enCurva(t, 0).y;
  for (let i = 0; i < 40; i++) {
    const m = (bajo + alto) / 2;
    if ((enCurva(t, m).y < y) === sube) bajo = m; else alto = m;
  }
  const k = (bajo + alto) / 2;
  const mezcla = (p, q) => punto(p.x + (q.x - p.x) * k, p.y + (q.y - p.y) * k);
  const p01 = mezcla(t.a, t.c), p12 = mezcla(t.c, t.c2), p23 = mezcla(t.c2, t.b);
  const p012 = mezcla(p01, p12), p123 = mezcla(p12, p23), medio = mezcla(p012, p123);
  return [{ a: t.a, c: p01, c2: p012, b: medio }, { a: medio, c: p123, c2: p23, b: t.b }];
}

// Largo de un tramo recto o curvo (en cm)
export function largoTramo(t, divisiones = 40) {
  if (!t.c) return Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  let total = 0;
  let antes = t.a;
  for (let i = 1; i <= divisiones; i++) {
    const p = enCurva(t, i / divisiones);
    total += Math.hypot(p.x - antes.x, p.y - antes.y);
    antes = p;
  }
  return total;
}

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
    return { o: punto(p.x + (signo * d.y / l) * m, p.y + (-signo * d.x / l) * m), d, m };
  });
  // En ángulos muy agudos (ej. el tiro del pantalón) el cruce se escapa en punta:
  // si se aleja mucho de la esquina, se corta la punta (esquina "biselada")
  return lados.map((lado, i) => {
    const antes = lados[(i - 1 + n) % n];
    const q = cruce(antes, lado);
    const limite = 2.5 * Math.max(antes.m, lado.m, 0.5);
    if (Math.hypot(q.x - puntos[i].x, q.y - puntos[i].y) <= limite) return q;
    const finAntes = punto(antes.o.x + antes.d.x, antes.o.y + antes.d.y);
    return punto((finAntes.x + lado.o.x) / 2, (finAntes.y + lado.o.y) / 2);
  });
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
