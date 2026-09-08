# M15 — Contextual Activity Profiles

**Status:** planned  
**Roadmap milestone:** M15  
**Primary boundary:** M15 lets the same activity have different explicit preferences, rankings, and derived profile meaning depending on authority context and activity side. It does not infer Dominant/submissive authority from giving/receiving behavior, and it does not duplicate every catalog item into six literal rows.

---

## Goal

The current profile can already answer broad questions such as:

- Do I like this activity generally?
- Do I like giving it?
- Do I like receiving it?
- Am I generally Dominant, submissive, both, context-dependent, or still emerging?

What it cannot yet answer cleanly is:

> **How do I feel about doing or experiencing this activity specifically while I am in a Dominant, submissive, or non-D/s context?**

That distinction matters because the same physical side can have completely different meaning.

~~~text
Spanking

General preference: Love

As Dominant
  Give:    Love
  Receive: Like

As submissive
  Give:    Love
  Receive: Love

No D/s context
  Give:    Like
  Receive: Like
~~~

A submissive person may strongly enjoy giving pain because they were instructed to, because it feels like service, or because they are holding delegated responsibility.

A Dominant person may strongly enjoy receiving pain without becoming submissive.

M15 must make those combinations first-class without recreating the semantic bugs that M7 explicitly removed.

The product principle is:

> **Context qualifies preference. It does not redefine identity.**

---

# Why this is a separate milestone

This is not just another catalog filter. It creates a reusable context dimension that can affect:

- explicit catalog refinement
- pairwise ranking
- M12 ranking history
- contextual category/profile summaries
- M11 Reward/Punishment suitability and contextual ranking
- M13 Scene Builder candidate filtering
- M14 Shared Profile complementarity
- future saved views / comparisons / exports

If every consumer hard-codes its own Dom + Give / Dom + Receive / Sub + Give / Sub + Receive behavior, the app will become inconsistent immediately.

M15 therefore defines one canonical contextual model that every later consumer can reuse.

---

# Core semantic model

M15 introduces two orthogonal dimensions.

## Dimension 1 — Authority context

Authority context answers:

> **What negotiated authority/headspace context am I in for this activity?**

Initial canonical values:

~~~ts
type AuthorityContext =
  | 'dominant'
  | 'submissive'
  | 'non_ds';
~~~

### Dominant

The user is acting/experiencing the activity while occupying an authority-holding D/s context.

This does not imply they are giving the physical activity.

Examples:

- Dominant + giving impact
- Dominant + receiving impact
- Dominant + applying restraint
- Dominant + being restrained

### Submissive

The user is acting/experiencing the activity while occupying an authority-receiving/surrendering D/s context.

This does not imply they are receiving the physical activity.

Examples:

- submissive + giving impact as instructed service
- submissive + applying restraints under direction
- submissive + receiving impact
- submissive + providing care because it was requested

### Non-D/s

The activity is being considered without an authority-exchange lens.

Examples:

- sensation/play
- mutual exploration
- practical caretaking
- playful roughhousing
- physical experimentation
- role-neutral activity

This context is required. Without it, the app would force every preference into Dominant/submissive meaning even when the user simply likes the activity.

---

## Dimension 2 — Activity side

Activity side answers:

> **Which side of the activity am I doing/experiencing?**

Canonical values:

~~~ts
type ActivitySide =
  | 'giving'
  | 'receiving'
  | 'undirected';
~~~

For directional items, the common matrix is:

| | Giving | Receiving |
| --- | --- | --- |
| Dominant | Dom + Give | Dom + Receive |
| submissive | Sub + Give | Sub + Receive |
| Non-D/s | Neutral + Give | Neutral + Receive |

This gives up to six independently knowable contexts.

That does not mean every catalog item must expose all six.

Some activities are:

- directional
- authority-sensitive but not meaningfully give/receive
- non-directional
- role/headspace concepts rather than activities
- composite concepts that require item-specific contextual labels

