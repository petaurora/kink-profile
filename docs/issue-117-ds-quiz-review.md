# Issue #117 — Dominance & Submission quiz review

Working review notes for `src/data/dsQuiz.ts`. These are discussion notes only; scoring changes should not land until the question-level decisions are agreed.

## Current bank

The D/s quiz currently has **18 questions** and is quiz version 1.

Current legacy-authored signal IDs normalize into canonical concepts including Control, Responsibility, Service, Obedience, Structure, Ownership Symbolism, Praise / Approval, and Autonomy. Directional channels describe the perspective of the concept itself, not Dominant/submissive identity.

## First-pass keep / review

### Likely keep

- **ds-001** — routine choices made by a trusted partner.
  - **Decision:** keep wording.
  - Primary semantic target: `control · Receiving`.
  - Secondary semantic target: `responsibility · Giving`.
  - Drop Structure; routine choices do not inherently imply rules, routines, or an ongoing framework.

- **ds-002** — clear instructions / expectation to follow.
  - **Decision:** keep wording.
  - Primary semantic target: `obedience · Giving`.
  - Secondary semantic target: `control · Receiving`.
  - Drop Structure; a clear instruction can be one-off and does not itself establish an ongoing framework.
- **ds-004** — ordinary task because a partner expects it; Providing Service + Following Direction + Receiving Structure.
- **ds-006** — standing rules / expectations; Receiving Structure with an obedience contribution.
- **ds-009** — praise for following direction.
  - **Decision:** keep.
  - Primary semantic target: `praise_approval · Receiving`.
  - Secondary semantic target: `obedience · Giving`.
  - This specifically measures praise in an obedience / following-direction context.

- **ds-010** — recognition for useful service.
  - **Decision:** keep.
  - Primary semantic target: `praise_approval · Receiving`.
  - Secondary semantic target: `service · Giving`.
  - This specifically measures recognition for usefulness / service rather than obedience.
- **ds-013** — creating rules / expectations for a willing partner; Giving Control + Providing Structure.
- **ds-014** — retaining important decisions unless explicitly handed over; Autonomy.
- **ds-015** — ownership / commitment symbolism independent of practical control; Ownership Symbolism.
- **ds-016** — meaningful room to choose how to respond within power exchange; Autonomy.

### Review for redundancy or semantic leakage

- **ds-003** — handing over responsibility for what happens next.
- **ds-017** — enjoying not having to decide because someone trusted has taken responsibility.
  - **Decision:** merge these into ds-003 and hide ds-017 as legacy compatibility input when D/s v2 is implemented.
  - Rewrite ds-003 to **“Deliberately handing over responsibility to someone I trust can make not having to decide feel freeing.”**
  - Primary semantic target: `responsibility · Giving`.
  - Secondary semantic target: `control · Receiving`.
  - Keep distinct from ds-001: ds-001 measures enjoying another person making routine choices; merged ds-003 measures the appeal / relief of transferring responsibility itself.

- **ds-005** — anticipating a partner's needs and seeing that it pleased them.
  - **Decision:** keep the wording.
  - Primary semantic target: `service · Giving`.
  - Drop the current `praise_approval · Receiving` contribution; seeing that a partner is pleased is not the same thing as receiving explicit praise, approval, or recognition.

- **ds-007** — symbols or rituals marking an ongoing power dynamic.
  - **Decision:** rewrite to **“Repeated rituals that mark or reaffirm a power dynamic can carry a lot of emotional meaning for me.”**
  - Primary semantic target: `ritual_significance · Overall`.
  - Drop the current Ownership Symbolism weight; ds-015 already measures the emotional meaning of commitment / ownership symbols.
  - Do not force a Structure contribution merely because the ritual is repeated; the question is intended to isolate the meaning of ritual/form itself.

- **ds-008** — being explicitly claimed / belonging to a trusted partner.
  - **Decision:** keep the wording essentially unchanged.
  - Primary semantic target: `ownership_symbolism · Receiving`.
  - Drop the current `control · Receiving` contribution; being claimed / belonging can carry meaning without implying practical authority or decision control.
  - Keep distinct from ds-015, which measures the broader appeal of commitment / ownership symbols independent of directional claiming.

- **ds-011** — enjoying setting direction when another person wants the user to lead.
  - **Decision:** keep, but rewrite to **“Taking responsibility for setting direction when a willing partner wants me to lead can be deeply satisfying.”**
  - Primary semantic target: `control · Giving`.
  - Secondary semantic target: `responsibility · Receiving` because the user is taking / holding responsibility for direction.

- **ds-012** — finding it rewarding that someone trusts the user enough to follow their direction.
  - **Decision:** keep, but rewrite to **“Having a willing partner deliberately follow my direction can feel deeply rewarding.”**
  - Primary semantic target: `obedience · Receiving` because the appeal is having agreed direction followed.
  - Secondary semantic target: `control · Giving`.
  - Keep distinct from ds-011: leadership / setting direction and being obeyed are related but separate preferences.

- **ds-018** — taking charge in some contexts without wanting that role to define every part of the relationship.
  - This may be measuring relationship/lifestyle scope more than Control + Autonomy. Review whether it belongs in D/s scoring or in a future cross-cutting engagement/context layer.

## Clear coverage gaps to review

The current D/s bank is strongly asymmetric. It contains substantial evidence for submissive-side / handing-over experiences, but several canonical directional perspectives have little or no direct authored coverage:

- **Responsibility · Receiving** — taking / holding responsibility for another person's direction or experience.
- **Obedience · Receiving** — the appeal of being followed / obeyed.
- **Service · Receiving** — the appeal of being served.
  - **Decision:** add a dedicated Receiving-side service question: **“Having a willing partner deliberately serve or take care of things for me can feel meaningful in the dynamic.”**
  - Primary semantic target: `service · Receiving`.
  - Keep this clean: do not automatically add Control or Responsibility merely because service occurs inside a D/s dynamic.
