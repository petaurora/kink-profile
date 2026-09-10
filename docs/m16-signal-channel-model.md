# M16 Signal + Channel Model

**Status:** Step 1 semantic contract  
**Parent:** M16.4 Profile Semantics Refinement  
**Goal:** separate the meaning of a Signal from the activity-side perspective used to score it.

---

## Core decision

> **Signal = semantic concept.**  
> **Channel = how that concept is experienced or expressed by the profile owner.**

Giving/receiving should not be encoded into the identity of a Signal when they are simply two perspectives on the same concept.

Instead of:

```text
receiving_control
giving_control

care_receiving
care_giving

pain_receiving
pain_giving
```

prefer:

```text
Control
  Overall
  Receiving
  Giving

Care
  Overall
  Receiving
  Giving

Pain
  Overall
  Receiving
  Giving
```

The canonical concept remains stable while evidence can differ by channel.

---

## Why this change

The current Signal vocabulary mixes two different concerns:

1. **what the concept means**
2. **which activity side the profile owner occupies**

That creates duplicated Signal definitions and makes downstream consumers treat activity side as if it were part of the semantic identity.

This also caused an evidence problem:

```text
overall: love for "restraint"
        ↓
can currently project into
receiving_restraint + giving_restraint
```

But:

> “I like restraint overall”

does not necessarily mean:

> “I like receiving restraint and giving restraint equally.”

The new model keeps broad evidence broad until directional evidence actually exists.

---

# Terminology

## Signal

A reusable semantic concept that can appear across quizzes, catalog mappings, modes, headspaces, facets, recommendations, and explanations.

Examples:

- Control
- Care
- Pain
- Restraint
- Positioning
- Discipline
- Praise / Approval
- Arousal Control
- Degradation / Humiliation

A Signal should describe meaning, not authority identity or a specific UI source.

---

## Signal channel

A channel describes the profile owner's perspective on a Signal.

Canonical channel vocabulary:

```text
overall
receiving
giving
```

### Overall

Broad affinity for the concept without asserting an activity side.

Examples:

- “I like restraint.”
- “Praise matters to me.”
- “Arousal control is appealing.”

### Receiving

The concept is directed toward or experienced by the profile owner.

Examples:

- receiving Control → being controlled
- receiving Care → being cared for
- receiving Pain → pain directed toward the profile owner
- receiving Praise → being praised
- receiving Degradation → being degraded

### Giving

The profile owner directs, performs, or creates the concept toward another person.

Examples:

- giving Control → controlling/directing another person
- giving Care → caring for another person
- giving Pain → causing consensual pain
- giving Praise → praising another person
- giving Degradation → degrading another person

Giving/receiving is **activity-side perspective only**.

It must never imply:

- Dominant / submissive identity
- authority orientation
- relationship role
- who initiated the interaction
- who has more social power

---

# Base-description invariant

The base Signal description must express the **shared semantic invariant** across every applicable channel.

Channel descriptions specialize that meaning by perspective; they must not redefine the concept into something substantially different.

Use this as a collapse test:

> **Can the shared concept be described clearly and specifically without assuming a side?**

If yes, the concepts may belong under one Signal with channels.

If the only possible base description becomes vague, generic, or erases a psychologically meaningful distinction, **do not collapse the concepts merely because they resemble two sides of an interaction**.

Examples:

```text
Pain
  Base:
    Consensual pain can itself be intrinsically appealing.

  Receiving:
    Experiencing consensual pain directed toward you.

  Giving:
    Creating consensual pain for a willing partner.

  Result:
    clear shared invariant → one Signal with channels
```

```text
Exhibitionism + Voyeurism
  Attempted base:
    "Visual attention between people can be appealing."

  Problem:
    the abstraction loses the distinct psychological meanings of
    being observed versus wanting to observe.

  Result:
    no useful shared invariant → keep separate Signals
```

A grammatical inverse is not sufficient justification for a channel pair.

Likewise, the fact that “receiving X” and “giving X” can both be phrased does not mean both perspectives deserve scored channels.

**Channel applicability is semantic, not syntactic.**

---

# Channel applicability

The schema makes all three columns available, but not every Signal must support all three semantically.

Every Signal has an Overall value.

Receiving and Giving may be:

- **applicable**
- **not applicable**

Not applicable is different from:

- unknown
- no evidence
- low affinity
- Neutral facet relationship

Example:

```text
                    OVERALL   RECEIVE   GIVE
Control                ●         ●        ●
Pain                   ●         ●        ●
Role Embodiment        ●         —        —
Anticipation           ●         —        —
Emotional Intensity    ●         —        —
```

The Workbench should render non-applicable cells explicitly rather than treating them as empty scores.

---

# Evidence flow

The model is intentionally asymmetric.

## Overall evidence

Broad/undirected evidence contributes only to the Overall channel.

```text
overall evidence
      ↓
Signal.overall

does NOT automatically populate:
Signal.receiving
Signal.giving
```

