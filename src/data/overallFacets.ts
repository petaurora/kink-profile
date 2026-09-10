import type { SignalId } from "./signals";

export type OverallFacetId =
  | "power_exchange"
  | "structure_protocol"
  | "ownership_belonging"
  | "service_devotion"
  | "care_nurture"
  | "play_resistance"
  | "primal_instinctive"
  | "restraint_physical_control"
  | "intensity_pain";

export type OverallFacetSignalRelationship = "supports" | "opposes";

export type OverallFacetSignalWeight = {
  signalId: SignalId;
  weight: number;
  relationship?: OverallFacetSignalRelationship;
};

export type OverallFacetDefinition = {
  id: OverallFacetId;
  label: string;
  shortLabel: string;
  description: string;
  signals: readonly OverallFacetSignalWeight[];
};

/**
 * M7.2 broad profile vocabulary.
 *
 * Facets intentionally consume canonical primitive SignalIds only. Composed
 * roles/headspaces/dynamic modes are presentation results and must not feed
 * back into the signal/facet pipeline.
 *
 * We keep all nine meaningful facets in the model and render all nine on the
 * overall radar. Distinct concepts are not merged merely to reduce axis count.
 *
 * Overall Facets are broad themes. Giving/receiving and authority orientation
 * remain properties of the more granular Signal/mode/headspace layers.
 *
 * A listed Signal relationship supports the facet by default. A relationship
 * may explicitly oppose the facet. Missing Signal rows are neutral.
 */
export const overallFacetDefinitions: readonly OverallFacetDefinition[] = [
  {
    id: "power_exchange",
    label: "Power Exchange",
    shortLabel: "Power",
    description:
      "Meaningful surrender, exercise, or transfer of negotiated authority and responsibility.",
    signals: [
      { signalId: "receiving_control", weight: 1 },
      { signalId: "giving_control", weight: 1 },
      {
        signalId: "responsibility_transfer",
        weight: 0.9,
      },
      {
        signalId: "responsibility_holding",
        weight: 0.8,
      },
      { signalId: "obedience", weight: 0.65 },
    ],
  },
  {
    id: "structure_protocol",
    label: "Structure & Protocol",
    shortLabel: "Structure",
    description:
      "Rules, ritual, accountability, discipline, and deliberate frameworks around a dynamic.",
    signals: [
      { signalId: "structure", weight: 1 },
      { signalId: "ritual_significance", weight: 0.8 },
      { signalId: "accountability", weight: 0.75 },
      { signalId: "guidance_shaping", weight: 0.55 },
      { signalId: "receiving_discipline", weight: 0.7 },
      { signalId: "giving_discipline", weight: 0.7 },
    ],
  },
  {
    id: "ownership_belonging",
    label: "Ownership & Belonging",
    shortLabel: "Ownership",
    description:
      "Symbolic possession, claiming, belonging, and consensual property-oriented meaning.",
    signals: [
      { signalId: "ownership_symbolism", weight: 1 },
      { signalId: "belonging", weight: 0.9 },
      { signalId: "objectification", weight: 0.45 },
    ],
  },
  {
    id: "service_devotion",
    label: "Service & Devotion",
    shortLabel: "Service",
    description:
      "Fulfillment through serving, pleasing, dedication, loyalty, and relationship-centered devotion.",
    signals: [
      { signalId: "service", weight: 1 },
      { signalId: "devotion", weight: 1 },
      { signalId: "obedience", weight: 0.5 },
      { signalId: "ritual_significance", weight: 0.35 },
      { signalId: "praise_approval", weight: 0.3 },
    ],
  },
  {
    id: "care_nurture",
    label: "Care & Nurture",
    shortLabel: "Care",
    description:
      "Receiving or providing care, soothing, guidance, protection, and nurtured relational energy.",
    signals: [
      { signalId: "care_receiving", weight: 1 },
      { signalId: "care_giving", weight: 1 },
      { signalId: "guidance_shaping", weight: 0.55 },
      {
        signalId: "responsibility_holding",
        weight: 0.45,
      },
      { signalId: "praise_approval", weight: 0.3 },
    ],
  },
  {
    id: "play_resistance",
    label: "Play & Resistance",
    shortLabel: "Play",
    description:
      "Playfulness, teasing, mischief, negotiated resistance, and consensual push-pull.",
    signals: [
      { signalId: "playfulness", weight: 1 },
      { signalId: "playful_resistance", weight: 1 },
      { signalId: "challenge_escape", weight: 0.6 },
      { signalId: "autonomy", weight: 0.3 },
    ],
  },
  {
    id: "primal_instinctive",
    label: "Primal & Instinctive",
    shortLabel: "Primal",
    description:
      "Feral, pursuit, chase, predator/prey, embodied, and less-structured instinctive energy.",
    signals: [
      { signalId: "primal_embodiment", weight: 1 },
      {
        signalId: "pursuit_receiving",
        weight: 0.85,
      },
      { signalId: "pursuit_giving", weight: 0.85 },
    ],
  },
  {
    id: "restraint_physical_control",
    label: "Restraint & Physical Control",
    shortLabel: "Restraint",
    description:
      "Physical restriction, body positioning, movement control, and constraint-oriented play.",
    signals: [
      {
        signalId: "receiving_restraint",
        weight: 1,
      },
      { signalId: "giving_restraint", weight: 1 },
      { signalId: "movement_restriction", weight: 0.9 },
      {
        signalId: "receiving_positioning",
        weight: 0.7,
      },
      { signalId: "giving_positioning", weight: 0.7 },
      {
        signalId: "receiving_constraint_control",
        weight: 0.8,
      },
      {
        signalId: "giving_constraint_control",
        weight: 0.8,
      },
    ],
  },
  {
    id: "intensity_pain",
    label: "Intensity & Pain",
    shortLabel: "Intensity",
    description:
      "Physical or emotional intensity, pain, endurance, and consensual challenge at an agreed edge.",
    signals: [
      { signalId: "pain_receiving", weight: 1 },
      { signalId: "pain_giving", weight: 1 },
      {
        signalId: "receiving_intensity",
        weight: 0.9,
      },
      { signalId: "giving_intensity", weight: 0.9 },
      {
        signalId: "receiving_endurance",
        weight: 0.65,
      },
      { signalId: "giving_endurance", weight: 0.65 },
      {
        signalId: "receiving_challenge",
        weight: 0.65,
      },
      { signalId: "giving_challenge", weight: 0.65 },
      { signalId: "emotional_intensity", weight: 0.55 },
    ],
  },
];

export function getOverallFacet(id: OverallFacetId) {
  return overallFacetDefinitions.find((facet) => facet.id === id);
}
