# Reference Data

## Rewards & punishments

Repository reference data:

- `rewards-punishments/punishments.tsv` — 486 combined punishment/consequence ideas with source provenance
- `rewards-punishments/rewards.tsv` — 183 combined reward ideas with source provenance
- `rewards-punishments/source/` — exact sheet-level TSV exports from the source workbook
- `rewards-punishments/system-guide.md` — source system principles, tiers, rules, and metadata
- `rewards-punishments/overview.tsv` — workbook/source provenance

Like the kink catalog, these are plain-text reference exports so changes remain readable and diffable in GitHub. They remain source/reference material today; M11 now defines the planned normalization into stable runtime Reward/Punishment action primitives and contextual-use state.

See [Rewards & Punishments Reference Data](rewards-punishments/README.md).

## Expanded kink catalog

Repository source data:

- `catalog/kink-catalog.tsv` — runtime catalog source with explicit stable Catalog IDs + Category IDs
- `catalog/catalog-id-replacements.tsv` — explicit old-ID → canonical-ID migration map for future merge/deprecation cleanup
- `catalog/catalog-categories.tsv` — stable categories, broad domains, and display order
- `catalog/catalog-aliases.tsv` — searchable alternate terminology
- `catalog/catalog-signal-mappings.tsv` — validated category-default + item-specific SignalId mappings
- `catalog/overview.tsv` — workbook overview / counts
- `catalog/lists.tsv` — supporting list values
- `catalog/research-sources.tsv` — source references
- `catalog/new-additions.tsv` — research additions / staging data

These are tab-separated text exports so catalog changes are readable, searchable, and diffable in GitHub.

The original `master_pet_kink_catalog_expanded.xlsx` is retained as a historical/reference artifact, but application code should consume the TSV source instead.

Catalog integration is **implemented through M6**. The TSV runtime source, explicit preference model, hardened category/Overall ranking, source-aware inference/result views, and recommendation-suppression boundaries are all runtime capabilities.

## What the catalog is for

The catalog is a runtime data/ranking/evidence layer. M6 implemented:

- stable item/category IDs ✅
- domains/categories ✅
- normalized receiving/giving/both direction ✅
- aliases ✅
- validated signal mappings ✅
- context/intensity/risk metadata ✅
- explicit user preference states ✅
- inferred exploration matches + provenance ✅
- hardened recommendation eligibility/suppression ✅
- source-aware catalog result presentation ✅

Role/headspace and dynamic-mode relationships remain primarily signal/profile concerns rather than requiring a second catalog identity model.

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

C7 suppresses Hard Limit / Not Interested / Not Applicable items from inferred recommendation candidates. C6 explainability may still display the underlying derived affinity/provenance; suppression does not erase evidence.

## Current use

M1 establishes the multi-quiz application architecture, M2 adds weighted D/s signal scoring, M3 v3 adds separate dynamic-mode and role/headspace compositions, M4 adds directional Bondage & Discipline signals, and M5 adds directional Sadism & Masochism pain/intensity/endurance/challenge signals.

The four core section models are implemented through M5.

The imported pre-migration baseline established the original ranking behavior below; C3–C5 later hardened eligibility, meaningful ordering evidence, finalist promotion, and Overall-candidate continuity:

- TSV → generated runtime catalog
- category ranking
- current Top 5 from ranked categories → Overall
- untouched-category exclusion
- category progress-map navigation
- shared local catalog-profile persistence for explicit preferences + raw comparisons

M6 C1 provides durable explicit Catalog IDs + Category IDs and validated replacement-map support while preserving all existing comparison IDs.

M6 C2 now adds:
- domain/display metadata for all 35 categories
- normalized receiving / giving / both direction
- conservative aliases
- 93 validated mapping rules resolving 269 / 551 catalog items into 698 item → signal associations

The remaining 282 items are intentionally unmapped rather than assigned speculative core-signal affinities.

M6 C3 provides explicit preference state, migration into one logical catalog-profile store, the searchable catalog table/list, and authoritative exclusion semantics while keeping This-or-That focused on relative ranking. C4 added source-aware quiz/catalog evidence, recomputable inferred affinity, provenance, and no-feedback-loop guarantees. C5 hardened meaningful ordering confidence, finalist promotion, and Overall history preservation. C6 surfaces explicit, ranking, inferred, exclusion, and provenance channels together without collapsing them. C7 hardens affinity edge cases plus recommendation eligibility/suppression while preserving explainability. M6 is complete and M7 now consumes these boundaries in the completed overall profile. M11–M15 are separately scoped future consumers/extensions rather than unfinished M6 work.

See:

- [M6 Catalog Integration](../docs/m6-catalog-integration.md)
- [Kink This-or-That Ranking](../docs/kink-this-or-that-ranking.md)
- [Product Spec](../docs/product-spec.md)
- [Scoring Model](../docs/scoring-model.md)
- [Roadmap](../ROADMAP.md)
