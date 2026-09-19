# Issue #117 — Sadism & Masochism quiz review

Working review notes for `src/data/sadismMasochismQuiz.ts`. These are discussion notes only; scoring changes should not land until the question-level decisions are agreed.

## Current bank

The S/M quiz currently has **26 active questions** and is quiz version 1.

Current authored Signals normalize into six canonical concepts:

- Pain — Receiving / Giving
- Physical Intensity — Receiving / Giving
- Endurance — Receiving / Giving
- Challenge — Receiving / Giving
- Anticipation — Overall only
- Emotional Intensity — Overall only

The bank is intentionally mirrored between receiving and giving for most directional concepts.

## First-pass question clusters

### Pain — Receiving

- **sm-001** — consensual pain can be appealing outside discipline/punishment.
- **sm-002** — pain itself is desired rather than merely tolerated for another effect.
- **sm-011** — pain can be enjoyable without extreme physical intensity.

These appear related but may be doing three different jobs:
1. separating pain from Discipline,
2. separating intrinsic pain appeal from instrumental tolerance,
3. separating Pain from Physical Intensity.

Review whether all three earn their interaction cost or whether one/two can carry the distinction cleanly.

### Physical Intensity — Receiving

- **sm-003** — strong physical experience even when pain is not the main point.
- **sm-004** — increasing physical intensity makes an experience more immersive/compelling.
- **sm-012** — strong physical intensity can appeal even when only mildly painful / not primarily pain.

sm-003 and sm-012 appear especially close. sm-004 may be measuring escalation / immersion rather than a distinct canonical preference.

### Endurance — Receiving

- **sm-005** — sustained physical intensity over time can be rewarding.
- **sm-006** — continuing through an agreed difficult sensation can be satisfying.

Likely redundant or near-redundant. Review whether one clean Endurance question is enough or whether duration vs difficulty is meaningfully distinct.

### Challenge — Receiving

- **sm-007** — being pushed toward an agreed personal edge.
- **sm-008** — discovering one's response when an agreed experience becomes genuinely difficult.

Potentially distinct: edge-seeking vs self-testing/discovery. However sm-008 currently also contributes Endurance and Emotional Intensity; those secondary weights need semantic review.

### Receiving anticipation / emotional context

- **sm-009** — suspense before receiving pain or high intensity.
- **sm-010** — emotional charge of receiving pain/intensity.
- **sm-025** — general buildup before an intense experience.
- **sm-026** — highly charged emotional atmosphere independent of physical intensity.

sm-009 and sm-025 both feed the same Overall-only Anticipation concept despite one being receiving-specific in wording.
sm-010 and sm-026 both feed Overall Emotional Intensity despite one being receiving-specific in wording.

Review whether:
- the directional wording is useful even when canonical evidence is Overall,
- one general question can replace mirrored side-specific questions, or
- Anticipation / Emotional Intensity actually need directional channels.

### Pain — Giving

- **sm-013** — causing consensual pain can be appealing outside discipline/punishment.
- **sm-014** — a willing partner's pain itself can be compelling.
- **sm-023** — agreed pain can be appealing without extreme physical intensity.

Mirrors sm-001 / sm-002 / sm-011 and presents the same redundancy/distinction questions.

### Physical Intensity — Giving

- **sm-015** — creating a strong physical experience even when pain is not the main point.
- **sm-016** — increasing physical intensity can make the experience more compelling to give.
- **sm-024** — creating strong intensity even when only mildly painful / not primarily pain.

Mirrors sm-003 / sm-004 / sm-012. sm-015 and sm-024 appear especially close.

### Endurance — Giving

- **sm-017** — sustaining an intense experience over time.
- **sm-018** — maintaining an agreed difficult experience rather than making it brief.

Likely redundant or near-redundant, mirroring sm-005 / sm-006.

### Challenge — Giving

- **sm-019** — carefully pushing a willing partner toward an agreed personal edge.
- **sm-020** — appeal in seeing how a partner responds when an agreed experience becomes genuinely difficult.

Potentially distinct: edge-pushing vs observing/testing response. sm-020's Endurance and Emotional Intensity secondary weights need review.

### Giving anticipation / emotional context

- **sm-021** — suspense before later creating pain/high intensity.
- **sm-022** — emotional charge of giving pain/intensity.

These mirror sm-009 / sm-010 but currently normalize into Overall-only Anticipation / Emotional Intensity.

## First-pass semantic leakage to review

Several current secondary weights may infer a construct that the prompt does not actually establish:

- **sm-002**: Pain → Physical Intensity secondary
- **sm-003**: Physical Intensity → Pain secondary
- **sm-004**: Physical Intensity → Emotional Intensity secondary
- **sm-006**: Endurance → Pain secondary
- **sm-008**: Challenge → Endurance + Emotional Intensity secondaries
- **sm-009**: Anticipation → Pain + Physical Intensity secondaries
- **sm-010**: Emotional Intensity → Physical Intensity + Pain secondaries
- **sm-014**: Pain → Physical Intensity secondary
- **sm-015**: Physical Intensity → Pain secondary
- **sm-016**: Physical Intensity → Emotional Intensity secondary
- **sm-018**: Endurance → Pain secondary
- **sm-020**: Challenge → Endurance + Emotional Intensity secondaries
- **sm-021**: Anticipation → Pain + Physical Intensity secondaries
- **sm-022**: Emotional Intensity → Physical Intensity + Pain secondaries
- **sm-025**: Anticipation → Emotional Intensity secondary

The review should keep secondary evidence only where the wording itself establishes the secondary construct, rather than because the concepts often co-occur in practice.

## Structural questions for this review

1. How many authored questions are needed to distinguish Pain from Physical Intensity without repeatedly asking the same contrast?
2. Does Endurance need separate duration and difficulty questions, or can one item capture it cleanly?
3. Is Challenge primarily edge-seeking, self-testing, or both?
4. Should Anticipation remain Overall-only despite receiving/giving-specific authored questions?
5. Should Emotional Intensity remain Overall-only despite receiving/giving-specific authored questions?
6. Are mirrored receiving/giving questions genuinely useful evidence, or are some pairs only symmetry for symmetry's sake?

## Migration expectation

If v2 removes or merges questions, follow the established B&D / D/s compatibility pattern:

- bump S/M quiz version,
- keep retired question IDs as hidden legacy definitions,
- exclude legacy IDs from new attempts / retakes,
- preserve completed v1 results until explicit retake,
- completing v2 replaces the answer map and drops retired IDs,
- add representative bank + migration tests.
