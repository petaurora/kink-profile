# Overall Profile Aggregation & Front-Page Results

## Status

**Active implementation contract for M7 — Full Overall Profile.**

M6 is complete. M7 now consumes the source-aware evidence, ranking, catalog-result, and recommendation boundaries implemented in M6 rather than inventing another catalog/profile model.

This document defines what the front-page "overall" result should represent and, more importantly, what it should **not** flatten together.

The core problem is not drawing one more radar chart.

The core problem is deciding which cross-cutting concepts are stable and meaningful enough to summarize evidence from multiple quizzes without turning:

- D/s
- Bondage & Discipline
- S/M
- Roles & Headspaces
- catalog preferences

into one misleading pile of percentages.

---

# Product goal

The front page should answer, at a glance:

> "What are the strongest themes in my overall profile?"

It should then make it easy to drill back into:

- the specific quiz/source that produced the evidence
- recognizable roles/headspaces
- strongest dynamic modes
- favorite catalog interests
- incomplete or unknown areas

The overall result should feel like a **profile summary**, not a fifth independent quiz.

---

# Profile presentation UI boundary

M7 has two related but distinct product surfaces:

1. **Home/dashboard status** — answers "how far have I explored?"
2. **Aggregated profile presentation** — answers "what does my profile say about me?"

Progress-oriented information belongs primarily on the **home/dashboard** surface:

- quizzes completed
- catalog items explored
- This-or-That categories ranked
- overall profile progress / evidence-building status
- prompts to continue unfinished areas

The aggregated profile itself is an **information-display surface** that should make sense when shown to another person. It should prioritize the user's resulting profile over the mechanics used to build it.

Evidence coverage/confidence may still appear when needed to qualify a result or in drill-down/explainability UI, but should not dominate the profile header.

## Profile header — agreed direction

The M7 profile header should use a **hybrid summary**:

1. a short human-readable interpretation of the strongest overall profile themes
2. compact structured trait groups that anchor that interpretation in actual profile results

Conceptual shape:

```text
YOUR KINK PROFILE

Strongly receiving-oriented, with a profile centered around
surrender, devotion, primal play, and emotionally connected
power exchange.

Orientation
Receiving / submissive

Headspaces
Pet · Prey · Devotional Submissive

Dynamic modes
Surrender · Devotion · Primal
```

The exact labels and values above are illustrative, not locked output.

### Header responsibilities

The header should answer:

> "What are the biggest things about this person's profile?"

It should **not** answer:

> "How much of the app have they completed?"

The header should therefore:

- favor a concise human-readable summary over a wall of percentages
- expose a small number of structured headline traits underneath
- keep receiving/giving direction visible when it materially shapes the profile
- avoid declaring a single identity such as "You are a Pet"
- avoid making one percentage the defining result
- avoid quiz/catalog/ranking completion statistics
- avoid detailed source provenance or confidence mechanics unless the user drills deeper

### Initial compact trait groups

The current preferred three groups are:

- **Orientation** — broad receiving/submissive, giving/dominant, bidirectional, or mixed/context-dependent tendency
- **Headspaces** — strongest recognizable role/headspace results, with direction preserved
- **Dynamic modes** — strongest explanatory patterns such as Surrender, Devotion, Claiming, or Primal / Feral

These groups are a current UI direction and can be refined as M7 aggregation is implemented.

---

# Important distinction: facets vs labels

The overall radar should measure broad **profile facets / drivers**.

It should **not** use specific role names, kink names, or quiz names as radar axes.

Bad radar axes:

- Dominance & Submission
- Bondage
- Pet
- Slave
- Rope
- Sadism

Those values do not represent the same kind of thing and are not directly comparable.

Instead, role/headspace results and kink preferences should map into broader themes where appropriate.

Example:

```text
Pet
├─ ownership / belonging
├─ care / nurture
├─ role embodiment
└─ playfulness

Rope Bondage
├─ restraint / physical control
├─ positioning
└─ ritual / structure
```

The radar represents the broader drivers.

The recognizable labels remain visible elsewhere in the overall result.

---

# Overall facet vocabulary — locked in M7.2

M7.2 locks **nine distinct broad facets**. The model deliberately keeps all nine instead of merging unrelated concepts merely to hit a visualization count.

Facet composition consumes **canonical primitive `SignalId` values only**. Composed roles/headspaces/dynamic modes are presentation results and never feed back into facet scoring.

Affinity and coverage remain separate:

- **affinity** is calculated only from known canonical evidence
- **coverage** is reduced when configured component signals are missing or weakly evidenced
- an unexplored component never enters the affinity calculation as 0%
- a genuinely known 0% affinity remains distinguishable from unexplored evidence
- component contribution uses both the configured semantic weight and canonical signal coverage
- source evidence IDs remain traceable through facet components

The exact runtime contract lives in `src/data/overallFacets.ts`.

## 1. Power Exchange

Represents meaningful surrender, exercise, or transfer of negotiated authority and responsibility.

| SignalId | Weight | Direction |
| --- | ---: | --- |
| `receiving_control` | 1.00 | receiving |
| `giving_control` | 1.00 | giving |
| `responsibility_transfer` | 0.90 | receiving |
| `responsibility_holding` | 0.80 | giving |
| `obedience` | 0.65 | receiving |

Direction metadata preserves independent receiving and giving affinity/coverage. The facet is **not** a dominant/submissive slider.

---

## 2. Structure & Protocol

Represents rules, ritual, accountability, discipline, and deliberate frameworks around a dynamic.

| SignalId | Weight |
| --- | ---: |
| `structure` | 1.00 |
| `ritual_significance` | 0.80 |
| `accountability` | 0.75 |
| `guidance_shaping` | 0.55 |
| `receiving_discipline` | 0.70 |
| `giving_discipline` | 0.70 |

This remains distinct from raw power exchange.

---

## 3. Ownership & Belonging

Represents symbolic possession, claiming, belonging, and consensual property-oriented meaning.

| SignalId | Weight |
| --- | ---: |
| `ownership_symbolism` | 1.00 |
| `belonging` | 0.90 |
| `objectification` | 0.45 |

This remains distinct from ordinary affection or commitment.

---

