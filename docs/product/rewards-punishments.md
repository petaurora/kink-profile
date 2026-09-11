# Rewards & Punishments

Rewards & Punishments models whether an activity or action works **in a reward context, a punishment/consequence context, both, or neither** for the current profile.

It also provides contextual ranking, profile-derived suggestions, random selection, and reusable recipes.

## Product boundary

> **Reward and punishment are contextual uses, not mutually exclusive item types.**

A person's general preference for an activity does not determine whether that activity works as a reward or punishment.

The feature does **not** assign consequences, track who earned something, schedule obligations, maintain punishment debt, or enforce completion.

## Primitive library

The feature can evaluate two kinds of stable primitive references:

```ts
type RewardPunishmentPrimitiveRef =
  | { kind: "catalog"; id: CatalogItemId }
  | { kind: "action"; id: RewardPunishmentActionId };
```

This allows both ordinary catalog activities and reward/punishment-specific actions to participate in the same contextual model.

Source-sheet origin is provenance, not runtime meaning. An idea that originally came from a reward source is not restricted to rewards, and an idea that originally came from a punishment source is not automatically valid as punishment.

Stable IDs—not labels, source rows, or file order—are runtime identity.

## Independent reward and punishment state

Each primitive has two independent contextual states:

```ts
type ContextSuitability =
  | "strong"
  | "works"
  | "depends"
  | "no"
  | "never"
  | "unset";

type ContextualUseState = {
  suitability: ContextSuitability;
  randomEligible: boolean;
  note?: string;
};
```

A single primitive can therefore be:

```text
Reward:     Strong
Punishment: Strong
```

or any other independent combination.

There is no single reward ↔ punishment continuum.

## Suitability semantics

- `strong` — strongly works in this context.
- `works` — works in this context.
- `depends` — context-sensitive or conditional.
- `no` — does not work well in this context.
- `never` — explicit contextual boundary; do not use in this context.
- `unset` — not directly rated.

`no` and `never` are intentionally different. `never` is a boundary, not simply a low score.

Direct contextual choices remain authoritative and are stored separately from general catalog preference, ranking, quiz evidence, and inferred profile suggestions.

## Random eligibility

Random eligibility is separate from contextual suitability.

Only `strong` and `works` can remain random-eligible. Changing a contextual state to `depends`, `no`, `never`, or `unset` automatically prevents random eligibility.

This supports cases such as:

```text
This works very well as a reward,
but do not include it in random selection.
```

Random eligibility is a utility preference, not profile-scoring evidence.

## Contextual category profiles

Primitive definitions map to one or more reward/punishment contextual categories with bounded weights.

The runtime derives **separate reward and punishment category profiles** from direct contextual evidence.

Current direct-state projection:

| State | Aggregation value |
| --- | ---: |
| `strong` | 1.00 |
| `works` | 0.75 |
| `depends` | 0.50 |
| `no` | 0.00 |
| `never` | 0.00 + boundary count |
| `unset` | excluded |

Category affinity and evidence breadth remain separate.

The current breadth target is six weighted direct observations. This is a calibration constant in runtime, not a semantic promise that every category requires exactly six items.

Unknown items do not contribute zero.

## Inferred contextual suggestions

The feature can derive suggestions for **unrated** primitives.

An inferred suggestion is not direct evidence and does not silently change contextual suitability.

The current proposal model uses different inputs for reward and punishment contexts.

### Reward suggestions

Current configured weights:

```text
30% canonical Signal compatibility
35% reward-category affinity × evidence
20% similarity to directly confirmed reward items
15% general catalog compatibility
```

### Punishment suggestions

Current configured weights:

```text
25% canonical Signal compatibility
45% punishment-category affinity × evidence
30% similarity to directly confirmed punishment items
0% general catalog compatibility
```

That zero is deliberate.

> **Dislike, low general affinity, or aversion is not positive punishment evidence.**

General catalog preference can support reward inference because enjoyable activities may plausibly be rewarding. It must not be inverted into punishment logic.

Missing proposal components are renormalized over the evidence that actually exists, and low-confidence inputs are shrunk toward neutral.

Suggestions expose a score, confidence, band (`likely`, `possible`, `weak`), category contributions, reasons, and source evidence IDs.

## Suggestion boundaries

No proposal is generated when:

- the user has already directly rated that primitive/context; or
- a catalog-linked primitive is a current Hard Limit.

Accepting or editing a suggestion creates direct contextual evidence through the normal editing flow. The proposal itself remains derived.

Derived suggestions must not feed themselves back into category affinity as though the user confirmed them.

## Contextual ranking

Reward and punishment rankings are independent pairwise ranking scopes.

A primitive is rankable in a context when its direct suitability is:

- `strong`
- `works`
- `depends`

The ranking engine uses Elo-style updates with a starting rating of 1500 and supports:

- left preferred;
- right preferred;
- equal;
- skip.

