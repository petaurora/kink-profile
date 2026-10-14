import { useCallback, useMemo, useState } from "react";
import { useAppServices } from "../../services/AppServicesProvider";
import { useServiceQuery } from "../../services/useServiceQuery";
import { SearchField } from "../../components/ui/SearchField";
import { SearchRow, SearchFilterButton, SearchChips, SortGroupSheet, type SortBy } from "../../components/ui/SearchControls";
import type { EducationArticleSummary, EducationSection, RequestOptions } from "../../services/contracts";
import type { LabArea } from "./LabNavigation";
import { LabCard } from "./LabCard";
import { searchEducationArticles, type EducationMatch } from "./EducationSearch";
import { EducationMarkdown, articleBody, articleContentNote } from "./EducationMarkdown";
import "./education.css";

type Go = (area:LabArea,workspace?:string,params?:Record<string,string>)=>void;
const sections:EducationSection[] = [
  "Understanding BDSM", "Consent and scenes", "Kinks, roles, and motivation",
  "Relationship structures", "Collars, symbols, and rituals", "Practices & safety",
];
const topicOptions:{id:EducationSection | "all";label:string}[] = [
  {id:"all",label:"All topics"},
  {id:"Understanding BDSM",label:"BDSM basics"},
  {id:"Consent and scenes",label:"Consent & scenes"},
  {id:"Kinks, roles, and motivation",label:"Kinks & roles"},
  {id:"Relationship structures",label:"Relationships"},
  {id:"Collars, symbols, and rituals",label:"Collars & symbols"},
  {id:"Practices & safety",label:"Practices & safety"},
];
const starters=["edu-bd","edu-ds","edu-sm"];

function ArticleTiles({matches,go,featuredId,showMatch=false}:{
  matches:EducationMatch[];go:Go;featuredId?:string;showMatch?:boolean;
}){
  return <div className="lab-education-grid">{matches.map(({article,matchedField})=>
    <LabCard key={article.id} title={article.title} icon="✧" description={article.description}
      featured={article.id===featuredId}
      status={article.level+" · "+article.readingMinutes+" min read"+(showMatch&&matchedField!=="title"?" · "+(matchedField==="description"?"Description match":"Topic match"):"")}
      onClick={()=>go("Learn","Article",{id:article.id})}/>)}</div>;
}

