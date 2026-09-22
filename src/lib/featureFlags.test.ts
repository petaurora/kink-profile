import { describe, expect, it } from "vitest";
import {
  FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION,
  createFeatureFlagRuntime,
  type FeatureFlagStorage,
} from "./featureFlags";

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

class ThrowingStorage implements FeatureFlagStorage {
  getItem() {
    throw new Error("storage unavailable");
  }

  removeItem() {
    throw new Error("storage unavailable");
  }

  setItem() {
    throw new Error("storage unavailable");
  }
}

const registry = {
  newHub: {
    label: "New hub",
    description: "Try the experimental hub.",
    defaultValue: false,
  },
  establishedFlow: {
    label: "Established flow",
    description: "A normally enabled flag used to verify false overrides.",
    defaultValue: true,
  },
} as const;

const STORAGE_KEY = "test:feature-flags";

describe("feature flag runtime", () => {
  it("uses typed registry defaults when no overrides exist", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new MemoryStorage();

    expect(runtime.listDefinitions()).toEqual([
      {
        key: "newHub",
        label: "New hub",
        description: "Try the experimental hub.",
        defaultValue: false,
      },
      {
        key: "establishedFlow",
        label: "Established flow",
        description: "A normally enabled flag used to verify false overrides.",
        defaultValue: true,
      },
    ]);
    expect(runtime.isEnabled("newHub", storage)).toBe(false);
    expect(runtime.isEnabled("establishedFlow", storage)).toBe(true);
  });

  it("persists explicit true and false local overrides", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new MemoryStorage();

    runtime.setOverride("newHub", true, storage);
    runtime.setOverride("establishedFlow", false, storage);

    expect(runtime.getState("newHub", storage)).toMatchObject({
      defaultValue: false,
      overrideValue: true,
      effectiveValue: true,
      isOverridden: true,
    });
    expect(runtime.getState("establishedFlow", storage)).toMatchObject({
      defaultValue: true,
      overrideValue: false,
      effectiveValue: false,
      isOverridden: true,
    });

    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}")).toEqual({
      schemaVersion: FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION,
      overrides: {
        newHub: true,
        establishedFlow: false,
      },
    });
  });

  it("clears one override back to its registry default", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new MemoryStorage();

    runtime.setOverride("newHub", true, storage);
    runtime.setOverride("establishedFlow", false, storage);
    runtime.clearOverride("newHub", storage);

    expect(runtime.getState("newHub", storage)).toMatchObject({
      overrideValue: undefined,
      effectiveValue: false,
      isOverridden: false,
    });
    expect(runtime.isEnabled("establishedFlow", storage)).toBe(false);
  });

  it("resets all overrides by removing the persisted override record", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new MemoryStorage();

    runtime.setOverride("newHub", true, storage);
    runtime.resetOverrides(storage);

    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(runtime.isEnabled("newHub", storage)).toBe(false);
  });

  it("ignores unknown, removed, and non-boolean persisted values", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new MemoryStorage();

    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION,
        overrides: {
          newHub: true,
          removedExperiment: true,
          establishedFlow: "false",
        },
      }),
    );

    expect(runtime.loadOverrides(storage)).toEqual({ newHub: true });
    expect(runtime.isEnabled("newHub", storage)).toBe(true);
    expect(runtime.isEnabled("establishedFlow", storage)).toBe(true);
  });

  it("falls back safely for malformed or incompatible persisted data", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new MemoryStorage();

    storage.setItem(STORAGE_KEY, "{not-json");
    expect(runtime.isEnabled("newHub", storage)).toBe(false);

    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 99,
        overrides: { newHub: true },
      }),
    );
    expect(runtime.isEnabled("newHub", storage)).toBe(false);
  });

  it("treats storage failures as no overrides", () => {
    const runtime = createFeatureFlagRuntime(registry, STORAGE_KEY);
    const storage = new ThrowingStorage();

    expect(runtime.isEnabled("newHub", storage)).toBe(false);
    expect(() => runtime.setOverride("newHub", true, storage)).not.toThrow();
    expect(() => runtime.clearOverride("newHub", storage)).not.toThrow();
    expect(() => runtime.resetOverrides(storage)).not.toThrow();
  });
});
