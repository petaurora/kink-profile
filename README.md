# Pet Profile

A privacy-first React app for exploring BDSM, kink, power-dynamic, and headspace preferences through short modular quizzes and visual profiles.

## Current status

**M0 — Prototype:** complete  
**M1 — Quiz Hub + Multi-Quiz Architecture:** complete  
**M2 — Dominance & Submission Quiz:** complete  
**M3 — Roles & Headspaces:** complete  
**M4 — Bondage & Discipline:** complete  
**M5 — Sadism & Masochism:** complete  
**M6 — Catalog Integration:** complete  
**M7 — Full Overall Profile:** complete  
**M8 — Quiz Depth & Adaptive Follow-ups:** optional  
**M9 — Settings, Profile Management & Sharing:** complete  
**M10 — Optional Persistence:** optional  
**M11 — Rewards & Punishments:** complete  
**M12 — This-or-That Ranking History & Movement:** complete  
**M13 — Scene Builder:** complete  
**M14 — Shared Profiles, Comparison & Partner Integration:** needs refinement  
**M15 — Contextual Activity Profiles:** planned  
**M16 — Data & Content Curation:** planned

The app now supports all four core quiz sections, the full 551-item catalog with direct preferences and category/Overall This-or-That ranking, a source-aware aggregated profile, complete local profile lifecycle/sharing, contextual Rewards & Punishments with ranking/randomization/recipes, non-destructive This-or-That reruns with movement history, a profile-aware Scene Builder with saved scenes, and temporary uploaded-profile comparison with shared scene filtering.

M6 keeps explicit preferences, raw pairwise comparisons, quiz-derived affinity, exclusions, and provenance independent and recalculable. M7 consumes those sources into the overall profile without flattening D/s authority, activity-side giving/receiving, or roles/headspaces into one concept. M9 adds editable profile identity, selective reset, versioned backup/restore, and local PNG/HTML/PDF share exports. M11 adds independent Reward/Punishment contextual evidence without feeding it back into general kink scoring. M12 makes pairwise reranking temporal: only the active run is current evidence, while archived runs provide history and movement context. M13 turns that profile into a bounded, theme-driven Scene Builder with temporary Tonight state, randomization, composition, and saved scenes. M14 currently supports non-destructive uploaded-profile comparison, complementary-fit views, participant intent, and shared Scene Builder filtering.

M11–M13 are complete. M14's implemented compare-once/shared-scene work remains active, but its persistent ownership/linking model is paused for refinement. M15 remains planned for sparse authority × activity-side contextual preferences/rankings, and M16 remains planned for whole-app data/content curation with a mobile-friendly review workbench. M8 and M10 remain optional rather than prerequisites.

The original 16-question prototype remains available as the **Starter Profile** sampler. It is not intended to be the final scoring model.

## Core quiz sections

- Bondage & Discipline
- Dominance & Submission
- Sadism & Masochism
- Roles & Headspaces

The product is intentionally **not one giant questionnaire**. Each section should be useful on its own and contribute to a richer overall profile over time.

## Documentation

Start with the user-facing guides if you want to understand the app itself:

- [Feature Guide](docs/feature-guide.md) — plain-language definitions, when to use each feature, and how the pieces fit together
- [FAQ](docs/faq.md) — common questions about results, ranking, Rewards & Punishments, backup/sharing, and privacy
- [Documentation index](docs/README.md) — deeper product, scoring, milestone, and implementation contracts

For product and implementation detail:

- [Product specification](docs/product-spec.md) — product behavior, taxonomy, UX, privacy, and scope
- [Scoring & taxonomy model](docs/scoring-model.md) — signal-weighted scoring and catalog-affinity boundaries
- [Authority, activity side & role semantics](docs/authority-activity-role-separation.md) — keeps D/s authority, giving/receiving activity side, and roles/headspaces orthogonal
- [M6 catalog integration](docs/m6-catalog-integration.md) — stable catalog identity, explicit state, ranking hardening, signal mappings, and source-aware evidence boundaries
- [Source-aware profile evidence architecture](docs/profile-evidence-architecture.md) — evidence provenance, recomputation, quiz/catalog interconnection, and no-feedback-loop rules
- [Kink This-or-That ranking](docs/kink-this-or-that-ranking.md) — category/Overall ranking flow and the M12 temporal-reranking boundary
- [M7 overall profile aggregation](docs/overall-profile-aggregation.md) — completed aggregate profile contract
- [M9 settings, profile management & sharing](docs/m9-settings-profile-management.md) — completed local lifecycle, backup/restore, and share-export contract
- [M11 Rewards & Punishments](docs/m11-rewards-punishments.md)
- [M12 ranking history & movement](docs/m12-ranking-history-movement.md)
- [M13 Scene Builder](docs/m13-scene-builder.md)
- [M14 shared profiles](docs/m14-shared-profiles.md)
- [M15 contextual activity profiles](docs/m15-contextual-activity-profiles.md)
- [M16 data & content curation](docs/m16-data-content-curation.md)
- [Roadmap](ROADMAP.md) — implementation milestones and current next work
- [Reference data](reference/README.md) — repo-native source data and intended use

## Tech

- React
- TypeScript
- Vite
- browser `localStorage`
- GitHub Actions
- GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

GitHub Pages publishes from the generated `gh-pages` branch.

- `main` is built by `.github/workflows/pages.yml` and deployed at `https://petaurora.github.io/kink-profile/`.
- Open pull requests are built by `.github/workflows/preview-pages.yml` and deployed at `https://petaurora.github.io/kink-profile/pr-<number>/`.
- Preview deployments are updated on each PR synchronize event and removed when the PR closes.
- The preview workflow adds or updates a comment on the PR with the preview URL.

Vite's base path is controlled at build time with `VITE_BASE_PATH`. Production uses `/kink-profile/`; PR previews use `/kink-profile/pr-<number>/`. The app currently uses state-driven navigation rather than React Router, so no router basename is required.

Repository setup: under **Settings → Pages**, set **Source** to **Deploy from a branch**, choose `gh-pages`, and publish from `/(root)`. Both production and preview workflows serialize writes to that branch so they do not overwrite each other.

## Privacy

There is currently no backend and no required account.

Authoritative profile data remains browser-local in `localStorage`: quiz progress/results, catalog preferences, active and archived pairwise ranking runs, profile settings, authoritative M11 Rewards & Punishments state, and saved M13 scenes. Temporary Scene Builder Tonight/randomizer state uses session-scoped browser storage. M9 backup/restore and share exports are generated locally. Uploaded M14 comparison profiles are processed locally and are not imported or persisted as another profile. Optional cloud persistence remains deferred until there is a real product need and a defined privacy/threat model.
