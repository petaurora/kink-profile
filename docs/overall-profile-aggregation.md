# Overall Profile Aggregation & Front-Page Results

## Status

Parked design direction for **M7 — Full Overall Profile**.

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

# Candidate overall facets

These are **candidate M7 axes**, not yet locked.

A practical radar should probably target around **7–8 axes** for readability, especially on mobile. The current nine-facet vocabulary is still useful as a candidate set, but M7 should test whether all nine deserve simultaneous visual treatment rather than forcing every valid facet onto the first radar.

## 1. Power Exchange

Represents interest in meaningful transfer, exercise, or surrender of authority.

Potential source signals:

- receiving control
- giving control
- responsibility transfer
- obedience
- authority
- surrender

### Direction metadata

Power exchange should not be treated as one dominant/submissive slider.

The overall facet can represent **strength of power-exchange interest**, while retaining direction separately.

Example:

```text
Power Exchange: 91%
Direction: bidirectional

Receiving: 94%
Giving: 86%
```

Possible direction labels:

- receiving-leaning
- giving-leaning
- bidirectional
- mixed / context-dependent
- insufficient evidence

---

## 2. Structure & Protocol

Represents enjoyment of deliberate structure around the dynamic.

Potential source signals:

- structure
- ritual
- protocol
- rules
- accountability
- discipline
- training / shaping

This facet is intentionally distinct from raw power exchange.

Someone may strongly enjoy rules, ritual, and protocol without wanting broad authority transfer.

---

## 3. Ownership & Belonging

Represents symbolic possession, claiming, belonging, and property-oriented dynamics.

Potential source signals / modes:

- ownership symbolism
- claiming
- belonging
- property / object evidence
- collar/marking-related catalog mappings where explicit

This should remain distinct from ordinary affection or commitment.

---

## 4. Service & Devotion

Represents fulfillment through doing, serving, pleasing, dedication, or ritualized devotion.

Potential sources:

- service
- obedience where service-driven
- devotion
- approval/praise as reinforcing context
- Service Submissive / Devotional Submissive compositions

This facet should not become a proxy for submission generally.

---

## 5. Care & Nurture

Represents receiving or providing care, guidance, protection, soothing, and nurtured relational energy.

Potential sources:

- care receiving
- caretaking
- guidance
- nurtured play
- caregiver-oriented evidence

### Direction metadata

Like power exchange, care can have direction:

- receiving care
- giving care
- reciprocal / both

The radar axis should represent strength, not force one direction to cancel the other.

---

## 6. Play & Resistance

Represents playful challenge, teasing, mischief, resistance, and negotiated push-pull.

Potential sources:

- playfulness
- playful resistance
- autonomy in playful contexts
- Brat / Brat Tamer compositions

This is intentionally separate from adversarial or non-consensual framing.

---

## 7. Primal & Instinctive

Represents feral, pursuit, chase, predator/prey, instinctive, or less-structured embodied dynamics.

Potential sources:

- primal embodiment
- pursuit/chase evidence
- Prey
- Predator
- primal / feral dynamic mode

### Direction metadata

Possible directional detail:

- pursuit / predator
- being pursued / prey
- bidirectional
- non-directional primality

---

## 8. Restraint & Physical Control

Represents interest in physical restriction and control of movement/body positioning.

Potential sources:

- restraint
- movement restriction
- positioning
- immobilization
- bondage-oriented catalog mappings

This should remain distinct from:

- protocol
- pain
- ownership
- general D/s

because those may correlate without being the same preference.

---

## 9. Intensity & Pain

Represents attraction to physical/emotional intensity, challenge, endurance, and pain-related play.

Potential sources:

- receiving intensity
- giving intensity
- pain receiving
- pain giving
- endurance
- challenge
- emotional intensity

### Direction metadata

Potential companion detail:

- receiving
- giving
- both

A high overall intensity score should not imply sadism, masochism, or switch identity by itself.

---

## 10. Sensation & Sensory Play

Potential future facet if the product gains enough direct evidence for it.

Potential sources:

- sensory deprivation
- sensory amplification
- temperature
- texture
- pressure
- impact-as-sensation where not primarily pain-driven

