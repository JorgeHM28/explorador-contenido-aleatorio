# Archivos para entregar

**Estudiante:** Jorge Luis Herbas Mallcu  
**Repositorio:** https://github.com/JorgeHM28/explorador-contenido-aleatorio

Subir a la plataforma:

1. `ExploradorContenido_Entrega.zip`: código fuente, README y capturas.
2. Enlace del repositorio indicado arriba.
3. `README.md`, si la plataforma lo solicita por separado.
4. `capturas/01-funcionamiento.png`: cuatro secciones con respuestas reales.
5. `capturas/02-error-controlado.png`: error HTTP 503 simulado mediante interceptación de red del navegador, con las otras tarjetas funcionando y el botón disponible para reintentar.

Se incluye adicionalmente `capturas/03-vista-movil.png`.

## Resultado de verificación

Pruebas ejecutadas en Chrome con Playwright el 10 de noviembre de 2026:

- Las cuatro APIs devolvieron contenido real y ambas imágenes terminaron de cargar.
- Durante una solicitud se muestra “Cargando…” y se deshabilita únicamente su botón.
- Un HTTP 503 muestra un error comprensible; el botón vuelve a habilitarse.
- Las otras tarjetas conservan su contenido ante el error.
- Al retirar el bloqueo, el reintento funciona.
- Una descarga de imagen bloqueada muestra el error, oculta la imagen fallida y permite reintentar.
- La desconexión de red produce un error controlado y se recupera al reconectar.
- La página se adapta a 390 px de ancho sin desbordamiento horizontal.
- Sin excepciones JavaScript no controladas durante las pruebas.

Para repetir la verificación automatizada, instalar Playwright en una copia del proyecto con `npm install --no-save playwright`, tener Google Chrome instalado, iniciar el servidor y ejecutar `node pruebas/verificar.cjs`. La aplicación no requiere Playwright para funcionar.
