const CACHE_PREFIX = "kink-profile-pr-313";
const CACHE_NAME = `kink-profile-pr-313-static-068b08ea173a`;
const SCOPE_PATH = "/kink-profile/pr-313/";
const APP_SHELL = "/kink-profile/pr-313/index.html";
const PRECACHE_URLS = ["/kink-profile/pr-313/","/kink-profile/pr-313/index.html","/kink-profile/pr-313/manifest.webmanifest","/kink-profile/pr-313/icons/pwa-192.png","/kink-profile/pr-313/icons/pwa-512.png","/kink-profile/pr-313/icons/pwa-maskable-512.png","/kink-profile/pr-313/icons/apple-touch-icon.png","/kink-profile/pr-313/assets/index-WYkz1ExN.css","/kink-profile/pr-313/assets/UiLabPage-CEjNpHzV.css","/kink-profile/pr-313/assets/index-CiER93GZ.js","/kink-profile/pr-313/assets/UiLabPage-Dxl90fSK.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(APP_SHELL)),
    );
    return;
  }

  const cacheableDestination = new Set(["script", "style", "image", "font", "manifest"]);
  if (!cacheableDestination.has(request.destination)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
