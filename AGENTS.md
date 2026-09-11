# AGENTS.md

This file is the operating guide for AI agents and future contributors working in this repository.

## Source-of-truth map

Use the right home instead of duplicating the same information everywhere.

- **Code + repository docs** — the product/system that actually exists: implemented behavior, architecture, data contracts, scoring rules, persistence rules, and other durable developer-facing contracts.
- **GitHub Issues** — actionable bugs, features, refactors, cleanup, implementation scope, acceptance criteria, and work breakdown.
- **GitHub Project** — current sequencing and work state. This is the answer to **Now / Next / Later** and “what is being worked on?”
- **Pull requests + git history** — implementation/review history.
- **Kink Profile HQ in Notion** — ideas, unresolved product design, research, strategy, monetization, privacy thinking, product rationale, and durable decisions that do not need to ship beside the code.

Do not recreate a roadmap/status ledger in Markdown. `ROADMAP.md` is intentionally only a pointer to GitHub Issues/Project.

## Default workflow

1. **Understand the request before editing code.**
   - Find the owning GitHub Issue when one exists.
   - Read any linked Notion product context / decision record when available and safe to access.
   - Read the relevant durable repository contract(s) before changing behavior covered by them.
2. **Decide whether the work is actually ready to build.**
   - If the problem, requirements, or product rule is still fuzzy, keep the thinking in Notion first.
   - When the outcome/boundaries are clear enough to implement, use or create a focused GitHub Issue.
3. **Use a focused branch.**
   - Base on the latest `main` unless the work is intentionally part of a stacked milestone/PR chain.
   - If stacked, preserve the intended parent branch and state that relationship clearly in the PR.
   - Prefer descriptive names tied to the issue/milestone, e.g. `m18-4-profile-catalog-ranking-routing` or `docs/132-overview-audit`.
4. **Implement the smallest coherent slice that satisfies the Issue.**
   - Avoid unrelated cleanup.
   - Preserve explicit out-of-scope boundaries.
   - Add/update regression coverage where practical.
5. **Validate before handoff.**
   - Run `npm test`.
   - Run `npm run build`.
   - If generated reference data is involved, remember those commands already run the repository generation scripts through `pretest` / `prebuild`.
6. **Open a PR that closes the loop.**
   - Link or close the owning Issue (`Closes #123`).
   - Use `Related: #123` for context-only relationships.
   - Summarize what changed and explicitly list meaningful non-goals / intentionally unchanged behavior.
   - If the change alters a durable current-system contract, update the owning repo doc in the same PR.
7. **Do not merge unless the user explicitly asks.**
   - Present the PR for review and report CI/build status.

## Issue requirements

A build-ready work slice should make these understandable without reconstructing the entire conversation:

- **Goal / outcome** — what should become true?
- **Context** — why does this matter now?
- **Scope** — what is included?
- **Out of scope** — what are we intentionally not solving?
- **Done when** — observable completion / acceptance criteria.
- **Product context** — link the relevant Notion idea/decision/research page when appropriate.

Do not copy large Notion product-thinking documents into an Issue. Keep one canonical source and link to it.

## Notion ↔ GitHub linking

When an idea becomes engineering work:

- Store the GitHub Issue URL on the Notion Idea / Knowledge / Decision record.
- Add a **Notion context** link to the GitHub Issue when it is appropriate for that URL to be visible in the public repository.
- The repository is public. **Do not expose a private/sensitive Notion page URL or title in a public Issue/PR unless the user explicitly approves it or the Notion record is marked safe to share.** When it is not safe, keep the backlink only on the Notion side and summarize only the engineering-relevant requirements in GitHub.
- Use Notion relations (`Related Knowledge` / `Related Ideas`) to connect internal product context instead of duplicating it.

## Decision records

Not every choice needs a decision log.

Create a durable Notion decision record when future contributors are likely to ask **“why did we choose this?”** and the answer is not obvious from the code or current contract.

Good candidates include:

- semantic/schema/data-model choices;
- privacy or sharing boundaries;
- persistence strategy;
- architecture boundaries;
- pricing/tier policy;
- intentionally unsupported behavior;
- product rules with meaningful alternatives/tradeoffs.

Skip decision records for routine naming, straightforward refactors, ordinary implementation details, or choices adequately explained by code and the PR.

A decision record should capture: **Decision, Context, Why, Alternatives considered, Consequences, Revisit when, Related work.**

GitHub `decision` Issues are for implementation-adjacent choices that must be resolved to unblock actionable work. Durable product rationale belongs in Notion; link the two when appropriate.

## Documentation rule

Before adding/updating a repo document, ask:

1. Will a future developer need this beside the code to safely understand/change the **current implemented system**? Keep/update repo docs.
2. Is it actionable work, a checklist, migration plan, or status? Use GitHub Issues/Project.
3. Is it unresolved design, strategy, research, alternatives, future thinking, business/privacy planning, or rationale? Use Notion.
4. Is it merely recording that work happened? Closed Issues/PRs and git history already do that.

If a change alters a cross-system contract, update the relevant durable doc in the same PR. Do not update compatibility-pointer milestone files as if they were canonical specs.

## Conflict / stacked-PR handling

This repository sometimes uses intentionally stacked milestone PRs.

- First determine the intended base branch before “fixing” ancestry.
- When resolving conflicts, bring the intended base into the branch and preserve both intentional changes where compatible; do not silently discard one side because it is newer.
- After conflict resolution, re-check the diff for inherited/duplicated changes and run `npm test` + `npm run build`.
- If a stacked sequence becomes difficult to merge/review, prefer consolidating/rebasing onto the intended owning branch rather than preserving accidental stack history for its own sake.

## Working style

- Prefer clear, decisive implementation plans over speculative churn.
- Surface assumptions and true open questions, but do not ask for decisions the existing Issue/Notion context already answers.
- Keep work slices reviewable.
- Protect existing semantics unless the Issue explicitly changes them.
- When the user says “continue,” inspect the current Issue/PR/milestone state first and proceed from the next incomplete slice rather than asking them to restate the workflow.
