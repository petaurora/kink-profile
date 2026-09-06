import type { SignalId, WeightedQuestion } from "./signals";

export const sadismMasochismSignalIds: SignalId[] = [
  "pain_receiving",
  "pain_giving",
  "receiving_intensity",
  "giving_intensity",
  "receiving_endurance",
  "giving_endurance",
  "receiving_challenge",
  "giving_challenge",
  "anticipation",
  "emotional_intensity",
];

export const receivingSmRadarSignalIds: SignalId[] = [
  "pain_receiving",
  "receiving_intensity",
  "receiving_endurance",
  "receiving_challenge",
  "anticipation",
  "emotional_intensity",
];

export const givingSmRadarSignalIds: SignalId[] = [
  "pain_giving",
  "giving_intensity",
  "giving_endurance",
  "giving_challenge",
  "anticipation",
  "emotional_intensity",
];

export const sadismMasochismQuestions: WeightedQuestion[] = [
  {
    id: "sm-001",
    prompt:
      "Consensual pain directed toward me can be appealing even when it is not part of discipline or punishment.",
    weights: { pain_receiving: 1 },
  },
  {
    id: "sm-002",
    prompt:
      "Pain itself can be part of what I want from an intense experience, rather than merely something I tolerate to get another effect.",
    weights: { pain_receiving: 1, receiving_intensity: 0.3 },
  },
  {
    id: "sm-003",
    prompt:
      "A physically strong experience can be appealing to me even when pain is not the main point.",
    weights: { receiving_intensity: 1, pain_receiving: 0.2 },
  },
  {
    id: "sm-004",
    prompt:
      "Increasing physical intensity can make an experience feel more immersive or compelling for me.",
    weights: { receiving_intensity: 1, emotional_intensity: 0.2 },
  },
  {
    id: "sm-005",
    prompt:
      "Staying with sustained physical intensity over time can feel rewarding rather than merely tiring.",
    weights: { receiving_endurance: 1, receiving_intensity: 0.5 },
  },
  {
    id: "sm-006",
    prompt:
      "There can be satisfaction in continuing through an agreed difficult sensation instead of wanting it to end quickly.",
    weights: { receiving_endurance: 1, pain_receiving: 0.3 },
  },
  {
    id: "sm-007",
    prompt:
      "Being consensually pushed toward an agreed personal edge can be exciting in a way ordinary intensity is not.",
    weights: { receiving_challenge: 1, receiving_intensity: 0.5 },
  },
  {
    id: "sm-008",
    prompt:
      "Part of the appeal can be discovering how I respond when an agreed experience becomes genuinely difficult.",
    weights: {
      receiving_challenge: 1,
      receiving_endurance: 0.5,
      emotional_intensity: 0.2,
    },
  },
  {
    id: "sm-009",
    prompt:
      "Knowing in advance that a painful or highly intense experience is coming can build appealing suspense.",
    weights: {
      anticipation: 1,
      pain_receiving: 0.3,
      receiving_intensity: 0.3,
    },
  },
  {
    id: "sm-010",
    prompt:
      "The emotional charge of receiving consensual pain or intensity can be as important to me as the physical sensation.",
    weights: {
      emotional_intensity: 1,
      receiving_intensity: 0.4,
      pain_receiving: 0.2,
    },
  },
  {
    id: "sm-011",
    prompt:
      "I can enjoy pain without needing the experience to become extremely intense.",
    weights: { pain_receiving: 0.9 },
  },
  {
    id: "sm-012",
    prompt:
      "I can enjoy strong physical intensity even when the sensation is only mildly painful or not primarily about pain.",
    weights: { receiving_intensity: 0.9 },
  },
  {
    id: "sm-013",
    prompt:
      "Consensually causing pain to a willing partner can be appealing even when it is not part of discipline or punishment.",
    weights: { pain_giving: 1 },
  },
  {
    id: "sm-014",
    prompt:
      "A willing partner's experience of pain can itself be part of what makes an interaction compelling to me.",
    weights: { pain_giving: 1, giving_intensity: 0.3 },
  },
  {
    id: "sm-015",
    prompt:
      "Creating a physically strong experience for a willing partner can be appealing even when pain is not the main point.",
    weights: { giving_intensity: 1, pain_giving: 0.2 },
  },
  {
    id: "sm-016",
    prompt:
      "Increasing the physical intensity of an agreed experience can make it more compelling for me to give.",
    weights: { giving_intensity: 1, emotional_intensity: 0.2 },
  },
  {
    id: "sm-017",
    prompt:
      "Deliberately sustaining an intense experience for a willing partner over time can be satisfying.",
    weights: { giving_endurance: 1, giving_intensity: 0.5 },
  },
  {
    id: "sm-018",
    prompt:
      "There can be satisfaction in maintaining an agreed difficult experience rather than making it brief.",
    weights: { giving_endurance: 1, pain_giving: 0.3 },
  },
  {
    id: "sm-019",
    prompt:
      "Carefully pushing a willing partner toward an agreed personal edge can be exciting in a way ordinary intensity is not.",
    weights: { giving_challenge: 1, giving_intensity: 0.5 },
  },
  {
    id: "sm-020",
    prompt:
      "Part of the appeal can be seeing how a willing partner responds when an agreed experience becomes genuinely difficult.",
    weights: {
      giving_challenge: 1,
      giving_endurance: 0.5,
      emotional_intensity: 0.2,
    },
  },
  {
    id: "sm-021",
    prompt:
      "Knowing that I will later create a painful or highly intense experience for a willing partner can build appealing suspense.",
    weights: {
      anticipation: 1,
      pain_giving: 0.3,
      giving_intensity: 0.3,
    },
  },
  {
    id: "sm-022",
    prompt:
      "The emotional charge of giving consensual pain or intensity can be as important to me as the physical act itself.",
    weights: {
      emotional_intensity: 1,
      giving_intensity: 0.4,
      pain_giving: 0.2,
    },
  },
  {
    id: "sm-023",
    prompt:
      "I can enjoy causing agreed pain without needing the experience to become extremely intense.",
    weights: { pain_giving: 0.9 },
  },
  {
    id: "sm-024",
    prompt:
      "I can enjoy creating strong physical intensity even when the experience is only mildly painful or not primarily about pain.",
    weights: { giving_intensity: 0.9 },
  },
  {
    id: "sm-025",
    prompt:
      "The waiting and buildup before an intense experience can be an important part of the appeal for me.",
    weights: { anticipation: 1, emotional_intensity: 0.3 },
  },
  {
    id: "sm-026",
    prompt:
      "A highly charged emotional atmosphere can make an intense experience more compelling even when the physical intensity is moderate.",
    weights: { emotional_intensity: 1 },
  },
];

export const sadismMasochismQuestionIds = sadismMasochismQuestions.map(
  (question) => question.id,
);
