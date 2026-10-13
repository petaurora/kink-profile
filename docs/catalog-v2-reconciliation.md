# Catalog V2 source reconciliation contract

## Decision authority

Catalog definitions follow the **latest explicit approval or correction**, including
issue comments. An old source table is evidence of history, not proof that its outcome
remains current. Source identity comes from `reference/catalog/kink-catalog.tsv`;
its 551 original records are distinct from staged research additions.

- #255 owns the conceptual model and approved batch summaries.
- #256–#272 and #274 own detailed decisions. Batch 7 (#262) is intentionally deferred.
- #268 comment **5982685387** approves Marking and its four refinements. Batch 13 is
  approved; it does not need a new workshop.
- #263's final Worship placement correction supersedes the earlier generic Item.
  Relational and body-worship meanings remain separate later-family destinations.
- #273 indexes the historical approvals and final Batch 17/18 corrections.
- October 13 equipment additions are user-authorized inferred vocabulary, distinct
  from earlier batch-approved values.

## What the executable contracts prove

| Contract | Proof | Limit |
| --- | --- | --- |
| `approvedBatchInventory.ts` | Transcribed finalized standalone Item inventory | Presence alone does not establish modifier or source migration parity |
| `reconciliationLedger.ts` | Issue/section-linked Item/group/value expectations | A growing subset, not an extraction of all historical prose |
| `reconciliationExclusions.test.ts` | Superseded/excluded/deferred Items remain absent, including generic Worship | Deferred families are not finalized here |
| `pendingGroupIds` | Approved dimensions are retained through services without invented options | Options and per-Item applicability may still need decisions |
| `curatedCatalog.ts` | One composed reference universe; non-exclusive membership authority | Current display category remains a single projection |
| `auditCorrections.test.ts` | Final corrections, inverse membership, aliases, concepts and independent ratings | Automated checks do not replace full visual review |
| `fullSourceDisposition.ts` | Exactly one explicit disposition per original V1 source ID; valid executable targets | Review/exclude entries are accounted for, not migrated |
| `migrationConflicts.test.ts` | Conflicting incoming sources cannot choose a target by input order | Deliberate resolution remains required |
| `legacyProfileArchive.ts` | Full original profile and directional evidence preserved in pure preparation | No persistent import/export or atomic storage write |

## Implemented batch structures

| Batch | Source | Current reference structure |
| --- | --- | --- |
| 1 Bondage | #256 | Core families, configuration, method/support and Equipment memberships |
| 2 Equipment | #257 | Five Collars groups; complete approved Gags groups; witnessed Collaring; Gear/furniture types and standalone graduates |
| 3 Impact | #258 | Practice/equipment Items, method/sensation and October 13 equipment options; target/intensity pending |
| 4 Psychological | #259 | Core Items, restored groups and shared target/tone definitions; applicability/intensity and some temporal/body dimensions pending |
| 5 Fantasy/Roleplay | #260 | Roleplay/CNC scenarios, medium context and named fantasy distinctions |
| 6 Praise | #261 | Granular variants excluded; core placement deferred |
| 7 R/P | #262 | Intentionally deferred |
| 8 Power/Pet | #263 | Orientations, named dynamics, directions/roles/scope, Pet Roleplay/Training; generic Worship excluded |
| 9 Protocol/Service | #264 | Low/High shared practices, task mode/structure, permission domains, service types and automation |
| 10 Positioning | #265 | Position Training forms and Verbal/Mental Restraint; Kneeling Endurance excluded |
| 11 Primal | #266 | Core identities/roles/methods and Biting discovery relation |
| 12 Exhibition/Voyeurism | #267 | Independent directional parents sharing medium/context definitions |
| 13 Marking | #268 approval comment | Marking with Hickeys, Bruise marking, Stamps/temporary tattoos and Other temporary marks; Body Writing remains separate |
| 14 Sensory | #269 | Deprivation, texture, temperature and tickling groups; Texture Body Part pending |
| 15 Pain | #270 | Shared Masochism/Sadism experience, methods/tools and standalone Wartenberg; Body Part pending |
| 16 Electrical | #271 | Device/method and tickle/twitch response; Body Part pending |
| 17 Orgasm | #272 | Independent role/material/method structure, separate Countdown and Release Cue |
| 18 Sexual Activities | #274 | Approved Item/Role/no-modifier distinctions |

## Source evidence and archive semantics

`docs/catalog-v2-source-review-audit.tsv` preserves row-level source evidence.
Selected rows are corrected with later final-section/comment provenance. Other
historical table matches still need supersession review; blank table evidence does
not mean a decision never existed. The executable disposition ledger owns migration
behavior, rather than this research evidence file.

Review/deferred, excluded and conflicted sources may remain in a separate read-only
legacy archive until database integration. This adopted direction removes any
requirement to resolve all old taxonomy before initial V2 use. Original evidence
must remain interpretable; no automatic multi-target duplication or invented rating
is allowed. Complete original-profile preparation preserves directional values,
timestamps and ranking data, while scalar migration only considers explicit overall
ratings. Real storage/import/export remains a separate production-cutover gate.

See [Catalog V2 reference and migration](catalog-v2-implementation.md) for the current
model, services and archive contracts. Issue #292 and PR #293 own implementation
acceptance, remaining vocabulary work and review status; this document is not a roadmap.
