import { useEffect, useRef, useState } from "react";
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
export function UiLabPage() {
 const [area,setArea]=useState<Area>("Home");
 const [domain,setDomain]=useState("All");
 const [workspace,setWorkspace]=useState("");
 const [mode,setMode]=useState("Explore");
 const [detail,setDetail]=useState<string|null>(null);
 const [showLab,setShowLab]=useState(false);
 const [catalogSearchOpen,setCatalogSearchOpen]=useState(false);
 const [catalogQuery,setCatalogQuery]=useState("");
 const [catalogType,setCatalogType]=useState("All");
 const [searchOrigin,setSearchOrigin]=useState("Catalog");
 const [focusedModifier,setFocusedModifier]=useState(false);
 const searchMatches=[{name:"Collars",type:"Items",path:"Kinks"},{name:"Leather",type:"Modifiers",path:"Collars → Material"},{name:"Leather fetish",type:"Items",path:"Kinks"},{name:"Ownership",type:"Concepts",path:"Concept Explorer"},{name:"Sensory Play",type:"Items",path:"Kinks"},{name:"Restraints",type:"Items",path:"Kinks"}];
 const openCatalogSearch=(origin="Catalog")=>{setSearchOrigin(origin);setCatalogSearchOpen(true);setMenuOpen(false);};
 const searchResults=searchMatches.filter(r=>(catalogType==="All"||catalogType===r.type)&&(!catalogQuery.trim()||[r.name,r.path].join(" ").toLowerCase().includes(catalogQuery.trim().toLowerCase())));
 const selectSearchResult=(name:string)=>{setCatalogSearchOpen(false);setArea("Catalog");setWorkspace("Explore All");setDetail(name==="Leather"?"Collars":name);setFocusedModifier(name==="Leather");};
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
 const onGestureStart=(event:React.TouchEvent)=>{
  const t=event.touches[0];if(t)gestureStart.current={x:t.clientX,y:t.clientY};
 };
 const onGestureEnd=(event:React.TouchEvent)=>{
  const start=gestureStart.current;gestureStart.current=null;
  const t=event.changedTouches[0];if(!start||!t)return;
  const dx=t.clientX-start.x,dy=t.clientY-start.y;
  if(menuOpen){if(dx < -60 && Math.abs(dx)>Math.abs(dy)*1.6)setMenuOpen(false);return;}
  // Only a deliberate horizontal right swipe opens the drawer; diagonal scrolling remains native.
  if(dx>85&&Math.abs(dx)>Math.abs(dy)*2.2)openDrawer();
 };
 useEffect(()=>{if(!menuOpen)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenuOpen(false);};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[menuOpen]);
 const navigate=(next:Area)=>{
   setArea(next);setWorkspace("");setDetail(null);setDomain("All");setMenuOpen(false);
 };
 const choose=(name:string)=>{setArea("Catalog");setWorkspace(name);setMode("Explore");setDetail(null);};
 const activeChild=(parent:Area)=>parent!==area?null:parent==="Catalog"?(workspace||"Overview"):parent==="Discover"?(mode==="Explore"?"Overview":mode):(workspace||"Overview");
 const openDrawer=()=>{setExpandedMenu(area==="Home"?null:area);setMenuOpen(true);};
 const heading=workspace||({Home:"Your space.",Discover:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools."} as Record<Area,string>)[area];
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
   {menuOpen&&<div className="ui-lab-menu-layer" onTouchStart={onGestureStart} onTouchEnd={event=>{event.stopPropagation();onGestureEnd(event);}}>
     <button type="button" className="ui-lab-menu-backdrop" aria-label="Close navigation menu" onClick={()=>setMenuOpen(false)}/>
     <aside id="ui-lab-full-menu" className="ui-lab-menu-drawer" role="dialog" aria-modal="true" aria-label="Full navigation menu">
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
     </aside>
   </div>}
   {catalogSearchOpen?<main className="ui-lab-search-page">
    <div className="ui-lab-search-head"><button aria-label="Back to previous screen" onClick={()=>setCatalogSearchOpen(false)}>←</button><input autoFocus aria-label="Search catalog" placeholder="Search catalog…" value={catalogQuery} onChange={e=>setCatalogQuery(e.target.value)}/>{catalogQuery&&<button aria-label="Clear search" onClick={()=>setCatalogQuery("")}>×</button>}</div>
    <div className="ui-lab-search-chips">{["All","Items","Modifiers","Concepts"].map(t=><button key={t} className={catalogType===t?"active":""} onClick={()=>setCatalogType(t)}>{t}</button>)}</div>
    {!catalogQuery.trim()&&<><p className="ui-lab-search-label">STARTING FROM {searchOrigin.toUpperCase()}</p><p className="ui-lab-search-hint">Suggestions reflect where you opened search, but results span the whole catalog.</p><p className="ui-lab-search-label">SUGGESTED SEARCHES</p><div className="ui-lab-search-suggestions">{["Collars","Leather","Ownership"].map(q=><button key={q} onClick={()=>setCatalogQuery(q)}>{q} ↗</button>)}</div></>}
    {catalogQuery.trim()&&<p className="ui-lab-search-label">BEST MATCHES · {searchResults.length}</p>}
    <div className="ui-lab-search-results">{(catalogQuery.trim()?searchResults:searchResults.slice(0,3)).map(r=><button key={r.name} onClick={()=>selectSearchResult(r.name)}><span><strong>{r.name}</strong><small>{r.path} · {r.type}</small></span><span>›</span></button>)}{catalogQuery.trim()&&searchResults.length===0&&<p>No matches in this prototype. Try another term or filter.</p>}</div>
    <p className="ui-lab-app-note">Illustrative results only · Search is not connected to live catalog data</p>
   </main>:<main className="ui-lab-app-content">
    <p className="ui-lab-app-kicker">{area.toUpperCase()} {workspace&&" / "+workspace.toUpperCase()}</p>
    <h1>{heading}</h1>
    <p className="ui-lab-app-lede">{area==="Home"?"A home for everything you're exploring, building and becoming.":area==="Catalog"?"Browse freely. Record preferences only when you choose.":area==="Discover"?"Learn, react or play — your curiosity sets the pace.":area==="Profile"?"Your story, your preferences, and the people you choose to share with.":"Practical spaces for scenes, rituals, agreements and more."}</p>
    {area==="Catalog"&&<div className="ui-lab-catalog">
      {workspace&&<button className="ui-lab-app-switch" onClick={()=>choose("")}>← Catalog overview</button>}
      {!workspace&&<>
        <button className="ui-lab-catalog-search" onClick={()=>openCatalogSearch("Catalog")}>⌕ <span>Search items, modifiers, concepts...</span><span>→</span></button>
        <h2>Explore by interest</h2>
        <div className="ui-lab-app-grid">
          {([["Kinks","Explore and refine your interests","♡"],["Rewards & Punishments","Discover rewards, boundaries and preferences","◇"],["Concept Explorer","Explore concepts and their connections","✧"],["Surprise me","Find something interesting to learn","✦"]] as const).map(([name,description,symbol])=><button key={name} className="ui-lab-app-tile" onClick={()=>name==="Surprise me"?setDetail("A little inspiration"):choose(name)}><span className="ui-lab-app-tile-icon">{symbol}</span><strong>{name}</strong><small>{description}</small><span className="ui-lab-app-tile-arrow">↗</span></button>)}
        </div>
        <button className="ui-lab-catalog-all" onClick={()=>choose("Explore All")}>Browse everything <span>→</span></button>
      </>}
      {workspace==="Explore All"&&<>
        <div className="ui-lab-catalog-filters" aria-label="Catalog domains">{["All","Kinks","Rewards & Punishments"].map(d=><button key={d} className={domain===d?"active":""} onClick={()=>setDomain(d)}>{d}</button>)}</div>
        <div className="ui-lab-catalog-items">{(domain==="Kinks"?["Collars","Restraints","Sensory Play"]:domain==="Rewards & Punishments"?["Praise","Privileges","Playful Challenges"]:["Collars","Restraints","Praise","Sensory Play","Privileges"]).map(item=><button key={item} onClick={()=>setDetail(item)}><span>{item}</span><small>{["Praise","Privileges","Playful Challenges"].includes(item)?"Rewards & Punishments":"Kinks"}</small><span>›</span></button>)}</div>
      </>}
      {workspace==="Concept Explorer"&&<><button className="ui-lab-catalog-search" onClick={()=>openCatalogSearch("Concept Explorer")}>⌕ Search concepts...</button><div className="ui-lab-catalog-items">{["Ownership","Leather","Ceremonial","Trust"].map(item=><button key={item} onClick={()=>setDetail(item)}>{item}<span>›</span></button>)}</div></>}
      {(workspace==="Kinks"||workspace==="Rewards & Punishments")&&<>
        <div className="ui-lab-app-modes" aria-label="Catalog modes">{["Compare","Overall","Explore"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>
        <div className="ui-lab-catalog-items">{(workspace==="Kinks"?["Collars","Restraints","Sensory Play"]:["Praise","Privileges","Playful Challenges"]).map(item=><button key={item} onClick={()=>setDetail(item)}>{item}<span>›</span></button>)}</div>
      </>}
    </div>}
    {area==="Discover"&&<div className="ui-lab-app-modes">{["Learn","React","Play"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>}
    {area!=="Catalog"&&<div className="ui-lab-app-grid">{(workspace?[[workspace,"Your working space and saved drafts."],...cards[area].filter(x=>x[0]!==workspace)]:cards[area]).map(([title,description],i)=><button className={"ui-lab-app-tile "+(i===0?"featured":"")} key={title} onClick={()=>setDetail(title)}><span className="ui-lab-app-tile-icon">{["✧","♡","◇","✦"][i%4]}</span><strong>{title}</strong><small>{description}</small><span className="ui-lab-app-tile-arrow">↗</span></button>)}</div>}
    <p className="ui-lab-app-note">Experimental shell · Illustrative content only · No preferences are saved here</p>
    {showLab&&<section className="ui-lab-app-design"><h2>Design lab</h2><p>This entire screen is the shell prototype, not a preview inside another page.</p><div className="ui-lab-app-swatches">{["#101240","#520E25","#F0D3E7"].map(color=><div key={color} style={{background:color}} title={color}/>)}</div><a href="#/hub">Return to production app</a></section>}
   </main>}
   {detail&&<div className="ui-lab-app-overlay" onClick={()=>setDetail(null)}><div role="dialog" aria-label={detail} onClick={e=>e.stopPropagation()}><button onClick={()=>setDetail(null)} aria-label="Close">×</button><h2>{detail}</h2>{focusedModifier&&detail==="Collars"?<p>Material → <strong>Leather</strong> · Contextual deep link preview. The modifier would be expanded and briefly highlighted in the full item view.</p>:<p>Placeholder for the future {detail.toLowerCase()} experience.</p>}</div></div>}
   <nav className="ui-lab-app-bottom" aria-label="Primary mobile navigation">{areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span><small>{item}</small></button>)}</nav>
  </div>
 </div>;
}
