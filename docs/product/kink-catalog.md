# Kink Catalog

This document defines the current product and data contract for the kink catalog: stable catalog definitions, explicit user preference state, browsing, resolved catalog results, and the boundaries between catalog state, pairwise ranking, and inferred affinity.

## Product boundary

The catalog supports three distinct jobs around the same stable Catalog ID:

```text
CATALOG DEFINITION
what the item is
        │
        ├───────────────┐
        ▼               ▼
EXPLICIT PREFERENCE   PAIRWISE RANKING
what I state          what I choose relatively
        │               │
        └───────┬───────┘
                │
                ▼
        RESOLVED CATALOG VIEW

CANONICAL PROFILE SIGNALS
                │
                ▼
       INFERRED CATALOG AFFINITY
```

These layers share identity. They do **not** become interchangeable evidence.

The catalog contract owns:

- stable Catalog IDs and Category IDs;
- human-editable catalog/reference sources and generated runtime definitions;
- category/domain/alias/direction/descriptive metadata;
- catalog-to-Signal mappings;
- explicit per-item preference state;
- browser-local catalog-profile persistence;
- browse/filter/edit behavior;
- the joined catalog result view;
- explicit exclusion/suppression behavior.

The catalog contract does **not** own:

- the This-or-That ranking algorithm or ranking-run history;
- canonical Signal/channel aggregation;
- cross-source evidence weighting;
- overall profile scoring;
- Rewards & Punishments contextual semantics;
- Scene Builder eligibility/composition rules.

Those systems consume catalog identity and/or catalog results through their own contracts.

## Source data ownership

### Runtime catalog source

The human-editable catalog lives under `reference/catalog/`.

Primary and supporting runtime sources are:

- `kink-catalog.tsv` — item identity and descriptive fields;
- `catalog-categories.tsv` — stable category identity, domain, and display order;
- `catalog-aliases.tsv` — alternate terminology for existing items;
- `catalog-signal-mappings.tsv` — category/item mappings to canonical Signal IDs;
- `catalog-id-replacements.tsv` — explicit migration map from retired Catalog IDs to current IDs.

Other files in `reference/catalog/` may support curation/research and are not automatically runtime schemas.

The historical XLSX is reference material, not a browser/runtime input format.

### Generated runtime module

`scripts/generate-kink-catalog.mjs` validates the TSV sources and writes:

```text
src/data/kinkCatalog.generated.ts
```

Application code consumes the generated TypeScript model. The browser does not parse the TSV/XLSX sources directly.

## Stable identity

Catalog and Category IDs are explicit lowercase kebab-case identifiers.

A label is presentation text, not identity.

Therefore:

```text
label rename ≠ Catalog ID rename
category label rename ≠ Category ID rename
row reorder ≠ identity change
```

A deliberate Catalog ID replacement belongs in `catalog-id-replacements.tsv`.

The generator rejects replacement entries when:

- the old ID still exists as an active catalog item;
- the replacement target does not exist;
- an old ID appears more than once;
- old and new IDs are identical;
- either ID violates the stable-ID format.

Persisted catalog/ranking loaders use the replacement map where compatibility requires canonicalization.

## Generated catalog item model

Current generated item shape is:

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
  intensity: string;
  riskLevel: string;
};
```

Categories contain:

```ts
type KinkCatalogCategory = {
  id: string;
  label: string;
  domain: KinkCatalogDomain;
  displayOrder: number;
  itemCount: number;
  signalMappings: readonly KinkCatalogCategorySignalMapping[];
};
```

### Category and domain semantics

Categories are stable browse/ranking groups.

Domains are broader organization metadata used for grouping/filtering/presentation. They are not quiz sections, Overall Facets, Dynamic Modes, or authority roles.

Each active Category ID must have exactly one category metadata entry and one consistent label across the active catalog sources.

### Aliases

Aliases are alternate terminology attached to a canonical Catalog ID.

They support search and terminology variation without creating duplicate catalog identities or separately rankable items.

## Catalog direction and mapping applicability

Catalog items normalize activity direction to:

- `receiving`;
- `giving`;
- `both`.

This is catalog activity-side metadata. It is not authority and must not be interpreted as Dominant/Submissive meaning.

See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

Signal-mapping source rows may declare `Applies To` as:

- `any`;
- `receiving`;
- `giving`.

The generator resolves that applicability against the item's catalog direction before producing the item's runtime `signalMappings` list.

For a `both` item, receiving- and giving-applicable mappings may both apply.

`Applies To` is therefore an **authoring applicability rule**, not a second Signal identity system. The resulting mapping still points at one canonical `SignalId` plus a weight.

See [Signal + Channel Data Model](../data-model/signal-channel-model.md) for canonical Signal/channel semantics.

## Catalog-to-Signal mappings

Mappings are authored at either:

- category scope; or
- individual item scope.

Item-specific mappings can refine the resolved mapping set for that item.

Every mapping must reference a currently valid `SignalId` and use a finite weight from `0` through `1`.

The generator validates:

- mapping scope;
- scope identity;
- applicability value;
- Signal ID existence;
- weight range;
- duplicate scope/applicability/Signal combinations.

Catalog mappings express semantic association. They do not themselves create user evidence.

A catalog item existing with a Signal mapping does not imply that the user likes that item or possesses that Signal strongly.

## Explicit preference model

Explicit catalog preference is a direct user statement.

Current states are:

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

**Unanswered is absence.** There is no stored `unknown`/`unanswered` preference state.

This distinction matters:

```text
no explicit value
≠
explicitly chose Unsure
```

`hard_limit` is a boundary state, not merely a very low numeric preference.

## Direction-capable explicit preferences

Per-item explicit state currently supports:

```ts
type CatalogPreferenceContext =
  | "overall"
  | "receiving"
  | "giving";

