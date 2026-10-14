import { describe, expect, it } from "vitest";
import { searchEducationArticles } from "./EducationSearch";
import type { EducationArticleSummary } from "../../services/contracts";

function article(id:string,title:string,description:string,section:EducationArticleSummary["section"]="Understanding BDSM"):EducationArticleSummary{
  return {id,slug:id,title,description,section,level:"Beginner",readingMinutes:5,version:"draft",links:[]};
}
describe("Education search relevance",()=>{
  const items=[
    article("intro","A guide to introductions","An article about collars and symbols."),
    article("other","Symbols in Kink","Learn about accessories and collars."),
    article("prefix","Collars & Collaring","Belonging, ownership, and choice."),
    article("exact","Collars","Meaning in kink."),
    article("topic","Kink aesthetics","Care and meaning","Collars, symbols, and rituals"),
  ];
  it("puts exact titles, title prefixes and title matches before descriptions and topics",()=>{
    expect(searchEducationArticles(items,"collars").map(result=>result.article.id))
      .toEqual(["exact","prefix","intro","other","topic"]);
  });
  it("uses a stable relevance score and describes what field matched",()=>{
    const hits=searchEducationArticles(items,"collars");
    expect(hits.map(hit=>hit.matchedField)).toEqual(["title","title","description","description","topic"]);
  });
  it("normalizes case and accents, and returns editorial order for empty searches",()=>{
    expect(searchEducationArticles(items,"CóLLARs").map(hit=>hit.article.id)).toEqual(["exact","prefix","intro","other","topic"]);
    expect(searchEducationArticles(items,"  ").map(hit=>hit.article.id)).toEqual(items.map(item=>item.id));
  });
});
