// Moldes disponibles. Cada uno se descarga solo cuando se usa (la app abre más rápido)
const MOLDES = {
  'falda-recta': () => import('./prendas/falda-recta.js'),
  'falda-uniforme': () => import('./prendas/falda-uniforme.js'),
  'blusa': () => import('./prendas/blusa.js'),
  'vestido': () => import('./prendas/vestido.js'),
  'camisa-dama': () => import('./prendas/camisa-dama.js'),
  'camisa-varon': () => import('./prendas/camisa-varon.js'),
};

export const tieneMolde = (id) => id in MOLDES;

// Devuelve el molde construido con las medidas
export const construirMolde = async (id, medidas) => (await MOLDES[id]()).construir(medidas);
