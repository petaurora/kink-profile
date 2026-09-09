export const PROFILE_REGISTRY_SCHEMA_VERSION = 1 as const;
export const PROFILE_REGISTRY_STORAGE_KEY =
  "kink-profile-profile-registry-v1";
export const PROFILE_STORAGE_NAMESPACE_PREFIX =
  "kink-profile-profile";

export type ProfileId = string;

export type ProfileRegistryEntry = {
  id: ProfileId;
  createdAt: string;
  updatedAt: string;
};

export type AppProfileRegistry = {
  schemaVersion: typeof PROFILE_REGISTRY_SCHEMA_VERSION;
  activeProfileId: ProfileId;
  legacyProfileId: ProfileId;
  profiles: ProfileRegistryEntry[];
};

export type ProfileRegistryStorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type ProfileScopedStorageLike = ProfileRegistryStorageLike;

export const PROFILE_SCOPED_LOCAL_STORAGE_KEYS = [
  "pet-profile-v2",
  "pet-profile-quiz-v1",
  "pet-profile-catalog-v1",
  "pet-profile-kink-ranking-v1",
  "pet-profile-settings-v1",
  "pet-profile-rewards-punishments-v1",
  "pet-profile-rewards-punishments-ranking-v1",
  "pet-profile-rewards-punishments-recipes-v1",
  "pet-profile-rewards-punishments-sorter-ui-v1",
  "pet-profile-saved-scenes-v1",
] as const;

export const PROFILE_SCOPED_SESSION_STORAGE_KEYS = [
  "kink-profile-scene-session-v1",
  "kink-profile-scene-randomizer-v1",
] as const;

const profileIdPattern =
  /^profile-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function browserLocalStorage(): ProfileRegistryStorageLike {
  return localStorage;
}

function browserSessionStorage(): ProfileRegistryStorageLike {
  return sessionStorage;
}

function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value))
  );
}

export function isProfileId(value: unknown): value is ProfileId {
  return (
    typeof value === "string" &&
    profileIdPattern.test(value)
  );
}

function parseRegistryEntry(
  value: unknown,
): ProfileRegistryEntry | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const entry = value as Record<string, unknown>;
  if (
    !isProfileId(entry.id) ||
    !validDate(entry.createdAt) ||
    !validDate(entry.updatedAt)
  ) {
    return null;
  }

  return {
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function parseProfileRegistry(
  value: unknown,
): AppProfileRegistry | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const registry = value as Record<string, unknown>;
  if (
    registry.schemaVersion !== PROFILE_REGISTRY_SCHEMA_VERSION ||
    !isProfileId(registry.activeProfileId) ||
    !isProfileId(registry.legacyProfileId) ||
    !Array.isArray(registry.profiles)
  ) {
    return null;
  }

  const profiles = registry.profiles.map(parseRegistryEntry);
  if (profiles.some((entry) => entry === null)) return null;

  const validProfiles = profiles.filter(
    (entry): entry is ProfileRegistryEntry =>
      entry !== null,
  );
  if (validProfiles.length === 0) return null;

  const ids = validProfiles.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) return null;
  if (!ids.includes(registry.activeProfileId)) return null;

  return {
    schemaVersion: PROFILE_REGISTRY_SCHEMA_VERSION,
    activeProfileId: registry.activeProfileId,
    legacyProfileId: registry.legacyProfileId,
    profiles: validProfiles,
  };
}

function defaultRandomId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

export function createProfileId(
  randomId: () => string = defaultRandomId,
): ProfileId {
  const normalized = randomId()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `profile-${normalized || "local"}`;
}

export function profileScopedStorageKey(
  profileId: ProfileId,
  storageKey: string,
) {
  if (!isProfileId(profileId)) {
    throw new Error("Invalid profile ID.");
  }

  return (
    PROFILE_STORAGE_NAMESPACE_PREFIX +
    ":" +
    profileId +
    ":" +
    storageKey
  );
}

