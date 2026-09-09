import { dynamicModes, roleHeadspaces } from "./headspacesQuiz";
import { kinkCatalog, kinkCategories } from "./kinkCatalog.generated";
import { overallFacetDefinitions } from "./overallFacets";
import { quizQuestions } from "./quizQuestions";
import { quizzes } from "./quizzes";
import { signalDefinitions } from "./signals";
import {
  rewardPunishmentActions,
  rewardPunishmentCategories,
} from "../lib/rewardPunishmentLibrary";

export type CurationPrimitiveType =
  | "catalog-item"
  | "catalog-category"
  | "reward-punishment-action"
  | "reward-punishment-category"
  | "quiz-question"
  | "quiz-definition"
  | "signal"
  | "dynamic-mode"
  | "role-headspace"
  | "overall-facet";

export type CurationInventoryField = {
  key: string;
  label: string;
  value: string;
};

export type CurationInventoryEntry = {
  entityType: CurationPrimitiveType;
  entityId: string;
  label: string;
  summary: string;
  source: string;
  fields: readonly CurationInventoryField[];
};

export type CurationSurfaceStatus = "available" | "source-only" | "later";

export type CurationSurface = {
  id: string;
  label: string;
  sourcePaths: readonly string[];
  status: CurationSurfaceStatus;
  notes: string;
};

export const curationReviewRubric = [
  {
    id: "distinct",
    label: "Distinct?",
    question: "Is this meaningfully different from neighboring concepts?",
  },
  {
    id: "useful",
    label: "Useful?",
    question: "Does keeping it improve a decision, profile, ranking, or explanation?",
  },
  {
    id: "clear",
    label: "Clear?",
    question: "Would a user understand what is being asked or displayed?",
  },
  {
    id: "measurable",
    label: "Measurable?",
    question: "Do we have evidence capable of estimating or supporting it?",
  },
  {
    id: "balanced",
    label: "Balanced?",
    question: "Is it over- or underrepresented compared with adjacent concepts?",
  },
  {
    id: "mapped-correctly",
    label: "Mapped correctly?",
    question: "Are its relationships and weights defensible?",
  },
  {
    id: "stable",
    label: "Stable enough?",
    question: "Can it retain identity, or would changing it require migration?",
  },
  {
    id: "interaction-cost",
    label: "Worth the effort?",
    question: "Does it earn the interaction cost it creates?",
  },
] as const;

export const curationSurfaces: readonly CurationSurface[] = [
  {
    id: "quiz-bank",
    label: "M2-M5 quiz questions + weights",
    sourcePaths: [
      "src/data/dsQuiz.ts",
      "src/data/headspacesQuiz.ts",
      "src/data/bondageDisciplineQuiz.ts",
      "src/data/sadismMasochismQuiz.ts",
    ],
    status: "available",
    notes: "Questions are reviewable in the workbench now; signal-weight editing comes in a later M16.2 slice.",
  },
  {
    id: "signals",
    label: "Shared SignalId vocabulary",
    sourcePaths: ["src/data/signals.ts"],
    status: "available",
    notes: "Signals are first-class workbench primitives.",
  },
  {
    id: "roles-modes",
    label: "Roles, headspaces + dynamic modes",
    sourcePaths: ["src/data/headspacesQuiz.ts"],
    status: "available",
    notes: "Role/headspace and dynamic-mode definitions are reviewable separately.",
  },
  {
    id: "overall-facets",
    label: "Overall facets + radar dimensions",
    sourcePaths: ["src/data/overallFacets.ts"],
    status: "available",
    notes: "Facet labels, descriptions, directionality and signal compositions are visible in the workbench.",
  },
  {
    id: "catalog",
    label: "Kink catalog + categories + aliases + signal mappings",
    sourcePaths: [
      "reference/catalog/kink-catalog.tsv",
      "reference/catalog/catalog-categories.tsv",
      "reference/catalog/catalog-aliases.tsv",
      "reference/catalog/catalog-signal-mappings.tsv",
    ],
    status: "available",
    notes: "Generated runtime catalog rows and categories are reviewable; source-file edits remain proposal-only.",
  },
  {
    id: "catalog-pending-additions",
    label: "Pending catalog additions",
    sourcePaths: ["reference/catalog/source-additions-2026-09-08.tsv"],
    status: "source-only",
    notes: "Tracked for M16.5. This source is intentionally not merged into the runtime catalog merely to make it editable.",
  },
  {
    id: "reward-punishment-library",
    label: "M11 actions + contextual categories + mappings",
    sourcePaths: [
      "reference/rewards-punishments/action-library.tsv",
      "reference/rewards-punishments/context-categories.tsv",
      "reference/rewards-punishments/catalog-category-mappings.tsv",
      "src/lib/rewardPunishmentLibrary.ts",
    ],
    status: "available",
    notes: "Normalized actions and contextual categories are reviewable now; richer relationship editing follows.",
  },
  {
    id: "profile-labels-thresholds",
    label: "Profile labels, thresholds + explanatory copy",
    sourcePaths: [
      "src/App.tsx",
      "src/lib/profileHeader.ts",
      "src/lib/overallRadar.ts",
      "src/lib/profileInterestAreas.ts",
    ],
    status: "later",
    notes: "Tracked by M16.4. These are intentionally inventoried before adding dedicated editors.",
  },
  {
    id: "scene-themes",
    label: "M13 scene themes + mappings",
    sourcePaths: ["src/data/sceneThemes.ts"],
    status: "later",
    notes: "The workbench model is extensible to scene themes after the core M16 surfaces settle.",
  },
  {
    id: "shared-interactions",
    label: "M14 interaction/complement mappings",
    sourcePaths: ["src/data/sharedInteractionMappings.ts"],
    status: "later",
    notes: "Retained as a future workbench primitive while M14 persistence semantics are paused.",
  },
] as const;

