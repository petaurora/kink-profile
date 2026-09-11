# Signal + Channel Data Model

This document defines the canonical semantic unit used by the evolving profile.

## Core invariant

> **Signal = semantic concept. Channel = perspective on that concept.**

A Signal answers **what concept is being measured**. A channel answers whether evidence describes that concept broadly or from a supported receiving/giving perspective.

The canonical runtime model lives in `src/data/canonicalSignals.ts` and the normalized aggregation engine in `src/lib/normalizedProfileSignals.ts`.

## Canonical shape

```ts
type SignalChannel = "overall" | "receiving" | "giving";

type CanonicalSignalRef = {
  signalId: CanonicalSignalId;
  channel?: SignalChannel;
};
```

`channel` omitted means `overall` when a downstream definition stores a Signal reference.

Every canonical Signal has an Overall result. A Signal exposes Receiving and/or Giving only when those perspectives are semantically meaningful for that concept.

Examples:

```text
Control
  Overall
  Receiving — Being controlled / Receiving control
  Giving    — Exercising control

Care
  Overall
  Receiving — Being cared for
  Giving    — Caring for someone

Role Embodiment
  Overall only
```

Do not manufacture Receiving/Giving channels for concepts that are not honestly directional.

## Channel semantics are not authority semantics

Receiving and Giving describe the **direction or perspective of the Signal concept itself**. They do not encode Dominant/submissive identity.

Examples:

- giving pain does not imply Dominant
- receiving pain does not imply submissive
- restraining someone does not imply Dominant
- being restrained does not imply submissive
- providing service does not imply Dominant or submissive by itself
- receiving care does not imply a specific authority role

Authority, activity side, and roles/headspaces remain distinct semantic dimensions. See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

Channel labels are therefore concept-specific human language. The machine channel is stable, while presentation labels explain what that perspective means for a particular Signal.

For example, Responsibility currently uses concept-aware labels rather than assuming the English words "receiving" and "giving" should appear literally in the UI.

## Broad evidence and directional evidence

Overall evidence and directional evidence have an intentionally asymmetric relationship.

### Overall evidence does not invent direction

If evidence only establishes that a user likes Control broadly, the system may update:

```text
Control · Overall
```

It must not infer:

```text
Control · Receiving
Control · Giving
```

without directional evidence.

### Directional evidence may contribute to the broader concept

Evidence that clearly supports a directional channel can also support the same Signal's Overall roll-up.

This allows the profile to learn the broad concept from directional experiences without forcing the reverse inference.

Conceptually:

```text
Receiving evidence ─┐
                    ├──► Signal · Overall
Giving evidence ────┘

Signal · Overall ──X──► no automatic directional certainty
```

## Canonical vocabulary

`src/data/canonicalSignals.ts` is the source of truth for the current `CanonicalSignalId` vocabulary, labels, descriptions, and supported channels.

The current model contains 37 canonical concepts. New authoring must target these canonical concepts rather than adding activity side into the ID itself.

Prefer:

```text
signalId: pain
channel: receiving
```

over legacy identity shapes such as:

```text
pain_receiving
```

A new Signal concept should exist because it represents meaningfully distinct semantics, not because a caller needs another presentation label or activity-side variant.

## Legacy Signal IDs

Older quiz/catalog definitions still contain legacy Signal IDs. They are compatibility input, not the canonical profile vocabulary and not valid targets for new Workbench authoring.

Compatibility normalization maps legacy IDs to:

```text
legacy Signal ID
      ↓
canonical SignalId + channel
```

The compatibility layer must preserve existing stored/profile behavior while allowing the rest of the application to reason in the normalized model.

Rules:

1. legacy IDs may remain at old data/source seams until those sources are deliberately migrated;
2. normalize them before canonical profile aggregation;
3. do not expose legacy directional IDs as new canonical authoring options;
4. do not count two collapsed legacy IDs as two independent semantic concepts merely because both old IDs existed;
5. stable stored evidence should be reprojected through current semantic mappings rather than rewritten as if the user supplied new evidence.

## Independent evidence sources

The canonical Signal profile currently combines three independent evidence classes:

- quiz evidence
- explicit catalog preference evidence
- catalog pairwise ranking evidence

Their source reliability factors are currently defined in `src/lib/overallProfileSignals.ts`:

| Source | Reliability |
| --- | ---: |
| Quiz | 0.80 |
| Explicit catalog | 0.65 |
| Catalog pairwise | 0.50 |

These values affect aggregation weight. They are not semantic definitions and should be changed deliberately with tests rather than tuned in presentation code.

