# Pet Profile Feature Guide

This guide explains the app in plain language: what each feature is for, when to use it, and how the different parts work together.

For implementation details, scoring rules, data contracts, and milestone acceptance criteria, use the linked product and milestone specifications. This guide is intentionally user-facing rather than technical.

## The app in one minute

Pet Profile builds a preference profile from several different kinds of input instead of treating one questionnaire as the whole answer.

```text
QUIZZES
broad patterns, tendencies, headspaces, and dynamic signals
        │
        ├──────────────┐
        │              │
CATALOG PREFERENCES    │
direct answers about   │
specific activities    │
        │              │
        ├──────────────┤
        │              ▼
THIS-OR-THAT      OVERALL PROFILE
relative ordering     combined interpretation
of specific items     of current evidence
        │
        └──────────────┘

REWARDS & PUNISHMENTS
a separate contextual layer:
"Would this work as a reward or punishment?"
```

These inputs are related, but they are not interchangeable.

A quiz result is not the same thing as saying you explicitly love a catalog item. A high This-or-That rank is not the same thing as marking something a Hard Limit or a favorite. Something that works as a punishment is not automatically something you dislike.

That separation is intentional.

## A simple first-time path

You do not need to complete everything before the app becomes useful.

1. **Take the core quizzes** to establish broad patterns.
2. **Browse & set preferences** for specific activities you already know something about.
3. **Play This-or-That** when you want to sort relative favorites without assigning numbers.
4. **View your profile** to see the combined picture.
5. **Use Rewards & Punishments** if you want to separately map what works in those contexts.
6. **Use Scene Builder** when you want the profile turned into a smaller, usable play space for right now.
7. **Export a private backup** once you have data you care about.
8. **Use the share summary** when you want a curated version for another person.
9. **Compare profiles** when someone has shared their Full Profile Export and you want to explore overlap, complementarity, or a shared scene without importing their profile.

You can return to any area later and refine it. The profile is meant to grow over time.

---

# Start broad: quizzes

## Starter Profile

**What it is.** A short sampler that gives a quick first look at the product.

**Use it when.** You are new to the app and want a lightweight introduction before using the deeper sections.

**How to use it.** Answer the short set of questions and view the resulting shape.

**What it changes.** It contributes a quick starter result.

**What it does not do.** It is not the final or most detailed scoring model. The core sections are the stronger foundation for the full profile.

## Core quizzes

The app currently has four independently completable core sections:

- **Bondage & Discipline**
- **Dominance & Submission**
- **Sadism & Masochism**
- **Roles & Headspaces**

**What they are.** Short focused questionnaires that measure broad patterns rather than asking you to rate hundreds of individual activities.

**Use them when.** You want to describe the kinds of dynamics, sensations, structures, roles, or headspaces that tend to fit you.

**How to use them.** Open any section from the hub, answer the questions, and view that section's results. You can complete the sections in any order.

**What they change.** Quiz answers contribute broad signal evidence to the overall profile and can help the catalog show profile-informed context.

**What they do not do.** They do not directly set individual catalog items to Love, Like, Curious, or any other explicit state.

### Roles & Headspaces

This section deserves one extra distinction.

**Headspaces** describe recognizable mental or relational modes such as Pet, Prey, or other role-like states.

**Dynamic modes** describe broader ways a dynamic can feel or operate underneath those headspaces.

Neither is treated as a universal identity label. A result describes patterns present in the answers you gave.

### Giving, receiving, Dominant, and submissive

These are not synonyms.

- **Dominant / submissive** describe authority or power context.
- **Giving / receiving** describe which side of an activity someone is doing.
- **Roles / headspaces** describe recognizable experiential modes.

A submissive person can give an activity. A Dominant person can receive one. The app keeps these concepts separate on purpose.

Technical reference: [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md)

---

# Define specific interests: Browse & set preferences

## Kink catalog

**What it is.** The detailed activity library.

**Use it when.** You already know how you feel about a specific activity, want to mark a boundary, or want to browse beyond what the quizzes cover.

**How to use it.** Search or filter the catalog, then set a direct preference on any item you care about. You do not need to rate the entire catalog.

The current direct states are:

| State | Plain-language meaning |
| --- | --- |
| **Love** | A strong direct positive preference |
| **Like** | A positive preference |
| **Curious** | Something you may want to explore |
| **Unsure** | You do not have a clear answer yet |
| **Not Interested** | Not something you currently want |
| **Hard Limit** | A firm boundary |
| **Not Applicable** | The item does not meaningfully apply to you |
| **Not set** | No direct answer has been given |

**What it changes.** These are explicit answers owned by you. They can affect what appears in profile summaries, exclusions, exploration views, and future ranking eligibility.

**What it does not do.** A catalog preference does not automatically assign a This-or-That rank.

