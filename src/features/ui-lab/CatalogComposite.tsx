import { useEffect, useRef, useState } from "react";
import "./catalogComposite.css";
import { LabToasts, type LabToast } from "./LabToasts";

type SaveState = "idle" | "saving" | "failed";
type Group = { name: string; values: string[] };
const groups: Group[] = [
  { name: "Material", values: ["Leather", "Metal", "Fabric", "Silicone"] },
  { name: "Use / Context", values: ["Everyday", "Scene / Play", "Ceremonial"] },
];
const choices = ["Love", "Like", "Neutral", "Dislike", "Hard limit"];
const examples = ["Collars", "Restraints", "Sensory Play", "Praise", "Privileges"];
export function CatalogComposite({ initialItem, onClose }: { initialItem?: string; onClose?: () => void }) {
 const [item, setItem] = useState(initialItem || "Collars");
 const [expanded, setExpanded] = useState(true);
 const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({Material:true,"Use / Context":false});
 const [ratings, setRatings] = useState<Record<string,string>>({});
 const [save, setSave] = useState<Record<string,SaveState>>({});
 const [selector, setSelector] = useState<string|null>(null);
 const [showHelp, setShowHelp] = useState(false);
 const [failNext, setFailNext] = useState(false);
 const [filter, setFilter] = useState("");
 const [toasts, setToasts] = useState<LabToast[]>([]);
 const nextToast = useRef(0);
 const notify=(message:string,kind:LabToast["kind"],actionLabel?:string,onAction?:()=>void)=>setToasts(prev=>[...prev.filter(t=>!(kind==="success"&&t.kind==="success"&&!t.actionLabel)),{id:++nextToast.current,message,kind,actionLabel,onAction}]);
 const dismissToast=(id:number)=>setToasts(prev=>prev.filter(t=>t.id!==id));
 const timers = useRef<Record<string,ReturnType<typeof setTimeout>>>({});
 const headingRef = useRef<HTMLHeadingElement>(null);
 const originRef = useRef<HTMLButtonElement|null>(null);
 const errorKeys = Object.keys(save).filter(k=>save[k]==="failed");
 const saving = Object.values(save).some(s=>s==="saving");
 const rated = Object.keys(ratings).length>0;
 const status = errorKeys.length ? "failed" : saving ? "saving" : rated ? "rated" : "idle";
 useEffect(()=>()=>{Object.values(timers.current).forEach(clearTimeout)},[]);
 useEffect(()=>{if(selector) headingRef.current?.focus()},[selector]);
 useEffect(()=>{if(!selector) return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")closeSelector()};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[selector]);
 function closeSelector(returnFocus=true){setSelector(null);setShowHelp(false);if(returnFocus)requestAnimationFrame(()=>originRef.current?.focus())}
 function commit(key:string, value:string|undefined){
  setRatings(prev=>{const next={...prev};if(value===undefined)delete next[key];else next[key]=value;return next});
  setSave(prev=>({...prev,[key]:"saving"}));
  clearTimeout(timers.current[key]);
  const shouldFail=failNext;setFailNext(false);
  timers.current[key]=setTimeout(()=>{setSave(prev=>({...prev,[key]:shouldFail?"failed":"idle"}));if(shouldFail)notify("Save failed. Your selection is preserved.","error","Retry",()=>retry(key));else notify("Preference saved","success");},850);
 }
 function retry(key:string){commit(key,ratings[key])}
 function revealError(){const key=errorKeys[0];if(!key)return;setExpanded(true);setOpenGroups(p=>({...p,[key.split(":")[0]]:true}));requestAnimationFrame(()=>document.getElementById("lab-mod-"+key.replace(/[^a-z0-9]/gi,"-"))?.scrollIntoView({block:"nearest",behavior:"smooth"}))}
 const statusLabel=status==="failed"?"Save failed":status==="saving"?"Saving…":status==="rated"?"Rated modifiers exist":"";
 const currentGroups=item==="Collars"?groups:item==="Restraints"?[{name:"Material",values:["Rope","Cuffs","Fabric"]},{name:"Use / Context",values:["Decorative","Functional"]}]:[{name:"Preferences",values:["Giving","Receiving","Self-directed"]}];
 return <section className="cc" aria-label="Interactive Catalog composite prototype">
  <div className="cc-top"><div><span className="cc-eyebrow">UI LAB / CATALOG COMPOSITE</span><h2>Explore preferences</h2><p>Browse freely. Your choices are yours to make.</p></div>{onClose&&<button className="cc-close" onClick={onClose} aria-label="Close Catalog composite">×</button>}</div>
  <div className="cc-demo"><span>Interactive prototype · No account data is changed</span><label><input type="checkbox" checked={failNext} onChange={e=>setFailNext(e.target.checked)}/> Fail next save (test recovery)</label></div>
  <div className="cc-layout"><div className="cc-items" aria-label="Example Catalog items"><h3>Items</h3>{examples.map(name=><button key={name} className={item===name?"selected":""} onClick={()=>{setItem(name);setExpanded(false);setSelector(null)}}>{name}<span>›</span></button>)}</div>
  <div className="cc-detail"><div className="cc-detail-head"><div><span className="cc-eyebrow">KINKS / ITEM</span><h3>{item}</h3><p>Explore the nuances that matter to you.</p></div><span className="cc-overall">Overall <strong>Not rated</strong></span></div>
  <button className="cc-refine" aria-expanded={expanded} aria-controls="cc-modifiers" onClick={()=>{if(selector)closeSelector(false);setExpanded(v=>!v)}}><span className="cc-plus">{expanded?"−":"+"}</span> Refine {status==="rated"&&!expanded?<span className="cc-dot" aria-label="Rated modifiers exist"/>:status==="failed"?<span className="cc-error" aria-label="Save failed">!</span>:status==="saving"?<span className="cc-saving" aria-label="Saving">◌</span>:null}</button>
  {expanded&&<div id="cc-modifiers" className="cc-modifiers">{currentGroups.map(group=>{const filtered=group.values.filter(v=>v.toLowerCase().includes(filter.toLowerCase()));const groupErrors=errorKeys.filter(k=>k.startsWith(group.name+":"));return <section className="cc-group" key={group.name}><button className="cc-group-head" aria-expanded={!!openGroups[group.name]} onClick={()=>setOpenGroups(p=>({...p,[group.name]:!p[group.name]}))}><span>{group.name}<small>{filter&&filtered.length===0?"No matches":group.values.length+" options"}</small></span><span>{groupErrors.length>0?<span className="cc-error" aria-label="Group contains a failed save">!</span>:null} {openGroups[group.name]?"⌃":"⌄"}</span></button>{openGroups[group.name]&&<div className="cc-values">{filtered.length===0?<div className="cc-empty">No values match this filter. <button onClick={()=>setFilter("")}>Clear filter</button></div>:filtered.map(value=>{const key=group.name+":"+value;const state=save[key]||"idle";return <div className="cc-value" id={"lab-mod-"+key.replace(/[^a-z0-9]/gi,"-")} key={key}><button className="cc-value-main" onClick={e=>{originRef.current=e.currentTarget;setSelector(key)}}><span>{value}</span><span className={ratings[key]?"cc-rated":""}>{ratings[key]||"Not rated"}</span></button>{state==="saving"&&<span className="cc-small-status" aria-label="Saving">◌</span>}{state==="failed"&&<button className="cc-retry" onClick={()=>retry(key)}>Retry save</button>}</div>})}</div>}</section>})}</div>}
  <div className="cc-filter"><label htmlFor="cc-filter-input">Filter modifier values</label><input id="cc-filter-input" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Try leather or ceremonial…" />{filter&&<button onClick={()=>setFilter("")}>Clear</button>}</div>
  {errorKeys.length>0&&<button className="cc-recover" onClick={revealError}>⚠ {errorKeys.length} save issue{errorKeys.length>1?"s":""} · Go to first failed modifier</button>}
  </div></div>
  <LabToasts items={toasts} onDismiss={dismissToast}/>
  {selector&&<div className="cc-modal-layer"><button className="cc-backdrop" onClick={()=>closeSelector()} aria-label="Dismiss rating selector"/><div className="cc-selector" role="dialog" aria-modal="true" aria-labelledby="cc-selector-title"><div className="cc-selector-head"><div><small>{item} / {selector.split(":")[0]}</small><h3 id="cc-selector-title" tabIndex={-1} ref={headingRef}>{selector.split(":")[1]}</h3></div><button onClick={()=>closeSelector()} aria-label="Close selector">×</button></div><div className="cc-options">{choices.map(choice=><button key={choice} className={ratings[selector]===choice?"chosen":""} onClick={()=>{commit(selector,choice);closeSelector()}}>{choice}{ratings[selector]===choice?" ✓":""}</button>)}</div><button className="cc-help" aria-expanded={showHelp} onClick={()=>setShowHelp(v=>!v)}>What do these mean? {showHelp?"−":"+"}</button>{showHelp&&<p className="cc-explanation">These describe your personal preference, not your experience or comfort. You can change them at any time.</p>}{ratings[selector]&&<button className="cc-clear" onClick={()=>{commit(selector,undefined);closeSelector()}}>Clear rating</button>}</div></div>}
 </section>;
}
