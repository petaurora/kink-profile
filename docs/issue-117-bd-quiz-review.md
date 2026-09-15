# Issue #117 — Bondage & Discipline quiz review

Working review notes for `src/data/bondageDisciplineQuiz.ts`. These are recommendations for discussion, not yet scoring changes.

## Keep

- **bd-001** — “Being physically restrained by someone I trust can feel appealing even when pain is not part of the experience.”
- **bd-002** — “Having several parts of my movement restricted at once can make restraint feel more immersive.”
- **bd-005** — “Part of the appeal of restraint can be knowing that someone else is deciding how much physical freedom I have.”
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

## Add

- **Receiving — vulnerability / surrender:** “Being unable to move freely can create an appealing sense of vulnerability or surrender when I trust the person restraining me.”
- **Receiving — release of control:** “Part of the appeal of restraint can be relaxing into the fact that I no longer need to control my own movement.”
- **Giving — trust / safety responsibility:** “Being trusted with a restrained partner's safety and physical freedom can make restraint feel especially meaningful.”
- **Giving — responsibility / control:** “The responsibility of carefully controlling another person's movement can be part of the appeal of restraining them.”

These should be mapped carefully so they measure the psychological experience around restraint rather than simply duplicating `receiving_restraint` / `giving_restraint`.

## Merge / remove

- **bd-006** — “Pulling against or testing agreed restraint can add something enjoyable to the experience for me.”
- **bd-007** — “The possibility of trying to get free, even when I may not succeed, can make restraint more exciting.”
  - Merge unless `struggling/testing` and `escape challenge` become separate signals.

- **bd-018** — “A non-painful corrective task or consequence can still feel strongly like discipline to me.”
  - Remove; overlaps bd-016/017 and repeats the non-pain distinction.

- **bd-020** — “Correcting a willing partner toward a shared expectation can feel meaningful even when pain is not involved.”
  - Remove or substantially rewrite; overlaps bd-019 and its `guidance_shaping` weight is stronger than the wording supports.

## Rewrite

- **bd-024** — “Knowing in advance that restraint, correction, or a formal ritual is coming can be part of the appeal.”
  - Bundles three distinct experiences. Prefer a discipline-specific anticipation item, e.g. “Knowing in advance that a consequence or correction is coming can build appealing anticipation.”

## Keep, but review model / weights

- **bd-003** — “Being required to stay in a specific position until I am released can be appealing.”
- **bd-004** — “Being deliberately arranged into a posture by a trusted partner can make the sense of control more tangible.”
  - Useful distinction: maintaining a required position vs having the body physically arranged. Current model collapses both into `receiving_positioning`.

- **bd-010** — “Securing a willing partner so they cannot freely reposition can make restraint feel more complete.”
  - Review whether nondirectional `movement_restriction` should be scored from both receiving- and giving-oriented questions.

- **bd-011** — “Placing a willing partner in a specific position and expecting them to maintain it can be appealing.”
- **bd-012** — “Carefully arranging another person's posture or placement can be satisfying in its own right.”
  - Same maintain-vs-arrange distinction as bd-003/004. Remove or reduce bd-012's `guidance_shaping` weight unless behavioral shaping is actually intended.

- **bd-014** — “I can enjoy a willing partner testing or struggling against agreed restraint because it makes containment more interactive.”
  - `challenge_escape` currently mixes the experience of struggling/escaping with the experience of containing someone who struggles. Confirm whether this should remain nondirectional.

- **bd-025** — “Following an agreed sequence or protocol exactly can be satisfying because the form itself matters.”
- **bd-026** — “Creating a specific procedure or protocol for a willing partner can make structure feel more deliberate and meaningful.”
  - Good directional questions, but both currently collapse into nondirectional `ritual_significance` / `structure`. Decide whether that loss of directionality is intentional.

## Possible gaps surfaced by references

- **Vulnerability / psychological release from restraint** — now represented by the proposed receiving questions above; review whether they belong in existing control/responsibility signals or expose a missing canonical concept.
- **Responsibility while restraining** — now represented by the proposed giving questions above; review whether `responsibility_holding` is sufficient or whether restraint-specific responsibility needs different modeling.
- **Aesthetic bondage, sensory deprivation, tasking, praise/reward** — real B&D-adjacent dimensions. Review whether these belong in quiz signals, another quiz, or catalog/modifier data rather than assuming they are out of scope.
- **Fantasy vs practice vs lifestyle intensity** — the systematic review supports a dimensional spectrum of engagement, but this is different from preference strength and should not be added to the quiz without a separate product decision.

## References consulted

- Encyclopedia.com — Bondage and Discipline: https://www.encyclopedia.com/social-sciences/encyclopedias-almanacs-transcripts-and-maps/bondage-and-discipline
- JOI Training — Bondage and Discipline: https://joitraining.com/blog/bondage-and-discipline
- De Neef et al. (2019), systematic review: https://pmc.ncbi.nlm.nih.gov/articles/PMC6525106/
