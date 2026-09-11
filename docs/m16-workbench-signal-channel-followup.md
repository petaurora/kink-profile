# M16 Follow-up — Curation Workbench Signal + Channel Authoring

**Status:** complete — landed in PR #136 / Issue #116  
**Canonical contract:** [M16 Signal + Channel Model](m16-signal-channel-model.md)

This follow-up was created after the runtime Signal + channel migration exposed one remaining compatibility leak: the Curation Workbench was still presenting legacy directional Signal IDs as authoring targets.

That leak is now closed.

## Current Workbench behavior

Workbench relationship editing authors against:

- one of the 37 canonical Signal concepts
- an explicit Signal channel: `overall`, `receiving`, or `giving`
- a continuous relationship weight from 0 through 1

Only channels supported by the selected canonical Signal are offered. Overall-only Signals do not expose fake Receiving/Giving choices.

Example:

```text
Signal: Discipline
Channel: Receiving
Weight: 0.75
```

Legacy IDs such as `receiving_discipline` remain compatibility/source vocabulary only and are not presented as canonical Signal entities or picker options.

## Compatibility boundary

The Workbench curates the canonical/future model immediately while remaining legacy source-file formats are handled behind translation/compatibility boundaries until M16.8 completes broader stable-ID/source migration.

Curators should not need to reason about legacy compatibility IDs.

Catalog source applicability is also kept separate from Signal channels: a catalog mapping's item/activity-side applicability is not itself a Receiving/Giving Signal channel.

## Covered authoring surfaces

The canonical Signal + channel model is used across Workbench relationship editing for:

- quiz question weights
- catalog item Signal mappings
- catalog category Signal mappings
- reward/punishment category Signal mappings
- role/headspace Signal composition
- contextual/underlying mode composition while the internal compatibility layer remains
- Overall Facet Signal references where channel-aware references are valid

The top-level Workbench Signal inventory also uses the 37 canonical concepts rather than the old 45 legacy IDs.

## Proposal export

Workbench proposals preserve Signal + channel distinctly in workspace schema v2.

Before export, the saved workspace is revalidated against the current canonical editor model. Invalid/stale proposals are blocked with actionable errors.

The exported JSON is deterministic for identical workspace state and is intended to be handed back to the repository workflow for review/application. The browser does not authenticate to GitHub or mutate repository data directly.

## Regression coverage

Tests now cover that:

- legacy directional IDs are not canonical picker options
- canonical Signals expose only valid channels
- Overall-only Signals cannot acquire Receiving/Giving channels
- the same Signal may be authored in different valid channels without becoming a duplicate
- saved curation proposals preserve Signal + channel distinctly
- deprecated `direction` leakage is rejected during export validation
- continuous 0–1 weights are accepted across the Workbench/source boundary
- identical workspace state produces identical proposal JSON

Current implementation status belongs to GitHub Issues/PRs; this file remains only as compatibility and migration context.
