import { describe, expect, it } from "vitest";
import type { KinkCatalogItem } from "../data/kinkCatalog.generated";
import {
  calculateRanking,
  countOrderingComparisonsForScope,
  isOrderingResult,
  selectCategoryFinalists,
  selectOverallCandidates,
  type ComparisonResult,
  type KinkComparison,
  type RankingScope,
} from "./kinkRanking";

function item(
  id: string,
  label: string,
  categoryId = "cat-a",
): KinkCatalogItem {
  return {
    id,
    label,
    categoryId,
    categoryLabel: categoryId,
    domain: "power-exchange",
    direction: "both",
    aliases: [],
    signalMappings: [],
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
  result: ComparisonResult,
  scope: RankingScope = { type: "category", categoryId: "cat-a" },
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

describe("meaningful ordering evidence", () => {
  it("treats only left/right/equal as ordering results", () => {
    expect(isOrderingResult("left")).toBe(true);
    expect(isOrderingResult("right")).toBe(true);
    expect(isOrderingResult("equal")).toBe(true);
    expect(isOrderingResult("neither")).toBe(false);
    expect(isOrderingResult("skip")).toBe(false);
  });

  it("does not let Skip inflate item or scope confidence", () => {
    const catalog = [item("a", "A"), item("b", "B")];
    const scope: RankingScope = { type: "category", categoryId: "cat-a" };
    const comparisons = [comparison("skip-1", "a", "b", "skip", scope)];

    const snapshot = calculateRanking(catalog, comparisons, scope);

    expect(snapshot.confidence).toBe(0);
    expect(snapshot.items.map((entry) => entry.comparisons)).toEqual([0, 0]);
    expect(snapshot.items.map((entry) => entry.rating)).toEqual([1500, 1500]);
    expect(countOrderingComparisonsForScope(comparisons, scope)).toBe(0);
  });

  it("does not let Neither inflate ordering confidence", () => {
    const catalog = [item("a", "A"), item("b", "B")];
    const scope: RankingScope = { type: "category", categoryId: "cat-a" };
    const comparisons = [
      comparison("neither-1", "a", "b", "neither", scope),
    ];

    const snapshot = calculateRanking(catalog, comparisons, scope);

    expect(snapshot.confidence).toBe(0);
    expect(snapshot.items.map((entry) => entry.comparisons)).toEqual([0, 0]);
    expect(snapshot.items.map((entry) => entry.rating)).toEqual([1500, 1500]);
    expect(countOrderingComparisonsForScope(comparisons, scope)).toBe(0);
  });

  it("counts Equal as real ordering evidence without separating ratings", () => {
    const catalog = [item("a", "A"), item("b", "B")];
    const scope: RankingScope = { type: "category", categoryId: "cat-a" };
    const comparisons = [comparison("equal-1", "a", "b", "equal", scope)];

    const snapshot = calculateRanking(catalog, comparisons, scope);

    expect(snapshot.confidence).toBeGreaterThan(0);
    expect(snapshot.items.map((entry) => entry.comparisons)).toEqual([1, 1]);
    expect(snapshot.items.map((entry) => entry.rating)).toEqual([1500, 1500]);
    expect(countOrderingComparisonsForScope(comparisons, scope)).toBe(1);
  });

  it("counts left/right results and changes Elo normally", () => {
    const catalog = [item("a", "A"), item("b", "B")];
    const scope: RankingScope = { type: "category", categoryId: "cat-a" };
    const comparisons = [comparison("left-1", "a", "b", "left", scope)];

    const snapshot = calculateRanking(catalog, comparisons, scope);
    const a = snapshot.items.find((entry) => entry.id === "a");
    const b = snapshot.items.find((entry) => entry.id === "b");

    expect(a?.comparisons).toBe(1);
    expect(b?.comparisons).toBe(1);
    expect(a?.rating).toBeGreaterThan(1500);
    expect(b?.rating).toBeLessThan(1500);
  });
});

describe("finalist promotion", () => {
  it("does not promote a category from only Skip/Neither interactions", () => {
    const catalog = [
      item("a", "A"),
      item("b", "B"),
      item("c", "C"),
      item("d", "D"),
    ];
    const comparisons = [
      comparison("skip-1", "a", "b", "skip"),
      comparison("neither-1", "c", "d", "neither"),
    ];

    expect(selectCategoryFinalists(catalog, comparisons, 5)).toEqual([]);
  });

  it("one meaningful comparison promotes only the items actually involved", () => {
    const catalog = [
      item("a", "A"),
      item("b", "B"),
      item("c", "C"),
      item("d", "D"),
      item("e", "E"),
      item("f", "F"),
    ];
    const comparisons = [comparison("cmp-1", "a", "b", "left")];

    const finalists = selectCategoryFinalists(catalog, comparisons, 5);

    expect(finalists.map((entry) => entry.id)).toEqual(["a", "b"]);
    expect(finalists.every((entry) => entry.comparisons > 0)).toBe(true);
  });

  it("caps evidenced finalists at the configured count", () => {
    const catalog = [
      item("a", "A"),
      item("b", "B"),
      item("c", "C"),
      item("d", "D"),
      item("e", "E"),
      item("f", "F"),
    ];
    const comparisons = [
      comparison("cmp-1", "a", "b", "left", undefined, "2026-09-06T00:00:01.000Z"),
      comparison("cmp-2", "c", "d", "left", undefined, "2026-09-06T00:00:02.000Z"),
      comparison("cmp-3", "e", "f", "left", undefined, "2026-09-06T00:00:03.000Z"),
    ];

    const finalists = selectCategoryFinalists(catalog, comparisons, 5);

    expect(finalists).toHaveLength(5);
    expect(finalists.every((entry) => entry.comparisons > 0)).toBe(true);
  });
});

describe("Overall candidate preservation", () => {
  it("keeps prior meaningful Overall participants after they leave current finalists", () => {
    const catalog = [
      item("a", "A"),
      item("b", "B"),
      item("c", "C"),
      item("d", "D"),
    ];
    const currentFinalists = [catalog[2], catalog[3]];
    const comparisons = [
      comparison(
        "overall-1",
        "a",
        "b",
        "left",
        { type: "overall" },
      ),
    ];

    const candidates = selectOverallCandidates(
      catalog,
      currentFinalists,
      comparisons,
    );

    expect(candidates.map((entry) => entry.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("does not retain Skip/Neither-only Overall participants as ranking candidates", () => {
    const catalog = [item("a", "A"), item("b", "B"), item("c", "C")];
    const currentFinalists = [catalog[2]];
    const comparisons = [
      comparison("skip-1", "a", "b", "skip", { type: "overall" }),
      comparison("neither-1", "a", "b", "neither", { type: "overall" }),
    ];

    const candidates = selectOverallCandidates(
      catalog,
      currentFinalists,
      comparisons,
    );

    expect(candidates.map((entry) => entry.id)).toEqual(["c"]);
  });

  it("uses the eligible catalog as the authority for excluded historical participants", () => {
    const fullCatalog = [item("a", "A"), item("b", "B"), item("c", "C")];
    const eligibleCatalog = [fullCatalog[1], fullCatalog[2]];
    const comparisons = [
      comparison("overall-1", "a", "b", "left", { type: "overall" }),
    ];

    const candidates = selectOverallCandidates(
      eligibleCatalog,
      [fullCatalog[2]],
      comparisons,
    );

    expect(candidates.map((entry) => entry.id)).toEqual(["b", "c"]);
    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].leftKinkId).toBe("a");
  });

  it("keeps historical Overall Elo meaningful when the current finalist set changes", () => {
    const catalog = [
      item("a", "A"),
      item("b", "B"),
      item("c", "C"),
      item("d", "D"),
    ];
    const overallScope: RankingScope = { type: "overall" };
    const comparisons = [
      comparison("overall-1", "a", "b", "left", overallScope),
    ];
    const currentFinalists = [catalog[2], catalog[3]];

    const candidates = selectOverallCandidates(
      catalog,
      currentFinalists,
      comparisons,
    );
    const snapshot = calculateRanking(
      candidates,
      comparisons,
      overallScope,
    );

    expect(snapshot.items.find((entry) => entry.id === "a")?.rating).toBeGreaterThan(1500);
    expect(snapshot.items.find((entry) => entry.id === "b")?.rating).toBeLessThan(1500);
    expect(snapshot.items.find((entry) => entry.id === "c")?.rating).toBe(1500);
    expect(snapshot.items.find((entry) => entry.id === "d")?.rating).toBe(1500);
  });
});
