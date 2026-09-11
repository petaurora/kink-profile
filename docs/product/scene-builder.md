# Scene Builder

Scene Builder turns the current profile into a smaller, moment-specific set of activities and can compose those activities into a reusable scene.

Its purpose is to reduce decision load while preserving profile boundaries and temporary session choice.

## Product boundary

> **Externalize context. Preserve choice. Reduce decision load.**

Scene Builder is a composition/query layer over existing profile systems. It does not create a second preference model, infer consent, assign obligations, or rewrite the user's underlying profile.

The core flow is:

```text
profile evidence + selected themes + current-session choices
                         ↓
                 candidate derivation
                         ↓
              bounded suggestion space
                         ↓
             scene composition / randomize
                         ↓
                  optional saved scene
```

## Themes are queries, not evidence

Scene themes represent what sounds relevant **right now**.

A theme can map to existing semantic/product concepts such as:

- catalog categories;
- Signals;
- roles/headspaces;
- contextual modes;
- Overall Facets.

Theme selection helps find candidates. It does not alter canonical Signal evidence, catalog preferences, roles/headspaces, or facets.

The current taxonomy lives in `src/data/sceneThemes.ts` and uses stable theme IDs.

## Multi-theme coverage

When several themes are selected, Scene Builder does not require every activity to match every theme.

Instead, the candidate model can provide:

- per-theme lanes;
- bridge candidates that match more than one theme;
- a coverage ordering that tries to represent the selected theme set across multiple candidates.

This prevents a query such as:

```text
Pain + Service + Soft
```

from collapsing to only activities that individually satisfy all three ideas.

## Candidate inputs

Scene candidate derivation consumes the existing catalog result view and may consider:

- selected theme fit;
- direct catalog preference;
- pairwise ranking evidence;
- inferred catalog affinity;
- requested exploration mode;
- requested intensity band;
- current-session override.

These inputs produce a **runtime candidate score**. That score is presentation/composition logic and must not be persisted back into the profile as evidence.

## Hard exclusions

The following general catalog states are not eligible for Scene Builder candidates:

- Hard Limit;
- Not Interested;
- Not Applicable.

A current-session `Not tonight` choice also removes the item from the candidate set.

These exclusions are enforced before candidate composition/randomization.

No ranking, inferred affinity, theme fit, or randomizer state may override them.

## Current-session choices

Scene Builder supports three temporary item-level choices:

```text
Yes tonight
Maybe tonight
Not tonight
```

They are stored in `sessionStorage`, separate from durable profile state.

Current-session choices can temporarily override whether an activity belongs in the active play space without rewriting the general catalog preference.

Examples:

```text
General profile: Love
Tonight: Not tonight
→ excluded from this session
```

```text
General profile: unrated
Tonight: Yes tonight
→ may participate as direct session evidence for this scene
```

Clearing/resetting scene-session state removes these temporary overrides.

## Exploration modes

The current candidate engine supports:

```text
familiar
mixed
explore
```

Exploration mode changes which evidence can make an item eligible.

Important boundaries:

- direct Love/Like evidence can participate normally;
- Curious requires explicit Explore behavior unless a current-session choice promotes it;
- pairwise-only evidence may participate outside Familiar mode under the current candidate rules;
- inference-only candidates are never automatically eligible.

Inference-only items are separated into **Suggested to explore** rather than silently entering automatic scene generation.

## Provenance

Candidates retain why they exist in the current play space.

Current provenance classes include:

```text
session
explicit
pairwise
explicit + pairwise
inference only
```

This allows the UI/composition layer to distinguish directly supported candidates from exploration suggestions without pretending all evidence is equivalent.

## Candidate scoring

The current single-profile candidate score combines bounded contributions from:

- strongest selected-theme fit;
- average selected-theme fit;
- direct/session/pairwise evidence strength;
- ranking strength;
- inferred affinity/coverage.

The exact weights live in `src/lib/sceneCandidates.ts` and are implementation constants, not profile semantics.

Candidate score answers:

> **How useful is this item for the current Scene Builder query?**

It does not answer:

> **How much does this person like this activity in general?**

## Intensity filtering

The current scene query supports an intensity preference:

```text
any
light
moderate
intense
```

Catalog intensity metadata is mapped into these broad runtime bands. Variable/unspecified intensity remains eligible rather than being treated as automatically incompatible.

Intensity filtering is session/query behavior only.

## Scene composition

A scene is an ordered collection of components using stable source references.

Current phases are:

```text
Setup
Headspace / transition
Warm-up
Core play
Escalation / challenge
Reward / punishment
Come-down
Aftercare
```

Not every scene contains every phase.

Catalog components reference catalog IDs. Reward/Punishment components reference either an M11 primitive or saved M11 recipe.

Scene-local notes belong to the scene component and do not rewrite the source activity/action.

## Effort modes

Current effort modes shape the default/random composition size and phase plan:

```text
quick      ≈ 3 components
normal     ≈ 5 components
elaborate  ≈ 7 components
```

The exact phase selection is runtime composition behavior rather than a requirement that every saved scene contain a fixed number of components.

Core play is the central required phase concept; other phases are optional depending on the scene and available candidates.

## Editing a composition

The composition model supports component-level editing without regenerating the entire scene.

A scene can preserve stable source references while components are:

- added;
- removed;
- reordered;
- replaced;
- annotated with scene-local notes;
- shuffled individually where compatible replacements exist.

The system should not require the user to define the complete scene before receiving useful suggestions.

## Randomization

Randomization exists to remove decision lift, not to expand eligibility.

Only candidates already marked `automaticEligible` can enter single-profile automatic selection.

