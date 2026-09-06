# M2 — Dominance & Submission Quiz Design

## Status

**Implemented contract for M2.**

This document records the reviewed behavior of the first real signal-weighted quiz and should remain aligned with the M2 implementation.

M2 established the weighted-signal scoring architecture that later sections reuse and extend.

---

# M2 contract

The implemented standard D/s quiz is:

- approximately **18 questions**
- **9 independent signals**
- weighted multi-signal scoring
- multiple pieces of evidence per signal
- score coverage retained internally
- ranked signal results
- a D/s radar chart
- short descriptive interpretation
- **no forced Dominant/submissive role label**
- **no headspace scoring in M2**
- **no catalog inference in M2**

The quiz should answer:

> What shapes of power exchange appeal to me?

not:

> Which single BDSM role am I?

---

# Core modeling decision: signals are independent

D/s is not one slider.

Do **not** model this:

```text
Dominant <----------------------------> submissive
```

Model independent preferences instead:

```text
Receiving Control       91%
Giving Control           64%
Responsibility Transfer  86%
Service                  61%
Obedience                58%
Structure                73%
Ownership Symbolism      82%
Praise / Approval        77%
Autonomy                 72%
```

A person can score highly on both Receiving Control and Giving Control.

A person can also score highly on Receiving Control **and** Autonomy. That may describe selective, negotiated, contextual, or limited power exchange rather than a contradiction.

The scoring system should preserve those patterns instead of collapsing them into a role label.

This is what allows the profile to represent:

- submissive-leaning preferences
- dominant-leaning preferences
- switchy preferences
- context-dependent control
- service without strong obedience
- structure without broad surrender
- ownership symbolism without practical control
- strong control interest with strong personal autonomy

---

# Signal vocabulary

Use stable IDs in code/config. Human-facing labels can evolve independently.

| ID | Label | Meaning |
| --- | --- | --- |
| `receiving_control` | Receiving Control | enjoyment of a trusted person directing choices, actions, or the flow of an interaction |
| `giving_control` | Giving Control | enjoyment of taking the lead, setting direction, or exercising negotiated authority |
| `responsibility_transfer` | Responsibility Transfer | relief or reward from deliberately placing decision responsibility with a trusted person |
| `service` | Service | fulfillment from usefulness, attending to needs, completing tasks, or contributing for another person |
| `obedience` | Obedience | satisfaction from receiving a clear direction and intentionally following it |
| `structure` | Structure | preference for defined expectations, rules, routines, consistency, or an explicit framework |
| `ownership_symbolism` | Ownership Symbolism | emotional meaning attached to consensual belonging, claiming, commitment symbols, or ownership language |
| `praise_approval` | Praise / Approval | reward from recognition, approval, reassurance, or being told one has done well |
| `autonomy` | Autonomy | preference for retaining meaningful personal choice and control over what is delegated |

## Boundary notes

### Receiving Control vs Responsibility Transfer

These overlap but are not identical.

- **Receiving Control:** "I enjoy being directed."
- **Responsibility Transfer:** "I enjoy not having to carry this decision because I intentionally placed it with someone I trust."

Someone may enjoy direct commands without finding responsibility transfer especially meaningful.

### Service vs Obedience

These are also distinct.

- **Service:** the reward comes from usefulness/contribution.
- **Obedience:** the reward comes from following direction.

Someone can love service while preferring to anticipate needs independently instead of being told exactly what to do.

### Structure vs Obedience

Structure is the framework. Obedience is the act of following a direction.

A user may love routines, rules, and clear expectations while still wanting discretion inside that framework.

### Ownership Symbolism vs Control

Ownership symbolism measures relational/symbolic meaning.

It does **not** imply that the user wants broad practical control transferred.

### Autonomy is not a reverse score

Autonomy should remain its own positive signal.

Do not calculate it as `1 - receivingControl`.

High Receiving Control + high Autonomy is valid and potentially meaningful.

---

# Question-writing rules

## Measure experiences, not labels

Avoid:

> I am submissive.

