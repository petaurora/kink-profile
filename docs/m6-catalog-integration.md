# M6 — Catalog Integration Contract

## Status

**In-progress contract.**

M6 is not starting from zero.

The new `kink-profile` repository imported the already-working catalog/ranking application baseline. C1 then established durable catalog identity, and C2 has now restored the pre-migration metadata/mapping implementation into this repository.

C3 explicit preference + catalog table is implemented. The next implementation slice is C4 source-aware evidence convergence.

Current baseline on `main`:

- the original XLSX is retained as historical/reference data
- `reference/catalog/kink-catalog.tsv` is the runtime catalog source of truth
- the catalog contains **551 discussion items**
- `scripts/generate-kink-catalog.mjs` generates the app-owned runtime module before dev/build
- the runtime catalog exposes stable identity, category/domain/display metadata, normalized direction, aliases, signal mappings, description, role/mode, intensity, and risk metadata
- pairwise comparisons are persisted locally
- category ranking is playable
- the ranking home is a category progress map rather than a category dropdown
- users can continue where they left off and move directly to the next category
- untouched categories contribute **zero** overall finalists
- ranked categories contribute up to their current **Top 5**
- Overall is a separate destination from the category home
- cross-category ranking is playable
- raw pairwise decisions are retained so rankings can be recalculated

M6 preserves that baseline. C1/C2 closed identity and mapping gaps; C3 added direct catalog state + the table/mini-game interconnection; C4–C7 now own source-aware convergence, ranking hardening, result integration, and affinity hardening.

---

# M6 goal

Connect the catalog to the user's profile **without turning 551 rows into questionnaire homework**.

M6 should leave us with a catalog system where:

1. catalog items have durable identities
2. users can explicitly classify an item without having to classify every item
3. pairwise ranking remains a separate relative-preference signal
4. hard limits and exclusions are authoritative
5. catalog items can map to the shared quiz signal vocabulary
6. inferred affinity remains visibly different from explicit preference
7. quiz-derived inference, explicit preference, and pairwise evidence can coexist for the same Catalog ID
8. C4 establishes source provenance/no-feedback-loop behavior before broader profile aggregation
9. M7 can safely consume direct catalog evidence and mappings without inventing another catalog model

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md) for the post-C3 evidence/convergence contract.

---

# Four catalog layers

Do not collapse these layers or treat every displayed value as independent evidence.

Catalog definition is shared app data. Explicit preference and raw pairwise choices are independent user evidence. Inferred affinity and resolved/profile views are derived and must retain provenance.

```text
CATALOG DEFINITION
what the item is
        │
        ├─────────────┐
        ▼             ▼
EXPLICIT STATE     PAIRWISE RANKING
what I say         what I choose relative
directly           to other eligible items
        │             │
        └──────┬──────┘
               │
               ▼
          PROFILE VIEW

QUIZ SIGNAL EVIDENCE
        │
        ▼
CANONICAL SIGNAL PROFILE (M7)
        │
        ▼
INFERRED CATALOG AFFINITY
"may be worth exploring"
```

## Catalog definition

Shared application data:

- ID
- label
- category
- description
- aliases
- direction/role metadata
- intensity/risk/context metadata
- signal mappings

## Explicit preference

A direct user statement.

Examples:

- love
- like
- curious
- unsure
- not interested
- hard limit
- not applicable

Explicit preference is authoritative for user semantics.

## Pairwise ranking

Relative evidence such as:

> Rope bondage over cuffs.

Ranking answers:

> Which eligible items rise above the others?

It does **not** answer:

> Is this a hard limit?

## Inferred affinity

A model-derived suggestion from known signals.

Example:

> Your profile suggests rope bondage may be worth exploring.

Inference is never allowed to replace explicit preference or safety/exclusion state.

---

# Source data ownership

## Runtime source of truth

`reference/catalog/kink-catalog.tsv`

This is the human-editable, diffable source for catalog definitions.

## Supporting TSVs

Runtime catalog sidecars:

