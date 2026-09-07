# M3 — Roles & Headspaces Contract

## Status

**Implemented contract for M3 v3.**

This document records the corrected M3 taxonomy and implementation.

The key distinction is:

> **Dynamic modes are not the same thing as roles/headspaces.**

M3 now models three layers:

```text
answers
  ↓
signals
  ├─ dynamic modes
  └─ roles / headspaces
```

The primary user-facing result is the **role/headspace layer**.

Dynamic modes explain *why* those roles may resonate.

---

# M3 contract

The implemented M3 contract is:

- standalone **32-question** Roles & Headspaces quiz
- shared reusable signal vocabulary
- M3-local signal evidence only
- weighted **dynamic mode** compositions
- weighted **role/headspace** compositions
- 15 overlapping role/headspace affinities
- 12 explanatory dynamic modes
- ranked role/headspace results
- separate self-positioned and partner-positioned role/headspace radars
- a dedicated dynamic-mode radar
- dynamic-mode ranked results shown underneath
- no requirement to complete M2 first
- no cross-quiz evidence merge yet
- no catalog inference yet

The quiz should answer:

> Which roles or headspaces may resonate with how I like a dynamic to feel?

Examples include:

- Pet
- Slave
- Little
- Middle
- Brat
- Prey
- Service Submissive
- Caregiver
- Owner / Handler
- Brat Tamer
- Predator
- Trainer

It should **not** mistake concepts like Surrender, Protocol, or Claiming for role identities.

---

# Taxonomy

## Layer 1 — signals

Signals are reusable experiential preferences measured by questions.

M3 reuses the M2 signals when the meaning genuinely matches and adds M3-specific signals.

M3-specific signals:

- belonging
- role_embodiment
- playfulness
- care_receiving
- care_giving
- devotion
- ritual_significance
- playful_resistance
- objectification
- guidance_shaping
- responsibility_holding
- younger_headspace
- primal_embodiment
- pursuit_receiving
- pursuit_giving

The `younger_headspace` signal exists because Little and Middle cannot be responsibly inferred from generic playfulness/care alone.

The primal/pursuit signals were added in M3 v3 so Prey and Predator are measured directionally rather than inferred from Pet, Brat, or generic control preferences.

## Layer 2 — dynamic modes

Dynamic modes describe **how the dynamic feels or functions psychologically**.

Implemented modes:

- Nurtured Play
- Devotion
- Service
- Protocol
- Surrender
- Playful Resistance
- Objectification
- Caretaking
- Authority
- Claiming
- Training / Shaping
- Primal / Feral

These are useful explanatory results, but they are not presented as the primary role/headspace taxonomy.

## Layer 3 — roles / headspaces

Roles/headspaces describe recognizable relational identities or modes a user may inhabit.

Implemented initial set:

### Self-positioned roles / headspaces

- Pet
- Slave
- Little
- Middle
- Brat
- Prey
- Service Submissive
- Devotional Submissive
- Property / Object

### Partner-positioned roles / headspaces

- Owner / Handler
- Caregiver
- Brat Tamer
- Predator
- Trainer
- Master / Mistress

These categories are **not mutually exclusive**.

The two display groups are not authority classifications. In particular:

- caring for someone does not imply dominance
- pursuing someone does not imply dominance
- training, correcting, or holding someone accountable does not imply dominance
- being cared for, pursued, restrained, or positioned does not imply submission
- a role can be enacted as service, under instruction, through delegated responsibility, or outside D/s entirely

Dominant/submissive orientation belongs to the explicit authority model, not to generic activity direction.

A user may legitimately score highly on several roles at once.

Example:

```text
Pet                94%
Slave              88%
Brat               76%
Little             62%
Service Submissive 59%
```

That is a valid profile, not a scoring failure.

---

# Why the old M3 model was wrong

The first M3 implementation treated these as headspaces:

