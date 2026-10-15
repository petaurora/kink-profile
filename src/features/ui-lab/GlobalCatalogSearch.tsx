import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalLayer } from "../../components/ui/ModalLayer";
import { SearchField } from "../../components/ui/SearchField";
import { SearchChips, SearchFilterButton, SearchRow, SortGroupSheet, type SortBy } from "../../components/ui/SearchControls";
import { CatalogComposite } from "./CatalogComposite";
import { ConceptDetail } from "./ConceptDetail";
import { findSearchResult, searchCatalog, searchSections, type SearchResult } from "./CatalogSearch";

import type { RequestOptions } from "../../services/contracts";
import { useOptionalServices } from "../../services/AppServicesProvider";
import { useLabCatalog } from "./LabCatalog";
import { toLabResult } from "./CatalogSearch";
import "./globalSearch.css";

const localSearch = async (query: string) => searchCatalog(query);
export function GlobalCatalogSearch({ open, onClose, origin, sort, onSort, orderOpen, onOrderOpen, search:providedSearch, targetId, onTargetChange }: {
  open: boolean; onClose: () => void; origin: string; sort: SortBy; onSort: (sort: SortBy) => void;
  orderOpen: boolean; onOrderOpen: (open: boolean) => void;
  targetId?: string; onTargetChange?: (id: string | null) => void;
  search?: (query: string,options?:RequestOptions) => Promise<SearchResult[]>;
}) {
  const services=useOptionalServices();const {data}=useLabCatalog();
  const serviceSearch=useCallback(async(query:string,options?:RequestOptions)=>services?(await services.search.search({text:query},options)).map(result=>toLabResult(result,data)):localSearch(query),[services,data]);
  const search=providedSearch??serviceSearch;
  const resultsId=useId();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [processedQuery, setProcessedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [target, setTarget] = useState<SearchResult | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);
  useEffect(() => {
    let active = true;const controller=new AbortController();
    if(!open)return;
    if (!query.trim()) { setResults([]); setError(false); setLoading(false); setProcessedQuery(""); return; }
    const timer = setTimeout(() => {
      setLoading(true); setError(false);
      search(query,{signal:controller.signal}).then(next => { if(active){setResults(next);setProcessedQuery(query);setError(false);} }, () => { if(active)setError(true); }).finally(() => { if(active)setLoading(false); });
    },200);
    return () => { active=false; clearTimeout(timer); controller.abort(); };
  },[query,retry,search,open]);
  useEffect(()=>{if(targetId!==undefined)setTarget(results.find(result=>result.id===targetId)??findSearchResult(targetId,data)??null);},[targetId,data,results]);
  const clear = () => { setQuery(""); setType("All"); document.getElementById("lab-global-query")?.focus(); };
  const sections = searchSections(results,type,sort);
  const count = results.filter(result=>type==="All"||result.type===type).length;
  const resultsAreCurrent = processedQuery === query;
  const showPreviousResults = Boolean(query.trim() && !resultsAreCurrent && results.length);
  const closeTarget = () => { setTarget(null); onTargetChange?.(null); requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=lastScroll.current}); };
  const select = (result: SearchResult) => { lastScroll.current=scroll.current?.scrollTop||0;setTarget(result); onTargetChange?.(result.id); };
  return <ModalLayer open={open} onClose={()=>{onOrderOpen(false);onClose();}} label="Global catalog search" closeLabel="Close search" className="ui-lab-search-overlay" backdropClassName="ui-lab-search-backdrop" panelClassName="ui-lab-search-dialog">
    <div className="ui-lab-search-page">
      <div className="ui-lab-search-modal-header"><span>Search</span><button type="button" className="ui-lab-search-close" aria-label="Close search" onClick={onClose}>×</button></div>
      <div className="lab-search-sticky"><SearchRow><SearchField mode="input" autoFocus inputId="lab-global-query" ariaLabel="Search catalog" resultsId={resultsId} placeholder="Search catalog…" value={query} onChange={setQuery} onClear={clear}/><SearchFilterButton active={sort!=="default"} groupingAvailable={false} expanded={orderOpen} onClick={()=>onOrderOpen(true)}/></SearchRow>
        <SearchChips label="Search result types" options={["All","Items","Modifiers","Concepts"].map(label=>({id:label,label,active:type===label,onClick:()=>setType(label)}))} clear={type!=="All"?clear:undefined}/>
      </div>
      {!query.trim()&&<><p className="ui-lab-search-label">STARTING FROM {origin.toUpperCase()}</p><p className="ui-lab-search-hint">Search Catalog Items, modifiers and concepts. Choose a type to narrow results.</p><p className="ui-lab-search-label">SUGGESTED SEARCHES</p><div className="ui-lab-search-suggestions">{["Collars","Leather","Ownership"].map(term=><button key={term} onClick={()=>setQuery(term)}>{term} ↗</button>)}</div></>}
      {loading&&<div className="lab-search-loading" role="status" aria-label="Searching"/>}
      {error&&<div role="status" className="cc-error-summary"><span>{results.length?"Previous results · Search update failed":"Search failed"}</span><button type="button" onClick={()=>setRetry(value=>value+1)}>Retry search</button></div>}
      {query.trim()&&<p className="ui-lab-search-label" role="status" aria-atomic="true">{resultsAreCurrent ? `${count} matches` : showPreviousResults ? `${count} previous-query matches · ${error ? "Update failed" : "Updating results"}` : "Searching…"}</p>}
      <div className="ui-lab-search-results lab-search-scroll" id={resultsId} ref={scroll} aria-busy={loading} onTouchMove={()=>document.getElementById("lab-global-query")?.blur()} onWheel={()=>document.getElementById("lab-global-query")?.blur()}>{sections.map(section=><section className="lab-search-results-section" key={section.label}><h3 className="lab-search-results-heading">{section.label}</h3>{section.rows.map(result=><button key={result.id} data-search-result={result.id} onClick={()=>select(result)}><span><strong>{result.name}</strong><small>{result.path} · {result.type}</small></span><span aria-hidden="true">›</span></button>)}</section>)}{query.trim()&&processedQuery===query&&!loading&&!error&&!count&&<p>No matches. Try another term or type.</p>}</div>
      <p className="ui-lab-app-note">Catalog search · Search queries stay in this session only.</p>
      <SortGroupSheet open={orderOpen} onClose={()=>onOrderOpen(false)} sort={sort} onSort={onSort} showGrouping={false} defaultSortLabel="Best matches"/>
      {target?.type==="Concepts"&&<ConceptDetail id={target.conceptId!} onClose={closeTarget}/>}
      {target&&target.type!=="Concepts"&&<div className="lab-search-destination"><CatalogComposite compact initialItem={target.itemName} initialGroup={target.group} initialValue={target.value} subject={target.itemName} onClose={closeTarget}/></div>}
    </div>
  </ModalLayer>;
}