The randomizer:

- uses eligible candidates only;
- respects hard and session exclusions established by candidate derivation;
- does not select inference-only exploration suggestions;
- avoids recently picked catalog IDs when alternatives exist;
- stores recent randomizer history in `sessionStorage`;
- can generate a scene composition based on effort mode;
- can shuffle one catalog component without destroying the rest of the scene.

The anti-repeat history currently retains up to ten recent catalog IDs.

Randomization is intentionally not weighted as “highest profile rank always wins.”

## Rewards & Punishments integration

A scene can include an optional Reward/Punishment phase using:

```text
none
reward
punishment
either
```

Scene Builder delegates contextual eligibility to the Rewards & Punishments feature.

Eligible entries may be:

- directly eligible M11 primitives;
- valid random-enabled M11 recipes.

Scene Builder does not make an M11 `never`, `no`, or unrated item eligible merely because it fits the scene theme.

For `either`, the integration chooses between available reward/punishment **contexts first**, then selects an entry within that context so a larger item pool does not bias the context choice.

See [Rewards & Punishments](rewards-punishments.md).

## Saved scenes

Saved scenes preserve the useful authored composition rather than a detached snapshot of candidate scores.

Current saved-scene data includes:

- stable scene ID;
- version;
- name;
- selected theme IDs;
- effort mode;
- exploration mode;
- ordered components with stable source references;
- scene-local component notes;
- created/updated timestamps.

Saved-scene schema and parsing live in `src/lib/sceneLibrary.ts`.

## Stable references and validation

Saved scenes reference underlying catalog/M11 identities rather than copying display text as authoritative identity.

Parsing validates:

- known theme IDs;
- valid effort/exploration values;
- known phase IDs;
- unique component IDs;
- duplicate source references;
- source/phase compatibility;
- bounded scene/component text.

A Reward/Punishment source can only occupy the Reward/Punishment phase, and a normal catalog source cannot masquerade as an M11 source.

Lifecycle/reconciliation logic is responsible for detecting stale or no-longer-valid references rather than assuming a saved scene stays valid forever.

## Persistence boundaries

Scene data has two different lifetimes.

### Durable

Saved scenes/templates are profile-owned persisted data and participate in the profile lifecycle/backup model.

### Session-only

The following are temporary:

- Yes/Maybe/Not tonight overrides;
- recent randomizer history;
- current unsaved query/composition state unless explicitly saved.

Temporary session state must not become general profile preference evidence.

## Explainability

A Scene Builder suggestion should be explainable in product language such as:

- matches selected themes;
- direct positive preference;
- current-session Yes/Maybe;
- strong ranking context;
- Suggested to explore from inferred profile fit.

Normal UI should explain **why the item is here**, not expose internal candidate-score arithmetic as if it were a meaningful user-facing profile percentage.

## Semantic boundaries

Scene Builder must preserve the same distinctions as the overall semantic model.

Examples:

- giving pain does not imply Dominant;
- receiving pain does not imply submissive;
- Pet does not automatically imply submissive;
- Predator does not automatically imply Dominant;
- theme fit does not create preference evidence;
- scene choice does not rewrite canonical Signals.

See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

## Shared Profile integration

The temporary Profile Comparison flow can provide a two-profile candidate view to Shared Scene Builder.

Shared eligibility adds the second profile's evidence and boundaries but preserves the same fundamental rules:

- profiles remain independent;
- either person's explicit/session exclusion can block automatic shared use;
- directional complementarity requires actual compatible directional evidence;
- shared candidate fit remains derived;
- participant intent is temporary.

See [Profile Comparison](profile-comparison.md).

## Current non-goals

Scene Builder does not currently provide:

- automatic consent inference;
- behavioral assignment/enforcement;
- task completion tracking;
- punishment debt/reward economy;
- persistent partner ownership/linking;
- AI-authored narrative scene scripts;
- a single compatibility score;
- automatic promotion of inferred activities into direct preference.

Future product exploration should be tracked in Notion/Issues rather than embedded as speculative sections in this contract.

## Implementation anchors

Current behavior is primarily implemented in:

- `src/data/sceneThemes.ts` — stable scene theme taxonomy;
- `src/lib/sceneCandidates.ts` — eligibility, theme matching, provenance, score, lanes, exploration separation;
- `src/lib/sceneSession.ts` — temporary Yes/Maybe/Not tonight state;
- `src/lib/sceneComposition.ts` — scene phases and component model;
- `src/lib/sceneRandomizer.ts` — automatic composition, shuffle, and anti-repeat;
- `src/lib/sceneRewardPunishment.ts` — M11 eligibility integration;
- `src/lib/sceneLibrary.ts` — saved-scene schema/parsing;
- `src/lib/sceneLibraryStorage.ts` / `src/lib/sceneLifecycle.ts` — durable lifecycle handling.

## Invariants

1. Themes query the profile; they do not create profile evidence.
2. Hard catalog exclusions and `Not tonight` block candidate use.
3. Inference-only items are exploration suggestions, not automatic picks.
4. Curious items require explicit exploration behavior unless session state says otherwise.
5. Candidate score is runtime composition logic, not profile preference.
6. Temporary scene-session state does not rewrite durable profile state.
7. Randomization never broadens eligibility.
8. Saved scenes retain stable source identities rather than detached labels.
9. M11 owns reward/punishment contextual eligibility.
10. Derived scene results never feed back into canonical Signal/catalog evidence.
11. Giving/Receiving does not infer Dominant/submissive authority.
12. Shared Scene Builder preserves both profiles' independent boundaries.