- Devotional
- Service
- Protocol
- Surrender
- Playful Resistance
- Objectification
- Caretaking / Guidance
- Authority / Command
- Ownership / Claiming
- Training / Shaping

Most of those are better understood as **underlying dynamic modes**.

They explain the psychological ingredients of a role.

For example:

```text
Slave
├─ surrender
├─ obedience
├─ service
├─ ownership symbolism
├─ structure
└─ devotion
```

Similarly:

```text
Brat
├─ playful resistance
├─ playfulness
├─ autonomy
└─ receiving control
```

And:

```text
Little
├─ younger headspace
├─ care receiving
├─ role embodiment
├─ responsibility transfer
├─ playfulness
└─ praise
```

The corrected model preserves the useful first-layer work without confusing ingredients with identities.

---

# Implemented role/headspace compositions

Weights are evidence strengths, not percentages.

## Pet

- belonging 1.0
- role_embodiment 0.9
- playfulness 0.8
- care_receiving 0.7
- ownership_symbolism 0.6
- praise_approval 0.4

## Slave

- responsibility_transfer 1.0
- obedience 0.9
- service 0.8
- ownership_symbolism 0.8
- structure 0.6
- devotion 0.5
- receiving_control 0.5

## Little

- younger_headspace 1.0
- care_receiving 0.8
- role_embodiment 0.8
- responsibility_transfer 0.6
- playfulness 0.6
- praise_approval 0.5

## Middle

- younger_headspace 0.9
- role_embodiment 0.7
- playfulness 0.7
- autonomy 0.7
- care_receiving 0.4
- playful_resistance 0.3

## Brat

- playful_resistance 1.0
- playfulness 0.8
- autonomy 0.5
- receiving_control 0.4
- praise_approval 0.2

## Prey

- pursuit_receiving 1.0
- primal_embodiment 0.9
- role_embodiment 0.5
- receiving_control 0.3
- playful_resistance 0.2

## Service Submissive

- service 1.0
- devotion 0.6
- obedience 0.5
- praise_approval 0.4
- receiving_control 0.3
- role_embodiment 0.3

## Devotional Submissive

- devotion 1.0
- belonging 0.8
- service 0.5
- ownership_symbolism 0.4
- receiving_control 0.3
- ritual_significance 0.3

## Property / Object

- objectification 1.0
- ownership_symbolism 0.8
- role_embodiment 0.6
- receiving_control 0.4

## Owner / Handler

- ownership_symbolism 1.0
- responsibility_holding 0.7
- care_giving 0.6
- giving_control 0.5
- guidance_shaping 0.3

## Caregiver

- care_giving 1.0
- responsibility_holding 0.8
- guidance_shaping 0.4
- structure 0.2

## Brat Tamer

- giving_control 0.8
- playful_resistance 0.7
- playfulness 0.5
- guidance_shaping 0.4
- responsibility_holding 0.3

## Predator

- pursuit_giving 1.0
- primal_embodiment 0.9
- role_embodiment 0.5
- giving_control 0.3

## Trainer

- guidance_shaping 1.0
- structure 0.6
- responsibility_holding 0.5
- giving_control 0.5

## Master / Mistress

- giving_control 1.0
- responsibility_holding 0.8
- ownership_symbolism 0.6
- structure 0.5
- guidance_shaping 0.3

---

# Implemented dynamic-mode compositions

## Nurtured Play

- role_embodiment 1.0
- playfulness 0.9
- care_receiving 0.7
- belonging 0.6
- praise_approval 0.4

## Devotion

- devotion 1.0
- belonging 0.8
- ritual_significance 0.7
- service 0.5
- ownership_symbolism 0.4

## Service

- service 1.0
- devotion 0.5
- role_embodiment 0.4
- praise_approval 0.3

## Protocol

- ritual_significance 1.0
- structure 1.0
- obedience 0.5
- role_embodiment 0.3

## Surrender

