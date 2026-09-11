# Quizzes

This document defines the current product contract for the profile's weighted quizzes: available sections, response/progress storage, section-local scoring, and the boundary between quiz evidence and the broader profile.

## Product boundary

Quizzes collect **direct self-reported evidence about reusable preference concepts**.

They are not:

- identity tests that force one BDSM role label;
- catalog questionnaires that require rating every item;
- pairwise ranking sessions;
- consent/permission records;
- standalone alternate profile models.

Each quiz asks concrete experience-level questions and maps answers to weighted Signal evidence. The broader profile later normalizes and combines that quiz evidence with other independent sources.

## Current quiz set

All current quizzes are available and contribute to the overall profile.

| Quiz ID | Current version | Focus |
| --- | ---: | --- |
| `dominance-submission` | 1 | control, responsibility, service, obedience, structure, ownership meaning, praise, autonomy |
| `roles-headspaces` | 5 | role/headspace-relevant experiences plus cross-cutting relational modes |
| `bondage-discipline` | 1 | restraint, positioning, constraint, discipline, accountability, ritual, anticipation, challenge |
| `sadism-masochism` | 1 | pain, physical intensity, endurance, challenge, anticipation, emotional intensity |

`starter-profile` remains a retired compatibility Quiz ID for legacy stored data. It is not part of the current available quiz list.

The registry in `src/data/quizzes.ts` is authoritative for current quiz availability, version, display metadata, question IDs, and whether a quiz contributes to the overall profile.

## Shared response scale

Current weighted quizzes use the same five-point response scale:

| Value | Label |
| ---: | --- |
| `0` | Nope |
| `1` | A little |
| `2` | Maybe |
| `3` | Very into it |
| `4` | Core to me |

Higher values consistently represent stronger affinity for the experience described by the prompt.

Questions should therefore be authored so the scale does not need hidden reverse interpretation merely to produce a desired score.

## Weighted question model

Quiz questions are code-owned weighted definitions.

Conceptually:

```ts
type WeightedQuestion = {
  id: string;
  prompt: string;
  weights: Partial<Record<SignalId, number>>;
};
```

One answer may provide evidence for multiple related Signals with different weights.

Question IDs are stable evidence identity within their quiz. Labels/prompts can evolve only with deliberate compatibility/version consideration because persisted answers are keyed by question ID.

The complete question banks belong in the source files, not duplicated in repository documentation:

- `src/data/dsQuiz.ts`
- `src/data/headspacesQuiz.ts`
- `src/data/bondageDisciplineQuiz.ts`
- `src/data/sadismMasochismQuiz.ts`

## Question-writing boundary

The quiz family measures **underlying experiences and mechanisms**, not specific catalog inventory whenever those can be separated.

Prefer questions such as:

```text
Being physically restrained by someone I trust can feel appealing even when pain is not part of the experience.
```

rather than inventory questions such as:

```text
Do you like rope?
Do you like cuffs?
```

Specific-item preference belongs to the [Kink Catalog](kink-catalog.md).

Likewise, prompts should not simply ask the user to self-assign the result label the system intends to derive.

Prefer experience-level evidence over:

```text
I am submissive.
I am a Sadist.
I am a switch.
```

## Section-local scoring

Quiz scoring is weighted and preserves **affinity** separately from **coverage**.

For each Signal referenced by a quiz:

```text
expected weight = all question weight available for that Signal
answered weight = weight from answered questions only
weighted total  = normalized answers × their weights

affinity = weighted total / answered weight
coverage = answered weight / expected weight
```

Current section-local implementation reports affinity as a percentage and coverage as a percentage.

An unanswered question does not contribute a zero-affinity answer. It reduces coverage.

This preserves the semantic difference between:

```text
I answered this negatively
```

and:

```text
I have not supplied evidence here yet
```

See [Scoring & Taxonomy Model](../scoring-model.md) for the broader scoring contract.

## Partial progress and completion

Quiz progress is persisted independently per Quiz ID:

```ts
type QuizProgress = {
  quizVersion: number;
  answers: Record<string, number>;
  completedAt?: string;
};

type StoredProfile = {
  schemaVersion: 2;
  quizzes: Partial<Record<QuizId, QuizProgress>>;
};
```

Storage key:

```text
pet-profile-v2
```

A quiz can therefore have partial saved answers without being marked complete.

Only one current progress record exists per Quiz ID. A retake/update changes that quiz source rather than creating multiple independent copies of the same quiz evidence in the overall profile.

The profile's source-aware aggregation treats the current quiz state as that quiz's evidence contribution.

## Legacy Signal authoring vs canonical profile Signals

The original quiz definition files still use legacy Signal IDs at their source seam.

Examples include historical directional IDs such as:

```text
receiving_control
giving_control
pain_receiving
pain_giving
```

Those source IDs are **compatibility input**, not the canonical profile vocabulary for new semantic authoring.

Before overall profile aggregation, quiz weights normalize into:

```text
canonical Signal + supported channel
```

For example, legacy directional concepts may become a canonical concept such as Control or Pain with a Receiving/Giving channel.

See [Signal + Channel Data Model](../data-model/signal-channel-model.md).

The quiz source files do not need to be rewritten merely to make their legacy IDs look canonical. The compatibility normalization layer exists specifically so stored answers and stable question semantics can remain valid while the broader profile uses the canonical model.

## Cross-quiz aggregation

Each quiz is independently authored and section-locally scored.

Completing one quiz does not mutate answers or section-local results in another quiz.

The overall profile may combine compatible concepts across quizzes only after normalizing them to canonical Signal + channel and preserving source provenance.

```text
quiz A answers ─┐
quiz B answers ─┼─► canonical quiz evidence ─► overall Signal aggregation
quiz C answers ─┘
```

