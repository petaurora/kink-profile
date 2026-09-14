export const SPARSE_STATE_KINDS = [
  "unexplored",
  "developing",
  "valid_empty",
  "available",
  "unavailable",
  "excluded_by_user",
] as const;

export type SparseStateKind = (typeof SPARSE_STATE_KINDS)[number];
export type SemanticSparseStateKind = Exclude<
  SparseStateKind,
  "excluded_by_user"
>;

export const CORE_SPARSE_STATE_REASONS = [
  "no_evidence",
  "insufficient_coverage",
  "missing_direct_evidence",
  "no_qualifying_result",
  "explicit_none",
  "missing_prerequisite",
  "unresolved_result",
] as const;

export type CoreSparseStateReason =
  (typeof CORE_SPARSE_STATE_REASONS)[number];

export type SparseStateReason<FeatureReason extends string = never> =
  | CoreSparseStateReason
  | FeatureReason;

export type SparseEvidenceLevel = "none" | "partial" | "sufficient";
export type SparseEvidenceProvenance =
  | "none"
  | "direct"
  | "inferred"
  | "mixed";

type SparseEvidenceWithSource<
  Level extends Exclude<SparseEvidenceLevel, "none">,
> =
  | {
      level: Level;
      direct: true;
      inferred: boolean;
    }
  | {
      level: Level;
      direct: false;
      inferred: true;
    };

export type SparseEvidence =
  | {
      level: "none";
      direct: false;
      inferred: false;
    }
  | SparseEvidenceWithSource<"partial">
  | SparseEvidenceWithSource<"sufficient">;

export type SparseResultPresence = "missing" | "value" | "valid_empty";

export type ResolveSparseStateInput<FeatureReason extends string = never> = {
  evidence: SparseEvidence;
  result: SparseResultPresence;
  reason?: SparseStateReason<FeatureReason>;
  unavailable?: boolean;
  excludedByUser?: boolean;
};

export type SparseStateResolution<FeatureReason extends string = never> = {
  /** Presentation state. User exclusion may wrap the underlying semantic state. */
  state: SparseStateKind;
  /** State derived from evidence/result semantics before presentation-only exclusion. */
  semanticState: SemanticSparseStateKind;
  /** Reason for the semantic state. Feature-specific reasons may extend the core set. */
  reason?: SparseStateReason<FeatureReason>;
  evidence: {
    level: SparseEvidenceLevel;
    provenance: SparseEvidenceProvenance;
    hasDirectEvidence: boolean;
    hasInferredEvidence: boolean;
  };
};

type SemanticResolution<FeatureReason extends string> = {
  state: SemanticSparseStateKind;
  reason?: SparseStateReason<FeatureReason>;
};

export function getSparseEvidenceProvenance(
  evidence: SparseEvidence,
): SparseEvidenceProvenance {
  if (evidence.direct && evidence.inferred) return "mixed";
  if (evidence.direct) return "direct";
  if (evidence.inferred) return "inferred";
  return "none";
}

function resolveSemanticSparseState<FeatureReason extends string>(
  input: ResolveSparseStateInput<FeatureReason>,
): SemanticResolution<FeatureReason> {
  const { evidence, reason, result } = input;

  if (input.unavailable) {
    return {
      state: "unavailable",
      reason: reason ?? "missing_prerequisite",
    };
  }

  if (reason === "explicit_none") {
    if (result !== "valid_empty") {
      return {
        state: evidence.level === "none" ? "unexplored" : "developing",
        reason: evidence.level === "none" ? "no_evidence" : "unresolved_result",
      };
    }

    if (!evidence.direct) {
      return {
        state: evidence.level === "none" ? "unexplored" : "developing",
        reason:
          evidence.level === "none" ? "no_evidence" : "missing_direct_evidence",
      };
    }

    return {
      state: "valid_empty",
      reason: "explicit_none",
    };
  }

  if (evidence.level === "none") {
    return {
      state: "unexplored",
      reason: reason ?? "no_evidence",
    };
  }

  if (evidence.level === "partial") {
    return {
      state: "developing",
      reason: reason ?? "insufficient_coverage",
    };
  }

  switch (result) {
    case "value":
      return {
        state: "available",
        reason,
      };
    case "valid_empty":
      return {
        state: "valid_empty",
        reason: reason ?? "no_qualifying_result",
      };
    case "missing":
      return {
        state: "developing",
        reason: reason ?? "unresolved_result",
      };
  }
}

/**
 * Resolves evidence/result semantics into the shared sparse-state vocabulary.
 *
 * Numeric affinity/score is intentionally not an input. Result presence and
 * evidence coverage are separate concerns, so a measured low/zero value can be
 * available while unknown evidence can never be coerced into a meaningful 0.
 *
 * Errors/loading failures belong outside this resolver. `excludedByUser` is a
 * presentation-only wrapper: `semanticState` always preserves the underlying
 * evidence/result meaning.
 */
export function resolveSparseState<FeatureReason extends string = never>(
  input: ResolveSparseStateInput<FeatureReason>,
): SparseStateResolution<FeatureReason> {
  const semantic = resolveSemanticSparseState(input);

  return {
    state: input.excludedByUser ? "excluded_by_user" : semantic.state,
    semanticState: semantic.state,
    reason: semantic.reason,
    evidence: {
      level: input.evidence.level,
      provenance: getSparseEvidenceProvenance(input.evidence),
      hasDirectEvidence: input.evidence.direct,
      hasInferredEvidence: input.evidence.inferred,
    },
  };
}