function createRegistry(
  profileId: ProfileId,
  now: string,
): AppProfileRegistry {
  return {
    schemaVersion: PROFILE_REGISTRY_SCHEMA_VERSION,
    activeProfileId: profileId,
    legacyProfileId: profileId,
    profiles: [
      {
        id: profileId,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function migrateKnownKeys(
  storage: ProfileRegistryStorageLike,
  profileId: ProfileId,
  keys: readonly string[],
) {
  const written: string[] = [];

  try {
    for (const legacyKey of keys) {
      const raw = storage.getItem(legacyKey);
      if (raw === null) continue;

      const scopedKey = profileScopedStorageKey(
        profileId,
        legacyKey,
      );
      if (storage.getItem(scopedKey) !== null) continue;

      storage.setItem(scopedKey, raw);
      written.push(scopedKey);
    }
  } catch (error) {
    for (const scopedKey of written) {
      try {
        storage.removeItem(scopedKey);
      } catch {
        // Best-effort cleanup. Legacy keys remain untouched.
      }
    }
    throw error;
  }

  return written;
}

export function ensureProfileRegistry(
  storage: ProfileRegistryStorageLike = browserLocalStorage(),
  options: {
    now?: string;
    profileId?: ProfileId;
  } = {},
): AppProfileRegistry {
  const raw = storage.getItem(PROFILE_REGISTRY_STORAGE_KEY);

  if (raw) {
    try {
      const parsed = parseProfileRegistry(JSON.parse(raw));
      if (parsed) return parsed;
    } catch {
      // Fall through to a fresh migration from untouched legacy keys.
    }
  }

  const profileId =
    options.profileId ?? createProfileId();
  if (!isProfileId(profileId)) {
    throw new Error("Cannot initialize an invalid profile ID.");
  }

  const now = options.now ?? new Date().toISOString();
  const written = migrateKnownKeys(
    storage,
    profileId,
    PROFILE_SCOPED_LOCAL_STORAGE_KEYS,
  );
  const registry = createRegistry(profileId, now);

  try {
    storage.setItem(
      PROFILE_REGISTRY_STORAGE_KEY,
      JSON.stringify(registry),
    );
  } catch (error) {
    for (const scopedKey of written) {
      try {
        storage.removeItem(scopedKey);
      } catch {
        // Legacy keys remain untouched even if cleanup is incomplete.
      }
    }
    throw error;
  }

  return registry;
}

export function loadProfileRegistry(
  storage: ProfileRegistryStorageLike = browserLocalStorage(),
) {
  return ensureProfileRegistry(storage);
}

export function getActiveProfileId(
  storage: ProfileRegistryStorageLike = browserLocalStorage(),
) {
  return ensureProfileRegistry(storage).activeProfileId;
}

export function createProfileScopedStorage(
  storage: ProfileRegistryStorageLike,
  profileId: ProfileId,
): ProfileScopedStorageLike {
  if (!isProfileId(profileId)) {
    throw new Error("Cannot scope storage to an invalid profile ID.");
  }

  return {
    getItem(key) {
      return storage.getItem(
        profileScopedStorageKey(profileId, key),
      );
    },
    setItem(key, value) {
      storage.setItem(
        profileScopedStorageKey(profileId, key),
        value,
      );
    },
    removeItem(key) {
      storage.removeItem(
        profileScopedStorageKey(profileId, key),
      );
    },
  };
}

export function getProfileStorageForId(
  profileId: ProfileId,
  storage: ProfileRegistryStorageLike = browserLocalStorage(),
) {
  const registry = ensureProfileRegistry(storage);
  if (
    !registry.profiles.some(
      (profile) => profile.id === profileId,
    )
  ) {
    throw new Error("Unknown profile ID.");
  }

  return createProfileScopedStorage(storage, profileId);
}

export function getActiveProfileStorage(
  storage: ProfileRegistryStorageLike = browserLocalStorage(),
) {
  const registry = ensureProfileRegistry(storage);
  return createProfileScopedStorage(
    storage,
    registry.activeProfileId,
  );
}

export function getActiveProfileSessionStorage(
  localStorageBackend: ProfileRegistryStorageLike = browserLocalStorage(),
  sessionStorageBackend: ProfileRegistryStorageLike = browserSessionStorage(),
) {
  const registry = ensureProfileRegistry(
    localStorageBackend,
  );
  const profileId = registry.activeProfileId;

  if (profileId === registry.legacyProfileId) {
    migrateKnownKeys(
      sessionStorageBackend,
      profileId,
      PROFILE_SCOPED_SESSION_STORAGE_KEYS,
    );
  }

  return createProfileScopedStorage(
    sessionStorageBackend,
    profileId,
  );
}

export function setActiveProfileId(
  profileId: ProfileId,
  storage: ProfileRegistryStorageLike = browserLocalStorage(),
  now = new Date().toISOString(),
): AppProfileRegistry {
  const registry = ensureProfileRegistry(storage);
  const profile = registry.profiles.find(
    (entry) => entry.id === profileId,
  );
  if (!profile) {
    throw new Error("Cannot activate an unknown profile.");
  }

  const next: AppProfileRegistry = {
    ...registry,
    activeProfileId: profileId,
    profiles: registry.profiles.map((entry) =>
      entry.id === profileId
        ? { ...entry, updatedAt: now }
        : entry,
    ),
  };

  storage.setItem(
    PROFILE_REGISTRY_STORAGE_KEY,
    JSON.stringify(next),
  );
  return next;
}
