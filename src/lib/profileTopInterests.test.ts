import { describe, expect, it } from "vitest";
import type {
  CatalogPreferenceState,
} from "./catalogProfile";
import type {
  CatalogRankContext,
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import { buildProfileTopInterests } from "./profileTopInterests";

function result(
  id: string,
  label: string,
  options: {
    explicitState?: CatalogPreferenceState;
    overallRank?: CatalogRankContext;
    inferredAffinity?: number;
  } = {},
): CatalogResultItem {
  return {
    item: {
      id,
      label,
      categoryId: "test-category",
    } as CatalogResultItem["item"],
    explicitState: options.explicitState,
    overallRank: options.overallRank,
    inferred:
      options.inferredAffinity === undefined
        ? undefined
        : {
            affinity: options.inferredAffinity,
            coverage: 100,
            matchedSignals: [],
          },
    meaningfulPairwiseComparisons:
      options.overallRank?.comparisons ?? 0,
    excludedFromNewRanking: false,
  };
}

function view(items: CatalogResultItem[]): CatalogResultView {
  return {
    items,
    byCatalogId: new Map(items.map((item) => [item.item.id, item])),
    exclusions: {
      hardLimits: [],
      notInterested: [],
      notApplicable: [],
    },
  };
}

describe("M7.6 Top Overall direct-evidence aggregation", () => {
  it("orders explicit Love, Like, and Curious without requiring pairwise rank", () => {
    const top = buildProfileTopInterests(
      view([
        result("curious", "Curious", { explicitState: "curious" }),
        result("love", "Love", { explicitState: "love" }),
        result("like", "Like", { explicitState: "like" }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual([
      "love",
      "like",
      "curious",
    ]);
    expect(top.map((item) => item.aggregateScore)).toEqual([80.3, 69.4, 59.1]);
  });

  it("includes Overall This-or-That evidence even without an explicit positive state", () => {
    const top = buildProfileTopInterests(
      view([
        result("one", "One", {
          overallRank: { rank: 1, comparisons: 8, confidence: 1 },
        }),
        result("two", "Two", {
          overallRank: { rank: 2, comparisons: 6, confidence: 0.75 },
        }),
        result("three", "Three", {
          overallRank: { rank: 3, comparisons: 4, confidence: 0.5 },
        }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(top.map((item) => item.aggregateScore)).toEqual([
      75,
      63.1,
      52.3,
    ]);
  });

  it("reinforces an item when explicit Love and top pairwise placement agree", () => {
    const top = buildProfileTopInterests(
      view([
        result("reinforced", "Reinforced", {
          explicitState: "love",
          overallRank: { rank: 1, comparisons: 8, confidence: 1 },
        }),
        result("explicit-only", "Explicit only", {
          explicitState: "love",
        }),
      ]),
    );

    expect(top[0]).toEqual(
      expect.objectContaining({
        catalogId: "reinforced",
        sourceCount: 2,
        aggregateScore: 100,
        sources: ["explicit", "pairwise"],
      }),
    );
    expect(top[1].catalogId).toBe("explicit-only");
  });

  it("does not let alphabetic Love-only items outrank well-refined Overall favorites", () => {
    const rankedLove = Array.from({ length: 10 }, (_, index) =>
      result(
        `ranked-${index + 1}`,
        index === 0
          ? "Edging"
          : index === 1
            ? "Collaring"
            : `Ranked ${String(index + 1).padStart(2, "0")}`,
        {
          explicitState: "love",
          overallRank: {
            rank: index + 1,
            comparisons: 8,
            confidence: 1,
          },
        },
      ),
    );

    const top = buildProfileTopInterests(
      view([
        result("anal-sex", "Anal sex", { explicitState: "love" }),
        result("anticipation-play", "Anticipation play", {
          explicitState: "love",
        }),
        ...rankedLove,
      ]),
    );

    expect(top.slice(0, 2).map((item) => item.label)).toEqual([
      "Edging",
      "Collaring",
    ]);
    expect(
      top.find((item) => item.catalogId === "anal-sex")?.aggregateScore,
    ).toBeLessThan(top[1].aggregateScore);
  });

  it("uses quiz affinity as a bounded modifier only after direct eligibility exists", () => {
    const top = buildProfileTopInterests(
      view([
        result("high-fit", "High fit", {
          explicitState: "love",
          inferredAffinity: 100,
        }),
        result("low-fit", "Low fit", {
          explicitState: "love",
          inferredAffinity: 10,
        }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual([
      "high-fit",
      "low-fit",
    ]);
    expect(top[0].directScore).toBe(top[1].directScore);
    expect(top[0].quizFit).toEqual(
      expect.objectContaining({
        affinity: 100,
        coverage: 100,
        multiplier: 1.1,
      }),
    );
    expect(top[0].aggregateScore).toBeGreaterThan(
      top[0].directScore,
    );
  });

  it("scales quiz influence down when Overall pairwise confidence is strong", () => {
    const top = buildProfileTopInterests(
      view([
        result("ranked", "Ranked", {
          explicitState: "love",
          inferredAffinity: 100,
          overallRank: {
            rank: 1,
            comparisons: 8,
            confidence: 1,
          },
        }),
      ]),
    );

    expect(top[0].quizFit?.multiplier).toBe(1.03);
    expect(top[0].aggregateScore).toBe(
      Math.round(top[0].directScore * 1.03 * 10) / 10,
    );
  });

  it("makes quiz fit coverage-aware instead of treating sparse mappings as fully known", () => {
    const full = result("full", "Full", {
      explicitState: "like",
      inferredAffinity: 100,
    });
    const sparse = result("sparse", "Sparse", {
      explicitState: "like",
      inferredAffinity: 100,
    });

    full.inferred = {
      affinity: 100,
      coverage: 100,
      matchedSignals: [],
    };
    sparse.inferred = {
      affinity: 100,
      coverage: 20,
      matchedSignals: [],
    };

    const top = buildProfileTopInterests(view([sparse, full]));

    expect(top[0].catalogId).toBe("full");
    expect(top[0].quizFit?.multiplier).toBe(1.1);
    expect(top[1].quizFit?.multiplier).toBe(1.02);
  });

  it("does not let quiz fit create Top Overall eligibility", () => {
    const top = buildProfileTopInterests(
      view([
        result("quiz-only", "Quiz only", {
          inferredAffinity: 100,
        }),
        result("direct", "Direct", {
          explicitState: "curious",
          inferredAffinity: 20,
        }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual(["direct"]);
  });

  it("does not allow quiz-derived inference to place an item into Top Overall", () => {
    const top = buildProfileTopInterests(
      view([
        result("inferred-only", "Inferred only", {
          inferredAffinity: 100,
        }),
        result("direct", "Direct", {
          explicitState: "like",
          inferredAffinity: 10,
        }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual(["direct"]);
  });

  it("excludes Hard Limit, Not Interested, and Not Applicable even when historical pairwise rank exists", () => {
    const ranked = { rank: 1, comparisons: 8, confidence: 1 };

    const top = buildProfileTopInterests(
      view([
        result("hard", "Hard", {
          explicitState: "hard_limit",
          overallRank: ranked,
        }),
        result("no", "No", {
          explicitState: "not_interested",
          overallRank: ranked,
        }),
        result("na", "N/A", {
          explicitState: "not_applicable",
          overallRank: ranked,
        }),
        result("yes", "Yes", {
          explicitState: "love",
        }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual(["yes"]);
  });

  it("does not treat Unsure alone as a positive Top Overall signal, but preserves real pairwise evidence", () => {
    const top = buildProfileTopInterests(
      view([
        result("unsure-only", "Unsure only", {
          explicitState: "unsure",
        }),
        result("unsure-ranked", "Unsure ranked", {
          explicitState: "unsure",
          overallRank: { rank: 1, comparisons: 3, confidence: 0.375 },
        }),
      ]),
    );

    expect(top).toHaveLength(1);
    expect(top[0]).toEqual(
      expect.objectContaining({
        catalogId: "unsure-ranked",
        explicitState: undefined,
        sources: ["pairwise"],
      }),
    );
  });

  it("uses the aggregate score to allow strong pairwise evidence to refine explicit-state ordering", () => {
    const top = buildProfileTopInterests(
      view([
        result("like-low-rank", "Like low rank", {
          explicitState: "like",
          overallRank: { rank: 3, comparisons: 8, confidence: 1 },
        }),
        result("curious-top-rank", "Curious top rank", {
          explicitState: "curious",
          overallRank: { rank: 1, comparisons: 8, confidence: 1 },
        }),
        result("middle", "Middle", {
          overallRank: { rank: 2, comparisons: 8, confidence: 1 },
        }),
      ]),
    );

    expect(top[0].catalogId).toBe("curious-top-rank");
    expect(top.map((item) => item.catalogId)).toContain("like-low-rank");
  });

  it("shows fewer than ten instead of padding with inferred or unanswered items", () => {
    const top = buildProfileTopInterests(
      view([
        result("one", "One", { explicitState: "love" }),
        result("two", "Two", { explicitState: "like" }),
      ]),
      10,
    );

    expect(top).toHaveLength(2);
  });

  it("caps the profile surface at ten items by default", () => {
    const items = Array.from({ length: 14 }, (_, index) =>
      result(`item-${index}`, `Item ${String(index).padStart(2, "0")}`, {
        explicitState: index < 7 ? "love" : "like",
      }),
    );

    expect(buildProfileTopInterests(view(items))).toHaveLength(10);
  });

  it("uses deterministic label ordering after all direct-evidence tie-breakers", () => {
    const top = buildProfileTopInterests(
      view([
        result("beta", "Beta", { explicitState: "like" }),
        result("alpha", "Alpha", { explicitState: "like" }),
      ]),
    );

    expect(top.map((item) => item.label)).toEqual(["Alpha", "Beta"]);
  });
});
