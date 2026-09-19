# Issue #117 — Sadism & Masochism quiz review

Working review notes for `src/data/sadismMasochismQuiz.ts`. These are discussion notes only; scoring changes should not land until the question-level decisions are agreed.

## Current bank

The S/M quiz currently has **26 active questions** and is quiz version 1.

Current authored Signals normalize into six canonical concepts:

- Pain — Receiving / Giving
- Physical Intensity — Receiving / Giving
- Endurance — Receiving / Giving
- Challenge — Receiving / Giving
- Anticipation — Overall only
- Emotional Intensity — Overall only

The bank is intentionally mirrored between receiving and giving for most directional concepts.

## First-pass question clusters

### Pain — Receiving

- **sm-001** — consensual pain can be appealing outside discipline/punishment.
  - **Decision:** keep wording unchanged.
  - Semantic target: `pain · Receiving`.
  - Keep this clean; the value of the item is explicitly separating Pain from Discipline / punishment context.

- **sm-002** — pain itself is desired rather than merely tolerated for another effect.
  - **Decision:** keep wording.
  - Semantic target: `pain · Receiving`.
  - Drop the current `physical_intensity · Receiving` secondary weight. “Intense experience” is context here, not direct evidence of a separate Physical Intensity preference.
  - This remains distinct from sm-001 because it measures intrinsic pain appeal vs instrumental tolerance.

- **sm-011** — pain can be enjoyable without extreme physical intensity.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - The wording sounds contrastive, but positive-weight scoring only adds another Pain vote; the Pain-vs-Intensity distinction is already represented by answering Pain high and Physical Intensity low.

### Physical Intensity — Receiving

- **sm-003** — strong physical experience even when pain is not the main point.
  - **Decision:** keep wording unchanged.
  - Semantic target: `physical_intensity · Receiving`.
  - Drop the current Pain secondary weight; the question explicitly establishes that strong physical intensity can appeal even when Pain is not central.

- **sm-004** — increasing physical intensity makes an experience more immersive/compelling.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - This primarily measures escalation / ramping as a route to immersion. We do not need a separate escalation construct in the current model, and keeping it as another Physical Intensity item would mostly duplicate the anchor question.

- **sm-012** — strong physical intensity can appeal even when only mildly painful / not primarily pain.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - This repeats the Pain-vs-Physical-Intensity distinction already measured cleanly by sm-003.

### Endurance — Receiving

- **sm-005** — sustained physical intensity over time can be rewarding.
  - **Decision:** keep, but rewrite to **“Remaining in an intense physical experience for a sustained period can feel rewarding in its own right.”**
  - Semantic target: `endurance · Receiving`.
  - Drop the current `physical_intensity · Receiving` secondary weight. The question is about sustaining an experience over time, not separately establishing a preference for Physical Intensity.

- **sm-006** — continuing through an agreed difficult sensation can be satisfying.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - This substantially overlaps sm-005's Endurance construct, and “difficult sensation” does not directly establish Pain.

### Challenge — Receiving

- **sm-007** — being pushed toward an agreed personal edge.
  - **Decision:** keep wording unchanged.
  - Semantic target: `challenge · Receiving`.
  - Drop the current `physical_intensity · Receiving` secondary weight. The item is about the appeal of being pushed toward an agreed edge, not Physical Intensity itself.

- **sm-008** — discovering one's response when an agreed experience becomes genuinely difficult.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - The wording primarily measures self-testing / discovery under difficulty, which is not currently a distinct canonical Signal.
  - Do not preserve the current Endurance or Emotional Intensity secondary weights; difficulty alone does not establish either construct.

### Receiving anticipation / emotional context

- **sm-009** — suspense before receiving pain or high intensity.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - Anticipation is currently an Overall-only canonical concept, so receiving-specific wording does not create meaningful directional evidence.
  - Do not preserve the Pain or Physical Intensity secondary weights; anticipation of an experience does not itself establish those preferences.

- **sm-010** — emotional charge of receiving pain/intensity.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - The item mixes receiving context, Pain, Physical Intensity, and emotional-vs-physical importance. It is less clean than the general Emotional Intensity anchor.

- **sm-025** — general buildup before an intense experience.
  - **Decision:** keep wording unchanged.
  - Semantic target: `anticipation · Overall`.
  - Drop the current Emotional Intensity secondary weight; buildup / suspense is sufficient on its own.

