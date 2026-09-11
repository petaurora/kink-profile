# Curation Workbench

The Curation Workbench is the in-app authoring/review surface for repository-owned product data and semantic mappings.

It exists so curation can happen in small, mobile-friendly sessions without requiring direct TSV/TypeScript surgery for every proposed change.

## Product boundary

> **The Workbench edits a local proposal workspace. It does not directly mutate repository source files or user preference evidence.**

The workflow is:

```text
repository-authored current values
        ↓
Workbench review
        ↓
local proposal workspace
        ↓
validation
        ↓
deterministic JSON export
        ↓
repo review / implementation
```

The browser does not write proposed curation changes directly to GitHub.

## What the Workbench reviews

The current inventory supports these canonical primitive types:

- catalog items
- catalog categories
- reward/punishment actions
- reward/punishment contextual categories
- quiz questions
- quiz definitions
- canonical Signals
- contextual/dynamic modes
- roles/headspaces
- Overall Facets

Some additional surfaces may be inventoried as source-only or later work without becoming editable merely because they are listed.

`src/data/curationInventory.ts` is the current inventory/source map.

## Review principle

The Workbench is a semantic/content curation tool, not an append-only editor.

A curator may decide that an existing concept should be:

- kept
- modified
- merged
- archived
- removed

The review rubric currently asks whether a primitive is distinct, useful, clear, measurable, balanced, mapped correctly, stable enough, and worth its interaction cost.

Existing data is not protected from review merely because it already ships.

## Current value vs proposed value

The repository/runtime definition remains the current source value.

Workbench changes are stored separately as a proposal. Editing a proposal must not make the proposed value appear as if it is already the canonical repository definition.

This distinction matters because a curator should be able to:

- stop midway through a review;
- return later;
- discard one proposal without altering the runtime source;
- export only reviewed changes;
- compare current and proposed semantics before implementation.

## Local workspace contract

The current workspace schema is version 2 and is stored locally under the Curation Workbench storage key.

Conceptually:

```ts
type CurationWorkspace = {
  schemaVersion: number;
  sourceRevision?: string;
  changes: CurationChange[];
};
```

Each change is keyed by stable entity type + entity ID and records:

- review action;
- structured changed fields when applicable;
- replacement ID for merge/replacement workflows when applicable;
- curator note when present;
- reviewed timestamp.

Workspace changes are sorted deterministically by entity identity.

The Workbench workspace is **not profile data**. It must not become quiz/catalog/reward preference evidence or influence a user's derived profile merely because a curation proposal exists locally.

## Canonical Signal authoring

New Workbench Signal relationships use the normalized Signal + channel model.

Conceptually:

```ts
type CurationSignalRef = {
  signalId: CanonicalSignalId;
  channel: "overall" | "receiving" | "giving";
  weight: number;
};
```

Rules:

1. the Signal ID must be a current canonical Signal;
2. `overall` is always available;
3. Receiving/Giving are available only when the Signal definition supports that channel;
4. weights must be finite, greater than 0, and no more than 1;
5. legacy directional Signal IDs may be accepted through compatibility adapters but are not new authoring targets;
6. the deprecated generic `direction` field must not appear in new proposal output.

Human-facing directional labels come from the Signal definition rather than generic picker text where possible.

See [Signal + Channel Data Model](../data-model/signal-channel-model.md).

## Signal → Overall Facet review

Overall Facets are broad themes. For Signal/facet review, every facet should be visible so a curator can intentionally classify the complete conceptual relationship without creating a second hidden mapping table.

Each Signal/facet pair is one of:

- **Supports** — stronger affinity for the Signal positively supports the theme;
- **Neutral** — the Signal does not meaningfully define the theme;
- **Opposes** — stronger affinity for the Signal works against the theme.

Non-neutral relationships carry a bounded weight.

Runtime facet definitions are sparse: an omitted pair is Neutral. The Workbench may render all facets for review while still exporting only meaningful authored relationships.

Support/Oppose/Neutral is semantic relationship direction. It is unrelated to Signal Receiving/Giving channel and unrelated to Dominant/submissive authority.

