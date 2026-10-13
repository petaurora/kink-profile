# UI Lab

`#/ui-lab` and its registered nested routes compose the experimental responsive shell and shared controls. It uses
illustrative Catalog records. Production Catalog routes and durable profile data
remain separate.

## Records and explicit editing

The Lab record provider owns independent item ratings, item-specific modifier
ratings, Tried and Comfort. Navigation and disclosure do not create records.
The preference vocabulary is Love, Like, Curious, Unsure, Not Interested, Hard
Limit and Not Applicable. Contextual help describes these meanings. Help expansion
is retained across selectors only within the mounted Lab session.

The selector focuses its heading. Tab enters the choices; arrow keys/Home/End move
focus without editing; Enter/Space explicitly commits; Escape cancels. Clear
offers Undo for the exact preceding value. Version checks keep an older Undo from
overwriting a newer explicit edit.

Tried and three-value Comfort live in an optional item Experience disclosure.
Unchecked Tried means no affirmative record. Comfort stores semantic string values,
independently of Tried and preference. Changes retain session revisions and edit
timestamps; these are not dates of participation. Tried offers Undo.

## Local service save and recovery

The latest edit wins per target. The record provider retains pending operations
across feature mounts and writes through the async application services. Writes
serialize per target and obsolete waiting edits coalesce. Only the latest confirmed
operation becomes Saved; Saved clears after 1.25 seconds. The local adapter uses
850 ms save latency.
The test-failure checkbox fails the next rating operation and retains its value.
Failures remain visible until retried or replaced with a newer edit.

Failed modifiers take priority over saving and ordinary rated dots at item/group
level. Opening the failed parent reveals the affected group, scrolls to the field
and focuses Retry. Multiple failures offer Retry all and next-issue navigation.
Other destinations retain a summary and Retry all. Fresh Refine opens keep groups
collapsed unless revealing an explicit error or search destination.

Search clear and classification-filter clear remain independent in R/P. Changes
to R/P search results and classification chips/answer states return to the list
start. Classification fixture values remain read-only; Refine classification
editing is deferred.

## Storage boundary

All new records and revisions are memory-only. Reloading or leaving the mounted
Lab ends the session. The local in-memory service confirmations do not establish a
durable write, cross-device sync, permission or consent.

## Global search and result handoff

Global Search indexes the same sample Item/modifier records as local lists, plus
illustrative concepts. Context changes suggestions, without applying a type filter.
All indexed text is searchable, including short metadata substrings. Exact names,
name prefixes and other name matches rank ahead of supporting-text matches.
Queries process after a 200 ms debounce. Relevance order provides Best matches,
then nonempty Item/Modifier/Concept sections without repeating target IDs. Type
chips filter; the options sheet sorts only. Clear resets query and type filters,
retains sorting and returns focus to the search field.

Results open nested contextual layers while keeping the underlying Catalog and
Search mounted. A modifier result opens its parent, expands its exact group,
scrolls/focuses the matching value and briefly highlights it. Concept results open
Concept Explorer detail with an independently keyed general-concept preference.
Closing a result returns to the search query, filters, results and scroll position.
Closing/reopening Search retains its state only within the mounted Lab session.

Actual query processing exposes busy feedback. Obsolete requests cannot overwrite
newer results. A failed update retains previous successful results with an explicit
label and Retry; no fabricated network delay is added to the local index.
Queries are not written to local/session storage or tracked as preference evidence.
No autocomplete, aliases, automatic Recently Viewed or production index is implied.

## Routed shell and feature foundations

The Lab is lazy-loaded outside the production AppShell. Its destination registry
contains Home, Catalog, Profile, Discover, Tools, Creations, Learn, Relationships
and Settings. Primary navigation stays consistent across the desktop rail and
mobile bar. Desktop supports compact/labeled rail modes; the full menu exposes all
destinations. Nested pages have a clickable parent breadcrumb and one title.
Unknown Lab destinations show a recoverable message within the Lab.

Search and result layers have navigation entries. Browser Back returns first from
result to Search and then to the exact underlying workspace. Query text stays in
memory and is excluded from URLs/history state. Direct result URLs identify only
the target and open it without creating a rating. Local list queries, classification
filters and ordering also survive feature navigation as session view state, separate
from profile records. Fresh Refine group-collapse rules are unchanged.

Home shows only deliberately started unfinished activities (at most three Resume
links) and explicit records, plus editable session shortcuts. Profile lists only
explicit session records. Tools and Creations deliberately link existing app tools;
Learn offers concept exploration. Relationships and sharing expose honest capability
boundaries rather than fabricated people, accounts, permissions or drafts.
The Lab view recovery boundary retries a failed view or returns Home without
remounting the session providers. This does not alter the production error boundary.

## Discover

General suggestions carry reasons, not fabricated personalized claims. Dismissal
uses stable content IDs throughout the Lab session. Manage Suggestions restores
individual content; reset-all requires confirmation and changes only dismissals.

The illustrative reflection activity establishes the focused workflow and saved
activity lifecycle: deliberate start, optional prompts, retained draft notes and
prompt position, Save and exit, Resume, and explicit Finish. Completion creates a
read-only snapshot. Repeat starts a separate attempt linked to the original, using
the current supported activity version; earlier answers stay unchanged. Saved
activities can be removed with confirmation. Completion/repetition never writes
Catalog ratings, Tried or Comfort. This content is not a validated assessment.

These activities, dismissals and shortcuts remain memory-only. This implements the
UI basis; durable retention, account sync, activity publication/version withdrawal,
Recently Explored and production recommendation ranking are not implemented.

## Workspace card presentation

Home retains the original four styled cards: Continue, Your profile at a glance,
Discover something and Your shortcuts. Continue uses the featured gradient but
shows only real unfinished activity records, with an honest empty state otherwise.
Profile counts come from explicit session records; shortcuts remain user-controlled.
The cards navigate to real destinations and do not create activity/profile evidence.

Profile, Discover and Tools reuse the same rounded cards, icons, corner arrows and
featured gradient through `LabCard`. Profile's landing routes to explicit records,
relationships, sharing and identity; its record list remains in My Profile.
Unavailable relationship/identity/agreement capabilities are stated accurately.
Tools retain deliberate links to existing Scene Builder, comparison, randomizer
and recipe routes. Discover retains stable suggestion IDs, reasons, independent
dismissal/management and real saved activities within the card presentation.
Secondary controls are siblings of the card's navigation button, avoiding nested
interactive elements. Cards stack on narrow screens and use two columns on wider
screens. Catalog Item/modifier rows keep their compact list presentation.

## Application service ownership

The Lab receives reference data, subjects, concepts, search, classifications and
initial explicit records through AppServicesProvider. LabRecordsProvider is the
single mutable UI coordinator for ratings, concept preferences and experience;
its writes use the typed async adapter. Standalone component tests use the same
sample fixtures/local adapter without interpreting a failed API read as success.
Inline Catalog queries search names, descriptions, categories and modifiers.
Default search order puts name matches first, with small matching-field excerpts
under supporting-text results. Clearing search restores ordinary browsing;
explicit alphabetical sorting remains available. See [Application Services](app-services.md).

The service, record and Discover providers remain mounted around the routed shell
and its recovery boundary. Feature navigation retains confirmed/pending records,
saved activities and separate browse state. Search result routes resolve stable
Item/modifier/concept IDs against the loaded reference universe, including direct
links; query text stays out of URLs. Profile record labels use that same loaded
data. Home/cards, primary/full-menu navigation, breadcrumbs and tool links all
invoke registered Lab or existing application routes.
