# Roadmap

Fast vertical slices, minimal ceremony.

The goal is to keep the project organized without turning a fun side project into enterprise program management.

---

## Status

| Milestone | State | Purpose |
| --- | --- | --- |
| M0 | ✅ Complete | prove the basic quiz/results experience |
| M1 | ✅ Complete | make the app capable of multiple independent quizzes |
| M2 | ✅ Complete | build the first real signal-weighted D/s quiz |
| M3 | ✅ Complete | add Roles & Headspaces |
| M4 | ✅ Complete | add Bondage & Discipline |
| M5 | ✅ Complete | add Sadism & Masochism |
| M6 | ✅ Complete | integrated, source-aware, hardened kink catalog |
| M7 | 🚧 In progress | build the full aggregated profile |
| M8 | Optional | add quiz depth/adaptive follow-ups |
| M9 | Planned | settings, profile lifecycle, portability, and sharing |
| M10 | Optional | cloud persistence |

---

## M0 — Prototype ✅

**Status:** complete

Prove the basic experience.

- [x] React + TypeScript + Vite
- [x] GitHub Pages deployment
- [x] GitHub CI
- [x] simple questionnaire
- [x] browser-local autosave
- [x] ranked percentage results
- [x] radar/spider chart
- [x] responsive layout

The M0 scoring model is intentionally simplistic and remains only in the Starter Profile sampler.

---

## M1 — Quiz Hub + Multi-Quiz Architecture ✅

**Status:** complete

Turn the single prototype into a reusable quiz platform.

### Product

- [x] quiz hub showing independent sections
- [x] not started / in progress / complete / coming soon states
- [x] resume partially completed quizzes
- [x] reopen results for completed quizzes
- [x] overall-profile shell that treats unexplored sections as unknown
- [x] preserve the original questionnaire as a Starter Profile sampler

### Technical

- [x] introduce `QuizDefinition`
- [x] separate quiz definitions from question data
- [x] version browser-local profile storage
- [x] migrate the original prototype storage shape
- [x] persist progress/completion per quiz
- [x] make results section-aware

### Core section definitions

- [x] Bondage & Discipline
- [x] Dominance & Submission
- [x] Sadism & Masochism
- [x] Roles & Headspaces

**Exit condition:** the app can host multiple quizzes even while only the Starter Profile has a real question bank. ✅

---

## M2 — Dominance & Submission Quiz ✅

**Goal:** build the first real section using the signal-weighted model in [docs/scoring-model.md](docs/scoring-model.md).

Why D/s first: it exposes the distinction between activity, power exchange, and headspace better than the prototype questionnaire.

### Design

- [x] lock nine independent D/s signal definitions
- [x] draft an 18-question standard bank
- [x] define the initial weight matrix
- [x] define scoring/coverage and result boundaries
- [x] explicitly defer forced role labels, headspace scoring, and catalog inference

See [docs/m2-ds-design.md](docs/m2-ds-design.md).

### Initial signals

- [x] receiving control
- [x] giving control
- [x] responsibility transfer
- [x] service
- [x] obedience
- [x] structure
- [x] ownership symbolism
- [x] praise / approval
- [x] autonomy

### Questionnaire

- [x] define the M2 signal vocabulary in code/config
- [x] encode the reviewed 18-question standard bank
- [x] measure important signals with multiple prompts
- [x] allow a question to contribute to multiple signals
- [x] avoid direct label/self-identification questions where possible
- [x] calculate score coverage internally

### Results

- [x] ranked D/s signal results
- [x] D/s radar chart
- [x] short descriptive result copy
- [x] distinguish unknown/low-coverage data from low interest

**Exit condition:** results reveal underlying D/s preferences rather than merely repeating direct answers.

---

## M3 — Roles & Headspaces ✅

**Goal:** identify recognizable roles/headspaces while preserving the underlying psychological modes that explain why they resonate.

See [docs/m3-headspaces-direction.md](docs/m3-headspaces-direction.md) for the implemented v3 contract.

### Taxonomy

