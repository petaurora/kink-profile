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
  - Semantic target: `praise_approval · Receiving` only.
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

### Control, playful resistance, and objectification

- **hs-010 — Responsibility Transfer / Receiving Control**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - The item directly re-measures surrendering direction / responsibility already authored in D/s and does not add distinct role/headspace evidence.

- **hs-011 — Playful Resistance**
  - **Decision:** keep wording unchanged.
  - Semantic target: `playful_resistance · Overall` only.
  - Drop the current Playfulness secondary weight. The playful framing is part of the Playful Resistance construct itself; general Playfulness is measured independently by hs-003.

- **hs-012 — Objectification · Receiving**
  - **Decision:** keep wording unchanged.
  - Semantic target: `objectification · Receiving` only.
  - Drop the current Role Embodiment and Receiving Control secondary weights. Objectification should be measured directly rather than inferring generic role immersion or control preference.

### Caregiver, guidance, and authority overlap

- **hs-013 — Care · Giving**
  - **Decision:** keep, but rewrite to **“Deliberately nurturing, soothing, or caring for another person can feel deeply rewarding in a role or dynamic.”**
  - Semantic target: `care · Giving` only.
  - Drop the current Responsibility Holding secondary weight. The item should measure care itself rather than the separate burden / meaning of holding responsibility.

- **hs-014 — Guidance / Shaping**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - Guidance / Shaping is already directly authored through B&D / D/s mechanics and does not add a distinct role/headspace primitive here.

- **hs-015 — Giving Control / Responsibility**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - The item directly re-measures authority / direction-setting already authored in D/s.

- **hs-016 — Giving Control / Responsibility**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - The emotional significance of a partner following direction still primarily measures authority / responsibility mechanics already established in D/s.

### Ownership, shaping, ritual, devotion, responsibility, and autonomy overlap

- **hs-017 — Ownership / claiming**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - D/s already directly authors claiming / Ownership Symbolism. Do not preserve the Responsibility Holding or Belonging secondary weights.

- **hs-018 — Guidance / practice**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - Guidance / Shaping and Structure are already authored through D/s / B&D.

- **hs-019 — Correction / shaping**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - This is primarily B&D correction / shaping territory and does not add a distinct Headspaces primitive.

- **hs-020 — Objectification · Giving**
  - **Decision:** keep wording unchanged.
  - Semantic target: `objectification · Giving` only.
  - Drop the current Giving Control secondary weight. Defining a partner by role / function establishes Objectification without inherently establishing authority preference.

- **hs-021 — Ritual / Structure / Giving Control**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - Ritual Significance, Structure, and Giving Control are already directly authored elsewhere.

- **hs-022 — Receiving devotion**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - The wording captures being the recipient of devotion, but canonical Devotion is currently Overall-only. Keeping this would add another Overall Devotion vote rather than preserving meaningful directionality. If directional Devotion is desired later, model it intentionally as a schema change.

- **hs-023 — Responsibility Holding**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - D/s already owns Responsibility evidence; hs-013 now cleanly owns Care · Giving.

- **hs-024 — Autonomy**
  - **Decision:** retire from the active v6 bank and retain as hidden legacy compatibility input.
  - D/s already directly measures Autonomy. Drop the current Role Embodiment secondary weight.

### Younger / less-adult headspace coverage

The initial proposal to keep only hs-025 and retire hs-026 / hs-027 was reconsidered before being locked.

**Decision:** keep three distinct authored probes for the same broader `younger_headspace` primitive because people may recognize this headspace through different phenomenology and may reject explicit “feeling younger” language while still resonating with a softer / less-adult / cared-for mode.

- **hs-025 — explicit age / adult-role shift**
  - **Decision:** keep, with wording refined to **“In the right role, feeling younger, smaller, or less anchored to my everyday adult self can be appealing or immersive.”**
  - Semantic target: `younger_headspace · Overall` only.
  - Drop Role Embodiment and Responsibility Transfer secondary weights.

- **hs-026 — setting aside adult responsibility**
  - **Decision:** keep, but rewrite to **“Being in a role where I can set aside some everyday adult responsibilities and simply be cared for can feel comforting or immersive.”**
  - Semantic target: `younger_headspace · Overall` only.
  - Care is the scenario / route into the headspace here, not a second Care vote; generic Care · Receiving is already measured by hs-004.
  - Drop Care · Receiving and Responsibility Transfer secondary weights.

- **hs-027 — agentic / middle-like expression**
  - **Decision:** keep, but rewrite to **“A more youthful or less-adult role can appeal to me even when I still want independence, opinions, and room to push back.”**
  - Semantic target: `younger_headspace · Overall` only.
  - Autonomy / Playfulness / Playful Resistance are contextual qualifiers that distinguish this expression from a more dependent one; they should not become additional weights because those primitives are measured independently elsewhere.

This preserves multiple interpretations of Little / Middle without directly scoring either role. The derived compositions still distinguish them through their other component evidence.

