// Service worker mínimo: solo guarda en caché el "cascarón" de la app
// (el ícono, el manifiesto y esta misma página) para que la app se vea bien
// al abrirla instalada. El contenido real del Cine Foro SIEMPRE se pide en
// vivo a Google Apps Script — nunca se sirve una copia vieja desde caché.

const CACHE_NAME = 'cineforo-shell-v1';
const ARCHIVOS_SHELL = ['./index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARCHIVOS_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres
          .filter(function (nombre) { return nombre !== CACHE_NAME; })
          .map(function (nombre) { return caches.delete(nombre); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const esArchivoDelShell = ARCHIVOS_SHELL.some(function (archivo) {
    return event.request.url.indexOf(archivo.replace('./', '')) !== -1;
  });
  if (esArchivoDelShell) {
    event.respondWith(
      caches.match(event.request).then(function (respuestaCache) {
        return respuestaCache || fetch(event.request);
      })
    );
  }
  // Todo lo demás (el contenido real de la app dentro del iframe) se deja
  // pasar directo a la red, sin tocar caché.
});
