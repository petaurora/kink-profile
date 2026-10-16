# Shared UI components

`src/components/ui` owns reusable presentation and interaction primitives. Each
module imports its own CSS, with `kp-` classes and shared token defaults. Consumers
do not need `uiLab.css`, `catalogComposite.css`, or any feature data to render them.
Defaults preserve the navy, burgundy and pink palette; parent CSS may override
`--kp-search-*`, `--kp-pink`, `--kp-burgundy` and other shared variables.

The UI Lab composes these primitives at `#/ui-lab`. Production features have not
been migrated to the experimental treatments merely because the code is shared.

## Inventory and ownership

| Module | Contract | Caller responsibility |
| --- | --- | --- |
| `SearchField` | Input or button launcher; shared geometry/icon; Clear restores input focus | Query state, matching, result IDs, placeholder and scope |
| `SearchRow` | Field and right-side options layout | Field and options children |
| `SearchFilterButton` | Active/expanded state; contextual accessible name | Whether grouping is meaningful; opening the options sheet |
| `SearchChips` | Independent pressed-state chips and optional Clear | Filter semantics and selected states |
| `SortGroupSheet` | Separate controlled sort/group sections; grouping is optional | Sort order, grouping availability, labels and defaults |
| `ModalLayer` | Backdrop/Escape dismissal; nested focus containment/restoration; coordinated body scroll lock | Open state, title/label, content, visual variant and recovery policy |
| `SheetHeader` | Shared title, context and accessible close target | Title/context and any header accessory |
| `PreferenceChip` | Unboxed display-only icon and complete rating label; plain Not rated for absence | Current explicit value; no edit action or inferred preference |
| `PreferenceControl` / `PreferenceSheet` | Editable unboxed rating and responsive floating rating dialog; explicit commit, controlled help and Clear | Target/anchor, independent values, persistence and retry |
| `InlineSaveStatus` | Reserved status slot; idle/saving/saved/failed presentation | Truthful persistence state and Retry implementation |
| `ItemRow` | Wrapping identity, optional supporting text and indicators, grouped preference/Refine actions | Item data, search-match explanation, optional modifiers, aggregate save status and classification indicators |
| `DisclosureSection` | Controlled disclosure with a stable panel ID | Expanded state and panel content; opening never records preference |
| `ToastProvider` / `useToasts` | One queue/viewport at the application boundary | Meaningful notifications and genuine recovery/Undo actions |
| `ConfirmationDialog` | Explicit confirm/cancel modal with shared focus and close mechanics | Action scope, copy, confirmation policy and actual mutation |
| `ViewErrorBoundary` | View retry and reset on navigation | Place session ownership outside the boundary; recovery destination |
| `ToastViewport` / `useToastQueue` | Lower-level controlled viewport and queue primitives | Mount only one viewport per chosen notification scope |

## Interaction contracts

### Icon meanings and labels

`appIcons.ts` owns canonical destinations and shared action assignments. Use the
semantic key rather than choosing another library glyph in a feature. `AppIcon`
renders a decorative, nonfocusable SVG with inherited color and a 1.65 outline
stroke; optional inline spacing supports labeled actions. Explicit CSS/style
color overrides remain possible. The containing control owns its accessible name.

| Meaning | Assignment / boundary |
| --- | --- |
| Home, Quiz, Catalog, Profile, Tools | Home, Clipboard List, Category, User, Wand |
| Scenes, Compare, Education, Roleplay | Puzzle, Exchange Arrows, Open Book, Theater Masks |
| Search, Filter, Sort, Group, Refine | Magnifier, Funnel, Sorting Arrows, Stacked Layers, Sliders |
| Edit, Save, Add, Remove, Delete | Pencil, Disk, Plus, Minus, Trash; Remove preserves the source record |
| Affinity, Bookmark, Collection | Heart, Bookmark, Folder; these are independent of preference editing and saving |
| Undo, Reset, Refresh, Sync | Curved Back Arrow, Counterclockwise Restore, Clockwise Reload, Paired Circular Arrows |
| Duplicate, Copy Link, Share | Square Plus, Chain Link, Share Nodes; these describe different effects |
| Show/Hide, Preview | Eye/Eye Off, Document Search; visual concealment changes no access permissions |
| Private, Shared, Public, Verified security | Lock, Users, Globe, Shield Check; use only for the actual audience/protection state |

Registry availability does not introduce an action or prove the corresponding
backend capability exists. Custom Kinks/domain/relationship artwork remains
outside the registry until approved production SVGs are available. Discover's
sparkles and existing domain illustrations remain provisional.