/** Browsing education must not create preference, participation, identity, or consent evidence. */
export function EducationWorkspace({view,articleId,go}:{view:string;articleId:string;go:Go}){
  const {education}=useAppServices();
  const [query,setQuery]=useState("");
  const [topic,setTopic]=useState<EducationSection | "all">("all");
  const [sort,setSort]=useState<SortBy>("default");
  const [sortOpen,setSortOpen]=useState(false);
  const listRequest=useCallback((options:RequestOptions)=>education
    ? education.listArticles(options)
    : Promise.resolve([]),[education]);
  const articleRequest=useCallback((options:RequestOptions)=>education
    ? education.getArticle(articleId,options)
    : Promise.resolve(null),[education,articleId]);
  const list=useServiceQuery(listRequest,Boolean(education));
  const detail=useServiceQuery(articleRequest,Boolean(education)&&view==="Article"&&Boolean(articleId));
  const searching=Boolean(query.trim());
  const results=useMemo(()=>{
    const hits=searchEducationArticles(list.data??[],query)
      .filter(({article})=>topic==="all"||article.section===topic);
    if(sort==="az"||sort==="za") hits.sort((a,b)=>a.article.title.localeCompare(b.article.title)*(sort==="az"?1:-1));
    return hits;
  },[list.data,query,topic,sort]);
  const filteredView=searching||topic!=="all"||sort!=="default";
  if(!education)return <section className="lab-section" role="status"><h2>Education isn't connected here yet</h2><p>This adapter does not provide the Education read service. No sample articles were substituted for an unavailable API.</p></section>;

  if(view==="Article"){
    if(!articleId)return <section className="lab-section"><p>No article was selected.</p><button type="button" onClick={()=>go("Learn")}>Browse articles</button></section>;
    if(detail.loading)return <p role="status">Loading article…</p>;
    if(detail.error)return <section className="lab-section" role="alert"><p>Unable to load this article. Nothing has been saved or changed.</p><button type="button" onClick={detail.retry}>Retry article</button><button type="button" onClick={()=>go("Learn")}>Browse articles</button></section>;
    if(!detail.data)return <section className="lab-section"><p>This article is unavailable or its link is out of date.</p><button type="button" onClick={()=>go("Learn")}>Browse articles</button></section>;
    const article=detail.data;
    // Only known other articles are navigable. Deduplicate even if future API data has duplicate edges.
    const used=new Set<string>([article.id]);
    const related:EducationArticleSummary[]=[];
    for(const link of article.links){
      if(link.target.kind!=="article"||used.has(link.target.id))continue;
      const target=list.data?.find(candidate=>candidate.id===link.target.id);
      if(!target)continue;
      related.push(target);used.add(target.id);
    }
    return <div className="lab-education-reader">
      <button type="button" className="lab-education-back" onClick={()=>go("Learn")}>← All articles</button>
      <header className="lab-education-article-header">
        <p className="lab-education-overline">{article.section} · {article.level} · {article.readingMinutes} min read</p>
        <h2>{article.title}</h2>
        <p className="lab-education-summary">{article.description}</p>
        <p className="lab-education-status">Editorial draft · Review required before publication</p>
        {articleContentNote(article.markdown)&&<p className="lab-education-note"><strong>Content note:</strong> {articleContentNote(article.markdown)}</p>}
      </header>
      <EducationMarkdown markdown={articleBody(article.markdown)}/>
      {related.length>0&&<section className="lab-education-related" aria-labelledby="lab-education-related-heading">
        <h2 id="lab-education-related-heading">Continue learning</h2>
        <div className="lab-education-related-links">
          {related.map(target=><button type="button" key={target.id} onClick={()=>go("Learn","Article",{id:target.id})}>{target.title} <span aria-hidden="true">↗</span></button>)}
        </div>
      </section>}
    </div>;
  }

  const intro=results.filter(({article})=>starters.includes(article.id))
    .sort((a,b)=>starters.indexOf(a.article.id)-starters.indexOf(b.article.id));
  const more=results.filter(({article})=>!starters.includes(article.id));
  return <div className="lab-education-library">
    <div className="lab-education-toolbar">
      <label className="lab-education-search-label" htmlFor="lab-education-search">Search articles</label>
      <SearchRow>
        <SearchField mode="input" inputId="lab-education-search" ariaLabel="Search educational articles"
          resultsId="lab-education-results" placeholder="Search articles and topics…"
          value={query} onChange={setQuery} onClear={()=>setQuery("")}/>
        <SearchFilterButton onClick={()=>setSortOpen(true)} groupingAvailable={false} active={sort!=="default"} expanded={sortOpen}/>
      </SearchRow>
      <SearchChips label="Education topics" options={topicOptions.map(option=>({
        id:option.id,label:option.label,active:topic===option.id,onClick:()=>setTopic(option.id),
      }))}/>
      <SortGroupSheet open={sortOpen} onClose={()=>setSortOpen(false)} sort={sort} onSort={setSort}
        showGrouping={false} defaultSortLabel={searching?"Best match: title first":"Editorial order"}/>
    </div>
    {list.loading&&<p role="status">Loading educational articles…</p>}
    {list.error&&<section className="lab-section" role="alert"><p>Unable to load the Education library.</p><button type="button" onClick={list.retry}>Retry loading articles</button></section>}
    {!list.loading&&!list.error&&<>
      <p id="lab-education-results" className="lab-education-results" role="status">
        {results.length} {results.length===1?"article":"articles"}{searching?" matching your search":topic!=="all"?" in this topic":""}
      </p>
      {results.length===0&&<div className="lab-education-empty"><p>No articles match. Try a different title or topic.</p>
        {(topic!=="all"||searching)&&<button type="button" onClick={()=>{setQuery("");setTopic("all");setSort("default");}}>Show all articles</button>}</div>}
      {results.length>0&&filteredView&&<section className="lab-education-section" aria-label="Article results">
        <h2>{searching?"Search results":topic!=="all"?topic:"All articles"}</h2>
        <ArticleTiles matches={results} go={go} showMatch={searching}/>
      </section>}
      {results.length>0&&!filteredView&&<>
        <section className="lab-education-section lab-education-starters" aria-labelledby="lab-education-start-heading">
          <div className="lab-education-section-heading"><h2 id="lab-education-start-heading">Start with the essentials</h2><span>Three introductions to BDSM</span></div>
          <ArticleTiles matches={intro} go={go} featuredId="edu-bd"/>
        </section>
        <section className="lab-education-more" aria-labelledby="lab-education-more-heading">
          <h2 id="lab-education-more-heading">Explore more</h2>
          {sections.filter(section=>more.some(({article})=>article.section===section)).map(section=>
            <section className="lab-education-section" key={section}>
              <h3>{section}</h3>
              <ArticleTiles matches={more.filter(({article})=>article.section===section)} go={go}/>
            </section>)}
        </section>
      </>}
    </>}
  </div>;
}
