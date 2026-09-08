# M11 — Rewards & Punishments

**Status:** in progress  
**Roadmap milestone:** M11  
**Primary boundary:** M11 models what can work as a reward or punishment, provides a lightweight randomizer, and lets the user build reusable reward/punishment recipes. It does **not** assign, earn, schedule, track, or enforce consequences.

---

## Goal

Add a first-class **Rewards & Punishments** product area that answers four practical questions:

1. **What works as a reward for this profile?**
2. **What works as a punishment/consequence for this profile?**
3. **Pick one for us at random.**
4. **Let me build and save a custom reward or punishment from multiple pieces.**

The key semantic rule is:

> **Reward and punishment are contextual uses of an activity/action, not mutually exclusive item types.**

An activity can work as:

- a reward only
- a punishment only
- both
- neither
- only in certain contexts

A person's general preference for an activity also does **not** determine whether it works as a reward or punishment.

Examples:

```text
Spanking
general preference: Love
reward use: Strong
punishment use: Strong
```

```text
Praise
general preference: Love
reward use: Strong
punishment use: No
```

```text
Cold shower
general preference: Dislike
reward use: No
punishment use: Never
```

"Disliked" must never automatically mean "good punishment."

---

## Product principles

### 1. Contextual use is separate from general kink preference

M6 owns the user's general catalog preference state.

M11 adds independent contextual overlays:

```text
catalog/activity preference
        │
        ├── reward suitability
        └── punishment suitability
```

Changing reward/punishment suitability must not rewrite:

- explicit catalog preference
- This-or-That rank/history
- quiz evidence
- M7 aggregate affinity
- Hard Limit state

Likewise, catalog affinity/rank must not automatically decide reward/punishment suitability.

### 2. Reward and punishment are independent axes

Do not implement a single:

```text
reward <────────────> punishment
```

scale.

The same item can be strongly valid for both.

### 3. Source-list origin is not a semantic restriction

The existing reference bank currently contains:

- `reference/rewards-punishments/rewards.tsv`
- `reference/rewards-punishments/punishments.tsv`

Those source sheets are provenance, **not runtime truth**.

An item that originally came from the reward sheet may still be useful as a punishment, and an item that originally came from the punishment sheet may still work as a reward.

The broader **content-quality review** of this runtime library belongs to [M16 — Data & Content Curation](m16-data-content-curation.md). M16 may later remove, consolidate, rename, re-categorize, or remap normalized M11 actions when they are duplicative, unclear, or not useful enough to keep. M11 should establish stable behavior and identity without treating the first normalized dataset as permanently final.

### 4. The overall catalog is also eligible input

Every stable M6 catalog item can be evaluated for reward and punishment use.

M11 therefore draws from two primitive item sources:

```text
M6 KINK CATALOG
stable catalog items

M11 ACTION LIBRARY
reward/punishment-specific actions derived from the reference bank
```

Both can be classified for either contextual use.

### 5. Randomization is a utility, not a management system

The app may answer:

> "Pick a random reward."

or:

> "Pick a random punishment."

It does **not** answer:

- who earned one
- why one was assigned
- how many are owed
- whether it was completed
- whether someone has demerits
- whether a task failure should trigger one

No reward economy, punishment debt, assignment queue, task system, or enforcement workflow belongs in M11.

### 6. Builders create reusable combinations

A reward or punishment may be a composite experience rather than a single item.

M11 should support:

```text
primitive item + primitive item + notes
                  │
                  ▼
              saved recipe
```

Saved recipes can optionally join the same random pool as individual items.

---

# Source data and runtime identity

The 669 source ideas under `reference/rewards-punishments/` remain source/reference material.

Do **not** use:

- source row number
- spreadsheet row position
- current TSV order
- display label alone

as runtime identity.

## Normalized action library

Before user-facing M11 behavior, derive a runtime action library with stable IDs.

Conceptually:

```ts
interface RewardPunishmentActionDefinition {
  id: RewardPunishmentActionId;
  label: string;
  description?: string;
  tags?: string[];

  // normalized M11 taxonomy; source category text remains provenance only
  contextCategories: Array<{
    id: RewardPunishmentCategoryId;
    weight: number;
  }>;

  // provenance only; not a restriction on contextual use
  sourceOrigins: Array<{
    sourceKind: 'reward_reference' | 'punishment_reference';
    sourceSheet?: string;
    sourceRow?: number;
  }>;

  // optional link when the source action is meaningfully the same thing
  // as an existing M6 catalog item
  catalogItemId?: CatalogItemId;
}
```

## Deduplication

The normalized runtime library may consolidate obvious duplicate source rows.

When consolidating:

- preserve all relevant provenance
- preserve useful descriptions/tags
- prefer linking to an existing catalog item when the concept is genuinely identical
- do not aggressively merge items that differ in meaningful execution/context

Example:

```text
"hand spanking"
"spanking"
```

may plausibly map to one catalog activity plus an action variant.

But:

```text
"slow-count spanking"
"blindfolded punishment scene"
```

should not be flattened merely because both involve impact.

## Stable contextual category taxonomy

M11 needs its own stable contextual category IDs so actions from different source sheets and M6 catalog items can participate in the same reward/punishment aggregation.

Examples of contextual category concepts may include:

- Care / Pampering
- Praise / Recognition
- Choice / Privilege
- Connection / Attention
- Service
- Accountability / Structure
- Impact
- Restraint / Control
- Sensory / Intensity
- Sexual / Scene
- Protocol / Obedience
- Playful / Psychological

The exact taxonomy should be normalized and versioned during M11.1 rather than using raw source-sheet category strings as identity.

A primitive may map to more than one contextual category with bounded weights.

Source category labels remain provenance/display metadata only.

## Catalog-linked source actions

When a normalized source item maps exactly to an existing catalog item, the runtime should avoid presenting duplicate indistinguishable rows.

Preferred behavior:

- use the stable catalog item as the primitive identity
- keep source provenance/metadata available as supporting reference
- create a separate action item only when the source idea adds a distinct structure, variation, or non-catalog behavior

---

# Contextual-use data model

M11 adds a profile-owned overlay keyed by a stable primitive reference.

## Primitive reference

```ts
type RewardPunishmentPrimitiveRef =
  | {
      kind: 'catalog';
      id: CatalogItemId;
    }
  | {
      kind: 'action';
      id: RewardPunishmentActionId;
    };
```

## Suitability

Reward and punishment suitability should use the same storage vocabulary even if the UI labels differ.

