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
  folder:"fundamentals"|"practices";
  level:EducationArticleSummary["level"]; minutes:number; related?:string[];
  subjects?:EducationLink[];
};
const seeds:Seed[] = [
  {id:"edu-bd",slug:"bondage-and-discipline",folder:"fundamentals",description:"Restraint, structure, and the meaning of chosen limits.",section:"Understanding BDSM",level:"Beginner",minutes:8,related:["edu-ds","edu-safewords"],subjects:[{target:{kind:"concept",id:"movement-restriction"},relation:"explains"}]},
  {id:"edu-ds",slug:"dominance-and-submission",folder:"fundamentals",description:"Consent, chosen authority, surrender, and trust.",section:"Understanding BDSM",level:"Beginner",minutes:9,related:["edu-roles","edu-tpe"]},
  {id:"edu-sm",slug:"sadism-and-masochism",folder:"fundamentals",description:"Understanding sensation, intensity, and consensual pain.",section:"Understanding BDSM",level:"Beginner",minutes:10,related:["edu-safewords","edu-negotiation","edu-impact"]},
  {id:"edu-safewords",slug:"safewords",folder:"fundamentals",description:"Signals to slow down, pause, or stop any scene.",section:"Consent and scenes",level:"Beginner",minutes:9,related:["edu-negotiation","edu-bd"]},
  {id:"edu-negotiation",slug:"negotiating-a-scene",folder:"fundamentals",description:"Discuss boundaries, activities, roles, and aftercare.",section:"Consent and scenes",level:"Beginner",minutes:11,related:["edu-safewords","edu-roles"]},
  {id:"edu-roles",slug:"kinks-are-not-roles",folder:"fundamentals",description:"Why performing an activity does not determine someone's authority role.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:10,related:["edu-no-ds","edu-ds"]},
  {id:"edu-no-ds",slug:"kink-without-power-exchange",folder:"fundamentals",description:"Collaborative kink that requires neither a Dominant nor a submissive.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:9,related:["edu-roles","edu-negotiation"]},
  {id:"edu-tpe",slug:"total-power-exchange",folder:"fundamentals",description:"Ongoing authority, accountability, consent, and autonomy.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:12,related:["edu-ds","edu-collars"]},
  {id:"edu-collars",slug:"collars-and-collaring",folder:"fundamentals",description:"Commitment, symbolism, sensory expression, and choice.",section:"Collars, symbols, and rituals",level:"Beginner",minutes:11,related:["edu-ds","edu-tpe"],subjects:[{target:{kind:"catalog-item",id:"collars"},relation:"discusses"}]},
  {id:"edu-impact",slug:"impact-play-safety",folder:"practices",description:"A beginner's guide to impact sensation, consent, anatomy, and recognizing risks.",section:"Practices & safety",level:"Beginner",minutes:7,related:["edu-impact-tools","edu-impact-anatomy","edu-impact-marks","edu-safewords","edu-negotiation","edu-sm"]},
  {id:"edu-impact-tools",slug:"impact-implements-and-sensations",folder:"practices",description:"Thud, sting, padding, perforations, materials, flogger tails, crop tips, and sensory differences.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-anatomy","edu-impact-marks"]},
  {id:"edu-impact-anatomy",slug:"impact-anatomy-and-control",folder:"practices",description:"Anatomy, vulnerable areas, accuracy, off-body practice, and when to stop.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-tools","edu-impact-marks"]},
  {id:"edu-impact-marks",slug:"impact-marks-and-recovery",folder:"practices",description:"Redness, welts, bruises, tissue injury, aftercare, and medical warning signs.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-anatomy","edu-safewords"]},
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