M15 must support capability metadata rather than forcing a six-cell matrix onto everything.

---

# Canonical context key

Use one reusable key:

~~~ts
type ActivityContextKey = {
  authority: AuthorityContext;
  side: ActivitySide;
};
~~~

Examples:

~~~text
dominant + giving
dominant + receiving
submissive + giving
submissive + receiving
non_ds + giving
non_ds + receiving
~~~

Downstream systems should parameterize behavior by this key instead of creating six separate bespoke subsystems.

---

# Catalog context capability metadata

Not every catalog item should expose the same contextual controls.

Add versioned capability metadata separate from user preference.

~~~ts
interface CatalogContextCapability {
  catalogId: CatalogId;
  authorityRelevant: boolean;
  sides: Array<'giving' | 'receiving' | 'undirected'>;
  labels?: {
    giving?: string;
    receiving?: string;
    undirected?: string;
  };
  notes?: string;
}
~~~

Examples:

### Spanking

~~~text
giving    = Giving / administering
receiving = Receiving
~~~

### Restraint

~~~text
giving    = Applying restraint
receiving = Being restrained
~~~

### Praise

~~~text
giving    = Giving praise
receiving = Receiving praise
~~~

If give/receive is awkward for an item, use item-specific labels or an undirected authority-context view.

The stored context remains stable even when presentation labels are friendlier.

---

# Explicit contextual preference

M6 general catalog preference remains authoritative for the general question:

> How do I feel about this activity overall?

M15 adds optional contextual overlays.

## Canonical contextual state

Reuse the M6 explicit preference vocabulary where semantically appropriate:

~~~ts
type ContextualPreferenceState =
  | 'love'
  | 'like'
  | 'curious'
  | 'unsure'
  | 'not_interested'
  | 'hard_limit'
  | 'not_applicable';
~~~

Conceptually:

~~~ts
interface ContextualActivityPreference {
  catalogId: CatalogId;
  context: ActivityContextKey;
  state: ContextualPreferenceState;
  note?: string;
  updatedAt: string;
}
~~~

Exact storage may use sparse nested maps rather than a flat array.

---

# Sparse overlay rule

M15 must not pre-create six preference records for every catalog item.

Default:

~~~text
General: Love

Dom + Give:        unknown
Dom + Receive:     unknown
Sub + Give:        unknown
Sub + Receive:     unknown
Neutral + Give:    unknown
Neutral + Receive: unknown
~~~

Only contexts the user explicitly explores or edits become authoritative M15 records.

This is the primary defense against exponential storage/UI noise.

---

# Unknown does not inherit general preference

An unset contextual cell means:

> **not explored in this context**

It does not silently mean:

> same as general

General preference may be shown as useful surrounding context or used as bounded proposal input, but it must not masquerade as direct contextual evidence.

Example:

~~~text
General: Love
Sub + Give: unset
~~~

The UI may say:

> Generally Love · contextual preference not explored

It may not claim Sub + Give = Love unless the user supplied that information.

---

# Boundary precedence

## Global Hard Limit

A current M6 general Hard Limit blocks automatic use in all M15 contexts.

M15 must not create an implicit exception to a global boundary.

If the user later decides only one specific context is a Hard Limit, the correct flow is:

1. change the global M6 state;
2. set the specific M15 contextual Hard Limit(s).

## Contextual Hard Limit

A contextual Hard Limit applies only to its exact context key.

~~~text
Receiving impact generally: liked

Dom + Receive: Hard Limit
Sub + Receive: Love
~~~

Current contextual consumers must respect the specific Hard Limit.

## Contextual Not Applicable

Contextual Not Applicable may mean:

- I do not inhabit a Dominant context for this
- this side of the activity does not make sense for me

It must not erase evidence in other contexts.

---

# Contextual refinement UX

The six-way model should not become the default catalog experience.

