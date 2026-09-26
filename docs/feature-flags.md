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

## Boundaries

This runtime does not yet define UI/navigation/route gating conventions or the Advanced Settings controls. Those are tracked separately under #247 and #248.

Flags should remain temporary scaffolding. The lifecycle and cleanup rules for graduating or abandoning a flag will be finalized with the gating work in #248.
