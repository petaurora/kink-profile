import { describe, expect, it } from "vitest";
import type { KinkCatalogItem } from "../data/kinkCatalog.generated";
import {
  createEmptyCatalogProfileState,
  setCatalogPreference,
} from "./catalogProfile";
import type { KinkComparison } from "./kinkRanking";
import type { StoredProfile } from "./profileStorage";
import { buildCatalogResultView } from "./catalogResults";

function item(
  id: string,
  label: string,
  categoryId = "cat-a",
  signalMappings: KinkCatalogItem["signalMappings"] = [],
): KinkCatalogItem {
  return {
    id,
    label,
    categoryId,
    categoryLabel: categoryId,
    domain: "power-exchange",
    direction: "both",
    aliases: [],
    signalMappings,
    description: "",
    typicalRole: "",
    primaryMode: "",
    intensity: "",
    riskLevel: "",
  } as KinkCatalogItem;
}

function comparison(
  id: string,
  leftKinkId: string,
  rightKinkId: string,
  result: KinkComparison["result"],
  scope: KinkComparison["scope"],
  timestamp = "2026-09-06T00:00:00.000Z",
): KinkComparison {
  return {
    id,
    leftKinkId,
    rightKinkId,
    result,
    scope,
    timestamp,
  };
}

const quizProfile: StoredProfile = {
  schemaVersion: 2,
  quizzes: {
    "dominance-submission": {
      quizVersion: 1,
      answers: {
        "ds-001": 4,
      },
    },
  },
};

describe("catalog result integration", () => {
  it("keeps explicit preference, ranking, and inferred affinity as separate channels", () => {
    const catalog = [
      item("a", "A", "cat-a", [
        { signalId: "receiving_control", weight: 1 },
      ]),
      item("b", "B"),
    ];
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "a",
      "overall",
      "like",
      "2026-09-06T00:00:00.000Z",
    );
    catalogProfile = {
      ...catalogProfile,
      comparisons: [
        comparison(
          "cat-1",
          "a",
          "b",
          "left",
          { type: "category", categoryId: "cat-a" },
        ),
      ],
    };

    const result = buildCatalogResultView(
      quizProfile,
      catalogProfile,
      catalog,
    ).byCatalogId.get("a");

    expect(result?.explicitState).toBe("like");
    expect(result?.categoryRank?.rank).toBe(1);
    expect(result?.inferred?.affinity).toBe(100);
    expect(result).not.toHaveProperty("score");
    expect(result).not.toHaveProperty("mergedScore");
  });

  it("retains matched-signal and quiz provenance for inferred affinity", () => {
    const catalog = [
      item("a", "A", "cat-a", [
        { signalId: "receiving_control", weight: 1 },
      ]),
    ];
    const result = buildCatalogResultView(
      quizProfile,
      createEmptyCatalogProfileState(),
      catalog,
    ).byCatalogId.get("a");

    expect(result?.inferred?.matchedSignals).toEqual([
      expect.objectContaining({
        signalId: "receiving_control",
        signalLabel: "Receiving Control",
        sourceQuizIds: ["dominance-submission"],
      }),
    ]);
    expect(
      result?.inferred?.matchedSignals[0]?.sourceQuizLabels[0],
    ).toBeTruthy();
  });

  it("keeps an explicit Hard Limit authoritative while preserving conflicting inference", () => {
    const catalog = [
      item("a", "A", "cat-a", [
        { signalId: "receiving_control", weight: 1 },
      ]),
      item("b", "B"),
    ];
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "a",
      "overall",
      "hard_limit",
      "2026-09-06T00:00:00.000Z",
    );
    catalogProfile = {
      ...catalogProfile,
      comparisons: [
        comparison(
          "cat-1",
          "a",
          "b",
          "left",
          { type: "category", categoryId: "cat-a" },
        ),
      ],
    };

    const result = buildCatalogResultView(
      quizProfile,
      catalogProfile,
      catalog,
    ).byCatalogId.get("a");

    expect(result?.explicitState).toBe("hard_limit");
    expect(result?.excludedFromNewRanking).toBe(true);
    expect(result?.categoryRank).toBeUndefined();
    expect(result?.inferred?.affinity).toBe(100);
    expect(result?.meaningfulPairwiseComparisons).toBe(1);
  });

  it("builds Hard Limit, Not Interested, and Not Applicable summaries separately", () => {
    const catalog = [
      item("limit", "Limit"),
      item("no", "No"),
      item("na", "N/A"),
      item("like", "Like"),
    ];
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "limit",
      "overall",
      "hard_limit",
      "2026-09-06T00:00:00.000Z",
    );
    profile = setCatalogPreference(
      profile,
      "no",
      "overall",
      "not_interested",
      "2026-09-06T00:01:00.000Z",
    );
    profile = setCatalogPreference(
      profile,
      "na",
      "overall",
      "not_applicable",
      "2026-09-06T00:02:00.000Z",
    );
    profile = setCatalogPreference(
      profile,
      "like",
      "overall",
      "like",
      "2026-09-06T00:03:00.000Z",
    );

    const summary = buildCatalogResultView(
      { schemaVersion: 2, quizzes: {} },
      profile,
      catalog,
    ).exclusions;

    expect(summary.hardLimits.map((entry) => entry.item.id)).toEqual([
      "limit",
    ]);
    expect(summary.notInterested.map((entry) => entry.item.id)).toEqual([
      "no",
    ]);
    expect(summary.notApplicable.map((entry) => entry.item.id)).toEqual([
      "na",
    ]);
  });

  it("derives Overall rank from the C5 candidate pool including prior meaningful participants", () => {
    const catalog = [
      item("old-a", "Old A", "cat-a"),
      item("old-b", "Old B", "cat-a"),
      item("new-c", "New C", "cat-b"),
      item("new-d", "New D", "cat-b"),
    ];
    const profile = {
      ...createEmptyCatalogProfileState(),
      comparisons: [
        comparison(
          "cat-b-1",
          "new-c",
          "new-d",
          "left",
          { type: "category", categoryId: "cat-b" },
          "2026-09-06T00:00:01.000Z",
        ),
        comparison(
          "overall-1",
          "old-a",
          "old-b",
          "left",
          { type: "overall" },
          "2026-09-06T00:00:02.000Z",
        ),
      ],
    };

    const view = buildCatalogResultView(
      { schemaVersion: 2, quizzes: {} },
      profile,
      catalog,
    );

    expect(view.byCatalogId.get("old-a")?.overallRank?.rank).toBeDefined();
    expect(view.byCatalogId.get("old-b")?.overallRank?.rank).toBeDefined();
    expect(view.byCatalogId.get("new-c")?.overallRank).toBeUndefined();
    expect(view.byCatalogId.get("new-d")?.overallRank).toBeUndefined();
  });

  it("does not turn Skip/Neither history into rank context", () => {
    const catalog = [item("a", "A"), item("b", "B")];
    const profile = {
      ...createEmptyCatalogProfileState(),
      comparisons: [
        comparison(
          "skip-1",
          "a",
          "b",
          "skip",
          { type: "category", categoryId: "cat-a" },
        ),
        comparison(
          "neither-1",
          "a",
          "b",
          "neither",
          { type: "overall" },
        ),
      ],
    };

    const result = buildCatalogResultView(
      { schemaVersion: 2, quizzes: {} },
      profile,
      catalog,
    ).byCatalogId.get("a");

    expect(result?.categoryRank).toBeUndefined();
    expect(result?.overallRank).toBeUndefined();
    expect(result?.meaningfulPairwiseComparisons).toBe(0);
  });
});