> I am Dominant.

> I am a switch.

Those questions mostly reproduce identity labels the result could simply echo back.

Prefer concrete relational experiences:

> Having a trusted partner make routine choices for me can feel freeing.

## Keep scenarios consensual and negotiated

Power exchange should be framed around:

- trust
- willing participation
- negotiated authority
- chosen responsibility transfer

Do not use coercive framing to increase dramatic intensity.

## Avoid unnecessary sexual assumptions

D/s preferences may be relational, erotic, ritualized, practical, or contextual.

Questions do not need to make every scenario explicitly sexual.

## Avoid double-barreled prompts where possible

One prompt should have one primary experiential idea.

Secondary weights are acceptable because an experience can provide evidence about several signals, but the wording should still be easy to answer.

## Use direction deliberately

The same quiz measures both receiving and giving control.

Do not assume users need to choose a side before answering.

---

# Response scale

Use the existing five-point preference scale for M2:

| Raw | Label | Normalized |
| ---: | --- | ---: |
| 0 | Not for me | 0.00 |
| 1 | Mildly interesting | 0.25 |
| 2 | Unsure / maybe | 0.50 |
| 3 | Strong interest | 0.75 |
| 4 | Core interest | 1.00 |

Questions should be worded so a larger response consistently means **more affinity for the described experience**.

For M2, avoid reverse-coded questions unless we discover a clear measurement need. Independent Autonomy prompts give us counterbalancing evidence without making the response scale cognitively weird.

---

# Initial 18-question bank

This is the implemented standard M2 bank.

### DS-001

> Having a trusted partner make routine choices for me can feel freeing.

Primary evidence: Receiving Control, Responsibility Transfer.

### DS-002

> I like being given clear instructions and knowing I'm expected to follow them.

Primary evidence: Obedience, Receiving Control, Structure.

### DS-003

> In a dynamic, I can enjoy handing over responsibility for what happens next.

Primary evidence: Responsibility Transfer, Receiving Control.

### DS-004

> Doing something because a partner expects it of me can be satisfying even when the task itself is ordinary.

Primary evidence: Service, Obedience.

### DS-005

> Anticipating a partner's needs and seeing that it pleased them can feel especially rewarding.

Primary evidence: Service, Praise / Approval.

### DS-006

> Standing rules or expectations can make a dynamic feel more meaningful to me.

Primary evidence: Structure, Obedience.

### DS-007

> Symbols or rituals that mark an ongoing power dynamic can carry a lot of emotional meaning for me.

Primary evidence: Ownership Symbolism, Structure.

### DS-008

> The idea of being explicitly claimed or belonging to a trusted partner can be appealing to me.

Primary evidence: Ownership Symbolism, Receiving Control.

### DS-009

> Being told I did well can make following direction feel especially rewarding.

Primary evidence: Praise / Approval, Obedience.

### DS-010

> Being recognized for being useful or serving well can feel especially rewarding.

Primary evidence: Praise / Approval, Service.

### DS-011

> I enjoy being the one who sets direction when another person genuinely wants me to take the lead.

Primary evidence: Giving Control.

### DS-012

> Having someone trust me enough to follow my direction can feel deeply rewarding.

Primary evidence: Giving Control.

### DS-013

> Creating rules or expectations for a willing partner can be appealing to me.

Primary evidence: Giving Control, Structure.

### DS-014

> Even in a power dynamic, I want important decisions to remain mine unless I explicitly hand them over.

Primary evidence: Autonomy.

### DS-015

> I can enjoy symbols of commitment or ownership even when they do not involve much practical control.

Primary evidence: Ownership Symbolism.

### DS-016

> I prefer power exchange that still leaves me meaningful room to choose how I respond.

Primary evidence: Autonomy.

### DS-017

> I can enjoy moments where I do not have to decide because someone I trust has taken responsibility.

Primary evidence: Responsibility Transfer, Receiving Control.

### DS-018

> I can enjoy taking charge in some contexts without wanting that role to define every part of the relationship.

