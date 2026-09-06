# M5 — Sadism & Masochism Design

## Status

**Implemented contract for M5.**

This document records the implemented Sadism & Masochism signal model, 26-question bank, scoring boundaries, and directional result views. Code and this contract should evolve together.

M5 should model **pain and intensity preferences** without collapsing:

- receiving and giving
- pain and general physical intensity
- intensity and endurance
- intensity and challenge
- physical intensity and emotional intensity
- anticipation into fear/anxiety
- discipline into pain
- all sensation play into S/M

---

# M5 contract

The implemented M5 contract is:

- **26 questions**
- directional pain/intensity/endurance/challenge signals
- weighted multi-signal scoring with coverage
- reuse shared `anticipation`
- add shared `emotional_intensity`
- one unified ranked signal list
- a **Receiving / Masochistic** radar
- a **Giving / Sadistic** radar
- no forced "Sadist" or "Masochist" identity label
- no technique/item questions
- no catalog inference yet

The section should answer:

> Which aspects of consensual pain, physical intensity, endurance, and challenge appeal to me, and from which side?

not:

> How sadistic or masochistic am I?

---

# Core modeling decisions

## Pain is directional

Pain directed toward oneself and pain directed toward a willing partner are distinct preferences.

Model independently:

- Pain Receiving
- Pain Giving

Do not infer one from the other.

## Intensity is directional

A user may enjoy being physically overwhelmed or strongly stimulated without wanting to create that experience for someone else, or vice versa.

Model independently:

- Receiving Intensity
- Giving Intensity

## Pain is not intensity

Pain is one possible component of an intense experience.

A user may:

- enjoy pain at moderate intensity
- enjoy high physical intensity when pain is not the primary appeal
- enjoy both
- enjoy neither

Therefore Pain Receiving/Giving and Receiving/Giving Intensity remain separate.

## Endurance is not intensity

Intensity describes **how strong the physical experience feels**.

Endurance describes the appeal of **sustaining or staying with intensity over time**.

Model directionally:

- Receiving Endurance
- Giving Endurance

This keeps "hard and brief" distinct from "sustained challenge."

## Challenge is not intensity

Challenge describes the appeal of approaching or testing an agreed personal edge.

It is not a synonym for simply wanting more intensity.

Model directionally:

- Receiving Challenge
- Giving Challenge

A user may enjoy intense sensation without wanting a limit-testing frame.

## Emotional intensity is separate from physical intensity

Some users enjoy S/M partly because it creates a highly charged emotional experience.

Others may enjoy the physical experience while preferring the emotional tone to stay light, playful, calm, or technical.

Model:

- Emotional Intensity

as an independent signal.

## Anticipation is shared

M4 already defines `anticipation` as the appeal of suspense, waiting, or knowing an intense/structured experience is coming.

M5 reuses that stable signal ID because the underlying meaning matches.

M5 evidence remains section-local.

## M5 does not require power exchange

Pain or intensity may appeal:

- inside a D/s dynamic
- as challenge/play
- as physical sensation
- as emotional intensity
- without meaningful authority transfer at all

Do not make receiving pain synonymous with submission or giving pain synonymous with dominance.

## Recovery / care is contextual, not an S/M affinity

Wanting reassurance, soothing, closeness, space, or other recovery support after intensity may be important to the user, but it does not mean they have stronger Pain or Intensity affinity.

Do not add a generic "aftercare score" to M5 or use care preference to raise S/M results.

Existing care-related signals or future context/preferences can represent that separately.

---

# Signal vocabulary

## New M5 signals

| ID | Label | Meaning |
| --- | --- | --- |
| `pain_receiving` | Pain Receiving | consensual pain directed toward oneself can be intrinsically appealing |
| `pain_giving` | Pain Giving | consensually causing pain to a willing partner can be intrinsically appealing |
| `receiving_intensity` | Receiving Intensity | appeal of a physically strong or overwhelming experience directed toward oneself |
| `giving_intensity` | Giving Intensity | appeal of creating a physically strong or overwhelming experience for a willing partner |
| `receiving_endurance` | Receiving Endurance | appeal of remaining with sustained physical intensity or discomfort over time |
| `giving_endurance` | Giving Endurance | appeal of deliberately sustaining intensity for a willing partner over time |
| `receiving_challenge` | Receiving Challenge | appeal of being consensually pushed toward an agreed personal edge |
| `giving_challenge` | Giving Challenge | appeal of carefully pushing a willing partner toward an agreed personal edge |
| `emotional_intensity` | Emotional Intensity | appeal of the heightened emotional charge that can accompany an intense scene |

