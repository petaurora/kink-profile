# M9 — Settings, Profile Management & Sharing

**Status:** in progress  
**Roadmap milestone:** M9  
**Primary boundary:** M7 owns what the profile means and displays; M9 owns how the user manages, moves, resets, and shares it.

---

## Goal

Add a dedicated **Settings** area that gives the user explicit control over the lifecycle of a locally stored profile without mixing destructive/admin controls into the main profile experience.

M9 covers four distinct user needs:

1. **Identity** — stop assuming every profile is named "Pet."
2. **Data lifecycle** — selectively reset one source of profile data without deleting unrelated evidence.
3. **Portability** — export/import the complete private profile as a backup/restore unit.
4. **Sharing** — generate a polished human-readable profile summary that is intentionally different from the private backup.

The most important product distinction is:

```text
FULL PROFILE EXPORT
private + machine-readable + complete
used for backup / restore / moving the profile

SHARE SUMMARY
human-readable + intentionally curated
used to show the profile to another person
```

These are separate features and must not share a misleading "Export" action without clear labels.

---

## Non-goals

M9 does **not** add:

- accounts or authentication
- cloud sync
- multi-user/multi-profile switching
- merge-import of two different profiles
- automatic partner compatibility/comparison
- public hosting or share links
- collaborative editing
- arbitrary profile-template design tools
- pronoun/title/relationship-role identity systems beyond the initial editable display name
- new scoring, ranking, or M7 aggregation rules

Cloud persistence remains M10.

---

# Information architecture

Add a first-class Settings destination in the app navigation.

Recommended page structure:

```text
Settings

Profile
  Profile name

Data
  Export profile backup
  Import profile backup
  Reset profile data

Sharing
  Preview share summary
  Export share summary
```

The page should feel administrative and predictable rather than like another exploration/profile-results surface.

Destructive actions belong under **Data**, visually separated from ordinary profile identity and sharing controls.

---

# M9.1 — Settings shell + profile identity

## Profile display name

The current UI assumes the profile belongs to "Pet." M9 introduces an editable profile display name.

Initial behavior:

- default/migrated name may remain `Pet` so existing installs do not suddenly show a blank heading
- user can edit the display name from Settings
- empty/whitespace-only values are rejected or normalized back to the default
- reasonable length validation should prevent layout-breaking values
- the configured name should be used anywhere the UI is semantically naming the profile/person
- generic product/navigation labels should stay generic when inserting the name would sound unnatural

Examples:

```text
Pet Profile
→ Kitty's Profile

Pet's Top Interests
→ Kitty's Top Interests
```

Do not perform a blind string replacement of every occurrence of `pet`; Pet may still be a valid kink/headspace label in the taxonomy.

## Persistence

Profile identity belongs in durable local profile/settings state and must:

- survive normal refresh/reload
- be included in full profile export
- be restored by full profile import
- be independently resettable through M9.2

## Acceptance criteria

- Settings is directly navigable
- a profile name can be changed and persists
- relevant profile headings update
- taxonomy labels such as the Pet headspace are unchanged
- legacy local profiles receive a safe default without data loss

---

# M9.2 — Selective reset

## Product behavior

"Reset profile data" opens a selection flow. It must **not** immediately delete anything.

The user chooses which independent data domains to reset, then sees a confirmation summary before the destructive action runs.

Initial reset scopes:

### Quiz data

Allow resetting:

- all quiz data, and/or
- individual quiz sections if the storage model supports this cleanly

Resetting quiz data removes the selected quiz's authoritative answers/progress/results contribution. It does not remove manual catalog preferences or This-or-That history.

### Explicit catalog preferences

Remove directly assigned catalog preference states/overrides.

This must not delete raw pairwise comparisons or quiz answers.

### This-or-That / ranking data

Remove raw category/Overall pairwise comparison history and its derived ranking state.

This must not delete explicit catalog preferences or quiz answers.

### Profile settings / identity

Reset editable profile settings such as display name to their defaults.

This does not reset quiz/catalog/ranking evidence unless those scopes are also selected.

