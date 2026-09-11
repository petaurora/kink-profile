# Authority, Activity Side & Role Semantics

This contract prevents several related concepts from being collapsed into one another.

```text
authority orientation      Signal/activity perspective      role / headspace
---------------------      ---------------------------      -----------------------
submissive / dominant      overall / receiving / giving     Pet / Prey / Caregiver / etc.
```

They can correlate for some people, but they are not the same semantic dimension.

See [Roles, Headspaces & Dynamic Modes](data-model/roles-headspaces-modes.md) for the current composed taxonomy.

## 1. Authority orientation

Authority orientation answers:

> **Who holds negotiated authority or direction in the dynamic?**

The aggregate profile may describe patterns such as:

- Submissive;
- Dominant;
- Dominant + submissive;
- context-dependent;
- still emerging.

Authority must come from evidence that actually measures authority.

It must **not** be inferred merely because a person likes doing or receiving a particular physical activity.

Examples:

- administering impact does not prove Dominant orientation;
- receiving impact does not prove submissive orientation;
- applying restraint does not prove Dominant orientation;
- being restrained does not prove submissive orientation;
- holding responsibility can be delegated, service-oriented, caretaking, practical, or authority-holding depending on context.

Catalog preference/ranking evidence does not automatically assign Dominant/submissive orientation. Liking an activity cannot reveal why it appeals, under whose authority it occurs, or what relational context gives it meaning.

## 2. Signal/activity perspective

The canonical profile models reusable semantic concepts as **Signal + channel**.

Channels are:

```text
overall
receiving
giving
```

A channel answers which supported perspective of the Signal concept the evidence describes.

Examples:

| Signal | Receiving perspective | Giving perspective |
| --- | --- | --- |
| Pain | receiving pain | causing pain |
| Restraint | being restrained | restraining someone |
| Positioning | being positioned | positioning someone |
| Discipline | receiving discipline | giving discipline |
| Care | being cared for | caring for someone |
| Pursuit | being pursued | pursuing |

Not every Signal supports directional channels. Concepts such as Role Embodiment can remain Overall-only.

See [Signal + Channel Data Model](data-model/signal-channel-model.md).

### Channel is not authority

The words `receiving` and `giving` describe the perspective of the semantic concept. They are not aliases for:

- submissive / Dominant;
- bottom / top identity;
- weak / strong;
- passive / active personality;
- authority receiver / authority holder.

Examples:

- a submissive person can give pain as instructed service;
- a submissive person can apply restraints under direction;
- a submissive person can administer accountability under delegated responsibility;
- a Dominant person can receive pain or restraint;
- a Caregiver role does not automatically imply dominance;
- Predator / Prey does not automatically map to Dominant / submissive.

## 3. Roles / headspaces

Roles/headspaces answer:

> **What recognizable relational or internal role/state resonates with the available evidence?**

Current peer roles/headspaces are:

- Pet;
- Slave;
- Little;
- Middle;
- Brat;
- Prey;
- Object;
- Owner / Handler;
- Caregiver;
- Brat Tamer;
- Predator;
- Master / Mistress.

Role/headspace scores are independent overlapping compositions. They do not need to be mutually exclusive or sum to 100%.

Their normalized definitions may reference canonical Signal channels when that channel genuinely helps define the role.

That does not make the channel itself an authority label.

Examples:

- Prey may use Pursuit · Receiving without therefore meaning submissive;
- Predator may use Pursuit · Giving without therefore meaning Dominant;
- Caregiver may use Care · Giving without therefore meaning Dominant;
- Pet may use Care · Receiving without therefore meaning submissive.

Some **role names themselves** explicitly contain authority semantics, such as Master / Mistress. In those cases, the authority meaning comes from the role definition/name, not from a generic Receiving/Giving channel.

Historical labels such as Service Submissive, Devotional Submissive, and Trainer are not current peer role/headspace results. See the taxonomy contract for current replacements/boundaries.

## 4. Dynamic Modes

Dynamic Modes are composed explanatory lenses such as patterns around:

- Devotion;
- Protocol;
- Service;
- Structure;
- Care;
- Playful Challenge;
- Objectification;
- Primal / Feral;
- Power Exchange;
- Intensity.

They are not authority orientation and are not another top-level evidence source.

Dynamic Modes are direction-neutral peer outputs. Giving/Receiving nuance remains in the underlying Signal channels rather than creating separate Giving/Receiving modes.

The hierarchy is:

```text
independent evidence
      ↓
canonical Signal + channel
      ↓
roles/headspaces and Dynamic Modes
```

A composed mode may help explain *why* several roles or activities cluster together. It does not retroactively become direct evidence.

## 5. Overall Facets

Overall Facets are broad, non-directional themes such as Power Exchange, Care & Nurture, Restraint & Physical Control, and Intensity & Pain.

A facet can intentionally consume a directional Signal channel, but the facet itself remains a thematic compression rather than a Receiving/Giving axis.

For example, Service & Devotion may include Care · Giving as one component while still remaining a broad theme.

Do not create `Dominant Power Exchange` / `submissive Power Exchange` facets merely to preserve activity-side information. Directional nuance belongs in canonical Signal references and explicit contextual models.

## 6. Presentation grouping is not taxonomy

A quiz or screen may group results to keep a visualization readable.

Presentation grouping must not silently create a semantic rule such as:

```text
left chart = submissive
right chart = Dominant
```

unless those categories are explicitly what the underlying model measures.

The current self-positioned / partner-positioned role groups are presentation organization, not authority buckets.

Likewise, a Receiving/Giving radar may visualize activity perspective without asserting authority identity.

## 7. Catalog activity direction is not authority

Catalog items may use activity direction:

```text
receiving
giving
both
```

and catalog mapping rules may use `Applies To` with the same activity-side vocabulary.

That metadata answers how an activity is performed/experienced. It does not establish who holds negotiated authority.

See [Kink Catalog](product/kink-catalog.md).

## 8. Context-specific preference

The current general profile can preserve authority and activity-side semantics without claiming to know every combination of them.

A future/contextual model may explicitly ask questions such as:

```text
How do I feel about giving this activity while in a submissive context?
How do I feel about receiving it while in a Dominant context?
```

That work is tracked in GitHub Issue #113 rather than inferred from current activity-side evidence.

Until a context is explicitly measured, preserve uncertainty.

Do not infer motivation such as service, delegated responsibility, rule-setting, caretaking, sensation play, or authority merely from which physical side of an activity the user prefers.

## Invariants

1. **Authority orientation requires authority-relevant evidence.**
2. **Receiving/Giving Signal channels describe concept perspective, not authority identity.**
3. **Catalog activity direction is not authority identity.**
4. **Roles/headspaces are derived overlapping states, not aliases for channel direction.**
5. **Dynamic Modes are derived direction-neutral explanatory lenses, not direct evidence.**
6. **Overall Facets are broad themes and remain non-directional.**
7. **A user can coherently be submissive + giving or Dominant + receiving.**
8. **A role that carries explicit authority meaning gets that meaning from the role definition, not from generic activity direction.**
9. **Presentation grouping does not create taxonomy or authority semantics.**
10. **Unknown context remains unknown until measured; the system must not fill semantic gaps with stereotypes.**
