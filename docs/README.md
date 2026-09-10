# Documentation

This folder contains both user-facing product documentation and the deeper product/scoring contracts that guide implementation.

## Using the app

Start here if you want to understand the product without reading implementation specifications.

1. [Feature Guide](feature-guide.md)  
   Plain-language definitions of the current features, when to use them, how they affect the profile, and how the major evidence sources fit together.

2. [FAQ](faq.md)  
   Common behavioral questions about quizzes, the Overall Profile, direct catalog preferences, This-or-That, ranking history, Rewards & Punishments, backup/sharing, privacy, and planned features.

The user-facing docs explain behavior; the specifications below remain authoritative for scoring rules, data contracts, and implementation boundaries.

## Product & implementation docs — read in this order

1. [Product Spec](product-spec.md)  
   What the app is, how the quiz sections fit together, how signals/dynamic modes/roles are separated, and what is in or out of scope.

2. [M2 D/s Contract](m2-ds-design.md)  
   The implemented contract for the first real quiz: 9 signals, 18 questions, weight matrix, scoring behavior, and scope boundaries.

3. [M3 Roles & Headspaces Contract](m3-headspaces-direction.md)  
   The M3 v3 contract: 32 questions, shared signals, separate dynamic-mode and role/headspace layers, Predator/Prey, and split role/dynamic radar views.

4. [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md)  
   The cross-cutting semantic boundary between Dominant/Submissive authority, activity-side giving/receiving, and recognizable roles/headspaces.

5. [M4 Bondage & Discipline Contract](m4-bd-design.md)  
   The implemented M4 contract: directional restraint/discipline signals, 26-question bank, weights, pain boundary, and split B&D radars.

6. [M5 Sadism & Masochism Contract](m5-sm-design.md)  
   The implemented M5 contract: directional pain/intensity/endurance/challenge signals, 26-question bank, weights, and receiving/giving S/M radars.

7. [M6 Catalog Integration](m6-catalog-integration.md)  
   The implemented M6 contract: C1 stable IDs + C2 mappings + C3 direct preference/table state + C4 source-aware evidence convergence + C5 ranking hardening + C6 catalog result integration + C7 affinity/recommendation hardening. M7 now consumes this boundary.

8. [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md)  
   The implemented C3 contract: shared Catalog-ID state, catalog-profile storage/migration, searchable preference table/list, ranking interconnection, eligibility, tests, and the explicit C4 handoff.

9. [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md)  
   The implemented C4/M7 convergence contract: quizzes, explicit catalog state, pairwise ranking, inferred catalog affinity, source provenance, recomputation, and the no-feedback-loop rule.

10. [Kink This-or-That Ranking](kink-this-or-that-ranking.md)  
    The implemented category/Overall ranking flow, C5 meaningful-evidence/finalist/history hardening, and C6 explicit/inferred result integration.

11. [Scoring & Taxonomy Model](scoring-model.md)  
    The reusable scoring architecture behind the core quizzes, catalog affinity, source-aware recomputation, and the C7 recommendation-suppression/no-feedback boundaries.

12. [Overall Profile Aggregation](overall-profile-aggregation.md)  
    The completed M7 contract: canonical aggregation, nine broad facets, profile header/radar, role/mode summaries, Top Overall, limits, Interest Areas, catalog drill-down, explainability, and final integration.

13. [M9 Settings, Profile Management & Sharing](m9-settings-profile-management.md)  
    The completed Settings/profile-lifecycle contract: display name, selective reset, complete versioned backup/restore, share-summary presentation, and PNG/HTML/PDF output.

14. [M11 Rewards & Punishments](m11-rewards-punishments.md)  
    The completed M11 contract: contextual reward/punishment overlays across catalog + action primitives, playful classification, independent Reward/Punishment pairwise rankings, random selection, reusable builders/recipes, overall-profile integration, and lifecycle support without assignment/tracking semantics.

15. [M12 This-or-That Ranking History & Movement](m12-ranking-history-movement.md)  
    The completed temporal-ranking contract: non-destructive reruns, archived run history, active-run-only current evidence, previous-rank movement indicators, and overall-profile movement context.

16. [M13 Scene Builder](m13-scene-builder.md)  
    The completed profile-to-play composition layer: theme queries, current-session state, bounded candidate filtering, editable scene arcs, randomization, M11 integration, saved scenes, and lifecycle/accessibility hardening.

17. [M14 Shared Profiles, Comparison & Partner Integration](m14-shared-profiles.md)  
    The active comparison/shared-scene contract plus the current persistence-model refinement checkpoint: temporary uploaded-profile comparison is implemented; persistent profile ownership/linking remains intentionally undecided.

18. [M15 Contextual Activity Profiles](m15-contextual-activity-profiles.md)  
    The planned sparse authority × activity-side contract: context-specific preferences, rankings, contextual profile lenses, motivation annotations, and M11/M12/M13/M14 integration without treating giving/receiving as authority.

19. [M16 Data & Content Curation](m16-data-content-curation.md)  
    The planned whole-app curation contract: inventory/review rubric, mobile Curation Workbench, quiz/radar/signal review, kink-catalog and Rewards & Punishments cleanup, migration-safe identity changes, and regression validation.

20. [M17 Body Map](m17-body-map.md)  
    The planned lightweight body-boundary map: front/back selectable SVG regions, left/right distinctions, separate inner thighs, and one general Yes / Maybe / Neutral / No state per region.

21. [M18 Application Architecture & Routing](m18-application-architecture-routing.md)  
    The behavior-preserving architecture contract: GitHub-Pages-safe browser routing, route/page extraction, one application shell, feature ownership boundaries, large-file breakup, and routing/deployment regression coverage.

