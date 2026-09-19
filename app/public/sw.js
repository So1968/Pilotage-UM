const CACHE = "pilotage-um-v1";
const BASE = "/Pilotage-UM/";
const SOCLE = [BASE, `${BASE}index.html`, `${BASE}favicon.svg`, `${BASE}manifest.webmanifest`];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SOCLE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((cle) => cle !== CACHE).map((cle) => caches.delete(cle))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requete = event.request;
  const url = new URL(requete.url);
  if (requete.method !== "GET" || url.origin !== self.location.origin) return;

  if (requete.mode === "navigate") {
    event.respondWith(
      fetch(requete)
        .then((reponse) => {
          const copie = reponse.clone();
          caches.open(CACHE).then((cache) => cache.put(`${BASE}index.html`, copie));
          return reponse;
        })
        .catch(() => caches.match(`${BASE}index.html`))
    );
    return;
  }

  event.respondWith(
    caches.match(requete).then((enCache) => enCache || fetch(requete).then((reponse) => {
      if (reponse.ok) {
        const copie = reponse.clone();
        caches.open(CACHE).then((cache) => cache.put(requete, copie));
      }
      return reponse;
    }))
  );
});
