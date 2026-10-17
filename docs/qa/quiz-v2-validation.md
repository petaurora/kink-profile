# Quiz UX V2 — Decision 11 pre-merge validation gate

**Scope:** Kink Profile draft PR #300, stacked on `feat/ui-lab-foundation` / PR #276. Decision 11 approves **D: full validation**, not a reduced automated-only sign-off. The PR must stay **draft and unmerged** until every gate below has verified evidence and zero unresolved blocking regressions.

## Gate status (October 16, 2026)

| Gate | Automated evidence | Hands-on evidence | Status |
| --- | --- | --- | --- |
| Responsive layout and touch/safe areas | Responsive question renderer tests (390px mobile and 1100px desktop); production/preview TypeScript+Vite builds | Required on physical small phone and desktop browser, with screenshots and scrolling | **OPEN — device review required** |
| Accessibility and semantic controls | Focus-navigation regression tests and axe-core WCAG structural scans (without color-contrast in jsdom) | Required with keyboard-only and TalkBack/VoiceOver or equivalent screen reader; visual color contrast | **OPEN — assistive-tech review required** |
| Navigation and browser Back | Router/link tests, saved resume and additional routed-history integration coverage | Required in the deployed PR preview on device and desktop, including browser history | **OPEN — browser review required** |
| Saved data and results authority | All four quiz definitions, saved attempts, sparse/unknown coverage, retake preservation and atomic completion tests | Required on a **test** profile with test answers and a backup, including reload and return to results | **OPEN — real-browser data review required** |

*Passing automated tests is necessary, not sufficient.* A GitHub Actions green check does **not** close a hands-on gate. A simulated DOM cannot prove viewport overflow, tap target reachability, OS virtual-keyboard interactions, real scroll positions, actual screen-reader speech, or displayed contrast.

## Reproducible checks

### 1. Responsive visual / touch
- Check a narrow phone (~320 CSS px), a typical phone (~375–390px), tablet (~768px), desktop (~1024px), and a wide desktop (~1440px). Also inspect 200% browser zoom and landscape orientation.
- Verify all four Quiz Home cards remain legible and distinct; long title/description lines wrap naturally with no clipped actions, horizontal scroll, or squeezed response labels.
- On mobile, verify **one** question at a time with five full-width, selectable answers; buttons Back, Review unanswered, Save & exit, Next question do not overlap the V2 bottom nav or bottom safe area.
- On desktop, verify **three** separate independently answerable cards (except final partial group); progress, back/next, review, chart breakdown, and next-step destinations remain readable.
- On questions near the bottom of long pages, verify programmatic focus scrolls the next heading **below the sticky header**, without jumping beyond it or hiding choices. Recheck with keyboard open, orientation changes, and Android system text scaling.
- On Results, verify compact summary + radar first; full breakdown expands without layout overflow; Profile / another quiz / Learn remain equally weighted.

### 2. Accessibility
- Keyboard-only sequence: enter quiz, Tab through answer buttons, arrow? (not a radio group), activate with Space/Enter, Back, Next, Save & exit, Review unanswered, Retake; verify no keyboard trap and visible focus at each stop.
- Confirm on entry/resume and on **every** question change that the active h2 heading receives focus; check question number/total spoken accurately, and that the heading is excluded from normal forward Tab sequence (`tabIndex=-1`).
- With TalkBack (Android) or VoiceOver (iOS/macOS), check each answer announces text and selected/unselected status; group progress is truthful; disclosure summary announces expanded/collapsed state; chart details remain accessible as text even if SVG visualization is ignored.
- Verify non-selected and selected states do not rely on color alone, and manual contrast checks cover muted supporting text, focus outlines, selected answers, and controls on dark background. Verify reduced-motion preference does not require animation to understand changes.
- Automated axe-core tests disable color-contrast in jsdom because there is no reliable rendered layout/contrast measurement. Do not mark contrast passed based on those tests.

### 3. Navigation / browser history
- Enter Quizzes from Home, Profile, Discover and full menu; verify no sixth primary tab.
- Open `#/ui-lab/quizzes`, `#/ui-lab/quizzes/question?id=dominance-submission` and `#/ui-lab/quizzes/results?id=dominance-submission` directly. Check missing/invalid IDs and unavailable result explanation.
- Verify legacy `#/quizzes`, `#/quizzes/dominance-submission`, and `#/quizzes/dominance-submission/results` redirect into native V2 destinations without losing the selected quiz.
- Start, answer, **Save & exit**, browser Back, forward, reload; verify route and selected-answer persistence. Distinguish intra-quiz Back button from browser history Back.
- Results choices must route to **durable /profile**, canonical V2 Quiz Home, and education reader, with no background preference or permission writes.

### 4. Data integrity / privacy
- Use a non-production test profile; record a copy/backup before tests. Ensure four existing quizzes and current question IDs/scales remain unchanged.
- Start a new quiz, skip questions via Next, and verify no saved zero/answer for missing questions. The progressbar must count only selected answers, not visited items.
- Answer out of order, Save & exit, reload; Continue must target the earliest unanswered question even if on a middle card of a desktop three-question group.
- Complete a quiz and record result; start a retake, answer one or two questions, close/reload/return to Results. Last completed answers/results remain authoritative, while retake draft is preserved separately.
- Finish the retake; only after all questions are answered should the authoritative result change. No reset, delete-history, discard-draft, or start-over control should appear on Quiz Home, runner, or Results.
- Confirm mere navigation, focus, chart expansion, or entering Learn does not write catalog ratings, consent, role claims, or session-only Lab demo records.

## Evidence and sign-off

For each manual gate, record date, environment/device/browser and assistive-technology version, tested path, outcome, screenshots or notes, and any blocking issue/PR commit that resolved it. Add links to this PR description and update Notion's Quiz UX workshop. Re-run relevant automated and hands-on checks after material fixes.

**Merge condition:** All four manual+automated gates documented as PASS, no blocking open findings, CI/production build/preview green on the final PR head, and owner review complete. No auto-merge and no promotion of PR #300 out of draft purely from green CI.

**Open UX decisions:** Decisions 1–11 cover the approved experience. Do not invent Decision 12 for validation itself. Only reopen a substantive workshop question if real review uncovers a product trade-off not determined by the existing decisions.