Recommended canonical states:

```ts
type ContextSuitability =
  | 'strong'
  | 'works'
  | 'depends'
  | 'no'
  | 'never'
  | 'unset';
```

Suggested user-facing labels:

| Stored state | Reward label | Punishment label |
| --- | --- | --- |
| `strong` | Strong reward | Strong punishment |
| `works` | Works as a reward | Works as a punishment |
| `depends` | Depends | Depends |
| `no` | Not rewarding | Not effective / not a fit |
| `never` | Never use as reward | Never use as punishment |
| `unset` | Not rated | Not rated |

The distinction between `no` and `never` is important.

`no` means:

> this does not work well in this context.

`never` means:

> do not use this in this context.

## Contextual overlay

```ts
interface ContextualUseState {
  suitability: ContextSuitability;
  randomEligible: boolean;
  note?: string;
}

interface RewardPunishmentPreference {
  ref: RewardPunishmentPrimitiveRef;
  reward: ContextualUseState;
  punishment: ContextualUseState;
}
```

Reward and punishment states are independently editable.

## Defaults

Reference-source metadata may provide suggested categories/intensity/tags for browsing, but it must **not** pre-fill a user's suitability as if the app knows what works for them.

All contextual suitability begins `unset` unless explicitly migrated from future authoritative M11 data.

## Random eligibility

`randomEligible` is separate from suitability.

This supports cases such as:

> "This absolutely works as a reward, but I don't want it in the randomizer."

Recommended UX:

- setting `strong` or `works` may offer to include the item in the random pool
- `depends`, `no`, `never`, and `unset` should not become random-eligible automatically
- `never` must always force random eligibility off
- the user can manually remove any otherwise-positive item from the pool

Do not treat random eligibility as another preference signal for M7.

---

# Category aggregation + inferred contextual proposals

M11 should reuse the same source-aware pattern that makes the M6 catalog useful:

> **store direct evidence, derive proposals, keep the proposal visibly different from what the user actually chose.**

The user should not have to explicitly classify every primitive before the app can become useful.

## Evidence layers

For each primitive and each context, keep these concepts separate:

```text
DIRECT CONTEXTUAL EVIDENCE
user chose Reward / Punishment / Both / Neither
or refined Strong / Works / Depends / No / Never
        │
        ├──────────────► CONTEXT CATEGORY PROFILE
        │                 direct evidence only
        │
        └──────────────► confirmed profile summaries
                          direct evidence only

CANONICAL M7 SIGNAL PROFILE ───────┐
M6 GENERAL CATALOG CONTEXT ────────┤
DIRECT M11 CATEGORY PREFERENCES ───┤
SIMILAR CONFIRMED M11 ITEMS ───────┤
                                   ▼
                         INFERRED M11 PROPOSAL
                         "this may work as a reward"
                                   │
                                   ▼
                         suggestion / exploration UI
```

An inferred proposal is a **derived view**, not another authoritative evidence source.

If the user accepts or edits a proposal, that new choice becomes direct M11 contextual evidence.

## Separate reward and punishment category profiles

Category aggregation is context-specific.

The same category can therefore look completely different in the two profiles:

```text
Impact
Reward affinity:      Strong
Punishment affinity:  Strong

Care / Pampering
Reward affinity:      Strong
Punishment affinity:  Low / not established
```

Never calculate one generic "reward/punishment category score."

## Direct category aggregation

Only direct M11 contextual states contribute to the category profile.

Recommended initial numeric projection for aggregation:

| Direct contextual state | Aggregation value |
| --- | ---: |
| `strong` | 1.00 |
| `works` | 0.75 |
| `depends` | 0.50 |
| `no` | 0.00 |
| `never` | 0.00 + explicit boundary metadata |
| `unset` | excluded |

When a primitive maps to multiple contextual categories, apply its configured category-mapping weight.

For a category/context pair:

```text
category affinity
= weighted mean of known direct contextual states

category evidence
= separate breadth / coverage measure
```

Do not treat unknown items as 0.

Do not let one strongly rated item create the same confidence as a category supported by many independent direct choices.

Category coverage/breadth must therefore stay separate from category affinity, following the same general M7 principle that **strength is not evidence coverage**.

Exact breadth constants can be tuned during M11.3, but they must be deterministic, versioned, and tested.

## Category preference weighting

The derived reward-category and punishment-category profiles should influence:

- inferred proposal ordering
- which unrated items are most useful to surface next
- contextual profile summaries
- ordering among otherwise equivalent confirmed items
- the overall-profile M11 section

Category preference is a **bounded weighting input**, not an override.

For confirmed/direct items:

1. direct contextual state remains primary
2. category preference may break/order ties or provide a bounded relevance modifier
3. category weighting must never rewrite the underlying direct state

For inferred items:

- strong, well-supported contextual categories may raise a proposal
- weak or low-coverage categories should shrink toward neutral rather than strongly suppressing/boosting
- an inferred category score may never override an explicit item-level `no` or `never`

## Inferred proposal model

Conceptually:

```ts
interface InferredContextProposal {
  ref: RewardPunishmentPrimitiveRef;
  context: 'reward' | 'punishment';

  score: number;       // 0..1 inferred contextual fit
  confidence: number;  // 0..1 evidence/mapping confidence

  band: 'likely' | 'possible' | 'weak';

  categoryContributions: Array<{
    categoryId: RewardPunishmentCategoryId;
    affinity: number;
    coverage: number;
    weight: number;
  }>;

  reasons: string[];
  sourceEvidenceIds: string[];
}
```

The exact implementation type may differ, but score, confidence/coverage, context, and provenance must remain distinguishable.

## Proposal inputs

M11 inference may use:

1. **canonical M7 signal evidence** through explicit M11 action/category mappings
2. **M11 contextual category affinity** derived from direct M11 choices
3. **similar confirmed M11 items** through shared contextual categories/tags/mechanisms
4. **M6 general catalog evidence/affinity** when the primitive is catalog-linked
5. explicit M6 exclusions/Hard Limits as blocking evidence where applicable

Do not read raw quiz percentages directly and invent M11 meaning from them. Reuse the canonical M7 signal/evidence boundary.

### Reward proposals

General positive kink/catalog affinity is a reasonable supporting signal for reward fit.

Example:

```text
high general affinity for massage/caretaking
+ strong direct Reward affinity for Care / Pampering
+ similar confirmed reward items
→ "Likely reward"
```

M6 general affinity remains supporting evidence only; it does not create an explicit reward state.