- `catalog-categories.tsv` — category domain + display metadata
- `catalog-aliases.tsv` — alternate terminology
- `catalog-signal-mappings.tsv` — validated category/item → SignalId mappings
- `catalog-id-replacements.tsv` — old Catalog ID → canonical Catalog ID replacements

Reference/authoring support files:

- `overview.tsv`
- `lists.tsv`
- `research-sources.tsv`
- `new-additions.tsv`

The reference/authoring files are **not automatically runtime schemas**.

In particular, the old workbook-specific Master/pet preference columns and helper lists should not become the application's user-profile storage model.

## Historical source

`master_pet_kink_catalog_expanded.xlsx`

Retain it as historical/reference material.

Do not add runtime XLSX parsing back into the application.

## Generated runtime module

`src/data/kinkCatalog.generated.ts`

Generated before dev/build and intentionally ignored by Git.

Application code consumes the generated runtime model rather than parsing TSV in the browser.

---

# Stable identity — C1 implemented ✅

## Prior problem

Before C1, the generator derived item identity from the label:

```text
"Rope bondage" → rope-bondage
```

Duplicate slugs receive row-order suffixes.

Category IDs were also derived from category labels.

That was convenient for the initial slice but it was **not durable identity**.

A label rename, category rename, or duplicate-row reorder can invalidate:

- stored pairwise comparison IDs
- category ranking scopes
- future explicit preferences
- future inferred mapping references

Now that ranking data exists, that becomes a migration risk.

## Implemented change

Explicit stable IDs now live directly in the runtime source TSV.

Implemented source columns:

```text
Catalog ID
Category ID
Kink
Category
...
```

### Migration rule ✅

The initial migration seeded explicit IDs using the **exact IDs generated by the pre-C1 main branch**.

No new naming scheme was introduced.

Example:

```text
Catalog ID: rope-bondage
Label:      Rope bondage
```

Future label changes keep `rope-bondage`.

Category IDs were likewise seeded from the pre-C1 generated category IDs so existing category-scoped comparison history remains valid.

## Validation

The build/generator now fails on:

- missing Catalog ID
- duplicate Catalog ID
- missing Category ID
- one Category ID mapped to conflicting labels without an intentional migration
- unknown signal IDs in mappings
- invalid mapping weights
- malformed controlled metadata where validation exists

Future catalog ID replacements are declared in `reference/catalog/catalog-id-replacements.tsv`; the generator validates replacement IDs and targets before exporting the map into runtime data.

Stable identity is now established before substantial explicit-preference/profile data accumulates.

The migration was verified as lossless:

- 551 source rows before / after
- 551 stable Catalog IDs
- 35 stable Category IDs
- zero ID mismatches against the prior generator behavior
- zero changes to any of the original 20 catalog fields

---

# Runtime catalog schema

C2 currently generates the following core shape:

```ts
type KinkCatalogDirection = "receiving" | "giving" | "both";

type KinkCatalogSignalMapping = {
  signalId: SignalId;
  weight: number;
};

type KinkCatalogItem = {
  id: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  domain: KinkCatalogDomain;
  direction: KinkCatalogDirection;
  aliases: readonly string[];
  signalMappings: readonly KinkCatalogSignalMapping[];
  description: string;
  typicalRole: string;
  primaryMode: string;
  intensity: string;
  riskLevel: string;
};

type KinkCatalogCategory = {
  id: string;
  label: string;
  domain: KinkCatalogDomain;
  displayOrder: number;
  itemCount: number;
};
```

Not every descriptive TSV field needs stronger typing. Stable identity, controlled direction, category metadata, and signal mapping have explicit generator validation.

---

# Categories, domains, and aliases

## Categories

The existing catalog categories remain useful for:

- browsing
- within-category ranking
- filtering
- finalist selection

Category identity is explicit and stable.

## Domains

Categories are comparatively granular.

C2 groups all 35 stable categories into broader product domains for filtering, ordering, and mapping. Examples include:

- bondage/control
- power exchange
- S/M/intensity
- roles/headspaces
- sensation
- sexual activity
- display/context
- relational/social
- fantasy/roleplay

Domains are catalog organization metadata, not quiz sections.

Do not force every category into a quiz section.