## Reused shared signal

- `anticipation`

M5 may produce M5-local evidence for Anticipation.

Completing M4 must not silently affect M5's section result, and completing M5 must not silently change M4.

M7 owns cross-quiz aggregation.

---

# Signal boundaries

## Pain Receiving vs Receiving Intensity

- **Pain Receiving:** pain itself is part of the appeal.
- **Receiving Intensity:** physical strength/overwhelm is part of the appeal even when pain is not the central feature.

## Pain Giving vs Giving Intensity

- **Pain Giving:** causing agreed pain itself is part of the appeal.
- **Giving Intensity:** creating a physically strong experience is part of the appeal even when pain is not the central feature.

## Receiving Intensity vs Receiving Endurance

- **Receiving Intensity:** strength of experience.
- **Receiving Endurance:** sustaining it over time.

## Giving Intensity vs Giving Endurance

- **Giving Intensity:** strength of experience created.
- **Giving Endurance:** maintaining that intensity/challenge over time.

## Receiving Challenge vs Receiving Endurance

- **Challenge:** approaching/testing an agreed edge.
- **Endurance:** staying with sustained intensity.

A long experience does not automatically need to feel limit-testing.

## Giving Challenge vs Giving Endurance

- **Challenge:** intentionally pushing toward an agreed edge.
- **Endurance:** deliberately sustaining intensity over time.

## Emotional Intensity vs physical intensity

Emotional charge should not be inferred merely because a scene is physically intense.

Likewise, a highly emotional scene does not necessarily imply extreme physical intensity.

---

# Relationship to M4 Discipline

M4 intentionally models discipline **without requiring pain**.

M5 models pain **without requiring discipline**.

Conceptually:

```text
M4: correction / consequence / accountability
M5: pain / intensity / endurance / challenge
```

A real-world interaction can contain both, but the section quizzes remain independently scored.

Do not add `receiving_discipline` or `giving_discipline` weights to M5 questions merely because pain can sometimes be used as a consequence.

---

# Relationship to general sensation play

M5 should not swallow every intense sensation into S/M.

Temperature, texture, vibration, electrical sensation, sensory deprivation, and other specific sensation interests belong in later catalog/sensation modeling unless the question is specifically measuring pain/intensity/challenge as an underlying mechanism.

M5 questions should remain mechanism-level rather than asking whether the user likes specific implements or techniques.

---

# Questionnaire rules

Follow the shared weighted-question model from [scoring-model.md](scoring-model.md).

## Preserve direction

Receiving and giving questions must be separately represented.

Do not derive Giving Pain from Pain Receiving or vice versa.

## Avoid technique questions

Do not ask:

> Do you like [specific pain technique]?

Those are catalog/item-level interests.

Prefer:

> Pain can be appealing to me even when it is not part of discipline or punishment.

## Avoid instructional content

The quiz measures preference.

It should not provide:

- technique instructions
- body targets
- thresholds
- duration guidance
- injury guidance
- instructions for intensifying pain

## Keep consent explicit where needed

Giving-side questions should make willing/consensual context clear.

Challenge questions should refer to an **agreed personal edge** rather than unsafe or uncontrolled escalation.

## Do not score tolerance as desire

The fact that someone *can* tolerate pain/intensity does not mean they enjoy it.

Questions should ask about appeal/reward, not capability.

---

# Implemented 26-question bank

## Receiving / masochistic-side evidence

### SM-001

> Consensual pain directed toward me can be appealing even when it is not part of discipline or punishment.

Evidence:

- pain_receiving 1.0

### SM-002

> Pain itself can be part of what I want from an intense experience, rather than merely something I tolerate to get another effect.

Evidence:

- pain_receiving 1.0
- receiving_intensity 0.3

