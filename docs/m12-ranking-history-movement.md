# M12 — This-or-That Ranking History & Movement

## Status

**Scoped / not implemented.**

M12 extends the existing This-or-That ranking system with temporal history.

The existing ranking engine answers:

> "How do these interests rank relative to one another?"

M12 adds a second question:

> "How is that ranking different from the last time I checked?"

This is intentionally different from quiz retakes and explicit catalog editing. The product should treat This-or-That as the most state-sensitive direct evidence source: a repeatable comparative **preference pulse**.

---

# Product model

The three major profile inputs have different temporal meanings.

## Quizzes — foundational profile

Quizzes describe relatively broad underlying patterns:

- signals
- dynamic modes
- roles/headspaces
- broad affinities

A quiz can be retaken, but it is not expected to be rerun merely because the user's current interests changed for a few days or weeks.

## Explicit catalog — durable stated preference

The catalog answers:

> "When I explicitly think about this individual item, how do I feel about it?"

Explicit Love / Like / Curious / Unsure / exclusion states remain authoritative direct statements.

M12 must never overwrite or reinterpret them.

## This-or-That — current comparative pulse

This-or-That answers:

> "Between the things I am willing to compare, what pulls me more strongly right now?"

That answer is expected to move.

A user may still love two items while their relative order changes substantially between ranking runs.

M12 therefore treats repeated This-or-That sessions as **separate temporal runs**, not as one endlessly accumulating lifetime score.

---

# Core principle

> Starting a new ranking run is not destructive reset.

The current ranking is archived as history, then the user begins a fresh active run.

The app must distinguish:

### Start a new ranking run

- preserve the previous run
- preserve its raw comparisons
- preserve an immutable historical result snapshot
- create a fresh active run
- begin current ranking calculations from no prior-run score evidence
- preserve quizzes
- preserve explicit catalog preferences

### Reset / delete This-or-That data from Settings

- destructive lifecycle operation owned by M9
- delete active and archived This-or-That history when that reset scope is confirmed
- preserve unrelated quiz / explicit-catalog evidence unless separately selected

These actions must not share ambiguous copy.

Recommended action language:

- **Start a new ranking run**
- **Rerank from scratch**
- **Delete This-or-That history** (Settings/destructive context)

---

# Ranking-run vocabulary

## Ranking run

One temporal instance of the This-or-That experience.

A run may contain:

- category comparisons
- category rankings
- Overall comparisons
- Overall ranking
- per-scope confidence/refinement state

There is no requirement that a run reach one absolute "complete" state before it can become history. The existing system intentionally supports Rough Ranking / Pretty Confident / Highly Refined rather than a hard completion threshold.

When the user starts another run, the current state is archived as-is.

## Active run

The only writable run.

New pairwise comparisons belong to the active run.

Only active-run pairwise evidence may contribute to the current M6/M7 ranking channel.

## Archived run

A read-only historical run.

Archived pairwise evidence exists for:

- historical rank comparison
- future trend views
- private backup/restore
- explainability

It must **not** be merged into current ranking scores or current M7 Top Overall evidence.

## Historical snapshot

The rank positions as they existed when a run was archived.

Raw comparisons remain authoritative evidence within the run, but a historical snapshot is intentionally retained as a display anchor so a later:

- catalog expansion
- ranking-algorithm change
- confidence-rule change
- eligibility-rule change

does not silently rewrite what "previously #4" meant.

Historical snapshots are historical presentation records, not a new current scoring source.

---

# Primary user flow

## First run

The user ranks normally.

Example:

```text
OVERALL

#1 Pet Play
#2 Rope Bondage
#3 Praise
#4 Impact Play
#5 Ownership
```

There is no movement indicator because no previous run exists.

## Start a new run

From the This-or-That home/results experience:

```text
Start a new ranking run
```

Confirmation copy should explain the consequence plainly:

```text
Start fresh?

Your current This-or-That rankings will be saved as history.
The new run starts with fresh comparisons.

Your quiz results and catalog preferences will not change.
```

Confirming:

1. archives the active run;
2. captures its comparable category/Overall snapshots;
3. creates a new active run;
4. leaves quiz and explicit catalog data untouched;
5. returns the current ranking state to Not started / Just started as appropriate.

## Second and later runs

Once the new run contains meaningful ranking evidence, results can compare the current rank with the most recent previous comparable run.

Example:

```text
#1 Pet Play          ↑ 2
#2 Rope Bondage      ↓ 1
#3 Praise            —
#4 Ownership         ↑ 3
#5 Collaring         NEW
```

Hover/focus/tap details:

```text
↑ 2
Previously #3
```

or:

```text
↓ 1
Previously #1
```

The visible row should stay compact. The exact prior rank belongs in the movement affordance rather than permanently duplicating two rank columns.

