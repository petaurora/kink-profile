# Documentation

This folder contains the product and scoring decisions that should guide implementation.

## Read in this order

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
   The implemented M6 contract: C1 stable IDs + C2 mappings + C3 direct preference/table state + C4 source-aware evidence convergence + C5 ranking hardening + C6 catalog result integration + C7 affinity/recommendation hardening. M7 Full Overall Profile is next.

8. [M6 C3 Explicit Preference + Catalog Table](m6-c3-explicit-preference.md)  
   The implemented C3 contract: shared Catalog-ID state, catalog-profile storage/migration, searchable preference table/list, ranking interconnection, eligibility, tests, and the explicit C4 handoff.

9. [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md)  
   The implemented C4/M7 convergence contract: quizzes, explicit catalog state, pairwise ranking, inferred catalog affinity, source provenance, recomputation, and the no-feedback-loop rule.

10. [Kink This-or-That Ranking](kink-this-or-that-ranking.md)  
    The implemented category/Overall ranking flow, C5 meaningful-evidence/finalist/history hardening, and C6 explicit/inferred result integration.

11. [Scoring & Taxonomy Model](scoring-model.md)  
    The reusable scoring architecture behind the core quizzes, catalog affinity, source-aware recomputation, and the C7 recommendation-suppression/no-feedback boundaries.

12. [Overall Profile Aggregation](overall-profile-aggregation.md)  
    The active M7 implementation contract, now split into M7.1–M7.11 testable slices: canonical aggregation/inspection, facets, header, radar, role/mode summaries, Top Overall, limits, Interest Areas, catalog drill-down, explainability, and final polish.

13. [M9 Settings, Profile Management & Sharing](m9-settings-profile-management.md)  
    The planned Settings/profile-lifecycle contract: display name, selective reset, complete versioned backup/restore, share-summary presentation, and PNG/HTML/PDF output.

14. [Roadmap](../ROADMAP.md)  
    What is already implemented and what should be built next.

15. [Reference Data](../reference/README.md)  
    How the expanded kink catalog should be used without turning it into a 551-question test.

## Source of truth by topic

| Question | Source |
| --- | --- |
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
| What do we build next? | [Roadmap](../ROADMAP.md) |
| What is implemented today? | [README](../README.md) + code |
| How do we use the kink catalog? | [Reference Data](../reference/README.md) |

## Documentation rule

Avoid duplicating detailed decisions across files.

If a scoring rule changes, update the scoring model and link to it elsewhere.  
If milestone order changes, update the roadmap.  
If product behavior or scope changes, update the product spec.  
If catalog identity, explicit-state, mapping, or catalog/profile behavior changes, update the M6 catalog integration contract.  
If C3 implementation details or acceptance criteria change, update the C3 explicit-preference scope.  
If source provenance, evidence flow, recomputation, or feedback-loop rules change, update the source-aware profile evidence architecture.  
If authority orientation, activity-side direction, or role/headspace semantics change, update the authority/activity/role separation contract.  
If pairwise catalog ranking behavior changes, update the this-or-that ranking spec.  
If overall profile aggregation or front-page facet behavior changes, update the overall profile aggregation spec.  
If settings, reset behavior, profile backup/restore, or share-summary export changes, update the M9 settings/profile-management spec.

The repository code remains authoritative for what is actually implemented.
