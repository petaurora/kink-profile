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
- Error and action toasts are persistent until dismissed or acted on.
  Hover, focus and touch drag pause expiry. Each newly active message starts with
  its full duration. Horizontal touch/pen swipes require established horizontal
  intent; vertical scrolling and gestures originating on action buttons do not
  activate dismissal or Undo/Retry. Dismissing never reverses the underlying action.

## Current limits

The UI Lab still owns illustrative data and an 850 ms simulated save. It does not
persist preferences, implement a server save coordinator, durable recovery/offline
sync, or risk-based destructive confirmations. `InlineSaveStatus` presents state;
passing `saved` requires real confirmation from a caller. UI Lab “saved” messages
are simulation feedback under its explicit no-persistence notice.

Do not treat the component inventory as completion of every approved feedback
workshop decision. Container morph animation, full-page recovery, session recovery,
production error boundaries and capability gates remain separate work.

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
