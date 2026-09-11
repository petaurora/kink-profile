# Kink Profile Feature Guide

This guide explains the **current app** in plain language: what each feature is for, when to use it, and how the pieces work together.

For implementation details and semantic rules, follow the durable contracts linked throughout this guide. Active work belongs in GitHub Issues; future product thinking belongs in Kink Profile HQ in Notion.

## The app in one minute

Kink Profile builds a preference profile from several different kinds of input instead of treating one questionnaire as the whole answer.

```text
QUIZZES
broad patterns and reusable preference evidence
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
separate contextual suitability and ranking

SCENE BUILDER
uses the profile to narrow choices for right now
```

These inputs are related, but they are not interchangeable.

A quiz result is not the same as explicitly marking a catalog item Love. A high This-or-That rank is not the same as a Hard Limit or favorite. Something that works as a punishment is not automatically something you dislike. A Scene Builder choice for tonight does not rewrite your permanent profile.

That separation is intentional.

## A simple first-time path

You do not need to complete everything before the app becomes useful.

1. **Take one or more core quizzes** to establish broad patterns.
2. **Browse the Kink Catalog** and explicitly mark activities you already know something about.
3. **Play This-or-That** when relative comparison feels easier than rating items independently.
4. **View your Overall Profile** to see the combined picture.
5. **Map Rewards & Punishments** if you want to distinguish general interest from contextual suitability.
6. **Use Scene Builder** when you want the profile turned into a smaller, usable set of options for the current moment.
7. **Export a private backup** once you have data you care about.
8. **Use the share summary** when you want a curated human-facing version.
9. **Compare profiles temporarily** when someone has shared a compatible profile export and you want to explore overlap or shared Scene options without importing their profile.

You can return to any area later and refine it. The profile is designed to grow with partial evidence.

---

# Start broad: Quizzes

## Current core quizzes

The app currently has four independently completable quiz sections:

- **Bondage & Discipline**
- **Dominance & Submission**
- **Sadism & Masochism**
- **Roles & Headspaces**

**What they are.** Focused questionnaires that measure broad experiences and mechanisms instead of asking you to rate every specific activity.

**Use them when.** You want to describe patterns such as control, autonomy, restraint, care, service, ritual, intensity, pursuit, role immersion, or challenge.

**How to use them.** Open any section, answer as much as you want, and return later if needed. The sections are independent and can be completed in any order.

**What they change.** Quiz answers contribute direct quiz evidence to the overall profile and can support derived catalog context.

**What they do not do.** They do not directly set individual catalog items to Love, Like, Curious, Hard Limit, or another explicit state.

The old Starter Profile is retained only as a compatibility identifier for legacy stored data. It is not a current quiz destination.

Technical reference: [Quizzes](product/quizzes.md)

## Roles & Headspaces

The Roles & Headspaces section has two useful derived layers:

- **Roles / headspaces** — recognizable relational or internal states such as Pet, Prey, Caregiver, or Owner / Handler.
- **Dynamic Modes** — cross-cutting patterns such as Care, Devotion, Structure, Power Exchange, or Intensity.

These results can overlap. They are descriptions of current evidence, not universal identity assignments.

Current taxonomy reference: [Roles, Headspaces & Dynamic Modes](data-model/roles-headspaces-modes.md)

## Giving, Receiving, Dominant, and submissive

These are not synonyms.

- **Dominant / submissive** describes authority or power context.
- **Giving / Receiving** describes the perspective of an activity or Signal when that distinction is meaningful.
- **Roles / headspaces** describes recognizable experiential or relational states.

A submissive person can give an activity. A Dominant person can receive one. The app keeps these concepts separate on purpose.

Technical reference: [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md)

---

# Define specific interests: Kink Catalog

## Browse & set preferences

**What it is.** The detailed activity library and direct preference-management surface.

**Use it when.** You already know how you feel about a specific activity, want to mark a boundary, or want to browse beyond the quiz topics.

**How to use it.** Search or filter the catalog, then set a direct preference on any item you care about. You do not need to classify the whole catalog.

Current direct states are:

| State | Plain-language meaning |
| --- | --- |
| **Love** | Strong direct positive preference |
| **Like** | Positive preference |
| **Curious** | Something you may want to explore |
| **Unsure** | You explicitly do not have a clear answer yet |
| **Not Interested** | Not something you currently want |
| **Hard Limit** | Firm explicit boundary |
| **Not Applicable** | The item does not meaningfully apply |
| **Not set** | No direct answer has been given |

**What it changes.** These are explicit user-owned answers. Exclusion states can immediately affect new ranking/recommendation eligibility.

**What it does not do.** A catalog preference does not automatically create or alter a This-or-That rank.

## Profile-informed catalog context

