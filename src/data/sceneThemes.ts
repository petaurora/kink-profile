import type { OverallFacetId } from "./overallFacets";
import { overallFacetDefinitions } from "./overallFacets";
import {
  dynamicModes,
  roleHeadspaces,
} from "./headspacesQuiz";
import {
  kinkCategories,
} from "./kinkCatalog.generated";
import type { SignalId } from "./signals";
import { signalDefinitions } from "./signals";

export type SceneThemeId =
  | "pain"
  | "restraint"
  | "service"
  | "discipline"
  | "sensory"
  | "care"
  | "pet"
  | "prey"
  | "devotional-submission"
  | "deep-submission"
  | "power-exchange"
  | "surrender"
  | "protocol"
  | "primal-feral"
  | "playful-resistance"
  | "soft"
  | "structured"
  | "intense"
  | "playful"
  | "ritual-heavy";

export type SceneThemeFamily =
  | "activity"
  | "headspace"
  | "dynamic_mode"
  | "facet"
  | "vibe";

export type SceneThemeMapping =
  | { kind: "signal"; id: SignalId; weight: number }
  | { kind: "headspace"; id: string; weight: number }
  | { kind: "dynamic_mode"; id: string; weight: number }
  | { kind: "facet"; id: OverallFacetId; weight: number }
  | { kind: "catalog_category"; id: string; weight: number };

export type SceneThemeDefinition = {
  id: SceneThemeId;
  label: string;
  description: string;
  family: SceneThemeFamily;
  mappings: readonly SceneThemeMapping[];
};

/**
 * M13 themes are runtime queries only.
 *
 * They may consume profile evidence, but selecting a theme must never become
 * evidence itself or mutate the underlying profile.
 */
export const sceneThemeSemantics = {
  authority: "query-only",
  writesProfileEvidence: false,
} as const;

