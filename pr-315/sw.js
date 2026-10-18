const CACHE_PREFIX = "kink-profile-pr-315";
const CACHE_NAME = `kink-profile-pr-315-static-f129c9539382`;
const SCOPE_PATH = "/kink-profile/pr-315/";
const APP_SHELL = "/kink-profile/pr-315/index.html";
const PRECACHE_URLS = ["/kink-profile/pr-315/","/kink-profile/pr-315/index.html","/kink-profile/pr-315/manifest.webmanifest","/kink-profile/pr-315/build-info.json","/kink-profile/pr-315/icons/pwa-192.png","/kink-profile/pr-315/icons/pwa-512.png","/kink-profile/pr-315/icons/pwa-maskable-512.png","/kink-profile/pr-315/icons/apple-touch-icon.png","/kink-profile/pr-315/assets/index-D8DxO2S6.css","/kink-profile/pr-315/assets/UiLabPage-CPhk2zBS.css","/kink-profile/pr-315/assets/index-D4zHAX79.js","/kink-profile/pr-315/assets/UiLabPage-KQywOLqr.js"];

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
