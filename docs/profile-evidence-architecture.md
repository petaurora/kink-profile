# Source-Aware Profile Evidence Architecture

## Status

**Implemented C4 contract and M7 architecture boundary.**

This document defines how quizzes, explicit catalog preferences, This-or-That ranking, inferred catalog affinity, and the overall profile interact without overwriting one another or creating circular scoring.

M6 C3 persists explicit preference + raw comparison evidence. **C4 now implements the source-aware evidence layer on top of that data without introducing a competing persistence model.**

---

# Product model

There are two complementary ways to build the same evolving profile:

1. **Quizzes** establish broad reusable signals and give the user an immediate profile/radar starting point.
2. **Catalog exploration** makes those broad signals concrete through item-level preference, pairwise comparison, and manual correction.

Neither path is final or one-way.

The intended loop is:

```text
quizzes
  ↓
signal profile
  ↓
inferred catalog starting point
  ↓
catalog table + This-or-That
  ↓
direct catalog evidence
  ↓
canonical signal/profile aggregation
  ↓
updated radars + profile views

        ↖ repeat at any time ↗
```

Users may:

- retake a quiz
- continue This-or-That
- change an explicit catalog preference
- clear a preference
- revisit a category later
- gain more evidence without "finishing" the profile

Every action should update the relevant derived views while preserving unrelated evidence.

---

# Core principle: store evidence, derive the profile

A catalog item must **not** have one mutable "truth" value that every feature writes into.

Instead, the same stable Catalog ID can have multiple independent evidence channels.

Conceptually:

```ts
type CatalogEvidenceSnapshot = {
  catalogId: CatalogId;

  explicit?: ExplicitPreferenceEvidence;
  ranking?: PairwiseRankingEvidence;
  inferred?: InferredCatalogEvidence;

  resolved: ResolvedCatalogView;
};
```

The exact runtime types may differ, but the semantic boundary is required.

The profile is a **derived view of source-aware evidence**, not a single persisted score.

---

# Canonical identities

The evidence graph is anchored by stable IDs already introduced in M6:

- `CatalogId`
- `CategoryId`
- `SignalId`
- `quizId` + quiz/scoring version
- pairwise comparison IDs/timestamps where applicable

Every derived value must retain enough provenance to identify the independent source evidence that produced it.

---

# Evidence classes

## 1. Quiz evidence — direct signal evidence

Quiz answers are direct evidence for `SignalId` values through the existing weighted-question model.

```text
quiz answers
    ↓
section-local signal scores
    ↓
canonical source-aware signal evidence
```

A quiz retake replaces or supersedes **that quiz source's contribution**.

It must not erase:

- explicit catalog preferences
- pairwise comparison history
- evidence from other quizzes

Quiz evidence may be projected forward into catalog affinity.

---

## 2. Explicit catalog preference — direct catalog evidence

An explicit preference is a direct statement by the user about a Catalog ID.

Examples:

- Love
- Like
- Curious
- Unsure
- Not Interested
- Hard Limit
- Not Applicable

Direction remains supported through:

- `overall`
- `receiving`
- `giving`

Explicit preference is independent evidence. It is **not** a cached quiz prediction and must never be silently rewritten by a quiz retake or ranking result.

Explicit catalog evidence may later contribute back toward mapped signals because it is new user-supplied information.

---

## 3. Pairwise ranking — direct relative catalog evidence

This-or-That produces direct relative evidence between Catalog IDs.

It answers a different question from explicit preference:

> "When these items are compared, which does the user prefer?"

Raw comparisons remain the durable source.

Derived category/overall rankings are recomputable evidence views.

Pairwise evidence must not silently manufacture an explicit state such as Love or Like.

Pairwise evidence may later contribute back toward mapped signals because the comparison itself is new user behavior/evidence.

Skip and Neither require special confidence semantics and remain part of ranking hardening.

---

## 4. Inferred catalog affinity — derived evidence

Catalog affinity is predicted from known signal evidence through Catalog ID → SignalId mappings.

```text
independent signal evidence
        ↓
canonical signal profile
        ↓
CatalogId → SignalId mappings
        ↓
inferred catalog affinity
```

This is the mechanism that can give the catalog a useful **starting point after quizzes**.

Important: "pre-populated" must not mean "written into explicit preference."

A row with no direct user preference may show:

- inferred affinity
- suggested band/state
- confidence/coverage
- matched signals
- explanation/provenance

If the user accepts or edits that suggestion, the result becomes new **explicit evidence**.

Until then, it remains inferred.

This distinction is what makes quiz retakes safe.

---

## 5. Resolved catalog view — derived presentation

The UI may need a compact current answer for:

> "What does the profile currently think about this kink?"

That answer can be represented as a derived/resolved view over the available evidence.

It is **not another independent evidence source**.

