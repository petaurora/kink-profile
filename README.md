# Pet Profile

A privacy-first React app for exploring BDSM, kink, power-dynamic, headspace, and contextual preferences through modular quizzes, direct preference editing, ranking, visual profiles, and profile-aware tools.

## What the app does today

Pet Profile is local-first: the core product runs in the browser without a required account or backend.

Current capabilities include:

- independent Bondage & Discipline, Dominance & Submission, Sadism & Masochism, and Roles & Headspaces quizzes;
- a searchable kink catalog with direct preference editing and category/Overall This-or-That ranking;
- source-aware profile aggregation that keeps authority, activity-side giving/receiving, roles/headspaces, direct preferences, rankings, and inferred evidence distinct;
- local profile settings, selective reset, versioned backup/restore, and PNG/HTML/PDF sharing;
- Rewards & Punishments classification, ranking, randomization, and reusable builders;
- non-destructive ranking reruns with prior-run movement context;
- a profile-aware Scene Builder with temporary session intent, filtering, composition, randomization, and saved scenes;
- temporary uploaded-profile comparison and shared-scene filtering;
- an in-progress data/content curation system for refining the authored taxonomy and mappings.

The repository code is authoritative for what is implemented.

## Work tracking

**Active and future work is tracked in GitHub Issues and the repository Project, not in repository Markdown checklists.**

- [Issues](https://github.com/petaurora/kink-profile/issues) contain actionable bugs, features, refactors, curation slices, and implementation-adjacent decisions.
- The repository **Project** is the visual `Now / Next / Later` view for priority and status.
- Pull requests implement Issues and should link or close the work they deliver.
- Private product/business strategy, research, monetization, platform-policy planning, and early ideas live in the private product workspace rather than this public code repository.

`ROADMAP.md` is retained only as a compatibility pointer for older links; it is no longer a second project-management system.

## Documentation

Start with:

- [Feature Guide](docs/feature-guide.md) — plain-language current product behavior and how the major features fit together
- [FAQ](docs/faq.md) — common questions about current product behavior
- [Product Spec](docs/product-spec.md) — current product boundaries and non-goals
- [Documentation index](docs/README.md) — canonical product, data-model, scoring, and feature contracts

Key product contracts:

- [Quizzes](docs/product/quizzes.md)
- [Kink Catalog](docs/product/kink-catalog.md)
- [Kink This-or-That Ranking](docs/kink-this-or-that-ranking.md)
- [Profile Management](docs/product/profile-management.md)
- [Rewards & Punishments](docs/product/rewards-punishments.md)
- [Scene Builder](docs/product/scene-builder.md)
- [Profile Comparison](docs/product/profile-comparison.md)
- [Curation Workbench](docs/product/curation-workbench.md)

Key semantic/system contracts:

- [Semantic Data Model](docs/semantic-data-model.md)
- [Signal + Channel Data Model](docs/data-model/signal-channel-model.md)
- [Roles, Headspaces & Dynamic Modes](docs/data-model/roles-headspaces-modes.md)
- [Authority, Activity Side & Role Semantics](docs/authority-activity-role-separation.md)
- [Scoring & Taxonomy Model](docs/scoring-model.md)
- [Source-Aware Profile Evidence Architecture](docs/profile-evidence-architecture.md)
- [Overall Profile Aggregation](docs/overall-profile-aggregation.md)
- [Reference Data](reference/README.md)

Documentation describes **how the current product/system works**. Work status, priorities, implementation plans, and acceptance checklists belong in GitHub. Product strategy, research, unresolved design, and business/privacy planning belong in the private product workspace.

Milestone-named files that remain under `docs/` are compatibility pointers for old links, not current sources of truth.

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

Authoritative profile data remains browser-local in `localStorage`, including quiz progress/results, catalog preferences, active and archived pairwise ranking runs, profile settings, Rewards & Punishments state, and saved Scene Builder data. Temporary session-only state uses session-scoped browser storage. Backup/restore and share exports are generated locally. Uploaded comparison profiles are processed locally and are not imported or persisted as another profile.

Any future account/cloud persistence work is intentionally treated as a separate product, privacy, security, and ownership decision rather than an assumed next step.
