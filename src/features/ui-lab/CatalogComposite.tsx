import { useEffect, useRef, useState } from "react";
import "./catalogComposite.css";
import { LabToasts, type LabToast } from "./LabToasts";

type Item={id:string;name:string;category:string;groups:{name:string;values:string[]}[]};
const catalogSeeds:Record<string,string[]>={
 "Power Exchange":["Collars","Ownership","Protocol","Service","Permission Rituals","Authority Exchange","Roleplay","Obedience","Rules","Ceremonies","Training","Devotion"],
 "Restraint & Control":["Restraints","Cuffs","Rope Bondage","Blindfolds","Chastity","Positioning","Movement Restriction","Sensory Deprivation","Harnesses","Shibari","Suspension","Confinement"],
 "Sensation & Intensity":["Sensory Play","Wartenberg Wheel","Compression Clothing","Temperature Play","Impact Play","Texture Play","Cupping","Massage","Wax Play","Pressure Play","Tickling","Sound Play"],
 "Connection & Expression":["Praise","Privileges","Aftercare","Affection","Pet Play","Primal Play","Exhibitionism","Voyeurism","Role Reversal","Teasing","Anticipation","Body Worship"]
};
const specific:Record<string,Item["groups"]>={
 "Collars":[{name:"Material",values:["Leather","Metal","Fabric","Silicone"]},{name:"Use / Context",values:["Everyday","Scene / Play","Ceremonial"]}],
 "Restraints":[{name:"Material",values:["Rope","Cuffs","Fabric"]},{name:"Use / Context",values:["Decorative","Functional"]}],
 "Sensory Play":[{name:"Sensation",values:["Soft","Sharp / Prickly","Warm","Cold"]},{name:"Role",values:["Giving","Receiving"]}],
 "Praise":[{name:"Expression",values:["Verbal","Written","Public","Private"]}],
 "Privileges":[{name:"Context",values:["Everyday","Scene","Ceremonial"]}]
};
const suffixes=[""," — Everyday"," — Scene"," — Ceremonial"," — Giving"," — Receiving"," — Self-directed"];
const items:Item[]=Object.entries(catalogSeeds).flatMap(([category,names])=>names.flatMap((name,i)=>suffixes.map((suffix,j)=>({id:category+":"+i+":"+j,name:name+suffix,category,groups:specific[name]||[{name:"Context",values:["Everyday","Scene / Play","Ceremonial"]},{name:"Role",values:["Giving","Receiving","Self-directed"]}]}))));
const choices=["Love","Like","Neutral","Dislike","Hard limit"];
type SaveState="saving"|"failed"|"idle";
export function CatalogComposite({initialItem}:{initialItem?:string;onClose?:()=>void}){
 const [view,setView]=useState<"Categories"|"All Items"|"A–Z">("Categories");
 const [query,setQuery]=useState("");
 const [expanded,setExpanded]=useState<Record<string,boolean>>({});
 const [closedCategories,setClosedCategories]=useState<Record<string,boolean>>({});
 const [groupsOpen,setGroupsOpen]=useState<Record<string,boolean>>({});
 const [ratings,setRatings]=useState<Record<string,string>>({});
 const [saves,setSaves]=useState<Record<string,SaveState>>({});
 const [selector,setSelector]=useState<{id:string;label:string;parent:string}|null>(null);
 const [help,setHelp]=useState(false);
 const [failNext,setFailNext]=useState(false);
 const [toasts,setToasts]=useState<LabToast[]>([]);
 const toastId=useRef(0);
 const timers=useRef<Record<string,ReturnType<typeof setTimeout>>>({});
 const origin=useRef<HTMLButtonElement|null>(null);
 const titleRef=useRef<HTMLHeadingElement>(null);
 const root=useRef<HTMLElement>(null);
 useEffect(()=>()=>Object.values(timers.current).forEach(clearTimeout),[]);
 useEffect(()=>{if(selector)titleRef.current?.focus()},[selector]);
 useEffect(()=>{if(!selector)return;const handler=(e:KeyboardEvent)=>{if(e.key==="Escape")closeSelector()};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[selector]);
 useEffect(()=>{if(!initialItem)return;const found=items.find(x=>x.name===initialItem);if(found){setExpanded(p=>({...p,[found.id]:true}));requestAnimationFrame(()=>root.current?.querySelector('[data-item-id="'+found.id+'"]')?.scrollIntoView({block:"nearest"}))}},[initialItem]);
 function closeSelector(){setSelector(null);setHelp(false);requestAnimationFrame(()=>origin.current?.focus())}
 function notify(message:string,kind:LabToast["kind"]){setToasts(p=>kind==="success"?[...p.filter(x=>x.kind!=="success"),{id:++toastId.current,message,kind}]:[...p,{id:++toastId.current,message,kind}])}
 function commit(id:string,value:string|undefined){
  setRatings(p=>{const next={...p};if(value===undefined)delete next[id];else next[id]=value;return next});
  setSaves(p=>({...p,[id]:"saving"}));
  clearTimeout(timers.current[id]);const fail=failNext;setFailNext(false);
  timers.current[id]=setTimeout(()=>{setSaves(p=>({...p,[id]:fail?"failed":"idle"}));if(fail)notify("Save failed. Your rating is preserved; retry beside the rating.","error");else notify("Preference saved","success")},850);
 }
 function retry(id:string){commit(id,ratings[id])}
 function ratingButton(id:string,label:string,parent:string,cls="cc-rating"){
  return <span className="cc-rating-wrap"><button type="button" className={cls} aria-label={label+": "+(ratings[id]||"Not rated")+". Change rating"} onClick={e=>{e.stopPropagation();origin.current=e.currentTarget;setSelector({id,label,parent})}}>{ratings[id]||"Not rated"}</button>{saves[id]==="saving"&&<span className="cc-save-state" aria-label="Saving">◌</span>}{saves[id]==="failed"&&<button className="cc-retry" onClick={()=>retry(id)} aria-label={"Retry saving "+label}>Retry</button>}</span>
 }
 const matching=items.filter(x=>(x.name+" "+x.category).toLowerCase().includes(query.trim().toLowerCase()));
 const sections=view==="All Items"?[["All Items",matching] as const]:view==="Categories"?Object.keys(catalogSeeds).map(c=>[c,matching.filter(x=>x.category===c)] as const):Array.from(new Set(matching.map(x=>x.name[0].toUpperCase()))).sort().map(letter=>[letter,matching.filter(x=>x.name.toUpperCase().startsWith(letter))] as const);
 function renderItem(x:Item){
  const open=!!expanded[x.id];const overall=x.id+":overall";const errors=Object.keys(saves).filter(k=>k.startsWith(x.id+":")&&saves[k]==="failed");
  return <article className={"cc-item "+(open?"cc-item-open":"")} data-item-id={x.id} key={x.id}>
   <div className="cc-item-row"><button className="cc-item-toggle" aria-expanded={open} aria-controls={"cc-panel-"+x.id.replace(/[^a-z0-9]/gi,"-")} onClick={()=>setExpanded(p=>({...p,[x.id]:!p[x.id]}))}><span className="cc-item-name">{x.name}</span><span className="cc-chevron" aria-hidden="true">{open?"⌃":"⌄"}</span></button>{ratingButton(overall,x.name+" overall",x.name)}</div>
   {open&&<div className="cc-item-panel" id={"cc-panel-"+x.id.replace(/[^a-z0-9]/gi,"-")}>
    <div className="cc-overall-row"><span><strong>Overall preference</strong><small>Your rating for the Item as a whole</small></span>{ratingButton(overall,x.name+" overall",x.name)}</div>
    <div className="cc-modifier-label">Refine by modifier <small>Optional · Independent of overall rating</small></div>
    {x.groups.map(g=>{const gk=x.id+":"+g.name;const go=groupsOpen[gk]??g.values.length<=4;return <section className="cc-group" key={gk}><button className="cc-group-head" aria-expanded={go} onClick={()=>setGroupsOpen(p=>({...p,[gk]:!go}))}><span>{g.name}<small>{g.values.length} options</small></span><span aria-hidden="true">{go?"⌃":"⌄"}</span></button>{go&&<div className="cc-values">{g.values.map(v=><div className="cc-value" key={v}><span>{v}</span>{ratingButton(x.id+":"+g.name+":"+v,v,x.name+" / "+g.name)}</div>)}</div>}</section>})}
    {errors.length>0&&<p className="cc-error-summary" role="status">{errors.length} save issue{errors.length===1?"":"s"} · Retry beside the affected rating.</p>}
   </div>}
  </article>
 }
 return <section className="cc" ref={root} aria-label="Interactive inline Catalog prototype">
  <div className="cc-top"><div><span className="cc-eyebrow">UI LAB / INLINE CATALOG</span><h2>Explore preferences</h2><p>Search and browse freely. Rate an Item directly or expand to refine.</p></div></div>
  <div className="cc-demo"><span>Illustrative dataset · {items.length} mock Items · Nothing saved to an account</span><label><input type="checkbox" checked={failNext} onChange={e=>setFailNext(e.target.checked)}/> Fail next save</label></div>
  <div className="cc-browser"><label className="cc-search-label" htmlFor="cc-item-search">Find an Item</label><div className="cc-search-wrap"><input id="cc-item-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search 300+ Items…"/>{query&&<button onClick={()=>setQuery("")}>Clear</button>}</div>
   <div className="cc-toolbar"><span>{matching.length} Items</span><div className="cc-view-wide" role="group" aria-label="Browse view">{(["Categories","All Items","A–Z"] as const).map(v=><button key={v} aria-pressed={view===v} className={view===v?"active":""} onClick={()=>setView(v)}>{v}</button>)}</div><label className="cc-view-mobile">Browse by <select aria-label="Browse view" value={view} onChange={e=>setView(e.target.value as typeof view)}><option>Categories</option><option>All Items</option><option>A–Z</option></select></label></div>
   <div className="cc-sections">{sections.filter(([,list])=>list.length).map(([heading,list])=><section key={heading} className="cc-section"><button className="cc-section-title" aria-expanded={!closedCategories[heading]} onClick={()=>setClosedCategories(p=>({...p,[heading]:!p[heading]}))}><span>{heading} <small>{list.length} Items</small></span><span aria-hidden="true">{closedCategories[heading]?"⌄":"⌃"}</span></button>{!closedCategories[heading]&&<div className="cc-section-items">{list.map(renderItem)}</div>}</section>)}{matching.length===0&&<p className="cc-empty">No matching Items. <button onClick={()=>setQuery("")}>Clear search</button></p>}</div>
  </div>
  <LabToasts items={toasts} onDismiss={id=>setToasts(p=>p.filter(t=>t.id!==id))}/>
  {selector&&<div className="cc-modal-layer"><button className="cc-backdrop" aria-label="Close rating selector" onClick={closeSelector}/><div className="cc-selector" role="dialog" aria-modal="true" aria-labelledby="cc-selector-title"><div className="cc-selector-head"><div><small>{selector.parent}</small><h3 id="cc-selector-title" ref={titleRef} tabIndex={-1}>{selector.label}</h3></div><button onClick={closeSelector} aria-label="Close selector">×</button></div><div className="cc-options">{choices.map(c=><button key={c} className={ratings[selector.id]===c?"chosen":""} onClick={()=>{commit(selector.id,c);closeSelector()}}>{c}{ratings[selector.id]===c?" ✓":""}</button>)}</div><button className="cc-help" aria-expanded={help} onClick={()=>setHelp(p=>!p)}>What do these mean? {help?"−":"+"}</button>{help&&<p className="cc-explanation">These describe preference, not experience or comfort. All ratings are optional.</p>}{ratings[selector.id]&&<button className="cc-clear" onClick={()=>{commit(selector.id,undefined);closeSelector()}}>Clear rating</button>}</div></div>}
 </section>
}
