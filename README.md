# Mi Taller – Corte y Confección

Aplicación web progresiva (PWA) de apoyo para estudiantes de Corte y Confección del CEA "Man Césped" (Cochabamba, Bolivia). Proyecto Integrador de la carrera de Sistemas Informáticos, 2026.

**Abrir la app:** https://dayanaruth.github.io/proyecto-textil/

## Qué hace
1. **Moldes:** pide las medidas una por una, con dibujos, y traza el molde paso a paso. Se puede imprimir en tamaño real.
2. **Tela:** calcula cuántos metros comprar según el ancho de la tela y muestra el plano de corte.
3. **Costos y precio:** organiza materiales, mano de obra y gastos, y sugiere el precio de venta (ganancia sobre el costo o sobre el precio).

Funciona en el celular, se puede instalar y se usa sin internet después de la primera visita. Los datos quedan solo en el celular.

## Estructura
- `aplicativo/`: la app (HTML, CSS y JavaScript, sin librerías). Es lo único que se publica.
- `herramientas/revisar-cache.mjs`: revisa que el service worker guarde todos los archivos.
- `.github/workflows/publicar.yml`: publica `aplicativo/` en GitHub Pages en cada cambio.

## Probar en la computadora
```
npx serve aplicativo
```

> Las fórmulas de los moldes son provisionales hasta su revisión con el docente del taller.