- [x] separate reusable signals from composed results
- [x] separate **dynamic modes** from actual **roles/headspaces**
- [x] keep roles/headspaces overlapping rather than mutually exclusive
- [x] represent both receiving-side and giving-side roles
- [x] keep M3 independently completable without requiring M2
- [x] defer cross-quiz evidence merging to M7

### Implemented roles / headspaces

- [x] Pet
- [x] Slave
- [x] Little
- [x] Middle
- [x] Brat
- [x] Prey
- [x] Service Submissive
- [x] Devotional Submissive
- [x] Property / Object
- [x] Owner / Handler
- [x] Caregiver
- [x] Brat Tamer
- [x] Predator
- [x] Trainer
- [x] Master / Mistress

### Explanatory dynamic modes

- [x] Nurtured Play
- [x] Devotion
- [x] Service
- [x] Protocol
- [x] Surrender
- [x] Playful Resistance
- [x] Objectification
- [x] Caretaking
- [x] Authority
- [x] Claiming
- [x] Training / Shaping
- [x] Primal / Feral

### Work

- [x] generalize D/s-specific signals into shared signal primitives
- [x] add M3-specific role/headspace signals
- [x] add younger-headspace evidence for Little/Middle
- [x] add directional primal/pursuit evidence for Prey/Predator
- [x] encode the 32-question M3 v3 bank
- [x] calculate signal coverage
- [x] calculate role/headspace composition + coverage
- [x] calculate dynamic-mode composition + coverage
- [x] render roles/headspaces as primary ranked results
- [x] split receiving/submissive and giving/dominant headspace radars
- [x] add an underlying dynamic-modes radar
- [x] render dynamic modes as explanatory ranked results
- [x] version the expanded M3 taxonomy as quiz version 3

**Exit condition:** the app reports recognizable roles/headspaces such as Pet, Slave, Little, Middle, Brat, Prey, and Predator while using Surrender, Protocol, Claiming, and similar concepts as explanatory dynamic modes rather than mislabeled identities.

---

## M4 — Bondage & Discipline ✅

**Goal:** model physical restraint and structural discipline without conflating direction, restraint, protocol, accountability, or pain.

See [docs/m4-bd-design.md](docs/m4-bd-design.md) for the implemented contract.

### Design direction

- [x] separate Receiving Restraint from Giving Restraint
- [x] separate Receiving Positioning from Giving Positioning
- [x] separate Receiving Discipline from Giving Discipline
- [x] distinguish physical restraint from Control Through Constraint
- [x] keep Challenge / Escape independent from general restraint affinity
- [x] explicitly keep pain/S&M signals out of M4
- [x] keep direct gear/item preferences in M6 rather than the questionnaire
- [x] draft a 26-question weighted bank
- [x] define Bondage / Physical Control radar axes
- [x] define Discipline / Structural Control radar axes
- [x] review/approve the M4 design before implementation

### Implemented signals

- [x] receiving_restraint
- [x] giving_restraint
- [x] movement_restriction
- [x] receiving_positioning
- [x] giving_positioning
- [x] receiving_constraint_control
- [x] giving_constraint_control
- [x] receiving_discipline
- [x] giving_discipline
- [x] accountability
- [x] anticipation
- [x] challenge_escape

### Implementation

- [x] add approved M4 signal IDs/definitions to shared config
- [x] encode the approved M4 question bank and weights
- [x] enable Bondage & Discipline in the quiz hub
- [x] calculate M4 signal scores + coverage
- [x] render unified ranked M4 results
- [x] render Bondage / Physical Control radar
- [x] render Discipline / Structural Control radar
- [x] preserve M2/M3 section-local results
- [x] keep M5 pain signals and M6 catalog inference out

**Exit condition:** two users can have similarly high general B&D interest but visibly different profiles across restraint direction, positioning, constraint control, discipline, accountability, ritual/structure, anticipation, and challenge/escape.

---

## M5 — Sadism & Masochism ✅

**Goal:** model consensual pain, physical intensity, endurance, challenge, anticipation, and emotional intensity without collapsing them into one S/M score.