Familiar icon-only actions retain accessible names, discoverable titles, focus
and touch targets. Ambiguous, consequential and destructive actions retain visible
labels. Disclosure uses a stateful chevron rather than Add/Remove; internal detail
links use a right chevron rather than the external-link mark. Active result-order
controls show a check and expose an accessible description in addition to color.
Filter chips and Sort/Group options retain separate behavior; no unsupported
filter/group controls are added to a view. Reflection notes already update as
typed, so leaving uses `Exit reflection`, without a misleading manual Save action.

### Rating labels and the floating picker

The approved rating vocabulary uses these exact Tabler glyphs. The same mapping
appears in editable Item rows, the Item's overall rating inside Refine, independent
Modifier Value ratings, picker options and read-only Profile records. Every rating
display is an unboxed icon-and-label pair, with no pill border, fill or rounded
container. Hard Limit keeps its full label and stronger text weight. Hover
underlines editable labels; keyboard focus retains an explicit ring around the
44px target. Read-only labels have no hover or edit affordance.

| Explicit preference | Icon |
| --- | --- |
| Love | Filled Heart |
| Like | Mood Smile |
| Curious | Bulb |
| Unsure | Mood Confused |
| Not Interested | Heart Off |
| Hard Limit | Shield X, always with the full label |
| Not Applicable | Circle Off |

`Not rated` is quiet, unboxed text without an icon. It means no explicit value
and is never an eighth picker option or persisted preference. `PreferenceChip` is a span; editing is an explicit
`PreferenceControl` button with a separate 44px target and contextual name. No
inferred, ranking or experience value is promoted to a direct preference chip.

`PreferenceSheet` retains its API name and renders a floating dialog. At phone
widths (680px and below) it is centered in the visual viewport, independent of
which rating opened it or the parent sheet's scroll position. On desktop it
anchors to the trigger, flipping/shifting as needed. Both use a stable 340×560px
frame, capped by the visible viewport with 12px margins; selection, title length,
Clear availability and expanded help never resize it. `useAnchoredPanel` responds
to resize/scroll/zoom. The header and Clear action stay available while choices
and help scroll internally, and the selected option is revealed on open or
viewport changes. `ModalLayer` supplies background isolation, focus containment,
outside/Escape cancellation and trigger focus restoration.

Seven icon-and-label rows follow canonical order. The selected row has a fine
outline and check; keyboard focus has its own independent ring. Initial focus
orients on the heading, then Tab enters the choices. Arrow/Home/End only move
focus; Enter/Space or a deliberate click selects. Activating the current value
closes and restores trigger focus without a duplicate write, timestamp or
revision. Clear remains a separate action with version-safe Undo. Optional
`What do these ratings mean?` help changes no records. Item and Modifier Value
ratings remain independent; Modifier Groups have no ratings.

Item names have a flexible area with a readable basis. Rating and Refine actions
stay together and move below the name as a unit when space is tight. Every Item offers Refine, including Items without modifiers, because item-level
experience applies independently of modifiers.
Supporting search text spans the row below.

Refine uses text for the Item title, Modifier Group headings and Modifier Value
labels; the structural icons are omitted to reduce repetition. Rating-state icons,
functional controls and Experience meanings retain their contextual roles. Refine
uses `SheetHeader.titleAccessory` for a smaller, unboxed rating beside the Item
heading, without an extra field label. The accessory is a sibling of the heading,
so its button keeps its own accessible name. It wraps below long titles without
crowding Close. The themed Tried checkbox sits directly beneath. About experience
holds Tried explanation and edit time in the scrolling content. Comfort UI is
deferred; its service records and independent semantics remain intact.

Catalog vocabulary is also registered centrally: Item Square Dot, Modifier Group
Brackets, Modifier Value Tag, Category Layout Grid, Subject Shape (provisional),
Concept Notebook, Alias Tags and Applicability Square Check. Experience
meanings include Tried Circle Check and Comfort Heart Handshake. The Refine Tried
checkbox uses app tokens for both states and a canonical Check when checked,
with a visible keyboard-focus ring. It retains a native input and uses native
rendering in forced-colors mode. Comfort Heart Handshake remains registered for
future use.
Activity, Equipment, Material, Body Area, participation direction, provenance,
intensity and risk glyphs are available to callers without inventing missing
metadata or additional UI. Body Scan is the approved provisional Body Area glyph.
The seven verbatim risk labels keep their approved neutral/half/exclamation shield
mapping in `catalogRiskIconMeanings`; Shield X belongs only to personal Hard Limit.
Risk symbols do not imply safety, consent or personal preference.

