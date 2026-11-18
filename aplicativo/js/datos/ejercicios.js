// Ejercicios para practicar. Los números cambian cada vez (no se pueden copiar las respuestas).
// Tipos: "opciones" (elegir texto o dibujo) y "numero" (escribir el resultado; se acepta un pequeño margen).
// ⚠️ Conviene que el docente revise o agregue preguntas para que coincidan con lo que enseña.
import { PALABRAS } from './diccionario.js';
import { MEDIDAS, figuraMedida } from './medidas.js';
import { numero as n } from '../utilidades/formato.js';

const azar = (min, max, paso = 1) => min + Math.floor(Math.random() * ((max - min) / paso + 1)) * paso;
const mezclar = (lista) => lista.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const redondear = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// Elige "cuantas" opciones al azar, siempre incluyendo la correcta
function opciones(correcta, todas, cuantas = 4) {
  const otras = mezclar(todas.filter((x) => x !== correcta)).slice(0, cuantas - 1);
  return mezclar([correcta, ...otras]);
}

// ---------- Nivel 1: vocabulario con dibujos ----------
function vocabulario() {
  const elegidas = mezclar(PALABRAS).slice(0, 10);
  return elegidas.map((p, i) => {
    if (i % 2 === 0) {
      const ops = opciones(p, PALABRAS);
      return { tipo: 'opciones', pregunta: `¿En qué dibujo se marca: «${p.palabra}»?`, conDibujos: true,
        opciones: ops.map((o) => ({ texto: o.palabra, dibujo: o.dibujo })), correcta: ops.indexOf(p),
        explicacion: `${p.palabra}: ${p.que}` };
    }
    const ops = opciones(p, PALABRAS);
    return { tipo: 'opciones', pregunta: '¿Qué palabra corresponde a esta explicación?', cita: p.que,
      opciones: ops.map((o) => ({ texto: o.palabra })), correcta: ops.indexOf(p), explicacion: `Es «${p.palabra}».` };
  });
}

// ---------- Nivel 2: medidas ----------
// Solo medidas con nombre único ("Largo de manga" corta y larga se llaman igual)
const UNICAS = Object.keys(MEDIDAS).filter((id, i, todas) => todas.findIndex((x) => MEDIDAS[x].nombre === MEDIDAS[id].nombre) === i);

function medidas() {
  const ids = mezclar(UNICAS).slice(0, 10);
  return ids.map((id, i) => {
    const ops = opciones(id, UNICAS);
    if (i % 2 === 0) {
      return { tipo: 'opciones', pregunta: '¿Qué medida se toma como muestra el dibujo?', figura: figuraMedida(id),
        opciones: ops.map((o) => ({ texto: MEDIDAS[o].nombre })), correcta: ops.indexOf(id),
        explicacion: `${MEDIDAS[id].nombre}: ${MEDIDAS[id].como}` };
    }
    return { tipo: 'opciones', pregunta: '¿Qué medida se toma así?', cita: MEDIDAS[id].como,
      opciones: ops.map((o) => ({ texto: MEDIDAS[o].nombre })), correcta: ops.indexOf(id), explicacion: `Es el ${MEDIDAS[id].nombre.toLowerCase()}.` };
  });
}

