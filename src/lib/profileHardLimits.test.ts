import { describe, expect, it } from "vitest";
import type { CatalogPreferenceState } from "./catalogProfile";
import type { CatalogResultItem, CatalogResultView } from "./catalogResults";
import { buildProfileHardLimits } from "./profileHardLimits";

function item(
  id: string,
  label: string,
  explicitState?: CatalogPreferenceState,
): CatalogResultItem {
  return {
    item: { id, label, categoryId: "test" } as CatalogResultItem["item"],
    explicitState,
    meaningfulPairwiseComparisons: 0,
    excludedFromNewRanking:
      explicitState === "hard_limit" ||
      explicitState === "not_interested" ||
      explicitState === "not_applicable",
  };
}

function view(items: CatalogResultItem[]): CatalogResultView {
  return {
    items,
    byCatalogId: new Map(items.map((entry) => [entry.item.id, entry])),
    exclusions: {
      hardLimits: items.filter((entry) => entry.explicitState === "hard_limit"),
      notInterested: items.filter(
        (entry) => entry.explicitState === "not_interested",
      ),
      notApplicable: items.filter(
        (entry) => entry.explicitState === "not_applicable",
      ),
    },
  };
}

describe("M7.7 hard-limit summary", () => {
  it("includes only explicit Hard Limit items", () => {
    const model = buildProfileHardLimits(
      view([
        item("hard", "Hard", "hard_limit"),
        item("no", "No", "not_interested"),
        item("na", "N/A", "not_applicable"),
        item("unsure", "Unsure", "unsure"),
        item("love", "Love", "love"),
      ]),
    );

    expect(model.all).toEqual([{ catalogId: "hard", label: "Hard" }]);
  });

  it("does not infer a limit from low or missing preference evidence", () => {
    const model = buildProfileHardLimits(
      view([
        item("unknown", "Unknown"),
        item("curious", "Curious", "curious"),
        item("unsure", "Unsure", "unsure"),
      ]),
    );

    expect(model.all).toEqual([]);
  });

  it("sorts limits deterministically by label rather than rank or insertion order", () => {
    const model = buildProfileHardLimits(
      view([
        item("z", "Zeta", "hard_limit"),
        item("a", "Alpha", "hard_limit"),
        item("m", "Middle", "hard_limit"),
      ]),
    );

    expect(model.all.map((entry) => entry.label)).toEqual([
      "Alpha",
      "Middle",
      "Zeta",
    ]);
  });

  it("shows six limits in the compact view and preserves the full list for expansion", () => {
    const items = Array.from({ length: 9 }, (_, index) =>
      item(
        `item-${index}`,
        `Limit ${String(index + 1).padStart(2, "0")}`,
        "hard_limit",
      ),
    );

    const model = buildProfileHardLimits(view(items));

    expect(model.featured).toHaveLength(6);
    expect(model.all).toHaveLength(9);
    expect(model.hiddenCount).toBe(3);
  });

  it("has no hidden count when six or fewer limits exist", () => {
    const model = buildProfileHardLimits(
      view([
        item("one", "One", "hard_limit"),
        item("two", "Two", "hard_limit"),
      ]),
    );

    expect(model.featured).toHaveLength(2);
    expect(model.hiddenCount).toBe(0);
  });
});
