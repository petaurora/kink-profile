import { describe, expect, it } from "vitest";
import type { KinkComparison } from "../../lib/kinkRanking";
import {
  mostRecentRankedCategoryId,
  suggestedRankingCategoryId,
} from "./KinkThisOrThat";

function comparison(
  categoryId: string,
  timestamp: string,
  result: KinkComparison["result"] = "left",
): KinkComparison {
  return {
    id: `${categoryId}-${timestamp}`,
    runId: "run-1",
    leftKinkId: "left",
    rightKinkId: "right",
    scope: { type: "category", categoryId },
    result,
    timestamp,
  };
}

describe("activity-first kink ranking helpers", () => {
  it("resumes the most recently ordered category and ignores skips", () => {
    expect(
      mostRecentRankedCategoryId([
        comparison("bondage", "2026-09-14T10:00:00.000Z"),
        comparison("care", "2026-09-14T11:00:00.000Z", "skip"),
        comparison("sensation", "2026-09-14T12:00:00.000Z"),
      ]),
    ).toBe("sensation");
  });

  it("returns null when there is no meaningful category ordering yet", () => {
    expect(
      mostRecentRankedCategoryId([
        comparison("care", "2026-09-14T11:00:00.000Z", "skip"),
      ]),
    ).toBeNull();
  });

  it("picks an under-refined category before an unstarted or refined one", () => {
    expect(
      suggestedRankingCategoryId(
        [
          { id: "refined", comparisons: 50, confidence: 0.8 },
          { id: "under-refined", comparisons: 7, confidence: 0.2 },
          { id: "unstarted", comparisons: 0, confidence: 0 },
        ],
        "refined",
      ),
    ).toBe("under-refined");
  });

  it("does not keep picking the current category when another option exists", () => {
    expect(
      suggestedRankingCategoryId(
        [
          { id: "current", comparisons: 4, confidence: 0.1 },
          { id: "other", comparisons: 0, confidence: 0 },
        ],
        "current",
      ),
    ).toBe("other");
  });
});
