# M6 C3 — Explicit Preference + Catalog Table

## Status

**Re-scoped for review after browser validation of the first contextual-editor implementation.**

The C3 data model remains useful, but the original plan to edit explicit preference directly on This-or-That comparison cards overloaded the ranking experience.

This document replaces that UX direction.

---

# Product framing

The catalog has one stable identity layer and multiple independent kinds of user evidence.

```text
CATALOG ITEM
stable Catalog ID
      │
      ├── definition metadata
      │   label / category / aliases / description / direction / risk
      │
      ├── explicit preference
      │   Love / Like / Curious / Unsure / Not Interested / Hard Limit / N/A
      │
      ├── category pairwise evidence
      │   comparisons → derived category ranking
      │
      ├── overall pairwise evidence
      │   comparisons → derived overall ranking
      │
      └── inferred affinity (later)
          quiz signals → exploration suggestion
```

These layers are interconnected through **Catalog ID**, not by silently converting one kind of evidence into another.

Example:

```text
rope-bondage
├─ explicit preference: Like
├─ category rank: #2
└─ overall rank: #11
```

The user can edit the explicit state directly while the ranking remains independently derived from pairwise history.

---

# This-or-That is a mini-game

The pairwise flow exists because comparing two things is often easier and more revealing than independently assigning a score to hundreds of items.

Its product job is:

- reduce catalog fatigue
- make preference discovery playful
- establish relative ordering
- help a user notice preferences through contrast
- progressively refine category and overall favorites

It should feel like:

> Which one am I more into?

It should **not** also feel like:

> Please maintain a profile record while answering this comparison.

Therefore C3 removes explicit-preference editing from active This-or-That cards.

The comparison UI remains focused on:

- left
- right
- both / equal
- neither
- skip / don't know

Pairwise interaction never automatically writes an explicit preference.

---

# Direct preference management is a catalog table

Explicit preference needs its own first-class surface.

The initial direct-management experience is a searchable/filterable catalog table or table-like list.

The surface is not a required questionnaire and must not imply that all 551 items need to be classified.

## Desktop shape

Conceptually:

```text
┌─────────────────────┬──────────────────┬───────────────┬─────────────────┐
│ Kink                │ Category         │ Preference    │ Ranking context │
├─────────────────────┼──────────────────┼───────────────┼─────────────────┤
│ Rope bondage        │ Bondage          │ Like          │ Cat #2 · Ov #11 │
│ Praise              │ Praise / Humil.  │ Love          │ Cat #1 · Ov #3  │
│ Blood play          │ Edge play        │ HARD LIMIT    │ —               │
│ Wax play            │ Sensory          │ Not set       │ Cat #7          │
└─────────────────────┴──────────────────┴───────────────┴─────────────────┘
```

Exact columns may be tuned during implementation.

## Mobile shape

Do not force a wide HTML table onto a phone.

The same data should collapse into compact stacked rows:

```text
Rope bondage
Bondage & Restraint
[ Like ▾ ]       Cat #2 · Overall #11
──────────────────────────────────────
Praise
Praise, Degradation & Humiliation
[ Love ▾ ]       Cat #1 · Overall #3
```

The interaction model remains table/list management even when presentation becomes responsive cards/rows.

---

# Table v1 requirements

## Search

Search should match:

- canonical label
- aliases

Description search can be added if useful but is not required for v1.

Search is client-side against generated catalog data.

## Filters

Initial filters:

- category
- explicit state
- unanswered / not set

Useful state shortcuts may include:

- Positive: Love / Like
- Explore: Curious / Unsure
- Excluded: Not Interested / Hard Limit / Not Applicable
- Not set

Do not require a category dropdown if a more visible filter treatment works better. The exact filter control can be tuned in implementation.

## Ordering

Default ordering:

1. category `displayOrder`
2. item label

The table may group rows by category.

Future sorting by explicit state or rank is optional.

## Preference editor

Each row exposes one compact editable preference cell/control.

Canonical values:

- Love
- Like
- Curious
- Unsure
- Not Interested
- Hard Limit
- Not Applicable
- Clear / Not set

Changing a preference:

- updates only explicit preference state
- does not record a pairwise comparison
- does not modify Elo/ranking evidence
- immediately affects ranking eligibility when the new state is an exclusion

Hard Limit must remain visually distinct from ordinary disinterest.

## Details

A user may need context before assigning a state.

Rows should support an expandable/detail treatment exposing useful catalog metadata such as:

- description
- aliases
- normalized direction
- primary mode
- intensity
- risk/context metadata where present

The default row should remain compact.

---

# Ranking context in the table

The table and ranking system are connected through the same stable Catalog ID.

Ranking context is **derived/read-only** on the table.

Possible v1 display:

- category rank when category evidence exists
- overall rank when Overall evidence exists
- otherwise blank / not ranked

Confidence/comparison-count detail may appear in expanded details rather than making the primary table noisy.

Important:

- ranking context does not overwrite explicit state
- explicit positive state does not seed or boost ranking
- an unanswered item can still have ranking evidence
- a Love item can still be relatively low-ranked among other loved items
- a Hard Limit / Not Interested / Not Applicable item is excluded from new pairs but historical pairwise history is retained

C4 remains responsible for making ranking confidence and finalist promotion trustworthy.

---

# Shared user-state model

C3 still uses one logical catalog-profile store:

```ts
type CatalogProfileState = {
  schemaVersion: 1;
  preferences: Record<CatalogItemId, CatalogItemPreference>;
  comparisons: KinkComparison[];
};
```

Storage key:

```text
pet-profile-catalog-v1
```

This does **not** mean explicit preference and ranking are the same signal.

They share one persistence envelope because both refer to the same catalog identities and should migrate/export together.

Their semantics remain independent.