// ---------- Nivel 3: cálculos de molde (fórmulas del taller) ----------
function calculosMolde() {
  const generadores = [
    () => { const c = azar(84, 112, 2); return { pregunta: `La cadera mide ${c} cm. En la falda recta, el ancho de cadera es cadera ÷ 4 + 1. ¿Cuánto mide?`, respuesta: c / 4 + 1, unidad: 'cm', explicacion: `${c} ÷ 4 = ${n(c / 4)}; más 1 de holgura = ${n(c / 4 + 1)} cm.` }; },
    () => { const c = azar(60, 90, 2); return { pregunta: `La cintura mide ${c} cm. El ancho de cintura es cintura ÷ 4 + 3 (pinza). ¿Cuánto mide?`, respuesta: c / 4 + 3, unidad: 'cm', explicacion: `${c} ÷ 4 = ${n(c / 4)}; más 3 de pinza = ${n(c / 4 + 3)} cm.` }; },
    () => { const c = azar(33, 42); return { pregunta: `El cuello mide ${c} cm. El ancho del escote es cuello ÷ 6. ¿Cuánto es? (con un decimal)`, respuesta: redondear(c / 6, 1), tolerancia: 0.1, unidad: 'cm', explicacion: `${c} ÷ 6 = ${n(redondear(c / 6, 2))}, que redondeado es ${n(redondear(c / 6, 1))} cm.` }; },
    () => { const b = azar(15, 21); return { pregunta: `Busto a busto mide ${b} cm. ¿A cuántos cm del centro se marca el punto de busto? (busto a busto ÷ 2)`, respuesta: b / 2, unidad: 'cm', explicacion: `${b} ÷ 2 = ${n(b / 2)} cm.` }; },
    () => { const a = azar(32, 44); return { pregunta: `El ancho de espalda mide ${a} cm. ¿Cuánto es ancho de espalda ÷ 2?`, respuesta: a / 2, unidad: 'cm', explicacion: `${a} ÷ 2 = ${n(a / 2)} cm.` }; },
    () => { const b = azar(80, 110, 2); return { pregunta: `El busto mide ${b} cm. El ancho del molde en el busto es busto ÷ 4 + 1. ¿Cuánto mide?`, respuesta: b / 4 + 1, unidad: 'cm', explicacion: `${b} ÷ 4 = ${n(b / 4)}; más 1 = ${n(b / 4 + 1)} cm.` }; },
    () => { const c = azar(88, 112, 4); return { pregunta: `La cadera mide ${c} cm. En el pantalón, el tiro delantero sale cadera ÷ 16. ¿Cuánto es?`, respuesta: c / 16, unidad: 'cm', explicacion: `${c} ÷ 16 = ${n(c / 16)} cm.` }; },
    () => { const c = azar(88, 112, 4); return { pregunta: `La cadera mide ${c} cm. El tiro de espalda sale cadera ÷ 8. ¿Cuánto es?`, respuesta: c / 8, unidad: 'cm', explicacion: `${c} ÷ 8 = ${n(c / 8)} cm.` }; },
    () => { const L = azar(50, 70), r = 4; return { pregunta: `Una falda mide ${L} cm de largo y lleva ${r} cm de ruedo. ¿Cuánto mide el molde de largo con el ruedo?`, respuesta: L + r, unidad: 'cm', explicacion: `${L} + ${r} = ${L + r} cm.` }; },
    () => { const c = azar(62, 80, 2); const cruce = 3, mg = 2; return { pregunta: `La cintura mide ${c} cm. La pretina mide cintura + ${cruce} de cruce + ${mg} de margen. ¿Cuánto mide?`, respuesta: c + cruce + mg, unidad: 'cm', explicacion: `${c} + ${cruce} + ${mg} = ${c + cruce + mg} cm.` }; },
  ];
  return mezclar(generadores).map((g) => ({ tipo: 'numero', ...g() }));
}

