/* Service worker: maakt Vogelmatch installeerbaar en offline bruikbaar.
   Verhoog VERSIE na elke wijziging aan de bestanden, zodat de cache ververst. */
const VERSIE = "vogelmatch-v1";
const BESTANDEN = [
  "./", "index.html", "manifest.webmanifest",
  "src/data.js", "src/questions.js", "src/engine.js", "src/app.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSIE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Eerst de cache (snel en offline), op de achtergrond verversen. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const kopie = res.clone();
          caches.open(VERSIE).then(c => c.put(e.request, kopie));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
