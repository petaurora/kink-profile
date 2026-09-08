# M14 — Shared Profiles, Comparison & Partner Integration

**Status:** planned  
**Roadmap milestone:** M14  
**Primary boundary:** M14 allows two independent profiles to coexist in the same app, compares them without merging them, derives a shared interaction space, and lets that shared space filter M13 Scene Builder suggestions.

---

## Goal

Add first-class **shared-profile** support that answers:

1. **What do these two profiles have in common?**
2. **Where are their preferences complementary rather than identical?**
3. **What might be worth discussing or exploring together?**
4. **What is excluded from shared suggestions because one person does not want it?**
5. **If one person chooses a role/headspace/theme for themselves, what compatible options exist in the other person's profile?**
6. **Can M13 build scenes from the intersection without contaminating either individual profile?**

The product principle is:

> **Compare profiles; do not collapse people into one profile.**

---

# High-level model

M14 introduces multiple independent profile containers plus a derived shared view.

```text
PROFILE A                       PROFILE B
quizzes                         quizzes
catalog                         catalog
rankings                        rankings
M11 context                     M11 context
M7 aggregate                    M7 aggregate
   │                               │
   └──────────────┬────────────────┘
                  ▼
          SHARED DERIVATION
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
 comparison view       M13 shared filtering
```

The shared layer is derived.

It must never overwrite either person's authoritative evidence.

---

# Core semantic rules

## 1. Profiles remain independent

Each profile owns its own:

- display name
- quiz answers/progress
- canonical signals
- headspaces/dynamic modes
- explicit catalog preferences
- pairwise ranking/history
- M11 reward/punishment state
- saved M13 scenes where ownership is profile-specific
- local settings where applicable

Changing Profile A must not modify Profile B.

## 2. Shared results are derived, not stored as truth

Shared/comparison values may be cached for performance but must be recomputable from the two profiles.

Do not create a synthetic merged profile that becomes another evidence source.

Forbidden model:

```text
Jackie score + Taylor score = relationship score
```

Preferred model:

```text
Profile A evidence
Profile B evidence
interaction mappings
        ↓
derived relationship between the two values
```

## 3. Similarity is not the only useful match

M14 must distinguish at least:

### Shared positive interest

Both people independently have positive evidence for the same activity/theme.

### Complementary interaction

One person's preferred side/mechanism meaningfully pairs with the other person's preferred side/mechanism.

Examples may include:

- pain_giving ↔ pain_receiving
- giving_restraint ↔ receiving_restraint
- giving_positioning ↔ receiving_positioning
- caretaking ↔ nurtured_play
- Predator ↔ Prey

### Shared curiosity

Both are Curious/Unsure/Explore-compatible.

### One-like / one-curious

One profile has positive direct evidence and the other has curiosity/limited evidence.

### Different flavor

Both may like a broader theme for different underlying reasons.

### Excluded mismatch

One person's explicit boundary/disinterest means the item is not eligible for shared automatic suggestions.

These states should not be flattened into one compatibility percentage.

## 4. Hard limits and direct exclusions are authoritative

For shared M13 suggestions, if either profile has:

- Hard Limit
- Not Applicable
- Not Interested
- current-session Not tonight

the item is excluded from automatic shared selection.

One person's enthusiasm never overrides the other person's boundary.

## 5. Complementarity must preserve authority/activity/role separation

M14 interaction mappings must not recreate previously-fixed semantic errors.

Examples:

- pain_giving ↔ pain_receiving is an activity-side complement, not proof of Dominant/submissive orientation
- giving restraint ↔ receiving restraint is not proof of authority
- Caregiver ↔ Little may be a contextual relational fit without assigning D/s authority
- Predator ↔ Prey may be a headspace complement without assigning dominance/submission

Authority-specific comparison must use authority-specific D/s evidence.

## 6. Incomplete profiles remain incomplete

Unknown must remain unknown.

Do not label an absent preference as a mismatch.

Shared views must distinguish:

- confirmed fit
- possible fit
- unknown / not explored
- explicit mismatch/exclusion

---

# Multi-profile storage

M14 requires evolving the current single-profile assumption.

Conceptually:

```ts
interface ProfileContainer {
  id: ProfileId;
  displayName: string;
  createdAt: string;
  updatedAt: string;

  // existing authoritative profile domains live under this identity
}

interface AppProfileRegistry {
  schemaVersion: number;
  activeProfileId: ProfileId;
  profileIds: ProfileId[];
}
```

Exact implementation may differ, but requirements are:

- stable ProfileId
- multiple independent profile stores
- explicit active profile
- migration of the current single profile into one ProfileContainer
- no evidence loss
- no accidental cross-profile key collisions

---

# Migration