---

# Rank movement semantics

Movement compares **like-for-like scopes only**:

- category rank → previous rank in that same category
- Overall rank → previous Overall rank

Never compare a category rank to an Overall rank.

For a current item:

```ts
delta = previousRank - currentRank
```

Therefore:

- positive delta → moved up
- negative delta → moved down
- zero → unchanged

Examples:

| Current | Previous | Display |
| ---: | ---: | --- |
| #3 | #7 | ↑ 4 |
| #8 | #5 | ↓ 3 |
| #4 | #4 | — |
| #6 | absent | NEW this run |

"NEW this run" means **not ranked in the immediately previous comparable run**. It does not claim the catalog item itself is newly added.

If no previous comparable snapshot exists for that scope, show no movement indicator.

---

# Meaningful-evidence rule

Do not generate movement from default/tied items that have zero ordering evidence.

An item should only participate in rank-history presentation when the existing ranking rules consider it meaningfully ranked for that scope.

This prevents a fresh run from producing hundreds of fake movements caused by default Elo placement or alphabetical tie-breaking.

Likewise, an untouched category in the current run should remain Not started rather than being presented as a giant list of rank changes.

---

# Active-run behavior

Starting a fresh run must actually create a fresh comparative pulse.

Previous-run comparisons:

- are retained;
- remain inspectable/history-capable;
- do not initialize Elo ratings;
- do not increase current comparison counts;
- do not increase current confidence;
- do not affect current pair selection;
- do not directly contribute to the current M7 ranking evidence channel.

The current run may therefore be sparse immediately after restart.

That is honest behavior.

The profile should prefer a temporarily weak/unknown current ranking channel over silently treating old comparative state as current.

---

# Interaction with catalog eligibility

Current explicit catalog state remains authoritative for current eligibility.

Examples:

- a current Hard Limit stays excluded even if it ranked highly in an archived run;
- a current Not Interested item stays excluded;
- a newly eligible item can enter the current run with no historical movement;
- historical snapshots remain intact even when an item is no longer currently eligible.

History records what happened then. Current eligibility controls what may happen now.

---

# Proposed persistence contract

The implementation may choose the exact runtime shape, but the following semantics are required.

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

type RankingRunSnapshots = {
  categories: Record<CategoryId, RankingScopeSnapshot>;
  overall?: RankingScopeSnapshot;
};

type RankingScopeSnapshot = {
  capturedAt: string;
  confidence: number;
  items: Array<{
    catalogId: CatalogId;
    rank: number;
    comparisons: number;
    confidence: number;
  }>;
};

type KinkComparison = {
  id: string;
  runId: string;
  leftKinkId: CatalogId;
  rightKinkId: CatalogId;
  scope: RankingScope;
  result: ComparisonResult;
  timestamp: string;
};
```

The existing flat comparison collection may remain flat if each record gains a stable `runId`.

The important boundary is:

```text
all comparisons
      ↓ filter by activeRunId
