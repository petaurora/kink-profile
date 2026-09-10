# M3 — Roles & Headspaces Contract

## Status

**Implemented contract for M3 v4.**

This document records the current Roles & Headspaces taxonomy and the distinction between reusable experiential signals, explanatory dynamic modes, and recognizable roles/headspaces.

The key rule is:

> **Dynamic modes are not the same thing as roles/headspaces.**

M3 models three layers:

```text
answers
  ↓
signals
  ├─ dynamic modes
  └─ roles / headspaces
```

The primary user-facing result is the **role/headspace layer**. Dynamic modes explain *why* those roles may resonate.

---

# M3 v4 refinement

M3 v4 refines the role/headspace layer without changing the 32-question bank.

### Service Submissive + Devotional Submissive

These are now one **Devotional Submissive** role/headspace.

Service remains a distinct underlying dynamic mode because usefulness can be meaningful without necessarily being experienced as devotion. At the role/headspace layer, however, Service Submissive and Devotional Submissive were modeling overlapping expressions of the same relational state.

The merged role can be supported by:

- devotion
- service / usefulness
- belonging
- obedience
- praise / approval
- ownership symbolism
- receiving control
- role embodiment
- ritual significance

### Owner / Handler + Trainer

Trainer is no longer a peer role/headspace. Training or shaping is treated as one way an **Owner / Handler** role can be expressed.

The **Training / Shaping** dynamic mode remains distinct so the profile can still explain a strong preference for teaching, correction, repetition, development, or behavior shaping even when the user does not strongly identify with an Owner / Handler role.

The merged Owner / Handler role can be supported by:

- ownership / claiming symbolism
- guidance and shaping
- responsibility holding
- care giving
- structure
- giving control

### Property / Object → Object

The former **Property / Object** role is now **Object**.

Property is not treated as its own headspace because property/ownership meaning is better represented by the reusable `ownership_symbolism` signal and can contribute to more specific roles such as Pet, Slave, Owner / Handler, or Master / Mistress.

**Object** remains a headspace because consensual reduction into a role, purpose, function, or thing-like identity can describe a distinct internal mode independent of ownership framing.

Object therefore uses:

- objectification
- role embodiment
- receiving control

It does **not** require ownership symbolism.

---

# M3 contract

The implemented M3 contract is:

- standalone **32-question** Roles & Headspaces quiz
- shared reusable signal vocabulary
- M3-local signal evidence
- weighted **dynamic mode** compositions
- weighted **role/headspace** compositions
- **13** overlapping role/headspace affinities
- **12** explanatory dynamic modes
- ranked role/headspace results
- separate self-positioned and partner-positioned role/headspace radars
- a dedicated dynamic-mode radar
- dynamic-mode ranked results shown underneath
- no requirement to complete M2 first
- no forced single-role identity

The quiz should answer:

> Which roles or headspaces may resonate with how I like a dynamic to feel?

It should **not** mistake concepts such as Surrender, Protocol, Service, Claiming, or Training / Shaping for peer role identities when those concepts are better represented as underlying dynamic modes.

---

# Taxonomy

## Layer 1 — signals

Signals are reusable experiential preferences measured by questions and reused by higher-order compositions.

M3-specific signals include:

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

M3 also reuses compatible shared signals such as control, responsibility transfer, service, obedience, structure, ownership symbolism, praise/approval, and autonomy.

The `younger_headspace` signal exists because Little and Middle should not be inferred from generic playfulness or care alone.

Primal embodiment and directional pursuit signals allow Prey and Predator to be measured independently rather than inferred from Pet, Brat, or generic control preferences.

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

These are explanatory results, not the primary role/headspace taxonomy.

## Layer 3 — roles / headspaces

Roles/headspaces describe recognizable relational identities or modes a user may inhabit.

### Self-positioned roles / headspaces

- Pet
- Slave
- Little
- Middle
- Brat
- Prey
- Devotional Submissive
- Object

### Partner-positioned roles / headspaces

- Owner / Handler
- Caregiver
- Brat Tamer
- Predator
- Master / Mistress

These categories are **not mutually exclusive**.

The two display groups are not authority classifications. In particular:

- caring for someone does not imply dominance
- pursuing someone does not imply dominance
- training, correcting, or holding someone accountable does not imply dominance
- being cared for, pursued, restrained, or positioned does not imply submission
- a role can be enacted as service, under instruction, through delegated responsibility, or outside D/s entirely

Dominant/submissive orientation belongs to the explicit authority model, not to generic activity direction.

---

# Why dynamic modes remain separate

The role/headspace taxonomy deliberately avoids creating a new identity for every way a role can be expressed.

For example:

