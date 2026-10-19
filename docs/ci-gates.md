# Continuous integration gates

Pull requests use the workflows in the proposed change. Use **draft PRs while
iterating**: updates run static checks, workflow lint, source tests/coverage,
production/nested builds, bundle budgets and the preview with hosted smoke.
Browser/accessibility, visual and security PR runners wait until the PR is marked
**ready for review**. There are no workflow-level path filters. Every ready PR
must pass all the quality gates below on its latest change before merging.

Preview delivery and feedback iterations stay draft. Agents mark ready when the
user asks to mark ready, run full CI, or merge; a merge request includes waiting
for all required gates and does not need a separate confirmation. Merely ending
a coding turn or sharing a preview is not a reason to start the full suite.

The full workflows listen for `ready_for_review` as well as opened/reopened and
`synchronize` events. A push to a ready PR reruns the full gates. Return to draft
before another editing batch; `converted_to_draft` supersedes its older full runs
through the existing per-PR concurrency groups. Deferred draft jobs have distinct
`Draft - ... deferred` names, so a skipped placeholder cannot satisfy a required
full-gate name. Required full checks can appear as expected/missing while a PR is
draft; marking ready launches them. A draft PR itself cannot be merged.

Push validation runs on `main`. V2's open integration PR (#276) can stay draft
during integration and runs full validation when ready, avoiding a second full
suite on each V2 push. CodeQL still scans pushes to both branches to maintain
branch analysis baselines. Manual full-suite dispatch and scheduled security
validation remain available independently of PR draft state.
If that integration PR closes while V2 remains an active integration branch,
restore its push validation before continuing development there.
All dependency installs use `npm ci`.

| Required check | Contract |
| --- | --- |
| `Static checks` | ESLint recommended JavaScript/TypeScript and React Hook checks; zero warnings. Intentional external invalidation and editor/route lifecycles have narrow explained exceptions. |
| `Workflow lint` | actionlint validates workflow expressions, events, jobs and shell steps; the installer pins and checksums its release. |
| `build` | Source tests, V8 coverage floors, production build, compressed bundle budgets and nested preview-base build. |
| `Browser journeys and accessibility` | Three-project functional, keyboard and rendered axe matrix; see [testing.md](testing.md). |
| `Visual regression` | Five representative states at desktop and phone sizes, compared with reviewed PNGs. |
| `CodeQL scan` | JavaScript/TypeScript source scanning with security-extended queries. |
| `Dependency review` | Resolved lockfile changes fail for introduced high/critical advisories using npm audit. |
| `Dependency audit` | The complete resolved lockfile fails for high/critical advisories. |
| `preview` | The preview publishing job must succeed as well, so a failed publisher cannot pass enforcement through a skipped smoke job. |
| `Deployed preview smoke` | Expected hosted commit, assets, PWA manifest/icons, worker scope and rendered deep link after publishing. |

Dependency review compares base/head lockfiles without running base-branch code. It
uses npm registry advisories directly and does not depend on GitHub Dependency
graph being enabled. The complete-lockfile audit also catches existing advisories.

Test jobs have read-only contents access; CodeQL alone receives security-event write
access. Publishing jobs have separate write permissions. Smoke jobs are read-only.
Reports and failure diagnostics expire after seven days. A failing deployment smoke
reports the problem; it does not roll back the deployment.

## Execution efficiency and measurement

CI, browser, visual and security validation cancel superseded runs per PR/ref.
Production publishing supersedes older production runs; preview publishing only
supersedes the same PR. Keep these queues separate: sharing a single concurrency
group between production, preview and cleanup can drop unrelated publications.
The publisher retains its fast-forward retry loop for competing `gh-pages` writes.
PR closure reconciles previews immediately. A daily 07:17 UTC recovery sweep
handles missed/failed close events; scheduled runs can be delayed by GitHub.
This schedule takes effect only after this workflow reaches `main`.

Node setup caches npm's download cache by lockfile, never `node_modules`. The two
dependency security jobs read the complete lockfile without an install; review
still compares base/head resolved entries and fails on scanner errors. The audit
uses `npm audit --package-lock-only --audit-level=high`, including dev dependencies.
Headless E2E and hosted smoke install Chromium's headless shell with `--only-shell`;
E2E still installs WebKit and both jobs still install required system libraries.
The visual job retains its pinned browser container. Browser binary caching is
deliberately absent: restoring it still requires system libraries and should be
benchmarked before adding storage/restore overhead.

