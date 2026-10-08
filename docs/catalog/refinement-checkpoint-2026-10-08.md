# Catalog refinement checkpoint — 2026-10-08

Status: **discussion-approved decisions; not yet implemented in canonical catalog**.

This document captures the decisions confirmed in the October 8 refinement session. Earlier batches (1–16) should be reconciled against their prior discussion notes before implementation; do not treat them as verified or complete based on this checkpoint alone.

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

## Next steps / implementation checklist
- [ ] Reconcile earlier batches 1–16 from original decisions and record their status.
- [ ] Identify the canonical catalog source(s) and modifier schema in the app, rather than editing only the legacy reference TSV.
- [ ] Implement approved changes in a separate scoped implementation PR.
- [ ] Check duplicate IDs, migration/compatibility, and catalog UI rendering.
- [ ] Validate tests/build and review category placement of Cockwarming.
- [ ] Continue Batch 19 refinement.

Reference: `reference/catalog/kink-catalog.tsv` is the original catalog reference and should not be mistaken for the approved updated taxonomy.