Primary evidence: Giving Control, Autonomy.

---

# Initial weight matrix

Weights are evidence strength, not percentages.

A value of `1.0` means the prompt is strong direct evidence for that signal. Smaller values represent meaningful secondary evidence.

Legend:

- RC = Receiving Control
- GC = Giving Control
- RT = Responsibility Transfer
- SV = Service
- OB = Obedience
- ST = Structure
- OS = Ownership Symbolism
- PA = Praise / Approval
- AU = Autonomy

| Question | RC | GC | RT | SV | OB | ST | OS | PA | AU |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| DS-001 | 1.0 | — | 0.8 | — | — | 0.2 | — | — | — |
| DS-002 | 0.7 | — | — | — | 1.0 | 0.5 | — | — | — |
| DS-003 | 0.8 | — | 1.0 | — | — | — | — | — | — |
| DS-004 | — | — | — | 0.8 | 0.7 | 0.2 | — | — | — |
| DS-005 | — | — | — | 1.0 | — | — | — | 0.5 | — |
| DS-006 | — | — | — | — | 0.6 | 1.0 | — | — | — |
| DS-007 | — | — | — | — | — | 0.5 | 1.0 | — | — |
| DS-008 | 0.5 | — | — | — | — | — | 1.0 | — | — |
| DS-009 | — | — | — | — | 0.5 | — | — | 1.0 | — |
| DS-010 | — | — | — | 0.8 | — | — | — | 0.8 | — |
| DS-011 | — | 1.0 | — | — | — | — | — | — | — |
| DS-012 | — | 1.0 | — | — | — | — | — | — | — |
| DS-013 | — | 0.8 | — | — | — | 0.8 | — | — | — |
| DS-014 | — | — | — | — | — | — | — | — | 1.0 |
| DS-015 | — | — | — | — | — | — | 1.0 | — | — |
| DS-016 | — | — | — | — | — | — | — | — | 1.0 |
| DS-017 | 0.8 | — | 1.0 | — | — | — | — | — | — |
| DS-018 | — | 0.6 | — | — | — | — | — | — | 0.8 |

## Evidence distribution

| Signal | Prompts contributing | Total possible weight |
| --- | ---: | ---: |
| Receiving Control | 5 | 3.8 |
| Giving Control | 4 | 3.4 |
| Responsibility Transfer | 3 | 2.8 |
| Service | 3 | 2.6 |
| Obedience | 4 | 2.8 |
| Structure | 6 | 3.2 |
| Ownership Symbolism | 3 | 3.0 |
| Praise / Approval | 3 | 2.3 |
| Autonomy | 3 | 2.8 |

Different total weights do not make a signal inherently stronger because each signal is normalized against its own answered weight.

The distribution is intentionally not perfectly symmetrical. Some experiences naturally provide secondary evidence for Structure and Receiving Control more often than others.

---

# Scoring

For each signal:

```text
sum(normalized response × signal weight)
-----------------------------------------
        sum(answered signal weight)
```

Example:

```text
DS-004 Service:
response = 0.75
weight = 0.8

DS-005 Service:
response = 1.00
weight = 1.0

DS-010 Service:
response = 0.50
weight = 0.8

score =
(0.75 × 0.8) + (1.00 × 1.0) + (0.50 × 0.8)
------------------------------------------------
                  0.8 + 1.0 + 0.8

= 0.769
= 77%
```

---

# Coverage

Coverage is calculated independently from affinity.

```text
answered signal weight
----------------------
total expected signal weight
```

For a fully completed fixed M2 quiz, coverage should normally be 100% for all nine signals.

We still retain coverage because it matters for:

- partially completed quizzes
- future adaptive paths
- stale quiz versions
- future cross-quiz evidence
- deciding whether interpretation language is sufficiently supported

Do not treat missing evidence as a zero-interest response.

---

# Result behavior

## Primary result

Display the nine signal scores independently.

Recommended initial order:

1. ranked list by affinity
2. radar/spider chart using the same nine signals
3. short interpretation per signal

