import { describe, expect, it } from "vitest";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import {
  buildSceneCandidateView,
  calculateSceneThemeFit,
} from "./sceneCandidates";
import { getSceneTheme } from "../data/sceneThemes";

function result(
  overrides: Partial<CatalogResultItem> & {
    id: string;
    label: string;
    categoryId: string;
    signalMappings?: Array<{ signalId: any; weight: number }>;
  },
): CatalogResultItem {
  return {
    item: {
      id: overrides.id,
      label: overrides.label,
      categoryId: overrides.categoryId,
      categoryLabel: overrides.categoryId,
      domain: "misc" as any,
      direction: "both",
      aliases: [],
      signalMappings: overrides.signalMappings ?? [],
      description: "",
      typicalRole: "Both",
      primaryMode: "",
      intensity: "",
      riskLevel: "",
    },
    explicitState: overrides.explicitState,
    categoryRank: overrides.categoryRank,
    overallRank: overrides.overallRank,
    inferred: overrides.inferred,
    meaningfulPairwiseComparisons:
      overrides.meaningfulPairwiseComparisons ?? 0,
    excludedFromNewRanking: overrides.excludedFromNewRanking ?? false,
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

describe("M13.2 scene candidate engine", () => {
  it("matches themes through both category and expanded signal mappings", () => {
    const pain = getSceneTheme("pain");
    const service = getSceneTheme("service");
    expect(pain).toBeDefined();
    expect(service).toBeDefined();

    const impact = result({
      id: "impact",
      label: "Impact",
      categoryId: "impact-play",
    });
    const serviceItem = result({
      id: "service",
      label: "Service",
      categoryId: "miscellaneous-meta-kink",
      signalMappings: [{ signalId: "service", weight: 1 }],
    });

    expect(calculateSceneThemeFit(impact, pain!)).toBeGreaterThanOrEqual(80);
    expect(calculateSceneThemeFit(serviceItem, service!)).toBeGreaterThan(0);
  });

  it("never admits hard exclusions even when theme fit and evidence are strong", () => {
    const candidateView = buildSceneCandidateView(
      view([
        result({
          id: "blocked",
          label: "Blocked",
          categoryId: "impact-play",
          explicitState: "hard_limit",
          meaningfulPairwiseComparisons: 8,
          overallRank: { rank: 1, comparisons: 8, confidence: 1 },
        }),
      ]),
      ["pain"],
    );

    expect(candidateView.confirmed).toEqual([]);
    expect(candidateView.suggestedToExplore).toEqual([]);
  });

  it("keeps inference-only matches out of automatic candidates", () => {
    const candidateView = buildSceneCandidateView(
      view([
        result({
          id: "inferred",
          label: "Inferred",
          categoryId: "impact-play",
          inferred: {
            affinity: 92,
            coverage: 80,
            matchedSignals: [],
          },
        }),
      ]),
      ["pain"],
    );

    expect(candidateView.confirmed).toEqual([]);
    expect(candidateView.suggestedToExplore.map((item) => item.catalogId)).toEqual([
      "inferred",
    ]);
    expect(candidateView.suggestedToExplore[0].automaticEligible).toBe(false);
  });

  it("only admits Curious items when Explore is explicitly enabled", () => {
    const items = view([
      result({
        id: "curious",
        label: "Curious",
        categoryId: "impact-play",
        explicitState: "curious",
      }),
    ]);

    expect(
      buildSceneCandidateView(items, ["pain"], { exploration: "mixed" })
        .confirmed,
    ).toEqual([]);

    expect(
      buildSceneCandidateView(items, ["pain"], { exploration: "explore" })
        .confirmed.map((item) => item.catalogId),
    ).toEqual(["curious"]);
  });

  it("does not let pairwise history override an explicit Unsure state", () => {
    const candidateView = buildSceneCandidateView(
      view([
        result({
          id: "unsure-ranked",
          label: "Unsure ranked",
          categoryId: "impact-play",
          explicitState: "unsure",
          meaningfulPairwiseComparisons: 8,
          overallRank: { rank: 1, comparisons: 8, confidence: 1 },
        }),
      ]),
      ["pain"],
    );

    expect(candidateView.confirmed).toEqual([]);
    expect(candidateView.suggestedToExplore).toEqual([]);
  });

  it("uses direct ranking evidence without pretending it is explicit preference", () => {
    const candidateView = buildSceneCandidateView(
      view([
        result({
          id: "ranked",
          label: "Ranked",
          categoryId: "impact-play",
          meaningfulPairwiseComparisons: 4,
          categoryRank: { rank: 2, comparisons: 4, confidence: 0.5 },
        }),
      ]),
      ["pain"],
    );

    expect(candidateView.confirmed[0]).toMatchObject({
      catalogId: "ranked",
      provenance: "pairwise",
      automaticEligible: true,
    });
  });

  it("creates complementary theme lanes and identifies bridge items", () => {
    const candidateView = buildSceneCandidateView(
      view([
        result({
          id: "pain-only",
          label: "Pain only",
          categoryId: "impact-play",
          explicitState: "love",
        }),
        result({
          id: "service-only",
          label: "Service only",
          categoryId: "miscellaneous-meta-kink",
          explicitState: "like",
          signalMappings: [{ signalId: "service", weight: 1 }],
        }),
        result({
          id: "bridge",
          label: "Bridge",
          categoryId: "impact-play",
          explicitState: "like",
          signalMappings: [{ signalId: "service", weight: 1 }],
        }),
      ]),
      ["pain", "service"],
    );

    expect(
      candidateView.themeLanes.find((lane) => lane.themeId === "pain")
        ?.candidates.map((item) => item.catalogId),
    ).toEqual(expect.arrayContaining(["pain-only", "bridge"]));
    expect(
      candidateView.themeLanes.find((lane) => lane.themeId === "service")
        ?.candidates.map((item) => item.catalogId),
    ).toEqual(expect.arrayContaining(["service-only", "bridge"]));
    expect(candidateView.bridgeCandidates.map((item) => item.catalogId)).toEqual([
      "bridge",
    ]);
  });

  it("builds deterministic coverage order across multiple themes", () => {
    const candidateView = buildSceneCandidateView(
      view([
        result({
          id: "pain-only",
          label: "Pain only",
          categoryId: "impact-play",
          explicitState: "love",
        }),
        result({
          id: "service-only",
          label: "Service only",
          categoryId: "miscellaneous-meta-kink",
          explicitState: "love",
          signalMappings: [{ signalId: "service", weight: 1 }],
        }),
        result({
          id: "bridge",
          label: "Bridge",
          categoryId: "impact-play",
          explicitState: "like",
          signalMappings: [{ signalId: "service", weight: 1 }],
        }),
      ]),
      ["pain", "service"],
    );

    expect(candidateView.coverageOrder[0].catalogId).toBe("bridge");
    expect(candidateView.coverageOrder[0].matchedThemeIds).toEqual(
      expect.arrayContaining(["pain", "service"]),
    );
  });
});