type CatalogItemPreference = {
  overall?: CatalogPreferenceState;
  receiving?: CatalogPreferenceState;
  giving?: CatalogPreferenceState;
  updatedAt: string;
};
```

Context lookup follows fallback semantics:

```text
overall   → overall → unanswered
receiving → receiving override → overall → unanswered
giving    → giving override    → overall → unanswered
```

Directional overrides do not synthesize a replacement Overall value.

Example:

```text
Impact play
Overall:   Like
Receiving: Hard Limit
Giving:    Love
```

is valid state. A direction-aware consumer must preserve the distinction.

Clearing the final stored context from an item removes the item's empty preference record.

## Explicit preference and ranking are independent

Direct catalog editing and This-or-That answer different questions.

```text
explicit preference
"How do I feel about this item?"

pairwise ranking
"Which of these eligible items pulls me more?"
```

Therefore:

- editing a preference does not create a pairwise comparison;
- a pairwise choice does not create an explicit preference;
- Love does not seed or boost Elo;
- Neither does not become Not Interested;
- Skip does not become Unsure;
- an unanswered item may still have pairwise ranking evidence;
- a strongly positive item may rank below other strongly positive items.

See [Kink This-or-That Ranking](../kink-this-or-that-ranking.md) for the ranking contract.

## Exclusions and ranking eligibility

Three Overall explicit states exclude an item from **new ordinary This-or-That pairs**:

- `hard_limit`;
- `not_interested`;
- `not_applicable`.

Other states and unanswered items remain eligible.

Excluding an item does not erase historical pairwise records. Clearing the exclusion can make the item eligible again.

Historical ranking evidence and current eligibility are intentionally different concerns.

## Catalog-profile persistence

Catalog user state is stored under:

```text
pet-profile-catalog-v1
```

Conceptually:

```ts
type CatalogProfileState = {
  schemaVersion: 1;
  preferences: Record<string, CatalogItemPreference>;
  comparisons: KinkComparison[];
  rankingHistory?: KinkRankingHistory;
};
```

Explicit preferences and ranking evidence share a persistence envelope because both are keyed by stable Catalog identity and move together during profile backup/restore.

Sharing one envelope does **not** make them one evidence source.

Current loaders normalize ranking history so every persisted comparison can resolve to the active or archived run model used by the ranking contract.

Legacy ranking-only storage is a compatibility input when the catalog-profile store does not yet exist. Migration preserves valid raw comparisons and does not infer explicit states from them.

See [Profile Management](profile-management.md) for backup/reset lifecycle behavior.

## Browse / Preferences surface

The catalog has a direct-management surface separate from the pairwise mini-game.

Current browsing behavior includes:

- search across canonical item labels and aliases;
- category filtering;
- explicit-state filtering, including unanswered / Not set;
- grouping by generated category order;
- compact explicit Overall-preference editing;
- expandable catalog metadata/details;
- read-only joined evidence/ranking context;
- explicit limit/exclusion summaries.

The surface is not a questionnaire and does not require every catalog row to receive an explicit state.

The current direct editor changes the Overall explicit preference. Direction-specific state remains supported by the persistence/consumer contract even where a specific UI does not expose every context for editing.

## Resolved catalog result view

`buildCatalogResultView()` joins catalog definitions with current user/profile information by stable Catalog ID.

For each item it may expose:

```ts
type CatalogResultItem = {
  item: KinkCatalogItem;
  explicitState?: CatalogPreferenceState;
  categoryRank?: CatalogRankContext;
  overallRank?: CatalogRankContext;
  inferred?: CatalogInferenceResult;
  meaningfulPairwiseComparisons: number;
  excludedFromNewRanking: boolean;
};
```

This is a **read model**, not another authoritative persistence source.

### Ranking fields

Category and Overall ranks are derived from current active-run pairwise evidence and only appear when the item has meaningful ranking comparisons in that scope.

### Inferred affinity

Inferred affinity is derived from profile Signal evidence through the source-aware evidence architecture.

It exposes affinity, coverage, and matched-Signal explanation data without writing that inference back into explicit catalog preference.

See [Source-Aware Profile Evidence Architecture](../profile-evidence-architecture.md).

### Exclusion summary

The result view separately indexes explicit:

- Hard Limits;
- Not Interested items;
- Not Applicable items.

These are direct explicit states, not inferred low affinity.

## Recommendation boundary

Catalog recommendations preserve direct/inferred provenance.

Current recommendation projection separates inferred items into:

1. **inference only** — no explicit state and no meaningful pairwise evidence;
2. **inference with independent direct evidence** — the item also has explicit and/or meaningful pairwise evidence;
3. **suppressed** — inference exists, but explicit state is Hard Limit, Not Interested, or Not Applicable.

Suppressed inference can remain inspectable for explanation/debugging, but the explicit exclusion controls recommendation eligibility.

The user-facing inference label is deliberately tentative: `May be worth exploring`.

Inference must never overwrite or weaken an explicit boundary.

## Source-aware evidence boundary

Catalog definition, explicit preference, pairwise ranking, and inferred affinity are different layers.

The no-feedback-loop invariant is:

```text
quiz/canonical Signal evidence
        ↓
