# Documentation

This folder documents **the current product and system**. It is not the project-management system and it is not the product-thinking workspace.

Use three homes deliberately:

- **Repository docs** — implemented product behavior, architecture, data contracts, scoring rules, and other context a future developer needs beside the code.
- **GitHub Issues / Project / PRs** — actionable changes, implementation checklists, sequencing, status, and implementation history.
- **Kink Profile HQ in Notion** — strategy, research, unresolved product design, alternatives, future concepts, business/privacy planning, and decisions that do not need to ship beside the code.

A milestone document may be split across all three rather than moved wholesale.

## Start here

- [Feature Guide](feature-guide.md) — plain-language current behavior
- [FAQ](faq.md) — common product questions
- [Product Spec](product-spec.md) — current product boundaries

## Durable system contracts

- [Semantic Data Model](semantic-data-model.md) — how evidence and semantic layers relate
- [Signal + Channel Data Model](data-model/signal-channel-model.md) — canonical Signal identity, Overall/Receiving/Giving channels, compatibility boundaries, and aggregation semantics
- [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md) — keeps authority, activity direction, and roles/headspaces distinct
- [Scoring & Taxonomy Model](scoring-model.md) — weighted scoring, source aggregation, affinity vs coverage, and taxonomy boundaries
- [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md) — evidence provenance, recomputation, source separation, and no-feedback-loop rules
- [Overall Profile Aggregation](overall-profile-aggregation.md) — aggregate profile behavior
- [Kink This-or-That Ranking](kink-this-or-that-ranking.md) — pairwise ranking behavior and temporal reranking boundary

If a change alters one of these cross-system contracts, update the relevant document in the same PR.

## Current product/feature contracts

- [Curation Workbench](product/curation-workbench.md) — proposal workspace, canonical semantic editing, validation, and deterministic export

The following feature contracts still carry milestone names because they describe implemented behavior that has not yet needed a durable topic-path rewrite:

- [M2 Dominance & Submission](m2-ds-design.md)
- [M3 Roles & Headspaces](m3-headspaces-direction.md)
- [M4 Bondage & Discipline](m4-bd-design.md)
- [M5 Sadism & Masochism](m5-sm-design.md)
- [M6 Catalog Integration](m6-catalog-integration.md)
- [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md)
- [M9 Settings, Profile Management & Sharing](m9-settings-profile-management.md)
- [M11 Rewards & Punishments](m11-rewards-punishments.md)
- [M12 Ranking History & Movement](m12-ranking-history-movement.md)
- [M13 Scene Builder](m13-scene-builder.md)
- [M14 Shared Profiles / Comparison](m14-shared-profiles.md)

Their milestone prefix is historical; it does not own current work status. When one is materially revised, decide whether its surviving contract should move to a durable topic path such as `product/scene-builder.md` rather than preserving the milestone name automatically.

## Active work is not documentation

Current M16 curation/refinement work is tracked by GitHub Issue #124 and its sub-issues. The completed Signal/channel migration and Workbench implementation history live in their closed Issues/PRs and git history rather than separate `m16-*` status documents.

Planned product-design documents that do not describe implemented behavior should not live in `docs/` merely because they contain detailed specifications. Product/design reasoning belongs in Notion; actionable engineering scope belongs in the owning GitHub Issue. Once a feature lands, distill its surviving implemented rules back into durable repository documentation.

Planned engineering architecture/refactor work follows the same current-system boundary: the owning GitHub Issue holds the implementation plan and locked technical decisions. Durable architecture documentation should describe the structure that actually landed, not a planned end state.

## Reference data

- [Reference Data](../reference/README.md) — source data and generated/curated inputs consumed by the application

Research notes that do not need to ship with code belong in Notion.

## Source of truth

| Question | Source |
| --- | --- |
| What does the app do? | Code + Feature Guide |
| How do scoring/evidence/semantics work? | Durable repository contracts |
| How does a current implemented feature work? | Current product/feature contract + code/tests |
| What are we working on? | GitHub Issues |
| What should happen next? | Repository Project |
| What are we thinking/researching/deciding? | Kink Profile HQ in Notion |
| What happened historically? | Closed Issues/PRs + git history |

## Documentation rule

Before creating or keeping a Markdown file here, ask:

1. Will a future developer need it beside the code to understand or safely change the **current system**? Keep it in repo docs.
2. Is it an actionable change, checklist, migration plan, or work status? Put it in GitHub.
3. Is it strategy, research, unresolved product design, alternatives, future thinking, or business/privacy planning? Put it in Notion.
4. Is it merely recording that work happened? Git history and closed Issues/PRs already preserve that chronology.

Avoid duplicating detailed decisions across homes. Prefer one canonical source and link to it from related docs, tests, and Issues.

The repository code remains authoritative for what is actually implemented.
