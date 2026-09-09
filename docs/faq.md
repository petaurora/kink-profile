# Pet Profile FAQ

This FAQ explains common product behaviors in plain language.

For a feature-by-feature walkthrough, start with the [Feature Guide](feature-guide.md). For implementation details and scoring contracts, use the deeper product and milestone specifications.

---

# General

## Do I need to finish everything before my profile works?

No.

The app is intentionally modular. You can complete one quiz, set a handful of catalog preferences, rank one category, or use only the features that are useful to you.

The Overall Profile should become richer as more meaningful evidence exists, but "unfinished" does not mean "invalid."

## Is this supposed to diagnose me or tell me what I am?

No.

Results are descriptive. They summarize patterns in the answers and preferences you have provided. They are not a diagnosis, identity assignment, or replacement for communication and consent.

## Why does the app use several different ways to answer similar questions?

Because they are not actually the same question.

- **Quizzes** ask about broad tendencies and patterns.
- **Catalog preferences** ask how you directly feel about one specific item.
- **This-or-That** asks which of two eligible items rises higher relative to the other.
- **Rewards & Punishments** asks whether an item works in a specific contextual role.

Keeping those answers separate makes the combined profile more useful and prevents one interaction from pretending to mean more than it does.

---

# Quizzes and the Overall Profile

## Why don't my quiz results exactly match my Overall Profile?

Because the Overall Profile is not a copy of one quiz result.

A section quiz contributes one kind of evidence. The full profile can also consider direct catalog preferences, current pairwise ranking evidence, and other completed sections.

The result is a combined picture, so it can legitimately differ from any one input.

## Why can my Headspaces section differ from the headline at the top of the profile?

They answer different presentation questions.

The dedicated Headspaces section shows the Headspace layer itself. The profile headline summarizes the strongest broader profile patterns that are useful for a compact first impression.

Neither should be treated as a replacement for the other.

## Does giving an activity mean Dominant?

No.

Giving/receiving describes activity side. Dominant/submissive describes authority context.

A submissive person may give an activity. A Dominant person may receive one. The app deliberately avoids converting physical direction into authority identity.

See [Authority, Activity Side & Role Semantics](authority-activity-role-separation.md).

## Does receiving an activity mean submissive?

No, for the same reason.

Activity side and authority context are separate dimensions.

## Why can a strong radar theme include an activity I do not want?

A radar theme is broad.

For example, a strong Intensity & Pain theme describes an overall pattern. It does not mean every activity associated with intensity or pain is automatically a positive preference.

Direct catalog boundaries still matter.

## What does profile coverage mean?

Coverage is about how much meaningful evidence is available, not how strong a preference is.

A very strong answer with little supporting evidence can still have limited coverage. The app keeps "strength" and "how much do we know?" separate.

---

# Catalog preferences

## What is the difference between Love, Like, Curious, and Unsure?

They are direct preference states.

- **Love** is a strong positive preference.
- **Like** is positive.
- **Curious** means you may want to explore it.
- **Unsure** means you do not currently have a clear answer.

They are not automatically generated from ranking position.

## What is the difference between Not Interested and Hard Limit?

**Not Interested** means you do not currently want the activity.

**Hard Limit** is a firmer boundary and is treated as an explicit exclusion.

A low rank, a skip, uncertainty, and Not Interested should not be interpreted as a Hard Limit.

## What does Not Applicable mean?

The item does not meaningfully apply to your profile or situation.

It is different from disliking the item.

## What does Not set mean?

You have not given a direct catalog answer for that item.

The app may still have quiz-derived context or ranking evidence about it, but those do not magically become an explicit preference.

## What does "quiz-derived" or "inferred" mean beside a catalog item?

It means the app found related broad profile evidence that may make the item worth looking at.

It is a hint, not your answer.

It does not overwrite a direct preference or pairwise rank.

## Can inferred data silently turn something into Love, Like, or Curious?

No.