### Punishment proposals

Punishment inference is intentionally more conservative.

**Dislike, aversion, or low general kink affinity is never positive punishment evidence.**

Punishment proposals should lean primarily on:

- direct punishment-category preferences
- similar directly confirmed punishment items
- mapped canonical signals that are contextually relevant
- explicit contextual patterns already established in M11

General catalog preference may provide compatibility/context, but:

```text
"I dislike this"
≠
"this should be proposed as a punishment"
```

Explicit Hard Limits or M11 `never` always block a punishment proposal.

## Suggested initial weighting contract

M11.3 should lock/test versioned weights. A reasonable initial shape is:

### Reward proposal

```text
30% mapped canonical-signal fit
35% reward-category affinity × category evidence strength
20% similarity to directly confirmed reward items
15% M6 general catalog compatibility
```

### Punishment proposal

```text
25% mapped canonical-signal fit
45% punishment-category affinity × category evidence strength
30% similarity to directly confirmed punishment items
```

Missing inputs are renormalized over the evidence that actually exists.

These are proposal weights only. They never alter direct user states.

If implementation evidence suggests these exact constants produce poor calibration, change them deliberately with tests/versioning rather than silently tuning them in UI code.

## Proposal visibility

An unrated item may show:

```text
Hair wash + scalp massage

Profile suggestion
Likely reward · 82%
Care / Pampering · Caretaking

[ Accept as reward ]
[ Refine ]
```

or:

```text
Slow-count impact set

Profile suggestion
Possible punishment · 67%
Impact · Accountability

[ Accept as punishment ]
[ Refine ]
```

Accepting a proposal should create a conservative explicit `works` state for that context.

It must **not**:

- create `strong`
- create `never`
- add the item to the random pool automatically
- change M6 general preference
- feed into D/s orientation

## Explicit always wins

Once the user has any direct contextual state for an item/context:

- `strong`
- `works`
- `depends`
- `no`
- `never`

that direct state is authoritative for presentation.

The app may still retain the current inferred score for explainability/debugging, but it must not display the inference as though it competes with the direct answer.

## Sorter + inference

The quick sorter may use inference to reduce grunt work.

Useful behavior:

- prioritize high-confidence unrated proposals
- show a small **Suggested: Reward / Punishment / Both** hint
- explain the top reason on demand
- never preselect or auto-submit an answer
- the user's tap remains the direct evidence

This lets the sorter feel more like:

> "Here are the things your profile thinks are worth sorting first."

rather than an arbitrary 1,000-item deck.

## Hard rule: no feedback loops

Allowed:

```text
M7 CANONICAL SIGNALS ───────────────► INFERRED M11 PROPOSAL

DIRECT M11 ITEM CHOICES ────────────► M11 CATEGORY PROFILE
DIRECT M11 ITEM CHOICES ────────────► SIMILARITY EVIDENCE

M11 CATEGORY PROFILE ───────────────► INFERRED M11 PROPOSAL
SIMILARITY EVIDENCE ────────────────► INFERRED M11 PROPOSAL
```

Forbidden:

```text
inferred M11 proposal
      ↓
category preference becomes stronger
      ↓
proposal becomes stronger
      ↓
category preference becomes stronger
      ↓
feedback loop
```

Therefore:

> **Inferred M11 proposals may never contribute to M11 category affinity, M7 canonical signals, or another inference source as though they were direct evidence.**

Direct M11 contextual choices also do **not** feed M7 general kink affinity in V1 because "works as a punishment" is not the same semantic statement as "I generally like this kink."

---

# In-app overall profile integration

M11 should add a distinct **Rewards & Punishments** section to the in-app overall profile once enough direct M11 evidence exists.

It does not become a tenth M7 radar facet and does not alter the existing M7 nine-axis radar.

Recommended shape:

```text
REWARDS & PUNISHMENTS

Rewards
Care & Pampering        Strong
Praise & Recognition   Strong
Scene / Play            Growing

Confirmed
Hair brushing · Massage · Dedicated cuddle time

Suggested to explore
Spa bath · Planned scene

Punishments
Impact                  Strong
Accountability          Strong
Restraint / Control     Moderate

Confirmed
Spanking · Writing lines · Chastity

Suggested to explore
Slow-count impact set · Structured obedience task

[ Explore rewards & punishments ]
```

## Profile aggregation rules

For each context:

1. derive category affinity from **direct M11 contextual evidence only**
2. keep category evidence coverage/breadth separate
3. show approximately the top 3–4 meaningful categories
4. show representative directly confirmed items first
5. use category preference as a bounded ordering modifier among otherwise comparable direct items
6. show inferred items only in a clearly separate **Suggested to explore** area
7. never let inferred items displace confirmed items
8. show fewer rather than padding a sparse profile

## Profile hierarchy boundary

The M11 section is an additional contextual profile dimension.

It must not rewrite or vote on:

- M7 overall radar facets
- D/s orientation
- Headspaces
- Dynamic Modes
- M7 Top Overall kink interests
- M7 Hard Limits
- M7 Interest Areas

Those continue to mean what they mean today.

The overall profile can present M11 alongside M7 because both describe the person, while keeping their evidence semantics separate.

## Share-summary boundary

This in-app profile integration does **not** change the M9 share-summary privacy rule.

M11 Rewards & Punishments remain excluded from exported/shareable summaries by default.

---

# Rewards & Punishments page

Add a first-class destination from the main app/navigation.

Recommended top-level structure:

```text
Rewards & Punishments

[ Rewards ] [ Punishments ]

Reward profile / Punishment profile
  contextual category summary
  searchable list
  explicit + inferred/resolved context
  category filters
  source filters
  suitability controls
  random-pool controls

Quick actions
  Random reward / Random punishment
  Build a reward / Build a punishment

Saved recipes
```

The page should feel like a practical toolbox, not another quiz.

---

# Reward / punishment profile lists

The Reward and Punishment views use the **same underlying item universe**:

- catalog primitives
- normalized M11 action primitives
- saved recipes for display/randomization

The selected tab only changes which contextual-use overlay is being edited.

## Row behavior

A compact row should communicate:

- item label
- category
- optional source/type badge: Catalog / Action / Recipe
- current suitability
- whether it is in the random pool
- optional note/detail access

Example:

```text
Spanking               Impact · Catalog
Strong punishment      [ In random pool ]
```

Avoid repeating M6's full preference editor inside M11.

If useful, a row may show a small read-only general-preference hint:

```text
General preference: Love
```

