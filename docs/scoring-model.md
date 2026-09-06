# Scoring & Taxonomy Model

## Status

Scoring architecture used by **M2 and later real section quizzes**.

The Starter Profile still uses the simpler M0 one-question-to-one-dimension scoring model.

M1 already provides quiz definitions, per-quiz progress, versioned browser-local persistence, and section-aware result routing. This document defines the scoring layer that sits on top of that architecture.

---

## Goal

Support:

- short section quizzes
- reusable underlying preference signals
- questions that contribute to multiple signals
- broad dimensions
- overlapping roles/headspaces and dynamic modes
- score coverage/knownness
- later catalog affinity
- future adaptive questions

A single answer should not be treated as proof of a label.

Signals should also be modeled independently unless there is a real measurement reason to make them mutually exclusive. In particular, M2 does **not** model Dominance and submission as one zero-sum slider. High Receiving Control and high Giving Control can coexist; high Receiving Control and high Autonomy can coexist.

See [m2-ds-design.md](m2-ds-design.md) for the first concrete implementation of this principle.

---

# Concept hierarchy

The quiz scoring hierarchy remains:

```text
Answer
  ↓
Signal
  ↓
Dimension / Dynamic Mode / Role-Headspace
```

The broader evolving-profile graph is source-aware:

```text
quiz answers ───────────────► signal evidence ─────┐
                                                   │
explicit catalog preference ─► mapped evidence ────┼──► canonical signals
                                                   │
pairwise catalog choices ─────► mapped evidence ───┘
                                                            │
                                                            ├──► profile/radars
                                                            └──► inferred catalog affinity
```

Inferred catalog affinity is derived from signals and is not allowed to feed back into them.

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md).

## Answer

The user's response to one prompt.

## Signal

A reusable underlying preference, for example:

- receiving_control
- giving_control
- responsibility_transfer
- symbolic_ownership
- service
- praise
- structure
- ritual
- restraint
- pain_receiving
- pain_giving
- intensity
- visibility
- sensory_deprivation

Signals are the primary scoring vocabulary.

## Dimension

A broader result composed of signals.

Conceptual example:

```text
Submission
  receiving_control
  responsibility_transfer
  obedience
  service
  structure
```

## Dynamic mode

A psychologically meaningful composition that explains how a dynamic feels or functions.

Examples:

- Surrender
- Protocol
- Devotion
- Claiming
- Training / Shaping

Dynamic modes are not necessarily recognizable role identities.

## Role / headspace

A recognizable relational role or headspace composed from underlying signals.

Conceptual examples:

```text
Pet
  belonging
  role_embodiment
  playfulness
  care_receiving
  ownership_symbolism

Slave
  responsibility_transfer
  obedience
  service
  ownership_symbolism
  structure

Little
  younger_headspace
  care_receiving
  role_embodiment
  responsibility_transfer
```

## Catalog affinity

An inferred match between known user signals and a catalog item's signal profile.

Catalog affinity is a recommendation/exploration signal. It is **not** an explicit statement that the user likes the item.

---

# Question schema

Real section quizzes use a weighted-signal question shape.

Conceptual example:

```ts
type QuizQuestion = {
  id: string;
  quizId: string;
  prompt: string;
  weights: Record<SignalId, number>;
  reverse?: boolean;
};
```

Example:

```ts
{
  id: "ds-014",
  quizId: "dominance-submission",
  prompt: "Having a trusted partner make routine choices for me can feel freeing.",
  weights: {
    receivingControl: 1,
    responsibilityTransfer: 0.8,
    structure: 0.3
  }
}
```

A question may affect multiple signals.

Weights belong in data/config, not React components.

---

# Response scale

Recommended normalized values:

| Response | Raw | Normalized |
| --- | ---: | ---: |
| Not for me | 0 | 0.00 |
| Mild interest | 1 | 0.25 |
| Maybe / unsure | 2 | 0.50 |
| Strong interest | 3 | 0.75 |
| Core interest | 4 | 1.00 |

UI labels may vary by quiz, but changes to internal semantics should be versioned.

---

# Signal calculation

For each signal:

```text
weighted response sum
---------------------  = normalized signal score
answered weight sum
```

Only answered questions contribute.

Missing evidence is **unknown**, not zero.

Example:

Question A:
- normalized response = 1.0
- service weight = 1.0

Question B:
- normalized response = 0.5
- service weight = 0.5

```text
(1.0 × 1.0) + (0.5 × 0.5)
-------------------------
       1.0 + 0.5

= 0.8333
= 83%
```