Direct catalog states are explicit user-owned answers.

---

# This-or-That ranking

## What is the difference between a catalog preference and a This-or-That rank?

A catalog preference is an absolute-ish direct statement:

> I love this.

A rank is relative:

> Of these two things, this one rises higher for me.

You can Love two activities and still rank one above the other. You can also have a meaningful rank for an item without ever assigning it Love.

## Does ranking something highly automatically make it Love?

No.

Ranking does not rewrite the explicit preference state.

## Does marking something Love automatically make it rank #1?

No.

Love makes a strong direct statement about that item. This-or-That establishes comparative order through actual pairwise choices.

They are separate evidence channels.

## Why do I rank within categories before Overall?

Comparing the entire catalog against itself would create an enormous and noisy pair pool.

Category ranking creates meaningful local order first. Current finalists can then compete in the smaller cross-category Overall pool.

## What do Both / equal, Neither, and Skip / don't know do?

**Both / equal** says the pair is effectively tied for this comparison.

**Neither** says neither option should win this particular comparison.

**Skip / don't know** leaves the ordering unresolved.

The app saves these interactions, but Skip and Neither do not raise ordering confidence the same way a meaningful left/right/equal ordering choice does.

## What are Quick, Standard, Deep Dive, and Gremlin Mode?

They are session sizes, not different scoring systems.

- **Quick** gives 10 comparisons.
- **Standard** gives 25.
- **Deep Dive** gives 50.
- **Gremlin Mode** keeps going.

Your saved comparisons remain part of the active run regardless of session size.

## Why does the ranking say it has low confidence?

Usually because there is not yet enough meaningful ordering evidence in that scope.

More comparisons refine the relative order.

Low confidence does not mean your answers are wrong. It means the app has less pairwise evidence to work with.

## Why is an item missing from new ranking pairs?

Common reasons include:

- it is explicitly excluded
- the current scope has fewer than two eligible candidates
- there is no useful unresolved pair at the moment
- you are in a category where that item does not belong

Existing historical evidence can remain saved even when an item is no longer eligible for new pairs.

---

# Ranking runs and movement

## What happens when I start a new ranking run?

The current ranking run is archived and a fresh active run begins.

Your quizzes and explicit catalog preferences stay intact.

Previous runs remain history, but only the active run supplies current pairwise ranking evidence to the profile.

## Is starting a new ranking run the same as Reset This-or-That?

No.

**Start a new ranking run** preserves the previous run as history.

**Reset This-or-That & rankings** is a destructive Settings action that clears ranking data/history in the selected reset scope.

## Does my old run still influence the current ranking?

Not as current pairwise evidence.

Archived runs are retained for history and movement comparison. They do not accumulate into one lifetime ranking score.

## What does ↑ or ↓ mean?

It shows movement relative to the previous comparable view.

If you are looking at a category, movement compares that category's current visible ranking with the prior comparable category ranking.

If you are looking at Overall, it compares Overall with prior Overall.

## What does NEW mean?

It means the item is meaningfully ranked in the current view but was not meaningfully ranked in the previous comparable view.

It does not mean the item itself is newly added to the catalog.

## Why does an item have no movement indicator?

There may not be a previous comparable run, or the item may not have enough meaningful rank evidence in one of the two views.

## Does movement affect my score?

No.

Movement is historical context. It does not add a bonus, penalty, or weighting signal to the current profile.

---

# Overall Profile

## Why doesn't Top Overall exactly match the Overall This-or-That results?

The two views have different jobs.

The This-or-That result is the direct output of the current pairwise ranking.

Top Overall is a compact profile presentation that can consider multiple meaningful direct evidence sources while preserving where those signals came from.

So they can be related without being identical.

## Why are only some categories shown under Interest Areas?

The main profile is intentionally compact.

Interest Areas surfaces a smaller number of the strongest or most relevant category-level themes. You can use the exploration links to inspect more categories and specific state filters.

