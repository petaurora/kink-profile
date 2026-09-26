# Internal Feature Flags

This document records the current client-side feature-flag runtime used for experimental work.

## Purpose

Feature flags let experimental or incomplete product code land in the main codebase without automatically becoming part of the normal user experience.

They are developer tooling only. They are **not** authorization, subscription entitlements, account rollout infrastructure, or a security boundary.

## Registry

`src/lib/featureFlags.ts` owns the canonical `FEATURE_FLAG_REGISTRY`.

Each registered flag has:

- a stable key;
- a human-readable label;
- a short description;
- a boolean default.

The registry is intentionally empty until a real experiment needs a flag. Do not add placeholder/demo flags merely to exercise the system.

Application code should read flag state through the exported `featureFlags` runtime instead of reading `localStorage` directly.

Example registration:

```ts
export const FEATURE_FLAG_REGISTRY = {
  exampleExperiment: {
    label: "Example experiment",
    description: "Try the in-progress example experience.",
    defaultValue: false,
  },
} as const satisfies FeatureFlagRegistry;
```

## Persistence

Local overrides are stored separately from profile/preferences data under:

`kink-profile:feature-flag-overrides-v1`

The payload is schema-versioned and contains only known boolean overrides. Unknown/removed keys, malformed JSON, incompatible schema versions, and non-boolean values are ignored when state is resolved.

Storage failures fall back to registry defaults and must not break ordinary product behavior.

An explicit override may be either `true` or `false`, even when that matches the current registry default. Clearing an override is a separate operation that returns the flag to its registry default.

## PR preview isolation

The storage key begins with `kink-profile:`, so the existing preview namespace installed by `src/lib/previewStorageNamespace.ts` isolates experimental overrides per PR preview before React hydrates.

Production keeps the normal key unchanged. Preview builds do not read or mutate production overrides.

## Runtime API

`featureFlags` exposes the supported application-facing operations:

- list registered definitions;
- load sanitized overrides;
- inspect one flag or all flag states;
- resolve the effective enabled state;
- set an explicit local override;
- clear one override;
- reset all overrides.

Feature components should not know the persistence key or payload format.

## Advanced Settings controls

When Developer / Admin Tools is enabled, Settings exposes an **Experimental Features** panel. It is generated from the registry and shows effective state, default state, and whether a browser-local override exists.

Turning Developer Tools off only hides the controls. It does not change feature-flag values.

## Standard gating pattern

Experimental product code should use `src/lib/experimentalFeatureGates.tsx` rather than ad hoc `featureFlags.isEnabled(...)` checks scattered through the app.

Use the provided patterns for:

- **Component/UI rendering:** wrap experimental UI in `<ExperimentalFeatureGate flag="...">`.
- **Routes:** wrap routed content in `<ExperimentalRouteGate flag="..." fallbackPath="/">`. Disabled deep links redirect safely instead of rendering the feature.
- **Navigation/actions:** attach `featureFlag` metadata to candidate navigation items and pass them through `filterExperimentalNavigation(...)`.
- **Direct state checks:** use `isExperimentalFeatureEnabled(...)` only when a boolean is genuinely more appropriate than a render/navigation gate.

The app-level gate hook listens for local flag changes and cross-tab storage updates, so navigation and mounted surfaces can react immediately after a developer changes a flag in Settings.

Feature flags hide experimental UX; they do not authorize access and must not be treated as a security boundary.

## Flag lifecycle

Flags are temporary scaffolding:

1. **Create** a registry entry with a stable key, clear label/description, and conservative default.
2. **Develop/test** the feature behind the shared component, route, and navigation gates.
3. **Graduate or abandon** the experiment once the product decision is made.
4. **Remove the flag promptly:** delete the registry entry, remove gating branches, and remove dead experimental code if abandoned.

Persisted overrides for removed keys require no migration. The runtime already ignores unknown/stale keys when it loads overrides, and the next write stores only currently registered keys.

Do not preserve obsolete compatibility branches merely because an override may exist in old local storage.
