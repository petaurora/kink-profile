# M6 C3 — Explicit Preference State Implementation Scope

## Status

**Implemented.**

C1 and C2 are complete on `petaurora/kink-profile/main`.

C3 now adds first-class explicit catalog preference state on top of the existing catalog/ranking flow while preserving the separation between:

- catalog definition
- direct user preference
- pairwise ranking evidence
- inferred affinity

The parent contract remains [M6 Catalog Integration](m6-catalog-integration.md). This document records the implemented C3 contract and acceptance criteria.

Verification for this slice:

- 19 focused tests pass across preference semantics, migration/storage, and eligibility behavior
- production TypeScript/Vite build passes
- runtime catalog generation still reports 551 items / 35 categories / 19 domains / 269 mapped items

---

# Goal

A user should be able to directly classify a catalog item while ranking without turning the catalog into a 551-row checklist.

C3 is complete when:

1. explicit preference state has a stable runtime/storage model
2. existing ranking history migrates losslessly into the new catalog-profile store
3. direct preference edits never create pairwise ranking evidence
4. pairwise choices never create explicit preference state
5. explicit exclusions immediately stop an item from appearing in new comparisons
6. the current comparison UI exposes a small, independent preference editor
7. storage/migration/state-resolution behavior has focused automated tests

---

# In scope

## 1. Canonical explicit state

Add the seven-state runtime vocabulary:

```ts
type CatalogPreferenceState =
  | "love"
  | "like"
  | "curious"
  | "unsure"
  | "not_interested"
  | "hard_limit"
  | "not_applicable";
```

Unanswered remains **absence**, not an eighth state.

Persist per-item state by stable Catalog ID:

```ts
type CatalogItemPreference = {
  overall?: CatalogPreferenceState;
  receiving?: CatalogPreferenceState;
  giving?: CatalogPreferenceState;
  updatedAt: string;
};
```

The C3 UI edits `overall` only.

The receiving/giving fields are included now so directional editing can be added later without changing the storage schema.

## 2. Preference resolution helpers

Provide pure helpers for preference semantics rather than spreading state rules through React.

Required behavior:

```text
generic context:   overall → unanswered
receiving context: receiving → overall → unanswered
giving context:    giving → overall → unanswered
```

Directional values never synthesize an overall value.

Clearing the last stored state removes the item preference record entirely.

Recommended helper boundary:

```ts
getCatalogPreference(preference, context)
setCatalogPreference(profile, catalogId, context, state, updatedAt?)
clearCatalogPreference(profile, catalogId, context)
isExcludedCatalogState(state)
```

Exact names may vary.

## 3. One logical catalog-profile store

Replace the ranking-only application state with:

```ts
type CatalogProfileState = {
  schemaVersion: 1;
  preferences: Record<string, CatalogItemPreference>;
  comparisons: KinkComparison[];
};
```

Storage key:

```text
pet-profile-catalog-v1
```

The existing key remains the legacy migration source:

```text
pet-profile-kink-ranking-v1
```

After migration, application writes go only to the new catalog-profile key.

Do not delete or mutate the legacy key in C3.

## 4. Ranking-history migration

Load order:

1. if a valid `pet-profile-catalog-v1` exists, use it
2. otherwise inspect `pet-profile-kink-ranking-v1`
3. if legacy ranking v1 is valid enough to recover, copy its raw comparisons
4. canonicalize compared item IDs through `kinkCatalogIdReplacements`
5. preserve comparison ID, timestamp, scope, and result
6. initialize `preferences` as empty
7. write the migrated catalog profile
8. if neither source is usable, return an empty catalog profile

Migration must not infer direct preference from ranking history.

Therefore:

- prior left/right wins do not become Love/Like
- Neither does not become Not Interested
- Skip does not become Unsure

Malformed individual records should be ignored rather than allowing one corrupt entry to block the entire profile.

A corrupt **existing new-store value** should not silently re-import legacy state as though migration never happened; fail safe to an empty in-memory profile and leave stored values untouched.

## 5. Explicit ranking eligibility

C3 owns only the eligibility behavior necessary to make direct exclusions authoritative.

Excluded from **new pair selection**:

- `hard_limit`
- `not_interested`
- `not_applicable`

Eligible:

- `love`
- `like`
- `curious`
- `unsure`
- unanswered

Historical comparisons are retained even when an item becomes excluded.

Do not delete or rewrite prior comparison records.

For the current generic ranking flow, overall explicit state controls eligibility. Directional override-specific ranking behavior is deferred until a directional editor/ranking context exists.

Filtering should happen before ranking/pair-selection functions receive the active catalog so the ranking engine remains preference-model agnostic.

The same eligible catalog must feed:

- category pair selection
- category ranking snapshots
- category finalist calculation
- Overall finalist/pair selection

## 6. Contextual comparison-card editor

The current comparison side is itself one large `<button>`.

C3 must refactor each side into a non-button card wrapper because interactive preference controls cannot be nested inside the existing pick button.

Conceptual structure:

```text
comparison card
├── Pick this            ← pairwise ranking action
└── Preference: Unset    ← explicit-state action
    └── editor
        ├── Love
        ├── Like
        ├── Curious
        ├── Unsure
        ├── Not Interested
        ├── Hard Limit
        ├── Not Applicable
        └── Clear
```

Requirements:

- preference editing does not submit a pairwise answer
- selecting Love/Like/Curious/Unsure does not advance the pair
- selecting an exclusion immediately recomputes the active eligible pair
- current overall state is visible on the card when set
- Hard Limit is visually distinct from ordinary Not Interested
- Clear returns the item to unanswered
- editor controls are keyboard-accessible
- avoid a giant global catalog preference form

