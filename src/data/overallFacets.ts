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

export type OverallFacetDirection = "receiving" | "giving";

export type OverallFacetSignalWeight = {
  signalId: SignalId;
  weight: number;
  direction?: OverallFacetDirection;
};

export type OverallFacetDefinition = {
  id: OverallFacetId;
  label: string;
  shortLabel: string;
  description: string;
  directional: boolean;
  signals: readonly OverallFacetSignalWeight[];
};

/**
 * M7.2 broad profile vocabulary.
 *
 * Facets intentionally consume canonical primitive SignalIds only. Composed
 * roles/headspaces/dynamic modes are presentation results and must not feed
 * back into the signal/facet pipeline.
 *
 * We keep all nine meaningful facets in the model. M7.4 can decide whether
 * the first radar renders all nine simultaneously based on real mobile
 * readability; distinct concepts are not merged merely to hit an axis count.
 */
export const overallFacetDefinitions: readonly OverallFacetDefinition[] = [
  {
    id: "power_exchange",
    label: "Power Exchange",
    shortLabel: "Power",
    description:
      "Meaningful surrender, exercise, or transfer of negotiated authority and responsibility.",
    directional: true,
    signals: [
      { signalId: "receiving_control", weight: 1, direction: "receiving" },
      { signalId: "giving_control", weight: 1, direction: "giving" },
      {
        signalId: "responsibility_transfer",
        weight: 0.9,
        direction: "receiving",
      },
      {
        signalId: "responsibility_holding",
        weight: 0.8,
      },
      { signalId: "obedience", weight: 0.65, direction: "receiving" },
    ],
  },
  {
    id: "structure_protocol",
    label: "Structure & Protocol",
    shortLabel: "Structure",
    description:
      "Rules, ritual, accountability, discipline, and deliberate frameworks around a dynamic.",
    directional: false,
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
    directional: false,
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
    directional: false,
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
    directional: true,
    signals: [
      { signalId: "care_receiving", weight: 1, direction: "receiving" },
      { signalId: "care_giving", weight: 1, direction: "giving" },
      { signalId: "guidance_shaping", weight: 0.55, direction: "giving" },
      {
        signalId: "responsibility_holding",
        weight: 0.45,
        direction: "giving",
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
    directional: false,
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
    directional: true,
    signals: [
      { signalId: "primal_embodiment", weight: 1 },
      {
        signalId: "pursuit_receiving",
        weight: 0.85,
        direction: "receiving",
      },
      { signalId: "pursuit_giving", weight: 0.85, direction: "giving" },
    ],
  },
  {
    id: "restraint_physical_control",
    label: "Restraint & Physical Control",
    shortLabel: "Restraint",
    description:
      "Physical restriction, body positioning, movement control, and constraint-oriented play.",
    directional: true,
    signals: [
      {
        signalId: "receiving_restraint",
        weight: 1,
        direction: "receiving",
      },
      { signalId: "giving_restraint", weight: 1, direction: "giving" },
      { signalId: "movement_restriction", weight: 0.9 },
      {
        signalId: "receiving_positioning",
        weight: 0.7,
        direction: "receiving",
      },
      { signalId: "giving_positioning", weight: 0.7, direction: "giving" },
      {
        signalId: "receiving_constraint_control",
        weight: 0.8,
        direction: "receiving",
      },
      {
        signalId: "giving_constraint_control",
        weight: 0.8,
        direction: "giving",
      },
    ],
  },
  {
    id: "intensity_pain",
    label: "Intensity & Pain",
    shortLabel: "Intensity",
    description:
      "Physical or emotional intensity, pain, endurance, and consensual challenge at an agreed edge.",
    directional: true,
    signals: [
      { signalId: "pain_receiving", weight: 1, direction: "receiving" },
      { signalId: "pain_giving", weight: 1, direction: "giving" },
      {
        signalId: "receiving_intensity",
        weight: 0.9,
        direction: "receiving",
      },
      { signalId: "giving_intensity", weight: 0.9, direction: "giving" },
      {
        signalId: "receiving_endurance",
        weight: 0.65,
        direction: "receiving",
      },
      { signalId: "giving_endurance", weight: 0.65, direction: "giving" },
      {
        signalId: "receiving_challenge",
        weight: 0.65,
        direction: "receiving",
      },
      { signalId: "giving_challenge", weight: 0.65, direction: "giving" },
      { signalId: "emotional_intensity", weight: 0.55 },
    ],
  },
];

export function getOverallFacet(id: OverallFacetId) {
  return overallFacetDefinitions.find((facet) => facet.id === id);
}
