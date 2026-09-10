# M16.4e — Match Strength + Evidence Explainability

**Status:** scoped  
**Parent:** [M16.4 — Profile Semantics Refinement](m16-profile-semantics-refinement.md)  
**Related:** M16 Signal + Channel Model, M16 Signal Channel Audit, canonical Signal runtime migration

---

## Goal

Make composed profile scores easier to interpret without weakening or artificially damping valid high-affinity results.

Headspaces and Dynamic Modes should communicate two different ideas separately:

1. **Match strength** — how strongly the known evidence matches the construct.
2. **Evidence coverage / confidence** — how much of that construct is actually supported by known evidence.

A high match with partial coverage is valid and should not be forced downward merely because some ingredients are unexplored.

---

## Validation conclusion

The Signal + channel migration produced meaningful movement in Headspaces and Dynamic Modes while keeping the broad Overall profile shape and authority orientation stable.

Representative before/after review also showed that high-90s role/headspace matches are plausible rather than automatically evidence of score inflation.

Therefore:

- **do not add a global score cap**
- **do not multiply every displayed match by coverage**
- **do not treat unknown evidence as zero**
- **do not retune source reliability solely because a composed result reaches the 90s**

Any future score calibration must be driven by repeated evidence of misleading ranking behavior across representative profiles, not by discomfort with large percentages alone.

---

## Terminology

### Match strength

The current composed affinity score answers:

> Of the evidence we know for this construct, how strongly does it match?

Example:

```text
Slave
Match: 96.6%
```

This value may legitimately be high when the known supporting Signals are consistently strong.

### Evidence coverage

Coverage answers:

> How much of the configured construct has meaningful evidence behind it?

Example:

```text
Slave
Match: 96.6%
Coverage: 72%
```

This is meaningfully different from:

```text
Property / Object
Match: 92.1%
Coverage: 41%
```

Both can be strong matches, but the first is supported across more of its definition.

### Confidence

For now, UI copy may use **coverage** directly rather than inventing a second derived confidence formula.

If a future confidence score is introduced, it must be explicitly defined and must not silently replace raw coverage.

---

## UI requirements

For Headspaces and Dynamic Modes:

- keep the primary percentage as **Match** / affinity
- expose **Coverage** as a separate value
- do not visually imply that Match is statistical certainty
- preserve unknown directional evidence as unknown, not zero
- do not hide a strong match simply because coverage is partial
- allow low-coverage results to be visually marked as limited evidence

Compact UI may show:

```text
Slave                       96.6%
Strong match · 72% coverage
```

Expanded/detail UI should show the component breakdown described below.

---

## Component explainability

Each Headspace and Dynamic Mode should be inspectable as a weighted composition of canonical Signal channels.

For every configured component expose:

- canonical Signal
- channel: Overall / Receiving / Giving
- relationship: Supports / Opposes when that model is enabled
- configured weight
- Signal affinity
- Signal coverage
- effective evidence weight
- contribution to the composed result
- relevant source/evidence count or source IDs where practical

Example:

```text
Surrender — 88.5% match · 68% coverage

Responsibility.giving
  weight: 1.0
  affinity: 97%
  coverage: 84%
  contribution: +...

Control.receiving
  weight: 0.8
  affinity: 94%
  coverage: 91%
  contribution: +...

Role Embodiment.overall
  weight: 0.4
  affinity: 89%
  coverage: 70%
  contribution: +...

Care.receiving
  weight: 0.3
  affinity: 86%
  coverage: 62%
  contribution: +...
```

The detail view should make it possible to answer:

> Why is this 96%?

and:

> Why did this mode move above or below another mode after a semantic mapping change?

without reverse-engineering the scoring code.

---

## Surrender / Objectification validation case

Keep these as a representative regression pair because they changed ordering after channel normalization.

The audit should verify that:

- **Surrender** is driven by the intended handing-over / receiving-authority semantics rather than generic positive power-exchange evidence
- **Objectification** is driven by receiving-side Objectification / Ownership / Control evidence where configured
- movement between the two can be explained from canonical Signal/channel contributions
- neither mode receives directional credit from broad Overall evidence that does not establish a side

A rank change is not itself a bug if the component trace is semantically coherent.

---

## Ranking policy

Initial behavior:

- continue ranking by raw composed Match once minimum display coverage is met
- keep existing minimum-coverage gating unless representative-profile testing shows it is insufficient
- expose Coverage so users can distinguish a strong narrow match from a strong well-supported match

Do **not** introduce confidence-adjusted ranking in this slice.

Only evaluate evidence-adjusted ranking later if testing repeatedly shows low-coverage results leapfrogging well-supported results in a misleading way.

If needed, evaluate a separate ranking value while still preserving raw Match in the UI.

Potential future experiment:

```text
rankingStrength = match × f(coverage)
```

The function must be deliberately calibrated and documented. It must not become the displayed Match percentage by accident.

---

## Curation Workbench support

Where practical, the Curation Workbench should be able to inspect the same composed-score trace used by the profile UI.

Useful review surface:

```text
Definition
  Signal.channel
  Supports / Opposes
  authored weight
  current profile affinity
  current profile coverage
  effective contribution
```

This makes semantic tuning auditable and reduces the temptation to change weights merely because a final number “looks too high.”

---

## Tests

Add tests that pin the distinction between Match and Coverage.

Required cases:

- high affinity + partial coverage can produce a high Match
- missing configured components reduce Coverage but do not count as zero-affinity evidence
- low-coverage results remain identifiable as limited evidence
- component contributions sum/resolve consistently with the final composed score
- directional definitions use the configured canonical channel
- Overall evidence does not manufacture Receiving/Giving support
- Surrender/Objectification regression fixtures explain their ordering from intended channels
- future Supports/Opposes semantics remain visible in the trace

---

## Acceptance criteria

This slice is complete when:

1. Headspace and Dynamic Mode results expose Match and Coverage as distinct concepts.
2. A user can inspect why a composed result received its score.
3. Component traces identify the exact canonical Signal + channel used.
4. High-90s matches are not automatically damped or capped.
5. Unknown evidence remains unknown rather than becoming negative evidence.
6. Ranking behavior remains unchanged unless separate representative-profile testing justifies a ranking-specific calibration.
7. Semantic movement such as Surrender vs Objectification can be explained from component-level evidence rather than treated as suspicious solely because the ordering changed.

---

## Non-goals

This slice does not:

- change the Signal + channel contract
- recalibrate source reliability
- cap composed scores
- convert Match into a confidence percentage
- treat coverage as affinity
- force low-coverage high-affinity results downward
- redesign the Overall radar prominence experiment
- change direct kink preference or pairwise ranking evidence