## 4. Service & Devotion

Represents fulfillment through serving, pleasing, dedication, loyalty, and relationship-centered devotion.

| SignalId | Weight |
| --- | ---: |
| `service` | 1.00 |
| `devotion` | 1.00 |
| `obedience` | 0.50 |
| `ritual_significance` | 0.35 |
| `praise_approval` | 0.30 |

This does not act as a generic proxy for submission.

---

## 5. Care & Nurture

Represents receiving or providing care, soothing, guidance, protection, and nurtured relational energy.

| SignalId | Weight | Direction |
| --- | ---: | --- |
| `care_receiving` | 1.00 | receiving |
| `care_giving` | 1.00 | giving |
| `guidance_shaping` | 0.55 | giving |
| `responsibility_holding` | 0.45 | giving |
| `praise_approval` | 0.30 | shared |

Direction metadata preserves receiving-care and giving-care evidence independently.

---

## 6. Play & Resistance

Represents playfulness, teasing, mischief, negotiated resistance, and consensual push-pull.

| SignalId | Weight |
| --- | ---: |
| `playfulness` | 1.00 |
| `playful_resistance` | 1.00 |
| `challenge_escape` | 0.60 |
| `autonomy` | 0.30 |

This is intentionally separate from adversarial or non-consensual framing.

---

## 7. Primal & Instinctive

Represents feral, pursuit, chase, predator/prey, embodied, and less-structured instinctive energy.

| SignalId | Weight | Direction |
| --- | ---: | --- |
| `primal_embodiment` | 1.00 | shared |
| `pursuit_receiving` | 0.85 | receiving |
| `pursuit_giving` | 0.85 | giving |

Direction metadata preserves being-pursued/prey-like and pursuit/predator-like evidence independently.

---

## 8. Restraint & Physical Control

Represents physical restriction, body positioning, movement control, and constraint-oriented play.

| SignalId | Weight | Direction |
| --- | ---: | --- |
| `receiving_restraint` | 1.00 | receiving |
| `giving_restraint` | 1.00 | giving |
| `movement_restriction` | 0.90 | shared |
| `receiving_positioning` | 0.70 | receiving |
| `giving_positioning` | 0.70 | giving |
| `receiving_constraint_control` | 0.80 | receiving |
| `giving_constraint_control` | 0.80 | giving |

This remains distinct from protocol, pain, ownership, and general D/s.

---

## 9. Intensity & Pain

Represents physical or emotional intensity, pain, endurance, and consensual challenge at an agreed edge.

| SignalId | Weight | Direction |
| --- | ---: | --- |
| `pain_receiving` | 1.00 | receiving |
| `pain_giving` | 1.00 | giving |
| `receiving_intensity` | 0.90 | receiving |
| `giving_intensity` | 0.90 | giving |
| `receiving_endurance` | 0.65 | receiving |
| `giving_endurance` | 0.65 | giving |
| `receiving_challenge` | 0.65 | receiving |
| `giving_challenge` | 0.65 | giving |
| `emotional_intensity` | 0.55 | shared |

A high overall score does not assign a Sadist, Masochist, or switch identity. Direction metadata preserves receiving and giving independently.

---

## Sensation & Sensory Play — parked

Do **not** add Sensation & Sensory Play as a tenth facet yet.

The catalog contains sensory items, but the current canonical signal vocabulary does not provide enough independent primitive evidence to score a broad sensory facet without inventing a second inference system. It can be reconsidered when dedicated signals/evidence exist.

---

# Possible final radar size

The **facet model contains 9 facets**.

M7.4 should test the real mobile rendering before deciding whether the first radar shows all nine simultaneously. Prefer roughly 7–8 simultaneous axes when practical, but do not merge distinct facets merely to satisfy that number. If nine is visually crowded, one facet can remain available in supporting/detail presentation while still existing in the underlying model.

This vocabulary is intentionally broader than section-level radars and represents the overall profile shape rather than reproducing every underlying signal.

## Overall radar — agreed presentation direction

The overall radar should appear immediately beneath the profile header as the primary visual summary of the aggregated profile.

Conceptual presentation:

```text
OVERALL PROFILE

        [ large overall radar ]

Power Exchange · Ownership · Devotion
        strongest overall themes
```

The radar itself should remain visually dominant and relatively clean. The compact text beneath it should surface only a few strongest overall themes rather than repeat every axis as a ranked list.

The profile header answers:

> "What are the biggest things about this person's profile?"

The radar answers:

> "What is the overall shape of those preferences?"

Detailed evidence, source provenance, confidence, direction, and lower-level signals belong in later sections or drill-down.

## Parked future enhancement — orientation gauge

A future profile presentation may include a playful **orientation gauge** summarizing the relative balance between giving/dominant and receiving/submissive expression.

Conceptually:

```text
Dominant / Giving  ────────●────────  Submissive / Receiving
                         Switch
```

This should not be implemented until the profile has robust cross-source directional support.

Important semantic constraint:

> The gauge represents **relative orientation/balance**, not total affinity and not a zero-sum model.

A user may have strong evidence for both giving and receiving. The pointer should therefore answer something closer to:

> "Which direction does this profile lean overall?"

It must not imply that stronger submissive/receiving evidence means weaker dominant/giving capability or interest.

If implemented, pair the gauge with enough supporting context to distinguish:

- overall directional lean
- strength of giving evidence
- strength of receiving evidence
- genuinely bidirectional/switch profiles
- low-evidence/uncertain orientation

This belongs with the broader future giving/receiving visualization work rather than the initial M7 UI.

---

## Parked future enhancement — directional radar modes

The initial aggregated radar should use the **overall** facet values only. M7 should not prematurely split every facet into receiving/giving variants before the underlying directional aggregation model has full support.

However, preserve direction metadata now so a future enhancement can offer multiple radar modes over the same facet vocabulary:

```text
[ Overall ] [ Receiving ] [ Giving ]

            same radar axes
            different directional series
```

A later implementation may support:

- **Overall** — combined profile strength for each facet
- **Receiving** — receiving/submissive-side expression where that facet has directional evidence
- **Giving** — giving/dominant-side expression where that facet has directional evidence
- optionally overlaying multiple series/lines for comparison when readable

