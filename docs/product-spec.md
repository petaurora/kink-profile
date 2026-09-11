# Kink Profile Product Spec

This document describes the **current product boundary**. It is intentionally not a roadmap, milestone ledger, or future-design workspace.

For implementation plans and active work, use GitHub Issues/Project. For unresolved product strategy, research, future concepts, business, privacy, and monetization decisions, use Kink Profile HQ in Notion.

## Product idea

Kink Profile is a privacy-first adult preference exploration app that helps a user progressively describe, rank, interpret, and use their preferences without requiring one giant assessment.

The product combines several independent kinds of input:

```text
QUIZZES
broad reusable preference evidence
        │
        ├──────────────┐
        │              │
EXPLICIT CATALOG       │
PREFERENCES            │
direct item-level      │
answers                 │
        │              │
        ├──────────────┤
        │              ▼
THIS-OR-THAT      OVERALL PROFILE
relative item          derived interpretation
ranking                of current evidence

REWARDS & PUNISHMENTS
separate contextual suitability/ranking

SCENE BUILDER
uses existing profile state for current-session composition
```

These sources are related through stable identities and semantic mappings, but they are **not interchangeable evidence**.

## Product principles

### Modular, not monolithic

The user can complete one quiz, classify a few catalog items, rank one category, or use one downstream feature without completing the whole product.

Partial evidence is valid. Missing evidence remains unknown rather than becoming a negative preference.

### Measure reusable meaning before inventory

Quizzes primarily measure underlying experiences and mechanisms such as control, care, restraint, service, intensity, ritual, pursuit, or autonomy.

Specific activity preference belongs to the Kink Catalog.

### Preserve source meaning

The product must keep these different questions distinct:

- **Quiz:** what broad experiences or patterns appeal to me?
- **Explicit catalog preference:** how do I directly feel about this item?
- **This-or-That:** which eligible item rises higher relative to another?
- **Reward/Punishment suitability:** does this item work in this specific context?
- **Scene session choice:** is this item usable for this moment?

One interaction must not silently manufacture another kind of answer.

### Separate activity side from authority

Receiving/Giving describes the perspective of an activity or Signal when that distinction is meaningful.

Dominant/submissive describes authority context.

They can correlate, but they are not synonyms. The product must not infer authority merely from which physical/activity side a user prefers.

See [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md).

### Results are descriptive, not diagnostic

Profile outputs describe current evidence. They are not diagnoses, immutable identities, or proof that a person must adopt a particular label.

### Explicit boundaries outrank inference

Hard Limits and other explicit exclusions are direct user-owned state.

Derived affinity, ranking, or thematic strength must not override them.

### Privacy-first and browser-local

The current product stores authoritative profile state in the browser. No account or cloud persistence is required for the current product.

Private backup/restore and curated human-facing sharing are separate artifacts with different privacy boundaries.

## Current product surfaces

### Quizzes

The current app has four independently completable core quizzes:

- Bondage & Discipline;
- Dominance & Submission;
- Sadism & Masochism;
- Roles & Headspaces.

They use weighted questions to produce section-local Signal evidence with affinity and coverage.

The current Roles & Headspaces quiz also supports derived role/headspace and Dynamic Mode interpretation through the shared profile taxonomy.

The retired Starter Profile exists only as a compatibility storage ID; it is not a current available quiz.

See [Quizzes](product/quizzes.md).

### Kink Catalog

The Kink Catalog is the detailed activity library and direct preference-management surface.

It provides:

- stable Catalog and Category identities;
- searchable labels and aliases;
- category/domain metadata;
- explicit item preferences;
- direct limits/exclusions;
- read-only current ranking context;
- derived profile-informed catalog affinity;
- recommendation suppression when explicit exclusions exist.

Current explicit states are:

- Love;
- Like;
- Curious;
- Unsure;
- Not Interested;
- Hard Limit;
- Not Applicable.

Unanswered is absence of explicit state, not a stored `unknown` value.

