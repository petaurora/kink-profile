# Authority, Activity Side & Role Semantics

## Status

**Implemented semantic boundary.**

This contract prevents three different concepts from being collapsed into one another:

```text
authority orientation     activity side             role / headspace
---------------------     -----------------------   -----------------------
submissive / dominant     doing / experiencing      Pet / Prey / Caregiver
                          giving / receiving         Trainer / Little / etc.
```

They can correlate for some people, but they are not the same dimension.

---

# 1. Authority orientation

Authority orientation answers:

> **Who holds negotiated authority or direction in the dynamic?**

User-facing results may be:

- Submissive
- Dominant
- Dominant + submissive
- Context-dependent
- Still emerging

The current aggregate profile derives this from **authority-specific D/s quiz evidence** only.

Signals currently used:

### Submissive-side authority evidence

- `receiving_control`
- `responsibility_transfer`
- `obedience`

### Dominant-side authority evidence

- `giving_control`

`responsibility_holding` is deliberately **not** dominant-side authority evidence by itself.

Holding responsibility can be delegated, service-oriented, practical, caretaking, or situational.

Example:

> A Dominant tells a submissive partner that they are responsible for holding the Dominant accountable to an agreed rule.

The submissive partner is holding responsibility and may even administer a consequence, but that does not reverse the authority orientation.

Catalog preference/ranking evidence does not currently assign Dominant/Submissive orientation. Liking a kink is not enough to infer why, under whose authority, or from what relational mindset the user likes doing it.

---

# 2. Activity side

Activity side answers:

> **Which part of the activity is appealing to do or experience?**

Examples:

| Activity | One side | Other side |
| --- | --- | --- |
| Pain | experience pain | cause pain |
| Restraint | be restrained | apply restraint |
| Positioning | be positioned | position someone |
| Discipline | receive correction | administer correction |
| Care | receive care | provide care |
| Primal pursuit | be pursued | pursue |

The implementation may still use `receiving` / `giving` signal IDs because they are useful compact plumbing.

Those names describe **activity direction only**.

They must not be automatically translated into:

- submissive / dominant
- bottom / top identity
- weak / strong
- passive / active personality
- authority holder / authority receiver

Examples:

- a submissive person can give pain as instructed service
- a submissive person can apply restraints because their Dominant told them to
- a submissive person can administer discipline or accountability under delegated authority
- a dominant person can receive pain or restraint
- a Caregiver role does not automatically imply dominance
- Predator / Prey does not automatically map to Dominant / submissive

---

# 3. Role / headspace

Role/headspace answers:

> **What recognizable relational or internal role feels resonant?**

Examples:

- Pet
- Little
- Middle
- Brat
- Prey
- Predator
- Caregiver
- Trainer
- Owner / Handler
- Slave
- Service Submissive
- Master / Mistress

Role/headspace scores are independent overlapping compositions.

The aggregate profile ranks **all known headspaces together**. It does not first sort them into receiving/submissive vs giving/dominant buckets.

Some role names explicitly contain authority semantics, such as:

- Service Submissive
- Devotional Submissive
- Master / Mistress

Those names retain their explicit meaning because the role definition itself encodes it.

Other roles must not inherit a D/s orientation merely because their ingredients include an activity-side signal.

For example:

- Prey can involve `pursuit_receiving` without meaning submissive
- Predator can involve `pursuit_giving` without meaning dominant
- Caregiver can involve `care_giving` without meaning dominant
- Pet can involve receiving care without meaning submissive
- Trainer can involve guidance or correction without automatically meaning dominant

---

# M3 visualization grouping

The Roles & Headspaces quiz still uses two role/headspace radars so all 15 role labels do not have to fit on one chart.

Those are now presentation groupings:

1. **Self-positioned roles** — roles/headspaces primarily phrased as the state the user inhabits
2. **Partner-positioned roles** — roles primarily phrased as something enacted toward another person

These are **not authority buckets**.

They replace the old receiving/submissive vs giving/dominant labels without changing the underlying quiz answers or role composition math.

---

# M7 profile rule

The aggregate profile keeps the three layers separate:

```text
D/s authority quiz
      ↓
authority orientation
(Submissive / Dominant / both / etc.)

activity-specific signals
      ↓
facet side metadata
(pain, restraint, care, pursuit, etc.)

canonical signals
      ↓
roles / headspaces
(overlapping recognizable roles)
```

No activity-side result may vote on authority orientation.

No generic activity-side bucket may decide which headspaces are "submissive" or "dominant."

---

# Future extension

A later model may capture **motivation / authority context** for an individual activity, for example:

- because I was instructed to
- as service
- because I hold delegated responsibility
- because I am setting the rule
- for caretaking
- for sensation/play without power exchange

That context is not currently represented well enough to infer it automatically.

Until it is explicitly measured, the app must preserve uncertainty rather than assigning a mindset from the physical side of a kink.
