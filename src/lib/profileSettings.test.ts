import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROFILE_DISPLAY_NAME,
  MAX_PROFILE_DISPLAY_NAME_LENGTH,
  PROFILE_SETTINGS_SCHEMA_VERSION,
  PROFILE_SETTINGS_STORAGE_KEY,
  createDefaultProfileSettings,
  loadProfileSettings,
  normalizeProfileDisplayName,
  saveProfileSettings,
  type StorageLike,
} from "./profileSettings";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("profile settings", () => {
  it("defaults empty storage without writing", () => {
    const storage = new MemoryStorage();
    expect(loadProfileSettings(storage)).toEqual(createDefaultProfileSettings());
    expect(storage.values.size).toBe(0);
  });

  it("loads and normalizes a valid persisted display name", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      PROFILE_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
        displayName: "  Kitty   Bean  ",
      }),
    );

    expect(loadProfileSettings(storage).displayName).toBe("Kitty Bean");
  });

  it("falls back safely for corrupt or unsupported settings", () => {
    const corrupt = new MemoryStorage();
    corrupt.values.set(PROFILE_SETTINGS_STORAGE_KEY, "{nope");

    const unsupported = new MemoryStorage();
    unsupported.values.set(
      PROFILE_SETTINGS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 999, displayName: "Kitty" }),
    );

    expect(loadProfileSettings(corrupt).displayName).toBe(DEFAULT_PROFILE_DISPLAY_NAME);
    expect(loadProfileSettings(unsupported).displayName).toBe(DEFAULT_PROFILE_DISPLAY_NAME);
  });

  it("normalizes whitespace and enforces the display-name length bound", () => {
    expect(normalizeProfileDisplayName("  Kitty   Bean  ")).toBe("Kitty Bean");
    expect(normalizeProfileDisplayName("x".repeat(100))).toHaveLength(
      MAX_PROFILE_DISPLAY_NAME_LENGTH,
    );
  });

  it("persists a versioned settings envelope", () => {
    const storage = new MemoryStorage();

    saveProfileSettings(
      {
        schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
        displayName: "Kitty",
      },
      storage,
    );

    expect(JSON.parse(storage.values.get(PROFILE_SETTINGS_STORAGE_KEY) ?? "{}")).toEqual({
      schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
      displayName: "Kitty",
    });
  });

  it("never persists a blank display name", () => {
    const storage = new MemoryStorage();

    saveProfileSettings(
      {
        schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
        displayName: "   ",
      },
      storage,
    );

    expect(JSON.parse(storage.values.get(PROFILE_SETTINGS_STORAGE_KEY) ?? "{}").displayName)
      .toBe(DEFAULT_PROFILE_DISPLAY_NAME);
  });
});