Conceptually:

```text
explicit preference ─┐
pairwise evidence ───┼──► resolved catalog view
quiz inference ──────┘
```

The resolved view must preserve provenance and should not collapse conflicting evidence into an unexplained opaque number.

Exact weighting/precedence is an implementation decision, but these semantic rules are locked:

1. explicit Hard Limit / Not Applicable / Not Interested remain authoritative for exclusion behavior
2. explicit preference is never overwritten by ranking or inference
3. pairwise ranking remains relative evidence, not an explicit-state converter
4. inferred affinity may fill gaps but remains visibly inferred
5. conflicts remain explainable through source breakdown
6. affinity and evidence confidence/coverage remain separate concepts

---

# Independent evidence vs derived evidence

This distinction prevents circular scoring.

## Independent evidence

May contribute to the canonical profile:

- quiz answers / quiz signal results
- explicit catalog preferences
- pairwise comparison outcomes

## Derived evidence

May be displayed and recomputed, but must not be treated as a new independent observation:

- inferred catalog affinity produced from signal scores
- resolved/merged catalog presentation
- category/overall ranking summaries derived from raw comparisons
- role/headspace compositions derived from signals
- overall facets/radars derived from canonical signals

---

# Hard rule: no feedback loops

The profile must never reinforce itself using evidence it generated from itself.

Allowed:

```text
QUIZ ANSWERS ─────────────► SIGNAL EVIDENCE
                                │
                                ▼
                         INFERRED CATALOG

MANUAL CATALOG ───────────► CATALOG-DERIVED SIGNAL EVIDENCE

PAIRWISE COMPARISONS ─────► CATALOG-DERIVED SIGNAL EVIDENCE
```

Forbidden:

```text
quiz signal
   ↓
inferred Rope affinity
   ↓
Rope mapping
   ↓
same signal gets stronger
   ↓
inferred Rope affinity gets stronger
   ↓
feedback loop
```

Therefore:

> **Catalog affinity inferred from signals may never feed back into those signals.**

Likewise:

- a resolved catalog score may not feed back as though it were raw evidence
- an overall radar/facet may not feed back into component signals
- composed role/headspace results may not feed back into the signals used to compose them

Only independent evidence can add new information.

---

# Source-aware signal aggregation

M7 should no longer be thought of as only "cross-quiz aggregation."

The canonical signal profile may eventually receive independent evidence from:

```text
quiz evidence ───────────────┐
                             │
explicit catalog evidence ───┼──► canonical SignalId evidence
                             │
pairwise catalog evidence ───┘
                                      │
                                      ├──► section/profile radars
                                      ├──► broad overall facets
                                      ├──► roles/headspaces
                                      └──► catalog inference
```

Every contribution should retain:

- source type
- source ID
- source version where relevant
- score/direction
- evidence strength / coverage
- enough provenance for deduplication and explanation

Repeated `SignalId` evidence must be merged source-aware rather than naively averaged.

---

# Update behavior

## Retake a quiz

```text
replace/supersede that quiz source
        ↓
recompute affected signal evidence
        ↓
recompute dependent catalog inference
        ↓
recompute resolved catalog/profile views
```

Preserve:

- explicit preferences
- pairwise history
- other quiz sources

Do not convert the new inference into explicit preference.

---

## Change an explicit catalog preference

```text
update that Catalog ID + direction explicit source
        ↓
recompute exclusion/eligibility
        ↓
recompute catalog-derived signal evidence
        ↓
recompute canonical profile/radars
```

Preserve:

- quiz evidence
- raw pairwise comparisons
- unrelated catalog items

---

## Continue This-or-That

```text
append/update raw pairwise evidence
        ↓
recompute ranking evidence
        ↓
recompute catalog-derived signal evidence
        ↓
recompute canonical profile/radars
```

Preserve:

- explicit states
- quiz evidence

Neither/Skip must not falsely increase ordering confidence.

---

## Catalog mapping changes

If a Catalog ID's SignalId mapping changes in a future catalog/scoring version:

- preserve raw user evidence
- recompute projections from that evidence
- version the mapping/scoring semantics when material
- do not rewrite history as though the new mapping existed when the evidence was recorded unless the product intentionally treats mappings as current interpretation

---

# Affinity vs confidence

Every meaningful derived result should distinguish:

- **affinity / score:** what direction the available evidence points
- **coverage / confidence:** how much independent evidence supports that conclusion

Examples:

```text
Receiving Restraint
Affinity: 84%
Evidence strength: high
Sources: quiz + explicit catalog + pairwise

Rope Bondage
Inferred affinity: 81%
Inference coverage: moderate
Direct preference: unanswered
Ranking evidence: low
```

The UI wording may be simplified, but the model should retain the distinction.

---

# Explainability