## Catalog applicability is not a Signal channel

Catalog source data may contain applicability such as:

```text
any
receiving
giving
```

That field describes **where a catalog mapping applies**. It is not the canonical Signal channel itself.

The Workbench preserves these as separate concepts so a curator can edit both without conflating them:

```text
Catalog mapping applicability
        ≠
Canonical Signal channel
```

Compatibility adapters may still understand old fields, but proposal output should use the canonical distinction.

## Rewards & Punishments mappings

Reward/Punishment actions and categories participate through their own contextual taxonomy.

The Workbench may review:

- action identity/content;
- contextual category membership/weights;
- category → canonical Signal bridges;
- catalog-category compatibility bridges.

R/P actions do not receive a second hand-authored Overall Facet truth. Their broader semantic projection should flow through canonical Signals and then into Overall Facets.

## Roles, headspaces, and contextual modes

Roles/headspaces and contextual modes are reviewable composed definitions.

They remain distinct from:

- canonical Signal identity;
- Overall Facets;
- direct user preference evidence.

Contextual modes are underlying/composed lenses for downstream context, not another competing top-level profile taxonomy.

Their authored compositions should reference canonical Signal + optional supported channel rather than recreating legacy directional IDs.

## Validation before export

A proposal must validate before it can be exported.

Validation should reject structurally or semantically impossible data rather than emitting a file that appears review-ready.

Examples include:

- unknown entity identities where a stable ID is required;
- unknown canonical Signal IDs;
- unsupported Signal channels;
- out-of-range or non-finite weights;
- deprecated fields that new schema output must not contain;
- malformed merge/replacement relationships;
- invalid relationship states.

Validation rules live in the Curation Workbench model/validation modules and should be covered by tests when expanded.

## Deterministic export

Workbench export is a **proposal artifact**, not a repository patch.

The current exported shape is derived only from workspace state:

```json
{
  "schemaVersion": 2,
  "sourceRevision": "optional-source-revision",
  "changes": []
}
```

Important rules:

- changes are sorted deterministically;
- identical workspace state should produce identical exported JSON;
- do not add wall-clock export metadata that makes identical proposals diff differently;
- exported changes retain stable entity identities;
- new exports use canonical Signal + channel semantics;
- export does not imply the proposal has been accepted or applied to repository source.

This makes proposal files suitable for code review, automated validation, or a later apply/import step without turning the browser into a source-control client.

## Identity and migration

Curation frequently changes labels, mappings, or taxonomy. Stable identity must be preserved where the underlying concept is still the same.

When a concept genuinely merges, splits, or is removed:

- make the identity decision explicit;
- preserve migration/alias information when existing data depends on the old ID;
- do not silently relabel a meaningfully different concept under the same stable ID;
- keep compatibility code separate from the clean canonical authoring model.

Actionable migration work belongs in GitHub Issues. This document describes the Workbench behavior and authoring contract that currently exists.

## Source of truth

The Workbench is an editor over canonical source data, not a new canonical source of its own.

Current source ownership remains with the relevant repository modules/reference data, including areas such as:

- `src/data/canonicalSignals.ts`
- `src/data/overallFacets.ts`
- quiz definitions/question data
- generated catalog/runtime source derived from `reference/catalog/`
- reward/punishment source/runtime definitions
- role/headspace/contextual-mode definitions

The Workbench should display enough provenance/source-path context for a curator to understand what is being proposed.

## Invariants

Keep these rules true:

1. Workbench proposal state is separate from user profile evidence.
2. Current repository data and proposed changes remain distinguishable.
3. New Signal authoring uses canonical Signal + supported channel.
4. Support/Oppose/Neutral is not Giving/Receiving and not authority.
5. Catalog applicability is not a Signal channel.
6. Stable IDs, not labels or source row positions, are identity.
7. Validate before export.
8. Identical proposals export deterministically.
9. The browser does not directly mutate repository source files.
10. Curation may modify, merge, archive, or remove existing concepts; the dataset is not append-only.

Feature expansion or new curation surfaces belong in GitHub Issues until implemented. When they land, update this contract rather than creating another milestone-status document.
