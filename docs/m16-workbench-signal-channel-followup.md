# M16 Follow-up — Curation Workbench Signal + Channel Authoring

The runtime Signal model has been migrated to canonical semantic concepts with optional Overall / Receiving / Giving channels, but the Curation Workbench still exposes legacy directional Signal IDs as independent authoring targets in several relationship editors.

## Problem

The Workbench currently sources relationship options from the legacy `signalDefinitions` vocabulary, so users can still select IDs such as:

- `pursuit_giving`
- `receiving_positioning`
- `giving_positioning`
- `receiving_discipline`
- `giving_discipline`

These are compatibility/source IDs and should not be presented as the canonical authoring model.

## Required behavior

Workbench relationship editing should author against:

- canonical Signal concept
- optional Signal channel: `overall`, `receiving`, or `giving`
- relationship weight

Only channels supported by the selected canonical Signal should be offered. Overall-only Signals should not show a Receiving/Giving selector.

Example:

```text
Signal: Discipline
Channel: Receiving
Weight: 0.75
```

rather than selecting `receiving_discipline` as a separate Signal.

## Compatibility boundary

The Workbench should curate the canonical/future model immediately, while any remaining legacy source-file formats are handled by a translation/application boundary until M16.8 completes stable-ID/source migration.

Do not require curators to reason about legacy compatibility IDs.

## Scope

Audit and migrate every Workbench surface that authors Signal relationships, including at minimum:

- quiz question weights
- catalog item Signal mappings
- catalog category Signal mappings
- reward/punishment category Signal mappings
- role/headspace Signal composition
- any remaining Dynamic Mode compatibility editors while those definitions still exist internally
- Overall Facet Signal references where channel-aware references are valid

Also update inventory/display labels so legacy IDs do not leak into current authoring UI unless explicitly shown in a compatibility/debug context.

## Validation

Add regression coverage proving that:

- legacy directional IDs are not offered as canonical picker options
- canonical Signals expose only valid channels
- Overall-only Signals cannot acquire Receiving/Giving channels
- saved curation proposals preserve Signal + channel distinctly
- export/application tooling can translate proposals safely while legacy source formats remain

This is an M16 Workbench follow-up discovered after the runtime Signal + channel migration. It should be completed before substantial additional manual curation so the Workbench does not curate a deprecated vocabulary.
