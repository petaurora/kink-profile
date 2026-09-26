import { describe, expect, it } from "vitest";
import {
  FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION,
  createFeatureFlagRuntime,
  type FeatureFlagStorage,
} from "./featureFlags";
import {
  clearExperimentalFeatureOverride,
  filterExperimentalNavigation,
  isExperimentalFeatureEnabled,
  resolveExperimentalRoute,
  resetExperimentalFeatureOverrides,
  setExperimentalFeatureOverride,
} from "./experimentalFeatureGates";

class MemoryStorage implements FeatureFlagStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const registry = {
  bodyMap: {
    label: "Body Map",
    description: "Try the experimental body preference map.",
    defaultValue: false,
  },
  establishedFlow: {
    label: "Established flow",
    description: "A normally enabled feature used for gating tests.",
    defaultValue: true,
  },
} as const;

describe("experimental feature gating", () => {
  it("keeps disabled experimental navigation out of ordinary navigation", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:gates");
    const storage = new MemoryStorage();

    const visible = filterExperimentalNavigation(
      [
        { id: "hub" },
        { id: "body-map", featureFlag: "bodyMap" as const },
      ],
      runtime,
      storage,
    );

    expect(visible.map((item) => item.id)).toEqual(["hub"]);
  });

  it("exposes gated navigation and rendering when a local override enables the flag", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:gates");
    const storage = new MemoryStorage();

    expect(isExperimentalFeatureEnabled(runtime, "bodyMap", storage)).toBe(
      false,
    );

    setExperimentalFeatureOverride(runtime, "bodyMap", true, storage);

    expect(isExperimentalFeatureEnabled(runtime, "bodyMap", storage)).toBe(
      true,
    );
    expect(
      filterExperimentalNavigation(
        [
          { id: "hub" },
          { id: "body-map", featureFlag: "bodyMap" as const },
        ],
        runtime,
        storage,
      ).map((item) => item.id),
    ).toEqual(["hub", "body-map"]);
  });

  it("redirects disabled direct route entry to the declared safe fallback", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:gates");
    const storage = new MemoryStorage();

    expect(
      resolveExperimentalRoute(runtime, "bodyMap", "/profile", storage),
    ).toEqual({
      allowed: false,
      redirectTo: "/profile",
    });

    setExperimentalFeatureOverride(runtime, "bodyMap", true, storage);

    expect(
      resolveExperimentalRoute(runtime, "bodyMap", "/profile", storage),
    ).toEqual({
      allowed: true,
      redirectTo: null,
    });
  });

  it("clears one override or every override back to registry defaults", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:gates");
    const storage = new MemoryStorage();

    setExperimentalFeatureOverride(runtime, "bodyMap", true, storage);
    setExperimentalFeatureOverride(runtime, "establishedFlow", false, storage);

    clearExperimentalFeatureOverride(runtime, "bodyMap", storage);
    expect(runtime.isEnabled("bodyMap", storage)).toBe(false);
    expect(runtime.isEnabled("establishedFlow", storage)).toBe(false);

    resetExperimentalFeatureOverrides(runtime, storage);
    expect(runtime.isEnabled("bodyMap", storage)).toBe(false);
    expect(runtime.isEnabled("establishedFlow", storage)).toBe(true);
  });

  it("ignores stale overrides after a flag is removed from the registry", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:gates");
    const storage = new MemoryStorage();

    storage.setItem(
      runtime.storageKey,
      JSON.stringify({
        schemaVersion: FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION,
        overrides: {
          bodyMap: true,
          removedExperiment: true,
        },
      }),
    );

    expect(runtime.isEnabled("bodyMap", storage)).toBe(true);
    expect(runtime.loadOverrides(storage)).toEqual({ bodyMap: true });
  });
});
