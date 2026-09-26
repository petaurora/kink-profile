# M19 Profile / Settings navigation — compatibility pointer

This milestone-named file is retained for older links. It is **not** the current navigation or Settings contract.

The M19 navigation work has landed. Current behavior is documented in the durable topic-based contracts:

- [Application Architecture](application-architecture.md) — React Router ownership, desktop/mobile global navigation, Settings route semantics, and shell responsibilities.
- [Profile Management](product/profile-management.md) — profile lifecycle, reset, backup/restore, and sharing.
- [Internal Feature Flags](feature-flags.md) — Developer / Admin Tools, Experimental Features controls, browser-local overrides, and experimental gating conventions.

Current implementation highlights include:

- `/profile` remains the primary Profile destination.
- `/settings` participates in Profile primary-navigation semantics while desktop navigation also gives Settings its own active state.
- the desktop navigation rail and mobile primary navigation are the current global-navigation surfaces;
- Settings owns only its local back/title header;
- Curation Workbench remains an internal Developer / Admin surface and is absent from ordinary navigation;
- Developer Tools and experimental feature overrides are browser-local developer settings, not authentication or authorization.

Historical M19 sequencing and acceptance details belong in closed Issues/PRs and git history.
