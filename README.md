# Explorador de contenido aleatorio

**Asignatura:** Programación Web III  
**Integrante:** Jorge Luis Herbas Mallcu  
**Tecnologías:** HTML5, CSS3 y JavaScript (Fetch API, async/await).

Página adaptable que consulta cuatro APIs públicas, sin base de datos, inicio de sesión ni claves. Cada tarjeta carga al ingresar y tiene su propio botón, mensaje de carga y manejo de errores. El contenido procede de las APIs, sin respuestas simuladas ni imágenes fijas.

## Ejecución

1. Descomprimir el ZIP.
2. Instalar Node.js si no se encuentra disponible.
3. Abrir una terminal dentro de `ExploradorContenido`.
4. Ejecutar `node servidor.cjs`.
5. Abrir <http://127.0.0.1:8080> en un navegador con conexión a Internet.
6. Para detener el servidor, pulsar `Ctrl+C`.

No se necesita `npm install` para ejecutar la página. También se puede usar la extensión Live Server de Visual Studio Code sobre `index.html`. ASP.NET Core MVC es opcional en la consigna; esta entrega usa un proyecto web estático independiente.

## Archivos

- `index.html`: estructura semántica y cuatro secciones.
- `css/styles.css`: diseño adaptable a computadora y teléfono.
- `js/explorador.js`: consultas independientes, validación y actualización de la interfaz.
- `servidor.cjs`: servidor local sin dependencias externas.
- `capturas/`: evidencias de funcionamiento, error controlado y vista móvil.
- `pruebas/verificar.cjs`: comprobación automatizada con un navegador real.

## Respuestas de reflexión

### 1. ¿Qué es un endpoint y cuál utilizaste para cada API?

Un endpoint es una dirección de una API a la que se envía una solicitud para obtener un recurso o realizar una operación. En este proyecto todas las solicitudes son GET:

| API | Endpoint | Campos utilizados |
| --- | --- | --- |
| DummyJSON | https://dummyjson.com/quotes/random | `quote`, `author` |
| Dog CEO | https://dog.ceo/api/breeds/image/random | `message`, `status` |
| CATAAS | https://cataas.com/cat?json=true | `url` o `id` (también se contempla `_id`) |
| Useless Facts | https://uselessfacts.jsph.pl/api/v2/facts/random?language=en | `text` |

Antes de programar se inspeccionó una respuesta real de CATAAS: contenía `id`, `tags`, `created_at`, `url` y `mimetype`. Se utiliza la URL recibida; si falta, se construye `https://cataas.com/cat/{id}` con el identificador recibido. Nunca se procesa `/cat` sin `json=true` mediante `response.json()`.

### 2. ¿Qué diferencia existe entre recibir JSON y recibir directamente una imagen?

JSON contiene datos estructurados como textos, identificadores y URLs. Se analiza para acceder a sus propiedades. Una respuesta de imagen contiene los bytes de un archivo gráfico; el navegador puede mostrarla con `<img src="...">`. Esos bytes no son JSON. En perros y gatos primero se obtiene JSON y después el elemento `img` descarga la imagen indicada.

### 3. ¿Qué función cumplen await y response.json()?

`await` espera a que una promesa se resuelva dentro de una función asíncrona, sin bloquear la interfaz. `await fetch(...)` obtiene la respuesta HTTP. `await response.json()` lee su cuerpo y lo convierte en un valor de JavaScript para acceder a campos como `quote`, `author` o `text`. Ambas operaciones pueden fallar y se manejan con `try/catch`.

### 4. ¿Por qué se debe verificar response.ok además de utilizar try/catch?

`fetch` normalmente rechaza su promesa ante errores de red, pero no por recibir HTTP 404 o 500. `response.ok` indica si el estado HTTP está entre 200 y 299. Cuando es falso se lanza un error explícito para que `catch` muestre el mensaje de reintento. También se validan los campos recibidos y se manejan los errores de descarga de imágenes.

### 5. ¿Cómo lograste actualizar una sección sin recargar toda la página?

Cada botón tiene un evento `click` y llama a su propia función asíncrona: `obtenerCita`, `obtenerPerro`, `obtenerGato` u `obtenerDatoCurioso`. Estas consultan la API con `fetch` y modifican únicamente el `textContent` o el `src` de su tarjeta. No se navega a otra página ni se llama a `location.reload()`. Cada tarjeta deshabilita su botón durante toda la operación y lo habilita en `finally`, incluso si hay un error. Las consultas se inician de forma independiente.

## Verificación manual

1. Ingresar: aparecen una cita con autor, un perro, un gato y un dato curioso.
2. Pulsar un botón: solo cambia su tarjeta, muestra “Cargando…” y deshabilita su botón temporalmente.
3. En las herramientas del navegador, pestaña Network/Red, seleccionar Offline/Sin conexión **después de cargar la página**. Pulsar un botón y comprobar el mensaje de error y que el botón se habilita.
4. Volver a Online y pulsar el mismo botón para reintentar.
5. En Network también se puede bloquear la URL de una API o una imagen: las otras tarjetas siguen funcionando. Las imágenes fallidas se ocultan y se permite reintentar.
6. Probar a 390 px de ancho: las tarjetas pasan a una columna sin desplazamiento horizontal.

La espera máxima por tarjeta es de 30 segundos, incluida la imagen. Las imágenes tienen un contenedor uniforme y `object-fit: contain` para conservar la proporción. Los textos externos se insertan con `textContent`. Cada clic consulta nuevamente con `cache: 'no-store'`; una respuesta repetida sigue siendo válida.

## Documentación consultada

- [DummyJSON: citas](https://dummyjson.com/docs/quotes)
- [Dog CEO: imagen aleatoria](https://dog.ceo/dog-api/documentation/random)
- [CATAAS](https://cataas.com/)
- [Useless Facts](https://uselessfacts.jsph.pl/)

## Entrega

El ZIP contiene el código, este README y las capturas. No incluye `bin`, `obj`, `.vs`, `.git` ni `node_modules`. El enlace del repositorio se encuentra en `ENTREGA.md`.
