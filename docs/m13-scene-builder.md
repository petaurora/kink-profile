# M13 — Scene Builder

**Status:** planned  
**Roadmap milestone:** M13  
**Primary boundary:** M13 turns one person's existing profile into a small, relevant, consent-aware play space for a specific moment. It reduces decision load; it does not replace communication, assign obligations, or infer consent.

---

## Goal

Add a first-class **Scene Builder** that answers:

1. **What kind of play fits the space I want right now?**
2. **What profile-backed activities fit those themes?**
3. **Can the app turn those options into a simple scene arc?**
4. **Can I randomize or shuffle without pulling in things that should not be used?**
5. **Can I save a good combination so I do not have to reconstruct it later?**

The product principle is:

> **Externalize context. Preserve choice. Reduce decision load.**

The app should help a user move from a very large preference universe to a small, usable menu without requiring them to remember every profile detail in the moment.

---

# Product model

M13 is a **composition layer** over existing profile systems.

```text
M3 roles/headspaces + dynamic modes
M6 catalog preferences + rankings
M7 canonical profile/facets
M11 rewards/punishments
current-session overrides
        │
        ▼
THEME QUERY
        │
        ▼
PROFILE-AWARE CANDIDATES
        │
        ▼
SCENE COMPOSITION
```

M13 does not create a second competing preference model.

Existing systems remain authoritative for:

- catalog identity
- explicit preference
- pairwise rank
- hard limits/exclusions
- canonical signals
- headspaces
- dynamic modes
- broad facets
- reward/punishment suitability

M13 consumes those outputs and adds **momentary intent + composition**.

---

# Core semantic rules

## 1. A theme is a query, not a new score

Themes are user-selected intentions used to narrow the candidate space.

Examples:

- Pain
- Restraint
- Service
- Discipline
- Sensory
- Pet
- Prey
- Devotional Submissive
- Surrender
- Protocol
- Nurtured Play
- Primal / Feral
- Playful Resistance
- Soft
- Structured
- Intense
- Playful
- Ritual-heavy

A theme may map to:

- stable catalog metadata
- canonical SignalIds
- M3 role/headspace IDs
- M3 dynamic-mode IDs
- M7 facet IDs
- M11 contextual categories

Theme selection must not write back into any of those sources.

## 2. The scene must cover the themes; every item does not need to

For a query such as:

```text
Pain + Deeper Submission
```

do **not** require every returned activity to simultaneously represent both pain and submission.

Instead, build a candidate set with complementary lanes:

```text
Pain lane
Submission lane
Bridge items that support both
```

A valid scene may cover the full selected theme set across several components.

This avoids producing an unnaturally tiny candidate pool.

## 3. Preference does not equal current-session consent

General profile preference is durable context.

M13 introduces temporary session state such as:

- Yes tonight
- Maybe tonight
- Not tonight

Current-session exclusions always override general positive preference for M13 suggestions/randomization.

They do not rewrite the underlying profile.

## 4. Hard exclusions remain authoritative

The following are never eligible for automatic scene selection:

- Hard Limit
- Not Applicable
- Not Interested
- current-session Not tonight
- stale/deprecated items that cannot be safely resolved

Historical rank, inferred affinity, scene history, or theme fit can never override those exclusions.

## 5. Inference may suggest; it may not silently randomize

Direct positive evidence may participate in normal candidate generation.

Curious items may participate when an Explore/Adventurous mode is explicitly enabled.

Inference-only items may appear under **Suggested to explore**, but are not silently eligible for:

- random scene generation
- shuffle replacement
- saved default templates

until the user explicitly promotes/approves them through the appropriate profile surface.

## 6. M13 does not infer authority from activity side

Existing semantic boundaries remain intact:

- giving pain does not imply Dominant
- receiving pain does not imply submissive
- giving restraint does not imply Dominant
- receiving restraint does not imply submissive
- Pet does not automatically imply submissive
- Predator does not automatically imply Dominant

Theme mappings may connect related interaction concepts, but must not rewrite D/s orientation.

---

# Theme taxonomy

M13 should define a stable, versioned theme taxonomy.

A theme definition should be metadata-driven, for example:

```ts
interface SceneThemeDefinition {
  id: SceneThemeId;
  label: string;
  description: string;
  family:
    | 'activity'
    | 'headspace'
    | 'dynamic_mode'
    | 'facet'
    | 'vibe';

  mappings: Array<
    | { kind: 'signal'; id: SignalId; weight: number }
    | { kind: 'headspace'; id: RoleHeadspaceId; weight: number }
    | { kind: 'dynamic_mode'; id: DynamicModeId; weight: number }
    | { kind: 'facet'; id: OverallFacetId; weight: number }
    | { kind: 'catalog_category'; id: CategoryId; weight: number }
    | { kind: 'm11_category'; id: RewardPunishmentCategoryId; weight: number }
  >;
}
```

The exact type shape may differ in implementation, but the important behavior is:

- stable theme IDs
- explicit mappings
- bounded weights
- validation at build/test time
- no string-label matching as runtime identity

---

# Candidate engine

M13 should calculate a **scene candidate score**, not a new profile score.

That score is presentation/runtime-only and may consider:

1. direct eligibility
2. selected-theme fit
3. explicit preference strength
4. pairwise rank/confidence
5. canonical profile fit
6. current-session state
7. novelty/exploration mode
8. anti-repeat/session diversity
9. M11 contextual suitability when a reward/punishment slot is requested

The candidate score must remain separate from authoritative source values.

Conceptually:

```text
authoritative profile evidence
        +
selected scene themes
        +
current session state
        ↓
derived candidate fit
```

Candidate fit is recomputable and should not feed back into M6/M7/M11.

---

# Scene-intent flow

The primary entry point should minimize effort.

## Step 1 — What sounds good?

Select one or more themes.

Examples:

- Pain
- Pet
- Surrender
- Playful
- Primal
- Care
- Restraint
- Discipline
- Service

The UI should support multi-select without requiring the user to understand the underlying scoring model.

## Step 2 — Optional narrowing

Optional controls may include:

### Effort / complexity

- Quick
- Normal
- Elaborate

### Familiarity / exploration

A simple range or discrete choices such as:

- Familiar
- Mix
- Explore

### Intensity dimensions

Prefer separate dimensions over one generic intensity number.

Possible dimensions:

- physical intensity
- psychological intensity
- structure/control
- sensory intensity
- duration/complexity

These controls are scene-local and should not mutate profile scores.

## Step 3 — Current-session overrides

Allow rapid temporary changes:

- Yes tonight
- Maybe tonight
- Not tonight

M13 should make this fast enough that it does not recreate the catalog-editing burden.

## Step 4 — Show a small play space

The output should not be hundreds of items.

Prefer a bounded, useful set such as:

- strongest matches
- complementary options
- bridge items
- optional exploration suggestions

The user should be able to:

- pick one
- compare a few
- randomize from eligible items
- build a scene from the current set

---

# Scene composition model

A scene is an ordered collection of components.

Initial suggested arc:

```text
Setup
↓
Headspace / transition
↓
Warm-up
↓
Core play
↓
Escalation / challenge
↓
Optional reward / punishment
↓
Come-down
↓
Aftercare
```

Not every scene requires every slot.

A practical model may resemble:

```ts
interface SavedScene {
  id: SceneId;
  name: string;
  version: number;

  themeIds: SceneThemeId[];

  components: SceneComponent[];

  intent?: {
    effort?: 'quick' | 'normal' | 'elaborate';
    exploration?: 'familiar' | 'mixed' | 'explore';
  };

  createdAt: string;
  updatedAt: string;
}
```

Each component should reference stable underlying IDs where possible rather than copying detached display text.

Possible component references:

- M6 CatalogItemId
- M11 action ID
- M11 saved reward/punishment recipe ID
- bounded scene-local custom note/text

---

# Scene builder interactions

The user should be able to:

- add a component
- remove a component
- reorder components
- replace one component
- shuffle one component without destroying the rest
- regenerate suggestions for one slot
- edit scene-local notes
- duplicate a scene
- save as reusable template
- delete a saved scene

The app should not require the user to specify an entire scene before receiving useful suggestions.

---

# Randomization

M13 randomization exists to remove decision lift.

Supported actions may include:

- Pick something
- Build something
- Shuffle this part
- Give me another option

Randomization rules:

- use only currently eligible items
- never include hard exclusions
- never include current-session Not tonight items
- do not include inference-only items
- include Curious only when Explore mode allows it
- use short-term anti-repeat so repeated presses do not immediately return the same result
- do not silently equate highest rank with highest random probability in V1

Randomization should feel useful, not deterministic and not recklessly broad.

---

# M11 Rewards & Punishments integration

M13 does not duplicate M11 contextual-use logic.

A scene may optionally include:

- Reward
- Punishment
- Either / surprise me
- None

When such a slot is used:

- eligibility comes from M11
- M11 Never/No semantics remain authoritative
- inference-only M11 proposals are not silently randomized
- saved M11 recipes may be eligible when valid and random-enabled
- scene-local inclusion does not rewrite M11 suitability

M13 owns placement/composition; M11 owns contextual suitability.

---

# Explainability

Scene suggestions should be able to answer:

> Why is this here?

without exposing raw scoring internals.

Useful explanation examples:

- Matches Pain + Surrender
- Strong direct preference
- High Overall ranking
- Fits Pet headspace
- Supports Protocol
- Curious item included because Explore mode is on
- Reward option confirmed in Rewards & Punishments

Do not expose SignalIds, internal weights, or derived candidate-score math in normal UI.

---

# Persistence and lifecycle

Authoritative M13 data should include:

- saved scenes/templates
- scene-local custom notes
- stable referenced IDs
- optional user-authored scene names/settings

Derived candidate lists should not be persisted as authoritative data.

## Backup/import

M9 full-profile backup/import should eventually include saved scenes/templates.

## Reset

M13 should have an independent reset scope for saved scenes/templates.

Resetting scenes must not reset:

- quizzes
- catalog preferences
- This-or-That history
- M11 contextual profiles
- M7 aggregate profile

## Share summary

M13 scene data is private by default and should not automatically appear in the existing M9 share summary.

A future explicit scene-share artifact may be considered separately.

---

# M13 slices

## M13.1 — Theme taxonomy + mappings

- [ ] define stable SceneThemeIds
- [ ] map themes to existing catalog/signal/headspace/mode/facet metadata
- [ ] validate all mappings
- [ ] lock theme semantics as query-only, never profile evidence

## M13.2 — Profile-aware candidate engine

- [ ] build pure candidate derivation
- [ ] enforce explicit exclusions
- [ ] combine theme fit with direct preference/rank/profile context
- [ ] preserve direct vs inferred provenance
- [ ] add deterministic multi-theme coverage behavior

## M13.3 — Current-session state

- [ ] add Yes tonight / Maybe tonight / Not tonight
- [ ] keep state temporary/non-authoritative
- [ ] let session exclusions override positive profile evidence
- [ ] clear/reset session state cleanly

## M13.4 — Theme-based suggestion surface

- [ ] multi-select scene themes
- [ ] optional effort/exploration/intensity narrowing
- [ ] produce a bounded candidate menu
- [ ] separate confirmed matches from Suggested to explore
- [ ] add plain-language why-this-fits explanations

## M13.5 — Scene arc / composition builder

- [ ] create ordered scene components
- [ ] add/remove/reorder/replace components
- [ ] support optional slots
- [ ] retain stable source IDs
- [ ] support scene-local notes

## M13.6 — Randomization + shuffle

- [ ] Pick something
- [ ] Build something
- [ ] Shuffle one part
- [ ] anti-repeat within current session
- [ ] enforce all eligibility rules
- [ ] keep inference-only items out of automatic selection

## M13.7 — M11 integration

- [ ] add optional reward/punishment scene slots
- [ ] consume M11 item/recipe eligibility
- [ ] preserve M11 contextual state as authoritative
- [ ] support random eligible reward/punishment placement

## M13.8 — Saved scenes + lifecycle

- [ ] save/edit/duplicate/delete scene templates
- [ ] mark scenes Needs review when referenced items become stale/excluded
- [ ] add backup/import support
- [ ] add independent scene reset scope

## M13.9 — Accessibility + polish

- [ ] mobile-first low-decision UI
- [ ] keyboard/focus support
- [ ] reduced-motion support
- [ ] empty/sparse/full profile behavior
- [ ] regression-run M6/M7/M9/M11 boundaries
- [ ] finalize docs and mark M13 complete

---

# Non-goals

M13 does not initially provide:

- automatic behavioral assignments
- enforcement/tracking
- task completion
- punishment debt
- reward economy
- AI-authored explicit narrative scripts
- partner compatibility scoring
- multi-profile intersection logic
- cloud sync
- automatic consent inference from profile data

Multi-profile/shared filtering belongs to M14.

---

# Exit condition

M13 is complete when a single profile can select one or more desired themes, optionally narrow the current-session state, receive a small profile-backed set of valid options, compose or randomize those options into a reusable scene, and understand why suggestions fit — without changing the authoritative underlying preference profile.