22. [Roadmap](../ROADMAP.md)  
    Compact milestone status + slice checklists showing what is complete and what can be built next. Detailed milestone behavior belongs in the linked docs.

23. [Reference Data](../reference/README.md)  
    How the expanded kink catalog and rewards/punishments source bank should be used without turning them into giant questionnaires.

## Source of truth by topic

| Question | Source |
| --- | --- |
| What does each feature do and how do I use it? | [Feature Guide](feature-guide.md) |
| Why did the app behave this way? | [FAQ](faq.md) |
| What are we building? | [Product Spec](product-spec.md) |
| What exactly does M2 measure? | [M2 D/s Contract](m2-ds-design.md) |
| How is M3 modeled? | [M3 Roles & Headspaces Contract](m3-headspaces-direction.md) |
| How are D/s authority, giving/receiving activity side, and roles kept separate? | [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md) |
| How is M4 modeled? | [M4 Bondage & Discipline Contract](m4-bd-design.md) |
| How is M5 modeled? | [M5 Sadism & Masochism Contract](m5-sm-design.md) |
| How should M6 integrate the catalog? | [M6 Catalog Integration](m6-catalog-integration.md) |
| What exactly should C3 implement? | [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md) |
| How do quizzes, catalog preferences, ranking, and inference interact without loops? | [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md) |
| How should catalog items be pairwise ranked? | [Kink This-or-That Ranking](kink-this-or-that-ranking.md) |
| How should scoring and catalog affinity work generally? | [Scoring Model](scoring-model.md) |
| How should the overall front-page profile aggregate everything? | [Overall Profile Aggregation](overall-profile-aggregation.md) |
| How should profile settings, reset, backup/restore, and sharing work? | [M9 Settings, Profile Management & Sharing](m9-settings-profile-management.md) |
| How should rewards, punishments, randomization, and saved recipes work? | [M11 Rewards & Punishments](m11-rewards-punishments.md) |
| How should repeat This-or-That runs and rank movement work? | [M12 Ranking History & Movement](m12-ranking-history-movement.md) |
| How should profile context become a themed, low-decision scene builder? | [M13 Scene Builder](m13-scene-builder.md) |
| How does uploaded-profile comparison work, and what is still unresolved about persistent linked/multiple profiles? | [M14 Shared Profiles](m14-shared-profiles.md) |
| How should one activity vary by Dominant/submissive/non-D/s context and giving/receiving side? | [M15 Contextual Activity Profiles](m15-contextual-activity-profiles.md) |
| How should authored data, taxonomies, mappings, quizzes, radars, catalog items, and Rewards/Punishments be reviewed and curated? | [M16 Data & Content Curation](m16-data-content-curation.md) |
| How should the simple front/back body preference map work? | [M17 Body Map](m17-body-map.md) |
| How should application routing, page extraction, feature ownership, and large-file refactoring work? | [M18 Application Architecture & Routing](m18-application-architecture-routing.md) |
| What do we build next? | [Roadmap](../ROADMAP.md) |
| What is implemented today? | [README](../README.md) + code |
| How do we use the kink catalog? | [Reference Data](../reference/README.md) |

## Documentation rule

Avoid duplicating detailed decisions across files.

The Feature Guide and FAQ are the plain-language behavior layer. They should explain current product behavior without becoming a second scoring/data contract. When underlying behavior changes, update the authoritative spec first and then keep the user-facing wording aligned.

The roadmap is deliberately compact: keep milestone/slice status there, and keep implementation rules, acceptance criteria, semantic decisions, and deeper design notes in the appropriate detailed document.

If a scoring rule changes, update the scoring model and link to it elsewhere.  
If milestone order changes, update the roadmap.  
If product behavior or scope changes, update the product spec.  
If catalog identity, explicit-state, mapping, or catalog/profile behavior changes, update the M6 catalog integration contract.  
If C3 implementation details or acceptance criteria change, update the C3 explicit-preference scope.  
If source provenance, evidence flow, recomputation, or feedback-loop rules change, update the source-aware profile evidence architecture.  
If authority orientation, activity-side direction, or role/headspace semantics change, update the authority/activity/role separation contract.  
If pairwise catalog ranking behavior changes, update the this-or-that ranking spec. If temporal ranking-run/history behavior changes, update the M12 ranking-history spec.  
If overall profile aggregation or front-page facet behavior changes, update the overall profile aggregation spec.  
If settings, reset behavior, profile backup/restore, or share-summary export changes, update the M9 settings/profile-management spec.  
If reward/punishment contextual-use semantics, action-library identity, randomizer eligibility, or recipe behavior changes, update the M11 rewards/punishments spec.  
If scene themes, candidate filtering, current-session state, scene composition, or scene randomization changes, update the M13 scene-builder spec.  
If uploaded-profile comparison, interaction mappings, participant intent, shared scene filtering, or the unresolved persistent ownership/linking model changes, update the M14 shared-profiles spec.  
If authority × activity-side contextual preferences/rankings, context capability metadata, motivation annotations, or M11/M12/M13/M14 contextual integration changes, update the M15 contextual-activity-profiles spec.  
If authored datasets, curation workflow, taxonomy cleanup, replacement/migration rules, or the M11 recipe-builder review scope changes, update the M16 data/content curation spec.  
If Body Map region identity, state semantics, persistence, editing flow, or profile display changes, update the M17 Body Map spec.  
If application routing, page boundaries, application-shell ownership, source organization, or behavior-preserving UI refactor rules change, update the M18 Application Architecture & Routing spec.

The repository code remains authoritative for what is actually implemented.