M6 general preference remains the low-friction primary layer.

M15 adds progressive refinement.

## Entry points

- item detail → Refine by context
- catalog filter → Contextual preferences
- profile → Explore Dominant context
- profile → Explore submissive context
- profile → Explore non-D/s context
- M13/M14 deep links into a relevant context

## Matrix view

For one directional item:

~~~text
Spanking
General: Love

               GIVE        RECEIVE
Dominant       Love        Like
submissive     Like        Love
No D/s         —           Curious

— = not explored
~~~

Each cell is independently editable.

## Focused context mode

The user must also be able to select one context globally:

~~~text
Viewing:
As submissive · Giving
~~~

and browse/rate many catalog items only through that lens.

This prevents having to interact with a six-cell matrix on every row.

---

# Contextual quick refinement

M15 may include a low-friction refinement flow similar to the M6 catalog sorter.

~~~text
As submissive · Giving

Spanking

How does this feel in this context?

[ Love ]
[ Like ]
[ Curious ]
[ Unsure ]
[ Not interested ]
[ Hard limit ]
[ Skip ]
~~~

The selected context remains fixed while cards change.

The user should never be asked to classify all six contexts for every item in one session.

---

# Contextual pairwise ranking

Contextual preference and contextual rank answer different questions.

~~~text
Sub + Give

Spanking: Love
Restraint: Love

Relative rank:
1. Restraint
2. Spanking
~~~

M15 therefore allows pairwise ranking within a selected ActivityContextKey.

## Ranking scope

~~~ts
interface ContextualCatalogRankingScope {
  domain: 'catalog_context';
  context: ActivityContextKey;
}
~~~

Potential scopes include:

- Dom + Give
- Dom + Receive
- Sub + Give
- Sub + Receive
- Non-D/s + Give
- Non-D/s + Receive

These are not six hard-coded engines.

They are one generic ranking engine parameterized by scope.

## Ranking eligibility

An item may enter a contextual ranking pool only when:

1. its capability supports the selected context;
2. it has direct positive contextual preference for that context;
3. no global/contextual exclusion blocks it.

Initial positive states:

- love
- like
- curious

Unsure may become optionally rankable only through a future explicit exploration mode.

Do not seed contextual rank from:

- M6 general rank
- M6 general preference strength
- M7 facet affinity
- M11 reward/punishment rank
- inferred contextual proposals

The user must create direct contextual pairwise evidence.

---

# Contextual ranking history and M12

M12 defines temporal ranking runs.

M15 must extend that model by scope, not fork it.

A generic ranking-run scope should be capable of distinguishing:

~~~text
catalog:general
catalog:dominant:giving
catalog:dominant:receiving
catalog:submissive:giving
catalog:submissive:receiving
catalog:non_ds:giving
catalog:non_ds:receiving
~~~

If M11 contextual rankings also exist, the same scope model can extend further:

~~~text
reward:general
reward:submissive:receiving
punishment:dominant:giving
~~~

M15 does not duplicate M12's run/history UI.

Historical comparison is always like-for-like:

> Sub + Give current rank vs previous Sub + Give rank

Never:

> Sub + Give current rank vs general rank

---

# Contextual profile aggregation

M15 derives contextual profile views without rewriting M7's overall profile.

## General profile remains general

M7 continues to answer:

> What does the profile look like overall?

M15 adds lenses such as:

- As Dominant
- As submissive
- Outside D/s

and within them:

- Giving
- Receiving
- a combined known-context summary where appropriate

## No feedback into M7 authority orientation

Contextual activity evidence must never vote on D/s orientation.

Examples:

- many Sub + Give preferences do not create Dominant evidence
- many Dom + Receive preferences do not create submissive evidence

The authority context was explicitly selected by the user. It is not inferred from the side.

## Contextual category summary

~~~text
AS SUBMISSIVE · GIVING