## Aliases

Aliases support:

- search
- terminology variants
- future import/migration
- avoiding duplicate catalog rows caused only by naming

Aliases do not create separate ranked items.

C2 uses a one-alias-per-row sidecar:

`reference/catalog/catalog-aliases.tsv`

Alias identity remains separate from the canonical label and does not create additional ranked items.

---

# Signal mappings

C2 provides an explicit many-to-many mapping from catalog items/categories to the stable `SignalId` vocabulary implemented in M2–M5.

Do not hardcode catalog mappings in React.

Implemented C2 source:

`reference/catalog/catalog-signal-mappings.tsv`

The mapping layer uses category-default rules plus item-specific refinements and validates against the actual `SignalId` union.

Conceptual rows:

```text
Scope Type  Scope ID           Applies To  Signal ID                     Weight
category    bondage-restraint  receiving   receiving_restraint           0.75
category    bondage-restraint  giving      giving_restraint              0.75
category    bondage-restraint  any         movement_restriction          0.50
category    bondage-restraint  receiving   receiving_constraint_control  0.25
category    bondage-restraint  giving      giving_constraint_control     0.25
```

Runtime shape:

```ts
type CatalogSignalMapping = {
  signalId: SignalId;
  weight: number;
};
```

C2 uses the controlled mapping-weight range:

```text
0.25 — weak/secondary association
0.50 — meaningful association
0.75 — strong association
1.00 — defining association
```

The generator rejects other values to avoid false precision.

## Direction

Prefer directional SignalIds when the meaning is directional.

Example:

```text
pain_receiving
pain_giving
receiving_restraint
giving_restraint
```

Do not add a second direction field when the SignalId already carries the distinction.

## Role/headspace mappings

Direct role/headspace tags can exist where semantically useful, especially for literal role items.

However, M6 affinity v1 should primarily rely on signal mappings.

Do not create a second competing inference system based on hand-authored role scores.

---

# Explicit preference + catalog table — C3 contract

Concrete implementation scope: [M6 C3 — Explicit Preference + Catalog Table](m6-c3-explicit-preference.md).

C3 turns direct catalog classification into first-class application state through a searchable catalog table/list, while keeping This-or-That focused on comparative discovery and ranking.

C3 owns:

- the explicit-state vocabulary
- per-item preference storage
- migration from the existing ranking-only store
- a first-class catalog table/list for direct preference management
- read-only ranking context joined by stable Catalog ID
- the minimum ranking-eligibility behavior required to make exclusions authoritative

C3 does **not** own:

- Skip / Neither confidence semantics
- finalist-promotion thresholds
- persistence of prior Overall candidate membership
- catalog affinity calculation
- broad results/profile integration

Those remain C4–C6.

## Canonical runtime states

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

**Unanswered is represented by absence**, not by storing an `unknown` preference.

That distinction must survive persistence and UI:

```text
no explicit state yet
```

is different from:

```text
the user explicitly chose "unsure"
```

If the final stored value on an item is cleared, delete that empty preference record instead of saving an object that merely means "unanswered."

## State meanings

The labels are deliberately semantic rather than numeric:

| State | Meaning |
| --- | --- |
| Love | strong explicit positive preference |
| Like | clear positive preference |
| Curious | wants to explore / learn more |
| Unsure | explicitly uncertain |
| Not Interested | known lack of interest |
| Hard Limit | explicit safety/boundary exclusion |
| Not Applicable | the concept does not meaningfully apply in the user's context |

Do not infer a numeric score from these states in C3.

In particular, `hard_limit` is not simply a stronger version of `not_interested`.

## Direction-capable preference record

The storage model must support direction-specific overrides now even if the first C3 editor only changes the general/overall value.

```ts
type CatalogItemPreference = {
  overall?: CatalogPreferenceState;
  receiving?: CatalogPreferenceState;
  giving?: CatalogPreferenceState;
  updatedAt: string;
};
```

Direction resolution is:

```text
receiving view: receiving override → overall → unanswered
giving view:    giving override    → overall → unanswered
generic view:   overall            → unanswered
```

