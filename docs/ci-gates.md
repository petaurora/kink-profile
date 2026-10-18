# Continuous integration gates

Pull requests use the workflows in the proposed change. Push checks run on `main`
and `feat/ui-lab-foundation`. All npm installs use `npm ci`.

| Required check | Contract |
| --- | --- |
| `Static checks` | ESLint recommended JavaScript/TypeScript and React Hook checks; zero warnings. Intentional external invalidation and editor/route lifecycles have narrow explained exceptions. |
| `Workflow lint` | actionlint validates workflow expressions, events, jobs and shell steps; the installer pins and checksums its release. |
| `build` | Source tests, V8 coverage floors, production build, compressed bundle budgets and nested preview-base build. |
| `Browser journeys and accessibility` | Three-project functional, keyboard and rendered axe matrix; see [testing.md](testing.md). |
| `Visual regression` | Five representative states at desktop and phone sizes, compared with reviewed PNGs. |
| `CodeQL scan` | JavaScript/TypeScript source scanning with security-extended queries. |
| `Dependency review` | Resolved lockfile changes fail for introduced high/critical advisories using npm audit. |
| `Dependency audit` | The entire installed lockfile fails for high/critical advisories. |
| `preview` | The preview publishing job must succeed as well, so a failed publisher cannot pass enforcement through a skipped smoke job. |
| `Deployed preview smoke` | Expected hosted commit, assets, PWA manifest/icons, worker scope and rendered deep link after publishing. |

Dependency review compares base/head lockfiles without running base-branch code. It
uses npm registry advisories directly and does not depend on GitHub Dependency
graph being enabled. The complete-lockfile audit also catches existing advisories.

Test jobs have read-only contents access; CodeQL alone receives security-event write
access. Publishing jobs have separate write permissions. Smoke jobs are read-only.
Reports and failure diagnostics expire after 14 days. A failing deployment smoke
reports the problem; it does not roll back the deployment.

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
