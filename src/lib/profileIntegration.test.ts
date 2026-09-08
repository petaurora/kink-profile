import { describe, expect, it } from "vitest";
import { kinkCatalog } from "../data/kinkCatalog.generated";
import { overallFacetDefinitions } from "../data/overallFacets";
import type { SignalId } from "../data/signals";
import {
  createEmptyCatalogProfileState,
  setCatalogPreference,
} from "./catalogProfile";
import { buildCatalogResultView } from "./catalogResults";
import { buildOverallRadarModel } from "./overallRadar";
import { scoreOverallFacets } from "./overallProfileFacets";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import { buildProfileExplainability } from "./profileExplainability";
import { buildProfileHardLimits } from "./profileHardLimits";
import { buildProfileHeaderModel } from "./profileHeader";
import { buildProfileInterestAreas } from "./profileInterestAreas";
import { buildProfileRoleDetails } from "./profileRoleDetails";
import { buildProfileTopInterests } from "./profileTopInterests";
import { createEmptyProfile } from "./profileStorage";
import {
  createEmptyRewardPunishmentProfileState,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import { buildRewardPunishmentOverallProfileSummary } from "./rewardPunishmentProfileSummary";

const authoritySignals = new Set<SignalId>([
  "receiving_control",
  "responsibility_transfer",
  "obedience",
  "giving_control",
]);

function canonical(
  signalId: SignalId,
  affinity = 78,
  coverage = 80,
): CanonicalSignalResult {
  const quizId = authoritySignals.has(signalId)
    ? "dominance-submission"
    : "roles-headspaces";

  return {
    signalId,
    affinity,
    coverage,
    channels: [
      {
        sourceType: "quiz",
        affinity,
        coverage: 100,
        reliability: 0.8,
        effectiveWeight: 0.8,
        contributions: [
          {
            sourceType: "quiz",
            sourceId: quizId,
            signalId,
            affinity,
            coverage: 100,
            detail: quizId === "dominance-submission" ? "quiz v1" : "quiz v3",
            sourceEvidenceIds: [`quiz:${quizId}:${signalId}`],
          },
        ],
      },
    ],
    sourceEvidenceIds: [`quiz:${quizId}:${signalId}`],
  };
}

function allFacetSignals() {
  return [
    ...new Set(
      overallFacetDefinitions.flatMap((facet) =>
        facet.signals.map((signal) => signal.signalId),
      ),
    ),
  ];
}

describe("M7.11 final profile integration", () => {
  it("keeps a completely empty profile truthful across every aggregate layer", () => {
    const stored = createEmptyProfile();
    const catalog = createEmptyCatalogProfileState();
    const canonicalSignals: CanonicalSignalResult[] = [];
    const facets = scoreOverallFacets(canonicalSignals);
    const header = buildProfileHeaderModel(canonicalSignals, facets);
    const radar = buildOverallRadarModel(facets, header.strongestFacetIds);
    const roles = buildProfileRoleDetails(canonicalSignals);
    const explain = buildProfileExplainability(
      canonicalSignals,
      facets,
      stored,
    );
    const catalogView = buildCatalogResultView(stored, catalog);

    expect(header.orientation.label).toBe("Still emerging");
    expect(header.headspaces).toEqual([]);
    expect(header.dynamicModes).toEqual([]);
    expect(radar.knownAxisCount).toBe(0);
    expect(radar.axes).toHaveLength(9);
    expect(radar.axes.every((axis) => axis.affinity === null)).toBe(true);
    expect(roles.headspaces).toEqual([]);
    expect(explain.facets.every((facet) => facet.evidenceState === "unknown")).toBe(
      true,
    );
    expect(buildProfileTopInterests(catalogView)).toEqual([]);
    expect(buildProfileHardLimits(catalogView).all).toEqual([]);
    expect(buildProfileInterestAreas(catalogView, [])).toEqual([]);
  });

  it("keeps a partial profile open and qualified instead of fabricating a complete shape", () => {
    const stored = createEmptyProfile();
    const canonicalSignals = [
      canonical("service", 95, 30),
      canonical("devotion", 92, 30),
    ];
    const facets = scoreOverallFacets(canonicalSignals);
    const header = buildProfileHeaderModel(canonicalSignals, facets);
    const radar = buildOverallRadarModel(facets, header.strongestFacetIds);
    const explain = buildProfileExplainability(
      canonicalSignals,
      facets,
      stored,
    );
    const service = explain.facets.find(
      (facet) => facet.facetId === "service_devotion",
    );

    expect(radar.hasCompleteShape).toBe(false);
    expect(radar.knownAxisCount).toBeGreaterThan(0);
    expect(radar.knownAxisCount).toBeLessThan(9);
    expect(service?.affinity).toBeGreaterThan(90);
    expect(service?.evidenceState).not.toBe("established");
    expect(
      explain.facets.some(
        (facet) => facet.affinity === null && facet.coverage === 0,
      ),
    ).toBe(true);
  });

  it("keeps M11 contextual evidence completely isolated from M7 header/radar/Top Overall", () => {
    const stored = createEmptyProfile();
    const canonicalSignals = [
      canonical("receiving_control", 92),
      canonical("responsibility_transfer", 90),
      canonical("obedience", 88),
      canonical("giving_control", 25),
      canonical("service", 90),
      canonical("devotion", 92),
    ];

    let catalog = createEmptyCatalogProfileState();
    const loved = kinkCatalog[0]!;
    catalog = setCatalogPreference(
      catalog,
      loved.id,
      "overall",
      "love",
      "2026-09-08T20:00:00.000Z",
    );

    const catalogView = buildCatalogResultView(stored, catalog);
    const beforeFacets = scoreOverallFacets(canonicalSignals);
    const beforeHeader = buildProfileHeaderModel(
      canonicalSignals,
      beforeFacets,
    );
    const beforeRadar = buildOverallRadarModel(
      beforeFacets,
      beforeHeader.strongestFacetIds,
    );
    const beforeTop = buildProfileTopInterests(catalogView);

    let contextual = createEmptyRewardPunishmentProfileState();
    const [first, second, third] = rewardPunishmentPrimitives;
    contextual = setContextSuitability(
      contextual,
      first.ref,
      "reward",
      "strong",
    );
    contextual = setContextSuitability(
      contextual,
      second.ref,
      "punishment",
      "strong",
    );
    contextual = setContextSuitability(
      contextual,
      third.ref,
      "reward",
      "works",
    );

    buildRewardPunishmentOverallProfileSummary(
      contextual,
      [
        {
          id: "rp-1",
          context: "reward",
          leftPrimitiveKey: rewardPunishmentPrimitiveKey(first.ref),
          rightPrimitiveKey: rewardPunishmentPrimitiveKey(third.ref),
          result: "left",
          timestamp: "2026-09-08T20:01:00.000Z",
        },
      ],
      canonicalSignals,
      catalogView,
    );

    const afterFacets = scoreOverallFacets(canonicalSignals);
    const afterHeader = buildProfileHeaderModel(
      canonicalSignals,
      afterFacets,
    );
    const afterRadar = buildOverallRadarModel(
      afterFacets,
      afterHeader.strongestFacetIds,
    );
    const afterTop = buildProfileTopInterests(catalogView);

    expect(afterFacets).toEqual(beforeFacets);
    expect(afterHeader).toEqual(beforeHeader);
    expect(afterRadar).toEqual(beforeRadar);
    expect(afterTop).toEqual(beforeTop);
  });

  it("produces one coherent full-profile pipeline while preserving direct catalog boundaries", () => {
    const stored = createEmptyProfile();
    const canonicalSignals = allFacetSignals().map((signalId) => {
      if (signalId === "receiving_control") return canonical(signalId, 92);
      if (signalId === "responsibility_transfer") return canonical(signalId, 90);
      if (signalId === "obedience") return canonical(signalId, 88);
      if (signalId === "giving_control") return canonical(signalId, 30);
      return canonical(signalId);
    });
    const facets = scoreOverallFacets(canonicalSignals);
    const header = buildProfileHeaderModel(canonicalSignals, facets);
    const radar = buildOverallRadarModel(facets, header.strongestFacetIds);
    const explain = buildProfileExplainability(
      canonicalSignals,
      facets,
      stored,
    );

    expect(header.orientation.label).toBe("Submissive");
    expect(radar.knownAxisCount).toBe(9);
    expect(radar.hasCompleteShape).toBe(true);
    expect(explain.facets.every((facet) => facet.evidenceState === "established")).toBe(
      true,
    );

    const loved = kinkCatalog[0];
    const limited = kinkCatalog[1];
    expect(loved).toBeDefined();
    expect(limited).toBeDefined();

    let catalog = createEmptyCatalogProfileState();
    catalog = setCatalogPreference(
      catalog,
      loved.id,
      "overall",
      "love",
      "2026-09-07T00:00:00.000Z",
    );
    catalog = setCatalogPreference(
      catalog,
      limited.id,
      "overall",
      "hard_limit",
      "2026-09-07T00:00:01.000Z",
    );

    const catalogView = buildCatalogResultView(stored, catalog);
    const top = buildProfileTopInterests(catalogView);
    const limits = buildProfileHardLimits(catalogView);

    expect(top.map((item) => item.catalogId)).toContain(loved.id);
    expect(top.map((item) => item.catalogId)).not.toContain(limited.id);
    expect(limits.all.map((item) => item.catalogId)).toContain(limited.id);
  });
});
