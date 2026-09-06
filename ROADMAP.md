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
| M6 | 🟡 In progress | integrate and harden the kink catalog |
| M7 | Planned | build the full aggregated profile |
| M8 | Optional | add quiz depth/adaptive follow-ups |
| M9 | Planned later | export/import/share |
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

## M6 — Catalog Integration 🟡

**Goal:** turn the existing 551-item runtime catalog + This-or-That flow into a durable, profile-aware catalog system without turning catalog rows into quiz questions.

See [docs/m6-catalog-integration.md](docs/m6-catalog-integration.md) for the M6 contract and [docs/kink-this-or-that-ranking.md](docs/kink-this-or-that-ranking.md) for pairwise-ranking behavior.

### Imported pre-migration baseline

The repository migration imported the already-working catalog/ranking baseline into the new `kink-profile` history. Old pull-request numbers are intentionally not used as implementation references here.

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

### C6 — Catalog result integration

**Boundary:** surface explicit, pairwise, inferred, and exclusion channels together without synthesizing a new merged profile score/list. Presentation-level aggregation across independent direct sources remains M7.

- [ ] show explicit state alongside category rankings
- [ ] show explicit state alongside overall favorites
- [ ] expose hard-limit/exclusion summaries separately from favorites
- [ ] show inferred starting affinity separately from direct preference/ranking evidence
- [ ] keep source provenance/explainability available for catalog items
- [ ] keep exact ranks derived from raw comparison history where practical
- [ ] preserve category and overall ranking as separate useful results
- [ ] do not collapse explicit + pairwise evidence into an M7-style Top Overall aggregate

### C7 — Signal-affinity hardening

- [ ] harden the pure coverage-aware catalog affinity matcher introduced/centralized in C4
- [ ] distinguish inferred affinity from explicit preference and pairwise ranking
- [ ] suppress hard limit / not interested / not applicable recommendations
- [ ] retain matched-signal explainability
- [ ] use tentative "may be worth exploring" language for inference-only items
- [ ] ensure catalog → signal projection consumes only independent direct catalog evidence
- [ ] defer canonical cross-source signal input + profile-wide radar/recommendation UI to M7

**Exit condition:** catalog definitions have durable identity; explicit state, relative ranking, and inferred affinity remain separate; ranking history survives normal catalog evolution; exclusions are authoritative; catalog items have validated SignalId mappings; and M7 can consume clean catalog favorites/mappings without understanding TSV/ranking internals.

---

## M7 — Full Overall Profile

**Goal:** turn completed section results into one coherent profile.

M1 provides the navigation/progress shell. M7 adds real cross-section aggregation.

See [docs/profile-evidence-architecture.md](docs/profile-evidence-architecture.md) for the source-aware evidence contract and [docs/overall-profile-aggregation.md](docs/overall-profile-aggregation.md) for the aggregation/front-page design direction. The overall radar should use broad cross-cutting facets derived from canonical signals rather than quiz names, specific kink names, or role labels.

- [ ] canonical source-aware **cross-source** SignalId aggregation
- [ ] consume independent quiz, explicit-catalog, and pairwise-catalog evidence
- [ ] define deduplication/weighting rules across independent evidence sources
- [ ] update existing signal/radar percentages as direct catalog evidence strengthens the profile
- [ ] define final overall facet vocabulary and composition weights
- [ ] coverage-aware overall radar
- [ ] preserve direction metadata for power exchange, care, primality, and intensity where relevant
- [ ] expose profile-level affinity separately from evidence confidence/coverage
- [ ] top receiving/submissive and giving/dominant headspace summaries
- [ ] strongest dynamic-mode summary
- [ ] explicit/pairwise-ranked catalog favorites summary
- [ ] inferred catalog starting points with source explainability
- [ ] completed-section summary
- [ ] Activities view
- [ ] D/s view
- [ ] Headspaces view
- [ ] overall visualization
- [ ] strongest-signal summary
- [ ] preserve unexplored sections as unknown, not 0%
- [ ] prevent repeated SignalIds from being double-counted across quizzes/sources
- [ ] replace/supersede only the affected quiz contribution on retake
- [ ] preserve manual/ranking evidence when quizzes are retaken
- [ ] prevent inferred catalog affinity from feeding back into the evidence that produced it
- [ ] allow drill-down from a catalog item or radar result to contributing source evidence

---

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

## M9 — Portability & Sharing

**Goal:** give the user explicit control over their profile data.

- [ ] export profile
- [ ] import profile
- [ ] clear/delete local profile
- [ ] selective shareable result card
- [ ] exclude private details from shared views

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
- anonymous aggregate statistics

---

# Current next action

**M6 — Catalog Integration / C6 catalog result integration**

Surface the catalog evidence already available: show explicit preference beside category/Overall rankings, expose exclusions separately from favorites, show inference-only starting affinity separately from direct evidence, and preserve source provenance/explainability.
