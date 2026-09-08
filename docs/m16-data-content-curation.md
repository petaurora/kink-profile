# M16 — Data & Content Curation

**Status:** planned  
**Roadmap milestone:** M16  
**Primary boundary:** M16 reviews and refines the app's authored data, taxonomies, labels, mappings, and result dimensions. It may add, remove, merge, rename, re-categorize, or rebalance data points where that improves clarity and usefulness, while preserving stored user data through explicit migrations when identity changes.

---

## Goal

Do a deliberate **whole-app data/content sanity pass** after the major product systems exist.

The app has accumulated useful primitives across multiple milestones:

- quiz questions
- quiz signal weights
- signal vocabulary
- role/headspace definitions
- dynamic-mode/radar dimensions
- overall-profile facets
- catalog items and categories
- catalog aliases and signal mappings
- rewards/punishments actions and contextual categories
- inferred/default metadata
- labels, descriptions, risk/intensity metadata, and other authored values

M16 asks:

> **Does each data point still earn its place?**

The goal is not to make the datasets larger.

The goal is to make them **cleaner, more coherent, easier to understand, and more useful to rank/profile against**.

---

# Core curation principles

## 1. Nothing is sacred because it already exists

Implemented data is still reviewable.

M16 may:

- remove a weak or confusing data point
- merge near-duplicates
- split an overloaded concept
- rename unclear terminology
- re-categorize an item
- change a mapping
- change a weight
- change which dimensions appear on a radar
- remove a radar dimension that does not communicate something useful
- add a missing dimension when the current model collapses meaningfully different concepts

Implementation history is not evidence that a concept belongs forever.

## 2. The app is not append-only

External source lists, brainstorming, and earlier milestone assumptions are **inputs**, not obligations.

Prefer:

- fewer useful primitives over exhaustive noisy coverage
- canonical concepts + aliases over duplicate vocabulary rows
- dimensions that produce understandable differences
- questions that discriminate between signals instead of repeatedly asking the same thing
- labels that mean what the scoring actually measures

## 3. Review semantics before UI polish

If a radar looks wrong, first ask whether:

- the underlying dimension is meaningful
- the inputs actually measure it
- the aggregation makes sense
- the label accurately describes it

Do not solve a bad data model by only changing presentation.

## 4. Preserve evidence when identity changes

Existing profile data may already reference:

- Catalog IDs
- reward/punishment action IDs
- signal IDs
- quiz IDs/question versions
- ranking scopes
- saved recipes
- future contextual-profile IDs

Do not silently delete or reuse stable IDs.

Use explicit aliases, replacement maps, archival states, migration functions, and version bumps when cleanup would otherwise orphan stored data.

---

# M16.1 — Inventory + review rubric

Create a single inventory of authored/derived data surfaces that need human review.

Include at minimum:

- M2 D/s questions + weights
- M3 Roles & Headspaces questions, role definitions, and dynamic modes
- M4 B&D questions + weights
- M5 S/M questions + weights
- shared SignalId vocabulary
- radar/facet dimensions
- M7 aggregation labels and thresholds
- M6 kink catalog + categories + aliases + mappings
- pending catalog additions
- M11 rewards/punishments action library + contextual categories + mappings
- inferred/default metadata used to propose values
- any user-facing explanatory labels tied to those models

Use a lightweight review rubric for each primitive:

- **distinct?** — meaningfully different from neighboring concepts?
- **useful?** — does keeping it improve a decision, profile, ranking, or explanation?
- **clear?** — would a user understand what is being asked/displayed?
- **measurable?** — do we actually have evidence capable of estimating it?
- **balanced?** — is it over/underrepresented compared with adjacent concepts?
- **mapped correctly?** — are its relationships/weights defensible?
- **stable enough?** — can it retain identity or does it require migration?
- **worth the interaction cost?** — especially for catalog sorting and quizzes

---

# M16.2 — Curation Workbench

Build a lightweight, mobile-friendly review surface inspired by the M11 quick sorter so data cleanup can happen gradually instead of requiring a giant spreadsheet/code-editing session.

## Core interaction

The workbench should support:

- **Surprise me** — show a random reviewable primitive
- filter by primitive type and review state
- skip / defer / mark reviewed without changing data
- edit the primitive's own fields
- edit the relationships/mappings that make that primitive meaningful
- show validation warnings and derived consequences before saving
- preserve a local review queue/history so the user can do a few items at a time
- compare current repo value vs local proposed value
- revert one field, one item, or the whole local curation session