// ---------- Nivel 4: tela y conversiones ----------
function telaYConversiones() {
  const generadores = [
    () => { const p = azar(10, 40); return { pregunta: `¿Cuántos centímetros son ${p} pulgadas? (1 pulgada = 2,54 cm)`, respuesta: redondear(p * 2.54), tolerancia: 0.1, unidad: 'cm', explicacion: `${p} × 2,54 = ${n(redondear(p * 2.54))} cm.` }; },
    () => { const c = azar(20, 100, 5); return { pregunta: `¿Cuántas pulgadas son ${c} cm? (con un decimal)`, respuesta: redondear(c / 2.54, 1), tolerancia: 0.1, unidad: 'pulg.', explicacion: `${c} ÷ 2,54 = ${n(redondear(c / 2.54, 2))} → ${n(redondear(c / 2.54, 1))} pulgadas.` }; },
    () => { const y = azar(1, 4, 0.5); return { pregunta: `La tienda vende por yardas. ¿Cuántos metros son ${n(y)} yardas? (1 yarda = 0,9144 m; con dos decimales)`, respuesta: redondear(y * 0.9144), tolerancia: 0.01, unidad: 'm', explicacion: `${n(y)} × 0,9144 = ${n(redondear(y * 0.9144))} m.` }; },
    () => { const c = azar(60, 250, 5); return { pregunta: `¿Cuántos metros son ${c} cm?`, respuesta: c / 100, unidad: 'm', explicacion: `${c} ÷ 100 = ${n(c / 100)} m.` }; },
    () => { const m = azar(0.5, 3, 0.25); return { pregunta: `¿Cuántos centímetros son ${n(m)} m?`, respuesta: m * 100, unidad: 'cm', explicacion: `${n(m)} × 100 = ${n(m * 100)} cm.` }; },
    () => { const L = azar(55, 70), extra = 10; return { pregunta: `Para una falda en tela angosta necesitas 2 largos de ${L} cm más ${extra} cm de reserva. ¿Cuántos metros compras?`, respuesta: (2 * L + extra) / 100, unidad: 'm', explicacion: `2 × ${L} + ${extra} = ${2 * L + extra} cm = ${n((2 * L + extra) / 100)} m.` }; },
    () => { const m = azar(1, 3, 0.5), p = azar(25, 45, 5); return { pregunta: `Compras ${n(m)} m de tela a Bs ${p} el metro. ¿Cuánto pagas?`, respuesta: m * p, unidad: 'Bs', explicacion: `${n(m)} × ${p} = Bs ${n(m * p)}.` }; },
    () => { const u = azar(6, 24, 6), m = azar(0.8, 1.4, 0.1); const t = redondear(u * m); return { pregunta: `Cada falda de uniforme usa ${n(redondear(m, 1))} m de tela. ¿Cuántos metros necesitas para ${u} faldas?`, respuesta: t, tolerancia: 0.05, unidad: 'm', explicacion: `${u} × ${n(redondear(m, 1))} = ${n(t)} m.` }; },
    () => { const a = 150; return { pregunta: `La tela mide ${a} cm de ancho. Doblada a lo largo, orillo con orillo, ¿cuántos cm de ancho te quedan para acomodar el molde?`, respuesta: a / 2, unidad: 'cm', explicacion: `Al doblarla queda la mitad: ${a} ÷ 2 = ${a / 2} cm.` }; },
    () => ({ tipo: 'opciones', pregunta: '¿Hacia dónde debe ir la flecha del hilo del molde?',
      opciones: [{ texto: 'Paralela al orillo de la tela' }, { texto: 'Atravesada, de orillo a orillo' }, { texto: 'En diagonal' }, { texto: 'No importa' }],
      correcta: 0, explicacion: 'El sentido del hilo va paralelo al orillo; así la prenda cae derecha y no se deforma.' }),
  ];
  return mezclar(generadores).map((g) => ({ tipo: 'numero', ...g() }));
}

