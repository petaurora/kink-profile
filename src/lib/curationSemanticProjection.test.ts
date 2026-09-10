import { describe, expect, it } from "vitest";
import {
  getCurationPrimitiveFacetAffinities,
  getCurationPrimitiveSignalMappings,
} from "./curationSemanticProjection";

describe("M16.7 curation semantic projection", () => {
  it("resolves catalog categories through their authored Signal mappings", () => {
    const signals = getCurationPrimitiveSignalMappings(
      "catalog-category",
      "bondage-restraint",
    );
    expect(signals.length).toBeGreaterThan(0);

    const facets = getCurationPrimitiveFacetAffinities(
      "catalog-category",
      "bondage-restraint",
    );
    expect(facets[0]?.facetId).toBe("restraint_physical_control");
  });

  it("resolves R/P categories through the new Signal bridge", () => {
    const facets = getCurationPrimitiveFacetAffinities(
      "reward-punishment-category",
      "impact",
    );
    expect(facets[0]?.facetId).toBe("intensity_pain");
  });

  it("resolves R/P actions through their weighted context categories", () => {
    const signals = getCurationPrimitiveSignalMappings(
      "reward-punishment-action",
      "action-achievement-ceremony",
    );

    expect(
      signals.some((mapping) => mapping.signalId === "praise_approval"),
    ).toBe(true);
  });

  it("resolves quiz definitions by blending their question semantics", () => {
    expect(
      getCurationPrimitiveFacetAffinities(
        "quiz-definition",
        "dominance-submission",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("keeps known missing semantic routes visible", () => {
    expect(
      getCurationPrimitiveFacetAffinities(
        "reward-punishment-category",
        "sexual-scene",
      ),
    ).toEqual([]);

    expect(
      getCurationPrimitiveFacetAffinities("signal", "anticipation"),
    ).toEqual([]);
  });
});