- **sm-026** — highly charged emotional atmosphere independent of physical intensity.
  - **Decision:** keep wording unchanged.
  - Semantic target: `emotional_intensity · Overall`.
  - Keep this as the clean general anchor for emotional atmosphere rather than side-specific receiving / giving variants.

### Pain — Giving

- **sm-013** — causing consensual pain can be appealing outside discipline/punishment.
  - **Decision:** keep wording unchanged.
  - Semantic target: `pain · Giving`.
  - Keep this clean; the item explicitly separates Pain from Discipline / punishment context.

- **sm-014** — a willing partner's pain itself can be compelling.
  - **Decision:** keep wording unchanged.
  - Semantic target: `pain · Giving`.
  - Drop the current `physical_intensity · Giving` secondary weight. The partner's experience of pain can be intrinsically appealing without establishing a separate Physical Intensity preference.
  - This remains distinct from sm-013 because it measures intrinsic pain appeal rather than merely separating Pain from Discipline.

- **sm-023** — agreed pain can be appealing without extreme physical intensity.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - As with sm-011, the wording is contrastive but positive-weight scoring only contributes another Pain vote. Pain-vs-Intensity is represented more cleanly by independent Pain and Physical Intensity answers.

### Physical Intensity — Giving

- **sm-015** — creating a strong physical experience even when pain is not the main point.
  - **Decision:** keep wording unchanged.
  - Semantic target: `physical_intensity · Giving`.
  - Drop the current Pain secondary weight; the question explicitly establishes that strong physical intensity can appeal even when Pain is not central.

- **sm-016** — increasing physical intensity can make the experience more compelling to give.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - This primarily measures escalation / ramping as a route to appeal. We are not preserving a separate escalation construct, and keeping it as another Physical Intensity item would mostly duplicate the anchor question.

- **sm-024** — creating strong intensity even when only mildly painful / not primarily pain.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - This repeats the Pain-vs-Physical-Intensity distinction already measured cleanly by sm-015.

### Endurance — Giving

- **sm-017** — sustaining an intense experience over time.
  - **Decision:** keep, but rewrite to **“Sustaining an intense physical experience for a willing partner over time can feel rewarding in its own right.”**
  - Semantic target: `endurance · Giving`.
  - Drop the current `physical_intensity · Giving` secondary weight. The item measures sustaining an experience over time, not a separate preference for Physical Intensity.

- **sm-018** — maintaining an agreed difficult experience rather than making it brief.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - This substantially overlaps sm-017's Endurance construct, and “difficult” does not directly establish Pain.

### Challenge — Giving

- **sm-019** — carefully pushing a willing partner toward an agreed personal edge.
  - **Decision:** keep wording unchanged.
  - Semantic target: `challenge · Giving`.
  - Drop the current `physical_intensity · Giving` secondary weight. The item is about the appeal of pushing toward an agreed edge, not Physical Intensity itself.

- **sm-020** — appeal in seeing how a partner responds when an agreed experience becomes genuinely difficult.
  - **Decision:** retire from the active v2 bank and retain as hidden legacy compatibility input.
  - The wording primarily measures testing / observing response under difficulty, which is not currently a distinct canonical Signal.
  - Do not preserve the current Endurance or Emotional Intensity secondary weights; difficulty alone does not establish either construct.

### Giving anticipation / emotional context

- **sm-021** — suspense before later creating pain/high intensity.
- **sm-022** — emotional charge of giving pain/intensity.

These mirror sm-009 / sm-010 but currently normalize into Overall-only Anticipation / Emotional Intensity.

## First-pass semantic leakage to review

Several current secondary weights may infer a construct that the prompt does not actually establish:

- **sm-002**: Pain → Physical Intensity secondary
- **sm-003**: Physical Intensity → Pain secondary
- **sm-004**: Physical Intensity → Emotional Intensity secondary
- **sm-006**: Endurance → Pain secondary
- **sm-008**: Challenge → Endurance + Emotional Intensity secondaries
- **sm-009**: Anticipation → Pain + Physical Intensity secondaries
- **sm-010**: Emotional Intensity → Physical Intensity + Pain secondaries
- **sm-014**: Pain → Physical Intensity secondary
- **sm-015**: Physical Intensity → Pain secondary
- **sm-016**: Physical Intensity → Emotional Intensity secondary
- **sm-018**: Endurance → Pain secondary
- **sm-020**: Challenge → Endurance + Emotional Intensity secondaries
- **sm-021**: Anticipation → Pain + Physical Intensity secondaries
- **sm-022**: Emotional Intensity → Physical Intensity + Pain secondaries
- **sm-025**: Anticipation → Emotional Intensity secondary