### Reset Everything

A clearly labeled shortcut selects every destructive scope.

It still requires confirmation.

## Confirmation

Before mutation, show a plain-language summary such as:

```text
This will reset:
• Dominance & Submission quiz
• Explicit catalog preferences
• This-or-That rankings

This will keep:
• Other quiz results
• Profile name/settings
```

Avoid fake friction such as requiring the user to type a phrase unless later testing demonstrates a real need. The important protection is explicit scope selection + a second confirmation step.

## Architecture rule

Selective reset follows the source-aware evidence architecture.

Deleting one source:

1. deletes only that source's authoritative persisted data;
2. preserves all unselected source records;
3. invalidates/recomputes affected derived views;
4. never writes a derived replacement back into another source.

Examples:

```text
reset quiz
  → quiz contribution disappears
  → explicit catalog state remains
  → pairwise ranking remains
  → derived profile recomputes

reset This-or-That
  → comparison history disappears
  → explicit catalog state remains
  → quiz data remains
  → derived profile recomputes
```

## Acceptance criteria

- no destructive mutation occurs on the first reset click
- each supported source can be reset independently
- selecting one source demonstrably preserves the others
- Reset Everything removes all profile-owned local data covered by M9
- derived results refresh after mutation
- reset behavior has focused regression tests around source isolation

---

# M9.3 — Full profile export

## Purpose

This is the **complete private backup**.

It should be sufficient to move/restore the locally stored profile without reconstructing it from screenshots or summary output.

Recommended initial file format:

```text
kink-profile.json
```

A human-friendly filename may include the profile name and export date, but consumers must not depend on the filename for schema detection.

## Export envelope

Use a versioned envelope rather than dumping browser storage keys directly.

Implemented v1 shape:

```json
{
  "format": "kink-profile",
  "version": 1,
  "exportedAt": "...",
  "profile": {
    "settings": {},
    "quizzes": {},
    "catalog": {}
  }
}
```

`profile.catalog` contains both explicit catalog preferences and raw This-or-That comparison history because those are the two authoritative fields of the shared catalog-profile store. Ranking order/progress is derived from raw comparisons rather than exported as a redundant second source of truth.

The envelope is intentionally independent from browser storage key names. Each nested authoritative store also retains its own schema version for future import migration.

## What belongs in the backup

Include all authoritative profile-owned local data needed for restore, including:

- profile display name/settings
- quiz answers/progress/completion/source values
- explicit catalog preference state and directional overrides
- raw This-or-That comparisons
- ranking session/history state required to faithfully restore progress
- storage/schema versions needed to migrate the imported data safely

## Derived data

Derived profile results should be treated as **recomputable**, not authoritative.

If derived/cache values are exported for convenience, import must never trust them over the restored authoritative sources. Recompute after import.

## Privacy

Because this file contains the full profile:

- label it clearly as a private backup
- do not frame it as the recommended sharing format
- do not automatically upload it anywhere
- do not include unrelated browser/app data

## Acceptance criteria

- [x] export produces valid versioned JSON
- [x] the export contains all authoritative profile data
- [x] JSON can be parsed independently of browser storage key names
- [x] an export/import round trip restores equivalent source data
- [x] derived profile output after restore matches a fresh recomputation

---

# M9.4 — Full profile import

## Initial semantic: replace, not merge

The first import implementation replaces the current profile with the imported profile.

Do **not** merge two source histories in M9.

Merging introduces difficult questions around:

- duplicate quiz attempts
- conflicting explicit catalog states
- duplicate pairwise comparisons
- timestamps/order
- ranking session continuity
- profile identity/settings conflicts

That is unnecessary for backup/restore.

## Import flow

Recommended sequence:

```text
select JSON
    ↓
parse
    ↓
validate format + version
    ↓
migrate in memory if supported
    ↓
show import preview
    ↓
confirm replacement
    ↓
write authoritative stores atomically/transactionally as practical
    ↓
recompute derived state
```

## Preview

Before replacing current data, show useful non-sensitive metadata such as:

