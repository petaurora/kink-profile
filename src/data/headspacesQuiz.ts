import type { SignalId, WeightedQuestion } from "./signals";

export type ComposedDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  weights: Partial<Record<SignalId, number>>;
};

export const headspaceSignalIds: SignalId[] = [
  "receiving_control",
  "giving_control",
  "responsibility_transfer",
  "service",
  "obedience",
  "structure",
  "ownership_symbolism",
  "praise_approval",
  "autonomy",
  "belonging",
  "role_embodiment",
  "playfulness",
  "care_receiving",
  "care_giving",
  "devotion",
  "ritual_significance",
  "playful_resistance",
  "objectification",
  "guidance_shaping",
  "responsibility_holding",
  "younger_headspace",
  "primal_embodiment",
  "pursuit_receiving",
  "pursuit_giving",
];

export const dynamicModes: ComposedDefinition[] = [
  {
    id: "nurtured_play",
    label: "Nurtured Play",
    shortLabel: "Nurtured",
    description:
      "Playfulness, role immersion, belonging, care, and warm approval combine into a softer or more instinctive relational mode.",
    weights: {
      role_embodiment: 1,
      playfulness: 0.9,
      care_receiving: 0.7,
      belonging: 0.6,
      praise_approval: 0.4,
    },
  },
  {
    id: "devotion_mode",
    label: "Devotion",
    shortLabel: "Devotion",
    description:
      "Dedication, belonging, ritual, service, and relationship meaning make commitment itself part of the experience.",
    weights: {
      devotion: 1,
      belonging: 0.8,
      ritual_significance: 0.7,
      service: 0.5,
      ownership_symbolism: 0.4,
    },
  },
  {
    id: "service_mode",
    label: "Service",
    shortLabel: "Service",
    description:
      "Usefulness and contribution feel relationally meaningful rather than merely practical.",
    weights: {
      service: 1,
      devotion: 0.5,
      role_embodiment: 0.4,
      praise_approval: 0.3,
    },
  },
  {
    id: "protocol_mode",
    label: "Protocol",
    shortLabel: "Protocol",
    description:
      "Formality, ritual, expectations, and behavioral structure make a dynamic feel intentional.",
    weights: {
      ritual_significance: 1,
      structure: 1,
      obedience: 0.5,
      role_embodiment: 0.3,
    },
  },
  {
    id: "surrender_mode",
    label: "Surrender",
    shortLabel: "Surrender",
    description:
      "Chosen release of direction, responsibility, or decision load creates a distinct sense of letting go.",
    weights: {
      responsibility_transfer: 1,
      receiving_control: 0.8,
      role_embodiment: 0.4,
      care_receiving: 0.3,
    },
  },
  {
    id: "playful_resistance_mode",
    label: "Playful Resistance",
    shortLabel: "Resistance",
    description:
      "Teasing, negotiated pushback, challenge, and interactive authority make power exchange feel lively.",
    weights: {
      playful_resistance: 1,
      playfulness: 0.7,
      receiving_control: 0.3,
      autonomy: 0.2,
    },
  },
  {
    id: "objectification_mode",
    label: "Objectification",
    shortLabel: "Object",
    description:
      "Consensual role/function framing and deliberate reduction of ordinary identity can create immersion.",
    weights: {
      objectification: 1,
      role_embodiment: 0.7,
      receiving_control: 0.3,
      ownership_symbolism: 0.3,
    },
  },
  {
    id: "caretaking_mode",
    label: "Caretaking",
    shortLabel: "Caretaking",
    description:
      "Holding responsibility for another person's comfort, direction, or growth feels meaningful.",
    weights: {
      care_giving: 1,
      responsibility_holding: 0.9,
      giving_control: 0.4,
      guidance_shaping: 0.3,
    },
  },
  {
    id: "authority_mode",
    label: "Authority",
    shortLabel: "Authority",
    description:
      "Directing, setting the tone, and being deliberately followed creates a meaningful position of authority.",
    weights: {
      giving_control: 1,
      responsibility_holding: 0.6,
      structure: 0.3,
    },
  },
  {
    id: "claiming_mode",
    label: "Claiming",
    shortLabel: "Claiming",
    description:
      "Consensual claiming, belonging, commitment, and responsibility carry strong giving-side meaning.",
    weights: {
      ownership_symbolism: 1,
      giving_control: 0.6,
      belonging: 0.5,
      responsibility_holding: 0.5,
    },
  },
  {
    id: "training_mode",
    label: "Training / Shaping",
    shortLabel: "Training",
    description:
      "Teaching, correcting, developing, and deliberately shaping behavior can make guidance part of the dynamic.",
    weights: {
      guidance_shaping: 1,
      structure: 0.6,
      giving_control: 0.5,
      responsibility_holding: 0.4,
    },
  },
  {
    id: "primal_mode",
    label: "Primal / Feral",
    shortLabel: "Primal",
    description:
      "Instinct, body-language, physical immediacy, and stepping outside ordinary social roles create a more feral or primal mode.",
    weights: {
      primal_embodiment: 1,
      role_embodiment: 0.5,
      playfulness: 0.2,
    },
  },
];

