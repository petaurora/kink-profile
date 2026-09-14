import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function normalizeBase(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

const base = normalizeBase(process.env.VITE_BASE_PATH ?? "/kink-profile/");
const previewPr = process.env.VITE_PREVIEW_PR?.trim();
const appName = previewPr ? `Kink Profile · PR ${previewPr}` : "Kink Profile";
const shortName = previewPr ? `KP · PR ${previewPr}` : "Kink Profile";
const cachePrefix = previewPr
  ? `kink-profile-pr-${previewPr}`
  : "kink-profile-production";

function pwaAssetsPlugin(): Plugin {
  return {
    name: "kink-profile-pwa-assets",
    transformIndexHtml() {
      return [
        {
          tag: "link",
          attrs: {
            rel: "manifest",
            href: `${base}manifest.webmanifest`,
          },
          injectTo: "head",
        },
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            href: `${base}icons/apple-touch-icon.png`,
          },
          injectTo: "head",
        },
      ];
    },
    generateBundle(_options, bundle) {
      const manifest = {
        name: appName,
        short_name: shortName,
        description: "A private, browser-based preference profile.",
        id: base,
        start_url: base,
        scope: base,
        display: "standalone",
        theme_color: "#08081d",
        background_color: "#08081d",
        icons: [
          {
            src: "icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      };

      this.emitFile({
        type: "asset",
        fileName: "manifest.webmanifest",
        source: JSON.stringify(manifest, null, 2),
      });

      const precacheUrls = Array.from(
        new Set([
          base,
          `${base}index.html`,
          `${base}manifest.webmanifest`,
          `${base}icons/pwa-192.png`,
          `${base}icons/pwa-512.png`,
          `${base}icons/pwa-maskable-512.png`,
          `${base}icons/apple-touch-icon.png`,
          ...Object.keys(bundle).map((fileName) => `${base}${fileName}`),
        ]),
      );

      const serviceWorker = `const CACHE_PREFIX = ${JSON.stringify(cachePrefix)};
const CACHE_NAME = \`${cachePrefix}-static-v1\`;
const SCOPE_PATH = ${JSON.stringify(base)};
const APP_SHELL = ${JSON.stringify(`${base}index.html`)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};

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
`;

      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: serviceWorker,
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), pwaAssetsPlugin()],
});
