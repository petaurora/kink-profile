import {
  kinkCatalog,
  type KinkCatalogItem,
  type KinkCatalogSignalMapping,
} from "../data/kinkCatalog.generated";
import {
  canonicalExplicitCatalogSignalRef,
  canonicalPairwiseSignalRef,
  canonicalQuizSignalRef,
  canonicalSignalDefinitions,
  canonicalSignalKey,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
import { isWeightedQuestion, quizQuestions, type QuizQuestion } from "../data/quizQuestions";
import { quizzes, type QuizDefinition, type QuizId } from "../data/quizzes";
import type { SignalId as LegacySignalId, WeightedQuestion } from "../data/signals";
import type { CatalogProfileState } from "./catalogProfile";
import {
  projectDirectCatalogEvidenceToSignals,
  type DirectCatalogSignalProjection,
  type ExplicitCatalogSignalProjection,
  type PairwiseCatalogSignalProjection,
} from "./profileEvidence";
import type { StoredProfile } from "./profileStorage";
import {
  canonicalSignalSourceReliability,
  type CanonicalSignalSourceType,
} from "./overallProfileSignals";

export type CanonicalSignalContribution = {
  sourceType: CanonicalSignalSourceType;
  sourceId: string;
  signalId: CanonicalSignalId;
  signalChannel: SignalChannel;
  affinity: number;
  coverage: number;
  sourceEvidenceIds: readonly string[];
  detail?: string;
};

export type CanonicalSignalSource = {
  sourceType: CanonicalSignalSourceType;
  affinity: number;
  coverage: number;
  reliability: number;
  effectiveWeight: number;
  contributions: readonly CanonicalSignalContribution[];
};

export type SignalChannelResult = {
  affinity: number | null;
  coverage: number;
  sources: readonly CanonicalSignalSource[];
  sourceEvidenceIds: readonly string[];
};

export type CanonicalSignalResult = {
  signalId: CanonicalSignalId;
  overall: SignalChannelResult;
  receiving?: SignalChannelResult;
  giving?: SignalChannelResult;
};

type MutableQuizBucket = {
  sourceId: QuizId;
  signalId: CanonicalSignalId;
  signalChannel: SignalChannel;
  expectedWeight: number;
  answeredWeight: number;
  weightedAffinity: number;
  sourceEvidenceIds: Set<string>;
  sourceVersion: number;
};

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function clampPercent(value: number) {
  return clamp01(value / 100) * 100;
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort();
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

function addQuizWeight(
  buckets: Map<string, MutableQuizBucket>,
  quizId: QuizId,
  sourceVersion: number,
  signalId: CanonicalSignalId,
  signalChannel: SignalChannel,
  weight: number,
  answer: number | undefined,
  evidenceId: string,
) {
  const key = `${quizId}::${signalId}::${signalChannel}`;
  const current = buckets.get(key) ?? {
    sourceId: quizId,
    signalId,
    signalChannel,
    expectedWeight: 0,
    answeredWeight: 0,
    weightedAffinity: 0,
    sourceEvidenceIds: new Set<string>(),
    sourceVersion,
  };

  current.expectedWeight += weight;
  current.sourceVersion = Math.max(current.sourceVersion, sourceVersion);
  if (answer !== undefined) {
    current.answeredWeight += weight;
    current.weightedAffinity += clamp01(answer / 4) * 100 * weight;
    current.sourceEvidenceIds.add(evidenceId);
  }
  buckets.set(key, current);
}

function canonicalQuestionWeights(question: WeightedQuestion) {
  const specific = new Map<string, { signalId: CanonicalSignalId; channel: SignalChannel; weight: number; legacyIds: LegacySignalId[] }>();
  const overall = new Map<CanonicalSignalId, { weight: number; legacyIds: LegacySignalId[] }>();

  for (const [rawSignalId, rawWeight] of Object.entries(question.weights)) {
    const legacySignalId = rawSignalId as LegacySignalId;
    const weight = rawWeight ?? 0;
    if (!Number.isFinite(weight) || weight <= 0) continue;

    const ref = canonicalQuizSignalRef(question.id, legacySignalId);
    const key = canonicalSignalKey(ref);
    const existing = specific.get(key);
    specific.set(key, {
      signalId: ref.signalId,
      channel: ref.channel,
      weight: Math.max(existing?.weight ?? 0, weight),
      legacyIds: [...(existing?.legacyIds ?? []), legacySignalId],
    });

    const broad = overall.get(ref.signalId);
    overall.set(ref.signalId, {
      weight: Math.max(broad?.weight ?? 0, weight),
      legacyIds: [...(broad?.legacyIds ?? []), legacySignalId],
    });
  }

  return { specific: [...specific.values()], overall: [...overall.entries()] };
}

export function buildCanonicalQuizContributions(
  profile: StoredProfile,
  quizDefinitions: readonly QuizDefinition[] = quizzes,
  allQuestions: readonly QuizQuestion[] = quizQuestions,
): CanonicalSignalContribution[] {
  const buckets = new Map<string, MutableQuizBucket>();

  for (const quiz of quizDefinitions) {
    const progress = profile.quizzes[quiz.id];
    if (!progress || !quiz.contributesToOverall) continue;

    const questions = weightedQuestionsForQuiz(quiz, allQuestions);
    for (const question of questions) {
      const answer = progress.answers[question.id];
      const weights = canonicalQuestionWeights(question);

      for (const item of weights.specific) {
        if (item.channel === "overall") continue;
        addQuizWeight(
          buckets,
          quiz.id,
          progress.quizVersion,
          item.signalId,
          item.channel,
          item.weight,
          answer,
          `quiz:${quiz.id}:${question.id}:${item.legacyIds.sort().join("+")}`,
        );
      }

      for (const [signalId, item] of weights.overall) {
        addQuizWeight(
          buckets,
          quiz.id,
          progress.quizVersion,
          signalId,
          "overall",
          item.weight,
          answer,
          `quiz:${quiz.id}:${question.id}:${item.legacyIds.sort().join("+")}`,
        );
      }
    }
  }

  return [...buckets.values()].flatMap((bucket) => {
    if (bucket.answeredWeight <= 0 || bucket.expectedWeight <= 0) return [];
    return [
      {
        sourceType: "quiz" as const,
        sourceId: bucket.sourceId,
        signalId: bucket.signalId,
        signalChannel: bucket.signalChannel,
        affinity: round1(bucket.weightedAffinity / bucket.answeredWeight),
        coverage: round1((bucket.answeredWeight / bucket.expectedWeight) * 100),
        sourceEvidenceIds: [...bucket.sourceEvidenceIds].sort(),
        detail: `quiz v${bucket.sourceVersion}`,
      },
    ];
  });
}

function explicitProjectionAffinity(projection: ExplicitCatalogSignalProjection) {
  if (projection.polarity === "uncertain") return 50;
  if (projection.polarity === "negative") {
    return projection.strength === "strong" ? 0 : 20;
  }
  switch (projection.strength) {
    case "strong": return 100;
    case "moderate": return 80;
    case "exploratory": return 65;
    case "uncertain": return 50;
  }
}

function explicitProjectionCoverage(projection: ExplicitCatalogSignalProjection) {
  const semanticStrength =
    projection.strength === "strong"
      ? 1
      : projection.strength === "moderate"
        ? 0.75
        : projection.strength === "exploratory"
          ? 0.5
          : 0.25;
  return round1(semanticStrength * clamp01(projection.mappingWeight) * 100);
}

type ExplicitRow = {
  projection: ExplicitCatalogSignalProjection;
  signalId: CanonicalSignalId;
  channel: SignalChannel;
  affinity: number;
  coverage: number;
};

function summarizeExplicitRows(
  rows: readonly ExplicitRow[],
  signalChannel: SignalChannel,
): CanonicalSignalContribution | undefined {
  if (rows.length === 0) return undefined;
  const coverageWeight = rows.reduce((sum, row) => sum + row.coverage / 100, 0);
  if (coverageWeight <= 0) return undefined;

  return {
    sourceType: "catalog_explicit",
    sourceId: rows[0].projection.catalogId,
    signalId: rows[0].signalId,
    signalChannel,
    affinity: round1(
      rows.reduce((sum, row) => sum + row.affinity * (row.coverage / 100), 0) /
        coverageWeight,
    ),
    // One catalog item is one independent source even when it has multiple
    // explicit contexts or legacy mappings for the same canonical concept.
    coverage: Math.max(...rows.map((row) => row.coverage)),
    sourceEvidenceIds: uniqueSorted(rows.map((row) => row.projection.sourceEvidenceId)),
    detail: uniqueSorted(rows.map((row) => row.projection.context)).join(" / "),
  };
}

export function buildCanonicalExplicitContributions(
  projections: readonly ExplicitCatalogSignalProjection[],
): CanonicalSignalContribution[] {
  const grouped = new Map<string, ExplicitRow[]>();

  for (const projection of projections) {
    const ref = canonicalExplicitCatalogSignalRef(projection.signalId, projection.context);
    if (!ref) continue;
    const row: ExplicitRow = {
      projection,
      signalId: ref.signalId,
      channel: ref.channel,
      affinity: explicitProjectionAffinity(projection),
      coverage: explicitProjectionCoverage(projection),
    };
    const key = `${projection.catalogId}::${ref.signalId}`;
    const current = grouped.get(key) ?? [];
    current.push(row);
    grouped.set(key, current);
  }

  return [...grouped.values()].flatMap((rows) => {
    const results: CanonicalSignalContribution[] = [];
    const overall = summarizeExplicitRows(rows, "overall");
    if (overall) results.push(overall);

    for (const channel of ["receiving", "giving"] as const) {
      const directional = rows.filter((row) => row.channel === channel);
      const summary = summarizeExplicitRows(directional, channel);
      if (summary) results.push(summary);
    }
    return results;
  });
}

function mappedWeights(
  mappings: readonly KinkCatalogSignalMapping[],
  mode: "specific" | "overall",
) {
  const result = new Map<string, { signalId: CanonicalSignalId; channel: SignalChannel; weight: number }>();

  for (const mapping of mappings) {
    const ref = canonicalPairwiseSignalRef(mapping.signalId);
    const channel = mode === "overall" ? "overall" : ref.channel;
    const key = `${ref.signalId}::${channel}`;
    const current = result.get(key);
    result.set(key, {
      signalId: ref.signalId,
      channel,
      weight: Math.max(current?.weight ?? 0, clamp01(mapping.weight)),
    });
  }

  return result;
}

function pairwiseAffinity(
  relation: PairwiseCatalogSignalProjection["relation"],
  mappedSide: "left" | "right",
) {
  if (relation === "equal") return 50;
  if (relation === "left_preferred") return mappedSide === "left" ? 100 : 0;
  return mappedSide === "right" ? 100 : 0;
}

function pairwiseContributionsForMode(
  projection: PairwiseCatalogSignalProjection,
  mode: "specific" | "overall",
): CanonicalSignalContribution[] {
  const left = mappedWeights(projection.leftMappings, mode);
  const right = mappedWeights(projection.rightMappings, mode);
  const keys = new Set([...left.keys(), ...right.keys()]);

  return [...keys].flatMap((key) => {
    const leftRow = left.get(key);
    const rightRow = right.get(key);
    if (Boolean(leftRow) === Boolean(rightRow)) return [];

    const row = leftRow ?? rightRow;
    if (!row) return [];
    const mappedSide = leftRow ? "left" : "right";
    return [
      {
        sourceType: "catalog_pairwise" as const,
        sourceId: projection.comparisonId,
        signalId: row.signalId,
        signalChannel: row.channel,
        affinity: pairwiseAffinity(projection.relation, mappedSide),
        coverage: round1((row.weight / 8) * 100),
        sourceEvidenceIds: [projection.sourceEvidenceId],
        detail: projection.relation,
      },
    ];
  });
}

export function buildCanonicalPairwiseContributions(
  projections: readonly PairwiseCatalogSignalProjection[],
): CanonicalSignalContribution[] {
  return projections.flatMap((projection) => [
    ...pairwiseContributionsForMode(projection, "specific").filter(
      (item) => item.signalChannel !== "overall",
    ),
    ...pairwiseContributionsForMode(projection, "overall"),
  ]);
}

function combineIndependentCoverage(contributions: readonly CanonicalSignalContribution[]) {
  let uncovered = 1;
  for (const contribution of contributions) {
    uncovered *= 1 - clamp01(contribution.coverage / 100);
  }
  return round1((1 - uncovered) * 100);
}

function weightedContributionAffinity(contributions: readonly CanonicalSignalContribution[]) {
  let weight = 0;
  let weightedAffinity = 0;
  for (const contribution of contributions) {
    const evidenceWeight = clamp01(contribution.coverage / 100);
    if (evidenceWeight <= 0) continue;
    weight += evidenceWeight;
    weightedAffinity += clampPercent(contribution.affinity) * evidenceWeight;
  }
  return weight > 0 ? round1(weightedAffinity / weight) : 0;
}

function summarizeSource(
  sourceType: CanonicalSignalSourceType,
  contributions: readonly CanonicalSignalContribution[],
): CanonicalSignalSource | undefined {
  const usable = contributions.filter((item) => item.coverage > 0);
  if (usable.length === 0) return undefined;
  const coverage =
    sourceType === "catalog_pairwise"
      ? round1(Math.min(100, usable.reduce((sum, item) => sum + item.coverage, 0)))
      : combineIndependentCoverage(usable);
  const reliability = canonicalSignalSourceReliability[sourceType];
  return {
    sourceType,
    affinity: weightedContributionAffinity(usable),
    coverage,
    reliability,
    effectiveWeight: reliability * (coverage / 100),
    contributions: usable,
  };
}

function aggregateChannel(
  signalId: CanonicalSignalId,
  channel: SignalChannel,
  contributions: readonly CanonicalSignalContribution[],
): SignalChannelResult {
  const matching = contributions.filter(
    (item) => item.signalId === signalId && item.signalChannel === channel,
  );
  const sources = (["quiz", "catalog_explicit", "catalog_pairwise"] as const)
    .map((sourceType) =>
      summarizeSource(
        sourceType,
        matching.filter((item) => item.sourceType === sourceType),
      ),
    )
    .filter((item): item is CanonicalSignalSource => item !== undefined);

  const totalEffectiveWeight = sources.reduce((sum, source) => sum + source.effectiveWeight, 0);
  let uncovered = 1;
  for (const source of sources) uncovered *= 1 - clamp01(source.effectiveWeight);

  return {
    affinity:
      totalEffectiveWeight > 0
        ? round1(
            sources.reduce(
              (sum, source) => sum + source.affinity * source.effectiveWeight,
              0,
            ) / totalEffectiveWeight,
          )
        : null,
    coverage: round1((1 - uncovered) * 100),
    sources,
    sourceEvidenceIds: uniqueSorted(
      sources.flatMap((source) =>
        source.contributions.flatMap((contribution) => contribution.sourceEvidenceIds),
      ),
    ),
  };
}

export function aggregateCanonicalSignalChannels(
  contributions: readonly CanonicalSignalContribution[],
): CanonicalSignalResult[] {
  return canonicalSignalDefinitions.map((definition) => ({
    signalId: definition.id,
    overall: aggregateChannel(definition.id, "overall", contributions),
    receiving: definition.channels.receiving
      ? aggregateChannel(definition.id, "receiving", contributions)
      : undefined,
    giving: definition.channels.giving
      ? aggregateChannel(definition.id, "giving", contributions)
      : undefined,
  }));
}

export function buildCanonicalSignalProfile(
  storedProfile: StoredProfile,
  catalogProfile: CatalogProfileState,
  catalog: readonly KinkCatalogItem[] = kinkCatalog,
) {
  const quiz = buildCanonicalQuizContributions(storedProfile);
  const direct = projectDirectCatalogEvidenceToSignals(catalogProfile, catalog);
  const explicit = buildCanonicalExplicitContributions(
    direct.filter(
      (item): item is ExplicitCatalogSignalProjection =>
        item.kind === "explicit_catalog_signal_projection",
    ),
  );
  const pairwise = buildCanonicalPairwiseContributions(
    direct.filter(
      (item): item is PairwiseCatalogSignalProjection =>
        item.kind === "pairwise_catalog_signal_projection",
    ),
  );

  return aggregateCanonicalSignalChannels([...quiz, ...explicit, ...pairwise]);
}

export function resolveSignalChannel(
  signal: CanonicalSignalResult | undefined,
  channel: SignalChannel = "overall",
) {
  if (!signal) return undefined;
  return channel === "overall" ? signal.overall : signal[channel];
}

export function signalResultById(signals: readonly CanonicalSignalResult[]) {
  return new Map(signals.map((signal) => [signal.signalId, signal]));
}
