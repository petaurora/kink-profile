import { describe, expect, it } from "vitest";
import {
  blendSemanticSignalGroups,
  collapseSemanticSignalMappings,
  deriveOverallFacetAffinities,
} from "./semanticFacetAffinity";

describe("M16.7 semantic facet affinity", () => {
  it("projects a direct restraint signal strongly into the restraint facet", () => {
    const facets = deriveOverallFacetAffinities([
      { signalId: "receiving_restraint", weight: 1 },
    ]);

    expect(facets[0]?.facetId).toBe("restraint_physical_control");
    expect(facets[0]?.affinity).toBe(1);
  });

  it("keeps facet projection descriptive instead of forcing weights to sum to one", () => {
    const facets = deriveOverallFacetAffinities([
      { signalId: "praise_approval", weight: 1 },
    ]);

    expect(
      facets.find((facet) => facet.facetId === "care_nurture")?.affinity,
    ).toBeCloseTo(0.3);
    expect(
      facets.find((facet) => facet.facetId === "service_devotion")?.affinity,
    ).toBeCloseTo(0.3);
  });

  it("collapses duplicate semantic paths by their strongest weight", () => {
    expect(
      collapseSemanticSignalMappings([
        { signalId: "movement_restriction", weight: 0.5 },
        { signalId: "movement_restriction", weight: 0.9 },
      ]),
    ).toEqual([{ signalId: "movement_restriction", weight: 0.9 }]);
  });

  it("blends weighted category semantics for downstream action projection", () => {
    const signals = blendSemanticSignalGroups([
      {
        weight: 1,
        signals: [{ signalId: "praise_approval", weight: 1 }],
      },
      {
        weight: 0.5,
        signals: [{ signalId: "playfulness", weight: 1 }],
      },
    ]);

    expect(signals).toEqual([
      { signalId: "playfulness", weight: 1 / 3 },
      { signalId: "praise_approval", weight: 2 / 3 },
    ]);
  });

  it("returns no fabricated facet affinity when no semantic signal exists", () => {
    expect(deriveOverallFacetAffinities([])).toEqual([]);
  });
});
