import {
  createEmptySceneLibraryState,
  parseSceneLibraryState,
  type SceneLibraryState,
} from "./sceneLibrary";
import type { StorageLike } from "./profileStorage";

export const SCENE_LIBRARY_STORAGE_KEY =
  "pet-profile-saved-scenes-v1";

function browserStorage(): StorageLike {
  return localStorage;
}

export function loadSceneLibraryState(
  storage: StorageLike = browserStorage(),
): SceneLibraryState {
  const raw = storage.getItem(SCENE_LIBRARY_STORAGE_KEY);
  if (!raw) return createEmptySceneLibraryState();

  try {
    const parsed = parseSceneLibraryState(JSON.parse(raw));
    return parsed ?? createEmptySceneLibraryState();
  } catch {
    return createEmptySceneLibraryState();
  }
}

export function saveSceneLibraryState(
  state: SceneLibraryState,
  storage: StorageLike = browserStorage(),
) {
  storage.setItem(
    SCENE_LIBRARY_STORAGE_KEY,
    JSON.stringify(state),
  );
}