```text
Devotional Submissive
├─ devotion
├─ service
├─ belonging
├─ obedience
├─ praise / approval
└─ ritual meaning
```

Service is still useful independently as a dynamic mode:

```text
Service
├─ usefulness
├─ contribution
├─ role meaning
└─ approval
```

Likewise:

```text
Owner / Handler
├─ claiming / ownership meaning
├─ responsibility
├─ care
├─ authority
├─ guidance
└─ shaping / training
```

while Training / Shaping remains independently visible as a dynamic mode:

```text
Training / Shaping
├─ guidance
├─ repetition
├─ structure
├─ correction
└─ development
```

This preserves nuance without duplicating peer role identities.

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

## Devotional Submissive

- devotion 1.0
- service 0.9
- belonging 0.8
- obedience 0.5
- praise_approval 0.4
- ownership_symbolism 0.4
- receiving_control 0.3
- role_embodiment 0.3
- ritual_significance 0.3

## Object

- objectification 1.0
- role_embodiment 0.8
- receiving_control 0.4

## Owner / Handler

- ownership_symbolism 1.0
- guidance_shaping 1.0
- responsibility_holding 0.7
- care_giving 0.6
- structure 0.6
- giving_control 0.5

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

M3 v4 contains the same **32 questions** as M3 v3.

The question bank continues to measure:

- shared relational and role signals
- younger-headspace evidence for Little / Middle
- primal embodiment
- directional pursuit evidence for Prey / Predator
- service and devotion independently at the signal level
- guidance / shaping independently from ownership or authority
- objectification independently from ownership symbolism

The question UI remains neutral and should not expose which role/headspace is currently receiving evidence.

Because the question bank and stored answer format are unchanged, existing M3 answers can be rescored against the v4 compositions. No stored role-result migration is required.

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

Visualization remains split into three radar charts:

1. self-positioned roles and headspaces
2. partner-positioned roles and headspaces
3. underlying dynamic modes

These are **display groupings, not D/s orientation buckets**.

A self-positioned role is primarily phrased as the role or headspace the user inhabits, such as Pet, Little, Prey, Slave, Devotional Submissive, or Object.

A partner-positioned role is primarily phrased as a role enacted toward another person, such as Caregiver, Predator, Owner / Handler, or Master / Mistress.

Neither grouping means submissive or dominant. Activity side, relational role, and negotiated authority remain separate dimensions.

All compositions are independent and do not sum to 100%.

Autonomy never automatically subtracts from another role/headspace. For example, high Autonomy + high Slave or Little can describe consciously bounded or contextual role immersion rather than a scoring contradiction.

---

# Section independence

M3 does not require M2.

M2 and M3 may reuse stable signal concepts, but their direct quiz evidence remains section-local before overall aggregation.

```text
M2 answers → M2 signal evidence → D/s results

M3 answers → M3 signal evidence
                     ├→ role/headspace results
                     └→ dynamic-mode results
```

The overall profile may later normalize and aggregate those signals through the canonical profile evidence model.

---

# Versioning

M3 v4 changes the **composition taxonomy**, not the question bank.

Changes from v3:

- Service Submissive merged into Devotional Submissive
- Trainer merged into Owner / Handler
- Property / Object renamed and narrowed to Object
- role/headspace count changed from 15 to 13
- Service and Training / Shaping remain explanatory dynamic modes
- ownership/property meaning remains available through `ownership_symbolism` instead of a peer Property headspace

M3 v3 answers remain compatible for rescoring because the 32 question IDs and answer scale are unchanged. Derived v3 role/headspace results should not be treated as identical to v4 results because the compositions changed.

---

# Post-implementation review questions

1. Do Pet, Slave, Little, Middle, Brat, Prey, Devotional Submissive, and Object remain recognizably different in real profiles?
2. Do Little and Middle separate well enough from the shared younger-headspace signal?
3. Does the merged Devotional Submissive composition represent both devotion-centered and service-centered expressions without becoming too broad?
4. Does Owner / Handler now absorb training/shaping naturally, or does the combined composition over-score people who only enjoy teaching?
5. Does keeping Training / Shaping as a dynamic mode preserve the useful distinction?
6. Does Object read as a distinct headspace when ownership symbolism is removed from its role composition?
7. Should Brat Tamer remain a peer role/headspace or eventually become a contextual style?
8. Do Prey and Predator separate cleanly because pursuit direction is measured independently?
9. Which additional roles are important enough to justify new signals/questions rather than being inferred badly?
10. Does 32 questions still feel acceptable for this section?

Future changes to question weights, signal IDs, dynamic modes, or role/headspace compositions should update this contract and implementation together.
