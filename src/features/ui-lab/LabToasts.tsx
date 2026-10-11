import { useCallback, useEffect, useRef, useState } from "react";
import "./labToasts.css";

export type LabToast = {id:number;message:string;kind:"success"|"error"|"info";actionLabel?:string;onAction?:()=>void;duration?:number};
export function LabToasts({items,onDismiss,modalOpen=false}:{items:LabToast[];onDismiss:(id:number)=>void;modalOpen?:boolean}) {
 const active=items[0];
 const [paused,setPaused]=useState(false);
 const [offset,setOffset]=useState(0);
 const [leaving,setLeaving]=useState(false);
 const pointer=useRef<{x:number;y:number;id:number}|null>(null);
 const duration=active?.duration??(active?.kind==="error"?0:active?.actionLabel?8000:3500);
 const remaining=useRef(duration);
 const started=useRef(0);
 const dismissRef=useRef(onDismiss);
 dismissRef.current=onDismiss;
 useEffect(()=>{remaining.current=duration;setPaused(false);setOffset(0);setLeaving(false)},[active?.id,duration]);
 useEffect(()=>{
  if(!active||paused||leaving||remaining.current<=0)return;
  started.current=Date.now();
  const id=active.id;
  const timer=window.setTimeout(()=>dismissRef.current(id),remaining.current);
  return ()=>{window.clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(Date.now()-started.current))};
 },[active?.id,paused,leaving]);
 const dismiss=useCallback(()=>{if(!active||leaving)return;setLeaving(true);const id=active.id;window.setTimeout(()=>dismissRef.current(id),150)},[active?.id,leaving]);
 if(!active)return null;
 const compact=active.kind==="success"&&!active.actionLabel&&active.message.length<45;
 return <div className={"lt-region"+(modalOpen?" lt-region-modal":"")} aria-label="Notifications"><div key={active.id} className={"lt-toast "+(compact?"lt-pill":"lt-rect")+" lt-"+active.kind+(leaving?" lt-leaving":"")} role={active.kind==="error"?"alert":"status"}
 onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
 onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}}
 onPointerDown={e=>{if(e.pointerType==="touch"||e.pointerType==="pen"){pointer.current={x:e.clientX,y:e.clientY,id:e.pointerId};setPaused(true)}}}
 onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.3){if(!e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.setPointerCapture(e.pointerId);setOffset(dx)}}}
 onPointerUp={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const dx=e.clientX-p.x;pointer.current=null;if(Math.abs(dx)>75){setOffset(dx>0?320:-320);dismiss()}else{setOffset(0);setPaused(false)}}}
 onPointerCancel={()=>{pointer.current=null;setOffset(0);setPaused(false)}}
 style={{transform:`translateX(${offset}px)`,opacity:leaving?0:Math.max(.35,1-Math.abs(offset)/260)}}>
 <span className="lt-message">{active.message}</span>
 {active.actionLabel&&<button className="lt-action" onClick={()=>{active.onAction?.();dismiss()}}>{active.actionLabel}</button>}
 {!compact&&<button className="lt-dismiss" onClick={dismiss} aria-label="Dismiss notification">×</button>}
 </div></div>;
}