- **Ownership Symbolism · Giving** — claiming / owning a willing partner.
  - **Decision:** add a dedicated Giving-side ownership question: **“Explicitly claiming a willing partner or having them belong to me can feel emotionally meaningful.”**
  - Primary semantic target: `ownership_symbolism · Giving`.
  - Keep this clean: do not automatically add `control · Giving`; claiming / ownership symbolism does not inherently imply practical decision authority.
  - This complements ds-008 (`ownership_symbolism · Receiving`) and ds-015 (`ownership_symbolism · Overall`).
- **Praise / Approval · Giving** — giving recognition or approval within a dynamic.

### Approved new praise / worship question

- **Decision:** add a dedicated Giving-side praise / worship question:
  - **“Expressing admiration, gratitude, or reverence toward a partner I submit to can feel like a meaningful part of the dynamic.”**
  - Primary semantic target: `praise_approval · Giving`.
  - Secondary semantic target: `devotion · Giving`.
  - Do not add Ritual Significance by default; ritualized worship is an implementation/context distinction rather than inherent to the underlying preference.

### Worship / gratitude interpretation

- **Decision:** do not introduce a separate Worship canonical Signal.
- Submissive-to-Dominant admiration, gratitude, reverence, and worship primarily express `praise_approval · Giving` because the user is giving recognition / affirmation to the Dominant.
- Add `devotion · Giving` secondarily when the wording explicitly carries dedication, reverence, or relational devotion rather than simple thanks.
- Add `ritual_significance · Overall` only when the expression itself is formalized, repeated, ceremonial, or protocol-like; ordinary gratitude should not imply ritual.
- This is genuine reciprocal D/s coverage, not artificial symmetry: existing ds-009/ds-010 measure receiving praise/approval after obedience/service, while the current bank lacks the reverse acknowledgment flow.

These should be considered as possible new questions only where they represent a distinct psychological preference rather than adding questions for artificial symmetry.

## Findings from supplied D/s references

The additional practitioner/therapy-oriented references strengthen several model observations:

- **Power exchange is reciprocal but not symmetrical.** Sources describe one partner handing over defined control/responsibility while the other accepts the responsibility of leading, structuring, monitoring, or containing the dynamic. This supports measuring `responsibility · Receiving` directly rather than treating Dominance as control alone.
- **Being obeyed is distinct from exercising control.** Following direction is repeatedly described as active participation by the submissive, while the Dominant's experience includes having agreed direction followed. This supports direct `obedience · Receiving` evidence where wording genuinely targets the appeal of being followed.
- **Praise / gratitude can flow toward the Dominant.** Shelby Devlin explicitly emphasizes affirmation, gratitude, and praise from submissive to Dominant as part of reciprocity and recognition of the Dominant's effort. This makes `praise_approval · Giving` a genuine D/s construct rather than an artificial mirror of receiving praise.
- **Ritual is not interchangeable with Structure or Ownership.** Rules, protocols, tasks, and rituals are described as related but distinct scaffolding. This reinforces adding `ritual_significance` to ds-007 or rewriting it to isolate what it intends to measure.
- **Scope / lifestyle integration is separate from preference strength.** Sources distinguish scene-based, role-specific, casual, online, 24/7, and other forms of D/s. This reinforces the concern that ds-018 may be measuring how broadly D/s applies across a relationship rather than a canonical D/s preference Signal.
- **Service is a recognizable submissive orientation, but receiving service is not automatically equivalent to Dominance.** Add `service · Receiving` only if the question measures genuine appeal in being served, not merely leadership/control.
- **Trust, care, feedback, and communication are foundational relationship conditions.** They should not automatically become quiz Signals unless the question targets a distinct kink preference rather than healthy-practice requirements.

## External sanity check

The literature and supplied practitioner references consistently treat D/s as consensual power exchange and distinguish roles/perspectives rather than assuming every practitioner uses the same role in every context. They also describe rituals, orders/structure, responsibility, reciprocity, and varying degrees of lifestyle integration as related but separable features.

References consulted:

- De Neef et al. (2019), *Bondage-Discipline, Dominance-Submission and Sadomasochism (BDSM) From an Integrative Biopsychosocial Perspective: A Systematic Review* — https://pmc.ncbi.nlm.nih.gov/articles/PMC6525106/
- Crane & Ireland (2023), *Dominants, Submissives, and Bottom-up Text Analysis: Exploring BDSM Roles Through Romantic and Erotic Narratives* — https://www.tandfonline.com/doi/full/10.1080/00224499.2022.2111400
- Turley et al. (2022), *A certain evolution: a phenomenological study of 24/7 BDSM and negotiating consent* — https://www.tandfonline.com/doi/full/10.1080/19419899.2021.1901771
- SubTasks, *D/s Dynamic Explained: A Beginner's Glossary and Guide* — https://subtasksapp.com/blog/ds-dynamic-explained/
- Progressive Therapeutic Collective, *Beyond Stereotypes: Diving into the World of D/s Dynamics* — https://www.progressivetherapeutic.com.au/ptc-media-releases/ds-dynamics
- Shelby Devlin, *How Gratitude Strengthens D/s Dynamics* — https://www.shelbydevlin.com/blog/how-gratitude-strengthens-ds-dynamics
- House of Dasein, *An Introductory Guide to Building a D/s Dynamic* — https://houseofdasein.com.au/blogs/starting-out-in-kink/an-introductory-guide-to-building-a-d-s-dynamic
