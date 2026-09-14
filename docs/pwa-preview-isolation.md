# PWA and PR Preview Isolation

This document records the current installability and GitHub Pages preview isolation contract.

## Build identity

Production uses the Vite base `/kink-profile/` and has no `VITE_PREVIEW_PR` value.

PR previews use both:

- `VITE_BASE_PATH=/kink-profile/pr-<number>/`
- `VITE_PREVIEW_PR=<number>`

CI also builds a synthetic preview with `/kink-profile/pr-ci/` and `VITE_PREVIEW_PR=ci` so preview-only behavior is type/build checked on every PR.

## Manifest and installation

`vite.config.ts` emits `manifest.webmanifest` from the active build identity.

Production installs as `Kink Profile`. A PR preview installs as `Kink Profile · PR <number>` so multiple installs are visually distinguishable.

Manifest `id`, `start_url`, and `scope` all use the active Vite base. Production therefore owns only `/kink-profile/`; each preview owns only its `/kink-profile/pr-<number>/` subtree.

The install asset set is:

- `public/icons/pwa-192.png`
- `public/icons/pwa-512.png`
- `public/icons/pwa-maskable-512.png`
- `public/icons/apple-touch-icon.png`

## Service worker and cache isolation

The build emits `sw.js` beside the app shell. `src/pwa.ts` registers it only in production builds and explicitly requests the active Vite base as its scope.

The initial service worker is deliberately conservative:

- precache the generated app shell and static build assets;
- cache same-scope static script/style/image/font/manifest requests;
- use network-first navigation with the cached app shell as the offline fallback;
- do not add background sync or offline mutation semantics for profile data.

Cache names are build-identity-specific (`kink-profile-production-*` or `kink-profile-pr-<number>-*`). Cleanup only removes older caches that share the current build's own prefix, so a preview cannot evict production or a sibling preview.

## localStorage isolation

Service-worker scope does not isolate `localStorage` because GitHub Pages production and previews share the `petaurora.github.io` origin.

`src/lib/previewStorageNamespace.ts` is installed before the React app hydrates persisted state. In preview builds it rewrites app-owned `localStorage` keys beginning with `pet-profile-` or `kink-profile:` into:

`kink-profile:preview:pr-<number>:<existing-key>`

Production does not install a namespace and therefore preserves all existing storage key names and behavior. The preview shim does not migrate, copy, or fall back to production values.

Unrelated origin storage keys are left unchanged.

## Validation

Automated validation must cover:

1. `npm test`
2. production `npm run build`
3. preview `npm run build` with both preview base and preview identity

Manual mobile validation for a release should cover install, standalone launch, refresh/update behavior, bottom navigation/safe-area rendering, and uninstall/reinstall expectations.
