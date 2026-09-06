import type { CatalogPreferenceState } from "./catalogProfile";
import type { CatalogResultView } from "./catalogResults";
import {
  buildProfileTopInterests,
  type TopInterestEvidenceSource,
} from "./profileTopInterests";

export type InterestAreaCategory = {
  id: string;
  label: string;
};

export type ProfileInterestAreaItem = {
  catalogId: string;
  label: string;
  explicitState?: CatalogPreferenceState;
  sources: readonly TopInterestEvidenceSource[];
};

export type ProfileInterestArea = {
  categoryId: string;
  label: string;
  relevanceScore: number;
  evidenceItemCount: number;
  representativeItems: readonly ProfileInterestAreaItem[];
};

const representativeItemCount = 3;
const defaultAreaCount = 6;
const representativeWeights = [1, 0.7, 0.5] as const;

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function relevanceScore(scores: readonly number[]) {
  if (scores.length === 0) return 0;

  let weightedTotal = 0;
  let weightTotal = 0;

  scores.slice(0, representativeItemCount).forEach((score, index) => {
    const weight = representativeWeights[index] ?? 0;
    weightedTotal += score * weight;
    weightTotal += weight;
  });

  if (weightTotal <= 0) return 0;

  const weightedMean = weightedTotal / weightTotal;
  const breadthFactor =
    0.7 + 0.1 * Math.min(representativeItemCount, scores.length);

  return round1(weightedMean * breadthFactor);
}

export function buildProfileInterestAreas(
  resultView: CatalogResultView,
  categories: readonly InterestAreaCategory[],
  maxAreas = defaultAreaCount,
): ProfileInterestArea[] {
  const directInterests = buildProfileTopInterests(
    resultView,
    resultView.items.length,
  );
  const categoryLabels = new Map(
    categories.map((category) => [category.id, category.label]),
  );

  const byCategory = new Map<string, typeof directInterests>();

  for (const interest of directInterests) {
    const current = byCategory.get(interest.categoryId) ?? [];
    current.push(interest);
    byCategory.set(interest.categoryId, current);
  }

  return [...byCategory.entries()]
    .map(([categoryId, interests]): ProfileInterestArea => {
      const representative = interests.slice(0, representativeItemCount);

      return {
        categoryId,
        label:
          categoryLabels.get(categoryId) ??
          categoryId.replaceAll("-", " ").replaceAll("_", " "),
        relevanceScore: relevanceScore(
          representative.map((interest) => interest.aggregateScore),
        ),
        evidenceItemCount: interests.length,
        representativeItems: representative.map((interest) => ({
          catalogId: interest.catalogId,
          label: interest.label,
          explicitState: interest.explicitState,
          sources: interest.sources,
        })),
      };
    })
    .sort((left, right) => {
      if (right.relevanceScore !== left.relevanceScore) {
        return right.relevanceScore - left.relevanceScore;
      }
      if (right.evidenceItemCount !== left.evidenceItemCount) {
        return right.evidenceItemCount - left.evidenceItemCount;
      }
      const leftTop = left.representativeItems[0]?.label ?? "";
      const rightTop = right.representativeItems[0]?.label ?? "";
      const topCompare = leftTop.localeCompare(rightTop);
      if (topCompare !== 0) return topCompare;
      return left.label.localeCompare(right.label);
    })
    .slice(0, Math.max(0, maxAreas));
}