This should be treated as a deliberate follow-up to broader giving/receiving support, not approximated by making receiving and giving cancel each other out.

Facets without meaningful directional semantics should remain neutral/shared rather than inventing receiving/giving values.

---

# What should appear around the radar

The radar should be one part of the overall result, not the whole thing.

A useful front-page summary could contain:

## Overall profile radar

Broad cross-cutting facets.

## Strongest roles / headspaces

For the initial M7 profile presentation, prioritize the **receiving / submissive headspaces** that are already well-supported by the current implementation.

Example:

```text
Receiving / submissive

Pet                    94%
Prey                   87%
Devotional Submissive  81%
```

The profile should surface only a compact top set (for example, top 3) by default **with their percentages visible**, plus an in-place **Show all headspaces** action that expands to the full ranked receiving/submissive headspace list.

Conceptual shape:

```text
ROLES & HEADSPACES

Pet                    94%
Prey                   87%
Devotional Submissive  81%

[ Show all headspaces ]
```

Expanded:

```text
ROLES & HEADSPACES

Pet                    94%
Prey                   87%
Devotional Submissive  81%
Service Submissive     74%
Little                  62%
Brat                    55%
...

[ Show less ]
```

The percentages are useful context because they show relative strength, but the default view should remain compact rather than rendering the full ranked list immediately.

Do **not** present a parallel giving/dominant headspace block in the initial M7 UI merely for symmetry. The giving/dominant presentation should be revisited as part of the broader future directional-profile work, once cross-source giving/receiving aggregation is mature enough to support it consistently.

When that future support exists, receiving and giving headspaces should remain separate rather than being merged into one winner-take-all list.

## Strongest dynamic modes

Example:

```text
Claiming
Surrender
Nurtured Play
Primal / Feral
```

These help explain the radar and role results.

## Top overall catalog interests + limits

Before drilling into category-level detail, the profile should surface the user's most concrete overall catalog results.

### Top overall

Show the current **Top 10 direct-evidence catalog items**, derived from both:

- explicit assigned catalog preference
- Overall This-or-That / pairwise ranking evidence

This is a profile-level aggregate, not a copy of the raw Overall This-or-That leaderboard.

Conceptual shape:

```text
TOP OVERALL

1. Rope Bondage
2. Collaring
3. Pet Play
4. Praise
5. Impact Play
6. ...
10. ...
```

This aggregate should use **independent direct user evidence only**. Quiz-derived/inferred catalog affinity must not place an item into Top Overall by itself.

M7.6 now locks the presentation merge rule: Love / Like / Curious provide positive explicit ordering evidence, active Overall This-or-That rank provides independent relative ordering evidence, and the two are combined only in a derived presentation score. The original explicit state and actual Overall rank remain visible and unchanged. See **M7.6 — Top Overall catalog interests** below for the exact scoring and tie contract.

Importantly, this does **not** change the M6 rule that explicit positive states do not seed or mutate the pairwise ranking engine. M7 may derive a separate presentation-level Top Overall result from both sources without writing one source into the other.

If fewer than 10 items have enough direct evidence to support a meaningful aggregate placement, show fewer rather than padding the list with inferred/default ordering.

### Limits

Show explicit **Hard Limit** items as a separate adjacent/paired summary.

Conceptual shape:

```text
LIMITS

Breath Restriction
Needle Play
...
```

Hard Limits must remain visually and semantically distinct from:

- Not Interested
- Not Applicable
- low-ranked items

The profile should not imply that a low-ranked item is a limit, or that a limit is merely a low preference.

If the limit list is long, show a compact subset with a **Show all limits** action.

This concrete Top Overall + Limits section should appear **before category-level catalog detail** so the profile moves from broad interpretation into the clearest direct preferences first.

## Interest Areas

The main aggregated profile should **not** render all 35 catalog categories as equal-detail cards.

Instead, show a compact **Interest Areas** section containing only the top approximately **4–6 strongest/relevant categories**.

Conceptual shape:

```text
INTEREST AREAS

Bondage & Restraint
Rope Bondage · Cuffs · Immobilization

Protocol, Obedience & Service
Service · Ritual · Rules

Primal Play
Prey Play · Chase · Wrestling

Pain & Sensation
Biting · Scratching · Impact Play

[ Explore all categories ]
```

Each summary should remain intentionally light:

- category label
- simple strength/relevance descriptor when useful
- top 2–3 concrete catalog items that make the category meaningful
- no dense Love / Like / Curious / Limit count row on the main profile
- no requirement to show all categories inline

The profile should order these by strongest/relevant category evidence, but should not imply false precision by ranking all 35 categories from #1 to #35 unless the aggregation model can support that meaningfully.

### Explore all categories

**Explore all categories** should open a separate category explorer/detail experience rather than expanding all 35 categories directly into the profile page.

That deeper experience may:

- group categories by broader domain
- allow opening one category at a time
- show richer within-category ranking/preferences
- show explicit states such as Love / Like / Curious / Limits
- link to the full editable catalog where appropriate

This preserves the main profile as a readable presentation surface while still making the catalog detail accessible when someone wants it.

### State-filter shortcuts

Do not create a separate ranked **Curious / Exploring** section on the main profile.

`Curious` is an explicit categorical preference state, not an inherently ordered result. Unless independent ranking evidence exists, the product should not invent a "Top Curious" ordering.

Instead, provide compact navigation shortcuts into the existing catalog/list filtered by explicit state where useful.

Conceptually:

```text
[ Curious (12) ]   [ Unsure (8) ]   [ Limits (3) ]
```

Selecting one should open the catalog/preferences experience with the corresponding state filter already applied.

These shortcuts may live near **Interest Areas**, **Top Overall + Limits**, or in a small supporting action row, whichever fits the final visual layout best.

Hard Limits may still have their own visible summary on the profile because they are important boundaries. The filtered shortcut is an additional way to inspect the full list.

---

## Strongest reusable signals

Optional compact view for users who want more detail.

Example:

```text
Receiving Control — 94%
Ownership Symbolism — 92%
Structure — 89%
Care Receiving — 87%
```

## Coverage / exploration state

Detailed exploration/completion status belongs primarily on the home/dashboard rather than in the profile header.