- profile name
- export/schema version
- export date when available
- quiz sections present/completed
- catalog preference count
- comparison/ranking history presence

The preview proves the file is recognized before destructive replacement.

## Failure behavior

Invalid or unsupported imports leave the current profile untouched.

The v1 importer validates the complete envelope and all three authoritative nested stores before any replacement write occurs. It accepts only the exact supported `kink-profile` format version and supported nested storage schema versions; there is no best-guess migration in v1.

Replacement writes the quiz, catalog, and profile-settings stores only after validation. If a storage write fails, the importer attempts to restore the previously loaded authoritative stores before surfacing the failure.

After a successful restore, leaving Settings remounts the app from restored source data so M7 derived views recompute instead of trusting backup-time derived output.

## Acceptance criteria

- [x] malformed JSON is rejected safely
- [x] wrong format identifier is rejected
- [x] unsupported versions are rejected or migrated intentionally
- [x] import preview appears before replacement
- [x] successful import replaces the current profile
- [x] failed import does not partially overwrite the current profile
- [x] restored authoritative data recomputes into the expected M7 profile

---

# M9.5 — Shareable profile summary

## Purpose

The share summary is a **human-facing presentation artifact**, not a backup.

Its job is to answer:

> "What would I actually want to hand/send to another person so they can understand this profile?"

Build one dedicated share-summary content model/view, then render that same model into export formats.

## Candidate content

Use stable M7 outputs and keep the default summary concise.

Recommended hierarchy:

### Identity/header

- profile display name
- "Kink Profile" / equivalent neutral title
- optional generated/exported date

### Overall shape

- strongest broad themes/facets
- overall radar when it remains legible in the target format
- compact orientation/headspace/dynamic-mode highlights

### Top interests

- Top Overall direct-evidence interests
- representative strongest Interest Areas where useful

### Limits

- explicit Hard Limits in a clearly separate section

### Curiosity / exploration

If M7 exposes a stable useful summary, include selected Curious items/areas without pretending curiosity has a precise overall rank.

Do not invent a "Top Curious" scoring algorithm solely for the export.

## Deliberate omissions

The summary should not expose implementation detail merely because it exists:

- internal storage keys
- evidence IDs
- source-version/debug metadata
- raw answer history
- every pairwise comparison
- confidence-debug UI
- dev inspection surfaces
- full catalog state dump

M7 explainability can remain available inside the app without being copied wholesale into a share artifact.

## Privacy principle

The share summary is intentionally curated, but it is still sensitive user-generated content.

The app should:

- preview exactly what will be exported
- export locally
- avoid background/public upload
- make limits visually clear without sensationalizing them
- never substitute the full backup JSON when the user asks to share a summary

Future selective include/exclude controls can be added if real usage demonstrates a need; the initial milestone should first establish a clean safe default summary.

## Acceptance criteria

- a dedicated preview uses real M7 profile data
- the share view is visually coherent without the surrounding app chrome
- private implementation/provenance details are absent
- Hard Limits remain semantically distinct from interests
- incomplete profiles render honestly rather than filling unknowns with zeroes
- the same content contract can feed all M9.6 formats

---

# M9.6 — Summary export formats

## Shared rendering contract

Do not independently hand-design PNG, HTML, and PDF versions.

Use one share-summary data/content contract and as much shared presentation styling as practical:

```text
M7 profile outputs
       ↓
share-summary model
       ↓
share-summary renderer
   ↙      ↓       ↘
 PNG     HTML     PDF
```

Format-specific layout adjustments are fine; content semantics should remain aligned.

## PNG

Best for:

- texting/DMs
- image attachments
- fast visual sharing

Requirements:

- readable at common phone widths
- long profiles either render as a deliberate tall image or use a documented pagination/section strategy
- avoid clipped charts/text
- export at sufficient pixel density for readable text

## HTML

Best for:

- portable local viewing
- retaining responsive layout
- future richer sharing without requiring a hosted account

Prefer a self-contained representation where practical so the file does not silently depend on the live app being available.

Do not include private app state beyond what is visible in the share summary.

