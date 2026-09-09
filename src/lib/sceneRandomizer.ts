import type { SceneCandidate } from "./sceneCandidates";
import {
  addCatalogSceneComponent,
  createEmptySceneComposition,
  replaceSceneComponent,
  replacementCandidatesForComponent,
  scenePhaseCandidateFit,
  scenePhaseDefinitions,
  type SceneComposition,
  type SceneEffort,
  type ScenePhaseId,
} from "./sceneComposition";
import type { SceneExplorationMode } from "./sceneCandidates";
import type { SceneThemeId } from "../data/sceneThemes";

export type SceneRandomizerState = {
  schemaVersion: 1;
  recentCatalogIds: string[];
};

export type SceneRandomizerStorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export const SCENE_RANDOMIZER_STORAGE_KEY =
  "kink-profile-scene-randomizer-v1";

const MAX_RECENT = 10;

function browserSessionStorage(): SceneRandomizerStorageLike {
  return sessionStorage;
}

function normalizedState(value: unknown): SceneRandomizerState {
  if (
    !value ||
    typeof value !== "object" ||
    (value as { schemaVersion?: unknown }).schemaVersion !== 1
  ) {
    return {
      schemaVersion: 1,
      recentCatalogIds: [],
    };
  }

  const ids = Array.isArray(
    (value as { recentCatalogIds?: unknown }).recentCatalogIds,
  )
    ? (value as { recentCatalogIds: unknown[] }).recentCatalogIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      )
    : [];

  return {
    schemaVersion: 1,
    recentCatalogIds: [...new Set(ids)].slice(-MAX_RECENT),
  };
}

export function createEmptySceneRandomizerState(): SceneRandomizerState {
  return {
    schemaVersion: 1,
    recentCatalogIds: [],
  };
}

export function loadSceneRandomizerState(
  storage: SceneRandomizerStorageLike = browserSessionStorage(),
): SceneRandomizerState {
  try {
    const raw = storage.getItem(SCENE_RANDOMIZER_STORAGE_KEY);
    if (!raw) return createEmptySceneRandomizerState();
    return normalizedState(JSON.parse(raw));
  } catch {
    return createEmptySceneRandomizerState();
  }
}

export function saveSceneRandomizerState(
  state: SceneRandomizerState,
  storage: SceneRandomizerStorageLike = browserSessionStorage(),
) {
  const normalized = normalizedState(state);
  if (normalized.recentCatalogIds.length === 0) {
    storage.removeItem(SCENE_RANDOMIZER_STORAGE_KEY);
    return;
  }

  storage.setItem(
    SCENE_RANDOMIZER_STORAGE_KEY,
    JSON.stringify(normalized),
  );
}

export function clearSceneRandomizerState(
  storage: SceneRandomizerStorageLike = browserSessionStorage(),
) {
  storage.removeItem(SCENE_RANDOMIZER_STORAGE_KEY);
}

export function recordSceneRandomPick(
  state: SceneRandomizerState,
  catalogId: string,
): SceneRandomizerState {
  const withoutCurrent = state.recentCatalogIds.filter(
    (id) => id !== catalogId,
  );
  return {
    schemaVersion: 1,
    recentCatalogIds: [...withoutCurrent, catalogId].slice(-MAX_RECENT),
  };
}

function randomIndex(length: number, rng: () => number) {
  if (length <= 1) return 0;
  const value = Math.min(0.999999999, Math.max(0, rng()));
  return Math.floor(value * length);
}

export function chooseRandomSceneCandidate(
  candidates: readonly SceneCandidate[],
  state: SceneRandomizerState,
  rng: () => number = Math.random,
) {
  const eligible = candidates.filter(
    (candidate) => candidate.automaticEligible,
  );
  if (eligible.length === 0) {
    return {
      candidate: undefined,
      state,
    };
  }

  const recent = new Set(state.recentCatalogIds);
  const fresh = eligible.filter(
    (candidate) => !recent.has(candidate.catalogId),
  );
  const pool = fresh.length > 0 ? fresh : eligible;
  const candidate = pool[randomIndex(pool.length, rng)];

  return {
    candidate,
    state: recordSceneRandomPick(state, candidate.catalogId),
  };
}

