# Application services

The experimental UI Lab uses asynchronous services for the data it currently
renders. `src/services/contracts.ts` is the application-facing boundary;
`src/features/ui-lab/services` contains the sample implementation and fixtures.
These contracts describe the current Lab slice, not an approved production
Catalog V2 schema or HTTP endpoint specification.

## Responsibilities

| Service | Contract | Current consumer |
| --- | --- | --- |
| `catalog.getReferenceData` | Read Items, nested modifier definitions, subjects with explicit Item links, and concepts | Catalog browsing, subject discovery, Concept Explorer |
| `search.search` | Read typed results with actual Item/modifier/concept targets; optional type and ordering | Shell/Catalog search overlay |
| `preferences.getSnapshot` | Read independent ratings and R/P classifications | Session initialization and classification filters |
| `preferences.setRating` | Confirm one Item, concept or item-specific modifier edit; `undefined` clears that target | Rating controls |
| `preferences.setExperience` | Confirm independent Tried/Comfort edits or clears | Experience controls |

Collection search operates on the loaded reference data with the same text
normalization used by service search. Filter, Sort, and Group remain presentation
concerns; disclosure, navigation, and search never record preference evidence.
R/P classifications are read-only in this Lab slice and are not inferred from
rating writes. Subject membership is explicit rather than reconstructed from
navigation history. Placeholder Home/Profile/Discover/Tools tiles are shell copy,
not live records or implemented domain services.

## Composition and replacement

`UiLabPage` creates one `createUiLabServices()` instance per mounted Lab. It accepts
an optional `services: AppServices` prop; injecting another implementation replaces
the source without editing Catalog/search/rating presentation. `AppServicesProvider`
loads the reference universe and initial preference snapshot before rendering its
consumers, then supplies one shared Lab record coordinator. Production routes do not
use this provider and their existing storage/import/export behavior is unchanged.

An API adapter implements the same promise-returning methods, translates transport
responses into these domain values, honors optional `AbortSignal` on reads, and
rejects failed writes. The UI composition root chooses the adapter. HTTP paths,
authentication, DTO validation, authorization, remote conflict resolution and
caching are not implemented here; they require their own backend contract. There
is no silent fallback from an API failure to successful sample data.

## Identity and independence

Sample Items, modifier groups and values have explicit stable fixture IDs. An
Item rating targets its Item ID; a modifier rating targets the Item, group and
value IDs together. `ratingKey` encodes tuples without using labels or positions.
Shared concepts such as Leather may be referenced by a modifier definition, but
do not share a rating with other Items or change their parent Item's rating.
Categories/groups are not rateable. The rating vocabulary is Love, Like, Curious, Unsure, Not Interested, Hard Limit
and Not Applicable. Unknown remains absent and is not an explicit rating. Clearing removes only the targeted record.

These IDs belong to illustrative Lab data. Do not import Lab preferences into the
production catalog or treat fixture categories as final taxonomy decisions.

## Async lifecycle and recovery

`useServiceQuery` cancels boot reads on replacement/unmount and ignores stale
results even if an adapter ignores abort. Catalog/search errors have accessible
status and Retry. The approved global Search retains its 200 ms debounce,
relevance/type sections, independent Clear, previous-result failure recovery and
nested return state. Its requests carry AbortSignal and ignore obsolete results.

`AppServicesProvider` owns service injection and initial reference/snapshot loading.
`LabRecordsProvider` is the single optimistic record coordinator used by Catalog,
concept and experience controls. It translates display keys to typed stable
transport targets, serializes per-target writes, coalesces waiting edits and only
reports Saved after service confirmation. Independent targets can save concurrently.
Saved feedback fades after 1.25 seconds. Old responses cannot replace newer values
or statuses. Failed edits (including clears) remain available for contextual Retry,
Retry All and guarded exact-value Undo. Feature navigation retains the provider;
leaving/remounting the Lab does not provide durable recovery.