Strongest contextual areas
1. Service
2. Impact
3. Restraint
4. Care
~~~

Only direct M15 contextual evidence contributes to contextual category affinity.

General M6/M7 evidence may help order Suggestions to explore, but not direct contextual affinity.

## Contextual radar

A future contextual radar may reuse broad M7 facets where mappings are semantically valid.

If implemented:

- keep context clearly labeled
- preserve unknown
- keep coverage separate from affinity
- do not compare sparse contextual views as if equally evidenced
- do not write contextual radar results back into M7

---

# Contextual inference / proposals

The app should not require explicit answers for every context before becoming useful.

M15 may derive proposals such as:

> You generally like restraint, and your Sub + Receive profile strongly supports surrender/constraint. This may be worth exploring in Sub + Receive.

Proposal inputs may include:

- M6 general preference/rank
- M7 canonical signals/facets
- direct M15 contextual category patterns
- similar confirmed M15 context items
- item context mappings

But proposals remain derived.

They must never:

- become direct contextual state automatically
- enter contextual pairwise ranking automatically
- override global/contextual exclusions
- feed themselves back into contextual category affinity

Accepting a proposal creates explicit contextual evidence.

---

# Motivation / reason annotations

Authority context and activity side still do not fully explain why a combination works.

Example:

~~~text
Submissive + Giving restraint
~~~

could mean:

- instructed service
- delegated responsibility
- caretaking
- protocol
- sensation/play
- playful role reversal

M15 should support optional motivation annotations without making them mandatory.

Initial vocabulary may include:

~~~ts
type ActivityMotivation =
  | 'instructed'
  | 'service'
  | 'delegated_responsibility'
  | 'rule_setting'
  | 'caretaking'
  | 'sensation_play'
  | 'ritual_protocol'
  | 'primal_play'
  | 'connection'
  | 'other';
~~~

These are user-selected annotations or derived suggestions that require confirmation.

They are not authority evidence.

~~~text
Sub + Give · Restraint
Preference: Love
Why it works:
  ✓ instructed
  ✓ service
  ✓ caretaking
~~~

This explicitly captures the semantic cases the current authority/activity separation doc deliberately refuses to infer.

---

# Relationship to roles/headspaces

Roles/headspaces remain a separate dimension.

Do not automatically map:

- Pet → submissive
- Prey → submissive
- Predator → Dominant
- Caregiver → Dominant
- Trainer → Dominant

A future compound session state may look like:

~~~text
Authority context: submissive
Activity side: giving
Headspace: Pet
Dynamic mode: Service
~~~

But M15 stored authority/activity preference remains valid without requiring a headspace.

---

# M11 Rewards & Punishments integration

M11 asks separate questions:

- Does this work as a reward?
- Does this work as a punishment?
- How does it rank among rewards?
- How does it rank among punishments?

M15 adds the possibility that those answers also vary by ActivityContextKey.

~~~text
Spanking

General M11
Reward: Strong
Punishment: Strong

Sub + Receive
Reward: Strong
Punishment: Works

Dom + Receive
Reward: Works
Punishment: No
~~~

## Sparse contextual M11 overlays

Do not multiply every reward/punishment record by six.

M11 general suitability remains the broad answer.

M15 may add optional context-specific M11 overlays only when explored.

~~~ts
interface ContextualRewardPunishmentOverlay {
  ref: RewardPunishmentPrimitiveRef;
  context: ActivityContextKey;
  reward?: ContextualUseState;
  punishment?: ContextualUseState;
}
~~~

If broad M11 says Strong reward while Sub + Receive reward is unset, the exact context remains unknown.

The broad state may support a suggestion; it does not become direct M15 evidence.

## Contextual reward/punishment ranking

If enough direct context-specific M11 evidence exists, pairwise ranking may also be scoped by:

~~~text
Reward · Sub + Receive
Punishment · Dom + Give
~~~

Again: one generic compound ranking-scope model, not bespoke engines.