derived catalog inference
        ✕
must not be written back as explicit preference
        ✕
must not be back-projected as independent evidence into the Signals that created it
```

Independent direct catalog evidence may participate in profile aggregation where explicitly defined by the evidence architecture. Derived catalog inference may not masquerade as a new direct source.

## Integration boundaries

### Overall profile

The profile may consume explicit catalog and active-run pairwise evidence through source-aware adapters. It should not persist the resolved catalog result view as a second authority.

### Rewards & Punishments

Rewards & Punishments may reference catalog items as primitives, but reward/punishment suitability is its own contextual state. Catalog interest does not automatically make an item a valid punishment.

See [Rewards & Punishments](rewards-punishments.md).

### Scene Builder

Scene Builder consumes the resolved catalog result view and applies its own session, exploration, theme, intensity, and eligibility rules.

See [Scene Builder](scene-builder.md).

## Invariants

Future changes should preserve these boundaries unless the product deliberately changes them:

1. **Stable IDs are identity; labels are presentation.**
2. **Aliases never create duplicate rankable items.**
3. **Catalog direction is activity-side metadata, not authority.**
4. **Mapping applicability chooses whether a canonical Signal mapping applies; it is not a second Signal identity system.**
5. **Catalog mappings describe the item; they are not user preference evidence.**
6. **Unanswered explicit preference is absence, not Unsure.**
7. **Overall, Receiving, and Giving explicit contexts may differ without being collapsed.**
8. **Explicit preference and pairwise ranking remain independent evidence sources.**
9. **Explicit exclusions affect current eligibility without deleting history.**
10. **Derived catalog inference never becomes explicit state.**
11. **Explicit Hard Limit / Not Interested / Not Applicable suppress recommendation eligibility even when inferred affinity is high.**
12. **Resolved catalog results are derived read models, not persistence authorities.**
13. **The browser consumes generated catalog data; it does not parse the source TSV/XLSX files at runtime.**

## Primary implementation references

- `reference/catalog/kink-catalog.tsv`
- `reference/catalog/catalog-categories.tsv`
- `reference/catalog/catalog-aliases.tsv`
- `reference/catalog/catalog-signal-mappings.tsv`
- `reference/catalog/catalog-id-replacements.tsv`
- `scripts/generate-kink-catalog.mjs`
- `src/lib/catalogProfile.ts`
- `src/lib/catalogProfileStorage.ts`
- `src/lib/catalogResults.ts`
- `src/lib/catalogRecommendations.ts`
- `src/KinkCatalogPreferences.tsx`

The code, generator validation, and focused tests remain authoritative when implementation and documentation disagree.