export const sceneThemeDefinitions: readonly SceneThemeDefinition[] = [
  {
    id: "pain",
    label: "Pain",
    description: "Physical pain, impact, endurance, or intensity-focused play.",
    family: "activity",
    mappings: [
      { kind: "signal", id: "pain_receiving", weight: 1 },
      { kind: "signal", id: "pain_giving", weight: 1 },
      { kind: "signal", id: "receiving_intensity", weight: 0.55 },
      { kind: "signal", id: "giving_intensity", weight: 0.55 },
      { kind: "dynamic_mode", id: "intensity_mode", weight: 0.7 },
      { kind: "facet", id: "intensity_pain", weight: 0.9 },
      { kind: "catalog_category", id: "impact-play", weight: 0.8 },
      { kind: "catalog_category", id: "pain-sensation", weight: 0.9 },
    ],
  },
  {
    id: "restraint",
    label: "Restraint",
    description: "Bondage, positioning, reduced movement, and physical constraint.",
    family: "activity",
    mappings: [
      { kind: "signal", id: "receiving_restraint", weight: 1 },
      { kind: "signal", id: "giving_restraint", weight: 1 },
      { kind: "signal", id: "movement_restriction", weight: 0.9 },
      { kind: "signal", id: "receiving_constraint_control", weight: 0.7 },
      { kind: "signal", id: "giving_constraint_control", weight: 0.7 },
      { kind: "facet", id: "restraint_physical_control", weight: 1 },
      { kind: "catalog_category", id: "bondage-restraint", weight: 1 },
    ],
  },
  {
    id: "service",
    label: "Service",
    description: "Usefulness, contribution, obedience, and relational devotion.",
    family: "activity",
    mappings: [
      { kind: "signal", id: "service", weight: 1 },
      { kind: "signal", id: "devotion", weight: 0.7 },
      { kind: "signal", id: "obedience", weight: 0.5 },
      { kind: "dynamic_mode", id: "service_mode", weight: 0.9 },
      { kind: "facet", id: "service_devotion", weight: 1 },
      { kind: "catalog_category", id: "protocol-obedience-service", weight: 0.9 },
    ],
  },
  {
    id: "discipline",
    label: "Discipline",
    description: "Agreed correction, accountability, consequences, and follow-through.",
    family: "activity",
    mappings: [
      { kind: "signal", id: "receiving_discipline", weight: 1 },
      { kind: "signal", id: "giving_discipline", weight: 1 },
      { kind: "signal", id: "accountability", weight: 0.8 },
      { kind: "signal", id: "structure", weight: 0.45 },
      { kind: "dynamic_mode", id: "structure_mode", weight: 0.7 },
      { kind: "facet", id: "structure_protocol", weight: 0.75 },
      { kind: "catalog_category", id: "protocol-obedience-service", weight: 0.55 },
      { kind: "catalog_category", id: "protocol-bondage-d-s-details", weight: 0.45 },
    ],
  },
  {
    id: "sensory",
    label: "Sensory",
    description: "Sensation-focused play where texture, temperature, pressure, or stimulus is the point.",
    family: "activity",
    mappings: [
      { kind: "signal", id: "receiving_intensity", weight: 0.45 },
      { kind: "signal", id: "giving_intensity", weight: 0.45 },
      { kind: "catalog_category", id: "sensory-play", weight: 1 },
      { kind: "catalog_category", id: "pain-sensation", weight: 0.4 },
    ],
  },
  {
    id: "care",
    label: "Care",
    description: "Nurturing, soothing, support, praise, and deliberate attention to wellbeing.",
    family: "activity",
    mappings: [
      { kind: "signal", id: "care_receiving", weight: 1 },
      { kind: "signal", id: "care_giving", weight: 1 },
      { kind: "signal", id: "praise_approval", weight: 0.5 },
      { kind: "dynamic_mode", id: "care_mode", weight: 0.9 },
      { kind: "facet", id: "care_nurture", weight: 1 },
      { kind: "catalog_category", id: "caretaking-reward-oriented", weight: 1 },
    ],
  },
  {
    id: "pet",
    label: "Pet",
    description: "Pet headspace, belonging, creature-like play, care, and role immersion.",
    family: "headspace",
    mappings: [
      { kind: "headspace", id: "pet", weight: 1 },
      { kind: "signal", id: "role_embodiment", weight: 0.7 },
      { kind: "signal", id: "belonging", weight: 0.7 },
      { kind: "signal", id: "playfulness", weight: 0.55 },
      { kind: "dynamic_mode", id: "care_mode", weight: 0.45 },
      { kind: "catalog_category", id: "pet-animal-roleplay", weight: 1 },
    ],
  },
  {
    id: "prey",
    label: "Prey",
    description: "Being pursued, hunted, cornered, caught, or pulled into an instinctive prey role.",
    family: "headspace",
    mappings: [
      { kind: "headspace", id: "prey", weight: 1 },
      { kind: "signal", id: "pursuit_receiving", weight: 1 },
      { kind: "signal", id: "primal_embodiment", weight: 0.75 },
      { kind: "dynamic_mode", id: "primal_mode", weight: 0.65 },
      { kind: "facet", id: "primal_instinctive", weight: 0.8 },
      { kind: "catalog_category", id: "primal-play", weight: 0.9 },
    ],
  },
  {
    // Keep the historical ID so saved scenes remain compatible.
    id: "devotional-submission",
    label: "Devotion",
    description: "Dedication, belonging, service, ritual, and relationship meaning that can layer onto any role or headspace.",
    family: "dynamic_mode",
    mappings: [
      { kind: "signal", id: "devotion", weight: 1 },
      { kind: "signal", id: "belonging", weight: 0.7 },
      { kind: "signal", id: "service", weight: 0.55 },
      { kind: "dynamic_mode", id: "devotion_mode", weight: 1 },
      { kind: "dynamic_mode", id: "service_mode", weight: 0.4 },
      { kind: "facet", id: "service_devotion", weight: 0.8 },
    ],
  },
  {
    id: "power-exchange",
    label: "Power Exchange",
    description: "Negotiated placement of control, direction, responsibility, and following.",
    family: "dynamic_mode",
    mappings: [
      { kind: "dynamic_mode", id: "power_exchange_mode", weight: 1 },
      { kind: "facet", id: "power_exchange", weight: 1 },
      { kind: "signal", id: "receiving_control", weight: 0.85 },
      { kind: "signal", id: "giving_control", weight: 0.85 },
      { kind: "signal", id: "responsibility_transfer", weight: 0.7 },
      { kind: "signal", id: "responsibility_holding", weight: 0.7 },
      { kind: "catalog_category", id: "power-exchange-roles", weight: 0.9 },
    ],
  },
  {
    id: "deep-submission",
    label: "Deeper Submission",
    description: "A more immersive chosen surrender of direction, responsibility, and obedience.",
    family: "vibe",
    mappings: [
      { kind: "dynamic_mode", id: "power_exchange_mode", weight: 0.75 },
      { kind: "signal", id: "responsibility_transfer", weight: 1 },
      { kind: "signal", id: "receiving_control", weight: 0.9 },
      { kind: "signal", id: "obedience", weight: 0.7 },
      { kind: "signal", id: "devotion", weight: 0.45 },
      { kind: "facet", id: "power_exchange", weight: 1 },
      { kind: "catalog_category", id: "power-exchange-roles", weight: 0.7 },
    ],
  },
  {
    id: "surrender",
    label: "Surrender",
    description: "Letting go of decision load or direction within chosen, negotiated authority.",
    family: "vibe",
    mappings: [
      { kind: "dynamic_mode", id: "power_exchange_mode", weight: 0.7 },
      { kind: "signal", id: "responsibility_transfer", weight: 1 },
      { kind: "signal", id: "receiving_control", weight: 0.85 },
      { kind: "facet", id: "power_exchange", weight: 0.9 },
    ],
  },
  {
    id: "protocol",
    label: "Protocol",
    description: "Formal expectations, ritual, prescribed behavior, and intentional ways of doing things.",
    family: "dynamic_mode",
    mappings: [
      { kind: "dynamic_mode", id: "protocol_mode", weight: 1 },
      { kind: "signal", id: "ritual_significance", weight: 1 },
      { kind: "signal", id: "structure", weight: 0.6 },
      { kind: "signal", id: "obedience", weight: 0.45 },
      { kind: "facet", id: "structure_protocol", weight: 1 },
      { kind: "catalog_category", id: "protocol-obedience-service", weight: 0.9 },
      { kind: "catalog_category", id: "protocol-bondage-d-s-details", weight: 0.7 },
    ],
  },
  {
    id: "primal-feral",
    label: "Primal / Feral",
    description: "Instinctive, physical, pursuit-oriented, less socially structured play.",
    family: "dynamic_mode",
    mappings: [
      { kind: "dynamic_mode", id: "primal_mode", weight: 1 },
      { kind: "signal", id: "primal_embodiment", weight: 1 },
      { kind: "signal", id: "pursuit_receiving", weight: 0.6 },
      { kind: "signal", id: "pursuit_giving", weight: 0.6 },
      { kind: "facet", id: "primal_instinctive", weight: 1 },
      { kind: "catalog_category", id: "primal-play", weight: 1 },
    ],
  },
  {
    // Keep the historical ID so saved scenes remain compatible.
    id: "playful-resistance",
    label: "Playful Challenge",
    description: "Teasing, negotiated pushback, provocation, and interactive challenge.",
    family: "dynamic_mode",
    mappings: [
      { kind: "dynamic_mode", id: "playful_resistance_mode", weight: 1 },
      { kind: "headspace", id: "brat", weight: 0.75 },
      { kind: "signal", id: "playful_resistance", weight: 1 },
      { kind: "signal", id: "playfulness", weight: 0.7 },
      { kind: "signal", id: "challenge_escape", weight: 0.45 },
      { kind: "facet", id: "play_resistance", weight: 1 },
    ],
  },
  {
    id: "soft",
    label: "Soft",
    description: "Lower-pressure, warm, cared-for, affectionate, or soothing energy.",
    family: "vibe",
    mappings: [
      { kind: "signal", id: "care_receiving", weight: 0.9 },
      { kind: "signal", id: "care_giving", weight: 0.9 },
      { kind: "signal", id: "praise_approval", weight: 0.75 },
      { kind: "signal", id: "playfulness", weight: 0.4 },
      { kind: "dynamic_mode", id: "care_mode", weight: 0.9 },
      { kind: "facet", id: "care_nurture", weight: 1 },
    ],
  },
  {
    id: "structured",
    label: "Structured",
    description: "Clear expectations, deliberate pacing, rules, consistency, and organized progression.",
    family: "vibe",
    mappings: [
      { kind: "signal", id: "structure", weight: 1 },
      { kind: "signal", id: "accountability", weight: 0.7 },
      { kind: "dynamic_mode", id: "structure_mode", weight: 0.9 },
      { kind: "dynamic_mode", id: "protocol_mode", weight: 0.45 },
      { kind: "facet", id: "structure_protocol", weight: 1 },
    ],
  },
  {
    id: "intense",
    label: "Intense",
    description: "Physically or emotionally strong play with more sensation, endurance, pain, or edge.",
    family: "vibe",
    mappings: [
      { kind: "signal", id: "receiving_intensity", weight: 1 },
      { kind: "signal", id: "giving_intensity", weight: 1 },
      { kind: "signal", id: "emotional_intensity", weight: 0.8 },
      { kind: "signal", id: "receiving_challenge", weight: 0.55 },
      { kind: "signal", id: "giving_challenge", weight: 0.55 },
      { kind: "dynamic_mode", id: "intensity_mode", weight: 1 },
      { kind: "facet", id: "intensity_pain", weight: 1 },
    ],
  },
  {
    id: "playful",
    label: "Playful",
    description: "Light, mischievous, spontaneous, interactive, or game-like energy.",
    family: "vibe",
    mappings: [
      { kind: "signal", id: "playfulness", weight: 1 },
      { kind: "signal", id: "playful_resistance", weight: 0.55 },
      { kind: "dynamic_mode", id: "playful_resistance_mode", weight: 0.55 },
      { kind: "facet", id: "play_resistance", weight: 0.9 },
    ],
  },
  {
    id: "ritual-heavy",
    label: "Ritual-heavy",
    description: "Symbolic, repeated, formal, or ceremonial actions carry extra meaning.",
    family: "vibe",
    mappings: [
      { kind: "signal", id: "ritual_significance", weight: 1 },
      { kind: "signal", id: "structure", weight: 0.65 },
      { kind: "signal", id: "ownership_symbolism", weight: 0.45 },
      { kind: "dynamic_mode", id: "protocol_mode", weight: 0.8 },
      { kind: "dynamic_mode", id: "devotion_mode", weight: 0.55 },
      { kind: "facet", id: "structure_protocol", weight: 0.9 },
      { kind: "catalog_category", id: "collars-symbols-marking", weight: 0.55 },
      { kind: "catalog_category", id: "protocol-obedience-service", weight: 0.7 },
    ],
  },
] as const;

