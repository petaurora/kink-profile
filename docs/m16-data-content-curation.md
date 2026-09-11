# M16 — Data & Content Curation

**Status:** active curation program  
**Tracking:** [M16 parent issue #124](https://github.com/petaurora/kink-profile/issues/124) and its GitHub sub-issues  
**Primary boundary:** M16 reviews and refines the app's authored data, taxonomies, labels, mappings, and result dimensions. It may add, remove, merge, rename, re-categorize, or rebalance data points where that improves clarity and usefulness, while preserving stored user data through explicit migrations when identity changes.

GitHub Issues own current M16 scope, progress, and sequencing. This document preserves the durable curation principles and cross-cutting model rules that are useful beside the code.

---

## Goal

Do a deliberate **whole-app data/content sanity pass** after the major product systems exist.

M16 asks:

> **Does each data point still earn its place?**

The goal is not to make the datasets larger. The goal is to make them **cleaner, more coherent, easier to understand, and more useful to rank/profile against**.

Major review surfaces include:

- quiz questions and scoring inputs
- canonical Signal vocabulary and channel semantics
- role/headspace definitions
- contextual/underlying mode compositions
- Overall Facets and their Signal relationships
- catalog items, categories, aliases, and mappings
- rewards/punishments actions and contextual categories
- inferred/default metadata
- labels, descriptions, risk/intensity metadata, and other authored values

---

# Core curation principles

## 1. Nothing is sacred because it already exists

Implemented data is still reviewable. M16 may remove weak concepts, merge near-duplicates, split overloaded concepts, rename unclear terminology, re-categorize items, or rebalance mappings and weights.

Implementation history is not evidence that a concept belongs forever.

## 2. The app is not append-only

External source lists, brainstorming, and earlier milestone assumptions are **inputs**, not obligations.

Prefer:

- fewer useful primitives over exhaustive noisy coverage
- canonical concepts + aliases over duplicate vocabulary rows
- dimensions that produce understandable differences
- questions that discriminate between Signals instead of repeatedly asking the same thing
- labels that mean what the scoring actually measures

## 3. Review semantics before UI polish

If a profile visualization looks wrong, first ask whether the underlying dimension is meaningful, whether the inputs actually measure it, whether the aggregation makes sense, and whether the label describes what is scored.

Do not solve a bad data model by only changing presentation.

## 4. Preserve evidence when identity changes

Existing profile data may already reference catalog IDs, reward/punishment action IDs, Signal IDs, quiz/question versions, ranking scopes, saved recipes, or future contextual-profile IDs.

Do not silently delete or reuse stable IDs. Use explicit aliases, replacement maps, archival states, migration functions, and version bumps when cleanup would otherwise orphan stored data.

## 5. Keep semantic layers separate

The canonical profile hierarchy is:

```text
source evidence
    ↓
canonical Signal + channel
    ├──→ Overall Facets        canonical high-level profile themes
    ├──→ Roles / Headspaces    recognizable role/state compositions
    └──→ Contextual modes      underlying interaction context/composition
```

Overall Facets are the canonical high-level profile dimension system. Contextual modes may remain useful internally or downstream, but they are not a second competing top-level profile taxonomy.

Giving/Receiving is a Signal/activity-side distinction, not Dominant/submissive authority. See [Signal + Channel Model](m16-signal-channel-model.md) and [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md).

---

# Curation Workbench — landed M16.2 behavior

The mobile-friendly Curation Workbench landed through [Issue #116](https://github.com/petaurora/kink-profile/issues/116) and PR #136.

It is the preferred lazy-review surface for authored/derived data that would otherwise require hand-editing source tables or code.

## Current interaction model

The Workbench supports:

- random/surprise review plus filtering by primitive type and review state
- current repo value alongside a local proposed value
- structured editing for scalar fields and relationship mappings
- local proposal state that is separate from the user's preference/profile evidence
- keep/modify/merge/archive/remove review actions where supported
- canonical validation before proposal save/export
- deterministic JSON export for repository handoff

Workbench edits are **proposals**, not profile evidence.

## Canonical Signal authoring

Signal relationships are authored as:

```text
canonical Signal concept
+ channel: overall | receiving | giving
+ weight: 0..1
+ relationship polarity where applicable
```

The Workbench exposes the 37 canonical Signal concepts rather than the old 45 compatibility IDs. Only semantically valid channels are offered, and Overall-only Signals cannot acquire Receiving/Giving channels.

Legacy IDs remain behind source/import compatibility boundaries until broader M16 migration work retires them where safe.

Catalog item/activity-side applicability remains separate from Signal channel semantics.

See [M16 Workbench Signal + Channel Follow-up](m16-workbench-signal-channel-followup.md) for the landed migration details.

## Proposal export / repo handoff

The dedicated proposal export is `m16-curation-export.json`.

The artifact carries the curation workspace schema and proposed entity changes, including mapping changes and lifecycle/replacement metadata where applicable. Review timestamps live on the proposals themselves.

Before export, the complete saved workspace is revalidated against the current canonical editor model. Invalid or stale proposals are blocked.

Export serialization is deterministic: identical workspace state produces identical JSON.

The intended workflow is deliberately simple:

```text
Workbench review
→ export JSON
→ upload / hand the artifact to the repository workflow
→ review the proposal
→ make the corresponding repo source changes in a PR
```

The browser does **not** authenticate to GitHub or mutate the repository directly. A dedicated auto-import/apply script is not required for the Workbench contract; repository edits may be applied during normal review/PR work.

---

# Catalog source distinctions

The catalog's historical `Primary Mode` TSV field is **not** the same thing as the contextual/underlying mode composition layer.

It was descriptive source metadata such as Physical/Psychological, not a canonical scoring construct. The runtime generator and Workbench do not treat it as a profile mode. The TSV column may remain as historical source data until catalog-source cleanup removes it safely.

Catalog items should resolve semantic meaning through canonical Signal mappings rather than adding a parallel direct item → contextual-mode mapping system unless later curation demonstrates a real need.

The catalog is a **decision surface, not an encyclopedia**. A useful retention test is:

> Would a person plausibly answer this differently from the neighboring item?

If not, the row may not deserve an independent ranked identity.

---

# Cross-system semantic hub

**Signal → Overall Facet** is the canonical broad-theme projection path.

Overall Facets are nine broad, non-directional themes. Meaningful primitives should resolve into Overall Facet space through canonical Signals whenever that relationship is honest.

Examples:

- quiz question → Signals → Overall Facets
- role/headspace → Signals → Overall Facets
- contextual mode → Signals → Overall Facets
- catalog category/item → Signal mappings → Overall Facets
- R/P category → Signal mappings → Overall Facets
- R/P action → contextual categories → Signals → Overall Facets

Overall Facet affinity is descriptive/derived profile metadata only. It must not feed back into stored preference evidence.

Do not invent semantic mappings merely to make coverage counters reach 100%. A missing route is a legitimate curation finding.

See [Semantic Data Model](semantic-data-model.md) for the relationship graph.

---

# Active M16 work

Current actionable work is tracked in GitHub rather than duplicated here:

- [#117 — Review quiz banks, weights, and scoring inputs](https://github.com/petaurora/kink-profile/issues/117)
- [#118 — Finish profile semantics refinement](https://github.com/petaurora/kink-profile/issues/118)
- [#119 — Curate and consolidate kink catalog](https://github.com/petaurora/kink-profile/issues/119)
- [#120 — Curate rewards/punishments action library](https://github.com/petaurora/kink-profile/issues/120)
- [#121 — Align cross-system taxonomy and mappings](https://github.com/petaurora/kink-profile/issues/121)
- [#122 — Stable IDs, archival, migration, and compatibility](https://github.com/petaurora/kink-profile/issues/122)
- [#123 — Regression generators + representative-profile sanity review](https://github.com/petaurora/kink-profile/issues/123)

When one of these areas changes durable behavior, distill the surviving rule into the relevant product/data/scoring contract and let the closed Issue/PR preserve implementation history.

---

# M16 closeout invariant

M16 is complete when its GitHub-owned curation slices are complete and the result satisfies these durable expectations:

1. major authored data surfaces have been deliberately reviewed
2. obvious duplicate/noisy concepts have been removed or consolidated
3. quiz inputs align with the Signals they claim to measure
4. Overall Facets, contextual modes, and roles/headspaces have intentional, non-competing meanings
5. catalog and rewards/punishments libraries are intentionally curated rather than merely accumulated
6. cross-system vocabularies are intentionally shared or intentionally separate
7. migrations preserve existing evidence when stable identities change
8. tests/generators/import-export paths pass after cleanup
9. representative profiles remain coherent and explainable
10. the resulting profile is easier to understand and trust

Passing types/tests is necessary but not sufficient. The human-facing question remains:

> **Does the app now describe the same person more coherently than before?**