Directional overrides must **not** be collapsed into a synthetic generic value.

Example:

```text
Impact play
overall:   like
receiving: hard_limit
giving:    love
```

A generic summary may say the overall state is Like while direction-aware surfaces preserve the receiving Hard Limit and giving Love.

The initial C3 UI may edit only `overall`; the schema is directional now so a later UI does not require a storage migration.

## Workbook list values

`reference/catalog/lists.tsv` retains historical workbook helper values such as Maybe / Neutral / No.

Those values are not the canonical runtime state enum.

If workbook-specific user data is ever imported, it needs an explicit migration table. Do not leak spreadsheet terminology into the application profile model.

---

# Catalog user-state persistence — C3

The current imported ranking slice stores only:

```text
pet-profile-kink-ranking-v1
```

with raw comparisons.

C3 establishes one logical catalog-profile store:

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

Do **not** add persisted Overall finalist membership in C3. Whether that state needs persistence is a C5 ranking-hardening decision.

## Migration from ranking v1

When `pet-profile-catalog-v1` does not yet exist:

1. read `pet-profile-kink-ranking-v1`
2. validate its v1 comparison array using the same tolerant behavior the ranking store uses today
3. canonicalize catalog item IDs through the C1 replacement map when a replacement exists
4. preserve comparison IDs, timestamps, scopes, and results
5. initialize `preferences` as empty
6. write the new catalog-profile schema
7. leave the old ranking key untouched during the migration window for rollback/compatibility
8. after migration, write only the new catalog-profile key; do not dual-write indefinitely

Corrupt or missing legacy data must not block the app. Fall back to an empty catalog profile just as the existing ranking store falls back to empty progress.

Migration is about **moving raw evidence**, not deriving preference state from ranking history.

Examples:

- a prior win does not become `love`
- a prior `neither` does not become `not_interested`
- a prior `skip` does not become `unsure`

## Catalog table / direct editing UI

C3 should provide explicit preference as a first-class catalog-management surface rather than embedding preference controls into the This-or-That mini-game.

Initial target:

- searchable table/list with one row per stable Catalog ID
- search by canonical label + aliases
- filter by category, explicit state, and unanswered
- default ordering/grouping by category display order + item label
- compact preference editor with seven canonical choices plus Clear
- responsive desktop table and mobile stacked-row presentation
- expandable description/details for terms that need context
- optional read-only category/overall ranking context resolved by the same Catalog ID
- setting Love / Like / Curious / Unsure records explicit state but does not create a ranking win
- setting Not Interested / Hard Limit / Not Applicable records explicit state and removes that item from future pair selection
- Hard Limit must be visually distinguishable from ordinary disinterest
- no requirement to classify every item
- no completion percentage that turns the catalog into homework

This-or-That should remain the low-friction comparison/discovery flow and should not carry explicit-preference editing controls.

C5 can later broaden how explicit state and ranking results appear throughout profile/result views.

---

# Explicit state and ranking eligibility

Ranking eligibility uses explicit state as soon as C3 exists. This minimum behavior belongs in C3 because explicit exclusions are not authoritative if the pair selector continues presenting them.

Default exclusion:

- hard_limit
- not_interested
- not_applicable

Default eligible:

- love
- like
- curious
- unsure
- no explicit state yet

This preserves the low-friction ranking flow; users do **not** have to classify all 551 items before ranking.

## Directional hard limits

If an item has a direction-specific hard limit but remains valid in another direction, generic item-level ranking may remain eligible.

However:

- inferred recommendations must respect the directional hard limit
- future direction-specific ranking must exclude the blocked direction
- UI must never summarize a direction-specific hard limit as general interest

## Ranking does not mutate explicit state

Examples:

- selecting Rope over Cuffs does not automatically mark Rope `love`
- selecting Neither does not automatically mark either item `not_interested`
- skipping does not mark `unsure`

The user must explicitly change explicit state.

---

# Pairwise comparison semantics

The imported ranking baseline correctly retains raw comparison history.

M6 should tighten how each result contributes to ranking confidence.

## Left / right

Valid ordering evidence.

Affects rating and confidence.

## Both / equal

