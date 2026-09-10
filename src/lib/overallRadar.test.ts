import { describe, expect, it } from "vitest";
import type { OverallFacetId } from "../data/overallFacets";
import type { OverallFacetResult } from "./overallProfileFacets";
import {
  buildOverallRadarModel,
  calculateOverallFacetProminence,
  calculateProminenceBaseline,
  calculateRelativeRadarEmphasis,
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
    prominence:
      state === "unknown"
        ? null
        : calculateOverallFacetProminence(
            70,
            state === "limited" ? 15 : 80,
          ),
    prominenceDelta: state === "unknown" ? null : 0,
    relativeEmphasis: state === "unknown" ? null : 50,
    state,
  };
}

describe("M16.4 relative-emphasis radar experiment", () => {
  it("centers the profile's known prominence values around their own baseline", () => {
    expect(calculateProminenceBaseline([80, 70, 60, null])).toBe(70);
  });

  it("uses a fixed relative scale instead of stretching each profile to 0–100", () => {
    expect(calculateRelativeRadarEmphasis(70, 70)).toBe(50);
    expect(calculateRelativeRadarEmphasis(80, 70)).toBe(65);
    expect(calculateRelativeRadarEmphasis(60, 70)).toBe(35);
    expect(calculateRelativeRadarEmphasis(90, 70)).toBe(80);
    expect(calculateRelativeRadarEmphasis(50, 70)).toBe(20);
  });

  it("keeps a genuinely uniform profile circular at the midpoint", () => {
    const model = buildOverallRadarModel(
      ids.map((id) => facet(id, 80, 64)),
      [],
    );

    expect(model.prominenceBaseline).toBe(64);
    expect(
      model.axes.every(
        (axis) =>
          axis.prominence === 64 &&
          axis.prominenceDelta === 0 &&
          axis.relativeEmphasis === 50,
      ),
    ).toBe(true);
  });

  it("shows fixed deviations around the baseline without changing raw values", () => {
    const model = buildOverallRadarModel(
      [
        facet("power_exchange", 100, 64),
        facet("structure_protocol", 75, 64),
        facet("ownership_belonging", 50, 64),
      ],
      [],
    );

    // Prominence is 80, 60, 40; baseline = 60.
    expect(model.prominenceBaseline).toBe(60);
    expect(model.axes.map((axis) => axis.relativeEmphasis)).toEqual([
      80,
      50,
      20,
    ]);
    expect(model.axes.map((axis) => axis.affinity)).toEqual([100, 75, 50]);
  });
});

describe("M16.4 radar prominence experiment", () => {
  it("combines affinity with the square root of evidence coverage", () => {
    expect(calculateOverallFacetProminence(80, 25)).toBe(40);
    expect(calculateOverallFacetProminence(80, 100)).toBe(80);
    expect(calculateOverallFacetProminence(80, 0)).toBeNull();
    expect(calculateOverallFacetProminence(null, 80)).toBeNull();
  });

  it("preserves raw affinity while exposing a separate plotting prominence", () => {
    const model = buildOverallRadarModel(
      [facet("power_exchange", 90, 36)],
      ["power_exchange"],
    );

    expect(model.axes[0]).toEqual(
      expect.objectContaining({
        affinity: 90,
        coverage: 36,
        prominence: 54,
      }),
    );
  });
});

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
      expect.objectContaining({
        affinity: 82,
        prominence: calculateOverallFacetProminence(82, 70),
        prominenceDelta: 0,
        relativeEmphasis: 50,
        state: "known",
      }),
    );
    expect(model.axes[1]).toEqual(
      expect.objectContaining({
        affinity: null,
        prominence: null,
        prominenceDelta: null,
        relativeEmphasis: null,
        state: "unknown",
      }),
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
