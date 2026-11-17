// Leer instrucciones en voz alta con la voz del celular (no descarga nada)
export const hayVoz = 'speechSynthesis' in window;

export function hablar(texto) {
  if (!hayVoz) return;
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = 'es-ES';
  frase.rate = 0.9;
  frase.voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('es')) ?? null;
  speechSynthesis.speak(frase);
}
