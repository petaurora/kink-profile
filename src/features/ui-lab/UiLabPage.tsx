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
 const [menuOpen,setMenuOpen]=useState(false);
 const [expandedMenu,setExpandedMenu]=useState<Area|null>(null);
 const gestureStart=useRef<{x:number;y:number}|null>(null);
 const menuChildren: Record<Area,string[]> = {
  Home:[],
  Catalog:["Overview","Explore All","Kinks","Rewards & Punishments","Concept Explorer"],
  Profile:["My Profile","Preferences","Sharing & Permissions"],
  Discover:["Learn","React","Play"],
  Tools:["Scene Builder","Agreements & Rituals","Compare Profiles"]
 };
 const openMenuChild=(parent:Area,child:string)=>{
  navigate(parent);
  if(parent==="Catalog") { if(child==="Overview")setWorkspace("");else choose(child); }
  else if(parent==="Discover"){setMode(child);}
  else if(parent==="Profile"||parent==="Tools"){setWorkspace(child);}
 };
 const onGestureStart=(event:React.TouchEvent)=>{
  const t=event.touches[0];if(t)gestureStart.current={x:t.clientX,y:t.clientY};
 };
 const onGestureEnd=(event:React.TouchEvent)=>{
  const start=gestureStart.current;gestureStart.current=null;
  const t=event.changedTouches[0];if(!start||!t)return;
  const dx=t.clientX-start.x,dy=t.clientY-start.y;
  if(menuOpen){if(dx < -75 && Math.abs(dx)>Math.abs(dy)*1.2)setMenuOpen(false);return;}
  // Edge-only gestures avoid hijacking normal vertical scrolling.
  if(start.x<=36 && ((dx>75&&Math.abs(dx)>Math.abs(dy)*1.2)||(dy < -100&&Math.abs(dy)>Math.abs(dx)*1.5)))setMenuOpen(true);
 };
 useEffect(()=>{if(!menuOpen)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenuOpen(false);};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[menuOpen]);
 const navigate=(next:Area)=>{
   setArea(next);setWorkspace("");setDetail(null);setDomain("All");setMenuOpen(false);
 };
 const choose=(name:string)=>{setArea("Catalog");setWorkspace(name);setMode("Explore");setDetail(null);};
 const heading=workspace||({Home:"Your space.",Discover:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools."} as Record<Area,string>)[area];
 return <div className="ui-lab ui-lab-app" onTouchStart={onGestureStart} onTouchEnd={onGestureEnd}>
  <aside className="ui-lab-app-rail" aria-label="Primary navigation">
   <div className="ui-lab-app-brand">♡ <strong>Kink Profile</strong><small>UI LAB</small></div>
   {areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span>{item}</button>)}
   <button className="ui-lab-app-rail-lab" onClick={()=>setShowLab(!showLab)}>⚙ Design lab</button>
  </aside>
  <div className="ui-lab-app-frame">
   <header className="ui-lab-app-header">
    <button type="button" className="ui-lab-header-action" aria-label="Open full menu" aria-expanded={menuOpen} aria-controls="ui-lab-full-menu" onClick={()=>setMenuOpen(true)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <button type="button" className="ui-lab-app-logo" onClick={()=>navigate("Home")} aria-label="Kink Profile, go to Home"><span className="ui-lab-brand-mark" aria-hidden="true">♡</span><span>Kink Profile</span></button>
    <div className="ui-lab-header-actions">
      <button type="button" className="ui-lab-header-action" aria-label="Search" onClick={()=>setDetail("Search across tools, concepts, preferences and creations")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.5 4.5"/></svg>
      </button>
    </div>
   </header>
   {menuOpen&&<div className="ui-lab-menu-layer">
     <button type="button" className="ui-lab-menu-backdrop" aria-label="Close navigation menu" onClick={()=>setMenuOpen(false)}/>
     <aside id="ui-lab-full-menu" className="ui-lab-menu-drawer" role="dialog" aria-modal="true" aria-label="Full navigation menu">
       <div className="ui-lab-menu-heading"><span className="ui-lab-menu-title"><span aria-hidden="true">♡</span> Kink Profile</span><button type="button" className="ui-lab-menu-close" aria-label="Close menu" onClick={()=>setMenuOpen(false)}>×</button></div>
       <p className="ui-lab-menu-eyebrow">YOUR SPACE</p>
       <nav aria-label="All destinations" className="ui-lab-menu-links">
         {areas.map(item=><div className="ui-lab-menu-group" key={item}>
          <div className={"ui-lab-menu-parent "+(area===item?"selected":"")}>
            <button type="button" className="ui-lab-menu-destination" aria-current={area===item?"page":undefined} onClick={()=>navigate(item)}><span className="ui-lab-menu-link-icon"><NavIcon area={item}/></span><span>{item}</span></button>
            {menuChildren[item].length>0&&<button type="button" className="ui-lab-menu-expand" aria-label={(expandedMenu===item?"Collapse ":"Expand ")+item} aria-expanded={expandedMenu===item} onClick={()=>setExpandedMenu(expandedMenu===item?null:item)}><span className={"ui-lab-menu-chevron "+(expandedMenu===item?"expanded":"")} aria-hidden="true">›</span></button>}
          </div>
          {expandedMenu===item&&menuChildren[item].length>0&&<div className="ui-lab-menu-subitems">{menuChildren[item].map(child=><button type="button" key={child} onClick={()=>openMenuChild(item,child)}>{child}</button>)}</div>}
         </div>)}
       </nav>
       <div className="ui-lab-menu-divider"/>
       <p className="ui-lab-menu-eyebrow">MORE TO EXPLORE</p>
       <div className="ui-lab-menu-links">
         {(["Creations","Learn","Relationships"] as const).map((item,i)=><button type="button" key={item} onClick={()=>{setMenuOpen(false);setDetail(item+" · Coming soon");}}><span className="ui-lab-menu-link-icon" aria-hidden="true">{["◇","✧","♡"][i]}</span><span>{item}</span><small>Preview</small></button>)}
       </div>
       <div className="ui-lab-menu-footer">Explore freely. Your preferences stay yours.</div>
     </aside>
   </div>}
   <main className="ui-lab-app-content">
    <p className="ui-lab-app-kicker">{area.toUpperCase()} {workspace&&" / "+workspace.toUpperCase()}</p>
    <h1>{heading}</h1>
    <p className="ui-lab-app-lede">{area==="Home"?"A home for everything you're exploring, building and becoming.":area==="Catalog"?"Browse freely. Record preferences only when you choose.":area==="Discover"?"Learn, react or play — your curiosity sets the pace.":area==="Profile"?"Your story, your preferences, and the people you choose to share with.":"Practical spaces for scenes, rituals, agreements and more."}</p>
    {area==="Catalog"&&<div className="ui-lab-catalog">
      {workspace&&<button className="ui-lab-app-switch" onClick={()=>choose("")}>← Catalog overview</button>}
      {!workspace&&<>
        <button className="ui-lab-catalog-search" onClick={()=>choose("Explore All")}>⌕ <span>Search concepts, preferences, topics...</span><span>→</span></button>
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
      {workspace==="Concept Explorer"&&<><button className="ui-lab-catalog-search" onClick={()=>setDetail("Search concepts")}>⌕ Search concepts...</button><div className="ui-lab-catalog-items">{["Ownership","Leather","Ceremonial","Trust"].map(item=><button key={item} onClick={()=>setDetail(item)}>{item}<span>›</span></button>)}</div></>}
      {(workspace==="Kinks"||workspace==="Rewards & Punishments")&&<>
        <div className="ui-lab-app-modes" aria-label="Catalog modes">{["Compare","Overall","Explore"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>
        <div className="ui-lab-catalog-items">{(workspace==="Kinks"?["Collars","Restraints","Sensory Play"]:["Praise","Privileges","Playful Challenges"]).map(item=><button key={item} onClick={()=>setDetail(item)}>{item}<span>›</span></button>)}</div>
      </>}
    </div>}
    {area==="Discover"&&<div className="ui-lab-app-modes">{["Learn","React","Play"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>}
    {area!=="Catalog"&&<div className="ui-lab-app-grid">{(workspace?[[workspace,"Your working space and saved drafts."],...cards[area].filter(x=>x[0]!==workspace)]:cards[area]).map(([title,description],i)=><button className={"ui-lab-app-tile "+(i===0?"featured":"")} key={title} onClick={()=>setDetail(title)}><span className="ui-lab-app-tile-icon">{["✧","♡","◇","✦"][i%4]}</span><strong>{title}</strong><small>{description}</small><span className="ui-lab-app-tile-arrow">↗</span></button>)}</div>}
    <p className="ui-lab-app-note">Experimental shell · Illustrative content only · No preferences are saved here</p>
    {showLab&&<section className="ui-lab-app-design"><h2>Design lab</h2><p>This entire screen is the shell prototype, not a preview inside another page.</p><div className="ui-lab-app-swatches">{["#101240","#520E25","#F0D3E7"].map(color=><div key={color} style={{background:color}} title={color}/>)}</div><a href="#/hub">Return to production app</a></section>}
   </main>
   {detail&&<div className="ui-lab-app-overlay" onClick={()=>setDetail(null)}><div role="dialog" aria-label={detail} onClick={e=>e.stopPropagation()}><button onClick={()=>setDetail(null)} aria-label="Close">×</button><h2>{detail}</h2><p>Placeholder for the future {detail.toLowerCase()} experience.</p></div></div>}
   <nav className="ui-lab-app-bottom" aria-label="Primary mobile navigation">{areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span className="ui-lab-nav-icon-wrap"><NavIcon area={item}/></span><small>{item}</small></button>)}</nav>
  </div>
 </div>;
}
