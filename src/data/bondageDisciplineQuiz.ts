import type { SignalId, WeightedQuestion } from "./signals";

export const bondageDisciplineSignalIds: SignalId[] = [
  "receiving_restraint",
  "giving_restraint",
  "movement_restriction",
  "receiving_positioning",
  "giving_positioning",
  "receiving_constraint_control",
  "giving_constraint_control",
  "receiving_discipline",
  "giving_discipline",
  "accountability",
  "anticipation",
  "challenge_escape",
  "structure",
  "ritual_significance",
];

export const bondageRadarSignalIds: SignalId[] = [
  "receiving_restraint",
  "giving_restraint",
  "movement_restriction",
  "receiving_positioning",
  "giving_positioning",
  "receiving_constraint_control",
  "giving_constraint_control",
  "challenge_escape",
  "anticipation",
];

export const disciplineRadarSignalIds: SignalId[] = [
  "receiving_discipline",
  "giving_discipline",
  "accountability",
  "structure",
  "ritual_significance",
  "anticipation",
];

/**
 * Active B&D v2 question bank.
 *
 * Removed v1 questions remain in `legacyBondageDisciplineQuestions` so stored
 * answer maps and exports can still be read, but they are not presented in a
 * new attempt or retake.
 */
export const bondageDisciplineQuestions: WeightedQuestion[] = [
  {
    id: "bd-001",
    prompt:
      "Being physically restrained by someone I trust can feel appealing even when pain is not part of the experience.",
    weights: {
      receiving_restraint: 1,
      movement_restriction: 0.4,
      receiving_control: 0.2,
    },
  },
  {
    id: "bd-002",
    prompt:
      "Having several parts of my movement restricted at once can make restraint feel more immersive.",
    weights: {
      movement_restriction: 1,
      receiving_restraint: 0.8,
      receiving_constraint_control: 0.3,
    },
  },
  {
    id: "bd-003",
    prompt: "Being required to stay in a specific position until I am released can be appealing.",
    weights: {
      receiving_positioning: 1,
      movement_restriction: 0.5,
      obedience: 0.2,
    },
  },
  {
    id: "bd-004",
    prompt:
      "Being deliberately arranged into a posture by a trusted partner can make the sense of control more tangible.",
    weights: {
      receiving_positioning: 1,
      receiving_constraint_control: 0.7,
      receiving_control: 0.3,
    },
  },
  {
    id: "bd-005",
    prompt:
      "Part of the appeal of restraint can be surrendering control of my movement to someone I trust.",
    weights: {
      receiving_constraint_control: 1,
      receiving_restraint: 0.6,
      receiving_control: 0.5,
    },
  },
  {
    id: "bd-006",
    prompt:
      "Testing or struggling against agreed restraint—including trying to get free—can make the experience more exciting for me.",
    weights: {
      challenge_escape: 1,
      receiving_restraint: 0.4,
    },
  },
  {
    id: "bd-008",
    prompt: "Waiting while I know restraint is about to happen can build appealing suspense.",
    weights: {
      anticipation: 1,
      receiving_restraint: 0.3,
    },
  },
  {
    id: "bd-009",
    prompt: "Physically restricting a willing partner's movement can be appealing to me.",
    weights: {
      giving_restraint: 1,
      giving_constraint_control: 0.4,
      giving_control: 0.2,
    },
  },
  {
    id: "bd-010",
    prompt:
      "Securing a willing partner so they cannot freely reposition can make restraint feel more complete.",
    weights: {
      giving_restraint: 0.8,
      movement_restriction: 0.8,
      giving_constraint_control: 0.5,
    },
  },
  {
    id: "bd-011",
    prompt:
      "Placing a willing partner in a specific position and expecting them to maintain it can be appealing.",
    weights: {
      giving_positioning: 1,
      giving_constraint_control: 0.5,
      structure: 0.2,
    },
  },
  {
    id: "bd-012",
    prompt: "Carefully arranging another person's posture or placement can be satisfying in its own right.",
    weights: {
      giving_positioning: 1,
    },
  },
  {
    id: "bd-013",
    prompt:
      "Part of the appeal of restraining someone can be deciding how much physical freedom they have within agreed limits.",
    weights: {
      giving_constraint_control: 1,
      giving_restraint: 0.6,
      giving_control: 0.5,
      responsibility_holding: 0.2,
    },
  },
  {
    id: "bd-014",
    prompt:
      "I can enjoy a willing partner testing or struggling against agreed restraint because it makes containment more interactive.",
    weights: {
      challenge_escape: 1,
      giving_restraint: 0.4,
      playful_resistance: 0.3,
    },
  },
  {
    id: "bd-015",
    prompt:
      "A rule feels more meaningful to me when everyone involved knows what happens if it is not followed.",
    weights: {
      accountability: 1,
      structure: 0.6,
      anticipation: 0.2,
    },
  },
  {
    id: "bd-016",
    prompt:
      "Being held to an agreed consequence can feel grounding or meaningful even when the consequence is not painful.",
    weights: {
      receiving_discipline: 1,
      accountability: 0.8,
      structure: 0.2,
    },
  },
  {
    id: "bd-017",
    prompt:
      "Clear correction from a trusted partner can feel satisfying when it restores an agreed expectation.",
    weights: {
      receiving_discipline: 0.9,
      accountability: 0.6,
      obedience: 0.3,
    },
  },
  {
    id: "bd-019",
    prompt:
      "Administering an agreed consequence can be appealing because it gives an expectation real follow-through.",
    weights: {
      giving_discipline: 1,
      accountability: 0.8,
      responsibility_holding: 0.3,
    },
  },
  {
    id: "bd-020",
    prompt:
      "Helping a willing partner correct their behavior toward an agreed expectation can feel meaningful even when no consequence is needed.",
    weights: {
      guidance_shaping: 1,
      accountability: 0.4,
    },
  },
  {
    id: "bd-021",
    prompt:
      "Choosing a consequence that fits the broken expectation can be more satisfying than simply making it harsh.",
    weights: {
      giving_discipline: 0.8,
      accountability: 0.7,
      responsibility_holding: 0.4,
    },
  },
  {
    id: "bd-022",
    prompt: "Standing rules that shape behavior beyond a single scene can deepen a dynamic for me.",
    weights: {
      structure: 1,
      accountability: 0.5,
      ritual_significance: 0.3,
    },
  },
  {
    id: "bd-023",
    prompt:
      "Formal procedures or rituals around permission, beginning, ending, or transitions can make a dynamic feel more intentional.",
    weights: {
      ritual_significance: 1,
      structure: 0.5,
    },
  },
  {
    id: "bd-024",
    prompt:
      "Knowing in advance that a consequence or correction is coming can build appealing anticipation.",
    weights: {
      anticipation: 1,
      receiving_discipline: 0.4,
    },
  },
  {
    id: "bd-025",
    prompt:
      "Following an agreed sequence or protocol exactly can be satisfying because the form itself matters.",
    weights: {
      ritual_significance: 0.9,
      structure: 0.7,
      obedience: 0.3,
    },
  },
  {
    id: "bd-026",
    prompt:
      "Creating a specific procedure or protocol for a willing partner can make structure feel more deliberate and meaningful.",
    weights: {
      ritual_significance: 0.9,
      structure: 0.7,
      giving_control: 0.2,
      responsibility_holding: 0.2,
    },
  },
  {
    id: "bd-027",
    prompt:
      "Being trusted with the responsibility for a restrained partner's safety and physical freedom can make restraint especially meaningful to me.",
    weights: {
      responsibility_holding: 1,
      giving_restraint: 0.4,
      giving_constraint_control: 0.2,
    },
  },
  {
    id: "bd-028",
    prompt:
      "Having a trusted partner deliberately limit what I can see, hear, or say can make the sense of control more immersive.",
    weights: {
      receiving_constraint_control: 1,
      receiving_control: 0.4,
    },
  },
  {
    id: "bd-029",
    prompt:
      "The visual form and composition of bondage can make it appealing to me even when restriction itself is not the main point.",
    weights: {
      ritual_significance: 1,
      receiving_positioning: 0.6,
      receiving_restraint: 0.2,
    },
  },
];

/**
 * Questions removed from the active bank but retained as compatibility input
 * for profiles/exports that still contain their answer IDs.
 */
export const legacyBondageDisciplineQuestions: WeightedQuestion[] = [
  {
    id: "bd-007",
    prompt:
      "The possibility of trying to get free, even when I may not succeed, can make restraint more exciting.",
    weights: {
      challenge_escape: 0.9,
      anticipation: 0.6,
      receiving_restraint: 0.3,
    },
  },
  {
    id: "bd-018",
    prompt:
      "A non-painful corrective task or consequence can still feel strongly like discipline to me.",
    weights: {
      receiving_discipline: 1,
      accountability: 0.5,
      structure: 0.3,
    },
  },
];

export const bondageDisciplineQuestionIds = bondageDisciplineQuestions.map(
  (question) => question.id,
);

export const legacyBondageDisciplineQuestionIds = legacyBondageDisciplineQuestions.map(
  (question) => question.id,
);