See [docs/m5-sm-design.md](docs/m5-sm-design.md) for the implemented contract.

### Design direction

- [x] separate Pain Receiving from Pain Giving
- [x] separate Receiving Intensity from Giving Intensity
- [x] distinguish Pain from general Physical Intensity
- [x] distinguish Endurance from Intensity
- [x] distinguish Challenge from Intensity/Endurance
- [x] make Endurance directional
- [x] make Challenge directional
- [x] reuse shared Anticipation where semantics match
- [x] add Emotional Intensity as an independent signal
- [x] explicitly keep Discipline and Restraint out of M5 scoring
- [x] keep specific techniques/items in M6 rather than the questionnaire
- [x] draft a 26-question weighted bank
- [x] define Receiving / Masochistic radar axes
- [x] define Giving / Sadistic radar axes
- [x] review/approve the M5 design before implementation

### Implemented signals

- [x] pain_receiving
- [x] pain_giving
- [x] receiving_intensity
- [x] giving_intensity
- [x] receiving_endurance
- [x] giving_endurance
- [x] receiving_challenge
- [x] giving_challenge
- [x] emotional_intensity

### Reused shared signal

- [x] anticipation

### Implementation

- [x] add approved M5 signal IDs/definitions to shared config
- [x] encode the approved 26-question M5 bank and weights
- [x] enable Sadism & Masochism in the quiz hub
- [x] calculate M5 signal scores + coverage
- [x] render unified ranked M5 results
- [x] render Receiving / Masochistic radar
- [x] render Giving / Sadistic radar
- [x] preserve M2–M4 section-local results
- [x] keep M6 catalog inference out
- [x] avoid forced Sadist/Masochist identity labels

**Exit condition:** two users can have similarly high general S/M interest but visibly different profiles across pain, physical intensity, endurance, challenge, anticipation, emotional intensity, and receiving/giving direction.

---

## M6 — Catalog Integration ✅

**Goal:** turn the existing 551-item runtime catalog + This-or-That flow into a durable, profile-aware catalog system without turning catalog rows into quiz questions.

See [docs/m6-catalog-integration.md](docs/m6-catalog-integration.md) for the M6 contract and [docs/kink-this-or-that-ranking.md](docs/kink-this-or-that-ranking.md) for pairwise-ranking behavior.

### Imported pre-migration baseline

The repository migration imported the already-working catalog/ranking baseline into the new `kink-profile` history. Old pull-request numbers are intentionally not used as implementation references here.

The checklist below records the imported behavior **as it existed at migration time**. C3–C5 subsequently changed eligibility, meaningful-evidence confidence, finalist promotion, and Overall-candidate continuity without rewriting this historical baseline.

- [x] export the workbook into repo-native TSV reference data
- [x] make `reference/catalog/kink-catalog.tsv` the runtime catalog source
- [x] generate app-owned runtime catalog data before dev/build
- [x] remove runtime XLSX dependency
- [x] expose categories + basic role/mode/intensity/risk metadata
- [x] persist raw pairwise comparisons
- [x] rank within categories
- [x] exclude untouched categories from the Overall finalist pool
- [x] advance the current Top 5 from ranked categories
- [x] cross-rank current finalists
- [x] Quick / Standard / Deep Dive / Gremlin sessions
- [x] category progress-map home
- [x] continue-where-you-left-off + next-category navigation
- [x] separate Overall destination from the category home
- [x] category + overall ranking views
- [x] link ranking from the main hub

### C1 — Durable catalog identity ✅

- [x] add explicit stable Catalog IDs to source data
- [x] add explicit stable Category IDs
- [x] seed IDs from the exact IDs generated by pre-C1 `main`
- [x] update generator validation for missing/duplicate IDs
- [x] validate category ID/label consistency
- [x] preserve existing comparison compatibility
- [x] define validated ID-replacement migration support for merged/deprecated items

### C2 — Metadata + signal mappings ✅

