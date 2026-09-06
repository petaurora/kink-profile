# Pet Profile Product Spec

## Status

Living product direction.

**Implemented through:** M6 — Catalog Integration  
**Current:** M7 — Full Overall Profile

The app is now structurally a collection of independently completable quizzes rather than one monolithic assessment.

---

## Product idea

Pet Profile is a privacy-first adult preference exploration app.

A user should be able to choose one focused area, complete it in a few minutes, receive useful results, and leave. Additional sections can be completed later, gradually building a richer overall profile.

The product should feel like a collection of interesting quizzes, not an exam.

---

## Product principles

### Modular, not monolithic

Prefer short focused quizzes over one 100+ question assessment.

Target roughly **15–30 questions per standard section**, with small exceptions when a broader taxonomy needs repeated evidence. Quick/deep modes and adaptive follow-ups are future options, not requirements for the initial sections.

### Measure underlying preferences, not trivia

Avoid questions whose only purpose is to reproduce their own answer.

Bad:

> Do you like collars?

Result:

> You like collars: 100%.

Prefer prompts that measure reusable underlying signals such as symbolic ownership, restraint, ritual, service, authority, praise, intensity, or visibility.

Specific catalog interests can later be matched against those signals.

### Separate activity from psychology

The profile should distinguish:

- **activity interests** — what someone enjoys doing
- **power dynamics** — how authority/control is experienced
- **dynamic modes** — psychological patterns such as surrender, protocol, devotion, or claiming
- **roles/headspaces** — recognizable relational modes or identities such as Pet, Slave, Little, Middle, Brat, Caregiver, or Owner
- **intensity preferences** — pain, physical intensity, endurance, challenge, anticipation, and emotional charge
- **specific interests** — catalog items explicitly selected or inferred from known signals

These layers may overlap but should not be flattened into one list.

### Results are descriptive, not diagnostic

Scores describe current questionnaire responses.

Do not present them as diagnoses, immutable identities, or proof that someone "is" a particular label.

Prefer language such as:

- strong signal
- current affinity
- worth exploring
- low interest
- not yet explored

### Consent and adult context are foundational

The app is intended for adults exploring consensual interests.

Taxonomy and wording should distinguish consensual power exchange and role-play from coercion or abuse.

### Privacy-first by default

The current app stores answers and quiz progress in browser `localStorage`.

Do not require an account merely to take quizzes. Any future cloud persistence must be optional, explicit, and designed around a defined privacy model.

---

# Information architecture

## Quiz Hub

The Quiz Hub is the primary navigation model.

Current core sections:

| Section | Purpose |
| --- | --- |
| Bondage & Discipline | restraint, rules, protocol, discipline, ritual, structure |
| Dominance & Submission | authority, autonomy, service, obedience, control, power exchange |
| Sadism & Masochism | giving/receiving intensity, pain, challenge, endurance |
| Roles & Headspaces | recognizable roles/headspaces plus the dynamic modes that explain why they resonate |

The original prototype remains available as the **Starter Profile** sampler and does not contribute to the future core overall profile by default.

Potential later sections include Sensation, Display & Social, and additional Erotic Interests when the core model is stable.

---

# Core BDSM sections

## Bondage & Discipline

The implemented M4 model is specified in [m4-bd-design.md](m4-bd-design.md).

M4 separates physical restraint from structural discipline and preserves direction where it matters.

Primary M4 signals include:

- receiving restraint
- giving restraint
- movement restriction
- receiving positioning
- giving positioning
- receiving constraint control
- giving constraint control
- receiving discipline
- giving discipline
- accountability
- anticipation
- challenge / escape

M4 also reuses shared signals such as structure, ritual significance, obedience, receiving/giving control, guidance/shaping, responsibility holding, and playful resistance when the meaning genuinely matches.

Two product boundaries are explicit:

1. **Discipline is not pain.** Pain Receiving/Pain Giving belong to M5.
2. **The catalog is not the questionnaire.** M4 measures mechanisms such as restraint, positioning, and accountability rather than asking directly about rope, cuffs, or other items.

Implemented results use a unified ranked list plus separate **Bondage / Physical Control** and **Discipline / Structural Control** radar views.

## Dominance & Submission

Implemented M2 signals:

- receiving control
- giving control
- responsibility transfer
- service
- obedience
- structure
- ownership symbolism
- praise/approval
- autonomy

Role direction should be represented explicitly where useful rather than assuming every user occupies one side.

For M2, these are **independent signals rather than opposite ends of a single axis**. A user may score highly on both Receiving Control and Giving Control, or on both Receiving Control and Autonomy. The profile should preserve those patterns rather than forcing a Dominant/submissive/switch label.

The implemented M2 questionnaire, signal definitions, and weight matrix are specified in [m2-ds-design.md](m2-ds-design.md).

## Sadism & Masochism

The implemented M5 model is specified in [m5-sm-design.md](m5-sm-design.md).

