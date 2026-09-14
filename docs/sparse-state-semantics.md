# Shared Sparse-State Semantics

## Status

**Implemented shared contract for #200 / #202.**

Runtime vocabulary and resolution live in `src/lib/sparseState.ts`.

This contract is intentionally presentation-oriented. It sits above the source-aware evidence architecture and does not replace scoring, persistence, or provenance. Feature surfaces map their evidence/result conditions into this shared vocabulary instead of inventing independent `items.length === 0` behavior.

---

# Core principle

**Empty is not zero. Unknown is not low affinity. Missing evidence is not weak preference.**

The resolver therefore does not accept a numeric affinity/score. It resolves three separate concerns:

1. **evidence level** — none, partial, or sufficient
2. **result presence** — missing, measured value, or valid empty result
3. **evidence provenance** — direct, inferred, or mixed

A measured numeric `0` can still be an `available` result when evidence is sufficient. Conversely, a missing/unknown value cannot become an `available` zero simply because a consumer defaults a number.

Affinity/strength remains owned by scoring. Evidence coverage controls how confidently a result can be presented, not the result's numeric direction.

---

# Shared states

The canonical high-level states are:

- `unexplored` — no meaningful evidence exists for the semantic unit
- `developing` — evidence exists, but the result is not established enough for normal presentation
- `valid_empty` — enough evidence exists to establish that there is no qualifying result, including an affirmative explicit-none outcome
- `available` — a measured result exists with enough evidence for normal presentation
- `unavailable` — a prerequisite or normal product condition prevents the result from being available
- `excluded_by_user` — presentation-only user exclusion around an otherwise independently resolved semantic state

Loading failures, invalid configuration, missing source data caused by bugs, and other system failures are **not** sparse states. They remain error/recovery states outside this resolver.

---

# Core reasons

The shared layer currently defines these reusable reasons:

- `no_evidence`
- `insufficient_coverage`
- `missing_direct_evidence`
- `no_qualifying_result`
- `explicit_none`
- `missing_prerequisite`
- `unresolved_result`

Features may add their own reason strings while keeping the high-level state vocabulary shared. Copy and visual treatment remain feature-owned.

---

# Evidence provenance

Direct and inferred evidence remain distinguishable in every resolution.

The resolver reports provenance as:

- `none`
- `direct`
- `inferred`
- `mixed`

This allows a surface to use inferred evidence for discovery or provisional presentation without silently upgrading it into a direct personal claim.

The underlying evidence architecture remains the source of truth for concrete evidence records and provenance. Sparse-state resolution does not persist or rewrite those records.

---

# Resolution rules

## No evidence

No evidence resolves to `unexplored`, even if a caller has a numeric value slot or an empty collection available in memory.

This prevents common defaulting behavior such as `undefined ?? 0` from manufacturing a meaningful low result.

## Partial evidence

Partial evidence resolves to `developing` by default. The measured affinity, if one exists, is not altered; the state describes confidence/presentation rather than score strength.

## Sufficient evidence + measured result

A measured result with sufficient evidence resolves to `available`.

The resolver intentionally does not inspect the score itself. High, low, balanced, and zero-valued measured results can all be real results.

## Valid empty result

A non-explicit valid empty result requires sufficient evidence and resolves to `valid_empty`.

A missing record or empty collection is not automatically a valid empty result. Callers must intentionally classify the result as `valid_empty` after their feature-specific qualification logic has established that meaning.

## Explicit none

`explicit_none` is stricter than a generic valid-empty result:

- the result must be classified as `valid_empty`
- direct affirmative evidence must exist
- inferred-only evidence cannot establish explicit none
- no evidence remains `unexplored`

This is the contract used by safety/boundary surfaces such as Hard Limits: an empty collection must never silently become “none.”

## Unavailable

Normal prerequisite/readiness conditions may resolve to `unavailable` (for example, a missing prerequisite). Data/system failures remain errors outside this taxonomy.

## User exclusion

User exclusion is a presentation wrapper, not an evidence mutation.

When `excludedByUser` is true, the resolver returns:

- `state: "excluded_by_user"` for presentation
- the independently calculated `semanticState` underneath it
- unchanged evidence provenance

Removing the exclusion therefore reveals the same measured semantic result; it does not need to reconstruct evidence that was overwritten.

---

# Feature integration boundary

Quizzes, Profile, and Hub should consume this shared vocabulary while owning their own mapping logic and UX:

- Quizzes map never-started, in-progress, retake, completed, and per-dimension evidence conditions into the resolver.
- Profile maps whole-profile maturity and section-level eligibility into the resolver without treating unknown dimensions as zero.
- Hub uses resolved eligibility to compose meaningful modules rather than rendering fixed empty placeholders.

Catalog-specific and tool-specific empty/readiness semantics remain separate work unless they intentionally adopt this same contract later.

---

# Non-goals

This layer does not:

- calculate affinity
- change scoring thresholds
- persist new profile truth
- merge or replace evidence sources
- convert inferred evidence into direct evidence
- decide feature-specific copy
- represent loading/error/recovery failures

Its only job is to make the semantic condition behind sparse/empty presentation explicit and reusable.
