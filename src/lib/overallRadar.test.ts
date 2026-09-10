import { describe, expect, it } from "vitest";
import type { OverallFacetId } from "../data/overallFacets";
import type { OverallFacetResult } from "./overallProfileFacets";
import {
  buildOverallRadarModel,
  getKnownRadarRuns,
  type OverallRadarAxis,
} from "./overallRadar";

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
    sourceEvidenceIds: [],
  };
}

const ids: OverallFacetId[] = [
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

function axis(
  facetId: OverallFacetId,
  state: OverallRadarAxis["state"],
): OverallRadarAxis {
  return {
    facetId,
    label: facetId,
    shortLabel: facetId,
    affinity: state === "unknown" ? null : 70,
    coverage: state === "unknown" ? 0 : state === "limited" ? 15 : 80,
    state,
  };
}

describe("M7.4 overall radar model", () => {
  it("preserves unexplored facets as null instead of plotting artificial zeroes", () => {
    const model = buildOverallRadarModel(
      [
        facet("power_exchange", 82, 70),
        facet("structure_protocol", null, 0),
      ],
      ["power_exchange"],
    );

    expect(model.axes[0]).toEqual(
      expect.objectContaining({ affinity: 82, state: "known" }),
    );
    expect(model.axes[1]).toEqual(
      expect.objectContaining({ affinity: null, state: "unknown" }),
    );
    expect(model.knownAxisCount).toBe(1);
    expect(model.hasCompleteShape).toBe(false);
  });

  it("marks known but low-coverage facets as limited rather than unknown", () => {
    const model = buildOverallRadarModel(
      [facet("ownership_belonging", 100, 10)],
      ["ownership_belonging"],
    );

    expect(model.axes[0]).toEqual(
      expect.objectContaining({ affinity: 100, coverage: 10, state: "limited" }),
    );
    expect(model.knownAxisCount).toBe(1);
  });

  it("allows a genuinely known zero-affinity facet to stay plotted", () => {
    const model = buildOverallRadarModel(
      [facet("intensity_pain", 0, 80)],
      [],
    );

    expect(model.axes[0]).toEqual(
      expect.objectContaining({ affinity: 0, state: "known" }),
    );
  });

  it("keeps strongest-theme order from the M7.3 header model and drops unknown themes", () => {
    const model = buildOverallRadarModel(
      [
        facet("service_devotion", 90, 80),
        facet("care_nurture", null, 0),
        facet("power_exchange", 80, 60),
      ],
      ["service_devotion", "care_nurture", "power_exchange"],
    );

    expect(model.strongestThemes).toEqual([
      { facetId: "service_devotion", label: "service_devotion" },
      { facetId: "power_exchange", label: "power_exchange" },
    ]);
  });

  it("recognizes a full nine-axis profile as a complete shape", () => {
    const model = buildOverallRadarModel(
      ids.map((id, index) => facet(id, 50 + index, 70)),
      [],
    );

    expect(model.knownAxisCount).toBe(9);
    expect(model.hasCompleteShape).toBe(true);
  });
});

describe("M7.4 sparse radar runs", () => {
  it("returns no plotted runs when every axis is unknown", () => {
    expect(getKnownRadarRuns(ids.map((id) => axis(id, "unknown")))).toEqual([]);
  });

  it("returns one complete run when every axis is known", () => {
    expect(getKnownRadarRuns(ids.map((id) => axis(id, "known")))).toEqual([
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
    ]);
  });

  it("does not bridge a single unknown axis with an invented line", () => {
    const axes = ids.map((id, index) =>
      axis(id, index === 3 ? "unknown" : "known"),
    );

    expect(getKnownRadarRuns(axes)).toEqual([[4, 5, 6, 7, 8, 0, 1, 2]]);
  });

  it("splits separated known regions into independent runs", () => {
    const states: OverallRadarAxis["state"][] = [
      "known",
      "known",
      "unknown",
      "limited",
      "known",
      "unknown",
      "unknown",
      "known",
      "known",
    ];
    const axes = ids.map((id, index) => axis(id, states[index]));

    expect(getKnownRadarRuns(axes)).toEqual([
      [3, 4],
      [7, 8, 0, 1],
    ]);
  });
});