## Quiz-derived context in the catalog

You may see profile-informed or quiz-derived information beside an item.

**What it is.** A derived hint based on broader evidence already present in the profile.

**Use it when.** You want help finding items worth looking at.

**Important.** It is not a direct answer. It does not overwrite an explicit preference or a pairwise rank.

Technical reference: [M6 Catalog Integration](m6-catalog-integration.md)

---

# Refine relative favorites: This-or-That

## Category This-or-That

**What it is.** A pairwise comparison game for ranking items relative to one another inside a category.

**Use it when.** "I like both, but which one actually rises higher?" is easier to answer than assigning each item a number.

**How to use it.** Choose between two items at a time. You can also choose:

- **Both / equal**
- **Neither**
- **Skip / don't know**

The app uses meaningful ordering choices to gradually build the ranking.

You can choose a session size:

- **Quick** — 10 comparisons
- **Standard** — 25 comparisons
- **Deep Dive** — 50 comparisons
- **Gremlin Mode** — keep going

**What it changes.** It creates comparative ranking evidence for that category.

**What it does not do.** It does not rewrite your explicit catalog preference.

## Overall This-or-That

**What it is.** A cross-category ranking made from finalists that have already emerged from category-level comparison.

**Use it when.** You want to answer, "Across all these different categories, what actually rises to the top?"

**How to use it.** Rank within categories first. The strongest current finalists become eligible for the Overall comparison pool.

**What it changes.** It creates a general cross-category relative ranking.

**What it does not do.** It is not a replacement for direct preference states or quiz results.

Technical reference: [Kink This-or-That Ranking](kink-this-or-that-ranking.md)

---

# Revisit preferences over time: ranking runs

## Start a new ranking run

**What it is.** A non-destructive way to answer This-or-That again from a fresh comparative starting point.

**Use it when.** Your preferences may have changed, you want a new snapshot, or you simply want to see whether your ordering moves.

**How to use it.** Choose **Start a new ranking run** from This-or-That. The current run is archived and a fresh active run begins.

The app keeps:

- quiz results
- explicit catalog preferences
- previous ranking history

Only the new active run supplies the current pairwise ranking evidence.

## Movement indicators

After you have a previous comparable run, ranking results may show movement.

- **↑** moved higher in this view
- **↓** moved lower in this view
- **—** stayed in the same position
- **NEW** is meaningfully ranked now but was not in the previous comparable view

Movement is relative to the view you are looking at. A category ranking compares against the prior comparable category ranking; Overall compares against the prior comparable Overall view.

**What movement does not mean.** It is not a new score and does not add bonus or penalty weight to the current profile. It is historical context.

Technical reference: [M12 Ranking History & Movement](m12-ranking-history-movement.md)

---

# Understand the combined picture: Overall Profile

## Overall Profile

**What it is.** The app's combined interpretation of the evidence you have provided so far.

**Use it when.** You want the "what does all of this add up to?" view.

It can include:

- an overall profile headline
- the broad profile radar
- strongest Headspaces
- Dynamic Modes
- Top Overall interests
- Hard Limits
- Interest Areas
- explanations for why themes appear
- exploration/coverage context
- Rewards & Punishments summaries when enough M11 evidence exists

**What it changes.** Nothing directly. This screen is primarily a presentation and interpretation layer.

**Why it may not exactly match one quiz.** The Overall Profile can consider multiple sources. A section quiz is one source; explicit activity preferences and current pairwise ranking evidence can add additional information.

## Overall radar

**What it is.** A broad thematic view of the profile across dimensions such as Power Exchange, Ownership & Belonging, Service & Devotion, Primal & Instinctive, Restraint & Physical Control, Intensity & Pain, and other profile facets.

**Use it when.** You want to see the shape of your profile rather than focus on a single result.

**What it is not.** It is not a diagnostic chart and it does not mean every activity inside a strong theme is automatically something you want.

## Top Overall

**What it is.** A compact list of specific interests that currently rise to the top of the combined profile presentation.

**Important.** Top Overall is not necessarily identical to the raw Overall This-or-That list. The profile presentation can consider multiple kinds of direct evidence while keeping those sources distinct.

## Hard Limits

**What it is.** A dedicated profile view of activities explicitly marked as Hard Limits.

**Important.** A Hard Limit is treated differently from a low rank, uncertainty, or simple lack of interest.

## Interest Areas

**What it is.** A compact category-level way to see where meaningful profile evidence is clustering.

**Use it when.** You want to explore a theme without putting every catalog category on the main profile screen.

Technical reference: [Overall Profile Aggregation](overall-profile-aggregation.md)

---

# Map contextual use: Rewards & Punishments

Rewards & Punishments is deliberately separate from general kink preference.

The question is not only:

> Do I like this?

It is also:

> Could this specifically work as a reward?