This is intentionally lazy/on-demand.

---

# M13 Scene Builder integration

M13 is one of the strongest consumers of M15.

Current-session intent may include:

~~~text
Authority context: submissive
Activity side: receiving
Themes: Pain + Deeper Submission
~~~

M13 can prefer:

1. direct positive M15 evidence in that exact context;
2. direct general M6 evidence when exact context is unknown, clearly qualified;
3. M15 inferred context suggestions only under an explicit exploration path.

## Exact-context preference wins

~~~text
General restraint: Love
Sub + Receive restraint: Hard Limit
~~~

A Sub + Receive scene must exclude it automatically.

A Dom + Receive Love value has no bearing on that Sub + Receive scene.

Choosing Tonight: submissive + giving is current-session intent. It does not rewrite durable M15 preference.

---

# M14 Shared Profiles integration

M14 currently defines complementary activity mappings such as:

- giving pain ↔ receiving pain
- giving restraint ↔ receiving restraint

M15 enriches comparison by preserving each person's authority context independently.

~~~text
Profile A
Sub + Give impact: Love

Profile B
Dom + Receive impact: Love
~~~

This is a valid complementary match.

It must not be rejected merely because it violates a stereotyped Dom-gives/Sub-receives assumption.

Likewise:

~~~text
Profile A
Dom + Receive restraint: Love

Profile B
Sub + Give restraint: Love
~~~

may be a valid shared fit.

## Shared comparison rule

M14 should compare:

1. Profile A selected/known authority context
2. Profile A activity side
3. Profile B selected/known authority context
4. Profile B complementary activity side
5. both people's explicit exclusions
6. headspace/motivation only when explicitly available

Never infer either person's authority from the physical complement.

---

# Context compatibility is not consent

M15/M14 may identify:

> these contextual preferences appear complementary

That does not mean:

- consent is granted
- the activity is approved tonight
- the roles are fixed
- the shared context is desired now

M13 current-session state and actual interpersonal communication remain separate.

---

# Storage model

M15 adds one authoritative sparse profile domain.

~~~ts
interface ContextualCatalogProfileState {
  schemaVersion: number;
  preferences: Partial<
    Record<
      CatalogId,
      Partial<Record<SerializedActivityContextKey, ContextualPreferenceRecord>>
    >
  >;
  comparisons: ContextualCatalogComparison[];
  motivations?: Partial<
    Record<
      CatalogId,
      Partial<Record<SerializedActivityContextKey, ActivityMotivation[]>>
    >
  >;
}
~~~

Requirements:

- stable Catalog IDs
- stable context keys
- sparse records only
- context comparisons distinct from M6 general comparisons
- no derived aggregate persisted as authoritative
- explicit migration/versioning

---

# Full profile backup/import

M9 backup/import must eventually include authoritative M15 state:

- contextual explicit preferences
- contextual pairwise comparisons
- contextual ranking-run/history data when M12 is integrated
- motivation annotations
- schema versions

Derived contextual summaries/inference remain recomputable.

---

# Selective reset

M9 should eventually gain an independent reset scope:

> Contextual Activity Profiles

Resetting it removes:

- M15 contextual explicit preferences
- M15 contextual pairwise history
- M15 motivation annotations
- M15 contextual ranking history

It preserves:

- M6 general catalog preference
- M6 general This-or-That
- quizzes
- M7 derived profile
- M11 broad reward/punishment state
- M13 saved scenes unless separately reset
- other profiles in M14 unless selected

---

# Share/export presentation

M15 contextual data can be highly personal and verbose.

Do not automatically add the full six-context matrix to the default M9 share summary.

A future explicit contextual-share mode may allow selected views such as:

- As Dominant
- As submissive
- Non-D/s
- one chosen context only

---

# UX scaling principles

The data model may be exponential.

The user experience must not be.

## Never show everything at once by default

Avoid:

