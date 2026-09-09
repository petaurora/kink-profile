import { describe, expect, it } from "vitest";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import { getSceneProfileReadiness } from "./sceneProfileReadiness";

function result(
  id: string,
  overrides: Partial<CatalogResultItem> = {},
): CatalogResultItem {
  return {
    item: {
      id,
      label: id,
      categoryId: "misc",
      categoryLabel: "Misc",
      domain: "misc" as never,
      direction: "both",
      aliases: [],
      signalMappings: [],
      description: "",
      typicalRole: "Both",
      intensity: "Variable",
      riskLevel: "",
    },
    meaningfulPairwiseComparisons: 0,
    excludedFromNewRanking: false,
    ...overrides,
  };
}

function view(items: CatalogResultItem[]): CatalogResultView {
  return {
    items,
    byCatalogId: new Map(
      items.map((item) => [item.item.id, item]),
    ),
    exclusions: {
      hardLimits: [],
      notInterested: [],
      notApplicable: [],
    },
  };
}

describe("M13.9 scene profile readiness", () => {
  it("recognizes a profile with no direct or inferred evidence", () => {
    expect(
      getSceneProfileReadiness(view([result("one"), result("two")])),
    ).toEqual({
      state: "unprofiled",
      directEvidenceCount: 0,
      inferredEvidenceCount: 0,
    });
  });

  it("treats inference-only profiles as emerging rather than automatic-ready", () => {
    const readiness = getSceneProfileReadiness(
      view([
        result("inferred", {
          inferred: {
            affinity: 80,
            coverage: 70,
            matchedSignals: [],
          },
        }),
      ]),
    );

    expect(readiness.state).toBe("emerging");
    expect(readiness.directEvidenceCount).toBe(0);
    expect(readiness.inferredEvidenceCount).toBe(1);
  });

  it("counts explicit preference and pairwise/rank history as direct evidence", () => {
    const readiness = getSceneProfileReadiness(
      view([
        result("explicit", { explicitState: "like" }),
        result("pairwise", {
          meaningfulPairwiseComparisons: 3,
        }),
        result("ranked", {
          overallRank: {
            rank: 1,
            comparisons: 4,
            confidence: 0.5,
          },
        }),
      ]),
    );

    expect(readiness.state).toBe("emerging");
    expect(readiness.directEvidenceCount).toBe(3);
  });

  it("marks a sufficiently populated direct profile ready without requiring inference", () => {
    const readiness = getSceneProfileReadiness(
      view(
        Array.from({ length: 5 }, (_, index) =>
          result("item-" + index, {
            explicitState: "like",
          }),
        ),
      ),
    );

    expect(readiness.state).toBe("ready");
    expect(readiness.directEvidenceCount).toBe(5);
  });
});
