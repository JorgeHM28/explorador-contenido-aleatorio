// Servidor estático local, sin dependencias. Ejecutar: node servidor.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const raiz = __dirname;
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  const archivo = path.resolve(raiz, '.' + (ruta === '/' ? '/index.html' : ruta));
  if (!archivo.startsWith(raiz + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(archivo, (error, contenido) => {
    if (error) { res.writeHead(404); res.end('Archivo no encontrado'); return; }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(contenido);
  });
}).listen(8080, '127.0.0.1', () => console.log('Explorador: http://127.0.0.1:8080 · Ctrl+C para detener'));