The aggregated profile still needs to distinguish well-supported results from sparse or unexplored areas so unknown never becomes 0%, but that qualification should be secondary to the profile presentation itself and may live in result-level treatment, drill-down, or a lower-page evidence section rather than a dashboard-style header.

When shown on the profile surface, coverage should communicate what is known vs unexplored without turning the page into a task-completion view.

Example:

```text
Profile coverage

D/s                  Complete
Roles & Headspaces   Complete
Bondage & Discipline In progress
S/M                  Not started
Catalog ranking      3 categories ranked
```

Unknown areas must remain unknown, not silently become 0%.

---

# Aggregation architecture

The overall profile should be derived from **source-aware independent evidence**.

See [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md) for the full evidence graph and no-feedback-loop rules.

Conceptually:

```text
quiz evidence ───────────────┐
                             │
explicit catalog evidence ───┼──► canonical SignalId profile
                             │
pairwise catalog evidence ───┘
                                      │
                                      ├──► section/profile radars
                                      ├──► overall facets
                                      ├──► roles/headspaces
                                      └──► inferred catalog affinity
```

Catalog affinity inferred from those signals is a **derived output** and is not allowed to re-enter the canonical signal profile.

Section-local quiz results remain available as their original source views.

M7 creates the separate cross-source aggregation layer used by the evolving overall profile.

---

# Canonical signal aggregation

M2–M5 already reuse some signal IDs while scoring independently, and direct catalog evidence can add additional independent observations after C4.

M7 should not simply concatenate all source scores.

Instead, each contribution should retain:

- signal ID
- source type
- source ID
- source/scoring version where relevant
- score/direction
- coverage/evidence strength
- enough provenance to deduplicate, replace, and explain the contribution

Conceptual shape:

```ts
type SignalEvidence = {
  signalId: SignalId;
  sourceType: "quiz" | "explicit_catalog" | "pairwise_catalog";
  sourceId: string;
  sourceVersion?: number;
  score: number;
  coverage: number;
};
```

A quiz retake supersedes/replaces only that quiz source's contribution. It must not erase independent explicit/pairwise catalog evidence.

Then M7 can derive a canonical user-level signal.

Example:

```text
structure

M2 D/s evidence        88% / high coverage
M3 Headspace evidence  81% / medium coverage
M4 B&D evidence        93% / high coverage

            ↓

canonical structure signal
```

The exact merge rule should be defined and tested before implementation.

---

# Avoid double-counting reused signals

This is one of the most important constraints.

If:

- M2 measures `structure`
- M3 also measures `structure`
- M4 measures `structure`

then a facet using `structure` should consume **one canonical structure estimate**, not count the same semantic concept three separate times merely because three quizzes touched it.

Otherwise completing more quizzes can artificially inflate a facet.

Recommended conceptual pipeline:

```text
multiple source measurements
        ↓
merge same semantic SignalId
        ↓
canonical signal score + coverage
        ↓
facet composition
```

Coverage can improve as independent sources contribute evidence.

The score should not automatically rise just because more sources exist.

---

# Facet composition

Overall facets should be data-driven weighted compositions, similar to dynamic modes/headspaces.

Conceptual example:

```ts
ownershipBelonging = weightedAverage({
  ownershipSymbolism: 1.0,
  belonging: 0.9,
  claiming: 0.8,
  objectification: 0.25
});
```

The exact weights are not locked by this document.

Rules:

1. compositions live in config/data, not rendering components
2. missing signals reduce coverage rather than count as zero
3. overlapping facets are allowed
4. facet scores do not need to sum to 100%
5. high scores can coexist across many facets
6. direction-sensitive evidence must retain direction metadata outside the scalar radar score

---

# Overall coverage

Every overall facet needs both:

- score
- coverage

Example:

```ts
{
  facetId: "restraintPhysicalControl",
  score: 0.91,
  coverage: 0.32
}
```

That means:

> known evidence strongly points toward restraint interest, but the profile has not explored enough relevant material to call the result highly established.

The front page may hide raw numeric coverage while still communicating:

- emerging
- moderate evidence
- well established
- unexplored

The important rule is that sparse evidence must not visually look identical to highly supported evidence.

---

# Catalog evidence and circularity

The catalog creates a special aggregation problem because it contains both **independent direct evidence** and **derived inference**.

There are three user evidence channels to keep distinct:

## Inferred catalog affinity

Example:

> "Your signal profile suggests rope bondage may interest you."

This is derived **from the profile itself**.

It must **not** be fed back into the overall radar or canonical signals.

Doing so would create circular evidence:

```text
signals
  ↓
infer Rope interest
  ↓
Rope boosts restraint
  ↓
restraint gets stronger because it predicted Rope
```

That is invalid double-counting.

## Explicit catalog preference

Example:

> user explicitly marks Rope Bondage as Love

This is new independent user evidence.

Once C4 defines the Catalog ID → SignalId projection contract, M7 may incorporate that direct evidence into canonical signals/radars while preserving:

- source identity
- direction
- mapping weights
- coverage/evidence strength
- explicit exclusion semantics

## Pairwise ranking evidence

Example:

> user repeatedly prefers Rope Bondage over other eligible items

This is also independent evidence, but it is **relative** rather than an explicit state.

M7 may incorporate ranking-derived signal evidence only through a deliberate coverage/confidence-aware projection. Skip and Neither must not manufacture confidence.

The critical rule is not "catalog never affects radars."

The critical rule is:

> **Only independent catalog evidence may affect signals. Catalog affinity inferred from those signals may not.**

The exact cross-source weighting remains an M7 implementation decision and must be deterministic/tested.

---

# Pairwise ranking relationship

The M6 this-or-that system answers:

> "Which specific things do I prefer most?"

M7 facets answer:

> "What broad themes characterize my profile?"

These are complementary.

Example:

```text
Overall facets
Ownership & Belonging     94%
Power Exchange            91%
Care & Nurture            88%
Restraint & Physical      84%

Favorite kinks
1. Pet Play
2. Collaring
3. Rope Bondage
4. Praise
5. Ownership
```

The favorite list makes the abstract radar concrete.

The radar makes the giant favorite list interpretable.

