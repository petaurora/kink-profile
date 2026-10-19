# Backend and application service boundaries

The application currently runs without an API server. `src/services` is the
application operation boundary, not evidence that data is already remote. A
browser-local adapter preserves the current behavior; a connected adapter must
apply authorization, validation and concurrency rules on the server. Client-side
checks or experimental feature flags cannot provide those guarantees.

This ownership map covers the implemented app, including production routes and
the V2 shell. Pure algorithms can remain reusable TypeScript; they do not need a
network call for every filter, keystroke or chart render. When their results are
used as shared authoritative state, the backend must validate/recompute from the
source records and the applicable content/model version.

## Responsibility map

| Capability and existing operations | Backend responsibility when connected | Browser/shared responsibility and current boundary |
| --- | --- | --- |
| Catalog/reference data: `catalog.getReferenceData`, `catalog-v2/toAppReference`, generated Catalog/R/P definitions, subjects, concepts, stable modifier tuples | Serve eligible/versioned reference records; enforce editorial availability and stable identity | Bundled reference data is the local adapter input. V2 consumes `AppServices.catalog`; grouping, local list filtering and disclosure stay in UI |
| Search: `search.search`, `services/search.searchReferenceData`, `EducationSearch` | Search permitted/published content when a remote index is used; permission filters belong server-side | Debounce, canceled/stale requests, result grouping, highlighting, sort controls and bounded filtering of loaded public metadata stay client-side. V2 global search already uses its port |
| Explicit preference and experience: `preferences.setRating`, `setExperience`; `catalogProfile` setters | Validate target/value, user ownership and concurrency; persist independent fields and evidence provenance | Existing V2 async service and `LabRecords` coordinator. Optimistic display, guarded Undo and retry are UI concerns; Unknown remains absence |
| Quiz content/progress/retakes/results: `QuizService.getSnapshot`, `answerQuestion`, `startRetake`; `services/domain/quizRuntime` and `quizScoring` | Validate quiz/question/version/answer, own attempt transitions, preserve established results until a completed retake, resolve scores consistently | V2 consumes injected async records and results. Current local Quiz adapter uses the production profile keys. Scoring/lifecycle are reusable domain functions; answer confirmation, focus, responsive batches and SVG rendering stay UI-owned |
| Profile evidence/aggregation: `profileEvidence.buildQuizSignalEvidence`, `buildCatalogEvidenceSnapshot`, `overallProfileSignals.buildCanonicalSignalProfile`, `catalogResults.buildCatalogResultView`, `overallProfileFacets` | Resolve authoritative evidence/derived read models when profiles are shared or synced; preserve source/model versions and exclusions | Pure functions remain in `lib`, suitable for deterministic local/offline projection. Derived views are recomputed, not a second writable source. Legacy Profile/Hub hydration remains synchronous |
| Ranking: `kinkRanking`, `kinkRankingHistory`, `kinkRankingMovement`; `rewardPunishmentRanking` | Persist authorized comparison events/history and validate target identities; derive consistent ranking views | Pair selection and deterministic rank/history/movement algorithms are reusable. UI owns comparison animation and chosen view; legacy persistence is in local adapters |
| R/P contextual preferences, classifications, recipes: `rewardPunishmentProfile`, `rewardPunishmentLifecycle`, `rewardPunishmentRecipes`, associated storage functions | Validate independent contextual suitability/classification/random eligibility and recipe records; persist per-user data | Existing domain rules remain pure. Local adapters own production persistence. V2 classification remains read-only; inferred affinity is not permission or explicit suitability |
| Scene templates and notes: `sceneLibrary.createSavedScene`, `updateSavedScene`, `deleteSavedScene`, `duplicateSavedScene` | Validate/persist authorized templates, versions, component identities and notes | Local scene library adapter preserves current keys. Editor drafts, phase layout and export/download interaction stay client-side |
| Scene candidates/randomizers: `sceneCandidates`, `sharedSceneCandidates`, `sceneComposition`, `sceneRandomizer`, `rewardPunishmentRandomizer` | Re-evaluate eligibility and hard-limit/participant boundaries whenever the service supplies connected suggestions | Pure candidate/randomization algorithms can run locally from available evidence. Tonight overrides and anti-repeat session history remain separate from durable preferences; suggestions never establish consent |
| Discover content, dismissals and reflection lifecycle: `DiscoverService.getSnapshot`, `setDismissed`, `resetDismissals`, `startAttempt`, `saveAttempt`, `completeAttempt`, `removeAttempt` | Serve eligible suggestions/activity definitions; validate and persist independent attempts/dismissals when connected | V2 service-backed. Local adapter is session-only. Draft text/progress and autosave coordination stay in React until confirmation. Completed notes retain their prompt definition/version; repeating creates a separate linked attempt |
| Education: `education.listArticles`, `getArticle`, curated stable-ID manifest | Serve reviewed/published versions with editorial eligibility, link validity and change notices | V2 async read port already exists. Safe Markdown rendering, article layout and local metadata filtering stay client-side; reading creates no preference evidence |
| Settings and boundary assertions: `load/saveProfileSettings`, `load/saveProfileBoundaryState`, `affirmNoLimits` | Validate/persist user-owned values if synced; never derive an explicit no-limits assertion from missing data | Production local adapters plus existing pure state transitions. Sidebar, filters, dev tools and feature overrides are device/UI state, not access control |
| Private backup/import/reset: `createProfileBackup`, `parseProfileBackupJson`, `validateProfileBackup`, `restoreProfileBackup`, `resetProfileData` | Connected exports/restores/resets require authorized scope, server validation and atomic changes; browser rollback is not a database transaction | Local implementations now live under `services/local/legacy`. Preserve backup versions, keys and rollback behavior. File picking, local preview/validation, serialization and downloads remain browser operations |
| Profile sharing: `profileShareSummary`, `profileShareExport`, identity/claim projections | A future hosted share requires server-enforced projection, grants, revocation and visibility | Current curated HTML/PNG/PDF exports render/download locally. Do not require uploading private records merely to generate an offline file |
| Uploaded-profile comparison: `profileComparisonUpload`, `sharedProfileComparison.buildSharedProfileComparison`, `sharedParticipantIntent` | A future connected relationship requires authorized participants, scoped access and grant enforcement | The current explicit local file comparison and temporary intent state can stay local. Comparison does not create an account, relationship, permission or durable shared workspace |
| Curation: `curationWorkspace`, `curationCanonicalEditorModel`, `curationExportValidation` | Connected publication needs authorized editorial review, versioning and validated canonical changes | Current workbench is a local draft/export tool; deterministic validation and editing models are reusable. Export is not publication |
| Accounts, permissions, sync, bookmarks | These have no implemented backend in this application | No fabricated service stubs. Saved Discoveries are not reflection attempts, Recently Explored, ratings or reading history. Their implementation requires their own approved contracts |

