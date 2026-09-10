import type { CatalogPreferenceContext } from "../lib/catalogProfile";
import type { SignalId as LegacySignalId } from "./signals";

export type SignalChannel = "overall" | "receiving" | "giving";

export type CanonicalSignalId =
  | "control"
  | "responsibility"
  | "service"
  | "obedience"
  | "structure"
  | "ownership_symbolism"
  | "praise_approval"
  | "autonomy"
  | "belonging"
  | "role_embodiment"
  | "playfulness"
  | "care"
  | "devotion"
  | "ritual_significance"
  | "playful_resistance"
  | "objectification"
  | "guidance_shaping"
  | "younger_headspace"
  | "primal_embodiment"
  | "pursuit"
  | "restraint"
  | "movement_restriction"
  | "positioning"
  | "constraint_control"
  | "discipline"
  | "accountability"
  | "anticipation"
  | "escape_containment"
  | "pain"
  | "physical_intensity"
  | "endurance"
  | "challenge"
  | "emotional_intensity"
  | "exhibitionism"
  | "voyeurism"
  | "arousal_control"
  | "degradation_humiliation";

export type CanonicalSignalRef = {
  signalId: CanonicalSignalId;
  channel?: SignalChannel;
};

export type CanonicalSignalChannelDefinition = {
  label: string;
  shortLabel?: string;
  description?: string;
};

export type CanonicalSignalDefinition = {
  id: CanonicalSignalId;
  label: string;
  shortLabel: string;
  description: string;
  channels: {
    receiving?: CanonicalSignalChannelDefinition;
    giving?: CanonicalSignalChannelDefinition;
  };
};

const directional = (
  receiving: string,
  giving: string,
): CanonicalSignalDefinition["channels"] => ({
  receiving: { label: receiving },
  giving: { label: giving },
});