You may see inferred/profile-informed information beside a catalog item.

**What it is.** A derived hint based on broader profile evidence and the item's semantic mappings.

**Use it when.** You want help finding items that may be worth reviewing.

**Important.** It is not your direct answer. It does not overwrite an explicit preference, a boundary, or pairwise ranking evidence.

Technical reference: [Kink Catalog](product/kink-catalog.md)

---

# Refine relative favorites: This-or-That

## Category ranking

**What it is.** A pairwise comparison game for ranking eligible items relative to one another inside a category.

**Use it when.** Comparing two things feels easier than assigning independent numeric ratings.

Each pair supports:

- one item over the other;
- **Both / equal**;
- **Neither**;
- **Skip / don't know**.

Meaningful ordering choices gradually refine the ranking.

Session-size shortcuts such as Quick, Standard, Deep Dive, and Gremlin Mode change how long you play, not the scoring model.

**What it changes.** It creates direct comparative evidence for the active ranking run.

**What it does not do.** It does not write explicit catalog states.

## Overall ranking

**What it is.** Cross-category comparison among candidates that emerged from evidenced category ranking.

**Use it when.** You want to answer which specific interests rise highest across different categories.

Untouched categories do not contribute arbitrary finalists merely because unrated items start tied.

Technical reference: [Kink This-or-That Ranking](kink-this-or-that-ranking.md)

---

# Revisit preferences over time: Ranking runs

## Start a new ranking run

**What it is.** A non-destructive way to rerank from a fresh comparative starting point.

**Use it when.** You want a new preference pulse without deleting the previous one.

Starting a new run:

- archives the current ranking run;
- preserves its historical snapshots;
- starts a fresh active run;
- leaves quiz answers and explicit catalog preferences unchanged.

Only the active run supplies current pairwise ranking evidence to the profile.

## Movement indicators

Once a previous comparable run exists, ranked views may show:

- **↑** moved higher;
- **↓** moved lower;
- **—** stayed in the same visible position;
- **NEW** is meaningfully ranked now but was not in the previous comparable view.

Movement is calculated relative to the view you are looking at. Hidden or filtered-out items should not create phantom rank movement.

Movement is historical context only. It does not add score weight to the current profile.

Technical reference: [Kink This-or-That Ranking](kink-this-or-that-ranking.md)

---

# Understand the combined picture: Overall Profile

## Overall Profile

**What it is.** The app's combined interpretation of the evidence available so far.

It can include:

- overall profile summary/headline;
- broad Overall Facets;
- roles/headspaces;
- Dynamic Modes;
- Top Overall interests;
- Hard Limits;
- Interest Areas;
- explanation and evidence-coverage context;
- Rewards & Punishments summaries when enough direct contextual data exists.

**What it changes.** Nothing directly. The Overall Profile is a derived interpretation/presentation layer, not another source of answers.

**Why it may differ from one quiz.** The overall profile can combine several independent sources. One section quiz is only one part of that picture.

## Overall Facets

The broad radar summarizes themes such as Power Exchange, Service & Devotion, Restraint & Physical Control, Care & Nurture, Intensity & Pain, and other current facets.

A strong facet does **not** mean every activity associated with that theme is wanted.

## Top Overall

Top Overall is a compact profile presentation of specific interests supported by meaningful direct evidence.

It is related to, but not required to exactly equal, the raw Overall This-or-That ordering because the profile presentation can consider multiple independent direct sources while preserving provenance.

## Hard Limits

Hard Limits are explicit boundaries. They are not low ranks, uncertainty, or inferred low affinity.

## Interest Areas

Interest Areas compress meaningful category-level clusters so the main profile does not need to display every catalog category at once.

Technical references: [Overall Profile Aggregation](overall-profile-aggregation.md) and [Source-Aware Profile Evidence Architecture](profile-evidence-architecture.md)

---

# Map contextual use: Rewards & Punishments

Rewards & Punishments asks a different question from general interest:

```text
Do I like this activity?
        ≠
Would this work as a Reward?
        ≠
Would this work as a Punishment?
```

Reward and Punishment are independent contexts.

## Quick sorter

**What it is.** A fast coarse classification flow.

Choices include Reward, Punishment, Both, Neither, and Skip for now.

**Use it when.** You want to move quickly through many ideas.

A coarse sorter action should not silently destroy richer detailed data without warning.

## Detailed contextual profiles

The detailed Reward and Punishment profiles support:

- Strong;
- Works;
- Depends;
- No / not a fit;
- Never;
- Unset;
- optional notes;
- separate random-pool eligibility where allowed.

Something can be strong in both contexts, valid in one and Never in the other, or any other independently stated combination.

## Suggested to explore

Profile-informed proposals can suggest unrated possibilities.

