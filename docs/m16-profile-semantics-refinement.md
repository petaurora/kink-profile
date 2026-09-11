# M16.4 — Profile Semantics Refinement

**Status:** active curation / refinement  
**Tracking:** [Issue #118](https://github.com/petaurora/kink-profile/issues/118)  
**Related:** [M16.7 cross-system taxonomy alignment — Issue #121](https://github.com/petaurora/kink-profile/issues/121)

This document preserves the semantic constraints that should survive the remaining M16.4 work. GitHub Issues own the current checklist and implementation status.

---

## Current profile hierarchy

Canonical Signals are the semantic evidence layer. They feed several derived views, but those views do not have equal product status:

```text
                         Canonical Signals
                         /       |       \
                        /        |        \
             Overall Facets   Headspaces   Contextual modes
                  |               |              |
       canonical high-level    role/state     underlying interaction
          profile themes          lens           context/composition
```

**Overall Facets are the canonical high-level profile dimensions.**

Roles/Headspaces remain independently derived recognizable roles or states. The legacy Dynamic Mode layer may remain as **contextual/underlying modes** for explanation and downstream tools, but it must not reappear as a second competing top-level profile taxonomy or headline radar system.

No derived layer feeds back into stored user evidence.

---

# Invariants

## Overall Facets are broad non-directional themes

There are nine Overall Facets. They are not split into:

- giving / receiving
- Dominant / submissive
- specific roles/headspaces

Directional nuance belongs to the Signal references feeding a facet, not to directional facet axes.

## Signal channels are not authority roles

The canonical Signal contract is:

```text
Signal = semantic concept
Channel = Overall | Receiving | Giving perspective on that concept
```

Giving/Receiving follows the direction of the concept itself and does not imply Dominant/submissive authority.

See [Signal + Channel Model](m16-signal-channel-model.md) and [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md).

## Derived projections stay independent

Allowed:

```text
Signals → Overall Facets
Signals → Roles / Headspaces
Signals → Contextual modes
Contextual mode definition → descriptive associated Overall Facets
```

Not allowed:

```text
Signals → Overall Facet → Headspace
Signals → Overall Facet → Contextual mode
Overall Facet score → stored preference evidence
```

A contextual mode may expose associated themes for explanation, but those theme associations do not calculate the mode score.

## Direct rankings remain direct evidence

Top Overall kink interests remain based on explicit preference and pairwise ranking evidence. Signal/facet curation must not reorder direct Top Overall rankings by itself.

---

# Overall Facet refinement

The full **Signal × nine-theme** relationship matrix is the canonical curation surface.

For every Signal/theme pair ask:

> If this Signal alone were known to be high, would that make this broad theme meaningfully higher, lower, or neither?

Classify the relationship as:

- **Supports** — genuine evidence for the theme
- **Opposes** — genuine evidence against the theme
- **Neutral / omitted** — no meaningful semantic claim

Non-neutral relationships carry a continuous strength from 0 through 1.

## Weak links still cost something

Pay special attention to relationships around 0.1–0.2. A tiny weight is still a semantic claim and still affects affinity, coverage, strongest-theme ordering, and explanation paths.

Do not keep a weak link merely because two ideas often coexist in the same scene.

## Opposition is stronger than “different vibe”

`Opposes` means that stronger affinity for one Signal is meaningful evidence **against** the theme. Mere contrast, different aesthetics, or imperfect overlap is not enough.

## Coverage gaps are allowed

Do not invent mappings to make completeness counters reach 100%. An unmapped Signal/category/action may reveal a real vocabulary gap, a context-only concept, or simply a relationship that should stay Neutral.

---

# Contextual / underlying mode refinement

The internal mode layer previously appeared as a peer Dynamic Mode taxonomy. That user-facing duplication has been removed; remaining modes should be treated as contextual/underlying compositions.

Their purpose is to answer questions closer to:

> **What kind of interaction context or felt mode does this Signal evidence support?**

rather than:

> **What is another headline profile dimension?**

Mode definitions may use the same explicit relationship semantics as other compositions:

- Supports
- Opposes
- Neutral / omitted
- continuous non-neutral weight 0–1

Opposing evidence may reduce a known contextual-mode score, but absence or low affinity of an opposing Signal must never manufacture positive evidence.

Use canonical Signal references rather than legacy directional IDs. For example:

```text
Contextual surrender-like composition
  Responsibility / giving    supports 1.0
  Control / receiving        supports 0.8
  Role Embodiment / overall  supports 0.4
  Care / receiving           supports 0.3
  Autonomy / overall         opposes  ...
```

The exact definitions remain curation decisions.

Prefer a smaller set of contextual modes that add useful downstream/explanatory meaning over a broad taxonomy that simply rephrases Overall Facets.

---

# Role / Headspace refinement

Roles and Headspaces should remain recognizable experiential lenses rather than generic motivations or cross-cutting themes.

Review compositions for:

- redundant roles/headspaces
- names that imply semantics the Signal recipe does not support
- overly broad positive-only recipes
- missing opposing relationships where opposition is genuinely defining
- ingredients included because they commonly co-occur rather than because they define the construct
- overlap with contextual modes or Overall Facets that makes a result redundant

A useful test is:

> If this Signal were the only thing known to be high, would that make this role/headspace meaningfully more likely?

If not, the relationship may be Neutral rather than weakly positive.

---

# Signal vocabulary + channel model

The Signal/channel normalization work has landed.

The current Workbench and canonical runtime operate on **37 canonical Signal concepts** with optional Receiving/Giving channels where semantically applicable. The old 45 directional/source IDs remain only where compatibility still requires them.

The current contract requires:

- Overall evidence does not fan out into Receiving/Giving certainty
- directional evidence may roll upward into Overall
- missing directional evidence remains unknown, not zero
- not every Signal supports directional channels
- downstream definitions reference Signal + optional channel
- custom human-facing channel labels may be used while machine channel IDs remain stable

See [Signal + Channel Runtime Migration](m16-signal-channel-runtime-migration.md) and [Workbench Signal + Channel Follow-up](m16-workbench-signal-channel-followup.md) for completed migration context.

## Future vocabulary changes

Do not add a Signal merely to mirror terminology from an external quiz or source list.

For each candidate ask:

- is the meaning already represented by an existing Signal?
- would users plausibly score it differently from neighboring Signals?
- is there enough evidence to estimate it?
- would it improve a Headspace, contextual mode, Overall Facet, inference, or explanation?
- does it require Receiving/Giving separation?
- can a clear side-neutral base description be written?
- would adding/removing it require persisted-evidence migration?

Exhibitionism and Voyeurism remain separate Overall-only concepts because collapsing them into an abstract shared “observation” Signal would erase meaningful psychological distinctions. Arousal Control and Degradation / Humiliation support Overall/Receiving/Giving channels.

---

# Match strength, coverage, and prominence

High composed affinity is not inherently a bug when the known evidence genuinely supports it.

Keep these concepts distinct:

- **Affinity / Match** — how strongly known evidence supports the construct
- **Coverage** — how much of the construct has useful evidence
- **Prominence** — a presentation value, if used, that intentionally combines strength with evidence support for visualization

Unknown evidence must remain unknown rather than being treated as zero.

If an evidence-adjusted Overall Facet visualization is used, raw affinity and coverage should remain inspectable. Do not use arbitrary caps or per-profile min/max stretching merely to force a more dramatic chart shape.

Any prominence formula remains subject to representative-profile validation before becoming a durable scoring contract.

---

# Representative-profile calibration

Semantic changes should be checked against multiple profile shapes rather than tuned to one person's expected labels.

Representative cases should cover at least:

- strongly submissive / receiving-heavy
- strongly dominant / giving-heavy
- bidirectional / switch-like
- broad/high-affinity
- sparse/incomplete
- strong physical intensity with low relational power exchange
- strong relational power exchange with low pain/intensity
- playful/resistant without deep surrender
- high service/devotion without ownership
- high ownership/belonging without service

Inspect:

- Overall Facet ordering/shape
- affinity and coverage
- role/headspace differentiation
- contextual-mode usefulness
- explanation quality
- preservation of direct preference/ranking evidence

Do not optimize mappings simply to reproduce one expected profile label.

---

# Current remaining work

The authoritative checklist lives in [Issue #118](https://github.com/petaurora/kink-profile/issues/118). At a semantic level, remaining work includes:

- review the 37-Signal vocabulary for overlap/redundancy
- finish headspace naming/merge decisions
- curate contextual/underlying mode usefulness without restoring a competing profile taxonomy
- review Overall Facet labels, mappings, thresholds, and prominence
- verify Giving/Receiving and authority semantics are not conflated anywhere
- update durable scoring/semantic docs as decisions land
- add representative-profile sanity checks

Cross-system mapping calibration and validation continue under [Issue #121](https://github.com/petaurora/kink-profile/issues/121).

---

# Non-goals

This refinement does not:

- restore contextual modes as a second headline profile-dimension system
- derive contextual modes or Headspaces from Overall Facet scores
- feed facet/contextual-mode/headspace scores back into canonical Signal evidence
- make Top Overall an inferred list
- maximize the number of modes or Signals
- force every person into a highly differentiated visualization
- collapse authority, activity side, and role semantics together

---

# Exit condition

This refinement is complete when:

1. Overall Facets remain one understandable high-level profile dimension system
2. contextual modes add useful supporting context without duplicating Overall Facets
3. Roles/Headspaces remain distinct recognizable lenses
4. Signal vocabulary/channel applicability is intentional and non-redundant
5. Signal → Facet mappings pass weak-link and opposition review
6. Giving/Receiving never silently stands in for Dominant/submissive authority
7. representative profiles produce coherent, explainable results
8. no derived semantic layer mutates direct preference/ranking evidence