---

# Front-page behavior with incomplete sections

The overall page should exist before every quiz is complete.

It should progressively fill in.

Example:

```text
Power Exchange       91%   well established
Ownership            88%   moderate evidence
Restraint            —     not explored
Intensity & Pain     —     not explored
```

Do not:

- render missing axes as 0%
- imply lack of interest
- require completion of every section before showing an overall profile

If the radar library cannot gracefully represent unknown axes, the UI should explicitly solve that rather than converting unknown to zero.

Possible approaches:

- dashed/ghost axis markers
- coverage overlay
- partial radar plus unknown labels
- only render axes above a minimum coverage, with an adjacent "not explored" list

The visualization choice can be decided during M7 implementation.

---

# Front-page hierarchy

Current agreed conceptual order:

1. **Profile header** — hybrid human-readable summary + compact Orientation / Headspaces / Dynamic Modes
2. **Overall Profile** — large broad-facet radar + compact strongest overall themes
3. **Roles & Headspaces** — top receiving/submissive results with percentages + Show all
4. **Top Overall + Limits** — Top 10 aggregated direct catalog preferences (explicit + pairwise) + explicit Hard Limits
5. **Interest Areas** — top 4–6 strongest/relevant catalog categories with a few representative items
6. **Explore all categories** — separate deeper category explorer/detail experience
7. later supporting/detail sections as needed

Conceptual layout:

```text
┌──────────────────────────────────────────┐
│ YOUR PROFILE                             │
│                                          │
│          [ overall radar ]               │
│                                          │
│ strongest themes + coverage              │
└──────────────────────────────────────────┘

┌──────────────────┐  ┌───────────────────┐
│ Top Headspaces   │  │ Dynamic Modes     │
│ receiving/giving │  │ explanatory       │
└──────────────────┘  └───────────────────┘

┌──────────────────────────────────────────┐
│ Favorite Kinks                           │
│ explicit / pairwise-ranked catalog data  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Explore More                             │
│ incomplete quizzes / low-coverage areas  │
└──────────────────────────────────────────┘
```

The exact visual design is future work.

The information hierarchy is the important part.

---

# What M7 should not do

Do not:

- average quiz percentages together
- make quiz names radar axes
- treat Headspace affinity and activity preference as the same data type
- make receiving and giving directions cancel each other out
- normalize overall facets to sum to 100%
- treat missing sections as zero
- feed inferred catalog affinity back into the evidence that produced it
- silently overwrite section-local results with cross-quiz aggregation
- make one overall label such as "85% submissive" the primary product result

The overall profile should preserve complexity while making it easier to understand.

---

# M7 implementation slices

M7 should be implemented as a sequence of **small, independently testable and mergeable slices**. Each slice should be completed, validated with representative data, and merged before beginning the next one.

The former O1–O6 grouping is preserved as a conceptual map:

- **O1 → M7.1**
- **O2 → M7.2**
- **O3 → M7.3–M7.4**
- **O4 → M7.5**
- **O5 → M7.6–M7.9**
- **O6 → M7.10–M7.11**

The implementation sequence intentionally separates data math from presentation:

```text
raw source evidence
        ↓
canonical signals
        ↓
overall facets
        ↓
profile presentation
        ↓
catalog summaries + drill-down
        ↓
explainability / polish
```

## M7.1 — Canonical cross-source aggregation + inspection

This is the first implementation slice and must be trustworthy before any new profile presentation is built.

### Scope

- consume the source-aware evidence/projection contracts implemented through M6 C4–C7
- merge repeated SignalIds across completed quizzes and independent direct catalog evidence
- define deterministic source weighting/deduplication/replacement semantics
- preserve canonical signal score separately from coverage/evidence strength
- preserve source traceability for every canonical SignalId
- ensure quiz retakes replace only the affected quiz contribution
- ensure direct explicit/pairwise catalog evidence survives quiz retakes
- explicitly exclude inferred catalog affinity and resolved catalog views from signal input
- test against semantic double-counting and feedback loops
- add a temporary/dev inspection surface for canonical signals

### Inspection surface

M7.1 should expose enough detail to validate the math with real data before M7.2 consumes it.

Conceptual shape:

```text
receiving_control
  aggregate: 82%
  coverage: 0.76

  sources:
    D/s quiz ............. 88%
    Roles quiz ........... 79%
    explicit catalog ..... 72%
```

The exact visual styling is not important. The important part is being able to inspect:

- canonical SignalId
- aggregate score
- aggregate coverage/evidence strength
- contributing source type/id
- each source score/coverage where meaningful
- which quiz version/source contribution would be superseded by a retake

### Test gate

Before moving to M7.2:

1. change explicit catalog state and verify only that source contribution changes
2. add/continue This-or-That evidence and verify ranking evidence contributes independently
3. retake a quiz and verify only that quiz contribution is replaced
4. verify inferred affinity never feeds back into the canonical signal
5. verify repeated SignalIds improve evidence/coverage without automatically inflating affinity

**Exit condition:** canonical SignalIds can be inspected and trusted independently of the final profile UI.

## M7.2 — Overall facet model

### Scope

- define final facet IDs/vocabulary
- lock composition weights in config/data rather than rendering code
- calculate facet score + coverage
- calculate/preserve direction metadata where relevant
- preserve missing evidence as unknown rather than zero
- add deterministic composition tests

### Test gate

Seed intentionally different canonical-signal combinations and verify:

- facet affinity changes for the right reasons
- additional evidence can increase coverage without forcing affinity upward
- direction metadata remains available
- missing inputs reduce coverage rather than act as 0%

**Exit condition:** broad profile facets are stable enough to present independently of UI code.

## M7.3 — Profile header ✅

M7.3 implements the hybrid profile header as a **pure derived model + presentation surface**.

Runtime model:

`src/lib/profileHeader.ts`

### Implemented header output

The header now contains:

- a concise human-readable interpretation of the strongest overall themes
- **Orientation**
- up to 3 strongest recognizable **Headspaces**
- up to 3 strongest **Dynamic Modes**

The compact header intentionally omits percentages. Detailed percentages remain in lower-level profile/result views and are owned more explicitly by M7.5.

