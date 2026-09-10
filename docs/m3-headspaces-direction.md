# M3 — Roles, Headspaces & Dynamic Modes Contract

## Status

**Implemented contract for M3 v5.**

M3 separates three layers:

```text
profile evidence
      ↓
   signals
   ↙    ↘
roles   dynamic modes
```

- **Signals** are granular evidence and may have `overall`, `giving`, and/or `receiving` channels.
- **Roles / headspaces** are recognizable identities or internal relational states.
- **Dynamic modes** describe how a dynamic feels or functions across roles.

The important rule for v5 is:

> **Dynamic modes are direction-neutral. Direction belongs to Signal channels, not peer mode labels.**

A person may therefore score highly for a mode such as Care, Power Exchange, or Intensity while separately showing whether their evidence is stronger on giving, receiving, or both.

---

## Roles / headspaces

M3 keeps the 12-role taxonomy established in v4.

### Self-positioned

- Pet
- Slave
- Little
- Middle
- Brat
- Prey
- Object

### Partner-positioned

- Owner / Handler
- Caregiver
- Brat Tamer
- Predator
- Master / Mistress

These display groups are not D/s classifications. Activity direction and authority orientation remain independent.

### v4 role cleanup retained

- Service Submissive removed as a peer headspace.
- Devotional Submissive removed as a peer headspace.
- Trainer merged into Owner / Handler.
- Property / Object narrowed to Object.
- Devotion and Service remain cross-cutting concepts rather than submissive identities.

---

## Dynamic modes

M3 v5 defines **10 dynamic modes**:

1. **Devotion** — dedication, loyalty, belonging, and relationship-centered meaning.
2. **Protocol** — formal expectations, ritual, prescribed behavior, and intentional procedure.
3. **Service** — usefulness, contribution, assistance, and relationally meaningful service.
4. **Structure** — consistency, expectations, guidance, accountability, correction, and shaping over time.
5. **Care** — comfort, soothing, support, regulation, nurturance, and attention to wellbeing.
6. **Playful Challenge** — teasing, negotiated pushback, provocation, and interactive challenge.
7. **Objectification** — consensual reduction of ordinary identity into a role, function, or object-like framing.
8. **Primal / Feral** — instinct, physical immediacy, pursuit, and less socially structured interaction.
9. **Power Exchange** — negotiated placement of control, direction, responsibility, and following.
10. **Intensity** — physically or emotionally strong, painful, overwhelming, or sustained sensation.

All modes can overlap.

---

## Merges and removals in v5

### Nurtured Play + Caretaking → Care

`Nurtured Play` mixed care with Pet/Little-flavored playfulness, belonging, and role immersion. `Caretaking` encoded mainly the giving side of care.

They are replaced by **Care**. Giving and receiving care remain available through Signal channels. Playfulness and role embodiment stay separate Signals.

### Training / Shaping → Structure

Training, teaching, correction, guidance, and behavioral shaping are treated as expressions of **Structure** rather than a standalone mode.

The `guidance_shaping` Signal remains available and can strongly support roles such as Owner / Handler without creating a separate Trainer role or Training mode.

### Protocol remains separate from Structure

```text
Protocol  = there is a prescribed / ritualized way we do this
Structure = there is a framework holding this over time
```

They may correlate, but they describe different experiences.

### Playful Resistance → Playful Challenge

The stable internal mode ID `playful_resistance_mode` is retained for compatibility. The user-facing label becomes **Playful Challenge**.

### Claiming removed as a peer mode

Claiming remains measurable through `ownership_symbolism`, belonging, control, and responsibility Signals. It does not need its own dynamic-mode result.

### Authority + Surrender → Power Exchange

Authority and Surrender encoded opposite positions inside the same underlying interaction. Keeping both as peer dynamic modes reintroduced direction into a layer intended to be neutral.

They are replaced by **Power Exchange**.

```text
Power Exchange = the shared mode
giving / receiving control = Signal channels
holding / transferring responsibility = Signal channels
```

Directional experiences such as surrender may still exist as scene-builder filters or descriptions. They are not peer dynamic modes in the profile taxonomy.

### Intensity added

Intensity is a profile-wide mode supported by S/M and catalog evidence such as physical intensity, pain, endurance, and emotional intensity.

The 32-question Roles & Headspaces quiz does not fabricate Intensity evidence. Overall-profile scoring may use evidence from other quizzes and catalog interactions.

---

## Current composition intent

Weights remain implementation details rather than percentages. The semantic intent is:

```text
Devotion         = devotion + belonging + ritual + service + ownership meaning
Protocol         = ritual + formal structure + obedience
Service          = service + relational meaning
Structure        = structure + guidance/shaping + accountability
Care             = care across giving/receiving + support/praise
Playful Challenge= negotiated resistance + playfulness + autonomy
Objectification  = objectification + role embodiment
Primal / Feral   = primal embodiment + pursuit + role embodiment
Power Exchange   = control + responsibility + obedience + structure
Intensity        = physical intensity + pain + endurance + emotional intensity
```

Directional legacy Signal pairs are collapsed to the canonical `overall` channel when they contribute to a direction-neutral dynamic mode. Their giving/receiving channels remain available elsewhere for detailed interpretation.

---

## Questionnaire and compatibility

The Roles & Headspaces quiz keeps the existing **32 questions** and answer scale. M3 v5 changes derived compositions, not raw stored answers.

Existing answers remain valid and can be rescored against the v5 taxonomy. Derived results from older versions should not be treated as identical because the compositions changed.

Roles & Headspaces quiz version: **5**.

Future changes to Signal IDs, mode definitions, role definitions, or composition weights should update this contract and implementation together.