- six columns across every catalog table row
- six ranking panels on one screen
- six radars on one page
- six required answers per item
- six reward rankings per item
- giant cross-product dashboards

Prefer:

- one chosen context lens
- progressive disclosure
- context tabs/chips
- focused refinement runs
- contextual shortcuts from other features
- sparse not-explored state

## Reusable context picker

~~~text
Authority
[ Dominant ] [ submissive ] [ No D/s ]

Activity side
[ Giving ] [ Receiving ]
~~~

Item capability metadata can hide unsupported choices.

The same picker can later be reused in:

- catalog refinement
- contextual ranking
- M11 reward/punishment views
- M13 scene intent
- M14 shared comparison filtering

---

# Cross-context compare view

For one selected item:

~~~text
Spanking

                    Give       Receive
Dominant            Love       Like
submissive          Love       Love
No D/s              Like       Curious
~~~

This view is useful precisely because the values are independent.

It must not collapse them into Spanking = 87%. M6 general preference already owns the broad answer.

---

# Contextual profile examples

## Example 1 — submissive activity-giving is strong

~~~text
As submissive · Giving

Top contextual interests
1. Restraint
2. Impact
3. Service
4. Accountability
~~~

The profile may explain:

> Strong giving-side activity preferences while in a submissive context.

It must not say:

> Dominant tendencies detected.

## Example 2 — Dominant receiving is strong

~~~text
As Dominant · Receiving

Top contextual interests
1. Pain
2. Restraint
3. Sensory play
~~~

Receiving activity side does not create submissive inference.

## Example 3 — context changes a boundary

~~~text
Restraint

General: Like
Dom + Receive: Love
Sub + Receive: Hard Limit
~~~

M13/M14 exact-context consumers must respect the contextual Hard Limit.

---

# Implementation slices

## M15.1 — Context taxonomy + capability metadata

**Purpose:** define one canonical authority/activity context model before any UI multiplies it inconsistently.

- [ ] define stable AuthorityContext values
- [ ] define stable ActivitySide values
- [ ] define stable serialization for ActivityContextKey
- [ ] define/version per-catalog context capability metadata
- [ ] add item-specific giving/receiving labels where needed
- [ ] support directional and undirected items
- [ ] keep roles/headspaces outside this taxonomy
- [ ] add validation tests for impossible/unsupported context keys

**Exit condition:** one reusable context vocabulary exists and the app knows which contexts each catalog item can meaningfully support.

---

## M15.2 — Sparse contextual preference storage

**Purpose:** add explicit contextual truth without multiplying the general catalog model.

- [ ] add versioned M15 local storage
- [ ] store contextual records sparsely by CatalogId + ActivityContextKey
- [ ] reuse M6 preference-state semantics
- [ ] preserve contextual unknown instead of inheriting general preference
- [ ] enforce global Hard Limit precedence
- [ ] support contextual Hard Limit / Not Applicable
- [ ] preserve M6 general preference unchanged
- [ ] add source-isolation/migration tests

**Exit condition:** one activity can safely have different explicit states in different contexts without changing its general preference.

---

## M15.3 — Contextual catalog refinement UX

**Purpose:** make the matrix usable without showing six copies of the catalog.

- [ ] add reusable context picker
- [ ] add item-detail matrix view
- [ ] add focused catalog context mode
- [ ] add card-based contextual quick refinement
- [ ] show general M6 state as surrounding context, not inherited answer
- [ ] expose not-explored state clearly
- [ ] hide unsupported context cells
- [ ] deep-link to a selected context
- [ ] add mobile/keyboard/accessibility behavior

**Exit condition:** the user can refine one context at a time and compare contexts for one item without confronting the whole cross-product.

---

## M15.4 — Contextual pairwise ranking + M12 compatibility

**Purpose:** rank direct positive contextual preferences independently for each context.

