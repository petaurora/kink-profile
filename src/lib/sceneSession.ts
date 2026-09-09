export const sceneSessionChoices = [
  "yes_tonight",
  "maybe_tonight",
  "not_tonight",
] as const;

export type SceneSessionChoice = (typeof sceneSessionChoices)[number];

export type SceneSessionOverride = {
  choice: SceneSessionChoice;
  updatedAt: string;
};

export type SceneSessionState = {
  schemaVersion: 1;
  overrides: Record<string, SceneSessionOverride>;
};

export type SceneSessionStorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export const SCENE_SESSION_STORAGE_KEY = "kink-profile-scene-session-v1";

export function createEmptySceneSessionState(): SceneSessionState {
  return {
    schemaVersion: 1,
    overrides: {},
  };
}

export function isSceneSessionChoice(
  value: unknown,
): value is SceneSessionChoice {
  return (
    typeof value === "string" &&
    (sceneSessionChoices as readonly string[]).includes(value)
  );
}

export function getSceneSessionChoice(
  state: SceneSessionState | undefined,
  catalogId: string,
) {
  return state?.overrides[catalogId]?.choice;
}

export function setSceneSessionChoice(
  state: SceneSessionState,
  catalogId: string,
  choice: SceneSessionChoice,
  updatedAt = new Date().toISOString(),
): SceneSessionState {
  return {
    ...state,
    overrides: {
      ...state.overrides,
      [catalogId]: {
        choice,
        updatedAt,
      },
    },
  };
}

export function clearSceneSessionChoice(
  state: SceneSessionState,
  catalogId: string,
): SceneSessionState {
  if (!state.overrides[catalogId]) return state;

  const overrides = { ...state.overrides };
  delete overrides[catalogId];

  return {
    ...state,
    overrides,
  };
}

export function resetSceneSessionState(): SceneSessionState {
  return createEmptySceneSessionState();
}

export function isSceneSessionExcluded(
  state: SceneSessionState | undefined,
  catalogId: string,
) {
  return getSceneSessionChoice(state, catalogId) === "not_tonight";
}

function browserSessionStorage(): SceneSessionStorageLike {
  return sessionStorage;
}

export function loadSceneSessionState(
  storage: SceneSessionStorageLike = browserSessionStorage(),
): SceneSessionState {
  try {
    const raw = storage.getItem(SCENE_SESSION_STORAGE_KEY);
    if (!raw) return createEmptySceneSessionState();

    const parsed = JSON.parse(raw) as Partial<SceneSessionState>;
    if (
      parsed.schemaVersion !== 1 ||
      !parsed.overrides ||
      typeof parsed.overrides !== "object" ||
      Array.isArray(parsed.overrides)
    ) {
      return createEmptySceneSessionState();
    }

    const overrides: Record<string, SceneSessionOverride> = {};

    for (const [catalogId, value] of Object.entries(parsed.overrides)) {
      if (
        !catalogId ||
        !value ||
        typeof value !== "object" ||
        !("choice" in value) ||
        !isSceneSessionChoice(value.choice)
      ) {
        continue;
      }

      const updatedAt =
        "updatedAt" in value && typeof value.updatedAt === "string"
          ? value.updatedAt
          : "";

      overrides[catalogId] = {
        choice: value.choice,
        updatedAt,
      };
    }

    return {
      schemaVersion: 1,
      overrides,
    };
  } catch {
    return createEmptySceneSessionState();
  }
}

export function saveSceneSessionState(
  state: SceneSessionState,
  storage: SceneSessionStorageLike = browserSessionStorage(),
) {
  if (Object.keys(state.overrides).length === 0) {
    storage.removeItem(SCENE_SESSION_STORAGE_KEY);
    return;
  }

  storage.setItem(
    SCENE_SESSION_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function clearStoredSceneSessionState(
  storage: SceneSessionStorageLike = browserSessionStorage(),
) {
  storage.removeItem(SCENE_SESSION_STORAGE_KEY);
}
