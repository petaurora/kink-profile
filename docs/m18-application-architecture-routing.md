# M18 — Application Architecture & Routing

## Status

Planned.

## Why this milestone exists

The application has outgrown the original prototype-style UI architecture.

The current runtime is functionally healthy, but the React application shell now carries responsibilities that should be separated:

- `App.tsx` owns screen selection, quiz orchestration, profile view-model construction, large page render trees, and navigation callbacks.
- navigation is represented as local React state rather than browser navigation.
- Settings has a second navigation state machine in `ProfileAppRoot`.
- several feature entry points live directly in the root of `src/` with little distinction between pages, shared components, and feature-local components.
- multiple UI files have become large enough that adding new product surfaces increases merge risk and makes behavior harder to reason about.
- GitHub Pages production and PR-preview deployments use different base paths, which routing must respect.

M18 turns the current working application into a maintainable routed application without intentionally changing product behavior.

This is an **architecture/refactor milestone, not a redesign milestone**.

---

## Core principle

> Move behavior before changing behavior.

The first responsibility of M18 is to preserve existing user-visible behavior while changing where that behavior lives and how navigation is represented.

A refactor slice should not opportunistically redesign a page, change scoring, alter storage semantics, change taxonomy, or introduce unrelated product behavior.

If a behavior bug is discovered during extraction, either:

1. preserve it and file/follow it separately when safe, or
2. fix it only when the existing behavior prevents the refactor from functioning correctly, with an explicit regression test documenting the intended behavior.

---

## Goals

M18 should leave the application with:

- real browser navigation and route-aware URLs;
- browser Back/Forward support;
- reload-safe navigation within the limits of GitHub Pages hosting;
- page-level route components instead of one giant conditional render tree;
- a single application/navigation shell instead of separate App and Settings navigation state machines;
- clear boundaries between app infrastructure, page features, shared UI, domain/data logic, and persistence/scoring utilities;
- feature-local components and styles where appropriate;
- smaller, easier-to-review implementation slices;
- no loss of existing local profile data or import/export compatibility;
- no intentional change to profile scoring or evidence semantics.

---

## Non-goals

M18 does **not** include:

- account/authentication work;
- cloud persistence;
- M14 persistent linked-profile decisions;
- M15 contextual activity modeling;
- M16 taxonomy/scoring/content cleanup;
- M17 Body Map behavior;
- visual redesigns of existing pages;
- replacing the existing profile storage formats;
- rewriting working domain logic merely to fit a new folder structure;
- introducing a general state-management library unless the routing refactor demonstrates a concrete need.

React local state, existing context, and existing storage utilities remain valid tools.

---

# 1. Routing strategy

## 1.1 Router choice

Use React Router and begin with a **hash-based router**.

The production build currently lives under:

```text
/kink-profile/
```

PR previews live under dynamic paths such as:

```text
/kink-profile/pr-123/
```

GitHub Pages does not provide an application-controlled SPA fallback for arbitrary clean paths. A direct request to `/kink-profile/profile`, for example, can be handled by GitHub Pages before React loads and may return a 404.

A hash router keeps the hosted asset path stable while allowing application navigation after `#`:

```text
/kink-profile/#/profile
/kink-profile/#/catalog
/kink-profile/pr-123/#/scene-builder
```

This must work with the existing `VITE_BASE_PATH` production and PR-preview setup.

### Future migration

The route model should not depend on hash-router-specific behavior. If hosting later supports SPA rewrites, the application should be able to move to a browser router with minimal route-definition changes.

---

## 1.2 Initial route map

The initial route contract should be approximately:

```text
/
/profile
/quizzes/:quizId
/quizzes/:quizId/results
/catalog
/ranking
/rewards
/scene-builder
/compare
/curation
/settings
```

Route names should be user/product concepts rather than implementation component names.

### Route intent

