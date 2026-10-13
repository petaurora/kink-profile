import { useEffect, useRef, useState } from "react";
import "./catalogComposite.css";
import { useToasts } from "../../components/ui/ToastProvider";
import { ModalLayer } from "../../components/ui/ModalLayer";
import { PreferenceControl, PreferenceSheet, SheetHeader } from "../../components/ui/PreferenceControl";
import { ItemRow } from "../../components/ui/ItemRow";
import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { SearchField } from "../../components/ui/SearchField";
import { SearchRow, SearchFilterButton, SearchChips, SortGroupSheet, type SortBy, type GroupBy } from "../../components/ui/SearchControls";

import { preferenceRatings, ratingKey, type CatalogItem as Item, type CatalogSearchTarget, type PreferenceTarget, type PreferenceRating } from "../../services/contracts";
import { matchesSearch } from "../../services/search";
import { useReferenceData, usePreferences } from "../../services/AppServicesProvider";
import type { UiLabAdapter } from "./services/createUiLabServices";

function matchesCatalogSearch(item:Item,query:string){
 return matchesSearch([item.name,item.description||"",item.category,...item.groups.flatMap(g=>[g.name,...g.values.map(v=>v.name)])].join(" "),query);
}
function modifierKeys(item:Item){return item.groups.flatMap(group=>group.values.map(value=>ratingKey({kind:"modifier",itemId:item.id,groupId:group.id,valueId:value.id})));}
export function CatalogComposite({initialTarget,subject,compact=false,collection="kinks",diagnostics}:{collection?:"kinks"|"rewards";initialTarget?:CatalogSearchTarget;subject?:string;compact?:boolean;diagnostics?:UiLabAdapter}){
 const {items,subjects}=useReferenceData();
 const {ratings,saves,classifications:classification,setRating}=usePreferences();
 const isRewards=collection==="rewards";
 const [mine,setMine]=useState(false),[reward,setReward]=useState(false),[punishment,setPunishment]=useState(false);
 const [states,setStates]=useState<string[]>([]),[filtersOpen,setFiltersOpen]=useState(false);
 const [indicatorInfo,setIndicatorInfo]=useState<{id:string;kind:"reward"|"punishment"}|null>(null);
 const indicatorOrigin=useRef<HTMLButtonElement|null>(null);
 const [sortBy,setSortBy]=useState<SortBy>(isRewards?"az":"default");
 const [groupBy,setGroupBy]=useState<GroupBy>("none");
 const [orderOpen,setOrderOpen]=useState(false);
 const [query,setQuery]=useState("");
 const [debouncedQuery,setDebouncedQuery]=useState("");
 const clearSearch=()=>{setQuery("");setDebouncedQuery("")};
 const [refining,setRefining]=useState<string|null>(null);
 const [closedCategories,setClosedCategories]=useState<Record<string,boolean>>({});
 const [groupsOpen,setGroupsOpen]=useState<Record<string,boolean>>({});
 const [selector,setSelector]=useState<{target:PreferenceTarget;label:string;parent:string}|null>(null);

 const [failNext,setFailNext]=useState(false);
 const toastQueue=useToasts();
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{const timer=setTimeout(()=>setDebouncedQuery(query),275);return()=>clearTimeout(timer)},[query]);
 useEffect(()=>{setClosedCategories({})},[debouncedQuery,groupBy,sortBy]);


 useEffect(()=>{
  if(!initialTarget)return;
  const found=items.find(x=>x.id===initialTarget.itemId);
  if(found){
   setRefining(found.id);
   setGroupsOpen(initialTarget.groupId?{[found.id+":"+initialTarget.groupId]:true}:{});
   const frame=requestAnimationFrame(()=>{
    const value=[...root.current?.querySelectorAll<HTMLElement>("[data-modifier-id]")??[]].find(node=>node.dataset.modifierId===initialTarget.valueId&&node.dataset.groupId===initialTarget.groupId);
    value?.scrollIntoView({block:"nearest"});value?.focus({preventScroll:true});
   });
   return ()=>cancelAnimationFrame(frame);
  }
 },[initialTarget,items]);
 function openRefine(id:string){setGroupsOpen({});setRefining(id)}
 function closeRefine(){setRefining(null)}
 function closeSelector(){setSelector(null)}
 const notify=toastQueue.notify;
 async function commit(target:PreferenceTarget,value:PreferenceRating|undefined){
  if(failNext){diagnostics?.failNext("save");setFailNext(false);}
  const outcome=await setRating(target,value);
  if(outcome==="failed")notify({message:"Save failed. Your rating is preserved; retry beside the rating.",kind:"error"});
  else if(outcome==="saved")notify({message:"Preference saved for this Lab session",kind:"success"});
 }
 function ratingButton(target:PreferenceTarget,label:string,parent:string){
  const key=ratingKey(target);
  return <PreferenceControl value={ratings[key]} label={label} saveState={saves[key]} onRetry={()=>void commit(target,ratings[key])} onActivate={()=>setSelector({target,label,parent})}/>;
 }
 const hasFilters=mine||reward||punishment||states.length>0;
 const clearFilters=()=>{setMine(false);setReward(false);setPunishment(false);setStates([])};
 const subjectIds=subject?subjects.find(x=>x.name===subject)?.itemIds:undefined;
 const matching=items.filter(x=>{
 if(!isRewards)return (!subject||subjectIds?.includes(x.id))&&matchesCatalogSearch(x,debouncedQuery);
 const cl=classification[x.id]??{reward:"unanswered",punishment:"unanswered"};
 if(!x.collections.includes("rewards")&&cl.reward!=="yes"&&cl.punishment!=="yes")return false;
 if(mine&&cl.reward!=="yes"&&cl.punishment!=="yes")return false;
 const dims=reward||punishment?[...(reward?["reward" as const]:[]),...(punishment?["punishment" as const]:[])]:(["reward","punishment"] as const);
 if((reward||punishment||states.length>0)&&!dims.some(d=>states.length?states.includes(cl[d]):cl[d]==="yes"))return false;
 return matchesCatalogSearch(x,debouncedQuery);
 }).sort((a,b)=>sortBy==="az"?a.name.localeCompare(b.name):sortBy==="za"?b.name.localeCompare(a.name):isRewards?a.name.localeCompare(b.name):0);
 // Grouping matters only when this result set contains multiple categories.
 const groupingAvailable=!compact&&!subject&&new Set(matching.map(x=>x.category)).size>1;
 const effectiveGroupBy=groupingAvailable?groupBy:"none";
 const sections=compact||effectiveGroupBy==="none"?[["All Items",matching] as const]:[...new Set(items.map(x=>x.category))].filter(category=>matching.some(x=>x.category===category)).map(category=>[category,matching.filter(x=>x.category===category)] as const);
 useEffect(()=>{if(!indicatorInfo)return;const dismiss=(e:KeyboardEvent)=>{if(e.key==="Escape"){setIndicatorInfo(null);indicatorOrigin.current?.focus()}};const outside=(e:PointerEvent)=>{if(!(e.target as HTMLElement).closest(".cc-rp-indicators"))setIndicatorInfo(null)};document.addEventListener("keydown",dismiss);document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("keydown",dismiss);document.removeEventListener("pointerdown",outside)}},[indicatorInfo]);
 function renderItem(x:Item){
  const overall:PreferenceTarget={kind:"item",itemId:x.id};
  const hasModifiers=x.groups.some(g=>g.values.length>0);
  const ratedModifier=modifierKeys(x).some(k=>ratings[k]!==undefined);
  return <ItemRow key={x.id} name={x.name} itemId={x.id}
   indicators={isRewards&&<span className="cc-rp-indicators">{(["reward","punishment"] as const).map(kind=>{const state=classification[x.id]?.[kind]??"unanswered";const open=indicatorInfo?.id===x.id&&indicatorInfo.kind===kind;const label=kind==="reward"?"Reward":"Punishment";const stateLabel=state==="yes"?"Yes":state==="no"?"No":"Unanswered";return <span className="cc-rp-indicator-anchor" key={kind}><button type="button" className={"cc-rp-indicator cc-rp-state-"+state} aria-label={x.name+": "+label+" — "+stateLabel+". Show explanation"} aria-expanded={open} aria-haspopup="dialog" onClick={e=>{indicatorOrigin.current=e.currentTarget;setIndicatorInfo(open?null:{id:x.id,kind})}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==="reward"?<><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-7 0-7-7-3-7 2.5 0 3 4 3 7Zm0 0c7 0 7-7 3-7-2.5 0-3 4-3 7Z"/></>:<><path d="m13 4 7 7M10 7l7 7M4 20l10-10M2 22l4-4M14 2l8 8"/></>}</svg><span aria-hidden="true">{state==="yes"?"✓":state==="no"?"✕":"?"}</span></button>{open&&<span className="cc-rp-popover" role="dialog" aria-label={label+" classification for "+x.name}><strong>{label} · {stateLabel}</strong><span>{state==="yes"?"You've classified this Item as a "+label.toLowerCase()+".":state==="no"?"You've marked this Item as not a "+label.toLowerCase()+".":"You haven't answered whether this Item is a "+label.toLowerCase()+"."}</span><button type="button" onClick={()=>{setIndicatorInfo(null);indicatorOrigin.current?.focus()}}>Close</button></span>}</span>})}</span>}
   preference={ratingButton(overall,x.name+" overall",x.name)}
   onRefine={hasModifiers?()=>openRefine(x.id):undefined} refined={ratedModifier}/>;
 }
 const refinedItem=items.find(x=>x.id===refining);
 function modifierContent(x:Item){
  const errors=modifierKeys(x).filter(k=>saves[k]==="failed");
  return <div className="cc-refine-content">{x.groups.map(g=>{const gk=x.id+":"+g.id;const go=groupsOpen[gk]??false;return <DisclosureSection title={g.name} description={g.values.length+" options"} key={gk} open={go} onToggle={()=>setGroupsOpen(p=>({...p,[gk]:!go}))}><div className="cc-values">{g.values.map(v=><div key={v.id} data-modifier-id={v.id} data-group-id={g.id} className={initialTarget?.itemId===x.id&&initialTarget.groupId===g.id&&initialTarget.valueId===v.id?"cc-value cc-search-target":"cc-value"} tabIndex={initialTarget?.itemId===x.id&&initialTarget.valueId===v.id?-1:undefined}><span>{v.name}</span>{ratingButton({kind:"modifier",itemId:x.id,groupId:g.id,valueId:v.id},v.name,x.name+" / "+g.name)}</div>)}</div></DisclosureSection>})}{errors.length>0&&<p className="cc-error-summary" role="status">{errors.length} save issue{errors.length===1?"":"s"} · Retry beside affected rating.</p>}</div>

 }
 return <section className="cc" ref={root} aria-label="Interactive inline Catalog prototype">
  
  {!compact&&<div className="cc-demo cc-demo-compact"><span>{items.length} sample Items · Ratings last for this Lab session</span>{diagnostics&&<label><input type="checkbox" checked={failNext} onChange={e=>setFailNext(e.target.checked)}/> Test save failure</label>}</div>}
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
    {refinedItem&&<><SheetHeader title={refinedItem.name} context="REFINE ITEM" onClose={closeRefine} closeLabel="Close refinement"><div className="cc-refine-overall">{ratingButton({kind:"item",itemId:refinedItem.id},refinedItem.name+" overall",refinedItem.name)}</div></SheetHeader>{modifierContent(refinedItem)}</>}
   </ModalLayer>
   {selector&&<PreferenceSheet open onClose={closeSelector} label={selector.label} context={selector.parent} value={ratings[ratingKey(selector.target)]} options={preferenceRatings} onChange={value=>void commit(selector.target,value as PreferenceRating|undefined)} help="These describe preference, not experience or comfort. All ratings are optional." className={refinedItem?"cc-rating-over-refine":""}/>}

 </section>
}
