# Application Architecture

This document describes the **current implemented application structure**: how browser routing, feature ownership, shared UI, persistence, styling, and GitHub Pages hosting fit together.

It is a durable system contract, not a milestone log. Historical implementation sequencing belongs in Issues, PRs, and git history.

## Entry point and routing

`src/main.tsx` mounts `AppRouter` and the root stylesheet.

`src/app/AppRouter.tsx` owns browser-level page routing with React Router's `HashRouter`. Hash routing is intentional because the app is deployed as a static GitHub Pages site and must support direct entry and refresh without requiring server-side rewrite rules.

The canonical route contract lives in `src/app/routes.ts`:

| Route | Owner |
| --- | --- |
| `/` | Explore / hub |
| `/profile` | Profile |
| `/quizzes` | Quiz Home |
| `/quizzes/:quizId` | Quiz flow |
| `/quizzes/:quizId/results` | Quiz results |
| `/catalog/kinks` | Catalog · Kinks · Browse |
| `/catalog/kinks/rank` | Catalog · Kinks · Rank |
| `/catalog/rewards` | Catalog · Rewards & Punishments · Browse |
| `/catalog/rewards/rank` | Catalog · Rewards & Punishments · Rank |
| `/tools/rewards/randomizer` | Tools · R/P Tools · Randomizer |
| `/tools/rewards/recipes` | Tools · R/P Tools · Recipes |
| `/scene-builder` | Tools · Scenes |
| `/compare` | Tools · Compare |
| `/curation` | Curation Workbench |
| `/settings` | Settings |

Compatibility routes remain explicit while M19 reorganizes information architecture:

- `/catalog` redirects to `/catalog/kinks` and preserves supported query state;
- `/ranking` redirects to `/catalog/kinks/rank`;
- `/rewards` and `/rewards?workspace=catalog` redirect to `/catalog/rewards`;
- `/rewards?workspace=tools` redirects with replacement history semantics to `/tools/rewards/randomizer`.

Unknown routes redirect to the canonical hub fallback defined by the same route contract.

Route path builders such as `quizRoutePath`, `quizResultsPath`, and feature-specific helpers such as `catalogRoutePath` should be used instead of duplicating path strings when navigation carries application meaning or query state.

## Navigation ownership

React Router is the sole page-navigation authority.

`src/app/MobilePrimaryNav.tsx` owns persistent mobile product navigation. Quiz targets the canonical `/quizzes` home route. Catalog launches directly into the Kinks and Rewards & Punishments workspaces. Tools launches directly into Scenes, R/P Tools, and Compare. Canonical `/catalog/...` children resolve to Catalog, while Scene Builder, Compare, and `/tools/rewards/...` children resolve to Tools through `src/app/mobilePrimaryNavigation.ts`.

`src/app/DesktopNavigationRail.tsx` owns persistent desktop product navigation. It uses the same primary hierarchy as mobile: Hub, Quiz, Catalog, Profile, and Tools, with Settings pinned separately at the bottom. The rail header is product branding only; profile identity is not duplicated there, so Profile remains the single explicit profile destination. Catalog reveals Kinks and Rewards & Punishments as child workspaces while active; Tools reveals Scenes, R/P Tools, and Compare while active. The paw control collapses the rail to a narrow handle rather than opening a second navigation menu. `src/app/desktopNavigation.ts` derives desktop active-state and child-workspace state from the same routed location contract rather than introducing a second navigation model.

Settings remains Profile-owned for primary active-state semantics while also receiving its own active state in the desktop rail. Internal/admin surfaces such as Curation Workbench are excluded from both ordinary mobile and desktop navigation.

Within a workspace, peer views use the shared `SegmentedControl` component and route navigation rather than an additional app-level state machine. Current examples are Kinks `Browse | Rank`, Rewards & Punishments `Browse | Rank`, and R/P Tools `Randomizer | Recipes`.

`src/app/RoutedFeatureFrame.tsx` is now content-only shell composition: it supplies the shared `app-shell` content wrapper and Profile-owned actions where appropriate, but it does not render or own application navigation. Settings similarly owns only its local back/title header; global navigation is supplied by `AppShell`.

Feature routes may use `useNavigate` directly for feature-specific transitions such as quiz → results, profile → focused catalog, Browse → Rank, or Randomizer → Recipes.