Skip remains an interaction record but does not update ordering ratings.

Per-item confidence increases with meaningful comparisons; overall ranking confidence increases with ordering coverage.

Ranking is relative evidence. It does not rewrite contextual suitability.

## Randomizer

The randomizer draws from directly eligible primitives and valid saved recipes.

For primitives, eligibility requires:

```text
randomEligible = true
AND
suitability ∈ { strong, works }
```

For recipes, the recipe must match the requested context and pass recipe validation with randomization enabled.

When more than one result exists, the picker avoids immediately returning the previous entry when possible.

The randomizer does not infer eligibility from low preference, dislike, or inferred suggestions.

## Recipes

A saved reward or punishment recipe is a reusable combination of primitive references and/or bounded custom components.

Conceptually:

```ts
type RewardPunishmentRecipe = {
  id: string;
  kind: "reward" | "punishment";
  name: string;
  components: Array<PrimitiveComponent | CustomComponent>;
  notes?: string;
  tags?: string[];
  randomEligible: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Recipes can be created, edited, duplicated, reordered, deleted, and optionally included in random selection.

A duplicated recipe starts with random eligibility off.

## Recipe validation and stale references

Recipe validation distinguishes invalid data from data that needs review.

Examples:

- missing name or no components → invalid; cannot save;
- stale primitive reference → needs review;
- a component now marked `never` for that recipe context → needs review;
- a component marked `no` → warning.

A recipe that needs review cannot remain random-eligible. Reconciliation disables randomization rather than silently deleting the recipe.

This preserves user-authored combinations while respecting newer boundaries.

## Scene Builder integration

Scene Builder may request:

- reward;
- punishment;
- either;
- none.

Eligibility remains owned by Rewards & Punishments.

Scene Builder does not reinterpret suitability or create its own reward/punishment truth. It receives only entries that the M11 randomizer considers eligible.

For `either`, the scene integration chooses the available **context first**, then chooses an entry inside that context. This prevents a larger reward pool from silently making rewards more likely than punishments, or vice versa.

See [Scene Builder](scene-builder.md).

## Persistence and lifecycle

Authoritative Rewards & Punishments state is versioned separately into:

- direct contextual profile state;
- contextual ranking comparisons;
- saved recipes.

The current aggregate lifecycle schema is version 1.

Parsing validates stable primitive identity, dates, contextual states, ranking references, recipe components, and random-eligibility constraints before accepting persisted/imported state.

Invalid state falls back through the feature's lifecycle handling rather than being treated as trusted merely because it is stored JSON.

## Separation from general profile evidence

Keep these concepts separate:

```text
general catalog preference
        ≠
reward suitability
        ≠
punishment suitability
        ≠
reward ranking
        ≠
punishment ranking
```

Rewards & Punishments may consume canonical Signal and catalog context for **suggestions**, but its direct contextual state must not rewrite:

- quiz answers;
- canonical Signal evidence;
- general catalog preference;
- general catalog pairwise ranking;
- Overall Facets.

Likewise, derived reward/punishment suggestions are not another canonical Signal evidence source.

## Current non-goals

The feature does not currently provide:

- assignment to another person;
- task completion tracking;
- earned reward balances;
- punishment debt;
- automatic consequence triggers;
- scheduling;
- enforcement;
- a behavioral points economy.

If those become product work, they should be tracked separately rather than expanding this contextual-suitability model by accident.

## Implementation anchors

Current behavior is primarily implemented in:

- `src/lib/rewardPunishmentLibrary.ts` — primitive/category identity and source normalization;
- `src/lib/rewardPunishmentProfile.ts` — direct contextual suitability and random eligibility;
- `src/lib/rewardPunishmentInference.ts` — category profiles and inferred proposals;
- `src/lib/rewardPunishmentRanking.ts` — context-specific pairwise ranking;
- `src/lib/rewardPunishmentRandomizer.ts` — primitive/recipe random pools and anti-repeat;
- `src/lib/rewardPunishmentRecipes.ts` — recipe model, validation, reconciliation, duplication;
- `src/lib/rewardPunishmentLifecycle.ts` — authoritative lifecycle/import validation;
- related storage modules for browser persistence.

## Invariants

1. Reward and punishment suitability are independent axes.
2. Contextual suitability is separate from general kink preference.
3. `never` is an explicit contextual boundary.
4. Random eligibility is separate from suitability and only valid for `strong`/`works`.
5. Inferred suggestions remain derived until the user confirms or edits them.
6. Dislike is never positive punishment evidence.
7. Reward and punishment category profiles remain separate.
8. Ranking remains relative and does not overwrite direct suitability.
9. Invalid/stale recipes are reviewed or removed from randomization rather than silently treated as valid.
10. Scene Builder consumes M11 eligibility; it does not redefine it.
11. Stable primitive IDs—not labels/source rows—are identity.
12. Rewards & Punishments does not become an assignment/enforcement system by implication.