---

# Explicit preference model

Canonical state:

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

Unanswered is absence.

Per-item record:

```ts
type CatalogItemPreference = {
  overall?: CatalogPreferenceState;
  receiving?: CatalogPreferenceState;
  giving?: CatalogPreferenceState;
  updatedAt: string;
};
```

The initial table edits `overall`.

Directional overrides remain supported by the storage contract but directional editing UI is not required for C3 v1.

Resolution remains:

```text
generic:   overall → unanswered
receiving: receiving override → overall → unanswered
giving:    giving override    → overall → unanswered
```

Directional overrides never synthesize an overall state.

Clearing the final explicit value deletes the preference record.

---

# Migration

When `pet-profile-catalog-v1` does not exist:

1. inspect `pet-profile-kink-ranking-v1`
2. preserve valid raw comparison records
3. canonicalize Catalog IDs through C1 replacement mappings
4. initialize explicit preferences empty
5. write the new catalog-profile store
6. leave the legacy ranking key untouched during the migration window
7. write only the new key afterward

Never infer explicit state from old pairwise history.

Examples:

- prior win ≠ Love
- Neither ≠ Not Interested
- Skip ≠ Unsure

Malformed/corrupt legacy records should not block the entire application.

---

# Explicit state and mini-game eligibility

The one intentional behavior crossing explicit preference into ranking is **eligibility**.

Exclude from new This-or-That pairs:

- Hard Limit
- Not Interested
- Not Applicable

Remain eligible:

- Love
- Like
- Curious
- Unsure
- unanswered

Historical comparison records are retained after exclusion.

Clearing an exclusion makes the item eligible again.

Positive manual preference never changes rank.

---

# Navigation

The catalog should become a first-class destination alongside the ranking mini-game.

Conceptually:

```text
KINK CATALOG
├─ Browse / Preferences      ← table
└─ This or That              ← ranking mini-game
```

These may initially be two clearly separate entry points from the catalog/ranking area rather than tabs if that keeps mobile navigation cleaner.

The table should not be hidden inside the This-or-That flow.

---

# C3 implementation slices

## C3.1 — Shared state + migration

- canonical seven-state preference model
- direction-capable preference record
- unified catalog-profile storage
- legacy pairwise-history migration
- C1 ID replacement canonicalization
- focused state/storage tests

## C3.2 — Table foundation

- catalog/preferences destination
- search by label + alias
- category/state filters
- category-order grouping/sorting
- responsive desktop table / mobile rows
- compact overall-preference editor
- expandable metadata/details

## C3.3 — Ranking interconnection

- derive category/overall ranking context by Catalog ID
- display useful read-only ranking context in table
- explicit exclusions filter new pair generation
- historical comparisons remain intact
- remove preference editor from This-or-That cards

## C3.4 — Verification

- focused state/storage/eligibility tests
- production build
- browser/mobile validation of table usability
- verify This-or-That remains simple after explicit editor removal
- update docs/status only after validation

---

# Post-C3 evidence boundary

C3 intentionally stores the two forms of **direct catalog evidence** it owns:

- explicit preference by stable Catalog ID/direction
- raw pairwise comparison history

It does **not** need to solve the larger profile-convergence problem while this slice is under implementation.

After C3 lands, M6 C4 introduces the source-aware evidence layer described in [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md).

That cleanup will allow the same Catalog ID to expose, simultaneously:

- quiz-derived inferred affinity
- direct explicit preference
- pairwise ranking evidence
- a derived/resolved presentation view

without converting one source into another.

Important compatibility rules:

- quiz inference must never be written into C3's explicit preference as though the user chose it
- C3 raw comparisons remain the durable ranking evidence source
- quiz retakes must not erase C3 explicit/ranking evidence
- future catalog → signal back-projection may consume **independent** explicit/pairwise evidence, never catalog affinity inferred from those signals
- C4 should prefer adapters/selectors around C3's store over unnecessary persistence churn

This keeps C3 a clean direct-preference/ranking foundation while leaving the profile free to become source-aware afterward.

---

# C3 non-goals

Do not add in this slice:

- requirement to classify all 551 rows
- preference completion percentage as a goal
- pairwise choices auto-writing explicit states
- explicit positive states seeding Elo/ranking
- directional preference editing UI
- bulk spreadsheet import
- C5 confidence fixes
- C5 finalist-promotion thresholds
- persisted Overall candidate pool
- inferred affinity
- M7 cross-source profile aggregation
- cloud persistence

---

# Acceptance scenarios

## Manual preference

Given Rope Bondage appears in the catalog table:

- set preference to Like
- table shows Like
- no comparison is created
- its existing category/overall ranking remains unchanged

## Ranking-only evidence

Given Praise has pairwise history but no explicit state:

- table may show its derived rank
- preference remains Not set
- no explicit state is inferred

## Exclusion

Given an item is marked Hard Limit in the table:

- Hard Limit is visually distinct
- prior comparisons remain stored
- the item does not appear in newly generated This-or-That pairs
- rank history may remain visible as historical/derived context if useful

## Clear

Given an item is Not Interested:

- clear the explicit value
- the final preference record is removed when no directional values remain
- the item becomes eligible for future pairs again

## Discovery through mini-game

Given two unanswered items appear in This-or-That:

- user chooses one over the other
- ranking evidence updates
- neither receives a manual preference state
- the user may later open the table and explicitly classify either item

---

# C3 exit condition

C3 is complete when the user has two coherent ways to work with the same catalog:

1. **Catalog table** for direct explicit preference management
2. **This-or-That mini-game** for low-friction comparative discovery and ranking

Both operate on the same stable Catalog IDs, share one catalog-profile persistence envelope, remain semantically independent, and intentionally interact only where explicit exclusions control future ranking eligibility.
