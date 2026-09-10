import { describe, expect, it } from "vitest";
import type { KinkCatalogSignalMapping } from "../data/kinkCatalog.generated";
import {
  canonicalExplicitCatalogSignalRef,
  canonicalQuizSignalRef,
} from "../data/canonicalSignals";
import {
  aggregateCanonicalSignalChannels,
  buildCanonicalExplicitContributions,
  buildCanonicalPairwiseContributions,
  type CanonicalSignalContribution,
} from "./overallProfileSignals";
import type {
  ExplicitCatalogSignalProjection,
  PairwiseCatalogSignalProjection,
} from "./profileEvidence";

function explicitProjection({
  catalogId = "item-1",
  signalId,
  context = "overall",
  polarity = "positive",
  strength = "strong",
  mappingWeight = 1,
}: {
  catalogId?: string;
  signalId: ExplicitCatalogSignalProjection["signalId"];
  context?: ExplicitCatalogSignalProjection["context"];
  polarity?: ExplicitCatalogSignalProjection["polarity"];
  strength?: ExplicitCatalogSignalProjection["strength"];
  mappingWeight?: number;
}): ExplicitCatalogSignalProjection {
  return {
    kind: "explicit_catalog_signal_projection",
    sourceEvidenceId: `catalog-explicit:${catalogId}:${context}`,
    catalogId,
    context,
    signalId,
    mappingWeight,
    polarity,
    strength,
  };
}

function pairwiseProjection(
  leftMappings: readonly KinkCatalogSignalMapping[],
  rightMappings: readonly KinkCatalogSignalMapping[],
): PairwiseCatalogSignalProjection {
  return {
    kind: "pairwise_catalog_signal_projection",
    sourceEvidenceId: "catalog-pairwise:cmp-1",
    comparisonId: "cmp-1",
    relation: "left_preferred",
    leftCatalogId: "left-item",
    rightCatalogId: "right-item",
    leftMappings,
    rightMappings,
  };
}

describe("M16.4 Signal + channel migration contract", () => {
  it("maps broad catalog evidence to Overall without inventing a directional side", () => {
    expect(
      canonicalExplicitCatalogSignalRef("receiving_control", "overall"),
    ).toEqual({ signalId: "control", channel: "overall" });

    const contributions = buildCanonicalExplicitContributions([
      explicitProjection({ signalId: "receiving_control", context: "overall" }),
    ]);
    expect(contributions).toHaveLength(1);
    expect(contributions[0]).toEqual(
      expect.objectContaining({
        signalId: "control",
        signalChannel: "overall",
      }),
    );

    const result = aggregateCanonicalSignalChannels(contributions).find(
      (signal) => signal.signalId === "control",
    );
    expect(result?.overall.affinity).toBe(100);
    expect(result?.receiving?.affinity).toBeNull();
    expect(result?.giving?.affinity).toBeNull();
  });

  it("keeps directional catalog context directional while allowing it to roll up to Overall", () => {
    const contributions = buildCanonicalExplicitContributions([
      explicitProjection({
        signalId: "receiving_control",
        context: "receiving",
      }),
    ]);

    expect(contributions.map((item) => item.signalChannel).sort()).toEqual([
      "overall",
      "receiving",
    ]);

    const result = aggregateCanonicalSignalChannels(contributions).find(
      (signal) => signal.signalId === "control",
    );
    expect(result?.overall.affinity).toBe(100);
    expect(result?.receiving?.affinity).toBe(100);
    expect(result?.giving?.affinity).toBeNull();
  });

  it("follows the direction of Responsibility itself rather than D/s orientation", () => {
    expect(
      canonicalQuizSignalRef("ds-003", "responsibility_transfer"),
    ).toEqual({ signalId: "responsibility", channel: "giving" });
    expect(
      canonicalQuizSignalRef("hs-023", "responsibility_holding"),
    ).toEqual({ signalId: "responsibility", channel: "receiving" });
  });

  it("splits legacy challenge_escape by question meaning", () => {
    expect(canonicalQuizSignalRef("bd-006", "challenge_escape")).toEqual({
      signalId: "escape_containment",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("bd-014", "challenge_escape")).toEqual({
      signalId: "escape_containment",
      channel: "giving",
    });
  });

  it("keeps Movement Restriction Overall-only", () => {
    expect(
      canonicalQuizSignalRef("bd-002", "movement_restriction"),
    ).toEqual({ signalId: "movement_restriction", channel: "overall" });
  });

  it("does not manufacture Overall pairwise evidence when only activity side differs", () => {
    const contributions = buildCanonicalPairwiseContributions([
      pairwiseProjection(
        [{ signalId: "receiving_restraint", weight: 1 }],
        [{ signalId: "giving_restraint", weight: 1 }],
      ),
    ]);

    expect(
      contributions.filter(
        (item) =>
          item.signalId === "restraint" && item.signalChannel === "overall",
      ),
    ).toEqual([]);
    expect(
      contributions.find(
        (item) => item.signalChannel === "receiving",
      )?.affinity,
    ).toBe(100);
    expect(
      contributions.find((item) => item.signalChannel === "giving")?.affinity,
    ).toBe(0);
  });

  it("represents missing directional evidence as unknown rather than zero", () => {
    const contribution: CanonicalSignalContribution = {
      sourceType: "quiz",
      sourceId: "dominance-submission",
      signalId: "control",
      signalChannel: "overall",
      affinity: 80,
      coverage: 100,
      sourceEvidenceIds: ["quiz:dominance-submission:test"],
    };

    const result = aggregateCanonicalSignalChannels([contribution]).find(
      (signal) => signal.signalId === "control",
    );

    expect(result?.overall.affinity).toBe(80);
    expect(result?.receiving?.affinity).toBeNull();
    expect(result?.giving?.affinity).toBeNull();
  });
});
