import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  createFeatureFlagRuntime,
  type FeatureFlagStorage,
} from "../../lib/featureFlags";
import { ExperimentalFeaturesPanel } from "./ExperimentalFeaturesPanel";
import {
  clearExperimentalFeatureOverride,
  resetExperimentalFeatureOverrides,
  setExperimentalFeatureOverride,
} from "../../lib/experimentalFeatureGates";

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
  alternateHub: {
    label: "Alternate Hub",
    description: "Try an alternate Hub composition.",
    defaultValue: true,
  },
} as const;

describe("Experimental Features controls", () => {
  it("shows an honest empty state when the application registry has no flags", () => {
    const html = renderToStaticMarkup(<ExperimentalFeaturesPanel />);

    expect(html).toContain("Experimental Features");
    expect(html).toContain("No experimental features registered.");
    expect(html).toContain("browser only");
  });

  it("toggles the effective state by writing an explicit local override", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:experiments");
    const storage = new MemoryStorage();

    setExperimentalFeatureOverride(runtime, "bodyMap", true, storage);

    expect(runtime.getState("bodyMap", storage)).toMatchObject({
      defaultValue: false,
      overrideValue: true,
      effectiveValue: true,
      isOverridden: true,
    });

    setExperimentalFeatureOverride(runtime, "alternateHub", false, storage);

    expect(runtime.getState("alternateHub", storage)).toMatchObject({
      defaultValue: true,
      overrideValue: false,
      effectiveValue: false,
      isOverridden: true,
    });
  });

  it("clears one override back to default without touching another", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:experiments");
    const storage = new MemoryStorage();

    setExperimentalFeatureOverride(runtime, "bodyMap", true, storage);
    setExperimentalFeatureOverride(runtime, "alternateHub", false, storage);
    clearExperimentalFeatureOverride(runtime, "bodyMap", storage);

    expect(runtime.getState("bodyMap", storage)).toMatchObject({
      effectiveValue: false,
      isOverridden: false,
    });
    expect(runtime.getState("alternateHub", storage)).toMatchObject({
      effectiveValue: false,
      isOverridden: true,
    });
  });

  it("resets every local override while preserving registry defaults", () => {
    const runtime = createFeatureFlagRuntime(registry, "test:experiments");
    const storage = new MemoryStorage();

    setExperimentalFeatureOverride(runtime, "bodyMap", true, storage);
    setExperimentalFeatureOverride(runtime, "alternateHub", false, storage);
    resetExperimentalFeatureOverrides(runtime, storage);

    expect(runtime.getState("bodyMap", storage)).toMatchObject({
      effectiveValue: false,
      isOverridden: false,
    });
    expect(runtime.getState("alternateHub", storage)).toMatchObject({
      effectiveValue: true,
      isOverridden: false,
    });
  });
});
