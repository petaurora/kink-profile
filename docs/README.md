# Documentation

This folder documents **how the product and its data model work**. It is not the project-management system.

For current work, priority, and sequencing, use [GitHub Issues](https://github.com/petaurora/kink-profile/issues) and the repository Project. Detailed checklists should live with the Issue that owns the change.

## Using the app

Start here for plain-language behavior:

- [Feature Guide](feature-guide.md) — what each current feature does, when to use it, and how the major evidence sources fit together
- [FAQ](faq.md) — common questions about results, ranking, Rewards & Punishments, backup/sharing, and privacy

## Durable system contracts

These are the highest-value cross-cutting documents to keep versioned with the code:

- [Product Spec](product-spec.md) — current product boundaries and behavior
- [Semantic Data Model](semantic-data-model.md) — core domain concepts and relationships
- [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md) — keeps Dominant/Submissive authority, giving/receiving activity side, and roles/headspaces distinct
- [Scoring & Taxonomy Model](scoring-model.md) — reusable scoring architecture and taxonomy boundaries
- [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md) — evidence provenance, recomputation, source separation, and no-feedback-loop rules
- [Overall Profile Aggregation](overall-profile-aggregation.md) — canonical aggregate-profile behavior
- [Kink This-or-That Ranking](kink-this-or-that-ranking.md) — pairwise ranking behavior and temporal reranking boundary

If a change alters one of these cross-system contracts, update the relevant durable document in the same PR.

## Feature and historical implementation contracts

Some documents still carry milestone names because they began as implementation specs. They are useful where they describe behavior that still exists; the milestone prefix is historical rather than a signal that the file owns current work status.

### Core quizzes and catalog

- [M2 Dominance & Submission](m2-ds-design.md)
- [M3 Roles & Headspaces](m3-headspaces-direction.md)
- [M4 Bondage & Discipline](m4-bd-design.md)
- [M5 Sadism & Masochism](m5-sm-design.md)
- [M6 Catalog Integration](m6-catalog-integration.md)
- [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md)

### Current feature contracts

- [M9 Settings, Profile Management & Sharing](m9-settings-profile-management.md)
- [M11 Rewards & Punishments](m11-rewards-punishments.md)
- [M12 Ranking History & Movement](m12-ranking-history-movement.md)
- [M13 Scene Builder](m13-scene-builder.md)
- [M14 Shared Profiles / Comparison](m14-shared-profiles.md) — implemented uploaded-profile comparison/shared-scene behavior remains useful; unresolved persistent ownership/linking decisions are tracked in GitHub Issues

These files may eventually be renamed into topic-based paths such as `product/scene-builder.md`. Do that when the document is materially revised, not as a giant rename-only cleanup.

## Active design / transition documents

The following files contain useful design constraints for work that is not fully settled or implemented. **Their checklists/status are not authoritative. GitHub Issues are.**

- [M15 Contextual Activity Profiles](m15-contextual-activity-profiles.md)
- [M16 Data & Content Curation](m16-data-content-curation.md)
- [M16 Profile Semantics Refinement](m16-profile-semantics-refinement.md)
- [M16 Score Explainability](m16-score-explainability.md)
- [M16 Signal Channel Audit](m16-signal-channel-audit.md)
- [M16 Signal Channel Model](m16-signal-channel-model.md)
- [M16 Signal Channel Runtime Migration](m16-signal-channel-runtime-migration.md)
- [M16 Workbench Signal Follow-up](m16-workbench-signal-channel-followup.md)
- [M17 Body Map](m17-body-map.md)
- [M18 Application Architecture & Routing](m18-application-architecture-routing.md)

As these areas land, distill surviving rules into durable product/data/scoring/architecture documentation and let closed Issues/PRs preserve the implementation chronology.

## Reference data

- [Reference Data](../reference/README.md) — repo-native source data, generated/curated inputs, and intended use

Reference datasets belong in the repo when the application consumes or generates them. Research notes and business/source exploration that do not need to ship with code belong in the private product workspace.

## Source of truth

| Question | Source |
| --- | --- |
| What does the app do? | Code + [Feature Guide](feature-guide.md) |
| Why did a current feature behave this way? | Relevant durable/feature contract + tests |
| How do scoring/evidence/semantics work? | Durable system contracts above |
| What are we working on? | GitHub Issues |
| What should happen next? | Repository Project |
| What are we still researching/considering privately? | Private product workspace |
| What happened historically? | Closed Issues/PRs + git history |

## Documentation rule

Before creating a new Markdown file, ask:

1. **Will a future developer need this beside the code to understand or safely change the system?** If yes, repo documentation is appropriate.
2. **Is this describing a change we want to make?** Create a GitHub Issue instead.
3. **Is this strategy, research, monetization, vendor/policy exploration, or a half-formed idea?** Put it in the private product workspace.
4. **Is this merely recording that work happened?** Closed Issues/PRs and git history already do that.

Avoid duplicating detailed decisions across files. Prefer one canonical contract and link to it from related docs/tests/issues.

The repository code remains authoritative for what is actually implemented.
