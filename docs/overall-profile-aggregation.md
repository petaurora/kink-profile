# Overall Profile Aggregation & Front-Page Results

## Status

**M7 — Full Overall Profile is complete.**

**M16 refinement:** Overall Facets are now the single user-facing scored dimension system for the overall profile. The former Dynamic Modes layer was too close to the facet vocabulary and created a second, redundant interpretation of the same Signal evidence. Dynamic-mode composites may remain temporarily in internal compatibility paths such as Scene Builder/shared semantics, but they are not a peer profile taxonomy.

M7 consumes the source-aware evidence, ranking, catalog-result, and recommendation boundaries implemented in M6 rather than inventing another catalog/profile model.

The overall result should feel like a **profile summary**, not a fifth independent quiz.

---

# Canonical profile model

```text
Evidence sources
(quizzes / catalog / rankings)
        ↓
Canonical Signals
(granular concepts + direction)
        ├──────────────→ Headspaces
        │                 recognizable role/state patterns
        ↓
Overall Facets
(single broad profile-dimension layer)
        ↓
Overall profile shape
```

The important separation is now:

- **Signals** explain the granular evidence and preserve directional channels such as giving/receiving.
- **Overall Facets** summarize those Signals into broad, direction-neutral profile themes.
- **Headspaces** are separately derived recognizable role/state patterns. They are not facet axes and do not feed back into facet scoring.
- **Kink/activity preferences** remain concrete preferences rather than identity/profile axes.

There is intentionally **no second user-facing Dynamic Modes scoring layer** between Signals and Facets.

---

# Product goal

The front page should answer, at a glance:

> "What are the strongest themes in my overall profile?"

It should then make it easy to drill into:

- the Signals and source evidence behind a facet
- recognizable roles/headspaces
- strongest concrete catalog interests
- incomplete or unknown areas

Progress-oriented information belongs primarily on the home/dashboard. The aggregated profile should prioritize the resulting profile over the mechanics used to build it.

---

# Profile header

The profile header uses a short human-readable summary plus compact structured context:

```text
YOUR KINK PROFILE

The profile leans submissive, with the strongest themes around
service and devotion, structure and protocol, and care and nurture.

Orientation
Submissive

Headspaces
Pet · Prey · Slave
```

The header should:

- favor concise interpretation over a wall of percentages
- keep authority orientation separate from activity-side direction
- show recognizable Headspaces without declaring one assigned identity
- avoid completion statistics and detailed provenance
- avoid repeating Overall Facets through a second equivalent taxonomy

---

# Overall Facets

The profile shape uses **nine broad facets**. Facet composition consumes canonical Signal concepts. Affinity and evidence coverage remain separate, so unknown evidence is never silently treated as 0%.

The exact runtime contract lives in `src/data/overallFacets.ts`.

## 1. Power Exchange

Meaningful surrender, exercise, or transfer of negotiated authority and responsibility.

## 2. Structure & Protocol

Rules, ritual, accountability, discipline, and deliberate frameworks around a dynamic.

## 3. Ownership & Belonging

Symbolic possession, claiming, belonging, and consensual property-oriented meaning.

## 4. Service & Devotion

Fulfillment through serving, pleasing, dedication, loyalty, and relationship-centered devotion.

## 5. Care & Nurture

Receiving or providing care, soothing, guidance, protection, and nurtured relational energy.

## 6. Play & Resistance

Playfulness, teasing, mischief, negotiated resistance, and consensual push-pull.

## 7. Primal & Instinctive

Feral, pursuit, chase, predator/prey, embodied, and less-structured instinctive energy.

## 8. Restraint & Physical Control

Physical restriction, body positioning, movement control, and constraint-oriented play.

## 9. Intensity & Pain

Physical or emotional intensity, pain, endurance, and consensual challenge at an agreed edge.

A high facet score never assigns a role identity. Directional detail remains in the canonical Signals beneath the facet.

---

# Overall profile visualization

## Coxcomb / Nightingale-style profile shape

The primary overall-profile visualization uses the nine Overall Facets as equal-angle petals.

Rules:

- one petal per Overall Facet
- petal **area** represents affinity
- implementation uses `sqrt(affinity)` for radius so area, rather than raw radius, is proportional to the score
- unknown facets remain outlined instead of becoming artificial zeroes
- limited-evidence facets remain visibly qualified
- facet petals are interactive and open the existing explainability detail
- a short strongest-themes summary can sit beneath the visualization

This replaces the crowded nine-axis overall radar. Section-level quiz radars may still be appropriate where they compare a smaller, tightly related set of signals; this decision is specifically about the **overall profile shape**.

---

# Explainability

Every Overall Facet should remain traceable to its contributing canonical Signals and source evidence.

The profile should distinguish:

- **affinity** — how strongly the currently known evidence points toward the facet
- **coverage** — how much relevant evidence exists
- **unknown** — not enough evidence to score honestly
- **limited** — score exists, but evidence is still sparse

The profile shape is presentation, not a new scoring source. It never feeds values back into Signals, Headspaces, catalog preferences, or other evidence.

---

# Compatibility boundary

Older implementation paths may still contain Dynamic Mode IDs/compositions because Scene Builder and shared-profile semantic mappings previously consumed them. During migration they may remain as internal compatibility vocabulary.

They must not:

- appear as a second scored section on the overall profile
- appear as a second headline trait group beside Overall Facets
- appear in the default share-summary contract
- feed back into Overall Facet scoring

Future cleanup can migrate those remaining consumers directly to Facets, Signals, or scene-local themes without changing the user-facing profile model defined here.
