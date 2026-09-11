# Scoring & Taxonomy Model

This document describes the current scoring architecture used by quizzes, the canonical profile, Overall Facets, roles/headspaces, and catalog inference.

It is a **current-system contract**, not a milestone history.

The implementation remains authoritative for exact constants and formulas.

## Core rules

1. **Store evidence; derive scores.**
2. **Affinity and coverage are separate.**
3. **Unknown evidence is not zero preference.**
4. **Independent evidence sources remain identifiable.**
5. **Derived values do not feed back into evidence.**
6. **Activity-side channels do not imply Dominant/submissive authority.**
7. **Stable IDs, not labels, are scoring identity.**

## Scoring layers

The application has several related but different scoring layers:

```text
quiz answers
    ↓
section-local weighted scores
    ↓
canonical Signal + channel projections
    │
    ├──► canonical cross-source Signal profile
    │       ├──► Overall Facets
    │       ├──► roles / headspaces
    │       ├──► contextual modes
    │       └──► inferred catalog affinity
    │
explicit catalog preference ──► canonical Signal projections
pairwise catalog evidence ────► canonical Signal projections
```

Each layer answers a different question. Do not collapse them into one opaque profile score.

## Answer scale

Weighted quiz scoring currently interprets answers on the shared 0–4 response scale.

For one question/Signal relationship:

```text
normalized answer = answer / 4
weighted contribution = normalized answer × authored weight
```

Question weights express how strongly that question measures a semantic concept. They are not confidence values and are not user preference values by themselves.

## Section-local quiz scoring

Section quiz results are calculated from the weighted questions belonging to that quiz.

For a Signal:

```text
signal affinity
= weighted answered total / answered weight

signal coverage
= answered weight / expected mapped weight
```

Consequences:

- unanswered questions do not contribute zero;
- an early partial quiz can produce a meaningful affinity with low coverage;
- completing more relevant questions increases coverage;
- the same affinity percentage can have very different evidence breadth.

Legacy section result IDs may still exist inside quiz-specific modules for compatibility and local result presentation. They are not the canonical cross-source profile vocabulary.

## Canonical Signal + channel normalization

The evolving Overall Profile normalizes source evidence into canonical semantic references:

```ts
{
  signalId: CanonicalSignalId,
  channel: "overall" | "receiving" | "giving"
}
```

Signal identity represents the concept. Channel represents a supported perspective on that concept.

See [Signal + Channel Data Model](data-model/signal-channel-model.md).

The normalized profile prevents direction from becoming duplicate identity. For example, Receiving Pain and Giving Pain are perspectives on the canonical Pain concept rather than two unrelated high-level concepts.

Not every Signal supports directional channels.

## Canonical Signal evidence sources

The current cross-source profile accepts three independent source classes:

- quiz evidence;
- explicit catalog preference evidence;
- catalog pairwise comparison evidence.

Current source reliability factors are:

| Source | Reliability |
| --- | ---: |
| Quiz | 0.80 |
| Explicit catalog | 0.65 |
| Catalog pairwise | 0.50 |

These constants live in `src/lib/overallProfileSignals.ts`.

They express source weighting in canonical aggregation. They do not mean an explicit catalog preference is less authoritative than a quiz for the direct catalog question it answers. Source authority remains contextual: explicit catalog preference is still the user's direct statement about that catalog item.

## Contribution affinity and coverage

Every canonical contribution retains:

- source type;
- source identity;
- canonical Signal ID;
- Signal channel;
- affinity;
- coverage;
- source evidence IDs/provenance.

Coverage affects how much effective evidence a contribution supplies. It does not change what the known evidence means.

### Quiz contributions

Quiz coverage is based on answered mapped weight versus expected mapped weight.

A quiz retake supersedes that quiz's current contribution rather than becoming another independent copy of the same source.

### Explicit catalog contributions

Explicit catalog states project to semantic affinity only through configured catalog mappings.

The current projection distinguishes positive, uncertain, and negative direct states and weights coverage by semantic strength and mapping weight.

