export type DimensionId = "petPlay" | "submission" | "service" | "praise" | "protocol" | "restraint" | "sensation" | "display";

export type Dimension = {
  id: DimensionId;
  label: string;
  shortLabel: string;
  description: string;
};

export type Question = {
  id: string;
  dimension: DimensionId;
  prompt: string;
};

export const dimensions: Dimension[] = [
  { id: "petPlay", label: "Pet Play", shortLabel: "Pet", description: "Pet identity, pet-like behavior, and being treated as a cherished pet." },
  { id: "submission", label: "Submission", shortLabel: "Submit", description: "Intentionally giving a trusted partner authority or control." },
  { id: "service", label: "Service", shortLabel: "Service", description: "Helping, anticipating needs, and doing useful things for a partner." },
  { id: "praise", label: "Praise & Affection", shortLabel: "Praise", description: "Encouragement, approval, reassurance, and affection." },
  { id: "protocol", label: "Protocol", shortLabel: "Protocol", description: "Rules, rituals, expectations, structure, and intentional behavior." },
  { id: "restraint", label: "Restraint", shortLabel: "Restraint", description: "Consensual restriction, positioning, or reduced freedom of movement." },
  { id: "sensation", label: "Sensation", shortLabel: "Sensation", description: "Intense, contrasting, or deliberately heightened physical sensation." },
  { id: "display", label: "Display", shortLabel: "Display", description: "Being observed, presented, shown off, or visibly part of a dynamic." },
];

export const questions: Question[] = [
  { id: "pet-1", dimension: "petPlay", prompt: "Being treated as a cherished pet sounds emotionally satisfying to me." },
  { id: "pet-2", dimension: "petPlay", prompt: "Pet-like roles, behaviors, accessories, or rituals appeal to me." },
  { id: "submission-1", dimension: "submission", prompt: "I enjoy deliberately giving a trusted partner authority over me." },
  { id: "submission-2", dimension: "submission", prompt: "Following a partner's direction can feel freeing or grounding." },
  { id: "service-1", dimension: "service", prompt: "Doing useful things for a partner makes me feel connected to them." },
  { id: "service-2", dimension: "service", prompt: "I like learning a partner's preferences well enough to anticipate what they need." },
  { id: "praise-1", dimension: "praise", prompt: "Praise and explicit approval strongly affect how rewarding an experience feels." },
  { id: "praise-2", dimension: "praise", prompt: "Affection and reassurance make structured or intense dynamics feel better to me." },
  { id: "protocol-1", dimension: "protocol", prompt: "Rules, rituals, or repeated expectations make a dynamic feel more meaningful." },
  { id: "protocol-2", dimension: "protocol", prompt: "I enjoy knowing exactly what is expected of me in a role." },
  { id: "restraint-1", dimension: "restraint", prompt: "Consensually having my movement restricted appeals to me." },
  { id: "restraint-2", dimension: "restraint", prompt: "Being deliberately positioned or kept in place sounds appealing." },
  { id: "sensation-1", dimension: "sensation", prompt: "I enjoy experiences that intentionally heighten or contrast physical sensation." },
  { id: "sensation-2", dimension: "sensation", prompt: "Intensity itself can be exciting when I feel safe and in control of my consent." },
  { id: "display-1", dimension: "display", prompt: "Being intentionally shown off by a partner sounds appealing." },
  { id: "display-2", dimension: "display", prompt: "I like the idea of my role or dynamic being visibly recognizable in the right setting." }
];

export const answerOptions = [
  { value: 0, label: "Nope" },
  { value: 1, label: "A little" },
  { value: 2, label: "Maybe" },
  { value: 3, label: "Very into it" },
  { value: 4, label: "Core to me" }
] as const;
