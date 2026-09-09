import { describe, expect, it } from "vitest";
import type { StorageLike } from "./profileStorage";
import {
  createEmptySceneLibraryState,
  createSavedScene,
  upsertSavedScene,
} from "./sceneLibrary";
import {
  SCENE_LIBRARY_STORAGE_KEY,
  loadSceneLibraryState,
  saveSceneLibraryState,
} from "./sceneLibraryStorage";
import { createEmptySceneComposition } from "./sceneComposition";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("M13.8 scene library storage", () => {
  it("stores saved scenes independently of session state", () => {
    const storage = new MemoryStorage();
    const scene = createSavedScene(
      createEmptySceneComposition({
        themeIds: ["pain"],
        effort: "quick",
        exploration: "familiar",
      }),
      "Quick scene",
      { id: "scene-1" },
    );
    const state = upsertSavedScene(
      createEmptySceneLibraryState(),
      scene,
    );

    saveSceneLibraryState(state, storage);

    expect(storage.getItem(SCENE_LIBRARY_STORAGE_KEY)).not.toBeNull();
    expect(loadSceneLibraryState(storage)).toEqual(state);
  });

  it("falls back to empty for corrupt storage", () => {
    const storage = new MemoryStorage();
    storage.setItem(SCENE_LIBRARY_STORAGE_KEY, "{bad");

    expect(loadSceneLibraryState(storage)).toEqual(
      createEmptySceneLibraryState(),
    );
  });
});