Existing users must keep all current data.

M14.1 should migrate:

```text
current single-profile local state
        ↓
generated stable ProfileId
        ↓
ProfileContainer A
```

The current configured display name becomes that profile's display name.

Migration must preserve:

- quiz progress/results
- catalog explicit states
- pairwise history/runs
- M7-compatible source evidence
- M9 identity/settings
- M11 data if implemented
- M13 saved scenes if implemented

The migration should be versioned and tested.

---

# Profile management

Initial local-only behavior should support:

- create profile
- switch active profile
- rename profile
- import a second profile from a full-profile backup where compatible
- delete/reset one profile with deliberate confirmation
- export one profile independently

M14 does **not** require accounts or cloud persistence.

M10 may later provide optional persistence/sync.

---

# Shared-pair identity

A comparison needs stable identity independent of display names.

Conceptually:

```ts
interface SharedPairRef {
  profileAId: ProfileId;
  profileBId: ProfileId;
}
```

The canonical pair key should be order-stable so A+B and B+A do not create duplicate derived relationship state unless direction is intentionally part of a specific query.

Shared-pair state should be minimal.

Durable shared state may eventually include explicit pair-level choices, but V1 should prefer recomputable derived comparison.

---

# Comparison engine

The comparison engine should evaluate stable catalog IDs and stable semantic concepts.

For each catalog item, derive a relationship state such as:

```ts
type SharedItemState =
  | 'mutual_positive'
  | 'complementary'
  | 'mutual_curious'
  | 'one_positive_one_curious'
  | 'different_context'
  | 'excluded'
  | 'unknown';
```

Exact labels are implementation detail; the semantic distinction is required.

The engine should preserve why the state was assigned:

- direct preference
- pairwise evidence
- directional mapping
- headspace/dynamic-mode relationship
- current-session override
- exclusion

Derived shared state should never feed back into either profile.

---

# Interaction mapping layer

M14 needs explicit versioned mappings for concepts that can play off one another.

Examples:

```text
pain_giving          ↔ pain_receiving
giving_restraint     ↔ receiving_restraint
giving_positioning   ↔ receiving_positioning
giving_discipline    ↔ receiving_discipline
giving_control       ↔ receiving_control
caretaking           ↔ nurtured_play
authority            ↔ surrender
Predator             ↔ Prey
Owner / Handler      ↔ Pet
```

Not all mappings are symmetrical in meaning.

The mapping model should support:

- source semantic ID
- target semantic ID
- relationship kind
- weight/strength
- optional directional interpretation
- explanation copy

A mapping means:

> these concepts can form a meaningful interaction

It does **not** mean:

> these identities are required pairs

or:

> one score proves the other person's role.

---

# Comparison experience

The UI should emphasize useful interaction patterns rather than a giant table.

Suggested sections:

## We both love

Mutual direct positive evidence.

## We fit together here

Complementary activity-side, role/headspace, or dynamic-mode patterns.

## Maybe explore

Mutual curiosity or one-positive/one-curious candidates.

## Different flavors

Shared broad interests with different underlying reasons or sides.

## Not for shared suggestions

Explicit mismatches/exclusions.

Unknown data should not be dumped into the mismatch area.

---

# Headspace / dynamic-mode comparison

M14 may surface meaningful cross-profile relationships such as:

```text
Profile A                    Profile B
Pet ---------------------- Owner / Handler
Prey --------------------- Predator
Nurtured Play ------------ Caretaking
Surrender ---------------- Authority
```

Only show links supported by:

- evidence on both sides
- a validated interaction mapping
- sufficient coverage for the relevant composed result

Avoid implying that a mapped pair is exclusive or mandatory.

---

# M13 integration

The most important M14 integration is shared scene filtering.

M13 alone:

```text
Profile A
+ current state
+ scene themes
→ candidate space
```

M14-enabled M13:

```text
Profile A
+ Profile B
+ A current state
+ B current state
+ selected themes/headspaces
→ shared candidate space
```

Example:

One person selects:

- Pain Giving
- Authority
- Owner / Handler

The other profile may contribute:

- Pain Receiving
- Surrender
- Pet
- restraint preferences
- current-session Yes/Maybe/No

M14 should return only options that satisfy the relevant shared constraints.

---

# Self-selected current headspace

M14 should let either person choose what they want to bring to the interaction **right now** without changing their permanent profile.

Examples:

- "I want to be in Caregiver space tonight."
- "I want Predator."
- "I want stronger Authority."
- "I want to give pain."
- "I want a softer/nurturing role."

These are current-session intents.

They act as additional M13 query dimensions.

They must not:

- rewrite quiz scores
- rewrite M7 orientation
- assign permanent headspaces
- silently change catalog preference

