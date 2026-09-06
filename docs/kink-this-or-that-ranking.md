# Kink This-or-That Ranking

## Status

**Implemented baseline with M6 hardening still in progress.**

Current imported runtime behavior includes:

- category-first pairwise ranking
- category progress-map home
- continue-where-you-left-off and next-category navigation
- untouched categories contribute no Overall finalists
- current Top 5 from each ranked category feed the Overall pool
- Overall is a destination from the category home rather than a stage tab
- Quick / Standard / Deep Dive / Gremlin sessions
- browser-local raw comparison persistence
- category and Overall ranking views

See [M6 Catalog Integration](m6-catalog-integration.md) for the parent catalog contract and [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md) for the direct preference-management surface.

---

## Purpose

Provide a low-friction way to turn the giant kink catalog into a meaningful ranked preference list without asking the user to independently score every catalog item.

The interaction is deliberately simple:

> Which are you more interested in?

The ranking happens in two stages:

1. rank items **within their own category**
2. take the strongest items from each category and rank those **across categories**

This preserves useful category-level results while also producing a manageable overall favorites list.

---

## Product principle

The experience should feel like:

> "Oh this is fun, which one do I like more?"

not:

> "Please complete a 500-question assessment."

The ranking engine may be statistically sophisticated underneath. The interaction should remain stupidly simple.

---

## Core flow

```text
MASTER KINK CATALOG
        │
        ├── Category A ────────> category ranking ──> finalists
        ├── Category B ────────> category ranking ──> finalists
        ├── Category C ────────> category ranking ──> finalists
        └── ...
                                      │
                                      ▼
                               FINALIST POOL
                                      │
                                      ▼
                              CROSS-CATEGORY
                               THIS / THAT
                                      │
                                      ▼
                               OVERALL RANKING
```

The overall ranking does **not** replace category ranking. Both results remain useful.

Example:

```text
Rope Bondage

Bondage rank: #1
Overall rank: #7
```

---

# Stage 1 — Rank within a category

Each category is ranked independently.

Example:

```text
Bondage & Discipline

Rope Bondage
     OR
Cuffs
```

The user works through enough pairwise comparisons to establish a useful ordering for that category.

The system should not require every possible pair.

For a category with `n` eligible items, exhaustive comparison would require:

```text
n × (n - 1) / 2
```

The question selector should instead prioritize comparisons that provide useful ranking information.

### Stage 1 output

Each category should retain its own ordered results.

Example:

```text
Bondage & Discipline

1. Rope Bondage
2. Shibari
3. Cuffs
4. Spreader Bars
5. Restraint Furniture
...
```

---

# Category finalists

Once a category has ranking evidence, its highest-ranked items can advance to the cross-category stage. Untouched categories must not contribute arbitrary finalists simply because all unrated items begin tied.

Initial product default:

```text
Top 5 per category
```

This is a **selection threshold**, not a permanent product rule.

Finalist count should effectively behave like:

```text
min(configuredFinalistCount, eligibleItems)
```

If a category has five or fewer eligible items, all eligible items can advance. If it has six, the current Top 5 advance.

Future tuning may use different finalist counts for very large or very small categories.

The goal is not to guarantee exactly five finalists from every category. The goal is to retain enough of each ranked category's strongest candidates to build a useful overall list. Categories with no ranking comparisons contribute no finalists.

---

# Current navigation model

The ranking experience is organized as navigation through a collection rather than a two-tab wizard.

```text
CATEGORIES HOME
├─ Continue where you left off
├─ In progress categories
├─ Not started categories
├─ Pretty confident categories
└─ Overall ranking destination
```

Entering a category or Overall opens that ranking context.

Inside a ranking context, `← Categories` returns to the category home. Category sessions also expose a next-category action.

The conceptual ranking model still has a category phase and an Overall phase, but the UI should not present them as rigid numbered stage buttons.

---

# Stage 2 — Cross-category ranking

Category finalists enter a second this-or-that flow.

Example:

```text
Rope Bondage
     OR
Praise
```

or:

```text
Pet Play
     OR
Impact Play
```

The purpose of this stage is to answer:

> "Out of the things I most like in each area, what are my actual overall favorites?"

The system should progressively establish the top of the overall list rather than requiring exhaustive ranking of the entire finalist pool.

Initial target:

- confidently determine approximately the overall Top 25–50
- allow the user to continue refining beyond that if desired
- preserve category ranking for items that never need a precise overall position

---

# Interaction choices

Each comparison should support:

- left item
- right item
- both / equal
- neither
- skip / don't know

### Left / right

The selected item receives evidence that it ranks above the other item.

### Both / equal

The two items are treated as approximately equivalent for this comparison.

### Neither

No positive ordering preference should be awarded to either item.

The raw interaction may be retained to avoid immediately repeating an unhelpful pair.

