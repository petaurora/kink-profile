import { useCallback, useMemo, useState } from "react";
import { useAppServices } from "../../services/AppServicesProvider";
import { useServiceQuery } from "../../services/useServiceQuery";
import type { EducationArticleSummary, EducationSection, RequestOptions } from "../../services/contracts";
import type { LabArea } from "./LabNavigation";
import { LabCard } from "./LabCard";
import { EducationMarkdown, articleBody, articleContentNote } from "./EducationMarkdown";
import "./education.css";

type Go=(area:LabArea,workspace?:string,params?:Record<string,string>)=>void;
const sections:EducationSection[]=[
  "Understanding BDSM", "Consent and scenes", "Kinks, roles, and motivation",
  "Relationship structures", "Collars, symbols, and rituals",
];
const normalized=(text:string)=>text.normalize("NFKC").toLocaleLowerCase().trim();

function ArticleTiles({articles,go}:{articles:EducationArticleSummary[];go:Go}){
  return <div className="lab-education-grid">{articles.map(article=>
    <LabCard key={article.id} title={article.title} icon="✧" description={article.description}
      status={`${article.level} · ${article.readingMinutes} min read`}
      onClick={()=>go("Learn","Article",{id:article.id})}/>)}</div>;
}

/** Read-only Education. Search/reading never writes preference or identity evidence. */
export function EducationWorkspace({view,articleId,go}:{view:string;articleId:string;go:Go}){
  const {education}=useAppServices();
  const [query,setQuery]=useState("");
  const listRequest=useCallback((options:RequestOptions)=>education
    ? education.listArticles(options)
    : Promise.resolve([]),[education]);
  const articleRequest=useCallback((options:RequestOptions)=>education
    ? education.getArticle(articleId,options)
    : Promise.resolve(null),[education,articleId]);
  const list=useServiceQuery(listRequest,Boolean(education));
  const detail=useServiceQuery(articleRequest,Boolean(education)&&view==="Article"&&Boolean(articleId));
  const filtered=useMemo(()=>{
    const term=normalized(query);
    return (list.data??[]).filter(article=>
      !term||normalized([article.title,article.description,article.section,article.level].join(" ")).includes(term));
  },[list.data,query]);
  if(!education)return <section className="lab-section" role="status"><h2>Education isn't connected here yet</h2><p>This adapter does not provide the Education read service. No sample articles were substituted for an unavailable API.</p></section>;
  if(view==="Article"){
    if(!articleId)return <section className="lab-section"><p>No article was selected.</p><button type="button" onClick={()=>go("Learn")}>Browse articles</button></section>;
    if(detail.loading)return <p role="status">Loading article…</p>;
    if(detail.error)return <section className="lab-section" role="alert"><p>Unable to load this article. Nothing has been saved or changed.</p><button type="button" onClick={detail.retry}>Retry article</button><button type="button" onClick={()=>go("Learn")}>Browse articles</button></section>;
    if(!detail.data)return <section className="lab-section"><p>This article is unavailable or its link is out of date.</p><button type="button" onClick={()=>go("Learn")}>Browse articles</button></section>;
    const article=detail.data;
    const related=article.links.filter(link=>link.target.kind==="article");
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
        <p>Related reading, not a statement about your interests or consent.</p>
        <div className="lab-education-related-links">
          {related.map(link=><button type="button" key={link.target.id} onClick={()=>go("Learn","Article",{id:link.target.id})}>{list.data?.find(a=>a.id===link.target.id)?.title??"Read related article"} <span aria-hidden="true">↗</span></button>)}
        </div>
      </section>}
    </div>;
  }
  return <div className="lab-education-library">
    <p className="lab-education-intro">Explore concepts at your own pace. Reading is separate from preferences, identity, and consent.</p>
    <label className="lab-education-search-label" htmlFor="lab-education-search">Search educational articles</label>
    <input id="lab-education-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search topics, titles, and descriptions…" autoComplete="off"/>
    {list.loading&&<p role="status">Loading educational articles…</p>}
    {list.error&&<section className="lab-section" role="alert"><p>Unable to load the Education library.</p><button type="button" onClick={list.retry}>Retry loading articles</button></section>}
    {!list.loading&&!list.error&&<p className="lab-education-results" role="status">{filtered.length} {filtered.length===1?"article":"articles"}{query?" matching your search":""}</p>}
    {!list.loading&&!list.error&&filtered.length===0&&<p>No articles match that search. Try another term.</p>}
    {!list.loading&&!list.error&&sections.filter(section=>filtered.some(article=>article.section===section)).map(section=>
      <section className="lab-education-section" key={section}>
        <h2>{section}</h2>
        <ArticleTiles articles={filtered.filter(article=>article.section===section)} go={go}/>
      </section>)}
  </div>;
}