function phasePlan(effort: SceneEffort): readonly ScenePhaseId[] {
  if (effort === "quick") {
    return ["headspace_transition", "core_play", "aftercare"];
  }

  if (effort === "elaborate") {
    return [
      "setup",
      "headspace_transition",
      "warm_up",
      "core_play",
      "escalation",
      "come_down",
      "aftercare",
    ];
  }

  return [
    "setup",
    "headspace_transition",
    "warm_up",
    "core_play",
    "aftercare",
  ];
}

function targetCount(effort: SceneEffort) {
  return effort === "quick" ? 3 : effort === "elaborate" ? 7 : 5;
}

function phasePool(
  phaseId: ScenePhaseId,
  candidates: readonly SceneCandidate[],
  usedIds: ReadonlySet<string>,
) {
  return candidates
    .filter(
      (candidate) =>
        candidate.automaticEligible && !usedIds.has(candidate.catalogId),
    )
    .filter(
      (candidate) =>
        phaseId === "core_play" ||
        scenePhaseCandidateFit(phaseId, candidate) > 0,
    );
}

export function buildRandomSceneComposition(
  candidates: readonly SceneCandidate[],
  options: {
    themeIds: readonly SceneThemeId[];
    effort: SceneEffort;
    exploration: SceneExplorationMode;
    state: SceneRandomizerState;
    rng?: () => number;
  },
) {
  const rng = options.rng ?? Math.random;
  let state = options.state;
  let composition = createEmptySceneComposition({
    themeIds: options.themeIds,
    effort: options.effort,
    exploration: options.exploration,
  });

  const eligible = candidates.filter(
    (candidate) => candidate.automaticEligible,
  );
  const used = new Set<string>();

  for (const phaseId of phasePlan(options.effort)) {
    const pool = phasePool(phaseId, eligible, used);
    if (pool.length === 0) continue;

    const pick = chooseRandomSceneCandidate(pool, state, rng);
    if (!pick.candidate) continue;

    composition = addCatalogSceneComponent(
      composition,
      pick.candidate,
      phaseId,
    );
    used.add(pick.candidate.catalogId);
    state = pick.state;
  }

  while (
    composition.components.length < targetCount(options.effort) &&
    used.size < eligible.length
  ) {
    const remaining = eligible.filter(
      (candidate) => !used.has(candidate.catalogId),
    );
    const pick = chooseRandomSceneCandidate(remaining, state, rng);
    if (!pick.candidate) break;

    composition = addCatalogSceneComponent(
      composition,
      pick.candidate,
      "core_play",
    );
    used.add(pick.candidate.catalogId);
    state = pick.state;
  }

  return {
    composition,
    state,
  };
}

export function shuffleSceneComponent(
  composition: SceneComposition,
  componentId: string,
  candidates: readonly SceneCandidate[],
  state: SceneRandomizerState,
  rng: () => number = Math.random,
) {
  const component = composition.components.find(
    (entry) => entry.id === componentId,
  );
  if (!component) {
    return {
      composition,
      state,
      replacement: undefined,
    };
  }

  if (component.source.kind !== "catalog") {
    return {
      composition,
      state,
      replacement: undefined,
    };
  }

  const currentCatalogId = component.source.catalogId;
  const replacements = replacementCandidatesForComponent(
    composition,
    componentId,
    candidates,
  ).filter(
    (candidate) =>
      candidate.catalogId !== currentCatalogId,
  );

  const pick = chooseRandomSceneCandidate(replacements, state, rng);
  if (!pick.candidate) {
    return {
      composition,
      state,
      replacement: undefined,
    };
  }

  return {
    composition: replaceSceneComponent(
      composition,
      componentId,
      pick.candidate,
    ),
    state: pick.state,
    replacement: pick.candidate,
  };
}

export function randomizableScenePhaseIds() {
  return scenePhaseDefinitions
    .filter((phase) => phase.catalogEnabled)
    .map((phase) => phase.id);
}
