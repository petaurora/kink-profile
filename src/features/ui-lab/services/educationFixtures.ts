import type { EducationArticle, EducationArticleSummary, EducationSection, EducationLink } from "../../../services/contracts";

/**
 * Editorial sources from the already merged Education library. This is the local
 * Lab adapter's data input, not an import used by components or the HTTP contract.
 * Later, a remote adapter supplies identical domain objects from an authenticated API.
 */
const markdownFiles = import.meta.glob<string>("../../../../education/fundamentals/*.md", {
  query: "?raw", import: "default", eager: true,
});

type Seed = {
  id:string; slug:string; description:string; section:EducationSection;
  level:EducationArticleSummary["level"]; minutes:number; related?:string[];
  subjects?:EducationLink[];
};
const seeds:Seed[] = [
  {id:"edu-bd",slug:"bondage-and-discipline",description:"Restraint, structure, and the meaning of chosen limits.",section:"Understanding BDSM",level:"Beginner",minutes:8,related:["edu-ds","edu-safewords"],subjects:[{target:{kind:"concept",id:"movement-restriction"},relation:"explains"}]},
  {id:"edu-ds",slug:"dominance-and-submission",description:"Consent, chosen authority, surrender, and trust.",section:"Understanding BDSM",level:"Beginner",minutes:9,related:["edu-roles","edu-tpe"]},
  {id:"edu-sm",slug:"sadism-and-masochism",description:"Understanding sensation, intensity, and consensual pain.",section:"Understanding BDSM",level:"Beginner",minutes:10,related:["edu-safewords","edu-negotiation"]},
  {id:"edu-safewords",slug:"safewords",description:"Signals to slow down, pause, or stop any scene.",section:"Consent and scenes",level:"Beginner",minutes:9,related:["edu-negotiation","edu-bd"]},
  {id:"edu-negotiation",slug:"negotiating-a-scene",description:"Discuss boundaries, activities, roles, and aftercare.",section:"Consent and scenes",level:"Beginner",minutes:11,related:["edu-safewords","edu-roles"]},
  {id:"edu-roles",slug:"kinks-are-not-roles",description:"Why performing an activity does not determine someone's authority role.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:10,related:["edu-no-ds","edu-ds"]},
  {id:"edu-no-ds",slug:"kink-without-power-exchange",description:"Collaborative kink that requires neither a Dominant nor a submissive.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:9,related:["edu-roles","edu-negotiation"]},
  {id:"edu-tpe",slug:"total-power-exchange",description:"Ongoing authority, accountability, consent, and autonomy.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:12,related:["edu-ds","edu-collars"]},
  {id:"edu-collars",slug:"collars-and-collaring",description:"Commitment, symbolism, sensory expression, and choice.",section:"Collars, symbols, and rituals",level:"Beginner",minutes:11,related:["edu-ds","edu-tpe"],subjects:[{target:{kind:"catalog-item",id:"collars"},relation:"discusses"}]},
];

export const localEducationArticles:EducationArticle[] = seeds.map(seed => {
  const sourcePath=`../../../../education/fundamentals/${seed.slug}.md`;
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