### SM-003

> A physically strong experience can be appealing to me even when pain is not the main point.

Evidence:

- receiving_intensity 1.0
- pain_receiving 0.2

### SM-004

> Increasing physical intensity can make an experience feel more immersive or compelling for me.

Evidence:

- receiving_intensity 1.0
- emotional_intensity 0.2

### SM-005

> Staying with sustained physical intensity over time can feel rewarding rather than merely tiring.

Evidence:

- receiving_endurance 1.0
- receiving_intensity 0.5

### SM-006

> There can be satisfaction in continuing through an agreed difficult sensation instead of wanting it to end quickly.

Evidence:

- receiving_endurance 1.0
- pain_receiving 0.3

### SM-007

> Being consensually pushed toward an agreed personal edge can be exciting in a way ordinary intensity is not.

Evidence:

- receiving_challenge 1.0
- receiving_intensity 0.5

### SM-008

> Part of the appeal can be discovering how I respond when an agreed experience becomes genuinely difficult.

Evidence:

- receiving_challenge 1.0
- receiving_endurance 0.5
- emotional_intensity 0.2

### SM-009

> Knowing in advance that a painful or highly intense experience is coming can build appealing suspense.

Evidence:

- anticipation 1.0
- pain_receiving 0.3
- receiving_intensity 0.3

### SM-010

> The emotional charge of receiving consensual pain or intensity can be as important to me as the physical sensation.

Evidence:

- emotional_intensity 1.0
- receiving_intensity 0.4
- pain_receiving 0.2

### SM-011

> I can enjoy pain without needing the experience to become extremely intense.

Evidence:

- pain_receiving 0.9

### SM-012

> I can enjoy strong physical intensity even when the sensation is only mildly painful or not primarily about pain.

Evidence:

- receiving_intensity 0.9

---

## Giving / sadistic-side evidence

### SM-013

> Consensually causing pain to a willing partner can be appealing even when it is not part of discipline or punishment.

Evidence:

- pain_giving 1.0

### SM-014

> A willing partner's experience of pain can itself be part of what makes an interaction compelling to me.

Evidence:

- pain_giving 1.0
- giving_intensity 0.3

### SM-015

> Creating a physically strong experience for a willing partner can be appealing even when pain is not the main point.

Evidence:

- giving_intensity 1.0
- pain_giving 0.2

### SM-016

> Increasing the physical intensity of an agreed experience can make it more compelling for me to give.

Evidence:

- giving_intensity 1.0
- emotional_intensity 0.2

### SM-017

> Deliberately sustaining an intense experience for a willing partner over time can be satisfying.

Evidence:

- giving_endurance 1.0
- giving_intensity 0.5

### SM-018

> There can be satisfaction in maintaining an agreed difficult experience rather than making it brief.

Evidence:

- giving_endurance 1.0
- pain_giving 0.3

### SM-019

> Carefully pushing a willing partner toward an agreed personal edge can be exciting in a way ordinary intensity is not.

Evidence:

- giving_challenge 1.0
- giving_intensity 0.5

### SM-020

> Part of the appeal can be seeing how a willing partner responds when an agreed experience becomes genuinely difficult.

Evidence:

- giving_challenge 1.0
- giving_endurance 0.5
- emotional_intensity 0.2

### SM-021

> Knowing that I will later create a painful or highly intense experience for a willing partner can build appealing suspense.

Evidence:

- anticipation 1.0
- pain_giving 0.3
- giving_intensity 0.3

### SM-022

> The emotional charge of giving consensual pain or intensity can be as important to me as the physical act itself.

Evidence:

- emotional_intensity 1.0
- giving_intensity 0.4
- pain_giving 0.2

### SM-023

> I can enjoy causing agreed pain without needing the experience to become extremely intense.

Evidence:

- pain_giving 0.9

### SM-024

> I can enjoy creating strong physical intensity even when the experience is only mildly painful or not primarily about pain.

Evidence:

- giving_intensity 0.9

---

## Shared context evidence

### SM-025

> The waiting and buildup before an intense experience can be an important part of the appeal for me.

Evidence:

- anticipation 1.0
- emotional_intensity 0.3

### SM-026