Browser Back/Forward therefore reflects route navigation rather than a parallel in-memory screen state machine.

## Application shell

`src/app/AppShell.tsx` wraps every route and owns application-wide concerns that must survive route transitions:

- `ProfileSettingsProvider` and persistence of profile settings
- the legacy profile-name bridge required by remaining compatibility surfaces
- the route render error boundary
- the global Return to Top control
- the desktop navigation rail and its expanded/collapsed shell offset
- the mobile primary navigation
- the React Router `Outlet`

Ordinary product pages expose one persistent navigation system appropriate to the viewport: the desktop rail above the mobile breakpoint or the fixed mobile bottom navigation at phone widths. Internal or immersive routes such as Curation may intentionally suppress ordinary global navigation entirely.

Page-specific UI does not belong in `AppShell`.

## Source ownership

The target ownership model is:

```text
src/
  app/          browser routing and app-wide shell/navigation
  components/   genuinely shared UI components
  features/     route- or feature-owned UI and route adapters
  lib/          domain behavior, persistence, scoring, transformations
  data/         canonical/generated product data and quiz definitions
  styles/       global theme and legacy compatibility styles
```

Feature directories currently include catalog, comparison, curation, hub, profile, quizzes, ranking, rewards, scenes, and settings.

Large feature UI should be split by responsibility inside its owning feature rather than moved merely to create more folders. Domain behavior that does not require React belongs in testable `lib` modules.

Some root-level React files remain intentionally as compatibility exports or as leaf components that have not gained clearer feature ownership. A root compatibility export is not a second implementation; the canonical implementation lives under `app`, `components`, or `features`.

## Feature route pattern

A feature route should do only the route-level work its feature needs: read route params/query/location state, hydrate persisted input, translate route navigation, and render the feature-owned UI.

Examples:

- Catalog is one primary product area with Kinks and Rewards & Punishments as sibling workspaces. Each workspace exposes route-backed `Browse | Rank` views. `CatalogRoute` owns Kinks Browse/Rank composition, while `RewardsCatalogRoute` owns Rewards & Punishments Browse/Rank composition.
- R/P Tools is a Tools-owned workspace with route-backed `Randomizer | Recipes` views. `RewardsToolsRoute` composes the existing randomizer and recipe-builder behavior without creating new persistence models. Empty-pool setup hands off to Catalog · Rewards & Punishments, where contextual eligibility is defined.
- Kink Catalog focused query state is parsed with `parseCatalogRouteFocus` and serialized with `catalogRoutePath`; the canonical base is `/catalog/kinks`.
- Quiz Home hydrates persisted quiz progress and owns detailed guided-quiz discovery. It opens incomplete quizzes at their quiz route and completed quizzes at their results route. Hub may link to Quiz Home as an overview destination but does not own the detailed quiz catalog.
- Quiz routes resolve only currently available quiz definitions. Unknown, retired, unavailable, or empty quiz definitions fall back to the hub. Direct results access is valid only when all current quiz questions have answers.
- Compare, Rewards/Catalog, R/P Tools, and Scene Builder hydrate current profile/catalog state from persisted inputs rather than relying on state left alive by another page.

Direct route entry and refresh must therefore reconstruct the page from URL state plus persisted profile data.

## Persistence and derived state

Routing does **not** own profile data.

Authoritative browser persistence remains in the existing storage modules under `src/lib`, including quiz progress, catalog preferences/ranking history, profile settings, Rewards & Punishments state, recipes, randomizer eligibility, and saved scenes.

The Catalog and Tools workspace migrations do not rename or migrate those storage schemas. Kink ranking history, catalog preferences, R/P contextual profile data, R/P ranking history, and saved recipes remain in their existing persistence modules; only their route ownership changes. Randomizer session history remains intentionally ephemeral and clears when the Randomizer view is left.

The private profile backup format remains the compatibility boundary for export/import. Route extraction must not silently rename storage keys, change stored schemas, or convert derived output into authoritative stored data.

`src/app/currentProfileSnapshot.ts` is a convenience hydration boundary for routes that need the current quiz/catalog sources plus recomputed catalog and canonical-signal views. Derived views are rebuilt from authoritative persisted inputs on fresh route entry.

Missing evidence remains unknown rather than becoming a stored zero merely because a route was reloaded.

## Quiz route behavior

