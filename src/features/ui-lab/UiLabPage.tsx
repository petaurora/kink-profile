import { appIcons, appIconDefaults } from "../../components/ui/appIcons";
import { ToastPlayground } from "./ToastPlayground";
import { CatalogComposite } from "./CatalogComposite";
import { SearchField } from "../../components/ui/SearchField";
import { SearchFilterButton, type SortBy } from "../../components/ui/SearchControls";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ModalLayer } from "../../components/ui/ModalLayer";
import { ToastProvider } from "../../components/ui/ToastProvider";
import { SearchRow } from "../../components/ui/SearchControls";
import { useLocation, useNavigate } from "react-router-dom";
import { ViewErrorBoundary } from "../../components/ui/ViewErrorBoundary";
import { DiscoverSessionProvider } from "./DiscoverSession";
import { DiscoverWorkspace } from "./DiscoverWorkspace";
import { LabOverview } from "./LabOverview";
import { EducationWorkspace } from "./EducationWorkspace";
import { labPath, parseLabRoute, primaryAreas, type LabArea, type PrimaryArea } from "./LabNavigation";
import "./uiLab.css";
import "./labFoundations.css";
import { GlobalCatalogSearch } from "./GlobalCatalogSearch";
import { ConceptDetail } from "./ConceptDetail";
import type { AppServices } from "../../services/contracts";
import { AppServicesProvider } from "../../services/AppServicesProvider";
import { createUiLabServices } from "./services/createUiLabServices";
import { useLabCatalog } from "./LabCatalog";
import { LabRecordsProvider, LabSaveSummary } from "./LabRecords";

