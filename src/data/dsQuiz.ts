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
  "service",
  "obedience",
  "structure",
  "ownership_symbolism",
  "praise_approval",
  "autonomy",
] as const satisfies readonly SignalId[];

export type DsSignalId = (typeof dsSignalIds)[number];
export type DsSignal = SignalDefinition & { id: DsSignalId };
export type DsQuestion = WeightedQuestion;

export const dsSignals = getSignals([...dsSignalIds]) as DsSignal[];

export const dsQuestions: DsQuestion[] = [
  {
    id: "ds-001",
    prompt: "Having a trusted partner make routine choices for me can feel freeing.",
    weights: { receiving_control: 1, responsibility_transfer: 0.8, structure: 0.2 },
  },
  {
    id: "ds-002",
    prompt: "I like being given clear instructions and knowing I'm expected to follow them.",
    weights: { receiving_control: 0.7, obedience: 1, structure: 0.5 },
  },
  {
    id: "ds-003",
    prompt: "In a dynamic, I can enjoy handing over responsibility for what happens next.",
    weights: { receiving_control: 0.8, responsibility_transfer: 1 },
  },
  {
    id: "ds-004",
    prompt:
      "Doing something because a partner expects it of me can be satisfying even when the task itself is ordinary.",
    weights: { service: 0.8, obedience: 0.7, structure: 0.2 },
  },
  {
    id: "ds-005",
    prompt:
      "Anticipating a partner's needs and seeing that it pleased them can feel especially rewarding.",
    weights: { service: 1, praise_approval: 0.5 },
  },
  {
    id: "ds-006",
    prompt: "Standing rules or expectations can make a dynamic feel more meaningful to me.",
    weights: { obedience: 0.6, structure: 1 },
  },
  {
    id: "ds-007",
    prompt:
      "Symbols or rituals that mark an ongoing power dynamic can carry a lot of emotional meaning for me.",
    weights: { structure: 0.5, ownership_symbolism: 1 },
  },
  {
    id: "ds-008",
    prompt:
      "The idea of being explicitly claimed or belonging to a trusted partner can be appealing to me.",
    weights: { receiving_control: 0.5, ownership_symbolism: 1 },
  },
  {
    id: "ds-009",
    prompt: "Being told I did well can make following direction feel especially rewarding.",
    weights: { obedience: 0.5, praise_approval: 1 },
  },
  {
    id: "ds-010",
    prompt: "Being recognized for being useful or serving well can feel especially rewarding.",
    weights: { service: 0.8, praise_approval: 0.8 },
  },
  {
    id: "ds-011",
    prompt:
      "I enjoy being the one who sets direction when another person genuinely wants me to take the lead.",
    weights: { giving_control: 1 },
  },
  {
    id: "ds-012",
    prompt: "Having someone trust me enough to follow my direction can feel deeply rewarding.",
    weights: { giving_control: 1 },
  },
  {
    id: "ds-013",
    prompt: "Creating rules or expectations for a willing partner can be appealing to me.",
    weights: { giving_control: 0.8, structure: 0.8 },
  },
  {
    id: "ds-014",
    prompt:
      "Even in a power dynamic, I want important decisions to remain mine unless I explicitly hand them over.",
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
    prompt: "I prefer power exchange that still leaves me meaningful room to choose how I respond.",
    weights: { autonomy: 1 },
  },
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
