import type { EducationArticleSummary } from "../../services/contracts";

/** Results are stable and title-first: searching an article is not a profile inference. */
export type EducationMatch = {
  article: EducationArticleSummary;
  matchedField: "title" | "description" | "topic";
  score: number;
};
function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}
export function searchEducationArticles(articles: readonly EducationArticleSummary[], query: string): EducationMatch[] {
  const term = normalize(query).replace(/\s+/g, " ");
  if (!term) return articles.map(article => ({article, matchedField:"title" as const, score:0}));
  const words = term.split(" ").filter(Boolean);
  const matches: EducationMatch[] = [];
  for (const article of articles) {
    const title=normalize(article.title);
    const description=normalize(article.description);
    const topic=normalize(article.section+" "+article.level);
    const all=[title,description,topic].join(" ");
    let score:number,matchedField:EducationMatch["matchedField"];
    if(title===term){score=0;matchedField="title";}
    else if(title.startsWith(term)){score=1;matchedField="title";}
    else if(title.split(/[^\p{L}\p{N}]+/u).some(word=>word.startsWith(term))){score=2;matchedField="title";}
    else if(title.includes(term)||words.every(word=>title.includes(word))){score=3;matchedField="title";}
    else if(description.includes(term)||words.every(word=>description.includes(word))){score=4;matchedField="description";}
    else if(topic.includes(term)||words.every(word=>topic.includes(word))){score=5;matchedField="topic";}
    else if(words.every(word=>all.includes(word))){score=6;matchedField="description";}
    else continue;
    matches.push({article,matchedField,score});
  }
  return matches.sort((a,b)=>a.score-b.score||a.article.title.localeCompare(b.article.title));
}
