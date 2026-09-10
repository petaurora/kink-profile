# M16 Signal Channel Audit — Step 2

**Status:** in review  
**Parent contract:** [M16 Signal + Channel Model](m16-signal-channel-model.md)  
**Input:** 45 current runtime Signal IDs

---

## Goal

Classify every current Signal into the new semantic model:

```text
semantic concept
  ├─ Overall
  ├─ Receiving   [when applicable]
  └─ Giving      [when applicable]
```

This audit does **not** migrate runtime data yet.

It decides:

- which directional Signal pairs collapse into one concept,
- which existing single Signals gain directional channels,
- which remain Overall-only,
- which require semantic surgery before migration,
- and how legacy evidence must be reprojected safely.

---

# Audit statuses

## COLLAPSE

Two current Signal IDs are clearly directional forms of one shared concept.

## EXPAND CHANNELS

One current Signal represents a valid base concept, but the new model should support Receiving/Giving channels that are not currently modeled cleanly.

## KEEP GENERAL

The concept is meaningful as a base Signal but activity-side channels do not currently add honest semantic value.

## REVIEW

The current Signal is overloaded, redundant, or does not have a clean migration target yet.

Do not migrate REVIEW Signals until their semantics are resolved.

---

# Critical migration discovery

> **Do not migrate current aggregated Signal results by ID. Rebuild them from source evidence.**

The legacy pipeline can project broad catalog evidence into directional Signal IDs.

Therefore:

```text
legacy receiving_control = 87%
```

cannot safely be interpreted as:

```text
new Control.receiving = 87%
```

because the legacy result may contain:

- directional quiz evidence,
- broad `overall` catalog evidence,
- receiving catalog evidence,
- pairwise evidence,
- and other projections.

The migration must reproject original evidence according to its actual semantic context.

## Required reprojection rule

```text
quiz evidence
  → channel defined by the question's intended meaning

catalog overall
  → Signal.overall only

catalog receiving
  → Signal.receiving
  → may also inform Signal.overall

catalog giving
  → Signal.giving
  → may also inform Signal.overall

pairwise evidence
  → only a directional channel when the compared semantics
    genuinely establish that channel
```

Do not carry forward accidental directional certainty from the legacy projection model.

---

# A. High-confidence directional collapses

These pairs pass the base-description invariant cleanly.

| Current Signal ID | New base concept | Channel | Human-facing channel label | Action |
| --- | --- | --- | --- | --- |
| `receiving_control` | Control | Receiving | Being controlled / Receiving control | COLLAPSE |
| `giving_control` | Control | Giving | Exercising control | COLLAPSE |
| `responsibility_transfer` | Responsibility | Receiving | Handing over responsibility | COLLAPSE |
| `responsibility_holding` | Responsibility | Giving | Holding responsibility | COLLAPSE |
| `care_receiving` | Care | Receiving | Being cared for | COLLAPSE |
| `care_giving` | Care | Giving | Caring for someone | COLLAPSE |
| `pursuit_receiving` | Pursuit | Receiving | Being pursued | COLLAPSE |
| `pursuit_giving` | Pursuit | Giving | Pursuing | COLLAPSE |
| `receiving_restraint` | Restraint | Receiving | Being restrained | COLLAPSE |
| `giving_restraint` | Restraint | Giving | Restraining someone | COLLAPSE |
| `receiving_positioning` | Positioning | Receiving | Being positioned | COLLAPSE |
| `giving_positioning` | Positioning | Giving | Positioning another person | COLLAPSE |
| `receiving_constraint_control` | Constraint Control | Receiving | Having freedom physically controlled | COLLAPSE |
| `giving_constraint_control` | Constraint Control | Giving | Controlling physical freedom | COLLAPSE |
| `receiving_discipline` | Discipline | Receiving | Receiving discipline | COLLAPSE |
| `giving_discipline` | Discipline | Giving | Giving discipline | COLLAPSE |
| `pain_receiving` | Pain | Receiving | Receiving pain | COLLAPSE |
| `pain_giving` | Pain | Giving | Causing pain | COLLAPSE |
| `receiving_intensity` | Physical Intensity | Receiving | Receiving intensity | COLLAPSE |
| `giving_intensity` | Physical Intensity | Giving | Creating intensity | COLLAPSE |
| `receiving_endurance` | Endurance | Receiving | Enduring sustained intensity | COLLAPSE |
| `giving_endurance` | Endurance | Giving | Sustaining intensity for someone | COLLAPSE |
| `receiving_challenge` | Challenge | Receiving | Being pushed toward an edge | COLLAPSE |
| `giving_challenge` | Challenge | Giving | Pushing someone toward an edge | COLLAPSE |