> A highly charged emotional atmosphere can make an intense experience more compelling even when the physical intensity is moderate.

Evidence:

- emotional_intensity 1.0

---

# Implemented evidence distribution

Approximate direct/secondary prompt coverage:

| Signal | Prompts |
| --- | ---: |
| Pain Receiving | 7 |
| Pain Giving | 7 |
| Receiving Intensity | 8 |
| Giving Intensity | 8 |
| Receiving Endurance | 3 |
| Giving Endurance | 3 |
| Receiving Challenge | 2 |
| Giving Challenge | 2 |
| Anticipation | 3 |
| Emotional Intensity | 8 |

Different prompt counts are acceptable because each signal is normalized against its own answered evidence weight.

Challenge is intentionally narrow and directly worded. If live results prove too sensitive to one answer, add another prompt per direction before broadening the definition.

---

# Scoring

Use the existing shared weighted-signal calculation:

```text
sum(normalized response × signal weight)
-----------------------------------------
        sum(answered signal weight)
```

Coverage remains independent from affinity.

Missing evidence is unknown, not zero.

M5 section results are calculated from **M5-local answers only**.

---

# Results

## Unified ranked list

Show all ten primary M5 result signals together:

- Pain Receiving
- Pain Giving
- Receiving Intensity
- Giving Intensity
- Receiving Endurance
- Giving Endurance
- Receiving Challenge
- Giving Challenge
- Anticipation
- Emotional Intensity

Example:

```text
Pain Receiving       91%
Receiving Intensity  86%
Anticipation         81%
Receiving Endurance  74%
Emotional Intensity  69%
Receiving Challenge  42%
Pain Giving          18%
```

## Receiving / Masochistic radar

Axes:

- Pain Receiving
- Receiving Intensity
- Receiving Endurance
- Receiving Challenge
- Anticipation
- Emotional Intensity

## Giving / Sadistic radar

Axes:

- Pain Giving
- Giving Intensity
- Giving Endurance
- Giving Challenge
- Anticipation
- Emotional Intensity

Anticipation and Emotional Intensity intentionally appear in both views because they describe shared context rather than direction.

## No forced identity label

The app should not conclude:

> You are a Masochist.

or:

> You are a Sadist.

The section reports signal affinities.

A user may personally identify with those labels, but M5 does not assign them.

---

# Relationship to M6 catalog

M5 should measure mechanisms, not catalog rows.

Later, M6 can map specific interests to M5 signals.

Conceptually:

```text
specific catalog interest
    ↓
pain / intensity / endurance / challenge signals
```

Explicit item preference remains distinct from inferred affinity.

---

# Relationship to M7

Like M2–M4, M5 can produce source-aware evidence for shared signals.

In particular, `anticipation` may now have M4 and M5 evidence.

Do not average or merge those inside either section result.

M7 owns canonical cross-quiz aggregation and must avoid double-counting repeated SignalIds.

---

# Out of scope for M5

Do not add during this milestone:

- specific pain techniques or implements
- safety/injury instructions
- physical thresholds
- generic sensation-play taxonomy
- discipline scoring
- restraint scoring
- forced Sadist/Masochist identity
- recovery/aftercare as an S/M affinity score
- catalog affinity
- cross-quiz evidence merging
- adaptive Quick/Deep modes
- partner compatibility
- AI-generated interpretation
- cloud persistence

---

# Post-implementation review questions

1. Are Pain and Intensity clearly distinguishable in the question wording?
2. Are Endurance and Challenge distinct enough to justify separate signals?
3. Does Challenge need a third prompt per direction after evaluating live results?
4. Does Emotional Intensity belong as one shared signal rather than receiving/giving versions?
5. Does Anticipation still mean the same thing as M4's shared signal?
6. Are any prompts accidentally measuring tolerance/capability instead of desire?
7. Does the section remain meaningful for users who enjoy S/M without D/s?
8. Are the giving-side questions clear about willing/consensual context without becoming repetitive?
9. Is 26 questions a good balance between evidence coverage and fatigue?
10. Is any major S/M mechanism missing from the initial implemented model?

Future changes to M5 signal IDs, question weights, or radar composition should update this contract and the implementation together.
