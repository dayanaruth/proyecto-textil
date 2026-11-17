// Moldes disponibles. Cada uno se descarga solo cuando se usa (la app abre más rápido)
const MOLDES = {
  'falda-recta': () => import('./prendas/falda-recta.js'),
};

export const tieneMolde = (id) => id in MOLDES;

// Devuelve el molde construido con las medidas
export const construirMolde = async (id, medidas) => (await MOLDES[id]()).construir(medidas);
