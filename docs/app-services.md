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

Names support partial-word searches. Hidden description, category and modifier
metadata participates only for terms of at least three characters and matches
word prefixes, not arbitrary substrings. Thus `ca` finds Aftercare through its
visible name but does not match Permission Rituals through the word `practical`.
Longer queries such as Leather can still discover a parent Item's modifiers.
