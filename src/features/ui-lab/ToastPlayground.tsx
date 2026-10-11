import { useCallback, useRef, useState } from "react";
import { LabToasts, type LabToast } from "./LabToasts";
import "./toastPlayground.css";

export function ToastPlayground() {
 const [items,setItems]=useState<LabToast[]>([]);
 const [lastAction,setLastAction]=useState("No actions yet.");
 const nextId=useRef(0);
 const dismiss=useCallback((id:number)=>setItems(prev=>prev.filter(t=>t.id!==id)),[]);
 const push=(message:string,kind:LabToast["kind"],actionLabel?:string,onAction?:()=>void,duration?:number)=>{
  const toast:LabToast={id:++nextId.current,message,kind,actionLabel,onAction,duration};
  setItems(prev=>{if(prev.some(t=>t.message===message&&t.kind===kind&&t.actionLabel===actionLabel))return prev;return [...prev.filter(t=>!(kind==="success"&&!actionLabel&&t.kind==="success"&&!t.actionLabel)),toast]});
 };
 const demoRetry=()=>{setLastAction("Retry selected");push("Saved successfully after retry","success")};
 const demoUndo=()=>{setLastAction("Rating restored");push("Rating restored","success")};
 const demos=[
  {name:"Success pill",description:"Short confirmation, no rail or close button",run:()=>push("Preference saved","success")},
  {name:"Actionable toast",description:"Rounded rectangle with divided action",run:()=>push("Changes can be undone","info","Undo",demoUndo,8000)},
  {name:"Error + Retry",description:"Persistent failure with recovery",run:()=>push("Couldn't save this modifier","error","Retry",demoRetry,0)},
  {name:"Clear + Undo",description:"Undoable change with longer timeout",run:()=>push("Rating cleared","info","Undo",demoUndo,8000)},
  {name:"Queue 3 messages",description:"One visible notification; queued messages follow",run:()=>{push("First notification","info",undefined,undefined,2500);push("Second notification","info",undefined,undefined,2500);push("Third notification","error",undefined,undefined,0)}},
  {name:"Long message",description:"Test wrapping and responsive width",run:()=>push("Your preferences were updated, but a separate modifier could not be saved. You can retry the affected change without losing your selection.","error","Retry",demoRetry,0)},
  {name:"Morph sequence",description:"Test compact to actionable geometry in sequence",run:()=>{push("Saved","success",undefined,undefined,1800);push("You can undo the latest change","info","Undo",demoUndo,8000)}},
 ];
 return <section className="tp" aria-label="Toast playground">
  <div className="tp-head"><div><span className="tp-kicker">DESIGN LAB / NOTIFICATIONS</span><h2>Toast Playground</h2><p>Trigger each notification and inspect its size, timing, actions, and dismissal. No real preferences are changed.</p></div><span className="tp-count">{items.length} queued</span></div>
  <div className="tp-grid">{demos.map(d=><button key={d.name} type="button" className="tp-trigger" onClick={d.run}><strong>{d.name}</strong><small>{d.description}</small><span>Try →</span></button>)}</div>
  <div className="tp-footer"><span role="status">Last action: {lastAction}</span><button onClick={()=>setItems([])}>Clear notifications</button></div>
  <p className="tp-note">Hover or focus to pause. Swipe horizontally to dismiss on touch. Error notifications remain until dismissed or acted on. This is a UI prototype, not production persistence.</p>
  <LabToasts items={items} onDismiss={dismiss}/>
 </section>;
}
