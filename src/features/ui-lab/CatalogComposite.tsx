import { useEffect, useRef, useState } from "react";
import "./catalogComposite.css";
import { useToasts } from "../../components/ui/ToastProvider";
import { ModalLayer } from "../../components/ui/ModalLayer";
import { PreferenceControl, PreferenceSheet, SheetHeader } from "../../components/ui/PreferenceControl";
import { ItemRow } from "../../components/ui/ItemRow";
import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { SearchField } from "../../components/ui/SearchField";
import { SearchRow, SearchFilterButton, SearchChips, SortGroupSheet, type SortBy, type GroupBy } from "../../components/ui/SearchControls";
import { ItemExperience } from "./ItemExperience";
import { useLabRecords } from "./LabRecords";
import { preferenceChoices, PreferenceReference } from "./PreferenceVocabulary";

type Item={id:string;name:string;category:string;description?:string;groups:{name:string;values:string[]}[]};
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
const descriptions:Record<string,string>={
 "Collars":"Collars worn for everyday expression, play or ceremony.",
 "Ownership":"Symbols, agreements and expressions of belonging.",
 "Protocol":"Agreed rituals, rules and structured interactions.",
 "Restraints":"Using cuffs, rope, fabric or other forms of restraint.",
 "Sensory Play":"Exploring sensations such as texture, pressure and temperature.",
 "Praise":"Verbal, written, public or private affirmation.",
 "Privileges":"Special permissions, opportunities or meaningful rewards.",
 "Aftercare":"Connection, comfort and care after an experience.",
 "Permission Rituals":"Ceremonial or practical ways to request and grant permission."
};
const items:Item[]=Object.entries(catalogSeeds).flatMap(([category,names])=>names.map((name,i)=>({id:category+":"+i,name,category,description:descriptions[name],groups:specific[name]||[{name:"Context",values:["Everyday","Scene / Play","Ceremonial"]},{name:"Role",values:["Giving","Receiving","Self-directed"]}]})));
// Shared inline search semantics for Kinks, Rewards & Punishments and Explore All.
// Search available Item metadata consistently, independent of collection filters.
function normalizedSearch(value:string){
 return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
function matchesCatalogSearch(item:Item,query:string){
 const words=normalizedSearch(query).split(" ").filter(Boolean);
 if(!words.length)return true;
 const searchable=normalizedSearch([item.name,item.description||"",item.category,...item.groups.flatMap(g=>[g.name,...g.values])].join(" "));
 return words.every(word=>searchable.includes(word));
}
const choices=preferenceChoices;
export function CatalogComposite({initialItem,subject,compact=false,collection="kinks"}:{collection?:"kinks"|"rewards";initialItem?:string;subject?:string;compact?:boolean;onClose?:()=>void}){
 const isRewards=collection==="rewards";
 const [mine,setMine]=useState(false),[reward,setReward]=useState(false),[punishment,setPunishment]=useState(false);
 const [states,setStates]=useState<string[]>([]),[filtersOpen,setFiltersOpen]=useState(false);
 const [indicatorInfo,setIndicatorInfo]=useState<{id:string;kind:"reward"|"punishment"}|null>(null);
 const indicatorOrigin=useRef<HTMLButtonElement|null>(null);
 const [classification]=useState(()=>Object.fromEntries(items.map((x,i)=>[x.id,{reward:["yes","no","unanswered","no"][i%4],punishment:["unanswered","yes","no","no","yes"][i%5]}])));
 const [sortBy,setSortBy]=useState<SortBy>(isRewards?"az":"default");
 const [groupBy,setGroupBy]=useState<GroupBy>("none");
 const [orderOpen,setOrderOpen]=useState(false);
 const [query,setQuery]=useState("");
 const [debouncedQuery,setDebouncedQuery]=useState("");
 const clearSearch=()=>{setQuery("");setDebouncedQuery("")};
 const [refining,setRefining]=useState<string|null>(null);
 const [closedCategories,setClosedCategories]=useState<Record<string,boolean>>({});
 const [groupsOpen,setGroupsOpen]=useState<Record<string,boolean>>({});
 const records=useLabRecords();
 const ratings=records.values as Record<string,string>;
 const saves=records.saves;
 const [experienceOpen,setExperienceOpen]=useState(false);
 const [issueTarget,setIssueTarget]=useState<string|null>(null);
 const [selector,setSelector]=useState<{id:string;label:string;parent:string}|null>(null);

 const [failNext,setFailNext]=useState(false);
 const toastQueue=useToasts();
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{const timer=setTimeout(()=>setDebouncedQuery(query),275);return()=>clearTimeout(timer)},[query]);
 useEffect(()=>{setClosedCategories({})},[debouncedQuery,groupBy,sortBy]);
 useEffect(()=>{if(isRewards)root.current?.scrollIntoView({block:"start"})},[isRewards,debouncedQuery,mine,reward,punishment,states]);
 useEffect(()=>{if(!issueTarget)return;const frame=requestAnimationFrame(()=>{
  const field=[...document.querySelectorAll<HTMLElement>('[data-field-id]')].find(el=>el.dataset.fieldId===issueTarget);
  field?.scrollIntoView({block:"nearest"});
  (field?.querySelector<HTMLButtonElement>('.kp-retry') || field?.querySelector<HTMLButtonElement>('.kp-rating'))?.focus();
 });return()=>cancelAnimationFrame(frame)},[issueTarget,refining,groupsOpen]);


 useEffect(()=>{if(!initialItem)return;const found=items.find(x=>x.name===initialItem);if(found){openRefine(found.id);requestAnimationFrame(()=>root.current?.querySelector('[data-item-id="'+found.id+'"]')?.scrollIntoView({block:"nearest"}))}},[initialItem]);
 function openRefine(id:string){setGroupsOpen({});setExperienceOpen(false);setIssueTarget(null);setRefining(id);const error=Object.keys(saves).find(k=>k.startsWith(id+":")&&saves[k]==="failed");if(error)revealIssue(error)}
 function revealIssue(target:string){const item=items.find(x=>target.startsWith(x.id+":"));if(!item)return;setRefining(item.id);const group=item.groups.find(g=>target.startsWith(item.id+":"+g.name+":"));if(group)setGroupsOpen(previous=>({...previous,[item.id+":"+group.name]:true}));setIssueTarget(target)}
 function closeRefine(){setRefining(null)}
 function closeSelector(){setSelector(null)}
 const notify=toastQueue.notify;
 function commit(id:string,value:string|undefined){
  const previous=records.values[id];const version=records.commit(id,value,failNext);setFailNext(false);
  if(value===undefined&&previous!==undefined)notify({message:"Rating cleared",kind:"info",actionLabel:"Undo",duration:5000,onAction:()=>{
   if(!records.restore(id,version,previous))notify({message:"A newer edit was kept",kind:"info"});
  }});
 }
 function retry(id:string){records.retry(id)}
 function ratingButton(id:string,label:string,parent:string){
  return <span data-field-id={id}><PreferenceControl value={ratings[id]} label={label} saveState={saves[id]} onRetry={()=>retry(id)} onActivate={()=>setSelector({id,label,parent})}/></span>;
 }
 const hasFilters=mine||reward||punishment||states.length>0;
 const clearFilters=()=>{setMine(false);setReward(false);setPunishment(false);setStates([])};
 const nativeRewards=new Set(["Praise","Privileges","Protocol","Permission Rituals","Rules","Training","Teasing","Anticipation"]);
 const matching=items.filter(x=>{
 if(!isRewards)return (!subject||x.category===subject||x.name===subject)&&matchesCatalogSearch(x,debouncedQuery);
 const cl=classification[x.id];
 if(!nativeRewards.has(x.name)&&cl.reward!=="yes"&&cl.punishment!=="yes")return false;
 if(mine&&cl.reward!=="yes"&&cl.punishment!=="yes")return false;
 const dims=reward||punishment?[...(reward?["reward" as const]:[]),...(punishment?["punishment" as const]:[])]:(["reward","punishment"] as const);
 if((reward||punishment||states.length>0)&&!dims.some(d=>states.length?states.includes(cl[d]):cl[d]==="yes"))return false;
 return matchesCatalogSearch(x,debouncedQuery);
 }).sort((a,b)=>sortBy==="az"?a.name.localeCompare(b.name):sortBy==="za"?b.name.localeCompare(a.name):isRewards?a.name.localeCompare(b.name):0);
 // Grouping matters only when this result set contains multiple categories.
 const groupingAvailable=!compact&&!subject&&new Set(matching.map(x=>x.category)).size>1;
 const effectiveGroupBy=groupingAvailable?groupBy:"none";
 const sections=compact||effectiveGroupBy==="none"?[["All Items",matching] as const]:Object.keys(catalogSeeds).filter(category=>matching.some(x=>x.category===category)).map(category=>[category,matching.filter(x=>x.category===category)] as const);
 useEffect(()=>{if(!indicatorInfo)return;const dismiss=(e:KeyboardEvent)=>{if(e.key==="Escape"){setIndicatorInfo(null);indicatorOrigin.current?.focus()}};const outside=(e:PointerEvent)=>{if(!(e.target as HTMLElement).closest(".cc-rp-indicators"))setIndicatorInfo(null)};document.addEventListener("keydown",dismiss);document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("keydown",dismiss);document.removeEventListener("pointerdown",outside)}},[indicatorInfo]);
 function renderItem(x:Item){
  const overall=x.id+":overall";
  const hasModifiers=x.groups.some(g=>g.values.length>0);
  const modifierKeys=Object.keys(saves).filter(k=>k.startsWith(x.id+":")&&k!==overall);
  const ratedModifier=Object.keys(ratings).some(k=>k.startsWith(x.id+":")&&k!==overall&&ratings[k]!==undefined);
  const refineStatus=modifierKeys.some(k=>saves[k]==="failed")?"failed":modifierKeys.some(k=>saves[k]==="saving")?"saving":undefined;
  return <ItemRow key={x.id} name={x.name} itemId={x.id}
   indicators={isRewards&&<span className="cc-rp-indicators">{(["reward","punishment"] as const).map(kind=>{const state=classification[x.id][kind];const open=indicatorInfo?.id===x.id&&indicatorInfo.kind===kind;const label=kind==="reward"?"Reward":"Punishment";const stateLabel=state==="yes"?"Yes":state==="no"?"No":"Unanswered";return <span className="cc-rp-indicator-anchor" key={kind}><button type="button" className={"cc-rp-indicator cc-rp-state-"+state} aria-label={x.name+": "+label+" — "+stateLabel+". Show explanation"} aria-expanded={open} aria-haspopup="dialog" onClick={e=>{indicatorOrigin.current=e.currentTarget;setIndicatorInfo(open?null:{id:x.id,kind})}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==="reward"?<><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-7 0-7-7-3-7 2.5 0 3 4 3 7Zm0 0c7 0 7-7 3-7-2.5 0-3 4-3 7Z"/></>:<><path d="m13 4 7 7M10 7l7 7M4 20l10-10M2 22l4-4M14 2l8 8"/></>}</svg><span aria-hidden="true">{state==="yes"?"✓":state==="no"?"✕":"?"}</span></button>{open&&<span className="cc-rp-popover" role="dialog" aria-label={label+" classification for "+x.name}><strong>{label} · {stateLabel}</strong><span>{state==="yes"?"You've classified this Item as a "+label.toLowerCase()+".":state==="no"?"You've marked this Item as not a "+label.toLowerCase()+".":"You haven't answered whether this Item is a "+label.toLowerCase()+"."}</span><button type="button" onClick={()=>{setIndicatorInfo(null);indicatorOrigin.current?.focus()}}>Close</button></span>}</span>})}</span>}
   preference={ratingButton(overall,x.name+" overall",x.name)}
   onRefine={hasModifiers?()=>openRefine(x.id):undefined} refined={ratedModifier} refineStatus={refineStatus}/>;
 }
 const refinedItem=items.find(x=>x.id===refining);
 function modifierContent(x:Item){
  const errors=Object.keys(saves).filter(k=>k.startsWith(x.id+":")&&k!==x.id+":overall"&&saves[k]==="failed");
  const issueIndex=Math.max(0,errors.indexOf(issueTarget||""));
  return <div className="cc-refine-content">{errors.length>0&&<div className="cc-error-summary" role="status"><span>Issue {issueIndex+1} of {errors.length} · Latest edits kept</span><button onClick={()=>errors.forEach(retry)}>Retry all</button>{errors.length>1&&<button onClick={()=>revealIssue(errors[(issueIndex+1)%errors.length])}>Next issue</button>}</div>}{x.groups.map(g=>{const gk=x.id+":"+g.name;const go=groupsOpen[gk]??false;const keys=g.values.map(v=>gk+":"+v);const status=keys.some(k=>saves[k]==="failed")?"failed":keys.some(k=>saves[k]==="saving")?"saving":undefined;return <DisclosureSection title={g.name} description={g.values.length+" options"} key={gk} open={go} status={status} onToggle={()=>{setGroupsOpen(p=>({...p,[gk]:!go}));if(!go&&status==="failed")revealIssue(keys.find(k=>saves[k]==="failed")!)}}><div className="cc-values">{g.values.map(v=><div className={"cc-value"+(issueTarget===gk+":"+v?" cc-value-highlight":"")} key={v} data-field-id={gk+":"+v}><span>{v}</span>{ratingButton(gk+":"+v,v,x.name+" / "+g.name)}</div>)}</div></DisclosureSection>})}<ItemExperience itemId={x.id} name={x.name} open={experienceOpen} onToggle={()=>setExperienceOpen(!experienceOpen)} records={records}/></div>

 }
 return <section className="cc" ref={root} aria-label="Interactive inline Catalog prototype">
  
  {!compact&&<div className="cc-demo cc-demo-compact"><span>{items.length} sample Items · Session only · Saves simulated</span><label><input type="checkbox" checked={failNext} onChange={e=>setFailNext(e.target.checked)}/> Test save failure</label></div>}
  {Object.values(saves).includes("failed")&&<div className="cc-error-summary" role="status"><span>{Object.values(saves).filter(v=>v==="failed").length} changes not saved · Latest edits kept</span><button onClick={()=>Object.keys(saves).filter(k=>saves[k]==="failed").forEach(retry)}>Retry all</button><button onClick={()=>revealIssue(Object.keys(saves).find(k=>saves[k]==="failed")!)}>Review issues</button></div>}
  <div className="cc-browser">{!compact&&<><label className="cc-search-label" htmlFor="cc-item-search">Search Items</label><SearchRow><SearchField mode="input" inputId="cc-item-search" placeholder="Search Items…" ariaLabel={isRewards?"Search rewards and punishments":"Search kinks"} value={query} onChange={setQuery} onClear={clearSearch} resultsId="cc-search-results" /><SearchFilterButton active={sortBy!==(isRewards?"az":"default")||effectiveGroupBy!=="none"} groupingAvailable={groupingAvailable} expanded={orderOpen} onClick={()=>setOrderOpen(true)}/></SearchRow>
   {isRewards&&<SearchChips label="Reward and punishment filters" options={[{id:"mine",label:"Mine",active:mine,onClick:()=>setMine(!mine)},{id:"reward",label:"Reward",active:reward,onClick:()=>setReward(!reward)},{id:"punishment",label:"Punishment",active:punishment,onClick:()=>setPunishment(!punishment)},{id:"answers",label:states.length?"Answers · "+states.length:"Answers",active:states.length>0,onClick:()=>setFiltersOpen(true)}]} clear={hasFilters?clearFilters:undefined}/>} 
    <div className="cc-toolbar cc-toolbar--compact"><span aria-live="polite" aria-atomic="true">{matching.length} {matching.length===1?"Item":"Items"}</span></div>
   </>}<div className="cc-sections" id="cc-search-results" aria-busy={query!==debouncedQuery}>{sections.filter(([,list])=>list.length).map(([heading,list])=><section key={heading} className="cc-section"><button className={"cc-section-title"+(heading==="All Items"?" cc-section-title-flat":"")} aria-expanded={!closedCategories[heading]} onClick={()=>setClosedCategories(p=>({...p,[heading]:!p[heading]}))}><span>{heading==="All Items"?"":heading} <small>{heading==="All Items"?"":list.length+" Items"}</small></span><span aria-hidden="true">{closedCategories[heading]?"⌄":"⌃"}</span></button>{!closedCategories[heading]&&<div className="cc-section-items">{list.map(renderItem)}</div>}</section>)}{matching.length===0&&<div className="cc-empty" role="status"><p>No matching Items. Try another search or adjust filters.</p><div className="cc-empty-actions">{query&&<button type="button" onClick={clearSearch}>Clear search</button>}{isRewards&&hasFilters&&<button type="button" onClick={clearFilters}>Clear filters</button>}</div></div>}</div>
  </div>
  <ModalLayer open={isRewards&&filtersOpen} onClose={()=>setFiltersOpen(false)} label="Answer states" closeLabel="Close answer states">
   <SheetHeader title="Answer states" context="REWARDS & PUNISHMENTS" onClose={()=>setFiltersOpen(false)} closeLabel="Close answer states"/>
   <p className="cc-refine-intro">Filter by your classification answers</p>
   <SearchChips label="Classification answer states" options={([["unanswered","? Unanswered"],["no","✕ No"],["yes","✓ Yes"]] as const).map(([value,label])=>({id:value,label,active:states.includes(value),onClick:()=>setStates(prev=>prev.includes(value)?prev.filter(v=>v!==value):[...prev,value])}))}/>
   <p className="cc-rp-count">{matching.length} matching Items</p>
  </ModalLayer>
  <SortGroupSheet open={orderOpen} onClose={()=>setOrderOpen(false)} sort={sortBy} onSort={setSortBy} group={effectiveGroupBy} onGroup={setGroupBy} showGrouping={groupingAvailable} defaultSortLabel="Catalog order" showDefault={!isRewards}/>
   <ModalLayer open={!!refinedItem} onClose={closeRefine} label={"Refine "+(refinedItem?.name||"")} closeLabel="Close refinement" className={selector?"cc-refine-underlay":""} panelClassName="cc-refine-sheet">
    {refinedItem&&<><SheetHeader title={refinedItem.name} context="REFINE ITEM" onClose={closeRefine} closeLabel="Close refinement"><div className="cc-refine-overall">{ratingButton(refinedItem.id+":overall",refinedItem.name+" overall",refinedItem.name)}</div></SheetHeader>{modifierContent(refinedItem)}</>}
   </ModalLayer>
   {selector&&<PreferenceSheet open onClose={closeSelector} label={selector.label} context={selector.parent} value={ratings[selector.id]} options={choices} onChange={value=>commit(selector.id,value)} help={<PreferenceReference/>} helpOpen={records.helpOpen} onHelpOpenChange={records.setHelpOpen} className={refinedItem?"cc-rating-over-refine":""}/>}

 </section>
}