## Proposed base invariants

### Control

> Negotiated control over choices, direction, or the flow of an interaction can itself carry psychological or relational appeal.

### Responsibility

> The deliberate placement of decision-making, direction, boundaries, or responsibility for an experience can itself carry meaning.

### Care

> Deliberately attending to comfort, regulation, support, growth, or wellbeing can carry relational meaning.

### Pursuit

> Consensual pursuit, chase, tracking, closing distance, or capture can itself be part of the appeal.

### Restraint

> Deliberate physical restraint, binding, holding, or immobilization can itself be appealing independent of pain.

### Positioning

> Deliberately placing or maintaining a body in a particular posture or position can itself be appealing.

### Constraint Control

> Negotiated authority expressed through physical limits on freedom can carry psychological appeal beyond restraint alone.

### Discipline

> Agreed correction or consequences can carry relational or psychological meaning even when pain is not involved.

### Pain

> Consensual pain can be intrinsically appealing rather than merely tolerated as a means to another effect.

### Physical Intensity

> A physically strong or overwhelming experience can itself be appealing even when pain is not the main point.

### Endurance

> Sustaining or remaining with physical intensity or discomfort over time can itself be rewarding.

### Challenge

> Deliberately pushing toward an agreed personal edge can add appeal beyond ordinary intensity.

---

# B. Existing concepts that should gain channels

These current Signals have a usable base invariant and meaningful directional asymmetry, even though the current runtime model does not represent both sides cleanly.

| Current Signal | Base concept | Proposed channels | Legacy semantic warning |
| --- | --- | --- | --- |
| `service` | Service | Receiving + Giving | current wording is mostly Giving |
| `obedience` | Obedience | Receiving + Giving | current wording describes Giving obedience / following direction |
| `structure` | Structure | Receiving + Giving | current definition is broad; preserve legacy broad evidence as Overall |
| `ownership_symbolism` | Ownership Symbolism | Receiving + Giving | current definition mixes being claimed and claiming |
| `praise_approval` | Praise / Approval | Receiving + Giving | current definition is strongly Receiving-oriented |
| `devotion` | Devotion | Receiving + Giving | current definition is broad; do not assume one side |
| `playful_resistance` | Playful Resistance | Receiving + Giving | current definition is relational and can feed both brat/brat-tamer semantics |
| `objectification` | Objectification | Receiving + Giving | current quiz wording may be Receiving while catalog evidence may be broad |
| `guidance_shaping` | Guidance / Shaping | Receiving + Giving | current wording is strongly Giving-oriented |
| `accountability` | Accountability | Receiving + Giving | current definition is broad; sides can differ substantially |

## Proposed channel labels

### Service

```text
Receiving → Being served
Giving    → Providing service
```

Base invariant:

> Acts of usefulness, contribution, assistance, or attending to another person's needs can carry relational significance.

Consumer review confirms current quiz evidence is almost entirely **Giving / Providing Service**:
- doing something because a partner expects it,
- anticipating a partner's needs,
- being useful,
- being recognized for serving well.

Therefore:

```text
legacy Service quiz evidence
→ Service.giving

new Service.receiving
→ remains unknown until explicitly measured
```

Keep Service distinct from Care:

```text
Service
→ usefulness, contribution, tasks, attending to needs

Care
→ comfort, regulation, support, growth, wellbeing
```

Decision: **validated as one channel-capable Signal**.

### Obedience

```text
Receiving → Being obeyed
Giving    → Following direction
```

Base invariant:

> Intentional compliance with clear direction can itself carry relational or psychological meaning.

This does **not** make Obedience equivalent to authority. Authority can be appealing without obedience being the meaningful ingredient, and vice versa.