---

# Shared filtering rules

For an item/activity to enter the normal shared M13 pool:

1. neither profile has an authoritative exclusion
2. the relevant activity-side requirements are compatible where direction matters
3. there is positive direct support on the participant(s) whose preference is relevant
4. current-session overrides permit it
5. selected scene themes can be covered across the scene
6. inferred-only support is not enough for silent randomization

Curiosity may be allowed only under explicit Explore behavior.

---

# Current-session pair state

M14 may extend M13's temporary state to both profiles.

Possible pair-session model:

```ts
interface SharedSceneSession {
  profileAId: ProfileId;
  profileBId: ProfileId;

  profileAIntent?: SceneParticipantIntent;
  profileBIntent?: SceneParticipantIntent;

  selectedThemeIds: SceneThemeId[];
  temporaryOverrides: Record<ProfileId, SessionPreferenceOverrides>;
}
```

This state should be ephemeral by default.

Do not persist "tonight" choices as permanent profile evidence.

---

# Privacy and sharing

M14 raises a stronger privacy boundary than single-profile mode.

Requirements:

- one profile must not silently expose raw evidence to another export/share artifact
- comparison UI should use presentation-level derived values
- individual full backups remain private
- shared comparison exports, if later added, must be explicit
- raw quiz answers and raw pairwise comparison history should not be required for a normal comparison presentation
- no cloud/account requirement in M14 V1

If M10 cloud persistence later exists, pair sharing requires a separate consent/threat-model design.

---

# Backup/import/reset

## Backup

A full app-level backup may eventually contain multiple profiles.

However, M14 should preserve the ability to export one profile independently.

## Import

Importing a profile should create or deliberately replace a chosen profile; it must never silently merge evidence between two people.

## Reset/delete

Profile-specific reset/delete actions affect only the selected ProfileId.

Shared derived comparison should recompute afterward.

---

# M14 slices

## M14.1 — Multi-profile storage + migration

- [ ] define stable ProfileId + profile registry
- [ ] migrate current single-profile state without evidence loss
- [ ] scope all authoritative storage by ProfileId
- [ ] add migration/regression tests

## M14.2 — Profile management + switcher

- [ ] create profile
- [ ] switch active profile
- [ ] rename/delete/reset one profile safely
- [ ] import/export one profile independently
- [ ] preserve existing M9 lifecycle semantics per profile

## M14.3 — Derived comparison engine

- [ ] compare stable catalog IDs
- [ ] classify mutual/complementary/curious/excluded/unknown states
- [ ] preserve provenance/explanation
- [ ] keep comparison fully derived/no feedback

## M14.4 — Comparison UI

- [ ] We both love
- [ ] We fit together here
- [ ] Maybe explore
- [ ] Different flavors
- [ ] Not for shared suggestions
- [ ] sparse/incomplete profile handling
- [ ] plain-language why-this-match explanations

## M14.5 — Interaction mappings

- [ ] define versioned directional activity mappings
- [ ] define validated role/headspace mappings
- [ ] define dynamic-mode relationship mappings
- [ ] preserve authority/activity/role semantic boundaries
- [ ] add deterministic mapping tests

## M14.6 — Current participant intent

- [ ] allow each profile to select current headspace/mode/activity-side intent
- [ ] keep intent session-local
- [ ] combine participant intent with current-session overrides
- [ ] do not mutate permanent profile evidence

## M14.7 — Shared M13 scene filtering

- [ ] feed both profiles into the M13 candidate engine
- [ ] enforce either-person exclusions
- [ ] support complementary rather than only identical interests
- [ ] support theme coverage across participants/components
- [ ] keep inference-only items out of silent randomization
- [ ] explain why a shared scene item fits both people

## M14.8 — Lifecycle, privacy + polish

- [ ] app-level multi-profile backup strategy
- [ ] independent profile export/import remains supported
- [ ] comparison/share privacy review
- [ ] accessibility/mobile polish
- [ ] regression-run M6/M7/M9/M11/M13 boundaries
- [ ] finalize docs and mark M14 complete

---

# Non-goals

M14 does not initially provide:

- cloud profile sharing
- remote invitations
- partner accounts
- chat/messaging
- compatibility percentage
- relationship health scoring
- automatic consent
- merged evidence/profile scores
- recommendation from one person's dislikes
- mandatory role pairings
- permanent profile changes from current-session headspace selection

---

# Exit condition

M14 is complete when two independent profiles can coexist locally, be switched and managed without evidence contamination, produce an explainable shared comparison that distinguishes mutual and complementary fit from unknown/excluded states, and feed both profiles plus current participant intent into M13 so the Scene Builder can produce a bounded play space that fits both people.