function firstNonEmpty(...values: readonly string[]) {
  return values.find((value) => value.trim().length > 0) ?? "";
}

function stringifyRecord(value: Partial<Record<string, number>> | undefined) {
  if (!value) return "";
  return Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .filter((entry): entry is [string, number] => entry[1] !== undefined)
    .map(([key, weight]) => `${key}: ${weight}`)
    .join(", ");
}

function stringifyMappings(
  mappings: readonly { signalId: string; weight: number }[],
) {
  return mappings.map((mapping) => `${mapping.signalId}: ${mapping.weight}`).join(", ");
}

const questionQuizLabels = new Map<string, string>();
for (const quiz of quizzes) {
  for (const questionId of quiz.questionIds) {
    questionQuizLabels.set(questionId, quiz.shortTitle);
  }
}

export const curationInventory: readonly CurationInventoryEntry[] = [
  ...kinkCatalog.map((item) => ({
    entityType: "catalog-item" as const,
    entityId: item.id,
    label: item.label,
    summary: firstNonEmpty(item.description, item.categoryLabel),
    source: "M6 kink catalog",
    fields: [
      { key: "category", label: "Category", value: item.categoryLabel },
      { key: "domain", label: "Domain", value: item.domain },
      { key: "direction", label: "Direction", value: item.direction },
      { key: "primaryMode", label: "Primary mode", value: item.primaryMode },
      { key: "intensity", label: "Intensity", value: item.intensity },
      { key: "riskLevel", label: "Risk level", value: item.riskLevel },
      { key: "aliases", label: "Aliases", value: item.aliases.join(", ") || "—" },
      {
        key: "signalMappings",
        label: "Signal mappings",
        value: stringifyMappings(item.signalMappings) || "—",
      },
    ],
  })),
  ...kinkCategories.map((category) => ({
    entityType: "catalog-category" as const,
    entityId: category.id,
    label: category.label,
    summary: `${category.itemCount} catalog items · ${category.domain}`,
    source: "M6 catalog taxonomy",
    fields: [
      { key: "domain", label: "Domain", value: category.domain },
      {
        key: "displayOrder",
        label: "Display order",
        value: String(category.displayOrder),
      },
      { key: "itemCount", label: "Items", value: String(category.itemCount) },
    ],
  })),
  ...rewardPunishmentActions.map((action) => ({
    entityType: "reward-punishment-action" as const,
    entityId: action.id,
    label: action.label,
    summary: firstNonEmpty(
      action.description,
      action.notes,
      "Normalized M11 action",
    ),
    source: "M11 action library",
    fields: [
      {
        key: "contextCategories",
        label: "Context categories",
        value:
          action.contextCategories
            .map((mapping) => `${mapping.id}: ${mapping.weight}`)
            .join(", ") || "—",
      },
      {
        key: "sourceOrigins",
        label: "Source rows",
        value: String(action.sourceOrigins.length),
      },
      { key: "notes", label: "Notes", value: action.notes || "—" },
    ],
  })),
  ...rewardPunishmentCategories.map((category) => ({
    entityType: "reward-punishment-category" as const,
    entityId: category.id,
    label: category.label,
    summary: "M11 contextual taxonomy category",
    source: "M11 contextual taxonomy",
    fields: [
      {
        key: "displayOrder",
        label: "Display order",
        value: String(category.displayOrder),
      },
    ],
  })),
  ...quizQuestions.map((question) => ({
    entityType: "quiz-question" as const,
    entityId: question.id,
    label: question.prompt,
    summary: `${questionQuizLabels.get(question.id) ?? "Starter"} · ${question.kind}`,
    source: "M0/M2-M5 quiz bank",
    fields: [
      {
        key: "quiz",
        label: "Quiz",
        value: questionQuizLabels.get(question.id) ?? "Starter",
      },
      {
        key: "weights",
        label: "Signal weights",
        value:
          question.kind === "weighted"
            ? stringifyRecord(question.weights)
            : `Legacy dimension: ${question.dimension}`,
      },
    ],
  })),
  ...quizzes.map((quiz) => ({
    entityType: "quiz-definition" as const,
    entityId: quiz.id,
    label: quiz.title,
    summary: quiz.description,
    source: "Quiz registry",
    fields: [
      { key: "version", label: "Version", value: String(quiz.version) },
      {
        key: "questionCount",
        label: "Questions",
        value: String(quiz.questionIds.length),
      },
      {
        key: "estimatedMinutes",
        label: "Estimated minutes",
        value: String(quiz.estimatedMinutes),
      },
      {
        key: "overall",
        label: "Contributes to overall",
        value: quiz.contributesToOverall ? "Yes" : "No",
      },
    ],
  })),
  ...signalDefinitions.map((signal) => ({
    entityType: "signal" as const,
    entityId: signal.id,
    label: signal.label,
    summary: signal.description,
    source: "Shared signal vocabulary",
    fields: [
      { key: "shortLabel", label: "Short label", value: signal.shortLabel },
    ],
  })),
  ...dynamicModes.map((mode) => ({
    entityType: "dynamic-mode" as const,
    entityId: mode.id,
    label: mode.label,
    summary: mode.description,
    source: "M3 dynamic modes",
    fields: [
      {
        key: "weights",
        label: "Signal composition",
        value: stringifyRecord(mode.weights),
      },
    ],
  })),
  ...roleHeadspaces.map((role) => ({
    entityType: "role-headspace" as const,
    entityId: role.id,
    label: role.label,
    summary: role.description,
    source: "M3 roles & headspaces",
    fields: [
      {
        key: "weights",
        label: "Signal composition",
        value: stringifyRecord(role.weights),
      },
    ],
  })),
  ...overallFacetDefinitions.map((facet) => ({
    entityType: "overall-facet" as const,
    entityId: facet.id,
    label: facet.label,
    summary: facet.description,
    source: "M7 overall facets",
    fields: [
      {
        key: "directional",
        label: "Directional",
        value: facet.directional ? "Yes" : "No",
      },
      {
        key: "signals",
        label: "Signal composition",
        value: facet.signals
          .map(
            (signal) =>
              `${signal.signalId}: ${signal.weight}${signal.direction ? ` (${signal.direction})` : ""}`,
          )
          .join(", "),
      },
    ],
  })),
];

export const curationInventoryCounts = curationInventory.reduce<
  Record<CurationPrimitiveType, number>
>(
  (counts, entry) => {
    counts[entry.entityType] += 1;
    return counts;
  },
  {
    "catalog-item": 0,
    "catalog-category": 0,
    "reward-punishment-action": 0,
    "reward-punishment-category": 0,
    "quiz-question": 0,
    "quiz-definition": 0,
    signal: 0,
    "dynamic-mode": 0,
    "role-headspace": 0,
    "overall-facet": 0,
  },
);

export const curationPrimitiveLabels: Record<CurationPrimitiveType, string> = {
  "catalog-item": "Kinks",
  "catalog-category": "Catalog categories",
  "reward-punishment-action": "Reward / punishment actions",
  "reward-punishment-category": "R/P categories",
  "quiz-question": "Quiz questions",
  "quiz-definition": "Quiz definitions",
  signal: "Signals",
  "dynamic-mode": "Dynamic modes",
  "role-headspace": "Roles / headspaces",
  "overall-facet": "Overall facets",
};