Consumer review confirms current quiz evidence consistently measures the profile owner **following direction**:
- being given instructions and expected to follow them,
- doing something because a partner expects it,
- standing rules / expectations,
- following protocol exactly.

Therefore:

```text
legacy Obedience quiz evidence
→ Obedience.giving
  human label: Following direction

new Obedience.receiving
→ Being obeyed
→ remains unknown until explicitly measured
```

The shared invariant is intentional compliance with direction, which survives the perspective change cleanly.

Decision: **validated as one channel-capable Signal**.

### Structure

```text
Receiving → Receiving / living within structure
Giving    → Creating / providing structure
```

Base invariant:

> Defined expectations, rules, routines, consistency, or explicit frameworks can make a dynamic feel more intentional or rewarding.

### Ownership Symbolism

```text
Receiving → Being claimed / owned
Giving    → Claiming / owning
```

Base invariant:

> Consensual claiming, belonging, ownership language, or commitment symbols can carry emotional meaning.

### Praise / Approval

```text
Receiving → Being praised / approved of
Giving    → Giving praise / approval
```

Base invariant:

> Positive recognition, approval, affirmation, or acknowledgment can carry emotional or relational significance.

### Devotion

```text
Receiving → Receiving devotion
Giving    → Expressing devotion
```

Base invariant:

> Dedication, loyalty, and relationship-centered significance can make an act or dynamic meaningful beyond its practical purpose.

### Playful Resistance

```text
Receiving → Meeting playful resistance
Giving    → Offering playful resistance
```

Base invariant:

> Negotiated pushback, teasing, resistance, or challenge can make an interaction more playful and interactive.

This is especially useful for separating Brat from Brat Tamer semantics without inventing separate concepts.

### Objectification

```text
Receiving → Being objectified
Giving    → Objectifying someone
```

Base invariant:

> Consensual role or function framing that deliberately reduces ordinary identity can itself be appealing.

### Guidance / Shaping

```text
Receiving → Being guided / shaped
Giving    → Guiding / shaping
```

Base invariant:

> Teaching, correction, coaching, development, or deliberate behavioral shaping can itself carry relational meaning.

### Accountability

```text
Receiving → Being held accountable
Giving    → Holding someone accountable
```

Base invariant:

> Expectations having meaningful and consistent follow-through can deepen a structured interaction or dynamic.

---

# C. Keep Overall-only for now

These concepts currently have a coherent meaning without a useful activity-side split.

| Signal | Decision | Reason |
| --- | --- | --- |
| `autonomy` | KEEP GENERAL | preserving meaningful choice is not usefully represented as “giving vs receiving autonomy” in this model |
| `belonging` | KEEP GENERAL | emotional connection/inclusion is the invariant; directional claiming belongs under Ownership Symbolism |
| `role_embodiment` | KEEP GENERAL | describes internal role-state immersion |
| `playfulness` | KEEP GENERAL | describes interaction quality / internal mode rather than activity side |
| `ritual_significance` | KEEP GENERAL | describes the meaning of ritual, not who performs it |
| `younger_headspace` | KEEP GENERAL | describes internal headspace |
| `primal_embodiment` | KEEP GENERAL | describes internal/embodied mode |
| `anticipation` | KEEP GENERAL | describes experienced suspense/expectation |
| `emotional_intensity` | KEEP GENERAL | describes atmosphere / internal experience |
| `movement_restriction` | KEEP GENERAL | describes reduced mobility as a physical property shared across receiving/giving restraint contexts |

A future use case may justify channels for one of these, but grammar alone is not enough.

---

# D. Resolved semantic surgery

## Movement Restriction — resolved as Overall-only

Consumer review shows that `movement_restriction` is deliberately used from both sides of restraint:

```text
Receiving-oriented quiz:
"Having several parts of my movement restricted at once..."
  → movement_restriction

Giving-oriented quiz:
"Securing a willing partner so they cannot freely reposition..."
  → movement_restriction
```

The shared invariant is not “receiving restraint.” It is the physical property of reduced mobility.

Keep the distinction:

```text
Restraint
→ binding / holding / immobilizing activity

Movement Restriction
→ reduced mobility as a physical feature

Constraint Control
→ negotiated authority expressed through physical limits
```