M5 separates direction and mechanism rather than producing one generic S/M score.

Implemented primary signals:

- Pain Receiving
- Pain Giving
- Receiving Intensity
- Giving Intensity
- Receiving Endurance
- Giving Endurance
- Receiving Challenge
- Giving Challenge
- Emotional Intensity
- shared Anticipation

Key boundaries:

1. **Pain is not general physical intensity.**
2. **Endurance is not intensity.**
3. **Challenge is not simply "more intensity."**
4. **Emotional intensity is independent from physical intensity.**
5. **Pain does not imply discipline, submission, or dominance.**
6. **General sensation play is broader than S/M.**

M5 uses a unified ranked signal list plus separate **Receiving / Masochistic** and **Giving / Sadistic** radar views. The section does not assign a forced Sadist/Masochist identity label.

---

# Roles & Headspaces

M3 uses a three-layer taxonomy:

```text
answers
  ↓
signals
  ├─ dynamic modes
  └─ roles / headspaces
```

The implemented M3 v3 model is documented in [m3-headspaces-direction.md](m3-headspaces-direction.md).

## Roles / headspaces

Primary user-facing results include:

### Receiving / submissive-leaning

- Pet
- Slave
- Little
- Middle
- Brat
- Prey
- Service Submissive
- Devotional Submissive
- Property / Object

### Giving / dominant-leaning

- Owner / Handler
- Caregiver
- Brat Tamer
- Predator
- Trainer
- Master / Mistress

These are **not mutually exclusive**. A user may score highly on several depending on context and the shape of their underlying signals.

## Dynamic modes

M3 also calculates explanatory dynamic modes:

- Nurtured Play
- Devotion
- Service
- Protocol
- Surrender
- Playful Resistance
- Objectification
- Caretaking
- Authority
- Claiming
- Training / Shaping
- Primal / Feral

These modes explain *why* roles may resonate. They should not be presented as though they are interchangeable with role/headspace identities.

For example:

```text
Slave
├─ surrender
├─ obedience
├─ service
├─ ownership symbolism
└─ structure
```

and:

```text
Brat
├─ playful resistance
├─ playfulness
├─ autonomy
└─ receiving control
```

Little and Middle require explicit younger-role/headspace evidence and are not inferred from generic care or playfulness alone.

Prey and Predator likewise use explicit primal embodiment plus direction-specific pursuit evidence. Liking Pet, Brat, receiving control, or giving control is not enough by itself to infer either primal role.

M3 remains independently completable. Reused signal IDs do not cause M2 answers to silently alter M3 results; cross-quiz aggregation belongs to M7.

---

# Questionnaire behavior

The target scoring architecture is defined in [scoring-model.md](scoring-model.md).

Key product requirements:

- important signals should be measured by multiple prompts
- a question may contribute evidence to multiple signals
- wording should vary enough to reduce single-phrase bias
- missing answers mean **unknown**, not zero
- high-confidence labels should not come from one answer
- direct self-identification questions should be used sparingly

The current Starter Profile still uses the simpler M0 scoring model.

## Response scale

The existing five-point preference scale is a reasonable default:

0. Not for me  
1. Mildly interesting  
2. Unsure / maybe  
3. Strong interest  
4. Core interest

Visible labels may vary by quiz, but internal semantics should remain stable unless intentionally versioned.

## Adaptive questioning

Adaptive follow-ups are optional future work.

If added, branching should:

- shorten irrelevant paths
- deepen strong or ambiguous signals
- improve coverage
- preserve score comparability

It should not manipulate outcomes or make the standard experience feel unpredictable.

---

# Results

## Section results

Each completed quiz should provide its own ranked results and visualization.

Example:

- Structure — 91%
- Ritual — 88%
- Restraint — 82%
- Discipline — 47%

## Roles & headspaces results

Role/headspace affinities are independent and do not need to sum to 100%.

Example:

- Pet — 94%
- Slave — 88%
- Brat — 76%
- Little — 62%

Dynamic modes such as Surrender, Protocol, or Primal / Feral are shown as explanatory context.

For M3, radar visualization is intentionally separated into receiving/submissive roles, giving/dominant roles, and underlying dynamic modes so one crowded chart does not flatten distinct directions.

## Overall profile

The overall profile aggregates completed core sections.

Unexplored sections remain explicitly unknown.

M1 implements the profile/progress shell. M7 is now the active milestone for full cross-section aggregation.

## Visualizations

Supported/current direction:

- ranked percentage bars
- radar/spider charts
- completion/progress state

The active M7 presentation direction is a unified overall profile with drill-down, not four mandatory peer views. Section-local D/s / Headspaces / activity results remain available from their existing sections; future dedicated alternate views can be added only if they prove useful.

---

# Catalog relationship

The catalog is a **data + explicit-preference + ranking layer**, not the questionnaire itself.

See:

- [M6 Catalog Integration](m6-catalog-integration.md)
- [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md)
- [Kink This-or-That Ranking](kink-this-or-that-ranking.md)
- [Reference Data](../reference/README.md)

M6 completed the catalog integration layer. The current app has:

- a 551-item repo-native TSV runtime catalog source + build-time generated runtime data
- durable Catalog/Category IDs, domains/display order, aliases, direction, and validated SignalId mappings
- explicit seven-state catalog preferences in a shared local catalog-profile store
- category + Overall This-or-That ranking with hardened meaningful-evidence/finalist/history semantics
- source-aware quiz-derived affinity + provenance
- catalog result views that keep explicit / pairwise / inferred evidence separate
- recommendation eligibility/suppression that respects explicit exclusions without erasing explainability evidence
- direct-evidence-only catalog → signal projection with no inferred feedback loop

M7 consumes this completed M6 boundary rather than introducing another catalog model.

## Four independent catalog truths

Keep these concepts separate:

1. **Catalog definition** — what the item is
2. **Explicit preference** — what the user directly says
3. **Pairwise ranking** — what the user prefers relative to other eligible items
4. **Inferred affinity** — what canonical quiz signals suggest may be worth exploring

A ranking win must not silently become `love`.

A `hard_limit` must not be overridden by either ranking or inference.

An inferred match must not be presented as though the user explicitly selected it.

## Explicit states

M6's canonical explicit states are:

- love
- like
- curious
- unsure
- not interested
- hard limit
- not applicable

Unanswered is absence of explicit state, not a stored "unknown" value.

The storage schema should remain capable of future receiving/giving overrides because many catalog concepts are directional. C3 initially edits the general/overall state through a searchable/filterable catalog table/list while preserving directional fields in the storage contract.

This-or-That remains a separate low-friction comparison mini-game. Pairwise choices do not create explicit state, and positive explicit state does not seed ranking.

Once explicit state exists, `hard_limit`, `not_interested`, and `not_applicable` are excluded from new pair selection immediately. This minimum eligibility behavior belongs with C3 so explicit exclusions are actually authoritative; C4 implements source-aware evidence convergence, and C5 implements ranking-confidence/finalist/history hardening.

## Pairwise ranking

The current ranking flow is intentionally low-friction:

```text
category progress home
        ↓
rank a category
        ↓
current evidenced Top 5 from ranked categories
        ↓
Overall candidate pool
(current finalists + eligible prior Overall participants)
        ↓
cross-category favorites
```

Untouched categories contribute no finalists. Zero-evidence items do not enter the finalist pool, and prior meaningful Overall participants remain available even if a category's current Top 5 later changes.

Pairwise ranking remains relative evidence; it does not replace explicit interest semantics.

## Inferred exploration

Catalog items may map to multiple stable `SignalId` values.

Conceptual example:

```yaml
id: collar
signals:
  ownership_symbolism: 1.0
  ritual_significance: 0.75
  receiving_restraint: 0.25
  giving_restraint: 0.25
```

That can eventually support language such as:

> Based on your profile, collars may be worth exploring.

M6 defines/validates catalog mappings and a pure affinity contract.

M7 owns the canonical cross-quiz signal profile and profile-wide inferred-exploration UI so M6 does not duplicate cross-quiz aggregation.


---

# Persistence

## Current

M1 stores a versioned profile in browser `localStorage`, with quiz answers/progress separated per quiz.

The app also migrates the original M0 Starter Profile storage shape.

## Later

Potential user-controlled features:

- export profile
- import profile
- clear/delete profile data
- sanitized shareable result card
- optional cloud sync

Cloud persistence is explicitly **not required for MVP**.

---

# UX direction

The app should feel:

- playful
- polished
- intimate without being cheesy
- adult rather than clinical
- exploratory rather than evaluative

Prefer:

> Explore D/s

over:

> Begin D/s Assessment

Prefer:

> Your strongest signals

over:

> Diagnostic results

---

# Not current scope

Do not add during the core quiz milestones:

- required user accounts
- authentication just to take quizzes
- backend database without a defined need
- social network features
- partner matching
- compatibility scoring
- AI-generated interpretation
- giant full-catalog questionnaire

These ideas can be revisited after the quiz/profile model is useful on its own.

---

# Open product questions

These do not block the current core quiz work.

Already decided in M6: **Hard Limit is a distinct explicit state from Not Interested / Not Applicable.** It controls eligibility/recommendation behavior without erasing historical or derived evidence used for explainability.

1. Should every section eventually offer both Quick and Deep modes?
2. When M7 aggregates the overall profile, how should source-aware evidence from M2 and M3 be combined without silently changing section-local results?
3. For future recommendation ordering, how should explicit positive preference affect placement relative to inference-only suggestions?
4. Should a user be able to exclude a completed section from their overall profile?
5. Does "Pet Profile" remain the final product name once the app covers broader BDSM interests?
