import { describe, expect, it } from "vitest";
import type { CatalogProfileState } from "./catalogProfile";
import {
  calculateRankingMovement,
  getPreviousComparableRankingSnapshot,
  rankingMovementLabel,
} from "./kinkRankingMovement";

function profile(): CatalogProfileState {
  return {
    schemaVersion: 1,
    preferences: {},
    comparisons: [],
    rankingHistory: {
      activeRunId: "run-3",
      runs: {
        "run-1": {
          id: "run-1",
          startedAt: "2026-08-01T00:00:00.000Z",
          archivedAt: "2026-08-15T00:00:00.000Z",
          status: "archived",
          algorithmVersion: 1,
          snapshots: {
            categories: {
              pain: {
                capturedAt: "2026-08-15T00:00:00.000Z",
                confidence: 0.5,
                items: [
                  { catalogId: "a", rank: 7, comparisons: 4, confidence: 0.5 },
                ],
              },
            },
          },
        },
        "run-2": {
          id: "run-2",
          startedAt: "2026-08-15T00:00:00.000Z",
          archivedAt: "2026-09-01T00:00:00.000Z",
          status: "archived",
          algorithmVersion: 1,
          snapshots: {
            categories: {
              pain: {
                capturedAt: "2026-09-01T00:00:00.000Z",
                confidence: 0.7,
                items: [
                  { catalogId: "a", rank: 5, comparisons: 6, confidence: 0.75 },
                  { catalogId: "b", rank: 2, comparisons: 6, confidence: 0.75 },
                  { catalogId: "same", rank: 4, comparisons: 6, confidence: 0.75 },
                ],
              },
            },
            overall: {
              capturedAt: "2026-09-01T00:00:00.000Z",
              confidence: 0.6,
              items: [
                { catalogId: "overall-a", rank: 3, comparisons: 5, confidence: 0.625 },
              ],
            },
          },
        },
        "run-3": {
          id: "run-3",
          startedAt: "2026-09-01T00:00:00.000Z",
          status: "active",
          algorithmVersion: 1,
        },
      },
    },
  };
}

describe("M12 ranking movement", () => {
  it("uses the most recent archived snapshot for the same category", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "category",
      categoryId: "pain",
    });

    expect(previous?.run.id).toBe("run-2");
    expect(previous?.snapshot.capturedAt).toBe("2026-09-01T00:00:00.000Z");
  });

  it("falls back to an older archived run when the latest run lacks that scope", () => {
    const current = profile();
    delete current.rankingHistory?.runs["run-2"].snapshots?.categories.pain;

    const previous = getPreviousComparableRankingSnapshot(current, {
      type: "category",
      categoryId: "pain",
    });

    expect(previous?.run.id).toBe("run-1");
  });

  it("keeps category and Overall snapshots separate", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "overall",
    });

    expect(previous?.run.id).toBe("run-2");
    expect(previous?.snapshot.items[0]?.catalogId).toBe("overall-a");
  });

  it("calculates upward movement deterministically", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "category",
      categoryId: "pain",
    });
    const movement = calculateRankingMovement(
      { id: "a", rank: 2, comparisons: 3 },
      previous,
    );

    expect(movement).toMatchObject({
      kind: "up",
      places: 3,
      previousRank: 5,
    });
    expect(movement && rankingMovementLabel(movement)).toBe(
      "Up 3 places, previously rank 5",
    );
  });

  it("calculates downward movement", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "category",
      categoryId: "pain",
    });

    expect(
      calculateRankingMovement(
        { id: "b", rank: 6, comparisons: 2 },
        previous,
      ),
    ).toMatchObject({
      kind: "down",
      places: 4,
      previousRank: 2,
    });
  });

  it("calculates unchanged movement", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "category",
      categoryId: "pain",
    });

    expect(
      calculateRankingMovement(
        { id: "same", rank: 4, comparisons: 2 },
        previous,
      ),
    ).toMatchObject({
      kind: "same",
      places: 0,
      previousRank: 4,
    });
  });

  it("marks a meaningfully ranked current item absent previously as NEW", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "category",
      categoryId: "pain",
    });
    const movement = calculateRankingMovement(
      { id: "new-item", rank: 3, comparisons: 1 },
      previous,
    );

    expect(movement).toMatchObject({
      kind: "new",
      previousRank: null,
    });
  });

  it("does not invent movement for zero-evidence/default rows", () => {
    const previous = getPreviousComparableRankingSnapshot(profile(), {
      type: "category",
      categoryId: "pain",
    });

    expect(
      calculateRankingMovement(
        { id: "a", rank: 1, comparisons: 0 },
        previous,
      ),
    ).toBeNull();
  });

  it("returns no movement when no previous comparable snapshot exists", () => {
    expect(
      getPreviousComparableRankingSnapshot(profile(), {
        type: "category",
        categoryId: "restraint",
      }),
    ).toBeNull();
  });
});
