'use strict';

// Cada tarjeta mantiene su solicitud y su estado de forma independiente.
const endpoints = {
  cita: 'https://dummyjson.com/quotes/random',
  perro: 'https://dog.ceo/api/breeds/image/random',
  gato: 'https://cataas.com/cat?json=true',
  dato: 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en'
};

async function consultarJson(endpoint, signal) {
  const response = await fetch(endpoint, { signal, cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`La API respondió con HTTP ${response.status}.`);
  return await response.json();
}

function exigirTexto(valor) {
  if (typeof valor !== 'string' || !valor.trim()) throw new Error('La API devolvió contenido incompleto.');
  return valor;
}

function validarUrlImagen(valor, base) {
  const url = new URL(exigirTexto(valor), base);
  if (url.protocol !== 'https:') throw new Error('La URL de la imagen no es válida.');
  return url.href;
}

// La promesa incluye la descarga de la imagen: el botón sigue deshabilitado hasta verla.
function mostrarImagen(id, url, signal) {
  const imagen = document.getElementById(id);
  const contenedor = imagen.parentElement;
  imagen.hidden = true;
  contenedor.querySelector('.image-placeholder').hidden = false;
  return new Promise((resolve, reject) => {
    const limpiar = () => {
      imagen.onload = null;
      imagen.onerror = null;
      signal.removeEventListener('abort', cancelar);
    };
    const cancelar = () => {
      limpiar();
      imagen.removeAttribute('src');
      reject(new Error('La imagen tardó demasiado en cargar.'));
    };
    imagen.onload = () => {
      limpiar();
      imagen.hidden = false;
      contenedor.querySelector('.image-placeholder').hidden = true;
      resolve();
    };
    imagen.onerror = () => {
      limpiar();
      imagen.removeAttribute('src');
      reject(new Error('No se pudo cargar la imagen.'));
    };
    signal.addEventListener('abort', cancelar, { once: true });
    if (signal.aborted) cancelar();
    else imagen.src = url;
  });
}

async function actualizarSeccion(id, cargarContenido) {
  const tarjeta = document.getElementById(id);
  const boton = tarjeta.querySelector('button');
  if (boton.disabled) return;
  const estado = tarjeta.querySelector('.status');
  const controller = new AbortController();
  const temporizador = setTimeout(() => controller.abort(), 30000);
  boton.disabled = true;
  tarjeta.setAttribute('aria-busy', 'true');
  estado.classList.remove('error');
  estado.textContent = 'Cargando…';
  try {
    await cargarContenido(controller.signal);
    estado.textContent = 'Listo. ¿Un descubrimiento más?';
  } catch (error) {
    estado.classList.add('error');
    estado.textContent = controller.signal.aborted
      ? 'La consulta tardó demasiado. Pulsa el botón para reintentar.'
      : 'No se pudo cargar el contenido. Revisa tu conexión y pulsa el botón para reintentar.';
    console.warn(`Error en ${id}:`, error.message);
  } finally {
    clearTimeout(temporizador);
    boton.disabled = false;
    tarjeta.setAttribute('aria-busy', 'false');
  }
}

async function obtenerCita() {
  await actualizarSeccion('cita', async signal => {
    const datos = await consultarJson(endpoints.cita, signal);
    const texto = exigirTexto(datos.quote);
    const autor = exigirTexto(datos.author);
    document.getElementById('cita-texto').textContent = texto;
    document.getElementById('cita-autor').textContent = autor;
  });
}

async function obtenerPerro() {
  await actualizarSeccion('perro', async signal => {
    const datos = await consultarJson(endpoints.perro, signal);
    if (datos.status !== 'success') throw new Error('Dog CEO no devolvió una imagen.');
    await mostrarImagen('perro-imagen', validarUrlImagen(datos.message), signal);
  });
}

async function obtenerGato() {
  await actualizarSeccion('gato', async signal => {
    const datos = await consultarJson(endpoints.gato, signal);
    // JSON inspeccionado: contiene id y url. También se admite el antiguo campo _id.
    const identificador = datos.id || datos._id;
    const ruta = datos.url || (identificador ? `/cat/${encodeURIComponent(identificador)}` : '');
    await mostrarImagen('gato-imagen', validarUrlImagen(ruta, 'https://cataas.com'), signal);
  });
}

async function obtenerDatoCurioso() {
  await actualizarSeccion('dato', async signal => {
    const datos = await consultarJson(endpoints.dato, signal);
    document.getElementById('dato-texto').textContent = exigirTexto(datos.text);
  });
}

const consultas = { cita: obtenerCita, perro: obtenerPerro, gato: obtenerGato, dato: obtenerDatoCurioso };
for (const [id, consultar] of Object.entries(consultas)) {
  document.querySelector(`#${id} button`).addEventListener('click', consultar);
  // Se inician juntas; un fallo no interrumpe las otras consultas.
  void consultar();
}
