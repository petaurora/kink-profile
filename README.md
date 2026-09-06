# Pet Profile

A privacy-first React app for exploring BDSM, kink, power-dynamic, and headspace preferences through short modular quizzes and visual profiles.

## Current status

**M0 — Prototype:** complete  
**M1 — Quiz Hub + Multi-Quiz Architecture:** complete  
**M2 — Dominance & Submission Quiz:** complete  
**M3 — Roles & Headspaces:** complete  
**M4 — Bondage & Discipline:** complete  
**M5 — Sadism & Masochism:** complete  
**M6 — Catalog Integration:** in progress

The app now supports all four core quiz sections plus a playable catalog-ranking flow. The 551-item catalog is sourced from repo-native TSV, generated into app-owned runtime data before dev/build, and can be ranked within categories and across the current Top-5-per-ranked-category finalist pool.

The catalog now has a first-class direct preference table plus the category/Overall This-or-That ranking mini-game. Explicit preferences and raw pairwise comparisons remain browser-local in the shared catalog-profile store so direct state and ranking evidence stay independent and recalculable. With source-aware evidence convergence implemented in C4, M6 now continues with ranking confidence/finalists, result integration, affinity hardening, and the M7 handoff.

C1 durable IDs, C2 metadata/signal mappings, C3 explicit preference + catalog table, and C4 source-aware evidence convergence are implemented. The app can now derive quiz-based catalog inference with source provenance while preserving explicit preference and raw pairwise evidence as independent channels; inferred affinity cannot feed back into the signals that produced it. C5 ranking hardening is next.

The original 16-question prototype remains available as the **Starter Profile** sampler. It is not intended to be the final scoring model.

## Core quiz sections

- Bondage & Discipline
- Dominance & Submission
- Sadism & Masochism
- Roles & Headspaces

The product is intentionally **not one giant questionnaire**. Each section should be useful on its own and contribute to a richer overall profile over time.

## Documentation

Start with [docs/README.md](docs/README.md).

- [Product specification](docs/product-spec.md) — product behavior, taxonomy, UX, privacy, and scope
- [Scoring & taxonomy model](docs/scoring-model.md) — signal-weighted scoring and catalog-affinity boundaries
- [M6 catalog integration](docs/m6-catalog-integration.md) — stable catalog identity, explicit state, ranking hardening, signal mappings, and M7 boundary
- [M6 C3 explicit preference + catalog table](docs/m6-c3-explicit-preference.md) — direct-management table + This-or-That mini-game boundary
- [Source-aware profile evidence architecture](docs/profile-evidence-architecture.md) — C4/M7 evidence provenance, recomputation, quiz/catalog interconnection, and no-feedback-loop rules
- [Kink This-or-That ranking](docs/kink-this-or-that-ranking.md) — current Top-5 ranking funnel and remaining ranking hardening
- [Roadmap](ROADMAP.md) — implementation milestones and current next work
- [Reference data](reference/README.md) — repo-native TSV catalog source and intended use

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

Quiz answers/progress and kink-ranking comparisons are stored only in the current browser's `localStorage`. Optional cloud persistence is intentionally deferred until there is a real product need and a defined privacy model.