// ---------- Nivel 5: costos y precios ----------
function costosYPrecios() {
  const generadores = [
    () => { const c = azar(40, 120, 5), p = azar(20, 50, 5); return { pregunta: `Una prenda cuesta Bs ${c} hacerla. Quieres ganar el ${p} % del costo. ¿A cuánto la vendes?`, respuesta: redondear(c * (1 + p / 100)), tolerancia: 0.05, unidad: 'Bs', explicacion: `${p} % de ${c} = ${n(redondear(c * p / 100))}; ${c} + ${n(redondear(c * p / 100))} = Bs ${n(redondear(c * (1 + p / 100)))}.` }; },
    () => { const c = azar(40, 120, 5), p = azar(20, 40, 5); const pr = redondear(c / (1 - p / 100)); return { pregunta: `El costo es Bs ${c} y quieres que tu ganancia sea el ${p} % del PRECIO DE VENTA. ¿A cuánto vendes? (costo ÷ (1 − ${n(p / 100)}))`, respuesta: pr, tolerancia: 0.05, unidad: 'Bs', explicacion: `${c} ÷ ${n(1 - p / 100)} = Bs ${n(pr)}. Ojo: es más que sumar el ${p} % al costo.` }; },
    () => { const h = azar(2, 5), b = azar(8, 15); return { pregunta: `Tardas ${h} horas en coser una blusa y tu hora vale Bs ${b}. ¿Cuánto es la mano de obra?`, respuesta: h * b, unidad: 'Bs', explicacion: `${h} × ${b} = Bs ${h * b}.` }; },
    () => { const m = azar(30, 80, 2); return { pregunta: `Los materiales cuestan Bs ${m}. Los gastos del taller son el 10 % de los materiales. ¿Cuánto son los gastos?`, respuesta: m / 10, unidad: 'Bs', explicacion: `10 % de ${m} = ${m} ÷ 10 = Bs ${n(m / 10)}.` }; },
    () => { const m = azar(30, 60), mo = azar(20, 45, 5), g = azar(3, 8); return { pregunta: `Materiales Bs ${m}, mano de obra Bs ${mo} y gastos del taller Bs ${g}. ¿Cuál es el costo total?`, respuesta: m + mo + g, unidad: 'Bs', explicacion: `${m} + ${mo} + ${g} = Bs ${m + mo + g}.` }; },
    () => { const v = azar(80, 150, 5), c = azar(50, 75, 5); return { pregunta: `Vendes una falda a Bs ${v} y te costó Bs ${c}. ¿Cuánto ganas?`, respuesta: v - c, unidad: 'Bs', explicacion: `${v} − ${c} = Bs ${v - c}.` }; },
    () => { const p = azar(80, 200, 10), a = 50; return { pregunta: `Un pedido cuesta Bs ${p}. Pides ${a} % de adelanto. ¿Cuánto te deben dar al encargar?`, respuesta: p * a / 100, unidad: 'Bs', explicacion: `${a} % de ${p} = Bs ${n(p * a / 100)}.` }; },
    () => { const u = azar(6, 24, 6), pr = azar(60, 110, 5); return { pregunta: `Te encargan ${u} camisas a Bs ${pr} cada una. ¿Cuánto es el total?`, respuesta: u * pr, unidad: 'Bs', explicacion: `${u} × ${pr} = Bs ${u * pr}.` }; },
    () => ({ tipo: 'opciones', pregunta: 'El costo es Bs 100. ¿Qué precio te deja más ganancia?',
      opciones: [{ texto: '30 % sobre el costo (Bs 130)' }, { texto: '30 % del precio de venta (Bs 142,86)' }, { texto: 'Los dos dejan lo mismo' }],
      correcta: 1, explicacion: '30 % del precio de venta: 100 ÷ 0,70 = Bs 142,86 (ganas 42,86). 30 % sobre el costo: Bs 130 (ganas 30). No son lo mismo.' }),
    () => ({ tipo: 'opciones', pregunta: '¿Qué debe incluir el costo de una prenda?',
      opciones: [{ texto: 'Solo la tela' }, { texto: 'Tela e hilo' }, { texto: 'Materiales, mano de obra y gastos del taller' }, { texto: 'Solo lo que cobra la tienda' }],
      correcta: 2, explicacion: 'El costo suma materiales (tela, hilo, cierre…), tu trabajo (mano de obra) y los gastos del taller (luz, máquina…).' }),
  ];
  return mezclar(generadores).map((g) => ({ tipo: 'numero', ...g() }));
}

export const NIVELES = [
  { id: 1, nombre: 'Palabras del taller', icono: '📚', desc: 'Vocabulario con dibujos', crear: vocabulario },
  { id: 2, nombre: 'Medidas', icono: '📏', desc: 'Cómo y dónde se mide', crear: medidas },
  { id: 3, nombre: 'Cálculos de molde', icono: '📐', desc: 'Fórmulas del trazado', crear: calculosMolde },
  { id: 4, nombre: 'Tela y conversiones', icono: '🧵', desc: 'Metros, pulgadas, yardas', crear: telaYConversiones },
  { id: 5, nombre: 'Costos y precios', icono: '💰', desc: 'Cuánto cobrar', crear: costosYPrecios },
];