Do not force scores to sum to 100%.

## No archetype in M2

Do not output a primary result such as:

- "93% submissive"
- "72% Dominant"
- "you are a switch"

Those may eventually be derived summaries if they prove useful, but they should never replace the underlying profile.

The M2 result should show the actual shape that could support those interpretations.

## Interpretation language

Interpret affinity, not identity.

Prefer:

> **Receiving Control — Strong signal**  
> Trusted direction appears to be a meaningful part of power exchange for you, especially when it reduces the need to actively steer what happens.

Avoid:

> You are submissive.

Suggested affinity bands:

| Score | Internal/display direction |
| ---: | --- |
| 80–100 | Core / very strong |
| 60–79 | Strong |
| 40–59 | Contextual / curious |
| 20–39 | Low |
| 0–19 | Little current signal |

Exact labels can be tuned during UI implementation.

Coverage should be able to soften interpretation independently from score if needed.

---

# Example profiles the model should support

## Selective surrender

```text
Receiving Control       92%
Responsibility Transfer 88%
Autonomy                 81%
Obedience                42%
```

Interpretation: strong interest in deliberately handing over some control without implying a desire for broad obedience or loss of personal autonomy.

## Service without obedience

```text
Service                  91%
Praise / Approval        78%
Obedience                31%
```

Interpretation: usefulness and contribution are rewarding, while explicit command-following is less central.

## Symbolic ownership without broad control

```text
Ownership Symbolism      94%
Receiving Control        38%
Responsibility Transfer  24%
```

Interpretation: belonging/claiming symbolism carries strong meaning without implying broad practical authority transfer.

## Switch/contextual control

```text
Receiving Control        86%
Giving Control           79%
Autonomy                 70%
```

Interpretation: both directions of negotiated control can be appealing, likely depending on partner, context, mood, or scope.

The model should preserve this shape rather than forcing a midpoint score.

---

# Relationship to M3 Roles & Headspaces

M3 later generalized M2's signal vocabulary into shared primitives and added dynamic-mode plus role/headspace composition.

Section results still remain source-local:

```text
M2 answers → M2 signal evidence → D/s results
M3 answers → M3 signal evidence → dynamic modes + roles/headspaces
```

M2 itself does **not** calculate Pet, Slave, Little, Brat, or other M3 results.

Cross-quiz evidence merging remains M7 work.

---

# Relationship to M6 catalog

M2 should not recommend catalog items.

However, stable signal IDs should be chosen with future catalog mapping in mind.

Conceptually:

```text
Collar
  ownership_symbolism: 1.0
  ritual:              0.8
  visibility:          0.4
  restraint:           0.1
```

The important separation is:

```text
quiz answers → signals → D/s results

                         later
signals ─────────────────────→ catalog affinities
```

The catalog remains data, not 551 questionnaire rows.

---

# Out of scope for M2

M2 intentionally excludes:

- forced Dominant/submissive/switch classification
- headspace scores
- Pet scoring
- catalog recommendations
- catalog browsing/rating
- adaptive follow-up questions
- Quick/Deep quiz modes
- partner compatibility
- cloud persistence
- AI-generated interpretation

M2's success criterion is that the fixed 18-question quiz produces useful, nuanced signal profiles.

---

# Post-implementation review questions

These remain useful things to challenge when evaluating the implemented quiz:

1. Do all nine signals represent genuinely distinct concepts?
2. Does any question accidentally measure two different ideas the user may answer differently?
3. Are dominance-side prompts sufficiently represented?
4. Does Autonomy read as a positive preference rather than resistance to D/s?
5. Are Ownership Symbolism questions clear without implying nonconsensual ownership?
6. Do Service and Obedience feel separable from the wording?
7. Are the initial weights directionally sensible?
8. Is any signal under-measured enough to deserve another prompt?
9. Is 18 questions still short enough to feel like a quiz rather than a test?

The M2 implementation encodes these definitions/questions/weights, uses the weighted scorer, and renders the section results. Future changes to the quiz should update this contract and the implementation together.
