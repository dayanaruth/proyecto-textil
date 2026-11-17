// Revisa que sw.js guarde TODOS los archivos de la app (para que funcione sin internet).
// Uso: node herramientas/revisar-cache.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = fileURLToPath(new URL('../aplicativo/', import.meta.url));
const IGNORAR = ['sw.js', 'pruebas'];

const archivos = (dir) => readdirSync(dir).flatMap((n) => {
  const ruta = join(dir, n);
  if (n.startsWith('.') || IGNORAR.includes(relative(app, ruta))) return [];
  return statSync(ruta).isDirectory() ? archivos(ruta) : [relative(app, ruta).split(sep).join('/')];
});

const lista = [...readFileSync(join(app, 'sw.js'), 'utf8').matchAll(/^\s*'([^']+)',$/gm)].map((m) => m[1]).filter((a) => a !== './');
const enDisco = archivos(app);
const faltan = enDisco.filter((a) => !lista.includes(a));
const sobran = lista.filter((a) => !enDisco.includes(a));

if (faltan.length) console.log('❌ Faltan en sw.js:\n  ' + faltan.join('\n  '));
if (sobran.length) console.log('❌ En sw.js pero no existen:\n  ' + sobran.join('\n  '));
if (!faltan.length && !sobran.length) console.log(`✅ sw.js guarda los ${lista.length} archivos de la app.`);
process.exit(faltan.length || sobran.length ? 1 : 0);