export const canonicalSignalDefinitions: readonly CanonicalSignalDefinition[] = [
  {
    id: "control",
    label: "Control",
    shortLabel: "Control",
    description:
      "Negotiated control over choices, direction, or the flow of an interaction can carry psychological or relational appeal.",
    channels: directional("Being controlled / Receiving control", "Exercising control"),
  },
  {
    id: "responsibility",
    label: "Responsibility",
    shortLabel: "Responsibility",
    description:
      "The deliberate placement of decision-making, direction, boundaries, or responsibility for an experience can carry meaning.",
    channels: directional("Taking / holding responsibility", "Handing over responsibility"),
  },
  {
    id: "service",
    label: "Service",
    shortLabel: "Service",
    description:
      "Acts of usefulness, contribution, assistance, or attending to another person's needs can carry relational significance.",
    channels: directional("Being served", "Providing service"),
  },
  {
    id: "obedience",
    label: "Obedience",
    shortLabel: "Obedience",
    description:
      "Intentional compliance with clear direction can itself carry relational or psychological meaning.",
    channels: directional("Being obeyed", "Following direction"),
  },
  {
    id: "structure",
    label: "Structure",
    shortLabel: "Structure",
    description:
      "Defined expectations, rules, routines, consistency, or explicit frameworks can make a dynamic feel more intentional or rewarding.",
    channels: directional("Receiving / living within structure", "Creating / providing structure"),
  },
  {
    id: "ownership_symbolism",
    label: "Ownership Symbolism",
    shortLabel: "Ownership",
    description:
      "Consensual claiming, belonging, ownership language, or commitment symbols can carry emotional meaning.",
    channels: directional("Being claimed / owned", "Claiming / owning"),
  },
  {
    id: "praise_approval",
    label: "Praise / Approval",
    shortLabel: "Praise",
    description:
      "Positive recognition, approval, affirmation, or acknowledgment can carry emotional or relational significance.",
    channels: directional("Being praised / approved of", "Giving praise / approval"),
  },
  {
    id: "autonomy",
    label: "Autonomy",
    shortLabel: "Autonomy",
    description: "Preserving meaningful personal choice can itself matter strongly.",
    channels: {},
  },
  {
    id: "belonging",
    label: "Belonging",
    shortLabel: "Belonging",
    description: "Feeling meaningfully connected or included can deepen a dynamic.",
    channels: {},
  },
  {
    id: "role_embodiment",
    label: "Role Embodiment",
    shortLabel: "Role",
    description: "Immersion in a distinct relational role or mode can change how an interaction feels internally.",
    channels: {},
  },
  {
    id: "playfulness",
    label: "Playfulness",
    shortLabel: "Play",
    description: "Silliness, spontaneity, or a lighter interactive mode can be part of the appeal.",
    channels: {},
  },
  {
    id: "care",
    label: "Care",
    shortLabel: "Care",
    description:
      "Deliberately attending to comfort, regulation, support, growth, or wellbeing can carry relational meaning.",
    channels: directional("Being cared for", "Caring for someone"),
  },
  {
    id: "devotion",
    label: "Devotion",
    shortLabel: "Devotion",
    description:
      "Dedication, loyalty, and relationship-centered significance can make an act or dynamic meaningful beyond its practical purpose.",
    channels: directional("Receiving devotion", "Expressing devotion"),
  },
  {
    id: "ritual_significance",
    label: "Ritual Significance",
    shortLabel: "Ritual",
    description: "Repeated gestures, routines, symbols, or ceremonies can carry meaning beyond practical purpose.",
    channels: {},
  },
  {
    id: "playful_resistance",
    label: "Playful Resistance",
    shortLabel: "Resistance",
    description:
      "Negotiated pushback, teasing, resistance, or challenge can make an interaction more playful and interactive.",
    channels: directional("Meeting playful resistance", "Offering playful resistance"),
  },
  {
    id: "objectification",
    label: "Objectification",
    shortLabel: "Object",
    description:
      "Consensual role or function framing that deliberately reduces ordinary identity can itself be appealing.",
    channels: directional("Being objectified", "Objectifying someone"),
  },
  {
    id: "guidance_shaping",
    label: "Guidance / Shaping",
    shortLabel: "Guidance",
    description:
      "Teaching, correction, coaching, development, or deliberate behavioral shaping can carry relational meaning.",
    channels: directional("Being guided / shaped", "Guiding / shaping"),
  },
  {
    id: "younger_headspace",
    label: "Younger Headspace",
    shortLabel: "Younger",
    description: "Feeling younger, smaller, or less anchored to an everyday adult role can be immersive.",
    channels: {},
  },
  {
    id: "primal_embodiment",
    label: "Primal Embodiment",
    shortLabel: "Primal",
    description: "Feeling more instinctive, feral, physical, or body-language driven can be immersive.",
    channels: {},
  },
  {
    id: "pursuit",
    label: "Pursuit",
    shortLabel: "Pursuit",
    description: "Consensual pursuit, chase, tracking, closing distance, or capture can itself be part of the appeal.",
    channels: directional("Being pursued", "Pursuing"),
  },
  {
    id: "restraint",
    label: "Restraint",
    shortLabel: "Restraint",
    description: "Deliberate physical restraint, binding, holding, or immobilization can itself be appealing independent of pain.",
    channels: directional("Being restrained", "Restraining someone"),
  },
  {
    id: "movement_restriction",
    label: "Movement Restriction",
    shortLabel: "Movement",
    description: "Reduced range or freedom of movement can itself be an appealing physical feature.",
    channels: {},
  },
  {
    id: "positioning",
    label: "Positioning",
    shortLabel: "Positioning",
    description: "Deliberately placing or maintaining a body in a particular posture or position can itself be appealing.",
    channels: directional("Being positioned", "Positioning another person"),
  },
  {
    id: "constraint_control",
    label: "Constraint Control",
    shortLabel: "Constraint",
    description: "Negotiated authority expressed through physical limits on freedom can carry psychological appeal beyond restraint alone.",
    channels: directional("Having freedom physically controlled", "Controlling physical freedom"),
  },
  {
    id: "discipline",
    label: "Discipline",
    shortLabel: "Discipline",
    description: "Agreed correction or consequences can carry relational or psychological meaning even when pain is not involved.",
    channels: directional("Receiving discipline", "Giving discipline"),
  },
  {
    id: "accountability",
    label: "Accountability",
    shortLabel: "Accountability",
    description: "Expectations having meaningful and consistent follow-through can deepen a structured interaction or dynamic.",
    channels: directional("Being held accountable", "Holding someone accountable"),
  },
  {
    id: "anticipation",
    label: "Anticipation",
    shortLabel: "Anticipation",
    description: "Waiting, suspense, or knowing an experience is coming can be part of the appeal.",
    channels: {},
  },
  {
    id: "escape_containment",
    label: "Escape / Containment",
    shortLabel: "Escape",
    description: "Consensual struggle between escape attempts and containment within agreed restraint can add an interactive physical challenge.",
    channels: directional("Testing containment / trying to get free", "Maintaining containment / preventing escape"),
  },
  {
    id: "pain",
    label: "Pain",
    shortLabel: "Pain",
    description: "Consensual pain can be intrinsically appealing rather than merely tolerated as a means to another effect.",
    channels: directional("Receiving pain", "Causing pain"),
  },
  {
    id: "physical_intensity",
    label: "Physical Intensity",
    shortLabel: "Intensity",
    description: "A physically strong or overwhelming experience can itself be appealing even when pain is not the main point.",
    channels: directional("Receiving intensity", "Creating intensity"),
  },
  {
    id: "endurance",
    label: "Endurance",
    shortLabel: "Endurance",
    description: "Sustaining or remaining with physical intensity or discomfort over time can itself be rewarding.",
    channels: directional("Enduring sustained intensity", "Sustaining intensity for someone"),
  },
  {
    id: "challenge",
    label: "Challenge",
    shortLabel: "Challenge",
    description: "Deliberately pushing toward an agreed personal edge can add appeal beyond ordinary intensity.",
    channels: directional("Being pushed toward an edge", "Pushing someone toward an edge"),
  },
  {
    id: "emotional_intensity",
    label: "Emotional Intensity",
    shortLabel: "Emotion",
    description: "A highly charged emotional atmosphere can be an important part of an intense experience.",
    channels: {},
  },
  {
    id: "exhibitionism",
    label: "Exhibitionism",
    shortLabel: "Exhibitionism",
    description: "Appeal in deliberately being seen, displayed, watched, or performing for consenting observers.",
    channels: {},
  },
  {
    id: "voyeurism",
    label: "Voyeurism",
    shortLabel: "Voyeurism",
    description: "Appeal in deliberately watching or visually observing consenting others.",
    channels: {},
  },
  {
    id: "arousal_control",
    label: "Arousal Control",
    shortLabel: "Arousal",
    description: "Deliberate control over arousal, stimulation, release, orgasm, denial, permission, or access to sexual response can itself be part of the appeal.",
    channels: directional("Having arousal controlled", "Controlling another person's arousal"),
  },
  {
    id: "degradation_humiliation",
    label: "Degradation / Humiliation",
    shortLabel: "Degradation",
    description: "Consensual lowering of dignity, status, positive evaluation, or social presentation can carry psychological appeal.",
    channels: directional("Being degraded / humiliated", "Degrading / humiliating"),
  },
];

