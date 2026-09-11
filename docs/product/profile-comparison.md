# Profile Comparison

Profile Comparison lets the current browser-local profile compare itself with another person's validated Full Profile Export **without importing, merging, or persistently storing that second profile**.

This document describes the implemented compare-once behavior. Persistent profile ownership/linking is a separate product decision tracked in GitHub Issue #112.

## Core boundary

> **Compare profiles; do not collapse people into one profile.**

The current model is:

```text
CURRENT PROFILE                 TEMPORARY UPLOADED PROFILE
quizzes + catalog               quizzes + catalog
        │                               │
        └──────────────┬────────────────┘
                       ▼
               DERIVED COMPARISON
                       │
              ┌────────┴────────┐
              ▼                 ▼
       comparison view    shared Scene Builder
```

The comparison layer is derived and temporary. It never becomes authoritative evidence for either person.

## Input and lifecycle

The second profile enters comparison through the existing **Full Profile Export** JSON format.

The upload flow:

1. reads the selected JSON in the browser;
2. validates it with the normal profile backup parser;
3. derives a small backup summary;
4. builds the catalog/profile inputs needed for comparison;
5. retains the resulting comparison model for the active comparison only.

The upload is **not** routed through destructive profile import.

The current profile is never replaced or modified by comparison.

Choosing another file, ending comparison, or navigating away clears the temporary comparison candidate and participant-intent state.

## Uploaded data retained for comparison

The current comparison candidate retains only the data needed for the active comparison flow:

- uploaded display name;
- backup export timestamp;
- current profile catalog result view;
- uploaded profile catalog result view;
- derived shared-profile comparison.

The raw parsed backup is not retained as another editable profile.

Rewards & Punishments and saved-scene domains may exist in the validated backup and may contribute to the displayed backup summary, but the current M14 comparison model does not retain or compare those domains after validation.

## Profiles remain independent

Each profile's evidence remains separate.

Comparison must never:

- write uploaded evidence into the current profile;
- write current-profile evidence into the uploaded profile;
- synthesize a merged profile and treat it as another evidence source;
- turn a derived shared result into direct preference evidence;
- rewrite quiz, catalog, ranking, headspace, or Signal state for either person.

Shared results are recomputable views over two inputs.

## Catalog comparison states

The current catalog comparison model classifies each known item into one of these derived states:

```ts
type SharedItemState =
  | "mutual_positive"
  | "complementary"
  | "mutual_curious"
  | "one_positive_one_curious"
  | "different_context"
  | "excluded"
  | "unknown";
```

These states intentionally distinguish different kinds of shared fit instead of flattening everything into one compatibility percentage.

### Excluded

If either profile has an authoritative overall catalog exclusion for the item, the comparison state is `excluded`.

One person's enthusiasm never overrides the other person's explicit boundary.

### Complementary

`complementary` requires actual compatible directional evidence:

```text
Profile A Giving + Profile B Receiving
or
Profile A Receiving + Profile B Giving
```

General Overall preference is intentionally **not** used as a fallback for directional complementarity.

Therefore:

```text
"We both like this"
```

is mutual interest, not evidence that the two people want opposite activity sides.

### Mutual positive

`mutual_positive` means both profiles directly marked the activity positively at the Overall level.

### Mutual curious / one positive + one curious

Curiosity remains distinguishable from confirmed positive interest so downstream exploration can be more conservative.

### Different context

If both profiles have positive directional interest but the currently known sides do not form a direct Giving/Receiving pair, the item may be classified `different_context` rather than incompatible.

### Unknown

Insufficient direct evidence remains `unknown`.

Unknown is not mismatch.

Pairwise ranking evidence may help explain that an item has relative evidence, but pairwise comparisons alone do not manufacture an absolute shared-positive state.

## Semantic complementarity

Catalog identity is not the only way two profiles can fit together.

The comparison engine can also derive semantic complements through explicit `sharedInteractionMappings` between supported concepts such as:

- canonical/legacy Signal concepts used by the current compatibility layer;
- roles/headspaces;
- contextual/dynamic modes.

A semantic complement is shown only when both sides have sufficient derived affinity/evidence coverage and an explicit mapping says the concepts can meaningfully interact.

A mapping means:

> these concepts can form a useful interaction pattern

It does **not** mean:

> these identities are required pairs

or:

> one concept proves the other person's authority role.

## Authority, activity side, and role semantics

Shared comparison must preserve the same semantic separation as the individual profile.

Examples:

- Giving pain ↔ Receiving pain is an activity-side complement, not proof of Dominant/submissive identity.
- Giving restraint ↔ Receiving restraint does not establish authority orientation.
- Predator ↔ Prey may be a headspace complement without establishing D/s orientation.
- Caregiver-related ↔ nurtured-play patterns may be meaningful without assigning authority.

Authority-specific claims require authority-specific evidence.

See [Authority, Activity Side & Role Semantics](../authority-activity-role-separation.md).

## Temporary participant intent

During an active comparison, each participant can select concepts they want to bring to the interaction right now.

Participant intent is temporary query state, not profile evidence.

It may include:

- direction-neutral contextual modes;
- directional Signal concepts surfaced through explicit interaction mappings;
- complementary roles/headspaces surfaced through explicit interaction mappings.

The two participants select intent independently.

Explicit mapped pairings can then be derived when the selected concepts form a supported relationship.

Temporary intent must not:

- change quiz scores;
- assign permanent roles/headspaces;
- rewrite catalog preferences;
- become stored canonical Signal evidence.

## Shared Scene Builder

The temporary comparison can feed Scene Builder so scene candidates are constrained by both profiles.

Shared candidate behavior preserves individual boundaries and the distinction between confirmed and exploratory evidence.

### Automatic eligibility

Confirmed shared candidates may include:

- mutual-positive items;
- complementary directional items;
- items explicitly supported by both participants' current-session choices.

### Exclusions

An item is removed from shared suggestions when:

- either participant marks it `Not tonight` for the current session; or
- the comparison identifies an authoritative exclusion.

### Exploration

Curious or different-context items may appear as exploration suggestions or participate under explicit Explore behavior rather than being silently treated as confirmed shared preference.

### Intent-to-theme bridge

Selected participant-intent concepts can map into Scene Builder theme IDs.

Direction-neutral contextual modes remain direction-neutral: the bridge must not reverse-infer a directional role from their component Signals.

The scene candidate score is runtime composition logic only. It does not write back into either profile.

## Privacy and local processing

The implemented comparison flow is local/browser-only.

Current privacy behavior:

- the selected file is read and parsed locally;
- the upload is not imported into the current profile;
- it is not saved as another profile;
- the comparison layer retains derived data needed for the active view rather than retaining the raw backup as a second identity;
- ending comparison or navigating away discards the temporary comparison and participant intent;
- normal Full Profile Export / Import remains a separate workflow.

Current Shared Scene Builder does not use shared Rewards & Punishments add-ons because both profiles' contextual suitability is not yet modeled in that shared path.

## Current non-goals

Profile Comparison currently does **not** provide:

- persistent linked profiles;
- a profile switcher;
- multiple editable local identities;
- cloud profile synchronization;
- invitation/accept/revoke flows;
- delegated editing of another person's profile;
- imported-profile editing;
- a synthetic merged profile;
- one Overall compatibility percentage;
- shared Rewards & Punishments comparison;
- persistent participant intent.

Those behaviors must not be implied by the temporary upload flow.

## Future persistent profile model

Persistent ownership/linking is intentionally unresolved.

Product decision context lives in the private Kink Profile Notion workspace under **Shared Profiles & Linking — Product Model**. Actionable decision/work tracking lives in GitHub Issue #112.

Once a persistent model is chosen and implemented, update durable repository docs to describe the behavior that actually landed rather than restoring a milestone planning document.

## Implementation anchors

Current behavior is primarily implemented in:

- `src/ProfileComparisonPage.tsx` — upload lifecycle, temporary state, privacy messaging, participant intent, Shared Scene Builder entry;
- `src/lib/profileComparisonUpload.ts` — validated upload → temporary comparison candidate;
- `src/lib/sharedProfileComparison.ts` — catalog relationship states + semantic complement derivation;
- `src/lib/sharedParticipantIntent.ts` — temporary participant concepts and explicit pairings;
- `src/lib/sharedSceneCandidates.ts` — two-profile Scene Builder eligibility and intent/theme bridging;
- `src/data/sharedInteractionMappings.ts` — explicit semantic complement mappings.

## Invariants

1. Comparison never becomes import.
2. Profiles remain independent evidence sources.
3. Shared results are derived and non-authoritative.
4. Overall preference does not fabricate directional complementarity.
5. Pairwise ranking alone does not fabricate absolute shared preference.
6. Unknown is not mismatch.
7. Either person's authoritative exclusion can block shared automatic suggestions.
8. Current-session intent is temporary.
9. Giving/Receiving does not infer Dominant/submissive authority.
10. Uploaded comparison state does not silently become a persistent owned or linked profile.
