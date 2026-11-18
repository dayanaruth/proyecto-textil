// Compartir un archivo (WhatsApp, correo…) o, si el navegador no puede, descargarlo
export async function compartirArchivo(archivo, titulo) {
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: titulo });
      return 'compartido';
    } catch {
      return 'cancelado';
    }
  }
  const enlace = Object.assign(document.createElement('a'), { href: URL.createObjectURL(archivo), download: archivo.name });
  enlace.click();
  URL.revokeObjectURL(enlace.href);
  return 'descargado';
}