---

# Coverage

Every computed signal/dimension should retain a coverage value.

Conceptually:

```ts
{
  score: 0.83,
  coverage: 0.67
}
```

Coverage answers a separate question from score:

- **score:** what direction does known evidence point?
- **coverage:** how much intended evidence do we actually have?

An 83% score based on one prompt should not be treated the same as an 83% score supported across a full section.

The UI does not need to expose raw coverage immediately, but the scoring layer should preserve it.

---

# Dimension scoring

Dimensions aggregate component signals using explicit data/config weights.

Conceptual example:

```ts
submission = weightedAverage({
  receivingControl: 1,
  responsibilityTransfer: 0.8,
  obedience: 0.8,
  service: 0.4,
  structure: 0.3
})
```

Do not hardcode composition logic in rendering components.

---

# Composition scoring

Dynamic modes and roles/headspaces are both coverage-aware weighted compositions of signal scores.

They are independent and overlapping. Do not normalize them against one another.

M3 v3 deliberately separates:

```text
signals
  ├─ dynamic modes (Surrender, Protocol, Claiming...)
  └─ roles/headspaces (Pet, Slave, Little, Middle, Brat...)
```

The role/headspace layer is the primary user-facing M3 result.

Dynamic modes are explanatory context.

For composed results, each signal's configured weight is scaled by available signal coverage. Missing evidence therefore lowers composition coverage rather than behaving like zero affinity.

Implemented M3 compositions are defined in [m3-headspaces-direction.md](m3-headspaces-direction.md).

---

# Explicit vs inferred preference

Keep explicit user preference and inferred affinity separate.

```text
Explicit
"I marked collars as Love."

Inferred
"Your profile suggests collars may interest you."
```

Never silently overwrite an explicit preference with a model-derived guess.

Hard limits must suppress inferred recommendations for that item.

---

# Catalog affinity

Catalog integration is now **in progress in M6**.

The repo has a runtime catalog and pairwise ranking. M6 C1 added durable identity, C2 added validated catalog-to-signal mappings + normalized metadata, C3 added explicit catalog preference state plus the direct-management table, C4 implemented source-aware evidence convergence + centralized quiz-signal → catalog inference, and C5 hardened ranking confidence/finalist/history semantics. C6 now integrates those catalog evidence channels into results, followed by C7 affinity hardening.

See [m6-catalog-integration.md](m6-catalog-integration.md).

A catalog item should expose weighted mappings to stable `SignalId` values.

Conceptual example:

```ts
{
  id: "collar",
  signalMappings: [
    { signalId: "ownership_symbolism", weight: 1.0 },
    { signalId: "ritual_significance", weight: 0.75 },
    { signalId: "receiving_restraint", weight: 0.25 },
    { signalId: "giving_restraint", weight: 0.25 }
  ]
}
```

## Affinity calculation

A first matcher can use coverage-aware weighted similarity across **known** user signals.

Conceptually:

```text
weighted match over mapped signals with evidence
-----------------------------------------------
       mapped weight with available evidence
```

Missing signal evidence is unknown, not zero.

Affinity should retain coverage/evidence strength separately from match percentage.

## Catalog evidence boundaries

The catalog has three different user-facing channels:

- explicit preference — independent direct evidence
- pairwise ranking — independent relative evidence
- inferred affinity — derived evidence from known signals

Do not average these into one opaque "kink score" or persist a resolved display value as though it were a new observation.

Constraints:

1. explicit preference is authoritative for direct user meaning
2. hard limits exclude inferred recommendations
3. not interested / not applicable are excluded from recommendations by default
4. pairwise rankings do not silently mutate explicit preference
5. quiz-derived inferred affinity never writes an explicit preference
6. low-evidence affinity produces tentative exploration language
7. risk metadata does not reduce preference/affinity scores
8. independent explicit/pairwise catalog evidence may later project back to mapped SignalIds
9. inferred catalog affinity must never project back to signals because that would create a feedback loop
10. M6 C4 defines the source-aware evidence/projection contract; M7 supplies the final canonical cross-source signal profile and radar/facet aggregation


---

# Source-aware recomputation

Profile calculations must be recomputable by source.

A quiz retake replaces/supersedes that quiz's contribution and recalculates dependent catalog inference, while preserving explicit catalog and pairwise evidence.

A manual catalog change updates only that Catalog ID/direction's explicit evidence and any downstream mapped signal/profile views.

