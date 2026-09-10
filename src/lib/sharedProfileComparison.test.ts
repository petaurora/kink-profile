import { describe, expect, it } from "vitest";
import type { SignalId } from "../data/signals";
import type { CatalogPreferenceState } from "./catalogProfile";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import type { ProfileRoleDetailsModel } from "./profileRoleDetails";
import {
  buildSharedProfileComparison,
  type SharedProfileComparisonInput,
} from "./sharedProfileComparison";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";

function catalogResult(
  id: string,
  label = id,
  meaningfulPairwiseComparisons = 0,
): CatalogResultItem {
  return {
    item: {
      id,
      label,
      categoryId: "test-category",
    } as CatalogResultItem["item"],
    meaningfulPairwiseComparisons,
    excludedFromNewRanking: false,
  };
}

function resultView(items: readonly CatalogResultItem[]): CatalogResultView {
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

function canonicalSignal(
  signalId: SignalId,
  affinity = 90,
  coverage = 80,
): CanonicalSignalResult {
  return buildCanonicalSignalFixtures([
    { signalId, affinity, coverage },
  ])[0]!;
}

function emptyRoleDetails(): ProfileRoleDetailsModel {
  return {
    headspaces: [],
    dynamicModes: [],
    featuredHeadspaces: [],
    featuredDynamicModes: [],
  };
}

function roleDetails(
  headspaces: Array<{ id: string; label: string; affinity?: number; coverage?: number }> = [],
  dynamicModes: Array<{ id: string; label: string; affinity?: number; coverage?: number }> = [],
): ProfileRoleDetailsModel {
  const toScore = (
    item: { id: string; label: string; affinity?: number; coverage?: number },
  ) => ({
    id: item.id,
    label: item.label,
    shortLabel: item.label,
    affinity: item.affinity ?? 90,
    coverage: item.coverage ?? 80,
    state: "known" as const,
  });

  const scoredHeadspaces = headspaces.map(toScore);
  const scoredDynamicModes = dynamicModes.map(toScore);

  return {
    headspaces: scoredHeadspaces,
    dynamicModes: scoredDynamicModes,
    featuredHeadspaces: scoredHeadspaces,
    featuredDynamicModes: scoredDynamicModes,
  };
}

function input(
  items: readonly CatalogResultItem[],
  preferences: Record<
    string,
    {
      overall?: CatalogPreferenceState;
      receiving?: CatalogPreferenceState;
      giving?: CatalogPreferenceState;
      updatedAt: string;
    }
  >,
  canonicalSignals: readonly CanonicalSignalResult[] = [],
  roles: ProfileRoleDetailsModel = emptyRoleDetails(),
): SharedProfileComparisonInput {
  return {
    catalogResults: resultView(items),
    catalogProfile: {
      schemaVersion: 1,
      preferences,
      comparisons: [],
    },
    canonicalSignals,
    roleDetails: roles,
  };
}

const updatedAt = "2026-09-08T00:00:00.000Z";

describe("buildSharedProfileComparison", () => {
  it("classifies mutual direct positive interest", () => {
    const item = catalogResult("impact", "Impact");

    const comparison = buildSharedProfileComparison(
      input([item], {
        impact: { overall: "love", updatedAt },
      }),
      input([item], {
        impact: { overall: "like", updatedAt },
      }),
    );

    expect(comparison.catalogItems).toEqual([
      expect.objectContaining({
        catalogId: "impact",
        state: "mutual_positive",
      }),
    ]);
  });

  it("classifies complementary giving/receiving preference before generic mutual interest", () => {
    const item = catalogResult("restraint", "Restraint");

    const comparison = buildSharedProfileComparison(
      input([item], {
        restraint: {
          overall: "like",
          giving: "love",
          receiving: "unsure",
          updatedAt,
        },
      }),
      input([item], {
        restraint: {
          overall: "like",
          giving: "unsure",
          receiving: "love",
          updatedAt,
        },
      }),
    );

    expect(comparison.catalogItems[0].state).toBe("complementary");
  });

  it("keeps explicit exclusions authoritative", () => {
    const item = catalogResult("rope", "Rope");

    const comparison = buildSharedProfileComparison(
      input([item], {
        rope: { overall: "love", updatedAt },
      }),
      input([item], {
        rope: { overall: "hard_limit", updatedAt },
      }),
    );

    expect(comparison.catalogItems[0]).toEqual(
      expect.objectContaining({
        state: "excluded",
        explanation: expect.stringContaining("explicitly excludes"),
      }),
    );
  });

  it("distinguishes mutual curiosity from one-positive/one-curious", () => {
    const curious = catalogResult("curious", "Curious");
    const mixed = catalogResult("mixed", "Mixed");

    const comparison = buildSharedProfileComparison(
      input([curious, mixed], {
        curious: { overall: "curious", updatedAt },
        mixed: { overall: "love", updatedAt },
      }),
      input([curious, mixed], {
        curious: { overall: "curious", updatedAt },
        mixed: { overall: "curious", updatedAt },
      }),
    );

    expect(
      comparison.catalogItems.find((item) => item.catalogId === "curious")
        ?.state,
    ).toBe("mutual_curious");
    expect(
      comparison.catalogItems.find((item) => item.catalogId === "mixed")?.state,
    ).toBe("one_positive_one_curious");
  });

  it("keeps pairwise-only evidence unknown instead of treating relative rank as an absolute like", () => {
    const ranked = catalogResult("ranked", "Ranked", 6);

    const comparison = buildSharedProfileComparison(
      input([ranked], {}),
      input([ranked], {
        ranked: { overall: "love", updatedAt },
      }),
    );

    expect(comparison.catalogItems[0]).toEqual(
      expect.objectContaining({
        state: "unknown",
        explanation: expect.stringContaining("relative ranking evidence"),
      }),
    );
  });

  it("distinguishes positive but non-complementary directional contexts", () => {
    const item = catalogResult("positioning", "Positioning");

    const comparison = buildSharedProfileComparison(
      input([item], {
        positioning: { receiving: "love", updatedAt },
      }),
      input([item], {
        positioning: { receiving: "like", updatedAt },
      }),
    );

    expect(comparison.catalogItems[0].state).toBe("different_context");
  });

  it("preserves missing evidence as unknown rather than mismatch", () => {
    const item = catalogResult("unknown", "Unknown");

    const comparison = buildSharedProfileComparison(
      input([item], {
        unknown: { overall: "like", updatedAt },
      }),
      input([item], {}),
    );

    expect(comparison.catalogItems[0].state).toBe("unknown");
    expect(comparison.catalogByState.unknown).toHaveLength(1);
  });

  it("derives activity-side semantic complements without assigning authority", () => {
    const comparison = buildSharedProfileComparison(
      input([], {}, [canonicalSignal("pain_giving")]),
      input([], {}, [canonicalSignal("pain_receiving")]),
    );

    const pain = comparison.semanticComplements.find(
      (match) => match.mappingId === "signal-pain-give-receive",
    );

    expect(pain).toEqual(
      expect.objectContaining({
        relationshipKind: "activity_complement",
        authoritySemantics: "activity_side_only",
        profileA: expect.objectContaining({
          concept: { kind: "signal", id: "pain_giving" },
        }),
        profileB: expect.objectContaining({
          concept: { kind: "signal", id: "pain_receiving" },
        }),
      }),
    );
  });

  it("derives contextual headspace complements without converting them to authority evidence", () => {
    const comparison = buildSharedProfileComparison(
      input(
        [],
        {},
        [],
        roleDetails([{ id: "predator", label: "Predator" }]),
      ),
      input(
        [],
        {},
        [],
        roleDetails([{ id: "prey", label: "Prey" }]),
      ),
    );

    expect(
      comparison.semanticComplements.find(
        (match) => match.mappingId === "headspace-predator-prey",
      ),
    ).toEqual(
      expect.objectContaining({
        authoritySemantics: "contextual_role",
        profileA: expect.objectContaining({
          concept: { kind: "headspace", id: "predator" },
        }),
        profileB: expect.objectContaining({
          concept: { kind: "headspace", id: "prey" },
        }),
      }),
    );
  });

  it("keeps explicit authority-coded complementarity at the role layer", () => {
    const comparison = buildSharedProfileComparison(
      input(
        [],
        {},
        [],
        roleDetails([{ id: "master_mistress", label: "Master / Mistress" }]),
      ),
      input(
        [],
        {},
        [],
        roleDetails([{ id: "slave", label: "Slave" }]),
      ),
    );

    expect(
      comparison.semanticComplements.find(
        (match) => match.mappingId === "headspace-master-mistress-slave",
      ),
    ).toEqual(
      expect.objectContaining({
        authoritySemantics: "explicit_authority_pair",
      }),
    );
  });

  it("requires meaningful semantic affinity and coverage on both sides", () => {
    const comparison = buildSharedProfileComparison(
      input([], {}, [canonicalSignal("pain_giving", 90, 80)]),
      input([], {}, [canonicalSignal("pain_receiving", 95, 10)]),
    );

    expect(
      comparison.semanticComplements.some(
        (match) => match.mappingId === "signal-pain-give-receive",
      ),
    ).toBe(false);
  });

  it("is deterministic and does not mutate either profile input", () => {
    const item = catalogResult("b", "B");
    const a = input([item], {
      b: { overall: "love", updatedAt },
    });
    const b = input([item], {
      b: { overall: "like", updatedAt },
    });

    const beforeA = JSON.stringify(a.catalogProfile);
    const beforeB = JSON.stringify(b.catalogProfile);

    const first = buildSharedProfileComparison(a, b);
    const second = buildSharedProfileComparison(a, b);

    expect(second).toEqual(first);
    expect(JSON.stringify(a.catalogProfile)).toBe(beforeA);
    expect(JSON.stringify(b.catalogProfile)).toBe(beforeB);
  });
});
