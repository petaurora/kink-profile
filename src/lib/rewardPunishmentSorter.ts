import type { CatalogResultView } from "./catalogResults";
import type {
  InferredContextProposal,
  RewardPunishmentCategoryAffinity,
} from "./rewardPunishmentInference";
import {
  getContextualUseState,
  getRewardPunishmentPreference,
  setContextSuitability,
  type ContextSuitability,
  type RewardPunishmentPreference,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import {
  rewardPunishmentPrimitiveKey,
  type RewardPunishmentPrimitive,
  type RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";

export const rewardPunishmentSorterVersion = 1 as const;

export type RewardPunishmentSorterChoice =
  | "reward"
  | "punishment"
  | "both"
  | "neither"
  | "skip";

export type RewardPunishmentSorterBucket =
  | "reward"
  | "punishment"
  | "both"
  | "neither"
  | "partial"
  | "unclassified";

export type RewardPunishmentSorterScope =
  | { type: "unsorted" }
  | { type: "review" }
  | { type: "source"; sourceType: "catalog" | "action" }
  | { type: "category"; categoryId: string };

export type RewardPunishmentSorterSuggestion =
  | "reward"
  | "punishment"
  | "both";

export type RewardPunishmentSorterCounts = {
  total: number;
  classified: number;
  remaining: number;
  reward: number;
  punishment: number;
  both: number;
  neither: number;
  partial: number;
  protectedIncomplete: number;
};

export type RewardPunishmentSorterFeedbackType =
  | "profile_connection"
  | "context_contrast"
  | "category_pulse"
  | "discovery_count"
  | "curated_note"
  | "playful";

export type RewardPunishmentSorterFeedback = {
  type: RewardPunishmentSorterFeedbackType;
  message: string;
  provenance?: string;
};

const coarseMappings: Readonly<
  Record<
    Exclude<RewardPunishmentSorterChoice, "skip">,
    { reward: ContextSuitability; punishment: ContextSuitability }
  >
> = {
  reward: { reward: "works", punishment: "no" },
  punishment: { reward: "no", punishment: "works" },
  both: { reward: "works", punishment: "works" },
  neither: { reward: "no", punishment: "no" },
};

const positiveSuitabilities = new Set<ContextSuitability>([
  "strong",
  "works",
  "depends",
]);

function isPositive(suitability: ContextSuitability) {
  return positiveSuitabilities.has(suitability);
}

function isKnown(suitability: ContextSuitability) {
  return suitability !== "unset";
}

export function isNuancedContextualUse(
  state: ReturnType<typeof getContextualUseState>,
) {
  return (
    state.suitability === "strong" ||
    state.suitability === "depends" ||
    state.suitability === "never" ||
    state.randomEligible ||
    Boolean(state.note)
  );
}

export function isSorterProtected(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
) {
  return (
    isNuancedContextualUse(getContextualUseState(profile, ref, "reward")) ||
    isNuancedContextualUse(
      getContextualUseState(profile, ref, "punishment"),
    )
  );
}

export function sorterBucketForPrimitive(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
): RewardPunishmentSorterBucket {
  const reward = getContextualUseState(profile, ref, "reward").suitability;
  const punishment = getContextualUseState(
    profile,
    ref,
    "punishment",
  ).suitability;

  if (!isKnown(reward) && !isKnown(punishment)) return "unclassified";
  if (!isKnown(reward) || !isKnown(punishment)) return "partial";

  const rewardPositive = isPositive(reward);
  const punishmentPositive = isPositive(punishment);

  if (rewardPositive && punishmentPositive) return "both";
  if (rewardPositive) return "reward";
  if (punishmentPositive) return "punishment";
  return "neither";
}

export function isFullySorterClassified(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
) {
  const bucket = sorterBucketForPrimitive(profile, ref);
  return (
    bucket === "reward" ||
    bucket === "punishment" ||
    bucket === "both" ||
    bucket === "neither"
  );
}

export function applySorterChoice(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  choice: RewardPunishmentSorterChoice,
  {
    allowProtected = false,
    updatedAt,
  }: {
    allowProtected?: boolean;
    updatedAt?: string;
  } = {},
) {
  if (choice === "skip") return profile;

  if (isSorterProtected(profile, ref) && !allowProtected) {
    return profile;
  }

  const mapping = coarseMappings[choice];
  let next = setContextSuitability(
    profile,
    ref,
    "reward",
    mapping.reward,
    updatedAt,
  );
  next = setContextSuitability(
    next,
    ref,
    "punishment",
    mapping.punishment,
    updatedAt,
  );
  return next;
}

export function restoreSorterPreference(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  previous: RewardPunishmentPreference | undefined,
) {
  const key = rewardPunishmentPrimitiveKey(ref);
  const preferences = { ...profile.preferences };
  if (previous) preferences[key] = previous;
  else delete preferences[key];

  return {
    ...profile,
    preferences,
  };
}

function scopeMatches(
  primitive: RewardPunishmentPrimitive,
  scope: RewardPunishmentSorterScope,
) {
  if (scope.type === "source") {
    return primitive.sourceType === scope.sourceType;
  }
  if (scope.type === "category") {
    return primitive.contextCategories.some(
      (mapping) => mapping.id === scope.categoryId,
    );
  }
  return true;
}

export function primitivesForSorterScope(
  primitives: readonly RewardPunishmentPrimitive[],
  scope: RewardPunishmentSorterScope,
) {
  return primitives.filter((primitive) => scopeMatches(primitive, scope));
}

function proposalPriority(
  proposal: InferredContextProposal | undefined,
) {
  if (!proposal) return 0;
  if (proposal.band === "weak") return 0;
  return proposal.score * proposal.confidence;
}

export function deriveSorterSuggestion(
  rewardProposal: InferredContextProposal | undefined,
  punishmentProposal: InferredContextProposal | undefined,
): RewardPunishmentSorterSuggestion | undefined {
  const reward = proposalPriority(rewardProposal);
  const punishment = proposalPriority(punishmentProposal);
  const threshold = 0.22;

  if (reward < threshold && punishment < threshold) return undefined;
  if (reward >= threshold && punishment >= threshold) {
    const ratio =
      Math.min(reward, punishment) / Math.max(reward, punishment);
    if (ratio >= 0.7) return "both";
  }
  return reward >= punishment ? "reward" : "punishment";
}

export function buildSorterQueue(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  scope: RewardPunishmentSorterScope,
  rewardProposals: ReadonlyMap<string, InferredContextProposal> = new Map(),
  punishmentProposals: ReadonlyMap<string, InferredContextProposal> = new Map(),
  skippedKeys: ReadonlySet<string> = new Set(),
) {
  return primitivesForSorterScope(primitives, scope)
    .filter((primitive) => {
      const key = rewardPunishmentPrimitiveKey(primitive.ref);
      if (skippedKeys.has(key)) return false;

      const classified = isFullySorterClassified(profile, primitive.ref);
      if (scope.type === "review") return classified;

      if (classified) return false;
      return !isSorterProtected(profile, primitive.ref);
    })
    .slice()
    .sort((left, right) => {
      const leftKey = rewardPunishmentPrimitiveKey(left.ref);
      const rightKey = rewardPunishmentPrimitiveKey(right.ref);
      const leftPriority = Math.max(
        proposalPriority(rewardProposals.get(leftKey)),
        proposalPriority(punishmentProposals.get(leftKey)),
      );
      const rightPriority = Math.max(
        proposalPriority(rewardProposals.get(rightKey)),
        proposalPriority(punishmentProposals.get(rightKey)),
      );

      return (
        rightPriority - leftPriority ||
        left.label.localeCompare(right.label) ||
        leftKey.localeCompare(rightKey)
      );
    });
}

export function buildSorterCounts(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
): RewardPunishmentSorterCounts {
  let reward = 0;
  let punishment = 0;
  let both = 0;
  let neither = 0;
  let partial = 0;
  let protectedIncomplete = 0;

  for (const primitive of primitives) {
    const bucket = sorterBucketForPrimitive(profile, primitive.ref);
    if (bucket === "reward") reward += 1;
    else if (bucket === "punishment") punishment += 1;
    else if (bucket === "both") both += 1;
    else if (bucket === "neither") neither += 1;
    else if (bucket === "partial") partial += 1;

    if (
      !isFullySorterClassified(profile, primitive.ref) &&
      isSorterProtected(profile, primitive.ref)
    ) {
      protectedIncomplete += 1;
    }
  }

  const classified = reward + punishment + both + neither;
  return {
    total: primitives.length,
    classified,
    remaining: Math.max(0, primitives.length - classified),
    reward,
    punishment,
    both,
    neither,
    partial,
    protectedIncomplete,
  };
}

export function deterministicSorterCadenceInterval(token: string) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (Math.abs(hash) % 7) + 1;
}

export function crossedSorterCheckpoint(
  beforeClassified: number,
  afterClassified: number,
) {
  if (afterClassified <= beforeClassified) return undefined;
  const nextMilestone = (Math.floor(beforeClassified / 25) + 1) * 25;
  return afterClassified >= nextMilestone ? nextMilestone : undefined;
}

function strongestMappedCategory(
  primitive: RewardPunishmentPrimitive,
  categories: readonly RewardPunishmentCategoryAffinity[],
) {
  const categoryById = new Map(
    categories.map((category) => [category.categoryId, category]),
  );

  return primitive.contextCategories
    .map((mapping) => {
      const category = categoryById.get(mapping.id);
      return category ? { mapping, category } : undefined;
    })
    .filter(
      (
        value,
      ): value is {
        mapping: RewardPunishmentPrimitive["contextCategories"][number];
        category: RewardPunishmentCategoryAffinity;
      } => value !== undefined,
    )
    .sort(
      (left, right) =>
        right.category.affinity *
          right.category.coverage *
          right.mapping.weight -
        left.category.affinity *
          left.category.coverage *
          left.mapping.weight,
    )[0]?.category;
}

function labelCategory(categoryId: string) {
  return categoryId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const curatedNotes = [
  {
    message:
      "Reward and punishment are contextual uses here, so the same activity can legitimately work as both.",
    provenance: "M11 product model",
  },
  {
    message:
      "Skip leaves the item unchanged. It stays available for a later pass instead of becoming a hidden answer.",
    provenance: "M11 sorter semantics",
  },
  {
    message:
      "Quick-sort answers stay coarse on purpose. Strong, Depends, Never, notes, and random-pool choices belong to detailed refinement.",
    provenance: "M11 sorter semantics",
  },
] as const;

const playfulNotes = [
  "Tiny decision acquired. Giant list slightly less giant.",
  "One more thing successfully removed from the decision soup.",
  "The profile has consumed another data point. Nom.",
  "Progress without spreadsheet suffering: the dream.",
] as const;

export function buildSorterFeedback({
  primitive,
  choice,
  sequence,
  previousType,
  catalogResultView,
  rewardCategories,
  punishmentCategories,
  counts,
}: {
  primitive: RewardPunishmentPrimitive;
  choice: Exclude<RewardPunishmentSorterChoice, "skip">;
  sequence: number;
  previousType?: RewardPunishmentSorterFeedbackType;
  catalogResultView: CatalogResultView;
  rewardCategories: readonly RewardPunishmentCategoryAffinity[];
  punishmentCategories: readonly RewardPunishmentCategoryAffinity[];
  counts: RewardPunishmentSorterCounts;
}): RewardPunishmentSorterFeedback {
  const candidates: RewardPunishmentSorterFeedback[] = [];

  const selectedCategory =
    choice === "punishment"
      ? strongestMappedCategory(primitive, punishmentCategories)
      : strongestMappedCategory(primitive, rewardCategories);

  if (
    selectedCategory &&
    selectedCategory.affinity >= 0.65 &&
    selectedCategory.coverage > 0
  ) {
    candidates.push({
      type: "profile_connection",
      message: `This maps to ${labelCategory(selectedCategory.categoryId)}, which is currently a stronger directly established ${choice === "punishment" ? "Punishment" : "Reward"} pattern.`,
      provenance: "Direct M11 contextual category profile",
    });
  }

  const sameCategoryStrongBoth = primitive.contextCategories.find(
    (mapping) => {
      const reward = rewardCategories.find(
        (category) => category.categoryId === mapping.id,
      );
      const punishment = punishmentCategories.find(
        (category) => category.categoryId === mapping.id,
      );
      return (
        reward &&
        punishment &&
        reward.affinity >= 0.65 &&
        punishment.affinity >= 0.65 &&
        reward.coverage > 0 &&
        punishment.coverage > 0
      );
    },
  );

  if (sameCategoryStrongBoth) {
    candidates.push({
      type: "category_pulse",
      message: `${labelCategory(sameCategoryStrongBoth.id)} is currently showing up strongly in both your Reward and Punishment patterns.`,
      provenance: "Direct M11 contextual category profile",
    });
  }

  if (primitive.ref.kind === "catalog") {
    const general = catalogResultView.byCatalogId.get(
      primitive.ref.id,
    )?.explicitState;
    if (
      (general === "love" || general === "like") &&
      choice === "punishment"
    ) {
      candidates.push({
        type: "context_contrast",
        message:
          "You generally like this activity, but just marked it Punishment-only. General preference and contextual use really are different things.",
        provenance: "Direct M6 preference + direct M11 sorter choice",
      });
    }
  }

  candidates.push({
    type: "discovery_count",
    message:
      counts.both > 0
        ? `You have found ${counts.both} item${counts.both === 1 ? "" : "s"} that work as Both so far.`
        : `${counts.classified} directly classified · ${counts.remaining} still open.`,
    provenance: "Direct M11 contextual states",
  });

  const curated = curatedNotes[
    sequence % curatedNotes.length
  ];
  candidates.push({
    type: "curated_note",
    message: curated.message,
    provenance: curated.provenance,
  });

  candidates.push({
    type: "playful",
    message: playfulNotes[sequence % playfulNotes.length],
  });

  const withoutRepeat = previousType
    ? candidates.filter((candidate) => candidate.type !== previousType)
    : candidates;
  const pool = withoutRepeat.length > 0 ? withoutRepeat : candidates;
  const index =
    deterministicSorterCadenceInterval(
      `${rewardPunishmentPrimitiveKey(primitive.ref)}:${sequence}`,
    ) % pool.length;

  return pool[index];
}

export function previousSorterPreference(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
): RewardPunishmentPreference | undefined {
  return getRewardPunishmentPreference(profile, ref);
}