See [Kink Catalog](product/kink-catalog.md).

### This-or-That ranking

This-or-That is a comparative mini-game for relative item preference.

Users rank within categories first; evidenced category finalists then feed the Overall comparison pool.

Raw pairwise comparisons remain authoritative ranking evidence. Starting a new ranking run archives the current run and begins a fresh comparative pulse without deleting previous history.

Historical movement is presentation context only and does not become new profile evidence.

See [Kink This-or-That Ranking](kink-this-or-that-ranking.md).

### Overall Profile

The Overall Profile is a derived presentation of the evidence currently available across independent sources.

It can include:

- broad Overall Facets;
- authority/orientation interpretation where supported;
- roles/headspaces;
- Dynamic Modes;
- Top Overall interests;
- Hard Limits;
- Interest Areas;
- evidence/coverage explanation;
- Rewards & Punishments summaries where direct contextual data exists.

The Overall Profile is not another authoritative source. It must be recomputable from underlying source data.

See [Overall Profile Aggregation](overall-profile-aggregation.md), [Scoring & Taxonomy Model](scoring-model.md), and [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md).

### Roles, Headspaces & Dynamic Modes

Current peer roles/headspaces are:

- Pet;
- Slave;
- Little;
- Middle;
- Brat;
- Prey;
- Object;
- Owner / Handler;
- Caregiver;
- Brat Tamer;
- Predator;
- Master / Mistress.

Current Dynamic Modes are:

- Devotion;
- Protocol;
- Service;
- Structure;
- Care;
- Playful Challenge;
- Objectification;
- Primal / Feral;
- Power Exchange;
- Intensity.

Roles/headspaces and Dynamic Modes are derived compositions of canonical Signal evidence. They can overlap and do not need to sum to 100%.

See [Roles, Headspaces & Dynamic Modes](data-model/roles-headspaces-modes.md).

### Rewards & Punishments

Rewards & Punishments is a separate contextual layer over a normalized primitive library.

For each primitive, Reward and Punishment suitability are independent. The current detailed state model supports:

- Strong;
- Works;
- Depends;
- No;
- Never;
- Unset.

Random eligibility is a separate explicit opt-in and is more restrictive than general contextual suitability.

The product also supports:

- a coarse quick sorter;
- separate Reward and Punishment rankings;
- source-aware inferred proposals for unrated items;
- a randomizer over explicitly eligible entries;
- saved multi-part Reward/Punishment recipes.

General kink dislike is not positive punishment evidence, and general kink preference does not automatically make an activity a valid Reward or Punishment.

See [Rewards & Punishments](product/rewards-punishments.md).

### Scene Builder

Scene Builder converts existing profile state into a smaller, current-session play space.

It supports:

- one or more Scene themes;
- effort and exploration modes;
- intensity filtering;
- temporary `Yes tonight` / `Maybe tonight` / `Not tonight` choices;
- profile-backed candidate lanes and bridge candidates;
- random single-item selection;
- generated multi-phase scene compositions;
- component-level editing/shuffling;
- optional Rewards & Punishments integration;
- saved local Scene templates.

Scene themes and session choices do not become new profile evidence.

Inference-only items remain distinct from automatic eligibility, and explicit exclusions remain authoritative.

See [Scene Builder](product/scene-builder.md).

### Profile Comparison

The current comparison feature accepts another profile export as temporary input and derives comparison/shared views without importing or mutating either profile.

Current comparison behavior can surface:

- overlap;
- differences;
- explicit limits/boundaries;
- directional complementarity where actual directional evidence exists;
- participant-specific temporary intent;
- shared Scene Builder candidates.

Uploaded comparison data is temporary comparison input, not a second persisted local profile.

Persistent profile ownership/linking is outside the current product contract.

See [Profile Comparison](product/profile-comparison.md).

### Profile Management

Settings/profile management owns the local profile lifecycle:

- display name;
- source-aware selective reset;
- private full-profile backup;
- validated full-profile restore;
- curated share-summary preview/export.

