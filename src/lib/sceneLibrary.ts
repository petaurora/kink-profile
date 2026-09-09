import {
  sceneThemeDefinitions,
  type SceneThemeId,
} from "../data/sceneThemes";
import type {
  RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";
import type {
  SceneComponentSource,
  SceneComposition,
  SceneCompositionComponent,
  SceneEffort,
  ScenePhaseId,
  SceneRewardPunishmentSource,
} from "./sceneComposition";
import type { SceneExplorationMode } from "./sceneCandidates";

export const SCENE_LIBRARY_SCHEMA_VERSION = 1 as const;
export const SAVED_SCENE_VERSION = 1 as const;
export const MAX_SAVED_SCENE_NAME_LENGTH = 80;
export const MAX_SCENE_COMPONENT_NOTE_LENGTH = 1200;

export type SavedScene = {
  id: string;
  version: typeof SAVED_SCENE_VERSION;
  name: string;
  themeIds: SceneThemeId[];
  effort: SceneEffort;
  exploration: SceneExplorationMode;
  components: SceneCompositionComponent[];
  createdAt: string;
  updatedAt: string;
};

export type SceneLibraryState = {
  schemaVersion: typeof SCENE_LIBRARY_SCHEMA_VERSION;
  scenes: SavedScene[];
};

const themeIds = new Set<string>(
  sceneThemeDefinitions.map((theme) => theme.id),
);

const efforts = new Set<SceneEffort>([
  "quick",
  "normal",
  "elaborate",
]);

const explorations = new Set<SceneExplorationMode>([
  "familiar",
  "mixed",
  "explore",
]);

const phaseIds = new Set<ScenePhaseId>([
  "setup",
  "headspace_transition",
  "warm_up",
  "core_play",
  "escalation",
  "reward_punishment",
  "come_down",
  "aftercare",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidDateString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value))
  );
}

function parsePrimitiveRef(
  value: unknown,
): RewardPunishmentPrimitiveRef | null {
  if (!isRecord(value)) return null;
  if (
    (value.kind !== "catalog" && value.kind !== "action") ||
    typeof value.id !== "string" ||
    !value.id.trim()
  ) {
    return null;
  }

  return {
    kind: value.kind,
    id: value.id,
  } as RewardPunishmentPrimitiveRef;
}

function parseSource(value: unknown): SceneComponentSource | null {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return null;
  }

  if (value.kind === "catalog") {
    if (typeof value.catalogId !== "string" || !value.catalogId.trim()) {
      return null;
    }
    return {
      kind: "catalog",
      catalogId: value.catalogId,
    };
  }

  if (
    value.kind !== "reward_punishment" ||
    (value.context !== "reward" && value.context !== "punishment") ||
    !isRecord(value.entry)
  ) {
    return null;
  }

  if (value.entry.kind === "primitive") {
    const ref = parsePrimitiveRef(value.entry.ref);
    if (!ref) return null;

    return {
      kind: "reward_punishment",
      context: value.context,
      entry: {
        kind: "primitive",
        ref,
      },
    } satisfies SceneRewardPunishmentSource;
  }

  if (
    value.entry.kind === "recipe" &&
    typeof value.entry.recipeId === "string" &&
    value.entry.recipeId.trim()
  ) {
    return {
      kind: "reward_punishment",
      context: value.context,
      entry: {
        kind: "recipe",
        recipeId: value.entry.recipeId,
      },
    } satisfies SceneRewardPunishmentSource;
  }

  return null;
}

function parseComponent(
  value: unknown,
): SceneCompositionComponent | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id.trim() ||
    typeof value.phaseId !== "string" ||
    !phaseIds.has(value.phaseId as ScenePhaseId) ||
    typeof value.note !== "string" ||
    value.note.length > MAX_SCENE_COMPONENT_NOTE_LENGTH
  ) {
    return null;
  }

  const source = parseSource(value.source);
  if (!source) return null;

  if (
    source.kind === "reward_punishment" &&
    value.phaseId !== "reward_punishment"
  ) {
    return null;
  }

  if (
    source.kind === "catalog" &&
    value.phaseId === "reward_punishment"
  ) {
    return null;
  }

  return {
    id: value.id,
    phaseId: value.phaseId as ScenePhaseId,
    source,
    note: value.note,
  };
}

export function normalizeSavedSceneName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(
    0,
    MAX_SAVED_SCENE_NAME_LENGTH,
  );
}

export function createEmptySceneLibraryState(): SceneLibraryState {
  return {
    schemaVersion: SCENE_LIBRARY_SCHEMA_VERSION,
    scenes: [],
  };
}

