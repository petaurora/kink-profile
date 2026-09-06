import {
  kinkCatalog,
  type KinkCatalogItem,
  type KinkCatalogSignalMapping,
} from "../data/kinkCatalog.generated";
import {
  getSignals,
  type SignalId,
  type WeightedQuestion,
} from "../data/signals";
import {
  quizzes,
  type QuizDefinition,
  type QuizId,
} from "../data/quizzes";
import {
  isWeightedQuestion,
  quizQuestions,
  type QuizQuestion,
} from "../data/quizQuestions";
import {
  getCatalogPreference,
  isExcludedCatalogState,
  type CatalogPreferenceContext,
  type CatalogPreferenceState,
  type CatalogProfileState,
} from "./catalogProfile";
import type { KinkComparison } from "./kinkRanking";
import type { StoredProfile } from "./profileStorage";
import { scoreSignals } from "./scoring";

export type EvidenceSourceType =
  | "quiz"
  | "catalog_explicit"
  | "catalog_pairwise"
  | "catalog_inference";

export type QuizSignalEvidence = {
  kind: "quiz_signal";
  sourceType: "quiz";
  evidenceId: string;
  quizId: QuizId;
  sourceVersion: number;
  signalId: SignalId;
  affinity: number;
  coverage: number;
};

export type QuizInferenceSignal = {
  signalId: SignalId;
  affinity: number;
  coverage: number;
  sourceEvidenceIds: readonly string[];
};

export type ExplicitCatalogEvidence = {
  kind: "catalog_explicit";
  sourceType: "catalog_explicit";
  evidenceId: string;
  catalogId: string;
  context: CatalogPreferenceContext;
  state: CatalogPreferenceState;
  updatedAt: string;
};

export type PairwiseCatalogEvidence = {
  kind: "catalog_pairwise";
  sourceType: "catalog_pairwise";
  evidenceId: string;
  comparisonId: string;
  leftCatalogId: string;
  rightCatalogId: string;
  scope: KinkComparison["scope"];
  result: KinkComparison["result"];
  timestamp: string;
};

export type MatchedSignalEvidence = {
  signalId: SignalId;
  mappingWeight: number;
  signalAffinity: number;
  signalCoverage: number;
  sourceEvidenceIds: readonly string[];
};

export type InferredCatalogEvidence = {
  kind: "catalog_inference";
  sourceType: "catalog_inference";
  evidenceId: string;
  catalogId: string;
  affinity: number;
  coverage: number;
  matchedSignals: readonly MatchedSignalEvidence[];
};

export type ResolvedCatalogEvidenceView = {
  rankingEligible: boolean;
  overallExplicit?: CatalogPreferenceState;
  receivingExplicit?: CatalogPreferenceState;
  givingExplicit?: CatalogPreferenceState;
  inferredAffinity?: number;
  inferredCoverage?: number;
  hasDirectExplicitEvidence: boolean;
  hasDirectPairwiseEvidence: boolean;
};

export type CatalogEvidenceSnapshot = {
  catalogId: string;
  explicit: readonly ExplicitCatalogEvidence[];
  pairwise: readonly PairwiseCatalogEvidence[];
  inferred?: InferredCatalogEvidence;
  resolved: ResolvedCatalogEvidenceView;
};

export type ExplicitProjectionPolarity =
  | "positive"
  | "negative"
  | "uncertain";

export type ExplicitProjectionStrength =
  | "strong"
  | "moderate"
  | "exploratory"
  | "uncertain";

export type ExplicitCatalogSignalProjection = {
  kind: "explicit_catalog_signal_projection";
  sourceEvidenceId: string;
  catalogId: string;
  context: CatalogPreferenceContext;
  signalId: SignalId;
  mappingWeight: number;
  polarity: ExplicitProjectionPolarity;
  strength: ExplicitProjectionStrength;
};

export type PairwiseCatalogSignalProjection = {
  kind: "pairwise_catalog_signal_projection";
  sourceEvidenceId: string;
  comparisonId: string;
  relation: "left_preferred" | "right_preferred" | "equal";
  leftCatalogId: string;
  rightCatalogId: string;
  leftMappings: readonly KinkCatalogSignalMapping[];
  rightMappings: readonly KinkCatalogSignalMapping[];
};

export type DirectCatalogSignalProjection =
  | ExplicitCatalogSignalProjection
  | PairwiseCatalogSignalProjection;

const receivingSignalIds = new Set<SignalId>([
  "receiving_control",
  "care_receiving",
  "pursuit_receiving",
  "receiving_restraint",
  "receiving_positioning",
  "receiving_constraint_control",
  "receiving_discipline",
  "pain_receiving",
  "receiving_intensity",
  "receiving_endurance",
  "receiving_challenge",
]);