- responsibility_transfer 1.0
- receiving_control 0.8
- role_embodiment 0.4
- care_receiving 0.3

## Playful Resistance

- playful_resistance 1.0
- playfulness 0.7
- receiving_control 0.3
- autonomy 0.2

## Objectification

- objectification 1.0
- role_embodiment 0.7
- receiving_control 0.3
- ownership_symbolism 0.3

## Caretaking

- care_giving 1.0
- responsibility_holding 0.9
- giving_control 0.4
- guidance_shaping 0.3

## Authority

- giving_control 1.0
- responsibility_holding 0.6
- structure 0.3

## Claiming

- ownership_symbolism 1.0
- giving_control 0.6
- belonging 0.5
- responsibility_holding 0.5

## Training / Shaping

- guidance_shaping 1.0
- structure 0.6
- giving_control 0.5
- responsibility_holding 0.4

## Primal / Feral

- primal_embodiment 1.0
- role_embodiment 0.5
- playfulness 0.2

---

# Questionnaire

M3 v3 contains **32 questions**.

The first 24 measure the original shared role/dynamic-mode signal space.

Three questions measure younger-role/headspace evidence for Little/Middle.

Five additional M3 v3 questions measure primal embodiment plus directional pursuit evidence for Prey/Predator.

| ID | Prompt |
| --- | --- |
| HS-001 | Feeling that I meaningfully belong with or to a trusted partner can deepen a dynamic for me. |
| HS-002 | Slipping into a distinct role can change how I think, feel, or behave in a way I enjoy. |
| HS-003 | Playfulness, silliness, or a more instinctive mode can make a role feel especially immersive. |
| HS-004 | Being deliberately looked after or guided by someone I trust can make me feel more settled in a dynamic. |
| HS-005 | Warm approval or recognition can make a relational role feel especially rewarding. |
| HS-006 | Doing something because it expresses dedication to a partner can give an ordinary act extra meaning. |
| HS-007 | Small repeated rituals can become emotionally important to me even when they have little practical purpose. |
| HS-008 | Being useful can feel like part of my role in a relationship, not just something helpful I happened to do. |
| HS-009 | Formal manners, rules, or expected ways of behaving can make a dynamic feel more intentional. |
| HS-010 | I can enjoy the internal feeling of stopping myself from steering and letting someone trusted hold the direction. |
| HS-011 | Negotiated teasing or pushback can make authority more fun because it gives us something to play against. |
| HS-012 | In the right consensual context, being reduced to a role, purpose, or function can feel immersively appealing. |
| HS-013 | Being responsible for another person's comfort or sense of being held can feel deeply rewarding. |
| HS-014 | I enjoy showing someone how to do something in the way I want while helping them improve. |
| HS-015 | I enjoy being the person whose direction sets the tone when another person wants me in that position. |
| HS-016 | Knowing another person has chosen to follow my direction can make authority feel emotionally significant. |
| HS-017 | Consensually claiming someone or treating them as 'mine' can carry emotional meaning beyond practical control. |
| HS-018 | Helping a willing partner practice expectations until they become natural can be satisfying. |
| HS-019 | Agreed correction can feel constructive when it helps shape behavior toward a shared expectation. |
| HS-020 | In the right negotiated context, defining a partner mainly by a role or function can be appealing. |
| HS-021 | Creating rituals or formal expectations for another person can make my side of a dynamic feel more meaningful. |
| HS-022 | Receiving someone's deliberate dedication can feel meaningful because of what their commitment represents. |
| HS-023 | Having someone rely on me to hold direction or make the call can feel like a responsibility I want. |
| HS-024 | Even in an immersive role, I value knowing which choices remain mine and which ones I deliberately hand over. |
| HS-025 | In the right role, feeling younger, smaller, or less adult than I do in everyday life can be comforting or immersive. |
| HS-026 | Being cared for in a way that lets me set aside some everyday adult responsibilities can feel appealing. |
| HS-027 | A younger or youthful role can appeal to me even when I still want independence, opinions, and room to push back. |
| HS-028 | In the right consensual scene, feeling more instinctive, feral, or driven by body-language than ordinary social rules can be deeply immersive. |
| HS-029 | Being pursued or tracked by a willing partner can make a role feel exciting in a way ordinary power exchange does not. |
| HS-030 | Within an agreed scene, the tension of trying to evade someone who intends to catch me can be especially appealing. |
| HS-031 | Pursuing or tracking a willing partner can make me feel focused, instinctive, and strongly inside a role. |
| HS-032 | Within an agreed scene, closing distance and eventually catching a partner who wants to be pursued can be especially appealing. |