### Primal, Prey, and Predator

- **hs-028 — Primal Embodiment**
  - **Decision:** keep, with wording refined to **“In the right consensual context, feeling more instinctive, feral, or driven by body language than ordinary social rules can be deeply immersive.”**
  - Semantic target: `primal_embodiment · Overall` only.
  - Drop the current Role Embodiment secondary weight. Primal embodiment should stand on its own rather than automatically imply generic role immersion.

- **hs-029 — Pursuit · Receiving**
  - **Decision:** keep, with wording cleaned to preserve the direct pursuit concept.
  - Semantic target: `pursuit · Receiving` only.
  - Drop Primal Embodiment and Role Embodiment secondary weights.

- **hs-030 — Pursuit · Receiving**
  - **Decision:** keep wording unchanged.
  - Semantic target: `pursuit · Receiving` only.
  - This remains distinct from hs-029 because it measures active evasion / eventual capture rather than pursuit in the broad sense.
  - Drop Primal Embodiment and Playful Resistance secondary weights.

- **hs-031 — Pursuit · Giving**
  - **Decision:** keep, with wording cleaned to preserve the direct pursuit concept.
  - Semantic target: `pursuit · Giving` only.
  - Drop Primal Embodiment and Role Embodiment secondary weights.

- **hs-032 — Pursuit · Giving**
  - **Decision:** keep wording unchanged.
  - Semantic target: `pursuit · Giving` only.
  - This remains distinct from hs-031 because it measures closing distance / eventual capture rather than pursuit in the broad sense.
  - Drop Primal Embodiment and Giving Control secondary weights.

The intended derived relationship is:

```text
Primal Embodiment + Pursuit · Receiving → stronger Prey evidence
Primal Embodiment + Pursuit · Giving    → stronger Predator evidence
```

Primal preference and pursuit preference remain independently measurable, so someone can be primal without liking chase or enjoy pursuit without strongly identifying with a feral / primal state.

## Final v6 coverage audit

The approved v6 bank has **17 active questions** and **15 retired v5 compatibility questions**.

### Active Headspaces-owned evidence

- **Belonging** — hs-001
- **Role Embodiment** — hs-002
- **Playfulness** — hs-003
- **Care · Receiving** — hs-004
- **Praise / Approval · Receiving** — hs-005
- **Playful Resistance** — hs-011
- **Objectification · Receiving** — hs-012
- **Care · Giving** — hs-013
- **Objectification · Giving** — hs-020
- **Younger / less-adult Headspace** — hs-025, hs-026, hs-027
- **Primal Embodiment** — hs-028
- **Pursuit · Receiving** — hs-029, hs-030
- **Pursuit · Giving** — hs-031, hs-032

### Retired overlap

The following v5 questions are retired from new attempts because their primary semantic work is already authored by D/s / B&D or because they are composite mini-role questions rather than clean primitives:

`hs-006`, `hs-007`, `hs-008`, `hs-009`, `hs-010`, `hs-014`, `hs-015`, `hs-016`, `hs-017`, `hs-018`, `hs-019`, `hs-021`, `hs-022`, `hs-023`, `hs-024`.

### Derived-role coverage check

The trimmed bank intentionally does **not** require every derived role to have a dedicated Headspaces question.

- **Pet** combines Headspaces-owned Belonging / Role Embodiment / Playfulness / Care / Praise with shared Ownership evidence.
- **Slave** is primarily a D/s-derived interpretation of Responsibility Transfer / Obedience / Service / Ownership / Structure / Devotion / Control.
- **Little** combines Younger Headspace with Care, Role Embodiment, Responsibility Transfer, Playfulness, and Praise.
- **Middle** combines Younger Headspace with Role Embodiment, Playfulness, Autonomy, Care, and Playful Resistance.
- **Brat** combines Playful Resistance / Playfulness with D/s Autonomy / Control / Praise evidence.
- **Prey** combines Pursuit · Receiving + Primal Embodiment with supporting Role / Control / Resistance evidence.
- **Object** combines Objectification · Receiving + Role Embodiment with shared Control evidence.
- **Owner / Handler** combines shared Ownership / Guidance / Responsibility / Structure / Control evidence with Care · Giving.
- **Caregiver** combines Care · Giving with shared Responsibility / Guidance / Structure evidence.
- **Brat Tamer** combines shared Giving Control / Guidance / Responsibility with Playful Resistance / Playfulness.
- **Predator** combines Pursuit · Giving + Primal Embodiment with supporting Role / Control evidence.
- **Master / Mistress** remains primarily a D/s-derived interpretation of sustained Control / Responsibility / Ownership / Structure / Guidance.

This is intentional. Roles/headspaces are derived interpretations of canonical evidence, not direct quiz scores. A role may therefore become visible from earlier quizzes before the Roles & Headspaces section is completed, with affinity and evidence coverage remaining separate.

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
