import { describe, expect, it } from "vitest";
import {
  SCENE_SESSION_STORAGE_KEY,
  clearSceneSessionChoice,
  clearStoredSceneSessionState,
  createEmptySceneSessionState,
  getSceneSessionChoice,
  isSceneSessionExcluded,
  loadSceneSessionState,
  resetSceneSessionState,
  saveSceneSessionState,
  setSceneSessionChoice,
  type SceneSessionStorageLike,
} from "./sceneSession";

function memoryStorage(): SceneSessionStorageLike & {
  values: Map<string, string>;
} {
  const values = new Map<string, string>();

  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

describe("M13.3 scene session state", () => {
  it("stores Yes / Maybe / Not tonight by stable catalog ID", () => {
    let state = createEmptySceneSessionState();
    state = setSceneSessionChoice(
      state,
      "impact-play-item",
      "yes_tonight",
      "2026-09-08T20:00:00.000Z",
    );
    state = setSceneSessionChoice(
      state,
      "service-item",
      "maybe_tonight",
      "2026-09-08T20:01:00.000Z",
    );
    state = setSceneSessionChoice(
      state,
      "restraint-item",
      "not_tonight",
      "2026-09-08T20:02:00.000Z",
    );

    expect(getSceneSessionChoice(state, "impact-play-item")).toBe("yes_tonight");
    expect(getSceneSessionChoice(state, "service-item")).toBe("maybe_tonight");
    expect(isSceneSessionExcluded(state, "restraint-item")).toBe(true);
  });

  it("clears one override without touching the rest", () => {
    let state = createEmptySceneSessionState();
    state = setSceneSessionChoice(state, "one", "yes_tonight", "now");
    state = setSceneSessionChoice(state, "two", "not_tonight", "now");

    state = clearSceneSessionChoice(state, "one");

    expect(getSceneSessionChoice(state, "one")).toBeUndefined();
    expect(getSceneSessionChoice(state, "two")).toBe("not_tonight");
  });

  it("resets the whole current-session map independently", () => {
    let state = createEmptySceneSessionState();
    state = setSceneSessionChoice(state, "one", "maybe_tonight", "now");

    expect(resetSceneSessionState()).toEqual(createEmptySceneSessionState());
    expect(state.overrides.one).toBeDefined();
  });

  it("persists only to the injected session-scoped store", () => {
    const storage = memoryStorage();
    let state = createEmptySceneSessionState();
    state = setSceneSessionChoice(state, "one", "yes_tonight", "now");

    saveSceneSessionState(state, storage);

    expect(storage.values.has(SCENE_SESSION_STORAGE_KEY)).toBe(true);
    expect(loadSceneSessionState(storage)).toEqual(state);

    clearStoredSceneSessionState(storage);
    expect(storage.values.has(SCENE_SESSION_STORAGE_KEY)).toBe(false);
  });

  it("drops corrupt or unsupported session data instead of trusting it", () => {
    const storage = memoryStorage();
    storage.setItem(SCENE_SESSION_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      overrides: {
        good: { choice: "yes_tonight", updatedAt: "now" },
        bad: { choice: "absolutely", updatedAt: "now" },
      },
    }));

    expect(loadSceneSessionState(storage).overrides).toEqual({
      good: { choice: "yes_tonight", updatedAt: "now" },
    });

    storage.setItem(SCENE_SESSION_STORAGE_KEY, "{wat");
    expect(loadSceneSessionState(storage)).toEqual(
      createEmptySceneSessionState(),
    );
  });

  it("removes storage entirely when the session map is empty", () => {
    const storage = memoryStorage();
    storage.setItem(SCENE_SESSION_STORAGE_KEY, "stale");

    saveSceneSessionState(createEmptySceneSessionState(), storage);

    expect(storage.values.has(SCENE_SESSION_STORAGE_KEY)).toBe(false);
  });
});