export function parseSavedScene(value: unknown): SavedScene | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id.trim() ||
    value.version !== SAVED_SCENE_VERSION ||
    typeof value.name !== "string" ||
    !normalizeSavedSceneName(value.name) ||
    value.name.length > MAX_SAVED_SCENE_NAME_LENGTH ||
    !Array.isArray(value.themeIds) ||
    typeof value.effort !== "string" ||
    !efforts.has(value.effort as SceneEffort) ||
    typeof value.exploration !== "string" ||
    !explorations.has(value.exploration as SceneExplorationMode) ||
    !Array.isArray(value.components) ||
    !isValidDateString(value.createdAt) ||
    !isValidDateString(value.updatedAt)
  ) {
    return null;
  }

  const parsedThemes: SceneThemeId[] = [];
  for (const themeId of value.themeIds) {
    if (
      typeof themeId !== "string" ||
      !themeIds.has(themeId) ||
      parsedThemes.includes(themeId as SceneThemeId)
    ) {
      return null;
    }
    parsedThemes.push(themeId as SceneThemeId);
  }

  const components: SceneCompositionComponent[] = [];
  const componentIds = new Set<string>();
  const sourceKeys = new Set<string>();

  for (const rawComponent of value.components) {
    const component = parseComponent(rawComponent);
    if (!component || componentIds.has(component.id)) {
      return null;
    }

    const sourceKey =
      component.source.kind === "catalog"
        ? `catalog:${component.source.catalogId}`
        : component.source.entry.kind === "primitive"
          ? `rp:${component.source.context}:${component.source.entry.ref.kind}:${component.source.entry.ref.id}`
          : `rp:${component.source.context}:recipe:${component.source.entry.recipeId}`;

    if (sourceKeys.has(sourceKey)) return null;

    componentIds.add(component.id);
    sourceKeys.add(sourceKey);
    components.push(component);
  }

  return {
    id: value.id,
    version: SAVED_SCENE_VERSION,
    name: normalizeSavedSceneName(value.name),
    themeIds: parsedThemes,
    effort: value.effort as SceneEffort,
    exploration: value.exploration as SceneExplorationMode,
    components,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseSceneLibraryState(
  value: unknown,
): SceneLibraryState | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== SCENE_LIBRARY_SCHEMA_VERSION ||
    !Array.isArray(value.scenes)
  ) {
    return null;
  }

  const scenes: SavedScene[] = [];
  const sceneIds = new Set<string>();

  for (const rawScene of value.scenes) {
    const scene = parseSavedScene(rawScene);
    if (!scene || sceneIds.has(scene.id)) return null;
    sceneIds.add(scene.id);
    scenes.push(scene);
  }

  return {
    schemaVersion: SCENE_LIBRARY_SCHEMA_VERSION,
    scenes,
  };
}

function cloneSource(source: SceneComponentSource): SceneComponentSource {
  if (source.kind === "catalog") {
    return {
      kind: "catalog",
      catalogId: source.catalogId,
    };
  }

  return source.entry.kind === "primitive"
    ? {
        kind: "reward_punishment",
        context: source.context,
        entry: {
          kind: "primitive",
          ref: { ...source.entry.ref },
        },
      }
    : {
        kind: "reward_punishment",
        context: source.context,
        entry: {
          kind: "recipe",
          recipeId: source.entry.recipeId,
        },
      };
}

function cloneComponents(
  components: readonly SceneCompositionComponent[],
): SceneCompositionComponent[] {
  return components.map((component) => ({
    ...component,
    source: cloneSource(component.source),
  }));
}

export function savedSceneToComposition(
  scene: SavedScene,
): SceneComposition {
  return {
    schemaVersion: 1,
    themeIds: [...scene.themeIds],
    effort: scene.effort,
    exploration: scene.exploration,
    components: cloneComponents(scene.components),
  };
}

export function createSavedScene(
  composition: SceneComposition,
  name: string,
  {
    id,
    now = new Date().toISOString(),
  }: {
    id: string;
    now?: string;
  },
): SavedScene {
  const normalizedName = normalizeSavedSceneName(name);
  if (!normalizedName) {
    throw new Error("Give the scene a name before saving.");
  }

  return {
    id,
    version: SAVED_SCENE_VERSION,
    name: normalizedName,
    themeIds: [...composition.themeIds],
    effort: composition.effort,
    exploration: composition.exploration,
    components: cloneComponents(composition.components),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateSavedScene(
  scene: SavedScene,
  composition: SceneComposition,
  name: string,
  updatedAt = new Date().toISOString(),
): SavedScene {
  const normalizedName = normalizeSavedSceneName(name);
  if (!normalizedName) {
    throw new Error("Give the scene a name before saving.");
  }

  return {
    ...scene,
    name: normalizedName,
    themeIds: [...composition.themeIds],
    effort: composition.effort,
    exploration: composition.exploration,
    components: cloneComponents(composition.components),
    updatedAt,
  };
}

export function upsertSavedScene(
  state: SceneLibraryState,
  scene: SavedScene,
): SceneLibraryState {
  const index = state.scenes.findIndex(
    (candidate) => candidate.id === scene.id,
  );

  if (index < 0) {
    return {
      ...state,
      scenes: [scene, ...state.scenes],
    };
  }

  const scenes = state.scenes.slice();
  scenes[index] = scene;
  return {
    ...state,
    scenes,
  };
}

export function deleteSavedScene(
  state: SceneLibraryState,
  sceneId: string,
): SceneLibraryState {
  return {
    ...state,
    scenes: state.scenes.filter((scene) => scene.id !== sceneId),
  };
}

export function duplicateSavedScene(
  state: SceneLibraryState,
  sceneId: string,
  {
    id,
    now = new Date().toISOString(),
  }: {
    id: string;
    now?: string;
  },
): SceneLibraryState {
  const scene = state.scenes.find(
    (candidate) => candidate.id === sceneId,
  );
  if (!scene) return state;

  const copy: SavedScene = {
    ...scene,
    id,
    name: normalizeSavedSceneName(`${scene.name} copy`),
    components: cloneComponents(scene.components),
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...state,
    scenes: [copy, ...state.scenes],
  };
}
