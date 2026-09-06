# M4 — Bondage & Discipline Design

## Status

**Implemented contract for M4.**

This document records the implemented Bondage & Discipline signal model, question bank, scoring boundaries, and result views. Code and this contract should evolve together.

M4 should validate a physical/structural preference model without collapsing:

- restraint into one generic score
- discipline into pain
- protocol into obedience
- physical constraint into general D/s
- catalog items into questionnaire rows

---

# M4 contract

The implemented M4 contract is:

- **26 questions**
- directional restraint and discipline signals
- weighted multi-signal scoring with coverage
- reuse existing shared signals only when their meaning genuinely matches
- one unified ranked signal list
- a **Bondage / Physical Control** radar
- a **Discipline / Structural Control** radar
- no pain or S/M scoring
- no direct gear/item questions
- no catalog inference yet

The section should answer:

> Which parts of physical restraint and structured discipline appeal to me, and from which side?

not:

> How much do I like bondage?

---

# Core modeling decisions

## Restraint is directional

Do not model one generic `restraint` score.

A user may strongly enjoy receiving restraint and have little interest in applying it, or vice versa.

Model:

- Receiving Restraint
- Giving Restraint

independently.

## Positioning is directional

Being placed into a posture is not the same preference as arranging another person's posture.

Model:

- Receiving Positioning
- Giving Positioning

independently.

## Discipline is directional

Receiving an agreed consequence and administering one are distinct experiences.

Model:

- Receiving Discipline
- Giving Discipline

independently.

## Discipline is not pain

M4 must not use pain as a proxy for discipline.

A user may strongly enjoy:

- rules
- accountability
- correction
- consequences
- repetition
- assigned tasks
- posture or behavioral expectations
- loss of privileges
- ritualized follow-through

while having little or no masochistic/sadistic interest.

Likewise, someone may enjoy pain without wanting it framed as discipline.

Pain Receiving, Pain Giving, Endurance, and S/M intensity belong to **M5**.

## Constraint can be physical and psychological

The physical act of restraint is distinct from the psychological appeal of authority being expressed through physical limits.

Therefore M4 distinguishes:

- the restraint itself
- movement restriction
- control-through-constraint

Control-through-constraint is directional.

## Challenge / escape is independent from restraint affinity

Someone can love being restrained and dislike struggling against it.

Someone else may specifically enjoy:

- testing restraint
- pulling against it
- trying to escape
- catching or containing that resistance

Do not assume one from the other.

---

# Signal vocabulary

M4 adds section-specific signals while reusing shared signals already present in the system.

## New M4 signals

| ID | Label | Meaning |
| --- | --- | --- |
| `receiving_restraint` | Receiving Restraint | enjoying being physically bound, held, immobilized, or otherwise constrained |
| `giving_restraint` | Giving Restraint | enjoying physically binding, holding, immobilizing, or constraining a willing partner |
| `movement_restriction` | Movement Restriction | appeal of reduced range or freedom of movement as a physical feature of restraint |
| `receiving_positioning` | Receiving Positioning | enjoying being deliberately placed or kept in a particular posture or position |
| `giving_positioning` | Giving Positioning | enjoying arranging or requiring a willing partner to maintain a particular posture or position |
| `receiving_constraint_control` | Receiving Constraint Control | psychological appeal of another person's negotiated authority being expressed through physical limits |
| `giving_constraint_control` | Giving Constraint Control | psychological appeal of expressing negotiated authority by controlling another person's physical freedom |
| `receiving_discipline` | Receiving Discipline | appeal of agreed correction or consequences directed toward oneself |
| `giving_discipline` | Giving Discipline | appeal of administering agreed correction or consequences |
| `accountability` | Accountability | appeal of expectations having meaningful, consistent follow-through |
| `anticipation` | Anticipation | appeal of suspense, waiting, or knowing restraint/correction/ritual is coming |
| `challenge_escape` | Challenge / Escape | appeal of testing, struggling against, escaping, catching, or containing agreed restraint |

## Reused shared signals

M4 may also produce **section-local evidence** for:

