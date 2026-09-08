# Roadmap

Fast vertical slices, minimal ceremony.

This file is intentionally a **status map + milestone checklist**. Detailed product rules, data contracts, scoring semantics, and acceptance criteria belong in the linked milestone/design docs rather than being duplicated here.

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
| M7 | ✅ Complete | full source-aware aggregated profile |
| M8 | Optional | add quiz depth/adaptive follow-ups |
| M9 | ✅ Complete | settings, profile lifecycle, portability, and sharing |
| M10 | Optional | cloud persistence |
| M11 | 🚧 In progress | contextual rewards/punishments, randomizer, and reusable builders |
| M12 | 🚧 In progress | preserve This-or-That runs and show rank movement over time |
| M13 | Planned | theme-driven, low-decision scene composition |
| M14 | Planned | multi-profile comparison, complementary fit, and shared scene filtering |
| M15 | Planned | sparse authority × activity-side contextual preferences, rankings, and integrations |
| M16 | Planned | whole-app data, taxonomy, mapping, quiz, radar, catalog, and reward/punishment curation |

---

## M0 — Prototype ✅

**Goal:** prove the basic experience.

- [x] React + TypeScript + Vite app
- [x] simple questionnaire + ranked results + radar
- [x] browser-local autosave
- [x] responsive UI
- [x] GitHub CI + Pages deployment

The original M0 scorer remains only as the Starter Profile sampler.

---

## M1 — Quiz Hub + Multi-Quiz Architecture ✅

**Goal:** make quizzes independent, resumable modules rather than one monolithic assessment.

- [x] reusable quiz-definition architecture
- [x] independent progress/completion/results per quiz
- [x] versioned browser-local profile storage + migration
- [x] quiz hub with not-started / in-progress / complete states
- [x] overall-profile shell that preserves unexplored sections as unknown

---

## M2 — Dominance & Submission Quiz ✅

**Details:** [M2 D/s Contract](docs/m2-ds-design.md) · [Scoring Model](docs/scoring-model.md)

- [x] lock D/s signal vocabulary
- [x] build weighted 18-question bank
- [x] calculate score + coverage independently
- [x] render ranked results + D/s radar
- [x] preserve unknown separately from low interest

---

## M3 — Roles & Headspaces ✅

**Details:** [M3 Roles & Headspaces Contract](docs/m3-headspaces-direction.md) · [Authority / Activity / Role Semantics](docs/authority-activity-role-separation.md)

- [x] separate signals, dynamic modes, and recognizable roles/headspaces
- [x] support overlapping receiving-side and giving-side roles
- [x] build the M3 v3 question bank
- [x] render ranked Headspaces + Dynamic Modes
- [x] keep role/headspace results separate from D/s authority orientation

---

## M4 — Bondage & Discipline ✅

**Details:** [M4 Bondage & Discipline Contract](docs/m4-bd-design.md)

- [x] model restraint, positioning, constraint control, discipline, accountability, anticipation, and challenge separately
- [x] preserve receiving/giving direction
- [x] build weighted M4 question bank
- [x] render B&D ranked results + radars
- [x] keep pain and specific-item preference out of M4 scoring

---

## M5 — Sadism & Masochism ✅

**Details:** [M5 Sadism & Masochism Contract](docs/m5-sm-design.md)

- [x] model pain, physical intensity, endurance, challenge, anticipation, and emotional intensity separately
- [x] preserve receiving/giving direction
- [x] build weighted M5 question bank
- [x] render S/M ranked results + radars
- [x] keep restraint/discipline and specific-item preference out of M5 scoring

---

## M6 — Catalog Integration ✅

**Details:** [M6 Catalog Integration](docs/m6-catalog-integration.md) · [C3 Explicit Preference](docs/m6-c3-explicit-preference.md) · [This-or-That Ranking](docs/kink-this-or-that-ranking.md) · [Profile Evidence Architecture](docs/profile-evidence-architecture.md)

- [x] **C1** — durable catalog/category identity
- [x] **C2** — metadata + catalog → signal mappings
- [x] **C3** — explicit preference store + editable catalog
- [x] **C4** — source-aware evidence convergence
- [x] **C5** — This-or-That ranking hardening
- [x] **C6** — catalog result integration
- [x] **C7** — signal-affinity/recommendation hardening

### Post-M6 content review

Broader catalog pruning/merging and the pending source-additions review are now owned by **M16 — Data & Content Curation** rather than being a catalog-only follow-up.

---

## M7 — Full Overall Profile ✅

**Details:** [Overall Profile Aggregation](docs/overall-profile-aggregation.md) · [Profile Evidence Architecture](docs/profile-evidence-architecture.md)

- [x] **M7.1** — canonical cross-source aggregation + inspection
- [x] **M7.2** — overall facet model
- [x] **M7.3** — profile header
- [x] **M7.4** — overall radar
- [x] **M7.5** — Headspaces + Dynamic Modes
- [x] **M7.6** — Top Overall catalog interests
- [x] **M7.7** — Hard Limits
- [x] **M7.8** — Interest Areas
- [x] **M7.9** — Explore / catalog drill-down
- [x] **M7.10** — explainability + coverage
- [x] **M7.11** — final integration + polish

---

## M8 — Quiz Depth & Adaptive Follow-ups

**Status:** optional; only build if the fixed quizzes demonstrate a real need.

- [ ] Quick / Standard / Deep Dive quiz modes
- [ ] adaptive follow-ups for strong, weak, or ambiguous signals
- [ ] preserve scoring comparability across quiz depth
- [ ] show approximate effort before starting