## Can a Hard Limit appear as a top interest because a quiz liked the theme?

It should not be treated as a positive top interest.

Explicit boundaries are authoritative. Broad thematic affinity must not override a Hard Limit.

## Why does changing one catalog preference sometimes affect several profile summaries?

One direct activity can be relevant to more than one broader category or theme.

The app can recompute several derived presentation areas from the same explicit evidence without duplicating the original answer.

---

# Rewards & Punishments

## Why are Rewards & Punishments separate from my general kink preferences?

Because "I like this" and "this works as a reward" are different statements.

The same is true for punishments.

M11 keeps those contextual uses separate so the app does not turn general preference into an assumption about consequences or incentives.

## Can something be both a Reward and a Punishment?

Yes.

Reward and Punishment are independent contextual axes, not opposite ends of one scale.

Something may work as both depending on context.

## Does disliking something make it a punishment?

No.

The app explicitly avoids using dislike or aversion as positive punishment evidence.

A punishment candidate needs its own contextual answer.

## What is the difference between the Quick sorter and Detailed profiles?

The **Quick sorter** is intentionally coarse: Reward, Punishment, Both, Neither, or Skip.

The **Detailed profiles** let you express stronger nuance such as Strong, Works, Depends, No, Never, contextual notes, and random eligibility.

Use the sorter for speed and the detailed editor when the answer needs conditions or boundaries.

## Why does the sorter warn me before replacing an answer?

Because a coarse sorter choice could erase richer information such as Strong, Depends, Never, a note, or a random-pool setting.

The warning is there to protect nuanced direct data.

## What does Suggested to explore mean?

It is an inferred possibility based on existing profile/context evidence.

It is not an automatic classification.

Accepting a suggestion creates a conservative direct answer rather than pretending the inference was certainty.

## Why can't I rank Rewards or Punishments yet?

You need at least two directly positive candidates in that context.

Strong, Works, and Depends are eligible. No, Never, and Unset are not.

## Is Reward rank the same as my general kink rank?

No.

There are separate rankings for:

- general kink preference
- reward context
- punishment context

One item can occupy very different positions in each.

## Does Punishment rank mean severity?

No.

It is relative contextual ordering among confirmed punishment candidates. Severity or intensity would need to be its own explicit dimension.

## I marked something Works. Why isn't it in the Randomizer?

Random eligibility is separate from contextual suitability.

An item can work as a Reward or Punishment without being approved for random selection.

This is intentional so "valid in context" does not automatically mean "surprise me with this."

## Does the Randomizer use my rankings as probability weights?

No.

Current random selection treats eligible entries equally. Rank does not make an entry more likely to be picked.

## Does the Randomizer assign the result to me or track whether I did it?

No.

It is only a suggestion utility.

There is no assignment queue, completion tracking, debt, punishment ledger, or reward economy in the current feature.

## Why does the Randomizer show "Already rolled"?

That is a temporary trail for the current Randomizer visit so you can see what has already appeared.

It is not persistent profile history and clears when the Randomizer is left/unmounted.

## Can saved recipes appear in the Randomizer?

Yes, if the recipe is valid and explicitly allowed in its matching random pool.

A recipe marked Needs review is kept out until the issue is resolved.

## What does Needs review mean on a recipe?

Something about the saved combination is no longer valid enough for automatic reuse—for example, a component may conflict with changed contextual boundaries.

The recipe is preserved so you can repair it rather than silently deleting it.

---

# Scene Builder

## Does choosing a Scene Builder theme change my profile?

No.

Themes are current-session queries. They narrow and organize existing profile evidence but do not write back into catalog preferences, quiz scores, headspaces, dynamic modes, or Overall Profile scores.

## What does Yes / Maybe / Not tonight do?

Those are temporary session choices for Scene Builder.

**Not tonight** removes an item from automatic suggestions and randomization for the current session even if the permanent profile strongly likes it. **Yes** and **Maybe** can make a non-excluded item explicitly usable for the moment without changing the durable profile.

