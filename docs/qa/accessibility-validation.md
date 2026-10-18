# Accessibility validation

KP targets WCAG 2.2 AA. Automated checks are regression evidence for the sampled
states, not a conformance certification. This protocol applies to the current
rendered application; it does not certify planned themes or unavailable features.

## Automated checks

```bash
npm run test:a11y
npm run test:a11y -- --project=desktop-chromium
```

The regular `npm run test:e2e` and browser CI job also include every `@a11y`
scenario. `e2e/accessibility.ts` configures axe with `wcag2a`, `wcag2aa`,
`wcag21a`, `wcag21aa` and `wcag22aa`. Rendered color contrast remains enabled;
there are no rule or element exclusions and no severity threshold that silently
allows violations. Each scan asserts zero detected violations and attaches its
full JSON results to the Playwright report, including `incomplete` checks that
require human judgment. Reports use synthetic data and the isolated preview
storage namespace.

Scans wait for fonts and finite entrance animations before inspecting the real
browser rendering. They run after deliberate interactions reveal content, not
only at initial page load. Coverage includes:

- Home, Catalog and classifications, Profile, Discover, Education, Quiz landing
  and questions, Settings, comparison, Scene Builder, recipes, randomizer and
  ranking. Existing-app pages are sampled in Midnight, Dusty Rose, Oxblood, Crimson Depths and INFJ.
  The appearance suite additionally samples all five presets in the V2 shell,
  Catalog, Education/reader, quiz questions, Settings and the rating dialog.
  App selection, rather than OS preference, controls the palette.
- Open navigation/search, search results, nested refinement/rating sheets,
  rating guidance, failed-save recovery, experience guidance, classification
  filters, reflection notes/deletion confirmation and settings validation,
  rejected imports and reset review.
- Completed results, expanded breakdown, established results during an unfinished
  retake and replacement results for all four quizzes.
- Real keyboard Tab/Shift+Tab/Enter/Space/Escape navigation, skip-to-content,
  drawer wrapping, nested Escape/trigger restoration, quiz answer/save/exit and
  a 320px reduced-motion view with enlarged text and spacing.
- Explicit accessible names/descriptions and pointer/touch activation across the
  full card, including its description, without swallowing secondary actions.

Component axe tests in jsdom still disable contrast because jsdom cannot measure
rendered colors/layout reliably. Passing those tests is not contrast evidence.
Likewise, role locators and keyboard focus assertions do not reproduce speech
from a screen reader.

When extending a feature, add scans for meaningful new states and keyboard
transitions. Fix detected issues; do not add broad exclusions to obtain a pass.
Retain failed-state reports/traces in the CI artifact. Review incomplete checks
alongside the human protocol below.

## Human release review

Record the commit, device/browser/assistive-technology versions, tested flows,
observations and linked defects in the owning issue or PR. A browser-emulated
device is not evidence of physical-device or screen-reader sign-off.

| Review | Required behavior |
| --- | --- |
| Keyboard and visible focus | Complete core flows without a pointer. Every action is reachable in a logical order, focus is visible and unobscured, menus/dialogs close predictably, and focus returns to a useful control. |
| Screen readers | Use Android TalkBack and a complementary VoiceOver or NVDA/browser combination. Check reading/landmark order, control names and descriptions, selected states, live errors/saves, question changes and progress. Avoid duplicate or competing announcements. |
| Text enlargement and browser zoom | Check actual 200%/400% browser zoom, OS enlarged text and text spacing. Content wraps, controls remain usable, and sticky navigation or the virtual keyboard does not hide focused content. The automated user stylesheet tests reflow, not actual browser zoom. |
| Contrast and state meaning | Check text, icons, focus indicators, chart boundaries, gradients and hover/selected/error states in each supported theme. Information and required actions remain understandable without color alone. Resolve relevant axe incomplete findings manually. |
| Touch and motion | Check targets and spacing on a physical small phone, orientation/safe areas, scrolling and virtual-keyboard behavior. Reduced motion retains all feedback and functionality. |
| Visualizations and content | Confirm charts have useful textual values/alternatives and descriptions are meaningful. Automated presence checks cannot establish whether an alternative explains the visualization well. |

Use the [Quiz-specific validation protocol](quiz-v2-validation.md) for question
focus, results authority and device details. Existing human review gates remain
open until their evidence is recorded; automated CI does not close them.

Reference: [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) and
[W3C accessibility evaluation guidance](https://www.w3.org/WAI/test-evaluate/).