One catalog item remains one independent item source even when more than one compatible mapping/context contributes to the same canonical concept.

### Pairwise contributions

Meaningful This-or-That comparisons project relative evidence through the mapped concepts on each side.

Pairwise evidence remains relative. It does not convert itself into a Love/Like/Curious explicit catalog state.

## Source aggregation

Canonical aggregation happens in two stages.

### 1. Summarize contributions within a source class

Contributions for the same Signal/channel and source class are combined while retaining provenance.

Coverage from independent contributions is combined without assuming simple additive certainty.

### 2. Combine source classes

For each source class:

```text
effective source weight
= source reliability × source coverage
```

Final channel affinity is the weighted mean over source classes that actually have evidence.

No effective evidence produces:

```text
affinity = null
coverage = 0
```

not a fabricated 0% preference.

The exact aggregation code lives in `src/lib/normalizedProfileSignals.ts`.

## Overall roll-up vs directional channels

Directional evidence can support the broader Overall concept.

Broad Overall evidence must not invent directional certainty.

Therefore:

```text
Receiving/Giving evidence ──► Overall roll-up allowed
Overall-only evidence ──────X──► Receiving/Giving inference
```

This is semantic roll-up, not authority inference.

## Overall Facet scoring

Overall Facets are broad non-directional themes composed from canonical Signal + optional channel references.

Current definitions live in `src/data/overallFacets.ts`.

Each configured component contains:

- canonical Signal ID;
- optional channel;
- configured weight;
- Supports or Opposes relationship.

For known components:

```text
effective component weight
= configured weight × Signal coverage
```

Facet **coverage** is the share of configured semantic weight for which evidence exists.

Facet **affinity** is calculated from known supporting components, with configured opposing evidence subtracted where present.

Important behavior:

- unknown components do not contribute zero;
- partial coverage does not cap a strong known affinity;
- a directional Signal component does not make the facet itself directional;
- opposing mappings are explicit semantic relationships, not negative channel values.

## Roles, headspaces, and contextual modes

Roles/headspaces and contextual modes are weighted compositions of canonical Signal + channel results.

For a composed definition:

```text
covered component weight
= configured weight × Signal coverage

affinity
= weighted known affinity / covered weight

coverage
= covered weight / total configured weight
```

The profile currently suppresses composed role/mode results below a minimum evidence threshold and marks lower-coverage displayed results as limited evidence.

The important invariant is independent of those presentation thresholds:

> **Do not multiply the final match percentage by coverage and call that preference.**

A 90% match at 35% coverage means the observed evidence matches strongly but only part of the composition has been explored. It does not mean a 31.5% preference.

Current composition code lives in `src/lib/profileRoleDetails.ts` and normalized definitions in `src/data/canonicalRoleCompositions.ts`.

## Match vs coverage

Use these terms consistently:

- **Affinity / match strength** — how strongly the known evidence aligns.
- **Coverage / evidence breadth** — how much relevant evidence exists.

Examples:

```text
Match 91% · Coverage 36%
Strong pattern, limited breadth.

Match 72% · Coverage 84%
Moderately strong pattern, broadly supported.
```

Do not globally cap or shrink affinity because coverage is incomplete.

Coverage may legitimately affect:

- whether a result is displayed;
- evidence-state labels;
- how strongly it influences another derived layer;
- recommendation/explanation language;
- what exploration the UI suggests next.

It must not masquerade as semantic dislike.

## Explainability

The Overall Profile already derives explanation models for facets from canonical provenance.

Current facet explainability can expose:

- affinity;
- coverage/evidence state;
- strongest contributing Signals;
- source summaries;
- meaningful source conflict;
- a suggested next exploration step where evidence is sparse.

The source-aware architecture makes deeper explanation possible without turning explanation itself into evidence.

Any richer headspace/contextual-mode component UI is product work and should be tracked in GitHub rather than specified as if already implemented.

## Catalog inference

Catalog inference asks:

> Given independent canonical Signal evidence and this catalog item's semantic mappings, how well does the item appear to fit?