For usage audits, export **all** run pages from the Actions REST API for a fixed
UTC window, then fetch `/actions/runs/{id}/jobs?filter=all&per_page=100` for each
run (paginate jobs too). Split run queries by day when a query exceeds GitHub's
1,000-result ceiling. Include cancelled/failed jobs and previous attempts; exclude
skipped jobs and queue time. Sum `completed_at - started_at` for runner time and
report job count, workflow/event frequency, same-SHA push/PR duplication, and
per-job setup/test durations. A failed workflow with no jobs consumes no runner
time. A sum of job durations rounded up to minutes is only a pricing proxy, not
an invoice. Keep the free built-in `pages build and deployment` workflow separate
from custom build, preview, cleanup and smoke jobs. Public standard-runner usage
is free; use the owner's billing export to establish actual private-repo charges.
Parallel jobs reduce elapsed time only when they reduce the critical path; setup
duplication and per-job rounding can increase total consumption.

## Coverage and bundle budgets

`npm run test:coverage` measures `src/lib`, `src/services` and
`src/features/quizzes`, including unimported files. Tests/declarations are excluded.
This is critical-module coverage, not every UI or generated data file. Vitest and
its V8 provider are pinned together. Vitest 5 remapping differs from older versions;
compare reports using the same runner version.

`quality/coverage-budget.json` records the initial measured floors rounded down to
whole percentages, for the aggregate and four critical subgroups. Missing groups
or a missed floor fail CI. Inspect the HTML/LCOV reports and explain intentional
baseline changes in the PR; do not lower floors merely to make changes pass.

`npm run build && npm run check:bundle` measures gzip level-9 bytes for all emitted
JavaScript, all CSS and the largest JS chunk. The initial budgets allow roughly 10%
headroom. All lazy chunks count toward the aggregate. This is a transfer-size gate,
not a measured page-speed or Core Web Vitals score.

## Visual snapshots

`npm run test:visual` compares V2 home, partial quiz progress/selected answer,
catalog refinement and settings in both supported OS themes on desktop and phone.
The Lab currently has one dark presentation. Only the changing build label is
masked. Each test uses fresh synthetic state, a fixed clock, disabled screenshot
animations/caret, and an explicit locale/timezone.

The workflow pins the Playwright container to the package-lock browser version.
Review PNG changes in that same image; fonts and browser versions affect pixels.
Regenerate intentionally from the repository root:

```sh
docker run --rm --ipc=host -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  bash -lc 'npm ci && npm run test:visual -- --update-snapshots'
```

Inspect and commit changed PNGs alongside the design change. CI never accepts new
snapshots automatically. Failures retain expected/actual/diff images and traces.
The 0.1% pixel tolerance does not replace human visual review.

## Hosted smoke

`npm run test:smoke` builds/checks a local nested preview by default. For hosted
checks, supply `SMOKE_BASE_URL` with a trailing slash and `SMOKE_EXPECTED_SHA` with
the full commit passed to `VITE_BUILD_COMMIT`. The test polls uncached
`build-info.json` for up to two minutes to allow Pages/CDN propagation, rejecting
an older or wrong-base deployment. Metadata contains only commit, base and preview
identifier. `Deployed production smoke` uses the same checks after main publishing.

The browser has fresh storage and does not answer questions or write profile
records. Service workers are blocked so asset requests validate the network; the
worker itself is fetched and its scope/app-shell checked. This does not establish
offline installation or physical-device PWA coverage.

## Activating branch enforcement

Workflow files do not configure merge enforcement. A repository administrator can
import `.github/rulesets/v2.json` and `.github/rulesets/main.json` via repository
**Settings → Rules → Rulesets → New ruleset → Import a ruleset**. Inspect the target
branch and required checks before saving. The rules require PRs, resolved threads,
passing checks against the latest target, and prevent deletion/force pushes. They
require no extra human approval and define no bypass actors. Required checks are
bound to the observed GitHub Actions app (ID 15368). A code-scanning rule also
blocks CodeQL errors and high/critical security findings; the successful analysis
job alone establishes that scanning completed, not that alerts were resolved.

Activate each ruleset only after a PR targeting that branch reports every named
check successfully and CodeQL has uploaded results for both the proposed change
and target branch. Do not apply the main ruleset to main-bound PRs that still lack
these workflows. Confirm the observed check names and GitHub Actions source in the editor. A skipped smoke because the publisher did not
publish is not deployment evidence; inspect the publishing job.

Verify enforcement using a deliberately failing PR: merging must be blocked until
its failing check passes. Green checks alone do not establish enforcement. GitHub
App connections without repository administration permission cannot install rules.

Scheduled scans/audits, manual workflow discovery and Dependabot require their
files on the default branch (`main`). PR checks/preview smoke can run before merge.
Merging into the V2 parent enables push checks there; it does not merge the V2
product into main. Dependabot checks npm and GitHub Actions weekly once configured
on main. Review and merge the stack separately.

Human assistive-technology, physical-device and accessibility review gates remain
in [testing.md](testing.md).
