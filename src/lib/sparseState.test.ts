import { describe, expect, it } from "vitest";
import {
  getSparseEvidenceProvenance,
  resolveSparseState,
  type SparseEvidence,
} from "./sparseState";

const noEvidence: SparseEvidence = {
  level: "none",
  direct: false,
  inferred: false,
};

const partialDirectEvidence: SparseEvidence = {
  level: "partial",
  direct: true,
  inferred: false,
};

const sufficientDirectEvidence: SparseEvidence = {
  level: "sufficient",
  direct: true,
  inferred: false,
};

const sufficientInferredEvidence: SparseEvidence = {
  level: "sufficient",
  direct: false,
  inferred: true,
};

const sufficientMixedEvidence: SparseEvidence = {
  level: "sufficient",
  direct: true,
  inferred: true,
};

describe("shared sparse-state resolver", () => {
  it("keeps missing evidence unexplored even when a value slot is present", () => {
    const resolved = resolveSparseState({
      evidence: noEvidence,
      result: "value",
    });

    expect(resolved).toEqual({
      state: "unexplored",
      semanticState: "unexplored",
      reason: "no_evidence",
      evidence: {
        level: "none",
        provenance: "none",
        hasDirectEvidence: false,
        hasInferredEvidence: false,
      },
    });
  });

  it("treats partial evidence as developing without changing result strength", () => {
    expect(
      resolveSparseState({
        evidence: partialDirectEvidence,
        result: "value",
      }),
    ).toMatchObject({
      state: "developing",
      semanticState: "developing",
      reason: "insufficient_coverage",
    });
  });

  it("treats a sufficiently evidenced measured value as available", () => {
    expect(
      resolveSparseState({
        evidence: sufficientDirectEvidence,
        result: "value",
      }),
    ).toMatchObject({
      state: "available",
      semanticState: "available",
      reason: undefined,
    });
  });

  it("preserves direct, inferred, and mixed evidence provenance", () => {
    expect(getSparseEvidenceProvenance(sufficientDirectEvidence)).toBe("direct");
    expect(getSparseEvidenceProvenance(sufficientInferredEvidence)).toBe(
      "inferred",
    );
    expect(getSparseEvidenceProvenance(sufficientMixedEvidence)).toBe("mixed");

    expect(
      resolveSparseState({
        evidence: sufficientInferredEvidence,
        result: "value",
      }).evidence,
    ).toMatchObject({
      provenance: "inferred",
      hasDirectEvidence: false,
      hasInferredEvidence: true,
    });
  });

  it("does not accept inferred-only evidence as affirmative explicit-none evidence", () => {
    expect(
      resolveSparseState({
        evidence: sufficientInferredEvidence,
        result: "valid_empty",
        reason: "explicit_none",
      }),
    ).toMatchObject({
      state: "developing",
      semanticState: "developing",
      reason: "missing_direct_evidence",
    });
  });

  it("accepts explicit-none only when direct affirmative evidence exists", () => {
    expect(
      resolveSparseState({
        evidence: partialDirectEvidence,
        result: "valid_empty",
        reason: "explicit_none",
      }),
    ).toMatchObject({
      state: "valid_empty",
      semanticState: "valid_empty",
      reason: "explicit_none",
    });
  });

  it("does not manufacture explicit-none from missing evidence", () => {
    expect(
      resolveSparseState({
        evidence: noEvidence,
        result: "valid_empty",
        reason: "explicit_none",
      }),
    ).toMatchObject({
      state: "unexplored",
      semanticState: "unexplored",
      reason: "no_evidence",
    });
  });

  it("allows a valid empty result only after sufficient non-explicit evidence", () => {
    expect(
      resolveSparseState({
        evidence: partialDirectEvidence,
        result: "valid_empty",
        reason: "no_qualifying_result",
      }),
    ).toMatchObject({
      state: "developing",
      semanticState: "developing",
    });

    expect(
      resolveSparseState({
        evidence: sufficientDirectEvidence,
        result: "valid_empty",
      }),
    ).toMatchObject({
      state: "valid_empty",
      semanticState: "valid_empty",
      reason: "no_qualifying_result",
    });
  });

  it("keeps an unresolved result developing instead of treating it as empty", () => {
    expect(
      resolveSparseState({
        evidence: sufficientDirectEvidence,
        result: "missing",
      }),
    ).toMatchObject({
      state: "developing",
      semanticState: "developing",
      reason: "unresolved_result",
    });
  });

  it("keeps user exclusion presentation-only and preserves the underlying state", () => {
    const input = {
      evidence: sufficientDirectEvidence,
      result: "value" as const,
      excludedByUser: true,
    };

    const resolved = resolveSparseState(input);

    expect(resolved).toMatchObject({
      state: "excluded_by_user",
      semanticState: "available",
      evidence: {
        provenance: "direct",
      },
    });
    expect(input).toEqual({
      evidence: sufficientDirectEvidence,
      result: "value",
      excludedByUser: true,
    });
  });

  it("keeps unavailable/prerequisite states outside normal empty-result semantics", () => {
    expect(
      resolveSparseState({
        evidence: noEvidence,
        result: "missing",
        unavailable: true,
      }),
    ).toMatchObject({
      state: "unavailable",
      semanticState: "unavailable",
      reason: "missing_prerequisite",
    });
  });

  it("allows feature-specific reasons without changing the shared state vocabulary", () => {
    const resolved = resolveSparseState<"quiz_not_started">({
      evidence: noEvidence,
      result: "missing",
      reason: "quiz_not_started",
    });

    expect(resolved).toMatchObject({
      state: "unexplored",
      semanticState: "unexplored",
      reason: "quiz_not_started",
    });
  });

  it("rejects contradictory explicit-none metadata until the result is affirmative", () => {
    expect(
      resolveSparseState({
        evidence: sufficientDirectEvidence,
        result: "missing",
        reason: "explicit_none",
      }),
    ).toMatchObject({
      state: "developing",
      semanticState: "developing",
      reason: "unresolved_result",
    });
  });
});