### Orientation semantics

Orientation is derived from the **Power Exchange facet's directional evidence**, not from every directional M7.2 facet and not from a zero-sum receiving-vs-giving slider.

This boundary is intentional:

- enjoying **giving pain** does not by itself mean Dominant
- enjoying **giving restraint** does not by itself mean Dominant
- enjoying **providing care** does not by itself mean Dominant
- predator/prey or other directional activity preferences do not automatically define D/s orientation

Those directional signals remain meaningful inside their own facets and explainability views, but they do not vote on the Dominant/Submissive label.

Possible compact user-facing results:

- **Submissive**
- **Dominant**
- **Dominant + submissive**
- **Context-dependent**
- **Still emerging**

The internal evidence model still uses receiving/giving direction keys because they are useful, neutral plumbing across different facet types. Those terms should not leak into normal profile copy.

Strong Power Exchange evidence on both sides can coexist. When both are meaningfully supported, the header says **Dominant + submissive** rather than assigning a "switch" identity.

**Context-dependent** is reserved for ambiguous/mixed Power Exchange evidence rather than disagreement between unrelated activity facets.

### User-facing terminology boundary

For M7 presentation:

- keep `receiving` / `giving` as internal model vocabulary where useful
- prefer **submissive** / **dominant** in the profile header when describing orientation
- do not add receiving/giving badges to Headspace chips
- do not write prose such as "giving and receiving shift..."
- temporary debug/inspection surfaces may still expose internal SignalIds, but normal presentation should describe the person's profile rather than the aggregation plumbing

### Headline-theme semantics

Headline theme selection considers both:

- facet affinity
- facet evidence coverage

A nearly unexplored 100% facet therefore does not automatically become the defining sentence ahead of a well-evidenced strong facet.

Low-evidence themes are allowed to remain absent/emerging rather than being overclaimed.

### Headspaces + Dynamic Modes

Compact Headspaces and Dynamic Modes are composed from **canonical primitive SignalIds** using the existing role/mode definitions.

They do not feed back into:

- canonical signals
- overall facets
- catalog inference

Low-coverage composed labels are suppressed from the compact header.

Headspace direction is retained so receiving-side and giving-side role/headspace results remain distinguishable.

### Presentation boundary

The top profile header no longer displays quiz/catalog/ranking completion mechanics.

Those mechanics remain status/dashboard concerns. M7.3 answers:

> "What are the biggest things about this profile?"

rather than:

> "How much of the app has been completed?"

### Test gate ✅

Deterministic coverage includes:

- insufficient evidence
- receiving-oriented
- giving-oriented
- bidirectional
- mixed/context-dependent
- low-coverage headline suppression
- coverage-aware strongest-theme selection
- recognizable headspace composition + direction
- dynamic-mode composition
- no percentage leakage into the headline summary

**Exit condition:** the header provides a useful standalone summary from real aggregated data. ✅

## M7.4 — Overall radar ✅

M7.4 renders the locked M7.2 facet model as the primary visualization immediately beneath the profile header.

### Axis set

The initial radar renders **all nine locked facets** using their compact short labels:

- Power
- Structure
- Ownership
- Service
- Care
- Play
- Primal
- Restraint
- Intensity

No facet is merged or silently omitted for visualization convenience.

The model remains the source of truth; if later visual polish finds nine axes too crowded in a specific export/layout, presentation can change without changing the facet vocabulary.

### Unknown and limited evidence

Radar state distinguishes three cases:

- **known** — normal plotted affinity
- **limited** — affinity exists, but evidence coverage is still sparse
- **unknown** — no usable evidence; the axis stays unscored

Unknown axes are **never plotted as 0%**.

For incomplete profiles, the chart does not draw a closed polygon across unexplored axes. Instead it renders only contiguous runs of known values, leaving genuine gaps where evidence is absent.

A known 0% result remains a real plotted value at the center and is therefore distinct from unknown.

Limited-evidence results use an outlined point so sparse evidence remains visually qualified without suppressing the result.

### Strongest themes

The compact summary beneath the radar reuses the coverage-aware strongest-facet ordering already selected by M7.3.

This avoids maintaining a second competing definition of "strongest theme."

### Drill-down

Each radar axis and strongest-theme chip is interactive.

Selecting one:

1. opens the corresponding M7.2 facet detail row
2. scrolls directly to that facet
3. preserves the existing component/source inspection path underneath

This is a lightweight M7.4 hook into explainability rather than a new duplicate facet-details UI.

### Direction boundary

The initial radar plots **overall facet affinity only**.

Directional capability remains preserved in M7.2 facet metadata for future dominant/submissive radar modes, but M7.4 does not split the radar into competing directional series.

### Test gate ✅

Deterministic tests cover:

- unknown axis remains `null`, not 0
- known low-coverage result becomes limited
- known true 0% remains plotted
- full nine-axis shape
- partial profile with one missing axis
- separated sparse evidence regions
- strongest-theme ordering
- directional capability metadata preservation

**Exit condition:** the radar accurately visualizes the M7.2 facet model across incomplete and complete profile states. ✅

## M7.5 — Headspaces + Dynamic Modes ✅

M7.5 adds the dedicated recognizable-role layer beneath the broad M7.2/M7.4 facet model.

### Headspaces

The main profile now shows ranked **submissive-oriented Headspaces** using the existing composed role definitions.

Presentation rules:

- show the top 5 by affinity in the compact view
- expose the full known ranked list in-place with **Show all / Show less**
- display the actual affinity percentage for each row
- preserve overlapping results independently; there is no winner-takes-all identity
- suppress composed results with less than 20% evidence coverage
- keep 20–39.9% coverage visible but mark it **Limited evidence so far**
- sort by affinity first, then coverage as the deterministic tie-breaker

The dedicated profile section uses **submissive** language in the UI. The underlying implementation may still reference historical receiving-side IDs internally, but that vocabulary does not appear in normal presentation.

Dominant-oriented Headspace presentation remains parked for the broader future directional-profile enhancement. This slice does not infer that a missing dominant list means absence of dominant interests.

### Dynamic Modes

The profile also shows the top 5 known Dynamic Modes.

Dynamic Modes:

- use the same canonical SignalId evidence underneath M7
- remain independently overlapping
- display affinity percentages
- use the same 20% minimum display coverage
- mark 20–39.9% coverage as limited evidence
- do not replace Headspaces or broad overall facets

The compact mode section intentionally shows only the strongest five rather than adding another long expansion surface.

### Composition boundary

M7.5 is derived from canonical signals and does not write anything back into:

- canonical signals
- facet scores
- catalog preference state
- quiz answers
- This-or-That history

Headspaces and modes are descriptive derived views only.

### Test gate ✅

Deterministic tests cover:

- multiple overlapping Headspaces remaining independently scored
- affinity ordering
- coverage tie behavior
- sparse 100% evidence suppression
- limited-evidence qualification
- compact top-5 vs full Headspace list
- overlapping Dynamic Modes
- compact top-5 mode selection

**Exit condition:** recognizable Headspaces and Dynamic Modes add useful detail without replacing the broad facet model. ✅

## M7.6 — Top Overall catalog interests ✅

M7.6 turns the concrete catalog evidence into one profile-level **Top Overall** list without changing either underlying source.

### Eligible direct evidence

An item can enter Top Overall from either independent source:

1. a positive explicit **overall** catalog preference:
   - Love
   - Like
   - Curious
2. an active **Overall This-or-That** rank with at least one ordering comparison

The selector does **not** read quiz-derived/inferred catalog affinity. An inference-only item therefore cannot enter Top Overall.

Explicit states that exclude an item from ranking remain excluded from Top Overall even if historical pairwise evidence still exists:

- Hard Limit
- Not Interested
- Not Applicable

`Unsure` does not count as a positive explicit Top Overall signal by itself, but real Overall This-or-That evidence can still place that item in the list.

### Presentation-only aggregate ordering

The source values are preserved unchanged. M7.6 computes a derived ordering score only for the profile presentation.

Explicit positive-state scores:

| Explicit state | Ordering score |
| --- | ---: |
| Love | 100 |
| Like | 82 |
| Curious | 65 |

Pairwise placement is normalized across items that currently have active Overall rank evidence:

- first ranked direct-evidence item → 100
- last ranked direct-evidence item → 55
- intermediate placements interpolate linearly between them

Pairwise contribution weight is coverage-aware:

`0.65 + (0.35 × item pairwise confidence)`

This means an early Overall ranking can contribute immediately without pretending it is as refined as a deeply compared ranking.

When both sources exist, the presentation score is the weighted mean of:

- explicit score at weight 1.0
- pairwise placement score at the confidence-aware pairwise weight

The derived score is **not displayed as a fake preference percentage** and is never written back into catalog state or the pairwise engine.

### Deterministic ties

After aggregate score, ties resolve by:

1. number of independent direct sources
2. stronger positive explicit state
3. pairwise confidence
4. better actual Overall This-or-That rank
5. catalog label alphabetically

Thus agreement between explicit preference and pairwise evidence reinforces an item without rewriting either source.

### UI

The profile shows up to **10** concrete items.

Each row shows the source values that actually support it, for example:

```text
01  Rope Bondage        Love · This or That #2
02  Collaring           Love
03  Praise              This or That #4
```

The internal aggregate ordering score is intentionally not shown.

If fewer than 10 items have qualifying direct evidence, the profile shows fewer and explicitly does not pad the list with inferred or unanswered catalog items.

### Test gate ✅

Deterministic tests cover:

- explicit-only Love / Like / Curious ordering
- pairwise-only placement
- agreement/reinforcement across both direct sources
- inference-only exclusion
- Hard Limit / Not Interested / Not Applicable exclusion despite historical rank
- Unsure semantics
- strong pairwise evidence refining explicit-state ordering
- fewer-than-10 no-padding behavior
- default Top 10 cap
- deterministic final tie ordering

**Exit condition:** Top Overall is a direct-evidence ranking, not an inference/recommendation list. ✅

## M7.7 — Hard Limits ✅

M7.7 adds a dedicated profile boundary summary using **explicit Hard Limit state only**.

### Source semantics

Only an item's explicit overall catalog state of `hard_limit` qualifies.

The summary does not infer limits from:

- Not Interested
- Not Applicable
- Unsure
- low This-or-That placement
- missing ranking evidence
- low quiz-derived/inferred affinity

Hard Limits therefore remain a direct boundary declaration rather than another end of the preference-ranking scale.

### Relationship to Top Overall

M7.6 already excludes Hard Limit items from Top Overall even when historical pairwise evidence remains stored.

M7.7 consumes the same catalog-result exclusion contract, so the two profile sections remain intentionally disjoint:

- **Top Overall** = strongest directly evidenced positive interests
- **Hard Limits** = explicit boundaries

Historical ranking data is preserved underneath for source integrity but does not override a current explicit Hard Limit.

### Presentation

The profile uses a compact separate **Hard Limits** panel after Top Overall.

- default view shows up to 6 explicit limits
- limits are sorted alphabetically for stable presentation
- rows are compact rather than ranked
- when more than 6 exist, **Show all limits (+N)** expands in place
- **Show less** restores the compact view
- when none exist, the panel says **No hard limits marked**

The list intentionally does not number limits because the order does not represent severity.

### Test gate ✅

Deterministic tests cover:

- only explicit Hard Limit inclusion
- Not Interested / Not Applicable / Unsure exclusion
- no inference from missing or low preference evidence
- deterministic alphabetical ordering
- compact first-6 behavior
- full-list expansion metadata

**Exit condition:** boundaries remain semantically and visually separate from low preference. ✅

## M7.8 — Interest Areas ✅

M7.8 adds a compact category-level summary after Top Overall + Hard Limits.

### Evidence source

Interest Areas reuse the positive direct-evidence eligibility established by M7.6:

- explicit Love / Like / Curious
- active Overall This-or-That rank

Quiz-derived/inferred affinity cannot create an Interest Area by itself.

Hard Limit, Not Interested, Not Applicable, and Unsure-only items do not contribute positive category relevance.

### Category relevance

For each category:

1. take up to the strongest 3 direct-interest items
2. weight those representative ordering scores at 1.00 / 0.70 / 0.50
3. calculate their weighted mean
4. apply a breadth factor of 0.80 / 0.90 / 1.00 for 1 / 2 / 3+ qualifying items

