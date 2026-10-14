import type { EducationArticle, EducationArticleSummary, EducationSection, EducationLink } from "../../../services/contracts";

/**
 * Editorial sources from the already merged Education library. This is the local
 * Lab adapter's data input, not an import used by components or the HTTP contract.
 * Later, a remote adapter supplies identical domain objects from an authenticated API.
 */
const markdownFiles = import.meta.glob<string>("../../../../education/**/*.md", {
  query: "?raw", import: "default", eager: true,
});

type Seed = {
  id:string; slug:string; description:string; section:EducationSection;
  folder:"fundamentals"|"practices"|"relationships";
  level:EducationArticleSummary["level"]; minutes:number; related?:string[];
  subjects?:EducationLink[];
};
const seeds:Seed[] = [
  {id:"edu-risk-frameworks",slug:"ssc-rack-and-prick-explained",folder:"fundamentals",description:"Comparing safety slogans, informed choice, and individual responsibility without treating acronyms as guarantees.",section:"Consent and scenes",level:"Beginner–Intermediate",minutes:5,related:["edu-negotiation","edu-safewords","edu-red-flags"]},
  {id:"edu-kink-not-therapy",slug:"kink-is-not-therapy",folder:"fundamentals",description:"Why meaningful personal experiences are not substitutes for trained mental-health treatment.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-aftercare","edu-sensory","edu-red-flags"]},
  {id:"edu-community-safety",slug:"finding-kink-community-safely",folder:"fundamentals",description:"How to explore groups and events while respecting privacy, consent, and personal boundaries.",section:"Consent and scenes",level:"Beginner–Intermediate",minutes:5,related:["edu-red-flags","edu-negotiation","edu-asking-more"]},
  {id:"edu-neurodivergence",slug:"kink-and-neurodivergence",folder:"fundamentals",description:"Exploring individual accommodations without stereotyping neurodivergent people or their preferences.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-sensory","edu-mindspaces","edu-uncertainty"]},
  {id:"edu-shame",slug:"kink-shame-and-self-acceptance",folder:"fundamentals",description:"Understanding stigma, privacy, identity, and the freedom to choose whether or how to explore.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-fantasy-reality","edu-roles","edu-red-flags"]},

  {id:"edu-temperature",slug:"temperature-play-sensation-and-risk",folder:"practices",description:"Cold, warmth, sensory contrasts, and the hazards of thermal exposure.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:6,related:["edu-sensory","edu-impact","edu-negotiation"]},
  {id:"edu-electrostimulation",slug:"electrostimulation-understanding-the-risks",folder:"practices",description:"Electrical injury, device uncertainty, contraindications, and emergency readiness.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:6,related:["edu-restraint-anatomy","edu-negotiation","edu-safewords"]},
  {id:"edu-sensory-restriction",slug:"blindfolds-and-sensory-restriction",folder:"practices",description:"Anticipation, vulnerability, communication, and the practical risks of reduced sensory information.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:6,related:["edu-sensory","edu-bratting","edu-negotiation"]},
  {id:"edu-chastity",slug:"chastity-physical-emotional-and-relational-considerations",folder:"practices",description:"Symbolic control, hygiene, constriction risks, and consent around wearable devices.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:6,related:["edu-ownership","edu-continuing-consent","edu-restraint-anatomy"]},
  {id:"edu-wax",slug:"wax-play-materials-burns-and-skin-safety",folder:"practices",description:"Why wax types, heat retention, and skin conditions matter to burn risk.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:6,related:["edu-temperature","edu-sensory","edu-impact-marks"]},

  {id:"edu-uncertainty",slug:"when-you-dont-know-what-you-want",folder:"relationships",description:"Communicating uncertainty, partial preferences, and changing decisions without pressure.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:6,related:["edu-negotiation","edu-fantasy-reality","edu-continuing-consent"]},
  {id:"edu-boundary-repair",slug:"repair-after-a-boundary-violation",folder:"relationships",description:"Accountability, safety, trust, and the limits of apologies after boundaries are crossed.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:6,related:["edu-red-flags","edu-continuing-consent","edu-aftercare"]},
  {id:"edu-asking-more",slug:"asking-for-more-without-pressure",folder:"relationships",description:"Express desires clearly while keeping refusal easy, safe, and meaningful.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:6,related:["edu-negotiation","edu-uncertainty","edu-fantasy-reality"]},
  {id:"edu-multiple-partner-emotions",slug:"jealousy-compersion-and-multiple-partners",folder:"relationships",description:"Navigating difficult and positive emotions in consensual multi-partner kink contexts.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:5,related:["edu-negotiation","edu-red-flags","edu-aftercare","edu-continuing-consent"]},

  {id:"edu-ownership",slug:"ownership-belonging-and-being-claimed",folder:"relationships",description:"Ownership belonging and being claimed.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:5,related:["edu-collars","edu-tpe","edu-continuing-consent"]},
  {id:"edu-discipline",slug:"punishment-discipline-and-correction",folder:"relationships",description:"Punishment discipline and correction.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:5,related:["edu-tpe","edu-negotiation","edu-continuing-consent"]},
  {id:"edu-bratting",slug:"bratting-resistance-and-defiance",folder:"fundamentals",description:"Bratting resistance and defiance.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-roles","edu-negotiation","edu-safewords","edu-continuing-consent"]},
  {id:"edu-sub-top-space",slug:"subspace-and-topspace",folder:"fundamentals",description:"Subspace and topspace.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-mindspaces","edu-aftercare","edu-sensory","edu-safewords"]},
  {id:"edu-fantasy-reality",slug:"fantasy-vs-reality",folder:"fundamentals",description:"Fantasy vs reality.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-roles","edu-no-ds","edu-negotiation"]},
  {id:"edu-protocol-ritual-rules",slug:"protocol-vs-ritual-vs-rules",folder:"relationships",description:"Protocol vs ritual vs rules.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:5,related:["edu-tpe","edu-service","edu-continuing-consent"]},
  {id:"edu-red-flags",slug:"red-flags-vs-incompatibility",folder:"relationships",description:"Red flags vs incompatibility.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:5,related:["edu-continuing-consent","edu-negotiation","edu-aftercare"]},
  {id:"edu-anticipation",slug:"why-anticipation-can-feel-more-powerful",folder:"fundamentals",description:"Why anticipation can feel more powerful.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:5,related:["edu-fantasy-reality","edu-mindspaces","edu-sensory"]},

  {id:"edu-aftercare",slug:"aftercare-reconnection-and-drop",folder:"relationships",description:"Aftercare, relational reconnection, delayed drop, and responding to different needs.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:7,related:["edu-negotiation","edu-safewords","edu-mindspaces"]},
  {id:"edu-sensory",slug:"sensory-processing-in-kink",folder:"fundamentals",description:"Sensory seeking, avoidance, predictability, overload, and changing preferences.",section:"Kinks, roles, and motivation",level:"Beginner–Intermediate",minutes:6,related:["edu-mindspaces","edu-sm","edu-impact-tools"]},
  {id:"edu-service",slug:"service-as-love-or-power-exchange",folder:"relationships",description:"Understanding service as care, chosen structure, devotion, or practical work.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:6,related:["edu-ds","edu-roles","edu-tpe"]},
  {id:"edu-continuing-consent",slug:"consent-under-ongoing-authority",folder:"relationships",description:"Scope, changing agreements, refusal, and accountability within ongoing authority.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:6,related:["edu-tpe","edu-ds","edu-negotiation","edu-aftercare"]},
  {id:"edu-restraint-anatomy",slug:"restraint-safety-and-anatomy",folder:"practices",description:"Anatomical risks, warning signs, monitoring limits, and emergency readiness for restraint.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:6,related:["edu-bd","edu-safewords","edu-breath-safety"]},

  {id:"edu-bd",slug:"bondage-and-discipline",folder:"fundamentals",description:"Restraint, structure, and the meaning of chosen limits.",section:"Understanding BDSM",level:"Beginner",minutes:13,related:["edu-ds","edu-safewords"],subjects:[{target:{kind:"concept",id:"movement-restriction"},relation:"explains"}]},
  {id:"edu-ds",slug:"dominance-and-submission",folder:"fundamentals",description:"Consent, chosen authority, surrender, and trust.",section:"Understanding BDSM",level:"Beginner",minutes:16,related:["edu-roles","edu-tpe"]},
  {id:"edu-sm",slug:"sadism-and-masochism",folder:"fundamentals",description:"Understanding sensation, intensity, and consensual pain.",section:"Understanding BDSM",level:"Beginner",minutes:19,related:["edu-safewords","edu-negotiation","edu-impact"]},
  {id:"edu-safewords",slug:"safewords",folder:"fundamentals",description:"Signals to slow down, pause, or stop any scene.",section:"Consent and scenes",level:"Beginner",minutes:10,related:["edu-negotiation","edu-bd"]},
  {id:"edu-negotiation",slug:"negotiating-a-scene",folder:"fundamentals",description:"Discuss boundaries, activities, roles, and aftercare.",section:"Consent and scenes",level:"Beginner",minutes:12,related:["edu-safewords","edu-roles"]},
  {id:"edu-roles",slug:"kinks-are-not-roles",folder:"fundamentals",description:"Why performing an activity does not determine someone's authority role.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:12,related:["edu-no-ds","edu-ds"]},
  {id:"edu-no-ds",slug:"kink-without-power-exchange",folder:"fundamentals",description:"Collaborative kink that requires neither a Dominant nor a submissive.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:12,related:["edu-roles","edu-negotiation"]},
  {id:"edu-mindspaces",slug:"understanding-mindspaces",folder:"fundamentals",description:"What mindspaces feel like, how they may shift or blend, and why each person's experience is unique.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:13,related:["edu-roles","edu-no-ds","edu-ds","edu-negotiation"]},
  {id:"edu-tpe",slug:"total-power-exchange",folder:"fundamentals",description:"Ongoing authority, accountability, consent, and autonomy.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:17,related:["edu-ds","edu-collars"]},
  {id:"edu-collars",slug:"collars-and-collaring",folder:"fundamentals",description:"Commitment, symbolism, sensory expression, and choice.",section:"Collars, symbols, and rituals",level:"Beginner",minutes:19,related:["edu-ds","edu-tpe"],subjects:[{target:{kind:"catalog-item",id:"collars"},relation:"discusses"}]},
  {id:"edu-impact",slug:"impact-play-safety",folder:"practices",description:"A beginner's guide to impact sensation, consent, anatomy, and recognizing risks.",section:"Practices & safety",level:"Beginner",minutes:7,related:["edu-impact-tools","edu-impact-anatomy","edu-impact-marks","edu-safewords","edu-negotiation","edu-sm"]},
  {id:"edu-impact-tools",slug:"impact-implements-and-sensations",folder:"practices",description:"Thud, sting, padding, perforations, materials, flogger tails, crop tips, and sensory differences.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-anatomy","edu-impact-marks"]},
  {id:"edu-impact-anatomy",slug:"impact-anatomy-and-control",folder:"practices",description:"Anatomy, vulnerable areas, accuracy, off-body practice, and when to stop.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-tools","edu-impact-marks"]},
  {id:"edu-impact-marks",slug:"impact-marks-and-recovery",folder:"practices",description:"Redness, welts, bruises, tissue injury, aftercare, and medical warning signs.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-anatomy","edu-safewords"]},
  {id:"edu-breath-safety",slug:"breath-play-choking-and-strangulation",folder:"practices",description:"Choking, strangulation, and suffocation: different mechanisms, serious risks, emergency signs, and lower-risk alternatives.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:14,related:["edu-safewords","edu-negotiation","edu-ds","edu-bd"]},
];

export const localEducationArticles:EducationArticle[] = seeds.map(seed => {
  const sourcePath=`../../../../education/${seed.folder}/${seed.slug}.md`;
  const markdown=markdownFiles[sourcePath];
  if (typeof markdown !== "string") throw new Error(`Missing Education source for ${seed.id}: ${sourcePath}`);
  const title=markdown.match(/^# (.+)$/m)?.[1];
  if (!title) throw new Error(`Missing Education title for ${seed.id}`);
  return {
    id:seed.id,slug:seed.slug,title,description:seed.description,section:seed.section,
    level:seed.level,readingMinutes:seed.minutes,version:"draft-1",
    links:[...(seed.related||[]).map(id=>({target:{kind:"article" as const,id},relation:"further-reading" as const})),...(seed.subjects||[])],
    markdown,
  };
});
/** Validation stays in data authoring; no unresolved targets or duplicate IDs. */
const ids=new Set(localEducationArticles.map(article=>article.id));
if(ids.size!==localEducationArticles.length)throw new Error("Duplicate Education article IDs");
for(const article of localEducationArticles)for(const link of article.links)
  if(link.target.kind==="article"&&!ids.has(link.target.id))throw new Error(`Missing related article ${link.target.id}`);

export function toEducationSummaries(articles:readonly EducationArticle[]):EducationArticleSummary[] {
  return articles.map(({markdown: _markdown,...summary}) => summary);
}
