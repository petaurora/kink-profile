import {
  getSignals,
  type SignalDefinition,
  type SignalId,
  type WeightedQuestion,
} from "./signals";

export const dsSignalIds = [
  "receiving_control",
  "giving_control",
  "responsibility_transfer",
  "responsibility_holding",
  "service",
  "obedience",
  "structure",
  "ownership_symbolism",
  "praise_approval",
  "autonomy",
  "devotion",
  "ritual_significance",
] as const satisfies readonly SignalId[];

export type DsSignalId = (typeof dsSignalIds)[number];
export type DsSignal = SignalDefinition & { id: DsSignalId };
export type DsQuestion = WeightedQuestion;

export const dsSignals = getSignals([...dsSignalIds]) as DsSignal[];

/**
 * Active D/s v2 question bank.
 *
 * Removed v1 questions remain in `legacyDsQuestions` so stored answer maps
 * and exports can still be read, but they are not presented in a new attempt
 * or retake.
 */
export const dsQuestions: DsQuestion[] = [
  {
    id: "ds-001",
    prompt: "Having a trusted partner make routine choices for me can feel freeing.",
    weights: { receiving_control: 1, responsibility_transfer: 0.8 },
  },
  {
    id: "ds-002",
    prompt: "I like being given clear instructions and knowing I'm expected to follow them.",
    weights: { obedience: 1, receiving_control: 0.7 },
  },
  {
    id: "ds-003",
    prompt:
      "Deliberately handing over responsibility to someone I trust can make not having to decide feel freeing.",
    weights: { responsibility_transfer: 1, receiving_control: 0.8 },
  },
  {
    id: "ds-004",
    prompt:
      "Doing something because a partner expects it of me can be satisfying even when the task itself is ordinary.",
    weights: { obedience: 1, service: 0.6 },
  },
  {
    id: "ds-005",
    prompt:
      "Anticipating a partner's needs and seeing that it pleased them can feel especially rewarding.",
    weights: { service: 1 },
  },
  {
    id: "ds-006",
    prompt: "Standing rules or expectations can make a dynamic feel more meaningful to me.",
    weights: { structure: 1 },
  },
  {
    id: "ds-007",
    prompt:
      "Repeated rituals that mark or reaffirm a power dynamic can carry a lot of emotional meaning for me.",
    weights: { ritual_significance: 1 },
  },
  {
    id: "ds-008",
    prompt:
      "The idea of being explicitly claimed or belonging to a trusted partner can be appealing to me.",
    weights: { ownership_symbolism: 1 },
  },
  {
    id: "ds-009",
    prompt: "Being told I did well can make following direction feel especially rewarding.",
    weights: { praise_approval: 1, obedience: 0.5 },
  },
  {
    id: "ds-010",
    prompt: "Being recognized for being useful or serving well can feel especially rewarding.",
    weights: { praise_approval: 1, service: 0.6 },
  },
  {
    id: "ds-011",
    prompt:
      "Taking responsibility for setting direction when a willing partner wants me to lead can be deeply satisfying.",
    weights: { giving_control: 1, responsibility_holding: 0.7 },
  },
  {
    id: "ds-012",
    prompt: "Having a willing partner deliberately follow my direction can feel deeply rewarding.",
    weights: { obedience: 1, giving_control: 0.4 },
  },
  {
    id: "ds-013",
    prompt:
      "Creating clear, ongoing rules or expectations for a willing partner can be appealing to me.",
    weights: { structure: 1, giving_control: 0.5 },
  },
  {
    id: "ds-014",
    prompt:
      "Even in a power dynamic, some important decisions need to remain mine unless I explicitly hand them over.",
    weights: { autonomy: 1 },
  },
  {
    id: "ds-015",
    prompt:
      "I can enjoy symbols of commitment or ownership even when they do not involve much practical control.",
    weights: { ownership_symbolism: 1 },
  },
  {
    id: "ds-016",
    prompt:
      "Within agreed rules or direction, having meaningful room to choose how I carry them out matters to me.",
    weights: { autonomy: 1 },
  },
  {
    id: "ds-019",
    prompt:
      "Having a willing partner deliberately place decision-making responsibility in my hands can feel meaningful in its own right.",
    weights: { responsibility_holding: 1 },
  },
  {
    id: "ds-020",
    prompt:
      "Having a willing partner deliberately serve or take care of things for me can feel meaningful in the dynamic.",
    weights: { service: 1 },
  },
  {
    id: "ds-021",
    prompt:
      "Explicitly claiming a willing partner or having them belong to me can feel emotionally meaningful.",
    weights: { ownership_symbolism: 1 },
  },
  {
    id: "ds-022",
    prompt:
      "Expressing admiration, gratitude, or reverence toward a partner I submit to can feel like a meaningful part of the dynamic.",
    weights: { praise_approval: 1, devotion: 0.6 },
  },
];

/**
 * Questions removed from the active bank but retained as compatibility input
 * for profiles/exports that still contain their answer IDs.
 */
export const legacyDsQuestions: DsQuestion[] = [
  {
    id: "ds-017",
    prompt:
      "I can enjoy moments where I do not have to decide because someone I trust has taken responsibility.",
    weights: { receiving_control: 0.8, responsibility_transfer: 1 },
  },
  {
    id: "ds-018",
    prompt:
      "I can enjoy taking charge in some contexts without wanting that role to define every part of the relationship.",
    weights: { giving_control: 0.6, autonomy: 0.8 },
  },
];

export const dsQuestionIds = dsQuestions.map((question) => question.id);
export const legacyDsQuestionIds = legacyDsQuestions.map((question) => question.id);
