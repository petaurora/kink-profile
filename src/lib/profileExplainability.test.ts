import { describe, expect, it } from "vitest";
import type { SignalId } from "../data/signals";
import { scoreOverallFacets } from "./overallProfileFacets";
import type {
  CanonicalSignalContribution,
  CanonicalSignalResult,
  CanonicalSignalSourceType,
} from "./overallProfileSignals";
import {
  buildProfileExplainability,
} from "./profileExplainability";
import {
  createEmptyProfile,
  type StoredProfile,
} from "./profileStorage";

function contribution(
  sourceType: CanonicalSignalSourceType,
  sourceId: string,
  signalId: SignalId,
  affinity: number,
  coverage = 100,
  detail?: string,
): CanonicalSignalContribution {
  return {
    sourceType,
    sourceId,
    signalId,
    affinity,
    coverage,
    detail,
    sourceEvidenceIds: [
      `${sourceType}:${sourceId}:${signalId}`,
    ],
  };
}

function signal(
  signalId: SignalId,
  affinity: number,
  coverage: number,
  channels: {
    sourceType: CanonicalSignalSourceType;
    affinity: number;
    coverage: number;
    contributions: CanonicalSignalContribution[];
  }[] = [],
): CanonicalSignalResult {
  return {
    signalId,
    affinity,
    coverage,
    channels: channels.map((channel) => ({
      ...channel,
      reliability:
        channel.sourceType === "quiz"
          ? 0.8
          : channel.sourceType === "catalog_explicit"
            ? 0.65
            : 0.5,
      effectiveWeight: channel.coverage / 100,
    })),
    sourceEvidenceIds: channels.flatMap((channel) =>
      channel.contributions.flatMap(
        (item) => item.sourceEvidenceIds,
      ),
    ),
  };
}

function facet(
  model: ReturnType<typeof buildProfileExplainability>,
  id: string,
) {
  const result = model.facets.find((item) => item.facetId === id);
  if (!result) throw new Error(`Missing facet ${id}`);
  return result;
}

function completedProfile(): StoredProfile {
  return {
    schemaVersion: 2,
    quizzes: {
      "dominance-submission": {
        quizVersion: 1,
        answers: Object.fromEntries(
          Array.from({ length: 18 }, (_, index) => [
            `ds-${String(index + 1).padStart(3, "0")}`,
            4,
          ]),
        ),
      },
      "roles-headspaces": {
        quizVersion: 3,
        answers: Object.fromEntries(
          Array.from({ length: 32 }, (_, index) => [
            `hs-${String(index + 1).padStart(3, "0")}`,
            4,
          ]),
        ),
      },
    },
  };
}

