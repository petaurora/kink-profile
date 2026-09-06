# Reference Data

## Expanded kink catalog

Repository source data:

- `catalog/kink-catalog.tsv` — runtime catalog source with explicit stable Catalog IDs + Category IDs
- `catalog/catalog-id-replacements.tsv` — explicit old-ID → canonical-ID migration map for future merge/deprecation cleanup
- `catalog/overview.tsv` — workbook overview / counts
- `catalog/lists.tsv` — supporting list values
- `catalog/research-sources.tsv` — source references
- `catalog/new-additions.tsv` — research additions / staging data

These are tab-separated text exports so catalog changes are readable, searchable, and diffable in GitHub.

The original `master_pet_kink_catalog_expanded.xlsx` is retained as a historical/reference artifact, but application code should consume the TSV source instead.

Catalog integration is now **in progress in M6**. The TSV runtime source + initial This-or-That ranking baseline are already implemented.

## What the catalog is for

The catalog is already a runtime data/ranking layer and M6 is expanding it to support:

- stable item/category IDs ✅
- domains/categories
- aliases
- signal mappings
- role/headspace and dynamic-mode mappings where useful
- context/intensity metadata
- explicit user preference states
- inferred exploration matches

## What the catalog is not

The catalog is **not a questionnaire**.

Do not generate one direct quiz question per catalog row and do not make users complete the entire catalog before receiving useful results.

The intended architecture is:

```text
section quizzes
    ↓
underlying signals
    ↓
dimensions / dynamic modes / roles-headspaces
    ↓
catalog affinities

explicit catalog choices ───────┘
```

Explicit preference for a catalog item should remain distinct from an inferred match.

## M6 explicit states

Canonical runtime states:

- love
- like
- curious
- unsure
- not interested
- hard limit
- not applicable

Hard limits should suppress inferred recommendations for that item.

## Current use

M1 establishes the multi-quiz application architecture, M2 adds weighted D/s signal scoring, M3 v3 adds separate dynamic-mode and role/headspace compositions, M4 adds directional Bondage & Discipline signals, and M5 adds directional Sadism & Masochism pain/intensity/endurance/challenge signals.

The four core section models are implemented through M5.

The imported pre-migration baseline established:

- TSV → generated runtime catalog
- category ranking
- current Top 5 from ranked categories → Overall
- untouched-category exclusion
- category progress-map navigation
- locally persisted raw comparisons

M6 C1 provides durable explicit Catalog IDs + Category IDs and validated replacement-map support while preserving all existing comparison IDs.

The C2 metadata/mapping implementation was completed before the repository migration but was not included in the imported `kink-profile/main` snapshot. It still needs to be ported and verified here before the reference sources can be described as landed.

C3 is now specified around explicit preference state, migration into one logical catalog-profile store, contextual editing, and authoritative exclusion semantics. Later M6 slices harden ranking confidence/finalists and add the signal-affinity foundation while keeping explicit preference, relative ranking, and inferred affinity distinct.

See:

- [M6 Catalog Integration](../docs/m6-catalog-integration.md)
- [Kink This-or-That Ranking](../docs/kink-this-or-that-ranking.md)
- [Product Spec](../docs/product-spec.md)
- [Scoring Model](../docs/scoring-model.md)
- [Roadmap](../ROADMAP.md)
