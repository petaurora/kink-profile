import {
  sceneThemeDefinitions,
  type SceneThemeId,
} from "../data/sceneThemes";
import type {
  RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";
import type {
  RewardPunishmentContext,
} from "./rewardPunishmentProfile";
import type {
  SceneCandidate,
  SceneCandidateView,
  SceneExplorationMode,
} from "./sceneCandidates";

export type SceneEffort = "quick" | "normal" | "elaborate";

export type ScenePhaseId =
  | "setup"
  | "headspace_transition"
  | "warm_up"
  | "core_play"
  | "escalation"
  | "reward_punishment"
  | "come_down"
  | "aftercare";

export type ScenePhaseDefinition = {
  id: ScenePhaseId;
  label: string;
  shortLabel: string;
  description: string;
  optional: boolean;
  catalogEnabled: boolean;
};

export const scenePhaseDefinitions: readonly ScenePhaseDefinition[] = [
  {
    id: "setup",
    label: "Setup",
    shortLabel: "Setup",
    description: "Structure, ritual, positioning, or a deliberate start.",
    optional: true,
    catalogEnabled: true,
  },
  {
    id: "headspace_transition",
    label: "Headspace / transition",
    shortLabel: "Headspace",
    description: "Shift into the role, dynamic, or emotional space.",
    optional: true,
    catalogEnabled: true,
  },
  {
    id: "warm_up",
    label: "Warm-up",
    shortLabel: "Warm-up",
    description: "Ease into the selected themes and intensity.",
    optional: true,
    catalogEnabled: true,
  },
  {
    id: "core_play",
    label: "Core play",
    shortLabel: "Core",
    description: "The central activity or strongest theme match.",
    optional: false,
    catalogEnabled: true,
  },
  {
    id: "escalation",
    label: "Escalation / challenge",
    shortLabel: "Escalation",
    description: "Optional increase in intensity, challenge, or structure.",
    optional: true,
    catalogEnabled: true,
  },
  {
    id: "reward_punishment",
    label: "Reward / punishment",
    shortLabel: "Reward / punishment",
    description: "Optional M11-backed reward or punishment add-on.",
    optional: true,
    catalogEnabled: false,
  },
  {
    id: "come_down",
    label: "Come-down",
    shortLabel: "Come-down",
    description: "Transition out of the core activity.",
    optional: true,
    catalogEnabled: true,
  },
  {
    id: "aftercare",
    label: "Aftercare",
    shortLabel: "Aftercare",
    description: "Optional care-oriented close when it fits the selected space.",
    optional: true,
    catalogEnabled: true,
  },
] as const;

export type SceneCatalogSource = {
  kind: "catalog";
  catalogId: string;
};

export type SceneRewardPunishmentEntryRef =
  | {
      kind: "primitive";
      ref: RewardPunishmentPrimitiveRef;
    }
  | {
      kind: "recipe";
      recipeId: string;
    };

export type SceneRewardPunishmentSource = {
  kind: "reward_punishment";
  context: RewardPunishmentContext;
  entry: SceneRewardPunishmentEntryRef;
};

export type SceneComponentSource =
  | SceneCatalogSource
  | SceneRewardPunishmentSource;

export type SceneCompositionComponent = {
  id: string;
  phaseId: ScenePhaseId;
  source: SceneComponentSource;
  note: string;
};

export type SceneComposition = {
  schemaVersion: 1;
  themeIds: readonly SceneThemeId[];
  effort: SceneEffort;
  exploration: SceneExplorationMode;
  components: readonly SceneCompositionComponent[];
};

export function isCatalogSceneSource(
  source: SceneComponentSource,
): source is SceneCatalogSource {
  return source.kind === "catalog";
}

export function isRewardPunishmentSceneSource(
  source: SceneComponentSource,
): source is SceneRewardPunishmentSource {
  return source.kind === "reward_punishment";
}

export function sceneComponentSourceKey(source: SceneComponentSource) {
  if (source.kind === "catalog") {
    return `catalog:${source.catalogId}`;
  }

  const entryKey =
    source.entry.kind === "primitive"
      ? `${source.entry.ref.kind}:${source.entry.ref.id}`
      : `recipe:${source.entry.recipeId}`;

  return `reward_punishment:${source.context}:${entryKey}`;
}

const phaseOrder = new Map(
  scenePhaseDefinitions.map((phase, index) => [phase.id, index]),
);

const themeById = new Map(
  sceneThemeDefinitions.map((theme) => [theme.id, theme]),
);

const effortPhasePlan: Record<SceneEffort, readonly ScenePhaseId[]> = {
  quick: ["headspace_transition", "core_play", "aftercare"],
  normal: [
    "setup",
    "headspace_transition",
    "warm_up",
    "core_play",
    "aftercare",
  ],
  elaborate: [
    "setup",
    "headspace_transition",
    "warm_up",
    "core_play",
    "escalation",
    "come_down",
    "aftercare",
  ],
};

const effortTargetCount: Record<SceneEffort, number> = {
  quick: 3,
  normal: 5,
  elaborate: 7,
};

function intensityBand(intensity: string) {
  switch (intensity.trim().toLocaleLowerCase()) {
    case "low":
      return 1;
    case "low-moderate":
      return 2;
    case "moderate":
      return 3;
    case "moderate-high":
      return 4;
    case "high":
      return 5;
    default:
      return 3;
  }
}

function hasTheme(candidate: SceneCandidate, ids: readonly SceneThemeId[]) {
  return candidate.matchedThemeIds.some((id) => ids.includes(id));
}

function hasThemeFamily(
  candidate: SceneCandidate,
  families: readonly string[],
) {
  return candidate.matchedThemeIds.some((id) => {
    const definition = themeById.get(id);
    return definition ? families.includes(definition.family) : false;
  });
}

export function scenePhaseCandidateFit(
  phaseId: ScenePhaseId,
  candidate: SceneCandidate,
) {
  if (!candidate.automaticEligible) return 0;

  const intensity = intensityBand(candidate.intensity);
  const scoreBoost = Math.min(12, Math.max(0, candidate.score / 8));

  if (phaseId === "reward_punishment") return 0;

  if (phaseId === "core_play") {
    return 65 + scoreBoost + Math.min(15, candidate.themeMatches.length * 5);
  }

  if (phaseId === "setup") {
    const thematic =
      (hasTheme(candidate, ["structured", "ritual-heavy", "protocol"]) ? 58 : 0) +
      (hasTheme(candidate, ["service", "restraint"]) ? 18 : 0);
    return thematic > 0 ? thematic + scoreBoost : 0;
  }

  if (phaseId === "headspace_transition") {
    const thematic =
      hasThemeFamily(candidate, ["headspace", "dynamic_mode"]) ? 68 : 0;
    return thematic > 0 ? thematic + scoreBoost : 0;
  }

  if (phaseId === "warm_up") {
    const thematic =
      (hasTheme(candidate, ["soft", "playful", "sensory", "care"]) ? 46 : 0) +
      (intensity <= 3 ? 22 : 0);
    return thematic >= 22 ? thematic + scoreBoost : 0;
  }

  if (phaseId === "escalation") {
    const thematic =
      (hasTheme(candidate, [
        "pain",
        "discipline",
        "restraint",
        "intense",
        "primal-feral",
      ])
        ? 48
        : 0) + (intensity >= 3 ? 26 : 0);
    return thematic >= 26 ? thematic + scoreBoost : 0;
  }

  if (phaseId === "come_down") {
    const thematic =
      (hasTheme(candidate, ["soft", "care", "sensory", "pet"]) ? 52 : 0) +
      (intensity <= 3 ? 18 : 0);
    return thematic >= 18 ? thematic + scoreBoost : 0;
  }

  if (phaseId === "aftercare") {
    if (!hasTheme(candidate, ["care", "soft"])) return 0;
    return 72 + scoreBoost;
  }

  return 0;
}

function nextComponentId(components: readonly SceneCompositionComponent[]) {
  const used = new Set(components.map((component) => component.id));
  let next = components.length + 1;
  while (used.has(`scene-component-${next}`)) next += 1;
  return `scene-component-${next}`;
}

function sortComponents(
  components: readonly SceneCompositionComponent[],
) {
  return [...components].sort((left, right) => {
    const leftOrder = phaseOrder.get(left.phaseId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = phaseOrder.get(right.phaseId) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.id.localeCompare(right.id);
  });
}

export function createEmptySceneComposition(options: {
  themeIds: readonly SceneThemeId[];
  effort: SceneEffort;
  exploration: SceneExplorationMode;
}): SceneComposition {
  return {
    schemaVersion: 1,
    themeIds: [...options.themeIds],
    effort: options.effort,
    exploration: options.exploration,
    components: [],
  };
}

export function suggestScenePhaseForCandidate(candidate: SceneCandidate) {
  const eligiblePhases = scenePhaseDefinitions.filter(
    (phase) => phase.catalogEnabled && phase.id !== "core_play",
  );
  const best = eligiblePhases
    .map((phase) => ({
      phaseId: phase.id,
      fit: scenePhaseCandidateFit(phase.id, candidate),
    }))
    .filter((entry) => entry.fit > 0)
    .sort((left, right) => right.fit - left.fit)[0];

  return best?.phaseId ?? "core_play";
}

export function addCatalogSceneComponent(
  composition: SceneComposition,
  candidate: SceneCandidate,
  phaseId: ScenePhaseId = suggestScenePhaseForCandidate(candidate),
) {
  if (!candidate.automaticEligible) return composition;
  if (
    composition.components.some(
      (component) =>
        component.source.kind === "catalog" &&
        component.source.catalogId === candidate.catalogId,
    )
  ) {
    return composition;
  }

  const phase = scenePhaseDefinitions.find((entry) => entry.id === phaseId);
  const safePhaseId =
    phase?.catalogEnabled === true ? phaseId : "core_play";

  return {
    ...composition,
    components: sortComponents([
      ...composition.components,
      {
        id: nextComponentId(composition.components),
        phaseId: safePhaseId,
        source: {
          kind: "catalog" as const,
          catalogId: candidate.catalogId,
        },
        note: "",
      },
    ]),
  };
}

export function upsertRewardPunishmentSceneComponent(
  composition: SceneComposition,
  source: SceneRewardPunishmentSource,
) {
  const existing = composition.components.find(
    (component) => component.source.kind === "reward_punishment",
  );

  if (existing) {
    return {
      ...composition,
      components: sortComponents(
        composition.components.map((component) =>
          component.id === existing.id
            ? {
                ...component,
                phaseId: "reward_punishment" as const,
                source,
              }
            : component,
        ),
      ),
    };
  }

  return {
    ...composition,
    components: sortComponents([
      ...composition.components,
      {
        id: nextComponentId(composition.components),
        phaseId: "reward_punishment" as const,
        source,
        note: "",
      },
    ]),
  };
}

export function removeRewardPunishmentSceneComponent(
  composition: SceneComposition,
) {
  return {
    ...composition,
    components: composition.components.filter(
      (component) => component.source.kind !== "reward_punishment",
    ),
  };
}

export function removeSceneComponent(
  composition: SceneComposition,
  componentId: string,
) {
  return {
    ...composition,
    components: composition.components.filter(
      (component) => component.id !== componentId,
    ),
  };
}

export function moveSceneComponent(
  composition: SceneComposition,
  componentId: string,
  direction: "up" | "down",
) {
  const components = [...composition.components];
  const index = components.findIndex(
    (component) => component.id === componentId,
  );
  if (index < 0) return composition;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= components.length) {
    return composition;
  }

  [components[index], components[targetIndex]] = [
    components[targetIndex],
    components[index],
  ];

  return {
    ...composition,
    components,
  };
}

export function updateSceneComponentPhase(
  composition: SceneComposition,
  componentId: string,
  phaseId: ScenePhaseId,
) {
  const component = composition.components.find(
    (entry) => entry.id === componentId,
  );
  if (!component) return composition;

  if (component.source.kind === "reward_punishment") {
    return phaseId === "reward_punishment"
      ? composition
      : composition;
  }

  const phase = scenePhaseDefinitions.find((entry) => entry.id === phaseId);
  if (!phase?.catalogEnabled) return composition;

  return {
    ...composition,
    components: composition.components.map((entry) =>
      entry.id === componentId
        ? {
            ...entry,
            phaseId,
          }
        : entry,
    ),
  };
}

export function updateSceneComponentNote(
  composition: SceneComposition,
  componentId: string,
  note: string,
) {
  return {
    ...composition,
    components: composition.components.map((component) =>
      component.id === componentId
        ? {
            ...component,
            note,
          }
        : component,
    ),
  };
}

export function replaceSceneComponent(
  composition: SceneComposition,
  componentId: string,
  replacement: SceneCandidate,
) {
  if (!replacement.automaticEligible) return composition;

  const target = composition.components.find(
    (component) => component.id === componentId,
  );
  if (!target || target.source.kind !== "catalog") {
    return composition;
  }

  if (
    composition.components.some(
      (component) =>
        component.id !== componentId &&
        component.source.kind === "catalog" &&
        component.source.catalogId === replacement.catalogId,
    )
  ) {
    return composition;
  }

  return {
    ...composition,
    components: composition.components.map((component) =>
      component.id === componentId
        ? {
            ...component,
            source: {
              kind: "catalog" as const,
              catalogId: replacement.catalogId,
            },
          }
        : component,
    ),
  };
}

export function replacementCandidatesForComponent(
  composition: SceneComposition,
  componentId: string,
  candidates: readonly SceneCandidate[],
) {
  const component = composition.components.find(
    (entry) => entry.id === componentId,
  );
  if (!component || component.source.kind !== "catalog") return [];

  const usedIds = new Set(
    composition.components
      .filter(
        (entry) =>
          entry.id !== componentId &&
          entry.source.kind === "catalog",
      )
      .map((entry) =>
        entry.source.kind === "catalog"
          ? entry.source.catalogId
          : "",
      )
      .filter(Boolean),
  );

  return candidates
    .filter(
      (candidate) =>
        candidate.automaticEligible && !usedIds.has(candidate.catalogId),
    )
    .map((candidate) => ({
      candidate,
      phaseFit: scenePhaseCandidateFit(component.phaseId, candidate),
    }))
    .filter(
      (entry) =>
        component.phaseId === "core_play" || entry.phaseFit > 0,
    )
    .sort(
      (left, right) =>
        right.phaseFit - left.phaseFit ||
        right.candidate.score - left.candidate.score ||
        left.candidate.label.localeCompare(right.candidate.label),
    )
    .map((entry) => entry.candidate);
}

export function reconcileSceneComposition(
  composition: SceneComposition,
  eligibleCatalogIds: ReadonlySet<string>,
) {
  return {
    ...composition,
    components: composition.components.filter(
      (component) =>
        component.source.kind !== "catalog" ||
        eligibleCatalogIds.has(component.source.catalogId),
    ),
  };
}

export function buildStarterSceneComposition(
  candidateView: Pick<
    SceneCandidateView,
    "coverageOrder" | "selectedThemeIds"
  >,
  options: {
    effort: SceneEffort;
    exploration: SceneExplorationMode;
  },
) {
  let composition = createEmptySceneComposition({
    themeIds: candidateView.selectedThemeIds,
    effort: options.effort,
    exploration: options.exploration,
  });

  const available = candidateView.coverageOrder.filter(
    (candidate) => candidate.automaticEligible,
  );
  const used = new Set<string>();

  for (const phaseId of effortPhasePlan[options.effort]) {
    const ranked = available
      .filter((candidate) => !used.has(candidate.catalogId))
      .map((candidate) => ({
        candidate,
        fit: scenePhaseCandidateFit(phaseId, candidate),
      }))
      .filter((entry) => entry.fit > 0)
      .sort(
        (left, right) =>
          right.fit - left.fit ||
          right.candidate.score - left.candidate.score ||
          left.candidate.label.localeCompare(right.candidate.label),
      );

    const next = ranked[0]?.candidate;
    if (!next) continue;

    composition = addCatalogSceneComponent(composition, next, phaseId);
    used.add(next.catalogId);
  }

  const target = effortTargetCount[options.effort];
  for (const candidate of available) {
    if (composition.components.length >= target) break;
    if (used.has(candidate.catalogId)) continue;

    composition = addCatalogSceneComponent(
      composition,
      candidate,
      "core_play",
    );
    used.add(candidate.catalogId);
  }

  return {
    ...composition,
    components: sortComponents(composition.components),
  };
}
