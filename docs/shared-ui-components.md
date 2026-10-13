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
| `PreferenceControl` / `PreferenceSheet` | Controlled value, optional Clear/help and selector; explicit editing | Rating vocabulary, independently keyed values, persistence and retry |
| `InlineSaveStatus` | Reserved status slot; idle/saving/saved/failed presentation | Truthful persistence state and Retry implementation |
| `ItemRow` | Compact identity, indicator, preference and Refine slots | Item data, optional modifiers and classification indicators |
| `DisclosureSection` | Controlled disclosure with a stable panel ID | Expanded state and panel content; opening never records preference |
| `ToastProvider` / `useToasts` | One queue/viewport at the application boundary | Meaningful notifications and genuine recovery/Undo actions |
| `ToastViewport` / `useToastQueue` | Lower-level controlled viewport and queue primitives | Mount only one viewport per chosen notification scope |

## Interaction contracts

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
- Error toasts default to persistent; action toasts receive longer display time.
  Hover, focus and touch drag pause expiry. Each newly active message starts with
  its full duration. Horizontal touch/pen swipes require established horizontal
  intent; vertical scrolling and gestures originating on action buttons do not
  activate dismissal or Undo/Retry. Dismissing never reverses the underlying action.

## Current limits

The UI Lab receives illustrative data and preference saves through the async
[application service boundary](app-services.md). One injected service provider owns
session preferences across Lab navigation. The local adapter confirms saves in
memory and offers failure simulation; Lab notices describe this session-only
behavior. Production storage, durable recovery/offline sync, and server concurrency
remain separate work. `InlineSaveStatus` presents state; callers must await their
service confirmation before reporting a saved result.

Do not treat the component inventory as completion of every approved feedback
workshop decision. Container morph animation, full-page recovery, session recovery,
production error boundaries and capability gates remain separate work.

## Validation

Shared DOM interaction tests exercise nested focus/scroll ownership, explicit
preference editing, failed-save recovery, search clear focus, provider queue sharing,
and notification timing. Search component tests cover conditional grouping and
classification separation; UI Lab integration tests exercise collection contexts.
Run `npm test` and `npm run build` before changing these contracts.