but M11 must not let that hint imply contextual suitability.

## Search and filters

Initial useful filters:

- search by label
- category
- source type: Catalog / Action / Recipe
- suitability state
- random-pool only

Do not require users to manually browse 669 source ideas plus the entire catalog as one giant unstructured list.

---


# Quick sorter — Reward / Punishment / Both

The primary classification experience should **not** require working through the full table/list editor.

Add a fast card-by-card sorter with contextual-use choices.

Example:

```text
Hair pulling

        [ Reward ]
     [ Punishment ]
         [ Both ]

      Neither / not a fit
        Skip for now
```

The core interaction should feel lightweight and game-like:

- one item at a time
- large tap targets
- fast keyboard/mobile interaction
- immediate advance after a choice
- persistent visible progress
- easy Back / Undo
- easy Exit and resume later
- optional category-focused runs
- an Unsorted view that naturally shrinks as the user classifies items

The table/list remains available for search, bulk review, notes, random-pool flags, and nuanced editing. It is **not** the required primary path.

## Sorter choices

The three primary choices are:

- **Reward**
- **Punishment**
- **Both**

Secondary escape choices are required:

- **Neither / not a fit**
- **Skip for now**

Do not force every primitive into one of the three positive contexts.

## Sorter semantics

The sorter performs **coarse contextual classification**.

Recommended mapping:

| Sorter choice | Reward suitability | Punishment suitability |
| --- | --- | --- |
| Reward | `works` | `no` |
| Punishment | `no` | `works` |
| Both | `works` | `works` |
| Neither / not a fit | `no` | `no` |
| Skip for now | unchanged | unchanged |

Important:

- sorter choices do **not** set `strong`
- sorter choices do **not** set `never`
- sorter choices do **not** set `depends`
- sorter choices do **not** change random eligibility
- sorter choices do **not** change the general M6 catalog preference
- sorter choices do **not** affect M7 aggregation or D/s orientation

The nuanced Reward/Punishment list/detail editor is where a coarse `works` or `no` can later be refined to:

- Strong
- Depends
- Never
- custom notes
- random-pool inclusion/exclusion

## Existing nuanced state

If an item already has a more specific state such as `strong`, `depends`, or `never`, the sorter must not silently destroy that nuance.

Preferred behavior:

- items with untouched/unset or coarse `works/no` state are eligible for the normal Unsorted/coarse-review flow
- items with nuanced states can be viewed/reclassified only with an explicit confirmation that the coarse sorter choice will replace the relevant contextual states
- `never` should never be downgraded through an accidental quick tap

## Scope selection

The sorter should support useful runs instead of presenting the entire universe as one endless deck.

Possible entry points:

```text
Sort rewards & punishments

Continue unsorted
Browse by category
Catalog items
Reward/punishment action ideas
Review previous choices
```

Category runs should reuse stable runtime categories from the normalized action library/catalog.

## Progress rail

The sorter should always expose honest, boring-in-a-good-way progress even while the surrounding feedback varies.

Example:

```text
137 classified · 683 remaining
━━━━━━━━━━━━━━────────────
Reward 62 · Punishment 41 · Both 18 · Neither 16
```

Requirements:

- count only directly classified primitives; Skip does not count
- avoid pretending inferred proposals are completed classifications
- show current filtered/category progress when the user entered a focused run
- keep an overall classified count available even inside a focused run
- tolerate catalog/action-library growth without corrupting prior progress

Persist sorter progress as the contextual-use states themselves rather than maintaining a second authoritative answer history.

Optional UI-only/resumable state may remember:

- current filter/category
- current position
- current shuffled/ordered deck seed or item order
- next micro-feedback threshold
- last celebrated 25-item checkpoint

but the authoritative result remains the contextual overlay.

## Variable-cadence micro feedback

Hundreds of classifications will become repetitive even with good cards. M11 should deliberately vary the rhythm.

After a random **1–7 new classifications**, insert one lightweight, non-blocking feedback beat, then choose a new random interval of 1–7.

Example cadence:

```text
3 choices
feedback
7 choices
feedback
2 choices
feedback
5 choices
feedback
1 choice
feedback
...
```

The user should never have to complete more than 7 new classifications before something changes visually/copy-wise.

Skip, Undo, opening details, or revisiting an existing choice do not advance the cadence.

A micro-feedback beat may be one of several types:

### Profile connection

Use deterministic existing mappings/provenance to explain how the just-classified item connects to the profile.

Examples:

```text
This sits in Care / Pampering — currently one of your stronger Reward patterns.
```

```text
This item also maps to Restraint / Control in your broader profile.
```

Do not invent a connection merely to have something to say.

### Context contrast

Surface interesting differences between general preference and contextual use.

Example:

```text
You generally Love this, but marked it Punishment-only.
General preference and contextual use really are different things.
```

### Category pulse

Show a small derived snapshot from direct M11 evidence.

Example:

```text
Impact is currently showing up strongly in both your Reward and Punishment profile.
```

### Discovery count

Examples:

```text
You have found 14 items that work as Both.
```

```text
9 new Reward candidates since your last checkpoint.
```

### Curated educational snippet

M11 may include a small local bank of reviewed educational/factual snippets about the taxonomy, consent/context, or BDSM terminology.

Rules:

- snippets must be curated/static rather than model-generated at runtime
- store source/provenance metadata when a factual claim needs it
- do not present folklore/opinion as universal fact
- do not interrupt the user with a mandatory modal
- allow the user to immediately continue sorting

### Playful microcopy

Some beats can simply be short, varied encouragement/progress copy rather than information.

The content-type selector should avoid showing the same feedback type repeatedly when another valid type exists.

Micro feedback is presentation only. It must never alter contextual state, ranking, inference, or scoring.

## Every-25 checkpoint

Every 25 **new direct classifications**, provide a larger progress celebration.

Example:

```text
100 mapped 🎉

Reward candidates: 46
Punishment candidates: 31
Both: 17

Care / Pampering moved into your top Reward themes.
```

The checkpoint may use a brief progress-line fill/pulse, card transition, particles/confetti-like effect, or similar delight animation.

Requirements:

- milestones are 25 / 50 / 75 / 100 / ...
- Skip does not count
- do not replay the same checkpoint repeatedly after reload/back navigation
- if a random micro-feedback beat lands on the same classification as a 25-item checkpoint, show the checkpoint instead of stacking both
- respect `prefers-reduced-motion`
- the animation must never delay or block continuing
- use actual direct-profile changes where available; otherwise show simple count progress rather than inventing insight

