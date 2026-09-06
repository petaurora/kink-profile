import {
  kinkCatalog,
  type KinkCatalogItem,
} from "../data/kinkCatalog.generated";
import { quizzes, type QuizId } from "../data/quizzes";
import { signalDefinitions, type SignalId } from "../data/signals";
import {
  filterEligibleCatalogItems,
  getCatalogPreference,
  type CatalogPreferenceState,
  type CatalogProfileState,
} from "./catalogProfile";
import {
  calculateRanking,
  isOrderingResult,
  selectCategoryFinalists,
  selectOverallCandidates,
} from "./kinkRanking";
import {
  buildAllCatalogEvidenceSnapshots,
  type InferredCatalogEvidence,
} from "./profileEvidence";
import type { StoredProfile } from "./profileStorage";

export const catalogPreferenceLabels: Record<CatalogPreferenceState, string> = {
  love: "Love",
  like: "Like",
  curious: "Curious",
  unsure: "Unsure",
  not_interested: "Not Interested",
  hard_limit: "Hard Limit",
  not_applicable: "Not Applicable",
};

export type CatalogRankContext = {
  rank: number;
  comparisons: number;
  confidence: number;
};

export type CatalogMatchedSignalResult = {
  signalId: SignalId;
  signalLabel: string;
  mappingWeight: number;
  signalAffinity: number;
  signalCoverage: number;
  sourceQuizIds: readonly QuizId[];
  sourceQuizLabels: readonly string[];
};

export type CatalogInferenceResult = {
  affinity: number;
  coverage: number;
  matchedSignals: readonly CatalogMatchedSignalResult[];
};

export type CatalogResultItem = {
  item: KinkCatalogItem;
  explicitState?: CatalogPreferenceState;
  categoryRank?: CatalogRankContext;
  overallRank?: CatalogRankContext;
  inferred?: CatalogInferenceResult;
  meaningfulPairwiseComparisons: number;
  excludedFromNewRanking: boolean;
};

export type CatalogExclusionSummary = {
  hardLimits: readonly CatalogResultItem[];
  notInterested: readonly CatalogResultItem[];
  notApplicable: readonly CatalogResultItem[];
};

export type CatalogResultView = {
  items: readonly CatalogResultItem[];
  byCatalogId: ReadonlyMap<string, CatalogResultItem>;
  exclusions: CatalogExclusionSummary;
};

const signalLabels = new Map(
  signalDefinitions.map((signal) => [signal.id, signal.label]),
);

const quizLabels = new Map(
  quizzes.map((quiz) => [quiz.id, quiz.shortTitle || quiz.title]),
);

function parseQuizEvidenceId(evidenceId: string): QuizId | undefined {
  const [sourceType, quizId] = evidenceId.split(":");
  if (sourceType !== "quiz" || !quizId) return undefined;

  return quizzes.some((quiz) => quiz.id === quizId)
    ? (quizId as QuizId)
    : undefined;
}

function toInferenceResult(
  inferred: InferredCatalogEvidence | undefined,
): CatalogInferenceResult | undefined {
  if (!inferred) return undefined;

  return {
    affinity: inferred.affinity,
    coverage: inferred.coverage,
    matchedSignals: inferred.matchedSignals.map((matched) => {
      const sourceQuizIds = [
        ...new Set(
          matched.sourceEvidenceIds
            .map(parseQuizEvidenceId)
            .filter((id): id is QuizId => id !== undefined),
        ),
      ];

      return {
        signalId: matched.signalId,
        signalLabel:
          signalLabels.get(matched.signalId) ??
          matched.signalId.replaceAll("_", " "),
        mappingWeight: matched.mappingWeight,
        signalAffinity: matched.signalAffinity,
        signalCoverage: matched.signalCoverage,
        sourceQuizIds,
        sourceQuizLabels: sourceQuizIds.map(
          (quizId) => quizLabels.get(quizId) ?? quizId,
        ),
      };
    }),
  };
}

function buildCategoryRankContext(
  eligibleCatalog: readonly KinkCatalogItem[],
  catalogProfile: CatalogProfileState,
) {
  const categoryRanks = new Map<string, CatalogRankContext>();
  const categoryIds = [...new Set(eligibleCatalog.map((item) => item.categoryId))];

  for (const categoryId of categoryIds) {
    const snapshot = calculateRanking(
      eligibleCatalog,
      catalogProfile.comparisons,
      { type: "category", categoryId },
    );

    for (const item of snapshot.items) {
      if (item.comparisons <= 0) continue;

      categoryRanks.set(item.id, {
        rank: item.rank,
        comparisons: item.comparisons,
        confidence: item.confidence,
      });
    }
  }

  return categoryRanks;
}

function buildOverallRankContext(
  eligibleCatalog: readonly KinkCatalogItem[],
  catalogProfile: CatalogProfileState,
) {
  const finalists = selectCategoryFinalists(
    eligibleCatalog,
    catalogProfile.comparisons,
    5,
  );
  const candidates = selectOverallCandidates(
    eligibleCatalog,
    finalists,
    catalogProfile.comparisons,
  );
  const snapshot = calculateRanking(
    candidates,
    catalogProfile.comparisons,
    { type: "overall" },
  );
  const overallRanks = new Map<string, CatalogRankContext>();

  for (const item of snapshot.items) {
    if (item.comparisons <= 0) continue;

    overallRanks.set(item.id, {
      rank: item.rank,
      comparisons: item.comparisons,
      confidence: item.confidence,
    });
  }

  return overallRanks;
}

export function buildCatalogResultView(
  storedProfile: StoredProfile,
  catalogProfile: CatalogProfileState,
  catalog: readonly KinkCatalogItem[] = kinkCatalog,
): CatalogResultView {
  const eligibleCatalog = filterEligibleCatalogItems(
    catalog,
    catalogProfile.preferences,
  );
  const eligibleIds = new Set(eligibleCatalog.map((item) => item.id));
  const categoryRanks = buildCategoryRankContext(
    eligibleCatalog,
    catalogProfile,
  );
  const overallRanks = buildOverallRankContext(
    eligibleCatalog,
    catalogProfile,
  );
  const evidenceSnapshots = buildAllCatalogEvidenceSnapshots(
    storedProfile,
    catalogProfile,
    catalog,
  );
  const evidenceById = new Map(
    evidenceSnapshots.map((snapshot) => [snapshot.catalogId, snapshot]),
  );

  const items = catalog.map((item): CatalogResultItem => {
    const evidence = evidenceById.get(item.id);
    const explicitState = getCatalogPreference(
      catalogProfile.preferences[item.id],
      "overall",
    );
    const meaningfulPairwiseComparisons =
      evidence?.pairwise.filter((pairwise) =>
        isOrderingResult(pairwise.result),
      ).length ?? 0;

    return {
      item,
      explicitState,
      categoryRank: categoryRanks.get(item.id),
      overallRank: overallRanks.get(item.id),
      inferred: toInferenceResult(evidence?.inferred),
      meaningfulPairwiseComparisons,
      excludedFromNewRanking: !eligibleIds.has(item.id),
    };
  });

  const byCatalogId = new Map(items.map((result) => [result.item.id, result]));

  return {
    items,
    byCatalogId,
    exclusions: {
      hardLimits: items.filter(
        (result) => result.explicitState === "hard_limit",
      ),
      notInterested: items.filter(
        (result) => result.explicitState === "not_interested",
      ),
      notApplicable: items.filter(
        (result) => result.explicitState === "not_applicable",
      ),
    },
  };
}
