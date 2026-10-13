import { ToastPlayground } from "./ToastPlayground";
import { CatalogComposite } from "./CatalogComposite";
import { SearchField } from "../../components/ui/SearchField";
import { SearchFilterButton, SearchChips, SortGroupSheet, type SortBy } from "../../components/ui/SearchControls";
import { useCallback, useRef, useState } from "react";
import { ModalLayer } from "../../components/ui/ModalLayer";
import { ToastProvider } from "../../components/ui/ToastProvider";
import { SearchRow } from "../../components/ui/SearchControls";
import { AppServicesProvider, ServiceQueryStatus, useAppServices, useReferenceData } from "../../services/AppServicesProvider";
import { useServiceQuery } from "../../services/useServiceQuery";
import type { AppServices, CatalogSearchTarget, CatalogSubject, RequestOptions, SearchResult } from "../../services/contracts";
import { createUiLabServices, type UiLabAdapter } from "./services/createUiLabServices";
import "./uiLab.css";

type Area = "Home" | "Catalog" | "Profile" | "Discover" | "Tools";
const areas: Area[] = ["Home","Catalog","Profile","Discover","Tools"];
const iconPaths: Record<Area, React.ReactNode> = {
 Home:<><path d="m3.5 10 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9M10 20v-6h4v6"/></>,
 Catalog:<><path d="M12 6.5c-2.8-1.6-5.7-1.7-9-1v13c3.3-.7 6.2-.6 9 1 2.8-1.6 5.7-1.7 9-1v-13c-3.3-.7-6.2-.6-9 1Z"/><path d="M12 6.5v13"/></>,
 Profile:<><circle cx="12" cy="8" r="3.5"/><path d="M5 20v-1.5a7 7 0 0 1 14 0V20"/></>,
 Discover:<><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"/></>,
 Tools:<><path d="M14.8 6.2a5.3 5.3 0 0 0-6.7 6.7L3 18l3 3 5.1-5.1a5.3 5.3 0 0 0 6.7-6.7l-3.4 3.4-3-3 3.4-3.4Z"/></>
};
function NavIcon({area}:{area:Area}){return <svg className="ui-lab-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[area]}</svg>}
const cards: Record<Area,[string,string][]> = {
  Discover:[["Guided discovery","Explore preferences through intentional questions"],["Learn · React · Play","Choose your own way to discover"],["Continue a quiz","Resume only deliberately started sessions"]],
  Catalog:[["Kinks","Explore, compare and refine preferences"],["Rewards & Punishments","Browse, sort and rank"],["Concept Explorer","Learn about concepts and their connections"]],
  Home:[["Continue","Pick up a saved scene or unfinished quiz"],["Your profile at a glance","Themes and deliberate preferences"],["Discover something","Optional ideas, without pressure"],["Your shortcuts","Quick access to the tools you choose"]],
  Profile:[["Your profile","Roles, themes and preference evidence"],["Relationships","Connections and linked profiles"],["Sharing & permissions","Decide what others can see"],["Identity & expression","Your own words and presentation"]],
  Tools:[["Scene Builder","Plan scenes and save drafts"],["Agreements & rituals","Create and maintain shared practices"],["Randomizers & recipes","Get practical inspiration"],["Compare profiles","Compare only with permission"]]
};
function dailyFeatured(subjects:CatalogSubject[]){
 const featured=subjects.filter(s=>s.featured);
 if(!featured.length)return [];
 const day=Math.floor(new Date().setHours(0,0,0,0)/86400000);
 const first=((day%featured.length)+featured.length)%featured.length;
 return [featured[first],featured[(first+2)%featured.length]].filter((s,i,list)=>list.findIndex(x=>x.id===s.id)===i);
}
export function UiLabPage({services}:{services?:AppServices}={}) {
 const [adapter]=useState(createUiLabServices);
 return <AppServicesProvider services={services??adapter.services}><ToastProvider><UiLabContent diagnostics={services?undefined:adapter}/></ToastProvider></AppServicesProvider>;
}
function UiLabContent({diagnostics}:{diagnostics?:UiLabAdapter}) {
 const services=useAppServices();
 const {subjects,concepts}=useReferenceData();
 const featured=dailyFeatured(subjects);
 const featuredSubjects=subjects.filter(s=>s.featured);
 const subjectNames=featuredSubjects.map(s=>s.name);
 const extraSubjects=subjects.filter(s=>!s.featured).map(s=>s.name);
 const [area,setArea]=useState<Area>("Home");
 const [subjectsExpanded,setSubjectsExpanded]=useState(false);
 const [selectedSubject,setSelectedSubject]=useState<string|null>(null);
 const [exploreSubject,setExploreSubject]=useState<string|null>(null);
 const [domain,setDomain]=useState("All");
 const [workspace,setWorkspace]=useState("");
 const [mode,setMode]=useState("Explore");
 const [detail,setDetail]=useState<string|null>(null);
 const [showLab,setShowLab]=useState(false);
 const [toastLabOpen,setToastLabOpen]=useState(false);
 const [catalogSearchOpen,setCatalogSearchOpen]=useState(false);
 const [catalogQuery,setCatalogQuery]=useState("");
 const [catalogType,setCatalogType]=useState("All");
 const [catalogSort,setCatalogSort]=useState<SortBy>("default");
 const [catalogOrderOpen,setCatalogOrderOpen]=useState(false);
 const [searchOrigin,setSearchOrigin]=useState("Catalog");
 const [searchTarget,setSearchTarget]=useState<CatalogSearchTarget|undefined>();
 const openCatalogSearch=(origin="Catalog",openOrder=false)=>{setSearchOrigin(origin);setCatalogType(origin==="Catalog"?"Items":"All");setCatalogOrderOpen(openOrder);setCatalogSearchOpen(true);setMenuOpen(false);};
 const searchRequest=useCallback((options:RequestOptions)=>services.search.search({text:catalogQuery,type:catalogType==="All"?undefined:catalogType as SearchResult["type"],sort:catalogSort},options),[services,catalogQuery,catalogType,catalogSort]);
 const search=useServiceQuery(searchRequest,catalogSearchOpen);
 const searchResults=search.data??[];
 const visibleSearchResults=catalogQuery.trim()?searchResults:searchResults.slice(0,3);
 // Type chips already distinguish global results; category grouping is not useful here.
 const searchSections=[{label:"",rows:visibleSearchResults}];
 const selectSearchResult=(result:SearchResult)=>{
  resetPageScroll();setCatalogSearchOpen(false);setArea("Catalog");setExploreSubject(null);setSelectedSubject(null);
  if("conceptId" in result.target){setWorkspace("Concept Explorer");setSearchTarget(undefined);setDetail(result.name);}
  else {setWorkspace("Explore All");setSearchTarget(result.target);setDetail(null);}
 };
 const [menuOpen,setMenuOpen]=useState(false);
 const [expandedMenu,setExpandedMenu]=useState<Area|null>(null);
 const gestureStart=useRef<{x:number;y:number}|null>(null);
 const menuChildren: Record<Area,string[]> = {
  Home:[],
  Catalog:["Overview","Explore All","Kinks","Rewards & Punishments","Concept Explorer"],
  Profile:["Overview","My Profile","Preferences","Sharing & Permissions"],
  Discover:["Overview","Learn","React","Play"],
  Tools:["Overview","Scene Builder","Agreements & Rituals","Compare Profiles"]
 };
 const openMenuChild=(parent:Area,child:string)=>{
  navigate(parent);
  if(parent==="Catalog") { if(child==="Overview")setWorkspace("");else choose(child); }
  else if(parent==="Discover"){if(child!=="Overview")setMode(child);else setMode("Explore");}
  else if(parent==="Profile"||parent==="Tools"){setWorkspace(child==="Overview"?"":child);}
 };
 const modalActive=()=>Boolean(document.querySelector(".ui-lab [aria-modal=\"true\"]:not(#ui-lab-full-menu)"));
 const onGestureStart=(event:React.TouchEvent)=>{
  if(modalActive()){gestureStart.current=null;return;}
  const t=event.touches[0];if(t)gestureStart.current={x:t.clientX,y:t.clientY};
 };
 const onGestureEnd=(event:React.TouchEvent)=>{
  if(modalActive()){gestureStart.current=null;return;}
  const start=gestureStart.current;gestureStart.current=null;
  const t=event.changedTouches[0];if(!start||!t)return;
  const dx=t.clientX-start.x,dy=t.clientY-start.y;
  if(menuOpen){if(dx < -60 && Math.abs(dx)>Math.abs(dy)*1.6)setMenuOpen(false);return;}
  // Only a deliberate horizontal right swipe opens the drawer; diagonal scrolling remains native.
  if(dx>85&&Math.abs(dx)>Math.abs(dy)*2.2)openDrawer();
 };
 const resetPageScroll=()=>{window.scrollTo({top:0,left:0,behavior:"instant"});requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"instant"}));};
 const navigate=(next:Area)=>{
   resetPageScroll();
   setArea(next);setWorkspace("");setSelectedSubject(null);setExploreSubject(null);setSearchTarget(undefined);setDetail(null);setDomain("All");setMenuOpen(false);
 };
 const choose=(name:string)=>{resetPageScroll();setArea("Catalog");setSelectedSubject(null);setExploreSubject(null);setSearchTarget(undefined);setWorkspace(name);setMode("Explore");setDetail(null);};
 const openSubject=(name:string)=>{resetPageScroll();setArea("Catalog");setSelectedSubject(name);setWorkspace("Subject Overview");setDetail(null);};
 const exploreRelated=()=>{resetPageScroll();setExploreSubject(selectedSubject);setSelectedSubject(null);setWorkspace("Explore All");};
 const activeChild=(parent:Area)=>parent!==area?null:parent==="Catalog"?(workspace||"Overview"):parent==="Discover"?(mode==="Explore"?"Overview":mode):(workspace||"Overview");
 const openDrawer=()=>{if(modalActive())return;setExpandedMenu(area==="Home"?null:area);setMenuOpen(true);};
 const heading=(selectedSubject||workspace)||({Home:"Your space.",Discover:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools."} as Record<Area,string>)[area];
 return <div className="ui-lab ui-lab-app" onTouchStart={onGestureStart} onTouchEnd={onGestureEnd}>
  <aside className="ui-lab-app-rail" aria-label="Primary navigation">
   <div className="ui-lab-app-brand">♡ <strong>Kink Profile</strong><small>UI LAB</small></div>
   {areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span>{item}</button>)}
   <button className="ui-lab-app-rail-lab" onClick={()=>setShowLab(!showLab)}>⚙ Design lab</button>
  </aside>
  <div className="ui-lab-app-frame">
   <header className="ui-lab-app-header">
    <button type="button" className="ui-lab-header-action" aria-label="Open full menu" aria-expanded={menuOpen} aria-controls="ui-lab-full-menu" onClick={openDrawer}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <button type="button" className="ui-lab-app-logo" onClick={()=>navigate("Home")} aria-label="Kink Profile, go to Home"><span className="ui-lab-brand-mark" aria-hidden="true">♡</span><span>Kink Profile</span></button>
    <div className="ui-lab-header-actions">
      <button type="button" className="ui-lab-header-action" aria-label="Search" onClick={()=>openCatalogSearch(area)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.5 4.5"/></svg>
      </button>
    </div>
   </header>
   <ModalLayer open={menuOpen} onClose={()=>setMenuOpen(false)} label="Full navigation menu" closeLabel="Close navigation menu" id="ui-lab-full-menu" className="ui-lab-menu-layer" backdropClassName="ui-lab-menu-backdrop" panelClassName="ui-lab-menu-drawer">
       <div className="ui-lab-menu-heading"><span className="ui-lab-menu-title"><span aria-hidden="true">♡</span> Kink Profile</span><button type="button" className="ui-lab-menu-close" aria-label="Close menu" onClick={()=>setMenuOpen(false)}>×</button></div>
       <p className="ui-lab-menu-eyebrow">YOUR SPACE</p>
       <nav aria-label="All destinations" className="ui-lab-menu-links">
         {areas.map(item=><div className="ui-lab-menu-group" key={item}>
          <button type="button" className={"ui-lab-menu-parent ui-lab-menu-parent-button "+(area===item?"selected":"")} aria-current={area===item&&item==="Home"?"page":undefined} aria-expanded={menuChildren[item].length?expandedMenu===item:undefined} onClick={()=>{if(!menuChildren[item].length)navigate(item);else setExpandedMenu(expandedMenu===item?null:item);}}>
           <span className="ui-lab-menu-link-icon"><NavIcon area={item}/></span><span className="ui-lab-menu-parent-label">{item}</span>
           {menuChildren[item].length>0&&<span className={"ui-lab-menu-chevron "+(expandedMenu===item?"expanded":"")} aria-hidden="true">›</span>}
          </button>
          {expandedMenu===item&&menuChildren[item].length>0&&<div className="ui-lab-menu-subitems ui-lab-menu-branches">{menuChildren[item].map((child,index)=><button type="button" key={child} style={{animationDelay:index*55+"ms"}} className={"ui-lab-menu-child "+(activeChild(item)===child?"active":"")+(index===menuChildren[item].length-1?" last":"")} aria-current={activeChild(item)===child?"page":undefined} onClick={()=>openMenuChild(item,child)}><svg className="ui-lab-menu-branch" viewBox="0 0 28 40" preserveAspectRatio="none" aria-hidden="true"><path d="M2 0 V17 Q2 24 10 24 H27"/>{index!==menuChildren[item].length-1&&<path d="M2 17 V40"/>}</svg><span>{child}</span></button>)}</div>}
         </div>)}
       </nav>
       <div className="ui-lab-menu-divider"/>
       <p className="ui-lab-menu-eyebrow">MORE TO EXPLORE</p>
       <div className="ui-lab-menu-links">
         {(["Creations","Learn","Relationships"] as const).map((item,i)=><button type="button" key={item} onClick={()=>{setMenuOpen(false);setDetail(item+" · Coming soon");}}><span className="ui-lab-menu-link-icon" aria-hidden="true">{["◇","✧","♡"][i]}</span><span>{item}</span><small>Preview</small></button>)}
       </div>
       <div className="ui-lab-menu-bottom">
         <button type="button" className="ui-lab-menu-settings" onClick={()=>{setMenuOpen(false);setDetail("Settings · Coming soon");}}>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.8 2.8-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.07 1.55V21h-4v-.12A1.7 1.7 0 0 0 8.93 19.3a1.7 1.7 0 0 0-1.87.34L7 19.7l-2.8-2.8.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.07H3v-4h.05A1.7 1.7 0 0 0 4.6 8.86a1.7 1.7 0 0 0-.34-1.87L4.2 6.93l2.8-2.8.06.06a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 10 2.98V3h4v-.02a1.7 1.7 0 0 0 1.07 1.55 1.7 1.7 0 0 0 1.87-.34L17 4.13l2.8 2.8-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.55 1.07H21v4h-.05A1.7 1.7 0 0 0 19.4 15Z"/></svg>
           <span>Settings</span><span aria-hidden="true" className="ui-lab-menu-settings-arrow">›</span>
         </button>
         <div className="ui-lab-menu-footer">Explore freely. Your preferences stay yours.</div>
       </div>
   </ModalLayer>
   <ModalLayer open={catalogSearchOpen} onClose={()=>{setCatalogOrderOpen(false);setCatalogSearchOpen(false)}} label="Global catalog search" closeLabel="Close search" className="ui-lab-search-overlay" backdropClassName="ui-lab-search-backdrop" panelClassName="ui-lab-search-dialog"><div className="ui-lab-search-page">
    <div className="ui-lab-search-modal-header"><span>Search</span><button type="button" className="ui-lab-search-close" aria-label="Close search" onClick={()=>setCatalogSearchOpen(false)}>×</button></div>
    <SearchRow><SearchField mode="input" autoFocus ariaLabel="Search catalog" placeholder="Search catalog…" value={catalogQuery} onChange={setCatalogQuery} onClear={()=>setCatalogQuery("")} /><SearchFilterButton active={catalogSort!=="default"} groupingAvailable={false} expanded={catalogOrderOpen} onClick={()=>setCatalogOrderOpen(true)}/></SearchRow>
    <SearchChips label="Search result types" options={["All","Items","Modifiers","Concepts"].map(t=>({id:t,label:t,active:catalogType===t,onClick:()=>setCatalogType(t)}))} />
    {!catalogQuery.trim()&&<><p className="ui-lab-search-label">STARTING FROM {searchOrigin.toUpperCase()}</p><p className="ui-lab-search-hint">Search is scoped to Catalog content in this prototype.</p><p className="ui-lab-search-label">SUGGESTED SEARCHES</p><div className="ui-lab-search-suggestions">{["Collars","Leather","Ownership"].map(q=><button key={q} onClick={()=>setCatalogQuery(q)}>{q} ↗</button>)}</div></>}
    {catalogQuery.trim()&&<p className="ui-lab-search-label">BEST MATCHES · {searchResults.length}</p>}
    <ServiceQueryStatus loading={search.loading} error={search.error} onRetry={search.retry} label="search results"/><div className="ui-lab-search-results" aria-busy={search.loading}>{searchSections.map(section=><section className="lab-search-results-section" key={section.label||"all"}>{section.label&&<h3 className="lab-search-results-heading">{section.label}</h3>}{section.rows.map(r=><button key={r.id} onClick={()=>selectSearchResult(r)}><span><strong>{r.name}</strong><small>{r.path} · {r.type}</small></span><span>›</span></button>)}</section>)}{catalogQuery.trim()&&!search.loading&&!search.error&&searchResults.length===0&&<p>No matches in this prototype. Try another term or filter.</p>}</div>
    <p className="ui-lab-app-note">Search uses the sample Catalog service</p>
    <SortGroupSheet open={catalogOrderOpen} onClose={()=>setCatalogOrderOpen(false)} sort={catalogSort} onSort={setCatalogSort} showGrouping={false} defaultSortLabel="Best matches" />
   </div></ModalLayer>
   <main className="ui-lab-app-content">
    {workspace?<nav className="ui-lab-breadcrumbs" aria-label="Breadcrumb"><button type="button" onClick={()=>{resetPageScroll();setWorkspace("");setSelectedSubject(null);setExploreSubject(null);setDetail(null)}}>{area}</button><span aria-hidden="true">›</span><span aria-current="page">{workspace}</span></nav>:<p className="ui-lab-app-kicker">{area.toUpperCase()}</p>}
    <h1 className={workspace?"ui-lab-workspace-title":""}>{heading}</h1>
    {!workspace&&<p className="ui-lab-app-lede">{area==="Home"?"A home for everything you're exploring, building and becoming.":area==="Catalog"?"Browse freely. Record preferences only when you choose.":area==="Discover"?"Learn, react or play — your curiosity sets the pace.":area==="Profile"?"Your story, your preferences, and the people you choose to share with.":"Practical spaces for scenes, rituals, agreements and more."}</p>}
    {area==="Catalog"&&<div className="ui-lab-catalog">

      {!workspace&&<>
        <SearchRow><SearchField mode="launch" placeholder="Search the Catalog…" onActivate={()=>openCatalogSearch("Catalog")} /><SearchFilterButton active={catalogSort!=="default"} groupingAvailable={false} onClick={()=>openCatalogSearch("Catalog",true)}/></SearchRow>
        <section className="ui-lab-collections" aria-label="Browse collections"><h2>Browse collections</h2><button onClick={()=>choose("Kinks")}><span><strong>Kinks</strong><small>Explore preferences and refinements</small></span><span aria-hidden="true">→</span></button><button onClick={()=>choose("Rewards & Punishments")}><span><strong>Rewards & Punishments</strong><small>Explore rewards, punishments and personal classifications</small></span><span aria-hidden="true">→</span></button></section>
        <section className="ui-lab-subjects-featured" aria-label="Featured subjects">
          <div className="ui-lab-subject-section-title"><h2>Featured subjects</h2><small>Today's discoveries</small></div>
          <div className="ui-lab-subject-feature-grid">{featured.map(subject=><button type="button" key={subject.name} className={"ui-lab-subject-feature ui-lab-subject-"+subject.featured?.tone} onClick={()=>openSubject(subject.name)}><span className="ui-lab-subject-art" aria-hidden="true">{subject.featured?.symbol}</span><span className="ui-lab-subject-feature-copy"><strong>{subject.name}</strong><small>{subject.description}</small></span><span className="ui-lab-subject-feature-arrow" aria-hidden="true">↗</span></button>)}</div>
        </section>
        <button className="ui-lab-catalog-all" onClick={()=>choose("Explore All")}><span><strong>Explore All</strong><small>Browse the complete Catalog</small></span><span aria-hidden="true">→</span></button>
        <section className="ui-lab-more-subjects"><h2>More subjects</h2><div className="ui-lab-subject-chips">{[...subjectNames.filter(name=>!featured.some(f=>f.name===name)),...extraSubjects].slice(0,subjectsExpanded?undefined:6).map(name=><button type="button" key={name} onClick={()=>openSubject(name)}>{name}</button>)}</div><button className="ui-lab-subject-more" aria-expanded={subjectsExpanded} onClick={()=>setSubjectsExpanded(v=>!v)}>{subjectsExpanded?"Show Less ↑":"Show More ↓"}</button></section>
      </>}
      {workspace==="Subject Overview"&&selectedSubject&&<section className="ui-lab-subject-overview"><p>{featuredSubjects.find(x=>x.name===selectedSubject)?.description||"Explore related Catalog Items and refine your preferences."}</p><div className="ui-lab-subject-related-head"><h2>Related Items</h2><button onClick={exploreRelated}>View All Related Items →</button></div><CatalogComposite compact subject={selectedSubject} diagnostics={diagnostics}/></section>}
      {workspace==="Explore All"&&<>{exploreSubject&&<div className="ui-lab-subject-filter-note"><span>Exploring: {exploreSubject}</span><button onClick={()=>{setExploreSubject(null);resetPageScroll()}}>Clear subject ×</button></div>}<CatalogComposite key={exploreSubject||"all"} subject={exploreSubject||undefined} initialTarget={searchTarget} diagnostics={diagnostics} />
      </>}
      {workspace==="Concept Explorer"&&<><SearchRow><SearchField mode="launch" placeholder="Search concepts…" onActivate={()=>openCatalogSearch("Concept Explorer")} /><SearchFilterButton active={catalogSort!=="default"} groupingAvailable={false} onClick={()=>openCatalogSearch("Concept Explorer",true)}/></SearchRow><div className="ui-lab-catalog-items">{concepts.map(item=><button key={item.id} onClick={()=>setDetail(item.name)}>{item.name}<span>›</span></button>)}</div></>}
      {workspace==="Kinks"&&<CatalogComposite diagnostics={diagnostics}/>}
      {workspace==="Rewards & Punishments"&&<><p className="ui-lab-rp-note">Illustrative classifications for testing filters · Classification editing in Refine comes later.</p><CatalogComposite collection="rewards" diagnostics={diagnostics}/></>}    </div>}
    {area==="Discover"&&<div className="ui-lab-app-modes">{["Learn","React","Play"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>}
    {area!=="Catalog"&&<div className="ui-lab-app-grid">{(workspace?[[workspace,"Your working space and saved drafts."],...cards[area].filter(x=>x[0]!==workspace)]:cards[area]).map(([title,description],i)=><button className={"ui-lab-app-tile "+(i===0?"featured":"")} key={title} onClick={()=>setDetail(title)}><span className="ui-lab-app-tile-icon">{["✧","♡","◇","✦"][i%4]}</span><strong>{title}</strong><small>{description}</small><span className="ui-lab-app-tile-arrow">↗</span></button>)}</div>}
    {!(area==="Catalog"&&workspace==="Explore All")&&<p className="ui-lab-app-note">Experimental shell · Sample data · Preferences last for this Lab session</p>}
    <button type="button" className="ui-lab-app-switch" onClick={()=>setToastLabOpen(v=>!v)} aria-expanded={toastLabOpen}>{toastLabOpen?"− Hide":"✦ Open"} Toast Playground</button>
    {toastLabOpen&&<ToastPlayground/>}
    {showLab&&<section className="ui-lab-app-design"><h2>Design lab</h2><p>This entire screen is the shell prototype, not a preview inside another page.</p><div className="ui-lab-app-swatches">{["#101240","#520E25","#F0D3E7"].map(color=><div key={color} style={{background:color}} title={color}/>)}</div><a href="#/hub">Return to production app</a></section>}
   </main>
   
   <ModalLayer open={!!detail} onClose={()=>setDetail(null)} label={detail||"Details"} className="ui-lab-app-overlay" panelClassName="ui-lab-detail-dialog"><button type="button" onClick={()=>setDetail(null)} aria-label="Close">×</button><h2>{detail}</h2>{concepts.some(c=>c.name===detail)?<p>{concepts.find(c=>c.name===detail)?.description}</p>:<p>Placeholder for the future {detail?.toLowerCase()} experience.</p>}</ModalLayer>

   <nav className="ui-lab-app-bottom" aria-label="Primary mobile navigation">{areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span><small>{item}</small></button>)}</nav>
  </div>
 </div>;
}