export const roleHeadspaces: ComposedDefinition[] = [
  {
    id: "pet",
    label: "Pet",
    shortLabel: "Pet",
    description:
      "A pet headspace blends belonging, immersive role embodiment, playfulness, care, praise, and consensual ownership symbolism.",
    weights: {
      belonging: 1,
      role_embodiment: 0.9,
      playfulness: 0.8,
      care_receiving: 0.7,
      ownership_symbolism: 0.6,
      praise_approval: 0.4,
    },
  },
  {
    id: "slave",
    label: "Slave",
    shortLabel: "Slave",
    description:
      "A slave-oriented headspace emphasizes deep chosen surrender, obedience, service, ownership meaning, and sustained structure.",
    weights: {
      responsibility_transfer: 1,
      obedience: 0.9,
      service: 0.8,
      ownership_symbolism: 0.8,
      structure: 0.6,
      devotion: 0.5,
      receiving_control: 0.5,
    },
  },
  {
    id: "little",
    label: "Little",
    shortLabel: "Little",
    description:
      "A little headspace combines a younger role, nurturance, reduced responsibility, playfulness, praise, and immersive role shifting.",
    weights: {
      younger_headspace: 1,
      care_receiving: 0.8,
      role_embodiment: 0.8,
      responsibility_transfer: 0.6,
      playfulness: 0.6,
      praise_approval: 0.5,
    },
  },
  {
    id: "middle",
    label: "Middle",
    shortLabel: "Middle",
    description:
      "A middle headspace keeps a younger or youthful role while preserving more independence, opinions, competence, and playful agency.",
    weights: {
      younger_headspace: 0.9,
      role_embodiment: 0.7,
      playfulness: 0.7,
      autonomy: 0.7,
      care_receiving: 0.4,
      playful_resistance: 0.3,
    },
  },
  {
    id: "brat",
    label: "Brat",
    shortLabel: "Brat",
    description:
      "A brat headspace centers negotiated resistance, playfulness, agency, teasing, and making authority interactive.",
    weights: {
      playful_resistance: 1,
      playfulness: 0.8,
      autonomy: 0.5,
      receiving_control: 0.4,
      praise_approval: 0.2,
    },
  },
  {
    id: "prey",
    label: "Prey",
    shortLabel: "Prey",
    description:
      "A prey headspace centers consensual pursuit, evasion, being tracked or caught, and an instinctive role shift toward being the one hunted.",
    weights: {
      pursuit_receiving: 1,
      primal_embodiment: 0.9,
      role_embodiment: 0.5,
      receiving_control: 0.3,
      playful_resistance: 0.2,
    },
  },
  {
    id: "object",
    label: "Object",
    shortLabel: "Object",
    description:
      "An object headspace centers consensual reduction into a role, purpose, function, or thing-like identity, with immersion coming from being treated less like the ordinary everyday self.",
    weights: {
      objectification: 1,
      role_embodiment: 0.8,
      receiving_control: 0.4,
    },
  },
  {
    id: "owner_handler",
    label: "Owner / Handler",
    shortLabel: "Owner",
    description:
      "An owner or handler role blends consensual claiming with responsibility, care, guidance, structure, and deliberate teaching or shaping over time.",
    weights: {
      ownership_symbolism: 1,
      guidance_shaping: 1,
      responsibility_holding: 0.7,
      care_giving: 0.6,
      structure: 0.6,
      giving_control: 0.5,
    },
  },
  {
    id: "caregiver",
    label: "Caregiver",
    shortLabel: "Caregiver",
    description:
      "A caregiver role centers nurturance, holding responsibility, guidance, and creating a safe or supported relational space.",
    weights: {
      care_giving: 1,
      responsibility_holding: 0.8,
      guidance_shaping: 0.4,
      structure: 0.2,
    },
  },
  {
    id: "brat_tamer",
    label: "Brat Tamer",
    shortLabel: "Tamer",
    description:
      "A brat-tamer role enjoys meeting negotiated resistance with playful authority, direction, and responsive shaping.",
    weights: {
      giving_control: 0.8,
      playful_resistance: 0.7,
      playfulness: 0.5,
      guidance_shaping: 0.4,
      responsibility_holding: 0.3,
    },
  },
  {
    id: "predator",
    label: "Predator",
    shortLabel: "Predator",
    description:
      "A predator headspace centers consensual pursuit, tracking, closing distance, catching, and an instinctive role shift toward being the hunter.",
    weights: {
      pursuit_giving: 1,
      primal_embodiment: 0.9,
      role_embodiment: 0.5,
      giving_control: 0.3,
    },
  },
  {
    id: "master_mistress",
    label: "Master / Mistress",
    shortLabel: "Master",
    description:
      "This authority role emphasizes sustained negotiated control, responsibility, structure, and ownership meaning rather than momentary leadership alone.",
    weights: {
      giving_control: 1,
      responsibility_holding: 0.8,
      ownership_symbolism: 0.6,
      structure: 0.5,
      guidance_shaping: 0.3,
    },
  },
];

