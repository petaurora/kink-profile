# Kink Profile FAQ

This FAQ explains common **current product behavior** in plain language.

For a feature-by-feature walkthrough, start with the [Feature Guide](feature-guide.md). For implementation details and semantic rules, use the durable product and system contracts in the [documentation index](README.md).

## General

### Do I need to finish everything before my profile works?

No.

The app is intentionally modular. You can complete one quiz, set a handful of catalog preferences, rank one category, or use only the features that are useful to you.

The Overall Profile becomes richer as more meaningful evidence exists, but incomplete does not mean invalid.

### Is this supposed to diagnose me or tell me what I am?

No.

Results are descriptive. They summarize patterns in the answers/preferences you have provided. They are not a diagnosis, immutable identity assignment, or replacement for communication and consent.

### Why does the app use several ways to answer similar questions?

Because they are not actually the same question.

- **Quizzes** ask about broad experiences and reusable preference patterns.
- **Catalog preferences** ask how you directly feel about one specific item.
- **This-or-That** asks which of two eligible items rises higher relative to the other.
- **Rewards & Punishments** asks whether something works in a specific contextual role.
- **Scene Builder** asks what fits the current moment without changing permanent preferences.

Keeping these answers separate prevents one interaction from pretending to mean more than it does.

## Quizzes and the Overall Profile

### Why don't my quiz results exactly match my Overall Profile?

The Overall Profile is not a copy of one quiz result.

A section quiz contributes one source of evidence. The full profile can also consider other completed quizzes, direct catalog preferences, and current pairwise ranking evidence.

### Is the old Starter Profile still a current quiz?

No.

`starter-profile` remains only as a compatibility identifier for older stored data. The current available quiz set is Bondage & Discipline, Dominance & Submission, Sadism & Masochism, and Roles & Headspaces.

### Why can my Headspaces section differ from the profile headline?

They answer different presentation questions.

The dedicated Roles/Headspaces layer shows those composed results directly. The profile headline summarizes broader patterns useful for a compact first impression.

### What is the difference between a Role/Headspace and a Dynamic Mode?

A **Role/Headspace** is a recognizable relational or internal state such as Pet, Prey, Caregiver, or Owner / Handler.

A **Dynamic Mode** is a cross-cutting pattern such as Care, Devotion, Structure, Power Exchange, or Intensity.

Both are derived from underlying Signal evidence; neither is a new direct evidence source.

See [Roles, Headspaces & Dynamic Modes](data-model/roles-headspaces-modes.md).

### Does giving an activity mean Dominant?

No.

Giving/Receiving describes an activity or Signal perspective. Dominant/submissive describes authority context.

A submissive person may give an activity. A Dominant person may receive one.

See [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md).

### Does receiving an activity mean submissive?

No, for the same reason. Activity side and authority context are separate dimensions.

### Why can a strong radar theme include an activity I do not want?

A radar/Overall Facet is broad thematic compression. It does not mean every activity associated with that theme is automatically wanted.

Direct catalog boundaries still matter.

### What does coverage mean?

Coverage answers **how much meaningful evidence is available**, not how strong the known preference is.

A strong affinity with partial coverage is valid. Missing evidence should remain unknown rather than turning into a 0% preference.

## Catalog preferences

### What is the difference between Love, Like, Curious, and Unsure?

They are direct preference states.

- **Love** — strong positive preference.
- **Like** — positive preference.
- **Curious** — something you may want to explore.
- **Unsure** — you explicitly do not have a clear answer yet.

They are not generated from ranking position.

### What is the difference between Unsure and Not set?

**Unsure** is an explicit answer.

**Not set** means no direct catalog answer exists for that item.

The app may still have ranking or inferred context for a Not set item, but that does not manufacture an explicit state.

### What is the difference between Not Interested and Hard Limit?

**Not Interested** means you do not currently want the activity.

**Hard Limit** is a firmer explicit boundary.

A low rank, a skip, uncertainty, or inferred low affinity should not be interpreted as a Hard Limit.

### What does Not Applicable mean?

The item does not meaningfully apply to the user/profile context. It is distinct from simply disliking the item.

### What does inferred/profile-informed context mean beside a catalog item?

It means broader profile evidence maps to that item's semantic definition strongly enough to make it potentially worth reviewing.

It is a hint, not your answer. It does not overwrite explicit preference or pairwise ranking evidence.

### Can inferred data silently turn something into Love, Like, Curious, or Hard Limit?

No.

Direct catalog states are explicit user-owned answers.

### Why can a catalog item have different Overall, Receiving, and Giving states?

The persistence model supports directional overrides where the user's preference genuinely differs by activity side.

A Receiving/Giving override can fall back to Overall when no specific override exists, but directional values do not synthesize a replacement Overall answer.

### What happens to ranking history if I mark something as excluded?

Hard Limit, Not Interested, and Not Applicable keep the item out of new ordinary ranking pairs, but existing historical comparisons are retained.

Current eligibility and history are different concerns.

See [Kink Catalog](product/kink-catalog.md).