This protects directional uncertainty.

Example:

```text
Catalog rating:
Restraint = Love

Known:
Restraint.overall = strong positive evidence

Still unknown:
Restraint.receiving
Restraint.giving
```

---

## Receiving evidence

Receiving-specific evidence contributes to:

1. the Receiving channel
2. the broader Overall concept

```text
receiving evidence
      ├──→ Signal.receiving
      └──→ Signal.overall
```

---

## Giving evidence

Giving-specific evidence contributes to:

1. the Giving channel
2. the broader Overall concept

```text
giving evidence
      ├──→ Signal.giving
      └──→ Signal.overall
```

---

## Why directional evidence may roll upward

If someone strongly likes **receiving restraint**, that is valid evidence that **restraint as a concept** matters to them.

The reverse is not safe:

```text
specific → general   valid
general  → specific  invalid without evidence
```

This rule should hold across quizzes, catalog ratings, ranking projections, imports, and future contextual profiles.

---

# Overall is a roll-up, not a third activity side

Receiving and Giving are directional perspectives.

Overall is the broader concept-level result.

That means:

```text
Receiving ─┐
           ├── may inform → Overall
Giving ────┘

Overall ──X──► Receiving
Overall ──X──► Giving
```

The three UI columns may look parallel, but their semantics are intentionally asymmetric.

## Aggregation constraints

The exact scoring formula is deferred to the migration/scoring slice, but it must obey these rules:

- missing Receiving/Giving evidence is **unknown**, not zero
- do not average an unknown side as 0
- do not infer an unobserved opposite side
- directional evidence may strengthen or refine Overall
- broad Overall evidence remains valid broad evidence when directional evidence later exists
- do not double-count the same source simply because it is represented in both a broad and directional view
- contradictory directional evidence should remain visible rather than being erased by one flat mean
- Overall should summarize the concept, while Receiving/Giving preserve asymmetry

Example:

```text
Restraint
  Overall:    Love
  Receiving:  Love
  Giving:     Unknown
```

must not become:

```text
Giving = Love
```

and must not reduce Overall because Giving is unknown.

Likewise:

```text
Arousal Control
  Receiving: high
  Giving:    low
```

should preserve that split even if the resulting Overall concept affinity is moderate-to-high.

---

# Result model

Conceptually, one Signal produces multiple channel results:

```ts
type SignalChannel = "overall" | "receiving" | "giving";

type SignalChannelResult = {
  affinity: number | null;
  coverage: number;
  sourceEvidenceIds: string[];
};

type CanonicalSignalResult = {
  signalId: SignalId;
  overall: SignalChannelResult;
  receiving?: SignalChannelResult;
  giving?: SignalChannelResult;
};
```

The exact implementation shape may change during migration, but the semantics above are normative.

---

# Definition model

Conceptually:

```ts
type SignalDefinition = {
  id: SignalId;
  label: string;
  shortLabel: string;
  description: string;

  channels: {
    receiving?: {
      label: string;
      shortLabel?: string;
      description?: string;
    };
    giving?: {
      label: string;
      shortLabel?: string;
      description?: string;
    };
  };
};
```

Overall is implicit and always available from the base Signal definition.

Signals **should support custom human-facing channel labels** wherever generic “Receiving” / “Giving” wording is awkward, ambiguous, or less semantically precise.

The machine channel remains stable:

```text
overall
receiving
giving
```

while the human-facing label can vary by Signal.

Examples:

```text
Responsibility

Receiving channel label:
  Handing over responsibility

Giving channel label:
  Holding responsibility
```

```text
Pursuit

Receiving channel label:
  Being pursued

Giving channel label:
  Pursuing
```

```text
Positioning

Receiving channel label:
  Being positioned

Giving channel label:
  Positioning another person
```

This is a presentation/semantics layer over stable channel IDs. The implementation should never distort language merely to satisfy a generic column heading.

---

# Referencing a Signal

Downstream semantic definitions should reference:

```text
Signal + optional channel
```

rather than encoding channel into the Signal ID.

Conceptually:

```ts
type SignalRef = {
  signalId: SignalId;
  channel?: "overall" | "receiving" | "giving";
  weight: number;
};
```

Omitted channel means Overall.

Examples:

```text
Surrender
  Responsibility / receiving  1.0
  Control / receiving         0.8
  Role Embodiment / overall   0.4
  Care / receiving            0.3
```

```text
Caretaking
  Care / giving               1.0
  Responsibility / giving     0.9
  Control / giving            0.4
  Guidance / giving           0.3
```

This preserves granular composition without duplicating canonical concepts.

---

# Overall Facet interaction

Overall Facets remain nine broad, non-directional themes.

They do not acquire “giving Power Exchange” or “receiving Care & Nurture” axes.

However, a theme relationship may reference a specific Signal channel when that channel has distinct semantic meaning.

Example:

```text
Care
  Overall → Care & Nurture       supports 1.0

Care / giving
  → Service & Devotion           supports 0.3
```

