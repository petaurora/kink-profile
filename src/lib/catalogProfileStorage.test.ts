import { describe, expect, it } from "vitest";
import {
  CATALOG_PROFILE_STORAGE_KEY,
  LEGACY_KINK_RANKING_STORAGE_KEY,
  loadCatalogProfile,
  saveCatalogProfile,
  type StorageLike,
} from "./catalogProfileStorage";
import { createEmptyCatalogProfileState } from "./catalogProfile";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  writes: Array<[string, string]> = [];

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
    this.writes.push([key, value]);
  }
}

describe("catalog profile storage", () => {
  it("returns an empty profile when storage is empty", () => {
    const storage = new MemoryStorage();
    expect(loadCatalogProfile(storage, {})).toEqual(createEmptyCatalogProfileState());
  });

  it("prefers a valid new store over legacy data", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      CATALOG_PROFILE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        preferences: {
          a: {
            overall: "love",
            updatedAt: "2026-09-06T00:00:00.000Z",
          },
        },
        comparisons: [],
      }),
    );
    storage.values.set(
      LEGACY_KINK_RANKING_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          {
            id: "legacy",
            leftKinkId: "a",
            rightKinkId: "b",
            scope: { type: "overall" },
            result: "left",
            timestamp: "2026-09-06T00:00:00.000Z",
          },
        ],
      }),
    );

    const profile = loadCatalogProfile(storage, {});
    expect(profile.preferences.a?.overall).toBe("love");
    expect(profile.comparisons).toEqual([]);
    expect(storage.writes).toEqual([]);
  });

  it("migrates legacy comparisons losslessly and initializes empty preferences", () => {
    const storage = new MemoryStorage();
    const legacy = {
      schemaVersion: 1,
      comparisons: [
        {
          id: "cmp-1",
          leftKinkId: "a",
          rightKinkId: "b",
          scope: { type: "category", categoryId: "cat" },
          result: "equal",
          timestamp: "2026-09-06T00:00:00.000Z",
        },
      ],
    };
    storage.values.set(LEGACY_KINK_RANKING_STORAGE_KEY, JSON.stringify(legacy));

    const profile = loadCatalogProfile(storage, {});

    expect(profile.preferences).toEqual({});
    expect(profile.comparisons).toEqual(legacy.comparisons);
    expect(storage.values.get(LEGACY_KINK_RANKING_STORAGE_KEY))
      .toBe(JSON.stringify(legacy));
    expect(storage.writes.map(([key]) => key)).toEqual([
      CATALOG_PROFILE_STORAGE_KEY,
    ]);
  });

  it("canonicalizes replacement Catalog IDs during legacy migration", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      LEGACY_KINK_RANKING_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          {
            id: "cmp-1",
            leftKinkId: "old-a",
            rightKinkId: "b",
            scope: { type: "overall" },
            result: "right",
            timestamp: "2026-09-06T00:00:00.000Z",
          },
        ],
      }),
    );

    const profile = loadCatalogProfile(storage, { "old-a": "new-a" });
    expect(profile.comparisons[0]?.leftKinkId).toBe("new-a");
  });

  it("does not derive preferences from ranking outcomes", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      LEGACY_KINK_RANKING_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          {
            id: "win",
            leftKinkId: "a",
            rightKinkId: "b",
            scope: { type: "overall" },
            result: "left",
            timestamp: "2026-09-06T00:00:00.000Z",
          },
          {
            id: "neither",
            leftKinkId: "c",
            rightKinkId: "d",
            scope: { type: "overall" },
            result: "neither",
            timestamp: "2026-09-06T00:01:00.000Z",
          },
          {
            id: "skip",
            leftKinkId: "e",
            rightKinkId: "f",
            scope: { type: "overall" },
            result: "skip",
            timestamp: "2026-09-06T00:02:00.000Z",
          },
        ],
      }),
    );

    expect(loadCatalogProfile(storage, {}).preferences).toEqual({});
  });

  it("ignores malformed individual legacy comparisons while preserving valid history", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      LEGACY_KINK_RANKING_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          { nonsense: true },
          {
            id: "valid",
            leftKinkId: "a",
            rightKinkId: "b",
            scope: { type: "overall" },
            result: "left",
            timestamp: "2026-09-06T00:00:00.000Z",
          },
        ],
      }),
    );

    const profile = loadCatalogProfile(storage, {});
    expect(profile.comparisons.map((item) => item.id)).toEqual(["valid"]);
  });

  it("falls back safely for corrupt legacy data without writing a migration", () => {
    const storage = new MemoryStorage();
    storage.values.set(LEGACY_KINK_RANKING_STORAGE_KEY, "{nope");

    expect(loadCatalogProfile(storage, {})).toEqual(createEmptyCatalogProfileState());
    expect(storage.writes).toEqual([]);
  });

  it("does not re-import legacy data when the new store exists but is corrupt", () => {
    const storage = new MemoryStorage();
    storage.values.set(CATALOG_PROFILE_STORAGE_KEY, "{bad");
    storage.values.set(
      LEGACY_KINK_RANKING_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          {
            id: "legacy",
            leftKinkId: "a",
            rightKinkId: "b",
            scope: { type: "overall" },
            result: "left",
            timestamp: "2026-09-06T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(loadCatalogProfile(storage, {})).toEqual(createEmptyCatalogProfileState());
    expect(storage.writes).toEqual([]);
  });

  it("writes only the new catalog-profile key", () => {
    const storage = new MemoryStorage();
    const profile = createEmptyCatalogProfileState();

    saveCatalogProfile(profile, storage);

    expect(storage.writes.map(([key]) => key)).toEqual([
      CATALOG_PROFILE_STORAGE_KEY,
    ]);
  });
});