## Current module ownership

- `src/services/contracts.ts`, `quizContracts.ts`, `discoverContracts.ts`: typed,
  promise-returning application ports. Transport DTOs/endpoints are not specified.
- `src/services/local/createLocalAppServices.ts`: reference/search/preferences/
  Education operations; composes Quiz and Discover adapters without feature fixtures.
- `src/features/ui-lab/services/createUiLabServices.ts`: sample composition only;
  supplies Catalog/preferences/Education inputs to the local adapter.
- `src/services/local/createLocalQuizService.ts`: quiz commands, validation,
  latest-profile reads, confirmed persistence and service-resolved results.
- `src/services/local/createLocalDiscoverService.ts`: isolated session content,
  dismissals and attempt transitions. No automatic Profile or Catalog writes.
- `src/services/domain/quizRuntime.ts`, `quizScoring.ts`: pure domain operations.
  Former feature paths re-export these for compatibility; chart perspectives stay
  in the feature presentation model.
- `src/services/local/legacy/`: production storage/migration/parsing for quiz,
  Catalog, contextual R/P profiles/rankings/recipes, saved scenes, profile settings,
  boundary assertions, private backup/restore, reset and curation drafts.
  `services/local/currentProfileSnapshot.ts` owns production Profile/Hub hydration. Former `lib` modules are
  compatibility exports; existing consumers and tests use the same keys/formats.
- `src/lib`: other reusable domain calculations. A pure function does not become
  server-only just because it contributes to a future backend read model.

## Async and adapter replacement contract

Quiz and Discover capabilities are optional for older injected adapters. Missing
capabilities show an unavailable state; they never fall back to browser profile
storage or sample content. Read failures provide Retry. Writes return confirmed
resource snapshots; failed writes retain selections/text and offer Retry. Quiz
navigation/completion and reflection success feedback happen after confirmation.
`useServiceResource` prevents duplicate in-flight commands and rejects stale UI
updates/navigation after adapter replacement or unmount, even if an adapter ignores
abort. Discover keeps newer typed text while an earlier autosave is pending.

A connected adapter must validate transport responses and enforce authorization
and conflict rules. An AbortSignal cancels client interest; it cannot guarantee
that a server did not commit a command. Revisions, idempotency and synchronization
need an actual server contract, not an in-memory revision or a browser success flag.
No API failure is treated as a successful local write.

## Scope of the current extraction

V2 Catalog, search, preferences, Education, Quizzes and reflection Discover are
replaceable through `AppServices`. The production routes still call synchronous
compatibility APIs for their local persistence. Their implementation is now
isolated, but swapping those synchronous APIs for HTTP requires migrating each
consumer to async reads/commands/recovery. Moving their files does not make those
older routes remotely backed. The separate Surprise Me prototype on PR #307 is
outside this branch's source tree and still needs its own eligibility/ranking port
when integrated. Actionable migration work is tracked in GitHub, not this document.

The app continues to work locally. No data is uploaded, no backend is provisioned,
and existing local/profile import/export behavior is retained.