**Current implementation:** Neither is retained as a raw interaction for repetition avoidance/history, but it does not change Elo, increment item ordering counts, or increase scope confidence.

Direct explicit preference editing belongs in the catalog table/list. Ranking behavior must not silently overwrite explicit profile state.

### Skip / don't know

Skip should provide no ranking evidence.

The raw interaction may be retained so the selector can avoid immediate repetition.

**Current implementation:** Skip is retained as a raw interaction for repetition avoidance/history, but it does not change Elo, increment item ordering counts, or increase scope confidence.

Useful when:

- the user does not understand one of the terms
- the user has not explored either item enough to compare them
- the comparison feels meaningless

---

# Relationship to explicit preference state

C3 implementation details are recorded in [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md). C4 source-aware evidence convergence is implemented; C5 now owns the remaining ranking-confidence/finalist hardening.

This-or-That is intentionally a mini-game for comparative discovery/ranking. Direct preference assignment belongs in the separate catalog table/list.

Relative ranking and explicit interest are different dimensions.

Example:

```text
Rope Bondage
Interest: LOVE
Category rank: #1
Overall rank: #3

Cuffs
Interest: LIKE
Category rank: #4
Overall rank: #28

Blood Play
Interest: HARD LIMIT
Ranking: excluded
```

The catalog's explicit states remain authoritative for safety and interest semantics.

Canonical M6 explicit states:

- love
- like
- curious
- unsure
- not interested
- hard limit
- not applicable

Items marked `hard limit`, `not interested`, or `not applicable` should normally be excluded from ranking comparisons unless a future product mode explicitly says otherwise.

Ranking is primarily intended to distinguish relative preference among eligible items.

---

# Ranking model

Do not persist only a final score.

Raw pairwise decisions should remain the source of truth so rankings can be recalculated later if the algorithm changes.

Example comparison record:

```json
{
  "leftKinkId": "rope-bondage",
  "rightKinkId": "spanking",
  "scope": {
    "type": "category",
    "categoryId": "bondage-discipline"
  },
  "result": "left",
  "timestamp": "..."
}
```

Cross-category comparison:

```json
{
  "leftKinkId": "rope-bondage",
  "rightKinkId": "praise",
  "scope": {
    "type": "overall"
  },
  "result": "right",
  "timestamp": "..."
}
```

An Elo-style model is a reasonable first implementation because it is simple, incremental, and easy to test.

The storage model should not make Elo permanent. Future algorithms could include:

- Bradley-Terry
- TrueSkill
- Bayesian preference models

Calculated rankings are derived from raw comparison history, while C3 explicit preference state filters eligibility before pair selection/ranking.

---

# Question selection

The selector should avoid brute-force pair generation.

## Within-category selection

Early comparisons should establish rough placement quickly.

Later comparisons should increasingly prioritize:

- items with similar estimated rankings
- items with low comparison counts
- items with low ranking confidence
- unresolved ties
- newly added catalog items

## Cross-category selection

The finalist stage should prioritize comparisons that help determine the top of the overall list.

This means it does **not** need to precisely sort every finalist.

Priority should generally favor:

- likely Top 25–50 candidates
- close competitors
- finalists with low confidence
- finalists from different categories that have not yet been meaningfully compared

---

# Avoiding comparison fatigue

The system should avoid:

- repeating the exact same comparison unnecessarily
- repeatedly showing one item
- predictable left/right placement
- comparing explicitly excluded items once M6 explicit-state eligibility exists
- forcing users to finish an entire category in one sitting
- forcing users to rank the entire finalist pool

Left/right placement should be randomized to reduce position bias.

Progress should persist automatically.

---

# Sessions and progress

Ranking can be completed incrementally.

Suggested session options:

```text
Quick
10 comparisons

Standard
25 comparisons

Deep Dive
50 comparisons

Gremlin Mode
keep going until I stop
```

These are UX conveniences, not ranking semantics.

There does not need to be one absolute "complete" state.

Instead, results can expose confidence/refinement.

Example:

```text
Bondage ranking
Pretty confident

Overall favorites
Rough ranking
```

Possible confidence labels:

- Just Started
- Rough Ranking
- Pretty Confident
- Highly Refined

---

# Results

## Category results

Every ranked category should remain independently viewable.

```text
BONDAGE & DISCIPLINE

1. Rope Bondage
2. Cuffs
3. Shibari
4. Spreader Bars
...
```

## Overall favorites

The cross-category stage produces the primary favorites list.

```text
YOUR OVERALL FAVORITES

1. Pet Play
2. Rope Bondage
3. Praise
4. Ownership
5. Impact Play
...
```

The product may present:

- Top 10
- Top 25
- Top 50
- extended ranking where enough evidence exists

## Tier view

An optional presentation can derive human-friendly tiers from ranked results.

```text
S — FAVORITES
Pet Play
Rope Bondage
Praise

A — VERY INTO
Ownership
Impact Play
Collaring
```