Valid tie/ordering evidence.

Affects rating and confidence.

## Neither

Useful interaction history, but it does not resolve relative positive preference.

It should not inflate ranking confidence merely because the pair was shown.

It may be used to avoid immediately repeating the same unhelpful pair.

It must not silently set explicit preference state.

## Skip / don't know

No ranking evidence.

It may be retained as interaction history so the selector can avoid immediate repetition, but it must not:

- change ratings
- increase item ranking confidence
- increase scope ranking confidence

The current initial implementation counts shown skip/neither records toward comparison/confidence counts. M6 should correct that behavior.

---

# Category ranking hardening

The initial ranking engine already supports:

- per-category ranking
- Elo-style recalculation
- comparison counts
- rough confidence
- close/under-compared pair selection

M6 should add explicit eligibility and stronger evidence semantics.

## New-item behavior

A newly added catalog item:

- starts with no comparison evidence
- remains low confidence
- should receive enough priority to establish approximate placement
- must not reset existing category history

Stable IDs make this additive behavior possible.

---

# Finalist promotion

## Current imported behavior

The current funnel:

- ignores untouched categories entirely
- takes up to the current Top 5 from each category that has at least one category comparison
- builds Overall from that filtered pool
- retains raw Overall comparisons as the pool grows

This fixes the original bug where untouched categories could contribute arbitrary default-rated/alphabetical finalists.

The finalist pool is still recalculated from the **current** Top 5 of each ranked category.

That leaves two hardening questions:

1. one comparison is enough to make a category eligible even if its ordering is still extremely rough
2. an item can fall out of the current Top 5 after already accumulating Overall comparison history

## M6 contract

Finalist promotion should require meaningful evidence.

Exact thresholds should remain configurable, but promotion should consider:

- category confidence
- per-item comparison evidence
- current rank
- explicit eligibility

Example conceptual rule:

```text
eligible
AND category has minimum evidence
AND item has minimum comparison evidence
AND rank <= finalistCount
```

Do not lock threshold numbers until hands-on testing.

## Persistent overall candidate pool

Once an item has participated in Overall comparisons, do not make that history effectively disappear merely because its category rank later moved from #5 to #6.

Recommended behavior:

- persist promoted finalist IDs
- add newly eligible finalists over time
- keep previously promoted items unless explicitly excluded/reset
- derived overall ranking uses the persisted eligible candidate pool

This fulfills the original ranking design's requirement to preserve finalist participation independently from live category order.

---

# Ranking tests

The initial ranking slice has build coverage but no dedicated ranking test suite.

M6 should add focused tests before ranking logic becomes profile-critical.

Minimum cases:

- left/right Elo update
- equal/tie behavior
- neither does not change rating/confidence
- skip does not change rating/confidence
- category scope isolation
- overall scope isolation
- excluded items never selected
- pair selector avoids immediate duplicate/redundant pairs
- stable IDs preserve comparison history
- finalist promotion requires evidence
- persisted finalist pool survives category reorder
- catalog additions do not invalidate existing rankings

Do not require a broad testing framework rewrite; add the smallest reliable test setup needed.

---

# Ranking UI relationship

The existing This-or-That UI is an M6 asset, not a throwaway prototype.

M6 may refine navigation/session UX, but catalog integration should not be blocked on perfecting every ranking interaction.

Required product semantics:

- comparison cards use stable catalog IDs
- exclusions are respected
- raw comparison history autosaves
- category ranking remains independently viewable
- overall ranking remains separately viewable
- ranking confidence reflects actual ordering evidence
- explicit state can be edited independently through the catalog table/list

---

# Explicit preference UI

Do not make the user complete a 551-row checklist.

The primary explicit-preference surface is the searchable/filterable catalog table/list.

Ranking remains a separate mini-game.

Minimum viable requirement:

> A user can find a catalog item and directly mark it Love / Like / Curious / Unsure / Not Interested / Hard Limit / Not Applicable without needing to rank it or complete its category.

The table may show derived category/overall ranking context for that same Catalog ID, but ranking does not write explicit state and explicit positive state does not seed ranking.