export type SceneThemeValidationIssue = {
  themeId: string;
  message: string;
};

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSceneThemeDefinitions(
  definitions: readonly SceneThemeDefinition[] = sceneThemeDefinitions,
): SceneThemeValidationIssue[] {
  const issues: SceneThemeValidationIssue[] = [];
  const seenThemeIds = new Set<string>();
  const signalIds = new Set(signalDefinitions.map((entry) => entry.id));
  const headspaceIds = new Set(roleHeadspaces.map((entry) => entry.id));
  const dynamicModeIds = new Set(dynamicModes.map((entry) => entry.id));
  const facetIds = new Set(overallFacetDefinitions.map((entry) => entry.id));
  const categoryIds = new Set<string>(kinkCategories.map((entry) => entry.id));

  for (const theme of definitions) {
    if (!stableIdPattern.test(theme.id)) {
      issues.push({
        themeId: theme.id,
        message: "Theme ID must use stable lowercase kebab-case.",
      });
    }

    if (seenThemeIds.has(theme.id)) {
      issues.push({
        themeId: theme.id,
        message: "Theme ID must be unique.",
      });
    }
    seenThemeIds.add(theme.id);

    if (theme.mappings.length === 0) {
      issues.push({
        themeId: theme.id,
        message: "Theme must define at least one explicit mapping.",
      });
      continue;
    }

    const seenMappings = new Set<string>();

    for (const mapping of theme.mappings) {
      if (!Number.isFinite(mapping.weight) || mapping.weight <= 0 || mapping.weight > 1) {
        issues.push({
          themeId: theme.id,
          message: `Mapping ${mapping.kind}:${mapping.id} weight must be > 0 and <= 1.`,
        });
      }

      const mappingKey = `${mapping.kind}:${mapping.id}`;
      if (seenMappings.has(mappingKey)) {
        issues.push({
          themeId: theme.id,
          message: `Duplicate mapping ${mappingKey}.`,
        });
      }
      seenMappings.add(mappingKey);

      const exists =
        mapping.kind === "signal"
          ? signalIds.has(mapping.id)
          : mapping.kind === "headspace"
            ? headspaceIds.has(mapping.id)
            : mapping.kind === "dynamic_mode"
              ? dynamicModeIds.has(mapping.id)
              : mapping.kind === "facet"
                ? facetIds.has(mapping.id)
                : categoryIds.has(mapping.id);

      if (!exists) {
        issues.push({
          themeId: theme.id,
          message: `Unknown ${mapping.kind} mapping ID "${mapping.id}".`,
        });
      }
    }
  }

  return issues;
}

export function assertValidSceneThemeDefinitions(
  definitions: readonly SceneThemeDefinition[] = sceneThemeDefinitions,
) {
  const issues = validateSceneThemeDefinitions(definitions);

  if (issues.length > 0) {
    throw new Error(
      [
        "Invalid M13 scene-theme taxonomy:",
        ...issues.map((issue) => `- ${issue.themeId}: ${issue.message}`),
      ].join("\n"),
    );
  }
}

export function getSceneTheme(id: SceneThemeId) {
  return sceneThemeDefinitions.find((theme) => theme.id === id);
}

export function getSceneThemesByFamily(family: SceneThemeFamily) {
  return sceneThemeDefinitions.filter((theme) => theme.family === family);
}