- [x] add category metadata for all 35 stable Category IDs
- [x] define broad domains + display order
- [x] normalize receiving / giving / both direction
- [x] add explicit alias source
- [x] add category-default + item-specific Catalog → SignalId mappings
- [x] validate mapping scopes / IDs / direction / SignalIds / controlled weights at build time
- [x] emit domains / direction / aliases / resolved mappings into generated runtime catalog
- [x] keep risk/context metadata separate from affinity scoring
- [x] preserve the pre-migration seeded mapping layer: 93 source rules, 269 / 551 mapped items, 698 resolved item → signal associations

### C3 — Explicit preference + catalog table ✅

See [docs/m6-c3-explicit-preference.md](docs/m6-c3-explicit-preference.md) for the revised table-first explicit-preference model and the This-or-That mini-game boundary.

- [x] define the canonical seven-state runtime enum
- [x] represent unanswered by absence rather than a fake "unknown" state
- [x] store optional `overall`, `receiving`, and `giving` values per Catalog ID
- [x] resolve directional state as direction override → overall → unanswered
- [x] never synthesize a generic overall state from directional overrides
- [x] create `pet-profile-catalog-v1` as the logical catalog-profile store
- [x] migrate raw comparisons from `pet-profile-kink-ranking-v1` without losing IDs, timestamps, scopes, or results
- [x] keep the old ranking key readable/untouched for the migration window; do not dual-write
- [x] add a first-class catalog/preferences destination separate from This-or-That
- [x] search by canonical label + aliases
- [x] filter by category + explicit state + unanswered
- [x] order/group using category display order + item label
- [x] provide responsive desktop table / mobile stacked rows
- [x] edit the general/overall explicit state directly from each catalog row
- [x] expose expandable item description/metadata without making the default row noisy
- [x] surface read-only category/overall ranking context by the same Catalog ID where available
- [x] keep This-or-That focused on pairwise ranking; do not embed explicit-preference controls in comparison cards
- [x] keep pairwise choices independent from explicit-state edits
- [x] make Hard Limit visually distinct from ordinary disinterest
- [x] immediately exclude Hard Limit / Not Interested / Not Applicable items from new pair selection
- [x] preserve Love / Like / Curious / Unsure / unanswered as ranking-eligible
- [x] handle scopes with fewer than two eligible items without rendering a dead/blank ranking state
- [x] add focused preference/storage/migration/eligibility tests

C3 owns explicit-state semantics, persistence, the catalog-table management surface, migration, and the minimum eligibility behavior required to make exclusions authoritative. C4 now builds source-aware derived evidence around those durable outputs without replacing them.

See [docs/profile-evidence-architecture.md](docs/profile-evidence-architecture.md) for the source-aware profile contract.

### C4 — Source-aware evidence convergence ✅

- [x] define source-aware evidence identities for quiz, explicit catalog, pairwise, and derived inference
- [x] treat C3 explicit state + raw comparisons as independent evidence sources
- [x] expose a derived per-Catalog-ID evidence snapshot without collapsing source values
- [x] centralize coverage-aware quiz-signal → catalog inference using the existing C2 mappings
- [x] never persist quiz-derived catalog inference as explicit preference
- [x] retain matched SignalIds/provenance for inferred affinity
- [x] define catalog → signal projection semantics for independent explicit/pairwise evidence
- [x] prohibit inferred catalog affinity from feeding back into signals
- [x] define quiz-retake source replacement/deduplication semantics
- [x] recompute derived catalog/profile views when quiz, explicit, or pairwise evidence changes
- [x] keep affinity separate from confidence/coverage
- [x] add source-isolation + no-feedback-loop tests
- [x] preserve explicit exclusion authority when direct and inferred evidence conflict
- [x] leave final cross-source signal aggregation/radar UI to M7

**C4 exit condition:** quiz-derived inference, explicit preference, and pairwise evidence can coexist for the same Catalog ID; changing one preserves the others; derived values are recomputable; and circular evidence is impossible by construction.

### C5 — Ranking hardening ✅

