# M16.4 — Profile Semantics Refinement

**Status:** scoped  
**Parent milestone:** M16 — Data & Content Curation  
**Related:** M16.7 cross-system taxonomy alignment

---

## Goal

Refine the semantic layers that turn canonical Signals into an understandable profile.

The app should preserve a clear hierarchy:

```text
                      Canonical Signals
                       /      |       \
                      /       |        \
             Overall Facets  Modes   Headspaces
                  |            |         |
             broad themes   felt state   role lens
```

Overall Facets are broad thematic compression. Dynamic Modes and Headspaces remain more granular Signal compositions.

No downstream layer should feed back into stored user evidence.

---

## Invariants

### Overall Facets are themes

There are nine broad Overall Facets.

They are not split into:

- giving / receiving
- Dominant / submissive
- specific roles/headspaces

Those distinctions stay in Signals and composed definitions.

### Sibling projections stay independent

Overall Facets, Dynamic Modes, and Headspaces are sibling projections of canonical Signals.

Do **not** calculate a Dynamic Mode or Headspace from an Overall Facet score.

Allowed:

```text
Signals → Dynamic Mode
Signals → Overall Facets
Dynamic Mode definition → derive descriptive associated themes
```

Not allowed:

```text
Signals → Overall Facet → Dynamic Mode
```

### Direct rankings remain direct evidence

Top Overall kink interests remain based on explicit preference and pairwise ranking evidence.

Signal/facet curation must not reorder Top Overall by itself.

---

# M16.4a — Radar meaning + profile shape

## Problem

The Overall radar currently plots raw facet affinity.

For a broad profile, many axes can legitimately have high affinity. Plotting only raw affinity can produce an almost-full polygon that communicates very little relative shape.

The profile header already ranks strongest themes using evidence-adjusted strength rather than affinity alone.

## Refinement

Evaluate an evidence-adjusted radar value for visualization.

Initial candidate:

```text
prominence = affinity × sqrt(coverage / 100)
```

The exact formula is experimental until representative-profile review confirms it behaves well.

The radar should answer:

> How prominent is this broad theme in the currently known shape of the profile?

It should not merely answer:

> Is there positive evidence associated with this theme?

## Requirements

- preserve raw affinity as an inspectable value
- preserve coverage as an inspectable value
- never treat unknown/unexplored as zero
- avoid artificial per-profile min/max stretching
- avoid forcing a dramatic shape when the profile is genuinely broad
- compare old raw-affinity radar vs candidate prominence radar on representative profiles
- keep headline strongest-theme ordering and radar semantics intentionally aligned or explicitly document why they differ

## Acceptance checks

- broad profiles can still show broad interest without becoming a featureless near-circle
- sparse profiles remain visibly sparse
- low-coverage high-affinity axes do not visually dominate well-supported themes
- changing semantic mappings can visibly affect theme shape without changing unrelated downstream layers

---

# M16.4b — Dynamic Mode semantic audit

## Problem

Current Dynamic Modes are heavily relational/power-exchange oriented and use positive Signal ingredients only.

Broadly high Signal profiles can therefore make many modes cluster together at similarly high scores.

The current vocabulary may also underrepresent physical/experiential ways an interaction tends to feel.

## Relationship model

Evaluate the same explicit relationship semantics used by the Signal → Overall Facet matrix:

- **Supports**
- **Opposes**
- **Neutral / omitted**
- non-neutral relationship strength 0–1

Opposing evidence may reduce a known mode score.

Absence or low affinity of an opposing Signal must **not** manufacture positive evidence.

Example to evaluate:

```text
Surrender
  supports responsibility_transfer
  supports receiving_control
  supports role_embodiment
  supports care_receiving
  opposes  autonomy
```

The exact mappings/weights remain curation decisions.

## Candidate mode gaps to review

Do not automatically add these. Determine whether each earns a distinct profile meaning:

- **Constraint / Restraint** — restraint, positioning, movement restriction, physical constraint/control
- **Intensity / Pain** — pain, physical intensity, endurance, challenge, emotional intensity
- **Discipline** — correction, accountability, structure, follow-through
- **Pursuit / Chase** — pursuit/chase experience independently of broader Primal/Feral embodiment
- **Experimental / Exploratory** — only if a canonical novelty/exploration Signal is first justified

Prefer a smaller set of discriminating modes over an exhaustive list.

## Mode → theme explanation

A Dynamic Mode may expose descriptive associated Overall Facets by projecting the mode's Signal composition through the Signal → Facet matrix.

Example:

```text
Surrender
  score: 88%
  associated themes:
    Power Exchange
    Service & Devotion
    Ownership & Belonging
```

These associated themes are explanatory metadata only and do not calculate the mode score.

---

# M16.4c — Signal vocabulary + channel-model review

**Step 1 contract:** [M16 Signal + Channel Model](m16-signal-channel-model.md)

Before adding new vocabulary, normalize the semantic boundary between a Signal concept and its activity-side channel:

- Signal = semantic concept
- channels = Overall / Receiving / Giving
- Overall evidence must not fan out into directional evidence
- directional evidence may inform Overall
- not every Signal requires directional channels
- downstream semantic definitions should reference Signal + optional channel

After the channel contract is accepted, audit the current 45 runtime Signal IDs into base concepts and migration actions.

