# M16 Signal + Channel Runtime Migration — Step 3

**Status:** validation  
**Depends on:** [M16 Signal Channel Audit](m16-signal-channel-audit.md)

## Purpose

Implement the Step 2 semantic audit in the profile-facing runtime before the audit PR is merged to `main`.

This branch deliberately keeps the legacy 45-ID quiz/catalog vocabulary available as source data while rebuilding the canonical profile from source evidence into:

```text
Signal
  ├─ Overall
  ├─ Receiving   [when applicable]
  └─ Giving      [when applicable]
```

The goal is to validate the semantic model against real profile behavior without a destructive global rename.

## Runtime boundary

Legacy IDs remain valid for:

- existing quiz question weights,
- generated catalog Signal mappings,
- legacy stored quiz answers,
- migration/debug comparison.

Profile-facing aggregation now normalizes those sources at the evidence boundary.

## Reprojection rules implemented

```text
quiz question evidence
  → channel determined by the question meaning
  → directional evidence also rolls up to Overall

catalog Overall
  → Signal.overall only

catalog Receiving
  → Signal.receiving when the Signal supports it
  → also rolls up to Signal.overall

catalog Giving
  → Signal.giving when the Signal supports it
  → also rolls up to Signal.overall

pairwise
  → directional only when the legacy mapping genuinely establishes a side
  → Overall only when the canonical base concept itself discriminates the pair
```

Missing Receiving/Giving evidence remains `null` / unknown rather than becoming zero.

## Canonical vocabulary

The normalized runtime contains the 33 current concepts from the audit plus the four approved additions:

- Exhibitionism
- Voyeurism
- Arousal Control
- Degradation / Humiliation

The new additions are currently vocabulary-only until source data begins mapping to them.

## Downstream migration

The validation runtime updates:

- canonical profile Signal aggregation,
- Overall Facet relationships,
- role/headspace composition,
- Dynamic Mode composition,
- profile orientation derivation,
- profile explainability.

Overall Facets stay non-directional. A facet may reference a particular Signal channel when that side has distinct semantic meaning.

## Compatibility strategy

`src/lib/overallProfileSignals.ts` remains the public import seam for profile consumers but now routes to the normalized Signal engine.

This keeps the UI wiring stable while making the migration reversible. Legacy raw scoring remains available separately and is not treated as canonical profile truth.

## Validation invariants

The migration test suite pins these cases:

1. broad catalog evidence never invents Receiving/Giving certainty,
2. directional catalog evidence can roll upward to Overall without filling the opposite side,
3. Responsibility follows the direction of responsibility itself,
4. legacy `challenge_escape` splits into Escape / Containment by question meaning,
5. Movement Restriction remains Overall-only,
6. pairwise comparisons do not create false Overall evidence when only activity side differs,
7. missing directional evidence is unknown, not zero.

## Validation note

This is intentionally a semantic migration, not a scoring-retuning slice. Evidence-source reliability values remain unchanged so profile movement can be attributed primarily to corrected semantics rather than simultaneous weight tuning.
