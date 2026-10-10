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
 const [launcher,setLauncher]=useState<Area|null>(null);
 const [workspace,setWorkspace]=useState("");
 const [mode,setMode]=useState("Explore");
 const [detail,setDetail]=useState<string|null>(null);
 const [showLab,setShowLab]=useState(false);
 const navigate=(next:Area)=>{
   if((next==="Catalog"||next==="Tools") && next===area){setLauncher(launcher===next?null:next);return;}
   setArea(next);setWorkspace("");setDetail(null);setLauncher(next==="Catalog"||next==="Tools"?next:null);
 };
 const choose=(name:string)=>{setWorkspace(name);setLauncher(null);setMode("Explore");setDetail(null);};
 const options=area==="Catalog"?["Kinks","Rewards & Punishments"]:["Scene Builder","Agreements & rituals","Randomizers","Compare profiles"];
 const heading=workspace||({Hub:"Your space.",Quiz:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools."} as Record<Area,string>)[area];
 return <div className="ui-lab ui-lab-app">
  <aside className="ui-lab-app-rail" aria-label="Primary navigation">
   <div className="ui-lab-app-brand">♡ <strong>Kink Profile</strong><small>UI LAB</small></div>
   {areas.map(item=><button key={item} type="button" className={area===item?"active":""} onClick={()=>navigate(item)}><span>{icons[item]}</span>{item}</button>)}
   <button className="ui-lab-app-rail-lab" onClick={()=>setShowLab(!showLab)}>⚙ Design lab</button>
  </aside>
  <div className="ui-lab-app-frame">
   <header className="ui-lab-app-header"><button className="ui-lab-app-logo" onClick={()=>{setArea("Hub");setWorkspace("");setLauncher(null);}}>♡ Kink Profile</button><div><button aria-label="Search" onClick={()=>setDetail("Search across tools, concepts, preferences and creations")}>⌕</button><button aria-label="Open profile" onClick={()=>navigate("Profile")}>♙</button></div></header>
   <main className="ui-lab-app-content">
    <p className="ui-lab-app-kicker">{area.toUpperCase()} {workspace&&" / "+workspace.toUpperCase()}</p>
    <h1>{heading}</h1>
    <p className="ui-lab-app-lede">{area==="Hub"?"A home for everything you're exploring, building and becoming.":area==="Catalog"?"Browse freely. Record preferences only when you choose.":area==="Quiz"?"Learn, react or play — your curiosity sets the pace.":area==="Profile"?"Your story, your preferences, and the people you choose to share with.":"Practical spaces for scenes, rituals, agreements and more."}</p>
    {area==="Catalog"&&workspace&&<div className="ui-lab-app-modes" aria-label="Catalog modes">{["Compare","Overall","Explore"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>}
    {area==="Quiz"&&<div className="ui-lab-app-modes">{["Learn","React","Play"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div>}
    {workspace&&<button className="ui-lab-app-switch" onClick={()=>setLauncher(area)}>Switch {area.toLowerCase()} workspace ↗</button>}
    <div className="ui-lab-app-grid">{(workspace?[[workspace,area==="Catalog"?"Explore the "+mode.toLowerCase()+" view in this workspace.":"Your working space and saved drafts."],...cards[area].filter(x=>x[0]!==workspace)]:cards[area]).map(([title,description],i)=><button className={"ui-lab-app-tile "+(i===0?"featured":"")} key={title} onClick={()=>area==="Catalog"||area==="Tools"?choose(title):setDetail(title)}><span className="ui-lab-app-tile-icon">{["✧","♡","◇","✦"][i%4]}</span><strong>{title}</strong><small>{description}</small><span className="ui-lab-app-tile-arrow">↗</span></button>)}</div>
    <p className="ui-lab-app-note">Experimental shell · Illustrative content only · No preferences are saved here</p>
    {showLab&&<section className="ui-lab-app-design"><h2>Design lab</h2><p>This entire screen is the shell prototype, not a preview inside another page.</p><div className="ui-lab-app-swatches">{["#101240","#520E25","#F0D3E7"].map(color=><div key={color} style={{background:color}} title={color}/>)}</div><a href="#/hub">Return to production app</a></section>}
   </main>
   {launcher&&<div className="ui-lab-app-launcher" role="dialog" aria-label={launcher+" workspaces"}><div className="ui-lab-app-launcher-top"><strong>{launcher} workspaces</strong><button aria-label="Close launcher" onClick={()=>setLauncher(null)}>×</button></div><div>{options.map(option=><button key={option} onClick={()=>choose(option)}><span>◇</span>{option}</button>)}</div></div>}
   {detail&&<div className="ui-lab-app-overlay" onClick={()=>setDetail(null)}><div role="dialog" aria-label={detail} onClick={e=>e.stopPropagation()}><button onClick={()=>setDetail(null)} aria-label="Close">×</button><h2>{detail}</h2><p>Placeholder for the future {detail.toLowerCase()} experience.</p></div></div>}
   <nav className="ui-lab-app-bottom" aria-label="Primary mobile navigation">{areas.map(item=><button key={item} type="button" className={(area===item?"active ":"")+(item==="Hub"?"hub":"")} onClick={()=>navigate(item)}><span>{icons[item]}</span><small>{item}</small></button>)}</nav>
  </div>
 </div>;
}
