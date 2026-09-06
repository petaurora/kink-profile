import { describe, expect, it } from "vitest";
import type { KinkCatalogSignalMapping } from "../data/kinkCatalog.generated";
import type { QuizId } from "../data/quizzes";
import type { SignalId } from "../data/signals";
import {
  aggregateCanonicalSignalEvidence,
  canonicalSignalSourceReliability,
} from "./overallProfileSignals";
import type {
  DirectCatalogSignalProjection,
  ExplicitCatalogSignalProjection,
  PairwiseCatalogSignalProjection,
  QuizSignalEvidence,
} from "./profileEvidence";

function quizEvidence(
  quizId: QuizId,
  signalId: SignalId,
  affinity: number,
  coverage: number,
  sourceVersion = 1,
): QuizSignalEvidence {
  return {
    kind: "quiz_signal",
    sourceType: "quiz",
    evidenceId: `quiz:${quizId}:${signalId}`,
    quizId,
    sourceVersion,
    signalId,
    affinity,
    coverage,
  };
}

function explicitProjection({
  catalogId,
  signalId,
  context = "overall",
  polarity = "positive",
  strength = "strong",
  mappingWeight = 1,
}: {
  catalogId: string;
  signalId: SignalId;
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

function pairwiseProjection({
  comparisonId = "cmp-1",
  relation = "left_preferred",
  leftMappings,
  rightMappings,
}: {
  comparisonId?: string;
  relation?: PairwiseCatalogSignalProjection["relation"];
  leftMappings: readonly KinkCatalogSignalMapping[];
  rightMappings: readonly KinkCatalogSignalMapping[];
}): PairwiseCatalogSignalProjection {
  return {
    kind: "pairwise_catalog_signal_projection",
    sourceEvidenceId: `catalog-pairwise:${comparisonId}`,
    comparisonId,
    relation,
    leftCatalogId: "left-item",
    rightCatalogId: "right-item",
    leftMappings,
    rightMappings,
  };
}

describe("M7.1 canonical signal aggregation", () => {
  it("merges repeated SignalIds within the quiz channel without counting the signal twice downstream", () => {
    const result = aggregateCanonicalSignalEvidence(
      [
        quizEvidence(
          "dominance-submission",
          "receiving_control",
          100,
          50,
        ),
        quizEvidence(
          "roles-headspaces",
          "receiving_control",
          0,
          50,
        ),
      ],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].signalId).toBe("receiving_control");
    expect(result[0].affinity).toBe(50);

    const quiz = result[0].channels[0];
    expect(quiz.sourceType).toBe("quiz");
    expect(quiz.affinity).toBe(50);
    expect(quiz.coverage).toBe(75);
    expect(quiz.contributions).toHaveLength(2);

    // Cross-source coverage is intentionally capped below 100 when only one
    // evidence class exists, leaving room for independent corroboration.
    expect(result[0].coverage).toBe(60);
  });

  it("uses the newest contribution for the same quiz+signal evidence identity while preserving catalog evidence", () => {
    const oldQuiz = quizEvidence(
      "dominance-submission",
      "structure",
      20,
      100,
      1,
    );
    const retake = {
      ...oldQuiz,
      affinity: 90,
      sourceVersion: 2,
    };
    const catalog = explicitProjection({
      catalogId: "protocol-item",
      signalId: "structure",
      strength: "moderate",
    });

    const result = aggregateCanonicalSignalEvidence(
      [oldQuiz, retake],
      [catalog],
    )[0];

    expect(result.channels).toHaveLength(2);
    const quiz = result.channels.find((item) => item.sourceType === "quiz");
    const explicit = result.channels.find(
      (item) => item.sourceType === "catalog_explicit",
    );

    expect(quiz?.contributions).toHaveLength(1);
    expect(quiz?.contributions[0]).toEqual(
      expect.objectContaining({
        affinity: 90,
        detail: "quiz v2",
      }),
    );
    expect(explicit?.contributions).toHaveLength(1);
    expect(explicit?.contributions[0].sourceId).toBe("protocol-item");
  });

  it("lets a directional explicit override supersede the same item's overall state for a directional signal", () => {
    const direct: DirectCatalogSignalProjection[] = [
      explicitProjection({
        catalogId: "control-item",
        signalId: "receiving_control",
        context: "overall",
        polarity: "positive",
        strength: "strong",
      }),
      explicitProjection({
        catalogId: "control-item",
        signalId: "receiving_control",
        context: "receiving",
        polarity: "negative",
        strength: "strong",
      }),
    ];

    const result = aggregateCanonicalSignalEvidence([], direct)[0];
    const explicit = result.channels[0];

    expect(result.affinity).toBe(0);
    expect(explicit.contributions).toHaveLength(1);
    expect(explicit.contributions[0].detail).toBe("receiving");
    expect(explicit.contributions[0].sourceEvidenceIds).toEqual([
      "catalog-explicit:control-item:receiving",
    ]);
  });

  it("caps explicit catalog evidence as one channel so catalog volume cannot numerically bury quiz evidence", () => {
    const manyNegativeExplicit = Array.from({ length: 20 }, (_, index) =>
      explicitProjection({
        catalogId: `item-${index}`,
        signalId: "ownership_symbolism",
        polarity: "negative",
        strength: "strong",
      }),
    );

    const result = aggregateCanonicalSignalEvidence(
      [
        quizEvidence(
          "dominance-submission",
          "ownership_symbolism",
          100,
          100,
        ),
      ],
      manyNegativeExplicit,
    )[0];

    const quiz = result.channels.find((item) => item.sourceType === "quiz");
    const explicit = result.channels.find(
      (item) => item.sourceType === "catalog_explicit",
    );

    expect(quiz?.effectiveWeight).toBe(
      canonicalSignalSourceReliability.quiz,
    );
    expect(explicit?.effectiveWeight).toBe(
      canonicalSignalSourceReliability.catalog_explicit,
    );
    expect(explicit?.contributions).toHaveLength(20);
    expect(result.affinity).toBe(55.2);
    expect(result.coverage).toBe(93);
  });

  it("uses pairwise comparisons only when the two options discriminate a SignalId", () => {
    const result = aggregateCanonicalSignalEvidence(
      [],
      [
        pairwiseProjection({
          leftMappings: [
            { signalId: "receiving_restraint", weight: 1 },
          ],
          rightMappings: [{ signalId: "structure", weight: 1 }],
          relation: "left_preferred",
        }),
      ],
    );

    const restraint = result.find(
      (item) => item.signalId === "receiving_restraint",
    );
    const structure = result.find((item) => item.signalId === "structure");

    expect(restraint?.affinity).toBe(100);
    expect(structure?.affinity).toBe(0);
    expect(restraint?.channels[0].coverage).toBe(12.5);
    expect(restraint?.coverage).toBe(6.3);
  });

  it("ignores pairwise comparisons when both choices express the same signal", () => {
    const result = aggregateCanonicalSignalEvidence(
      [],
      [
        pairwiseProjection({
          leftMappings: [{ signalId: "structure", weight: 1 }],
          rightMappings: [{ signalId: "structure", weight: 0.5 }],
          relation: "left_preferred",
        }),
      ],
    );

    expect(result).toEqual([]);
  });

  it("treats an equal pairwise result as neutral relative evidence rather than positive or negative affinity", () => {
    const result = aggregateCanonicalSignalEvidence(
      [],
      [
        pairwiseProjection({
          leftMappings: [{ signalId: "primal_embodiment", weight: 1 }],
          rightMappings: [{ signalId: "structure", weight: 1 }],
          relation: "equal",
        }),
      ],
    );

    expect(
      result.find((item) => item.signalId === "primal_embodiment")?.affinity,
    ).toBe(50);
    expect(result.find((item) => item.signalId === "structure")?.affinity).toBe(
      50,
    );
  });

  it("keeps affinity separate from evidence coverage for weak explicit mappings", () => {
    const result = aggregateCanonicalSignalEvidence(
      [],
      [
        explicitProjection({
          catalogId: "weakly-mapped-item",
          signalId: "devotion",
          polarity: "positive",
          strength: "strong",
          mappingWeight: 0.25,
        }),
      ],
    )[0];

    expect(result.affinity).toBe(100);
    expect(result.channels[0].coverage).toBe(25);
    expect(result.coverage).toBe(16.3);
  });
});