| Route | Purpose |
| --- | --- |
| `/` | Hub / primary exploration landing page |
| `/profile` | Aggregated Overall Profile |
| `/quizzes/:quizId` | Active quiz answering flow |
| `/quizzes/:quizId/results` | Results for one quiz |
| `/catalog` | Direct kink catalog preference browsing/refinement |
| `/ranking` | Kink This-or-That ranking |
| `/rewards` | Rewards & Punishments feature area |
| `/scene-builder` | Scene Builder |
| `/compare` | Temporary uploaded-profile comparison |
| `/curation` | Curation Workbench |
| `/settings` | Profile/settings lifecycle UI |

Nested routes may be introduced inside a feature later, but M18 should avoid inventing deep URL structures that do not yet provide user value.

---

## 1.3 URL state vs persisted profile state

The URL should represent **navigation and shareable/view state**, not become the profile database.

Good URL state includes:

- selected page;
- active quiz ID;
- catalog drill-down category/preference/filter where useful;
- lightweight page-local tabs or modes when navigation history benefits from them.

Persisted profile state continues to live in the existing profile/catalog/ranking/settings storage contracts.

Ephemeral interaction state should remain local when there is no user benefit to preserving it in the URL.

Examples:

```text
/catalog?category=impact-play
/catalog?preference=love
```

A query parameter must not duplicate durable profile data merely because a route exists.

---

## 1.4 Navigation behavior

Replace screen-state transitions with router navigation.

Current patterns such as:

```ts
setScreen("profile")
setScreen("scene-builder")
```

should become either declarative links or route navigation:

```tsx
<Link to="/profile">...</Link>
```

or:

```ts
navigate("/profile")
```

Use declarative links for ordinary navigation whenever possible. Use imperative `navigate()` when a transition depends on workflow completion or calculated state.

### Browser history expectations

After M18:

- opening Profile then Catalog should create meaningful Back navigation;
- opening Settings should not require a custom `resumeScreen` variable;
- finishing a quiz can navigate to its results route;
- leaving results can return to the hub/profile using ordinary routing rather than a hidden screen stack;
- header navigation must participate in browser history.

---

## 1.5 Return behavior

Do not encode fragile `returnScreen` state where browser history already provides the correct user expectation.

For workflows where the destination genuinely depends on origin, use one of these in order of preference:

1. browser history (`navigate(-1)`) when safe and deterministic;
2. explicit URL search/state when the origin is part of the navigation contract;
3. a feature-local fallback destination when direct entry is possible.

Directly visiting a route must never require hidden state established by another page first.

---

# 2. Application shell

## 2.1 One navigation shell

`ProfileAppRoot` and `App` should no longer maintain separate page/navigation state machines.

The top-level application should conceptually become:

```tsx
<Providers>
  <RouterProvider router={router} />
</Providers>
```

The routed app layout should own shared chrome:

- `SiteHeader`;
- route outlet;
- Return-to-Top behavior;
- global error/not-found surface where appropriate.

Settings becomes a normal route rendered through the same shell.

---

## 2.2 Providers

Provider composition should be centralized in an application-level location rather than accumulating in `main.tsx` or individual pages.

Initial providers may include the existing profile-settings context. Additional providers should only be introduced for state that is genuinely cross-route and runtime-shared.

Do not use Context as a replacement for every prop merely because routes now exist.

---

# 3. Source organization

## 3.1 Target shape

M18 should move the UI toward a feature-oriented structure similar to:

```text
src/
├── app/
│   ├── AppLayout.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── components/
│   ├── navigation/
│   ├── charts/
│   └── common/
│
├── features/
│   ├── hub/
│   ├── quizzes/
│   ├── profile/
│   ├── catalog/
│   ├── rewards-punishments/
│   ├── scenes/
│   ├── comparison/
│   ├── curation/
│   └── settings/
│
├── data/
├── lib/
└── main.tsx
```

This shape is directional rather than a demand to move every file immediately.