const givingSignalIds = new Set<SignalId>([
  "giving_control",
  "care_giving",
  "pursuit_giving",
  "giving_restraint",
  "giving_positioning",
  "giving_constraint_control",
  "giving_discipline",
  "pain_giving",
  "giving_intensity",
  "giving_endurance",
  "giving_challenge",
]);

function mappingMatchesPreferenceContext(
  mapping: KinkCatalogSignalMapping,
  context: CatalogPreferenceContext,
) {
  if (context === "overall") return true;
  if (context === "receiving") return !givingSignalIds.has(mapping.signalId);
  return !receivingSignalIds.has(mapping.signalId);
}

function quizEvidenceId(quizId: QuizId, signalId: SignalId) {
  return `quiz:${quizId}:${signalId}`;
}

function explicitEvidenceId(
  catalogId: string,
  context: CatalogPreferenceContext,
) {
  return `catalog-explicit:${catalogId}:${context}`;
}

function pairwiseEvidenceId(comparisonId: string) {
  return `catalog-pairwise:${comparisonId}`;
}

function inferenceEvidenceId(catalogId: string) {
  return `catalog-inference:${catalogId}`;
}

function signalIdsForQuestions(questions: readonly WeightedQuestion[]) {
  const ids = new Set<SignalId>();

  for (const question of questions) {
    for (const signalId of Object.keys(question.weights) as SignalId[]) {
      if ((question.weights[signalId] ?? 0) > 0) ids.add(signalId);
    }
  }

  return [...ids];
}

function weightedQuestionsForQuiz(
  quiz: QuizDefinition,
  allQuestions: readonly QuizQuestion[],
) {
  const ids = new Set(quiz.questionIds);
  return allQuestions
    .filter((question) => ids.has(question.id))
    .filter(isWeightedQuestion);
}

export function buildQuizSignalEvidence(
  profile: StoredProfile,
  quizDefinitions: readonly QuizDefinition[] = quizzes,
  allQuestions: readonly QuizQuestion[] = quizQuestions,
): QuizSignalEvidence[] {
  return quizDefinitions.flatMap((quiz) => {
    const progress = profile.quizzes[quiz.id];
    if (!progress) return [];

    const questions = weightedQuestionsForQuiz(quiz, allQuestions);
    if (questions.length === 0) return [];

    const signalIds = signalIdsForQuestions(questions);
    const scores = scoreSignals(
      [...questions],
      progress.answers,
      getSignals(signalIds),
    );

    return scores
      .filter((score) => score.coverage > 0)
      .map((score) => ({
        kind: "quiz_signal" as const,
        sourceType: "quiz" as const,
        evidenceId: quizEvidenceId(quiz.id, score.id),
        quizId: quiz.id,
        sourceVersion: progress.quizVersion,
        signalId: score.id,
        affinity: score.percentage,
        coverage: score.coverage,
      }));
  });
}