The question UI remains neutral:

> Roles & inner experience

It should not expose the role/headspace currently receiving evidence.

---

# Scoring behavior

For M3:

```text
question answers
     ↓
M3-local signal scores + coverage
     ↓
     ├─ role/headspace composition + coverage
     └─ dynamic-mode composition + coverage
```

The primary ranked results use **role/headspace compositions**.

M3 v3 separates visualization into three radar charts:

1. self-positioned roles and headspaces
2. partner-positioned roles and headspaces
3. underlying dynamic modes

These are **display groupings, not D/s orientation buckets**.

A self-positioned role is one primarily phrased as the role or headspace the user inhabits (for example Pet, Little, Prey, or Slave). A partner-positioned role is one primarily phrased as a role enacted toward another person (for example Caregiver, Trainer, Predator, or Owner / Handler).

Neither grouping means submissive or dominant. A submissive person can score highly on partner-positioned roles, and a dominant person can score highly on self-positioned roles. Activity side, relational role, and negotiated authority are separate dimensions.

Dynamic-mode ranked results remain beneath the primary role/headspace results as explanatory context.

All compositions are independent.

They do not sum to 100%.

Autonomy never subtracts from another role/headspace.

For example, high Autonomy + high Slave or Little is not automatically contradictory; it can describe consciously bounded or contextual role immersion.

---

# Section independence

M3 does not require M2.

M2 and M3 may reuse the same stable signal IDs, but their evidence remains section-local.

```text
M2 answers → M2 signal evidence → D/s results

M3 answers → M3 signal evidence
                     ├→ role/headspace results
                     └→ dynamic-mode results
```

Cross-quiz aggregation remains M7 work.

---

# Versioning

The corrected taxonomy, younger-headspace evidence, Predator/Prey evidence, and split radar presentation make this **M3 quiz version 3**.

Older M3 v1/v2 results should not be treated as equivalent to v3 because:

- the question bank changed
- the signal vocabulary changed
- the composition taxonomy changed
- the primary output layer changed

---

# Out of scope for M3

Still deferred:

- exhaustive BDSM role taxonomy
- cross-quiz evidence merging
- M7 overall aggregation
- catalog recommendations
- catalog rating/browsing
- forced single-role identity
- adaptive Quick/Deep modes
- partner compatibility
- AI-generated interpretation
- cloud persistence

The initial role set should expand only when we have enough signal evidence to measure additional roles meaningfully.

---

# Post-implementation review questions

1. Do Pet, Slave, Little, Middle, Brat, and the other roles feel recognizably different in actual results?
2. Do Little and Middle separate well enough from the same younger-headspace signal?
3. Is Slave too broad, or does the composition capture a useful headspace?
4. Should Owner and Handler eventually separate?
5. Should Master and Mistress eventually be represented with one neutral display label?
6. Are Service Submissive and Devotional Submissive distinct enough?
7. Should Property / Object remain one result or split later?
8. Do Prey and Predator separate cleanly because pursuit direction is measured independently?
9. Which additional roles are important enough to justify new signals/questions rather than being inferred badly?
10. Does 32 questions still feel acceptable for this section?

Future changes to question weights, signal IDs, dynamic modes, or role/headspace compositions should update this contract and implementation together.
