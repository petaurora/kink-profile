import type { KinkComparison } from "./kinkRanking";

export type KinkRankingProgress = {
  schemaVersion: 1;
  comparisons: KinkComparison[];
};

export const KINK_RANKING_STORAGE_KEY = "pet-profile-kink-ranking-v1";

export function createEmptyKinkRankingProgress(): KinkRankingProgress {
  return {
    schemaVersion: 1,
    comparisons: [],
  };
}

export function loadKinkRankingProgress(): KinkRankingProgress {
  try {
    const raw = localStorage.getItem(KINK_RANKING_STORAGE_KEY);
    if (!raw) return createEmptyKinkRankingProgress();

    const parsed = JSON.parse(raw) as KinkRankingProgress;
    if (parsed.schemaVersion === 1 && Array.isArray(parsed.comparisons)) {
      return parsed;
    }
  } catch {
    // Corrupt local ranking data should never block the app.
  }

  return createEmptyKinkRankingProgress();
}

export function saveKinkRankingProgress(progress: KinkRankingProgress) {
  localStorage.setItem(KINK_RANKING_STORAGE_KEY, JSON.stringify(progress));
}