A compact expandable chip/menu treatment is preferred over nesting another control inside the pick button.

## 7. Empty-pair handling

C3 can reduce an active scope below two eligible items.

The UI must not silently render an empty hole when `selectNextPair` returns null.

Show a small completed/no-more-eligible-items state with appropriate navigation:

- view the current ranking when meaningful
- move to another category
- return to categories from Overall

Do not invent ranking evidence merely to keep the session running.

## 8. Focused tests

C3 introduces persistence and migration behavior that should not rely only on manual UI testing.

Add the smallest test setup necessary for pure state/storage tests.

Recommended: Vitest in node mode with an injected/fake Storage implementation rather than a browser DOM dependency.

Minimum automated cases:

### Preference semantics

- unanswered resolves to undefined
- overall resolves in generic/receiving/giving contexts
- receiving override beats overall only for receiving
- giving override beats overall only for giving
- directional overrides never synthesize generic overall
- clearing the last value removes the record
- excluded-state helper recognizes exactly Hard Limit / Not Interested / Not Applicable

### Storage/migration

- empty storage returns empty catalog profile
- valid new store wins over legacy
- legacy comparisons migrate losslessly
- replacement Catalog IDs are canonicalized
- preferences initialize empty during legacy migration
- migration never derives preferences from comparison result
- migrated state writes only the new key
- legacy key remains untouched
- corrupt legacy data falls back safely
- corrupt individual legacy comparisons do not destroy otherwise valid history
- corrupt existing new-store data does not trigger a fresh legacy import

### Eligibility integration

- excluded catalog items are absent from active category pairs
- excluded items do not enter newly derived finalists
- historical comparisons remain stored after exclusion
- clearing an exclusion makes the item eligible again

C4 retains the ranking-algorithm test work for Skip/Neither confidence and finalist evidence thresholds.

---

# Expected code touchpoints

Likely files:

```text
src/lib/catalogProfile.ts               new: preference types + pure helpers
src/lib/catalogProfileStorage.ts        new: v1 persistence + legacy migration
src/lib/kinkRankingStorage.ts           retired or reduced to legacy migration types/constants
src/KinkThisOrThat.tsx                  load/save new profile + eligibility + editor UI
src/styles.css                          preference-card/editor/empty-state styles
package.json                            minimal test command/dependency
.github/workflows/ci.yml                run focused tests in CI
```

The exact split between `catalogProfile.ts` and `catalogProfileStorage.ts` is flexible; keep pure semantics separate from React.

Do not move catalog definitions or signal mappings into user-state files.

---

# Explicit non-goals

C3 does **not** include:

- directional preference editing UI
- preference controls on ranking-result rows
- catalog-wide searchable browser
- hard-limit/exclusion summary pages
- Skip/Neither confidence fixes
- finalist evidence thresholds
- persisted Overall candidate pool
- broad ranking algorithm changes
- inferred catalog affinity
- M7 cross-quiz aggregation
- export/import/share
- cloud persistence

Those remain C4–C10 as already scoped.

---

# Implementation order

## C3.1 — State + storage

- add canonical types/helpers
- add `pet-profile-catalog-v1`
- implement migration from ranking v1
- add storage/migration tests

Exit: existing users retain raw ranking history and new users get an empty catalog profile.

## C3.2 — Eligibility integration

- derive an eligible catalog from explicit overall state
- feed eligible items into category ranking/pair selection/finalists/Overall
- retain historical comparisons
- add eligibility tests

Exit: exclusions are authoritative for all newly generated pairs.

## C3.3 — Contextual editor

- refactor comparison sides into wrapper + separate pick action
- add preference trigger/editor
- expose current state
- distinguish Hard Limit
- handle pair invalidation after exclusion
- add no-pair empty state

Exit: a user can classify either currently displayed item without accidentally recording a comparison.

## C3.4 — Verification + docs

- run tests
- run production build
- manually verify migration with representative legacy localStorage
- manually verify mobile comparison-card interaction
- update C3 checklist/status only after behavior is verified

---

# Acceptance scenarios

## Existing ranking user

Given legacy ranking history exists and the new catalog-profile key does not:

- opening ranking preserves the same raw comparison records
- no explicit preferences are invented
- the new catalog-profile key is created
- future comparisons save only into the new store

## Explicit positive preference

Given Rope Bondage is currently displayed:

- mark it Like
- the card shows Like
- no comparison record is added
- the same pair may remain available until the user makes a ranking choice

## Explicit exclusion

Given Rope Bondage is currently displayed:

- mark it Hard Limit
- no comparison record is added
- Rope Bondage disappears from newly generated pairs
- prior Rope Bondage comparison history remains stored
- Hard Limit is visibly different from Not Interested

## Clear

Given an item is Not Interested:

- choose Clear
- the explicit preference record is removed when no directional fields remain
- the item becomes eligible for new generic comparisons again

## Scope exhaustion

Given only one eligible item remains in a category:

- no invalid comparison is rendered
- the user sees a clear no-more-eligible-items state
- navigation remains usable

---

# C3 exit condition

C3 is complete when explicit preference is a durable, independently editable user signal; ranking history migrates safely; exclusions control new ranking eligibility; the comparison UI supports direct classification without nested-interaction problems; and the behavior is covered by focused tests.

At that point M6 moves to **C4 — Ranking hardening**.