The review should keep secondary evidence only where the wording itself establishes the secondary construct, rather than because the concepts often co-occur in practice.

## Structural questions for this review

1. How many authored questions are needed to distinguish Pain from Physical Intensity without repeatedly asking the same contrast?
2. Does Endurance need separate duration and difficulty questions, or can one item capture it cleanly?
3. Is Challenge primarily edge-seeking, self-testing, or both?
4. Should Anticipation remain Overall-only despite receiving/giving-specific authored questions?
5. Should Emotional Intensity remain Overall-only despite receiving/giving-specific authored questions?
6. Are mirrored receiving/giving questions genuinely useful evidence, or are some pairs only symmetry for symmetry's sake?


## Findings from supplied S/M references

The supplied practitioner / educational references sharpen several model boundaries:

- **S/M should not be treated as synonymous with D/s.** The sources consistently define sadism / masochism around the consensual appeal of inflicting or receiving pain, while noting that sadistic / masochistic roles may overlap with Dominant / submissive roles without requiring that overlap.
- **Intrinsic pain appeal is a legitimate distinct construct.** Several sources distinguish enjoying pain itself from pain used only as a vehicle for another effect. This supports retaining direct Pain questions rather than inferring Pain preference from Intensity, Discipline, Control, or submission.
- **Pain and intensity are related but separable.** The literature on pain-as-pleasure supports context-dependent pleasurable pain and shows that pain intensity can correlate with pleasure for some practitioners, but correlation is not identity. A Pain score should therefore not automatically manufacture Physical Intensity evidence, or vice versa.
- **S/M can include psychological / emotional pain, not only physical pain.** Sources explicitly include humiliation, emotional distress, mindfucks, fear, or other psychological suffering alongside physical pain. The current bank is overwhelmingly physical and may therefore under-model part of the S/M domain.
- **Emotional pain is not equivalent to Emotional Intensity.** A highly charged emotional atmosphere can exist without psychological pain, and psychological pain can be the direct target of sadistic / masochistic enjoyment. Review whether the canonical model needs direct psychological-pain coverage or whether an existing canonical concept can represent it without semantic distortion.
- **Context matters.** Research on masochistic pain perception suggests that pain can be experienced as pleasurable specifically in BDSM / masochistic contexts rather than reflecting a generic preference for everyday pain. This supports wording that anchors questions in consensual kink context rather than measuring ordinary pain tolerance.
- **Intensity, endurance, and challenge should remain separate unless wording actually establishes overlap.** Sensation seeking, pain intensity, endurance / tolerance, and being pushed toward an edge may co-occur, but the references do not justify automatically treating one as evidence for all of the others.

References supplied / sanity-checked:

- MasterClass, *Essential S&M Guide: 6 Common S&M Techniques* — https://www.masterclass.com/articles/s-and-m-guide
- Sensuel et Marquant, *What is BDSM Sadism and Masochism?* — https://sensueletmarquant.com/en/what-is-bdsm-sadism-and-masochism/
- KYNK 101, *Sadism & Masochism (S&M)* — https://kynk101.com/kink-bdsm-facts/sadism-masochism
- Playful Promises, *Unpacking the 'SM' in BDSM: The Psychology Behind Sadomasochism* — https://www.playfulpromises.com/blogs/playful-guide-to-bondage/unpacking-the-sm-in-bdsm-the-psychology-behind-sadomasochism
- Dunkley et al. (2020), *Physical Pain as Pleasure: A Theoretical Perspective*
- De Neef et al. (2019), *BDSM From an Integrative Biopsychosocial Perspective: A Systematic Review*
- Baudic et al. (2023), *Pain and masochistic behaviour: The role of descending modulation*

## Migration expectation

If v2 removes or merges questions, follow the established B&D / D/s compatibility pattern:

- bump S/M quiz version,
- keep retired question IDs as hidden legacy definitions,
- exclude legacy IDs from new attempts / retakes,
- preserve completed v1 results until explicit retake,
- completing v2 replaces the answer map and drops retired IDs,
- add representative bank + migration tests.
