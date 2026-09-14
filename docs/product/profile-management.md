# Profile Management

This document defines the current product contract for profile identity, selective reset, private backup/restore, and human-facing share exports.

## Product boundary

Profile management answers four lifecycle questions:

1. **Identity** — what display name does this local profile use?
2. **Reset** — which authoritative source data should be deleted while leaving other sources intact?
3. **Backup / restore** — how can the complete locally stored profile be moved or restored?
4. **Sharing** — how can a curated human-readable summary be exported without exposing the private backup payload?

The critical distinction is:

```text
PRIVATE PROFILE BACKUP
complete + machine-readable + restore-capable

SHARE SUMMARY
curated + human-readable + presentation-only
```

These are different artifacts and must remain different contracts.

Profile management does **not** define profile scoring, catalog ranking, Rewards & Punishments semantics, Scene Builder semantics, profile comparison, accounts, cloud sync, or persistent multi-profile ownership/linking.

Persistent profile ownership/linking is separate future product work tracked outside this contract.

## Storage model

The current product is browser-local. Profile-owned authoritative state is split across domain stores rather than one giant object.

Current durable domains include:

- profile settings / display name;
- quiz answers and progress;
- explicit catalog preferences;
- profile boundary-summary assertions such as an affirmative “I currently have no Hard Limits” statement;
- This-or-That comparisons and ranking-run history;
- Rewards & Punishments contextual preferences, pairwise ranking history, and recipes;
- saved Scene Builder scenes.

The boundary-summary domain is deliberately separate from catalog evidence. An explicit-none assertion is a direct personal statement about the summary, not a fake catalog preference and not inferred evidence.

Derived profile outputs are recomputed from authoritative sources and are not an additional source of truth.

Session-only state is intentionally outside the durable profile lifecycle. In particular, Scene Builder `Yes tonight` / `Maybe tonight` / `Not tonight` overrides and Scene randomizer anti-repeat history are session state, not profile backup state.

## Profile identity

Profile settings currently use schema version `1` and contain one editable identity field:

```ts
type ProfileSettings = {
  schemaVersion: 1;
  displayName: string;
};
```

The default display name is `Pet`.

Display names are normalized by:

- trimming leading/trailing whitespace;
- collapsing internal whitespace runs;
- limiting the value to 48 characters;
- falling back to the default when the stored or submitted value is empty.

The display name is profile identity/presentation metadata. It must not be confused with taxonomy labels such as the Pet headspace.

Settings persist in local storage and participate in private backup/restore and selective reset.

## Selective reset

Reset is source-aware deletion, not a derived-profile edit.

The UI uses a three-step lifecycle:

```text
choose scopes
   ↓
review what will reset / what will remain
   ↓
confirm destructive mutation
```

The first reset interaction never immediately deletes data.

### Reset scopes

The current reset model supports these independent scopes:

#### Individual quiz sections

Selected quiz sections lose their persisted answers/progress/completion state.

Other quizzes, catalog preferences, ranking data, Rewards & Punishments, scenes, and settings remain unless separately selected.

#### Explicit catalog preferences

Clears explicit catalog preference state, including limits and directional overrides.

Because the separate boundary-summary assertion describes the same explicit boundary review surface, this scope also clears an affirmative “I currently have no Hard Limits” assertion. Clearing preferences must return an empty Hard Limits summary to **unknown**, not manufacture a new explicit-none answer.

This does not delete This-or-That comparisons or ranking-run history.

#### This-or-That and ranking history

Clears raw catalog pairwise comparisons and replaces ranking history with a fresh initial active run.

This does not delete explicit catalog preferences, boundary-summary state, or quiz state.

See [Kink This-or-That Ranking](../kink-this-or-that-ranking.md) for the ranking evidence contract.

#### Rewards & Punishments

Clears the entire authoritative Rewards & Punishments domain together:

- contextual suitability/preferences;
- notes and random-pool flags stored with those preferences;
- Reward/Punishment pairwise comparisons;
- saved recipes.

See [Rewards & Punishments](rewards-punishments.md) for that domain's semantics.

#### Saved scenes

Clears the durable Scene Builder library, including saved compositions and scene-local notes.