- [x] stop Skip from inflating ranking confidence
- [x] stop Neither from inflating ordering confidence
- [x] decide whether one category comparison is sufficient for Top-5 promotion
- [x] preserve prior Overall participants/history when a category Top 5 shifts
- [x] add focused ranking tests

### C6 — Catalog result integration ✅

**Boundary:** surface explicit, pairwise, inferred, and exclusion channels together without synthesizing a new merged profile score/list. Presentation-level aggregation across independent direct sources remains M7.

- [x] show explicit state alongside category rankings
- [x] show explicit state alongside overall favorites
- [x] expose hard-limit/exclusion summaries separately from favorites
- [x] show inferred starting affinity separately from direct preference/ranking evidence
- [x] keep source provenance/explainability available for catalog items
- [x] keep exact ranks derived from raw comparison history where practical
- [x] preserve category and overall ranking as separate useful results
- [x] do not collapse explicit + pairwise evidence into an M7-style Top Overall aggregate

### C7 — Signal-affinity hardening ✅

**Inherited baseline from C4/C6:** inferred affinity is already visibly distinct from explicit preference/pairwise rank; matched SignalId + quiz provenance is already retained; and catalog → signal projection already accepts independent direct catalog evidence only.

C7 hardens recommendation behavior around that existing model:

- [x] harden the pure coverage-aware catalog affinity matcher introduced/centralized in C4
- [x] add synthetic mapping / partial-coverage / unmapped-item edge-case tests
- [x] suppress hard limit / not interested / not applicable items from recommendation candidates while keeping derived evidence inspectable
- [x] use tentative "may be worth exploring" language for inference-only recommendations
- [x] preserve matched-signal + quiz provenance through recommendation filtering/suppression
- [x] regression-test the direct-evidence-only catalog → signal boundary and no-feedback-loop guarantee
- [x] defer canonical cross-source signal input + profile-wide radar/recommendation UI to M7

**Exit condition:** catalog definitions have durable identity; explicit state, relative ranking, and inferred affinity remain separate; ranking history survives normal catalog evolution; exclusions are authoritative; catalog items have validated SignalId mappings; and M7 can consume clean catalog favorites/mappings without understanding TSV/ranking internals.

---

## M7 — Full Overall Profile

**Goal:** turn the independent section + catalog evidence built through M6 into one coherent, source-aware profile.

M1 provides the navigation/progress shell. M7 adds real cross-source aggregation and presentation.

See [docs/profile-evidence-architecture.md](docs/profile-evidence-architecture.md) for the source-aware evidence contract and [docs/overall-profile-aggregation.md](docs/overall-profile-aggregation.md) for the detailed M7 implementation contract.

### Implementation strategy

M7 is intentionally split into **small, independently testable and mergeable slices**.

Do not build the whole profile in one branch. Complete, test, and merge each slice before beginning the next one so data/math problems can be isolated from presentation problems.

Conceptual progression:

```text
raw source evidence
        ↓
canonical signals
        ↓
overall facets
        ↓
profile presentation
        ↓
catalog summaries + drill-down
        ↓
explainability / polish
```

The previous O1–O6 grouping remains useful as a conceptual map:

- **O1 → M7.1**
- **O2 → M7.2**
- **O3 → M7.3–M7.4**
- **O4 → M7.5**
- **O5 → M7.6–M7.9**
- **O6 → M7.10–M7.11**

### M7.1 — Canonical cross-source aggregation + inspection ✅

**Purpose:** make the profile math inspectable before building presentation on top of it.

- [x] consume independent quiz, explicit-catalog, and pairwise-catalog evidence
- [x] merge repeated SignalIds without semantic double-counting
- [x] define deterministic source weighting/deduplication rules
- [x] preserve score separately from coverage/evidence strength
- [x] preserve source traceability for every canonical signal
- [x] replace only the affected quiz contribution on retake
- [x] preserve manual catalog + ranking evidence across quiz retakes
- [x] exclude inferred catalog affinity/resolved views from signal input
- [x] add deterministic aggregation tests
- [x] add a temporary/dev inspection surface showing canonical signal score, coverage, and per-source contributions

