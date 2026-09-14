import { describe, expect, it } from "vitest";
import {
  PROFILE_BOUNDARY_STATE_STORAGE_KEY,
  affirmNoLimits,
  clearLimitsAssertion,
  loadProfileBoundaryState,
  saveProfileBoundaryState,
  type BoundaryStateStorageLike,
} from "./profileBoundaryState";

class MemoryStorage implements BoundaryStateStorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("profile boundary state", () => {
  it("treats missing storage as unknown instead of affirmative none", () => {
    const state = loadProfileBoundaryState(new MemoryStorage());
    expect(state).toEqual({ schemaVersion: 1 });
  });

  it("persists a direct none assertion independently from measured catalog data", () => {
    const storage = new MemoryStorage();
    const asserted = affirmNoLimits(
      { schemaVersion: 1 },
      "2026-09-14T18:00:00.000Z",
    );

    saveProfileBoundaryState(asserted, storage);

    expect(loadProfileBoundaryState(storage)).toEqual(asserted);
    expect(storage.values.has(PROFILE_BOUNDARY_STATE_STORAGE_KEY)).toBe(true);
  });

  it("drops malformed or unsupported assertion data safely", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      PROFILE_BOUNDARY_STATE_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, limits: { kind: "none" } }),
    );

    expect(loadProfileBoundaryState(storage)).toEqual({ schemaVersion: 1 });
  });

  it("clears only the presentation assertion without touching other state", () => {
    const state = affirmNoLimits(
      { schemaVersion: 1 },
      "2026-09-14T18:00:00.000Z",
    );

    expect(clearLimitsAssertion(state)).toEqual({ schemaVersion: 1 });
  });
});