export function dedupeQuizSignalEvidence(
  evidence: readonly QuizSignalEvidence[],
) {
  const byEvidenceId = new Map<string, QuizSignalEvidence>();

  for (const item of evidence) {
    byEvidenceId.set(item.evidenceId, item);
  }

  return [...byEvidenceId.values()];
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function normalizedSignalMappings(
  mappings: readonly KinkCatalogSignalMapping[],
) {
  const bySignalId = new Map<SignalId, number>();

  for (const mapping of mappings) {
    if (!Number.isFinite(mapping.weight) || mapping.weight <= 0) continue;
    bySignalId.set(
      mapping.signalId,
      (bySignalId.get(mapping.signalId) ?? 0) + mapping.weight,
    );
  }

  return [...bySignalId.entries()].map(([signalId, weight]) => ({
    signalId,
    weight,
  }));
}

export function buildQuizInferenceSignalProfile(
  evidence: readonly QuizSignalEvidence[],
): Map<SignalId, QuizInferenceSignal> {
  const deduped = dedupeQuizSignalEvidence(evidence);
  const grouped = new Map<SignalId, QuizSignalEvidence[]>();

  for (const item of deduped) {
    const current = grouped.get(item.signalId) ?? [];
    current.push(item);
    grouped.set(item.signalId, current);
  }

  return new Map(
    [...grouped.entries()].map(([signalId, items]) => {
      let totalCoverageWeight = 0;
      let weightedAffinity = 0;
      let uncoveredProduct = 1;

      for (const item of items) {
        const coverageFactor = clampPercent(item.coverage) / 100;
        const affinity = clampPercent(item.affinity);
        totalCoverageWeight += coverageFactor;
        weightedAffinity += affinity * coverageFactor;
        uncoveredProduct *= 1 - coverageFactor;
      }

      return [
        signalId,
        {
          signalId,
          affinity:
            totalCoverageWeight > 0
              ? Math.round((weightedAffinity / totalCoverageWeight) * 10) / 10
              : 0,
          coverage: Math.round(clampPercent((1 - uncoveredProduct) * 100)),
          sourceEvidenceIds: items.map((item) => item.evidenceId).sort(),
        },
      ];
    }),
  );
}

export function inferCatalogAffinity(
  item: Pick<KinkCatalogItem, "id" | "signalMappings">,
  signalProfile: ReadonlyMap<SignalId, QuizInferenceSignal>,
): InferredCatalogEvidence | undefined {
  const mappings = normalizedSignalMappings(item.signalMappings);
  if (mappings.length === 0) return undefined;

  const totalMappingWeight = mappings.reduce(
    (sum, mapping) => sum + mapping.weight,
    0,
  );

  let effectiveWeight = 0;
  let weightedAffinity = 0;
  const matchedSignals: MatchedSignalEvidence[] = [];

  for (const mapping of mappings) {
    const signal = signalProfile.get(mapping.signalId);
    if (!signal) continue;

    const signalCoverage = clampPercent(signal.coverage);
    if (signalCoverage <= 0) continue;

    const signalAffinity = clampPercent(signal.affinity);
    const coveredWeight = mapping.weight * (signalCoverage / 100);
    effectiveWeight += coveredWeight;
    weightedAffinity += signalAffinity * coveredWeight;

    matchedSignals.push({
      signalId: mapping.signalId,
      mappingWeight: mapping.weight,
      signalAffinity,
      signalCoverage,
      sourceEvidenceIds: [...new Set(signal.sourceEvidenceIds)].sort(),
    });
  }

  if (effectiveWeight <= 0 || totalMappingWeight <= 0) return undefined;

  return {
    kind: "catalog_inference",
    sourceType: "catalog_inference",
    evidenceId: inferenceEvidenceId(item.id),
    catalogId: item.id,
    affinity:
      Math.round(
        clampPercent(weightedAffinity / effectiveWeight) * 10,
      ) / 10,
    coverage: Math.round(
      clampPercent((effectiveWeight / totalMappingWeight) * 100),
    ),
    matchedSignals: matchedSignals.sort((a, b) =>
      a.signalId.localeCompare(b.signalId),
    ),
  };
}

export function selectExplicitCatalogEvidence(
  profile: CatalogProfileState,
  catalogId: string,
): ExplicitCatalogEvidence[] {
  const preference = profile.preferences[catalogId];
  if (!preference) return [];

  return (["overall", "receiving", "giving"] as const).flatMap((context) => {
    const state = preference[context];
    if (!state) return [];

    return [
      {
        kind: "catalog_explicit" as const,
        sourceType: "catalog_explicit" as const,
        evidenceId: explicitEvidenceId(catalogId, context),
        catalogId,
        context,
        state,
        updatedAt: preference.updatedAt,
      },
    ];
  });
}

export function selectPairwiseCatalogEvidence(
  comparisons: readonly KinkComparison[],
  catalogId: string,
): PairwiseCatalogEvidence[] {
  return comparisons
    .filter(
      (comparison) =>
        comparison.leftKinkId === catalogId ||
        comparison.rightKinkId === catalogId,
    )
    .map((comparison) => ({
      kind: "catalog_pairwise" as const,
      sourceType: "catalog_pairwise" as const,
      evidenceId: pairwiseEvidenceId(comparison.id),
      comparisonId: comparison.id,
      leftCatalogId: comparison.leftKinkId,
      rightCatalogId: comparison.rightKinkId,
      scope: comparison.scope,
      result: comparison.result,
      timestamp: comparison.timestamp,
    }));
}

export function buildCatalogEvidenceSnapshot(
  item: Pick<KinkCatalogItem, "id" | "signalMappings">,
  catalogProfile: CatalogProfileState,
  quizSignalProfile: ReadonlyMap<SignalId, QuizInferenceSignal>,
): CatalogEvidenceSnapshot {
  const explicit = selectExplicitCatalogEvidence(catalogProfile, item.id);
  const pairwise = selectPairwiseCatalogEvidence(
    catalogProfile.comparisons,
    item.id,
  );
  const inferred = inferCatalogAffinity(item, quizSignalProfile);
  const preference = catalogProfile.preferences[item.id];

  const overallExplicit = getCatalogPreference(preference, "overall");
  const receivingExplicit = getCatalogPreference(preference, "receiving");
  const givingExplicit = getCatalogPreference(preference, "giving");

  return {
    catalogId: item.id,
    explicit,
    pairwise,
    inferred,
    resolved: {
      rankingEligible: !isExcludedCatalogState(overallExplicit),
      overallExplicit,
      receivingExplicit,
      givingExplicit,
      inferredAffinity: inferred?.affinity,
      inferredCoverage: inferred?.coverage,
      hasDirectExplicitEvidence: explicit.length > 0,
      hasDirectPairwiseEvidence: pairwise.length > 0,
    },
  };
}

export function buildAllCatalogEvidenceSnapshots(
  storedProfile: StoredProfile,
  catalogProfile: CatalogProfileState,
  catalog: readonly KinkCatalogItem[] = kinkCatalog,
) {
  const quizEvidence = buildQuizSignalEvidence(storedProfile);
  const quizSignalProfile = buildQuizInferenceSignalProfile(quizEvidence);

  return catalog.map((item) =>
    buildCatalogEvidenceSnapshot(item, catalogProfile, quizSignalProfile),
  );
}

function explicitProjectionSemantics(state: CatalogPreferenceState): {
  polarity: ExplicitProjectionPolarity;
  strength: ExplicitProjectionStrength;
} | null {
  switch (state) {
    case "love":
      return { polarity: "positive", strength: "strong" };
    case "like":
      return { polarity: "positive", strength: "moderate" };
    case "curious":
      return { polarity: "positive", strength: "exploratory" };
    case "unsure":
      return { polarity: "uncertain", strength: "uncertain" };
    case "not_interested":
      return { polarity: "negative", strength: "moderate" };
    case "hard_limit":
      return { polarity: "negative", strength: "strong" };
    case "not_applicable":
      return null;
  }
}

export function projectExplicitCatalogEvidenceToSignals(
  evidence: ExplicitCatalogEvidence,
  item: Pick<KinkCatalogItem, "id" | "signalMappings">,
): ExplicitCatalogSignalProjection[] {
  if (evidence.catalogId !== item.id) return [];

  const semantics = explicitProjectionSemantics(evidence.state);
  if (!semantics) return [];

  return item.signalMappings
    .filter((mapping) =>
      mappingMatchesPreferenceContext(mapping, evidence.context),
    )
    .map((mapping) => ({
      kind: "explicit_catalog_signal_projection" as const,
      sourceEvidenceId: evidence.evidenceId,
      catalogId: item.id,
      context: evidence.context,
      signalId: mapping.signalId,
      mappingWeight: mapping.weight,
      ...semantics,
    }));
}

function mappedSignalsForCatalogId(
  catalogId: string,
  catalogById: ReadonlyMap<string, Pick<KinkCatalogItem, "id" | "signalMappings">>,
) {
  return catalogById.get(catalogId)?.signalMappings ?? [];
}

export function projectPairwiseCatalogEvidenceToSignals(
  evidence: PairwiseCatalogEvidence,
  catalog: readonly Pick<KinkCatalogItem, "id" | "signalMappings">[],
): PairwiseCatalogSignalProjection[] {
  if (evidence.result === "skip" || evidence.result === "neither") return [];

  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  const relation =
    evidence.result === "left"
      ? "left_preferred"
      : evidence.result === "right"
        ? "right_preferred"
        : "equal";

  return [
    {
      kind: "pairwise_catalog_signal_projection",
      sourceEvidenceId: evidence.evidenceId,
      comparisonId: evidence.comparisonId,
      relation,
      leftCatalogId: evidence.leftCatalogId,
      rightCatalogId: evidence.rightCatalogId,
      leftMappings: mappedSignalsForCatalogId(evidence.leftCatalogId, catalogById),
      rightMappings: mappedSignalsForCatalogId(evidence.rightCatalogId, catalogById),
    },
  ];
}

export function projectDirectCatalogEvidenceToSignals(
  profile: CatalogProfileState,
  catalog: readonly Pick<KinkCatalogItem, "id" | "signalMappings">[] = kinkCatalog,
): DirectCatalogSignalProjection[] {
  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  const explicit = Object.keys(profile.preferences).flatMap((catalogId) =>
    selectExplicitCatalogEvidence(profile, catalogId),
  );

  const explicitProjections = explicit.flatMap((evidence) => {
    const item = catalogById.get(evidence.catalogId);
    return item
      ? projectExplicitCatalogEvidenceToSignals(evidence, item)
      : [];
  });

  const pairwiseProjections = profile.comparisons.flatMap((comparison) => {
    const evidence: PairwiseCatalogEvidence = {
      kind: "catalog_pairwise",
      sourceType: "catalog_pairwise",
      evidenceId: pairwiseEvidenceId(comparison.id),
      comparisonId: comparison.id,
      leftCatalogId: comparison.leftKinkId,
      rightCatalogId: comparison.rightKinkId,
      scope: comparison.scope,
      result: comparison.result,
      timestamp: comparison.timestamp,
    };

    return projectPairwiseCatalogEvidenceToSignals(evidence, catalog);
  });

  return [...explicitProjections, ...pairwiseProjections];
}
