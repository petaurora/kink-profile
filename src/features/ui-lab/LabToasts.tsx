import { useEffect, useRef, useState } from "react";
import "./labToasts.css";
export type LabToast = {id:number;message:string;kind:"success"|"error"|"info";actionLabel?:string;onAction?:()=>void;duration?:number};
export function LabToasts({items,onDismiss}:{items:LabToast[];onDismiss:(id:number)=>void}) {
 const active=items[0];
 const [paused,setPaused]=useState(false);
 const [offset,setOffset]=useState(0);
 const start=useRef<{x:number;y:number}|null>(null);
 const remaining=useRef(0);
 const began=useRef(0);
 useEffect(()=>{remaining.current=active?.duration??(active?.kind==="error"?0:active?.actionLabel?8000:3500);setPaused(false);setOffset(0)},[active?.id]);
 useEffect(()=>{if(!active||paused||remaining.current===0)return;began.current=Date.now();const timer=setTimeout(()=>onDismiss(active.id),remaining.current);return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(Date.now()-began.current))}},[active?.id,paused,onDismiss]);
 if(!active)return null;
 const compact=active.kind==="success"&&!active.actionLabel&&active.message.length<45;
 const dismiss=()=>onDismiss(active.id);
 return <div className="lt-region" aria-label="Notifications"><div key={active.id} className={"lt-toast "+(compact?"lt-pill":"lt-rect")+" lt-"+active.kind} role={active.kind==="error"?"alert":"status"} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}} onTouchStart={e=>{const t=e.touches[0];if(t)start.current={x:t.clientX,y:t.clientY}}} onTouchMove={e=>{const t=e.touches[0];if(!t||!start.current)return;const dx=t.clientX-start.current.x,dy=t.clientY-start.current.y;if(Math.abs(dx)>Math.abs(dy)*1.6)setOffset(dx)}} onTouchEnd={()=>{if(Math.abs(offset)>85)dismiss();setOffset(0);start.current=null}} style={{transform:`translateX(${offset}px)`,opacity:Math.max(.35,1-Math.abs(offset)/260)}}><span className="lt-message">{active.message}</span>{active.actionLabel&&<button className="lt-action" onClick={()=>{active.onAction?.();dismiss()}}>{active.actionLabel}</button>}{!compact&&<button className="lt-dismiss" onClick={dismiss} aria-label="Dismiss notification">×</button>}</div></div>
}
