# Hub composition

## Purpose

The Hub is a living entry surface, not a fixed feature directory and not a profile-completion dashboard.

Its job is to show a small set of things that are truthful and useful **right now** based on current profile posture, workflow state, and eligible content. Missing optional content should normally disappear instead of becoming an empty card.

The Hub also owns a temporary **Shape Your Profile** guide for early profile-building work. That guide is scaffolding: it recommends one useful next step at a time and disappears entirely once its finite foundation thresholds are satisfied.

## Profile posture

Hub composition consumes the same whole-profile maturity contract as Profile:

- **Unformed** — no meaningful canonical profile shape exists yet.
- **Emerging** — evidence exists, but the overall shape is still developing.
- **Established** — enough dimensions have established evidence for a stable broad profile shape.

Maturity is a posture, not a percentage and not a task-completion score.

Runtime maturity composition lives in `src/features/hub/hubComposition.ts`.

## Shape Your Profile guide

The progressive guide is derived from persisted profile/ranking state through `shapeProfileProgress.ts` and `shapeProfileGuide.ts`.

It has three top-level sections:

- **Quiz**
- **Kink**
- **Rewards & Punishments**

Only the currently recommended activity expands. Earlier sections collapse to concise completed status; later sections remain quiet until relevant.

The current progression is:

1. **Quiz** — complete the available quizzes.
2. **Kink · Category Rank** — every category reaches the 25-choice checkpoint.
3. **Kink · Overall Rank** — reach the first 25 Overall choices.
4. **Kink · Browse & Define** — reach 25% defined as a handoff threshold.
5. **R/P · Fit** — quick-sort until at least two Reward and two Punishment candidates exist.
6. **R/P · Rank Rewards** — reach the first rough-ranking threshold (20% confidence).
7. **R/P · Rank Punishments** — reach the same threshold independently.

These are guidance thresholds, **not** a claim that the profile is complete. The sequence is advisory and does not lock the underlying destinations.

Once all guided foundation thresholds are met, `ShapeProfileGuide` renders nothing. The Hub does not retain a permanent congratulations/completion card.

Further catalog definition, ranking, R/P refinement, and other exploration remain normal ongoing product activity after the guide disappears.

## Composition rules

The guide and the maturity-aware Hub composition are related but separate concerns: the guide recommends profile-building work while active; the maturity composition decides which living Hub modules are eligible.

### Unformed

The Hub stays deliberately small. Shape Your Profile provides the current recommended starting action rather than a separate blank-canvas onboarding card.

The ordinary reflection/dashboard modules remain suppressed while the Hub is in its onboarding composition.

### Emerging

Render, when eligible:

- profile reflection;
- Profile and Catalog intent doors;
- resumable quiz content only when a first attempt or retake is actually in progress;
- latest catalog preference only when an ambient-safe direct preference exists;
- randomizer content only when at least one choice is explicitly random-eligible.

No optional module should render merely to explain that it has nothing useful yet.

Shape Your Profile may still appear above this composition until its own finite handoff thresholds are complete.

### Established

Render the same eligibility-driven optional modules as Emerging, with the richer durable intent-door set:

- Profile;
- Compare;
- Scene Builder;
- Catalog.

An Established dashboard is still compositional. Two established profiles can therefore show different Hub modules if their currently eligible content differs.

Shape Your Profile is not a permanent Established-module; once its finite foundation is done, it disappears.

## Resume semantics

`Continue` is reserved for genuinely resumable quiz work:

- first attempt in progress;
- retake in progress.

The Hub does **not** label never-started, complete, coming-soon, or data-error quiz states as resumable.

A retake uses the retake draft's answered count while the previous completed result remains authoritative until the retake finishes, matching the quiz lifecycle contract.

## Optional module eligibility

Current optional modules use semantic readiness rather than a generic `items.length > 0` rule:

- **Latest preference** requires a real ambient-safe overall catalog preference. Hard Limits are never ambient Hub content.
- **Randomizer** requires at least one explicitly random-eligible reward/punishment choice. Setup-only or empty randomizer states are omitted.
- **Quiz resume** requires a resumable quiz lifecycle state.

Future ideas remain planning material until they have real eligible content.

## Progress and counts

Finite workflows may show finite progress, including Shape Your Profile handoff thresholds or facts such as `2/4 quizzes with established results`.

Other evidence counts may also be shown as facts, such as rated catalog preferences or ranking choices. These are **not** combined into an overall profile-completion percentage.

Unknown profile depth must never be translated into a fake zero-percent completion state.

## Invariants

1. Hub maturity comes from the shared Profile maturity contract.
2. Shape Your Profile is advisory scaffolding, not a gate.
3. Shape Your Profile disappears entirely after its finite foundation thresholds are met.
4. Unformed, Emerging, and Established compositions are observably distinct.
5. Optional modules are omitted when they have no eligible content.
6. `Continue` means resumable work exists.
7. Retakes count as resumable while preserving their previous established result.
8. Finite workflow counts are allowed; overall profile completion percentages are not.
9. Hub composition does not mutate source evidence, scores, preferences, or quiz progress.