Initial primitive types should include:

- kink/catalog item
- reward/punishment action
- quiz question
- signal
- dynamic mode
- role/headspace
- overall facet/radar dimension
- catalog category/domain/alias/mapping
- M11 contextual category/mapping
- quiz definition

As M13–M15 land, the same workbench should be extensible to scene themes, contextual-activity capability metadata, motivations, and shared-profile interaction mappings.

## Relationship editor

A primitive card should not be limited to scalar fields.

Examples:

- kink → category, aliases, signal mappings + weights
- reward/punishment action → contextual categories + weights
- question → SignalId weights
- dynamic mode/headspace → SignalId composition weights
- overall facet → SignalId weights + optional direction
- catalog category → domain, display order, default signal mappings
- M11 category → display order/version and catalog-category mappings

Multi-value relationships should use searchable chips/rows with explicit weights rather than encoded strings.

## Current catalog-mode distinction

The catalog's existing `Primary Mode` field is **not** the same thing as M3 Dynamic Modes.

Today:

- `Primary Mode` is a single descriptive catalog field such as Physical/Psychological.
- a catalog item may resolve to **multiple SignalId mappings** through category + item mappings.
- M3 Dynamic Modes are composed definitions calculated from SignalIds; kinks are not directly assigned one or more Dynamic Modes.

The workbench should show this distinction clearly.

During M16, explicitly review whether `Primary Mode` should remain a single descriptive string, become a controlled multi-value taxonomy, or be replaced by better structured metadata.

Do not add direct kink → Dynamic Mode mappings merely for convenience unless the curation pass finds a real semantic need. Prefer the existing signal graph when it can express the relationship without creating a second competing mapping system.

## Local curation state

Workbench edits are **proposals**, not profile evidence.

Store them separately from the user's kink/reward/punishment profile.

Conceptually:

~~~ts
interface CurationChange {
  entityType: string;
  entityId: string;
  action: 'keep' | 'modify' | 'merge' | 'archive' | 'remove';
  changes?: Record<string, unknown>;
  replacementId?: string;
  note?: string;
  reviewedAt: string;
}

interface CurationWorkspace {
  schemaVersion: number;
  sourceRevision?: string;
  changes: CurationChange[];
}
~~~

The workbench must never make a curation edit look like a user preference answer.

## Export / repo handoff

Provide a dedicated export such as:

`m16-curation-export.json`

It should contain:

- schema/version
- optional source revision/catalog version
- entity IDs/types
- proposed field changes
- proposed mapping changes
- merge/archive/remove decisions
- replacement IDs where applicable
- curator notes
- review timestamps/status

The exported file is intended to be uploaded back to the repository workflow and applied through a deterministic script or reviewed PR.

Do not require the browser to authenticate to GitHub or mutate the repo directly.

---

# M16.3 — Quiz bank + scoring review

Review the authored questions and scoring inputs for M2–M5.

Check for:

- duplicate or near-duplicate questions
- questions that accidentally measure multiple unrelated things
- signals with too few or too many questions
- wording that pushes toward a socially desirable answer
- unclear giving/receiving semantics
- accidental Dom/sub vs giving/receiving conflation
- weights that produce unintuitive outcomes
- questions that no longer match the current signal vocabulary
- questions that should be removed rather than rewritten

After changes:

- re-run synthetic scoring scenarios
- compare expected vs actual results
- document intentional score shifts
- version quiz definitions when stored completion/results require it

---

# M16.4 — Signals, headspaces, radars + profile dimensions

Review what the app claims to measure and display.

Audit:

- SignalId vocabulary
- Roles & Headspaces
- Dynamic Modes
- D/s, B&D, and S/M result dimensions
- M7 overall facets
- radar axes
- strength labels / thresholds
- cross-source aggregation mappings

Questions to answer:

- are any axes redundant?
- are some axes too abstract to be useful?
- are related but distinct concepts incorrectly collapsed?
- is a displayed percentage supported by enough evidence?
- does the label describe the underlying evidence?
- should some values be ranked lists rather than radar axes?
- are there dimensions that belong only in a detailed view rather than the headline profile?

The correct result may be to add, remove, merge, rename, reorder, change mapping/weighting, or change presentation type.

---

# M16.5 — Kink catalog curation

Review both:

- reference/catalog/kink-catalog.tsv
- reference/catalog/source-additions-2026-09-08.tsv

Tasks:

- selectively merge useful pending additions
- audit the full catalog for duplicates and near-duplicates
- identify overly granular/source-driven rows
- remove items that do not create a useful independent preference/ranking decision
- consolidate terminology through aliases where appropriate
- review category assignment
- review Typical Role / Primary Mode / Intensity / Risk Level metadata
- review category-default and item-specific signal mappings
- identify missing concepts only after pruning/normalization
- preserve stored profile/ranking history for retired or merged IDs

The catalog is a **decision surface**, not an encyclopedia.

A useful test:

> Would a person plausibly answer this differently from the neighboring item?

If not, it may not deserve a standalone ranked row.

---

# M16.6 — Rewards & punishments data curation

Review the M11 action library and contextual taxonomy with the same standards as the kink catalog.

Audit:

- normalized reward/punishment actions
- duplicates inherited from source reference sheets
- actions that should link to an M6 catalog item instead of existing separately
- action variants that are genuinely contextually distinct
- contextual categories
- category weights
- inferred/default suitability proposals
- labels/descriptions
- randomizer eligibility metadata
- builder usefulness
- **recipe-builder UX/model review** — revisit the M11.7 builder as a product surface, not just its recipe data:
  - identify missing fields, actions, and composition flows discovered during real use
  - review whether primitive search/add, inferred suggestions, custom recipe-local text, ordering, notes, tags, and save/edit/duplicate/delete are the right interaction model
  - review mobile density and whether the builder is too long/busy or hides important context
  - review component editing/reordering ergonomics and whether recipe steps need richer per-component metadata
  - review Needs review / warning presentation and recovery flows
  - review saved-recipe cards, recipe discoverability, naming, and organization
  - remove controls or concepts that technically work but do not earn their interaction cost
  - preserve the non-recursive recipe boundary unless real usage demonstrates a need to change it

Important:

> The original reward and punishment sheets are source material, not a required runtime inventory.

M16 may remove or consolidate actions even after M11 has normalized them.

Do not keep an action merely because it appeared in a source spreadsheet.

---

# M16.7 — Cross-system taxonomy alignment

Review shared concepts across M2–M7, M11, M13, M14, and M15 so the app does not grow parallel vocabularies for the same idea.

Examples:

- restraint
- control
- structure
- service
- devotion
- pain/intensity
- sensory play
- anticipation
- humiliation
- care/nurture
- primal
- ownership/belonging

Check whether each system should:

- share one canonical concept
- map between different context-specific concepts
- remain intentionally separate

Do **not** merge terms solely because they sound similar.

Do merge/align when duplicate taxonomies would cause contradictory profile behavior.

---

# M16.8 — Migration + identity cleanup

Before deleting or consolidating any stable primitive:

- inspect whether persisted profile data can reference it
- define replacement/archival behavior
- migrate stored values explicitly
- preserve historical ranking evidence where meaningful
- avoid reusing old IDs for new semantics
- update import/export compatibility
- add fixture coverage for old profiles

This slice owns the mechanics needed to safely apply the curation decisions made earlier in M16.

---

# M16.9 — Validation + regression review

After curation:

- run all generators
- run schema validation
- run mapping validation
- run unit/integration tests
- test import/export migration
- inspect representative quiz results
- inspect representative overall profiles
- inspect radar shapes/labels
- inspect catalog filtering/ranking
- inspect reward/punishment sorting and proposals
- verify no retired IDs leak into current UI
- update counts/documentation that became stale

Also perform a human-facing sanity review:

> Does the app now describe the same person more coherently than before?

Passing types/tests is necessary but not sufficient.

---

# Non-goals

M16 is not primarily:

- a new scoring architecture
- a new UI redesign milestone
- an effort to maximize the number of catalog/actions/questions
- a broad new research sweep
- an excuse to rewrite stable code that already models the desired semantics

Implementation changes are expected where curation requires them, but the milestone is driven by **content/model quality**, not refactoring for its own sake.

---

# Exit condition

M16 is complete when:

1. every major authored data surface has been deliberately reviewed
2. obvious duplicates/noise have been removed or consolidated
3. quiz questions and weights align with the signals they claim to measure
4. radar/profile dimensions are useful, distinct, and accurately labeled
5. catalog contents have been curated rather than merely accumulated
6. rewards/punishments data has been curated rather than merely imported
7. cross-system vocabularies are intentionally shared or intentionally separate
8. migrations preserve existing user evidence when stable identities change
9. tests/generators/import-export paths pass after the cleanup
10. the resulting profile is easier to understand and trust