## Classification is the eligibility funnel for ranking

The sorter is **not itself** a pairwise ranker, but contextual classification is the required eligibility gate for the M11 pairwise rankers.

Conceptually:

```text
UNSORTED PRIMITIVES
        │
        ▼
Reward / Punishment / Both / Neither
        │
        ▼
DIRECT CONTEXTUAL PROFILE
        │
        ├──► REWARD RANKING POOL
        │      Reward / Both / other direct positive Reward states
        │
        └──► PUNISHMENT RANKING POOL
               Punishment / Both / other direct positive Punishment states
```

Do **not** require the user to classify the entire primitive universe before either ranking experience unlocks.

Instead:

> an individual item must have direct positive contextual evidence before it can enter that context's ranking pool.

This preserves the intended "classify first, compare second" flow without holding the fun ranking experience hostage to hundreds of unfinished items.

A direct detailed-editor choice of `strong`, `works`, or `depends` also counts as contextual classification; the user does not need to literally tap the quick sorter if the same authoritative state was set elsewhere.

---

# Reward & Punishment This-or-That ranking

M11 adds **two independent contextual pairwise rankings**:

1. Reward ranking
2. Punishment ranking

These are separate from each other and separate from M6 general kink This-or-That.

The same primitive may therefore simultaneously have:

```text
General kink Overall rank: #18
Reward rank:              #2
Punishment rank:          #11
```

or, for a Both-classified item:

```text
Reward rank:     #1
Punishment rank: #7
```

That is expected behavior.

## Do not reuse M6 rank values

M11 may reuse generic ranking-engine **code/algorithms** where useful, but it must not reuse:

- M6 comparison records
- M6 Elo/rating state
- M6 category rank
- M6 Overall rank
- M6 ranking confidence

General preference answers:

> "Which kink/activity pulls me more overall?"

Reward ranking answers:

> "Which of my known rewards is more rewarding / desirable as a reward?"

Punishment ranking answers:

> "Which of my known punishments is a stronger/better-fit punishment for this context?"

Those are different questions and require independent evidence.

## Ranking eligibility

A primitive may enter the Reward ranking pool when its direct Reward suitability is:

- `strong`
- `works`
- `depends`

A primitive may enter the Punishment ranking pool when its direct Punishment suitability is:

- `strong`
- `works`
- `depends`

Excluded from that context:

- `no`
- `never`
- `unset`

A quick-sort **Both** therefore makes the primitive eligible for both contextual rankers.

If a later explicit edit changes an item to `no` or `never`, current ranking views exclude it while preserving raw historical comparisons for explainability/recovery.

## What the contextual rank means

Reward and Punishment ranking need context-specific prompt language.

Reward ranking asks:

> **Which would feel more rewarding?**

Punishment ranking asks:

> **Which feels like the better-fit punishment/consequence?**

Punishment rank must **not** be defined as:

- which item is most disliked
- which item is most painful
- which item is most severe
- which item would create the strongest aversion

Those are different dimensions and may be unsafe or misleading if silently conflated.

The M11 punishment pool already contains items the user explicitly said can work in that context. Pairwise ranking only orders those confirmed candidates by contextual fit/preference/effectiveness as the user understands it.

If future product work needs severity/intensity, define it as a separate explicit dimension rather than deriving it from rank.

## Pairwise interaction

The contextual ranker can reuse the familiar card interaction:

```text
Favorite restraint setup
        OR
Hair wash + scalp massage
```

Recommended controls:

- left
- right
- both / equal
- skip / hard to compare
- edit contextual classification

Do not use a pairwise "Neither" answer to silently reclassify both items. If ranking reveals that one item should not actually be a Reward/Punishment, send the user to the explicit contextual editor.

## Ranking model

Raw M11 contextual comparisons should remain authoritative.

Conceptually:

```ts
type RewardPunishmentRankingContext = 'reward' | 'punishment';

interface RewardPunishmentComparison {
  id: string;
  context: RewardPunishmentRankingContext;
  leftRef: RewardPunishmentPrimitiveRef;
  rightRef: RewardPunishmentPrimitiveRef;
  result: 'left' | 'right' | 'equal' | 'skip';
  timestamp: string;
}
```

The exact runtime model may share generic utilities with M6, but contextual comparison identity/storage must remain M11-owned.

Do not seed pairwise rating from:

- general M6 rank
- `strong` vs `works`
- inferred proposal score
- M7 affinity

Suitability determines whether something belongs in the pool. Pairwise evidence determines relative contextual rank.

## Scaling to large pools

The ranker must not require exhaustive all-pairs comparison.

Use the same broad principles proven by M6:

- prioritize low-evidence items
- compare close/uncertain placements
- avoid needless exact repeats
- progressively establish the top of the list
- expose confidence/refinement rather than one fake absolute completion point
- support Quick / Standard / Deep Dive / open-ended sessions if that interaction remains useful

Because classification already reduces the pool to items that plausibly work in the requested context, M11 does not need to force the M6 category-finalist funnel in V1.

If real-world pools become too large, contextual-category-focused ranking can be added as a navigation/refinement option without redefining the independent Reward/Punishment rank signals.

## Ranking output

Example:

```text
TOP REWARDS

1. Favorite restraint setup
2. Dedicated cuddle/attention time
3. Hair wash + scalp massage
4. Chosen impact scene
...
```

and independently:

```text
TOP PUNISHMENTS

1. Accountability check-in
2. Writing lines
3. Chosen discipline scene
4. Privilege restriction
...
```

Rank is an additional direct contextual signal. It does not replace suitability.

The UI may show both:

```text
#2 Hair wash + scalp massage
Works as a reward
```

## Profile/category integration

Contextual category aggregation remains based on absolute direct suitability, not pairwise rank.

Pairwise Reward/Punishment rank may be used to:

- order confirmed representative items
- produce Top Rewards / Top Punishments lists
- break ties among equally suitable direct items
- improve contextual profile presentation

It must not:

- rewrite `strong/works/depends`
- feed inferred proposals back into direct category affinity
- alter M6/M7 general preference evidence
- alter D/s authority orientation

---

# Randomizer

The randomizer is intentionally small.

## Entry points

Provide:

- **Random reward**
- **Random punishment**

These may live on the M11 page and/or as compact actions inside the respective tabs.

## Eligibility

A primitive is eligible when:

1. its suitability for the requested context is `strong` or `works`
2. `randomEligible === true`
3. it is not currently blocked by a stronger exclusion rule
4. the referenced primitive still exists