The derived relevance score is presentation-only and is not shown as a user-facing percentage.

### Main profile density

Show up to **6** Interest Areas, each with up to **3** representative concrete items.

If fewer than 6 categories have meaningful direct evidence, show fewer rather than padding the section.

The main profile still does **not** render all 35 categories inline. Full category exploration remains M7.9.

### Test gate ✅

Deterministic tests cover category grouping, top-3 representative selection, breadth-aware relevance, inference exclusion, exclusion-state behavior, pairwise-only evidence, the six-area cap, sparse profiles, and fallback labels.

**Exit condition:** category-level themes are useful without making the main profile busy. ✅

## M7.9 — Explore / catalog drill-down ✅

M7.9 connects the compact profile summary back into the existing editable catalog instead of building a second category-detail system.

### Interest Area drill-down

Each visible Interest Area is now interactive.

Selecting one:

1. opens the existing catalog
2. preselects that category
3. expands that one category
4. preserves the catalog's existing explicit preference editor
5. preserves category rank, Overall rank, historical pairwise, and quiz-derived explainability already available on each catalog row
6. changes the catalog return action to **Back to profile**

This gives the category summary a real detail path without rendering all 35 categories inline on the profile.

### Explore all categories

The Interest Areas panel includes **Explore all categories**.

This opens the normal unfiltered catalog from the profile and returns to the profile when closed.

Normal catalog entry from the hub still returns to the hub.

The return destination is therefore explicit routing state rather than being inferred from browser history.

### Compact state shortcuts

The Interest Areas panel also exposes small direct shortcuts for:

- **Curious**
- **Unsure**
- **Hard Limits**

Each shortcut opens the existing catalog with only that explicit state selected.

These are navigation/filter helpers only. They do not create, rank, or alter preferences.

Users can immediately edit the visible items using the existing catalog controls.

### Focused catalog context

When the catalog opens with a category or state focus, it shows a small **Focused catalog view** bar containing the active filters.

The user can choose **Explore full catalog** to clear the drill-down and return to the normal full catalog without leaving the screen.

The standard Category and Preference selects remain editable, so the focused view is not a locked special mode.

### Routing safety

M7.9 uses typed drill-down targets for:

- category focus
- preference-state focus
- all-catalog entry
- return destination

Category ids are normalized against the generated catalog metadata before navigation. A stale/unknown category id is dropped rather than producing a broken empty special route.

### Architecture boundary

M7.9 reuses `KinkCatalogPreferences` as the only direct editing surface.

No second profile-specific preference editor is introduced.

No new preference or ranking semantics are created.

### Test gate ✅

Deterministic tests cover:

- category drill-down target
- Curious / Unsure / Hard Limit state targets
- Explore all categories target
- hub vs profile return destination
- stale category-id normalization
- valid-category preservation and default filter behavior

Build/preview validation covers the actual profile → focused catalog → edit → profile navigation surface.

**Exit condition:** users can move from profile summary to editable catalog detail without cluttering the main profile. ✅

## M7.10 — Explainability + coverage

This remains partly a dashboard/status concern and should not dominate the presentation profile.

### Scope

- expose contributing quiz/catalog/ranking evidence for derived results
- qualify low-coverage profile results without framing unknown as deficiency
- preserve source identity/version where available
- link users to useful unfinished quizzes/catalog exploration where appropriate
- keep completion mechanics subordinate or drill-down-only on the aggregated profile

### Test gate

Inspect:

- strong affinity / high coverage
- strong affinity / low coverage
- conflicting independent sources
- partially explored facets
- completely unexplored facets

**Exit condition:** the user can understand why a result exists and distinguish affinity from confidence/coverage.

## M7.11 — Final integration + polish

### Scope

- remove or appropriately gate the temporary M7.1 inspection surface
- verify the final profile hierarchy across all M7 sections
- responsive/mobile pass
- empty/partial/full-profile state pass
- accessibility + interaction cleanup
- regression-test M2–M6 section-local results and catalog behavior
- final documentation cleanup

**Exit condition:** M7 reads as one coherent profile experience while preserving the source-aware architecture underneath.

---

# Open design questions

M4/M5 are implemented, so these are now **active M7 decisions** rather than questions waiting on prerequisite signal work. O1 should establish the canonical cross-source evidence math first; O2 can then lock the final facet vocabulary/weights against the actual signal inventory.

1. Are the nine proposed facets the right final set?
2. Does Service & Devotion need to split into two facets?
3. Does Care & Nurture need separate giving/receiving visualization beyond metadata?
4. Should Role Embodiment become its own facet, or remain represented only through headspace results?
5. When is there enough evidence to add Sensation & Sensory Play?
6. What merge rule best combines repeated SignalIds across quizzes?
7. What minimum coverage is required before an overall facet appears on the radar?
8. What weighting should explicit catalog evidence receive relative to quiz evidence for the same SignalId?
9. What weighting/confidence threshold should pairwise evidence require before contributing to signals?
10. How should front-page drill-down explain which quizzes/catalog evidence contributed to each facet?
11. Should users be able to exclude one completed quiz or evidence source from overall aggregation?

---

# Current recommendation

Start with **M7.1 canonical cross-source aggregation + inspection** and do not begin facet/profile presentation work until that layer has been tested with real mutable user data.

M4, M5, and M6 are implemented, so M7 has enough real evidence structure to settle aggregation behavior from actual runtime inputs rather than hypothetical future quizzes.

Keep this architecture locked:

```text
source-aware independent evidence
(quiz + explicit catalog + pairwise catalog)
        ↓
canonical signals
        ↓
broad overall facets
        ↓
hybrid profile header + radar
        +
roles/headspaces + dynamic modes
        +
direct-evidence catalog summaries
        +
coverage / explainability
```

The immediate test loop for M7.1 is:

```text
inspect baseline
  → change explicit catalog state
  → inspect
  → add This-or-That evidence
  → inspect
  → retake a quiz
  → inspect
```

Only after those source-isolation and replacement semantics are trustworthy should M7.2 lock the final facet vocabulary and composition weights.