**Exit condition:** canonical SignalIds can be inspected and trusted independently of the final profile UI. ✅

### M7.2 — Overall facet model ✅

**Purpose:** turn canonical signals into broad profile themes.

- [x] lock the nine-facet vocabulary without merging distinct concepts for visualization convenience
- [x] lock facet composition weights in `src/data/overallFacets.ts`
- [x] calculate facet affinity + coverage from canonical signals
- [x] preserve unknown evidence as unknown rather than 0%
- [x] preserve receiving/giving metadata for directional facets
- [x] retain source provenance through contributing components
- [x] add deterministic composition tests
- [x] add a temporary facet inspection surface for real-data validation

**Locked facets:** Power Exchange; Structure & Protocol; Ownership & Belonging; Service & Devotion; Care & Nurture; Play & Resistance; Primal & Instinctive; Restraint & Physical Control; Intensity & Pain.

**Exit condition:** broad profile facets are stable enough to present without depending on final profile UI. ✅

### M7.3 — Profile header ✅

**Purpose:** answer "what are the biggest things about this profile?" before showing detail.

- [x] add concise human-readable strongest-theme summary
- [x] add compact Orientation trait
- [x] add compact Headspaces traits
- [x] add compact Dynamic Modes traits
- [x] preserve receiving/giving direction in headline headspaces
- [x] distinguish internal directional states while presenting them as Submissive / Dominant / Dominant + submissive / Context-dependent / Still emerging
- [x] keep receiving/giving implementation vocabulary out of normal header copy and Headspace chips
- [x] suppress low-evidence composed labels rather than overclaim them
- [x] avoid declaring one identity as the user's single result
- [x] keep completion/progress mechanics out of the profile header
- [x] test directional, bidirectional, mixed, sparse, and partial profile cases

**Exit condition:** the header provides a useful standalone summary from real aggregated data. ✅

### M7.4 — Overall radar ✅

**Purpose:** visualize the broad M7 facet model.

- [x] render all nine locked broad facets without merging distinct concepts
- [x] keep unknown axes unscored rather than drawing artificial zero-interest values
- [x] qualify sparse-but-known axes as limited evidence
- [x] keep true known 0% distinct from unknown
- [x] render incomplete profiles as open known-value runs rather than a fabricated closed polygon
- [x] show the M7.3 strongest-theme summary beneath the radar
- [x] retain directional metadata for future dominant/submissive radar modes
- [x] add interactive axis/theme drill-down into the M7.2 facet inspector
- [x] add deterministic full/partial/sparse radar tests

**Exit condition:** the overall radar accurately reflects M7.2 facets and incomplete-profile behavior. ✅

### M7.5 — Headspaces + Dynamic Modes ✅

**Purpose:** add recognizable profile language beneath the broad facets.

- [x] show compact top 5 submissive-oriented Headspaces with percentages
- [x] add Show all / Show less for the full known ranked submissive Headspace list
- [x] show top 5 strongest Dynamic Modes with percentages
- [x] preserve independent overlapping scores
- [x] suppress very sparse composed labels rather than overclaim them
- [x] qualify limited-but-usable evidence
- [x] keep dominant-oriented Headspace presentation parked for the broader future directional-profile enhancement
- [x] keep giving/receiving implementation vocabulary out of the normal UI
- [x] add deterministic overlap/ranking/coverage tests

**Exit condition:** Headspaces and Dynamic Modes add recognizable detail without replacing the broader profile model. ✅

### M7.6 — Top Overall catalog interests ✅

**Purpose:** make the abstract profile concrete using the user's strongest directly evidenced catalog interests.

