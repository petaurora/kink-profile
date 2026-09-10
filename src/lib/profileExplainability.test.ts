import { describe, expect, it } from "vitest";
import { scoreOverallFacets } from "./overallProfileFacets";
import { buildProfileExplainability } from "./profileExplainability";
import {
  createEmptyProfile,
  type StoredProfile,
} from "./profileStorage";
import {
  buildCanonicalSignalFixtures,
  type CanonicalSignalFixture,
} from "./testCanonicalSignalFixtures";

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

function quiz(
  signalId: CanonicalSignalFixture["signalId"],
  affinity: number,
  coverage: number,
  channel?: CanonicalSignalFixture["channel"],
): CanonicalSignalFixture {
  return {
    signalId,
    affinity,
    coverage,
    channel,
    sourceType: "quiz",
    sourceId: "roles-headspaces",
    detail: "quiz v3",
  };
}

describe("M7.10 profile explainability", () => {
  it("keeps strong affinity separate from breadth of theme evidence", () => {
    const canonical = buildCanonicalSignalFixtures([
      quiz("service", 92, 80, "giving"),
      quiz("devotion", 90, 80),
      quiz("obedience", 85, 80, "giving"),
      quiz("ritual_significance", 82, 80),
      quiz("praise_approval", 78, 80, "receiving"),
    ]);

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      completedProfile(),
    );
    const service = facet(model, "service_devotion");

    expect(service.affinity).toBeGreaterThan(80);
    const expectedEvidence =
      service.coverage >= 55
        ? ["established", "Well supported"]
        : service.coverage >= 25
          ? ["growing", "Growing evidence"]
          : ["limited", "Limited evidence"];
    expect([service.evidenceState, service.evidenceLabel]).toEqual(
      expectedEvidence,
    );
    expect(service.sources[0]).toEqual(
      expect.objectContaining({
        label: "Roles & Headspaces",
        detail: "v3",
      }),
    );
  });

  it("qualifies a sparse 100% result instead of presenting it as fully known", () => {
    const canonical = buildCanonicalSignalFixtures([
      {
        signalId: "ownership_symbolism",
        affinity: 100,
        coverage: 25,
        sourceType: "catalog_explicit",
        sourceId: "collar",
      },
    ]);

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      createEmptyProfile(),
    );
    const ownership = facet(model, "ownership_belonging");

    expect(ownership.affinity).toBe(100);
    expect(ownership.evidenceState).toBe("limited");
    expect(ownership.evidenceMessage).toContain("smaller slice of evidence");
    expect(ownership.nextStep).toEqual(expect.objectContaining({ type: "quiz" }));
  });

  it("surfaces materially conflicting independent evidence sources", () => {
    const canonical = buildCanonicalSignalFixtures([
      quiz("service", 95, 100, "giving"),
      {
        signalId: "service",
        channel: "giving",
        affinity: 20,
        coverage: 100,
        sourceType: "catalog_explicit",
        sourceId: "service-item",
      },
      quiz("devotion", 70, 80),
    ]);

    const model = buildProfileExplainability(
      canonical,
      scoreOverallFacets(canonical),
      createEmptyProfile(),
    );
    const service = facet(model, "service_devotion");

    expect(service.hasSourceConflict).toBe(true);
    expect(service.conflictMessage).toContain("pulling this theme");
    expect(service.sources.map((source) => source.label)).toEqual(
      expect.arrayContaining(["Roles & Headspaces", "Catalog preferences"]),
    );
  });

  it("points partial themes toward a relevant unfinished quiz", () => {
    const profile = createEmptyProfile();
    profile.quizzes["sadism-masochism"] = {
      quizVersion: 1,
      answers: { "sm-001": 4 },
    };

    const canonical = buildCanonicalSignalFixtures([
      { signalId: "pain_receiving", affinity: 90, coverage: 30 },
    ]);
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
    const restraint = facet(model, "restraint_physical_control");

    expect(restraint.affinity).toBeNull();
    expect(restraint.coverage).toBe(0);
    expect(restraint.evidenceState).toBe("unknown");
    expect(restraint.contributingSignals).toEqual([]);
    expect(restraint.sources).toEqual([]);
  });

  it("summarizes catalog and pairwise source identity without exposing internal evidence ids", () => {
    const canonical = buildCanonicalSignalFixtures([
      {
        signalId: "pain_giving",
        affinity: 80,
        coverage: 75,
        sourceType: "catalog_explicit",
        sourceId: "impact-play",
      },
      {
        signalId: "pain_giving",
        affinity: 80,
        coverage: 75,
        sourceType: "catalog_explicit",
        sourceId: "spanking",
      },
      {
        signalId: "pain_giving",
        affinity: 100,
        coverage: 12.5,
        sourceType: "catalog_pairwise",
        sourceId: "cmp-1",
      },
      {
        signalId: "pain_giving",
        affinity: 0,
        coverage: 12.5,
        sourceType: "catalog_pairwise",
        sourceId: "cmp-2",
      },
    ]);

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
    expect(JSON.stringify(intensity)).not.toContain("sourceEvidenceIds");
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
