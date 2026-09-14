import { describe, expect, it } from "vitest";
import type { OverallFacetId } from "../data/overallFacets";
import type { OverallFacetResult } from "./overallProfileFacets";
import {
  PROFILE_DIMENSION_ESTABLISHED_COVERAGE,
  PROFILE_HEADLINE_COVERAGE,
  resolveProfileDimension,
  resolveProfileMaturity,
} from "./profileMaturity";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";

const facetIds: readonly OverallFacetId[] = [
  "power_exchange",
  "structure_protocol",
  "ownership_belonging",
  "service_devotion",
  "care_nurture",
  "play_resistance",
  "primal_instinctive",
  "restraint_physical_control",
  "intensity_pain",
];

function facet(
  facetId: OverallFacetId,
  affinity: number | null,
  coverage: number,
): OverallFacetResult {
  return {
    facetId,
    label: facetId,
    shortLabel: facetId,
    description: facetId,
    affinity,
    coverage,
    components: [],
    sourceEvidenceIds: coverage > 0 ? [`test:${facetId}`] : [],
  };
}

const canonicalEvidence = buildCanonicalSignalFixtures([
  {
    signalId: "control",
    affinity: 70,
    coverage: 60,
    sourceType: "quiz",
    sourceId: "dominance-submission",
  },
]);

describe("profile maturity", () => {
  it("is unformed when there is no canonical evidence", () => {
    const result = resolveProfileMaturity(
      [],
      facetIds.map((id) => facet(id, null, 0)),
    );

    expect(result.kind).toBe("unformed");
    expect(result.label).toBe("Unformed");
    expect(result.evidencedDimensionCount).toBe(0);
  });

  it("is emerging when canonical evidence exists but the landscape is still provisional", () => {
    const result = resolveProfileMaturity(canonicalEvidence, [
      facet("power_exchange", 95, 10),
      ...facetIds.slice(1).map((id) => facet(id, null, 0)),
    ]);

    expect(result.kind).toBe("emerging");
    expect(result.evidencedDimensionCount).toBe(1);
    expect(result.establishedDimensionCount).toBe(0);
  });

  it("becomes established from breadth of established dimensions without requiring every dimension", () => {
    const facets = facetIds.map((id, index) =>
      index < 3 ? facet(id, 55 + index * 10, 60) : facet(id, null, 0),
    );
    const result = resolveProfileMaturity(canonicalEvidence, facets);

    expect(result.kind).toBe("established");
    expect(result.establishedDimensionCount).toBe(3);
    expect(result.evidencedDimensionCount).toBe(3);
  });
});

describe("profile dimension presentation", () => {
  it("keeps unknown and established-low results semantically distinct", () => {
    const unknown = resolveProfileDimension(
      facet("power_exchange", null, 0),
    );
    const measuredLow = resolveProfileDimension(
      facet("power_exchange", 0, 80),
    );

    expect(unknown.state).toBe("unknown");
    expect(unknown.affinity).toBeNull();
    expect(unknown.sparseState.state).toBe("unexplored");

    expect(measuredLow.state).toBe("established");
    expect(measuredLow.affinity).toBe(0);
    expect(measuredLow.sparseState.state).toBe("available");
  });

  it("keeps high affinity provisional when evidence coverage is limited", () => {
    const result = resolveProfileDimension(
      facet(
        "ownership_belonging",
        100,
        PROFILE_DIMENSION_ESTABLISHED_COVERAGE - 1,
      ),
    );

    expect(result.state).toBe("provisional");
    expect(result.affinity).toBe(100);
    expect(result.sparseState.state).toBe("developing");
    expect(result.headlineEligible).toBe(false);
  });

  it("treats evidence with an unresolved affinity as provisional instead of unexplored", () => {
    const result = resolveProfileDimension(
      facet("structure_protocol", null, 70),
    );

    expect(result.state).toBe("provisional");
    expect(result.sparseState.state).toBe("developing");
  });

  it("requires stronger evidence for headline eligibility than passive landscape display", () => {
    const landscapeOnly = resolveProfileDimension(
      facet(
        "service_devotion",
        80,
        PROFILE_DIMENSION_ESTABLISHED_COVERAGE,
      ),
    );
    const headlineReady = resolveProfileDimension(
      facet("service_devotion", 80, PROFILE_HEADLINE_COVERAGE),
    );

    expect(landscapeOnly.state).toBe("established");
    expect(landscapeOnly.headlineEligible).toBe(false);
    expect(headlineReady.state).toBe("established");
    expect(headlineReady.headlineEligible).toBe(true);
    expect(PROFILE_HEADLINE_COVERAGE).toBeGreaterThan(
      PROFILE_DIMENSION_ESTABLISHED_COVERAGE,
    );
  });
});
