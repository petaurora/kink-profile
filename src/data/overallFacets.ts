import type {
  CanonicalSignalId,
  SignalChannel,
} from "./canonicalSignals";

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
  signalId: CanonicalSignalId;
  channel?: SignalChannel;
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
 * Overall Facets are broad themes, not directional axes.
 *
 * After M16.4, a facet references a canonical Signal concept plus an optional
 * channel. Omitted channel means the Signal's Overall roll-up. This prevents
 * old receiving/giving IDs from counting the same concept twice merely because
 * both sides existed in the legacy vocabulary.
 */
export const overallFacetDefinitions: readonly OverallFacetDefinition[] = [
  {
    id: "power_exchange",
    label: "Power Exchange",
    shortLabel: "Power",
    description:
      "Meaningful surrender, exercise, or transfer of negotiated authority and responsibility.",
    signals: [
      { signalId: "control", weight: 1 },
      { signalId: "responsibility", weight: 0.9 },
      { signalId: "obedience", weight: 0.5 },
      { signalId: "discipline", weight: 0.35 },
      { signalId: "constraint_control", weight: 0.5 },
      { signalId: "ownership_symbolism", weight: 0.3 },
      { signalId: "guidance_shaping", weight: 0.2 },
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
      { signalId: "obedience", weight: 0.7 },
      { signalId: "discipline", weight: 0.6 },
      { signalId: "guidance_shaping", weight: 0.45 },
      { signalId: "responsibility", weight: 0.3 },
      { signalId: "control", weight: 0.25 },
      { signalId: "service", weight: 0.2 },
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
      { signalId: "objectification", weight: 0.35 },
      { signalId: "devotion", weight: 0.35 },
      { signalId: "responsibility", weight: 0.3 },
      { signalId: "control", weight: 0.3 },
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
      { signalId: "praise_approval", weight: 0.4 },
      { signalId: "obedience", weight: 0.3 },
      { signalId: "care", channel: "giving", weight: 0.3 },
      { signalId: "belonging", weight: 0.2 },
      { signalId: "ritual_significance", weight: 0.15 },
    ],
  },
  {
    id: "care_nurture",
    label: "Care & Nurture",
    shortLabel: "Care",
    description:
      "Receiving or providing care, soothing, guidance, protection, and nurtured relational energy.",
    signals: [
      { signalId: "care", weight: 1 },
      { signalId: "guidance_shaping", weight: 0.45 },
      { signalId: "praise_approval", weight: 0.5 },
      { signalId: "younger_headspace", weight: 0.35 },
      { signalId: "responsibility", weight: 0.3 },
      { signalId: "playfulness", weight: 0.2 },
      { signalId: "belonging", weight: 0.2 },
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
      { signalId: "escape_containment", weight: 0.7 },
      { signalId: "autonomy", weight: 0.4 },
      { signalId: "pursuit", weight: 0.3 },
      { signalId: "younger_headspace", weight: 0.3 },
      { signalId: "anticipation", weight: 0.2 },
      { signalId: "challenge", weight: 0.2 },
      { signalId: "primal_embodiment", weight: 0.2 },
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
      { signalId: "pursuit", weight: 0.85 },
      { signalId: "escape_containment", weight: 0.3 },
      { signalId: "endurance", weight: 0.2 },
      { signalId: "anticipation", weight: 0.2 },
      { signalId: "playful_resistance", weight: 0.15 },
      { signalId: "playfulness", weight: 0.1 },
      { signalId: "emotional_intensity", weight: 0.15 },
    ],
  },
  {
    id: "restraint_physical_control",
    label: "Restraint & Physical Control",
    shortLabel: "Restraint",
    description:
      "Physical restriction, body positioning, movement control, and constraint-oriented play.",
    signals: [
      { signalId: "restraint", weight: 1 },
      { signalId: "movement_restriction", weight: 0.9 },
      { signalId: "constraint_control", weight: 0.8 },
      { signalId: "positioning", weight: 0.7 },
      { signalId: "control", weight: 0.2 },
      { signalId: "anticipation", weight: 0.2 },
    ],
  },
  {
    id: "intensity_pain",
    label: "Intensity & Pain",
    shortLabel: "Intensity",
    description:
      "Physical or emotional intensity, pain, endurance, and consensual challenge at an agreed edge.",
    signals: [
      { signalId: "pain", weight: 1 },
      { signalId: "physical_intensity", weight: 0.9 },
      { signalId: "endurance", weight: 0.65 },
      { signalId: "challenge", weight: 0.5 },
      { signalId: "emotional_intensity", weight: 0.55 },
      { signalId: "anticipation", weight: 0.35 },
      { signalId: "escape_containment", weight: 0.2 },
    ],
  },
];

export function getOverallFacet(id: OverallFacetId) {
  return overallFacetDefinitions.find((facet) => facet.id === id);
}
