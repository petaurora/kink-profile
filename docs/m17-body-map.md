# M17 — Body Map

**Status:** planned  
**Roadmap milestone:** M17  
**Primary boundary:** M17 adds a simple front/back body map where each predefined body region has one general preference state. It does **not** model different interaction types, notes, conditions, partner compatibility, or scene-builder rules in v1.

---

## Goal

Give users a quick visual way to answer:

> **How do I generally feel about touch/contact in this area?**

The first version should stay deliberately small:

1. view a front or back body diagram
2. tap one body region
3. choose a state/color
4. see that region update
5. persist the map with the profile

Body Map v1 is a visual preference surface, not a full consent/context engine.

---

# Core product rule

> **One region, one general state.**

A region may become more contextual later, but v1 stores only one value per region.

Do not add interaction-specific variants such as impact vs touch vs restraint during this milestone.

---

# State model

Each region supports exactly four states:

| State | Meaning | Visual |
| --- | --- | --- |
| `yes` | generally welcome / liked | green |
| `maybe` | conditional, cautious, or ask-first | yellow |
| `neutral` | neutral, unset, or no strong preference | gray |
| `no` | generally not okay / a limit | red |

Suggested type:

```ts
export type BodyMapState = 'yes' | 'maybe' | 'neutral' | 'no';
```

For v1, `neutral` may also represent a region the user has not explicitly configured yet. A separate `unset` state is not required.

---

# Interaction model

The interaction is **region-first**.

1. The user taps/clicks a body region.
2. The selected region is clearly highlighted.
3. A compact state picker opens.
4. The picker names the region, for example **Left Inner Thigh**.
5. The user chooses Yes, Maybe, Neutral, or No.
6. The region immediately updates to the selected state/color.

Do not use a paint-first workflow in v1.

The state picker may be a bottom sheet, popover, or modal depending on viewport size. Mobile usability is the priority.

---

# Body region model

Body regions should be implemented as stable named IDs rather than inferred from pixel coordinates.

Left/right distinctions are first-class where a user could reasonably have different preferences on each side.

Inner thighs are intentionally modeled separately from the rest of the thigh.

## Front regions

- head
- neck
- left shoulder
- right shoulder
- chest
- left breast
- right breast
- stomach
- pelvis
- left upper arm
- right upper arm
- left forearm
- right forearm
- left hand
- right hand
- left outer thigh
- right outer thigh
- left inner thigh
- right inner thigh
- left knee
- right knee
- left shin/calf
- right shin/calf
- left foot
- right foot

## Back regions

- head
- neck
- upper back
- lower back
- left shoulder
- right shoulder
- left upper arm
- right upper arm
- left forearm
- right forearm
- left hand
- right hand
- butt
- left back thigh
- right back thigh
- left back knee
- right back knee
- left calf
- right calf
- left foot
- right foot

The exact SVG geometry may be refined during implementation, but the product model should preserve stable IDs once released.

---

# Data contract

Keep the persisted shape small and explicit.

```ts
export interface BodyMapData {
  front: Record<FrontBodyRegionId, BodyMapState>;
  back: Record<BackBodyRegionId, BodyMapState>;
}
```

Example:

```json
{
  "front": {
    "neck": "maybe",
    "leftInnerThigh": "yes",
    "rightInnerThigh": "maybe",
    "leftHand": "yes",
    "rightHand": "neutral"
  },
  "back": {
    "upperBack": "yes",
    "lowerBack": "maybe",
    "butt": "yes"
  }
}
```

Implementation may either materialize every region with `neutral` or store only non-neutral overrides. The public/profile behavior must remain equivalent.

---

# Rendering

Use an **SVG front/back body diagram with individually addressable regions**.

Each selectable region should:

- have a stable region ID
- be keyboard/click/touch selectable
- support state-based fill styling
- have a sufficiently generous hit target for mobile
- map to a human-readable label in the state picker

Do not use a flat raster image with hand-maintained coordinate hit boxes as the primary implementation.

The reference image that inspired the feature is conceptual only; do not copy its artwork.

---

# Main UI

## Editor

The Body Map editor should contain:

- page title: **Body Map**
- short explanation of the four states
- front/back toggle or tabs
- body diagram
- compact legend
- region state picker after selection

A user should not have to scroll through a giant table of body regions to use the primary experience.

## Profile display

The Overall/Profile surface may show a read-only Body Map section containing:

- front map
- back map
- legend

Editing should route into the Body Map editor rather than putting detailed editing controls directly into the profile summary.

---

# Persistence and lifecycle

Body Map belongs to the user's profile data.

M17 must include:

- browser-local persistence
- full profile backup/export
- full profile import/restore
- selective/full reset behavior consistent with M9
- schema/version migration if required

If Body Map is absent from an older profile, treat it as an unconfigured/neutral map.

---

# Accessibility and mobile behavior

v1 remains color-led, but state should not be communicated by color **only** during editing.

At minimum:

- the state picker shows the state name in text
- the selected region name is shown in text
- focus/selection has a non-color indicator
- touch targets are usable on a phone
- front/back switching is obvious

Pattern fills or icons on the full diagram are future polish, not required for v1.

---

# Explicitly out of scope

Do **not** add these to M17 v1:

- separate maps for touch, impact, restraint, pain, sexual touch, etc.
- freeform notes on body regions
- multiple intensities
- custom user-created regions
- conditional rules
- session-specific overrides
- partner/body-map comparison
- M14 compatibility scoring
- M13 Scene Builder filtering
- recommendation/inference logic
- automatic mapping from kink preferences
- body-type customization

These can be reconsidered only after the simple map proves useful.

---

# Future expansion candidates

Possible later refinements include:

- interaction-specific maps
- notes/conditions per region
- finer-grained region splitting
- left/right split for additional regions such as butt
- linked-profile comparison
- Scene Builder filtering
- share/export-specific presentation
- session-specific temporary maps

These are **not commitments**.

---

# Acceptance criteria

M17 is complete when:

- [ ] a Body Map editor exists
- [ ] front and back diagrams are available
- [ ] the user can select an individual region
- [ ] selection opens a four-state picker
- [ ] choosing a state updates that region visually
- [ ] left/right regions can store different values
- [ ] left/right inner thighs are distinct regions
- [ ] Body Map persists with the profile
- [ ] Body Map survives full export/import
- [ ] reset behavior is defined and tested
- [ ] the saved Body Map can be viewed from the profile
- [ ] the editor is usable on mobile

---

# Suggested implementation slices

## M17.1 — Region + state contract
- define front/back region IDs
- define `BodyMapState`
- define labels and default behavior
- add profile storage/migration shape

## M17.2 — Interactive SVG
- create original front/back diagram assets
- implement stable clickable SVG regions
- verify left/right and inner-thigh hit regions
- add responsive rendering

## M17.3 — Region editor
- tap region → open state picker
- display selected region name/current state
- assign Yes / Maybe / Neutral / No
- update map immediately

## M17.4 — Persistence + lifecycle
- autosave with profile
- include in export/import
- include in reset behavior
- test older-profile compatibility

## M17.5 — Profile display
- add read-only Body Map section
- render front/back states + legend
- provide clear edit navigation

## M17.6 — Mobile/accessibility QA
- verify touch targets
- verify side-specific selection
- verify inner-thigh selection
- verify focus/selection indicators
- regression test profile lifecycle

---

# Scope guardrail

M17 succeeds by being **simple enough to actually use**.

If implementation starts needing matrices for activity type, authority context, partner context, conditions, notes, or scene logic, that work belongs in a later expansion rather than Body Map v1.