Inferred catalog affinity is **not** an independent Signal source and must never feed back into canonical Signals.

See [Source-Aware Profile Evidence Architecture](../profile-evidence-architecture.md).

## Affinity and coverage

Every channel result keeps two different values:

```ts
type SignalChannelResult = {
  affinity: number | null;
  coverage: number;
  // provenance omitted here
};
```

- **Affinity** answers: what direction/strength does the evidence we have point toward?
- **Coverage** answers: how much effective evidence supports that result?

Missing evidence is unknown, not zero preference.

A high-affinity result with partial coverage is valid. Coverage can affect effective evidence weight and presentation confidence, but it must not silently cap or dilute the semantic meaning of known evidence.

No evidence produces `affinity: null`, not an artificial 0% preference.

## Quiz normalization

Weighted quiz questions may still reference legacy IDs. During canonical projection:

1. each authored weight resolves to a canonical Signal + channel;
2. directional evidence is retained for supported directional channels;
3. the broad canonical concept also receives an Overall projection;
4. answered weight and expected weight remain separate so quiz coverage can be calculated;
5. a quiz retake supersedes that quiz source rather than stacking duplicate evidence.

Question-level provenance remains identifiable through quiz, question, and mapped legacy/canonical identities.

## Explicit catalog normalization

Direct catalog preference is user-authored evidence and may project to canonical Signals through catalog mappings.

For a mapped item:

- an Overall canonical contribution is produced from the applicable direct evidence;
- Receiving/Giving contributions are produced only for compatible directional contexts;
- multiple compatible mappings from one catalog item do not turn that one item into multiple independent evidence sources;
- Hard Limit / exclusion semantics remain owned by the catalog evidence layer and recommendation eligibility rules.

The catalog preference itself remains authoritative direct evidence. The Signal projection is a derived interpretation of that direct evidence.

## Pairwise normalization

This-or-That comparisons are direct relative evidence.

Pairwise projections may contribute to:

- a supported specific Signal channel; and
- the broader Overall concept.

Only meaningful comparisons contribute. Pairwise evidence never writes an explicit catalog preference and never treats a generated catalog inference as user evidence.

## Source aggregation

Within one Signal/channel, contributions are summarized by source class before source classes are combined.

The aggregation contract is:

1. preserve affinity and coverage separately for each source;
2. use coverage to determine how much of that source is effectively known;
3. combine source coverage without pretending independent evidence is simple additive certainty;
4. multiply source coverage by the source reliability factor to obtain effective weight;
5. calculate final affinity from available effective source weights;
6. retain source evidence IDs for explanation and deduplication.

The exact formulas live in `src/lib/normalizedProfileSignals.ts` and tests. Documentation should describe their semantics rather than duplicate every implementation constant.

## Downstream composition

Canonical Signal references feed derived semantic layers.

### Overall Facets

Overall Facets are broad, non-directional themes. A facet can reference either:

```text
Signal · Overall
```

or an explicitly meaningful directional channel:

```text
Care · Giving
```

The facet itself does not become directional merely because one component uses a directional Signal channel.

Signal → Overall Facet relationships may support or oppose a theme. Omitted relationships are neutral.

### Roles / Headspaces and contextual modes

Composed role/headspace and contextual-mode definitions reference canonical Signal + optional channel with weights.

These are derived interpretations. Their scores must not feed back into the Signals used to compose them.

### Scene themes and other query layers

Query/filter layers may map to Signals, but using a Signal for discovery or scene composition must not create profile evidence.

## Workbench authoring

The Curation Workbench exposes canonical Signal concepts and only their supported channels.

New authored Signal references must satisfy:

- known canonical Signal ID;
- `overall`, or a directional channel explicitly supported by that Signal;
- finite weight greater than 0 and no more than 1.

The deprecated generic `direction` field is compatibility-only and must not be emitted by new Workbench proposals.

See [Curation Workbench](../product/curation-workbench.md).

## Invariants

Keep these rules true across future changes:

1. Signal identity describes a concept, not an activity-side duplicate.
2. Overall evidence never fabricates Receiving/Giving certainty.
3. Directional evidence may roll up to the same broad concept.
4. Giving/Receiving never implies Dominant/submissive authority.
5. Unsupported channels do not exist merely for schema symmetry.
6. Legacy IDs are compatibility input, not new authoring targets.
7. Unknown evidence is not zero preference.
8. Affinity and coverage remain distinct.
9. Derived profile layers do not feed back into canonical evidence.
10. Stable IDs, not labels, are runtime identity.

When a change alters these invariants, update this contract and the relevant tests in the same PR.