- [x] derive Top 10 from positive explicit preference + active Overall This-or-That rank
- [x] keep explicit and pairwise source values independent underneath the aggregate
- [x] exclude inference-only affinity from Top Overall
- [x] exclude Hard Limit / Not Interested / Not Applicable even when historical rank remains
- [x] keep Unsure from acting as positive explicit evidence by itself
- [x] use confidence-aware pairwise placement in the derived presentation ordering
- [x] define deterministic source-count / explicit-state / confidence / rank / label tie behavior
- [x] preserve source traceability directly in each displayed row
- [x] show fewer than 10 instead of padding with inferred/default items
- [x] keep the aggregate ordering score presentation-only and non-authoritative
- [x] add deterministic direct-evidence aggregation tests

**Exit condition:** Top Overall is a stable direct-evidence ranking rather than an inferred recommendation list. ✅

### M7.7 — Hard Limits

**Purpose:** keep explicit boundaries visible and semantically separate from preference strength.

- [ ] show explicit Hard Limits as their own summary
- [ ] add Show all when needed
- [ ] keep Hard Limit distinct from Not Interested, Not Applicable, Unsure, and low pairwise rank
- [ ] ensure limits never appear in Top Overall favorites

**Test before moving on:** seed each exclusion/disinterest state and verify only explicit Hard Limits appear in the limits summary.

**Exit condition:** limits are clearly visible without being conflated with ranking or low affinity.

### M7.8 — Interest Areas

**Purpose:** summarize the catalog by useful themes without dumping every category onto the profile.

- [ ] derive the top approximately 4–6 strongest/relevant catalog categories
- [ ] show a few representative top items for each Interest Area
- [ ] define category relevance/strength behavior from direct evidence
- [ ] keep the main profile intentionally compact

**Test before moving on:** use dense and sparse catalog data to tune category selection, representative items, and visual density.

**Exit condition:** Interest Areas provide useful category-level shape without making the profile busy.

### M7.9 — Explore / catalog drill-down

**Purpose:** provide deeper exploration without expanding all categories inline.

- [ ] add a separate Explore all categories experience
- [ ] expose category details, explicit states, and ranking context
- [ ] add useful state-filter shortcuts into the editable catalog
- [ ] support shortcuts such as Curious/Like/Love/Unsure where appropriate
- [ ] preserve direct editing in the catalog rather than creating a second preference editor

**Test before moving on:** follow profile → category/state drill-down → catalog edit → profile refresh and verify navigation/data continuity.

**Exit condition:** users can move from summary to editable catalog detail without cluttering the main profile.

### M7.10 — Explainability + coverage

**Purpose:** make derived results understandable when the user wants to inspect them.

- [ ] expose contributing quiz/catalog/ranking evidence for derived profile results
- [ ] qualify low-coverage results without framing unknown as deficiency
- [ ] preserve source type/id/version where available
- [ ] connect useful unfinished exploration back to dashboard/catalog flows
- [ ] keep completion mechanics subordinate on the presentation profile

**Test before moving on:** inspect strong/high-coverage, strong/low-coverage, conflicting-source, and unexplored cases.

**Exit condition:** a user can understand why a result exists and distinguish confidence from affinity.

### M7.11 — Final integration + polish

**Purpose:** remove implementation scaffolding and make the full M7 experience coherent.

- [ ] remove or appropriately gate temporary M7.1 inspection UI
- [ ] verify profile hierarchy across all M7 sections
- [ ] responsive/mobile pass
- [ ] empty/partial/full-profile state pass
- [ ] accessibility and interaction cleanup
- [ ] regression-test M2–M6 section-local results and catalog behavior
- [ ] final documentation cleanup

**Exit condition:** M7 reads as one coherent profile experience while preserving the source-aware architecture underneath.
## M8 — Quiz Depth & Adaptive Follow-ups

**Goal:** support deeper exploration without forcing everyone through a giant assessment.

Possible modes:

- [ ] Quick
- [ ] Standard
- [ ] Deep Dive

Possible adaptive behavior:

- [ ] skip irrelevant follow-ups
- [ ] deepen strong or ambiguous signals
- [ ] preserve scoring comparability
- [ ] show approximate time/question count before starting

Do not build this until the fixed mini-quizzes demonstrate a need for it.

---

## M9 — Settings, Profile Management & Sharing