The goal is **ownership clarity**, not folder ceremony.

---

## 3.2 Feature ownership rule

A component belongs in a feature when it primarily exists for that feature.

Examples:

```text
features/scenes/SceneBuilderPage.tsx
features/scenes/components/SceneCandidateCard.tsx
features/profile/ProfilePage.tsx
features/profile/components/OverallRadarChart.tsx
features/rewards-punishments/RewardsPunishmentsPage.tsx
```

A component belongs under shared `components/` only when it is genuinely reusable across unrelated features.

Do not promote a component to global/shared merely because it *might* be reusable someday.

---

## 3.3 Domain logic stays separate

The existing `data/` and `lib/` directories already contain substantial non-React domain logic and tests.

M18 should **not** perform a broad rewrite of those layers.

Move a domain utility only when its ownership is clearly feature-specific and the move reduces ambiguity without creating dependency cycles.

Scoring, evidence convergence, profile aggregation, persistence, ranking, scene composition, and import/export semantics must remain behaviorally compatible.

---

# 4. Page extraction

## 4.1 App.tsx breakup

`App.tsx` should stop being a page collection.

Extract at least:

- Hub page;
- Quiz page;
- Quiz Results page;
- Overall Profile page;
- Catalog page wrapper;
- Ranking page wrapper;
- Rewards & Punishments page wrapper;
- Scene Builder page wrapper;
- Compare Profiles page wrapper;
- Curation page wrapper;
- Settings page.

The final `App`/router layer should know **which page to render**, not contain the implementation of every page.

---

## 4.2 Quiz orchestration

Quiz-specific state currently mixed into the application shell should move into the quiz feature.

This includes responsibility for:

- active quiz lookup from `:quizId`;
- question index/progression;
- answer updates;
- completion navigation;
- quiz reset flow;
- quiz-specific score/radar view-model creation.

The quiz route must handle invalid or unavailable quiz IDs gracefully.

A malformed or unknown route must not silently mutate profile state.

---

## 4.3 Profile view-model boundary

The Overall Profile page may still construct profile view models with existing `lib/` functions, but that work should not be computed globally for every route unless required by another active feature.

Prefer calculating expensive/feature-specific derived state at the route/feature boundary that consumes it.

Avoid turning the new app shell into the same monolith with cleaner filenames.

---

# 5. Large feature refactors

## 5.1 Scene Builder

`SceneBuilder.tsx` should be decomposed after route/page extraction is stable.

Likely boundaries include:

- builder/page orchestration;
- theme selection;
- current-session state controls;
- candidate/result cards;
- scene composition/editor;
- randomization controls;
- saved scene/library UI;
- reward/punishment integration UI.

The existing scene domain utilities remain the behavior source of truth.

This extraction should not redesign M13.

---

## 5.2 Rewards & Punishments

The Rewards & Punishments area already contains multiple conceptual subfeatures. M18 should organize them as one feature family rather than unrelated root-level components.

Potential internal boundaries:

```text
features/rewards-punishments/
├── RewardsPunishmentsPage.tsx
├── sorter/
├── ranking/
├── randomizer/
├── recipes/
└── profile/
```

Do not require each internal mode to become a public browser route unless Back/Forward or direct linking materially improves that workflow.

---

## 5.3 Styles

The giant global stylesheet should be reduced gradually.

M18 should distinguish:

- theme/tokens;
- global element/reset rules;
- app-shell/layout rules;
- truly shared component styles;
- feature-local styles.

Feature styles may remain CSS files; M18 does not require CSS Modules, CSS-in-JS, Tailwind, or another styling framework.

Avoid a styling-system migration disguised as file cleanup.

---

# 6. Data lifecycle and compatibility

Routing/refactoring must preserve all current browser-local data contracts.

M18 must not invalidate or discard:

- quiz answers/history;
- catalog profile preferences;
- ranking state/history;
- Rewards & Punishments state;
- saved scene data;
- display/settings state;
- backup/import/export compatibility.

