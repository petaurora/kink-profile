# Catalog refinement checkpoint — 2026-10-08

Status: **discussion-approved decisions; not yet implemented in canonical catalog**.

This document captures the decisions confirmed in the October 8 refinement session. Batches 1–16 were already reviewed and recorded in GitHub issues #256–#271 and summarized in parent issue #255. Batch 7 (#262) was deliberately deferred until core catalog migration is complete. These issue records are the existing decision history; do not repeat the review.

## Working principles
- One catalog item plus at most one modifier level.
- Prefer shared `Role: Giving / Receiving / Self` where meaningful.
- No role modifier for inherently mutual activities or where role does not add useful information.
- Distinguish activities/interests from permission rules, protocols, and scene configuration.
- Avoid duplicate entries where a modifier already captures the concept.

## Batch 17 — Orgasm & Arousal Control (approved)
| Item | Modifier / decision |
| --- | --- |
| Orgasm Control | Direction: Controlling / Being Controlled; Method: Permission Required / Denial / Countdown / Release Cue |
| Edging | Role: Giving / Receiving / Self |
| Ruined Orgasm | Role: Giving / Receiving / Self |
| Forced Orgasm | Role: Giving / Receiving |
| Multiple / Repeated Orgasm | Role: Giving / Receiving / Self |
| Overstimulation (sexual) | Role: Giving / Receiving / Self |
| Chastity | Material: Metal / Plastic / Silicone / Other (shared material modifier); no Device/Honor System |
| Post-Orgasm Stimulation | Role: Giving / Receiving / Self |

- Remove Self-Touch Restriction / No-Touch Restriction from the activity catalog. Defer to Rules / Protocols / Contract Builder → Decision / Permission Control → Sexual Permission → Self-Touch Permission (alongside Orgasm Permission).
- Tease and Denial is a composite, not a standalone catalog item.
- Begging / Teasing belong with psychological, verbal, or emotional interests.
- JOI belongs with Sexual Activities & Techniques.
- Permission-required method is an interest facet; enforceable permission rules belong in the protocol builder.

## Batch 18 — Sexual Activities & Techniques (approved)
| Item | Modifier / decision |
| --- | --- |
| Anal Penetration | Role: Giving / Receiving / Self (replaces Anal Sex) |
| Vaginal Penetration | Role: Giving / Receiving / Self |
| Fellatio | Role: Giving / Receiving |
| Cunnilingus | Role: Giving / Receiving |
| Anilingus | Role: Giving / Receiving |
| Deep-Throating | Role: Giving / Receiving |
| Face-Sitting | Sitting / Being Sat On |
| 69 | None |
| Handjob | Role: Giving / Receiving / Self; distinct from fingering |
| Vaginal Fingering | Role: Giving / Receiving / Self |
| Anal Fingering | Role: Giving / Receiving / Self |
| Vaginal Fisting | Role: Giving / Receiving |
| Anal Fisting | Role: Giving / Receiving |
| Pegging | Role: Giving / Receiving; distinct from Strap-On Play |
| Strap-On Play | Role: Giving / Receiving |
| Mutual Masturbation | None |
| Double Penetration | Role: Giving / Receiving; no fixed toy/partner configuration |
| Tribadism / Scissoring | None |
| Intercrural / Thigh Sex | Role: Giving / Receiving |
| Frottage / Grinding | None |
| Dildo Play | Role: Giving / Receiving / Self |
| Plug | Role: Giving / Receiving / Self |
| Vibrator | Role: Giving / Receiving / Self |
| Sex Machine | Role: Giving / Receiving / Self |
| Sybian / Ride-On Vibrator | Role: Giving / Receiving / Self |
| Cock Ring | None |
| Cockwarming | None; remove 'Passive Penetration' synonym; consider Service & Devotion / Power Exchange placement |
| Hands-Free Orgasm | None; replaces Untouched Orgasm Fantasy |

- Remove standalone Coming on Command; covered by Orgasm Control → Release Cue.
- Remove Partner-Watched Masturbation and Magic-Wand Stimulation per earlier refinement decisions.
- Do not add anatomy/tool modifiers to Anal/Vaginal Penetration at this stage; fingering/fisting remain distinct techniques.

## Existing approved batch decision sources

The source of truth for completed reviews is the explicit approval/outcome sections in the following GitHub issues. Historical first-pass proposals within those issues must not override later approvals.

| Batch | Review slice | Decision issue | Review status |
| --- | --- | --- | --- |
| 1 | Bondage & Restraint | #256 | Approved |
| 2 | Collars, Gags & Restraint Equipment | #257 | Approved |
| 3 | Impact Play | #258 | Approved |
| 4 | Humiliation / Degradation / Objectification | #259 | Approved |
| 5 | Fantasy / Scenario / Roleplay | #260 | Approved |
| 6 | Praise | #261 | Approved |
| 7 | Rewards / Punishments / Discipline | #262 | Intentionally deferred |
| 8 | Power Exchange & Roles | #263 | Approved |
| 9 | Protocol / Obedience / Service | #264 | Approved |
| 10 | Endurance & Positioning | #265 | Approved |
| 11 | Primal Play | #266 | Approved |
| 12 | Exhibitionism & Voyeurism | #267 | Approved |
| 13 | Symbols & Marking | #268 | Approved |
| 14 | Sensory Play | #269 | Approved |
| 15 | Pain & Sensation | #270 | Approved |
| 16 | Electrical Specialty | #271 | Approved |
| 17 | Orgasm & Arousal Control | #272 | Approved 2026-10-08 |
| 18 | Sexual Activities & Techniques | #274 | Approved 2026-10-08 |

Parent decision history: #255. Migration must read these approved issue outcomes and map each source row; it must not re-run design review.

## Next steps / implementation checklist
- [x] Locate existing batch 1–16 decisions: GitHub issues #256–#271 and parent #255 (Batch 7 #262 deliberately deferred).
- [x] Index the approved decision sources for Batches 1–18, with Batch 7 intentionally deferred.
- [ ] Build the **row-by-row** V1/staged-source → V2 migration ledger from the approved outcomes; this is implementation preparation, not design re-review.
- [ ] Identify the canonical catalog source(s) and modifier schema in the app, rather than editing only the legacy reference TSV.
- [ ] Implement approved changes in a separate scoped implementation PR.
- [ ] Check duplicate IDs, migration/compatibility, and catalog UI rendering.
- [ ] Validate tests/build and review category placement of Cockwarming.
- [ ] Continue Batch 19 refinement.

Reference: `reference/catalog/kink-catalog.tsv` is the original catalog reference and should not be mistaken for the approved updated taxonomy.