describe("M7.10 profile explainability", () => {
  it("keeps strong affinity separate from breadth of theme evidence", () => {
    const canonical = [
      signal("service", 92, 80, [
        {
          sourceType: "quiz",
          affinity: 92,
          coverage: 100,
          contributions: [
            contribution(
              "quiz",
              "roles-headspaces",
              "service",
              92,
              100,
              "quiz v3",
            ),
          ],
        },
      ]),
      signal("devotion", 90, 80, [
        {
          sourceType: "quiz",
          affinity: 90,
          coverage: 100,
          contributions: [
            contribution(
              "quiz",
              "roles-headspaces",
              "devotion",
              90,
              100,
              "quiz v3",
            ),
          ],
        },
      ]),
      signal("obedience", 85, 80),
      signal("ritual_significance", 82, 80),
      signal("praise_approval", 78, 80),
    ];

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      completedProfile(),
    );
    const service = facet(model, "service_devotion");

    expect(service.affinity).toBeGreaterThan(80);
    expect(service.evidenceState).toBe("growing");
    expect(service.evidenceLabel).toBe("Growing evidence");
    expect(service.sources[0]).toEqual(
      expect.objectContaining({
        label: "Roles & Headspaces",
        detail: "v3",
      }),
    );
  });

  it("qualifies a sparse 100% result instead of presenting it as fully known", () => {
    const canonical = [
      signal("ownership_symbolism", 100, 20, [
        {
          sourceType: "catalog_explicit",
          affinity: 100,
          coverage: 25,
          contributions: [
            contribution(
              "catalog_explicit",
              "collar",
              "ownership_symbolism",
              100,
              25,
            ),
          ],
        },
      ]),
    ];

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      createEmptyProfile(),
    );
    const ownership = facet(model, "ownership_belonging");

    expect(ownership.affinity).toBe(100);
    expect(ownership.evidenceState).toBe("limited");
    expect(ownership.evidenceMessage).toContain(
      "smaller slice of evidence",
    );
    expect(ownership.nextStep).toEqual(
      expect.objectContaining({ type: "quiz" }),
    );
  });

  it("surfaces materially conflicting independent evidence sources", () => {
    const canonical = [
      signal("service", 60, 80, [
        {
          sourceType: "quiz",
          affinity: 95,
          coverage: 100,
          contributions: [
            contribution(
              "quiz",
              "roles-headspaces",
              "service",
              95,
              100,
              "quiz v3",
            ),
          ],
        },
        {
          sourceType: "catalog_explicit",
          affinity: 20,
          coverage: 100,
          contributions: [
            contribution(
              "catalog_explicit",
              "service-item",
              "service",
              20,
              100,
            ),
          ],
        },
      ]),
      signal("devotion", 70, 80),
    ];

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      createEmptyProfile(),
    );
    const service = facet(model, "service_devotion");

    expect(service.hasSourceConflict).toBe(true);
    expect(service.conflictMessage).toContain(
      "pulling this theme",
    );
    expect(service.sources.map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "Roles & Headspaces",
        "Catalog preferences",
      ]),
    );
  });

  it("points partial themes toward a relevant unfinished quiz", () => {
    const profile = createEmptyProfile();
    profile.quizzes["sadism-masochism"] = {
      quizVersion: 1,
      answers: { "sm-001": 4 },
    };

    const canonical = [
      signal("pain_receiving", 90, 30),
    ];
    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      profile,
    );
    const intensity = facet(model, "intensity_pain");

    expect(intensity.evidenceState).toBe("limited");
    expect(intensity.nextStep).toEqual({
      type: "quiz",
      quizId: "sadism-masochism",
      label: "Continue S/M",
    });
  });

  it("keeps unexplored facets unknown rather than inventing 0% affinity", () => {
    const model = buildProfileExplainability(
      [],
      scoreOverallFacets([]),
      createEmptyProfile(),
    );
    const restraint = facet(
      model,
      "restraint_physical_control",
    );

    expect(restraint.affinity).toBeNull();
    expect(restraint.coverage).toBe(0);
    expect(restraint.evidenceState).toBe("unknown");
    expect(restraint.contributingSignals).toEqual([]);
    expect(restraint.sources).toEqual([]);
  });

  it("summarizes catalog and pairwise source identity without exposing internal evidence ids", () => {
    const canonical = [
      signal("pain_giving", 75, 70, [
        {
          sourceType: "catalog_explicit",
          affinity: 80,
          coverage: 75,
          contributions: [
            contribution(
              "catalog_explicit",
              "impact-play",
              "pain_giving",
              80,
              75,
            ),
            contribution(
              "catalog_explicit",
              "spanking",
              "pain_giving",
              80,
              75,
            ),
          ],
        },
        {
          sourceType: "catalog_pairwise",
          affinity: 65,
          coverage: 50,
          contributions: [
            contribution(
              "catalog_pairwise",
              "cmp-1",
              "pain_giving",
              100,
              12.5,
            ),
            contribution(
              "catalog_pairwise",
              "cmp-2",
              "pain_giving",
              0,
              12.5,
            ),
          ],
        },
      ]),
    ];

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      createEmptyProfile(),
    );
    const intensity = facet(model, "intensity_pain");

    expect(intensity.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Catalog preferences",
          detail: "2 directly marked items",
        }),
        expect.objectContaining({
          label: "This or That",
          detail: "2 meaningful comparisons",
        }),
      ]),
    );
    expect(JSON.stringify(intensity)).not.toContain(
      "sourceEvidenceIds",
    );
  });

  it("keeps exploration status subordinate and count-based", () => {
    const model = buildProfileExplainability(
      [],
      scoreOverallFacets([]),
      completedProfile(),
    );

    expect(model.exploredQuizCount).toBe(2);
    expect(model.totalQuizCount).toBe(4);
  });
});