- [ ] define context-scoped raw comparison records
- [ ] reuse generic ranking utilities where useful
- [ ] never reuse M6 general score/history as contextual rank evidence
- [ ] require direct contextual eligibility
- [ ] support adaptive pair selection/confidence
- [ ] expose one selected context ranked list at a time
- [ ] make ranking scopes compatible with M12 run/history semantics
- [ ] compare historical movement only within identical context scope
- [ ] add deterministic context-isolation tests

**Exit condition:** Sub + Give, Sub + Receive, Dom + Give, etc. can each produce independent rankings without six bespoke ranking implementations.

---

## M15.5 — Contextual profile aggregation + exploration

**Purpose:** turn item-level contextual evidence into useful profile lenses.

- [ ] derive contextual category summaries from direct M15 evidence only
- [ ] keep affinity separate from evidence breadth
- [ ] add As Dominant / As submissive / Non-D/s profile lenses
- [ ] add Giving / Receiving sub-lenses where supported
- [ ] preserve unknown as unknown
- [ ] optionally derive contextual radar/facet views from valid mappings
- [ ] never feed contextual activity evidence into D/s authority orientation
- [ ] add context-specific Top Interests using direct contextual evidence
- [ ] add sparse/full/conflicting-context tests

**Exit condition:** the user can see meaningful what-I-like-in-this-context profiles without changing M7.

---

## M15.6 — Motivation / reason annotations

**Purpose:** capture why counter-stereotypical or context-dependent combinations work without guessing.

- [ ] define/version optional ActivityMotivation vocabulary
- [ ] allow multiple motivations per item/context
- [ ] support instructed/service/delegated responsibility/rule-setting/caretaking/sensation/ritual/etc.
- [ ] keep motivation optional
- [ ] never infer authority from motivation
- [ ] allow profile-backed suggestions that require confirmation
- [ ] expose motivation in explainability
- [ ] add persistence tests

**Exit condition:** a user can explicitly explain Sub + Give or Dom + Receive without the app assigning a stereotyped mindset.

---

## M15.7 — M11 Rewards & Punishments contextual integration

**Purpose:** let reward/punishment meaning vary by the same activity context without multiplying M11 eagerly.

- [ ] preserve broad M11 reward/punishment suitability as its own answer
- [ ] add optional sparse M11 overlays keyed by ActivityContextKey
- [ ] keep broad M11 state from masquerading as direct context-specific evidence
- [ ] enforce global/contextual boundaries
- [ ] allow context-scoped Reward/Punishment ranking when enough direct evidence exists
- [ ] use generic compound ranking scopes rather than bespoke engines
- [ ] keep inference/no-feedback rules intact
- [ ] update M11 presentation only where context is selected

**Exit condition:** reward/punishment use can differ across authority/activity contexts without forcing six copies of every M11 record.

---

## M15.8 — M13 Scene Builder integration

**Purpose:** let scene intent query exact contextual preferences.

- [ ] let M13 current-session intent select AuthorityContext + ActivitySide
- [ ] prioritize exact positive M15 evidence
- [ ] enforce exact-context Hard Limits/Not Interested
- [ ] qualify general-only evidence when contextual evidence is unknown
- [ ] keep inference-only items out of automatic randomization unless explicitly approved
- [ ] keep current-session context separate from durable M15 preference
- [ ] add context-aware scene-candidate tests

**Exit condition:** M13 can build a submissive + giving scene without assuming giving means Dominant.

---

## M15.9 — M14 Shared Profile contextual complementarity

**Purpose:** compare physical complement and authority context independently across two people.

- [ ] extend shared matching to consume each profile's M15 context independently
- [ ] support counter-stereotypical complements such as Sub + Give ↔ Dom + Receive
- [ ] preserve activity-side complement mappings
- [ ] never derive authority from side matching
- [ ] enforce both profiles' contextual/global exclusions
- [ ] distinguish exact contextual fit from general-only possible fit
- [ ] let shared M13 filtering use both profiles' selected context
- [ ] add deterministic complementary-context tests

