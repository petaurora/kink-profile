# Issue #117 — Bondage & Discipline quiz review

Working review notes for `src/data/bondageDisciplineQuiz.ts`. These are recommendations for discussion, not yet scoring changes.

## Keep

- **bd-001** — “Being physically restrained by someone I trust can feel appealing even when pain is not part of the experience.”
- **bd-002** — “Having several parts of my movement restricted at once can make restraint feel more immersive.”
- **bd-008** — “Waiting while I know restraint is about to happen can build appealing suspense.”
- **bd-009** — “Physically restricting a willing partner's movement can be appealing to me.”
- **bd-013** — “Part of the appeal of restraining someone can be deciding how much physical freedom they have within agreed limits.”
- **bd-014** — “I can enjoy a willing partner testing or struggling against agreed restraint because it makes containment more interactive.”
- **bd-015** — “A rule feels more meaningful to me when everyone involved knows what happens if it is not followed.”
- **bd-016** — “Being held to an agreed consequence can feel grounding or meaningful even when the consequence is not painful.”
- **bd-017** — “Clear correction from a trusted partner can feel satisfying when it restores an agreed expectation.”
- **bd-019** — “Administering an agreed consequence can be appealing because it gives an expectation real follow-through.”
- **bd-021** — “Choosing a consequence that fits the broken expectation can be more satisfying than simply making it harsh.”
- **bd-022** — “Standing rules that shape behavior beyond a single scene can deepen a dynamic for me.”
- **bd-023** — “Formal procedures or rituals around permission, beginning, ending, or transitions can make a dynamic feel more intentional.”

## Replace / merge

- **bd-005** — “Part of the appeal of restraint can be knowing that someone else is deciding how much physical freedom I have.”
  - Replace with: **“Part of the appeal of restraint can be surrendering control of my movement to someone I trust.”**
  - This folds the proposed vulnerability / surrender and release-of-control questions into one stronger item instead of adding both.

- **New giving responsibility question**
  - Use one merged item instead of two: **“Being trusted with the responsibility for a restrained partner’s safety and physical freedom can make restraint especially meaningful to me.”**
  - Keep separate from bd-013: bd-013 measures the appeal of deciding freedom; this measures trust / responsibility while holding that control.

- **bd-006** — “Pulling against or testing agreed restraint can add something enjoyable to the experience for me.”
- **bd-007** — “The possibility of trying to get free, even when I may not succeed, can make restraint more exciting.”
  - Merge unless `struggling/testing` and `escape challenge` become separate signals.

- **bd-018** — “A non-painful corrective task or consequence can still feel strongly like discipline to me.”
  - Remove; overlaps bd-016/017 and repeats the non-pain distinction.

- **bd-020** — “Correcting a willing partner toward a shared expectation can feel meaningful even when pain is not involved.”
  - Remove or substantially rewrite; overlaps bd-019 and its `guidance_shaping` weight is stronger than the wording supports.

## Add

- **Receiving — sensory / communication restriction:** “Having some of my sensory awareness deliberately limited—such as not being able to see, hear, or speak clearly—can make an experience more appealing.”
  - This captures a distinct form of restriction not covered by movement restraint.

Net effect of the new restraint recommendations: **+2 questions overall**, not +5 — one merged replacement for bd-005, one new giving responsibility item, and one new sensory / communication restriction item.

## Rewrite

- **bd-024** — “Knowing in advance that restraint, correction, or a formal ritual is coming can be part of the appeal.”
  - Bundles three distinct experiences. Prefer a discipline-specific anticipation item, e.g. “Knowing in advance that a consequence or correction is coming can build appealing anticipation.”

## Keep, but review model / weights

- **bd-003** — “Being required to stay in a specific position until I am released can be appealing.”
- **bd-004** — “Being deliberately arranged into a posture by a trusted partner can make the sense of control more tangible.”
  - **Decision:** keep both. They measure distinct experiences under the shared `positioning` concept: maintaining a required position vs being physically arranged/posed.
  - Keep `positioning` as the primary canonical signal for both rather than introducing new directional signal IDs.
  - Differentiate with the **Receiving** channel plus secondary weights: bd-003 should lean toward `obedience` / `structure`; bd-004 should lean toward `constraint_control` / `control`.

- **bd-010** — “Securing a willing partner so they cannot freely reposition can make restraint feel more complete.”
  - **Decision:** keep the question.
  - `movement_restriction` is currently canonical but nondirectional (`channels: {}`). Add **Receiving/Giving channel support** rather than creating `receiving_movement_restriction` / `giving_movement_restriction` signal IDs.
  - bd-002 should project to `movement_restriction · Receiving`; bd-010 should project to `movement_restriction · Giving`.
  - Preserve this distinction because activity-side preference can differ substantially and directional channels can be used intentionally by derived roles/headspaces without implying Dominant/submissive authority.

- **bd-011** — “Placing a willing partner in a specific position and expecting them to maintain it can be appealing.”
- **bd-012** — “Carefully arranging another person's posture or placement can be satisfying in its own right.”
  - **Decision:** keep both. They mirror the same maintain-vs-arrange distinction as bd-003/004 on the Giving side.
  - Both should primarily project to `positioning · Giving`.
  - bd-011 should retain secondary `constraint_control · Giving` plus a smaller `structure` contribution because it includes requiring the partner to maintain the position.
  - bd-012 should drop `guidance_shaping`; arranging someone’s body is not inherently teaching, coaching, correcting, or behaviorally shaping them. Keep it clean as essentially `positioning · Giving` unless later evidence supports a small `control · Giving` secondary weight.

- **bd-014** — “I can enjoy a willing partner testing or struggling against agreed restraint because it makes containment more interactive.”
  - **Decision:** keep the question.
  - Preserve `escape_containment · Giving`; this measures enjoying the containment side of an agreed struggle, distinct from enjoying escape/testing as the restrained person.
  - Migrate authored scoring away from legacy `challenge_escape` + per-question channel overrides so the modern Signal + channel relationship is explicit in the quiz mapping.

- **bd-025** — “Following an agreed sequence or protocol exactly can be satisfying because the form itself matters.”
- **bd-026** — “Creating a specific procedure or protocol for a willing partner can make structure feel more deliberate and meaningful.”
  - Good directional questions, but both currently collapse into nondirectional `ritual_significance` / `structure`. Decide whether that loss of directionality is intentional.

## Possible gaps surfaced by references

- **Vulnerability / psychological release from restraint** — folded into the proposed bd-005 replacement rather than added as separate overlapping questions.
- **Responsibility while restraining** — represented by the proposed merged giving-responsibility question; review whether `responsibility_holding` is sufficient or whether restraint-specific responsibility needs different modeling.
- **Sensory / communication restriction** — represented by the proposed see/hear/speak question above. Determine whether it belongs under physical restriction, a broader sensory-control concept, or a new canonical signal.
- **Aesthetic bondage, tasking, praise/reward** — real B&D-adjacent dimensions. Review whether these belong in quiz signals, another quiz, or catalog/modifier data rather than assuming they are out of scope.
- **Fantasy vs practice vs lifestyle intensity** — the systematic review supports a dimensional spectrum of engagement, but this is different from preference strength and should not be added to the quiz without a separate product decision.

## References consulted

- Encyclopedia.com — Bondage and Discipline: https://www.encyclopedia.com/social-sciences/encyclopedias-almanacs-transcripts-and-maps/bondage-and-discipline
- JOI Training — Bondage and Discipline: https://joitraining.com/blog/bondage-and-discipline
- De Neef et al. (2019), systematic review: https://pmc.ncbi.nlm.nih.gov/articles/PMC6525106/
