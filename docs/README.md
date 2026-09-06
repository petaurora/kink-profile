# Documentation

This folder contains the product and scoring decisions that should guide implementation.

## Read in this order

1. [Product Spec](product-spec.md)  
   What the app is, how the quiz sections fit together, how signals/dynamic modes/roles are separated, and what is in or out of scope.

2. [M2 D/s Contract](m2-ds-design.md)  
   The implemented contract for the first real quiz: 9 signals, 18 questions, weight matrix, scoring behavior, and scope boundaries.

3. [M3 Roles & Headspaces Contract](m3-headspaces-direction.md)  
   The M3 v3 contract: 32 questions, shared signals, separate dynamic-mode and role/headspace layers, Predator/Prey, and split receiving/giving/dynamic radar views.

4. [M4 Bondage & Discipline Contract](m4-bd-design.md)  
   The implemented M4 contract: directional restraint/discipline signals, 26-question bank, weights, pain boundary, and split B&D radars.

5. [M5 Sadism & Masochism Contract](m5-sm-design.md)  
   The implemented M5 contract: directional pain/intensity/endurance/challenge signals, 26-question bank, weights, and receiving/giving S/M radars.

6. [M6 Catalog Integration](m6-catalog-integration.md)  
   The in-progress M6 contract: C1 stable IDs + C2 metadata/signal mappings are implemented; C3 explicit preference is next, followed by ranking hardening, catalog result integration, affinity foundation, and the M7 boundary.

7. [M6 C3 Explicit Preference](m6-c3-explicit-preference.md)  
   The concrete C3 implementation scope: state semantics, catalog-profile storage, legacy ranking migration, eligibility, comparison-card editing, tests, and acceptance scenarios.

8. [Kink This-or-That Ranking](kink-this-or-that-ranking.md)  
   The implemented Top-5-per-ranked-category funnel, category-home navigation, and remaining ranking hardening.

9. [Scoring & Taxonomy Model](scoring-model.md)  
   The reusable scoring architecture behind the core quizzes and catalog affinity.

10. [Overall Profile Aggregation](overall-profile-aggregation.md)  
   The M7 direction for canonical cross-quiz signals, broad front-page facets, the overall radar, role/mode summaries, catalog favorites, and coverage handling.

11. [Roadmap](../ROADMAP.md)  
   What is already implemented and what should be built next.

12. [Reference Data](../reference/README.md)  
   How the expanded kink catalog should be used without turning it into a 551-question test.

## Source of truth by topic

| Question | Source |
| --- | --- |
| What are we building? | [Product Spec](product-spec.md) |
| What exactly does M2 measure? | [M2 D/s Contract](m2-ds-design.md) |
| How is M3 modeled? | [M3 Roles & Headspaces Contract](m3-headspaces-direction.md) |
| How is M4 modeled? | [M4 Bondage & Discipline Contract](m4-bd-design.md) |
| How is M5 modeled? | [M5 Sadism & Masochism Contract](m5-sm-design.md) |
| How should M6 integrate the catalog? | [M6 Catalog Integration](m6-catalog-integration.md) |
| What exactly should C3 implement next? | [M6 C3 Explicit Preference](m6-c3-explicit-preference.md) |
| How should catalog items be pairwise ranked? | [Kink This-or-That Ranking](kink-this-or-that-ranking.md) |
| How should scoring and catalog affinity work generally? | [Scoring Model](scoring-model.md) |
| How should the overall front-page profile aggregate everything? | [Overall Profile Aggregation](overall-profile-aggregation.md) |
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
If pairwise catalog ranking behavior changes, update the this-or-that ranking spec.  
If overall profile aggregation or front-page facet behavior changes, update the overall profile aggregation spec.

The repository code remains authoritative for what is actually implemented.