Current private backup format is `kink-profile` v3. Restore supports v1, v2, and v3.

Share summary and private backup are deliberately different products:

```text
PRIVATE BACKUP
complete + machine-readable + restore-capable

SHARE SUMMARY
curated + human-readable + presentation-only
```

Share summary exports can be generated locally as PNG, standalone HTML, or PDF.

See [Profile Management](product/profile-management.md).

### Curation Workbench

The Curation Workbench is a repository/data-maintenance tool for reviewing and editing canonical semantic content.

It supports proposal/workspace editing, validation, deterministic export, and canonical Signal/channel authoring while preserving distinctions between:

- Signal channel;
- Overall Facet support/oppose/neutral relationships;
- catalog applicability;
- authority semantics.

The Workbench is not a user preference source.

See [Curation Workbench](product/curation-workbench.md).

## Canonical semantic model

The overall semantic unit is:

```text
Signal = reusable concept
Channel = optional supported perspective on that concept
```

Channels are:

- Overall;
- Receiving;
- Giving.

Not every Signal supports directional channels.

Legacy quiz/catalog source definitions may still contain older directional Signal IDs for compatibility. They normalize into canonical Signal + channel before current profile aggregation.

See [Signal + Channel Data Model](data-model/signal-channel-model.md) and [Semantic Data Model](semantic-data-model.md).

## Evidence architecture

The current canonical Signal profile combines independent evidence classes such as:

- quiz evidence;
- explicit catalog preference evidence;
- current active-run catalog pairwise evidence.

Derived catalog affinity is not an independent Signal source and must not feed back into the Signals that produced it.

Likewise, derived roles, modes, facets, recommendations, profile summaries, and Scene queries do not become new source evidence merely because they are displayed or consumed downstream.

The direction of information should remain acyclic:

```text
independent source evidence
        ↓
canonical Signal + channel
        ↓
derived profile layers
        ↓
discovery / presentation / scene use

not back into source evidence
```

## Persistence model

Current authoritative durable state is browser-local and separated by domain.

Durable profile data includes:

- quiz progress/answers;
- profile settings;
- explicit catalog preferences;
- pairwise comparisons and ranking-run history;
- Rewards & Punishments authoritative state;
- saved Scene templates.

Session-only Scene Builder overrides/randomizer history are intentionally not durable profile state.

Derived scores/presentations are recomputable and should not become a second persistence authority.

## Current non-goals / boundaries

The current product does **not** provide:

- required user accounts;
- cloud profile persistence or cross-device sync;
- persistent linked-profile ownership/permissions;
- assignment/completion tracking for Rewards or Punishments;
- a reward economy, punishment debt, or task ledger;
- consent inference from preference scores;
- automatic authority inference from activity side;
- automatic explicit catalog preference from quiz inference;
- automatic randomization of inference-only Scene candidates;
- diagnostic or immutable identity claims.

These boundaries describe the current system, not a declaration that such concepts can never be explored later.

## Documentation ownership

Use the repository contracts for current implementation semantics:

- [Documentation index](README.md)
- [Quizzes](product/quizzes.md)
- [Kink Catalog](product/kink-catalog.md)
- [Kink This-or-That Ranking](kink-this-or-that-ranking.md)
- [Profile Management](product/profile-management.md)
- [Rewards & Punishments](product/rewards-punishments.md)
- [Scene Builder](product/scene-builder.md)
- [Profile Comparison](product/profile-comparison.md)
- [Curation Workbench](product/curation-workbench.md)
- [Signal + Channel Data Model](data-model/signal-channel-model.md)
- [Roles, Headspaces & Dynamic Modes](data-model/roles-headspaces-modes.md)
- [Scoring & Taxonomy Model](scoring-model.md)
- [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md)

Do not add roadmap/status chronology to this document. Active work belongs in GitHub; unresolved product thinking belongs in Notion.

The repository code and focused tests remain authoritative when implementation and documentation disagree.