and:

> Could this specifically work as a punishment or consequence?

The same activity can have different answers to all three questions.

## Quick sorter

**What it is.** A fast one-card-at-a-time way to classify items into coarse contextual buckets.

Choices:

- **Reward**
- **Punishment**
- **Both**
- **Neither**
- **Skip for now**

**Use it when.** You want to map a large number of ideas quickly without opening the detailed editor for every item.

**What it changes.** It creates coarse direct contextual answers.

**What it does not do.** It does not automatically add an item to the randomizer. It also avoids silently destroying nuanced Strong / Depends / Never data; the UI warns before a coarse answer would replace richer detail.

## Detailed Reward and Punishment profiles

**What they are.** Separate detailed editors for reward suitability and punishment suitability.

A contextual answer can express ideas such as:

- **Strong**
- **Works**
- **Depends**
- **No / not a fit**
- **Never**
- **Not rated**

You can also keep contextual notes and separate random-pool eligibility.

**Use them when.** The quick sorter is too coarse or the answer depends on boundaries, conditions, or explanation.

**Important.** Reward and Punishment are independent. Something may be Strong in both, Strong in one and Never in the other, or any other meaningful combination.

## Suggested to explore

**What it is.** A profile-informed proposal for an unrated reward or punishment possibility.

**Use it when.** You want help finding what may be worth reviewing next.

**What it does not do.** A suggestion is not treated as your answer. Accepting one creates a conservative explicit state; the app does not silently turn inferred proposals into direct evidence.

## Reward This-or-That and Punishment This-or-That

**What they are.** Two separate pairwise rankings.

**Use them when.** You already have multiple confirmed rewards or punishments and want to decide which ones rise above others in that specific context.

Only directly positive candidates are eligible. The current positive states are Strong, Works, and Depends.

**Important.**

- Reward rank is separate from Punishment rank.
- Both are separate from general kink rank.
- A contextual rank answers relative fit within that context, not severity.

## Randomizer

**What it is.** A lightweight "just pick one" utility.

**Use it when.** You already have an approved pool and want the app to remove the decision step.

The current randomizer:

- uses only explicitly eligible entries
- treats entries equally rather than weighting by rank
- avoids immediately repeating the last pick when possible
- lets you tap the result card to reroll
- keeps a temporary "Already rolled" trail for the current visit
- does not assign, track completion, or create a punishment/reward debt

Leaving the Randomizer clears that temporary roll history.

## Build a Reward / Build a Punishment

**What it is.** A recipe builder for reusable multi-part combinations.

A recipe can contain:

- catalog activities
- action-library items
- custom recipe-only text
- an ordered sequence
- a name
- notes
- tags
- optional random-pool eligibility

**Use it when.** A useful reward or punishment is a combination rather than one primitive item.

You can save, edit, duplicate, reorder, and delete recipes.

If a component later conflicts with changed boundaries or eligibility, the recipe can be marked **Needs review** and kept out of random selection until it is fixed.

Technical reference: [M11 Rewards & Punishments](m11-rewards-punishments.md)

---

# Compose the moment: Scene Builder

Scene Builder turns the existing profile into a smaller, current-session play space. It does not create new preference evidence or infer consent.

## Pick the space

Choose one or more themes such as Pain, Restraint, Service, Pet, Surrender, Soft, Structured, or Playful. Themes are temporary queries over the existing profile.

Optional tuning can narrow by:

- effort: Quick / Normal / Elaborate
- exploration: Familiar / Mix / Explore
- catalog intensity

## Tonight-only changes

Each candidate can be marked **Yes**, **Maybe**, or **Not tonight** for the current session. These choices override scene suggestions for the moment without changing permanent catalog preferences.

## Pick or build for me

**Pick something** chooses randomly from the currently valid pool. **Build something** creates an ordered scene arc. Recent random picks are temporarily remembered to reduce immediate repeats.

Inference-only suggestions stay under **Suggested to explore** and are never silently randomized.

## Edit the scene arc

A generated scene can be edited component by component:

- add or remove an item
- move it up or down
- change its phase
- replace or shuffle one part
- add scene-local notes
- optionally include an M11-backed Reward or Punishment

## Save scenes

Named scenes can be saved locally, loaded, edited, duplicated, and deleted. If an underlying catalog item or M11 reference later becomes stale or excluded, the saved scene is marked **Needs review** rather than silently rewritten.

Saved scenes are included in the private full-profile backup and have their own selective-reset scope. They are not included in the default share summary.

See [M13 Scene Builder](m13-scene-builder.md).

---

# Manage your profile: Settings

## Profile name

**What it is.** The display identity used throughout your local profile and share presentation.

**Use it when.** You want the app to refer to the profile by a chosen name.

## Selective reset

**What it is.** A controlled way to clear one kind of profile data without wiping everything else.