export const selfPositionedRoleHeadspaceIds = [
  "pet",
  "slave",
  "little",
  "middle",
  "brat",
  "prey",
  "object",
] as const;

export const partnerPositionedRoleHeadspaceIds = [
  "owner_handler",
  "caregiver",
  "brat_tamer",
  "predator",
  "master_mistress",
] as const;

export const headspaceQuestions: WeightedQuestion[] = [
  {
    id: "hs-001",
    prompt: "Feeling that I meaningfully belong with or to a trusted partner can deepen a dynamic for me.",
    weights: { belonging: 1, ownership_symbolism: 0.4 },
  },
  {
    id: "hs-002",
    prompt: "Slipping into a distinct role can change how I think, feel, or behave in a way I enjoy.",
    weights: { role_embodiment: 1 },
  },
  {
    id: "hs-003",
    prompt: "Playfulness, silliness, or a more instinctive mode can make a role feel especially immersive.",
    weights: { playfulness: 1, role_embodiment: 0.4 },
  },
  {
    id: "hs-004",
    prompt: "Being deliberately looked after or guided by someone I trust can make me feel more settled in a dynamic.",
    weights: { care_receiving: 1, responsibility_transfer: 0.3 },
  },
  {
    id: "hs-005",
    prompt: "Warm approval or recognition can make a relational role feel especially rewarding.",
    weights: { praise_approval: 0.8, belonging: 0.3 },
  },
  {
    id: "hs-006",
    prompt: "Doing something because it expresses dedication to a partner can give an ordinary act extra meaning.",
    weights: { devotion: 1, service: 0.4 },
  },
  {
    id: "hs-007",
    prompt: "Small repeated rituals can become emotionally important to me even when they have little practical purpose.",
    weights: { ritual_significance: 1, structure: 0.3 },
  },
  {
    id: "hs-008",
    prompt: "Being useful can feel like part of my role in a relationship, not just something helpful I happened to do.",
    weights: { service: 1, role_embodiment: 0.5 },
  },
  {
    id: "hs-009",
    prompt: "Formal manners, rules, or expected ways of behaving can make a dynamic feel more intentional.",
    weights: { structure: 0.8, ritual_significance: 0.7, obedience: 0.4 },
  },
  {
    id: "hs-010",
    prompt: "I can enjoy the internal feeling of stopping myself from steering and letting someone trusted hold the direction.",
    weights: { responsibility_transfer: 1, receiving_control: 0.8 },
  },
  {
    id: "hs-011",
    prompt: "Negotiated teasing or pushback can make authority more fun because it gives us something to play against.",
    weights: { playful_resistance: 1, playfulness: 0.7 },
  },
  {
    id: "hs-012",
    prompt: "In the right consensual context, being reduced to a role, purpose, or function can feel immersively appealing.",
    weights: { objectification: 1, role_embodiment: 0.5, receiving_control: 0.2 },
  },
  {
    id: "hs-013",
    prompt: "Being responsible for another person's comfort or sense of being held can feel deeply rewarding.",
    weights: { care_giving: 1, responsibility_holding: 0.8 },
  },
  {
    id: "hs-014",
    prompt: "I enjoy showing someone how to do something in the way I want while helping them improve.",
    weights: { guidance_shaping: 1, care_giving: 0.4 },
  },
  {
    id: "hs-015",
    prompt: "I enjoy being the person whose direction sets the tone when another person wants me in that position.",
    weights: { giving_control: 1, responsibility_holding: 0.4 },
  },
  {
    id: "hs-016",
    prompt: "Knowing another person has chosen to follow my direction can make authority feel emotionally significant.",
    weights: { giving_control: 0.8, responsibility_holding: 0.5 },
  },
  {
    id: "hs-017",
    prompt: "Consensually claiming someone or treating them as 'mine' can carry emotional meaning beyond practical control.",
    weights: { ownership_symbolism: 1, responsibility_holding: 0.6, belonging: 0.4 },
  },
  {
    id: "hs-018",
    prompt: "Helping a willing partner practice expectations until they become natural can be satisfying.",
    weights: { guidance_shaping: 1, structure: 0.4 },
  },
  {
    id: "hs-019",
    prompt: "Agreed correction can feel constructive when it helps shape behavior toward a shared expectation.",
    weights: { guidance_shaping: 0.8, giving_control: 0.5, structure: 0.4 },
  },
  {
    id: "hs-020",
    prompt: "In the right negotiated context, defining a partner mainly by a role or function can be appealing.",
    weights: { objectification: 1, giving_control: 0.4 },
  },
  {
    id: "hs-021",
    prompt: "Creating rituals or formal expectations for another person can make my side of a dynamic feel more meaningful.",
    weights: { ritual_significance: 0.8, structure: 0.7, giving_control: 0.4 },
  },
  {
    id: "hs-022",
    prompt: "Receiving someone's deliberate dedication can feel meaningful because of what their commitment represents.",
    weights: { devotion: 0.8, belonging: 0.4, care_receiving: 0.3 },
  },
  {
    id: "hs-023",
    prompt: "Having someone rely on me to hold direction or make the call can feel like a responsibility I want.",
    weights: { responsibility_holding: 1, care_giving: 0.4, giving_control: 0.4 },
  },
  {
    id: "hs-024",
    prompt: "Even in an immersive role, I value knowing which choices remain mine and which ones I deliberately hand over.",
    weights: { autonomy: 1, role_embodiment: 0.3 },
  },
  {
    id: "hs-025",
    prompt: "In the right role, feeling younger, smaller, or less adult than I do in everyday life can be comforting or immersive.",
    weights: { younger_headspace: 1, role_embodiment: 0.5, responsibility_transfer: 0.3 },
  },
  {
    id: "hs-026",
    prompt: "Being cared for in a way that lets me set aside some everyday adult responsibilities can feel appealing.",
    weights: { younger_headspace: 0.7, care_receiving: 0.8, responsibility_transfer: 0.6 },
  },
  {
    id: "hs-027",
    prompt: "A younger or youthful role can appeal to me even when I still want independence, opinions, and room to push back.",
    weights: { younger_headspace: 0.8, autonomy: 0.7, playfulness: 0.5, playful_resistance: 0.3 },
  },
  {
    id: "hs-028",
    prompt: "In the right consensual scene, feeling more instinctive, feral, or driven by body-language than ordinary social rules can be deeply immersive.",
    weights: { primal_embodiment: 1, role_embodiment: 0.4 },
  },
  {
    id: "hs-029",
    prompt: "Being pursued or tracked by a willing partner can make a role feel exciting in a way ordinary power exchange does not.",
    weights: { pursuit_receiving: 1, primal_embodiment: 0.4, role_embodiment: 0.3 },
  },
  {
    id: "hs-030",
    prompt: "Within an agreed scene, the tension of trying to evade someone who intends to catch me can be especially appealing.",
    weights: { pursuit_receiving: 1, primal_embodiment: 0.5, playful_resistance: 0.3 },
  },
  {
    id: "hs-031",
    prompt: "Pursuing or tracking a willing partner can make me feel focused, instinctive, and strongly inside a role.",
    weights: { pursuit_giving: 1, primal_embodiment: 0.5, role_embodiment: 0.3 },
  },
  {
    id: "hs-032",
    prompt: "Within an agreed scene, closing distance and eventually catching a partner who wants to be pursued can be especially appealing.",
    weights: { pursuit_giving: 1, primal_embodiment: 0.4, giving_control: 0.3 },
  },
];

export const headspaceQuestionIds = headspaceQuestions.map((question) => question.id);
