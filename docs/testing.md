# Automated testing

## Component and domain tests

```bash
npm ci
npm test
```

Vitest runs the existing source tests. Its configuration preserves Vite's React
setup and excludes `e2e/` so Playwright tests are never collected by Vitest.

## Browser journeys

```bash
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

Playwright type-checks its configuration and tests, builds the application, and
starts Vite preview on `127.0.0.1:4173`. The build uses
`/kink-profile/pr-0/` and preview storage namespace `0`, exercising nested asset
paths, the loading preview gate and hash routes. No hosted preview or personal
profile is used. An occupied port fails rather than reusing an unknown server.

The default projects are desktop Chromium, Pixel 7-emulated Chromium, and
iPhone 13-emulated WebKit. Each test receives a fresh browser context, including
fresh local storage, cookies, session storage and service workers. Tests make
changes through the visible application. They read synthetic saved quiz state and
actual downloaded backup contents to verify persistence. Uploaded valid backups
come from the app's export UI; malformed files are explicit rejection inputs.
They do not inject scores, call domain functions or mock
the application services. Catalog's existing visible save-failure diagnostic is
used to verify recovery.

```bash
# One browser or journey
npm run test:e2e -- --project=mobile-chromium
npm run test:e2e -- --grep "retake"

# Interactive inspection (install full Chromium for headed/UI mode)
npm run test:e2e:ui
npm run test:e2e:report
```

`playwright.config.ts` owns the browser matrix, timeouts and server. The fixture
in `e2e/fixtures.ts` handles preview entry, visible full-menu navigation and
uncaught browser errors. Use role/name locators and retrying assertions; wait for
visible state, focus or confirmed saves instead of fixed sleeps. The phone
confirmation test deliberately controls the browser clock to inspect the locked
390ms feedback state. Quiz metadata imports supply IDs and question counts;
production lifecycle/scoring/persistence code must remain outside test actions.

## Coverage

| Area | Browser assertions |
| --- | --- |
| Shell | Preview deep links, menu focus containment/restoration, routed heading focus, browser Back/Forward, no extra Quizzes primary tab, unavailable-route recovery, shortcut editing |
| Search | Modifier handoff, focused destination, nested browser Back, retained queries, rapid query replacement, empty-result recovery |
| Catalog | Independent overall/modifier/Experienced edits, keyboard selection/cancel, clear/Undo, failed save/retry, session-only reload behavior, actual sort order, category grouping, subject handoff, contextual grouping availability, classification filters, concept/Item independence |
| Discover | Reflection draft/resume/complete/repeat, previous-prompt notes, historical notes, dismiss/restore independence, delete/cancel confirmation, expired session links, dismiss-all fallback, bulk restore confirmation, no implicit preference writes |
| Quizzes | All four quizzes save/reload/resume, fully complete and retake; old result authority during drafts; repeated phone taps; 320px reduced motion/keyboard; invalid/legacy route recovery |
| Education | Search/reader/Back context, topic and empty-result recovery, ascending/descending order, context-appropriate sort controls, stable article IDs, rendered tables, related links, unavailable articles, no preference writes |
| Local data | Name validation/normalization/reload, actual JSON download and confirmed restore, malformed/unknown backup rejection, reset cancel and selective quiz reset, independent name preservation, developer-tools opt-in |
| Comparison | Actual exported backup upload, session-only comparison and shared Scene Builder handoff, invalid-upload recovery, original quiz data preserved |
| Tools | Reward and punishment recipe save/reload/edit/duplicate/delete, empty randomizer pool behavior and setup handoff, scene theme/empty evidence behavior, durable Catalog preference to saved scene/copy/confirmed deletion |
| Ranking & sharing | Pairwise choice/equal/skip reload persistence, ordering count distinct from skip history, independent explicit preferences and quizzes, actual standalone HTML export without raw answers |

The suite defines **52 distinct scenarios** in ten spec files. Running three
projects produces **156 scheduled browser cases**: 155 applicable runs and one
intentional desktop skip for the phone-only repeated-tap behavior. These are
separate counts, not 156 different journeys. Use `npx playwright test --list` to
inspect the current inventory as the suite evolves.

Browser tests supplement the source tests; they do not reimplement score math.
Catalog/Discover Lab records are session-only, while quiz answers are persisted
in the preview-namespaced browser profile. Tests deliberately verify this
difference instead of imposing durability on the Lab.

This is broad regression coverage, not exhaustive coverage of every route or
combination. Ranking run archival, full curation editing, every R/P pool
configuration, legacy backup migrations and PNG/PDF sharing exports still have
source-level coverage without complete browser journeys.

## CI and diagnostics

`.github/workflows/e2e.yml` runs on pull requests, pushes to `main` and
`feat/ui-lab-foundation`, and manual dispatch. It installs the locked dependencies
and Chromium/WebKit with system libraries, then runs all projects with two
workers. One CI retry records diagnostic context; a flaky pass still fails CI.
Local runs have no retries.

The HTML report is retained as a workflow artifact for 14 days, with screenshots,
videos and traces for failures. Generated reports and browser state are ignored
by git. View a trace with `npx playwright show-trace path/to/trace.zip`. Browser
artifacts include only synthetic test data.

Emulation does not certify physical-device touch/keyboard behavior, screen-reader
speech, visual contrast or product/editorial review. The separate
[quiz validation checklist](qa/quiz-v2-validation.md) retains those manual gates.
No automated run by itself closes a hands-on gate.