They remain inferred suggestions until the user explicitly accepts/edits them. Punishment inference is intentionally conservative and does not treat general catalog liking as sufficient punishment evidence.

## Reward and Punishment ranking

Reward and Punishment have separate pairwise rankings over directly positive candidates.

These rankings are also separate from general kink ranking.

## Randomizer

The randomizer picks from explicitly random-eligible items/recipes for the chosen context.

It does not assign work, track completion, create debt, or weight random probability by contextual rank.

It avoids an immediate repeat when possible.

## Recipes

Saved Reward/Punishment recipes combine multiple primitives and/or custom recipe-only components.

Recipes can be saved, edited, duplicated, reordered, and deleted. When referenced data later becomes stale or conflicts with direct contextual boundaries, a recipe can require review and stay out of automatic randomization until repaired.

Technical reference: [Rewards & Punishments](product/rewards-punishments.md)

---

# Compose the moment: Scene Builder

Scene Builder uses existing profile evidence to reduce decision load for a specific session. It does not infer consent or create new permanent preferences.

## Choose the space

Select one or more Scene themes and optionally tune:

- effort: Quick / Normal / Elaborate;
- exploration: Familiar / Mixed / Explore;
- intensity preference.

Themes are query/composition metadata, not new profile evidence.

## Tonight-only choices

Candidates can be marked:

- **Yes tonight**;
- **Maybe tonight**;
- **Not tonight**.

These are session-only overrides. `Not tonight` removes an item from the current automatic Scene pool without changing its permanent catalog preference.

## Suggestions and automatic eligibility

Inference-only candidates stay under **Suggested to explore** and are not automatically randomized merely because the profile predicts affinity.

Explicit exclusions and current-session exclusions remain authoritative.

## Pick or build

**Pick something** selects one eligible candidate.

**Build something** creates an ordered multi-phase scene composition using the current filters/theme space.

The session keeps short anti-repeat history for random picks so rerolling does not immediately produce the same item when alternatives exist.

## Edit and save

A scene composition can be adjusted component by component, including phase assignment, removal/replacement/shuffle, local notes, and an optional Reward/Punishment phase using that system's own eligibility rules.

Named Scene templates can be saved locally. If referenced catalog or Reward/Punishment data later becomes stale or invalid, the saved Scene can require review rather than silently changing history.

Technical reference: [Scene Builder](product/scene-builder.md)

---

# Compare profiles temporarily

## Profile Comparison

**What it is.** A temporary comparison workspace for the local profile plus a compatible uploaded profile.

**Use it when.** You want to explore overlap, differences, directional complementarity, boundaries, or shared Scene options without importing the other person's profile.

The uploaded profile is comparison input only. It is not installed as a second persistent local profile and neither profile is rewritten by comparison.

Pairwise ranking alone is not treated as proof of absolute shared interest. Directional complementarity requires actual directional evidence rather than stereotype-based inference.

## Shared Scene Builder

The comparison workspace can derive candidates that fit both profiles and temporary participant intent.

Participant intent is session context, not a permanent edit to either profile.

Technical reference: [Profile Comparison](product/profile-comparison.md)

---

# Manage your profile: Settings

## Display name

The local profile has an editable display name used in presentation/export surfaces.

## Selective reset

Settings can reset independent authoritative domains without automatically deleting unrelated data.

Current reset scopes include:

- selected quiz sections;
- explicit catalog preferences;
- This-or-That comparisons/ranking history;
- Rewards & Punishments;
- saved Scenes;
- profile settings/identity.

Reset flows through a review step before destructive confirmation.

## Private backup

The private backup is the machine-readable artifact used to preserve/restore supported durable local profile state.

Current export format is `kink-profile` version 3, with restore compatibility for versions 1, 2, and 3.

Backup import replaces the local profile after validation; it is not a silent merge.

## Share summary

The share summary is a curated human-facing view rather than a complete data dump.

It can be exported locally as:

- PNG;
- standalone HTML;
- PDF.

Raw quiz answers, raw comparison history, internal evidence IDs, and the private backup payload are not included simply because the app possesses them.

Technical reference: [Profile Management](product/profile-management.md)

---

# How the pieces stay separate

A few rules explain most of the product:

```text
quiz evidence
≠ explicit catalog preference
≠ pairwise rank
≠ inferred catalog affinity
≠ reward/punishment suitability
≠ tonight-only Scene choice
```

Likewise:

```text
Receiving / Giving
≠
submissive / Dominant
```

And:

```text
Hard Limit
≠ low rank
≠ uncertainty
≠ inferred low affinity
```

Those distinctions are what let the app combine information without pretending every signal means the same thing.

## Where to go deeper

- [Product Spec](product-spec.md) — current product boundaries
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