current ranking calculation
```

Archived snapshots should not replace raw comparison history.

They preserve the historical rank display while raw comparisons preserve evidence/recalculation capability.

---

# Migration

Current installs already have comparison history but no run identity.

M12 must migrate that data without loss.

Recommended migration:

1. create one initial ranking run;
2. assign all existing comparisons to that run;
3. make it the active run;
4. do not fabricate a previous run;
5. therefore show no movement arrows until the user starts and meaningfully ranks a second run.

The migration must preserve:

- comparison IDs
- timestamps
- scopes
- results
- stable Catalog IDs
- explicit catalog preferences

No current comparison should be duplicated merely to create history.

---

# Current profile integration

M12 changes the temporal meaning of the pairwise source but not the source-aware architecture.

## Current M7 profile

Only the **active run** is current pairwise evidence.

Archived runs must not:

- boost canonical signal evidence;
- change current facet scores;
- change current Top Overall ordering;
- make current pairwise confidence look stronger;
- act as fallback evidence after a new run starts.

## Historical UI

Archived runs may be used for:

- previous-rank arrows
- tooltips/popovers
- future trend charts
- future "consistently top-ranked" summaries

Historical analysis is presentation/inspection unless a future milestone explicitly defines otherwise.

---

# Movement UI contract

## Desktop

The rank row may show:

```text
#4 Ownership    ↑ 3
```

Hovering or keyboard-focusing the movement affordance shows:

```text
Up 3 places
Previously #7
Previous run: Sep 1, 2026
```

## Mobile

Movement details cannot depend on hover.

Tapping/focusing the indicator should expose the same information in a compact popover/details affordance.

## Accessibility

Movement must not be communicated by color alone.

Examples of accessible labels:

- "Up 3 places, previously rank 7"
- "Down 2 places, previously rank 4"
- "Unchanged, previously rank 5"
- "Not ranked in the previous run"

The arrow and signed count may remain the compact visual representation.

---

# History visibility

M12 v1 does **not** need a large analytics dashboard.

Required user-facing history is intentionally small:

- current rank
- up/down/unchanged/new indicator
- previous exact rank on hover/focus/tap
- previous run date when useful

The persistence model should still retain enough information to support a future history view without another destructive storage migration.

Future possibilities:

- rank-over-time line/sparkline
- "consistently Top 10"
- "currently surging"
- "largest movers"
- "dropped from Top 10"
- compare any two runs
- personal notes / run labels

These are explicitly deferred.

---

# Backup, import, reset, and sharing

## Full private backup

M9 full-profile export should include, once M12 exists:

- active ranking run metadata
- archived run metadata
- all raw comparisons with run identity
- historical rank snapshots required to preserve prior-rank presentation

Import must restore the same run relationships.

A storage/export schema version bump is expected if required by the implementation.

## Destructive reset

M9's This-or-That / ranking reset scope should delete:

- active run
- archived runs
- raw comparisons
- historical snapshots

and recreate a clean initial active run as needed.

It must not delete explicit catalog preferences or quiz results unless those scopes are separately selected.

## Share summary

Historical ranking data is private profile history.

The M9 share summary should continue to expose current selected results only.

Do not add:

- old rank lists
- raw movement history
- previous-run dates
- trend analysis

to the default share artifact merely because M12 stores them.

A future explicit share-history option can be scoped separately if useful.

---

# Implementation slices

## M12.1 — Run-aware persistence + migration

- [ ] add stable ranking-run identity
- [ ] associate every comparison with one run
- [ ] migrate existing comparison history into one initial run
- [ ] keep raw comparisons as authoritative evidence within a run
- [ ] add immutable archived rank snapshots
- [ ] version storage/import-export boundaries as required
- [ ] add migration and round-trip tests

**Exit condition:** old installs load without ranking loss and the app can represent one active run plus archived runs.

## M12.2 — Start-new-run lifecycle

- [ ] add a non-destructive Start a new ranking run action
- [ ] explain that current rankings become history
- [ ] archive the current run at any refinement level
- [ ] create a fresh active run
- [ ] preserve quiz and explicit catalog data
- [ ] calculate pair selection/rank/confidence from active-run comparisons only
- [ ] keep M9 destructive reset semantically separate
- [ ] add source-isolation tests

**Exit condition:** the user can rerank from scratch without losing the old result.

## M12.3 — Previous-rank movement indicators

- [ ] compare current results with the most recent previous comparable snapshot
- [ ] show up/down movement count
- [ ] show unchanged state
- [ ] show "NEW this run" only for meaningfully ranked current items absent from the previous comparable run
- [ ] expose exact previous rank on hover/focus/tap
- [ ] support category and Overall result views
- [ ] avoid movement for zero-evidence/default rows
- [ ] add accessible labels and mobile interaction
- [ ] add deterministic delta tests

**Exit condition:** a rerun visibly answers "what moved since last time?"

## M12.4 — Profile/lifecycle integration

- [ ] ensure only active-run pairwise evidence feeds current M6/M7 ranking consumers
- [ ] ensure archived runs never inflate current coverage/confidence
- [ ] include run history in full private backup/restore
- [ ] delete all run history only through explicit destructive reset
- [ ] keep history out of default share-summary exports
- [ ] regression-test catalog exclusions and source isolation across run boundaries

**Exit condition:** temporal ranking history works without changing quiz semantics, explicit catalog truth, or source-aware profile boundaries.

---

# Acceptance scenarios

## Rank rises

Previous Overall:

```text
#7 Ownership
```

Current Overall:

```text
#3 Ownership ↑ 4
```

Details:

```text
Previously #7
```

## Rank falls

Previous category rank:

```text
#2 Cuffs
```

Current category rank:

```text
#5 Cuffs ↓ 3
```

## Same rank

```text
#1 Pet Play —
```

## Not ranked previously

```text
#6 Collaring NEW
```

Details clarify:

```text
Not ranked in the previous run
```

## Fresh restart

Immediately after starting a new run:

- previous history still exists;
- current comparisons are empty;
- current confidence is Not started / Just started;
- no old Elo score leaks into the new run;
- explicit Love / Like / Curious / exclusion states remain unchanged;
- quizzes remain unchanged.

---

# Non-goals

M12 does not:

- turn quiz results into temporal mood scores;
- version explicit catalog preferences into a full audit log;
- average old and new ranking runs together;
- infer why a rank moved;
- make historical rank a new scoring signal;
- build partner comparison;
- build a full trend dashboard;
- upload history to a server.

The first version should do one thing well:

> preserve each comparative pulse, let the user take another one, and make the movement obvious.
