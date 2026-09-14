# Profile Personal-Claim Semantics

## Status

Implemented for #200 / #205 on top of the shared sparse-state and Profile maturity contracts.

This layer covers Profile surfaces that make stronger claims about the person than a passive visualization does. It does not replace scoring, evidence provenance, or the shared sparse-state resolver.

## Core rule

**A personal claim needs evidence appropriate to the claim. Inference may support exploration, but it must not silently become a favorite, identity, or safety statement.**

## Identity-adjacent calculated labels

Calculated identity-adjacent presentation distinguishes:

- `unknown` — not enough relevant evidence to calculate the label;
- `low_match` — relevant evidence exists, but none of the candidate directions is a strong match;
- `balanced` — meaningful evidence exists without one clear leading direction;
- `calculated_match` — the evidence supports a recognizable calculated direction;
- `explicit_none` — the user directly states that no self-identified label applies;
- `self_identified` — the user directly supplies their own identity label.

Direct self-identification and explicit-none are presentation wrappers. They do **not** overwrite the underlying calculated result. The calculated state and label remain available for explainability.

The D/s orientation header now uses this distinction instead of collapsing weak match and balanced/no-leader into one generic `Context-dependent` result.

## Top Overall

Top Overall remains an authoritative personal ranking only for items with direct user evidence.

An item becomes eligible through either:

- a positive explicit catalog preference (`Love`, `Like`, or `Curious`); or
- active Overall This-or-That ranking evidence.

Quiz-derived/inferred affinity cannot make an item eligible by itself. Once direct eligibility exists, inferred quiz fit may provide the existing bounded, coverage-aware presentation adjustment without becoming a direct source or stored preference.

Existing regression coverage in `profileTopInterests.test.ts` verifies that inferred-only and quiz-only items cannot enter Top Overall.

## Hard Limits

An empty Hard Limits collection is **unknown**, not “none.”

The Profile summary therefore distinguishes:

- one or more directly marked Hard Limits → available direct boundary data;
- no recorded limits and no assertion → unexplored / unknown;
- a direct “I currently have no Hard Limits” assertion → valid empty / `explicit_none`.

The affirmative-none statement is stored independently from catalog preference evidence. It cannot manufacture, remove, or rewrite a catalog preference.

If a concrete Hard Limit exists, the concrete limit takes precedence over a stale none assertion. When the Profile observes both, it clears the stale presentation assertion.

## User exclusion and direct overrides

User-controlled presentation state must never rewrite underlying measurements.

This follows the shared resolver rule introduced in #202: exclusion wraps semantic state while preserving the independently calculated result and provenance. Identity self-identification/explicit-none uses the same shape of contract: direct presentation can wrap a calculated result without mutating it.

## Non-goals

This work does not:

- redesign affinity/scoring formulas;
- turn inferred evidence into direct evidence;
- add inferred items to Top Overall;
- treat missing boundary records as affirmative none;
- replace the broader identity/profile-settings roadmap;
- redesign Profile visuals beyond the copy/actions needed to communicate truthful state.

The boundary assertion is a small local presentation-state store. Broader backup/export/reset lifecycle integration can be handled with the profile-data lifecycle work rather than coupling a safety-summary semantic fix to a backup-format migration.