It does not target temporary Scene Builder session overrides because those are not durable profile state.

See [Scene Builder](scene-builder.md).

#### Profile settings

Restores profile settings to their defaults, including the default display name.

### Reset everything

`Reset everything` is a shortcut that selects every supported durable reset scope. It still flows through review and explicit confirmation. Because it includes explicit catalog preferences, it also clears the boundary-summary assertion.

### Source-isolation invariant

Resetting one source must not manufacture replacement evidence in another source.

```text
remove authoritative source data
        ↓
leave unselected source data unchanged
        ↓
recompute derived views from what remains
```

Examples:

```text
reset catalog preferences
→ pairwise comparisons remain
→ quiz evidence remains
→ boundary summary returns to unknown

reset ranking history
→ catalog preferences remain
→ boundary summary remains
→ quiz evidence remains

reset saved scenes
→ profile evidence remains
→ session-only Scene state is outside this operation
```

## Private profile backup

The private backup is the complete machine-readable portability artifact for supported durable profile state.

Current format identifier:

```text
kink-profile
```

Current backup version:

```text
3
```

The current envelope is conceptually:

```ts
type ProfileBackupV3 = {
  format: "kink-profile";
  version: 3;
  exportedAt: string;
  profile: {
    settings: ProfileSettings;
    quizzes: StoredProfile;
    catalog: CatalogProfileState;
    rewardsPunishments: RewardPunishmentAuthoritativeState;
    scenes: SceneLibraryState;
    boundaries?: ProfileBoundaryState;
  };
};
```

The envelope is deliberately independent of browser storage key names.

`boundaries` is an additive backward-compatible v3 field. New v3 backups include it. Earlier v3 backups without the field normalize to an empty boundary-summary domain, which means unknown/unreviewed rather than explicit none.

### Version history

- **v1** — settings + quizzes + catalog/preferences/ranking data;
- **v2** — adds authoritative Rewards & Punishments state;
- **v3** — adds saved Scene Builder library state; later v3 exports also carry the additive boundary-summary domain.

New backups are written as v3. The importer supports v1, v2, and v3.

When restoring an older supported backup:

- missing Rewards & Punishments state restores as an empty R/P domain;
- missing saved-scene state restores as an empty scene library;
- missing boundary-summary state restores as unknown/unreviewed, never as explicit none.

The importer does not invent missing later-domain data.

### What the backup includes

The backup contains authoritative state required to restore the supported durable profile:

- display name/settings;
- quiz answers/progress/completion metadata;
- explicit catalog preference state;
- direct boundary-summary assertions;
- raw This-or-That comparisons;
- ranking-run/history state;
- Rewards & Punishments authoritative state;
- saved Scene Builder scenes;
- nested schema/version metadata needed for validation.

It does not need to persist recomputable profile summaries, scores, radar output, or other derived presentation models as authority.

### Privacy boundary

The backup is sensitive private profile data.

The app generates it locally. It is not the normal sharing format and must not be substituted when a user asks for a share summary.

## Backup import and restore

Import is **replace**, not merge.

The current importer validates the complete supplied envelope before replacing the local profile.

Validation includes:

- exact format identifier;
- supported backup version;
- valid export timestamp;
- supported settings schema and valid display name;
- supported quiz storage schema and known quiz IDs;
- valid catalog preference/comparison payload;
- valid ranking history when present;
- valid Rewards & Punishments state for v2/v3;
- valid saved-scene state for v3;
- valid boundary-summary state when a v3 backup contains that additive field.

Malformed JSON, wrong formats, unsupported versions, or invalid nested stores are rejected without intentional mutation of the current profile.

### Compatibility normalization

Catalog/ranking data is normalized through the current ranking-history model during import. Older comparison records without run identity can therefore enter the supported active-run compatibility path rather than becoming a second ranking model.

Boundary state is normalized independently from catalog evidence. If a backup contains both an affirmative `no Hard Limits` assertion and one or more concrete catalog Hard Limits, the concrete limits win and the stale explicit-none assertion is cleared during validation/restore.

### Restore transaction behavior

Before writing a validated backup, the restore path loads the current authoritative stores as a rollback snapshot.

It then replaces:

1. quizzes;
2. catalog/preferences/ranking state;
3. Rewards & Punishments;
4. saved scenes;
5. boundary-summary state;
6. profile settings.

If a write throws, the importer attempts to restore all previously loaded authoritative stores, including boundary-summary state. If rollback itself cannot complete, restore surfaces that stronger failure rather than claiming the profile is intact.

After successful restore, derived profile views are expected to recompute from restored authoritative data.

## Share summary

The share summary is a deliberately smaller human-facing presentation model.

Current share-summary schema version is `3`.

Its current content model contains:

- profile display name;
- generated timestamp;
- human-readable profile summary;
- orientation label;
- strongest broad themes;
- overall radar axes, preserving unknown affinity as `null`/unknown rather than forcing zero;
- featured headspaces;
- Top Overall interests;
- representative Interest Areas;
- explicit Hard Limits.

The share summary is built from the same current profile selectors used by the app. It does not maintain an alternate scoring system for exports.

### Deliberate omissions

The share model does not copy private implementation/source detail merely because the app has it.

It omits things such as:

- raw quiz answers;
- raw pairwise history;
- evidence/source IDs;
- browser storage keys;
- internal provenance/debug state;
- full catalog state;
- private backup metadata/payloads.

Hard Limits remain semantically separate from interests.

Incomplete/unknown profile areas should remain incomplete/unknown rather than being converted to zero merely to make the export look complete.

## Share export formats

The current share model can be exported locally as:

- PNG;
- standalone HTML;
- PDF.

All three formats consume the same share-summary model and rendered summary surface.

### PNG

The rendered summary is captured locally to a high-density canvas and saved as PNG. Render scale is bounded to avoid browser maximum-canvas-dimension failures on unusually long output.

### HTML

HTML export serializes the rendered share-summary markup and same-origin stylesheet rules into a standalone document.

The exported document does not include scripts, app navigation behavior, storage hooks, or the private backup payload.

### PDF

PDF export starts from the same rendered summary surface. It slices the rendered card into letter-sized pages, preferring summary section boundaries where practical, then embeds those page images into a locally generated PDF.

This keeps PNG/HTML/PDF content semantics aligned instead of maintaining three separate share-document models.

## Relationship to profile comparison

A share summary is a human-facing exported presentation.

A private backup is a restore-capable local data artifact.

Temporary uploaded-profile comparison is a separate feature with its own validation and in-memory lifecycle. See [Profile Comparison](profile-comparison.md).

Persistent linked-profile ownership, permissions, or cloud synchronization are not defined by this contract.

## Invariants

Future changes should preserve these boundaries unless the product deliberately changes them:

1. **Backup and share summary are different artifacts.**
2. **Reset deletes only selected authoritative sources.**
3. **Derived views recompute; reset/import do not create substitute evidence.**
4. **Import replaces a profile; it does not silently merge source histories.**
5. **Validation happens before intentional replacement writes.**
6. **Older supported backup versions restore missing later domains as empty/unknown rather than guessed data.**
7. **Session-only Scene Builder state is not durable profile backup state.**
8. **Share exports consume the shared presentation model, not private backup data.**
9. **Unknown profile output remains unknown rather than becoming artificial zeroes.**
10. **Boundary-summary explicit none is direct durable state, never inferred from an empty catalog collection.**
11. **Concrete Hard Limits outrank and clear a stale explicit-none boundary assertion.**
12. **Persistent multi-profile/linking semantics remain outside this current local-profile contract.**

## Primary implementation references

- `src/lib/profileSettings.ts`
- `src/lib/profileBoundaryState.ts`
- `src/lib/profileReset.ts`
- `src/ProfileResetPanel.tsx`
- `src/lib/profileBackup.ts`
- `src/lib/profileImport.ts`
- `src/lib/profileShareSummary.ts`
- `src/lib/profileShareExport.ts`
- `src/features/settings/ProfileSettingsPage.tsx`
- `src/ProfileBackupPanel.tsx`
- `src/ProfileImportPanel.tsx`
- `src/ProfileSharePanel.tsx`
- `src/ProfileShareSummary.tsx`

The code and focused tests remain authoritative when implementation and documentation disagree.
