import { useState } from "react";
import "./uiLab.css";

type Area = "Quiz" | "Catalog" | "Hub" | "Profile" | "Tools";
const areas: Area[] = ["Quiz","Catalog","Hub","Profile","Tools"];
const icons: Record<Area,string> = {Quiz:"✦",Catalog:"◇",Hub:"⌂",Profile:"♡",Tools:"⚒"};
const cards: Record<Area,[string,string][]> = {
  Quiz:[["Guided discovery","Explore preferences through intentional questions"],["Learn · React · Play","Choose your own way to discover"],["Continue a quiz","Resume only deliberately started sessions"]],
  Catalog:[["Kinks","Explore, compare and refine preferences"],["Rewards & Punishments","Browse, sort and rank"],["Concept Explorer","Learn about concepts and their connections"]],
  Hub:[["Continue","Pick up a saved scene or unfinished quiz"],["Your profile at a glance","Themes and deliberate preferences"],["Discover something","Optional ideas, without pressure"],["Your shortcuts","Quick access to the tools you choose"]],
  Profile:[["Your profile","Roles, themes and preference evidence"],["Relationships","Connections and linked profiles"],["Sharing & permissions","Decide what others can see"],["Identity & expression","Your own words and presentation"]],
  Tools:[["Scene Builder","Plan scenes and save drafts"],["Agreements & rituals","Create and maintain shared practices"],["Randomizers & recipes","Get practical inspiration"],["Compare profiles","Compare only with permission"]]
};
export function UiLabPage() {
 const [area,setArea]=useState<Area>("Hub");
 const [domain,setDomain]=useState("All");
 const [workspace,setWorkspace]=useState("");
 const [mode,setMode]=useState("Explore");
 const [detail,setDetail]=useState<string|null>(null);
 const [showLab,setShowLab]=useState(false);
 const navigate=(next:Area)=>{
   setArea(next);setWorkspace("");setDetail(null);setDomain("All");
 };
 const choose=(name:string)=>{setArea("Catalog");setWorkspace(name);setMode("Explore");setDetail(null);};
 const heading=workspace||({Hub:"Your space.",Quiz:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools."} as Record<Area,string>)[area];
 return <div className="ui-lab ui-lab-app">
  <aside className="ui-lab-app-rail" aria-label="Primary navigation">
   <div className="ui-lab-app-brand">♡ <strong>Kink Profile</strong><small>UI LAB</small></div>
   {areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span>{icons[item]}</span>{item}</button>)}
   <button className="ui-lab-app-rail-lab" onClick={()=>setShowLab(!showLab)}>⚙ Design lab</button>
  </aside>
  <div className="ui-lab-app-frame">
   <header className="ui-lab-app-header"><button className="ui-lab-app-logo" onClick={()=>{setArea("Hub");setWorkspace("");setDomain("All");}}>♡ Kink Profile</button><div><button aria-label="Search" onClick={()=>setDetail("Search across tools, concepts, preferences and creations")}>⌕</button><button aria-label="Open profile" onClick={()=>navigate("Profile")}>♙</button></div></header>
   <main className="ui-lab-app-content">
    <p className="ui-lab-app-kicker">{area.toUpperCase()} {workspace&&" / "+workspace.toUpperCase()}</p>
    <h1>{heading}</h1>
    <p className="ui-lab-app-lede">{area==="Hub"?"A home for everything you're exploring, building and becoming.":area==="Catalog"?"Browse freely. Record preferences only when you choose.":area==="Quiz"?"Learn, react or play — your curiosity sets the pace.":area==="Profile"?"Your story, your preferences, and the people you choose to share with.":"Practical spaces for scenes, rituals, agreements and more."}</p>
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
    {area==="Quiz"&&<div className="ui-lab-app-modes">{["Learn","React","Play"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>}
    {area!=="Catalog"&&<div className="ui-lab-app-grid">{(workspace?[[workspace,area==="Catalog"?"Explore the "+mode.toLowerCase()+" view in this workspace.":"Your working space and saved drafts."],...cards[area].filter(x=>x[0]!==workspace)]:cards[area]).map(([title,description],i)=><button className={"ui-lab-app-tile "+(i===0?"featured":"")} key={title} onClick={()=>area==="Catalog"?choose(title):setDetail(title)}><span className="ui-lab-app-tile-icon">{["✧","♡","◇","✦"][i%4]}</span><strong>{title}</strong><small>{description}</small><span className="ui-lab-app-tile-arrow">↗</span></button>)}</div>}
    <p className="ui-lab-app-note">Experimental shell · Illustrative content only · No preferences are saved here</p>
    {showLab&&<section className="ui-lab-app-design"><h2>Design lab</h2><p>This entire screen is the shell prototype, not a preview inside another page.</p><div className="ui-lab-app-swatches">{["#101240","#520E25","#F0D3E7"].map(color=><div key={color} style={{background:color}} title={color}/>)}</div><a href="#/hub">Return to production app</a></section>}
   </main>
   {detail&&<div className="ui-lab-app-overlay" onClick={()=>setDetail(null)}><div role="dialog" aria-label={detail} onClick={e=>e.stopPropagation()}><button onClick={()=>setDetail(null)} aria-label="Close">×</button><h2>{detail}</h2><p>Placeholder for the future {detail.toLowerCase()} experience.</p></div></div>}
   <nav className="ui-lab-app-bottom" aria-label="Primary mobile navigation">{areas.map(item=><button key={item} type="button" className={(area===item?"active ":"")+(item==="Hub"?"hub":"")} onClick={()=>navigate(item)} aria-expanded={item==="Catalog"?launcher==="Catalog":undefined}><span>{icons[item]}</span><small>{item}</small></button>)}</nav>
  </div>
 </div>;
}
