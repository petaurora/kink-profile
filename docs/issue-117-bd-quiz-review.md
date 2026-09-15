# Issue #117 — Bondage & Discipline quiz review

Decision record for the Bondage & Discipline slice of Issue #117. The decisions below are implemented by PR #237 in B&D quiz version 2.

## Resulting bank

The active B&D bank contains **27 questions**.

Two v1 questions are intentionally hidden from new attempts while remaining registered as compatibility input for old stored/exported answer maps:

- **bd-007** — merged into bd-006.
- **bd-018** — removed as redundant.

Completing a v2 retake replaces the old B&D answer map atomically, so hidden legacy answer IDs naturally disappear after the user retakes the quiz.

## Question decisions

### Kept

- **bd-001** — physical restraint independent of pain.
- **bd-002** — immersive movement restriction.
- **bd-003** — maintaining a required position.
- **bd-004** — being deliberately arranged / posed.
- **bd-008** — restraint anticipation.
- **bd-009** — giving physical restraint.
- **bd-010** — giving movement restriction.
- **bd-011** — positioning another person and requiring them to maintain it.
- **bd-012** — arranging another person's posture; `guidance_shaping` removed because arranging a body is not inherently coaching/correction.
- **bd-013** — deciding how much physical freedom a restrained partner has.
- **bd-014** — enjoying the containment side of agreed escape/struggle.
- **bd-015** — known follow-through for rules.
- **bd-016** — receiving an agreed consequence independent of pain.
- **bd-017** — receiving correction that restores an expectation.
- **bd-019** — giving an agreed consequence.
- **bd-021** — choosing a fitting consequence.
- **bd-022** — standing rules beyond one scene.
- **bd-023** — formal procedures / rituals.
- **bd-025** — following protocol because the form matters.
- **bd-026** — creating deliberate procedure / protocol.

### Rewritten / merged

- **bd-005** — **“Part of the appeal of restraint can be surrendering control of my movement to someone I trust.”**
  - Folds vulnerability / release-of-control into the existing restraint-control construct rather than adding another overlapping question.

- **bd-006** — **“Testing or struggling against agreed restraint—including trying to get free—can make the experience more exciting for me.”**
  - Merges old bd-006 + bd-007.
  - Primary semantic target: `escape_containment · Receiving`.
  - Removes `playful_resistance`; physical struggling against restraint is not automatically relational teasing/pushback.

- **bd-020** — **“Helping a willing partner correct their behavior toward an agreed expectation can feel meaningful even when no consequence is needed.”**
  - Primary semantic target: `guidance_shaping · Giving`.
  - Smaller `accountability · Giving` contribution.
  - Removes `discipline · Giving` so the question cleanly measures correction/shaping without requiring a consequence.
  - This keeps a useful progression of expectation → correction → consequence.

- **bd-024** — **“Knowing in advance that a consequence or correction is coming can build appealing anticipation.”**
  - Primary semantic target: `anticipation · Overall`.
  - Smaller `discipline · Receiving` contribution.
  - Removes ritual/accountability leakage; restraint anticipation is already measured by bd-008 and ritual significance elsewhere in the bank.

### Removed from active attempts

- **bd-018** — “A non-painful corrective task or consequence can still feel strongly like discipline to me.”
  - Removed with no replacement because bd-016/017 already establish that discipline/correction need not be painful.

## Added questions

### bd-027 — responsibility while restraining

**“Being trusted with the responsibility for a restrained partner's safety and physical freedom can make restraint especially meaningful to me.”**

- Uses the existing Responsibility concept rather than a restraint-specific Signal.
- Primary semantic target: `responsibility · Receiving` because the person is taking / holding responsibility.
- Smaller restraint/control context comes from `restraint · Giving` and `constraint_control · Giving`.
- This intentionally demonstrates that activity side and Signal channel are separate concepts.

### bd-028 — sensory / communication restriction

**“Having a trusted partner deliberately limit what I can see, hear, or say can make the sense of control more immersive.”**

- No new sensory-specific canonical Signal.
- Primary target: `constraint_control · Receiving`.
- Smaller `control · Receiving` contribution.
- Not `movement_restriction`; perception/communication can be restricted while movement remains free.
- Blindfolds, hoods, gags, hearing restriction, darkness, and similar implementations remain catalog/modifier data.

### bd-029 — aesthetic bondage / visual composition

**“The visual form and composition of bondage can make it appealing to me even when restriction itself is not the main point.”**

- No new aesthetic-specific canonical Signal.
- Primary target: `ritual_significance · Overall` — the form itself carries value beyond practical function.
- Secondary `positioning · Overall` contribution for deliberate body composition.
- Light broad restraint context without treating visual appeal as a preference for being controlled.
- Shibari/decorative styles, body framing, materials, patterns, and presentation remain catalog/modifier detail.

## Canonical model decisions

### Movement Restriction is directional

`movement_restriction` remains one canonical Signal, but now supports Receiving and Giving channels.

- bd-001 / bd-002 / bd-003 movement-restriction evidence → Receiving.
- bd-010 movement-restriction evidence → Giving.

Do not create separate `receiving_movement_restriction` / `giving_movement_restriction` canonical IDs. Receiving/Giving here describes activity-side perspective and does not imply Dominant/submissive authority.

### Positioning maintains the arrange-vs-maintain distinction

- bd-003 = maintaining a required position, Receiving side.
- bd-004 = being physically arranged / posed, Receiving side.
- bd-011 = positioning another person and expecting them to maintain it, Giving side.
- bd-012 = arranging another person's posture for its own sake, Giving side.

These remain one `positioning` concept with channels rather than proliferating more Signal IDs.

### Escape / Containment remains one directional concept

- merged bd-006 → `escape_containment · Receiving`.
- bd-014 → `escape_containment · Giving`.

### Ritual significance remains nondirectional

bd-025 and bd-026 keep `ritual_significance · Overall`. Their directional difference is already represented by Structure (`Receiving` for bd-025, `Giving` for bd-026), so ritual itself does not need artificial channels.

## Backward compatibility

B&D quiz version is now **2**.

Migration contract:

1. v1 stored/exported answer maps remain loadable.
2. Removed bd-007 and bd-018 definitions remain registered but are not active v2 question IDs.
3. A profile with a genuinely completed older quiz version remains an established result even when the current bank has new questions.
4. The user can explicitly start a v2 retake from that historical result.
5. The established v1 answers remain authoritative while the v2 retake is incomplete.
6. Completing the v2 retake replaces the stable answer map with only v2 answers, removing obsolete hidden IDs.
7. `completedAt` does not bypass completeness validation for the current quiz version; the compatibility exception applies only to older completed versions.

## Intentionally covered elsewhere

- **Tasking** — already represented by D/s through Obedience, Service, and Structure.
- **Praise / reward** — Praise / Approval is a canonical Signal and is directly measured in D/s; concrete rewards belong to the Rewards system/catalog rather than becoming one B&D Signal.
- **Fantasy vs practice vs lifestyle intensity** — explicitly out of scope for B&D scoring. These are cross-cutting engagement dimensions, not levels of B&D preference strength.

## References consulted

- Encyclopedia.com — Bondage and Discipline: https://www.encyclopedia.com/social-sciences/encyclopedias-almanacs-transcripts-and-maps/bondage-and-discipline
- JOI Training — Bondage and Discipline: https://joitraining.com/blog/bondage-and-discipline
- De Neef et al. (2019), systematic review: https://pmc.ncbi.nlm.nih.gov/articles/PMC6525106/
