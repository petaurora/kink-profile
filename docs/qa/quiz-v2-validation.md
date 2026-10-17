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
- On mobile, verify **one** question at a time with five full-width, selectable answers; Back and Save & exit buttons do not overlap the V2 bottom nav or bottom safe area.
- On desktop, verify **three** separate independently answerable cards (except final partial group); in-card progress, Back and gated Next, chart breakdown, and next-step destinations remain readable.
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
- Start a new quiz and verify there is **no** move-ahead or Review unanswered action. The in-card progressbar must count only explicitly saved responses; an unanswered question stays unknown rather than becoming zero.
- Answer sequentially, Save & exit, reload; Continue must target the earliest unanswered question even when legacy stored drafts contain gaps or the first unanswered falls in the middle of a desktop three-question group.
- Complete a quiz and record result; start a retake, answer one or two questions, close/reload/return to Results. Last completed answers/results remain authoritative, while retake draft is preserved separately.
- Finish the retake; only after all questions are answered should the authoritative result change. No reset, delete-history, discard-draft, or start-over control should appear on Quiz Home, runner, or Results.
- Confirm mere navigation, focus, chart expansion, or entering Learn does not write catalog ratings, consent, role claims, or session-only Lab demo records.

## Evidence and sign-off

For each manual gate, record date, environment/device/browser and assistive-technology version, tested path, outcome, screenshots or notes, and any blocking issue/PR commit that resolved it. Add links to this PR description and update Notion's Quiz UX workshop. Re-run relevant automated and hands-on checks after material fixes.

**Merge condition:** All four manual+automated gates documented as PASS, no blocking open findings, CI/production build/preview green on the final PR head, and owner review complete. No auto-merge and no promotion of PR #300 out of draft purely from green CI.

**Open UX decisions:** Decisions 1–11 cover the approved experience. Do not invent Decision 12 for validation itself. Only reopen a substantive workshop question if real review uncovers a product trade-off not determined by the existing decisions.

## Android phone screenshot audit — October 16, 2026

**Review evidence supplied:** browser screenshots showing Quiz Home, the initial Bondage & Discipline question, the full five-choice question card, and the four-control mobile footer.

- **V-01 — Initial question barely visible:** before fix, focusing the heading and using `scrollIntoView({block:'nearest'})` left the entire question card near the bottom of the first viewport. Changed runner to focus the semantic h2 but scroll its enclosing question **card** to the start of the viewport, with phone safe-area scroll margin. Automated tests assert the scroll target and alignment argument. **Manual phone recheck is still required** after preview deployment.
- **V-02 — Response wording APPROVED and updated in code:** the user chose warm-and-natural affinity labels `Nope / A little / Somewhat / A lot / Absolutely`. They are shared by native V2 and legacy quiz answer buttons via `answerOptions`. The values remain **0, 1, 2, 3, 4**, and scoring, question versions, and saved answers are unchanged. Regression coverage checks rendered labels and numeric persistence. **Manual phone recheck remains required** for wrapping and visual clarity. Desired-frequency scoring is a separate open concept, not part of this wording change.
- **V-03 — Clunky 2x2 mobile footer:** replaced equal-weight boxed controls with an inline three-action order: understated Back, understated Save & exit, emphasized Next question; Review unanswered is a separate quiet full-width text action below them. The four controls remain keyboard reachable and at least 44px in touch height. **Manual 320–390px and accessibility recheck is required.**
- **V-04 — Exposed Lab-only copy:** condensed landing introduction, replaced storage explanation with user-facing save guidance, and hide the UI Lab's generic experimental disclaimer/Toast Playground control only while browsing Quizzes. **Recheck both Quiz Home and question/results after fresh preview load.**

These are **implemented candidate corrections**, not a device-validation PASS. The screenshots are evidence of the *previous* problem state. The original four manual validation gates remain OPEN until the updated preview has been inspected with actual browser/device observations.

## Second Android screenshot review — October 16, 2026

- **V-05 / focused heading appearance:** user confirmed first question card now scrolls into view. The large h2 selection-like focus outline was visually distracting, so it is removed while the h2 remains programmatically focused. Manual check that keyboard focus remains visible on response buttons and navigation controls.
- **V-06 / response confirmation:** the user wants a selected row with a checkmark before the next question appears, with a brief visual transition (~260ms); reduced-motion skips the delay. Answer should persist as soon as it is chosen, even if the user navigates away before transition finishes. Test that no double answer is accepted during confirmation and no stale transition fires after unmount.
- **V-07 / visible progress:** a custom thin gradient progress line now sits along the *top of every question card*, matching V2 shell divider styling. Test saved-answer count, animated fill, one accessible progressbar per desktop batch, scroll alignment and 320px layout.
- **V-08 / sequential flow supersedes skip-ahead:** no phone Next question, no Review unanswered, no skip hint. Desktop Next questions remains disabled until every displayed question is answered. Back and Save & exit remain usable. Earlier Decision 9 D skip approval is expressly superseded by this later user preference, while no-implicit-zero and resume guards remain.

**Status:** implemented candidate changes on PR #300, requiring current-head CI and further real-phone + AT review before any manual gate can pass. All four Decision 11 gates remain blocking and PR remains draft.