Decision:

```text
Movement Restriction
  Overall only
```

Base invariant:

> Reduced range or freedom of movement can itself be an appealing physical feature independent of who is applying or experiencing the restraint.

Directional restraint questions may contribute upward to Movement Restriction.overall when they genuinely measure this property.

---

## Challenge / Escape — rename + channelize

Consumer review shows two clear perspectives of the same physical interaction:

```text
Current receiving-side evidence:
- pulling against or testing agreed restraint
- trying to get free

Current giving-side evidence:
- enjoying a partner testing or struggling against restraint
- making containment more interactive
```

The current name `challenge_escape` is too vague and overlaps by name with the separate personal-edge **Challenge** Signal.

Proposed normalized concept:

```text
Escape / Containment

Receiving → Testing / escaping restraint
Giving    → Containing / preventing escape
```

Base invariant:

> Consensual struggle between escape attempts and containment within agreed restraint can add an interactive physical challenge.

This preserves a useful distinction from neighboring concepts:

```text
Escape / Containment
→ physical struggle between getting free and keeping contained

Playful Resistance
→ negotiated social / authority pushback and teasing

Pursuit
→ chase, tracking, closing distance, capture

Challenge
→ pushing toward an agreed personal edge
```

Migration action:

```text
challenge_escape
→ Escape / Containment

reproject source evidence:
  receiving quiz meaning → Receiving channel
  giving quiz meaning    → Giving channel
  broad catalog evidence → Overall only
```

Status: **EXPAND CHANNELS + RENAME**.

---


# Projected canonical vocabulary after this audit

Current runtime:

```text
45 Signal IDs
```

High-confidence directional pairs:

```text
24 old IDs
→ 12 base concepts
```

Remaining current singles:

```text
11 expand to channel-capable concepts
10 remain Overall-only
0 unresolved legacy concepts
```

Projected current-concept count before resolving REVIEW items:

```text
12 + 11 + 10 = 33 concepts
```

Already-approved new concepts from Step 1:

```text
Exhibitionism
Voyeurism
Arousal Control
Degradation / Humiliation
```

Potential vocabulary after those additions:

```text
~37 canonical concepts
```

This count is descriptive, not a target. Semantic clarity outranks vocabulary size.

---

# New approved vocabulary shape

These are not runtime additions yet, but Step 2 confirms their channel shape under the new model.

## Exhibitionism

```text
Overall only
```

> Appeal in deliberately being seen, displayed, watched, or performing for consenting observers.

## Voyeurism

```text
Overall only
```

> Appeal in deliberately watching or visually observing consenting others.

## Arousal Control

```text
Overall
Receiving → Having arousal controlled
Giving    → Controlling another person's arousal
```

> Deliberate control over arousal, stimulation, release, orgasm, denial, permission, or access to sexual response can itself be part of the appeal.

## Degradation / Humiliation

```text
Overall
Receiving → Being degraded / humiliated
Giving    → Degrading / humiliating
```

> Consensual lowering of dignity, status, positive evaluation, or social presentation can carry psychological appeal.

Keep distinct from Objectification:

```text
Objectification
→ reduced ordinary identity / role / function

Degradation / Humiliation
→ reduced dignity / status / positive evaluation
```

They may co-occur but are not interchangeable.

---

# Step 2 migration implications

The implementation phase should not begin with a global ID rename.

Recommended migration order:

1. define new base Signal metadata and channel applicability
2. define old-ID compatibility map
3. convert quiz question mappings to Signal + channel
4. convert catalog semantic mappings to Signal + channel
5. convert Dynamic Modes / Headspaces to Signal + channel
6. convert Overall Facet relationships to Signal + optional channel
7. rebuild canonical results from source evidence
8. compare representative profiles
9. only then retire legacy directional IDs

This preserves provenance and avoids treating historical projection artifacts as new directional truth.

---

# Remaining semantic validation questions

Before runtime migration, validate:

1. **Escape / Containment** — confirm the normalized name and channel labels.
2. Validate all custom channel labels against actual UI language before migration.

Resolved by consumer review:
- Movement Restriction → Overall-only physical-property Signal
- Service → one channel-capable Signal
- Obedience → one channel-capable Signal
