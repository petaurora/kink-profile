# Catalog V2 reconciliation checkpoint

Status: **active audit; not merge-ready**. Review source: final approved decisions from GitHub #256–#274, with later corrections superseding earlier proposals. Execution: draft PR #293 stacked on #291. Source of V1 identity: `reference/catalog/kink-catalog.tsv` (551 records).

## Interpretation

- **Model parity** means implemented canonical Items and option groups align with the approved final review; it does not mean source ratings migrated.
- **Source coverage** means every V1 ID has an explicit decision and valid destination, or a recorded deferred/excluded outcome. No final source-coverage gate is passing yet.
- **Inferred** (user-authorized October equipment expansions) is separate from **approved** (batch review) and **proposed** (not approved).
- Shared global refinement vocabulary, non-exclusive themes through the UI, and persisted preference migration are separate implementation requirements.

## Batch-by-batch working ledger

| Batch | Issue | Modeling checkpoint | Remaining gap |
| --- | --- | --- | --- |
| 1 Bondage | #256 | Canonical core families and refinements modeled | Full V1 mapping review, cross-family collision validation |
| 2 Collars / Equipment | #257 | Collars five groups, Gags, Cuffs, gear and furniture including graduated standalone Items | Complete approved specialized modifier groups and V1 migration |
| 3 Impact | #258 | Core practice/equipment Items; approved method/sensation; newly inferred equipment options tracked separately | Source mapping for staged concepts; shared target/intensity vocabulary |
| 4 Psychological | #259 | Core Items, modality/context/style and many explicit values modeled | Reusable target/tone applicability, intensity, duration/body area, complete source mapping |
| 5 Fantasy / Roleplay | #260 | Roleplay/CNC scenarios and fantasy distinctions restored | Source ledger, canonical synonyms/aliases, future Size Difference review |
| 6 Praise | #261 | Excluded granular variants; base Praise placement intentionally deferred | Resolve in Batch 7; do not silently reintroduce |
| 7 Rewards / Punishments | #262 | **Intentionally deferred** | Separate domain review |
| 8 Power exchange | #263 | Role orientations, named dynamics, independently scoped direction/role/scope preferences restored | V1 mappings, cross-domain relationships, reusable direction registry |
| 9 Protocol / Service | #264 | Low/High, permission, task, service refinements and independent Items restored | V1 mappings, future Rule Builder boundary |
| 10 Positioning | #265 | Position Training and Verbal/Mental Restraint modeled | V1 exclude/defer outcomes; vocabulary expansion |
| 11 Primal | #266 | Primal, Chase, Struggle, Biting, Scenting identities modeled | V1 migration ledger |
| 12 Exhibition / Voyeurism | #267 | Directionally independent Items with shared media vocabulary | V1 migration ledger and compatibility |
| 13 Marking | #268 | **Not approved**; working hypothesis only | Explicit decision required before canonical modeling |
| 14 Sensory | #269 | Core Items and explicit temperature/texture/deprivation modifiers modeled | Shared Body Part vocabulary and cross-family moves |
| 15 Pain / Sensation | #270 | Core Items and explicit methods/experience values modeled | Shared Body Part vocabulary and exclusion/defer mapping |
| 16 Electrical | #271 | Device/method and response modeled | Shared Body Part vocabulary and staged source mapping |
| 17 Orgasm / Arousal | #272 | Item and role/material structure present; Countdown and Release Cue separately modeled | V1 source migration and conflict review |
| 18 Sexual Activities | #274 | Approved Item/Role list present | V1/staged source migration, aliases and no-modifier boundary checks |

## Controls already in place

- `approvedBatchInventory.ts` and its test enforce the complete transcribed standalone Item list for every finalized batch (1–5, 8–12, 14–18); deferred batches 6/7 and unapproved Batch 13 are kept separate.\n- `reconciliationLedger.ts` and `reconciliationLedger.test.ts` enforce a growing issue-linked subset of Item/group/value expectations.\n- `reconciliationPending.test.ts` enforces approved-but-unresolved dimension IDs through `pendingGroupIds` in the canonical model, without populating unreviewed value options or displaying empty UI groups.\n- `reconciliationExclusions.test.ts` prevents explicitly excluded, deferred and superseded standalones from returning to the Catalog.
- `sourceCoverage.test.ts` validates the 551-ID source snapshot and explicitly unresolved rows, but **does not prove the approved corpus has been fully migrated**.
- `docs/catalog-v2-source-review-audit.tsv` aligns 551 source IDs with exact-match evidence from the currently supported GitHub review-table layouts (206 evidence matches, 345 not yet located); blank evidence requires human/format reconciliation and is **not** a declaration that no decision exists.
- `curatedService.test.ts` prevents the 48 illustrative Items from leaking into the default V2 Catalog.

## Merge blockers

1. Complete final approved Item and modifier parity for all finalized batches.
2. Resolve duplicate source identity and Item collisions; preserve approved stable modifier IDs.
3. Finish complete source-ID -> V2 target/exclude/defer/review migration with collisions and explicit user-data handling.
4. Resolve Body Part registry and unfinished per-Item applicability; do not insert fictitious ratings or options.
5. Define source-of-truth reusable vocabulary, relationship and multi-theme contracts; ensure UI only uses services.
6. Pass CI and preview; audit mobile Refine, featured subjects, and actual persistent preference compatibility.
7. Get design approval on genuinely open Batch 7 and Batch 13 decisions in their own workshops.

Do **not** merge #293 as a completed Catalog V2 migration based solely on CI success.

## Exhaustive disposition milestone — October 13, 2026

`src/catalog-v2/fullSourceDisposition.ts` now creates an **exactly one decision per V1 source ID** ledger from the 551 original IDs. Verified Item/refinement/exclude decisions override the default explicit `review` disposition. The remaining `review` IDs are **not mapped**, and any original ratings attached to them must remain unresolved and must not be copied to guessed targets. The corresponding test enforces 551 unique accounted-for sources and that collisions preserve existing ratings. Source-linked exclusions and deferrals from approved review batches are tracked explicitly.

**This is an audit completeness gate, not migration completion.** The product may not advertise 551 migrated ratings until each pending source is resolved, and the resulting mapping and persisted-data compatibility have been validated.

## Approved product decision: archive unresolved V1 preferences (2026-10-13)

Unresolved, excluded, deferred, and conflicted V1 preference ratings may be preserved in a **separate, read-only legacy archive** during the initial Catalog V2 rollout. They do not require immediate full catalog mapping, and they do not appear as V2 ratings. Full cleanup/reconciliation belongs in subsequent database integration. Keep the original source ID, preference value, and disposition/conflict reason, with source/schema metadata. Never silently discard, infer, or overwrite them.

`buildLegacyPreferenceArchive` currently returns a pure, versioned archive payload and a separate V2 migration preview. **The payload is not persisted automatically**: saving/migrating browser preferences, crash-safe storage, Collars pilot import, and subsequent DB data transfer still require explicit implementation and verification prior to any destructive migration. Archive disposition now reduces the taxonomy-completeness merge blocker; it does not eliminate the data-preservation gate.