## This-or-That ranking

### What is the difference between a catalog preference and a This-or-That rank?

A catalog preference is a direct item-level statement:

> I love this.

A rank is relative:

> Between these eligible items, this one rises higher.

You can Love two activities and still rank one above the other.

### Does ranking something highly automatically make it Love?

No.

Pairwise ranking never rewrites explicit catalog state.

### Does marking something Love automatically make it rank #1?

No.

Positive explicit preference does not seed or boost the pairwise ranking score.

### Why rank within categories before Overall?

Comparing the entire catalog against itself would create a huge noisy pair pool.

Category ranking establishes local order first. Current evidenced finalists can then participate in the smaller Overall pool.

### What do Both/equal, Neither, and Skip/don't know do?

- **Both/equal** is meaningful tie/order evidence.
- **Neither** records the interaction but does not award positive ordering evidence.
- **Skip/don't know** records the interaction without resolving order.

Neither and Skip do not manufacture explicit catalog states.

### What are Quick, Standard, Deep Dive, and Gremlin Mode?

They are session-size conveniences, not different scoring systems.

Saved comparisons remain part of the active ranking run regardless of session size.

### Why does a ranking have low confidence?

There is not yet much meaningful ordering evidence in that scope.

More comparisons refine the ranking; low confidence does not mean the existing answers are wrong.

### What happens when I start a new ranking run?

The current run is archived with historical snapshots and a fresh active run begins.

Quiz answers and explicit catalog preferences remain unchanged.

Only the active run contributes current pairwise evidence to the profile.

### Is starting a new ranking run the same as resetting rankings?

No.

**Start a new ranking run** preserves the previous run as history.

**Reset This-or-That/ranking history** is a destructive Settings action that clears ranking data and starts fresh.

### Does an archived run still affect my current ranking/profile score?

No.

Archived runs exist for history/movement context. They do not accumulate into a lifetime ranking score and do not contribute current pairwise Signal evidence.

### What do ↑, ↓, —, and NEW mean?

They describe movement relative to the most recent comparable historical view.

- **↑** moved higher.
- **↓** moved lower.
- **—** stayed at the same visible rank.
- **NEW** is meaningfully ranked now but was absent from the previous comparable view.

Movement is view-relative so hidden/filtered-out rows do not create phantom movement.

### Does movement affect profile scoring?

No. It is historical presentation context only.

See [Kink This-or-That Ranking](kink-this-or-that-ranking.md).

## Overall Profile

### Why doesn't Top Overall exactly match Overall This-or-That?

The two views have different jobs.

Overall This-or-That is the current pairwise ranking output. Top Overall is a compact profile presentation that can consider multiple independent direct evidence sources while preserving provenance.

### Can a Hard Limit become a top interest because quiz inference likes the theme?

No.

Explicit boundaries are authoritative. Derived affinity must not override a Hard Limit.

### Why can changing one catalog preference affect several profile summaries?

One direct item can map to multiple broader semantic concepts/themes. Several derived presentation areas can recompute from that one answer without duplicating the original evidence.

## Rewards & Punishments

### Why is this separate from general kink preference?

Because:

```text
I like this
≠ this works as a Reward
≠ this works as a Punishment
```

Reward/Punishment suitability is its own contextual direct state.

### Can something be both a Reward and a Punishment?

Yes.

The two contexts are independent rather than opposite ends of one scale.

### Does disliking something make it a punishment?

No.

The system intentionally does not treat dislike/aversion as positive punishment evidence.

### What is the difference between the Quick sorter and detailed profiles?

The **Quick sorter** gives a fast coarse classification.

The **detailed profiles** preserve richer states such as Strong, Works, Depends, No, Never, notes, and random eligibility.

The sorter warns when a coarse change could destroy richer existing detail.

### What does Suggested to explore mean?

It is an inferred possibility based on current profile/context evidence.

It is not an automatic direct classification. Accepting/editing a suggestion is what creates direct state.

### Why can't I rank Rewards or Punishments yet?

A contextual ranking needs at least two directly positive candidates. Strong, Works, and Depends are eligible for ranking.

### Is Reward/Punishment rank the same as general kink rank?

No.

General kink ranking, Reward ranking, and Punishment ranking are separate relative questions.

### Does Punishment rank mean severity?

No. It is relative contextual fit/order among confirmed candidates.

### I marked something Works. Why isn't it in the Randomizer?

Random eligibility is separate from contextual suitability.

Only explicitly random-eligible entries that satisfy the stricter randomizer rules enter the random pool.

### Does the Randomizer use ranking as probability weight?

No. Current selection is uniform across the eligible pool.

### Does the Randomizer assign/track a Reward or Punishment?

No.

It is a suggestion utility. The current product has no assignment queue, completion tracker, debt ledger, or reward economy.

### Can saved recipes appear in the Randomizer?

Yes, when the recipe is valid, context-matched, and explicitly allowed for randomization.

### What does Needs review mean on a recipe?

A referenced component or direct contextual boundary changed enough that automatic reuse is no longer safe/valid under the current rules.