Concept preferences, Item preferences, modifiers, Tried and Comfort are independent.
Revisions/help/disclosure and search state remain session presentation state; they
are not new preference evidence or server concurrency guarantees. The local adapter
confirms in memory. Cross-device conflicts and durable edit metadata require a
separate backend contract.

## Local adapter and limits

The local adapter clones its fixture inputs and returned snapshots, simulates
request latency, checks write targets/values, and supports canceled requests
without committing. Every factory call creates isolated in-memory state. It does
not use fetch, accounts, localStorage, production profile data, or browsing logs.
Confirmed ratings last through navigation within the mounted Lab, but reload or
leaving/remounting the Lab starts a new sample session.

`failNext(operation)` is a Lab diagnostic separate from `AppServices`; operations
are catalog, search, preference load, and save. The existing Test save failure
control rejects the next adapter save. Tests may inject latency, data or failures.
An injected API adapter does not receive this diagnostic control.

Durable persistence, offline synchronization, classification editing, education,
relationship/tool records and live collaboration are outside this slice.

## Search matching

Catalog lists search Item names, descriptions, categories and modifier text,
including short substrings. Default query ordering ranks exact names, name
prefixes and other all-term name matches ahead of supporting-text matches.
For example, `ca` shows Aftercare before Permission Rituals; the latter has small
subtext explaining the matching description containing `practical`. Mixed
name/metadata queries also explain the supporting fields needed for the match.
Empty queries retain the browsing order (alphabetical in R/P), and explicit
A–Z/Z–A sorting and category grouping remain presentation choices.

Global search searches all indexed text for Item, exact modifier and concept
targets, including descriptions, categories, modifier context, linked concepts
and related Item names. It uses the same name relevance tiers for Best matches,
then retains the existing type sections and optional alphabetical sorting.
Transport IDs are not searchable text. Global search and an inline Catalog list
share normalization and ranking rules, but remain distinct result experiences.


## Education read contract (UI Lab)

`AppServices.education` is an optional capability so older injected adapters remain compatible while the feature is introduced. Implementations expose:

- `listArticles(options?)` — async metadata summaries for the Learn library, **without** article Markdown bodies;
- `getArticle(stableId, options?)` — async full article details and raw Markdown, or `null` for unknown/retired IDs.

Both calls accept `AbortSignal`; transport failures are surfaced with actionable retry states. The UI never silently swaps in example content if an injected API adapter has not implemented Education or an API request fails.

`EducationArticleSummary` contains stable `id` independent of `slug`, title, description, section, reading level, estimated minutes, editorial version, and typed links. A link distinguishes further-reading article references from concept/Catalog references; it is **not** preference evidence, user identity, consent, or permission. Related article navigation is enabled now; cross-domain links remain metadata until their canonical reference mappings are approved. The reader treats Markdown as text and constructs safe React elements, without untrusted HTML injection.

The local adapter loads Markdown from `education/**/*.md` (including `fundamentals/` and `practices/`) at build time, then exposes only records registered in the curated stable-ID manifest `src/features/ui-lab/services/educationFixtures.ts`. As of October 13, the manifest includes thirteen articles, including a shorter Impact Play overview (`edu-impact`) and three topic-specific companions with curated reading links. Adding a file alone is not enough: each published/available article must have an explicit stable identity, section, metadata and editorial review. The contents are copied from the already merged source library because this stacked feature branch starts at #276's earlier base rather than current main; identical paths/blobs reconcile when main and the UI branch merge.

**API migration:** implement this read interface in a remote adapter, validate/normalize server DTOs and links at the boundary, honor cancellation and error states, and inject it at the composition root. No article components need to change. HTTP routes, authentication, storage, editorial publication gating, cache invalidation, moderation, and sync are intentionally deferred. The current article versions are editorial drafts and require review before publication.

Reading, searching, or following an article does not update Profile, Catalog, Tried/Comfort, or Discover attempts. There is no per-user reading history or automatic recommendation evidence in this slice.
