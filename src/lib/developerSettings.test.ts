import { describe, expect, it } from "vitest";
import {
  loadDeveloperToolsEnabled,
  saveDeveloperToolsEnabled,
} from "./developerSettings";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("developer tools preference", () => {
  it("defaults to hidden", () => {
    expect(loadDeveloperToolsEnabled(new MemoryStorage())).toBe(false);
  });

  it("persists and clears local discoverability", () => {
    const storage = new MemoryStorage();

    saveDeveloperToolsEnabled(true, storage);
    expect(loadDeveloperToolsEnabled(storage)).toBe(true);

    saveDeveloperToolsEnabled(false, storage);
    expect(loadDeveloperToolsEnabled(storage)).toBe(false);
    expect(storage.length).toBe(0);
  });
});