The feature-level `src/features/ui-lab/LabCard.tsx` composes the existing workspace
tile styles for Home, Profile, Discover and Tools. It supplies a navigation button
or link, or a section containing separately operable controls. Descriptions and
capability status are associated with the action for assistive technology; icons
and corner arrows are decorative. It owns no records, routing or save behavior.

- Filter narrows results, Sort orders them, and Group organizes presentation.
  `SortGroupSheet` does not decide eligibility or classification semantics.
- The caller hides grouping for a single category, subject-scoped or compact view,
  or a global search that already has its own organization. Hiding grouping does
  not overwrite the caller's stored grouping or sorting choice.
- Overall ratings, modifier ratings and R/P classifications stay independent.
  Components neither propagate values nor infer ratings from disclosure/navigation.
- `ModalLayer` closes only the topmost registered dialog on Escape. Tab stays in
  that dialog (including marked notification accessories), and dismissal restores
  connected trigger focus. Nested sheets retain scroll locking until all close.
  Initial title/input focus may be marked with `data-dialog-initial-focus`.
- Mount `ToastProvider` once around a composed application/view. `useToasts` exposes
  `notify`, `dismiss`, `clear` and `items`; the provider owns the sole viewport and
  adjusts its position when a shared modal is open. Its queue lives across feature
  mounts within that provider, but is not durable across reload.
- Routine queued successes may consolidate. The currently visible message,
  independent errors and actionable messages remain intact. Short non-actionable
  successes use rail-free pills; longer/actionable messages use rectangles.
- Error and action toasts are persistent until dismissed or acted on.
  Hover, focus and touch drag pause expiry. Each newly active message starts with
  its full duration. Horizontal touch/pen swipes require established horizontal
  intent; vertical scrolling and gestures originating on action buttons do not
  activate dismissal or Undo/Retry. Dismissing never reverses the underlying action.

## Current limits

The UI Lab receives curated Catalog reference data and isolated session preferences
through [application services](app-services.md).
Its single record provider retains independently keyed edits, timestamps, revisions
and pending async writes across feature navigation. Local service confirmation is
memory-only; reloading or leaving the Lab discards the default sample session.
Durable storage, server concurrency, offline recovery and risk-based destructive
confirmations remain separate work. `InlineSaveStatus` presents state; passing
`saved` requires confirmation of the caller's latest service operation.

Do not treat the component inventory as completion of every approved feedback
workshop decision. Container morph animation, durable session recovery, production error-boundary
migration and real connected-capability enforcement remain separate work. The Lab
uses a recoverable view boundary and explicit unavailable-capability states.

## Validation

Shared DOM interaction tests exercise nested focus/scroll ownership, explicit
preference editing, failed-save recovery, search clear focus, provider queue sharing,
and notification timing. Search component tests cover conditional grouping and
classification separation; UI Lab integration tests exercise collection contexts.
Run `npm test` and `npm run build` before changing these contracts.

## Accessibility contract

- Modal backgrounds are inert and hidden from assistive technology while open.
  Isolation includes newly mounted siblings; closing restores original attributes.
  Nested sheets expose only the active surface. Negative-tabindex and hidden
  controls are excluded from sequential keyboard navigation.
- Notifications render inside the active dialog when one is open, keeping their
  actions within its accessible boundary. Errors and messages with recovery/Undo
  actions do not expire, even if a caller supplies a duration. Other informational
  confirmations may expire; hover/focus pauses their timer.
- `InlineSaveStatus` keeps a mounted live region with changing text. Its Retry
  action sits outside that live text. Preference/disclosure targets remain stable
  while collapsed, and each catalog owns unique IDs for search and result panels.
- Refine names identify their item and whether modifiers are rated. Selection
  controls expose pressed state and a visible checkmark. Rating, filter and
  notification actions provide 44 px minimum heights/touch targets.
- Shared controls use a contrasting border token (`--kp-control-border`), visible
  focus and reduced-motion rules applied after visual refinements. The current
  lab/shared defaults explicitly use dark color-scheme. A complete semantic
  light-theme migration remains separate work; these defaults are not evidence
  of product-wide accessibility conformance.
- The UI Lab provides a skip link, current navigation state, page heading focus
  and title updates after navigation. Global search exposes a results relationship
  and a persistent live count. Its header scrolls with content, and narrow layouts
  reserve space for mobile navigation. Production routes retain their existing
  navigation, data and persistence behavior.

`Accessibility.test.tsx` adds axe-core semantic checks and regression coverage for
isolation/restoration, unique IDs, page focus, live text and persistent recovery.
jsdom cannot assess visual contrast, clipping, target geometry or assistive
technology speech. Use browser measurements and human assistive-technology checks
alongside these tests; passing automated checks does not assert WCAG compliance.