Hard Limit must be easy to set and clearly distinct from ordinary Not Interested.

---

# Inferred catalog affinity

## Important C4/M7 boundary

M6 owns:

- stable catalog mappings to SignalIds
- explicit preference semantics
- raw pairwise evidence
- a pure affinity calculation contract
- source-aware catalog evidence snapshots/selectors
- exclusion/override rules
- the no-feedback-loop contract
- the catalog → signal projection contract for **independent** explicit/pairwise evidence

M6 C4 may centralize quiz-signal → catalog inference so the catalog can have a useful inferred starting point after quizzes. That inference remains derived and must never be persisted as explicit preference.

M7 owns:

- the final canonical **cross-source** SignalId profile
- deduplicating/weighting independent quiz + direct catalog evidence
- updating profile radars/facets from that canonical evidence
- profile-wide confidence/coverage and source drill-down
- profile-wide inferred exploration UI

Do **not** feed inferred catalog affinity back into signals. Do **not** use a resolved/merged catalog presentation value as if it were raw evidence.

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md).

## Affinity function

M6 may implement/test a pure matcher that accepts a supplied known signal profile.

Conceptual result:

```ts
type CatalogAffinity = {
  catalogItemId: CatalogItemId;
  score: number;
  coverage: number;
  matchedSignals: SignalId[];
};
```

Conceptual calculation:

```text
weighted known-signal match
---------------------------
mapped signal weight with evidence
```

Missing signal evidence is unknown, not zero.

## Coverage

A high affinity supported by one weakly mapped signal is not equivalent to a high affinity supported by several defining signals.

Retain coverage/evidence strength separately.

## Language

Inference wording should remain tentative.

Prefer:

> Rope bondage may be worth exploring.

Avoid:

> You like rope bondage.

## Explicit override rules

- hard_limit: never recommend
- not_interested: do not recommend by default
- not_applicable: do not recommend
- love / like: explicit state is stronger than inference
- curious: inference may explain why it appears relevant
- unsure / unanswered: inference may suggest exploration, with evidence language

Inference never downgrades or overwrites explicit state.

---

# Risk metadata

Catalog risk metadata is descriptive/contextual.

Do not use risk level to reduce an item's preference or affinity score.

Example:

```text
high inferred affinity + high risk
```

should not become:

```text
low affinity
```

Those are different dimensions.

Risk/context can influence presentation, educational content, or future filtering.

It should not secretly modify what the profile says the user may like.

---

# Catalog versioning and evolution

Stable IDs make normal additions non-breaking.

## Additive change

Adding a new item:

- new stable Catalog ID
- no existing comparison migration
- no existing preference migration
- item starts unknown/unranked

## Label/description change

Keep the same Catalog ID.

No user-state migration needed.

## Category move

Keep the same Catalog ID.

If Category ID changes intentionally, category-scoped comparison history needs explicit migration semantics.

Prefer correcting category labels without changing stable Category ID when the conceptual category remains the same.

## Merge/duplicate cleanup

Never silently delete an ID with user history.

Define an alias/replacement mapping:

```text
old Catalog ID → canonical Catalog ID
```

and migrate preferences/comparisons explicitly.

## Removal

Prefer a status such as archived/deprecated over hard deletion when user state may reference the item.

---

# What M6 should expose to M7

M7 should not need to understand TSV parsing or ranking internals.

M6 should expose clean derived interfaces such as:

```ts
getCatalogItem(id)
getCatalogPreference(id)
getCategoryRanking(categoryId)
getOverallRanking()
getExplicitFavorites()
getHardLimits()
getCatalogMappings(id)
calculateCatalogAffinity(item, canonicalSignals)
```

Exact API names are implementation details.

The boundary is the important part:

> M6 owns catalog semantics; M7 consumes them.

---

# M6 implementation slices

## C0 — Already landed baseline ✅

From the imported pre-migration baseline:

- [x] repo-native TSV runtime catalog source
- [x] generated runtime catalog module
- [x] basic category normalization
- [x] runtime description/role/mode/intensity/risk metadata
- [x] raw pairwise comparison model
- [x] local comparison persistence
- [x] basic Elo-style recalculation
- [x] within-category ranking
- [x] Top-5-per-ranked-category finalist calculation
- [x] cross-category ranking
- [x] Quick / Standard / Deep Dive / Gremlin sessions
- [x] category and overall ranking views
- [x] category progress-map home
- [x] continue-where-you-left-off / next-category navigation
- [x] Overall destination card from category home
- [x] untouched categories excluded from finalist promotion
- [x] hub entry point

## C1 — Durable catalog identity ✅

- [x] add explicit Catalog IDs to source TSV
- [x] add explicit Category IDs
- [x] seed IDs from the exact pre-C1 generated IDs
- [x] update generator to require explicit IDs
- [x] validate duplicate/missing IDs
- [x] validate category ID/label consistency
- [x] preserve existing comparison compatibility
- [x] add validated `catalog-id-replacements.tsv` migration support

## C2 — Catalog metadata + mapping schema ✅

- [x] category metadata for all 35 stable categories
- [x] broad domain + display order
- [x] receiving / giving / both normalized direction
- [x] `catalog-aliases.tsv`
- [x] category-default + item-specific `catalog-signal-mappings.tsv`
- [x] build-time validation for mapping scopes / IDs / direction / SignalIds / controlled weights
- [x] generated runtime domains / direction / aliases / resolved mappings
- [x] risk/context metadata remains descriptive-only

Current seeded mapping layer:

- 93 source mapping rules
- 269 / 551 catalog items resolve to one or more core signals
- 698 resolved item → signal associations
- 282 items intentionally remain unmapped where M2–M5 do not provide defensible evidence

Unmapped means **unknown / not inferable from current quiz signals**, not 0% affinity.

## C3 — Explicit preference + catalog table ✅

See [M6 C3 — Explicit Preference + Catalog Table](m6-c3-explicit-preference.md) for the concrete implementation plan and acceptance scenarios.

- [x] define the seven-state runtime enum
- [x] represent unanswered by absence
- [x] support optional overall / receiving / giving state per Catalog ID
- [x] implement directional override resolution without synthesizing a generic value
- [x] create `pet-profile-catalog-v1`
- [x] migrate raw ranking history from `pet-profile-kink-ranking-v1`
- [x] canonicalize migrated Catalog IDs through C1 replacement mappings
- [x] keep the legacy ranking key untouched during the migration window; no long-term dual-write
- [x] add a first-class catalog/preferences table/list destination
- [x] search by label + aliases
- [x] filter by category + explicit state + unanswered
- [x] responsive desktop table / mobile rows
- [x] compact overall-state editor + expandable item details
- [x] show read-only category/overall ranking context by stable Catalog ID where useful
- [x] keep This-or-That focused on pairwise ranking with no embedded preference editor
- [x] keep explicit-state actions separate from pairwise choices
- [x] make Hard Limit visibly distinct from Not Interested
- [x] exclude hard_limit / not_interested / not_applicable from new pair selection
- [x] preserve love / like / curious / unsure / unanswered as ranking-eligible
- [x] handle scopes with fewer than two eligible items without a blank/dead ranking state
- [x] add focused preference/storage/migration/eligibility tests

## C4 — Source-aware evidence convergence

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md).

- [ ] define source-aware evidence IDs/types for quiz, explicit catalog, pairwise, and derived inference
- [ ] wrap C3 explicit state + raw comparisons as independent evidence sources
- [ ] expose a per-Catalog-ID evidence snapshot without collapsing source values
- [ ] centralize coverage-aware quiz-signal → catalog inference
- [ ] never persist inferred affinity as explicit preference
- [ ] retain matched SignalIds/provenance for inference
- [ ] define catalog → signal projection semantics for independent explicit/pairwise evidence
- [ ] prohibit inferred affinity/resolved values from feeding back into signals
- [ ] define quiz-retake replacement/deduplication behavior
- [ ] recompute derived catalog views without destroying unrelated source evidence
- [ ] retain affinity separately from confidence/coverage
- [ ] add source-isolation, exclusion-authority, and no-feedback-loop tests