A shared Signal concept appearing in multiple quizzes means multiple independent quiz sources can provide evidence for that concept. It does not mean one quiz silently edits another quiz's stored answer set.

See [Source-Aware Profile Evidence Architecture](../profile-evidence-architecture.md).

## Section semantic boundaries

The quiz sections intentionally overlap in real-world subject matter while preserving distinct underlying concepts.

### Dominance & Submission

The D/s quiz measures multiple independent components of power exchange rather than one `Dominant ↔ submissive` slider.

Control, responsibility transfer, service, obedience, structure, ownership symbolism, praise/approval, and autonomy can coexist in combinations that should not be flattened into one role label.

The section does not directly assign a single Dominant/submissive identity.

Authority interpretation belongs to the broader profile semantics, not to a simplistic reversal of Giving/Receiving activity direction.

See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

### Roles & Headspaces

The Roles & Headspaces quiz gathers evidence useful for composed roles/headspaces and cross-cutting Dynamic Modes.

The quiz's raw evidence remains Signal evidence. The resulting role/mode compositions are derived interpretations, not direct evidence sources.

Current taxonomy/composition semantics are documented in [Roles, Headspaces & Dynamic Modes](../data-model/roles-headspaces-modes.md).

### Bondage & Discipline

The B&D quiz preserves distinctions such as:

- physical restraint vs movement restriction;
- positioning vs general restraint;
- physical constraint vs the psychological meaning of constraint/control;
- discipline/correction vs accountability;
- structure vs ritual/protocol;
- challenge/escape vs general restraint affinity.

Most importantly:

```text
discipline ≠ pain
```

The section may measure correction/consequence/accountability without assuming that pain is the mechanism.

### Sadism & Masochism

The S/M quiz preserves distinctions such as:

- pain vs physical intensity;
- intensity vs endurance;
- intensity vs challenge;
- physical intensity vs emotional intensity;
- receiving vs giving perspectives.

Most importantly:

```text
pain ≠ discipline
pain ≠ all intense sensation
```

A real-world activity may contain both discipline and pain, but the quiz model does not collapse them into the same Signal simply because they can co-occur.

## Direction is not authority

Several legacy quiz source definitions contain receiving/giving pairs because the experience differs by activity side.

That distinction must survive normalization where semantically meaningful.

It must **not** imply:

```text
receiving = submissive
giving    = Dominant
```

A person can give an activity while in a submissive context or receive one while in a Dominant context. The current general quiz evidence does not fill those contextual gaps by stereotype.

See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

## Quizzes and catalog preference

Quiz evidence can contribute to derived catalog affinity through canonical Signal mappings.

It must never automatically become an explicit catalog preference.

```text
quiz evidence
    ↓
canonical Signal profile
    ↓
derived catalog inference

NOT

quiz evidence ─► Love / Like / Hard Limit
```

Explicit catalog preference remains direct user-authored state.

Likewise, inferred catalog affinity must not feed back into the quiz Signals that created it.

## Quizzes and composed taxonomy

Roles/headspaces, Dynamic Modes, and Overall Facets are downstream compositions of canonical Signal evidence.

They do not write back into quiz answers or become a new independent quiz source.

The direction is:

```text
answers
  ↓
quiz Signal evidence
  ↓
canonical Signal + channel
  ↓
derived roles / modes / facets
```

not a cycle.

## Versioning and compatibility

Each quiz definition has a version stored with its progress.

Version changes should be deliberate when a modification changes the interpretation of persisted answers, such as:

- removing/reassigning stable question IDs;
- materially changing what a prompt measures;
- materially changing the source Signal-weight interpretation;
- changing the composed taxonomy in a way that makes previously derived results non-equivalent.

Derived results can be recalculated from stored answers against current supported definitions where compatibility is intentional.

The current Roles & Headspaces quiz is version 5 because its derived taxonomy/composition changed while retaining compatible stored answer identity.

## Reset and backup lifecycle

Quiz progress is an authoritative profile source and participates in profile management:

- individual quiz sections can be selectively reset;
- private profile backup includes all stored quiz progress;
- profile restore validates known Quiz IDs and stored quiz versions/answers before replacement;
- resetting/importing quiz state causes derived profile views to recompute.

See [Profile Management](profile-management.md).

## Invariants

Future changes should preserve these boundaries unless the product deliberately changes them:

1. **Quiz answers are direct source evidence; derived roles/modes/facets are not additional direct sources.**
2. **Missing answers reduce coverage rather than behaving like explicit zero-interest answers.**
3. **Each Quiz ID owns one current progress/evidence source.**
4. **Section-local answers do not mutate other quiz sections.**
5. **Legacy source Signal IDs normalize before canonical profile aggregation.**
6. **Receiving/Giving evidence does not imply submissive/Dominant authority.**
7. **D/s is not one forced role slider.**
8. **B&D discipline is not automatically pain.**
9. **S/M pain is not automatically discipline or all intense sensation.**
10. **Specific-item preference belongs to the catalog rather than being duplicated as quiz inventory.**
11. **Quiz-derived catalog affinity never becomes explicit catalog preference.**
12. **Current question banks live in code rather than duplicated prose documents.**

## Primary implementation references

- `src/data/quizzes.ts`
- `src/data/quizScale.ts`
- `src/data/dsQuiz.ts`
- `src/data/headspacesQuiz.ts`
- `src/data/bondageDisciplineQuiz.ts`
- `src/data/sadismMasochismQuiz.ts`
- `src/lib/scoring.ts`
- `src/lib/profileStorage.ts`
- `src/lib/normalizedProfileSignals.ts`

The code and focused tests remain authoritative when implementation and documentation disagree.
