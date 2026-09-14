# Hub composition

## Purpose

The Hub is a living entry surface, not a fixed feature directory and not a profile-completion dashboard.

Its job is to show a small set of things that are truthful and useful **right now** based on the current profile posture and eligible content. Missing optional content should normally disappear instead of becoming an empty card.

## Profile posture

Hub composition consumes the same whole-profile maturity contract as Profile:

- **Unformed** — no meaningful canonical profile shape exists yet.
- **Emerging** — evidence exists, but the overall shape is still developing.
- **Established** — enough dimensions have established evidence for a stable broad profile shape.

Maturity is a posture, not a percentage and not a task-completion score.

## Composition rules

Runtime composition lives in `src/features/hub/hubComposition.ts`.

### Unformed

Render the intentional onboarding canvas only:

- **Start broad** → guided quizzes.
- **Start specific** → catalog exploration.

Even if incidental optional state exists, an Unformed Hub stays deliberately small rather than exposing the full dashboard prematurely.

### Emerging

Render:

- profile reflection;
- Profile and Catalog intent doors;
- resumable quiz content only when a first attempt or retake is actually in progress;
- latest catalog preference only when an ambient-safe direct preference exists;
- randomizer content only when at least one choice is explicitly random-eligible.

No optional module should render merely to explain that it has nothing useful yet.

### Established

Render the same eligibility-driven optional modules as Emerging, with the richer durable intent-door set:

- Profile;
- Compare;
- Scene Builder;
- Catalog.

An Established dashboard is still compositional. Two established profiles can therefore show different Hub modules if their currently eligible content differs.

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

The old future-playground placeholder is intentionally not part of the runtime Hub. Future game ideas remain planning material until they have real eligible content.

## Progress and counts

Finite workflows may show finite progress, for example `2/4 quizzes with established results`.

Other evidence counts may also be shown as facts, such as rated catalog preferences or ranking choices. These are **not** combined into an overall profile completion percentage.

Unknown profile depth must never be translated into a fake zero-percent completion state.

## Invariants

1. Hub maturity comes from the shared Profile maturity contract.
2. Unformed, Emerging, and Established compositions are observably distinct.
3. Optional modules are omitted when they have no eligible content.
4. `Continue` means resumable work exists.
5. Retakes count as resumable while preserving their previous established result.
6. Finite workflow counts are allowed; overall profile completion percentages are not.
7. Hub composition does not mutate source evidence, scores, preferences, or quiz progress.