declare const __KP_BUILD_SHA__: string;
type Area=PrimaryArea;
const areas=primaryAreas;
const navigationIcons: Record<Area, keyof typeof appIcons> = {
 Home: "home", Catalog: "catalog", Profile: "profile", Discover: "discover", Tools: "tools"
};
function NavIcon({area}:{area:Area}) {
 const Icon = appIcons[navigationIcons[area]];
 return <Icon className="ui-lab-nav-icon" {...appIconDefaults} aria-hidden="true" />;
}
function dailyFeatured(subjects:{name:string;description:string;symbol:string;tone:string}[]){if(!subjects.length)return [];const day=Math.floor(new Date().setHours(0,0,0,0)/86400000);const first=((day%subjects.length)+subjects.length)%subjects.length;return [subjects[first],subjects[(first+2)%subjects.length]].filter((subject,index,list)=>list.findIndex(x=>x.name===subject.name)===index);}
export function UiLabPage({services}:{services?:AppServices}={}) {
 const location=useLocation();const routerNavigate=useNavigate();
 const [adapter]=useState(createUiLabServices);
 return <AppServicesProvider services={services??adapter.services}><ToastProvider><LabRecordsProvider diagnostics={services?undefined:adapter}><DiscoverSessionProvider><ViewErrorBoundary resetKey={location.pathname} onHome={()=>routerNavigate(labPath("Home"))}><UiLabContent/></ViewErrorBoundary></DiscoverSessionProvider></LabRecordsProvider></ToastProvider></AppServicesProvider>;
}
function UiLabContent() {
 const {data,concepts}=useLabCatalog();
 const featuredSubjects=useMemo(()=>data.subjects.filter(subject=>subject.featured).map(subject=>({...subject,...subject.featured!})),[data]);
 const subjectNames=featuredSubjects.map(subject=>subject.name);
 const extraSubjects=data.subjects.filter(subject=>!subject.featured).map(subject=>subject.name);
 const pageHeading=useRef<HTMLHeadingElement>(null);const contentId=useId();const hasNavigated=useRef(false);
 const location=useLocation();const routerNavigate=useNavigate();
 const {area,workspace,params,unknown}=parseLabRoute(location.pathname,location.search);
 const selectedSubject=workspace==="Subject Overview"?params.get("subject"):null;
 const exploreSubject=workspace==="Explore All"?params.get("subject"):null;
 const catalogSearchOpen=params.get("overlay")==="search"||params.has("target");
 const conceptId=params.get("concept");
 const [collapsedRail,setCollapsedRail]=useState(false);
 const [shortcuts,setShortcuts]=useState<LabArea[]>(["Catalog","Discover","Tools"]);
 const [subjectsExpanded,setSubjectsExpanded]=useState(false);
 const [featured,setFeatured]=useState(()=>dailyFeatured(featuredSubjects));
 const [showLab,setShowLab]=useState(false);
 const [toastLabOpen,setToastLabOpen]=useState(false);
 const [catalogSort,setCatalogSort]=useState<SortBy>("default");
 const [catalogOrderOpen,setCatalogOrderOpen]=useState(false);
 const [searchOrigin,setSearchOrigin]=useState("Catalog");
 const layerPath=(next:URLSearchParams)=>location.pathname+(next.size?"?"+next.toString():"");
 const openLayer=(key:string,value:string)=>{const next=new URLSearchParams(params);next.set(key,value);routerNavigate(layerPath(next),{state:{labParent:location.pathname+location.search}});};
 const closeLayer=(key:string)=>{
  if(location.state?.labParent){routerNavigate(-1);return;}
  const next=new URLSearchParams(params);next.delete(key);if(key==="overlay")next.delete("target");routerNavigate(layerPath(next),{replace:true});
 };
 const openCatalogSearch=(origin="Catalog",openOrder=false)=>{setSearchOrigin(origin);setCatalogOrderOpen(openOrder);openLayer("overlay","search");setMenuOpen(false);};
 const [menuOpen,setMenuOpen]=useState(false);
 const [expandedMenu,setExpandedMenu]=useState<Area|null>(null);
 const gestureStart=useRef<{x:number;y:number}|null>(null);
 const menuChildren: Record<Area,string[]> = {
  Home:[],
  Catalog:["Overview","Explore All","Kinks","Rewards & Punishments","Concept Explorer"],
  Profile:["Overview","My Profile","Preferences","Sharing & Permissions","Identity & Expression"],
  Discover:["Overview","React","Play"],
  Tools:["Overview","Scene Builder","Agreements & Rituals","Randomizers & Recipes","Compare Profiles"]
 };
 const openMenuChild=(parent:Area,child:string)=>go(parent,child==="Overview"?"":child);
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
 const go=(next:LabArea,nextWorkspace="",nextParams?:Record<string,string>)=>{
  resetPageScroll();setMenuOpen(false);routerNavigate(labPath(next,nextWorkspace,nextParams));
 };
 const navigate=(next:LabArea)=>go(next);
 const choose=(name:string)=>go("Catalog",name);
 const openSubject=(name:string)=>go("Catalog","Subject Overview",{subject:name});
 const exploreRelated=()=>go("Catalog","Explore All",selectedSubject?{subject:selectedSubject}:undefined);
 useEffect(()=>{if(area==="Catalog")setFeatured(dailyFeatured(featuredSubjects));},[area,featuredSubjects]);
 const activeChild=(parent:Area)=>parent===area?(workspace||"Overview"):null;
 const openDrawer=()=>{if(modalActive())return;setExpandedMenu(area!=="Home"&&areas.includes(area as PrimaryArea)?area as PrimaryArea:null);setMenuOpen(true);};
 const heading=(selectedSubject||workspace)||({Home:"Your space.",Discover:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools.",Creations:"Creations",Learn:"Learn",Relationships:"Relationships",Settings:"Settings"} as Record<LabArea,string>)[area];
 useEffect(()=>{if(hasNavigated.current)pageHeading.current?.focus();hasNavigated.current=true;},[area,workspace,selectedSubject]);
 useEffect(()=>{const previous=document.title;document.title=`${heading} · Kink Profile`;return()=>{document.title=previous};},[heading]);
 return <div className={"ui-lab ui-lab-app"+(collapsedRail?" lab-rail-collapsed":"")} onTouchStart={onGestureStart} onTouchEnd={onGestureEnd}>
  <a className="ui-lab-skip-link" href={`#${contentId}`} onClick={event=>{event.preventDefault();pageHeading.current?.focus();pageHeading.current?.scrollIntoView({block:"start"})}}>Skip to content</a>
  <nav className="ui-lab-app-rail" aria-label="Primary navigation"><button className="lab-rail-toggle" aria-label={collapsedRail?"Expand sidebar":"Collapse sidebar"} onClick={()=>setCollapsedRail(!collapsedRail)}>{collapsedRail?"›":"‹"}</button>
   <div className="ui-lab-app-brand">♡ <strong>Kink Profile</strong><small>UI LAB</small></div>
   {areas.map(item=><button key={item} type="button" aria-label={item} aria-current={area===item?"page":undefined} className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span><span className="lab-rail-label">{item}</span></button>)}
   <button className="ui-lab-app-rail-lab" aria-expanded={showLab} onClick={()=>setShowLab(!showLab)}>⚙ Design lab</button>
   <div className="ui-lab-rail-version" aria-label={`App version ${__KP_BUILD_SHA__}`} title={`Build commit ${__KP_BUILD_SHA__}`}><span className="lab-rail-label">Build </span><code>{__KP_BUILD_SHA__}</code></div>
  </nav>
  <div className="ui-lab-app-frame">
   <header className="ui-lab-app-header">
    <button type="button" className="ui-lab-header-action" aria-label="Open full menu" aria-expanded={menuOpen} aria-controls="ui-lab-full-menu" onClick={openDrawer}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <button type="button" className="ui-lab-app-logo" onClick={()=>navigate("Home")} aria-label="Kink Profile, go to Home"><span className="ui-lab-brand-mark" aria-hidden="true">♡</span><span>Kink Profile</span></button>
    <div className="ui-lab-header-actions">
      <button type="button" className="ui-lab-header-action" aria-label="Search" onClick={()=>openCatalogSearch(area)}>
        <appIcons.search {...appIconDefaults} aria-hidden="true" />
      </button>
      <button type="button" className="ui-lab-header-action" aria-label="Open profile" onClick={()=>navigate("Profile")}><appIcons.profile {...appIconDefaults} aria-hidden="true" /></button>
    </div>
   </header>
   <ModalLayer open={menuOpen} onClose={()=>setMenuOpen(false)} label="Full navigation menu" closeLabel="Close navigation menu" id="ui-lab-full-menu" className="ui-lab-menu-layer" backdropClassName="ui-lab-menu-backdrop" panelClassName="ui-lab-menu-drawer">
       <div className="ui-lab-menu-heading"><span className="ui-lab-menu-title"><span aria-hidden="true">♡</span> Kink Profile</span><button type="button" className="ui-lab-menu-close" aria-label="Close menu" onClick={()=>setMenuOpen(false)}><appIcons.close {...appIconDefaults} aria-hidden="true" /></button></div>
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
         {(["Creations","Learn","Relationships"] as const).map((item,i)=><button type="button" key={item} aria-current={area===item?"page":undefined} onClick={()=>navigate(item)}><span className="ui-lab-menu-link-icon" aria-hidden="true">{(() => { const Icon = [appIcons.collection, appIcons.education, appIcons.shared][i]; return <Icon {...appIconDefaults} />; })()}</span><span>{item}</span></button>)}
       </div>
       <div className="ui-lab-menu-bottom">
         <button type="button" className="ui-lab-menu-settings" aria-current={area==="Settings"?"page":undefined} onClick={()=>navigate("Settings")}>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.8 2.8-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.07 1.55V21h-4v-.12A1.7 1.7 0 0 0 8.93 19.3a1.7 1.7 0 0 0-1.87.34L7 19.7l-2.8-2.8.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.07H3v-4h.05A1.7 1.7 0 0 0 4.6 8.86a1.7 1.7 0 0 0-.34-1.87L4.2 6.93l2.8-2.8.06.06a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 10 2.98V3h4v-.02a1.7 1.7 0 0 0 1.07 1.55 1.7 1.7 0 0 0 1.87-.34L17 4.13l2.8 2.8-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.55 1.07H21v4h-.05A1.7 1.7 0 0 0 19.4 15Z"/></svg>
           <span>Settings</span><span aria-hidden="true" className="ui-lab-menu-settings-arrow">›</span>
         </button>
         <div className="ui-lab-menu-footer">Explore freely. Your preferences stay yours.</div>
       </div>
   </ModalLayer>
   <GlobalCatalogSearch open={catalogSearchOpen} onClose={()=>{closeLayer("overlay");setCatalogOrderOpen(false)}} origin={searchOrigin} sort={catalogSort} onSort={setCatalogSort} orderOpen={catalogOrderOpen} onOrderOpen={setCatalogOrderOpen} targetId={params.get("target")||""} onTargetChange={id=>id?openLayer("target",id):closeLayer("target")}/>
   {conceptId&&<ConceptDetail id={conceptId} onClose={()=>closeLayer("concept")}/>}
   <main id={contentId} className={"ui-lab-app-content"+(area==="Learn"?" lab-education-page":"")} aria-labelledby="ui-lab-page-heading">
    {unknown&&<p role="alert">This Lab destination is unavailable. <button onClick={()=>navigate("Home")}>Return Home</button></p>}
    {area!=="Catalog"&&<LabSaveSummary/>}
    {workspace?<nav className="ui-lab-breadcrumbs" aria-label="Breadcrumb"><button type="button" onClick={()=>navigate(area)}>{area}</button><span aria-hidden="true">›</span><span aria-current="page">{workspace}</span></nav>:<p className="ui-lab-app-kicker">{area.toUpperCase()}</p>}
    <h1 id="ui-lab-page-heading" ref={pageHeading} tabIndex={-1} className={workspace?"ui-lab-workspace-title":""}>{heading}</h1>
    {!workspace&&<p className="ui-lab-app-lede">{area==="Home"?"A home for everything you're exploring, building and becoming.":area==="Catalog"?"Browse freely. Record preferences only when you choose.":area==="Discover"?"Learn, react or play — your curiosity sets the pace.":area==="Profile"?"Your story, your preferences, and the people you choose to share with.":area==="Learn"?"A library for curiosity, questions, and safer exploration.":"Practical spaces for scenes, rituals, agreements and more."}</p>}
    {area==="Catalog"&&<div className="ui-lab-catalog">

      {!workspace&&<>
        <SearchRow><SearchField mode="launch" placeholder="Search the Catalog…" onActivate={()=>openCatalogSearch("Catalog")} /><SearchFilterButton active={catalogSort!=="default"} groupingAvailable={false} onClick={()=>openCatalogSearch("Catalog",true)}/></SearchRow>
        <section className="ui-lab-collections" aria-label="Browse collections"><h2>Browse collections</h2><button onClick={()=>choose("Kinks")}><span><strong>Kinks</strong><small>Explore preferences and refinements</small></span><span aria-hidden="true">→</span></button><button onClick={()=>choose("Rewards & Punishments")}><span><strong>Rewards & Punishments</strong><small>Explore rewards, punishments and personal classifications</small></span><span aria-hidden="true">→</span></button></section>
        <section className="ui-lab-subjects-featured" aria-label="Featured subjects">
          <div className="ui-lab-subject-section-title"><h2>Featured subjects</h2><small>Today's discoveries</small></div>
          <div className="ui-lab-subject-feature-grid">{featured.map(subject=><button type="button" key={subject.name} className={"ui-lab-subject-feature ui-lab-subject-"+subject.tone} onClick={()=>openSubject(subject.name)}><span className="ui-lab-subject-art" aria-hidden="true">{subject.symbol}</span><span className="ui-lab-subject-feature-copy"><strong>{subject.name}</strong><small>{subject.description}</small></span><span className="ui-lab-subject-feature-arrow" aria-hidden="true">↗</span></button>)}</div>
        </section>
        <button className="ui-lab-catalog-all" onClick={()=>choose("Explore All")}><span><strong>Explore All</strong><small>Browse the complete Catalog</small></span><span aria-hidden="true">→</span></button>
        <section className="ui-lab-more-subjects"><h2>More subjects</h2><div className="ui-lab-subject-chips">{[...subjectNames.filter(name=>!featured.some(f=>f.name===name)),...extraSubjects].slice(0,subjectsExpanded?undefined:6).map(name=><button type="button" key={name} onClick={()=>openSubject(name)}>{name}</button>)}</div><button className="ui-lab-subject-more" aria-expanded={subjectsExpanded} onClick={()=>setSubjectsExpanded(v=>!v)}>{subjectsExpanded?"Show Less ↑":"Show More ↓"}</button></section>
      </>}
      {workspace==="Subject Overview"&&selectedSubject&&<section className="ui-lab-subject-overview"><p>{data.subjects.find(x=>x.name===selectedSubject)?.description||"Explore related Catalog Items and refine your preferences."}</p><div className="ui-lab-subject-related-head"><h2>Related Items</h2><button onClick={exploreRelated}>View All Related Items →</button></div><CatalogComposite compact subject={selectedSubject} initialItem={undefined}/></section>}
      {workspace==="Explore All"&&<>{exploreSubject&&<div className="ui-lab-subject-filter-note"><span>Exploring: {exploreSubject}</span><button onClick={()=>go("Catalog","Explore All")}>Clear subject ×</button></div>}<CatalogComposite key={exploreSubject||"all"} subject={exploreSubject||undefined} />
      </>}
      {workspace==="Concept Explorer"&&<><SearchRow><SearchField mode="launch" placeholder="Search concepts…" onActivate={()=>openCatalogSearch("Concept Explorer")} /><SearchFilterButton active={catalogSort!=="default"} groupingAvailable={false} onClick={()=>openCatalogSearch("Concept Explorer",true)}/></SearchRow><div className="ui-lab-catalog-items">{concepts.map(item=><button key={item.id} onClick={()=>openLayer("concept",item.id)}>{item.name}<span>›</span></button>)}</div></>}
      {workspace==="Kinks"&&<CatalogComposite />}
      {workspace==="Rewards & Punishments"&&<><p className="ui-lab-rp-note">Illustrative classifications for testing filters · Classification editing in Refine comes later.</p><CatalogComposite collection="rewards" /></>}    </div>}
    {area==="Discover"&&<DiscoverWorkspace view={workspace} attemptId={params.get("attempt")||undefined} go={go}/>}
    {area==="Learn"&&<EducationWorkspace view={workspace} articleId={params.get("id")||""} go={go}/>}
    {area!=="Catalog"&&area!=="Discover"&&area!=="Learn"&&<LabOverview area={area} workspace={workspace} go={go} shortcuts={shortcuts} onShortcuts={setShortcuts}/>}
    {!(area==="Catalog"&&workspace==="Explore All")&&<p className="ui-lab-app-note">{area==="Learn"?"Experimental reader · Editorial drafts pending review · Reading does not save preferences":"Experimental UI · Illustrative content · Records and activity notes last for this mounted Lab session"}</p>}
    <button type="button" className="ui-lab-app-switch" onClick={()=>setToastLabOpen(v=>!v)} aria-expanded={toastLabOpen}>{toastLabOpen?"− Hide":"✦ Open"} Toast Playground</button>
    {toastLabOpen&&<ToastPlayground/>}
    {showLab&&<section className="ui-lab-app-design"><h2>Design lab</h2><p>This entire screen is the shell prototype, not a preview inside another page.</p><div className="ui-lab-app-swatches">{["#101240","#520E25","#F0D3E7"].map(color=><div key={color} style={{background:color}}><code>{color}</code></div>)}</div><a href="#/hub">Return to production app</a></section>}
   </main>

   <nav className="ui-lab-app-bottom" aria-label="Primary mobile navigation">{areas.map(item=><button key={item} type="button" aria-label={item} aria-current={area===item?"page":undefined} className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span><small>{item}</small></button>)}</nav>
  </div>
 </div>;
}
