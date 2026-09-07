import { describe, expect, it } from "vitest";
import type { CatalogPreferenceState } from "./catalogProfile";
import type {
  CatalogRankContext,
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import { buildProfileInterestAreas } from "./profileInterestAreas";

function result(
  id: string,
  label: string,
  categoryId: string,
  options: {
    explicitState?: CatalogPreferenceState;
    overallRank?: CatalogRankContext;
    inferredAffinity?: number;
  } = {},
): CatalogResultItem {
  return {
    item: { id, label, categoryId } as CatalogResultItem["item"],
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
    excludedFromNewRanking:
      options.explicitState === "hard_limit" ||
      options.explicitState === "not_interested" ||
      options.explicitState === "not_applicable",
  };
}

function view(items: CatalogResultItem[]): CatalogResultView {
  return {
    items,
    byCatalogId: new Map(items.map((item) => [item.item.id, item])),
    exclusions: {
      hardLimits: items.filter((item) => item.explicitState === "hard_limit"),
      notInterested: items.filter(
        (item) => item.explicitState === "not_interested",
      ),
      notApplicable: items.filter(
        (item) => item.explicitState === "not_applicable",
      ),
    },
  };
}

const categories = [
  { id: "service", label: "Protocol, Obedience & Service" },
  { id: "primal", label: "Primal Play" },
  { id: "bondage", label: "Bondage & Restraint" },
  { id: "pain", label: "Pain & Sensation" },
  { id: "ownership", label: "Ownership" },
  { id: "care", label: "Care" },
  { id: "misc", label: "Miscellaneous" },
];

describe("M7.8 Interest Areas", () => {
  it("groups positive direct interests by catalog category", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("service-1", "Domestic service", "service", {
          explicitState: "love",
        }),
        result("service-2", "High protocol", "service", {
          explicitState: "like",
        }),
        result("primal-1", "Chase", "primal", {
          explicitState: "love",
        }),
      ]),
      categories,
    );

    const service = areas.find((area) => area.categoryId === "service");

    expect(service).toEqual(
      expect.objectContaining({
        label: "Protocol, Obedience & Service",
        evidenceItemCount: 2,
      }),
    );
    expect(service?.representativeItems.map((item) => item.label)).toEqual([
      "Domestic service",
      "High protocol",
    ]);
  });

  it("keeps only the top three representative items per area", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("one", "One", "service", { explicitState: "love" }),
        result("two", "Two", "service", { explicitState: "like" }),
        result("three", "Three", "service", { explicitState: "like" }),
        result("four", "Four", "service", { explicitState: "curious" }),
      ]),
      categories,
    );

    expect(areas[0].evidenceItemCount).toBe(4);
    expect(areas[0].representativeItems).toHaveLength(3);
  });

  it("uses breadth so several strong direct interests can beat one isolated Love", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("single-love", "Single Love", "primal", {
          explicitState: "love",
        }),
        result("service-a", "Service A", "service", {
          explicitState: "like",
        }),
        result("service-b", "Service B", "service", {
          explicitState: "like",
        }),
        result("service-c", "Service C", "service", {
          explicitState: "like",
        }),
      ]),
      categories,
    );

    expect(areas[0].categoryId).toBe("service");
    expect(areas[1].categoryId).toBe("primal");
  });

  it("does not allow quiz-derived inference to create an Interest Area", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("inferred", "Inferred", "bondage", {
          inferredAffinity: 100,
        }),
        result("direct", "Direct", "service", {
          explicitState: "curious",
        }),
      ]),
      categories,
    );

    expect(areas.map((area) => area.categoryId)).toEqual(["service"]);
  });

  it("does not treat Hard Limit, Not Interested, N/A, or Unsure alone as positive category evidence", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("hard", "Hard", "bondage", { explicitState: "hard_limit" }),
        result("no", "No", "pain", { explicitState: "not_interested" }),
        result("na", "N/A", "ownership", { explicitState: "not_applicable" }),
        result("unsure", "Unsure", "care", { explicitState: "unsure" }),
      ]),
      categories,
    );

    expect(areas).toEqual([]);
  });

  it("includes pairwise-only direct evidence and keeps it representative", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("rope", "Rope Bondage", "bondage", {
          overallRank: { rank: 1, comparisons: 8, confidence: 1 },
        }),
        result("cuffs", "Cuffs", "bondage", {
          overallRank: { rank: 2, comparisons: 6, confidence: 0.75 },
        }),
      ]),
      categories,
    );

    expect(areas).toHaveLength(1);
    expect(areas[0].representativeItems[0]).toEqual(
      expect.objectContaining({
        catalogId: "rope",
        sources: ["pairwise"],
      }),
    );
  });

  it("caps the main profile at six areas without padding sparse profiles", () => {
    const denseItems = categories.map((category, index) =>
      result(`item-${index}`, `Item ${index}`, category.id, {
        explicitState: "love",
      }),
    );

    expect(buildProfileInterestAreas(view(denseItems), categories)).toHaveLength(6);

    expect(
      buildProfileInterestAreas(
        view([
          result("one", "One", "service", { explicitState: "love" }),
          result("two", "Two", "primal", { explicitState: "like" }),
        ]),
        categories,
      ),
    ).toHaveLength(2);
  });

  it("falls back to a readable category label when metadata is missing", () => {
    const areas = buildProfileInterestAreas(
      view([
        result("x", "X", "special-category", {
          explicitState: "love",
        }),
      ]),
      [],
    );

    expect(areas[0].label).toBe("special category");
  });
});