const definitionById = new Map(canonicalSignalDefinitions.map((item) => [item.id, item]));

export function getCanonicalSignalDefinition(id: CanonicalSignalId) {
  return definitionById.get(id);
}

export function signalSupportsChannel(
  signalId: CanonicalSignalId,
  channel: Exclude<SignalChannel, "overall">,
) {
  return Boolean(definitionById.get(signalId)?.channels[channel]);
}

type LegacyConceptTarget = {
  signalId: CanonicalSignalId;
  inherentChannel?: Exclude<SignalChannel, "overall">;
};

export const legacySignalConceptTargets: Readonly<Record<LegacySignalId, LegacyConceptTarget>> = {
  receiving_control: { signalId: "control", inherentChannel: "receiving" },
  giving_control: { signalId: "control", inherentChannel: "giving" },
  responsibility_transfer: { signalId: "responsibility", inherentChannel: "giving" },
  service: { signalId: "service" },
  obedience: { signalId: "obedience" },
  structure: { signalId: "structure" },
  ownership_symbolism: { signalId: "ownership_symbolism" },
  praise_approval: { signalId: "praise_approval" },
  autonomy: { signalId: "autonomy" },
  belonging: { signalId: "belonging" },
  role_embodiment: { signalId: "role_embodiment" },
  playfulness: { signalId: "playfulness" },
  care_receiving: { signalId: "care", inherentChannel: "receiving" },
  care_giving: { signalId: "care", inherentChannel: "giving" },
  devotion: { signalId: "devotion" },
  ritual_significance: { signalId: "ritual_significance" },
  playful_resistance: { signalId: "playful_resistance" },
  objectification: { signalId: "objectification" },
  guidance_shaping: { signalId: "guidance_shaping" },
  responsibility_holding: { signalId: "responsibility", inherentChannel: "receiving" },
  younger_headspace: { signalId: "younger_headspace" },
  primal_embodiment: { signalId: "primal_embodiment" },
  pursuit_receiving: { signalId: "pursuit", inherentChannel: "receiving" },
  pursuit_giving: { signalId: "pursuit", inherentChannel: "giving" },
  receiving_restraint: { signalId: "restraint", inherentChannel: "receiving" },
  giving_restraint: { signalId: "restraint", inherentChannel: "giving" },
  movement_restriction: { signalId: "movement_restriction" },
  receiving_positioning: { signalId: "positioning", inherentChannel: "receiving" },
  giving_positioning: { signalId: "positioning", inherentChannel: "giving" },
  receiving_constraint_control: { signalId: "constraint_control", inherentChannel: "receiving" },
  giving_constraint_control: { signalId: "constraint_control", inherentChannel: "giving" },
  receiving_discipline: { signalId: "discipline", inherentChannel: "receiving" },
  giving_discipline: { signalId: "discipline", inherentChannel: "giving" },
  accountability: { signalId: "accountability" },
  anticipation: { signalId: "anticipation" },
  challenge_escape: { signalId: "escape_containment" },
  pain_receiving: { signalId: "pain", inherentChannel: "receiving" },
  pain_giving: { signalId: "pain", inherentChannel: "giving" },
  receiving_intensity: { signalId: "physical_intensity", inherentChannel: "receiving" },
  giving_intensity: { signalId: "physical_intensity", inherentChannel: "giving" },
  receiving_endurance: { signalId: "endurance", inherentChannel: "receiving" },
  giving_endurance: { signalId: "endurance", inherentChannel: "giving" },
  receiving_challenge: { signalId: "challenge", inherentChannel: "receiving" },
  giving_challenge: { signalId: "challenge", inherentChannel: "giving" },
  emotional_intensity: { signalId: "emotional_intensity" },
};

