# Issue #117 — Roles & Headspaces quiz review

Working review notes for `src/data/headspacesQuiz.ts`.

## Current bank

The Roles & Headspaces quiz currently has **32 active questions** and is quiz version 5.

The quiz does **not** directly score Pet / Slave / Brat / Prey / Caregiver / Owner / etc. Instead, its answers contribute canonical Signal evidence, and roles/headspaces are derived later from those Signals.

## Governing review principle

**Decision:** treat Roles & Headspaces as a progressive follow-up layer, not a fourth independent re-measurement of D/s, B&D, or S/M.

The quiz should primarily add **incremental role/headspace-specific evidence** that the other core quizzes do not already establish well.

For every question, ask:

> Does this question provide new role/headspace-specific evidence, or is it merely re-measuring a canonical Signal that D/s, B&D, or S/M already authors directly?

If it primarily re-measures an already-covered Signal, prefer retiring it unless the wording establishes a genuinely distinct semantic perspective that the composed role/headspace model needs.

## Why duplicate cross-quiz measurement matters

Canonical quiz evidence is retained by quiz source. Re-measuring the same canonical Signal in multiple quizzes can increase that Signal's quiz evidence breadth and can shift its aggregated affinity.

That means duplicated D/s-like questions here are not only repetitive UX; they can effectively give already-covered concepts extra quiz evidence.

The goal is therefore:

```text
D/s / B&D / S/M
    establish shared mechanics
             ↓
Roles & Headspaces
    adds missing role/headspace primitives
             ↓
canonical Signals + channels
             ↓
derived roles / headspaces / modes
```

A user does not need to complete every prerequisite quiz first. The existing affinity-vs-coverage model can represent a strong role match with limited evidence until more relevant sections are explored.

## Current composition dependencies

Roles/headspaces currently compose from shared Signals such as:

- control / responsibility;
- service / obedience / structure;
- ownership symbolism / praise / autonomy / devotion / ritual;
- belonging / role embodiment / playfulness;
- care;
- playful resistance;
- objectification;
- guidance / shaping;
- younger headspace;
- primal embodiment;
- pursuit.

Many of the first group are already directly authored by D/s or B&D. The second group contains more of the genuinely incremental evidence this quiz is best positioned to collect.

## First-pass overlap inventory

### Strong candidates for incremental Headspaces evidence

These concepts are not adequately covered by the other current quiz banks, or this bank provides the clearest direct authored evidence:

- **Belonging** — hs-001
- **Role Embodiment** — hs-002
- **Playfulness** — hs-003
- **Care · Receiving** — hs-004
- **Playful Resistance** — hs-011
- **Objectification · Receiving** — hs-012
- **Care · Giving** — hs-013
- **Objectification · Giving** — hs-020
- **Younger Headspace** — hs-025 / hs-026 / hs-027
- **Primal Embodiment** — hs-028
- **Pursuit · Receiving** — hs-029 / hs-030
- **Pursuit · Giving** — hs-031 / hs-032

These still need question-level review for redundancy and secondary-weight leakage.

### Strong overlap candidates

These appear to re-measure concepts already authored elsewhere and should be reviewed with a strong bias toward retirement:

- **Praise / approval** — hs-005
- **Devotion / service** — hs-006
- **Ritual / structure** — hs-007
- **Service** — hs-008
- **Structure / ritual / obedience** — hs-009
- **Responsibility transfer / receiving control** — hs-010
- **Guidance / shaping** — hs-014
- **Giving control / responsibility holding** — hs-015 / hs-016
- **Ownership / responsibility** — hs-017
- **Guidance / structure** — hs-018 / hs-019
- **Ritual / structure / giving control** — hs-021
- **Devotion / belonging / care** — hs-022
- **Responsibility holding / care / giving control** — hs-023
- **Autonomy** — hs-024

This is a first-pass classification, not a final keep/retire decision.

## Locked decisions

### Foundation primitives

- **hs-001 — Belonging**
  - **Decision:** keep, but rewrite to **“Feeling deeply connected to a trusted partner, like I genuinely belong in the relationship or dynamic, can deepen it for me.”**
  - Semantic target: `belonging · Overall` only.
  - Drop the current Ownership Symbolism secondary weight. Belonging should stand on its own rather than imply claiming / ownership semantics.

- **hs-002 — Role Embodiment**
  - **Decision:** keep wording unchanged.
  - Semantic target: `role_embodiment · Overall` only.

- **hs-003 — Playfulness**
  - **Decision:** keep, but rewrite to **“Playfulness, silliness, or letting myself be less serious can be an important part of enjoying a role.”**
  - Semantic target: `playfulness · Overall` only.
  - Drop the current Role Embodiment secondary weight; the item should measure Playfulness directly rather than treating immersion as a second construct.

### Care and praise

- **hs-004 — Care · Receiving**
  - **Decision:** keep, but rewrite to **“Being deliberately looked after, soothed, or cared for by someone I trust can feel deeply settling in a role or dynamic.”**
  - Semantic target: `care · Receiving` only.
  - Drop the current Responsibility Transfer secondary weight. Guidance / responsibility transfer is not required for receiving care.

- **hs-005 — Praise / Approval**
  - **Decision:** keep wording unchanged.
  - Semantic target: `praise_approval · Overall` only.
  - Drop the current Belonging secondary weight. Warm approval may reinforce belonging, but the item does not directly establish Belonging.
  - This remains useful despite D/s praise coverage because the D/s questions anchor praise to obedience / service, while hs-005 measures praise as part of role experience more broadly.

### Devotion, ritual, service, and protocol overlap

- **hs-006 — Devotion / Service**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - The item primarily re-measures Devotion / Service territory already authored directly in D/s and does not add a distinct Headspaces-specific primitive.

- **hs-007 — Ritual Significance**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - Ritual Significance is already directly authored in D/s. Protocol / Devotion modes can continue to derive from that shared evidence without a second quiz vote.

- **hs-008 — Service**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - “Part of my role” does not by itself establish separate Role Embodiment evidence. The semantic target remains Service, which D/s already measures directly.

- **hs-009 — Structure / Ritual / Obedience**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - The item primarily re-measures D/s / protocol mechanics already authored elsewhere and does not add a distinct Headspaces-specific primitive.

## Review goals

1. Preserve direct authored evidence for genuinely Headspaces-specific primitives.
2. Remove questions whose main effect is duplicating D/s/B&D/S/M evidence.
3. Remove secondary weights that infer adjacent concepts not directly established by the wording.
4. Prefer clean primitive questions over mini-compositions inside one prompt.
5. Keep role/headspace composition logic in the derived layer rather than authoring direct role scores.
6. Preserve migration compatibility for any retired v5 question IDs.
7. Bump the quiz version and add migration tests if the active bank changes materially.

## Migration expectation

If v6 removes or merges questions, follow the established B&D / D/s / S/M compatibility pattern:

- bump Roles & Headspaces quiz version;
- keep retired question IDs as hidden legacy definitions;
- exclude legacy IDs from new attempts / retakes;
- preserve completed v5 results until explicit retake;
- completing v6 replaces the answer map and drops retired IDs;
- register legacy Headspaces questions in `quizQuestions`;
- add representative bank + migration tests.
