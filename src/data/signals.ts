export type SignalId =
  | "receiving_control"
  | "giving_control"
  | "responsibility_transfer"
  | "service"
  | "obedience"
  | "structure"
  | "ownership_symbolism"
  | "praise_approval"
  | "autonomy"
  | "belonging"
  | "role_embodiment"
  | "playfulness"
  | "care_receiving"
  | "care_giving"
  | "devotion"
  | "ritual_significance"
  | "playful_resistance"
  | "objectification"
  | "guidance_shaping"
  | "responsibility_holding"
  | "younger_headspace"
  | "primal_embodiment"
  | "pursuit_receiving"
  | "pursuit_giving"
  | "receiving_restraint"
  | "giving_restraint"
  | "movement_restriction"
  | "receiving_positioning"
  | "giving_positioning"
  | "receiving_constraint_control"
  | "giving_constraint_control"
  | "receiving_discipline"
  | "giving_discipline"
  | "accountability"
  | "anticipation"
  | "challenge_escape"
  | "pain_receiving"
  | "pain_giving"
  | "receiving_intensity"
  | "giving_intensity"
  | "receiving_endurance"
  | "giving_endurance"
  | "receiving_challenge"
  | "giving_challenge"
  | "emotional_intensity";

export type SignalDefinition = {
  id: SignalId;
  label: string;
  shortLabel: string;
  description: string;
};

export type WeightedQuestion = {
  id: string;
  prompt: string;
  weights: Partial<Record<SignalId, number>>;
};

