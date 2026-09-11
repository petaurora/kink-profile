# M16 Signal + Channel Runtime Migration — Step 3

**Status:** complete / landed  
**Depends on:** [M16 Signal Channel Audit](m16-signal-channel-audit.md)  
**Canonical contract:** [M16 Signal + Channel Model](m16-signal-channel-model.md)

## Purpose

This migration implemented the Step 2 semantic audit in the profile-facing runtime without requiring a destructive global rename of legacy source vocabulary.

The compatibility boundary deliberately keeps the legacy 45-ID quiz/catalog vocabulary available where older source data still uses it while rebuilding canonical profile evidence into:

```text
Signal
  ├─ Overall
  ├─ Receiving   [when applicable]
  └─ Giving      [when applicable]
```

## Runtime boundary

Legacy IDs remain valid where compatibility still requires them, including:

- existing quiz question weights
- generated/catalog source Signal mappings
- older stored quiz/import data
- migration/debug comparison

Profile-facing aggregation normalizes those sources at the evidence boundary. New Workbench authoring uses canonical Signal + channel references rather than creating additional legacy directional IDs.

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

The normalized model contains 37 canonical Signal concepts: the 33 concepts produced by the legacy audit plus four additions approved during the migration:

- Exhibitionism
- Voyeurism
- Arousal Control
- Degradation / Humiliation

Source coverage for individual Signals continues to be curated during M16; canonical identity no longer depends on whether every source currently maps to a concept.

## Downstream migration

The runtime migration updated:

- canonical profile Signal aggregation
- Overall Facet relationships
- role/headspace composition
- contextual/underlying mode composition (the internal legacy Dynamic Mode layer)
- profile orientation derivation
- profile explainability

Overall Facets stay non-directional and are the canonical high-level profile dimensions. A facet may reference a particular Signal channel when that side has distinct semantic meaning.

## Compatibility strategy

`src/lib/overallProfileSignals.ts` remains the public import seam for profile consumers while routing to the normalized Signal engine.

Legacy raw scoring remains available separately where compatibility/debugging requires it and is not treated as canonical profile truth.

## Validation invariants

The migration test suite pins these cases:

1. broad catalog evidence never invents Receiving/Giving certainty
2. directional catalog evidence can roll upward to Overall without filling the opposite side
3. Responsibility follows the direction of responsibility itself
4. legacy `challenge_escape` splits into Escape / Containment by question meaning
5. Movement Restriction remains Overall-only
6. pairwise comparisons do not create false Overall evidence when only activity side differs
7. missing directional evidence is unknown, not zero

## Validation note

This was intentionally a semantic migration, not a scoring-retuning slice. Evidence-source reliability values were kept stable so profile movement could be attributed primarily to corrected semantics rather than simultaneous weight tuning.

Current implementation status belongs to GitHub Issues/PRs; this file remains as migration and compatibility context.