A saved recipe is eligible according to the recipe rules below.

## Selection

V1 may use uniform random selection across the eligible pool.

Do **not** silently convert suitability strength into probability weighting in the first version.

If later weighting is desired, make it an explicit product decision rather than assuming:

```text
Strong = appears 5x as often
```

## Result surface

Example:

```text
Random reward

Hair wash + scalp massage

[ Pick again ]
[ View details ]
```

or:

```text
Random punishment

Accountability Lines
Saved recipe

[ Pick again ]
[ View recipe ]
```

## No assignment semantics

The result is only a suggestion.

Do not add:

- Accept / Assigned
- Complete
- Owed
- Due
- Applied
- Earned
- Infraction
- Demerit
- history of completed punishments
- automatic escalation

A lightweight in-session anti-repeat mechanism is acceptable so repeated rerolls do not immediately return the same result, but persistent behavioral history is out of scope.

## Empty state

If no eligible items exist:

> No random rewards yet. Mark some items as working for you and add them to the random pool.

Do not fall back to unrated reference ideas.

---

# Build a Reward / Build a Punishment

Builders create reusable **recipes** from primitive items.

The two builders share the same engine but have context-specific presentation.

## Builder entry

Provide explicit actions:

- **Build a reward**
- **Build a punishment**

The builder should allow the user to search/add from:

- M6 catalog items
- M11 action-library items
- optional custom free-text component

Custom free-text components become recipe-local content in V1; they do not automatically become global catalog/action-library primitives.

## Recipe model

```ts
interface RewardPunishmentRecipe {
  id: RewardPunishmentRecipeId;
  kind: 'reward' | 'punishment';
  name: string;

  components: Array<
    | {
        kind: 'primitive';
        ref: RewardPunishmentPrimitiveRef;
      }
    | {
        kind: 'custom';
        id: string;
        label: string;
      }
  >;

  notes?: string;
  tags?: string[];

  randomEligible: boolean;

  createdAt: string;
  updatedAt: string;
}
```

Recipes should not contain other recipes in V1.

Avoid recursive composition until there is a real need.

## Flexible composition

Do not force every recipe into a rigid:

```text
core + modifier + aftercare
```

schema.

That may be a useful UI suggestion, but the persisted model should simply support an ordered list of components plus notes.

Example reward:

```text
Good Girl Night

1. Favorite restraint setup
2. Chosen impact play
3. Hair brushing
4. Dedicated cuddle time

Notes:
Taylor plans the setup so babygirl does not have to make decisions.
```

Example punishment:

```text
Accountability Lines

1. Writing lines
2. Short reflection
3. Verbal check-in afterward

Notes:
Keep it brief and resolved once completed.
```

The app is storing the recipe definition, **not tracking completion of it**.

## Recipe editing

Users can:

- create
- rename
- reorder components
- add/remove components
- edit notes/tags
- duplicate
- delete
- include/exclude from random pool

## Recipe safety against changed boundaries

If a recipe references a primitive later marked `never` for that recipe's context:

- automatically remove the recipe from random eligibility
- visibly mark it **Needs review**
- do not delete the recipe
- do not silently override the current `never` boundary

A component marked `no` may warn during editing but does not have to invalidate a recipe, because an item that is ineffective alone may still make sense as one part of a composite.

Missing/deleted/stale primitive references should also mark the recipe Needs review.

---

# Relationship to M6 catalog semantics

M11 must preserve M6's source-aware catalog architecture.

## General preference and contextual use are orthogonal

Examples that must remain valid:

```text
Love spanking generally
+ Strong reward
+ Strong punishment
```

```text
Love restraints generally
+ Strong reward
+ Not effective as punishment
```

```text
Dislike an activity generally
+ Never use as punishment
```

```text
Neutral general preference
+ Works as a punishment in a specific context
```

M11 must not infer authority orientation from these contextual uses.

"Giving a punishment" does not mean Dominant.
"Receiving a punishment" does not mean submissive.

The authority/activity/role separation contract remains authoritative.

---

# Relationship to source reference data

The existing reference bank is intentionally broad and may contain:

- near-duplicates
- speculative ideas
- source-specific terminology
- actions that overlap catalog items
- actions that are unsuitable for a given user
- actions that came from one contextual list but can plausibly be used in another

Therefore the runtime pipeline is:

```text
RAW REFERENCE BANK
669 source ideas
        │
        ▼
NORMALIZED ACTION LIBRARY
stable IDs + dedupe + metadata + optional catalog links
        │
        ├─────────────┐
        ▼             ▼
REWARD OVERLAY   PUNISHMENT OVERLAY
user-owned       user-owned
        │             │
        └──────┬──────┘
               ▼
      RANDOMIZER + BUILDER
```

The source bank itself should remain immutable reference/provenance material.

---

# Persistence and profile lifecycle

M11 state is authoritative user profile data and must participate in M9 lifecycle features.

## Persisted M11 domains

Persist:

- primitive reward contextual-use states
- primitive punishment contextual-use states
- raw Reward/Punishment contextual pairwise comparisons
- random-pool flags
- user notes
- saved recipes
- recipe random-pool flags

Do not persist:

- derived filtered lists
- randomizer result cards
- in-session anti-repeat state
- normalized display-only sorting
- recomputable source metadata

## Full profile export/import

The M9 machine-readable backup must be extended to include M11 authoritative state.

A profile backup created after M11 launches should preserve:

- contextual overlays
- random eligibility
- recipes
- recipe components/custom text
- M11 notes/tags

Import validation must remain atomic.

## Reset

M9 selective reset should gain a new independent scope:

> Rewards & Punishments

Resetting this scope clears M11 contextual overlays and saved recipes without deleting:

- quiz data
- M6 catalog preferences
- This-or-That history
- profile identity/settings

Resetting general catalog preferences must not silently erase M11 contextual-use choices.

If a catalog item remains stable, its M11 overlay remains valid even if its general M6 preference becomes unset.

## Share summary

M11 data should **not** be added to the existing public/shareable M9 summary by default.

Reward/punishment details can be intimate and context-specific.

A future explicit "include rewards/punishments in share summary" feature may be designed separately.

---

# M11 milestone slices

## M11.1 — Runtime library + stable identity

**Purpose:** turn the existing reference bank into a safe runtime primitive source and normalize category identity.