It is derived evidence.

Rules:

1. missing mapped Signal evidence is unknown, not zero;
2. inferred affinity keeps coverage/confidence separate;
3. explicit Hard Limit / Not Interested / Not Applicable states control eligibility where applicable;
4. inference does not overwrite explicit catalog preference;
5. pairwise rank does not overwrite explicit catalog preference;
6. inferred catalog affinity **never projects back into canonical Signals**.

That final rule prevents circular self-reinforcement.

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md).

## Direct evidence vs derived values

Independent evidence may add information to the canonical profile:

```text
quiz answers
explicit catalog preference
pairwise comparisons
```

Derived values may be recomputed and displayed but are not new observations:

```text
canonical aggregate Signal results
Overall Facets
roles/headspaces
contextual modes
inferred catalog affinity
resolved catalog presentation
scene candidate fit
```

A derived value must never be persisted/reintroduced as though the user directly supplied it.

## Retakes and recomputation

A quiz retake changes that quiz source and triggers dependent recomputation.

It must preserve:

- direct catalog preferences;
- pairwise history;
- other quiz sources.

Likewise, editing a catalog preference or adding comparisons updates the relevant source evidence without rewriting unrelated sources.

The profile is recomputed from evidence rather than incrementally mutating an opaque final score.

## Taxonomy boundaries

Keep the semantic layers distinct:

### Canonical Signals
Reusable semantic concepts measured/derived from independent evidence.

### Signal channels
Overall/Receiving/Giving perspective on a canonical Signal where supported.

### Overall Facets
Broad, non-directional descriptive themes composed from Signals.

### Roles / Headspaces
Recognizable derived roles/states composed from Signals.

### Contextual modes
Underlying/composed lenses useful for interpretation and downstream context; not competing top-level dimensions.

### Catalog categories
Organization and semantic defaults for concrete activities/items.

### Reward/Punishment categories
Contextual-use groupings; separate from general catalog preference.

### Scene themes
Query/composition metadata, not evidence.

Do not promote one layer into another merely because their labels sound related.

## Versioning

Material semantic changes may require version-aware migration or recalculation.

Examples:

- changing a question's meaning or weight matrix;
- changing canonical Signal identity;
- changing legacy → canonical normalization;
- changing a catalog item's semantic mappings;
- changing a composed role/facet definition;
- changing response semantics.

Preserve raw/direct user evidence whenever possible and reproject/recompute derived values under the current model.

Identity changes that would reinterpret stored data must be handled deliberately through migration/alias rules rather than silent label swaps.

## Current implementation anchors

The main runtime contracts are implemented in:

- `src/lib/scoring.ts` — section-local weighted quiz scoring;
- `src/data/canonicalSignals.ts` — canonical Signal vocabulary/channels;
- `src/lib/normalizedProfileSignals.ts` — normalized cross-source Signal profile;
- `src/lib/overallProfileSignals.ts` — profile-facing compatibility facade + source reliability;
- `src/data/overallFacets.ts` / `src/lib/overallProfileFacets.ts` — Overall Facet composition;
- `src/data/canonicalRoleCompositions.ts` / `src/lib/profileRoleDetails.ts` — normalized role/headspace/contextual-mode composition;
- `src/lib/profileExplainability.ts` — facet evidence/explainability model;
- `src/lib/profileEvidence.ts` — source-aware catalog evidence and projection boundaries.

## Invariants to test

1. Unanswered evidence does not reduce preference as if it were a negative answer.
2. Affinity and coverage remain separate values.
3. Retaking one quiz does not erase other source evidence.
4. Explicit catalog preference is not overwritten by inference or ranking.
5. Inferred catalog affinity cannot feed back into canonical Signals.
6. Overall evidence does not invent directional channel evidence.
7. Receiving/Giving does not infer Dominant/submissive authority.
8. Composed facets/roles/modes do not feed themselves back into Signals.
9. Stable identity survives label/display changes.
10. Material mapping/scoring changes are versioned or migrated deliberately.