Receiving Care does not have to receive the same secondary Service relationship.

The **facet is still non-directional**. The directional nuance belongs to the Signal reference feeding it.

---

# Workbench shape

Signal review should make the channel model visible.

Conceptually:

```text
CARE

Channel availability
  Overall      enabled
  Receiving    enabled
  Giving       enabled

Evidence
               Affinity   Coverage
  Overall        91%        82%
  Receiving      96%        71%
  Giving         68%        34%

Overall Facet relationships

                         OVERALL    RECEIVE    GIVE
Care & Nurture           Supports      —         —
Service & Devotion       Neutral       —      Supports
...
```

The exact UI can be refined later.

Important distinctions:

- channel applicability is not evidence state
- channel evidence is not facet relationship
- facet Neutral is not “unknown”
- absent Receiving/Giving evidence must remain visibly unknown

---

# Signals that should remain separate concepts

Not every apparent viewpoint pair should be collapsed into one generic Signal.

If the concepts are psychologically recognizable and semantically clear on their own, keep separate Signals.

Initial decision:

## Exhibitionism

A distinct concept whose perspective is inherent:

> Appeal in deliberately being seen, displayed, watched, or performing for consenting observers.

General-only unless later evidence shows a useful channel split.

## Voyeurism

A distinct concept whose perspective is inherent:

> Appeal in deliberately watching or visually observing consenting others.

General-only unless later evidence shows a useful channel split.

Do **not** rename these into an abstract “Observation / Giving / Receiving” Signal just to make the schema uniform.

---

# New vocabulary already approved for later steps

The following concepts are approved for semantic design after this channel model is finalized:

- Exhibitionism
- Voyeurism
- Arousal Control
- Degradation / Humiliation

Expected initial channel shape:

```text
Exhibitionism
  Overall

Voyeurism
  Overall

Arousal Control
  Overall
  Receiving
  Giving

Degradation / Humiliation
  Overall
  Receiving
  Giving
```

Exact definitions, mappings, quizzes, facet relationships, and Dynamic Mode usage belong to later steps.

---

# Migration principles

Step 1 does not migrate runtime data yet.

When migration begins:

1. pair existing directional Signal IDs into a shared base concept where semantics match
2. preserve current evidence provenance
3. map old directional IDs deterministically into new channels
4. do not infer a missing opposite channel
5. preserve compatibility for imported older profiles
6. update quiz/catalog/mode/headspace/facet references to use Signal + channel
7. keep user-facing scores explainable during migration
8. avoid changing preference meaning merely because IDs changed

Example:

```text
old: receiving_control
  → Control / receiving

old: giving_control
  → Control / giving
```

The migration may additionally derive an Overall Control result from known directional evidence, but it must never derive Receiving from Giving or Giving from Receiving.

---

# Step 2 audit questions

After this contract is accepted, classify every current Signal using:

1. What is the base semantic concept?
2. Can its base description express a clear shared invariant without assuming a side?
3. Is the current Signal actually a directional version of another Signal?
4. Does the concept support Receiving?
5. Does the concept support Giving?
6. What are the clearest human-facing labels for each applicable channel?
7. Do the channel descriptions specialize the base meaning without redefining it?
8. Is either proposed channel merely grammatically possible rather than semantically useful?
9. Should any current pair remain separate concepts instead of channels?
10. Is the Signal redundant once channel normalization happens?
11. Which downstream definitions currently reference the old ID?
12. Does the Signal need Overall-only evidence?
13. Does migration require compatibility aliases?

Expected output:

```text
old Signal ID
→ base concept
→ channel
→ migration action
→ notes
```

---

# Non-goals for Step 1

This step does not yet:

- rename or delete current Signal IDs
- change quiz scoring
- change catalog scoring
- change persisted profile data
- add the four approved new Signals to runtime
- change Dynamic Mode scores
- change Headspace scores
- change Overall Facet results
- implement new Workbench controls

This document is the semantic contract those later changes must follow.

---

# Locked invariants

1. **Signal identity describes meaning, not activity side.**
2. **Overall / Receiving / Giving are channels of evidence for one concept.**
3. **Overall evidence never invents Receiving or Giving affinity.**
4. **Directional evidence may inform the broader Overall concept.**
5. **Receiving/Giving never imply Dom/Sub.**
6. **Not every Signal requires directional channels.**
7. **Not-applicable, unknown, low affinity, and Neutral are distinct states.**
8. **Downstream semantic definitions reference Signal + channel.**
9. **Machine channel IDs stay stable while human-facing channel labels may vary by Signal.**
10. **Overall Facets remain broad non-directional themes.**
11. **Schema uniformity must not override clear human semantics.**
12. **A shared Signal requires a clear base semantic invariant across its channels.**
13. **Channel descriptions specialize the base meaning; they do not redefine it.**
14. **A grammatical opposite is not enough to justify a directional channel.**