- [x] define stable `RewardPunishmentActionId`
- [x] define/version stable `RewardPunishmentCategoryId`
- [x] normalize source reward/punishment ideas into one action library
- [x] preserve source provenance
- [x] deduplicate obvious runtime duplicates
- [x] link exact/meaningful overlaps to M6 catalog IDs
- [x] map catalog/action primitives into normalized contextual categories with bounded weights
- [x] keep source-sheet origin/category text as metadata only
- [x] define primitive union of catalog + action references
- [x] add deterministic stable-ID / category-mapping / dedupe / catalog-link tests

**Exit condition:** the app has one stable primitive + contextual-category universe without treating TSV row order or raw source category text as identity.

---

## M11.2 — Direct contextual-use profiles

**Purpose:** let the user explicitly define what actually works as a reward and/or punishment.

- [x] add M11 profile storage/versioning
- [x] add independent reward/punishment suitability overlays
- [x] add `strong / works / depends / no / never / unset`
- [x] add independent random-pool eligibility
- [x] force `never` out of random eligibility
- [x] add Reward and Punishment profile views
- [x] support search/category/source/suitability filters
- [x] optionally show read-only general M6 preference context
- [x] ensure M11 direct edits never mutate M6/M7 evidence
- [x] add deterministic overlay independence tests

**Exit condition:** direct contextual evidence is authoritative, independent, and ready to drive category aggregation.

---

## M11.3 — Category aggregation + inferred proposals

**Purpose:** give M11 the same "profile can suggest useful starting points" behavior as the M6 catalog without turning derived guesses into explicit answers.

- [x] derive separate Reward and Punishment category affinity from direct M11 evidence only
- [x] keep category affinity separate from category evidence breadth/coverage
- [x] use stable contextual-category mapping weights
- [x] add versioned inferred contextual proposal model with score + confidence + provenance
- [x] reuse canonical M7 signal evidence rather than raw quiz percentages
- [x] use M6 general affinity as bounded supporting evidence for Reward proposals
- [x] weight proposals by direct M11 contextual category preferences
- [x] use similar directly confirmed M11 items as supporting evidence
- [x] never use dislike/aversion as positive punishment evidence
- [x] enforce Hard Limit / context-`never` proposal blockers
- [x] keep inferred proposals out of random eligibility
- [x] accepting a proposal creates conservative explicit `works`, not `strong`
- [x] prevent inferred proposals from feeding category aggregation or M7 signals
- [x] add deterministic score/confidence/no-feedback-loop tests

**Exit condition:** unrated items can show explainable Reward/Punishment proposals weighted by the user's category patterns while explicit choices remain authoritative.

---

## M11.4 — Quick Reward / Punishment / Both sorter + engagement pacing

**Purpose:** make contextual classification fast and playful instead of requiring the full table.

- [x] add one-item-at-a-time classification cards
- [x] add primary Reward / Punishment / Both choices
- [x] add Neither / not a fit and Skip for now
- [x] map coarse choices to `works/no` without inventing `strong/depends/never`
- [x] do not change random eligibility from sorter choices
- [x] persist through the contextual overlay rather than a parallel answer model
- [x] add Continue unsorted and category/source-focused runs
- [x] allow high-confidence inferred proposals to prioritize the queue
- [x] optionally show Suggested: Reward / Punishment / Both without auto-selecting it
- [x] add Back / Undo and resume behavior
- [x] protect existing nuanced `strong/depends/never` states from accidental overwrite
- [x] add persistent overall + focused-run progress rails
- [x] add variable-cadence micro feedback after a random 1–7 new classifications
- [x] support profile connection / context contrast / category pulse / discovery count / curated fact / playful-copy feedback types
- [x] ensure feedback is deterministic/provenance-backed when it claims a profile relationship or factual statement
- [x] add non-blocking 25-item checkpoint animations + useful profile deltas
- [x] respect reduced-motion preferences
- [x] keep the table/list as the secondary detailed editing surface
- [x] add deterministic sorter-mapping/proposal/state-preservation/cadence tests

**Exit condition:** the user can rapidly sort the primitive universe with visible progress and varied, useful feedback instead of grinding through a giant table.

---

## M11.5 — Independent Reward & Punishment pairwise rankings

**Purpose:** rank already-classified contextual candidates without confusing that rank with general kink preference.

- [x] add separate Reward and Punishment This-or-That entry points
- [x] require direct positive contextual classification per item before ranking eligibility
- [x] do not require the entire primitive universe to be classified before ranking unlocks
- [x] allow `strong / works / depends` items into the matching context pool
- [x] keep `no / never / unset` out of that context's active rank pool
- [x] keep Reward rank independent from Punishment rank
- [x] keep both contextual ranks independent from M6 category/Overall rank
- [x] allow shared generic pairwise engine utilities without sharing M6 score/history
- [x] persist raw M11 contextual comparisons with explicit context identity
- [x] support left / right / equal / skip + explicit reclassification navigation
- [x] do not seed rank from suitability, inference, M6 rank, or M7 affinity
- [x] use adaptive/low-evidence pair selection rather than exhaustive all-pairs
- [x] expose confidence/refinement
- [x] produce Top Rewards and Top Punishments views
- [x] preserve old comparison evidence when later contextual edits exclude an item
- [x] add deterministic eligibility/source-separation/ranking tests

**Exit condition:** confirmed Reward and Punishment pools each have their own trustworthy relative ranking, while absolute suitability and general kink rank remain independent.

---

## M11.6 — Randomizer

**Purpose:** provide the lightweight "just pick one" utility.

- [x] add Random reward
- [x] add Random punishment
- [x] select only explicitly eligible positive-context items
- [x] never promote inferred proposals into the random pool
- [x] never fall back to unrated/unapproved source ideas
- [x] allow tap-the-result-card reroll
- [x] show an ephemeral in-view reroll trail that clears when Randomizer unmounts
- [x] never persist that trail as assignment/completion/profile history
- [x] allow source/provenance inspection + empty-pool setup navigation
- [x] avoid immediate reroll repetition within the current session
- [x] add empty-pool states
- [x] keep contextual rank from silently becoming random probability weighting in V1
- [x] keep assignment/completion/history semantics out
- [x] add deterministic eligibility tests and injectable RNG for tests

**Exit condition:** either contextual pool can produce a valid random suggestion using only explicitly approved entries.

---

## M11.7 — Reward & punishment builders

**Purpose:** compose reusable multi-part rewards and punishments.