---

## M9 — Settings, Profile Management & Sharing ✅

**Details:** [M9 Settings, Profile Management & Sharing](docs/m9-settings-profile-management.md)

- [x] **M9.1** — Settings shell + editable profile identity
- [x] **M9.2** — selective reset
- [x] **M9.3** — full JSON profile export
- [x] **M9.4** — validated full profile import
- [x] **M9.5** — shareable profile summary
- [x] **M9.6** — PNG / HTML / PDF exports

---

## M10 — Optional Persistence

**Status:** optional; only build if local-only storage becomes a product limitation.

- [ ] define privacy expectations + threat model
- [ ] optional account model
- [ ] cloud sync / multi-device profile
- [ ] encrypted/private storage design

---

## M11 — Rewards & Punishments

**Details:** [M11 Rewards & Punishments](docs/m11-rewards-punishments.md)

- [x] **M11.1** — runtime library + stable identity
- [x] **M11.2** — direct Reward/Punishment suitability profiles
- [x] **M11.3** — category aggregation + inferred proposals
- [x] **M11.4** — quick sorter + engagement pacing
- [ ] **M11.5** — independent Reward/Punishment pairwise rankings
- [ ] **M11.6** — random reward / punishment picker
- [ ] **M11.7** — reward + punishment builders
- [ ] **M11.8** — recipe randomization + lifecycle integration
- [ ] **M11.9** — overall-profile integration + UX polish

---

## M12 — This-or-That Ranking History & Movement

**Details:** [M12 Ranking History & Movement](docs/m12-ranking-history-movement.md)

- [x] **M12.1** — run-aware persistence + migration
- [ ] archive the previous comparable ranking run on rerank
- [ ] start each new run with fresh pairwise scoring
- [ ] use only the active run as current M6/M7 pairwise evidence
- [ ] show movement + previous rank against the prior comparable run
- [ ] preserve run history through backup/restore while keeping destructive reset separate

---

## M13 — Scene Builder

**Details:** [M13 Scene Builder](docs/m13-scene-builder.md)

- [ ] **M13.1** — theme taxonomy + mappings
- [ ] **M13.2** — profile-aware candidate engine
- [ ] **M13.3** — current-session Yes / Maybe / Not tonight state
- [ ] **M13.4** — theme-based suggestion surface
- [ ] **M13.5** — scene arc / composition builder
- [ ] **M13.6** — randomization + shuffle
- [ ] **M13.7** — M11 Rewards & Punishments integration
- [ ] **M13.8** — saved scenes + lifecycle
- [ ] **M13.9** — accessibility + polish

---

## M14 — Shared Profiles, Comparison & Partner Integration

**Details:** [M14 Shared Profiles](docs/m14-shared-profiles.md)

- [ ] **M14.1** — multi-profile storage + migration
- [ ] **M14.2** — profile management + switcher
- [ ] **M14.3** — derived comparison engine
- [ ] **M14.4** — comparison UI
- [ ] **M14.5** — interaction/complement mappings
- [ ] **M14.6** — current participant intent
- [ ] **M14.7** — shared M13 scene filtering
- [ ] **M14.8** — lifecycle, privacy + polish

---

## M15 — Contextual Activity Profiles

**Details:** [M15 Contextual Activity Profiles](docs/m15-contextual-activity-profiles.md) · [Authority / Activity / Role Semantics](docs/authority-activity-role-separation.md)

- [ ] **M15.1** — context taxonomy + activity capability metadata
- [ ] **M15.2** — sparse contextual preference storage
- [ ] **M15.3** — contextual refinement UX
- [ ] **M15.4** — contextual pairwise ranking + M12 compatibility
- [ ] **M15.5** — contextual profile aggregation + exploration
- [ ] **M15.6** — motivation / reason annotations
- [ ] **M15.7** — M11 contextual integration
- [ ] **M15.8** — M13 Scene Builder integration
- [ ] **M15.9** — M14 shared-profile contextual complementarity
- [ ] **M15.10** — lifecycle, exports, reset + polish

---

## M16 — Data & Content Curation

**Details:** [M16 Data & Content Curation](docs/m16-data-content-curation.md)

- [ ] **M16.1** — inventory authored/derived data surfaces + review rubric
- [ ] **M16.2** — mobile-friendly Curation Workbench + local proposal/export workflow
- [ ] **M16.3** — quiz bank, signal-weight, and scoring-input review
- [ ] **M16.4** — signal vocabulary, headspaces, radars, facets, labels, and thresholds review
- [ ] **M16.5** — kink catalog pruning/consolidation + pending additions review
- [ ] **M16.6** — rewards/punishments action library + contextual taxonomy curation
- [ ] **M16.7** — cross-system taxonomy/mapping alignment
- [ ] **M16.8** — stable-ID replacement, archival, migration, and import/export compatibility
- [ ] **M16.9** — generator/test regression + representative-profile sanity review

M16 is intentionally a **curation milestone, not an expansion milestone**. Existing questions, axes, categories, items, mappings, and labels may be removed or merged when they no longer improve the profile or decision surface.

---

# Parked ideas

Interesting, but not current scope:

- custom quizzes
- AI interpretation of results
- educational content for catalog items
- relationship discussion prompts
- quiz recommendations based on incomplete profile
- anonymous aggregate statistics

---

# Current next action

**M7 and M9 are complete. M11 implementation is underway; M12–M16 are formally scoped.**

Choose the next implementation slice intentionally. M15 is the shared context model for any authority-sensitive giving/receiving behavior added inside M11, M13, or M14.
