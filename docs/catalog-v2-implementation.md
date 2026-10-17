# Catalog V2 reference and migration contract

Catalog V2 supplies the default reference data for the V2 app shell at `#/ui-lab`.
It is separate from the existing production V1 catalog and browser profile storage.
The local V2 preference adapter confirms writes in memory; it does not import or
replace a stored V1 profile.

## Canonical reference data

`src/catalog-v2/curatedCatalog.ts` composes the reviewed definitions from
`approvedSlice.ts`, `reviewedExpansion.ts` and `additionalReviewed.ts`.
Later definitions replace an Item's modifier groups; non-exclusive theme memberships
compose across slices. Theme member lists are derived from the composed Items.
There is one definition per stable Item ID and no default illustrative seed union.

`model.ts` defines independently rateable Items, structural modifier groups,
rateable values, non-exclusive themes, aliases and related-Item references.
`pendingGroupIds` records approved dimensions whose precise options or applicability
are still unfinished. Pending dimensions are metadata, not empty rateable groups.

The default data implements the final approved batch inventory, including Marking
from issue #268's approval comment. Generic Worship is omitted according to #263's
later correction. Praise placement remains deferred to the intentionally deferred
Rewards/Punishments review. October 13 equipment extensions are user-authorized
inferred vocabulary, separate from the original batch approvals.

## Identity, reuse and discovery

Item/modifier ratings use stable tuple keys:
`["item", itemId]` and `["modifier", itemId, groupId, valueId]`.
Display labels are not transport keys. The expanded Gags design retains the previous
`type`, `ball`, `bit`, `ring`, `tape-style`, `medical-dental` and `muzzle` IDs
despite display clarifications.

`modifierTemplates.ts` supplies shared protocol, pain-experience, observation and
psychological target/tone definitions with fresh Item-local instances. An Item may
choose a subset and contextual label without changing sibling definitions or ratings.
Humiliation's eight-target/seven-tone applicability is approved; the shared vocabulary itself
has already been recorded by #259.

`referenceMetadata.ts` supplies reviewed aliases and related-Item references.
Selectively shared material concepts such as Leather and Metal retain canonical
identity across equipment, while each Item-specific value remains separately rateable.
A general concept preference never sets an Item or modifier preference.

`toAppReference.ts` transports memberships, aliases, related IDs, pending dimensions
and value aliases through `CatalogReferenceData`. Global search can resolve an alias
to its exact Item/modifier target. Local search also explains supporting alias matches.
Name matches retain precedence. Featured Power Exchange includes orientations,
named dynamics and protocol Items; subjects do not duplicate rating targets.

Most older source definitions still derive IDs from authored names. Changing those
names requires deliberately retaining their IDs or supplying a reviewed replacement;
the current helpers are not a complete immutable internal-ID/redirect system.

## Migration preview

`fullSourceDisposition.ts` gives every one of the 551 original V1 source IDs one
explicit Item/refinement/merge/alias/exclude/review disposition. Exact source identity
is validated against the original TSV; no fuzzy name matching creates preferences.
The ledger describes the original active corpus, not every staged research candidate.

`migrateV1Ratings` accepts an explicit scalar snapshot, validates destinations and
groups incoming sources by target before assigning ratings:

- Equal incoming values may coalesce into one target; all applied source IDs are reported.
- Different incoming values leave an empty target unanswered and report every competing
  source as an `incoming-sources` conflict. Object iteration order cannot select a winner.
- A preexisting V2 rating remains unchanged. A conflict with it is distinguished from
  competing V1 sources.
- Missing/ambiguous mappings, invalid destinations, excluded and deferred sources
  remain reported rather than creating guessed ratings.
- Explicit parent ratings are never recomputed from modifiers.

`planLosslessV1Migration` retains every unapplied scalar source rating.
`buildLegacyPreferenceArchive` returns schema-v1 archived scalar values with exact
source IDs and reasons, including all sides of an incoming-source collision.
These functions are pure and do not commit preferences or delete sources.

## Complete original-profile archive preparation

`legacyProfileArchive.ts` accepts the actual V1 `CatalogProfileState`.
Its schema-v2 archive retains a deep copy of the **entire original profile**, including
overall/giving/receiving preferences, update timestamps, comparisons and ranking history.
It normalizes only explicitly recorded overall values for the approved scalar preview.
It never uses V1's receiving/giving fallback to infer another rating.

Original directional records remain in the complete archive with contextual reasons
until their exact V2 destinations are reviewed. Even safely previewed overall records
remain interpretable in the original source snapshot. The snapshot is archival
provenance, not a second canonical V2 preference store.

The adopted rollout direction allows unresolved, excluded, deferred and conflicted
records to remain read-only in an archive until database integration. It does not require
all source concepts to be mapped now. A persistent importer must still provide deliberate
review, crash-safe/atomic storage, compatibility export/restore and old Collars-pilot
handling before any destructive cutover. None of these preparation functions is an
automatic storage migration.

## Verification and scope

The approved inventory, positive/negative/pending parity and composed-reference tests
cover final decision corrections, valid targets, memberships, aliases, exact modifier
handoff, independent ratings and order-independent conflicts. Source-ID accounting
and passing CI are not claims of complete production migration or finished modifier
vocabularies. The old V1 catalog, Signal mappings, ranking/profile integration,
Scene Builder and persisted browser state continue through their existing contracts.

Engineering acceptance and outstanding work are owned by issue #292 and PR #293,
stacked on #291 and #276. Product decisions remain in the catalog/architecture workspace.

## October 14 modifier approval reconciliation

The approved 13-value Body Area vocabulary is active for Impact Play, Spanking / Slapping, Body Writing, Texture Play, Pinching, Scratching, Biting, Clamp / Clip Play, Wartenberg Wheel, Suction Play, and Electrical Play. Impact items retain their `target-body-area` group identity; other former `body-part` placeholders now use `body-area`. All preferences remain scoped by Item and group/value identity; no propagation.

Shared Intensity values are Light, Moderate, and Intense, active for Impact Play, Spanking / Slapping, Humiliation Play, Degradation, and Embarrassment Play. Humiliation Play uses the final approved eight targets and seven tones (without Specific Body Part or overlapping Presentation / Appearance). Human Furniture has Brief/Sustained/Extended Duration and Private/Witnessed Visibility, with Stillness / Endurance removed. Body Writing Permanence was explicitly rejected and removed, not deferred. No unreviewed options are inferred. Source records and legacy backups remain unchanged; real archive import/persistence and full visual acceptance are separate gates.
