export const PROFILE_SETTINGS_STORAGE_KEY = "pet-profile-settings-v1";
export const PROFILE_SETTINGS_SCHEMA_VERSION = 1 as const;
export const DEFAULT_PROFILE_DISPLAY_NAME = "Pet";
export const MAX_PROFILE_DISPLAY_NAME_LENGTH = 48;

export type ProfileSettings = {
  schemaVersion: typeof PROFILE_SETTINGS_SCHEMA_VERSION;
  displayName: string;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function normalizeProfileDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_PROFILE_DISPLAY_NAME_LENGTH);
}

export function createDefaultProfileSettings(): ProfileSettings {
  return {
    schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
    displayName: DEFAULT_PROFILE_DISPLAY_NAME,
  };
}

function browserStorage(): StorageLike | undefined {
  return typeof localStorage === "undefined" ? undefined : localStorage;
}

export function loadProfileSettings(
  storage: StorageLike | undefined = browserStorage(),
): ProfileSettings {
  if (!storage) return createDefaultProfileSettings();

  try {
    const raw = storage.getItem(PROFILE_SETTINGS_STORAGE_KEY);
    if (!raw) return createDefaultProfileSettings();

    const parsed = JSON.parse(raw) as Partial<ProfileSettings>;
    if (parsed.schemaVersion !== PROFILE_SETTINGS_SCHEMA_VERSION) {
      return createDefaultProfileSettings();
    }

    const displayName =
      typeof parsed.displayName === "string"
        ? normalizeProfileDisplayName(parsed.displayName)
        : "";

    return {
      schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
      displayName: displayName || DEFAULT_PROFILE_DISPLAY_NAME,
    };
  } catch {
    return createDefaultProfileSettings();
  }
}

export function saveProfileSettings(
  settings: ProfileSettings,
  storage: StorageLike | undefined = browserStorage(),
) {
  if (!storage) return;

  const displayName =
    normalizeProfileDisplayName(settings.displayName) || DEFAULT_PROFILE_DISPLAY_NAME;

  storage.setItem(
    PROFILE_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
      displayName,
    } satisfies ProfileSettings),
  );
}