Do not add this axis merely because catalog items exist.

It should become a top-level facet only when the product has enough independent evidence to score it meaningfully.

---

# Possible final radar size

The current candidate vocabulary contains **9 facets**:

```text
Power Exchange
Structure & Protocol
Ownership & Belonging
Service & Devotion
Care & Nurture
Play & Resistance
Primal & Instinctive
Restraint & Physical Control
Intensity & Pain
```

The vocabulary is useful, but the first M7 radar should **prefer 7–8 simultaneously rendered axes** if nine becomes visually crowded. Do not merge distinct concepts merely to hit a number; instead decide whether one or more facets are better represented elsewhere in the profile summary or as an optional/detail view.

This is intentionally broader than the section-level radars.

It represents the shape of the overall profile rather than reproducing every underlying signal.

**Sensation & Sensory Play** can join later if/when the evidence model supports it.

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

The exact merge rule between explicit state and pairwise rank is an M7 design/implementation decision, but it must preserve the distinction between the source values rather than rewriting either source. For example, an explicit `love` and strong pairwise placement can reinforce the same item, while an explicitly assigned positive preference can still contribute even when the user has not yet ranked that item deeply in This-or-That.

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

# Proposed M7 implementation slices

## O1 — Canonical cross-source signal aggregation

- consume the source-aware evidence contract from C4
- merge repeated SignalIds across completed quizzes and independent direct catalog evidence
- define source deduplication/replacement semantics
- preserve score + coverage/evidence strength
- preserve source traceability
- ensure quiz retakes replace only the affected quiz contribution
- ensure direct catalog evidence survives quiz retakes
- explicitly exclude inferred catalog affinity/resolved catalog views from signal input
- test against semantic double-counting and feedback loops

## O2 — Overall facet model

- define final facet IDs
- lock composition weights
- calculate facet score + coverage
- calculate direction metadata where relevant
- add deterministic tests

## O3 — Overall radar

- place the overall radar immediately beneath the hybrid profile header
- render broad facets, targeting 7–8 simultaneous axes when practical
- represent unknown/low-coverage axes honestly
- expose a compact strongest-theme summary beneath the radar
- keep the initial radar on overall facet values rather than prematurely splitting direction
- retain direction metadata needed for a future Overall / Receiving / Giving radar toggle or multi-series view
- support drill-down to evidence/source sections

## O4 — Role / mode summary

- show a compact top set of receiving/submissive headspaces with percentages in the initial M7 UI
- provide an in-place Show all / Show less interaction for the full ranked receiving/submissive headspace list
- park giving/dominant headspace presentation for the broader future directional-profile enhancement
- strongest dynamic modes
- preserve independent overlapping scores

## O5 — Catalog summary

- derive Top 10 overall catalog items from aggregated **explicit preference + pairwise ranking** evidence
- show explicit Hard Limits as a separate summary, with Show all when needed
- keep Hard Limits distinct from Not Interested / Not Applicable / low rank
- place Top Overall + Limits before the Interest Areas section
- show only the top approximately 4–6 Interest Areas on the main profile
- show a few representative top items per Interest Area
- provide a separate Explore all categories experience rather than expanding all 35 categories inline
- show explicit catalog states and category rankings in the deeper category view
- do not let inferred catalog affinity enter Top Overall by itself
- keep the underlying explicit and pairwise source values available for explainability without mutating either source

## O6 — Exploration / coverage summary

- show completed/in-progress/unexplored sections
- identify low-coverage facets
- link users to relevant quizzes without framing unknown as deficiency

---

# Open design questions

These should be settled after M4/M5 signals exist, because those implementations will determine whether the candidate facets have enough clean evidence.

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

Do **not** lock the final M7 radar axes before M4 and M5 are designed.

Do lock the architecture now:

```text
source-aware independent evidence
(quiz + explicit catalog + pairwise catalog)
        ↓
canonical signals
        ↓
broad overall facets
        ↓
radar + direction metadata
        +
roles/headspaces
        +
dynamic modes
        +
explicit catalog favorites
        +
coverage/exploration state
```

That gives the front page a coherent model without prematurely hard-coding the final visual vocabulary.
