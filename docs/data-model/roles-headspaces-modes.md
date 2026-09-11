# Roles, Headspaces & Dynamic Modes

This document defines the current derived taxonomy for recognizable roles/headspaces and cross-cutting Dynamic Modes, plus the boundary between those compositions and canonical Signal evidence.

## Core model

Roles/headspaces and Dynamic Modes are **derived interpretations** of canonical Signal evidence.

```text
independent source evidence
          ↓
canonical Signal + channel
          ↓
   ┌──────┴──────┐
   ▼             ▼
roles /       Dynamic
headspaces      Modes
```

They are not peer evidence sources and do not feed back into the Signals used to compose them.

The current source definitions live in `src/data/headspacesQuiz.ts`; their canonical Signal/channel projections live in `src/data/canonicalRoleCompositions.ts`.

## Roles / headspaces

Roles/headspaces answer:

> What recognizable relational or internal role/state is supported by the available evidence?

Current peer roles/headspaces are:

### Self-positioned presentation group

| ID | Label | Core semantic shape |
| --- | --- | --- |
| `pet` | Pet | belonging, role embodiment, playfulness, care, ownership meaning, praise |
| `slave` | Slave | chosen surrender/responsibility transfer, obedience, service, ownership meaning, structure, devotion |
| `little` | Little | younger headspace, nurturance, reduced responsibility, playfulness, praise, role immersion |
| `middle` | Middle | youthful role/headspace with more independence, agency, opinions, and playfulness |
| `brat` | Brat | negotiated resistance, playfulness, agency, teasing, interactive authority |
| `prey` | Prey | consensual pursuit/evasion/catching from the pursued side, primal embodiment, role shift |
| `object` | Object | consensual objectification/function framing and immersive reduction of ordinary identity |

### Partner-positioned presentation group

| ID | Label | Core semantic shape |
| --- | --- | --- |
| `owner_handler` | Owner / Handler | claiming/ownership meaning, guidance, responsibility, care, structure |
| `caregiver` | Caregiver | nurturance, responsibility holding, guidance, supported relational space |
| `brat_tamer` | Brat Tamer | meeting negotiated resistance with playful authority, direction, and shaping |
| `predator` | Predator | consensual pursuit/tracking/catching from the pursuing side, primal embodiment, role shift |
| `master_mistress` | Master / Mistress | sustained negotiated authority, responsibility, structure, and ownership meaning |

The two presentation groups are **not authority buckets**.

`self-positioned` does not mean submissive, and `partner-positioned` does not mean Dominant. The grouping organizes role perspective for display/readability.

Some individual role definitions carry explicit authority meaning because of what the role itself describes. That meaning comes from the role definition, not from the presentation group or a generic Receiving/Giving channel.

## Dynamic Modes

Dynamic Modes answer a different question:

> What cross-cutting style, relational pattern, or experiential mode is supported across the profile?

Current modes are:

| ID | Label | Core semantic shape |
| --- | --- | --- |
| `devotion_mode` | Devotion | dedication, loyalty, belonging, relationship-centered meaning |
| `protocol_mode` | Protocol | prescribed behavior, ritual, formal expectations, intentional procedure |
| `service_mode` | Service | usefulness, contribution, assistance, relational service meaning |
| `structure_mode` | Structure | consistency, expectations, guidance, accountability, shaping over time |
| `care_mode` | Care | comfort, soothing, support, regulation, nurturance, wellbeing |
| `playful_resistance_mode` | Playful Challenge | teasing, negotiated pushback, provocation, interactive challenge |
| `objectification_mode` | Objectification | consensual role/function/object-like framing |
| `primal_mode` | Primal / Feral | instinct, physical immediacy, pursuit, feral/less-socially-structured interaction |
| `power_exchange_mode` | Power Exchange | negotiated placement of control, direction, responsibility, and following |
| `intensity_mode` | Intensity | physically or emotionally strong, painful, overwhelming, or sustained experience |

Modes can overlap. They are not a partition and do not sum to 100%.

## Dynamic Modes are direction-neutral outputs

A Dynamic Mode is a broad composed pattern, not a Receiving/Giving peer label.

For example:

```text
Power Exchange
```

is the broad mode. Directional nuance remains available in the underlying canonical Signal channels such as Control or Responsibility.

Likewise:

```text
Care
```

may be supported by receiving-care and giving-care evidence without becoming separate `Receiving Care Mode` and `Giving Care Mode` peer modes.

This prevents direction from being duplicated at every semantic layer.

## Role/headspace compositions may use directional channels

Roles/headspaces can reference a specific Signal channel when that perspective genuinely helps define the role.

Examples:

- Pet may use Ownership Symbolism · Receiving and Praise/Approval · Receiving;
- Prey may use Pursuit · Receiving;
- Predator may use Pursuit · Giving;
- Owner / Handler may use guidance/ownership/structure evidence from the Giving perspective;
- Caregiver may use Care · Giving;
- Master / Mistress may use authority-relevant Giving-side evidence where the underlying Signal supports it.

A role using a directional channel does not turn that channel into an authority label.

See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

## Canonical composition normalization

The historical/source quiz definitions in `headspacesQuiz.ts` still express composition weights against legacy `SignalId` values.

The current overall profile does not consume those legacy IDs as the canonical taxonomy contract.

`canonicalRoleCompositions.ts` normalizes each source composition:

```text
legacy Signal ID + weight
        ↓
legacySignalConceptTargets
        ↓
canonical Signal ID + supported channel + weight
```

Definition-specific channel overrides are applied where the intended role/mode semantics need a specific perspective.

If a requested directional channel is not supported by the canonical Signal, normalization falls back to Overall.

## Collapsed legacy-pair deduplication

Multiple legacy IDs can map to the same canonical concept/channel.

That must not make a composition count the same semantic concept twice merely because the old schema had two IDs.

Normalization therefore deduplicates by:

```text
canonical Signal ID + channel
```

and retains the strongest applicable weight for that composed definition.

This is especially important when older receiving/giving pairs collapse into one direction-neutral Dynamic Mode composition.

## Composition scoring

A composed role/headspace or mode uses weighted canonical Signal evidence.

Its result preserves preference strength and evidence coverage separately. Missing component evidence is not treated as a negative preference merely to complete the composition.

Compositions with insufficient/no supporting evidence should remain unknown/unfeatured rather than acquiring confidence from absent components.

See [Scoring & Taxonomy Model](../scoring-model.md) for scoring semantics.

## Current taxonomy cleanup boundaries

The following labels are **not current peer role/headspace results**:

- Service Submissive;
- Devotional Submissive;
- Trainer;
- Property / Object as a combined peer label.

Current semantics instead use:

- **Service** and **Devotion** as cross-cutting concepts/modes rather than dedicated submissive identities;
- **Owner / Handler** for the role space that absorbed Trainer-like guidance/shaping semantics;
- **Object** as the narrower objectification-oriented peer role/headspace.

The following are **not current peer Dynamic Modes**:

- Nurtured Play;
- Caretaking;
- Training / Shaping;
- Playful Resistance as the user-facing mode label;
- Claiming;
- Authority;
- Surrender.

Current mode semantics use:

- **Care** instead of separate Nurtured Play/Caretaking peer modes;
- **Structure** for sustained guidance/shaping/framework semantics;
- **Playful Challenge** as the current user-facing label while retaining stable internal ID `playful_resistance_mode`;
- **Power Exchange** as the shared direction-neutral mode instead of Authority/Surrender peer modes;
- ownership/claiming meaning through underlying Signals/roles rather than a Claiming mode;
- **Intensity** as the broad intensity-oriented mode.

These exclusions are current taxonomy boundaries, not a requirement to erase compatibility identifiers from historical source seams.

## Relationship to the Roles & Headspaces quiz

The Roles & Headspaces quiz gathers direct answer evidence for Signals that can support these compositions.

The quiz itself is not a direct `Pet score` / `Predator score` questionnaire.

Conceptually:

```text
question answers
      ↓
Signal evidence
      ↓
canonical Signal/channel normalization
      ↓
role/headspace + mode compositions
```

Current quiz version is `5`.

Existing stored answers can remain compatible while derived taxonomy results change when composition definitions intentionally evolve. That is why raw quiz evidence and derived taxonomy results must remain distinct layers.

See [Quizzes](../product/quizzes.md).

## Relationship to authority

Roles/headspaces, Dynamic Modes, activity-side channels, and authority orientation are related but not interchangeable.

Examples:

- Prey does not automatically mean submissive;
- Predator does not automatically mean Dominant;
- Caregiver does not automatically mean Dominant;
- receiving pain does not automatically mean submissive;
- giving restraint does not automatically mean Dominant;
- Power Exchange as a Dynamic Mode does not by itself choose which person holds authority in every context.

Authority claims require authority-relevant evidence.

## Relationship to Overall Facets

Overall Facets are broader thematic compression for profile presentation.

A role/headspace or Dynamic Mode is not itself an Overall Facet, and a Facet should not be used as a second evidence source to inflate a role/mode that was derived from the same Signals.

```text
canonical Signals
   ├─► roles/headspaces
   ├─► Dynamic Modes
   └─► Overall Facets
```

These are sibling derived views unless a specific downstream feature explicitly treats one as a query/filter label.

## Downstream use

Derived roles/headspaces and modes may be used for:

- profile explanation/presentation;
- Scene Builder theme/query matching;
- other read-only discovery/filter experiences.

Using a derived taxonomy result downstream must not write new source evidence back into the profile.

## Invariants

Future changes should preserve these boundaries unless the taxonomy deliberately changes:

1. **Roles/headspaces and Dynamic Modes are derived from canonical Signal evidence.**
2. **Derived taxonomy does not feed back into its own source Signals.**
3. **Roles/headspaces may use directional channels where semantically meaningful.**
4. **Dynamic Modes remain direction-neutral peer outputs.**
5. **Receiving/Giving channels are not Dominant/submissive labels.**
6. **Self-positioned/partner-positioned grouping is presentation organization, not authority classification.**
7. **Composed results may overlap and do not sum to 100%.**
8. **Collapsed legacy Signal pairs do not double-count the same canonical concept/channel.**
9. **Stable internal IDs may survive a label/taxonomy cleanup when compatibility requires it.**
10. **Current peer-role and peer-mode lists come from current source definitions, not milestone-era labels.**

## Primary implementation references

- `src/data/headspacesQuiz.ts`
- `src/data/canonicalRoleCompositions.ts`
- `src/data/canonicalSignals.ts`
- `src/lib/scoring.ts`
- `src/lib/profileRoleDetails.ts`
- `src/lib/profileExplainability.ts`

The code and focused tests remain authoritative when implementation and documentation disagree.
