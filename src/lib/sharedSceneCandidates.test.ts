import { describe, expect, it } from "vitest";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import type {
  SharedCatalogItemComparison,
  SharedProfileComparison,
} from "./sharedProfileComparison";
import {
  buildSharedSceneCandidateView,
  getSceneThemeIdsForSharedParticipantIntents,
} from "./sharedSceneCandidates";
import {
  createEmptySceneSessionState,
  setSceneSessionChoice,
} from "./sceneSession";

function resultItem(
  id: string,
  categoryId = "impact-play",
): CatalogResultItem {
  return {
    item: {
      id,
      label: id,
      categoryId,
      categoryLabel:
        categoryId === "impact-play" ? "Impact Play" : "Primal Play",
      description: "",
      domain: "physical",
      direction: "Both",
      aliases: [],
      typicalRole: "",
      primaryMode: "Physical/Psychological",
      intensity: "Moderate",
      riskLevel: "Moderate",
      signalMappings: [],
    },
    meaningfulPairwiseComparisons: 0,
    excludedFromNewRanking: false,
  };
}

function view(item: CatalogResultItem): CatalogResultView {
  return {
    items: [item],
    byCatalogId: new Map([[item.item.id, item]]),
    exclusions: {
      hardLimits: [],
      notInterested: [],
      notApplicable: [],
    },
  };
}

function sharedItem(
  id: string,
  overrides: Partial<SharedCatalogItemComparison> = {},
): SharedCatalogItemComparison {
  return {
    catalogId: id,
    label: id,
    categoryId: "impact-play",
    state: "mutual_positive",
    profileA: {
      overall: "like",
      meaningfulPairwiseComparisons: 0,
    },
    profileB: {
      overall: "love",
      meaningfulPairwiseComparisons: 0,
    },
    explanation: "Both profiles directly marked this as a positive interest.",
    ...overrides,
  };
}

function comparison(
  item: SharedCatalogItemComparison,
): SharedProfileComparison {
  const states = {
    mutual_positive: [],
    complementary: [],
    mutual_curious: [],
    one_positive_one_curious: [],
    different_context: [],
    excluded: [],
    unknown: [],
  } as SharedProfileComparison["catalogByState"];

  return {
    catalogItems: [item],
    catalogByState: {
      ...states,
      [item.state]: [item],
    },
    semanticComplements: [],
  };
}

describe("buildSharedSceneCandidateView", () => {
  it("allows explicit giving/receiving complementarity into automatic shared scenes", () => {
    const item = resultItem("shared-impact");
    const shared = sharedItem("shared-impact", {
      state: "complementary",
      profileA: {
        giving: "like",
        meaningfulPairwiseComparisons: 0,
      },
      profileB: {
        receiving: "love",
        meaningfulPairwiseComparisons: 0,
      },
      explanation:
        "The profiles have directly compatible giving/receiving preferences for this activity.",
    });

    const built = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
    );

    expect(built.confirmed).toHaveLength(1);
    expect(built.confirmed[0].catalogId).toBe("shared-impact");
    expect(built.confirmed[0].sharedContext?.state).toBe("complementary");
  });

  it("never admits an explicit shared exclusion", () => {
    const item = resultItem("excluded-impact");
    const shared = sharedItem("excluded-impact", {
      state: "excluded",
      explanation: "One profile explicitly excludes this from shared suggestions.",
    });

    const built = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
      { exploration: "explore" },
    );

    expect(built.confirmed).toEqual([]);
    expect(built.suggestedToExplore).toEqual([]);
  });

  it("lets either person's Not tonight remove an otherwise strong match", () => {
    const item = resultItem("tonight-impact");
    const shared = sharedItem("tonight-impact");
    const profileBSession = setSceneSessionChoice(
      createEmptySceneSessionState(),
      "tonight-impact",
      "not_tonight",
      "2026-09-09T03:00:00.000Z",
    );

    const built = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
      { profileBSessionState: profileBSession },
    );

    expect(built.confirmed).toEqual([]);
  });

  it("keeps one-positive/one-curious out of automatic selection until Explore", () => {
    const item = resultItem("curious-impact");
    const shared = sharedItem("curious-impact", {
      state: "one_positive_one_curious",
      profileA: {
        overall: "love",
        meaningfulPairwiseComparisons: 0,
      },
      profileB: {
        overall: "curious",
        meaningfulPairwiseComparisons: 0,
      },
    });

    const mixed = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
      { exploration: "mixed" },
    );
    const explore = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
      { exploration: "explore" },
    );

    expect(mixed.confirmed).toEqual([]);
    expect(mixed.suggestedToExplore).toHaveLength(1);
    expect(explore.confirmed).toHaveLength(1);
  });

  it("allows direct current-session support to fill a previously unknown side", () => {
    const item = resultItem("session-impact");
    const shared = sharedItem("session-impact", {
      state: "unknown",
      profileA: {
        overall: "like",
        meaningfulPairwiseComparisons: 0,
      },
      profileB: {
        meaningfulPairwiseComparisons: 0,
      },
    });
    const profileBSession = setSceneSessionChoice(
      createEmptySceneSessionState(),
      "session-impact",
      "yes_tonight",
      "2026-09-09T03:00:00.000Z",
    );

    const built = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
      { profileBSessionState: profileBSession },
    );

    expect(built.confirmed).toHaveLength(1);
    expect(
      built.confirmed[0].sharedContext?.profileBSessionChoice,
    ).toBe("yes_tonight");
  });

  it("does not promote an unknown item with no support from the other person", () => {
    const item = resultItem("unknown-impact");
    const shared = sharedItem("unknown-impact", {
      state: "unknown",
      profileA: {
        overall: "like",
        meaningfulPairwiseComparisons: 0,
      },
      profileB: {
        meaningfulPairwiseComparisons: 0,
      },
    });

    const built = buildSharedSceneCandidateView(
      view(item),
      view(item),
      comparison(shared),
      ["pain"],
    );

    expect(built.confirmed).toEqual([]);
  });
});

describe("shared participant intent → scene themes", () => {
  it("turns Predator / Prey current intent into primal scene-query themes", () => {
    const ids = getSceneThemeIdsForSharedParticipantIntents(
      {
        selectedConcepts: [
          { kind: "headspace", id: "prey" },
        ],
      },
      {
        selectedConcepts: [
          { kind: "headspace", id: "predator" },
        ],
      },
    );

    expect(ids).toContain("primal-feral");
    expect(ids).toContain("prey");
  });

  it("turns Authority / Surrender current intent into power-exchange scene queries", () => {
    const ids = getSceneThemeIdsForSharedParticipantIntents(
      {
        selectedConcepts: [
          { kind: "dynamic_mode", id: "surrender_mode" },
        ],
      },
      {
        selectedConcepts: [
          { kind: "dynamic_mode", id: "authority_mode" },
        ],
      },
    );

    expect(ids).toContain("power-exchange");
    expect(ids).toContain("surrender");
  });
});
