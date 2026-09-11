# Kink This-or-That Ranking

This document defines the current catalog pairwise-ranking contract, including category/Overall ranking, temporal reranking, historical snapshots, and movement.

## Product boundary

This-or-That answers a **relative** question:

> Between the eligible things I am willing to compare, which pulls me more strongly?

It does not replace explicit catalog preference.

A user can coherently have:

```text
Rope Bondage
Explicit preference: Love
Category rank: #1
Overall rank: #4
```

and later rerank it without changing the explicit `Love` state.

The ranking system therefore keeps these concepts separate:

```text
explicit catalog preference
        ≠
current pairwise ranking
        ≠
historical ranking snapshots
```

## Stable identity

All ranking evidence uses stable Catalog IDs and Category IDs.

Labels, source row positions, and current file order are not identity.

When catalog IDs are replaced through the repository replacement map, persisted comparisons and historical snapshot items are canonicalized through the same replacement chain.

## Eligibility

Current explicit catalog state controls whether an item is eligible for ordinary ranking.

Items with Overall state:

- `hard_limit`
- `not_interested`
- `not_applicable`

are excluded from the active ranking pool.

Historical snapshots remain historical even if an item becomes ineligible later. Current eligibility controls what can happen now; history records what happened then.

## Ranking scopes

Ranking has two scope types:

```ts
type RankingScope =
  | { type: "category"; categoryId: string }
  | { type: "overall" };
```

Category ranking and Overall ranking are separate comparative contexts.

A comparison in one category does not directly update another category or the Overall Elo calculation.

## Category-first flow

The ranking experience starts within catalog categories.

The user can incrementally rank a category without exhausting every possible pair.

Once a category has meaningful ordering evidence, its strongest currently ranked items can become Overall finalists.

The current finalist selector takes up to the top five meaningfully ranked items from each category.

Untouched categories contribute no finalists. Items tied only because they have never been compared do not become arbitrary Overall candidates.

## Overall candidate pool

Overall ranking uses:

- current category finalists; plus
- items already involved in meaningful Overall comparisons.

This preserves existing Overall history when category finalists evolve while avoiding the entire catalog becoming an Overall comparison pool.

## Comparison results

Current raw comparison results are:

```ts
type ComparisonResult =
  | "left"
  | "right"
  | "equal"
  | "neither"
  | "skip";
```

Only `left`, `right`, and `equal` are **ordering results**.

### Left / right

The selected side receives pairwise evidence that it ranks above the other item.

### Equal

Both items receive an equal-result update.

### Neither

The interaction is retained, but it does not update Elo, increment ordering-comparison counts, or increase ranking confidence.

### Skip

The interaction is retained, but it also provides no ordering evidence.

Retaining Neither/Skip allows the pair selector and history to know that the interaction occurred without pretending the user expressed a relative preference.

## Current Elo model

The active ranking calculation currently uses an Elo-style model:

```text
starting rating = 1500
K factor        = 32
```

Ordering comparisons are replayed chronologically for the requested scope.

Items are then ordered by:

1. rating descending;
2. comparison count descending;
3. label as deterministic tie-breaker.

The calculated rating is derived data. Raw comparison records remain the persisted evidence source.

The algorithm version is stored on each ranking run so future ranking changes can be handled deliberately.

## Item and scope confidence

Each ranked item exposes comparison-based confidence:

```text
item confidence = min(1, meaningful comparisons / 8)
```

Scope confidence is based on meaningful ordering comparisons relative to the current eligible pool:

```text
target comparisons ≈ eligible item count × 4
scope confidence    = min(1, ordering comparisons / target)
```

Current presentation labels are:

- Just started
- Rough ranking
- Pretty confident
- Highly refined

Confidence describes refinement/evidence breadth. It does not rewrite explicit preference.

## Pair selection

The selector does not brute-force every possible pair.

It prioritizes comparisons that are useful for refinement by considering:

- how often the pair has already appeared;
- rating distance;
- existing comparison counts;
- current rank distance.

Repeated pairs receive a strong penalty, while close/low-evidence pairs are favored.

This allows ranking to remain incremental rather than requiring `n × (n - 1) / 2` comparisons.

## Persistence model

Catalog profile state stores raw comparisons together with temporal ranking-run metadata.

Conceptually:

```ts
type RankingRun = {
  id: string;
  startedAt: string;
  archivedAt?: string;
  status: "active" | "archived";
  algorithmVersion: number;
  snapshots?: RankingRunSnapshots;
};

type KinkRankingHistory = {
  activeRunId: string;
  runs: Record<string, RankingRun>;
};

type KinkComparison = {
  id: string;
  runId?: string;
  leftKinkId: string;
  rightKinkId: string;
  scope: RankingScope;
  result: ComparisonResult;
  timestamp: string;
};
```

`runId` remains optional at the TypeScript boundary only for legacy compatibility. Persisted/normalized current comparisons are assigned to a known run.

## Temporal model

This-or-That is intentionally treated as a repeatable comparative **preference pulse**, not one lifetime score that accumulates forever.

There is one active run and zero or more archived runs.

### Active run

The active run is the only writable run.

Only active-run comparisons contribute to:

- current category ranking;
- current Overall ranking;
- current pairwise Signal evidence;
- current profile Top Overall/ranking-derived presentation.

### Archived run

Archived runs retain historical raw comparisons and captured snapshots.

Archived comparisons do **not** strengthen the current pairwise evidence channel or initialize a new run's Elo ratings.

This prevents an old comparative state from masquerading as current preference.

## Starting a new run

Starting a new ranking run is a non-destructive temporal operation.

The runtime:

1. identifies the current active run;
2. captures meaningful category snapshots for scopes with ordering evidence;
3. captures an Overall snapshot when meaningful Overall evidence exists;
4. archives the old run with `archivedAt` and snapshots;
5. creates a new empty active run with the current algorithm version.

The new run starts from fresh pairwise evidence.

It does **not** delete or modify:

- explicit catalog preferences;
- quiz answers/results;
- the archived run's raw comparisons;
- the archived run's historical snapshots.

This is intentionally different from a destructive Settings reset.

## Historical snapshots

Each archived run can preserve snapshots for category scopes and Overall.

A snapshot records:

```ts
type RankingScopeSnapshot = {
  capturedAt: string;
  confidence: number;
  items: Array<{
    catalogId: string;
    rank: number;
    comparisons: number;
    confidence: number;
  }>;
};
```

Only items with meaningful ordering evidence are captured.

Snapshots provide a stable historical presentation anchor so later catalog growth, eligibility changes, or ranking-algorithm changes do not silently redefine what “previously #4” meant.

Raw archived comparisons remain historical evidence within the run; snapshots preserve the displayed ordering at archival time.

## Previous comparable snapshot

Movement uses the most recent archived run that contains a snapshot for the **same scope**.

Therefore:

- category movement compares against the previous comparable snapshot for that category;
- Overall movement compares against the previous comparable Overall snapshot;
- a category is never compared against Overall;
- if no previous comparable snapshot exists, no movement indicator is shown.

## View-relative movement

Movement is calculated against the exact item set visible in the current presentation.

This is critical.

Before computing movement, the previous snapshot is projected onto the current view's stable Catalog IDs, preserving previous order, then re-indexed from `1..N`.

For an item at current visible rank `r`:

```text
delta = previous visible rank - current visible rank
```

Therefore:

- positive delta → moved up;
- negative delta → moved down;
- zero → unchanged;
- absent from the previous comparable projected view → New this run.

This prevents hidden/filtered-out items from creating impossible-looking movement such as a current `#3` row claiming a five-place drop when only a small visible list is being shown.

> **The rank printed on the row is the rank the movement badge compares.**

## Meaningful-evidence requirement

Movement is not generated for current items with zero meaningful comparisons.

Likewise, archived snapshots omit items with no ordering evidence.

This prevents fresh runs from showing fake changes caused by default 1500 ratings or deterministic label tie-breaks.

`New this run` means the item was not meaningfully ranked in the immediately previous comparable snapshot. It does not mean the catalog item itself is newly created.

## Migration and backward compatibility

Older catalog profiles may contain comparisons without ranking history or without `runId`.

Normalization creates an initial active run and assigns legacy comparisons to it without duplicating evidence.

The initial run start time uses the earliest comparison timestamp when available.

No fake previous run is created, so users do not receive movement badges until a real archived comparable snapshot exists.

Persistence parsing validates:

- comparison identity/result/scope/timestamp;
- run IDs and active-run consistency;
- algorithm version;
- archived timestamps;
- category/Overall snapshots;
- snapshot rank/comparison/confidence values;
- current Catalog ID replacements.

Malformed ranking history is not partially trusted as canonical history.

## Catalog evolution

New catalog items enter with no pairwise evidence.

They can become eligible under current explicit preference rules and gradually establish placement through comparisons.

Catalog ID replacement mappings are applied to both raw comparison references and snapshot item references so historical continuity can survive intentional ID migrations.

## Relationship to canonical profile evidence

Pairwise ranking is one independent evidence source for the canonical Signal profile.

Only the **active run** is current pairwise evidence.

Archived runs are history, not additional current confidence.

Pairwise evidence remains relative and must not:

- overwrite explicit catalog preference;
- turn an inferred catalog suggestion into direct evidence;
- re-enter the profile through derived outputs;
- accumulate archived runs into a stronger current preference merely because history exists.

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md) and [Scoring & Taxonomy Model](scoring-model.md).

## Reset semantics

Starting a new run and deleting ranking data are different operations.

### Start a new ranking run

- archives current run;
- preserves history;
- creates a fresh active pulse;
- preserves other profile evidence.

### Delete This-or-That history

- destructive Settings lifecycle action;
- removes active and archived ranking evidence according to the selected reset scope;
- is not another name for reranking.

UI copy should keep those consequences unambiguous.

## Implementation anchors

Current behavior is primarily implemented in:

- `src/lib/kinkRanking.ts` — scopes, comparison semantics, Elo ranking, confidence, pair selection, finalist/Overall candidate selection;
- `src/lib/catalogProfile.ts` — catalog preference/ranking state, run normalization, active-run filtering;
- `src/lib/kinkRankingHistory.ts` — archival snapshots and new-run creation;
- `src/lib/kinkRankingMovement.ts` — previous comparable snapshot selection and view-relative movement;
- `src/lib/catalogProfileStorage.ts` — persistence validation, legacy migration, Catalog ID canonicalization;
- `src/KinkThisOrThat.tsx` and `src/RankingMovementIndicator.tsx` — current ranking interaction/presentation.

## Invariants

1. Pairwise ranking is relative evidence, not explicit preference.
2. Explicit exclusions control current ranking eligibility.
3. Raw comparisons remain the persisted evidence source.
4. Neither/Skip interactions do not become ordering evidence.
5. Untouched categories do not create arbitrary Overall finalists.
6. Only the active run contributes current pairwise evidence.
7. Starting a new run archives rather than destructively resets history.
8. Archived snapshots remain stable historical presentation anchors.
9. Movement compares like-for-like scopes and the exact visible item set.
10. Zero-evidence items do not generate movement.
11. Legacy comparisons migrate into one initial run without fabricated history.
12. Catalog ID migrations apply consistently to comparisons and snapshots.
13. Ranking history never feeds back as duplicate current evidence.