Because evidence is source-aware, users should eventually be able to answer:

> Why does the app think this?

For a catalog item:

```text
Rope Bondage

Direct preference
  Like

Ranking
  #2 in Rope & Restraint

Profile inference
  86% match
  matched signals:
    Receiving Restraint
    Movement Restriction
    Anticipation
```

For a radar/facet:

```text
Receiving Restraint — 84%

Evidence:
  Bondage & Discipline quiz
  explicit ratings on mapped catalog items
  pairwise ranking evidence on mapped catalog items
```

Question-level provenance may be available through quiz signal traceability, but the catalog should map to stable signals rather than hardcoded question IDs.

---

# C3 compatibility

C3 is implemented and does not need to be rewritten for C4.

Its durable outputs are useful independent evidence:

- explicit state by Catalog ID/direction
- raw pairwise comparisons
- stable Catalog IDs
- eligibility/exclusion behavior

C4 builds an evidence adapter/aggregation layer **around** those stores rather than turning the landed C3 feature into a different persistence model.

C3's `pet-profile-catalog-v1` remains the catalog user-data store; C4 did not introduce a competing persistence version because no concrete migration need emerged.

The cleanup goal is semantic separation and provenance, not churn for its own sake.

---

# M6 C4 — Source-aware evidence convergence

C4 is implemented as the post-C3 source-aware convergence layer.

## Contract

- [x] define source-aware evidence types/IDs for quiz, explicit catalog, pairwise, and derived inference
- [x] treat C3 explicit state + raw comparisons as independent evidence sources
- [x] add a derived Catalog ID evidence snapshot/selectors without collapsing sources
- [x] implement/centralize coverage-aware quiz-signal → catalog inference using existing C2 mappings
- [x] ensure inferred catalog values are never persisted as explicit preference
- [x] preserve matched SignalIds/provenance for catalog inference
- [x] define the catalog → signal projection contract for **independent** explicit/pairwise evidence
- [x] explicitly exclude inferred catalog affinity from catalog → signal projection
- [x] define source deduplication/replacement semantics for quiz retakes
- [x] define deterministic recomputation after quiz, explicit-preference, and pairwise changes
- [x] retain affinity separately from confidence/coverage
- [x] add tests proving one source can change without destroying unrelated evidence
- [x] add tests proving quiz-derived catalog inference cannot feed back into quiz/canonical signals
- [x] add tests proving explicit exclusions remain authoritative even when inference is high
- [x] keep the final M7 cross-source signal merge/radar UI out of C4 unless needed to prove the contract

## Implemented C4 semantics

Runtime implementation lives in `src/lib/profileEvidence.ts`.

C4 now provides:

- stable quiz-signal evidence IDs keyed by quiz + SignalId, with quiz version retained as provenance
- retake deduplication/replacement semantics for the same quiz source
- a quiz-only inference signal profile that is explicitly **not** the final M7 canonical cross-source profile
- coverage-aware Catalog → SignalId inference with affinity and coverage kept separate
- matched SignalId + contributing quiz evidence provenance
- per-Catalog-ID snapshots that preserve explicit, pairwise, inferred, and resolved presentation channels simultaneously
- semantic explicit catalog → signal projections without inventing final numeric M7 weighting
- direction-aware explicit projections that exclude opposite-direction SignalIds
- relative pairwise projections for left/right/equal
- Skip/Neither withheld from signal projection pending C5 ranking semantics
- direct-projection APIs that accept only independent explicit/pairwise catalog evidence, preventing inference feedback by construction

Verification: 38 tests pass across the catalog/profile evidence suites, including 19 focused C4 tests, and the production TypeScript/Vite build passes.

## C4 exit condition ✅

For any Catalog ID, the app can represent quiz-derived inference, direct explicit preference, and pairwise evidence simultaneously; changing one source preserves the others; all derived views are recomputable; and the architecture makes circular evidence impossible by construction.

---

# M7 boundary

M7 consumes the source-aware evidence contracts and turns them into the full evolving profile.

M7 owns:

- canonical cross-source SignalId aggregation
- deduplication/weighting across independent evidence sources
- updated radars based on canonical evidence
- broad overall facets
- profile-level confidence/coverage
- drill-down/explainability
- recalculation after any contributing source changes

M7 must not:

- turn inferred catalog affinity into signal evidence
- hide direct-vs-inferred provenance
- make users complete either the quizzes or catalog before a profile is useful
- treat the profile as a one-time completed artifact

---

# Product principle

The profile should become **more informed**, not "more finished."

Quizzes provide a fast starting hypothesis.

Catalog inference makes that hypothesis concrete.

This-or-That discovers relative preference.

Manual editing lets the user state or correct direct preference.

All independent evidence can enrich the same profile, while provenance keeps every contribution reversible, explainable, and safe to recompute.