Existing storage keys and migrations should remain unchanged unless a change is required by the refactor and is explicitly migration-safe.

Opening a route directly must load the same stored profile data as entering it through the hub.

---

# 7. GitHub Pages and previews

M18 must explicitly validate both deployment forms:

```text
Production:
https://petaurora.github.io/kink-profile/

PR preview:
https://petaurora.github.io/kink-profile/pr-<number>/
```

Required behaviors:

- root loads;
- navigating between routes works;
- browser Back/Forward works;
- refreshing a routed page works with the selected hash-routing strategy;
- PR-preview routing does not escape into the production base path;
- generated asset URLs continue honoring `VITE_BASE_PATH`.

Do not replace the working production/preview deployment model merely to obtain clean URLs.

---

# 8. Accessibility and navigation UX

Routing changes must preserve accessibility expectations.

At minimum:

- current navigation state remains exposed appropriately in the header;
- route changes move/focus users predictably rather than leaving keyboard focus on removed controls;
- page titles/headings remain coherent;
- Return to Top continues to work across route changes;
- navigation elements that navigate should use link semantics rather than button semantics where appropriate;
- disabled/unavailable quiz states remain non-navigable.

A later slice may introduce a small route-change focus/scroll helper if the default router behavior is insufficient.

---

# 9. Testing strategy

## 9.1 Preserve domain tests

Existing `lib/` and `data/` tests should continue to pass unchanged wherever possible.

A refactor that requires broad changes to scoring/evidence tests is a warning that M18 is crossing into semantic work.

## 9.2 Add routing tests

Add focused tests for:

- known route → expected page;
- unknown route → safe not-found/fallback behavior;
- quiz ID route resolution;
- completed quiz → results navigation;
- Settings navigation without `resumeScreen`;
- header destination navigation;
- relevant catalog query-parameter parsing/normalization;
- direct-route loading with stored profile state.

## 9.3 Regression checks

Each extraction slice should keep:

```text
npm test
npm run build
```

green before merge.

PR preview should be used for route/back/refresh smoke testing whenever routing behavior changes.

---

# 10. Implementation slices

M18 should be delivered incrementally rather than as one giant refactor PR.

## M18.1 — Router foundation + application shell

- [ ] add React Router dependency
- [ ] introduce hash router
- [ ] create `app/router.tsx`
- [ ] create common routed layout
- [ ] preserve GitHub Pages + PR-preview base behavior
- [ ] add safe not-found handling
- [ ] add initial routing smoke tests

**No page redesign.**

---

## M18.2 — Hub + Settings routing

- [ ] extract Hub page
- [ ] make Settings a normal route
- [ ] remove `settingsOpen`
- [ ] remove `resumeScreen`
- [ ] route SiteHeader destinations through router navigation
- [ ] preserve display-name/settings context behavior

This slice removes the duplicate navigation state machine in `ProfileAppRoot`.

---

## M18.3 — Quiz + Results routes

- [ ] extract Quiz page
- [ ] extract Quiz Results page
- [ ] resolve active quiz from route parameter
- [ ] move quiz question/progression state into quiz feature
- [ ] preserve completion/reset behavior
- [ ] handle unknown/unavailable quiz IDs safely

---

## M18.4 — Profile + Catalog + Ranking routes

- [ ] extract Overall Profile page
- [ ] route Profile entry from SiteHeader
- [ ] extract Catalog route wrapper
- [ ] represent useful catalog drill-down in URL/query state
- [ ] extract This-or-That Ranking route wrapper
- [ ] remove corresponding `screen` transitions
- [ ] preserve catalog/profile refresh boundaries

---

## M18.5 — Feature routes

- [ ] route Rewards & Punishments
- [ ] route Scene Builder
- [ ] route Compare Profiles
- [ ] route Curation Workbench
- [ ] remove remaining `Screen` union/state
- [ ] delete obsolete open/close/navigation callback plumbing