**Goal:** give the user a dedicated place to manage profile identity, local data lifecycle, backups/restores, and deliberately shareable profile output.

M9 is a separate product area from M7. M7 owns the profile itself; M9 owns managing, moving, resetting, and sharing that profile.

See [docs/m9-settings-profile-management.md](docs/m9-settings-profile-management.md) for the detailed implementation contract.

M8 is not a prerequisite for M9. The share-summary slices depend on the stable M7 profile presentation/data contract, while settings/reset/backup work can remain independent of adaptive quiz depth.

### M9.1 — Settings shell + profile identity

- [ ] add a first-class Settings destination
- [ ] organize Settings into Profile, Data, and Sharing groups
- [ ] replace hard-coded user-facing "Pet" profile naming with an editable profile display name
- [ ] update profile-facing labels/headings to use the configured display name where appropriate
- [ ] keep broader identity/pronoun customization out of this slice

### M9.2 — Selective reset

- [ ] provide a reset flow that never deletes data immediately from the first click
- [ ] allow selecting independent data sections to reset
- [ ] support quiz data, explicit catalog preferences, This-or-That/ranking data, and profile settings/identity as independent reset scopes
- [ ] support an explicit Reset Everything option
- [ ] preview what will be deleted before confirmation
- [ ] preserve unselected evidence sources
- [ ] recompute derived views after reset rather than persisting stale aggregates

### M9.3 — Full profile export

- [ ] export a complete machine-readable profile backup
- [ ] include schema/export version metadata
- [ ] include profile settings/identity and all authoritative persisted profile evidence
- [ ] include quiz progress/results, explicit catalog preference state, and raw This-or-That/ranking history
- [ ] keep recomputable derived values non-authoritative
- [ ] produce a portable JSON file suitable for later restore

### M9.4 — Full profile import

- [ ] validate file shape + supported schema/export version before changing local data
- [ ] show an import preview/summary before replacement
- [ ] import as a full-profile replacement in the initial implementation
- [ ] do not attempt merge-import in the first version
- [ ] reject invalid/incompatible files without partially mutating the current profile
- [ ] recompute derived profile state after successful import

### M9.5 — Shareable profile summary

- [ ] build a dedicated share-summary presentation from stable M7 outputs
- [ ] keep the share summary distinct from the full private backup/export
- [ ] prioritize useful profile highlights such as strongest themes, radar/facets, top interests, headspaces/dynamic modes, limits, and selected interest areas
- [ ] intentionally omit internal provenance/debug data and machine-oriented storage detail
- [ ] design the summary so it can be rendered consistently into multiple output formats
- [ ] provide a preview before export

### M9.6 — Summary export formats

- [ ] support a shareable PNG render
- [ ] support a self-contained/shareable HTML representation
- [ ] support a polished PDF representation
- [ ] reuse the same share-summary content contract across formats instead of maintaining separate profile designs
- [ ] verify mobile/desktop rendering does not produce clipped or unreadable exports

**M9 exit condition:** a user can rename the profile, selectively reset independent source data without collateral deletion, create and restore a complete versioned backup, and generate a polished shareable summary without exposing the full private profile data store.

No account is required for this milestone.

---

## M10 — Optional Persistence

Only build this if it solves a real product problem.

Potential:

- [ ] optional account
- [ ] cloud sync
- [ ] multi-device profile
- [ ] encrypted/private storage model

Before implementation, define privacy expectations and a threat model.

---

# Parked ideas

Interesting, but not current scope:

- partner compatibility/comparison
- consensual partner profile sharing
- custom quizzes
- AI interpretation of results
- educational content for catalog items
- relationship discussion prompts
- quiz recommendations based on incomplete profile
- rewards / consequences runtime system using `reference/rewards-punishments/` source data (schema + product semantics TBD)
- anonymous aggregate statistics

---

# Current next action

**M7.7 — Hard Limits**

Add the explicit Hard Limits profile summary beside/after Top Overall. Keep Hard Limit semantically distinct from Not Interested, Not Applicable, and low-ranked items; use a compact default list with expansion behavior when needed.
