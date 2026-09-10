import {
  kinkCatalog,
  type KinkCatalogItem,
} from "../data/kinkCatalog.generated";
import { legacySignalConceptTargets } from "../data/canonicalSignals";
import {
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentCategoryId,
  type RewardPunishmentPrimitive,
  type RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";
import {
  getContextualUseState,
  type ContextSuitability,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import type { CatalogPreferenceState } from "./catalogProfile";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import type { CanonicalSignalResult } from "./overallProfileSignals";

export const REWARD_PUNISHMENT_INFERENCE_VERSION = 1 as const;
export const REWARD_PUNISHMENT_CATEGORY_BREADTH_TARGET = 6;

export const rewardPunishmentProposalWeights = {
  reward: {
    canonicalSignal: 0.3,
    category: 0.35,
    similarity: 0.2,
    generalCatalog: 0.15,
  },
  punishment: {
    canonicalSignal: 0.25,
    category: 0.45,
    similarity: 0.3,
    generalCatalog: 0,
  },
} as const;

export type RewardPunishmentCategoryAffinity = {
  categoryId: RewardPunishmentCategoryId;
  context: RewardPunishmentContext;
  affinity: number;
  coverage: number;
  evidenceWeight: number;
  evidenceCount: number;
  boundaryCount: number;
  sourceEvidenceIds: readonly string[];
};

export type InferredContextProposalBand = "likely" | "possible" | "weak";

export type InferredContextProposal = {
  inferenceVersion: typeof REWARD_PUNISHMENT_INFERENCE_VERSION;
  ref: RewardPunishmentPrimitiveRef;
  context: RewardPunishmentContext;
  score: number;
  confidence: number;
  band: InferredContextProposalBand;
  categoryContributions: readonly {
    categoryId: RewardPunishmentCategoryId;
    affinity: number;
    coverage: number;
    weight: number;
  }[];
  reasons: readonly string[];
  sourceEvidenceIds: readonly string[];
};

type ProposalComponent = {
  score: number;
  confidence: number;
  sourceEvidenceIds: readonly string[];
};

type ProposalContext = {
  profile: RewardPunishmentProfileState;
  canonicalSignals: readonly CanonicalSignalResult[];
  catalogResultView: CatalogResultView;
  categoryProfile: readonly RewardPunishmentCategoryAffinity[];
  primitives: readonly RewardPunishmentPrimitive[];
};

const aggregationValues: Readonly<
  Record<ContextSuitability, number | null>
> = {
  strong: 1,
  works: 0.75,
  depends: 0.5,
  no: 0,
  never: 0,
  unset: null,
};

const categoryLabelById = new Map(
  rewardPunishmentCategories.map((category) => [category.id, category.label]),
);

const catalogById = new Map<string, KinkCatalogItem>(
  kinkCatalog.map((item) => [item.id, item]),
);

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round3(value: number) {
  return Math.round((value + 1e-12) * 1000) / 1000;
}

function directEvidenceId(
  ref: RewardPunishmentPrimitiveRef,
  context: RewardPunishmentContext,
) {
  return `m11-direct:${rewardPunishmentPrimitiveKey(ref)}:${context}`;
}

function positiveDirectState(state: ContextSuitability) {
  return state === "strong" || state === "works" || state === "depends";
}

function weightedMean(
  values: readonly { value: number; weight: number }[],
): number | null {
  const usable = values.filter(
    (item) => Number.isFinite(item.weight) && item.weight > 0,
  );
  const total = usable.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;
  return (
    usable.reduce((sum, item) => sum + item.value * item.weight, 0) /
    total
  );
}

export function buildRewardPunishmentCategoryProfile(
  profile: RewardPunishmentProfileState,
  context: RewardPunishmentContext,
  primitives: readonly RewardPunishmentPrimitive[] = rewardPunishmentPrimitives,
): RewardPunishmentCategoryAffinity[] {
  const accumulators = new Map<
    RewardPunishmentCategoryId,
    {
      weightedAffinity: number;
      evidenceWeight: number;
      primitiveKeys: Set<string>;
      boundaryCount: number;
      sourceEvidenceIds: Set<string>;
    }
  >();

  for (const primitive of primitives) {
    const state = getContextualUseState(profile, primitive.ref, context);
    const value = aggregationValues[state.suitability];
    if (value === null) continue;

    for (const mapping of primitive.contextCategories) {
      if (!Number.isFinite(mapping.weight) || mapping.weight <= 0) continue;
      const current = accumulators.get(mapping.id) ?? {
        weightedAffinity: 0,
        evidenceWeight: 0,
        primitiveKeys: new Set<string>(),
        boundaryCount: 0,
        sourceEvidenceIds: new Set<string>(),
      };

      current.weightedAffinity += value * mapping.weight;
      current.evidenceWeight += mapping.weight;
      current.primitiveKeys.add(rewardPunishmentPrimitiveKey(primitive.ref));
      current.sourceEvidenceIds.add(directEvidenceId(primitive.ref, context));
      if (state.suitability === "never") current.boundaryCount += 1;
      accumulators.set(mapping.id, current);
    }
  }

  return [...accumulators.entries()]
    .filter(([, value]) => value.evidenceWeight > 0)
    .map(([categoryId, value]) => ({
      categoryId,
      context,
      affinity: round3(value.weightedAffinity / value.evidenceWeight),
      coverage: round3(
        clamp01(
          value.evidenceWeight /
            REWARD_PUNISHMENT_CATEGORY_BREADTH_TARGET,
        ),
      ),
      evidenceWeight: round3(value.evidenceWeight),
      evidenceCount: value.primitiveKeys.size,
      boundaryCount: value.boundaryCount,
      sourceEvidenceIds: [...value.sourceEvidenceIds].sort(),
    }))
    .sort(
      (left, right) =>
        right.affinity * right.coverage -
          left.affinity * left.coverage ||
        right.coverage - left.coverage ||
        left.categoryId.localeCompare(right.categoryId),
    );
}

function canonicalSignalComponent(
  primitive: RewardPunishmentPrimitive,
  canonicalSignals: readonly CanonicalSignalResult[],
): ProposalComponent | null {
  if (primitive.ref.kind !== "catalog") return null;
  const catalogItem = catalogById.get(primitive.ref.id);
  if (!catalogItem || catalogItem.signalMappings.length === 0) return null;

  const bySignalId = new Map(
    canonicalSignals.map((signal) => [signal.signalId, signal]),
  );
  const matches = catalogItem.signalMappings.flatMap((mapping) => {
    const target = legacySignalConceptTargets[mapping.signalId];
    const signal = bySignalId.get(target.signalId);
    if (!signal || mapping.weight <= 0) return [];

    const channel =
      target.inherentChannel === "receiving"
        ? signal.receiving
        : target.inherentChannel === "giving"
          ? signal.giving
          : signal.overall;
    if (!channel || channel.coverage <= 0 || channel.affinity === null) return [];

    return [{ mapping, channel }];
  });

  const score = weightedMean(
    matches.map(({ mapping, channel }) => ({
      value: clamp01(channel.affinity! / 100),
      weight: mapping.weight,
    })),
  );
  const confidence = weightedMean(
    matches.map(({ mapping, channel }) => ({
      value: clamp01(channel.coverage / 100),
      weight: mapping.weight,
    })),
  );
  if (score === null || confidence === null || confidence <= 0) return null;

  return {
    score: round3(score),
    confidence: round3(confidence),
    sourceEvidenceIds: [
      ...new Set(
        matches.flatMap(({ channel }) => channel.sourceEvidenceIds),
      ),
    ].sort(),
  };
}

function categoryComponent(
  primitive: RewardPunishmentPrimitive,
  categoryProfile: readonly RewardPunishmentCategoryAffinity[],
): {
  component: ProposalComponent | null;
  contributions: InferredContextProposal["categoryContributions"];
} {
  const byCategoryId = new Map(
    categoryProfile.map((category) => [category.categoryId, category]),
  );
  const contributions = primitive.contextCategories.flatMap((mapping) => {
    const category = byCategoryId.get(mapping.id);
    if (!category || category.coverage <= 0 || mapping.weight <= 0) return [];
    return [
      {
        categoryId: mapping.id,
        affinity: category.affinity,
        coverage: category.coverage,
        weight: mapping.weight,
      },
    ];
  });

  const score = weightedMean(
    contributions.map((item) => ({
      value: item.affinity,
      weight: item.weight,
    })),
  );
  const confidence = weightedMean(
    contributions.map((item) => ({
      value: item.coverage,
      weight: item.weight,
    })),
  );

  if (score === null || confidence === null || confidence <= 0) {
    return { component: null, contributions };
  }

  const sourceEvidenceIds = [
    ...new Set(
      contributions.flatMap(
        (item) =>
          byCategoryId.get(item.categoryId)?.sourceEvidenceIds ?? [],
      ),
    ),
  ].sort();

  return {
    component: {
      score: round3(score),
      confidence: round3(confidence),
      sourceEvidenceIds,
    },
    contributions,
  };
}

function categorySimilarity(
  left: RewardPunishmentPrimitive,
  right: RewardPunishmentPrimitive,
) {
  const rightWeights = new Map(
    right.contextCategories.map((mapping) => [mapping.id, mapping.weight]),
  );
  const totalLeftWeight = left.contextCategories.reduce(
    (sum, mapping) => sum + Math.max(0, mapping.weight),
    0,
  );
  if (totalLeftWeight <= 0) return 0;

  const overlap = left.contextCategories.reduce((sum, mapping) => {
    const rightWeight = rightWeights.get(mapping.id) ?? 0;
    return sum + Math.min(mapping.weight, rightWeight);
  }, 0);

  return clamp01(overlap / totalLeftWeight);
}

function similarityComponent(
  primitive: RewardPunishmentPrimitive,
  context: RewardPunishmentContext,
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
): ProposalComponent | null {
  const matches: {
    stateValue: number;
    similarity: number;
    evidenceId: string;
  }[] = [];

  for (const candidate of primitives) {
    if (
      rewardPunishmentPrimitiveKey(candidate.ref) ===
      rewardPunishmentPrimitiveKey(primitive.ref)
    ) {
      continue;
    }

    const state = getContextualUseState(profile, candidate.ref, context);
    if (!positiveDirectState(state.suitability)) continue;

    const similarity = categorySimilarity(primitive, candidate);
    if (similarity <= 0) continue;

    matches.push({
      stateValue: aggregationValues[state.suitability] ?? 0.5,
      similarity,
      evidenceId: directEvidenceId(candidate.ref, context),
    });
  }

  const score = weightedMean(
    matches.map((match) => ({
      value: match.stateValue,
      weight: match.similarity,
    })),
  );
  if (score === null) return null;

  const similarityWeight = matches.reduce(
    (sum, match) => sum + match.similarity,
    0,
  );

  return {
    score: round3(score),
    confidence: round3(clamp01(similarityWeight / 3)),
    sourceEvidenceIds: [
      ...new Set(matches.map((match) => match.evidenceId)),
    ].sort(),
  };
}

const explicitCatalogCompatibility: Readonly<
  Partial<Record<CatalogPreferenceState, number>>
> = {
  love: 1,
  like: 0.85,
  curious: 0.65,
  unsure: 0.5,
  not_interested: 0.15,
  not_applicable: 0.25,
};

function generalCatalogComponent(
  result: CatalogResultItem | undefined,
): ProposalComponent | null {
  if (!result || result.explicitState === "hard_limit") return null;

  if (result.explicitState) {
    const score = explicitCatalogCompatibility[result.explicitState];
    if (score === undefined) return null;
    return {
      score,
      confidence: 1,
      sourceEvidenceIds: [
        `catalog-explicit:${result.item.id}:overall`,
      ],
    };
  }

  if (result.inferred && result.inferred.coverage > 0) {
    return {
      score: round3(clamp01(result.inferred.affinity / 100)),
      confidence: round3(clamp01(result.inferred.coverage / 100)),
      sourceEvidenceIds: [
        `catalog-inference:${result.item.id}`,
      ],
    };
  }

  return null;
}

function proposalBand(
  score: number,
  confidence: number,
): InferredContextProposalBand {
  if (score >= 0.72 && confidence >= 0.35) return "likely";
  if (score >= 0.58 && confidence >= 0.2) return "possible";
  return "weak";
}

function shrinkTowardNeutral(score: number, confidence: number) {
  return 0.5 + (clamp01(score) - 0.5) * clamp01(confidence);
}

function proposalReasons(
  context: RewardPunishmentContext,
  categoryContributions: InferredContextProposal["categoryContributions"],
  categoryProfile: readonly RewardPunishmentCategoryAffinity[],
  canonicalSignal: ProposalComponent | null,
  similarity: ProposalComponent | null,
  generalCatalog: ProposalComponent | null,
) {
  const reasons: string[] = [];
  const categoryById = new Map(
    categoryProfile.map((category) => [category.categoryId, category]),
  );
  const strongestCategory = categoryContributions
    .slice()
    .sort(
      (left, right) =>
        right.affinity * right.coverage * right.weight -
        left.affinity * left.coverage * left.weight,
    )[0];

  if (strongestCategory) {
    const label =
      categoryLabelById.get(strongestCategory.categoryId) ??
      strongestCategory.categoryId;
    const category = categoryById.get(strongestCategory.categoryId);
    if (category && category.affinity >= 0.65) {
      reasons.push(
        `${label} is a stronger directly established ${context} pattern.`,
      );
    } else if (category) {
      reasons.push(
        `${label} has direct ${context} evidence, but the pattern is still mixed or emerging.`,
      );
    }
  }

  if (similarity && similarity.score >= 0.65) {
    reasons.push(
      `Similar directly confirmed ${context} items support this suggestion.`,
    );
  }

  if (canonicalSignal && canonicalSignal.score >= 0.6) {
    reasons.push(
      "Mapped canonical profile signals are compatible with this activity.",
    );
  }

  if (
    context === "reward" &&
    generalCatalog &&
    generalCatalog.score >= 0.6
  ) {
    reasons.push(
      "General catalog preference or affinity provides bounded reward support.",
    );
  }

  return reasons.slice(0, 3);
}

export function buildInferredContextProposal(
  primitive: RewardPunishmentPrimitive,
  context: RewardPunishmentContext,
  {
    profile,
    canonicalSignals,
    catalogResultView,
    categoryProfile,
    primitives,
  }: ProposalContext,
): InferredContextProposal | null {
  const direct = getContextualUseState(profile, primitive.ref, context);
  if (direct.suitability !== "unset") return null;

  const catalogResult =
    primitive.ref.kind === "catalog"
      ? catalogResultView.byCatalogId.get(primitive.ref.id)
      : undefined;

  if (catalogResult?.explicitState === "hard_limit") return null;

  const canonicalSignal = canonicalSignalComponent(
    primitive,
    canonicalSignals,
  );
  const { component: category, contributions } = categoryComponent(
    primitive,
    categoryProfile,
  );
  const similarity = similarityComponent(
    primitive,
    context,
    profile,
    primitives,
  );
  const generalCatalog =
    context === "reward"
      ? generalCatalogComponent(catalogResult)
      : null;

  const configuredWeights = rewardPunishmentProposalWeights[context];
  const components: {
    configuredWeight: number;
    component: ProposalComponent;
  }[] = [];

  const addComponent = (
    configuredWeight: number,
    component: ProposalComponent | null,
  ) => {
    if (
      configuredWeight > 0 &&
      component !== null &&
      component.confidence > 0
    ) {
      components.push({ configuredWeight, component });
    }
  };

  addComponent(configuredWeights.canonicalSignal, canonicalSignal);
  addComponent(configuredWeights.category, category);
  addComponent(configuredWeights.similarity, similarity);
  addComponent(configuredWeights.generalCatalog, generalCatalog);

  if (components.length === 0) return null;

  const totalConfiguredWeight = components.reduce(
    (sum, item) => sum + item.configuredWeight,
    0,
  );
  if (totalConfiguredWeight <= 0) return null;

  const score = round3(
    components.reduce(
      (sum, item) =>
        sum +
        shrinkTowardNeutral(
          item.component.score,
          item.component.confidence,
        ) *
          item.configuredWeight,
      0,
    ) / totalConfiguredWeight,
  );
  const confidence = round3(
    components.reduce(
      (sum, item) =>
        sum + item.component.confidence * item.configuredWeight,
      0,
    ) / totalConfiguredWeight,
  );

  return {
    inferenceVersion: REWARD_PUNISHMENT_INFERENCE_VERSION,
    ref: primitive.ref,
    context,
    score,
    confidence,
    band: proposalBand(score, confidence),
    categoryContributions: contributions,
    reasons: proposalReasons(
      context,
      contributions,
      categoryProfile,
      canonicalSignal,
      similarity,
      generalCatalog,
    ),
    sourceEvidenceIds: [
      ...new Set(
        components.flatMap((item) => item.component.sourceEvidenceIds),
      ),
    ].sort(),
  };
}

export function buildInferredContextProposals(
  profile: RewardPunishmentProfileState,
  context: RewardPunishmentContext,
  canonicalSignals: readonly CanonicalSignalResult[],
  catalogResultView: CatalogResultView,
  primitives: readonly RewardPunishmentPrimitive[] = rewardPunishmentPrimitives,
) {
  const categoryProfile = buildRewardPunishmentCategoryProfile(
    profile,
    context,
    primitives,
  );

  return primitives
    .flatMap((primitive) => {
      const proposal = buildInferredContextProposal(primitive, context, {
        profile,
        canonicalSignals,
        catalogResultView,
        categoryProfile,
        primitives,
      });
      return proposal ? [proposal] : [];
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.confidence - left.confidence ||
        rewardPunishmentPrimitiveKey(left.ref).localeCompare(
          rewardPunishmentPrimitiveKey(right.ref),
        ),
    );
}