`src/features/quizzes/QuizHomePage.tsx` is the top-level discovery surface for the current available quiz set. It reuses stored quiz progress to distinguish untouched, in-progress, and completed sections without creating a second quiz-state model.

`src/features/quizzes/quizRuntime.ts` owns pure quiz runtime rules used to interpret stored progress:

- only available quizzes resolve as routable quiz definitions
- a new quiz begins at its first question
- an in-progress quiz resumes at its first unanswered question
- completion is based on answers to the current quiz question set, not solely on a stale `completedAt` timestamp
- results eligibility requires an available, non-empty quiz with all current quiz questions answered

Retired quiz IDs remain supported by persistence/import compatibility where required, but they are not active browser destinations.

## Query-state behavior

URL query state is treated as untrusted input.

Catalog query parsing accepts only known category IDs and supported preference filters. Invalid or unrelated values normalize to the default unfocused catalog state. Path serialization applies the same validation so application code does not create dead query links.

Legacy `/catalog?...` direct links preserve their search string when redirecting into the canonical `/catalog/kinks?...` route. Legacy `/rewards?workspace=tools` remains accepted but resolves immediately to the canonical R/P Tools Randomizer route with replacement history semantics.

When a feature adds durable URL state, parsing and serialization should live near the owning feature and be covered as a round-trip contract.

## Style ownership

`src/main.tsx` imports `src/styles.css`, which currently forwards to `src/styles/legacy.css`. The legacy bundle remains a compatibility layer for styles that still span older surfaces; it should not be mistaken for the desired ownership model.

Newer style ownership follows code ownership where practical:

- global theme tokens live under `src/styles`
- shared-component styles live with shared components
- feature-specific styles live with their owning feature
- root CSS forwarding files may remain temporarily when moving the import would create unrelated large-file churn

Style cleanup must preserve current responsive and visual behavior unless a UI redesign is explicitly in scope.

## GitHub Pages and build bases

Vite's default production base is `/kink-profile/`.

`VITE_BASE_PATH` can override that base for preview builds. Pull-request previews use a PR-scoped path, while CI also builds with a synthetic preview base to catch assumptions that accidentally depend on the production path.

`.github/workflows/ci.yml` runs:

1. tests
2. a production-base build
3. a non-production preview-base build

The PR preview workflow separately builds and deploys the branch under its preview path and comments the resulting URL on the PR.

Because application navigation is hash-based, the asset base path and the in-app route are separate concerns: Vite controls where built assets are served, while React Router owns the route after `#`.

## Regression contract

Architecture changes should preserve these behaviors unless a follow-up explicitly changes the product contract:

- every canonical route can be entered directly
- refresh-style initialization reconstructs route state from URL + persistence
- browser Back/Forward reflects navigation history, including route-backed peer views such as R/P Tools Randomizer/Recipes
- mobile product pages expose only the fixed bottom primary navigation as persistent navigation chrome
- desktop product pages expose the collapsible left rail using the same Hub / Quiz / Catalog / Profile / Tools hierarchy as mobile, with Settings pinned separately at the bottom
- the desktop rail header carries product branding rather than duplicate profile identity
- Catalog and Tools child workspaces resolve consistently across mobile and desktop navigation
- internal/admin routes such as Curation remain outside ordinary product navigation
- unknown routes fall back safely
- catalog query state parses and serializes safely
- legacy Catalog/Ranking links resolve into the canonical Catalog workspace without losing supported query state
- legacy Rewards links resolve into Catalog or canonical R/P Tools without creating a duplicate history step
- quiz IDs and results eligibility are resolved from current definitions and stored answers
- private backup/import/export remains compatible
- restored stored profiles hydrate correctly on fresh routes
- both production and preview-base builds remain green

Prefer focused pure-function tests for route/query/domain contracts and router-memory tests for browser-history behavior. Do not introduce a second navigation state system to make tests easier.

## Change rules

When changing application architecture:

1. Keep page navigation in React Router.
2. Keep route definitions/path helpers centralized or feature-owned rather than scattering string literals.
3. Keep domain behavior outside React when it can be expressed as pure/testable logic.
4. Keep persisted authoritative data separate from recomputable derived views.
5. Preserve storage and import/export compatibility unless a deliberate migration is part of the same change.
6. Move ownership when it becomes clearer; do not perform folder churn solely for visual neatness.
7. Update this document when the implemented architecture contract changes materially.