## Can an inferred suggestion be randomly selected?

Not by default.

Inference-only items can appear under **Suggested to explore**, but they do not enter automatic Pick something, Build something, or Shuffle pools unless the user explicitly establishes current-session support through the allowed flow.

## What is the difference between Pick something and Build something?

**Pick something** returns one random eligible activity.

**Build something** creates an ordered multi-part scene using the selected themes, effort, filters, and current-session eligibility.

Random selection is uniform inside the valid pool rather than secretly weighting the highest-ranked item to win most often.

## Can I save a scene?

Yes.

Saved scenes are local reusable templates. You can load, edit, duplicate, or delete them. They keep stable references to catalog items and M11 reward/punishment items or recipes.

## What does Needs review mean on a saved scene?

One or more referenced sources changed after the scene was saved.

For example, a catalog item may now be excluded or unavailable, or an M11 reward/punishment item or recipe may no longer be confirmed for that context. The app keeps the saved component visible so it can be repaired instead of silently deleting it.

## Are saved scenes included in my share summary?

No.

They are private by default. Saved scenes are included in the full machine-readable backup and can be reset independently, but the default M9 share summary does not include them.

---

# Settings, backup, and sharing

## What is the difference between Export profile backup and Export share summary?

They serve completely different purposes.

**Profile backup** is the private machine-readable copy used to preserve or restore app state.

**Share summary** is a curated human-readable presentation intended for another person.

Do not treat the private backup as the normal sharing format.

## What is included in the private backup?

The goal of the backup is to preserve authoritative profile state, including current implemented domains such as quiz data, catalog preferences, ranking history, profile settings, and authoritative Rewards & Punishments state.

Derived displays can be recalculated after restore.

## Does the share summary include all my raw data?

No.

The current share summary deliberately omits raw answers, comparison history, internal evidence IDs, storage metadata, and other implementation/provenance details.

It is a summary, not a database dump.

## What's the difference between PNG, HTML, and PDF share exports?

They use the same underlying share-summary content.

- **PNG** is optimized as a tall phone-friendly image.
- **HTML** is responsive and self-contained.
- **PDF** uses the same rendered summary in a paginated document format.

## Does importing a backup merge with my current profile?

No.

The current import behavior is full-profile replacement.

The app validates and previews the backup before restoration.

## Can I reset only one part of the profile?

Yes.

Settings supports selective reset for areas such as selected quizzes, explicit catalog preferences, ranking history, Rewards & Punishments, and profile identity/settings.

The review screen shows what will reset and what will remain before deletion.

## If I reset my rankings, will it delete my quiz answers?

Not unless you select quiz data too.

The reset system is intentionally source-aware so unrelated profile domains can be preserved.

---

# Privacy and storage

## Is my profile stored in the cloud?

Not currently.

There is no required account or backend. Authoritative profile data is currently stored in the browser's local storage.

## Can clearing browser data delete my profile?

Yes.

Because the app is local-first, clearing site data or losing the browser/device storage can remove the local profile.

Export a private backup if the profile matters to you.

## Does exporting a share summary publish it automatically?

No.

The app generates the file locally for deliberate sharing. It does not automatically publish the profile.

---

# Future features

## Can I have two full profiles in the app and compare them?

That is planned in M14 Shared Profiles.

The design keeps the profiles independent and derives comparisons rather than merging two people into one synthetic profile.

## Can I say I like the same activity differently depending on Dominant/submissive context and giving/receiving side?

That deeper contextual model is planned in M15.

The current app already keeps authority and activity side semantically separate; M15 adds durable item-level contextual preference/ranking overlays.

## Is the catalog/data considered final?

No.

M16 is explicitly planned as a curation milestone. It can prune, merge, rename, re-categorize, or rebalance authored data when doing so improves the product, while preserving user evidence through migrations when identity changes.