The recipe is preserved so it can be repaired instead of silently deleted.

See [Rewards & Punishments](product/rewards-punishments.md).

## Scene Builder

### Does choosing a Scene theme change my profile?

No.

Themes are query/composition metadata. They narrow existing evidence without writing back into preferences, Signals, roles, modes, or facets.

### What does Yes tonight / Maybe tonight / Not tonight do?

These are temporary session choices.

`Not tonight` removes an item from automatic Scene use for the current session even if the permanent profile likes it. Yes/Maybe can establish current-session support without changing durable catalog state.

### Can an inference-only suggestion be randomly selected?

Not by default.

Inference-only items are separated from automatic eligibility. Explicit/current-session support is required before they enter the automatic pool through supported flows.

### What is the difference between Pick something and Build something?

**Pick something** returns one eligible activity.

**Build something** creates an ordered multi-part Scene from eligible candidates and current filters.

### Can I save a Scene?

Yes.

Saved Scenes are local reusable templates with stable references to catalog and optional Reward/Punishment sources.

### What does Needs review mean on a saved Scene?

A referenced source is now stale, excluded, missing, or no longer valid for automatic reuse.

The component remains visible so the Scene can be repaired rather than silently rewritten.

### Are saved Scenes included in my share summary?

No.

Saved Scenes are private durable profile state. They are included in the full machine-readable backup and can be reset independently, but the curated share summary does not include them.

See [Scene Builder](product/scene-builder.md).

## Profile comparison

### Does comparing an uploaded profile import it into my account/profile?

No.

The current comparison flow treats the upload as temporary comparison input. It does not replace the local profile or create persistent multi-profile ownership.

### Can comparison infer complementarity just because one person ranks an activity highly?

Not by pairwise rank alone.

Directional complementarity requires actual compatible directional evidence. Relative ranking is not enough to invent a giving/receiving role assignment.

### Do comparison results write back into either profile?

No. Shared results and participant intent are derived/temporary comparison context.

See [Profile Comparison](product/profile-comparison.md).

## Settings, backup, and sharing

### What is the difference between profile backup and share summary?

They serve completely different purposes.

**Private backup** is the complete machine-readable portability/restore artifact.

**Share summary** is a curated human-readable presentation intended for another person.

Do not use the private backup as the normal sharing format.

### What is the current backup version?

New backups use format `kink-profile`, version `3`.

Restore supports versions 1, 2, and 3. Older supported backups restore later-added domains as empty rather than guessing data that was never present.

### Does importing a backup merge with my current profile?

No.

Current restore behavior is full-profile replacement after validation, with rollback attempted if a replacement write fails.

### Can I reset only one part of the profile?

Yes.

Settings supports source-aware reset scopes including selected quizzes, explicit catalog preferences, ranking history, Rewards & Punishments, saved Scenes, and profile settings.

The app reviews what will reset and what will remain before confirmation.

### If I reset rankings, will it delete my explicit catalog preferences?

No, unless you select that scope too.

Ranking history and explicit catalog preferences are independent source domains even though both use stable Catalog IDs.

### What is included in the share summary?

The current human-facing summary can include profile identity, summary/orientation, strongest broad themes, radar values, featured headspaces, Top Overall interests, Interest Areas, and explicit Hard Limits.

It intentionally omits raw quiz answers, raw pairwise history, internal evidence IDs, browser storage details, and the private backup payload.

### What export formats exist for the share summary?

PNG, standalone HTML, and PDF. All use the same underlying share-summary model.

See [Profile Management](product/profile-management.md).

## Privacy and storage

### Is my current profile stored in the cloud?

No.

The current authoritative profile is browser-local. Persistent cloud profiles/account-based sync are not part of the current product contract.

### Are derived profile scores separately stored as another authority?

They should not be.

Derived profile layers are recomputable from authoritative source data.

## Data and curation

### Is the catalog/taxonomy considered permanently final?

No.

The authored catalog, Signal mappings, role/mode compositions, questions, and other curated content can evolve when that improves the product.

Changes must preserve stable identities or provide explicit migration/compatibility handling when identities genuinely need to change. Current curation/refinement work is tracked in GitHub rather than encoded as milestone status in this FAQ.

### Where should I look for the current rules?

Use the [documentation index](README.md). In particular:

- [Product Spec](product-spec.md)
- [Quizzes](product/quizzes.md)
- [Kink Catalog](product/kink-catalog.md)
- [Kink This-or-That Ranking](kink-this-or-that-ranking.md)
- [Overall Profile Aggregation](overall-profile-aggregation.md)
- [Rewards & Punishments](product/rewards-punishments.md)
- [Scene Builder](product/scene-builder.md)
- [Profile Comparison](product/profile-comparison.md)
- [Profile Management](product/profile-management.md)
- [Signal + Channel Data Model](data-model/signal-channel-model.md)
- [Roles, Headspaces & Dynamic Modes](data-model/roles-headspaces-modes.md)
- [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md)

The repository code and tests remain authoritative for what is actually implemented.
