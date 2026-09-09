import { describe, expect, it } from "vitest";
import {
  PROFILE_REGISTRY_STORAGE_KEY,
  PROFILE_SCOPED_LOCAL_STORAGE_KEYS,
  PROFILE_SCOPED_SESSION_STORAGE_KEYS,
  createProfileScopedStorage,
  ensureProfileRegistry,
  getActiveProfileSessionStorage,
  getActiveProfileStorage,
  parseProfileRegistry,
  profileScopedStorageKey,
  setActiveProfileId,
  type ProfileRegistryStorageLike,
} from "./profileRegistry";

class MemoryStorage implements ProfileRegistryStorageLike {
  values = new Map<string, string>();
  failOnSetKey?: string;

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (key === this.failOnSetKey) {
      throw new Error("simulated storage failure");
    }
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const profileA = "profile-test-a";
const profileB = "profile-test-b";
const now = "2026-09-09T14:00:00.000Z";

describe("profile registry migration", () => {
  it("creates one stable active profile on first run", () => {
    const storage = new MemoryStorage();

    const registry = ensureProfileRegistry(storage, {
      profileId: profileA,
      now,
    });

    expect(registry).toEqual({
      schemaVersion: 1,
      activeProfileId: profileA,
      profiles: [
        {
          id: profileA,
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    expect(
      JSON.parse(
        storage.getItem(PROFILE_REGISTRY_STORAGE_KEY) ?? "",
      ),
    ).toEqual(registry);
  });

  it("copies every known legacy local key into the first profile namespace without deleting the source", () => {
    const storage = new MemoryStorage();

    for (const key of PROFILE_SCOPED_LOCAL_STORAGE_KEYS) {
      storage.setItem(key, "legacy:" + key);
    }

    ensureProfileRegistry(storage, {
      profileId: profileA,
      now,
    });

    for (const key of PROFILE_SCOPED_LOCAL_STORAGE_KEYS) {
      expect(storage.getItem(key)).toBe("legacy:" + key);
      expect(
        storage.getItem(
          profileScopedStorageKey(profileA, key),
        ),
      ).toBe("legacy:" + key);
    }
  });

  it("writes the registry only after scoped migration succeeds and cleans partial scoped writes on failure", () => {
    const storage = new MemoryStorage();
    const firstKey = PROFILE_SCOPED_LOCAL_STORAGE_KEYS[0];
    const secondKey = PROFILE_SCOPED_LOCAL_STORAGE_KEYS[1];

    storage.setItem(firstKey, "first");
    storage.setItem(secondKey, "second");
    storage.failOnSetKey = profileScopedStorageKey(
      profileA,
      secondKey,
    );

    expect(() =>
      ensureProfileRegistry(storage, {
        profileId: profileA,
        now,
      }),
    ).toThrow("simulated storage failure");

    expect(
      storage.getItem(PROFILE_REGISTRY_STORAGE_KEY),
    ).toBeNull();
    expect(storage.getItem(firstKey)).toBe("first");
    expect(storage.getItem(secondKey)).toBe("second");
    expect(
      storage.getItem(
        profileScopedStorageKey(profileA, firstKey),
      ),
    ).toBeNull();
  });

  it("does not re-copy stale legacy data after a registry already exists", () => {
    const storage = new MemoryStorage();
    const key = PROFILE_SCOPED_LOCAL_STORAGE_KEYS[0];

    storage.setItem(key, "before");
    ensureProfileRegistry(storage, {
      profileId: profileA,
      now,
    });

    const scoped = createProfileScopedStorage(
      storage,
      profileA,
    );
    scoped.setItem(key, "current");
    storage.setItem(key, "stale legacy");

    expect(
      ensureProfileRegistry(storage, {
        profileId: profileB,
        now: "2026-09-10T00:00:00.000Z",
      }).activeProfileId,
    ).toBe(profileA);
    expect(scoped.getItem(key)).toBe("current");
  });

  it("isolates the same storage keys across profile IDs", () => {
    const storage = new MemoryStorage();
    const a = createProfileScopedStorage(storage, profileA);
    const b = createProfileScopedStorage(storage, profileB);

    a.setItem("pet-profile-v2", "A");
    b.setItem("pet-profile-v2", "B");

    expect(a.getItem("pet-profile-v2")).toBe("A");
    expect(b.getItem("pet-profile-v2")).toBe("B");
  });

  it("migrates existing session-only Scene Builder state into the active profile namespace", () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();

    ensureProfileRegistry(local, {
      profileId: profileA,
      now,
    });

    for (const key of PROFILE_SCOPED_SESSION_STORAGE_KEYS) {
      session.setItem(key, "session:" + key);
    }

    const scopedSession = getActiveProfileSessionStorage(
      local,
      session,
    );

    for (const key of PROFILE_SCOPED_SESSION_STORAGE_KEYS) {
      expect(scopedSession.getItem(key)).toBe(
        "session:" + key,
      );
      expect(session.getItem(key)).toBe(
        "session:" + key,
      );
    }
  });

  it("returns the active profile storage after migration", () => {
    const storage = new MemoryStorage();
    storage.setItem("pet-profile-settings-v1", "settings");

    ensureProfileRegistry(storage, {
      profileId: profileA,
      now,
    });

    expect(
      getActiveProfileStorage(storage).getItem(
        "pet-profile-settings-v1",
      ),
    ).toBe("settings");
  });

  it("refuses to activate a profile that is not registered", () => {
    const storage = new MemoryStorage();
    ensureProfileRegistry(storage, {
      profileId: profileA,
      now,
    });

    expect(() =>
      setActiveProfileId(profileB, storage, now),
    ).toThrow("unknown profile");
  });

  it("rejects malformed registries with duplicate IDs", () => {
    expect(
      parseProfileRegistry({
        schemaVersion: 1,
        activeProfileId: profileA,
        profiles: [
          { id: profileA, createdAt: now, updatedAt: now },
          { id: profileA, createdAt: now, updatedAt: now },
        ],
      }),
    ).toBeNull();
  });
});