- [x] add Build a reward
- [x] add Build a punishment
- [x] select components from catalog + action primitives
- [x] surface inferred proposals as optional exploration helpers without auto-adding them
- [x] support recipe-local custom text components
- [x] support ordered components
- [x] add name + notes + tags
- [x] save/edit/duplicate/delete recipes
- [x] keep recipes non-recursive in V1
- [x] flag stale or context-`never` components as Needs review
- [x] prevent Needs review recipes from random selection
- [x] add deterministic recipe validation tests

**Exit condition:** a user can create named reusable combinations without the app tracking whether they were assigned or completed.

---

## M11.8 — Recipe randomization + lifecycle integration

**Purpose:** make saved recipes first-class optional randomizer entries and preserve authoritative M11 state through profile management.

- [x] allow valid saved recipes in reward/punishment random pools
- [x] display recipe vs primitive clearly in random results
- [x] update full profile export/import for direct M11 state + contextual pairwise history + recipes
- [x] keep inferred/category aggregates recomputable and non-authoritative in backups
- [x] add Rewards & Punishments selective-reset scope
- [x] preserve M11 state across unrelated M9 resets
- [x] keep M11 out of share summary by default
- [x] add migration/backup/reset regression coverage

**Exit condition:** authoritative M11 state behaves like durable profile data while inference remains recomputable.

---

## M11.9 — Overall profile integration + UX polish

**Purpose:** make M11 a coherent part of the app/profile rather than a disconnected toolbox.

- [ ] add first-class navigation
- [ ] add in-app overall-profile Rewards & Punishments section
- [ ] show top 3–4 meaningful Reward categories and Punishment categories separately
- [ ] show Top Rewards / Top Punishments when contextual pairwise evidence is sufficient
- [ ] order representative confirmed items using contextual rank when available, with suitability/category relevance retained as separate context
- [ ] show inferred **Suggested to explore** items separately from confirmed items
- [ ] never feed M11 category/proposal/rank values into M7 radar/orientation/Headspaces/Modes/Top Overall
- [ ] compact mobile list/filter/profile behavior
- [ ] prevent confusing duplicates between catalog-linked and action-library items
- [ ] verify sorter, inference, contextual rankers, randomizer, and builders use the same stable primitive/category model
- [ ] verify accessibility/keyboard behavior
- [ ] regression-run M6/M7/M9 profile/evidence tests
- [ ] finalize docs and mark M11 complete

**Exit condition:** the feature reads as one coherent flow: infer/propose → quick-sort → contextual rank → refine → aggregate/profile → randomize → build → reuse.

---

# Acceptance scenarios

## Same item works both ways

Given Spanking is generally liked, when the user marks:

```text
Reward: Strong
Punishment: Strong
```

then:

- both contextual states persist
- it may appear in both random pools if enabled
- neither state changes the M6 general preference
- neither state changes D/s orientation

## Dislike is not punishment eligibility

Given an item is generally Disliked, when punishment suitability is still Unset:

- it does not enter the punishment random pool
- the app does not infer that aversion makes it effective
- the user must explicitly classify punishment suitability

## Context boundary

Given an item is:

```text
Punishment: Never
```

then:

- it can never be randomly selected as a punishment
- manually changing general preference cannot override that boundary
- a saved punishment recipe containing it becomes Needs review and ineligible for random selection

## Source origin does not lock context

Given an action originated in `rewards.tsv`:

- it may still be rated as a punishment
- the source origin can be shown as provenance
- the UI must not imply "reward-only"

## Recipe + randomizer

Given a saved reward recipe is valid and random-enabled:

- it can be selected alongside single primitive rewards
- the result clearly identifies it as a saved recipe
- selecting it does not mark anything assigned, earned, due, or complete

## Inferred proposal stays inferred

Given an unrated item receives a high-confidence Reward proposal:

- the row may show Likely reward + confidence/explanation
- the item remains contextually `unset` until the user acts
- it is not random-eligible
- it does not contribute to Reward category affinity
- accepting the proposal creates explicit `works`

## Category weighting without feedback

Given several directly confirmed Care / Pampering rewards:

- the Reward profile may show Care / Pampering as a strong contextual category
- that category may raise other Care / Pampering Reward proposals
- those proposals do not themselves raise Care / Pampering category affinity
- Punishment category affinity remains independently calculated

## Punishment inference does not weaponize dislike

Given an item has low M6 general affinity but no direct M11 punishment evidence:

- low affinity is not positive punishment evidence
- the item is not proposed merely because it is disliked
- a Hard Limit blocks proposal entirely
- only direct contextual patterns/mapped evidence may support a punishment proposal

## Overall profile separation

Given M11 has enough direct evidence:

- the overall profile may show separate Reward and Punishment category summaries
- confirmed items appear separately from Suggested to explore
- M7 radar/orientation/Headspaces/Modes/Top Overall remain unchanged

## M9 backup

Given a profile has contextual ratings and saved recipes:

- full profile export contains them
- valid import restores them
- invalid import leaves the current profile unchanged
- share-summary export omits them unless a future explicit sharing feature is added

---

# Non-goals

M11 does **not** include:

- task/habit integration
- demerits or points
- earning thresholds
- automatic assignment
- automatic punishment escalation
- punishment debt/queues
- due dates
- completion tracking
- partner notifications
- remote assignment
- partner accounts
- consent contracts/checklists
- automatic safety judgment
- AI-generated punishments/rewards
- raw quiz scores directly writing M11 contextual states
- inferred M11 proposals masquerading as explicit contextual evidence
- inferred M11 proposals feeding back into category affinity or M7 signals
- using dislike/aversion as positive punishment evidence
- public sharing of M11 data by default
- recursive recipes
- a full scene-planning engine

Those may be separate future product decisions if there is a real need.

---

# Important semantic boundaries

M11 must preserve these distinctions:

```text
GENERAL PREFERENCE
Do I like this activity?

REWARD SUITABILITY
Does this work as a reward for me?

PUNISHMENT SUITABILITY
Does this work as a punishment/consequence for me?

REWARD RANK
Among confirmed rewards, which ones rise to the top?

PUNISHMENT RANK
Among confirmed punishments, which ones rise to the top?

CONTEXT CATEGORY AFFINITY
What patterns emerge across my direct Reward or Punishment choices?

INFERRED CONTEXTUAL PROPOSAL
What does the profile think may be worth exploring here?

RANDOM ELIGIBILITY
Do I want the app to be allowed to pick this randomly?

RECIPE MEMBERSHIP
Do I want this as one component of this saved combination?
```

No one answer should silently determine another.

That separation is the core M11 contract.
