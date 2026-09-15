# Issue #117 — Dominance & Submission quiz review

Working review notes for `src/data/dsQuiz.ts`. These are discussion notes only; scoring changes should not land until the question-level decisions are agreed.

## Current bank

The D/s quiz currently has **18 questions** and is quiz version 1.

Current legacy-authored signal IDs normalize into canonical concepts including Control, Responsibility, Service, Obedience, Structure, Ownership Symbolism, Praise / Approval, and Autonomy. Directional channels describe the perspective of the concept itself, not Dominant/submissive identity.

## First-pass keep / review

### Likely keep

- **ds-001** — routine choices made by a trusted partner; Receiving Control + handing over Responsibility + Receiving Structure.
- **ds-002** — clear instructions / expectation to follow; Receiving Control + Following Direction + Receiving Structure.
- **ds-004** — ordinary task because a partner expects it; Providing Service + Following Direction + Receiving Structure.
- **ds-006** — standing rules / expectations; Receiving Structure with an obedience contribution.
- **ds-009** — praise for following direction; Following Direction + Receiving Praise / Approval.
- **ds-010** — recognition for useful service; Providing Service + Receiving Praise / Approval.
- **ds-013** — creating rules / expectations for a willing partner; Giving Control + Providing Structure.
- **ds-014** — retaining important decisions unless explicitly handed over; Autonomy.
- **ds-015** — ownership / commitment symbolism independent of practical control; Ownership Symbolism.
- **ds-016** — meaningful room to choose how to respond within power exchange; Autonomy.

### Review for redundancy or semantic leakage

- **ds-003** — handing over responsibility for what happens next.
- **ds-017** — enjoying not having to decide because someone trusted has taken responsibility.
  - These appear to measure nearly the same Responsibility / Receiving Control experience and should be reviewed for merge/removal.

- **ds-005** — anticipating a partner's needs and seeing that it pleased them.
  - Service is clear; `praise_approval · Receiving` is less exact because the wording does not require explicit praise/recognition.

- **ds-007** — symbols or rituals marking an ongoing power dynamic.
  - Currently maps to Structure + Ownership Symbolism but not Ritual Significance despite explicitly mentioning ritual.

- **ds-008** — being explicitly claimed / belonging to a trusted partner.
  - Ownership Symbolism · Receiving is clear; Receiving Control may be secondary rather than inherent to the meaning.

- **ds-011** — enjoying setting direction when another person wants the user to lead.
- **ds-012** — finding it rewarding that someone trusts the user enough to follow their direction.
  - Both currently map only to Giving Control. They may be distinct, but ds-012 appears to contain unmodeled `obedience · Receiving` and possibly `responsibility · Receiving` evidence.

- **ds-018** — taking charge in some contexts without wanting that role to define every part of the relationship.
  - This may be measuring relationship/lifestyle scope more than Control + Autonomy. Review whether it belongs in D/s scoring or in a future cross-cutting engagement/context layer.

## Clear coverage gaps to review

The current D/s bank is strongly asymmetric. It contains substantial evidence for submissive-side / handing-over experiences, but several canonical directional perspectives have little or no direct authored coverage:

- **Responsibility · Receiving** — taking / holding responsibility for another person's direction or experience.
- **Obedience · Receiving** — the appeal of being followed / obeyed.
- **Service · Receiving** — the appeal of being served.
- **Ownership Symbolism · Giving** — claiming / owning a willing partner.
- **Praise / Approval · Giving** — giving recognition or approval within a dynamic.

These should be considered as possible new questions only where they represent a distinct psychological preference rather than adding questions for artificial symmetry.

## External sanity check

The literature consistently treats D/s as consensual power exchange and distinguishes roles/perspectives rather than assuming every practitioner uses the same role in every context. It also describes rituals, orders/structure, and varying degrees of lifestyle integration as related but separable features.

References consulted:

- De Neef et al. (2019), *Bondage-Discipline, Dominance-Submission and Sadomasochism (BDSM) From an Integrative Biopsychosocial Perspective: A Systematic Review* — https://pmc.ncbi.nlm.nih.gov/articles/PMC6525106/
- Crane & Ireland (2023), *Dominants, Submissives, and Bottom-up Text Analysis: Exploring BDSM Roles Through Romantic and Erotic Narratives* — https://www.tandfonline.com/doi/full/10.1080/00224499.2022.2111400
- Turley et al. (2022), *A certain evolution: a phenomenological study of 24/7 BDSM and negotiating consent* — https://www.tandfonline.com/doi/full/10.1080/19419899.2021.1901771