**Exit condition:** shared matching reflects what each person actually likes in-role instead of relying on Dom-gives/Sub-receives assumptions.

---

## M15.10 — Lifecycle, exports, reset + polish

**Purpose:** make M15 durable without bloating default profile management/sharing.

- [ ] include authoritative M15 state in full private backup/import
- [ ] integrate context ranking history with M12 when available
- [ ] add independent Contextual Activity Profiles reset scope
- [ ] keep unrelated M6/M11/M13/M14 state intact on reset
- [ ] keep full contextual matrix out of default share summary
- [ ] optionally support selected-context share output later
- [ ] regression-run M6/M7/M9/M11/M12/M13/M14 boundaries as available
- [ ] finalize docs and mark M15 complete

**Exit condition:** contextual data is portable, resettable, source-isolated, and available downstream without turning the app into an unreadable cross-product.

---

# Acceptance scenarios

## Submissive + giving does not imply Dominant

Given:

~~~text
Authority context: submissive
Activity side: giving
Restraint: Love
Impact: Love
~~~

then:

- preferences appear in Sub + Give views
- they may rank highly in Sub + Give
- they may be used by an M13 Sub + Give scene
- they do not increase Dominant orientation
- they do not move general M6 preference unless independently edited

## Dominant + receiving does not imply submissive

Given:

~~~text
Dom + Receive pain: Love
Dom + Receive restraint: Like
~~~

then receiving activity side does not create submissive authority evidence.

## Context-specific boundary wins

Given:

~~~text
General restraint: Love
Sub + Receive restraint: Hard Limit
Dom + Receive restraint: Love
~~~

then:

- a Sub + Receive scene excludes restraint
- a Dom + Receive scene may include restraint
- general profile remains Love
- neither contextual value overwrites the other

## Unknown does not become inherited truth

Given:

~~~text
General spanking: Love
Sub + Give spanking: unset
~~~

then:

- Sub + Give remains not explored
- general Love may support a suggestion
- the app does not claim Sub + Give = Love

## Shared counter-stereotypical complement

Given:

~~~text
Profile A: Sub + Give impact = Love
Profile B: Dom + Receive impact = Love
~~~

M14 may derive a strong complementary activity fit without relabeling either person's authority.

## M11 context changes

Given:

~~~text
General M11 spanking punishment: Strong
Sub + Receive punishment: Works
Dom + Receive punishment: No
~~~

context-specific M11 consumers respect the selected context while broad M11 remains independent.

---

# Non-goals

M15 does not:

- require every user to explore all six contexts
- require all six contexts for every catalog item
- assign Dominant/submissive context from activity side
- classify Pet/Prey/Caregiver/etc. as D/s authority
- replace M6 general preference
- replace M7 overall profile
- collapse six contextual values into one new truth
- infer consent
- assume a shared partner role
- create six literal catalog duplicates
- create six hard-coded ranking engines
- create six copies of M11
- create a full behavior/assignment system
- require cloud persistence

---

# Important semantic boundaries

M15 preserves these independent questions:

~~~text
GENERAL PREFERENCE
Do I like this activity overall?

AUTHORITY CONTEXT
Am I considering it while Dominant, submissive, or outside D/s?

ACTIVITY SIDE
Am I giving/doing it or receiving/experiencing it?

CONTEXTUAL PREFERENCE
How do I feel about this exact authority × activity combination?

CONTEXTUAL RANK
Among things I like in this exact context, which rise to the top?

MOTIVATION
Why does this combination work for me?

REWARD/PUNISHMENT USE
Does this work as a reward or punishment, broadly or in this context?

CURRENT-SESSION INTENT
Is this the context I want right now?

SHARED COMPLEMENT
Does another profile have a compatible side/context?
~~~

No one answer should silently determine another.

That separation is the M15 contract.