- `receiving_control`
- `giving_control`
- `obedience`
- `structure`
- `ritual_significance`
- `guidance_shaping`
- `responsibility_holding`
- `playful_resistance`

Reusing an ID means the psychological meaning matches. It does **not** mean M2/M3 answers are merged into M4 results.

Cross-quiz evidence aggregation remains M7 work.

---

# Signal boundaries

## Receiving Restraint vs Movement Restriction

- **Receiving Restraint:** the user likes being physically constrained.
- **Movement Restriction:** reduced freedom of movement itself is appealing.

Someone may enjoy being tied or held but still prefer enough mobility to reposition.

## Restraint vs Constraint Control

- **Restraint:** physical mechanism/state.
- **Constraint Control:** psychological meaning of authority expressed through that physical restriction.

A user can enjoy restraint for sensation, aesthetics, or containment without strongly experiencing it as power exchange.

## Positioning vs Movement Restriction

- **Positioning:** a specific posture/placement matters.
- **Movement Restriction:** the reduced ability to move matters.

Holding a pose can be compelling even without heavy restraint.

## Discipline vs Accountability

- **Discipline:** correction/consequence itself.
- **Accountability:** the expectation that rules actually have follow-through.

Someone can strongly value accountability while preferring gentle or low-intensity correction.

## Rules / Structure vs Protocol / Ritual

M4 reuses the shared signals:

- `structure` — consistency, expectations, rules, framework
- `ritual_significance` — prescribed/repeated acts whose meaning exceeds their practical function

These overlap, but should not be collapsed.

## Challenge / Escape vs Playful Resistance

M4's `challenge_escape` is specifically about physical restraint and containment.

M3's `playful_resistance` is broader relational pushback/teasing.

A question can provide evidence for both when appropriate.

---

# Questionnaire rules

Follow the general weighted-question model from [scoring-model.md](scoring-model.md).

## Measure mechanisms, not gear

Avoid direct catalog questions such as:

> Do you like rope?

> Do you like cuffs?

> Do you like spreader bars?

Those are M6 catalog interests.

Prefer mechanism-level prompts such as:

> Having several points of movement restricted at once can make restraint feel more immersive.

This lets M6 later map specific items to known signals.

## Keep physical safety out of the scoring model

Questions should describe preferences conceptually.

Do not turn the quiz into restraint instructions, position tutorials, or technique guidance.

## Avoid pain assumptions

M4 discipline prompts should intentionally include non-painful correction/consequence examples and wording.

Do not add Pain Receiving or Pain Giving weights.

## Preserve direction

Questions about receiving and giving restraint/discipline should be separately represented.

Do not infer one side from the other.

---

# Implemented 26-question bank

## Bondage / physical control

### BD-001

> Being physically restrained by someone I trust can feel appealing even when pain is not part of the experience.

Evidence:

- receiving_restraint 1.0
- movement_restriction 0.4
- receiving_control 0.2

### BD-002

> Having several parts of my movement restricted at once can make restraint feel more immersive.

Evidence:

- movement_restriction 1.0
- receiving_restraint 0.8
- receiving_constraint_control 0.3

### BD-003

> Being required to stay in a specific position until I am released can be appealing.

Evidence:

- receiving_positioning 1.0
- movement_restriction 0.5
- obedience 0.2

### BD-004

> Being deliberately arranged into a posture by a trusted partner can make the sense of control more tangible.

Evidence:

- receiving_positioning 1.0
- receiving_constraint_control 0.7
- receiving_control 0.3

### BD-005

> Part of the appeal of restraint can be knowing that someone else is deciding how much physical freedom I have.

Evidence:

- receiving_constraint_control 1.0
- receiving_restraint 0.6
- receiving_control 0.5

### BD-006

> Pulling against or testing agreed restraint can add something enjoyable to the experience for me.

Evidence:

- challenge_escape 1.0
- receiving_restraint 0.4
- playful_resistance 0.3

### BD-007

> The possibility of trying to get free, even when I may not succeed, can make restraint more exciting.

Evidence:

- challenge_escape 0.9
- anticipation 0.6
- receiving_restraint 0.3

### BD-008

> Waiting while I know restraint is about to happen can build appealing suspense.

Evidence:

- anticipation 1.0
- receiving_restraint 0.3

### BD-009

> Physically restricting a willing partner's movement can be appealing to me.

Evidence:

- giving_restraint 1.0
- giving_constraint_control 0.4
- giving_control 0.2

### BD-010

> Securing a willing partner so they cannot freely reposition can make restraint feel more complete.

Evidence:

- giving_restraint 0.8
- movement_restriction 0.8
- giving_constraint_control 0.5

### BD-011

> Placing a willing partner in a specific position and expecting them to maintain it can be appealing.

Evidence:

- giving_positioning 1.0
- giving_constraint_control 0.5
- structure 0.2

### BD-012

> Carefully arranging another person's posture or placement can be satisfying in its own right.

Evidence:

- giving_positioning 1.0
- guidance_shaping 0.3

### BD-013

> Part of the appeal of restraining someone can be deciding how much physical freedom they have within agreed limits.

Evidence:

- giving_constraint_control 1.0
- giving_restraint 0.6
- giving_control 0.5
- responsibility_holding 0.2

### BD-014

> I can enjoy a willing partner testing or struggling against agreed restraint because it makes containment more interactive.

Evidence:

- challenge_escape 1.0
- giving_restraint 0.4
- playful_resistance 0.3

---

## Discipline / structural control

### BD-015

> A rule feels more meaningful to me when everyone involved knows what happens if it is not followed.

Evidence:

- accountability 1.0
- structure 0.6
- anticipation 0.2

### BD-016

> Being held to an agreed consequence can feel grounding or meaningful even when the consequence is not painful.

Evidence:

- receiving_discipline 1.0
- accountability 0.8
- structure 0.2

### BD-017

> Clear correction from a trusted partner can feel satisfying when it restores an agreed expectation.

Evidence:

- receiving_discipline 0.9
- accountability 0.6
- obedience 0.3

### BD-018

> A non-painful corrective task or consequence can still feel strongly like discipline to me.

Evidence:

- receiving_discipline 1.0
- accountability 0.5
- structure 0.3

### BD-019

> Administering an agreed consequence can be appealing because it gives an expectation real follow-through.

Evidence:

- giving_discipline 1.0
- accountability 0.8
- responsibility_holding 0.3

### BD-020

> Correcting a willing partner toward a shared expectation can feel meaningful even when pain is not involved.

Evidence:

- giving_discipline 0.9
- guidance_shaping 0.6
- accountability 0.5

### BD-021

> Choosing a consequence that fits the broken expectation can be more satisfying than simply making it harsh.

Evidence:

- giving_discipline 0.8
- accountability 0.7
- responsibility_holding 0.4

### BD-022

> Standing rules that shape behavior beyond a single scene can deepen a dynamic for me.

Evidence:

- structure 1.0
- accountability 0.5
- ritual_significance 0.3

### BD-023

> Formal procedures or rituals around permission, beginning, ending, or transitions can make a dynamic feel more intentional.

Evidence:

- ritual_significance 1.0
- structure 0.5

### BD-024

> Knowing in advance that restraint, correction, or a formal ritual is coming can be part of the appeal.

Evidence:

- anticipation 1.0
- ritual_significance 0.3
- accountability 0.2

### BD-025

> Following an agreed sequence or protocol exactly can be satisfying because the form itself matters.

Evidence:

- ritual_significance 0.9
- structure 0.7
- obedience 0.3

### BD-026

> Creating a specific procedure or protocol for a willing partner can make structure feel more deliberate and meaningful.

Evidence:

- ritual_significance 0.9
- structure 0.7
- giving_control 0.2
- responsibility_holding 0.2

---

# Implemented evidence distribution

Approximate direct/secondary prompt coverage:

| Signal | Prompts |
| --- | ---: |
| Receiving Restraint | 6 |
| Giving Restraint | 4 |
| Movement Restriction | 4 |
| Receiving Positioning | 2 |
| Giving Positioning | 2 |
| Receiving Constraint Control | 3 |
| Giving Constraint Control | 4 |
| Receiving Discipline | 3 |
| Giving Discipline | 3 |
| Accountability | 9 |
| Anticipation | 4 |
| Challenge / Escape | 3 |
| Structure | 8 |
| Ritual Significance | 5 |

Not every signal needs the same raw prompt count because weighted normalization occurs within each signal.

Positioning has fewer prompts because the experience is narrower and the prompts are comparatively direct. If testing shows unstable or overly literal results, add another prompt per direction before changing weights elsewhere.

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

M4 section results are calculated from **M4-local answers only**.

---

# Results

## Unified ranked list

Show all primary M4 signals together so the user can see their strongest B&D preferences regardless of category.

Example:

```text
Receiving Restraint          94%
Movement Restriction         89%
Receiving Positioning        84%
Anticipation                 78%
Accountability               66%
Receiving Discipline         41%
Challenge / Escape           18%
```

## Bondage / Physical Control radar

Implemented axes:

- Receiving Restraint
- Giving Restraint
- Movement Restriction
- Receiving Positioning
- Giving Positioning
- Receiving Constraint Control
- Giving Constraint Control
- Challenge / Escape
- Anticipation

## Discipline / Structural Control radar

Implemented axes:

- Receiving Discipline
- Giving Discipline
- Accountability
- Structure
- Ritual Significance
- Anticipation

Anticipation intentionally appears in both views because suspense can meaningfully span restraint and discipline.

## No role/archetype output

M4 should not invent a role label such as "Bondage Bunny."

This milestone reports section signals, not identities.

---

# Relationship to M2 and M3

M4 can emit section-local evidence for shared signals already used elsewhere.

Conceptually:

```text
M4 answers
  ↓
M4-local signals
  ├─ M4 results now
  └─ reusable source-aware evidence for M7 later
```

Completing M2 or M3 must not silently change the M4 result.

Completing M4 must not silently change M2 or M3 section results.

M7 owns global aggregation.

---

# Relationship to M5

M5's proposed contract owns:

- pain receiving / giving
- receiving / giving physical intensity
- receiving / giving endurance
- receiving / giving challenge
- emotional intensity
- M5-local evidence for shared anticipation

M4 may mention that a consequence or restraint can exist **without pain** specifically to keep the taxonomy clean.

Do not reuse M5 pain signals in M4 scoring.

---

# Relationship to M6 catalog

M4 should not ask users to rate specific gear or techniques.

Later, catalog items can map to M4 signals.

Conceptual example:

```text
Cuffs
├─ receiving_restraint / giving_restraint
├─ movement_restriction
└─ constraint control

Spreader bar
├─ positioning
├─ movement_restriction
└─ restraint
```

Those mappings support tentative exploration recommendations later without turning the M4 quiz into catalog homework.

---

# Out of scope for M4

Do not add during this milestone:

- Pain Receiving / Pain Giving scores
- Sadism / Masochism labels
- restraint technique or safety instruction
- direct gear/item ratings
- catalog affinity
- role/headspace inference
- cross-quiz evidence merging
- adaptive Quick/Deep modes
- partner compatibility
- AI-generated interpretation
- cloud persistence

---

# Post-implementation review questions

1. Are Receiving/Giving Restraint clearly distinct from Receiving/Giving Constraint Control?
2. Should Positioning remain directional, or is that unnecessarily granular?
3. Does Movement Restriction work as a shared physical-feature signal across both directions?
4. Does Challenge / Escape capture both struggling and containing without becoming too broad?
5. Are Receiving/Giving Discipline clearly non-pain-based in the wording?
6. Do Accountability, Structure, and Ritual Significance remain meaningfully distinct?
7. Does Anticipation belong in both radar views?
8. Are any reused M2/M3 signal weights doing too much conceptual work?
9. Is 26 questions a good balance between coverage and quiz fatigue?
10. Is any major B&D mechanism missing from the initial implemented model?

Future changes to M4 signal IDs, question weights, or radar composition should update this contract and the implementation together.