export const signalDefinitions: SignalDefinition[] = [
  {
    id: "receiving_control",
    label: "Receiving Control",
    shortLabel: "Receive",
    description: "Trusted direction and having someone else steer choices or the flow of an interaction can feel rewarding.",
  },
  {
    id: "giving_control",
    label: "Giving Control",
    shortLabel: "Give",
    description: "Taking the lead, setting direction, or exercising negotiated authority can feel rewarding.",
  },
  {
    id: "responsibility_transfer",
    label: "Responsibility Transfer",
    shortLabel: "Transfer",
    description: "Deliberately placing decision responsibility with someone you trust can feel relieving or meaningful.",
  },
  {
    id: "service",
    label: "Service",
    shortLabel: "Service",
    description: "Usefulness, attending to needs, completing tasks, or contributing for a partner can feel fulfilling.",
  },
  {
    id: "obedience",
    label: "Obedience",
    shortLabel: "Obey",
    description: "Receiving a clear direction and intentionally following it can be satisfying in its own right.",
  },
  {
    id: "structure",
    label: "Structure",
    shortLabel: "Structure",
    description: "Defined expectations, rules, routines, consistency, or an explicit framework can make a dynamic feel better.",
  },
  {
    id: "ownership_symbolism",
    label: "Ownership Symbolism",
    shortLabel: "Ownership",
    description: "Consensual belonging, claiming, commitment symbols, or ownership language can carry emotional meaning.",
  },
  {
    id: "praise_approval",
    label: "Praise / Approval",
    shortLabel: "Praise",
    description: "Recognition, approval, reassurance, or being told you did well can make an experience more rewarding.",
  },
  {
    id: "autonomy",
    label: "Autonomy",
    shortLabel: "Autonomy",
    description: "Keeping meaningful personal choice and deciding what authority you deliberately delegate can matter strongly.",
  },
  {
    id: "belonging",
    label: "Belonging",
    shortLabel: "Belonging",
    description: "Feeling meaningfully connected, included, or like you belong with or to someone can deepen a dynamic.",
  },
  {
    id: "role_embodiment",
    label: "Role Embodiment",
    shortLabel: "Role",
    description: "Slipping into a distinct relational role or mode can change how an interaction feels internally.",
  },
  {
    id: "playfulness",
    label: "Playfulness",
    shortLabel: "Play",
    description: "Silliness, spontaneity, creature-like play, or a lighter emotional mode can be part of the appeal.",
  },
  {
    id: "care_receiving",
    label: "Receiving Care",
    shortLabel: "Receive care",
    description: "Being looked after, soothed, guided, or deliberately cared for can feel meaningful inside a dynamic.",
  },
  {
    id: "care_giving",
    label: "Giving Care",
    shortLabel: "Give care",
    description: "Looking after another person's comfort, regulation, growth, or wellbeing can feel meaningful inside a dynamic.",
  },
  {
    id: "devotion",
    label: "Devotion",
    shortLabel: "Devotion",
    description: "Dedication, emotional significance, loyalty, or doing something because the relationship itself gives it meaning can be rewarding.",
  },
  {
    id: "ritual_significance",
    label: "Ritual Significance",
    shortLabel: "Ritual",
    description: "Repeated gestures, routines, symbols, or ceremonies can carry meaning beyond their practical purpose.",
  },
  {
    id: "playful_resistance",
    label: "Playful Resistance",
    shortLabel: "Resistance",
    description: "Negotiated teasing, pushback, challenge, or making authority interactive can be part of the fun.",
  },
  {
    id: "objectification",
    label: "Objectification",
    shortLabel: "Object",
    description: "Consensual role or function framing that deliberately reduces ordinary identity can be appealing.",
  },
  {
    id: "guidance_shaping",
    label: "Guidance / Shaping",
    shortLabel: "Guidance",
    description: "Teaching, correcting, coaching, developing, or deliberately shaping behavior can be rewarding.",
  },
  {
    id: "responsibility_holding",
    label: "Holding Responsibility",
    shortLabel: "Hold",
    description: "Being trusted to hold direction, boundaries, decisions, or another person's experience can feel meaningful.",
  },
  {
    id: "younger_headspace",
    label: "Younger Headspace",
    shortLabel: "Younger",
    description: "Feeling younger, smaller, or less anchored to an everyday adult role can be comforting, playful, or immersive.",
  },
  {
    id: "primal_embodiment",
    label: "Primal Embodiment",
    shortLabel: "Primal",
    description: "Feeling more instinctive, feral, physical, or driven by body-language than ordinary social roles can be immersive.",
  },
  {
    id: "pursuit_receiving",
    label: "Being Pursued",
    shortLabel: "Pursued",
    description: "Being tracked, chased, cornered, or caught within an agreed scene can feel exciting or immersive.",
  },
  {
    id: "pursuit_giving",
    label: "Pursuing",
    shortLabel: "Pursuit",
    description: "Tracking, chasing, cornering, or catching a willing partner within an agreed scene can feel exciting or immersive.",
  },
  {
    id: "receiving_restraint",
    label: "Receiving Restraint",
    shortLabel: "Receive restraint",
    description: "Being physically bound, held, immobilized, or otherwise constrained can be appealing independent of pain.",
  },
  {
    id: "giving_restraint",
    label: "Giving Restraint",
    shortLabel: "Give restraint",
    description: "Physically binding, holding, immobilizing, or constraining a willing partner can be appealing independent of pain.",
  },
  {
    id: "movement_restriction",
    label: "Movement Restriction",
    shortLabel: "Movement",
    description: "Reduced range or freedom of movement can itself be an appealing physical feature of restraint.",
  },
  {
    id: "receiving_positioning",
    label: "Receiving Positioning",
    shortLabel: "Be positioned",
    description: "Being deliberately placed or kept in a particular posture or position can be appealing.",
  },
  {
    id: "giving_positioning",
    label: "Giving Positioning",
    shortLabel: "Position",
    description: "Arranging or requiring a willing partner to maintain a particular posture or position can be appealing.",
  },
  {
    id: "receiving_constraint_control",
    label: "Receiving Constraint Control",
    shortLabel: "Receive constraint",
    description: "Another person's negotiated authority being expressed through physical limits can carry psychological appeal.",
  },
  {
    id: "giving_constraint_control",
    label: "Giving Constraint Control",
    shortLabel: "Give constraint",
    description: "Expressing negotiated authority through control of a willing partner's physical freedom can carry psychological appeal.",
  },
  {
    id: "receiving_discipline",
    label: "Receiving Discipline",
    shortLabel: "Receive discipline",
    description: "Agreed correction or consequences directed toward you can feel meaningful even when pain is not involved.",
  },
  {
    id: "giving_discipline",
    label: "Giving Discipline",
    shortLabel: "Give discipline",
    description: "Administering agreed correction or consequences can feel meaningful even when pain is not involved.",
  },
  {
    id: "accountability",
    label: "Accountability",
    shortLabel: "Accountability",
    description: "Expectations having meaningful and consistent follow-through can deepen a structured dynamic.",
  },
  {
    id: "anticipation",
    label: "Anticipation",
    shortLabel: "Anticipation",
    description: "Waiting, suspense, or knowing restraint, correction, or ritual is coming can be part of the appeal.",
  },
  {
    id: "challenge_escape",
    label: "Challenge / Escape",
    shortLabel: "Challenge",
    description: "Testing, struggling against, escaping, catching, or containing agreed restraint can add interactive challenge.",
  },
  {
    id: "pain_receiving",
    label: "Pain Receiving",
    shortLabel: "Pain receive",
    description: "Consensual pain directed toward you can be intrinsically appealing rather than merely tolerated for another effect.",
  },
  {
    id: "pain_giving",
    label: "Pain Giving",
    shortLabel: "Pain give",
    description: "Consensually causing pain to a willing partner can be intrinsically appealing rather than only a means to another effect.",
  },
  {
    id: "receiving_intensity",
    label: "Receiving Intensity",
    shortLabel: "Intensity receive",
    description: "A physically strong or overwhelming experience directed toward you can be appealing even when pain is not the main point.",
  },
  {
    id: "giving_intensity",
    label: "Giving Intensity",
    shortLabel: "Intensity give",
    description: "Creating a physically strong or overwhelming experience for a willing partner can be appealing even when pain is not the main point.",
  },
  {
    id: "receiving_endurance",
    label: "Receiving Endurance",
    shortLabel: "Endure",
    description: "Remaining with sustained physical intensity or discomfort over time can itself feel rewarding.",
  },
  {
    id: "giving_endurance",
    label: "Giving Endurance",
    shortLabel: "Sustain",
    description: "Deliberately sustaining an intense experience for a willing partner over time can feel rewarding.",
  },
  {
    id: "receiving_challenge",
    label: "Receiving Challenge",
    shortLabel: "Challenge receive",
    description: "Being consensually pushed toward an agreed personal edge can add appeal beyond ordinary intensity.",
  },
  {
    id: "giving_challenge",
    label: "Giving Challenge",
    shortLabel: "Challenge give",
    description: "Carefully pushing a willing partner toward an agreed personal edge can add appeal beyond ordinary intensity.",
  },
  {
    id: "emotional_intensity",
    label: "Emotional Intensity",
    shortLabel: "Emotion",
    description: "A highly charged emotional atmosphere can be an important part of an intense experience independent of physical strength.",
  },
];

export function getSignals(ids: SignalId[]) {
  const idSet = new Set(ids);
  return signalDefinitions.filter((signal) => idSet.has(signal.id));
}