Additional pairwise comparisons update ranking evidence without rewriting explicit preference.

Derived values — inferred catalog affinity, resolved catalog views, roles/headspaces, and overall facets — must never be treated as new independent evidence.

---

# Versioning

M1 already versions stored profile/quiz data.

Scoring changes must also be version-aware.

A completed quiz may become stale when:

- question wording materially changes
- question weights change
- signal composition changes
- response semantics change

Do not silently present old scores as if they were calculated under a new model.

Possible states:

- not started
- in progress
- complete
- stale / recalculation required

---

# Adaptive questioning

Adaptive follow-ups are a later optimization, currently M8.

A follow-up may trigger when:

- a signal passes an interest threshold
- an answer is ambiguous
- coverage for an important signal is too low

Branching should improve relevance and evidence coverage.

It should not make users with equivalent evidence fundamentally incomparable.

---

# M2 implementation ✅

M2 implements the reviewed design in [m2-ds-design.md](m2-ds-design.md):

1. encode the nine D/s signal definitions in config
2. support weighted-signal questions
3. encode the 18-question M2 bank and weight matrix
4. calculate signal scores + coverage
5. render ranked D/s results and a D/s radar chart
6. add descriptive signal interpretation
7. leave forced role labels, headspace scoring, and catalog matching out

M3 extends this model with a second composition layer.

## M3 implementation ✅

M3 v3 adds:

1. a shared `SignalId` / `SignalDefinition` / weighted-question vocabulary used by M2 and M3
2. generic weighted signal scoring
3. coverage-aware generic composition scoring
4. a 32-question M3-local evidence bank
5. explicit younger-headspace evidence for Little/Middle
6. explicit primal embodiment + directional pursuit evidence for Prey/Predator
7. 15 primary role/headspace affinities
8. 12 secondary dynamic-mode affinities
9. separate receiving/submissive and giving/dominant role/headspace radars
10. a dedicated underlying dynamic-modes radar
11. ranked role/headspace results plus explanatory dynamic-mode results
12. no cross-quiz evidence merge; that remains M7 work

See [m3-headspaces-direction.md](m3-headspaces-direction.md) for the implemented taxonomy, compositions, and question bank.


---

## M4 implementation ✅

M4 continues using shared weighted-signal scoring without adding another archetype layer.

M4 implements the contract in [m4-bd-design.md](m4-bd-design.md) with directional physical/discipline signals and two section visualizations:

- **Bondage / Physical Control**
- **Discipline / Structural Control**

Important scoring boundaries:

1. Receiving/Giving Restraint, Positioning, Constraint Control, and Discipline are directional rather than inferred from one another.
2. Movement Restriction, Accountability, Anticipation, and Challenge / Escape can span direction where the underlying experience genuinely does.
3. Existing shared signal IDs are reused only when semantics match; M4 evidence remains section-local.
4. Pain Receiving/Pain Giving are not part of M4. They belong to M5.
5. Specific gear/items remain catalog data for M6 rather than direct M4 scores.


M4 adds 12 new shared signal IDs for restraint, positioning, constraint control, discipline, accountability, anticipation, and challenge/escape. Its primary ranked result set also includes shared Structure and Ritual Significance, while secondary shared evidence remains section-local for future M7 aggregation.


---

## M5 implementation ✅

M5 implements the shared weighted-signal architecture with the directional S/M model defined in [m5-sm-design.md](m5-sm-design.md).

The implemented primary result vocabulary is:

- Pain Receiving / Pain Giving
- Receiving Intensity / Giving Intensity
- Receiving Endurance / Giving Endurance
- Receiving Challenge / Giving Challenge
- Anticipation
- Emotional Intensity

Important scoring boundaries:

1. pain and general physical intensity remain separate signals
2. endurance measures sustained intensity, not merely high intensity
3. challenge measures appeal of approaching/testing an agreed edge
4. receiving/giving direction is preserved for pain, intensity, endurance, and challenge
5. Anticipation reuses the shared SignalId already used in M4, but M5 evidence remains section-local
6. Emotional Intensity is shared across direction rather than inferred from physical intensity
7. M5 does not produce forced Sadist/Masochist identity labels
8. discipline, restraint, and specific techniques/items remain outside M5 scoring


M5 adds 9 new shared signal IDs for directional pain, physical intensity, endurance, challenge, and emotional intensity, while reusing the existing shared Anticipation signal. M5 results remain section-local and do not merge M4 Anticipation evidence until M7.