## C5 — Ranking hardening
- [ ] stop skip from increasing ranking confidence
- [ ] stop neither from inflating ordering confidence
- [x] prevent untouched categories from contributing finalists
- [ ] define whether more than one comparison is required before finalist promotion
- [ ] persist overall finalist/candidate membership or otherwise preserve prior Overall participants
- [ ] keep existing Overall comparison history meaningful when category Top 5 changes
- [ ] add focused ranking tests

## C6 — Catalog result integration

- [ ] show explicit state alongside category rank
- [ ] show explicit state alongside overall rank
- [ ] expose category ranking independently
- [ ] expose overall favorites independently
- [ ] show inference-only starting affinity separately from direct evidence
- [ ] preserve source provenance/explainability in catalog result views
- [ ] expose hard-limit/exclusion summaries without mixing them into favorites
- [ ] keep exact ranks derived rather than persisted where practical

## C7 — Signal affinity hardening

- [ ] harden the coverage-aware catalog affinity matcher introduced/centralized in C4
- [ ] test mapping/coverage/override behavior with synthetic signal profiles
- [ ] suppress hard limits/not-interested/not-applicable
- [ ] retain matched-signal explainability
- [ ] use tentative exploration language for inference-only items
- [ ] ensure catalog → signal projection accepts only independent direct catalog evidence
- [ ] defer final canonical cross-source aggregation + profile-wide radar/recommendation UI to M7

---

# M6 exit condition

M6 is complete when:

1. the 551-item catalog has durable identities independent of labels
2. runtime catalog data is generated from validated repo-native sources
3. users can explicitly classify individual items without completing the entire catalog
4. explicit exclusions control ranking eligibility
5. pairwise ranking remains recalculable from raw history and has trustworthy confidence semantics
6. overall finalist participation does not disappear because a category ranking shifts
7. catalog items have validated SignalId mappings
8. explicit preference, pairwise evidence, inferred affinity, and resolved views are represented as different concepts
9. source provenance makes independent vs derived evidence explicit
10. quiz-derived catalog inference cannot feed back into the signals that produced it
11. changing one evidence source preserves unrelated source evidence
12. a pure affinity matcher exists without duplicating M7's final cross-source profile aggregation
13. M7 can consume direct catalog evidence/mappings through a clean boundary

The catalog should feel like an enrichment layer and exploration tool, not a 551-question obligation.

---

# C3 implemented decisions

The decisions below are now implemented and form the handoff contract for C4:

1. **Seven-state enum:** Love / Like / Curious / Unsure / Not Interested / Hard Limit / Not Applicable.
2. **Unknown semantics:** unanswered is absence; clearing the last stored state removes the preference record.
3. **Direction model:** persist optional overall / receiving / giving values now; initial C3 UI edits overall only.
4. **Direction resolution:** receiving/giving overrides beat overall only in that directional context; directional values never synthesize a generic overall state.
5. **Storage boundary:** create `pet-profile-catalog-v1` with preferences + raw comparisons; do not persist Overall finalist membership yet.
6. **Migration:** preserve raw ranking evidence exactly, canonicalize item IDs through the C1 replacement map, leave the legacy key untouched for one migration window, and do not dual-write.
7. **Editing UX:** explicit preference lives in a searchable/filterable catalog table/list; This-or-That stays a simple ranking mini-game.
8. **Interconnection:** table rows may show read-only category/overall rank context by the same Catalog ID without collapsing the signals.
9. **Safety/exclusion semantics:** Hard Limit is visually distinct and, along with Not Interested / Not Applicable, immediately removes the item from future pair selection.
10. **Evidence separation:** pairwise choices never infer explicit state, explicit-state edits never create pairwise wins, and positive explicit state does not seed rank.
11. **Next boundary:** C4 adds source-aware evidence convergence, quiz-derived catalog inference, provenance, retake/recompute semantics, and the no-feedback-loop contract. Ranking confidence/finalist hardening moves to C5.

These decisions now define the durable C3 boundary. C4 should build source-aware adapters/selectors and derived evidence around this store rather than rewrite C3 persistence without a concrete versioning need.
