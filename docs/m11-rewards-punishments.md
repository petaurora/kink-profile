# M11 — Rewards & Punishments

**Status:** planned  
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
  category: string;
  description?: string;
  tags?: string[];

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

# Rewards & Punishments page

Add a first-class destination from the main app/navigation.

Recommended top-level structure:

```text
Rewards & Punishments

[ Rewards ] [ Punishments ]

Reward profile / Punishment profile
  searchable list
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

Add a fast card-by-card sorter inspired by This-or-That, but with contextual-use choices instead of pairwise comparison.

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
- visible progress within the current set/category
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

## Progress

Persist sorter progress as the contextual-use states themselves rather than maintaining a second authoritative answer history.

Optional UI-only/resumable state may remember:

- current filter/category
- current position
- current shuffled/ordered deck seed or item order

but the authoritative result remains the contextual overlay.

## Not a pairwise ranker

Despite borrowing the card-game feel from This-or-That, this feature does **not** produce a rank.

It is a classification funnel:

```text
UNSORTED PRIMITIVES
        │
        ▼
Reward / Punishment / Both / Neither
        │
        ▼
COARSE CONTEXTUAL PROFILE
        │
        ▼
optional nuanced refinement
```

Do not reuse Elo/pairwise-ranking semantics or compare one reward against another.

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

**Purpose:** turn the existing reference bank into a safe runtime primitive source.

- [ ] define stable `RewardPunishmentActionId`
- [ ] normalize source reward/punishment ideas into one action library
- [ ] preserve source provenance
- [ ] deduplicate obvious runtime duplicates
- [ ] link exact/meaningful overlaps to M6 catalog IDs
- [ ] keep source-sheet origin as metadata only
- [ ] define primitive union of catalog + action references
- [ ] add deterministic stable-ID / dedupe / catalog-link tests

**Exit condition:** the app has one stable primitive universe without treating TSV row order as identity.

---

## M11.2 — Contextual-use profiles

**Purpose:** let the user define what actually works as a reward and/or punishment.

- [ ] add M11 profile storage/versioning
- [ ] add independent reward/punishment suitability overlays
- [ ] add `strong / works / depends / no / never / unset`
- [ ] add independent random-pool eligibility
- [ ] force `never` out of random eligibility
- [ ] add Reward and Punishment profile views
- [ ] support search/category/source/suitability filters
- [ ] optionally show read-only general M6 preference context
- [ ] ensure M11 edits never mutate M6/M7 evidence
- [ ] add deterministic overlay independence tests

**Exit condition:** the user can build clear lists of what works as a reward and what works as a punishment without conflating either with general preference.

---

## M11.3 — Quick Reward / Punishment / Both sorter

**Purpose:** make contextual classification fast and playful instead of requiring the full table.

- [ ] add one-item-at-a-time classification cards
- [ ] add primary Reward / Punishment / Both choices
- [ ] add Neither / not a fit and Skip for now
- [ ] map coarse choices to `works/no` without inventing `strong/depends/never`
- [ ] do not change random eligibility from sorter choices
- [ ] persist through the contextual overlay rather than a parallel answer model
- [ ] add Continue unsorted and category/source-focused runs
- [ ] add Back / Undo and resume behavior
- [ ] protect existing nuanced `strong/depends/never` states from accidental overwrite
- [ ] keep the table/list as the secondary detailed editing surface
- [ ] add deterministic sorter-mapping/state-preservation tests

**Exit condition:** the user can rapidly sort the primitive universe into Reward / Punishment / Both / Neither without grinding through a giant table.

---

## M11.4 — Randomizer

**Purpose:** provide the lightweight "just pick one" utility.

- [ ] add Random reward
- [ ] add Random punishment
- [ ] select only explicitly eligible positive-context items
- [ ] never fall back to unrated/unapproved source ideas
- [ ] add Pick again
- [ ] allow detail/view-source navigation
- [ ] avoid immediate reroll repetition within the current session
- [ ] add empty-pool states
- [ ] keep assignment/completion/history semantics out
- [ ] add deterministic eligibility tests and injectable RNG for tests

**Exit condition:** either contextual pool can produce a valid random suggestion without becoming a task/consequence system.

---

## M11.5 — Reward & punishment builders

**Purpose:** compose reusable multi-part rewards and punishments.

- [ ] add Build a reward
- [ ] add Build a punishment
- [ ] select components from catalog + action primitives
- [ ] support recipe-local custom text components
- [ ] support ordered components
- [ ] add name + notes + tags
- [ ] save/edit/duplicate/delete recipes
- [ ] keep recipes non-recursive in V1
- [ ] flag stale or context-`never` components as Needs review
- [ ] prevent Needs review recipes from random selection
- [ ] add deterministic recipe validation tests

**Exit condition:** a user can create named reusable combinations without the app tracking whether they were assigned or completed.

---

## M11.6 — Recipe randomization + lifecycle integration

**Purpose:** make saved recipes first-class optional randomizer entries and preserve them through profile management.

- [ ] allow saved recipes in reward/punishment random pools
- [ ] display recipe vs primitive clearly in random results
- [ ] update full profile export/import for M11 state
- [ ] add Rewards & Punishments selective-reset scope
- [ ] preserve M11 state across unrelated M9 resets
- [ ] keep M11 out of share summary by default
- [ ] add migration/backup/reset regression coverage

**Exit condition:** M11 state behaves like durable profile data and survives normal profile lifecycle operations.

---

## M11.7 — UX polish + integration

**Purpose:** make the feature practical on mobile and coherent with the rest of the app.

- [ ] add first-class navigation entry
- [ ] compact mobile rows and filters
- [ ] avoid giant all-items scroll where possible
- [ ] add useful empty/partial/full states
- [ ] verify catalog-linked items do not appear as confusing duplicates
- [ ] verify Reward/Punishment tabs stay semantically independent
- [ ] verify randomizer and builders use the same stable primitives
- [ ] verify accessibility/keyboard behavior
- [ ] regression-run M6/M7/M9 profile tests
- [ ] finalize docs and mark M11 complete

**Exit condition:** the feature reads as one coherent toolbox: quick-sort → refine → randomize → build → reuse.

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
- inferred reward/punishment suitability from quiz scores
- using dislike/aversion as punishment evidence
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

RANDOM ELIGIBILITY
Do I want the app to be allowed to pick this randomly?

RECIPE MEMBERSHIP
Do I want this as one component of this saved combination?
```

No one answer should silently determine another.

That separation is the core M11 contract.
