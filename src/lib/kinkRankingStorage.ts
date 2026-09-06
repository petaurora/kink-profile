import type { KinkComparison } from "./kinkRanking";

export type LegacyKinkRankingProgressV1 = {
  schemaVersion: 1;
  comparisons: KinkComparison[];
};

export const LEGACY_KINK_RANKING_STORAGE_KEY =
  "pet-profile-kink-ranking-v1";
