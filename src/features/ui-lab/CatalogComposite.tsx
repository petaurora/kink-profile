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
const items:Item[]=Object.entries(catalogSeeds).flatMap(([category,names])=>names.map((name,i)=>({id:category+":"+i,name,category,groups:specific[name]||[{name:"Context",values:["Everyday","Scene / Play","Ceremonial"]},{name:"Role",values:["Giving","Receiving","Self-directed"]}]})));
const choices=["Love","Like","Neutral","Dislike","Hard limit"];
type SaveState="saving"|"failed"|"idle";
export function CatalogComposite({initialItem,subject,compact=false,collection="kinks"}:{collection?:"kinks"|"rewards";initialItem?:string;subject?:string;compact?:boolean;onClose?:()=>void}){
 const isRewards=collection==="rewards";
 const [mine,setMine]=useState(false),[reward,setReward]=useState(false),[punishment,setPunishment]=useState(false);
 const [states,setStates]=useState<string[]>([]),[filtersOpen,setFiltersOpen]=useState(false);
 const [classification]=useState(()=>Object.fromEntries(items.map((x,i)=>[x.id,{reward:["yes","no","unanswered","no"][i%4],punishment:["unanswered","yes","no","no","yes"][i%5]}])));
 const [view,setView]=useState<"Categories"|"All Items"|"A–Z">("All Items");
 const [query,setQuery]=useState("");
 const [categoryFilter,setCategoryFilter]=useState(subject&&Object.hasOwn(catalogSeeds,subject)?subject:"All");
 const [refining,setRefining]=useState<string|null>(null);
 const [closedCategories,setClosedCategories]=useState<Record<string,boolean>>({});
 const [groupsOpen,setGroupsOpen]=useState<Record<string,boolean>>({});
 const [browseSelector,setBrowseSelector]=useState<"view"|"category"|null>(null);
 const [ratings,setRatings]=useState<Record<string,string>>({});
 const [saves,setSaves]=useState<Record<string,SaveState>>({});
 const [selector,setSelector]=useState<{id:string;label:string;parent:string}|null>(null);
 const [help,setHelp]=useState(false);
 useEffect(()=>{if(!selector&&!refining&&!browseSelector&&!filtersOpen)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous}},[selector,refining,browseSelector,filtersOpen]);
 const [failNext,setFailNext]=useState(false);
 const [toasts,setToasts]=useState<LabToast[]>([]);
 const toastId=useRef(0);
 const timers=useRef<Record<string,ReturnType<typeof setTimeout>>>({});
 const origin=useRef<HTMLButtonElement|null>(null);
 const titleRef=useRef<HTMLHeadingElement>(null);
 const root=useRef<HTMLElement>(null);
 const refineOrigin=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>()=>Object.values(timers.current).forEach(clearTimeout),[]);
 useEffect(()=>{if(selector)titleRef.current?.focus()},[selector,refining]);
 useEffect(()=>{if(!selector&&!refining&&!browseSelector)return;const handler=(e:KeyboardEvent)=>{if(e.key==="Escape"){if(selector)closeSelector();else if(browseSelector)setBrowseSelector(null);else closeRefine()}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[selector,refining]);
 useEffect(()=>{if(!initialItem)return;const found=items.find(x=>x.name===initialItem);if(found){openRefine(found.id);requestAnimationFrame(()=>root.current?.querySelector('[data-item-id="'+found.id+'"]')?.scrollIntoView({block:"nearest"}))}},[initialItem]);
 function openRefine(id:string){setGroupsOpen({});setRefining(id)}
 function closeRefine(){setRefining(null);requestAnimationFrame(()=>refineOrigin.current?.focus())}
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
 const hasFilters=mine||reward||punishment||states.length>0;
 const clearFilters=()=>{setMine(false);setReward(false);setPunishment(false);setStates([])};
 const nativeRewards=new Set(["Praise","Privileges","Protocol","Permission Rituals","Rules","Training","Teasing","Anticipation"]);
 const matching=items.filter(x=>{
 if(!isRewards)return (!subject||x.category===subject||x.name===subject)&&(categoryFilter==="All"||x.category===categoryFilter)&&(x.name+" "+x.category+" "+x.groups.flatMap(g=>g.values).join(" ")).toLowerCase().includes(query.trim().toLowerCase());
 const cl=classification[x.id];
 if(!nativeRewards.has(x.name)&&cl.reward!=="yes"&&cl.punishment!=="yes")return false;
 if(mine&&cl.reward!=="yes"&&cl.punishment!=="yes")return false;
 const dims=reward||punishment?[...(reward?["reward" as const]:[]),...(punishment?["punishment" as const]:[])]:(["reward","punishment"] as const);
 if((reward||punishment||states.length>0)&&!dims.some(d=>states.length?states.includes(cl[d]):cl[d]==="yes"))return false;
 return (x.name+" "+x.category).toLowerCase().includes(query.trim().toLowerCase());
 }).sort((a,b)=>isRewards?a.name.localeCompare(b.name):0);
 const sections=compact?[["All Items",matching] as const]:view==="All Items"?[["All Items",matching] as const]:view==="Categories"?Object.keys(catalogSeeds).map(c=>[c,matching.filter(x=>x.category===c)] as const):Array.from(new Set(matching.map(x=>x.name[0].toUpperCase()))).sort().map(letter=>[letter,matching.filter(x=>x.name.toUpperCase().startsWith(letter))] as const);
 function renderItem(x:Item){
  const overall=x.id+":overall";
  const hasModifiers=x.groups.some(g=>g.values.length>0);
  const ratedModifier=Object.keys(ratings).some(k=>k.startsWith(x.id+":")&&k!==overall);
  return <article className="cc-item" data-item-id={x.id} key={x.id}>
   <div className="cc-item-row"><span className="cc-item-name">{x.name}</span>{ratingButton(overall,x.name+" overall",x.name)}
   {hasModifiers&&<button type="button" className="cc-refine-toggle" aria-haspopup="dialog" onClick={e=>{refineOrigin.current=e.currentTarget;openRefine(x.id)}}><span aria-hidden="true">+</span> Refine{ratedModifier&&<span className="cc-rated-dot" aria-hidden="true"/>}</button>}</div>
  </article>
 }
 const refinedItem=items.find(x=>x.id===refining);
 function modifierContent(x:Item){
  const errors=Object.keys(saves).filter(k=>k.startsWith(x.id+":")&&k!==x.id+":overall"&&saves[k]==="failed");
  return <div className="cc-refine-content">{x.groups.map(g=>{const gk=x.id+":"+g.name;const go=groupsOpen[gk]??false;return <section className="cc-group" key={gk}><button className="cc-group-head" aria-expanded={go} onClick={()=>setGroupsOpen(p=>({...p,[gk]:!go}))}><span>{g.name}<small>{g.values.length} options</small></span><span aria-hidden="true">{go?"⌃":"⌄"}</span></button>{go&&<div className="cc-values">{g.values.map(v=><div className="cc-value" key={v}><span>{v}</span>{ratingButton(x.id+":"+g.name+":"+v,v,x.name+" / "+g.name)}</div>)}</div>}</section>})}{errors.length>0&&<p className="cc-error-summary" role="status">{errors.length} save issue{errors.length===1?"":"s"} · Retry beside affected rating.</p>}</div>
 }
 return <section className="cc" ref={root} aria-label="Interactive inline Catalog prototype">
  
  {!compact&&<div className="cc-demo cc-demo-compact"><span>{items.length} sample Items · Ratings are not saved</span><label><input type="checkbox" checked={failNext} onChange={e=>setFailNext(e.target.checked)}/> Test save failure</label></div>}
  <div className="cc-browser">{!compact&&<><label className="cc-search-label" htmlFor="cc-item-search">Find an Item</label><div className="cc-search-wrap"><input id="cc-item-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={isRewards?"Search Items…":"Search Items or modifiers…"}/>{query&&<button onClick={()=>setQuery("")}>Clear</button>}</div>
   {isRewards&&<div className="cc-rp-filters" aria-label="Reward and punishment filters">{([["Mine",mine,setMine],["Reward",reward,setReward],["Punishment",punishment,setPunishment]] as const).map(([label,active,setActive])=><button type="button" key={label} className={active?"active":""} aria-pressed={active} onClick={()=>setActive(!active)}>{label}</button>)}<button type="button" className={states.length?"active":""} onClick={()=>setFiltersOpen(true)}>⚑ Filters{states.length?" · "+states.length:""}</button>{hasFilters&&<button type="button" className="cc-rp-clear" onClick={clearFilters}>Clear Filters</button>}</div>}
    <div className="cc-toolbar"><span>{matching.length} Items</span><div className="cc-view-wide" role="group" aria-label="Browse view">{(["Categories","All Items","A–Z"] as const).map(v=><button key={v} aria-pressed={view===v} className={view===v?"active":""} onClick={()=>setView(v)}>{v}</button>)}</div><div className="cc-view-mobile">Browse by <button type="button" className="cc-sheet-trigger" aria-haspopup="dialog" onClick={()=>setBrowseSelector("view")}>{view} <span aria-hidden="true">⌄</span></button></div></div>
   {!isRewards&&<div className="cc-category-filter"><label htmlFor="cc-category-filter">Category</label><button type="button" id="cc-category-filter" className="cc-sheet-trigger" aria-haspopup="dialog" onClick={()=>setBrowseSelector("category")}>{categoryFilter==="All"?"All categories":categoryFilter} <span aria-hidden="true">⌄</span></button></div>}</>}<div className="cc-sections">{sections.filter(([,list])=>list.length).map(([heading,list])=><section key={heading} className="cc-section"><button className={"cc-section-title"+(heading==="All Items"?" cc-section-title-flat":"")} aria-expanded={!closedCategories[heading]} onClick={()=>setClosedCategories(p=>({...p,[heading]:!p[heading]}))}><span>{heading==="All Items"?"":heading} <small>{heading==="All Items"?"":list.length+" Items"}</small></span><span aria-hidden="true">{closedCategories[heading]?"⌄":"⌃"}</span></button>{!closedCategories[heading]&&<div className="cc-section-items">{list.map(renderItem)}</div>}</section>)}{matching.length===0&&<p className="cc-empty">No matching Items. {isRewards&&hasFilters?<button onClick={clearFilters}>Clear Filters</button>:<button onClick={()=>setQuery("")}>Clear search</button>}</p>}</div>
  </div>
  {isRewards&&filtersOpen&&<div className="cc-modal-layer cc-rp-layer"><button className="cc-backdrop" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}/><div className="cc-selector" role="dialog" aria-modal="true" aria-label="Answer filters"><div className="cc-selector-head"><div><small>REWARDS & PUNISHMENTS</small><h3>Filters</h3></div><button aria-label="Close filters" onClick={()=>setFiltersOpen(false)}>×</button></div><p className="cc-refine-intro">Filter by your classification answers</p><div className="cc-rp-filters">{([["unanswered","? Unanswered"],["no","✕ No"],["yes","✓ Yes"]] as const).map(([value,label])=><button key={value} type="button" className={states.includes(value)?"active":""} aria-pressed={states.includes(value)} onClick={()=>setStates(prev=>prev.includes(value)?prev.filter(v=>v!==value):[...prev,value])}>{label}</button>)}</div><p className="cc-rp-count">{matching.length} matching Items</p></div></div>}
   <LabToasts items={toasts} modalOpen={!!selector||!!refining||!!browseSelector} onDismiss={id=>setToasts(p=>p.filter(t=>t.id!==id))}/>
  {browseSelector&&<div className="cc-modal-layer cc-browse-layer"><button className="cc-backdrop" aria-label="Close selection" onClick={()=>setBrowseSelector(null)}/><div className="cc-selector" role="dialog" aria-modal="true" aria-label={browseSelector==="view"?"Browse by":"Category"}><div className="cc-selector-head"><div><h3>{browseSelector==="view"?"Browse by":"Category"}</h3></div><button onClick={()=>setBrowseSelector(null)} aria-label="Close selection">×</button></div><div className="cc-options">{(browseSelector==="view"?["Categories","All Items","A–Z"]:["All",...Object.keys(catalogSeeds)]).map(v=><button key={v} className={(browseSelector==="view"?view===v:categoryFilter===v)?"chosen":""} onClick={()=>{if(browseSelector==="view")setView(v as typeof view);else setCategoryFilter(v);setBrowseSelector(null)}}>{v==="All"?"All categories":v}{(browseSelector==="view"?view===v:categoryFilter===v)?" ✓":""}</button>)}</div></div></div>}
  {refinedItem&&<div className={"cc-modal-layer"+(selector?" cc-refine-underlay":"")}><button className="cc-backdrop" aria-label="Close refinement" onClick={closeRefine}/><div className="cc-selector cc-refine-sheet" role="dialog" aria-modal="true" aria-label={"Refine "+refinedItem.name}><div className="cc-selector-head"><div><small>REFINE ITEM</small><h3>{refinedItem.name}</h3><div className="cc-refine-overall">{ratingButton(refinedItem.id+":overall",refinedItem.name+" overall",refinedItem.name)}</div></div><button onClick={closeRefine} aria-label="Close refinement">×</button></div>{modifierContent(refinedItem)}</div></div>}
  {selector&&<div className={"cc-modal-layer"+(refinedItem?" cc-rating-over-refine":"")}><button className="cc-backdrop" aria-label="Close rating selector" onClick={closeSelector}/><div className="cc-selector" role="dialog" aria-modal="true" aria-labelledby="cc-selector-title"><div className="cc-selector-head"><div><small>{selector.parent}</small><h3 id="cc-selector-title" ref={titleRef} tabIndex={-1}>{selector.label}</h3></div><button onClick={closeSelector} aria-label="Close selector">×</button></div><div className="cc-options">{choices.map(c=><button key={c} className={ratings[selector.id]===c?"chosen":""} onClick={()=>{commit(selector.id,c);closeSelector()}}>{c}{ratings[selector.id]===c?" ✓":""}</button>)}</div><button className="cc-help" aria-expanded={help} onClick={()=>setHelp(p=>!p)}>What do these mean? {help?"−":"+"}</button>{help&&<p className="cc-explanation">These describe preference, not experience or comfort. All ratings are optional.</p>}{ratings[selector.id]&&<button className="cc-clear" onClick={()=>{commit(selector.id,undefined);closeSelector()}}>Clear rating</button>}</div></div>}
 </section>
}