Tiers are presentation. They should not replace the underlying ranking evidence.

---

# Catalog evolution

The master kink catalog will continue changing.

C1 replaced label-derived runtime identity with explicit stable Catalog IDs / Category IDs while preserving the IDs used by existing comparison history.

New items should:

- receive explicit stable IDs through catalog normalization
- begin with no comparison history
- enter their category ranking as low-confidence items
- be prioritized enough to establish approximate placement
- become eligible for finalist selection once sufficiently ranked

Adding catalog rows should not require existing users to restart their rankings.

---

# Explainability and editing

Because raw comparisons are retained, future UI can explain results.

Example:

```text
Rope Bondage — Overall #3

You selected it over:
- Cuffs
- Spanking
- Blindfolds
- Shibari

You selected:
- Pet Play over Rope Bondage
- Praise over Rope Bondage
```

Future controls may support:

- undo last comparison
- comparison history
- change a previous answer
- reset one category
- reset overall ranking
- reset one kink's comparison history

---

# Profile integration

A kink can expose both explicit state and derived ranking information.

Example:

```json
{
  "id": "rope-bondage",
  "preference": "love",
  "ranking": {
    "categoryRank": 1,
    "overallRank": 3,
    "categoryConfidence": 0.91,
    "overallConfidence": 0.78
  }
}
```

Exact rank values do not need to be persisted if they can be recalculated.

---

# Future partner comparison

Ranked preferences become especially useful if partner-profile comparison is eventually implemented.

Example:

```text
Shared favorites

Pet Play       You #1      Partner #3
Rope Bondage   You #2      Partner #2
Praise         You #3      Partner #7
```

Compatibility should eventually be able to distinguish:

```text
both said "yes"
```

from:

```text
this is a top-five preference for both people
```

This is future scope, not required for initial ranking implementation.

---

# Implementation slices

The initial feature is already playable. These statuses describe the current implementation rather than the original plan.

## R1 — Pairwise comparison model ✅

Implemented:

- [x] raw comparison record
- [x] category vs Overall scope
- [x] left / right / equal / neither / skip
- [x] deterministic Elo-style recalculation

M6 hardening:

- [x] focused tests
- [x] Skip does not increase ranking confidence
- [x] Neither does not increase ordering confidence

## R2 — Category ranking engine ✅

Implemented:

- [x] pair selection
- [x] duplicate/repetition penalty
- [x] low-evidence/close-ranking prioritization
- [x] coarse confidence estimate
- [x] category ranking results

M6 hardening:

- [x] C3 explicit-preference eligibility/exclusions
- [x] C5 confidence semantics based only on meaningful ordering evidence

## R3 — Finalist selection ✅

Implemented:

- [x] configurable finalist count
- [x] current default Top 5
- [x] untouched categories contribute zero finalists
- [x] categories with fewer than five items naturally contribute fewer finalists

Still needed:

- [x] require at least one meaningful ordering comparison for each promoted item; one comparison can promote only the items involved
- [x] preserve eligible prior meaningful Overall participants when current category Top 5 changes

## R4 — Cross-category ranking ✅ / selection tuning remains

Implemented:

- [x] build current finalist pool
- [x] Overall pair selection
- [x] Overall ranking
- [x] Overall confidence
- [x] existing raw Overall comparisons remain stored as the pool grows

Still needed:

- [ ] determine whether selection should prioritize resolving the top of the list more aggressively
- [x] derive the active candidate pool from current eligible finalists + eligible prior meaningful Overall participants; no separate persistence needed

## R5 — This-or-that UI ✅

Implemented:

- [x] two item cards
- [x] answer controls
- [x] randomized side placement
- [x] autosave
- [x] session-size controls
- [x] resume
- [x] category progress-map home
- [x] continue-where-you-left-off
- [x] next-category navigation
- [x] separate Overall destination
- [x] no prototype stage tabs/dropdown navigation

## R6 — Results/profile integration 🟡

Implemented:

- [x] category ranking views
- [x] Overall favorites
- [x] confidence labels

C6 integration:

- [x] explicit preference state beside ranking results
- [x] exclusion/hard-limit summaries separate from favorites
- [x] inferred affinity shown as a separate derived channel, never as rank
- [x] source-aware catalog detail/explainability
- [ ] optional tiers if they prove useful

M7 remains responsible for any new presentation-level aggregate that combines multiple independent direct evidence sources into a broader profile "Top Overall" result.

---

# Open tuning questions

These should be decided using real catalog sizes and hands-on testing rather than guessed now:

- Is Top 5 the right default finalist count?
- Should finalist count scale with category size?
- How aggressively should the system resolve the Top 25 vs the rest of the finalist pool?
- Should `curious` and `unsure` always participate, or be an optional ranking mode?
- Should ranking begin before a user has explicitly classified all items in a category?

The architecture should keep these as tuning decisions rather than hard-coded assumptions.