You can independently reset areas such as:

- all quizzes or selected quizzes
- explicit catalog preferences
- This-or-That and ranking history
- Rewards & Punishments contextual data, rankings, and recipes
- profile name and settings
- everything

The app shows a review step before deletion so you can see what will reset and what will remain.

## Export profile backup

**What it is.** A complete private machine-readable backup of the profile.

**Use it when.** You want to preserve your data, move it, or protect against browser/device data loss.

**Treat it as private.** The backup is intended to preserve authoritative app state, not to be a friendly document for another person to read.

## Import profile backup

**What it is.** A restore flow for a complete profile backup.

**Current behavior.** Import is a full-profile replacement, not a merge. The app validates and previews the backup before restoring it.

## Share summary

**What it is.** A curated, human-readable version of the profile designed for deliberate sharing.

**Use it when.** You want another person to understand the useful profile summary without receiving your private application backup.

The share summary deliberately omits internal/raw data such as:

- raw questionnaire answers
- comparison history
- internal evidence IDs
- storage metadata
- internal provenance

Current export formats:

- **PNG** — tall, phone-friendly image
- **HTML** — responsive self-contained page
- **PDF** — printable/shareable document based on the same summary

The share summary and private backup are intentionally different products.

Technical reference: [M9 Settings, Profile Management & Sharing](m9-settings-profile-management.md)

---

# Privacy and persistence

## Where data lives

The app currently has no required account and no backend.

Authoritative profile data is stored locally in the browser using `localStorage`.

That supports the app's privacy-first design, but it also means browser storage can be lost if site data is cleared, the browser/device is reset, or the data is otherwise removed.

If you care about preserving a profile, periodically export a private backup.

## What sharing does

The app does not automatically publish the profile.

A share summary is generated deliberately by the user. Exporting a private backup is also a deliberate local action.

Uploaded profile comparison is also local and deliberate. The uploaded Full Profile Export is validated in the browser, reduced to the data needed for the active comparison, and is not imported, merged into your profile, or saved as another editable profile.

---

# Compare with another profile

The app can compare your current profile with someone else's **Full Profile Export** without replacing either person's evidence.

## Upload and compare

From **Compare profiles**, upload the other person's profile JSON.

The comparison derives useful relationship states such as:

- **We both love** — both profiles have direct positive interest
- **We fit together here** — explicit giving/receiving or validated role/headspace/dynamic-mode complements
- **Maybe explore** — shared curiosity or positive + curious
- **Different flavors** — related positive interests with different directional/contextual patterns
- **Not for shared suggestions** — either person's explicit exclusion wins
- **Still unexplored** — there is not enough direct evidence yet

There is no synthetic compatibility percentage, and the comparison does not feed results back into either profile.

## What do you each want tonight?

Both people can temporarily select current headspace, dynamic mode, or activity-side intent. Those choices can surface validated pairings and seed Shared Scene Builder themes.

They are session/query context only. They do not change quiz results, catalog preferences, or permanent profile evidence.

## Build a shared scene

**Build shared scene** reuses the normal Scene Builder but filters from the space supported by both profiles.

Either person's explicit exclusion or **Not tonight** removes an item from automatic shared suggestions. Complementary giving/receiving interests can fit even when the two people do not have identical overall ratings.

Shared Rewards & Punishments add-ons are currently disabled because the app does not yet intersect M11 suitability from both profiles.

## Is the uploaded profile saved?

No. The current implementation is **compare once**.

The uploaded profile is temporary comparison input, not another editable identity in the app. Persistent partner/profile linking is intentionally under product-model refinement.

See [M14 Shared Profiles](m14-shared-profiles.md).

---

# Planned / refinement work

## M14 — Persistent profile/linking model

The comparison and shared-scene parts of M14 are implemented. What remains undecided is whether persistent support should mean temporary comparison only, saved read-only linked profiles, multiple fully editable local profiles, or account-owned profiles linked later.

Do not assume a profile switcher is the intended end state.

See [M14 Shared Profiles](m14-shared-profiles.md).

## M15 — Contextual Activity Profiles

More detailed context for cases where the same activity means something different depending on authority context and activity side.

See [M15 Contextual Activity Profiles](m15-contextual-activity-profiles.md).

## M16 — Data & Content Curation

A whole-app quality pass for quizzes, signals, radars, catalog items, mappings, Rewards & Punishments data, and the curation workbench used to review them.

See [M16 Data & Content Curation](m16-data-content-curation.md).

---

# Need a behavioral explanation?

See the [FAQ](faq.md) for questions such as:

- Why do quiz results and the Overall Profile differ?
- Why does a high rank not automatically mean Love?
- What does NEW / ↑ / ↓ mean?
- Why can something be both a Reward and a Punishment?
- Why is a private backup different from the share summary?
