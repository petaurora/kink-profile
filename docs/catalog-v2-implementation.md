# Catalog V2 implementation and migration

This is the first **migration-backed vertical slice**, stacked on PR #276. It does **not** claim that the entire V1 catalog has been curated or migrated.

## Canonical model

`src/catalog-v2/model.ts` defines independently rateable Items, item-scoped modifier definitions, non-exclusive browse themes, aliases and related Item references. Item IDs are stable; group/value IDs are scoped within their Item. The existing service rating tuple key remains the persistence identity. Parent Item ratings are explicit; they are **not inferred** from refinement ratings.

`src/catalog-v2/approvedSlice.ts` contains one reviewable example, Collars, with two non-exclusive themes. Other sample Lab Items stay illustrative until curation has an approved ledger entry.

## Migration contract

`migration.ts` operates on a snapshot; it does not mutate the input or auto-write to localStorage/server. Outcomes: item, refinement, merge/alias, exclude and review. Missing mappings, invalid targets and conflicting decisions remain in the audit report. Two legacy ratings mapping to the same target with different values do not overwrite one another. Explicit approval is required before applying an imported snapshot to an account.

### Next integration steps

1. Assemble the full V1 row-level ledger from approved batch decisions; keep deferred Batch 7 and disputed rows unresolved.
2. Complete final Collars groups against #257 (the current slice deliberately retains only the approved UI Lab groups, not an invented full group set).
3. Replace remaining Lab fixture rows with curated V2 Items and expose non-exclusive browse themes in the UI.
4. Add an explicit import review/confirmation flow and compatibility export; test old stored data and rollback.
5. Add durable versioned storage and API adapter only when data semantics are stable.

Source of truth: Catalog refinement Notion document and GitHub issue #255.