const quizChannelOverrides: Readonly<Record<string, Partial<Record<LegacySignalId, SignalChannel>>>> = {
  "ds-001": { structure: "receiving" },
  "ds-002": { obedience: "giving", structure: "receiving" },
  "ds-004": { service: "giving", obedience: "giving", structure: "receiving" },
  "ds-005": { service: "giving", praise_approval: "receiving" },
  "ds-006": { obedience: "giving", structure: "receiving" },
  "ds-008": { ownership_symbolism: "receiving" },
  "ds-009": { obedience: "giving", praise_approval: "receiving" },
  "ds-010": { service: "giving", praise_approval: "receiving" },
  "ds-013": { structure: "giving" },

  "hs-001": { ownership_symbolism: "receiving" },
  "hs-005": { praise_approval: "receiving" },
  "hs-006": { devotion: "giving", service: "giving" },
  "hs-008": { service: "giving" },
  "hs-009": { structure: "receiving", obedience: "giving" },
  "hs-012": { objectification: "receiving" },
  "hs-014": { guidance_shaping: "giving" },
  "hs-017": { ownership_symbolism: "giving" },
  "hs-018": { guidance_shaping: "giving", structure: "giving" },
  "hs-019": { guidance_shaping: "giving", structure: "giving" },
  "hs-020": { objectification: "giving" },
  "hs-021": { structure: "giving" },
  "hs-022": { devotion: "receiving" },
  "hs-027": { playful_resistance: "giving" },
  "hs-030": { playful_resistance: "giving" },

  "bd-003": { obedience: "giving" },
  "bd-006": { challenge_escape: "receiving", playful_resistance: "giving" },
  "bd-007": { challenge_escape: "receiving" },
  "bd-011": { structure: "giving" },
  "bd-012": { guidance_shaping: "giving" },
  "bd-014": { challenge_escape: "giving", playful_resistance: "receiving" },
  "bd-016": { accountability: "receiving" },
  "bd-017": { accountability: "receiving", obedience: "giving" },
  "bd-018": { accountability: "receiving" },
  "bd-019": { accountability: "giving" },
  "bd-020": { guidance_shaping: "giving", accountability: "giving" },
  "bd-021": { accountability: "giving" },
  "bd-022": { structure: "receiving" },
  "bd-025": { structure: "receiving", obedience: "giving" },
  "bd-026": { structure: "giving" },
};

export function canonicalQuizSignalRef(
  questionId: string,
  legacySignalId: LegacySignalId,
): Required<CanonicalSignalRef> {
  const target = legacySignalConceptTargets[legacySignalId];
  const requested = quizChannelOverrides[questionId]?.[legacySignalId];
  const channel = requested ?? target.inherentChannel ?? "overall";

  return {
    signalId: target.signalId,
    channel:
      channel !== "overall" && !signalSupportsChannel(target.signalId, channel)
        ? "overall"
        : channel,
  };
}

export function canonicalExplicitCatalogSignalRef(
  legacySignalId: LegacySignalId,
  context: CatalogPreferenceContext,
): Required<CanonicalSignalRef> | null {
  const target = legacySignalConceptTargets[legacySignalId];

  if (context === "overall") {
    return { signalId: target.signalId, channel: "overall" };
  }

  if (target.inherentChannel && target.inherentChannel !== context) {
    return null;
  }

  return {
    signalId: target.signalId,
    channel: signalSupportsChannel(target.signalId, context) ? context : "overall",
  };
}

export function canonicalPairwiseSignalRef(
  legacySignalId: LegacySignalId,
): Required<CanonicalSignalRef> {
  const target = legacySignalConceptTargets[legacySignalId];
  return {
    signalId: target.signalId,
    channel: target.inherentChannel ?? "overall",
  };
}

export function canonicalSignalKey(ref: Required<CanonicalSignalRef>) {
  return `${ref.signalId}::${ref.channel}` as const;
}