## PDF

Best for:

- polished document sharing
- printing/archiving
- predictable multi-page layout

Requirements:

- deliberate page breaks
- charts/images remain legible
- no orphaned section headings where practical
- URLs/app chrome/navigation controls are not accidentally printed into the artifact

## Format order

Recommended implementation order:

1. stable share-summary preview/HTML renderer
2. PNG export
3. PDF export
4. final portable/self-contained HTML export hardening

This lets the visual content contract stabilize before adding multiple capture/render pipelines.

## Acceptance criteria

- PNG, HTML, and PDF all represent the same profile summary semantics
- exports do not contain app navigation/admin controls
- limits and top interests remain visually distinct
- long content does not clip silently
- export tests cover at least sparse and dense sample profiles

---

# Data ownership matrix

| Data | Resettable independently | Full backup | Share summary |
| --- | --- | --- | --- |
| Profile display name/settings | Yes | Yes | Display name only where intended |
| Quiz authoritative data | Yes | Yes | Derived/high-level results only |
| Explicit catalog preferences | Yes | Yes | Selected/high-level interests/limits |
| Raw This-or-That comparisons | Yes | Yes | No |
| Ranking progress/history | With ranking reset | Yes | Resulting top interests only |
| M7 canonical/facet derived data | Recompute | Non-authoritative | Yes, via stable presentation outputs |
| Internal provenance/debug data | Recompute/implementation-owned | Only if required for authoritative restore | No |

---

# Migration/versioning contract

M9 makes data format boundaries user-visible, so versioning must be explicit.

Maintain separate concepts where useful:

- internal browser storage schema version
- full-profile export format version
- quiz/catalog/ranking source versions already owned by those systems

An export format version should change when an older importer cannot safely interpret the envelope without migration.

Importers should prefer:

1. exact supported format;
2. explicit deterministic migration;
3. safe rejection.

Never "best guess" an incompatible profile into current storage.

---

# Testing strategy

M9 is lifecycle-heavy and deserves more than UI happy-path tests.

Minimum focused cases:

### Name/settings

- legacy profile migration/default
- rename persistence
- reset settings only
- import restores name

### Selective reset

- reset each source independently
- verify all unselected sources are byte/semantically equivalent afterward
- Reset Everything
- derived recomputation after each reset

### Export/import

- current profile → export → clear → import → equivalent authoritative sources
- malformed JSON
- wrong format
- unsupported version
- failed validation leaves current data untouched
- imported older supported version migrates deterministically if migration exists

### Share output

Use deterministic sparse, medium, and dense fixture profiles to verify:

- unknown data remains unknown
- long interest/limit lists do not break layout
- share summary does not expose raw/internal data
- PNG/PDF/HTML content stays semantically aligned

---

# Dependencies and sequencing

M9 is intentionally its own milestone.

- **M6/C4–C7** provide independent durable source ownership needed for selective reset/backup.
- **M7** provides the stable aggregated profile outputs used by the share summary.
- **M8** is optional and does not need to ship before M9.
- **M10** may later reuse M9's portable/profile-lifecycle contracts for sync/migration, but M9 must remain fully useful without an account.

Recommended build order:

```text
M9.1 Settings + name
        ↓
M9.2 Selective reset
        ↓
M9.3 Full export
        ↓
M9.4 Full import
        ↓
M9.5 Share summary
        ↓
M9.6 PNG / HTML / PDF
```

Each slice should be testable and mergeable independently.

---

# Exit condition

M9 is complete when:

- the app has a dedicated Settings destination;
- the user can rename the profile without changing taxonomy semantics;
- quiz, explicit-catalog, ranking, and profile-settings data can be reset selectively;
- a versioned full-profile JSON backup can be exported and restored safely;
- invalid imports cannot partially destroy the current profile;
- a dedicated share-summary view presents stable M7 results without raw/private implementation data; and
- the summary can be exported consistently as PNG, HTML, and PDF.

The result should make the profile feel **owned by the user**: understandable, portable, recoverable, resettable, and easy to share deliberately.