## Vocabulary gap review

Use representative profiles, catalog coverage, external comparison tools, and curation gaps only as **evidence that a concept may be missing**.

Candidate gaps to evaluate:

- **display / being observed / exhibition**
- **watching / observing / voyeuristic attention**
- **receiving humiliation/degradation**
- **giving humiliation/degradation**
- **novelty / experimentation / exploration**

Do not add a Signal merely to mirror terminology from an external quiz.

For each candidate ask:

- is this meaning already represented by an existing Signal?
- would users plausibly score it differently from neighboring Signals?
- do quizzes/catalog mappings provide enough evidence to estimate it?
- would adding it improve a Headspace, Dynamic Mode, Overall Facet, inference, or explanation?
- does it require giving/receiving separation?
- does it require quiz/version or persisted-evidence migration?

---

# M16.4d — Headspace + Dynamic Mode differentiation

Audit current composed definitions for:

- overly broad positive-only recipes
- missing opposing relationships
- redundant modes/headspaces
- modes that differ only because of naming
- missing physical/experiential modes
- weights that cause many results to cluster in a narrow high range
- definitions that use a Signal because it commonly co-occurs rather than because it semantically defines the construct

A useful test:

> If this Signal were the only thing known to be high, would it make the composed role/mode more likely?

If not, the relationship may be Neutral rather than weakly positive.

---

# M16.7a — Signal → Overall Facet calibration

The full Signal × nine-theme matrix remains the canonical review surface.

## Review rule

For every Signal/theme pair ask:

> If this Signal alone were known to be high, would that make me believe this broad theme is meaningfully higher, lower, or neither?

Classify:

- **Supports** — yes, higher
- **Opposes** — yes, lower
- **Neutral** — neither

Do not use a weak non-zero mapping merely because the concepts often occur in the same scene.

## Weak-link audit

Pay special attention to 0.1–0.2 relationships.

A small weight is still a semantic claim and still changes:

- facet affinity
- facet coverage denominator
- strongest-theme ranking
- downstream descriptive facet projection

Weak links should earn their cost.

## Opposes audit

“Different vibe” is not enough to justify Opposes.

Opposes means:

> stronger affinity for this Signal is genuine evidence against this theme.

Coexistence between concepts is evidence against using opposition unless the constructs truly pull in opposite semantic directions.

## Representative-profile calibration

Use before/after profile previews to inspect:

- strongest-theme ordering
- radar shape
- affinity
- coverage
- explanation quality

Do not optimize mappings to reproduce one person's expected labels.

Representative profiles should include:

- strongly submissive / receiving-heavy
- strongly dominant / giving-heavy
- bidirectional / switch-like
- broad/high-affinity
- sparse/incomplete
- strong physical-intensity with low relational power exchange
- strong relational power exchange with low pain/intensity
- playful/resistant without deep surrender
- high service/devotion without ownership
- high ownership/belonging without service

---

# Implementation slices

## Slice 1 — Mapping calibration

- review current experimental Signal → Facet export
- identify likely missing mappings
- identify weak links that should be Neutral
- identify questionable Opposes mappings
- compare representative profile changes
- land only deliberate mapping changes

## Slice 2 — Radar prominence experiment

- add explicit radar display value separate from raw affinity
- test candidate evidence-adjusted formula
- expose affinity/coverage/prominence in details
- compare representative profile shapes
- choose and document final radar semantics

## Slice 3 — Dynamic Mode relationship model

- support Signals as Supports/Opposes in composed definitions
- preserve positive-only definitions as backwards-compatible Supports
- add scoring tests for opposition semantics
- expose relation editing in Curation Workbench
- audit current modes

## Slice 4 — Mode vocabulary review

- evaluate candidate physical/experiential modes
- merge/remove/rebalance before adding
- derive descriptive Overall Theme associations for each mode

## Slice 5 — Signal vocabulary + channel review

- define and lock the Signal + channel semantic contract
- audit the current 45 runtime Signal IDs into base concepts/channels
- collapse true giving/receiving duplicate IDs
- identify currently general Signals that deserve directional channels
- evaluate missing semantic concepts
- add only justified Signals
- update quiz/catalog mappings and migrations as required

## Slice 6 — Headspace/mode/radar sanity pass

- inspect representative profiles
- verify theme/mode/headspace layers remain meaningfully different
- verify direct Top Overall rankings remain isolated
- document intentional score shifts

---

# Non-goals

This refinement does not:

- derive Dynamic Modes from Overall Facets
- derive Headspaces from Overall Facets
- feed facet scores back into canonical Signal evidence
- make Top Overall an inferred list
- maximize the number of modes or Signals
- force every person into a highly differentiated radar shape

---

# Exit condition

This refinement is complete when:

1. the Overall radar communicates relative profile shape without hiding genuine breadth
2. Dynamic Modes are discriminating enough to be useful and can represent genuine opposing evidence
3. Headspaces, Dynamic Modes, and Overall Facets remain distinct sibling projections
4. major missing Signal concepts have been deliberately added or explicitly rejected
5. Signal → Facet mappings pass a weak-link and opposition audit
6. representative profiles produce coherent, explainable results
7. no facet/mode curation mutates direct preference or ranking evidence