At completion of M18.5, browser routing is the sole page-navigation authority.

---

## M18.6 — Feature organization + giant-file breakup

- [ ] organize root-level React files into feature folders
- [ ] break `SceneBuilder.tsx` into coherent feature-local components
- [ ] break remaining oversized page components where ownership boundaries are clear
- [ ] move genuinely shared components to shared component folders
- [ ] avoid circular feature dependencies

This slice is structural. It should not change the M11/M13 product models.

---

## M18.7 — Style ownership + cleanup

- [ ] separate global/app-shell styling from feature styling
- [ ] colocate/move feature-specific CSS with owning features
- [ ] remove styles made unreachable by the refactor
- [ ] preserve existing visual behavior unless a regression fix is required
- [ ] perform mobile + desktop route/navigation smoke test

---

## M18.8 — Architecture regression + documentation closeout

- [ ] run complete test/build suite
- [ ] validate production-base build
- [ ] validate PR-preview-base build
- [ ] manually verify route refresh, Back/Forward, and direct entry
- [ ] verify backup/import/export compatibility
- [ ] update developer documentation with final structure
- [ ] mark obsolete architecture references as retired

---

# 11. Acceptance criteria

M18 is complete when all of the following are true:

1. Page navigation is controlled by React Router rather than a `Screen` state union.
2. Settings is a routed page, not a second hidden navigation mode.
3. Browser Back/Forward behaves naturally across major product pages.
4. Production and PR-preview deployments both support routed navigation and refresh safely.
5. Major pages are extracted from `App.tsx`.
6. `App.tsx` is no longer the owner of quiz, profile, catalog, and feature-page render trees.
7. Large feature files are decomposed where clear component boundaries exist, especially Scene Builder.
8. Root-level `src/` no longer acts as an undifferentiated bucket of unrelated feature components.
9. Existing profile/storage/import/export semantics remain compatible.
10. Existing scoring/evidence/domain tests remain green.
11. Route-level regression tests cover the new navigation contract.
12. No intentional product redesign or scoring-model change is bundled into the milestone.

---

# 12. Architecture rules after M18

These rules should guide future features such as Body Map and future account/shared-profile work.

### Pages are routes

A new top-level user destination should normally be represented as a route rather than another application-level screen enum/state branch.

### Features own their UI

Feature-specific page/components/styles live with the feature unless proven broadly reusable.

### The app shell stays boring

The application shell should compose providers, routing, and shared chrome. It should not calculate profile semantics or contain feature workflows.

### Domain behavior stays testable outside React

Scoring, ranking, evidence, candidate generation, persistence transformations, and other business rules should remain in testable non-React modules.

### URL state is intentional

Put state in the URL when navigation/history/direct-link value exists. Do not turn every local UI toggle into route state.

### Refactor before another monolith forms

Large files are not automatically bad, but a file that owns multiple independent responsibilities should be split along those responsibilities before new feature work compounds it.

---

# 13. Relationship to other milestones

M18 is intentionally cross-cutting and may be implemented before or alongside portions of M15–M17.

Recommended sequencing:

```text
M18.1–M18.5  routing + page extraction
        ↓
new feature work lands into routed feature boundaries
        ↓
M18.6–M18.8  deeper organization/cleanup + closeout
```

M16 semantic/data curation may continue in parallel because its domain/data work is largely independent. UI-heavy additions should avoid expanding the current `App.tsx` screen-state architecture once M18 routing work begins.

M17 Body Map should preferably land into the post-M18 routed/feature structure rather than becoming another branch in the current monolithic App render tree.

---

## Final product rule

M18 succeeds when adding the next major feature feels like:

```text
create feature folder
create route/page
connect existing domain/storage contracts
```

—not:

```text
open App.tsx
add another screen value
add another navigation callback
add another giant conditional render block
pray
```
