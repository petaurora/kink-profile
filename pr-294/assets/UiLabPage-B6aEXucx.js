import{r as jt,a as c,j as e,p as Nn,s as tn,c as Pn,b as St,d as At,e as Tt,u as $n,f as _n}from"./index-CuIj65a3.js";var Ct=jt();const $=[],Rn='button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';let En="";const cn=new Set,Bn=()=>cn.forEach(n=>n()),Yn=n=>(cn.add(n),()=>{cn.delete(n)});function It(){return c.useSyncExternalStore(Yn,()=>$.length>0,()=>!1)}function Kn(){return c.useSyncExternalStore(Yn,()=>$.at(-1)?.panel??null,()=>null)}const dn=new Map;let $e;function Gn(){for(const[n,i]of dn)i.inert===null?n.removeAttribute("inert"):n.setAttribute("inert",i.inert),i.hidden===null?n.removeAttribute("aria-hidden"):n.setAttribute("aria-hidden",i.hidden);dn.clear()}function an(){Gn();const n=$.at(-1);if(!n)return;const i=n.panel.parentElement?.querySelector(".kp-modal-backdrop"),a=[n.panel,...i?[i]:[],...document.querySelectorAll("[data-modal-accessory]")];function t(o){for(const r of o.children)!(r instanceof HTMLElement)||/^(SCRIPT|STYLE|LINK)$/.test(r.tagName)||a.includes(r)||(a.some(l=>r.contains(l))?t(r):(dn.set(r,{inert:r.getAttribute("inert"),hidden:r.getAttribute("aria-hidden")}),r.setAttribute("inert",""),r.setAttribute("aria-hidden","true")))}t(document.body)}function Vn(n){return[...new Set([...n.querySelectorAll(Rn),...document.querySelectorAll(`[data-modal-accessory] ${Rn.split(", ").join(", [data-modal-accessory] ")}`)])].filter(i=>i.tabIndex>=0&&!i.closest('[hidden], [inert], [aria-hidden="true"]')&&i.getClientRects().length>0)}function hn(n){(n.querySelector("[data-dialog-initial-focus]")??Vn(n)[0]??n).focus()}function Mn(n){const i=$.at(-1);if(i){if(n.key==="Escape")n.preventDefault(),n.stopImmediatePropagation(),i.close();else if(n.key==="Tab"){const a=Vn(i.panel),t=a[0],o=a.at(-1),r=document.activeElement;t?n.shiftKey&&(r===t||!a.includes(r))?(n.preventDefault(),o?.focus()):!n.shiftKey&&(r===o||!a.includes(r))&&(n.preventDefault(),t.focus()):(n.preventDefault(),i.panel.focus())}}}function Wn(n){const i=$.at(-1);i&&!i.panel.contains(n.target)&&!n.target.closest("[data-modal-accessory]")&&hn(i.panel)}function me({open:n,...i}){return n?e.jsx(Dt,{...i}):null}function Dt({onClose:n,children:i,label:a,labelledBy:t,closeLabel:o="Close dialog",className:r="",panelClassName:l="",backdropClassName:y="",id:p}){const[d]=c.useState(()=>typeof document<"u"&&document.activeElement instanceof HTMLElement?document.activeElement:null),s=c.useRef(null),h=c.useRef(n);return h.current=n,c.useEffect(()=>{const f=s.current;if(!f)return;const b={panel:f,close:()=>h.current(),returnFocus:d};$.length||(En=document.body.style.overflow,document.body.style.overflow="hidden",document.addEventListener("keydown",Mn,!0),document.addEventListener("focusin",Wn),$e=new MutationObserver(an),$e.observe(document.body,{childList:!0,subtree:!0}));const g=$.findIndex(x=>f.contains(x.panel));return g===-1?$.push(b):(b.returnFocus=$[g].returnFocus,$.splice(g,0,b)),Bn(),Gn(),$.at(-1)===b&&!f.contains(document.activeElement)&&hn(f),an(),()=>{const x=$.at(-1)===b,C=$.indexOf(b);if(C!==-1&&$.splice(C,1),Bn(),$.length||($e?.disconnect(),$e=void 0,document.body.style.overflow=En,document.removeEventListener("keydown",Mn,!0),document.removeEventListener("focusin",Wn)),an(),x){const A=b.returnFocus,M=$.at(-1);A?.isConnected&&(!M||M.panel.contains(A))?A.focus():M&&hn(M.panel)}}},[d]),e.jsxs("div",{className:`kp-ui kp-modal-layer ${r}`,children:[e.jsx("button",{type:"button",tabIndex:-1,className:`kp-modal-backdrop ${y}`,"aria-label":o,"aria-hidden":"true",onClick:n}),e.jsx("section",{ref:s,id:p,className:`kp-modal-panel ${l}`,role:"dialog","aria-modal":"true","aria-label":a,"aria-labelledby":t,tabIndex:-1,children:i})]})}function Nt({toast:n,onDismiss:i}){const a=c.useRef(null),t=Kn(),[o]=c.useState(()=>document.activeElement instanceof HTMLElement?document.activeElement:null),[r,l]=c.useState(!1),[y,p]=c.useState(!1),[d,s]=c.useState(!1),[h,f]=c.useState(0),[b,g]=c.useState(!1),x=c.useRef(null),C=n.kind==="error"||n.actionLabel?0:n.duration??3500,A=c.useRef(C),M=c.useRef(void 0),P=c.useRef(i);P.current=i;const S=r||y||d;c.useEffect(()=>{if(S||b||A.current<=0)return;const j=Date.now(),N=setTimeout(()=>P.current(n.id),A.current);return()=>{clearTimeout(N),A.current=Math.max(0,A.current-(Date.now()-j))}},[S,b,n.id]),c.useEffect(()=>()=>clearTimeout(M.current),[]);const w=()=>{b||(g(!0),M.current=setTimeout(()=>{a.current?.contains(document.activeElement)&&(o?.isConnected&&!o.closest("[inert], [hidden]")?o.focus():t?.focus()),P.current(n.id)},150))},D=n.kind==="success"&&!n.actionLabel&&n.message.length<45;return e.jsxs("div",{ref:a,className:`kp-toast ${D?"kp-toast-pill":"kp-toast-rect"} kp-toast-${n.kind}${b?" kp-toast-leaving":""}`,role:n.kind==="error"?"alert":"status","aria-atomic":"true",onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),onFocusCapture:()=>p(!0),onBlurCapture:j=>{j.currentTarget.contains(j.relatedTarget)||p(!1)},onPointerDown:j=>{j.target.closest("button")||(j.pointerType==="touch"||j.pointerType==="pen")&&(x.current={x:j.clientX,y:j.clientY,id:j.pointerId,horizontal:!1},s(!0))},onPointerMove:j=>{const N=x.current;if(!N||N.id!==j.pointerId)return;const k=j.clientX-N.x,E=j.clientY-N.y;if(!N.horizontal&&Math.abs(E)>8&&Math.abs(E)>Math.abs(k)){x.current=null,s(!1);return}(N.horizontal||Math.abs(k)>8&&Math.abs(k)>Math.abs(E)*1.3)&&(N.horizontal=!0,j.currentTarget.hasPointerCapture(j.pointerId)||j.currentTarget.setPointerCapture(j.pointerId),f(k))},onPointerUp:j=>{const N=x.current;if(!N||N.id!==j.pointerId)return;x.current=null;const k=j.clientX-N.x;N.horizontal&&Math.abs(k)>75?(f(k>0?320:-320),w()):(f(0),s(!1))},onPointerCancel:()=>{x.current=null,f(0),s(!1)},style:{transform:`translateX(${h}px)`,opacity:b?0:Math.max(.35,1-Math.abs(h)/260)},children:[e.jsx("span",{className:"kp-toast-message",children:n.message}),n.actionLabel&&e.jsx("button",{type:"button",className:"kp-toast-action",onClick:()=>{b||(n.onAction?.(),w())},children:n.actionLabel}),!D&&e.jsx("button",{type:"button",className:"kp-toast-dismiss",onClick:w,"aria-label":"Dismiss notification",children:"×"})]})}function Pt({items:n,onDismiss:i,position:a="above-navigation"}){const t=Kn(),o=n[0];return o?Ct.createPortal(e.jsx("div",{"data-modal-accessory":!0,className:`kp-ui kp-toast-region${a==="modal"?" kp-toast-region-modal":""}`,"aria-label":"Notifications",children:e.jsx(Nt,{toast:o,onDismiss:i},o.id)}),t??document.body):null}const on=n=>n.kind==="success"&&!n.actionLabel;function Rt(n,i){return on(i)?n.some(a=>on(a)&&a.message===i.message)?n:[...n.filter((a,t)=>t===0||!on(a)),i]:[...n,i]}function Et(){const[n,i]=c.useState([]),a=c.useRef(0),t=c.useCallback(l=>{const y={...l,id:++a.current};i(p=>Rt(p,y))},[]),o=c.useCallback(l=>i(y=>y.filter(p=>p.id!==l)),[]),r=c.useCallback(()=>i([]),[]);return{items:n,notify:t,dismiss:o,clear:r}}const Qn=c.createContext(null);function Bt({children:n}){const i=Et(),a=It();return e.jsxs(Qn.Provider,{value:i,children:[n,e.jsx(Pt,{items:i.items,onDismiss:i.dismiss,position:a?"modal":"above-navigation"})]})}function Oe(){const n=c.useContext(Qn);if(!n)throw new Error("useToasts must be used within ToastProvider");return n}function Mt(){const{items:n,notify:i,clear:a}=Oe(),[t,o]=c.useState("No actions yet."),r=(d,s,h,f,b)=>i({message:d,kind:s,actionLabel:h,onAction:f,duration:b}),l=()=>{o("Retry selected"),r("Saved successfully after retry","success")},y=()=>{o("Rating restored"),r("Rating restored","success")},p=[{name:"Success pill",description:"Short confirmation, no rail or close button",run:()=>r("Preference saved","success")},{name:"Actionable toast",description:"Rounded rectangle with divided action",run:()=>r("Changes can be undone","info","Undo",y,8e3)},{name:"Error + Retry",description:"Persistent failure with recovery",run:()=>r("Couldn't save this modifier","error","Retry",l,0)},{name:"Clear + Undo",description:"Undoable change with longer timeout",run:()=>r("Rating cleared","info","Undo",y,8e3)},{name:"Queue 3 messages",description:"One visible notification; queued messages follow",run:()=>{r("First notification","info",void 0,void 0,2500),r("Second notification","info",void 0,void 0,2500),r("Third notification","error",void 0,void 0,0)}},{name:"Long message",description:"Test wrapping and responsive width",run:()=>r("Your preferences were updated, but a separate modifier could not be saved. You can retry the affected change without losing your selection.","error","Retry",l,0)},{name:"Morph sequence",description:"Test compact to actionable geometry in sequence",run:()=>{r("Saved","success",void 0,void 0,1800),r("You can undo the latest change","info","Undo",y,8e3)}}];return e.jsxs("section",{className:"tp","aria-label":"Toast playground",children:[e.jsxs("div",{className:"tp-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"tp-kicker",children:"DESIGN LAB / NOTIFICATIONS"}),e.jsx("h2",{children:"Toast Playground"}),e.jsx("p",{children:"Trigger each notification and inspect its size, timing, actions, and dismissal. No real preferences are changed."})]}),e.jsxs("span",{className:"tp-count",children:[n.length," queued"]})]}),e.jsx("div",{className:"tp-grid",children:p.map(d=>e.jsxs("button",{type:"button",className:"tp-trigger",onClick:d.run,children:[e.jsx("strong",{children:d.name}),e.jsx("small",{children:d.description}),e.jsx("span",{children:"Try →"})]},d.name))}),e.jsxs("div",{className:"tp-footer",children:[e.jsxs("span",{role:"status",children:["Last action: ",t]}),e.jsx("button",{onClick:a,children:"Clear notifications"})]}),e.jsx("p",{className:"tp-note",children:"Hover or focus to pause. Swipe horizontally to dismiss on touch. Error notifications remain until dismissed or acted on. This is a UI prototype, not production persistence."})]})}function un({state:n="idle",label:i,onRetry:a}){const t=n==="saving"?`${i}: Saving`:n==="saved"?`${i}: Saved`:n==="failed"?`${i}: Not saved`:"";return e.jsxs("span",{className:"kp-save-status",children:[e.jsx("span",{role:"status","aria-atomic":"true",className:"kp-visually-hidden",children:t}),n==="failed"?a?e.jsx("button",{type:"button",className:"kp-retry",onClick:a,"aria-label":`Retry saving ${i}`,children:"Retry"}):e.jsx("span",{"aria-hidden":"true",children:"!"}):e.jsx("span",{"aria-hidden":"true",children:n==="saving"?"◌":n==="saved"?"✓":""})]})}function Xn({value:n,label:i,onActivate:a,saveState:t,onRetry:o}){return e.jsxs("span",{className:"kp-ui kp-rating-wrap",children:[e.jsx("button",{type:"button",className:"kp-rating","aria-haspopup":"dialog","aria-label":`${i}: ${n||"Not rated"}. Change rating`,onClick:r=>{r.stopPropagation(),a(r)},children:n||"Not rated"}),e.jsx(un,{state:t,label:i,onRetry:o})]})}function Zn({open:n,onClose:i,label:a,context:t,value:o,options:r,onChange:l,help:y,helpOpen:p,onHelpOpenChange:d,className:s=""}){const h=c.useId(),f=c.useId(),[b,g]=c.useState(!1),x=p??b,[C,A]=c.useState(Math.max(0,r.indexOf(o||""))),M=c.useRef(null);c.useEffect(()=>A(Math.max(0,r.indexOf(o||""))),[a,n,o,r]);const P=()=>{i()};return e.jsxs(me,{open:n,onClose:P,labelledBy:h,closeLabel:"Close rating selector",className:s,children:[e.jsx(Be,{title:a,titleId:h,context:t,onClose:P,closeLabel:"Close selector",onTitleKeyDown:S=>{S.key==="Tab"&&!S.shiftKey&&(S.preventDefault(),M.current?.querySelector('button[tabindex="0"]')?.focus())}}),e.jsx("span",{className:"kp-keyboard-hint",children:"Arrow keys move focus; Enter or Space chooses. Escape cancels."}),e.jsx("div",{className:"kp-preference-options",role:"group","aria-label":"Rating choices",ref:M,onKeyDown:S=>{if((S.key==="Enter"||S.key===" ")&&S.target instanceof HTMLButtonElement){S.preventDefault(),l(r[C]),P();return}const w=["ArrowRight","ArrowDown"].includes(S.key)?1:["ArrowLeft","ArrowUp"].includes(S.key)?-1:0;if(!w&&S.key!=="Home"&&S.key!=="End")return;S.preventDefault();const D=S.key==="Home"?0:S.key==="End"?r.length-1:(C+w+r.length)%r.length;A(D),M.current?.querySelectorAll("button")[D]?.focus()},children:r.map((S,w)=>e.jsxs("button",{type:"button",className:o===S?"chosen":"","aria-pressed":o===S,tabIndex:w===C?0:-1,onFocus:()=>A(w),onClick:()=>{l(S),P()},children:[S,o===S&&e.jsx("span",{"aria-hidden":"true",children:" ✓"})]},S))}),y&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",className:"kp-preference-help","aria-expanded":x,"aria-controls":f,onClick:()=>{g(!x),d?.(!x)},children:["What do these mean? ",x?"−":"+"]}),e.jsx("div",{className:"kp-preference-explanation",id:f,hidden:!x,children:y})]}),o&&e.jsx("button",{type:"button",className:"kp-preference-clear",onClick:()=>{l(void 0),P()},children:"Clear rating"})]})}function Be({title:n,titleId:i,context:a,onClose:t,closeLabel:o="Close",children:r,onTitleKeyDown:l}){return e.jsxs("div",{className:"kp-sheet-header",children:[e.jsxs("div",{children:[a&&e.jsx("small",{children:a}),e.jsx("h3",{id:i,"data-dialog-initial-focus":!0,tabIndex:-1,onKeyDown:l,children:n}),r]}),e.jsx("button",{type:"button",onClick:t,"aria-label":o,children:"×"})]})}function Wt({name:n,itemId:i,supportingText:a,indicators:t,preference:o,onRefine:r,refined:l=!1,refineStatus:y}){return e.jsx("article",{className:"kp-ui kp-item","data-item-id":i,children:e.jsxs("div",{className:"kp-item-row",children:[e.jsxs("span",{className:"kp-item-main",children:[e.jsx("span",{className:"kp-item-name",children:n}),t]}),o,r&&e.jsxs("button",{type:"button",className:"kp-refine-toggle","aria-haspopup":"dialog","aria-label":y==="failed"?`${n}: Modifier save failed. Reveal issue`:y==="saving"?`${n}: Saving modifiers. Refine`:`Refine ${n}${l?". Has rated modifiers":""}`,onClick:r,children:[e.jsx("span",{"aria-hidden":"true",children:"+"})," Refine",y?e.jsx("span",{className:`kp-refine-status kp-refine-status--${y}`,"aria-hidden":"true",children:y==="failed"?"!":"◌"}):l&&e.jsx("span",{className:"kp-refined-dot","aria-hidden":"true"})]}),a&&e.jsx("small",{className:"kp-item-supporting-text",children:a})]})})}function yn({title:n,description:i,open:a,onToggle:t,children:o,status:r}){const l=c.useId();return e.jsxs("section",{className:"kp-ui kp-disclosure",children:[e.jsxs("button",{type:"button",className:"kp-disclosure-trigger","aria-expanded":a,"aria-controls":l,"aria-label":r==="failed"?`${n}: Save failed. Reveal issue`:void 0,onClick:t,children:[e.jsxs("span",{children:[n,i&&e.jsx("small",{children:i})]}),e.jsxs("span",{children:[r&&e.jsx("span",{className:"kp-group-status",role:"status","aria-label":r==="failed"?"Save failed":"Saving",children:r==="failed"?"!":"◌"}),e.jsx("span",{"aria-hidden":"true",children:a?"⌃":"⌄"})]})]}),e.jsx("div",{id:l,hidden:!a,children:a&&o})]})}function qn(){return e.jsxs("svg",{className:"kp-search-field__icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"10.8",cy:"10.8",r:"6.8"}),e.jsx("path",{d:"m16 16 5 5"})]})}function Me(n){const i=c.useRef(null);return n.mode==="launch"?e.jsxs("button",{type:"button",className:"kp-ui kp-search-field kp-search-field--launch","aria-label":n.ariaLabel||n.placeholder,"aria-haspopup":"dialog",onClick:n.onActivate,children:[e.jsx(qn,{}),e.jsx("span",{className:"kp-search-field__placeholder",children:n.placeholder})]}):e.jsxs("div",{className:"kp-ui kp-search-field kp-search-field--input",children:[e.jsx(qn,{}),e.jsx("input",{ref:i,id:n.inputId,type:"search",autoComplete:"off",autoFocus:n.autoFocus,"aria-label":n.ariaLabel||n.placeholder,"aria-controls":n.resultsId,placeholder:n.placeholder,value:n.value,onChange:a=>n.onChange(a.target.value)}),n.value&&e.jsx("button",{type:"button",className:"kp-search-field__clear","aria-label":"Clear search",onClick:()=>{n.onClear(),i.current?.focus()},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:e.jsx("path",{d:"M6 6 18 18M18 6 6 18"})})})]})}function We({children:n}){return e.jsx("div",{className:"kp-ui kp-search-row",children:n})}function qe({onClick:n,active:i=!1,expanded:a=!1,groupingAvailable:t=!0}){return e.jsx("button",{type:"button",className:"kp-ui kp-search-filter-trigger"+(i?" is-active":""),"aria-label":t?"Sort and group results":"Sort results",title:t?"Sort and group results":"Sort results","aria-haspopup":"dialog","aria-expanded":a,onClick:n,children:e.jsxs("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M4 7h16M7 12h10M10 17h4"}),e.jsx("circle",{cx:"8",cy:"7",r:"2",fill:"var(--kp-search-bg, #17183f)"}),e.jsx("circle",{cx:"15",cy:"12",r:"2",fill:"var(--kp-search-bg, #17183f)"})]})})}function Qe({options:n,label:i,clear:a}){return e.jsxs("div",{className:"kp-ui kp-search-chips",role:"group","aria-label":i,children:[n.map(t=>e.jsxs("button",{type:"button",className:"kp-search-chip"+(t.active?" is-active":""),"aria-pressed":t.active,"aria-label":t.label,"aria-haspopup":t.opensDialog?"dialog":void 0,"aria-expanded":t.opensDialog?t.expanded:void 0,onClick:t.onClick,children:[t.label,t.active&&e.jsx("span",{className:"kp-search-chip__check","aria-hidden":"true",children:"✓"})]},t.id)),a&&e.jsx("button",{type:"button",className:"kp-search-chips-clear",onClick:a,children:"Clear"})]})}function fn({open:n,onClose:i,sort:a,onSort:t,group:o,onGroup:r,defaultSortLabel:l="Default order",showDefault:y=!0,showGrouping:p=!0}){const d=c.useId(),s=p&&!!r&&o!==void 0;return e.jsxs(me,{open:n,onClose:i,labelledBy:d,closeLabel:s?"Close sort and group options":"Close sort options",className:"kp-order-layer",backdropClassName:"kp-order-backdrop",panelClassName:"kp-order-sheet",children:[e.jsxs("div",{className:"kp-order-header",children:[e.jsx("h2",{id:d,"data-dialog-initial-focus":!0,tabIndex:-1,children:s?"Sort & Group":"Sort"}),e.jsx("button",{type:"button","aria-label":"Close",className:"kp-order-close",onClick:i,children:"×"})]}),e.jsxs("fieldset",{className:"kp-order-section",children:[e.jsx("legend",{children:"Sort by"}),y&&e.jsxs("button",{type:"button","aria-pressed":a==="default",className:"kp-order-option"+(a==="default"?" is-selected":""),onClick:()=>t("default"),children:[l,e.jsx("span",{"aria-hidden":"true",children:a==="default"?"✓":""})]}),[["az","Name: A–Z"],["za","Name: Z–A"]].map(([h,f])=>e.jsxs("button",{type:"button","aria-pressed":a===h,className:"kp-order-option"+(a===h?" is-selected":""),onClick:()=>t(h),children:[f,e.jsx("span",{"aria-hidden":"true",children:a===h?"✓":""})]},h))]}),s&&e.jsxs("fieldset",{className:"kp-order-section",children:[e.jsx("legend",{children:"Group by"}),[["none","None"],["category","Category"]].map(([h,f])=>e.jsxs("button",{type:"button","aria-pressed":o===h,className:"kp-order-option"+(o===h?" is-selected":""),onClick:()=>r?.(h),children:[f,e.jsx("span",{"aria-hidden":"true",children:o===h?"✓":""})]},h))]}),e.jsx("button",{type:"button",className:"kp-order-done",onClick:i,children:"Done"})]})}const qt=[["uncomfortable","Uncomfortable"],["somewhat_comfortable","Somewhat Comfortable"],["comfortable","Comfortable"]];function Lt({itemId:n,name:i,open:a,onToggle:t,records:o}){const{notify:r}=Oe(),l=`experience:${n}:tried`,y=`experience:${n}:comfort`,p=o.revisions.filter(d=>d.target===l||d.target===y).at(-1);return e.jsx(yn,{title:"Experience",description:"Optional · Independent of preference",open:a,onToggle:t,children:e.jsxs("div",{className:"cc-experience",children:[e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:o.values[l]===!0,onChange:d=>{const s=o.values[l],h=d.target.checked,f=o.commit(l,h?!0:void 0);r({message:h?"Tried recorded":"Tried marker cleared",kind:"info",actionLabel:"Undo",duration:5e3,onAction:()=>{o.restore(l,f,s)||r({message:"A newer edit was kept",kind:"info"})}})}})," Tried"]}),e.jsx(un,{state:o.saves[l],label:`${i} Tried`}),e.jsx("p",{children:"Unchecked means no affirmative record. Recording time is the edit time, not the activity date."}),e.jsxs("fieldset",{children:[e.jsx("legend",{children:"Comfort"}),qt.map(([d,s])=>e.jsx("button",{type:"button","aria-pressed":o.values[y]===d,onClick:()=>o.commit(y,d),children:s},d)),o.values[y]&&e.jsx("button",{type:"button",onClick:()=>o.commit(y,void 0),children:"Clear comfort"})]}),e.jsx(un,{state:o.saves[y],label:`${i} Comfort`}),e.jsx("p",{children:"Comfort is self-assessed. Neither field changes your preference or the other field."}),p&&e.jsxs("p",{children:["Last recorded edit: ",e.jsx("time",{dateTime:p.recordedAt,children:new Date(p.recordedAt).toLocaleString()})]})]})})}function mn(n,i=!0){const[a,t]=c.useState(0),[o,r]=c.useState(null);c.useEffect(()=>{if(!i)return;const p=new AbortController;return r(null),Promise.resolve().then(()=>n({signal:p.signal})).then(d=>{p.signal.aborted||r({request:n,attempt:a,data:d})},d=>{p.signal.aborted||r({request:n,attempt:a,error:d instanceof Error?d:new Error("Unable to load data.")})}),()=>p.abort()},[n,a,i]);const l=i&&o?.request===n&&o.attempt===a?o:null,y=c.useCallback(()=>t(p=>p+1),[]);return{data:l?.data,error:l?.error,loading:i&&!l,retry:y}}const bn=c.createContext(null),Jn=c.createContext(null);function Ot({loading:n,error:i,onRetry:a,label:t}){return n?e.jsxs("p",{role:"status",children:["Loading ",t,"…"]}):i?e.jsxs("div",{role:"alert",children:[e.jsxs("p",{children:["Unable to load ",t,". Your existing preferences are unchanged."]}),e.jsxs("button",{type:"button",onClick:a,children:["Retry loading ",t]})]}):null}function Ft({services:n,children:i}){return e.jsx(bn.Provider,{value:n,children:e.jsx(Ht,{services:n,children:i})})}function Ht({services:n,children:i}){const a=c.useCallback(async r=>{const[l,y]=await Promise.all([n.catalog.getReferenceData(r),n.preferences.getSnapshot(r)]);return{referenceData:l,snapshot:y}},[n]),t=mn(a),o=c.useMemo(()=>t.data?{referenceData:t.data.referenceData,snapshot:t.data.snapshot}:null,[t.data,n]);return o?e.jsx(Jn.Provider,{value:o,children:i}):e.jsx("section",{className:"ui-lab kp-ui","aria-label":"UI Lab data",children:e.jsx(Ot,{loading:t.loading,error:t.error,onRetry:t.retry,label:"UI Lab data"})})}function Ut(){const n=c.useContext(bn);if(!n)throw new Error("AppServicesProvider is required.");return n}function et(){return c.useContext(bn)}function nt(){return c.useContext(Jn)}const tt=["Love","Like","Curious","Unsure","Not Interested","Hard Limit","Not Applicable"];function it(n){return JSON.stringify(n.kind==="item"?["item",n.itemId]:n.kind==="modifier"?["modifier",n.itemId,n.groupId,n.valueId]:["concept",n.conceptId])}class be extends Error{constructor(i,a){super(a),this.code=i,this.name="ServiceError"}code}function ue(n){return n.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function zt(n,i){const a=ue(n);return ue(i).split(" ").filter(Boolean).every(t=>a.includes(t))}function pn(n,i,a){const t=ue(a);if(!t)return{score:0,fields:[]};const o=ue(n),r=t.split(" ");if(!zt([n,...i.map(p=>p.text)].join(" "),t))return null;const l=r.filter(p=>!o.includes(p));return{score:o===t?4:o.startsWith(t)?3:l.length===0?2:1,fields:i.filter(p=>l.some(d=>ue(p.text).includes(d)))}}function at(n,i){return pn(n.name,[{label:"description",text:n.description??""},{label:"category",text:n.category},...n.groups.map(a=>({label:"modifiers",text:`${a.name}: ${a.values.map(t=>typeof t=="string"?t:t.name).join(", ")}`}))],i)}function $t(n,i){const a=ue(i).split(" ");return n?.fields.map(t=>{const o=t.text.split(/\s+/),r=o.findIndex(d=>a.some(s=>ue(d).includes(s))),l=Math.max(0,r-2),y=Math.min(o.length,l+12),p=`${l?"…":""}${o.slice(l,y).join(" ")}${y<o.length?"…":""}`;return`Matched ${t.label}: “${p}”`}).join(" · ")||void 0}function vn(n,i){const a=[];for(const t of n.items){const o=at(t,i.text);o&&a.push({id:`item:${t.id}`,name:t.name,type:"Items",path:t.category,target:{itemId:t.id},score:o.score});for(const r of t.groups)for(const l of r.values){const y=n.concepts.find(d=>d.id===l.conceptId),p=pn(l.name,[{label:"item",text:t.name},{label:"modifier group",text:r.name},{label:"category",text:t.category},{label:"description",text:t.description??""},{label:"concept",text:y?`${y.name} ${y.description}`:""}],i.text);p&&a.push({id:`modifier:${t.id}:${r.id}:${l.id}`,name:l.name,type:"Modifiers",path:`${t.name} → ${r.name}`,target:{itemId:t.id,groupId:r.id,valueId:l.id},score:p.score})}}for(const t of n.concepts){const o=pn(t.name,[{label:"description",text:t.description},{label:"related Items",text:(t.relatedItemIds??[]).map(r=>n.items.find(l=>l.id===r)?.name??"").join(" ")}],i.text);o&&a.push({id:`concept:${t.id}`,name:t.name,type:"Concepts",path:"Concept Explorer",target:{conceptId:t.id},score:o.score})}return a.filter(t=>!i.type||i.type===t.type).sort((t,o)=>i.sort==="az"?t.name.localeCompare(o.name):i.sort==="za"?o.name.localeCompare(t.name):(o.score??0)-(t.score??0)||t.name.localeCompare(o.name)||t.path.localeCompare(o.path))}const _t={"Power Exchange":["Collars","Ownership","Protocol","Service","Permission Rituals","Authority Exchange","Roleplay","Obedience","Rules","Ceremonies","Training","Devotion"],"Restraint & Control":["Restraints","Cuffs","Rope Bondage","Blindfolds","Chastity","Positioning","Movement Restriction","Sensory Deprivation","Harnesses","Shibari","Suspension","Confinement"],"Sensation & Intensity":["Sensory Play","Wartenberg Wheel","Compression Clothing","Temperature Play","Impact Play","Texture Play","Cupping","Massage","Wax Play","Pressure Play","Tickling","Sound Play"],"Connection & Expression":["Praise","Privileges","Aftercare","Affection","Pet Play","Primal Play","Exhibitionism","Voyeurism","Role Reversal","Teasing","Anticipation","Body Worship"]},Yt={Collars:[{name:"Material",values:["Leather","Metal","Fabric","Silicone"]},{name:"Use / Context",values:["Everyday","Scene / Play","Ceremonial"]}],Restraints:[{name:"Material",values:["Rope","Cuffs","Fabric"]},{name:"Use / Context",values:["Decorative","Functional"]}],"Sensory Play":[{name:"Sensation",values:["Soft","Sharp / Prickly","Warm","Cold"]},{name:"Role",values:["Giving","Receiving"]}],Praise:[{name:"Expression",values:["Verbal","Written","Public","Private"]}],Privileges:[{name:"Context",values:["Everyday","Scene","Ceremonial"]}]},Kt={Collars:"Collars worn for everyday expression, play or ceremony.",Ownership:"Symbols, agreements and expressions of belonging.",Protocol:"Agreed rituals, rules and structured interactions.",Restraints:"Using cuffs, rope, fabric or other forms of restraint.","Sensory Play":"Exploring sensations such as texture, pressure and temperature.",Praise:"Verbal, written, public or private affirmation.",Privileges:"Special permissions, opportunities or meaningful rewards.",Aftercare:"Connection, comfort and care after an experience.","Permission Rituals":"Ceremonial or practical ways to request and grant permission."},Ge={Collars:"collars",Ownership:"ownership",Protocol:"protocol",Service:"service","Permission Rituals":"permission-rituals","Authority Exchange":"authority-exchange",Roleplay:"roleplay",Obedience:"obedience",Rules:"rules",Ceremonies:"ceremonies",Training:"training",Devotion:"devotion",Restraints:"restraints",Cuffs:"cuffs","Rope Bondage":"rope-bondage",Blindfolds:"blindfolds",Chastity:"chastity",Positioning:"positioning","Movement Restriction":"movement-restriction","Sensory Deprivation":"sensory-deprivation",Harnesses:"harnesses",Shibari:"shibari",Suspension:"suspension",Confinement:"confinement","Sensory Play":"sensory-play","Wartenberg Wheel":"wartenberg-wheel","Compression Clothing":"compression-clothing","Temperature Play":"temperature-play","Impact Play":"impact-play","Texture Play":"texture-play",Cupping:"cupping",Massage:"massage","Wax Play":"wax-play","Pressure Play":"pressure-play",Tickling:"tickling","Sound Play":"sound-play",Praise:"praise",Privileges:"privileges",Aftercare:"aftercare",Affection:"affection","Pet Play":"pet-play","Primal Play":"primal-play",Exhibitionism:"exhibitionism",Voyeurism:"voyeurism","Role Reversal":"role-reversal",Teasing:"teasing",Anticipation:"anticipation","Body Worship":"body-worship",Material:"material","Use / Context":"use-context",Sensation:"sensation",Role:"role",Expression:"expression",Context:"context",Leather:"leather",Metal:"metal",Fabric:"fabric",Silicone:"silicone",Everyday:"everyday","Scene / Play":"scene-play",Ceremonial:"ceremonial",Rope:"rope",Decorative:"decorative",Functional:"functional",Soft:"soft","Sharp / Prickly":"sharp-prickly",Warm:"warm",Cold:"cold",Giving:"giving",Receiving:"receiving",Verbal:"verbal",Written:"written",Public:"public",Private:"private",Scene:"scene","Self-directed":"self-directed"},Gt=new Set(["Praise","Privileges","Protocol","Permission Rituals","Rules","Training","Teasing","Anticipation"]),Ln=Object.entries(_t).flatMap(([n,i])=>i.map(a=>({id:Ge[a],name:a,category:n,description:Kt[a],collections:["kinks",...Gt.has(a)?["rewards"]:[]],groups:(Yt[a]||[{name:"Context",values:["Everyday","Scene / Play","Ceremonial"]},{name:"Role",values:["Giving","Receiving","Self-directed"]}]).map(t=>({id:Ge[t.name],name:t.name,values:t.values.map(o=>({id:Ge[o],name:o,...o==="Leather"?{conceptId:"leather"}:{}}))}))}))),pe={items:Ln,concepts:[{id:"ownership",name:"Ownership",description:"A negotiated concept of belonging or authority. Meaning depends on explicit agreements.",relatedItemIds:["collars","protocol"]},{id:"leather",name:"Leather",description:"A material and a broader cultural concept. An item’s Leather modifier has its own independent meaning and rating.",relatedItemIds:["collars"]},{id:"ceremonial",name:"Ceremonial",description:"Actions or objects given deliberate symbolic meaning through a ceremony.",relatedItemIds:["collars","ceremonies"]},{id:"trust",name:"Trust",description:"Confidence developed through communication, reliability and respected boundaries.",relatedItemIds:["aftercare","protocol"]}],subjects:[{id:"power-exchange",name:"Power Exchange",description:"Explore authority, rituals and the ways people negotiate control.",featured:{symbol:"◇",tone:"power"}},{id:"sensation-intensity",name:"Sensation & Intensity",description:"Discover textures, pressure and different kinds of sensation.",featured:{symbol:"✧",tone:"sensation"}},{id:"restraint-control",name:"Restraint & Control",description:"Explore restriction, restraint and intentional boundaries.",featured:{symbol:"⌁",tone:"restraint"}},{id:"connection-expression",name:"Connection & Expression",description:"Explore affection, praise and ways of expressing connection.",featured:{symbol:"♡",tone:"connection"}},...["Collars","Aftercare","Primal Play","Sensory Play","Service","Roleplay","Praise","Protocol","Temperature Play","Pet Play"].map(n=>({id:"subject-"+Ge[n],name:n,description:"Explore related Catalog Items and refine your preferences."}))].map(n=>({...n,itemIds:Ln.filter(i=>i.category===n.name||i.name===n.name).map(i=>i.id)}))},wn={ratings:{},classifications:{collars:{reward:"yes",punishment:"unanswered"},ownership:{reward:"no",punishment:"yes"},protocol:{reward:"unanswered",punishment:"no"},service:{reward:"no",punishment:"no"},"permission-rituals":{reward:"yes",punishment:"yes"},"authority-exchange":{reward:"no",punishment:"unanswered"},roleplay:{reward:"unanswered",punishment:"yes"},obedience:{reward:"no",punishment:"no"},rules:{reward:"yes",punishment:"no"},ceremonies:{reward:"no",punishment:"yes"},training:{reward:"unanswered",punishment:"unanswered"},devotion:{reward:"no",punishment:"yes"},restraints:{reward:"yes",punishment:"no"},cuffs:{reward:"no",punishment:"no"},"rope-bondage":{reward:"unanswered",punishment:"yes"},blindfolds:{reward:"no",punishment:"unanswered"},chastity:{reward:"yes",punishment:"yes"},positioning:{reward:"no",punishment:"no"},"movement-restriction":{reward:"unanswered",punishment:"no"},"sensory-deprivation":{reward:"no",punishment:"yes"},harnesses:{reward:"yes",punishment:"unanswered"},shibari:{reward:"no",punishment:"yes"},suspension:{reward:"unanswered",punishment:"no"},confinement:{reward:"no",punishment:"no"},"sensory-play":{reward:"yes",punishment:"yes"},"wartenberg-wheel":{reward:"no",punishment:"unanswered"},"compression-clothing":{reward:"unanswered",punishment:"yes"},"temperature-play":{reward:"no",punishment:"no"},"impact-play":{reward:"yes",punishment:"no"},"texture-play":{reward:"no",punishment:"yes"},cupping:{reward:"unanswered",punishment:"unanswered"},massage:{reward:"no",punishment:"yes"},"wax-play":{reward:"yes",punishment:"no"},"pressure-play":{reward:"no",punishment:"no"},tickling:{reward:"unanswered",punishment:"yes"},"sound-play":{reward:"no",punishment:"unanswered"},praise:{reward:"yes",punishment:"yes"},privileges:{reward:"no",punishment:"no"},aftercare:{reward:"unanswered",punishment:"no"},affection:{reward:"no",punishment:"yes"},"pet-play":{reward:"yes",punishment:"unanswered"},"primal-play":{reward:"no",punishment:"yes"},exhibitionism:{reward:"unanswered",punishment:"no"},voyeurism:{reward:"no",punishment:"no"},"role-reversal":{reward:"yes",punishment:"yes"},teasing:{reward:"no",punishment:"unanswered"},anticipation:{reward:"unanswered",punishment:"yes"},"body-worship":{reward:"no",punishment:"no"}}},Vt=`# Kink Profile Education — Editorial Length and Structure

**Status:** Product/editorial direction approved October 13, 2026. This is an editorial standard, not a published-content approval.

## Article length

A standalone educational article should answer a meaningful reader question on its own.

- **Minimum target:** approximately **5 minutes** of meaningful reading.
- **Preferred range:** **5–10 minutes** where it makes editorial sense.
- **Hard editorial ceiling:** **15 minutes**. Material beyond this should be edited for clarity or reorganized into meaningful companion guides.
- **Working estimate:** approximately **200 words per minute**. As a rough planning aid, 1,000–2,000 words fits the preferred range and 3,000 words is the ceiling. Tables, terminology, and technical material may take longer; verify displayed estimates against actual content rather than treating an invented label as evidence.
- Safety-critical notices and short corrections **must remain accessible** even if shorter than five minutes. They can be notices, sidebars, or subsections rather than artificially padded standalone articles.

## When to split

Split only when the result gives readers **two or more complete, distinct learning goals** and **each proposed standalone article can naturally sustain approximately five minutes**.

Examples of a meaningful split:

- Impact Play overview — foundations, consent, essential risks, links onward.
- Understanding Impact Implements and Sensations — the feel and design of tools.
- Impact Anatomy and Control — body areas, movement-related risk, and why accurate control matters.
- Impact Marks, Bruising, and Recovery — responses, warning signs, follow-up.

**Do not split** a coherent 15-minute article into arbitrary 2-, 3-, and 11-minute pieces. Keep very short supporting material inside a parent article, as a linked glossary, FAQ, or concise safety notice.

Do not pad a shallow topic to reach five minutes. Do not remove essential safety context just to meet the target; restructure or provide a clear, navigable companion instead.

## Navigation and model invariants

- Preserve stable article IDs and URLs when refocusing an existing article; related-topic guides receive their own IDs.
- Curate typed \`further-reading\` links in the education manifest. Do not infer an interest, preference, identity, or consent from reading.
- Only expose sources explicitly registered in the Education read service; file presence does not imply editorial approval or publication.
- Keep each standalone article understandable without requiring another article for immediate safety information.
- When splitting, check for self-links, duplicate related lists, missing source references, and content that became inaccessible.
- Maintain independent risk-assessment and editorial versioning when production publishing is implemented.

## Current article audit (planning estimates)

Based on approximate source word counts divided by 200 wpm; **actual reader pace varies** and prior hand-authored labels were not consistently accurate.

| Article | Approx. minutes | Status |
| --- | ---: | --- |
| Bondage & Discipline | 12 | Within max; consider concise pass |
| Dominance & Submission | 16 | **Over max: editorial restructuring needed** |
| Sadism & Masochism | 19 | **Over max: editorial restructuring needed** |
| Safewords | 10 | Within preferred range |
| Negotiating a Scene | 12 | Within max; consider concise pass |
| Kinks Are Not Roles | 12 | Within max; consider concise pass |
| Kink Without Dominance or Submission | 12 | Within max; consider concise pass |
| Total Power Exchange | 17 | **Over max: editorial restructuring needed** |
| Collars & Collaring | 19 | **Over max: editorial restructuring needed** |
| Impact Play: A Beginner's Guide | 7 | Within preferred range |
| Understanding Impact Implements and Sensations | 8 | Within preferred range |
| Impact Anatomy and Control | 8 | Within preferred range |
| Impact Marks, Bruising, and Recovery | 8 | Within preferred range |

**Outstanding editorial work:** Apply a thoughtful structural pass to D/s, S/M, TPE, and Collars (and correct old displayed reading-time estimates). Do not create tiny companion articles or falsely claim the overall library already meets the new standard. This review is separate from the focused Impact series implementation.

**Review gate:** All article drafts, especially physical-safety claims, require appropriate sourcing, technical/clinical safety review, accessibility review, and editorial approval before publication.
`,Qt=`# Bondage & Discipline: Understanding the B and D of BDSM

*Exploring restraint, structure, freedom, and the psychology behind consensual control.*

**Level:** Beginner  
**Estimated reading time:** 8 minutes  
**Topics:** BDSM Fundamentals · Bondage · Discipline · Consent · Power Exchange

**Content note:** This article discusses physical restraint, consensual punishment, and associated physical and emotional risks without graphic descriptions.

---

## Introduction: Two Different Expressions of Control

When people hear the term BDSM, they often picture ropes, handcuffs, strict rules, or punishment. But these familiar images only scratch the surface of what Bondage and Discipline actually represent.

The **B** stands for **Bondage**, and the first **D** stands for **Discipline**.

Although traditionally grouped together, they describe two different aspects of consensual kink.

- **Bondage** explores the restriction of physical movement, freedom, or access.
- **Discipline** explores agreed-upon rules, behavioral expectations, structure, and accountability.

Both can involve control, but they express it differently.

Bondage might mean agreeing to remain physically restrained for a period of time. Discipline might mean agreeing to follow an established rule, even when no physical restraint is involved.

Neither inherently requires pain, punishment, sexual activity, or a permanent Dominant/submissive relationship.

Understanding the distinction opens up a much broader picture of what these practices can mean to different people.

## 1. Bondage: Exploring the Experience of Restraint

Bondage is the consensual restriction of a person's movement or physical freedom.

That definition sounds straightforward, but the experience itself can be remarkably varied.

For some people, bondage is primarily physical. They enjoy the sensations created by restraints, the feeling of being held in place, or the challenge of limited mobility.

For others, its appeal is psychological. The meaningful part may be knowing that another person has been entrusted with a temporary degree of control.

And for some, bondage is an aesthetic or artistic practice, involving visual presentation, carefully arranged materials, and deliberate positioning.

### Different Forms of Bondage

Bondage can include several approaches:

- **Restraint bondage:** Using equipment specifically designed to restrict movement, such as cuffs or other purpose-made restraints.
- **Rope bondage:** Using rope for restraint, positioning, or artistic expression. Some traditions, including shibari and kinbaku, have distinct histories and practices.
- **Body positioning:** Consensually maintaining a particular posture or position, with or without equipment.
- **Sensory-focused bondage:** Exploring the physical sensations of containment, pressure, or limited movement.
- **Symbolic restraint:** Using an agreed rule or ritual to create the experience of restriction without physically preventing movement.

These approaches can overlap, but they do not carry identical risks or require identical skills.

### Why Do People Enjoy Bondage?

The appeal of bondage is not always about helplessness, nor does it necessarily indicate a desire for submission.

Common motivations include:

**Surrender and relief from decision-making.** Some people find temporary, chosen restrictions freeing. When they no longer need to decide how to move or what to do next, their attention can shift toward the immediate experience.

**Trust and vulnerability.** Allowing another person to restrict one's movement can create an intentional experience of vulnerability. For some, that trust is a central source of intimacy.

**Sensory experience.** Pressure, contact, containment, and reduced movement can be enjoyable sensations in their own right. Individuals may experience these as calming, stimulating, grounding, or intense.

**Anticipation.** Limited movement can change someone's relationship with expectation and uncertainty. The anticipation of what happens next may be more important than the restraint itself.

**Aesthetics and creativity.** Rope patterns, visual composition, costume, and artistic presentation can be meaningful independently of sexual or power-exchange interests.

Importantly, someone may enjoy bondage while having little or no interest in being dominated.

A person might enjoy being restrained because of the physical sensations while preferring a completely equal or collaborative interaction with their partner.

Likewise, someone might enjoy restraining another person because they appreciate the craft, care, or artistic process rather than the feeling of authority.

**Bondage describes an activity, not necessarily an identity or relationship role.**

## 2. Discipline: Structure, Expectations, and Accountability

Discipline in BDSM involves creating and maintaining mutually agreed-upon expectations within a consensual dynamic.

These expectations might involve behavior, communication, rituals, tasks, posture, or other aspects of an interaction or relationship.

Unlike bondage, which limits physical movement, discipline generally concerns what a person has agreed to do, how they have agreed to behave, or how they respond to direction.

A simple example might involve two partners agreeing that one will follow a particular instruction during a scene, with a previously discussed response if the instruction is not followed.

In an ongoing relationship, discipline may involve recurring expectations or routines.

The important distinction is that these rules are **negotiated, understood, and voluntarily accepted**, even when one person takes responsibility for directing or enforcing them.

### Discipline Is Not the Same as Punishment

One of the most common misconceptions about BDSM discipline is that it must involve punishment.

In reality, punishment is only one possible component.

Discipline can also include:

- **Clear expectations:** Defining what has been agreed upon.
- **Guidance:** Helping a partner understand and follow those expectations.
- **Positive reinforcement:** Recognizing effort, consistency, or success.
- **Correction:** Providing feedback when something does not meet an agreed expectation.
- **Ritual and repetition:** Using recurring practices to reinforce the meaning of the dynamic.
- **Accountability:** Discussing commitments, difficulties, and whether expectations remain appropriate.

For example, a person might agree to a specific greeting ritual.

Following the ritual may bring a sense of achievement, connection, or recognition. Forgetting it might lead to a reminder and an opportunity to try again.

Nothing about that interaction inherently requires punishment.

The structure itself can be the meaningful part.

### What About Punishment?

Some people intentionally incorporate punishment into their discipline dynamics.

Within consensual BDSM, punishment describes an agreed consequence associated with a particular behavior or rule.

Its purpose and emotional meaning vary.

For some, punishment is theatrical or playful. Participants may enjoy pretending that an infraction has occurred so they can explore a mutually desired consequence. This is sometimes called *funishment*.

For others, corrective consequences are intended to represent genuine accountability within a negotiated relationship structure.

These two experiences should not be confused.

Something that feels playful and exciting in one context might feel emotionally distressing in another.

Partners should establish what punishment means to them, which consequences are acceptable, and whether genuine mistakes should be handled differently from deliberate roleplay.

**Punishment must never become a justification for retaliation, intimidation, coercion, or ignoring consent.**

Ordinary relationship conflict, genuine anger, and serious emotional distress should be addressed through communication rather than automatically converted into disciplinary scenes.

A BDSM dynamic does not eliminate anyone's right to question a rule, withdraw consent, or renegotiate an agreement.

## 3. Why Are Bondage and Discipline Grouped Together?

Bondage and Discipline are historically linked within the broader BDSM acronym, but they are not interchangeable.

One useful way to understand their relationship is to consider the different kinds of freedom they explore.

**Bondage asks:** What happens when I voluntarily limit my ability to move?

**Discipline asks:** What happens when I voluntarily agree to expectations about my behavior?

Both can create an experience of intentional restriction.

Both can involve trust, anticipation, boundaries, and the temporary or ongoing allocation of control.

And both can exist within a power-exchange relationship.

But they do not require one another.

A person might love elaborate rope bondage while disliking rules, protocols, and punishment.

Another person might enjoy highly structured discipline, daily rituals, and clearly defined expectations without having any interest in physical restraint.

Someone else might enjoy both for entirely different reasons.

There is no requirement to participate in every aspect of BDSM, even when the practices are commonly grouped together.

## 4. The Psychology of Choosing Limits

Perhaps the most interesting common thread between bondage and discipline is the relationship between restriction and choice.

Outside consensual kink, restrictions are often associated with the loss of autonomy.

Within consensual BDSM, a restriction can be something a person actively chooses.

That distinction changes its potential meaning.

Someone who spends much of their day making decisions may enjoy entering an agreed structure where another person leads.

Someone who struggles to settle their attention might appreciate a focused, predictable ritual.

Someone who values independence may still enjoy voluntarily surrendering specific freedoms within a clearly defined experience.

And someone who enjoys caring for others may find satisfaction in being trusted to provide attentive, responsible control.

These motivations are possibilities, not universal psychological explanations.

The same activity can mean very different things to different participants.

For one person, restraint may be comforting. For another, it may be exciting. For another, it may be unpleasant or frightening.

Likewise, rules that create a sense of belonging for one person may feel restrictive or emotionally uncomfortable to someone else.

Neither response is inherently more valid.

The central question is not whether a particular activity *should* feel meaningful.

It is whether the people involved genuinely want the experience and understand what they are agreeing to.

## 5. Consent, Negotiation, and Safety

Because bondage and discipline involve deliberate restrictions, both require clear communication and ongoing consent.

Agreeing to an activity once does not mean agreeing to every variation of that activity.

Consent to restraint does not automatically include consent to sexual contact.

Consent to follow a rule does not automatically include consent to punishment.

And entering a power-exchange relationship does not mean surrendering the ability to stop an activity.

### Before Exploring Bondage

Physical restraint carries real risks, including nerve compression, circulation problems, joint injuries, and difficulties responding to an emergency.

Important precautions include:

- Discuss the specific activity, boundaries, accessibility needs, relevant health concerns, and how to stop.
- Make sure the restrained person can communicate discomfort or withdraw consent at any time.
- Establish a reliable way to release restraints immediately.
- Never leave a physically restrained person unattended.
- Stop and release restraints immediately if numbness, tingling, weakness, unusual pain, swelling, coldness, or changes in skin color occur.
- Never use restraint that compromises breathing or places pressure on the neck.
- Treat suspension and complex rope work as advanced practices requiring dedicated training, rather than beginner experiments.

Restraint-related nerve injuries can occur without dramatic pain or visible warning signs. Persistent symptoms after release warrant medical assessment.

No particular material, product, or technique can guarantee complete safety.

Beginners can also explore the psychological aspects of restraint without physically restricting movement.

### Before Exploring Discipline

Discipline presents a different set of risks.

Rather than focusing primarily on physical safety, participants also need to consider emotional well-being, autonomy, expectations, and the potential for coercion.

Useful questions include:

- What are we trying to achieve through this rule?
- Does everyone genuinely want this structure?
- What happens when someone forgets or cannot follow an expectation?
- Are mistakes treated differently from deliberate roleplay?
- How do we distinguish consensual correction from ordinary relationship conflict?
- How can either person request a change without fear of retaliation?
- How will we recognize when a rule is no longer helpful?

A rule that initially feels supportive may become burdensome as circumstances change.

Maintaining consent means allowing the structure to change too.

### Aftercare and Reflection

Aftercare refers to the physical or emotional support participants may want after an intense experience.

For bondage, this might involve attending to physical comfort, checking for injuries, or allowing time to recover from sustained positioning.

For discipline, it might include reassurance, affirmation, conversation, or confirming that a corrective interaction has concluded.

Aftercare is individual. Some people want closeness, while others prefer space or quiet.

A later conversation can also help partners identify what felt meaningful, what felt uncomfortable, and what they might change.

## 6. Exploring Your Own Interests

You do not need to know whether you identify as Dominant, submissive, a rope top, a rope bottom, or any other role before exploring your interests.

In fact, beginning with the *why* can be more informative than beginning with the label.

Consider these questions:

**For bondage:**

- Am I interested in the physical sensation of restraint, the psychological experience, or both?
- Does the idea of limiting movement appeal to me more than actually being unable to move?
- Am I drawn toward restraint, applying restraint, or watching its artistic creation?
- Does restraint feel comforting, exciting, vulnerable, intimidating, or something else?

**For discipline:**

- Do I find rules meaningful, or do they feel restrictive?
- Am I more interested in following expectations, establishing them, or collaboratively designing them?
- Does praise motivate me more than correction?
- Do I enjoy structure for its predictability, its symbolism, its accountability, or its interpersonal meaning?
- Would I enjoy discipline without punishment?

Your answers may change over time, across relationships, or depending on the circumstances.

That is not inconsistency. It is part of discovering which experiences are meaningful to you.

## 7. Bondage and Discipline Are Not Obligations

BDSM is not a progression in which participants must eventually become comfortable with more restrictive, intense, or elaborate activities.

Someone who enjoys symbolic restraint is not practicing an incomplete version of bondage.

Someone who enjoys following instructions but dislikes punishment is not failing to understand discipline.

Someone who wants physical bondage without exchanging authority is not contradicting the meaning of BDSM.

These practices offer different ways to explore sensation, structure, trust, and intentional limitation.

The goal is not to meet a particular definition of what a BDSM participant should enjoy.

It is to discover what feels worthwhile, consensual, and meaningful to the individuals involved.

## Final Thoughts: Freedom Within Chosen Boundaries

Bondage and Discipline demonstrate an interesting possibility: choosing a limit can sometimes be an expression of autonomy rather than its absence.

Bondage explores how temporary restrictions on movement can change an experience.

Discipline explores how agreed expectations can give behavior additional meaning.

They may be playful, artistic, intimate, structured, psychological, or entirely nonsexual.

They may be explored separately or together.

What connects them is not the severity of the restriction or the authority of any particular role.

It is the intentional, informed agreement between the people participating.

**The freedom to choose a boundary—and the freedom to change or withdraw it—is what makes exploring that boundary possible.**

---

### Continue Learning

- **Understanding Dominance & Submission:** How consensual authority differs from physical restraint.
- **BDSM Consent & Negotiation:** Communicating limits, risks, and expectations.
- **Introduction to Bondage Safety:** Understanding physical risks before exploring restraint.
- **Rules, Protocols & Rituals:** The different ways structure can appear in power exchange.
- **Discipline vs. Punishment:** Why accountability and punishment are not interchangeable.
`,Xt=`# Collars & Collaring: Meaning, Commitment, and Choice in BDSM

*Exploring what a collar can symbolize, how collaring works, and why the meaning belongs to the person wearing it and the people involved.*

**Level:** Beginner  
**Estimated reading time:** 11 minutes  
**Topics:** BDSM Fundamentals · Collars · Collaring · Relationship Symbols · Power Exchange · Consent · Personal Expression

**Content note:** This article discusses consensual ownership symbolism, submission, relationship commitment, collar use during play, and neck-related safety concerns. It does not provide restraint instructions.

---

## Introduction: One Object, Many Meanings

Imagine three people wearing nearly identical black collars.

One wears theirs because they love the style. The collar is an accessory, no different in principle from a necklace or a favorite pair of boots.

Another wears theirs during a negotiated kink scene. The act of putting it on helps them enter a particular role or headspace.

The third wears theirs every day. For them, the collar represents a deeply meaningful relationship: a promise, an agreement, a sense of belonging, and the particular way they and their partner express commitment.

The objects may look almost identical.

**Their meanings are not.**

Collars are among the most recognizable symbols associated with BDSM, but a collar does not automatically signify submission, ownership, availability, or a particular kind of relationship.

Some collars are intensely personal. Others are shared symbols. Some are used only during play. Some are worn as ordinary fashion.

And for some people, the experience of *being collared* matters far more than the object itself.

To understand collars in BDSM, it helps to separate three questions:

1. **What is the object?** Its style, material, construction, and physical use.
2. **What does it mean?** Its personal, emotional, symbolic, or relationship significance.
3. **When and how is it used?** Every day, during scenes, for a ceremony, or whenever the wearer chooses.

Those questions can have completely different answers.

## 1. What Is a Collar in BDSM?

A collar is neckwear that may be used as a personal accessory, a symbol, or part of a negotiated kink activity.

In some D/s and Master/slave relationships, a collar represents the partners' chosen power-exchange bond. It may symbolize commitment, authority, submission, belonging, service, or an agreed form of ownership.

In other contexts, a collar simply forms part of someone's preferred presentation. The wearer may enjoy its appearance or texture without any interest in D/s.

A collar can also be a temporary scene accessory, intentionally put on at the beginning of an experience and removed afterward.

There is no universal rule that determines its meaning based on shape, material, color, hardware, or who fastens it.

An O-ring does not prove someone is submissive.

A locking mechanism does not prove an ongoing relationship.

An expensive or elaborate collar is not automatically more significant than a ribbon, chain, or simple band.

**The people involved give the collar meaning. The object does not create that meaning on its own.**

## 2. Collars as Symbols of Power Exchange

Within an agreed D/s dynamic, collaring may represent the authority that one partner has chosen to recognize and the responsibility the other has accepted.

Someone might understand receiving a collar as an expression of submission or devotion.

Another might value the moment because it makes a private bond tangible.

The partner presenting or fastening the collar may experience it as an expression of care, commitment, leadership, or the privilege of being trusted.

These interpretations can overlap without being identical.

### Ownership as a Consensual Symbol

Some partners describe collaring through language such as "ownership," "being claimed," or "belonging."

Those words may hold powerful emotional significance.

Within BDSM, they can describe a deliberately chosen form of relationship identity or authority—not legal ownership of another human being.

A collar does not remove a person's rights, bodily autonomy, ability to withdraw consent, or freedom to end a relationship.

A person can feel profoundly owned **within the meaning of their negotiated dynamic** while remaining a full person with independent rights and responsibilities.

### Does a Collar Make Someone Submissive?

No.

A person might enjoy collars for sensory, aesthetic, or symbolic reasons without wanting to submit.

A Dominant might wear a collar because they appreciate the style, because their partner gave it to them, or because it expresses a separate personal meaning.

Someone who identifies as submissive may dislike collars entirely.

The object does not determine a person's role.

## 3. Different Types of Collars—and Why They Aren't a Universal Ladder

BDSM communities use a number of labels for collars.

These can be useful, but they are **community conventions rather than standardized stages**. Not every relationship recognizes the same categories, and no one has to progress through them in a particular order.

### Play or Scene Collar

A play collar is worn for a particular activity, scene, or roleplay context.

It might help participants mark the beginning or ending of an experience.

The meaning may be temporary: "For this scene, we have agreed to these roles."

A play collar does not necessarily mean the wearer belongs to someone outside the negotiated interaction.

### Day Collar

A day collar is typically a piece of jewelry or other wearable symbol suitable for ordinary daily life.

It might resemble a necklace, choker, bracelet, ring, or another accessory.

For some, it represents an ongoing D/s relationship without disclosing that relationship to coworkers, family, or strangers.

Others simply like how it looks.

"Day collar" describes its use or context, not one required design.

### Consideration Collar

Some people use a collar of consideration while exploring a potential relationship or dynamic.

It may express intentional interest and a willingness to get to know one another before making a more significant commitment.

It does not automatically establish exclusivity, obedience, authority, or a future obligation.

Those would need to be discussed separately.

### Training Collar

Some relationships use a training collar to symbolize a period of learning protocols, building skills, or becoming familiar with an agreed dynamic.

The word "training" is not a universal requirement of submission, nor does it imply that a submissive person needs to be taught to be acceptable.

It is a relationship-specific term whose meaning should be clarified.

### Formal, Commitment, or Ownership Collar

A formal collar may represent an enduring, carefully considered relationship commitment.

For some couples it carries an emotional weight similar to a significant romantic or ceremonial promise.

For others, a less formal collar may hold exactly the same depth of meaning.

A formal collar does not guarantee permanence or establish a hierarchy of authenticity over other dynamics.

### Protection Collars and Other Labels

Some communities also describe protection collars, house collars, pet collars, or other context-specific symbols.

These terms can have strongly varying meanings. A "protection" collar, for example, may represent an agreed relationship or symbolic support; it does not authorize anyone to control who may speak to the wearer or to disregard that person's autonomy.

A pet collar may relate to pet play, but not every collar implies pet play, and not every person interested in pet play wants a collar.

The safest assumption is that the meaning is **unknown until the wearer chooses to explain it**.

## 4. What Is Collaring?

**Collaring** is the act or process of giving, accepting, putting on, or using a collar with agreed meaning.

Sometimes it is simple and private.

One partner asks whether the other would like to wear a particular collar. They agree on its meaning, and one fastens it for the other.

Sometimes collaring is an emotionally significant relationship milestone.

The participants may exchange promises, speak about what the dynamic means to them, or invite trusted friends to witness the moment.

And sometimes someone collars themselves.

### A Collaring Ceremony

A collaring ceremony can be formal, casual, private, or communal.

Some couples write vows. Others exchange a few sentences.

Some have elaborate traditions; others simply want a quiet moment that belongs to them.

There is no universal ceremony, script, or required title.

A ceremony should reflect the people involved rather than pressure them to recreate someone else's idea of a "proper" collaring.

### Is Collaring the Same as Marriage?

Some people compare a formal collar to an engagement ring or wedding band because it represents commitment.

That comparison can help explain its emotional importance, but it is not an exact equivalence.

A collar does not create the legal status of marriage. It does not confer legal ownership, medical decision-making rights, or control over a partner's finances.

The comparison describes how the people involved *experience the symbol*, not what the law recognizes.

### Self-Collaring

A person may choose to wear a collar as a symbol of personal identity, self-commitment, independence, belonging to a community, or simply because they want to.

Self-collaring does not require a Dominant.

It may or may not signify that someone is interested in a future relationship.

No one else gets to define what that choice means.

## 5. What Wearing a Collar Can Feel Like

The appeal of collars is not always about formal commitment.

For some people, the meaning is **belonging**: having a tangible reminder of a relationship they value.

For others, it is **attention**: remembering the care taken in choosing, presenting, or fastening the object.

Some enjoy **ritual**. Putting on a collar may help them move into an agreed role or mark the beginning of intentional time together.

Others appreciate **sensory qualities** such as contact, weight, texture, or a familiar object resting against the skin.

A person may enjoy its **aesthetic**: the styling, shape, color, materials, or how it complements their clothing.

Some experience a collar as an intensely private symbol, meaningful precisely because other people cannot recognize it.

Others want it to be visibly understood within their community.

No motivation is mandatory.

Someone can enjoy several of these meanings at once, or find that their reasons change over time.

## 6. The Collar Is Not the Relationship

A collar may symbolize a bond, but it cannot replace the actual agreements that make the bond work.

If two partners decide that a collar represents an ongoing D/s relationship, they still need to discuss what that relationship includes.

Does the collar mean there are standing protocols?

Is it a sign of exclusivity?

Is wearing it expected daily or only by choice?

Are there particular rituals associated with putting it on?

What does the partner who presents it promise in return?

What happens when someone no longer wants the current arrangement?

One partner may understand a collar as "we are committed to one another."

The other may understand it as "you now have authority to direct my daily life."

Those are materially different expectations.

**If a symbol means different things to the people involved, the misunderstanding will not be fixed by making the symbol more elaborate.**

### Ownership Symbols Do Not Expand Consent

Accepting a collar does not automatically mean agreeing to restraint, sex, punishment, pain play, exclusivity, or total power exchange.

Those are separate matters requiring their own clear, ongoing agreement.

Likewise, refusing a collar does not invalidate someone's submission, commitment, or participation in BDSM.

## 7. Visibility, Privacy, and the Outside World

A collar can be an intensely personal object worn in public.

That creates a distinction between **what it means to the wearer** and **what other people are entitled to know**.

Some people prefer discreet jewelry so they can carry a reminder of their relationship without disclosing private information.

Others enjoy visibly recognizable collars within consensual community settings.

Both choices can be valid.

### Wearing a Collar Is Not an Invitation

A stranger cannot infer from a collar that someone wants to be approached sexually, touched, questioned about their relationship, or treated as available for play.

Nor should another person assume they must seek a Dominant's permission before speaking respectfully to a collared adult.

Some established groups have particular etiquette conventions. Those conventions do not supersede an individual's autonomy or ordinary rules of consent.

### Privacy May Be Part of the Meaning

A day collar might look like ordinary jewelry at work or around family.

Someone may choose not to explain its significance.

The right to keep a meaningful symbol private should be respected, including in photographs, social media posts, and conversations with others.

If a collar is part of a shared relationship symbol, partners should negotiate when and to whom its meaning may be disclosed.

### Work, Family, and Practical Circumstances

Not every setting is appropriate for every style of neckwear.

Workplace requirements, uniforms, child-care responsibilities, physical activities, and personal comfort may influence whether or when a collar is worn.

Taking it off for a practical reason need not imply rejection of the relationship.

A supportive agreement allows people to respond to real-world circumstances without shame or coercion.

## 8. Choosing a Collar: Material, Comfort, and Context

The choice of collar can be meaningful, but appearance is only one part of the decision.

### Material and Sensory Preference

People may have preferences for leather, fabric, silicone, metal, or other materials.

Each can feel different against the skin.

Texture, weight, seams, moisture, heat, and allergies may influence comfort.

Metal components can sometimes trigger contact reactions, including nickel allergy. Materials that trap moisture or rub against the skin can also cause irritation.

Someone who enjoys noticeable pressure may still need to avoid constriction or prolonged friction.

**A sensory preference is not a reason to ignore skin irritation, pain, numbness, or breathing discomfort.**

### Context of Use

A collar used as everyday jewelry has different requirements from one used as a temporary costume or scene accessory.

An attractive fashion collar is not automatically safe for an activity involving pulling, attachment, or restraint.

Hardware such as rings and clasps does not establish a safe load rating.

In particular, force applied to the neck can cause severe injury. Do not use a collar to pull, suspend, choke, or restrict breathing or blood flow. There is no reliably safe form of strangulation.

### Safe Removal

A collar should be removable promptly when necessary.

This matters especially for designs with locks, unusual fasteners, or restricted access to a key or tool.

Even if a couple enjoys a ritual of asking permission before removal, urgent physical comfort and safety must take priority.

No one should have to wait for an unavailable partner to stop neck discomfort or seek medical attention.

### Daily Wear Is Not Risk-Free

For prolonged wear, consider whether the collar catches on objects, interferes with work or exercise, produces skin irritation, or becomes uncomfortable while resting.

Remove neckwear when there is any risk of snagging or pressure during sleep or physical activity.

Check the skin and the fit regularly, and stop wearing the item if problems occur.

A collar worn every day does not need to be worn every moment.

## 9. Locks, Keys, and Ritualized Permission

Some collars use a lock as part of their symbolism.

A key may represent trust or the idea that someone else has accepted an important responsibility.

For some couples, having a partner place or remove the collar is a deeply meaningful ritual.

But **symbolic control is not the same as physical necessity**.

A locked collar must not prevent timely, independent access to removal during an emergency.

Partners should agree on how it will be removed when the other person is absent, during health concerns, or when a participant withdraws consent.

An agreed request or permission ritual may be significant inside the dynamic, but it cannot override someone's need to remove unsafe or unwanted neckwear.

In other words, the ritual is allowed to carry meaning because it remains a choice.

## 10. Collars Are Not Only for Submissives

The visual association between collars and submission is strong, but it is not universal.

A Dominant may wear a collar.

A switch may enjoy one.

A person may wear a collar for fashion, pet play, sensory pleasure, or self-expression.

A submissive may enjoy fastening a collar around their Dominant's neck because their partner asked for it, because they love the act of adornment, or because they appreciate seeing their partner wear something meaningful.

That does not automatically reverse the D/s relationship.

The activity of fastening or wearing a collar is separate from the authority structure and the motivation behind it.

Two people can also enjoy collar-focused play without either being Dominant or submissive.

**Ask what the collar means to the people involved rather than inferring their roles from who wears it.**

## 11. Collaring Does Not Have to Follow a Relationship Timeline

Some guides describe consideration, training, and formal collars as steps along a path.

That structure may be meaningful to people who choose it.

But it is not a requirement.

A couple may choose one collar from the beginning.

Someone may enjoy a daily collar without ever planning a ceremony.

An established relationship may introduce collaring years later.

Another may stop using a collar while keeping the underlying relationship unchanged.

And people who prefer non-hierarchical relationships may use collaring purely as a shared symbol.

There is no universal progression toward a "more serious" collar.

The significance comes from the promises, choices, and experiences associated with it.

## 12. Uncollaring: When a Meaning Changes or Ends

If receiving a collar can carry emotional weight, removing or returning one can as well.

**Uncollaring** may describe ending a collar-based agreement, changing the meaning of a collar, or concluding a relationship dynamic.

Some people mark this with a formal conversation or ritual.

Others simply stop wearing the item.

The object might be returned, stored, repurposed, or kept as a personal memento, depending on the circumstances and the wishes of the people involved.

There is no universal required procedure.

### Ending an Agreement Does Not Require Permission

Someone may withdraw consent to a relationship structure even if their partner does not want it to end.

The ability to leave cannot depend on the Dominant authorizing uncollaring, returning a key, or granting a ceremonial release.

A person may choose a ritual because it helps them mark a transition. They do not owe one.

### A Collar Can Change Meaning Without Being Discarded

A relationship may evolve.

A collar that once signified submission might become a symbol of affection without any authority exchange.

A play collar might become everyday jewelry.

A person may discover that they enjoy wearing a collar but not the original ritual attached to it.

Revisiting its meaning is not an admission that the original choice was meaningless.

It reflects that people and relationships can change.

## 13. Questions to Explore Before Collaring

If collaring is something you or a partner might want, consider discussing:

- What does the collar mean to each of us?
- Is it about relationship commitment, a D/s role, sensory pleasure, personal identity, fashion, or a combination?
- Is it intended for a scene, everyday wear, ceremony, or multiple contexts?
- Who chooses the style, and whose comfort needs take priority?
- Does the collar symbolize any specific authority, exclusivity, or protocol? What remains outside those agreements?
- Is putting it on or taking it off part of a ritual?
- How can it be removed independently and immediately when needed?
- Who may know its meaning, and what may be shared publicly?
- What would happen if one of us wanted to change or end the agreement?
- Would we still value the relationship or experience if we used no collar at all?

The last question can be especially revealing.

If a collar is a symbol of something meaningful, it helps to understand the something—not only the symbol.

## 14. Common Misconceptions About Collars

### "If You Wear a Collar, You Belong to Someone"

Not necessarily. It may be a self-chosen accessory, a scene prop, a personal symbol, or part of a relationship. You cannot determine which by looking.

### "A Real Submissive Has to Be Collared"

No. Submission does not require specific clothing, equipment, jewelry, or ceremonies.

### "A Permanent Collar Means Permanent Consent"

No. There is no collar or vow that can make future consent irrevocable.

### "The Dominant Gets to Decide Whether a Collar Comes Off"

A couple may negotiate a removal ritual, but physical safety and the wearer's right to withdraw consent always remain. Symbolic permission does not justify trapping someone in an item.

### "A Collar Means Someone Is Available for Play"

No. A visible collar tells you nothing reliable about a person's availability or interest in interacting.

### "Collaring Only Matters if It Happens in a Ceremony"

No. Private, everyday, temporary, self-directed, and ceremonial forms may all be meaningful.

## Final Thoughts: The Meaning Is Chosen, Not Imposed

A collar can be ordinary jewelry.

It can be a marker of a scene, a ritual of transition, a sensory experience, a reminder of devotion, or a symbol of ongoing power exchange.

It may be worn in public while keeping its meaning private.

It may be given through a ceremony or chosen quietly by the person who wears it.

For some people, the collar represents being claimed. For others, it represents claiming an identity of their own.

Neither meaning can be read from the object alone.

What makes collaring significant is not the metal, leather, fabric, buckle, ring, or lock.

It is the understanding, freedom, and intention behind it.

**A collar can symbolize commitment, belonging, or chosen authority—but it never replaces the consent that gives those symbols meaning.**

---

### Continue Learning

- **Dominance & Submission: Understanding the D and S of BDSM:** How people negotiate authority and chosen surrender.
- **Kinks Are Not Roles:** Why an accessory or activity cannot determine a person's identity.
- **Kink Without Dominance or Submission:** Exploring personal symbolism and kink without a power-exchange relationship.
- **Total Power Exchange:** Broad ongoing authority and its limits.
- **Negotiating a Scene:** Talking about activities, expectations, and boundaries.
- **Safewords:** Communicating when an experience needs to pause or stop.
- **Rules, Protocols & Rituals:** Understanding the agreements that can give a relationship symbol meaning.

### Further Reading

- [National Coalition for Sexual Freedom — Consent Counts](https://ncsfreedom.org/key-programs-2/consent-counts/)
- [Guglielmi & Reddy-Best — BDSM, Dress, and Consumption: Women's Meaning Construction Through Embodiment, Bodies in Motion, and Sensations](https://doi.org/10.1177/0887302X211061020)
`,Zt=`# Dominance & Submission: Understanding the D and S of BDSM

*Exploring consensual authority, chosen surrender, trust, and the many ways people experience power exchange.*

**Level:** Beginner  
**Estimated reading time:** 9 minutes  
**Topics:** BDSM Fundamentals · Dominance · Submission · Power Exchange · Consent · Relationship Dynamics

**Content note:** This article discusses consensual power exchange, authority, vulnerability, psychological control, and potentially unhealthy relationship dynamics without graphic descriptions.

---

## Introduction: When Power Becomes Something We Choose

What does it mean to willingly give someone authority over you?

And what does it mean to accept responsibility for that authority?

At the center of Dominance and Submission is a fascinating relationship between power, choice, and trust.

The **D** stands for **Dominance**, and the **S** stands for **Submission**.

Together, they describe forms of consensual power exchange: arrangements in which people agree that one participant will exercise some degree of authority or direction while another voluntarily accepts or follows it.

But the experience is much broader than commanding and obeying.

For some people, Dominance and Submission are playful roles explored during occasional scenes.

For others, they represent deeply meaningful relationship structures involving rituals, responsibilities, expectations, and emotional connection.

Some experience power exchange primarily as an erotic interest. Others find meaning in the psychological, relational, or nonsexual aspects.

A Dominant might enjoy leading, protecting, directing, challenging, or being trusted with responsibility.

A submissive might enjoy surrendering decisions, following guidance, offering service, experiencing vulnerability, or expressing devotion.

And two people engaging in the same outward behavior might experience it for completely different reasons.

**Dominance and Submission describe how people consensually relate to authority—not their inherent worth, strength, independence, or ability.**

## 1. Dominance: More Than Being in Charge

Dominance involves consensually taking an authoritative, directing, or leading role within an agreed context.

That role might include making decisions, establishing expectations, providing instructions, guiding experiences, or holding responsibility for certain aspects of a dynamic.

But Dominance is not simply getting whatever one wants.

The authority involved exists within the boundaries participants have negotiated.

A Dominant may be entrusted with considerable discretion in some areas while having no authority whatsoever in others.

### What Can Dominance Look Like?

Dominance takes many forms.

**Directive Dominance**

A person enjoys giving clear instructions, making decisions, and directing an interaction.

The appeal may come from leadership, responsiveness, or seeing a partner willingly follow their guidance.

**Nurturing Dominance**

Authority is expressed through attentiveness, support, protection, or providing structure.

A nurturing Dominant might enjoy taking responsibility for helping create an experience in which their partner feels secure and understood.

**Protocol-Oriented Dominance**

Structure, rules, and rituals play an important role.

The Dominant may enjoy establishing meaningful expectations, maintaining consistency, and recognizing a partner's efforts.

**Primal Dominance**

The emphasis may be less on formal rules and more on instinct, pursuit, physical presence, or energetic expressions of authority.

**Service-Oriented Dominance**

Some Dominants find satisfaction in using their leadership to create fulfilling experiences for their partners.

They may enjoy planning, preparation, responsibility, and responding carefully to another person's needs.

These are descriptive possibilities, not rigid classifications. A person's approach may combine several styles or change according to context.

### Why Do People Enjoy Dominance?

The appeal is not necessarily a desire to control people in ordinary life.

Some people enjoy the sense of being trusted to lead.

Others find satisfaction in creating structure, making decisions, or orchestrating meaningful experiences.

For some, the emotional significance comes from a partner's voluntary responsiveness.

A requested action may matter less than the knowledge that the other person genuinely wants to follow.

Dominance may also involve a sense of care or stewardship. Having authority can mean accepting responsibility for how that authority affects another person.

However, enjoying Dominance does not automatically make someone a skilled or trustworthy Dominant.

Trustworthiness comes from behavior: communication, respect, competence, consistency, and the willingness to accept limits.

**Authority within BDSM is not proof of authority outside it.**

## 2. Submission: The Choice to Yield

Submission involves voluntarily accepting another person's agreed authority, direction, or leadership.

From the outside, submission is sometimes mistaken for passivity, weakness, or an inability to make independent decisions.

But submission does not require any of those characteristics.

A submissive can be confident, assertive, professionally accomplished, independent, opinionated, and highly capable of leading others.

Submission describes a chosen relationship to authority in a particular context.

It does not erase the rest of someone's personality.

### What Can Submission Look Like?

Submission can be expressed through many motivations and behaviors.

**Devotional Submission**

The person experiences satisfaction through expressions of dedication, commitment, or belonging.

The emotional significance of an action may be more important than the action itself.

**Service Submission**

The person enjoys performing tasks, helping, contributing, or fulfilling responsibilities that have meaning within the dynamic.

Service can involve practical, symbolic, emotional, or ritualized actions.

**Obedience-Oriented Submission**

Following instructions is itself rewarding.

Clear expectations, successful completion, recognition, and the experience of yielding to another person's direction may be especially meaningful.

**Sensory or Experiential Submission**

The individual may be drawn to experiences of being guided, positioned, restrained, or directed without necessarily wanting ongoing relationship authority.

**Primal Submission**

Submission may be expressed through instinctive responses, pursuit, resistance, yielding, or other less formal interactions.

**Playful or Resistant Submission**

Some submissives enjoy challenging, teasing, negotiating, or playfully resisting a Dominant within an agreed framework.

This is sometimes associated with the term *brat*, although not everyone who enjoys resistance identifies that way.

Submission can also be quiet, ceremonial, deeply emotional, or highly collaborative.

No single behavior establishes whether someone is genuinely submissive.

### Why Do People Enjoy Submission?

For some, submission provides relief from having to make decisions.

For others, it creates a focused experience of trust and vulnerability.

Some enjoy the recognition that comes from following instructions well.

Others find meaning in service, dedication, emotional closeness, or belonging.

One person might enjoy submission because they like being given structure.

Another might enjoy the same structure because it represents someone's attention and investment.

A third might dislike rules entirely but enjoy the experience of temporary surrender during a scene.

These experiences can overlap, but they are not interchangeable.

And submission is not necessarily about receiving less.

A submissive may actively shape a dynamic through negotiation, feedback, requests, and preferences. The Dominant's authority and the submissive's agency can coexist.

**Choosing to follow someone is not the same as being incapable of leading yourself.**

## 3. Power Exchange: The Relationship Between Dominance and Submission

Dominance and Submission are often discussed as complementary roles.

But power exchange is more accurately understood as an agreed relationship between authority and autonomy.

A person with decision-making authority may be permitted to direct particular activities, establish expectations, or make specific choices.

The other person agrees to recognize that authority within the negotiated scope.

Consider a simple example.

Two partners decide that one person will choose how they spend a particular evening.

The submissive agrees not to participate in the usual decision-making process, provided the choices remain within previously discussed boundaries.

The Dominant chooses the activity.

The submissive follows the decision.

From the outside, that interaction might appear ordinary.

But for the participants, the meaning may be completely different.

The important part is not necessarily the activity chosen.

It is the consensual allocation of decision-making authority.

### Authority Has a Scope

One of the most important distinctions in power exchange is that authority is not automatically universal.

A Dominant might have authority over:

- Certain activities or scenes.
- Rituals, protocols, or forms of address.
- Specific choices about presentation or appearance.
- Previously negotiated routines.
- Agreed aspects of sexual interaction.
- Particular decisions within an ongoing relationship.

None of these automatically grants authority over the others.

For example, agreeing that a partner can choose an outfit does not mean agreeing that they can control friendships, finances, medical decisions, or access to outside support.

Some relationships negotiate broad authority structures, but even these remain subject to consent, legal rights, personal autonomy, and the ability to withdraw from the arrangement.

**Power exchange is defined by what has actually been agreed upon—not what someone assumes a role entitles them to demand.**

## 4. Dominance, Submission, and Relationship Roles

Not every person who enjoys Dominance or Submission wants an ongoing D/s relationship.

Some people prefer to explore these roles only during particular activities or scenes.

Others incorporate them into recurring aspects of a relationship.

### Scene-Based Power Exchange

Authority exists during a defined experience.

The participants may use particular roles, instructions, or protocols, then return to their ordinary relationship structure afterward.

### Ongoing Power Exchange

Authority extends beyond individual scenes into negotiated routines, responsibilities, or everyday interactions.

This might involve recurring rituals, expectations, or areas of decision-making.

### Broad or Total Power Exchange

Some relationships use terms such as *Total Power Exchange* (TPE) to describe a dynamic where authority has been negotiated across many areas of life.

The term does not mean that consent becomes irrevocable or that one partner acquires unrestricted control.

Even broad power-exchange dynamics require ongoing attention to autonomy, safety, communication, and the ability to leave.

### What About Titles?

Terms such as Dominant, submissive, Dom, Domme, Master, Mistress, Sir, Daddy, boy, girl, pet, and slave may have particular meanings in different dynamics.

Some are role descriptions. Others function as personal titles, forms of affection, or symbols of an agreed relationship.

A title does not independently establish someone's authority.

Its meaning comes from how the participants define and consent to it.

Likewise, people can participate in D/s without using titles at all.

## 5. The Psychology of Chosen Authority

There is an interesting paradox at the center of consensual power exchange.

Submission may involve giving up a degree of control, yet doing so can be an expression of personal agency.

Dominance may involve accepting control, yet that authority comes with boundaries and responsibility.

This relationship challenges the assumption that freedom always means making every decision independently.

For some people, freedom includes the ability to choose when, how, and with whom they share decision-making.

### Trust and Vulnerability

Power exchange can make trust especially visible.

A submissive might demonstrate trust by following an instruction without knowing every detail of what comes next, within an agreed scope.

A Dominant might demonstrate trustworthiness by using their discretion carefully, respecting boundaries, and recognizing when to stop or change course.

Vulnerability can exist on both sides.

The submissive may risk feeling exposed, uncertain, or disappointed.

The Dominant may feel the responsibility of being trusted and the vulnerability of having their leadership accepted, questioned, or declined.

Neither role is automatically emotionally easier.

### Recognition and Being Known

For some people, one of the most meaningful aspects of power exchange is the feeling that another person has learned them carefully enough to lead or respond in a personally significant way.

A simple instruction might communicate:

*I know what matters to you.*

Following it might communicate:

*I trust you with this part of myself.*

But not everyone interprets these interactions that way.

For some, D/s is primarily playful or erotic rather than emotionally symbolic.

Neither interpretation is more authentic.

## 6. Dominance Is Not the Same as Topping

Another important distinction concerns the terms *top* and *bottom*.

These generally describe what someone does within an activity, rather than their relationship to authority.

A **top** typically performs or directs an activity.

A **bottom** typically receives or experiences it.

A **Dominant** occupies an agreed role of authority.

A **submissive** voluntarily accepts agreed authority.

These roles often overlap, but they do not have to.

For example, a submissive might perform an activity on a Dominant at the Dominant's direction.

In that situation, the submissive could be the activity top while the Dominant remains the person directing the power exchange.

Similarly, two people may enjoy topping and bottoming together without any Dominance or Submission.

Understanding the distinction helps separate physical activity from relational authority.

Someone's preferred position during an activity does not automatically tell you how they want to experience power.

## 7. Consent, Negotiation, and Responsibility

Because D/s can involve psychological vulnerability and interpersonal authority, consent is foundational.

But consent involves more than simply agreeing to be Dominant or submissive.

Partners need a shared understanding of what those roles mean.

### Negotiating Authority

Useful questions include:

- What decisions or activities are included in the dynamic?
- Which areas remain entirely outside it?
- Are instructions requests, expectations, or negotiated obligations within the roleplay?
- Can a participant decline an instruction without consequences?
- How will participants distinguish an in-character refusal from withdrawing consent?
- What happens when someone makes a genuine mistake?
- How will rules be reviewed or changed?
- How can either participant stop the dynamic or seek outside support?

Consent may be communicated through conversation, written agreements, check-ins, and clearly established stop signals.

A written agreement can help people understand expectations, but it is not a substitute for ongoing consent.

### Responsibility Is Not Absolute Authority

Dominants should pay attention to the effects of their directions and decisions.

Being granted authority does not eliminate responsibility for causing harm.

Submissives, meanwhile, retain the right to express needs, boundaries, disagreement, and changed preferences.

Healthy negotiation should make it possible to raise concerns without fear of retaliation.

An agreement made during one emotional state may need reconsideration during another.

Likewise, something that works in an established relationship may not be suitable for someone who is still learning their boundaries.

### When Power Exchange Becomes Coercion

BDSM language can sometimes be used to conceal controlling or abusive behavior.

Warning signs include pressuring someone to accept unwanted activities, punishing the withdrawal of consent, isolating someone from trusted relationships, restricting access to help, or using threats to obtain obedience.

Calling these behaviors Dominance does not make them consensual.

Nor does identifying as submissive mean a person is obligated to tolerate harm.

Partners may voluntarily negotiate extensive structures, but consent must remain meaningful in practice—not just in theory.

A relationship should allow someone to express disagreement, seek support, and leave without threats or retaliation.

**A dynamic that depends on someone being unable to say no is not consensual power exchange.**

## 8. Communication Outside the Dynamic

One of the most useful practices in ongoing power exchange is establishing opportunities to communicate outside the roles themselves.

Some partners call this an out-of-dynamic conversation, a relationship check-in, or a debrief.

The purpose is to create space where neither participant feels required to maintain the behavior associated with their role.

A submissive can raise concerns without needing to frame them as a request for permission.

A Dominant can discuss uncertainty, mistakes, emotional needs, or changes in capacity.

Both can evaluate whether their agreements remain mutually beneficial.

This is particularly important when the dynamic includes rules, discipline, or broad authority structures.

### Repair Matters

Even thoughtful partners can misunderstand one another.

An instruction may land differently than intended.

A response may feel dismissive.

A boundary may be misunderstood.

Healthy power exchange does not require perfect performance.

It requires recognizing problems, accepting responsibility, making repairs, and changing behavior when necessary.

A Dominant does not lose legitimacy by acknowledging a mistake.

A submissive does not fail at submission by identifying a problem.

Repair is a relationship skill, not a violation of a role.

## 9. Exploring Your Own Relationship With Power

You do not need to identify as Dominant or submissive to begin understanding your interests.

Start by exploring which experiences appeal to you and why.

### If You're Curious About Dominance

Ask yourself:

- Do I enjoy leading, or do I specifically enjoy someone choosing to follow me?
- Does authority feel exciting, meaningful, comforting, or burdensome?
- Am I drawn to structure, nurturing, control, responsibility, or creative direction?
- Does my enjoyment depend on a partner's visible responsiveness?
- Am I comfortable being accountable when my decisions affect someone else?
- Would I still enjoy Dominance without punishment or physical intensity?

### If You're Curious About Submission

Consider:

- Am I interested in following instructions, or in the person giving them?
- Does surrender appeal to me because of trust, relief, belonging, anticipation, or something else?
- Do I enjoy being guided, being praised, offering service, or experiencing vulnerability?
- Which decisions would I enjoy delegating, and which would I prefer to retain?
- Does structure make me feel supported, restricted, or both?
- Would I enjoy submission without bondage, punishment, or sexual activity?

### If You're Curious About Both

Some people experience both Dominant and submissive interests.

The term *switch* is commonly used for people who enjoy moving between Dominant and submissive roles, though individual definitions vary.

A switch may prefer different roles with different partners, in different activities, or at different times.

Others may enjoy one role predominantly while occasionally exploring the other.

Interests do not need to be evenly balanced or consistent across every context.

## 10. Power Exchange Is Not a Hierarchy of Worth

Neither Dominance nor Submission makes someone inherently superior or inferior.

A Dominant is not automatically more capable, mature, knowledgeable, or deserving of respect.

A submissive is not automatically weaker, dependent, less intelligent, or less autonomous.

Within an agreed dynamic, participants may deliberately use language and rituals that express hierarchy.

Those expressions can be deeply meaningful without representing an objective difference in personal worth.

Nor does an ongoing dynamic automatically represent a more serious or authentic form of BDSM than occasional scene-based power exchange.

Some people find meaning in structured, long-term authority arrangements.

Others enjoy a playful exchange lasting only minutes.

Both can be valid.

The depth of an experience is not measured by how much autonomy someone agrees to delegate.

## Final Thoughts: The Power of Choosing

Dominance and Submission are sometimes reduced to a simple exchange: one person controls, and the other obeys.

But that description misses much of what makes consensual power exchange meaningful.

Dominance can involve leadership, creativity, attentiveness, and responsibility.

Submission can involve trust, dedication, responsiveness, vulnerability, and chosen surrender.

Both depend on people understanding one another well enough to negotiate experiences they genuinely want.

For some, these dynamics provide excitement.

For others, they offer structure, intimacy, self-expression, or the experience of being deeply known.

And for many, the meaning changes over time.

The question is not how much authority one person can acquire or how much independence another can surrender.

It is what two or more people intentionally create when they decide to explore authority together.

**The defining feature of consensual power exchange is not that one person has power and another has none. It is that everyone retains the power to choose whether, how, and for how long the exchange continues.**

---

### Continue Learning

- **Bondage & Discipline: Understanding the B and D of BDSM:** The distinction between physical restraint and behavioral structure.
- **Understanding Sadism & Masochism:** How consensual intensity and sensation differ from authority.
- **BDSM Consent & Negotiation:** Creating informed and ongoing agreements.
- **Power Exchange Beyond the Bedroom:** Everyday rituals, authority, and relationship structures.
- **Dominance Styles:** Exploring directive, nurturing, primal, and protocol-oriented leadership.
- **Submission Styles:** Understanding service, devotion, obedience, resistance, and surrender.
- **Rules, Protocols & Rituals:** Giving agreed relationship structures practical meaning.
- **Recognizing Coercion:** Distinguishing consensual power exchange from unhealthy control.
`,Jt=`# Kink Without Dominance or Submission: You Don't Need a Power Exchange to Play

*Understanding collaborative kink, sensory curiosity, and experiences that don't require someone to be in charge.*

**Level:** Beginner  
**Estimated reading time:** 9 minutes  
**Topics:** BDSM Fundamentals · Kink Exploration · Non-D/s Play · Consent · Sensation · Collaborative Scenes

**Content note:** This article discusses adult kink activities, restraint, sensation, and roleplay in a non-graphic educational context.

---

## Introduction: Who's the Dom?

Two people are talking about an activity they would like to try.

They have discussed what appeals to them. They have agreed on boundaries. They know how to stop.

Then someone asks: "Okay, but who's the Dom?"

What if the answer is **neither of us**?

A surprisingly persistent misconception about BDSM and kink is that one person must take charge while another submits.

In reality, many kink activities can exist without Dominance or submission.

People can enjoy sensation, restraint, teasing, aesthetics, roleplay, ritual, and playful experimentation without agreeing that one person has authority over the other.

Some participants identify as Dominant or submissive in other contexts but choose not to bring those roles into a particular activity.

Others never identify with those roles at all.

Their interests do not become less meaningful because they lack an authority structure.

**Kink describes a broad landscape of interests and experiences. Power exchange is one possible way of engaging with it—not an admission requirement.**

## 1. Kink and D/s Are Different Concepts

**Kink** is a broad term commonly used for interests, practices, fantasies, or forms of play outside conventional expectations of sexuality or intimacy. Its boundaries vary by person and community, and kink is not necessarily sexual.

**Dominance and Submission (D/s)** refers specifically to negotiated authority: one person agrees to direct some aspects of an interaction or relationship, while another voluntarily accepts that direction.

These categories can overlap, but they do not have to.

A person can enjoy kink without D/s.

A person can enjoy D/s without physical kink activities.

A person can enjoy both, sometimes together and sometimes separately.

And a person can prefer neither.

### Why Are They So Frequently Associated?

Popular depictions of BDSM often center commanding voices, obedience, restraints, and recognizable hierarchies.

Those images make power exchange easy to spot.

But activities that look dramatic from the outside may have ordinary, collaborative decision-making behind them.

One person might be applying a sensation simply because it takes two people to create the experience.

Doing the action does not necessarily grant them authority over their partner.

The distinction matters because external appearances can obscure what was actually negotiated.

## 2. Performing an Activity Isn't the Same as Having Authority

Many activities have practical roles.

Someone might need to arrange equipment while another receives an experience.

A person may hold an object, guide a movement, or perform a skill.

These roles describe participation in a task. They do not inherently establish a hierarchy.

Consider a massage.

One person performs the massage. The other receives it.

That alone does not mean the person giving the massage is Dominant, or the person receiving it is submissive.

The same logic applies to consensual activities that are considered kinky.

### Top and Bottom Are Not Always Dom and Sub

In many communities, *top* and *bottom* are used to distinguish who performs or receives an activity.

A rope top can tie someone without wanting authority over them.

A rope bottom can receive restraint without wanting to submit.

Partners can switch activity positions simply because they enjoy experiencing different sides of an interest.

They do not need to switch D/s identities, and they do not need those identities in the first place.

Some people prefer not to use top/bottom terminology at all. They can simply describe what each person will do.

## 3. What Does Non-D/s Kink Look Like?

There is no single model. Here are several possibilities.

### Collaborative Sensation Play

Two partners enjoy experimenting with agreeable, low-risk sensory experiences such as textures or gentle pressure.

They decide together what to explore and check in as they go.

One may apply a sensation because that is the practical way to experience it.

There is no special authority attached to doing so.

### Artistic Rope Interest

Someone may appreciate rope for pattern, composition, craftsmanship, or the experience of arranging materials.

A partner may enjoy being part of the artistic process without assigning submissive meaning to the arrangement.

Physical restraint carries risks even when the motivation is artistic; appropriate education and precautions remain necessary.

### Playful Teasing

Two people enjoy lighthearted, mutually welcome teasing or a silly challenge.

They decide together when the game begins and ends.

The appeal may be humor, surprise, attention, or shared creativity rather than obedience.

### Costume and Roleplay

Participants might enjoy outfits, characters, fantasy settings, or acting out a fictional scenario.

Playing a character with authority does not automatically create an ongoing D/s relationship.

The participants still need to agree on what the fiction includes and how to step out of character.

### Personal Sensory Exploration

A person may enjoy wearing a particular texture, using an accessible sensory object, or exploring preferences privately without anyone else participating.

Personal exploration does not require assigning oneself a Dominant or submissive role.

However, solo activity is not inherently safe; avoid activities that could trap, impair, injure, or prevent you from obtaining help.

## 4. What Holds the Scene Together Without a Dom?

A scene without an authority hierarchy still needs coordination.

The answer can be simple: **collaboration**.

Participants discuss what they want, agree on a plan, share responsibility, and remain able to stop.

One person might suggest an activity. The other might modify it. Both agree on the final version.

During the scene, they can check in using ordinary language.

For example:

> "Would you like to try the other texture?"

> "Maybe, but let's keep it gentle."

> "Sure. Tell me if you want to change anything."

No one needs to turn that exchange into a command.

### Structure Doesn't Require Hierarchy

A collaboratively negotiated scene can still have:

- Rituals or an opening and closing routine.
- Specific steps or a shared plan.
- Clear rules about what is permitted.
- Activity-specific responsibilities.
- Safewords or stop signals.
- Agreed aftercare and follow-up.

Those elements provide predictability without requiring one partner to hold authority over the other.

The presence of rules does not automatically mean someone is being disciplined.

## 5. A Complete Example: A Scene Without Power Exchange

Imagine two adults are curious about sensory exploration.

One enjoys unusual textures. The other enjoys helping create experiences and noticing their own reactions.

They agree to spend a short period exploring familiar, low-risk sensations in a comfortable setting.

Beforehand, they discuss preferences, sensitivities, activities they will avoid, and how they will communicate.

Neither wants commands, titles, obedience, or a relationship hierarchy.

They agree that either can suggest the next activity and either can decline.

During the experience, one person provides a sensation and the other receives it. Then they may trade places.

They finish whenever either wants and talk briefly afterward about what felt interesting.

The experience can be intimate, playful, exciting, or informative.

**Nothing about it requires someone to be Dominant or submissive.**

And the absence of a power exchange does not eliminate the need for consent or appropriate risk awareness.

## 6. Can Someone Who Is Dominant or Submissive Enjoy Non-D/s Play?

Absolutely.

A person's relationship identity does not have to govern every activity they enjoy.

Someone may identify as a Dominant with one partner and still participate in an egalitarian art-focused rope workshop.

A submissive may enjoy receiving sensation from a peer without wanting to submit to that person.

Partners in an ongoing D/s relationship can also negotiate times or activities where their usual authority arrangement is deliberately set aside.

The key is clarity.

If an ongoing dynamic exists, participants should discuss which parts of it apply during a particular scene and which do not.

Neither partner should assume that a role automatically travels into a new activity, relationship, or group setting.

## 7. What About People Who Prefer Not to Have Roles at All?

Some people enjoy precise labels: rope top, masochist, service submissive, switch, Dominant.

Others prefer to say:

> "I like this activity, but I don't identify with a role."

That is a complete description.

Labels can help people discover communities and communicate interests, but no one has to adopt them to make an experience legitimate.

Someone may be interested in kink because of physical sensation, personal expression, curiosity, aesthetics, humor, or connection.

They do not need to reinterpret that interest as hidden Dominance or submission.

### Avoid Reverse Assumptions, Too

Non-D/s play is not inherently safer, more equal, or more authentic than consensual power exchange.

People can communicate poorly in any kind of scene.

And D/s relationships can involve thoughtful collaboration and mutual respect.

The distinction is about **whether authority has been intentionally exchanged**, not a ranking of relationship quality.

## 8. Consent Still Matters Just as Much

Without a Dom/sub framework, it might seem easier to assume that the participants are automatically on the same page.

But equality of relationship authority does not guarantee shared expectations.

One person may envision a gentle activity while another expects something intense.

One may enjoy being surprised while another needs everything planned.

All participants should still discuss the specific activity, boundaries, relevant risks, communication, and ways to stop.

### Giving Doesn't Mean Permission to Decide Everything

The person performing an activity does not automatically gain the right to expand it.

If someone has agreed to one sensation, that does not grant permission to add another.

If two people have agreed to a nonsexual scene, being comfortable together does not imply consent to sexual contact.

Informed, voluntary, and ongoing agreement remains essential.

### Everyone Can Say Stop

No one needs to hold a particular role to use a safeword or end a scene.

A top can stop. A bottom can stop. Anyone participating can change their mind.

A person does not need to prove discomfort to have a boundary respected.

## 9. The Role of Meaning: Why People Love the Same Thing Differently

A useful way to understand non-D/s kink is to ask what motivates the interest.

Take restraint as an example.

Someone might enjoy the sensation of containment.

Someone else might enjoy the visual design.

Another might enjoy a partner's careful attention.

A fourth might enjoy the consensual surrender of control within D/s.

The activity itself does not determine which meaning is present.

Similarly, giving praise might be an expression of authority, affection, appreciation, or encouragement.

Being praised might reflect a desire for obedience-based recognition, or simply a love of being noticed.

Neither interpretation is imposed by the act itself.

Understanding the person's *why* often provides more information than trying to sort the activity into a Dominant or submissive category.

## 10. What Non-D/s Kink Can Teach Us About Compatibility

Two people do not need identical identities to share an activity.

But they do need compatible expectations.

Someone who enjoys rope artistry may be compatible with someone who likes receiving rope for sensory reasons, even if neither wants authority exchange.

Someone who enjoys directing every detail of a scene may not be a match for someone who prefers entirely collaborative planning—unless they find a mutually welcome structure.

Compatibility is not simply a question of whether both people check the box for the same kink.

It involves what they want to do, which side of an activity they prefer, why they enjoy it, what they do not want, and how they want to relate to each other.

This is equally true in D/s and non-D/s experiences.

## 11. Exploring Without Choosing an Identity First

If you're curious about kink but do not connect with Dominance or submission, you might start with questions such as:

- Which activities sound interesting to me independent of any role?
- Am I drawn toward sensation, craft, aesthetics, fantasy, attention, or connection?
- Do I enjoy performing an activity, receiving it, or both?
- Would I prefer to plan collaboratively?
- Are there particular dynamics or words I *don't* want associated with the activity?
- How could I explore the underlying interest in a low-risk, mutually agreed way?
- Am I comfortable leaving the activity as a fantasy or curiosity rather than doing it?

You are allowed to explore the question without finding a final label.

Your interests may change, stay specific, or never connect to a broader identity.

## Final Thoughts: Kink Does Not Require a Hierarchy

When people see one person providing an activity and another receiving it, they sometimes assume there must be a leader and follower.

But practical roles and relationship authority are different things.

People can explore kink through collaboration, shared creativity, sensations, personal expression, and curiosity.

They can establish boundaries, responsibilities, and communication without creating a Dominant/submissive relationship.

Some may choose to add power exchange because it makes their experiences more meaningful.

Others will not.

Neither path is incomplete.

**You do not have to become Dominant or submissive to know what you enjoy. You only need the freedom to understand your interests—and, when other people are involved, their informed and ongoing agreement to explore them with you.**

---

### Continue Learning

- **Kinks Are Not Roles:** Separating activities, direction, authority, and motivation.
- **Negotiating a Scene:** Collaborative consent and planning.
- **Safewords:** Communicating clearly during play.
- **Dominance & Submission:** Understanding power exchange as an optional dynamic.
- **Sadism & Masochism:** Physical intensity without automatically implying authority.
`,ei=`# Kinks Are Not Roles: Understanding the Difference Between What You Do and Why You Enjoy It

*Why tying someone up, following instructions, or providing sensation does not automatically make anyone Dominant or submissive.*

**Level:** Beginner  
**Estimated reading time:** 10 minutes  
**Topics:** BDSM Fundamentals · Roles · Power Exchange · Activity Direction · Motivation · Kink Preferences

**Content note:** This article discusses consensual restraint, sensation play, and authority without graphic descriptions or technical instructions.

---

## Introduction: The Same Action Can Mean Different Things

Imagine someone kneeling beside their partner, carefully arranging an agreed restraint.

Who is Dominant?

Who is submissive?

We do not know.

Perhaps the person doing the tying is Dominant and enjoys directing the other person's movement.

Perhaps the person being tied is Dominant, has asked their submissive partner to do the tying, and enjoys the attention and obedience involved.

Perhaps neither person wants a power exchange at all. They simply enjoy making art together or exploring a particular physical sensation.

**The visible action does not tell us who holds authority—or even whether authority is part of the experience.**

This distinction is one of the most useful ideas for understanding kink preferences. An activity, a person's role in performing it, their relationship role, and their personal motivation are separate pieces of information.

They often overlap. They should not be treated as synonyms.

## 1. Four Questions That Describe a Kink Experience

Instead of starting with "Is this a Dom kink or a sub kink?", consider four different questions.

### What Is Happening?

This is the **activity**.

Examples might include rope, restraint, praise, teasing, sensory stimulation, roleplay, service, or a particular ritual.

An activity describes what participants are doing. It does not automatically describe their identities.

### Who Is Doing What?

This is the **activity direction**.

In some practices, one person performs or applies the activity and another receives or experiences it.

The terms *top* and *bottom* are often useful here, although they can vary by community and activity.

A person tying rope may be the rope top; a person being tied may be the rope bottom.

These descriptions still do not establish who is Dominant.

### Who, if Anyone, Has Authority?

This is the **power-exchange relationship**.

A Dominant may have negotiated the authority to direct certain decisions. A submissive may have agreed to follow those decisions.

Or there may be no special allocation of authority at all.

Authority also has a scope. Someone might lead one part of a scene while decisions outside that scope remain collaborative.

### Why Does Each Person Enjoy It?

This is **motivation or meaning**.

Someone might enjoy an activity for its physical sensations, creative possibilities, trust, attention, intimacy, challenge, playfulness, or connection to power exchange.

Two people can enjoy the same activity for different reasons.

One person's reason can change according to partner, mood, context, or circumstance.

These four questions together give a clearer picture than an activity label alone.

## 2. Example: Tying Up Your Dominant

Consider two consenting adults in an established D/s relationship.

The Dominant says:

> "I'd like you to tie me up tonight. I want you to take your time with it."

The submissive agrees, enjoys working with rope, and carefully performs the agreed activity within their training and safety limits.

Who is the rope top?

The submissive, because they are doing the tying.

Who is the rope bottom?

The Dominant, because they are receiving the restraint.

Has the D/s authority structure reversed?

**Not necessarily.**

The Dominant may have chosen the activity, invited the submissive to carry it out, and retained their negotiated authority in other parts of the interaction.

The submissive may experience tying as a form of service, a chance to please their partner, an artistic interest, or the satisfaction of following a request.

The Dominant may enjoy the physical sensation, the attention of being cared for, or the intimacy of allowing their partner to do something skilled and meaningful.

The same exchange could look identical between two people who have no D/s roles, but the internal meaning might be different.

### One Important Clarification

A Dominant's request is not a command that erases the other person's consent.

The submissive can decline the activity. The Dominant also retains the right to stop being tied. Both must understand the activity's specific risks.

The point is not that a Dominant can demand anything. It is that **receiving an activity is not, by itself, submitting**.

## 3. Doing Something Is Not the Same as Directing the Relationship

Many BDSM terms describe different axes that get mistakenly compressed into a single hierarchy.

A top typically performs or delivers a particular activity.

A bottom typically receives or experiences it.

A Dominant participates in an agreed authority relationship.

A submissive voluntarily accepts agreed authority.

These may align in familiar ways: a Dominant tops, and a submissive bottoms.

But they can also cross.

### A Submissive Can Top

A submissive might provide massage, tie rope, apply a negotiated sensation, or lead a practical task because it is something their Dominant wants.

They may enjoy being the one doing the activity without wanting authority over the relationship.

### A Dominant Can Bottom

A Dominant might enjoy receiving massage, restraint, sensation, or other activities while remaining in their agreed relationship role.

Being physically vulnerable does not automatically change negotiated authority.

### A Dominant Can Follow a Suggestion

A submissive may suggest an activity, ask for a particular experience, or identify an unmet need.

The Dominant might agree and choose to incorporate that preference.

Responding to a partner's wishes is not inherently surrendering authority.

### Neither Person Has to Hold Authority

Two people might negotiate a scene as peers, decide what to do together, and take turns performing activities.

That does not make their experience less meaningful or less legitimately kinky.

## 4. Why Motivation Changes the Experience

Imagine three people who all enjoy wearing a collar.

One enjoys the pressure and texture against their skin.

Another enjoys the fashion, visual style, and symbolism of a personal accessory.

A third enjoys a collar because it represents an agreed relationship or sense of belonging.

The object is the same.

The meaning is not.

Or consider praise.

Someone might enjoy compliments because they feel appreciated.

Another might enjoy being praised for completing an instruction within a D/s dynamic.

A third may enjoy praising a partner because they like seeing that person's happiness.

None of those motivations belongs exclusively to Dominance or submission.

### The Difference Between Action and Meaning

For some people, the physical act is the main reward.

For others, the activity is a language for expressing connection, trust, service, or chosen authority.

These are not competing explanations.

A person can enjoy restraint both as a sensory experience and because a specific partner requested it.

A person can enjoy giving direction because they like leadership, while also enjoying the practical results of a task.

The point is to allow multiple meanings rather than assigning one automatically.

## 5. The Same Activity Can Fit Many Dynamics

### Restraint

- A Dominant restrains a submissive within an agreed power exchange.
- A submissive ties their Dominant at the Dominant's request.
- Two peers explore the artistic side of rope without any authority exchange.
- A person enjoys the sensation of containment independent of who provides it.

### Service

- A submissive offers practical help as an expression of devotion.
- A Dominant performs care tasks for their submissive.
- Two partners exchange acts of service without defining either as Dominant.
- Someone enjoys a task because of competence or satisfaction rather than relationship hierarchy.

### Praise

- A Dominant praises a submissive for fulfilling a protocol.
- A submissive praises their Dominant for thoughtful leadership.
- A pair of peers uses praise during collaborative sensation play.
- Someone enjoys giving or receiving affirmation with no role implication.

### Sensation Play

- A Dominant decides which negotiated sensation to provide.
- A submissive applies a requested sensation to their Dominant.
- Two partners collaboratively explore a physical sensation.
- A person enjoys receiving something intense without wanting to surrender decision-making.

What changes from example to example is not necessarily the equipment or technique. It is the agreement, relationship, and meaning.

## 6. Preferences Are Not Automatically Paired

A common assumption is that if someone enjoys one side of an activity, they must also enjoy the other.

That is not true.

Someone may love being tied but dislike tying other people.

Someone might love tying others but have no interest in receiving restraint.

A person might enjoy both, though for different reasons.

Or their interest might depend on a specific partner or context.

Similarly, interests in Dominance and submission are not necessarily mirror images.

A person may enjoy leading in structured rituals but prefer collaboratively planning sensory activities.

They may enjoy receiving physical sensation while disliking having their behavior directed.

### Multiple Preferences Can Coexist

A person could accurately describe themselves as:

- Dominant in an ongoing relationship.
- A rope bottom for particular activities.
- Someone who enjoys giving praise.
- Uninterested in pain play.
- Curious about collaborative non-D/s scenes.

There is no contradiction in that combination.

People are not required to fit every preference onto a single Dominant-to-submissive scale.

## 7. What About Switching?

Some people identify as **switches**, meaning they enjoy changing between Dominant and submissive roles, though usage varies.

But performing an activity from both sides does not necessarily make someone a D/s switch.

A person who both ties rope and receives rope is exploring different activity positions.

They may or may not be interested in switching authority roles.

Conversely, someone may enjoy switching between Dominance and submission while preferring the same kinds of physical activities in either role.

Ask the person what the label means to them instead of inferring it from behavior.

## 8. Why This Distinction Matters for Negotiation

Mislabeling activities can create incorrect expectations.

If someone says "I'm submissive," a partner might assume they enjoy bondage, pain, service, or obedience.

But an identity label alone does not grant consent to any of those.

If someone says "I like tying people," another might assume they want to dominate.

But their interest may be purely artistic or sensory.

Better questions include:

- "Do you like performing this activity, receiving it, or both?"
- "Does this feel connected to D/s for you?"
- "Is the appeal physical, psychological, relational, or something else?"
- "Would you enjoy this if neither person had a special authority role?"
- "Does who you're with change how the activity feels?"
- "Is the activity itself appealing, or is the request from that particular person the meaningful part?"

These questions encourage understanding without forcing someone into a preset identity.

## 9. Connecting Kinks Through Personal Meaning

When several interests seem related, the connection may lie in **why** someone enjoys them rather than how an activity is typically categorized.

For example, someone who enjoys service, praise, and ritual might find that all three express devotion.

Another who enjoys restraint, deep pressure, and certain forms of sensory play may be drawn to the physical experience of containment.

A third might enjoy teasing, playful resistance, and challenge because of the anticipation and responsiveness they create.

This does not mean that everyone with those interests shares the same motivation.

It means personal meaning can reveal patterns that broad activity categories miss.

### Avoid Automatic Conclusions

Enjoying restraint does not prove an interest in submission.

Enjoying service does not prove an interest in domestic chores.

Enjoying intensity does not prove an interest in punishment.

Enjoying giving instructions does not prove an interest in controlling daily life.

People should be able to name their own associations, reject suggested ones, and leave some motivations unexplored.

## 10. Identity Can Be Useful Without Becoming a Constraint

Labels can help people find language for their interests and connect with others.

A person may feel understood when they discover a role that captures an experience they had difficulty describing.

But a label should help explain a person, not dictate what they must enjoy.

There is no requirement to identify as Dominant, submissive, switch, top, bottom, sadist, or masochist before enjoying an agreed kink activity.

And no label entitles someone to assume another person's consent.

People may also use labels differently across communities and relationships.

The most reliable source for the meaning of someone's role is that person's own explanation.

## Final Thoughts: Understand the Person, Not Just the Position

It is tempting to look at a kink and assign it a direction.

Tying looks Dominant. Being tied looks submissive. Giving sensation looks powerful. Receiving sensation looks vulnerable.

But those visual shortcuts can obscure the actual experience.

**What happens, who does it, who directs it, and why it feels meaningful are four separate questions.**

A submissive can enjoy tying their Dominant.

A Dominant can enjoy being tied.

Neither person needs to change identities for that to be true.

And people can explore the same activities without any Dominance or submission at all.

The most useful question is rarely "Which role does this kink belong to?"

It is: **"What does this experience mean to you?"**

---

### Continue Learning

- **Kink Without Dominance or Submission:** Activities that require no power-exchange roles.
- **Dominance & Submission:** What consensual authority means.
- **Bondage & Discipline:** Physical restraint versus agreed behavioral structure.
- **Negotiating a Scene:** Discussing activity, roles, and motivation separately.
- **Sadism & Masochism:** Separating sensation preferences from authority roles.
`,ni=`# Negotiating a Scene: Making Space for What Everyone Actually Wants

*A beginner's guide to discussing activities, roles, limits, safety, and the experience you want to create together.*

**Level:** Beginner  
**Estimated reading time:** 11 minutes  
**Topics:** BDSM Fundamentals · Scene Negotiation · Consent · Limits · Communication · Aftercare

**Content note:** This article discusses physical and psychological kink activities, boundaries, consent, and potential risks without graphic instructions.

---

## Introduction: Before the Scene, Have the Conversation

Two people can agree that they both want "a bondage scene" and still imagine entirely different experiences.

One might picture soft, comforting restraint and quiet attention. The other might imagine strict instructions and intense challenge.

Neither is necessarily wrong. But without further conversation, they may not be agreeing to the same thing.

**Scene negotiation** is the process of finding out what the participants actually want, what they do not want, and what conditions need to be met before an activity begins.

It can be a lengthy planning conversation, a written agreement, or a short check-in between experienced partners exploring familiar activities.

Negotiation is not about removing spontaneity. It is about defining the space where welcome spontaneity can happen.

And it belongs to *everyone* involved, not only the person being directed or receiving an activity.

## 1. What Is a Scene?

In BDSM, a **scene** is an intentionally framed period of kink activity or interaction.

It may involve physical activities, power exchange, sensation play, roleplay, rituals, or combinations of these. It can be sexual or nonsexual.

Some scenes have a detailed narrative and a planned ending. Others are simple and exploratory.

A scene can involve people with established relationship roles, people who do not identify as Dominant or submissive, or people meeting in an appropriate consenting-adult context.

The word "scene" describes the intentional activity, not a mandatory type of relationship.

### What Are You Trying to Experience?

Before listing equipment or techniques, it can help to ask:

- What about this idea appeals to each of us?
- Do we want it to feel playful, intimate, challenging, soothing, structured, or surprising?
- Are we interested in sensation, authority, attention, creativity, or something else?
- What would make the experience satisfying even if it is brief or changes course?

These answers often reveal more than activity labels.

A person asking to be tied might be seeking sensory containment, aesthetic expression, or the feeling of voluntarily yielding control. Those motivations call for different decisions even if the visible activity looks similar.

## 2. Begin With an Invitation, Not a Demand

Good negotiation starts with room for an authentic answer.

An invitation could sound like:

> "I've been curious about exploring some light restraint together. Is that something you'd want to talk about?"

This is different from assuming that a partner should participate because they have done something similar before, or because a relationship role supposedly requires it.

A person should be able to answer "no," "maybe another time," or "I like the idea but not that version."

Disagreement does not need to become persuasion.

If the interests do not align, the outcome may simply be that the scene does not happen.

### Negotiation Is Mutual

The person applying an activity has limits too.

A top might not feel competent with a particular activity. A Dominant might dislike a theme. Someone who usually submits might want to lead an element of the experience.

Each participant can state what they enjoy, what they are unwilling to do, and what they are capable of doing responsibly.

No one is obligated to perform a role simply because another person requests it.

## 3. Name the Activities Clearly

General categories are useful for discovering shared interests but often too broad for consent.

"Restraint," "discipline," "impact," and "humiliation" each describe a wide range of possible experiences.

Discuss the particular activities being considered, the kind of interaction expected, and what is excluded.

For example:

> "I like the idea of being asked to hold a position. I don't want physical restraint this time."

Or:

> "I'd enjoy applying a restraint, but I don't want to take on a Dominant role."

The second example matters: an activity role is not necessarily a power-exchange role.

### Separate the Different Layers

It can help to distinguish:

**Activity:** What will actually happen?

**Direction:** Who, if anyone, decides how the activity unfolds?

**Meaning:** What does each person enjoy about it?

**Limits:** Which actions, themes, sensations, or contexts are outside the agreement?

Someone may agree to a specific activity without agreeing to a change in relationship authority, sexual contact, or any other activity.

Consent is not transferable between categories.

## 4. Discuss Limits Without Turning Them Into Challenges

Some communities use **hard limit** for an activity or condition that is off the table, and **soft limit** for something a person might consider under specific circumstances.

The labels are optional. Clear language matters more.

A soft limit is not permission to proceed. It means a conversation may be possible.

A hard limit is not an invitation to test whether someone means it.

If a person says, "I do not want that," accept the boundary without requiring a defense.

### Boundaries Include More Than Actions

People may have limits involving:

- Certain physical sensations or body areas.
- Words, titles, or emotional themes.
- Sexual contact or nudity.
- Photography, recording, and sharing information.
- Who may watch or participate.
- Marks, bruising, or visible evidence afterward.
- Duration, setting, or privacy.
- Current emotional or physical capacity.

A person may enjoy an activity generally while excluding it on a particular day.

Past consent does not erase current limits.

## 5. Check Physical, Emotional, and Practical Conditions

Risk-informed consent requires an understanding of what could go wrong and whether participants have the preparation to reduce foreseeable risks.

Relevant considerations may include existing injuries, pain, sensory needs, mobility, fatigue, medications, allergies, or other health issues that affect the proposed activity.

No one owes another person unrestricted access to private medical details. They do, however, need enough relevant information to make an informed choice about participating. If important safety information cannot be shared, changing or postponing the activity may be appropriate.

### Skill and Risk Are Part of the Agreement

Wanting an activity does not establish competence to perform it.

Some practices involve risks of burns, nerve damage, circulation problems, tissue injury, psychological distress, or other harms that cannot be eliminated by a safeword.

Activities involving breath restriction or neck compression are especially dangerous and cannot be made reliably safe through simple precautions.

It is reasonable to say:

> "We both like the idea, but we aren't ready to try it."

Choosing a safer or nonphysical alternative can preserve what appealed to you without assuming the same risks.

### Check Capacity, Not Just Interest

People may want an activity but be too exhausted, intoxicated, distressed, or distracted to negotiate or participate safely.

If someone cannot give informed, voluntary consent or reliably communicate, postpone the scene.

Consent should not be obtained through pressure, threats, or emotional obligation.

## 6. Clarify Roles Without Assuming Them

Some scenes involve a Dominant and submissive. Many do not.

A scene could involve:

- A top performing a specific activity while a bottom receives it.
- Two peers collaborating without assigning authority.
- A Dominant following a submissive's suggestion while retaining agreed authority over other aspects of the dynamic.
- Partners switching who performs different activities without switching relationship roles.

Instead of asking only "Who's the Dom?", ask the more precise question:

**"Who is doing what, and who has agreed authority to decide what?"**

The answer might be "no one has special authority; we'll decide together."

That is a complete and valid answer.

## 7. Agree on Communication and Stop Signals

Before beginning, participants should know how to communicate:

- A request to continue.
- A need to slow down or check in.
- A decision to stop.
- An unexpected physical or emotional problem.

Many people use red, yellow, and green as traffic-light signals. Others use ordinary language.

If speech or movement might be limited, any nonverbal signal must be reliable and tested under the relevant conditions. If someone cannot communicate or signal reliably, stop the activity.

Safewords are available to all participants, including tops and Dominants.

And no one should wait for a special word when someone is clearly distressed or has withdrawn consent in another way.

**A safeword supports communication; it does not replace the obligation to notice and respect a boundary.**

## 8. Negotiate the Shape of the Scene

People sometimes plan only the interesting middle and forget the beginning and ending.

A useful scene plan also addresses the frame around the activities.

### Beginning

How will participants know the scene has begun?

Will there be a verbal check-in, a ritual, or simply a clear mutual agreement?

If established D/s roles exist outside the scene, which parts apply here?

### Pacing

Is the experience intended to be gentle, playful, or intense? How will participants assess whether the pace remains welcome?

What should happen when someone becomes tired, overwhelmed, or less interested?

### Surprises

Is any improvisation welcome?

If so, within exactly which previously agreed activities and limits?

Agreement to an unfamiliar new activity should not be presumed from enthusiasm for the current one. Significant changes should be discussed when everyone can make an informed choice, rather than pressured into the middle of an intense experience.

### Ending

Will there be a time boundary, a specific stopping point, or an open-ended plan with frequent check-ins?

Can anyone choose to end earlier? Always.

How will everyone know they are no longer in role?

## 9. Include Privacy and Other People

A scene may involve private information or affect people who are not participating.

Discuss whether the experience is private, who may be present, and whether photographs or recordings are allowed.

**Do not record or share images, details, or identifying information without specific permission.** Consent to participate in a scene does not include consent to distribute information about it.

A public or group setting introduces additional responsibilities: venue rules, the consent of people who may encounter the activity, and respect for other participants' boundaries.

For a private scene, consider whether the location offers appropriate privacy and how participants can leave or obtain assistance if necessary.

## 10. Plan Aftercare Before You Need It

**Aftercare** means the support participants may want after an intense or meaningful experience.

For some, that means water, food, warmth, quiet, or rest.

For others, it means affection, reassurance, space, conversation, or a check-in later.

A top or Dominant may want aftercare too.

One partner may want to cuddle while the other prefers a few minutes alone. Neither response is automatically less caring.

Ask what support feels useful rather than assuming.

If an activity could produce lingering physical symptoms or significant emotional distress, discuss what would trigger stopping and seeking appropriate medical or professional help.

## 11. A Simple Scene Negotiation Example

Consider two people who want to explore a nonsexual, low-intensity restraint-themed interaction.

Their initial idea is vague: "Let's try being tied up."

During negotiation, they discover that one person enjoys the feeling of being directed, while the other mainly likes creating a visually interesting arrangement.

They decide that they do not need actual restrictive ties to explore their shared interests.

Instead, they agree on an activity involving comfortable, voluntary positioning, with the participant free to move at any point.

They agree that there will be no sexual contact, no added pressure, and no surprise activities.

Both may say "stop" in ordinary language. They will check in regularly and conclude with a brief conversation.

The resulting activity looks different from the original suggestion, but it may be a better match.

**Successful negotiation does not always produce the scene someone first imagined. It produces an agreement everyone actually wants.**

## 12. A Practical Pre-Scene Checklist

Use these as conversation prompts, not as a substitute for training or professional guidance.

- **Intent:** What are we curious about, and what feeling are we seeking?
- **Activities:** What exactly is included? What is excluded?
- **Roles:** Who performs each activity? Is any authority being exchanged?
- **Boundaries:** Which actions, body areas, words, themes, and contexts are off-limits?
- **Risks:** What do we know about the activity's hazards and our competence?
- **Capacity:** Are we physically, mentally, and practically able to proceed today?
- **Signals:** How can anyone ask to slow down, pause, or stop?
- **Privacy:** What happens with photos, information, spectators, and shared spaces?
- **Ending:** How will we transition out of the scene?
- **Aftercare:** What might each person want immediately and later?

An unanswered question can be a reason to simplify the activity or wait.

## 13. Negotiation Continues During and After Play

Negotiation is not a one-time document that overrides someone's later feelings.

Check in during the experience. Adjust or stop when necessary.

Afterward, reflect when everyone feels ready.

What felt good? Was anything unexpectedly difficult? Did the activity match the anticipated emotional tone? Were all agreements respected? What should change?

You can enjoy an activity and still decide not to repeat it.

You can also discover an unexpected interest without having to act on it immediately.

A scene that ends early is not necessarily unsuccessful; sometimes the most important outcome is learning something useful about yourself or your partner.

## Final Thoughts: Negotiation Is Part of the Experience

Scene negotiation is sometimes described as paperwork before the fun begins.

But for many people, sharing preferences and being understood is part of what makes the experience meaningful.

It creates room to say what you want without being required to want everything.

It gives participants permission to be precise, curious, and uncertain.

And it makes a powerful distinction between an assumption and an agreement.

**The purpose of negotiation is not to make someone comfortable with your plan. It is to create a plan that everyone can freely choose.**

---

### Continue Learning

- **Safewords:** Communicating the need to pause or stop.
- **Kinks Are Not Roles:** Separating activities, authority, and motivation.
- **Kink Without Dominance or Submission:** Exploring activities without an authority exchange.
- **Bondage & Discipline:** Understanding physical restraint and behavioral structure.
- **Aftercare & Recovery:** Supporting each person's needs after a scene.

### Further Reading

- [National Coalition for Sexual Freedom — Consent Counts and Negotiation Resources](https://ncsfreedom.org/key-programs-2/consent-counts/)
- [TASHRA — Negotiation, Agency, and Consent](https://www.tashra.org/what-may-lead-to-healing/)
`,ti=`# Sadism & Masochism: Understanding the S and M of BDSM

*Exploring sensation, intensity, pleasure, vulnerability, and the many ways people experience consensual pain.*

**Level:** Beginner  
**Estimated reading time:** 10 minutes  
**Topics:** BDSM Fundamentals · Sadism · Masochism · Sensation Play · Consent · Risk Awareness

**Content note:** This article discusses consensual pain, physical and psychological intensity, humiliation, and potential injury. It does not contain graphic descriptions or technical instructions.

---

## Introduction: When Pain Means Something Different

Pain is usually something people try to avoid.

It warns us about potential danger, encourages us to protect ourselves, and draws our attention toward experiences that may be harmful.

So why would someone voluntarily seek it out?

And why might another person enjoy being the one to provide it?

Within BDSM, the **S** stands for **Sadism**, and the **M** stands for **Masochism**.

Together, these concepts describe interests in giving, receiving, or experiencing pain, discomfort, and certain forms of psychological intensity.

But reducing Sadism and Masochism to simply *liking to hurt* or *liking to be hurt* misses much of their complexity.

For some people, the appeal is primarily physical. They enjoy particular sensations, contrasts, or forms of stimulation.

For others, the experience is psychological. Anticipation, vulnerability, endurance, challenge, or the emotional significance of an interaction may matter more than the sensation itself.

Some experience these interests sexually. Others enjoy them without sexual motivation.

And a person may enjoy one particular form of intensity while having absolutely no interest in another.

**Sadism and Masochism are not defined by how much pain someone can inflict or endure. They describe particular relationships to experiences of sensation and suffering, within which motivation and consent matter enormously.**

## 1. Sadism: The Experience of Giving Intensity

Within consensual BDSM, Sadism generally describes finding pleasure, satisfaction, or other personally meaningful enjoyment in causing a willing participant pain, discomfort, or psychological intensity.

That definition can sound unsettling when separated from consent and context.

But consensual Sadism is not synonymous with cruelty, abuse, or a desire to harm unwilling people.

A sadistic interest might involve enjoying a partner's reactions to an agreed sensation.

It might involve the anticipation created by a carefully negotiated experience.

Or it might involve the emotional satisfaction of guiding another person through an intensity they actively want to explore.

### Different Expressions of Sadism

**Sensation-Oriented Sadism**

The person enjoys producing particular physical sensations and observing how a willing partner experiences them.

Their interest may focus on responsiveness, contrast, or the experience itself rather than on causing increasingly intense pain.

**Reaction-Oriented Sadism**

The participant finds satisfaction in a partner's authentic responses.

Sounds, expressions, movement, anticipation, and feedback may form part of the appeal.

The meaningful part may be seeing how another person responds, rather than the amount of pain involved.

**Psychological Sadism**

Some people enjoy consensually creating experiences of embarrassment, frustration, uncertainty, vulnerability, or other emotional intensity.

These experiences require particularly careful negotiation because emotional boundaries can be less visible than physical ones.

**Challenge-Oriented Sadism**

The person enjoys establishing a consensual challenge and witnessing a partner engage with it.

The appeal may involve effort, perseverance, anticipation, and mutual accomplishment.

**Playful Sadism**

Intensity may be delivered through teasing, mischief, surprise within negotiated boundaries, or deliberately provoking entertaining reactions.

Not every sadistic interaction needs to be solemn or severe.

These categories are descriptive rather than fixed identities. Someone may enjoy several of them, or only one.

### Why Do People Enjoy Sadism?

There is no single psychological explanation.

Some people enjoy the focused attention required to understand another person's reactions.

Others enjoy the experience of creating something intense but wanted.

For some, Sadism overlaps with Dominance: providing a sensation is meaningful partly because it expresses negotiated authority.

For others, authority is irrelevant.

They may enjoy sensation play collaboratively, without occupying a Dominant role.

A person can also be interested in Sadism without enjoying every form of pain play.

Someone who appreciates one particular sensation may strongly dislike another.

**A sadistic interest does not establish someone's capacity for empathy, trustworthiness, or approach to relationships. Their actual behavior toward others is what matters.**

## 2. Masochism: The Experience of Receiving Intensity

Masochism describes finding pleasure, satisfaction, or other meaningful enjoyment in experiencing pain, discomfort, or certain forms of psychological suffering.

But an interest in masochism does not mean enjoying all pain.

Consider how differently a person might experience an unexpected injury, a demanding physical workout, a deep massage, and a previously negotiated intense sensation.

Although some of these experiences may involve overlapping physical sensations, their contexts and meanings are different.

Expectation, control, emotional state, personal preference, and the ability to stop can all influence how an experience feels.

### Different Expressions of Masochism

**Sensory Masochism**

The person enjoys particular physical sensations, including some that others might consider painful or uncomfortable.

They may find certain kinds of intensity stimulating, focusing, or pleasurable.

**Endurance-Oriented Masochism**

The appeal involves willingly experiencing and responding to a challenge.

The person may enjoy anticipation, effort, determination, or the satisfaction of completing something they chose.

This does not mean that enduring greater pain is inherently more successful.

**Psychological Masochism**

Certain forms of consensual embarrassment, frustration, vulnerability, or emotional exposure may be meaningful.

The experience may depend heavily on the relationship, negotiated boundaries, and the emotional context.

**Submission-Connected Masochism**

For some, receiving pain or intensity has significance because it is given by a person whose authority they have agreed to recognize.

The sensation and the power exchange become connected.

**Playful Masochism**

Some people enjoy brief, teasing, or mischievous expressions of discomfort as part of a lighthearted interaction.

The appeal may involve laughter, reactions, attention, or playful resistance.

### Why Do People Enjoy Masochism?

For some people, certain painful sensations are pleasurable in their own right.

For others, the experience creates a heightened sense of bodily awareness or focused attention.

Someone might appreciate the feeling of being challenged.

Another might find satisfaction in the vulnerability of trusting someone with a carefully negotiated experience.

And someone else might enjoy anticipation more than the sensation that follows.

These motivations can overlap, but none is required.

It is also important not to assume that someone who enjoys masochism wants to be injured, mistreated, or emotionally harmed.

**Enjoying a chosen sensation does not mean wanting unwanted suffering.**

## 3. Pain, Sensation, and Intensity Are Not Interchangeable

One of the most important distinctions in understanding S/M is that pain is only one part of a much broader sensory experience.

People perceive physical sensations differently.

An experience that one person describes as pleasantly intense may be painful or overwhelming to another.

Even the same person may respond differently depending on their physical condition, emotional state, expectations, and environment.

### Sensation Without Pain

Not every intense sensory experience is painful.

Pressure, texture, vibration, temperature contrast, and other forms of stimulation can produce strong physical experiences without necessarily being perceived as pain.

Someone may enjoy these sensations but dislike pain play entirely.

### Pain Without Masochism

Experiencing pain does not automatically mean someone is masochistic.

A person might agree to an activity involving discomfort because they enjoy the associated power exchange, ritual, challenge, or emotional experience.

They may appreciate the overall interaction while disliking the painful sensation itself.

### Masochism Without Extreme Pain

Likewise, someone who identifies as masochistic may prefer mild sensations or highly specific experiences.

There is no minimum intensity required to qualify.

A preference for lighter sensations is not an incomplete form of masochism.

And stronger intensity is not inherently more authentic.

### Pain Is Not the Same as Injury

Pain is a subjective experience. Injury involves harm to bodily tissues or function.

An activity can cause injury without immediately producing severe pain, and pain can occur without serious injury.

Neither the absence of pain nor the presence of consent guarantees physical safety.

This is why risk awareness must involve more than asking whether a sensation feels tolerable.

## 4. Why Sadism and Masochism Are Often Explored Together

Sadism and Masochism are frequently discussed together because their interests can complement one another.

One person may enjoy providing an agreed sensation.

Another may enjoy receiving it.

The resulting interaction can satisfy different motivations for each participant.

But this compatibility is not automatic.

Someone who enjoys giving intense sensations may not enjoy receiving them.

Someone who enjoys receiving pain may have no desire to provide it.

And two people may both be interested in S/M while preferring entirely different activities.

### The Importance of Compatibility

Imagine that one person primarily enjoys the reactions associated with intense physical sensations.

Their partner, meanwhile, enjoys the psychological experience of endurance but dislikes the particular sensations the first person prefers.

Both might identify with S/M, yet their interests do not necessarily align.

Compatibility involves more than shared labels.

Participants need to understand which activities, sensations, emotional experiences, and degrees of intensity are actually desirable.

### What About Switching?

Some people enjoy both sadistic and masochistic experiences.

The term *sadomasochist* may describe someone interested in both, while *switch* can describe someone who changes between Dominant and submissive roles or sometimes between other complementary activity roles, depending on their own usage.

These terms are not exact synonyms.

A person can enjoy both giving and receiving pain without wanting to switch between Dominance and Submission.

The activities and the authority structure remain separate dimensions.

## 5. Sadism Is Not Dominance, and Masochism Is Not Submission

This distinction is essential.

Although S/M and D/s frequently appear together, they describe different experiences.

**Sadism and Masochism concern a person's relationship to giving or receiving pain and psychological intensity.**

**Dominance and Submission concern a person's relationship to consensually exchanged authority.**

A Dominant might enjoy inflicting pain, but may also have no interest in doing so.

A submissive might enjoy receiving pain, but may also strongly dislike it.

And a person can enjoy sadistic or masochistic activities in an interaction that has no power exchange at all.

### Four Different Experiences

Consider these examples:

**A Dominant who is not sadistic**

They enjoy directing their partner, establishing rituals, and receiving obedience, but prefer affectionate or low-intensity physical interactions.

**A submissive who is not masochistic**

They enjoy surrendering decisions and following instructions but dislike painful sensations.

**A sadist who is not Dominant**

They enjoy giving consensual intense sensations within a collaborative interaction where neither participant has authority over the other.

**A masochist who is not submissive**

They enjoy receiving particular sensations while retaining control over how the experience is organized.

All four are valid possibilities.

Understanding these distinctions prevents assumptions about what someone must enjoy because of a particular identity.

## 6. The Psychology of Anticipation and Response

For some people, the most interesting part of S/M happens before or around the sensation itself.

Anticipation may create excitement, tension, curiosity, or heightened attention.

A person might become intensely focused on what they expect to experience.

Another might enjoy witnessing that anticipation and responding to it.

The resulting interaction can feel psychologically significant even when the physical sensation is relatively mild.

### Attention and Presence

Some participants describe intense sensory experiences as absorbing their attention.

Others find that carefully chosen sensations create an opportunity to focus on their bodies or immediate surroundings.

But intense sensations can also trigger panic, distress, dissociation, or overwhelming reactions.

It is important not to assume that intensity is universally grounding or psychologically beneficial.

### Trust and Vulnerability

For some, allowing another person to provide a wanted but challenging sensation creates a meaningful experience of vulnerability.

The partner providing it may feel a corresponding responsibility to monitor the experience and respect established limits.

The appeal can involve being known well enough for the interaction to remain personally meaningful.

But trust does not make an activity physically safe by itself.

And emotional intimacy should never be used as pressure to accept greater intensity.

### Emotional Meaning

Two people can experience the same outward activity differently.

One may find it playful.

Another may find it intimate.

Another may experience it as a challenge.

And another may simply enjoy its physical characteristics.

There is no requirement for pain play to have a particular emotional meaning.

## 7. Consent, Negotiation, and Risk Awareness

All consensual BDSM practices require attention to boundaries, but activities involving pain or intense sensation bring additional risks.

These may include tissue injury, nerve damage, burns, bruising, infection, psychological distress, and other complications depending on the activity.

No particular technique is completely risk-free.

### Negotiate More Than an Activity Name

Agreeing to "pain play" is not sufficiently specific.

Participants should discuss:

- Which sensations or activities are wanted.
- Which are unwanted or prohibited.
- Whether there are relevant health conditions, injuries, medications, or accessibility considerations.
- Whether particular body areas are excluded.
- What forms of emotional or psychological intensity are acceptable.
- How to communicate discomfort, uncertainty, or the need to stop.
- What will happen if a participant becomes overwhelmed.
- What support may be needed afterward.

People sometimes distinguish between *hard limits*, which are not to be crossed, and *soft limits*, which may be conditional or open to discussion.

These terms can be helpful, but a soft limit is never permission to proceed without agreement.

### Safewords and Stop Signals

A safeword is an agreed signal indicating that an activity must stop or change.

Some participants use a traffic-light system:

- **Green:** Comfortable continuing.
- **Yellow:** Slow down, pause, or check in.
- **Red:** Stop the activity.

People may also establish nonverbal signals when speaking could be difficult.

But a safeword is not a substitute for attentiveness.

If someone appears confused, unresponsive, unusually distressed, or unable to communicate meaningfully, the activity should stop even if no safeword has been used.

### Pain Tolerance Is Not a Safety Measure

A person's ability to tolerate pain does not establish how much physical risk an activity carries.

Some injuries develop without immediate warning.

A person may also underestimate discomfort because they are distracted, excited, or focused on completing a challenge.

Increasing intensity should never be treated as the default goal.

And ignoring a partner's pain, distress, hesitation, or changed boundaries is not evidence of skilled Sadism.

### Higher-Risk Practices Require Special Caution

Activities involving the neck, breathing, circulation, electrical exposure, significant impact, or potentially damaging temperatures can cause serious injury.

In particular, restricting breathing or compressing the neck can cause catastrophic injury or death, sometimes without obvious external warning signs. These are not appropriate beginner activities, and there is no reliably safe technique for strangulation.

Avoid exploring unfamiliar activities through improvisation or assumptions that a willing partner makes them safe.

Detailed safety education from qualified sources should precede consideration of any activity with substantial physical risks.

## 8. Psychological Intensity Requires Its Own Boundaries

Some S/M interests involve emotional experiences rather than physical pain.

These might include consensual embarrassment, humiliation, frustration, fear-themed roleplay, or other challenging psychological experiences.

Such activities can have substantial emotional effects even without physical contact.

### Intent and Impact May Differ

An interaction that one participant understands as playful may feel deeply personal to another.

A comment intended as theatrical humiliation may unexpectedly touch a genuine insecurity.

A challenge intended to create excitement may instead cause anxiety.

This is why emotional limits deserve the same seriousness as physical ones.

Participants should discuss sensitive subjects, prohibited language, expected responses, and ways to stop without embarrassment or punishment.

### Emotional Safety Is Not Guaranteed by Trust

Knowing a person well can help with communication, but it does not eliminate misunderstanding.

Nor should anyone assume that deliberately triggering trauma will produce healing.

BDSM activities are not a substitute for mental health treatment.

Some individuals may find particular experiences meaningful or cathartic, but those responses should not be generalized or promised.

The ability to stop, seek reassurance, or change an agreement must remain available.

## 9. Aftercare, Recovery, and Reflection

Aftercare refers to the support participants may want following an intense experience.

Needs vary considerably.

For some, aftercare involves physical comfort and rest.

Others appreciate quiet conversation, reassurance, affectionate contact, food, water, or time alone.

People providing intense sensations may also have emotional needs after an experience.

### Physical Recovery

Depending on the activities involved, participants should pay attention to pain, swelling, skin changes, numbness, weakness, dizziness, or other concerning symptoms.

Significant, persistent, or worsening symptoms warrant medical evaluation. Severe symptoms may require urgent care.

Pain that continues after an experience should not automatically be treated as a normal or desirable outcome.

### Emotional Recovery

Some people experience temporary emotional changes after intense BDSM scenes, sometimes described informally as *drop*.

These experiences vary and are not inevitable.

Someone may feel tired, vulnerable, irritable, emotional, or simply ready to return to ordinary activities.

Partners can benefit from discussing what support feels useful rather than assuming everyone needs the same kind of aftercare.

### Reflection

A later conversation can help answer questions such as:

- Which parts of the experience felt enjoyable?
- Did anything feel unexpectedly uncomfortable?
- Did the intensity match our expectations?
- Were boundaries respected?
- Did we notice any signs of physical or emotional distress?
- What should change next time?

Reflection can be particularly valuable when an experience initially felt enjoyable but becomes more complicated after some distance.

## 10. What Sadism and Masochism Do Not Mean

Sadistic or masochistic interests are sometimes misunderstood as evidence of a psychological disorder.

But consensual atypical sexual interests are not, by themselves, mental illnesses.

Clinical distinctions involve considerations such as significant personal distress, impairment, nonconsenting participants, and harm. Interest in consensual S/M does not automatically meet those criteria.

Likewise, consensual masochism should not automatically be equated with self-harm, and consensual Sadism should not automatically be equated with abuse.

The motivations, circumstances, risks, consent, and effects matter.

However, describing an activity as BDSM does not exempt it from scrutiny.

Consent does not make serious injury harmless or automatically legal.

And neither a sadistic nor a masochistic identity justifies violating another person's boundaries.

A person who enjoys Sadism is still responsible for respecting consent.

A person who enjoys Masochism is still entitled to physical safety, autonomy, and care.

There is no requirement to experience pain in order to participate meaningfully in BDSM.

## 11. Exploring Your Own Interests

You do not need to identify as a sadist or masochist to be curious about sensation play.

Begin by considering what actually interests you.

### If You're Curious About Sadism

Ask yourself:

- Am I interested in creating sensations, or in witnessing someone respond to them?
- Do I enjoy anticipation, reactions, challenge, or psychological intensity?
- Does my interest depend on a particular relationship or partner?
- Would I enjoy giving sensations without having a Dominant role?
- Which responses feel rewarding, and which make me uncomfortable?
- Am I interested in mild, specific experiences rather than pain generally?

### If You're Curious About Masochism

Consider:

- Do I enjoy certain physical sensations, or the circumstances surrounding them?
- Am I drawn toward pain, pressure, endurance, anticipation, or vulnerability?
- Does the identity of the person providing the sensation change its meaning?
- Do I want an intense experience, or do I want to feel guided through an experience?
- Which sensations are enjoyable, tolerable, unpleasant, or completely unwanted?
- Would I enjoy these sensations without submission or power exchange?

### If You're Interested in Both

You might enjoy giving and receiving different sensations.

Your preferences may depend on the activity, partner, emotional state, or context.

Someone could enjoy providing one form of sensation while preferring an entirely different form when receiving.

There is no requirement for symmetry.

Likewise, an interest may remain a fantasy without becoming something you want to experience physically.

Fantasy and real-world participation are different preferences, and neither obligates the other.

## 12. Intensity Is Not Achievement

BDSM is sometimes portrayed as a progression toward increasingly extreme experiences.

But there is no universal ladder of accomplishment.

Someone who enjoys mild sensations is not less experienced in the meaning of their own preferences.

Someone who dislikes pain can still enjoy numerous other aspects of BDSM.

Someone who changes their mind about an activity has not failed.

And stopping because an experience no longer feels right is not weakness.

Consent, communication, self-awareness, and respect matter more than intensity.

**There is no prize for enduring more pain than you actually want, and no virtue in causing more than another person has agreed to receive.**

## Final Thoughts: The Meaning Behind the Sensation

Sadism and Masochism invite us to reconsider the relationship between physical sensation, emotional meaning, and personal choice.

For some people, certain painful sensations are pleasurable.

For others, the appeal comes from anticipation, challenge, trust, vulnerability, or the experience of being deeply understood.

Some enjoy giving intensity.

Others enjoy receiving it.

Some enjoy both, while many have no interest in either.

None of these preferences determines someone's capacity for care, their relationship role, or their personal worth.

What matters is understanding the difference between a wanted experience and an unwanted one, acknowledging real risks, and respecting the people involved.

The purpose is not to transform suffering into an obligation.

It is to understand why an experience that appears unpleasant from the outside may hold an entirely different meaning for the people who freely choose it.

**The defining feature of consensual Sadism and Masochism is not how much pain is involved. It is the informed, ongoing choice to explore particular sensations and experiences together, without treating consent as a guarantee of safety.**

---

### Continue Learning

- **Bondage & Discipline: Understanding the B and D of BDSM:** Physical restriction, rules, and accountability.
- **Dominance & Submission: Understanding the D and S of BDSM:** Consensual authority and chosen surrender.
- **BDSM Consent & Negotiation:** Establishing informed agreements and boundaries.
- **Understanding Sensation Play:** Exploring the differences between pressure, texture, temperature, and pain.
- **Introduction to Impact Play:** Activity-specific risk awareness and education.
- **Psychological Play & Emotional Safety:** Negotiating experiences involving vulnerability, embarrassment, and emotional intensity.
- **Aftercare & Recovery:** Supporting physical and emotional well-being after intense experiences.
- **Top, Bottom, Dominant, Submissive & Switch:** Understanding the difference between activity roles and authority.
`,ii=`# Safewords: How to Pause, Stop, and Stay Connected During BDSM Play

*Understanding clear stop signals, nonverbal communication, and why consent continues after a scene begins.*

**Level:** Beginner  
**Estimated reading time:** 9 minutes  
**Topics:** BDSM Fundamentals · Safewords · Consent · Communication · Scene Safety

**Content note:** This article discusses consent, distress, nonverbal communication, restraint, and emotionally intense roleplay. It does not provide instructions for dangerous activities.

---

## Introduction: A Word That Changes the Conversation

Imagine two people have agreed to a scene involving playful resistance. One person is supposed to protest in character; the other is supposed to continue the fictional interaction within negotiated limits.

How can they tell the difference between a dramatic "no" inside the roleplay and a real request to stop?

One answer is a **safeword**: an agreed word or signal that communicates a need to pause, change, or end an activity without ambiguity.

Safewords are common in BDSM, but they are often misunderstood. They are not permission to disregard ordinary signs of distress. They do not make dangerous activities safe. And they are not something only a submissive or bottom gets to use.

A safeword is one communication tool within a larger agreement.

The most important idea comes first: **anyone can withdraw consent at any time, whether or not they use the designated safeword.**

## 1. What Is a Safeword?

A safeword is a prearranged signal with a clearly agreed meaning during an activity or scene.

It can be a spoken word, phrase, gesture, or other signal. Unlike dialogue that might be part of a roleplay, a safeword communicates outside the fiction.

Participants commonly agree on a way to say:

- **Stop now:** End the activity immediately.
- **Pause or check in:** Interrupt the flow, reduce intensity, or clarify what is happening.
- **Continue:** Confirm that the experience remains welcome within the previously agreed boundaries.

Not every scene needs an elaborate system. If participants are using ordinary conversation and every "stop" is plainly understood as stop, regular words may be sufficient.

Safewords become especially useful when a scene includes fictional protests, scripted dialogue, or conditions where communication might otherwise be unclear.

### A Safeword Is Not a Waiver

Agreeing that "red" means stop does not mean every other statement or reaction should be ignored.

If someone says "I changed my mind," "I need to leave," or "that hurts in a bad way," those statements deserve an immediate response even if the person did not say "red."

If someone appears panicked, disoriented, unresponsive, or unable to communicate, stop and check on them.

**Consent cannot depend on performing one particular word correctly.**

## 2. The Traffic-Light System

One widely used approach is to agree on three color signals.

### Green: Continue Within the Agreement

"Green" usually means that the person is comfortable continuing.

It does **not** automatically mean "increase the intensity" or "introduce something new." Those changes require their own agreement.

A check-in could sound like:

> "Color?"  
> "Green. This pace is good."

### Yellow: Something Needs Attention

"Yellow" usually means pause, slow down, adjust, or check in.

A participant might use yellow because an activity is becoming too intense, they need a different position, they feel emotionally uncertain, or they simply want a moment.

The next step should match what that participant needs. Do not assume yellow means permission to keep going at the same pace.

### Red: Stop

"Red" means the agreed activity stops immediately.

The person directing an action should stop, release or remove any safely releasable equipment as appropriate, and check for urgent physical or emotional needs.

There is no requirement to justify using red. Questions about what happened can wait until the person is ready to talk.

### Agree on Meanings Beforehand

These color conventions are common but not universal. Some partners use "yellow" to mean a full pause, and others use different words.

What matters is having a shared understanding, not adopting a particular vocabulary.

If you are playing with someone new, **never assume** that you already use the same signals.

## 3. Anyone Can Use a Safeword

Safewords are sometimes discussed as though they exist exclusively for the person receiving sensation or following instructions.

That misses half the interaction.

A top, Dominant, person applying restraint, or person giving direction can also become overwhelmed, experience pain, discover an equipment issue, or decide they no longer want to continue.

The person leading a scene does not have to perform confidence at the expense of their own boundaries.

A Dominant saying "red" is not losing authority.

A submissive saying "red" is not failing to submit.

A top stopping a scene without being asked is not spoiling it.

**Stopping appropriately is a skill shared by everyone involved.**

## 4. What if Someone Cannot Speak?

Verbal safewords only work when the person can speak and be heard.

There may be circumstances where someone cannot easily speak because of a disability, sensory overload, a change in emotional state, or other barriers. Activities that obstruct breathing or speaking present additional serious risks and should not be treated as beginner practices.

A nonverbal safety signal can be part of a negotiated communication plan.

Examples include a predetermined number of taps, an agreed hand gesture, or releasing a held object.

But a signal is useful only if it is **possible, visible or detectable, and reliably understood**.

Before beginning, participants should confirm that each person can perform the signal under the actual conditions of the scene, including any limitations on movement.

If a person loses the ability to signal reliably, the activity should stop. Do not substitute guesswork for communication.

### Check-Ins Still Matter

Someone may be physically capable of using a safeword but too overwhelmed, confused, frightened, or dissociated to do so promptly.

Participants should pay attention to unusual silence, changes in responsiveness, sudden stillness, panic, and other concerning signs.

A direct, ordinary-language check-in is appropriate when something seems wrong.

Never make another person solely responsible for recognizing every emerging risk while they are under stress.

## 5. Safewords and Consensual Resistance

Some forms of roleplay intentionally include teasing, protest, playful refusal, or simulated struggle.

This is where clear boundaries are particularly important.

Participants must negotiate the *specific nature and scope* of the fictional resistance before the scene.

They should agree on which behaviors are part of the fiction, which remain ordinary stop requests, and how anyone can instantly step out of character.

For example, two adults might agree that theatrical complaints are part of a scene, but "red" immediately ends it and "I need to talk normally" pauses the roleplay.

Even with that agreement, obvious distress or uncertainty warrants stopping.

A scene involving simulated non-consent is not permission for actual non-consent. These scenarios carry heightened risks of misunderstanding and are not suitable substitutes for learning basic communication.

### Outside the Roleplay, "No" Is Still No

You should not assume a person's refusal is playful because they have enjoyed resistance in the past.

A negotiated exception applies only to its clearly defined context. Outside that context, ordinary language and boundaries retain their ordinary meaning.

## 6. What Happens When Someone Uses a Safeword?

How people respond to a safeword matters at least as much as which word they choose.

### When Someone Says Red

First, stop the agreed activity immediately.

Then address any immediate safety issue, help the person regain comfortable freedom of movement where appropriate, and ask what support they need.

Do not demand an explanation in the moment.

Do not retaliate, tease them for stopping, or make them feel responsible for someone's disappointment.

The scene may end for the day. Resuming should require a fresh, unpressured agreement, not a presumption that a short pause restores previous consent.

### When Someone Says Yellow

Pause or adjust in the way that was agreed.

Ask a specific question if useful: "Do you need less intensity, a break, or for us to stop?"

Treat an uncertain answer as a reason to slow down or end the activity, not as a challenge to persuade someone to continue.

### What if You Hear No Safeword but Something Seems Wrong?

Stop anyway.

A safeword is a backup communication channel, not the sole trigger for care.

## 7. Common Misconceptions

### "If They Didn't Safeword, They Consented"

Not necessarily.

Silence, immobility, uncertainty, or delayed reactions do not prove continuing agreement.

Consent is ongoing and may be withdrawn through ordinary language, behavior, or loss of capacity.

### "A Good Submissive Doesn't Need to Use It"

False.

Safewording says nothing about a person's commitment, obedience, or capability.

A culture that shames people for stopping makes honest communication harder.

### "A Skilled Dominant Can Always Tell"

No one can reliably infer every physical and emotional boundary.

Attentiveness matters, but it works **with** explicit communication, not instead of it.

### "Safewords Make Risky Activities Safe"

They do not.

Some injuries can occur rapidly or without enough warning for someone to signal. Safewords cannot eliminate physical risks, especially in activities involving circulation, nerve compression, breathing, or the neck.

Consent and risk education are separate requirements.

### "We Don't Need to Talk Because We've Been Together for Years"

Familiarity helps, but preferences and capacity change.

A short check-in about today's boundaries is still valuable.

## 8. Practicing the Stop System Before Play

You can establish a communication system without doing any intense activity.

Talk through a hypothetical scene and decide which phrases mean continue, slow down, and stop.

Say the agreed words aloud. Confirm that all participants can recognize and respond to them.

Then practice ending the hypothetical scenario. Notice whether anyone feels awkward or pressured to explain.

If stopping feels difficult during a low-stakes conversation, that is valuable information to address before attempting something more demanding.

You might also agree on a neutral phrase such as "out of scene" to temporarily leave a role or dynamic and speak as ordinary equals.

The goal is not to make the system theatrical. It is to make it accessible when it matters.

## 9. After a Safeword: Repair and Reflection

A safeword may be used because something went wrong, but it can also mean someone noticed an ordinary limit before a problem developed.

After everyone is comfortable, participants may want to discuss:

- What prompted the stop or pause?
- Was the signal recognized and honored immediately?
- Did the person who stopped feel supported?
- Does anything need to change before future play?
- Should an activity be removed from the agreed menu entirely?

These conversations are opportunities to learn, not interrogations.

If a person does not want to describe their reasons, respect that choice.

The success of a scene is not measured by whether everyone reached a planned ending.

A scene in which someone used a stop signal and was promptly respected can demonstrate that the communication agreement worked.

## Final Thoughts: Safety Signals Preserve Choice

Safewords are often described as the thing that makes surrender possible. They can help, especially when a scene intentionally blurs ordinary dialogue and fictional dialogue.

But a safeword is not magic. It cannot replace negotiation, attention, empathy, technical competence, or a meaningful ability to leave.

The real foundation is simpler: every participant has the right to change their mind.

**A safeword does not grant the right to stop. It makes a right that already exists easier to communicate.**

---

### Continue Learning

- **Negotiating a Scene:** Agreeing on activities, boundaries, communication, and aftercare.
- **Dominance & Submission:** Understanding consensual authority without surrendering autonomy.
- **Bondage & Discipline:** The distinction between restraint and behavioral structure.
- **Aftercare & Recovery:** Supporting participants after a scene.

### Further Reading

- [National Coalition for Sexual Freedom — Consent Counts](https://ncsfreedom.org/key-programs-2/consent-counts/)
- [TASHRA — Nonverbal Communication and Consent](https://www.tashra.org/event/nonverbal-communication-and-consent/)
`,ai=`# Total Power Exchange: Understanding TPE Relationships

*Exploring ongoing authority, chosen surrender, responsibility, and the difference between a relationship structure and unrestricted control.*

**Level:** Beginner–Intermediate  
**Estimated reading time:** 12 minutes  
**Topics:** BDSM Fundamentals · Total Power Exchange · 24/7 D/s · Authority Transfer · Consent · Relationship Structures

**Content note:** This article discusses ongoing power exchange, authority over daily decisions, relationship vulnerability, coercion, financial control, and emotional safety. It is educational, not legal or mental health advice.

---

## Introduction: What Does "Total" Really Mean?

Imagine a relationship in which one partner does not merely take the lead during a scene.

Their authority is part of everyday life.

They might guide routines, establish protocols, make agreed decisions about schedules or presentation, and remain in that leadership role when no kink activity is happening.

The other partner may experience this structure as devotion, belonging, clarity, trust, or relief from certain responsibilities.

This is one of the experiences people may be describing when they talk about **Total Power Exchange**, or **TPE**.

But the word *total* raises immediate questions.

Does it mean one partner has no rights? That they can never disagree? That every decision is made by someone else? That consent only matters when the relationship begins?

**No relationship title can make another adult's consent irrevocable or erase their basic rights.**

TPE is best approached by asking what authority the partners have actually agreed to exchange, how it functions in daily life, and what makes the arrangement voluntary and sustainable.

## 1. What Is Total Power Exchange?

Total Power Exchange describes a form of consensual authority-transfer relationship in which one person takes a broadly authoritative role and another voluntarily accepts that authority across significant aspects of their shared life.

Many TPE dynamics are ongoing rather than limited to particular scenes. Partners may describe them as **24/7** because their roles remain part of the relationship even while working, resting, or doing ordinary household tasks.

But TPE does not have one universally agreed definition.

Some communities use TPE for exceptionally broad, enduring authority arrangements; others reserve the term for an ideal of near-absolute authority, often associated with Master/slave relationships. Some people reject the label entirely even though their relationship includes substantial ongoing power exchange.

That difference in language is worth respecting. A couple's chosen label does not tell you the full scope of their agreement.

### What Is Actually Exchanged?

The thing being exchanged is usually described as **authority**: who gets to direct or decide certain matters.

Partners may also talk about control, ownership, obedience, leadership, or surrender. These words can express powerful emotional meanings, but they do not independently define anyone's legal status or eliminate the need for consent.

One partner might be entrusted with choosing a daily routine. Another couple might negotiate a much wider set of decisions.

Two relationships can both use the term TPE while having very different rules.

**The relationship's actual agreements matter more than how dramatic the label sounds.**

## 2. TPE, 24/7 D/s, and Master/slave: Related but Not Identical

These terms often overlap, so it helps to separate the ideas.

**Scene-based D/s** involves authority within a specific experience or time frame. The participants intentionally enter that structure and leave it when the scene ends.

**24/7 D/s** means the agreed authority relationship is ongoing rather than switched on only for scenes. It might still apply to a fairly narrow set of matters, such as rituals, forms of address, or recurring responsibilities.

**TPE** commonly emphasizes the *breadth or depth* of transferred authority. The partners may understand leadership and surrender as organizing principles across many parts of their lives.

**Master/slave (M/s)** describes a role or identity structure that may be used in TPE, though not every M/s relationship uses that label and not everyone who practices TPE uses Master/slave titles.

These are descriptions, not achievement levels.

A 24/7 relationship is not automatically TPE. TPE is not automatically more loving, serious, mature, or authentic than other D/s arrangements.

There is no required path from an occasional scene to everyday protocols to TPE.

## 3. What Might TPE Look Like in Everyday Life?

People sometimes imagine TPE as nonstop orders and constant sexual activity.

For many participants, the visible reality is much more ordinary.

A relationship may include agreed routines for checking in, morning or evening rituals, ways of greeting one another, forms of address, or expectations around completing particular tasks.

A Dominant may make certain decisions because the partners have agreed that doing so carries meaning for them.

A submissive may find satisfaction in following those decisions, communicating progress, or knowing which responsibilities have been entrusted to their partner.

### Authority Can Be Quiet

Consider two adults who agree that one partner will generally choose their shared evening routine.

The other partner can communicate exhaustion, preferences, or practical constraints.

The directing partner makes the choice while taking that information into account.

To an outsider, it may look like ordinary cooperation.

For the participants, it may express a persistent, intentional authority relationship.

TPE does not have to look theatrical to feel significant.

### Authority Can Be Selective, Even When the Dynamic Is Broad

Partners might negotiate authority over:

- Rituals, greetings, titles, or protocols.
- Some clothing or presentation choices.
- Certain routines, schedules, or leisure activities.
- Particular household responsibilities.
- Agreed aspects of sexual or kink interactions.
- How certain choices are proposed, reviewed, and finalized.

Those categories are examples, **not automatic entitlements**.

A role never gives someone permission to impose an activity, access a person's body, read private communications, or make financial or medical decisions without the relevant, specific agreement and legal authority.

Even where partners use very broad ownership language, real-world responsibilities and personal rights continue to exist.

## 4. The Difference Between Authority and Responsibility

When someone accepts a leadership role, they also accept the practical and emotional consequences of their decisions.

That can involve planning, attention, consistency, effort, and the willingness to acknowledge mistakes.

If one partner has agreed to select a routine, for example, the responsibility is not merely to issue an instruction. It also involves noticing when the routine no longer fits the person's health, work, or circumstances.

A Dominant is not automatically competent at every task just because authority has been negotiated.

A submissive is not automatically incapable of making decisions merely because they enjoy yielding some of them.

### Submission Is Not Disappearance

A submissive may retain a strong sense of identity, preferences, professional judgment, friendships, and personal goals.

They may actively participate by offering information, discussing concerns, proposing improvements, or saying when something does not work.

Some TPE relationships deliberately minimize overt negotiation *inside* ordinary protocols to preserve the feeling of surrender. That preference still needs an accessible way to communicate outside the protocol when necessary.

### Leadership Is Not Infallibility

The Dominant may make a poor decision, miss an important signal, or misunderstand a need.

A functioning agreement must allow correction without requiring either person to pretend the decision was good.

**Authority does not remove accountability.**

## 5. Why Might People Want TPE?

There is no single motivation.

For some, TPE provides an enduring experience of **belonging**. A ritual or instruction can symbolize that the relationship has a distinctive structure and shared meaning.

For others, there is pleasure in **chosen surrender**: the experience of entrusting decisions to someone they know and respect.

Some people enjoy **clear expectations** and find that defined responsibilities reduce uncertainty.

Others value **service and devotion**. Completing a task may communicate affection, commitment, or attention.

The person leading may enjoy **being trusted**, accepting responsibility, providing guidance, or caring for another person through deliberate structure.

And some participants find the relationship deeply erotic, while others describe much of its everyday meaning as psychological or relational.

No particular motivation makes someone more legitimate.

TPE also does not automatically solve anxiety, insecurity, conflict, or decision fatigue. A structure that feels comforting in one context can become burdensome in another.

## 6. Consent in a Relationship That Never Fully "Switches Off"

The central challenge of ongoing power exchange is not simply how to begin.

It is how to keep consent meaningful when the structure becomes part of ordinary life.

In a single scene, participants can discuss the plan, enter the experience, and debrief afterward.

In TPE, a person may be making routine decisions under an existing agreement day after day. That can make the original negotiation feel distant.

**An ongoing agreement can establish standing expectations. It cannot erase someone's ability to withdraw consent or revise what they are willing to do.**

### Standing Agreements Are Not Blank Checks

A couple might agree that one person usually chooses an outfit.

That does not grant permission to override workplace requirements, physical comfort, a medical need, or a newly expressed boundary.

An agreement about schedules does not entitle someone to deprive a partner of necessary sleep, food, healthcare, or independent access to help.

Permission to direct an everyday routine is not automatically permission for sexual activity.

Each domain still has a scope.

### How Can Someone Say "No" Within TPE?

Some participants prefer the feeling of rarely refusing an ordinary instruction. They may establish rituals for asking to reconsider or discussing exceptions.

Those rituals may be meaningful, but **they cannot be a barrier to withdrawing consent**.

There must be an unambiguous way to step outside the authority framework and say, in effect:

> "This is a real concern, not part of the roleplay. We need to change or stop this."

A stop signal, direct statement, or other clearly agreed communication method can help.

But ordinary language and evident distress also matter. Consent is not dependent on getting a special phrase exactly right.

The partners should be able to discuss the relationship *as equals in human dignity and rights*, even if they choose an unequal allocation of decision-making within the relationship.

## 7. Boundaries That Protect Real-World Autonomy

Broad power exchange can affect choices with consequences far beyond a scene.

That makes certain boundaries particularly important.

### Health and Bodily Autonomy

A relationship role does not replace a person's right to seek medical care, make informed healthcare decisions, or refuse physical or sexual contact.

Partners may support each other's wellbeing or coordinate care by agreement, but control over someone else's treatment cannot be inferred from a BDSM title.

### Money, Housing, and Employment

Financial arrangements can create substantial dependence.

A shared budget, delegated bill-paying, or voluntarily coordinated purchases is different from preventing someone from accessing their own resources or making it impossible to leave.

A participant should retain meaningful ways to obtain essentials, understand their finances, and exit the relationship without being trapped by deliberately created dependency.

Professional responsibilities and the ability to support oneself deserve explicit consideration.

### Friends, Family, and Outside Support

A dynamic may include rituals around scheduling social plans or sharing information with a partner.

That does not justify isolation, threats, surveillance, or preventing access to friends, family, advocates, or emergency services.

A person must be able to seek independent advice and support.

### Children and Other Nonparticipants

An adult couple's power exchange cannot override a child's safety, care, legal rights, or the obligations of a parent or caregiver.

Children, coworkers, and other people who have not consented to the dynamic should not be compelled to participate in it.

Public and shared settings require boundaries that respect everyone involved.

These are not failures of surrender. They recognize that a consensual relationship exists within a wider world of rights and responsibilities.

## 8. How TPE Relationships Handle Rules and Protocols

A rule might specify an expected behavior.

A protocol might describe *how* an interaction happens: a greeting, check-in, formal request, or method of reporting completion.

A ritual may emphasize its emotional or symbolic meaning.

A TPE relationship can include all three, but none is mandatory.

### Clarity Reduces Misunderstanding

Consider a rule that says, "You must always ask permission before changing plans."

What counts as a change? Does this apply during work? In an emergency? While caring for a child? Does the person have to wait for an answer when the partner is unavailable?

Without answers, the rule may become a source of stress or conflict rather than connection.

Specific agreements might include ordinary exceptions, time limits, backup decision-making, and a way to report unexpected circumstances afterward.

### Correction Does Not Have to Mean Punishment

When an expectation is missed, the partners might discuss the reason, offer a reminder, modify the agreement, or decide that no response is needed.

Some dynamics include negotiated discipline or punishment.

But real mistakes, unmet needs, disability-related difficulties, illness, or ordinary relationship conflict should not automatically become occasions for punishment.

Coercive retaliation is not transformed into consensual discipline by a TPE label.

## 9. Communication Outside the Authority Structure

A relationship with broad, standing authority needs a way to question the structure itself.

That is distinct from following a rule or asking for permission inside it.

Some partners designate regular **out-of-dynamic check-ins**.

During these conversations, either person can discuss expectations, limits, emotional effects, mistakes, and whether the relationship is still working as intended.

They might ask:

- Do the responsibilities still feel welcome?
- Are our agreements specific enough to understand?
- Is anyone quietly tolerating something they no longer want?
- Are we still able to raise concerns without fear?
- Have life circumstances changed?
- Is our sense of connection improving, or are we only maintaining routines?
- What would we change if we designed the arrangement today?

The participants may continue using familiar terms of affection or titles if they want. What matters is that **the conversation genuinely permits disagreement and change**.

### Repair Is Not a Threat to Authority

A Dominant can apologize.

A submissive can identify an unmet need.

Partners can suspend a protocol while they discuss whether it remains useful.

None of these actions invalidates the meaning of their dynamic.

If the structure can never be questioned, it becomes difficult to distinguish freely chosen authority from coercion.

## 10. A Relationship Can Feel Continuous Without Demanding Constant Performance

One misconception about TPE is that partners must actively perform their roles every moment of every day.

But people become sick, tired, distracted, stressed, or busy.

They also have jobs, outside relationships, and responsibilities.

An ongoing agreement may remain meaningful when nobody is giving instructions.

A couple might spend an evening watching a movie, disagree about dinner, or take time alone without experiencing the relationship as interrupted.

Partners can also agree on periods where practical decisions take precedence over protocol.

Consistency may be important to them, but rigidity is not an inherent virtue.

A sustainable structure must make room for actual human lives.

## 11. Recognizing When Authority Becomes Coercive Control

TPE can involve substantial vulnerability, and some abusive behavior may be disguised as authority.

The question is not simply whether a relationship looks unequal from the outside. Consenting adults can choose unequal decision-making arrangements.

The critical questions concern **freedom, safety, accountability, and the ability to withdraw**.

Warning signs include:

- A person is punished, threatened, or intimidated for withdrawing consent.
- One partner prevents access to money, healthcare, transportation, communication, or outside support.
- Rules expand without genuine discussion or permission.
- A partner demands secrecy that prevents the other person from seeking help.
- Ordinary expressions of concern are consistently dismissed as "disobedience."
- A participant feels unable to leave because of threats, fear, or deliberately enforced dependence.
- Harm is excused with statements such as "You agreed to TPE, so you have no right to object."

These are concerning regardless of which person uses the Dominant or submissive title.

### Trust Is Not a Substitute for Safeguards

A relationship can feel loving and still have harmful patterns.

Strong attachment does not make every decision wise.

Likewise, a written contract or a history of voluntary submission does not make later coercion acceptable.

People should be able to access independent support and legal or professional advice when needed.

**A meaningful ability to leave is more important than a symbolic promise never to leave.**

## 12. Contracts, Collars, and Ownership Language

Some TPE partners use written contracts, collars, formal ceremonies, or ownership terminology.

These can symbolize dedication, identity, and the emotional seriousness of an agreement.

But symbols and documents do not create legal ownership of another human being.

A personal BDSM contract generally should not be treated as transferring fundamental rights, making future consent irrevocable, or replacing the law governing medical decisions, finances, marriage, or children.

A contract can still be useful as a communication tool.

It might document what the relationship means to both people, which responsibilities are included, what remains outside the dynamic, and how to renegotiate or end it.

The purpose should be mutual clarity, not the illusion that one person has surrendered the right to change their mind.

## 13. Does TPE Have to Be Sexual?

No.

TPE often exists alongside sexual interests, but an ongoing power-exchange structure may involve nonsexual aspects of ordinary life, emotional intimacy, rituals, service, or personal identity.

Some partners include sexual authority within a negotiated dynamic; others do not.

An agreement about nonsexual authority never automatically includes sexual access.

Likewise, a person may enjoy the symbolism of ownership, collars, titles, or service without wanting broad authority over daily life.

There is no universal package of activities that comes with the label.

## 14. Is TPE Something People Should Work Toward?

TPE is not a graduation from "beginner BDSM."

It is a particular kind of relationship agreement with significant practical and emotional implications.

Some people may find it deeply meaningful.

Others may prefer scene-based power exchange, limited standing protocols, a collaborative relationship without ongoing hierarchy, or no D/s at all.

None is inherently more committed or mature.

Because broad authority may affect money, health, relationships, and routines, it is sensible to understand one's own preferences and observe a partner's respect for boundaries over time before making extensive arrangements.

There is no need to surrender more authority merely to prove trust.

### Questions Worth Exploring

- Do I want an ongoing authority relationship, or do I mainly enjoy particular scenes?
- Which specific decisions would I enjoy giving or accepting responsibility for?
- Which areas should remain entirely outside the dynamic?
- How will either person raise concerns without being treated as disobedient?
- What support and independence would we retain?
- How would we handle illness, work changes, separation, or a relationship ending?
- Does this structure make room for both people's growth and changing needs?
- Would I still want it if neither of us used the words "total" or "owner"?

These questions may be more useful than trying to determine whether a relationship is sufficiently intense to earn a label.

## Final Thoughts: Total Does Not Mean Beyond Consent

Total Power Exchange is often described using powerful language: ownership, surrender, obedience, control.

For the people who choose it, those words may carry profound personal significance.

But a relationship is not made consensual by a title or ceremony.

It remains consensual through the participants' genuine ability to understand, question, change, and leave the agreement.

The most meaningful part of TPE may be neither the number of rules nor the breadth of a person's authority.

It may be the deliberate choice to build a life in which trust and responsibility are expressed through an unusual relationship structure.

**No one can give away their right to withdraw consent. What they can choose is how much responsibility and authority to share while that choice remains theirs.**

---

### Continue Learning

- **Dominance & Submission: Understanding the D and S of BDSM:** The foundations of consensual authority.
- **Negotiating a Scene:** How to discuss activities, boundaries, and responsibilities.
- **Safewords:** Why stop signals support—but never replace—ongoing consent.
- **Kinks Are Not Roles:** The difference between activities, positions, authority, and motivation.
- **Kink Without Dominance or Submission:** Exploring kink without a power-exchange relationship.
- **Rules, Protocols & Rituals:** Making expectations clear within ongoing dynamics.
- **Consent and Coercion:** Recognizing when a power arrangement stops being voluntary.

### Further Reading

- [National Coalition for Sexual Freedom — Consent Counts](https://ncsfreedom.org/key-programs-2/consent-counts/)
- [TASHRA — Edges of Consent: 24/7 Relationships and Complex Consent](https://www.tashra.org/event/edges-of-consent/)
- [Casey & Sagarin — Authority Transfer Relationships: Illuminating a Consensual Inegalitarian Relationship Form (2025)](https://pubmed.ncbi.nlm.nih.gov/41162821/)
- [Cascalheira, Thomson & Wignall — A Phenomenological Study of 24/7 BDSM and Negotiating Consent](https://research.brighton.ac.uk/en/publications/a-certain-evolution-a-phenomenological-study-of-247-bdsm-and-nego/)
`,oi=`# Understanding Mindspaces: The Different Ways We Experience Ourselves

*What mindspaces mean, how they feel, why they can overlap, and how they may change over time.*

**Level:** Beginner  
**Estimated reading time:** 11 minutes  
**Topics:** Mindspaces · Headspaces · Identity · Roles · Emotional States · Self-Understanding · Communication

**Content note:** This article discusses vulnerability, younger-feeling headspaces, emotional regulation, and power-exchange contexts without graphic material.

---

## More Than a Role or a Label

Imagine someone who calls themselves a *pet*.

One evening, being a pet feels playful and affectionate. They want attention, closeness, and a little silliness.

Another evening, the same word carries a deeper feeling of belonging. They want to be quiet, cared for, and held within a familiar relationship structure.

A third time, they feel both things—and perhaps a strong desire to offer service, too.

Has their identity changed? Not necessarily. The meaning they are experiencing **in that moment** has changed.

This is one way to understand a **mindspace**: an internal, emotional, psychological, or relational state that shapes how someone experiences themselves and their interactions.

People sometimes use the word *headspace* instead. Different communities and individuals use both terms in different ways; neither has one universally agreed definition.

A mindspace might feel like a shift in attention, energy, desire, vulnerability, playfulness, embodiment, or connection. It can be subtle or immersive, comfortable or complicated, intentional or unexpected.

**A mindspace describes an experience. It is not a test someone has to pass to qualify for a role.**

## 1. Mindspace, Role, and Kink: Three Related Things

These concepts can overlap, but they do not mean the same thing.

**A role** is a way someone understands or presents themselves in an interaction or relationship. Examples might include Pet, Prey, Little, Caregiver, or Master/Mistress.

**A kink** is an interest, activity, fantasy, or form of expression. Someone may enjoy praise, rituals, service, playful resistance, restraint, or particular sensory experiences.

**A mindspace** is how someone is feeling or experiencing themselves at a given time, sometimes in connection with a role or kink.

For example, someone may identify as a submissive in an ongoing relationship. That identity might remain steady whether they feel mischievous, deeply devotional, playful, tired, or uninterested in kink.

Another person may enjoy acting as prey in a scene but not experience a distinct internal prey mindspace at all.

**You can have a role without always feeling its associated mindspace. You can experience a mindspace without adopting a permanent role.**

And neither is required to enjoy kink.

## 2. What Can a Mindspace Feel Like?

There is no universal physical or emotional sensation that proves someone has entered a mindspace.

For some, it feels like their thoughts become quieter or more focused. Others notice a change in how they want to move, speak, interact, or be addressed.

Some experience a particular emotional tone: playful, protected, mischievous, instinctive, devoted, cared for, or responsible.

Others primarily notice a shift in **what feels meaningful**.

A familiar instruction might feel ordinary in one moment and profoundly comforting in another. A nickname might be welcome when someone feels playful but not when they want to be taken seriously. A ritual might help someone settle into an experience they already recognize.

Not every change is dramatic. Someone might simply notice, "I feel more like that part of myself right now."

And some people don't have distinct shifts at all. Their preferred way of relating to kink may feel steady and continuous.

## 3. Some Examples—Not a Complete List

Mindspaces can be personally named, community-recognized, or difficult to describe.

### Petspace

Someone in petspace may feel playful, affectionate, instinctive, cared for, loyal, or particularly connected to a pet identity.

But petspace isn't always energetic or animal-like. For some, its deepest meaning is belonging, quiet closeness, or a familiar sense of ownership symbolism.

### Little or Middle Headspace

Some adults describe feeling younger, more playful, comfort-seeking, or less interested in ordinary responsibilities within a little or middle headspace.

Experiences vary significantly. These are **adult experiences between consenting adults**; their meaning, boundaries, and whether there is any relationship to kink or sexuality should never be assumed.

### Bratty or Playful-Challenge Space

Someone might feel drawn toward teasing, negotiated resistance, humor, or a particular kind of back-and-forth.

It may feel energetic and mischievous to one person, or like a way to invite attention and connection to another.

A desire to playfully challenge someone isn't automatic consent to correction, punishment, or escalation.

### Primal or Prey Space

Some describe a more embodied, instinctive, alert, or less verbally focused experience. It may involve themes of pursuit, movement, or sensation.

Feeling primal does not automatically mean wanting aggression, and feeling like prey does not inherently mean being submissive.

### Devotional or Service-Focused Space

A person may feel particularly drawn toward attentiveness, helping, ritual, completing meaningful requests, or expressing dedication.

Service and devotion can also be enduring values rather than distinct temporary mindspaces. The person experiencing them gets to decide what language fits.

### Care-Seeking or Nurturing Space

Someone may want comfort, support, reassurance, gentle structure, or the chance to care for another person.

Needing care doesn't automatically make someone little or submissive. Providing care doesn't automatically make someone Dominant.

These examples are starting points for conversation, not boxes everyone must fit into.

## 4. You Might Have One Mindspace—or Many

Some people recognize one mindspace that feels like home.

They might experience it often, or it might simply be the way they most naturally relate to a particular part of themselves.

They don't need to develop additional mindspaces to be more experienced or interesting.

Other people recognize several distinct experiences.

They may move between playful, pet-like, devotional, nurturing, primal, or other spaces depending on their circumstances and relationships.

Some people discover new language after years of not having a name for how they felt.

Others try a label and later decide it no longer describes them.

**Having one mindspace is not less complex than having many. Having many is not inherently inconsistent.**

A person also does not need a neatly defined mindspace at all.

## 5. Mindspaces Can Blend

We often talk about headspaces as if there is a switch: *petspace on, petspace off*.

But internal experience is rarely that tidy.

Someone might feel **pet-like and devotional** at the same time: playful belonging alongside a strong desire to please or serve.

Someone might feel **little and bratty**, wanting nurturing while also wanting a bit of mischief.

Someone might feel **primal and submissive**, or primal without any interest in submitting.

Another person might feel protective and nurturing while also wanting to receive care.

Blends can be familiar patterns, temporary combinations, or experiences that don't have names yet.

They don't have to be divided into percentages or ranked by which one is "really" present.

A question like "Which mindspace are you in?" may not have a single-word answer.

Sometimes the truest answer is: **"A little of both."**

## 6. Mindspaces Can Change Over Time

A mindspace isn't necessarily a fixed trait.

It may become more familiar as someone understands their preferences, builds trust, or finds language that fits.

The way it feels can change with age, relationships, stress, health, confidence, experience, or ordinary life circumstances.

What once felt intensely immersive might later feel like a gentle, familiar background presence.

A mindspace that used to arise easily may become less accessible for a while.

A person who once found comfort in being guided may later want more autonomy within that same experience—or vice versa.

None of this automatically means the earlier experience was imaginary or that the newer version is more authentic.

Growth isn't always a straight line toward deeper immersion.

**A changing mindspace can simply reflect a changing person.**

## 7. Do People Choose When They Enter One?

Sometimes yes, sometimes no, and sometimes a little of both.

A particular form of address, clothing item, ritual, shared activity, or interaction may help someone intentionally settle into a familiar mindspace.

Another person may notice a shift happening spontaneously, without a deliberate decision.

Sometimes a space becomes more accessible in the presence of a trusted partner.

But a partner does not get to decide that someone *must* be in a particular mindspace or force them to remain there.

A person may also want a transition out: ordinary conversation, a change of setting, quiet time, food, rest, reassurance, or simply being left alone.

There is no required entry ritual and no universal exit procedure.

If someone cannot easily shift out of an experience or feels frightened or disoriented, the priority is their wellbeing—not preserving the roleplay.

## 8. The Same Mindspace May Mean Different Things to Different People

Two people can both say "kitty" and mean very different things.

For one, it might be energetic and playful.

For another, it might mean quiet affection and physical closeness.

For someone else, it might primarily express a serious, emotionally significant sense of belonging.

And those meanings may coexist within one person.

The same is true of words such as *little*, *brat*, *slave*, *prey*, *caregiver*, or *devotional*.

Shared vocabulary can help people find community, but it should not erase personal meaning.

Instead of assuming what a label means, try asking:

- "What does that space feel like to you?"
- "What do you usually want when you're feeling that way?"
- "What do you **not** want people to assume?"
- "Does it feel different depending on the day or the person you're with?"

A mindspace belongs to the person experiencing it—not to a community definition.

## 9. How Mindspaces Affect Wants, Needs, and Communication

A useful mindspace conversation goes beyond identifying a label.

For example, someone who feels playful might want teasing and interaction; the same person, in a quieter space, might want gentle attention and fewer words.

Someone in a devotional mood might love being given a meaningful task. On a depleted day, the same request might feel overwhelming.

Mindspace awareness can make it easier to say:

- "I'm feeling particularly playful, but I don't want anything intense."
- "I want closeness and reassurance, not instructions."
- "I'm in a service-oriented mood, but I'd like a clear stopping point."
- "I feel a blend today, and I don't have a perfect name for it."

Those are communications about someone's **current experience**, not permanent specifications for how another person should treat them.

A partner can respond with curiosity rather than trying to diagnose the "correct" mindspace.

### A Mindspace Is Not Consent

Recognizing petspace does not automatically permit handling, restraint, or obedience rules.

Feeling bratty does not give someone else permission to punish you.

Feeling younger or care-seeking does not remove your capacity or right to consent as an adult.

And an ongoing D/s relationship still needs explicit agreements about authority and boundaries.

**Mindspaces may help explain a desire; they never replace asking whether that desire is welcome.**

## 10. When a Mindspace Isn't Comfortable

Not every internal shift feels good.

Someone may feel overwhelmed, vulnerable, disconnected, depleted, or unsure how to communicate.

That does not mean those feelings should automatically be framed as kink, assigned a romantic label, or treated as an invitation to play.

A person may prefer ordinary emotional support, rest, or space.

Likewise, experiencing a mindspace is not itself evidence of a mental health condition. If changes in awareness, memory, or control are distressing or disruptive, it can be appropriate to seek support from a qualified professional without treating the experience as a kink identity.

Your wellbeing matters more than fitting a category.

## 11. Reflecting on Your Own Experience

You don't have to complete a questionnaire to know what feels meaningful, but reflection can help.

Try asking yourself:

- Do I recognize one familiar mindspace, several, or none?
- Does it feel steady, or does it shift?
- What changes first: my emotions, my wants, my energy, my language, or how I relate to someone?
- Can two experiences be present at once?
- Are there names that fit me personally but mean something different to other people?
- What helps me feel comfortable entering or leaving a space?
- What would I want a partner to understand without assuming?
- What boundaries stay the same, regardless of how I feel?

The answers might change next month or next year.

That's allowed.

## Final Thoughts: You Don't Have to Fit Into One Box

Mindspaces can be a useful language for experiences that are otherwise difficult to explain.

For some people, one familiar space is consistent and deeply meaningful. For others, the experience changes across days, partners, situations, or stages of life. Some mindspaces blend; others feel distinct. Some are easy to name, and some are entirely personal.

A label can help you communicate, but it does not define the limits of your inner world.

**You can be one thing, many things, a blend of things, or something that doesn't have a name yet. Your experience does not have to become simpler to be real.**

---

### Further Reading

- **Kinks Are Not Roles:** How activity, authority, role, and meaning differ.
- **Kink Without Dominance or Submission:** Exploring interests without a power-exchange relationship.
- **Dominance & Submission:** Understanding negotiated roles and consent.
- **Negotiating a Scene:** Communicating current wants, limits, and expectations.

*Editorial status: draft. Community terminology varies; lived-experience quotes may be added with permission and attribution. This article is educational and does not diagnose psychological conditions.*
`,si=`# Breath Play: Choking, Strangulation, and Suffocation

*Three commonly confused terms, different medical mechanisms, and safer ways to explore the underlying fantasy.*

**Level:** Beginner–Intermediate  
**Estimated reading time:** 14 minutes  
**Topics:** Breath Play · Choking · Strangulation · Suffocation · Consent · Risk Awareness · Harm Reduction

**Content note:** This article discusses oxygen deprivation, suffocation, airway obstruction, neck compression, brain injury, loss of consciousness, accidental death, and coercion. The safety information remains essential regardless of content preferences. It does not provide instructions for restricting breathing or blood flow.

---

## Introduction: One Umbrella, Three Different Terms

*Breath play* is a broad label. Underneath it, conversations often blur **choking**, **strangulation**, and **suffocation**.

Someone might use "choking" to describe a hand on the neck, while a clinician would call that **strangulation**. Another person might mean **suffocation**, where air is prevented from reaching someone without pressure to the neck. Still another might be imagining a dramatic scene where no breathing is actually restricted.

Those are not minor distinctions. They describe different physical mechanisms and potential injuries.

**These distinctions matter because the language can disguise how dangerous the activity actually is.**

People can be curious about fear-themed roleplay, surrender, anticipation, vulnerability, or the imagery of control without wanting genuine oxygen deprivation.

The goal of this article is not to judge those interests. It is to give them accurate names, explain why actual breathing or circulation restriction can cause catastrophic harm, and offer ways to separate a fantasy from its dangerous physical mechanism.

## 1. Defining the Terms

### Breath Play: A Broad, Ambiguous Label

*Breath play* is an umbrella term used for activities or fantasies involving breathing, the sensation of breath, or the idea of breath being controlled.

In ordinary conversation it can refer to very different things, from **pretending** that breathing is restricted to actually reducing airflow or oxygen intake.

That makes the label insufficient for consent. A person saying "I like breath play" has not told you what they want done—or what risks they understand.

Any activity intended to prevent normal breathing, including blocking the nose or mouth, smothering, or restricting chest movement, can cause dangerous oxygen deprivation. Calling it breath play does not reduce those risks.

### Choking: An Airway Obstruction—or a Misused Word

In medical language, *choking* usually means an obstruction inside the airway—for example, food stuck in the throat.

In sexual or kink conversations, "choking" often means **external pressure applied to the neck**.

Medically, that action is generally better described as **strangulation**, even when the person can still speak or breathe.

Using the word "choking" can therefore make an experience sound more casual than its medical implications justify.

### Strangulation: External Pressure to the Neck

Strangulation occurs when pressure on the neck interferes with blood circulation, breathing, or both.

Neck compression can affect vulnerable blood vessels and the airway. Serious injury can occur **without visible bruising and without someone obviously gasping for air**.

One common misunderstanding is that only blocking the windpipe is dangerous. In reality, interference with blood flow to and from the brain can also produce rapid, unpredictable, life-threatening effects.

**There is no reliably safe way to strangle someone.** This includes techniques described online as using the "sides" of the neck, "only a little" pressure, or a supposedly safe time limit.

### Suffocation: Restricted Access to Breath Without Neck Compression

*Suffocation* refers to preventing someone from getting enough breathable air. In the context of external obstruction, this may involve blocking access to air at the nose or mouth rather than compressing the neck. Other types of asphyxia can involve an unsafe breathing environment or restriction of normal chest movement.

Unlike strangulation, suffocation does not necessarily compress the neck's blood vessels or injure its structures. **That is a difference in the injury mechanisms—not proof that suffocation is safe or even predictably safer overall.**

Suffocation can rapidly cause inadequate oxygen delivery, loss of consciousness, brain injury, cardiac arrest, and death. A person may be unable to call out or use a safeword, and serious danger may develop before it is obvious to an observer.

### At a Glance: Different Words, Different Mechanisms

| Term | What it usually means | Central concern |
| --- | --- | --- |
| Breath play | An umbrella for fantasy or activities involving control of breath | Actual restriction carries significant risk; fantasy need not involve it |
| Medical choking | Something obstructs the airway from within | Breathing emergency |
| Sexual "choking" | Often external neck pressure, medically described as strangulation | Blood-vessel, airway, and other neck injury |
| Strangulation | External pressure to the neck restricting circulation or breathing | Brain injury, stroke, airway damage, death |
| Suffocation | Insufficient breathable air, often through external airway obstruction without neck compression | Oxygen deprivation, unconsciousness, brain injury, death |

This table describes mechanisms, **not an ordered ranking from safest to most dangerous**.

## 2. Why Neck Compression Is So Dangerous

The neck contains structures that are essential to breathing, blood circulation, and neurological function.

Applying external force can injure these structures even when it appears brief or controlled.

### Interrupted Blood Flow and Brain Injury

Pressure can interfere with the blood supply to the brain or blood returning from it. Decreased blood flow can cause loss of consciousness, brain injury, and, in severe cases, death.

Damage to neck blood vessels can also lead to clots or stroke, including complications that appear after the incident rather than immediately.

### Airway and Throat Injury

Pressure may damage structures involved in breathing, speaking, and swallowing.

Swelling or other internal injury can cause symptoms to worsen after the pressure stops. A person who initially feels okay may later develop difficulty breathing or swallowing.

### Cardiac and Other Serious Complications

Neck pressure may trigger dangerous physiological responses. Loss of consciousness, collapse, neurological injury, or cardiac arrest are possible outcomes.

Neither skill, mutual trust, intent, nor an agreed safeword can guarantee that a participant will have enough warning to prevent a serious event.

### Why "But I Could Still Breathe" Is Not Reassuring

Being able to breathe or talk does **not** rule out compression of neck blood vessels.

Likewise, a lack of marks does not rule out internal injury.

The appearance of control is not evidence of medical safety.

## 3. Is Suffocation the "Safest" Form of Breath Play?

It can be tempting to view suffocation as safer because it does not necessarily involve force on the neck. Avoiding neck pressure avoids some hazards specific to strangulation, including direct damage to neck vessels and structures.

**But that is not the same as demonstrating that suffocation is the safest practice.** Preventing air from reaching the lungs can still rapidly deprive the brain of oxygen, cause unconsciousness, and lead to permanent injury or death. We should not present the two mechanisms as a reliable safety hierarchy.

Any intentional restriction of breathing—including smothering, covering the nose or mouth, restrictive equipment, or forced breath-holding—introduces serious risks. There is no established safe duration or reliable home technique for depriving someone of oxygen.

In particular, **lightheadedness, tunnel vision, confusion, or faintness should not be treated as desirable targets or measures of success**. They may indicate impaired oxygen delivery, circulation, or another dangerous physical response.

A common idea is that someone can simply use a safeword if things become unsafe.

But a person who is confused, fainting, panicking, or losing consciousness may not be able to communicate—or recognize danger—in time.

This is why best practice is to avoid intentionally restricting another person's breathing or blood flow, rather than trying to calculate a supposedly safe amount of restriction.

## 4. What the Research and Clinical Guidance Say

Researchers, clinicians, and kink educators increasingly emphasize that sexual strangulation is not made safe by consent or informal technique training.

The 2026 peer-reviewed review *Why Sexual Choking Is Not as Safe as You Think* discusses associations with neurological and psychological harms and calls for clearer risk education.

NHS clinical guidance on non-fatal strangulation **and suffocation** describes serious consequences that may occur without visible marks. Those injuries may not be immediately apparent. The mechanisms overlap in their potential to deprive the brain of oxygen, even though neck compression has additional vessel and structural injury pathways.

Research on repeated exposure raises additional concerns about potential cumulative effects. There is still much to learn about long-term outcomes, and that uncertainty is **not** evidence of safety.

**Consent makes a chosen interaction voluntary. It does not change how the neck, airway, or brain respond to compression or a lack of oxygen.**

## 5. Warning Signs and When to Get Medical Help

If someone's neck has been compressed **or their access to air has been obstructed**, stop immediately. Medical guidance recommends prompt clinical assessment after strangulation, even if there are no visible marks, because internal injuries can be hidden. Suspected suffocation also warrants urgent assessment, especially when there was breathing difficulty, altered consciousness, or any concerning symptom.

### Emergency Signs

Call emergency services immediately (911 in the United States) for any of the following after neck compression or breathing restriction:

- Difficulty breathing, noisy breathing, or worsening throat swelling.
- Loss of consciousness, collapse, or seizures.
- New weakness, difficulty speaking, severe confusion, or other stroke-like symptoms.
- Vision loss or significant visual disturbance.
- Severe or rapidly worsening symptoms.

Do not resume the activity or leave someone with concerning symptoms alone while awaiting help.

### Other Symptoms That Also Need Urgent Evaluation

Seek urgent medical evaluation following neck compression or suffocation, especially if there is:

- A hoarse or altered voice, persistent cough, or throat pain.
- Trouble or pain with swallowing.
- Headache, dizziness, nausea, memory gaps, or unusual confusion.
- Neck pain, tenderness, swelling, or marks.
- Changes in hearing, vision, mood, or neurological function.

**Symptoms can develop hours or days later.** A normal-looking neck is not a reason to ignore them.

When obtaining care, describe the event plainly: pressure was applied to the neck, air was blocked, another breathing restriction occurred, or some combination. Giving clinicians accurate information helps them consider injuries that are not visible.

If someone is unresponsive or not breathing normally, call emergency services and follow the dispatcher's CPR/AED instructions. Avoid unnecessary movement of someone with suspected neck injury.

## 6. Safewords and Negotiation: Necessary, Not Sufficient

Discussions of "best practices" often begin with safewords. They should begin earlier: with informed agreement about **what will not happen**.

Someone may be attracted to the idea of breath control without knowing that sexual "choking" often means strangulation, while suffocation involves a different route to oxygen deprivation. Serious harm can occur in either case.

Do not assume familiarity because a partner has tried it before, seen it in media, or says they have a high pain tolerance.

Talk explicitly about:

- What emotional experience is appealing: authority, fear-themed fiction, vulnerability, intensity, or anticipation.
- Whether physical neck contact is wanted at all; do not infer it from a fantasy.
- The boundary that **normal breathing and circulation will remain unobstructed**.
- Words, gestures, or signals that mean pause or stop.
- Whether the scene includes fictional resistance—and how anyone can immediately step out of character.
- Current stress, trauma associations, medical concerns, and accessibility needs.

All participants retain the right to stop an interaction. A Dominant has no special exemption from consent requirements, and a submissive has no obligation to accept an activity because of a relationship title.

But **a safeword is not a safety mechanism for actual strangulation or suffocation**. Sudden injury, impaired consciousness, or inability to speak can prevent its use.

## 7. Exploring the Fantasy Without Restricting Breathing

A person may enjoy the *symbolism* of breath control more than any physiological effect.

That creates space for alternatives that preserve normal breathing and avoid pressure to the neck.

### Theatrical Roleplay

Partners can agree on a purely fictional scenario in which a character has control, without touching or compressing the airway or neck.

Voice, dialogue, eye contact, scene-setting, and an agreed pause can convey authority or suspense without reducing oxygen.

### Symbolic Gestures

A hand **near** the neck, without applying pressure or obstructing breathing, may communicate the visual idea of control for some people. Others prefer no hand near the neck at all.

The gesture should remain noncompressive and easy to stop. If there's any risk that movement will accidentally put pressure on the neck, choose a different gesture.

### Consensual Direction Without Physical Restriction

Some participants enjoy hearing a partner direct a scene, maintain a dramatic pause, or ask for eye contact.

For others, the appeal is being watched attentively, not being physically overpowered.

A negotiated verbal exchange may give them the feeling they want without endangering circulation or breathing.

### Non-Neck Symbols of Control

A chosen piece of jewelry, a ritual, a visual prop, or an agreed posture may express belonging, closeness, or authority without being used to tighten, pull, or restrict anything.

Avoid hoods, gags, tight collars, chest compression, or other equipment that could impair normal breathing or prevent someone from communicating.

These alternatives are **lower risk**, not automatically risk-free or universally appealing. They still require consent and attention to the individuals involved.

## 8. Common Myths Worth Challenging

### "It's Safe if You Don't Press on the Windpipe"

False. Pressure on the neck's blood vessels can be dangerous even when someone can breathe and speak.

### "Only a Few Seconds Can't Hurt"

False. There is no reliable safe time limit. Serious harm can occur rapidly and unpredictably.

### "A Safeword Makes It Safe"

False. Someone may lose the ability to communicate before recognizing or signaling an emergency.

### "No Bruises Means No Damage"

False. Important injuries can be internal and symptoms may emerge later.

### "If My Partner Asks for It, It's My Responsibility to Do It"

False. Everyone can decline an activity, including tops and Dominants. Interest and consent do not remove the need to consider risks.

### "Suffocation Is the Safe Alternative to Strangulation"

False. It may avoid direct neck-compression injuries, but oxygen deprivation can still cause catastrophic harm. These risks cannot be ranked reliably by the labels alone.

### "Breath Play Is Always the Same as Strangulation"

Not exactly. People use *breath play* to describe a wide range of fantasies and actions. The distinction must be clarified—but **actual restriction of breathing or blood flow is medically dangerous regardless of the label**.

## 9. Consent, Pressure, and Relationship Context

Some people encounter sexual choking through pornography, social media, or assumptions about what a partner "should" enjoy.

Those expectations are not informed consent.

Nobody needs to accept neck compression to be adventurous, submissive, trusting, experienced, or sexually compatible.

If a partner pressures someone to proceed after a refusal, dismisses symptoms, or treats a concern as disobedience, that is a serious warning sign.

Strangulation can also occur as coercive violence outside consensual kink. If someone applies pressure without agreement, refuses to stop, or uses the threat of it to control another person, prioritizing medical care and support is appropriate.

The language of BDSM does not excuse assault or override legal protections.

## 10. Questions for Understanding Your Interest

If you are curious about this theme, consider:

- Do I want the *visual image* of control, or am I imagining a real physical restriction?
- Is the appeal vulnerability, trust, attention, fear-themed fiction, dominance, submission, or something else?
- Could the same meaning be created through words, rituals, or gestures with normal breathing?
- Is my interest personal, or does it come from media or a partner's expectations?
- Which forms of contact are completely off-limits?
- Would I feel comfortable declining this activity, and would my partner respect that?

Someone can find an idea compelling as fantasy and decide not to enact its dangerous physical elements.

That decision does not make the interest less real.

## Final Thoughts: Understanding the Risk Is Part of Understanding the Kink

Breath play, sexual "choking," strangulation, and suffocation are sometimes used as though they are interchangeable.

They aren't. **Choking** has one clinical meaning, while the same word often refers to **strangulation** in kink. **Suffocation** can occur without compressing the neck, but still threatens the brain through insufficient oxygen.

The distinction matters because someone may be consenting to an image of control without understanding the medical risks of the physical act.

The most important safety distinction is between **the fantasy of restricted breathing** and **actually restricting breathing or circulation**.

Curiosity about the former does not require performing the latter.

**Neither neck compression nor intentional suffocation is reliably safe. Keeping breathing and circulation unobstructed—and preserving the ability to stop—is the lower-risk way to explore the underlying themes.**

---

### Further Reading

- [NHS inform — Non-fatal strangulation: risks, symptoms, and medical advice](https://www.nhsinform.scot/healthy-living/sex-and-relationships/non-fatal-strangulation-nfs)
- [Hampshire and Isle of Wight Healthcare NHS Foundation Trust — Understanding non-fatal strangulation or suffocation](https://hiowhealthcare.nhs.uk/sarc/professionals/understanding-non-fatal-strangulation-or-suffocation-nfs)
- [Northern Ireland government — Strangulation and suffocation](https://www.nidirect.gov.uk/articles/strangulation-and-suffocation)
- [Ratcliff et al. (2026) — Why Sexual Choking Is Not as Safe as You Think](https://doi.org/10.1007/s10508-026-03481-7)
- [National Coalition for Sexual Freedom — Harm Reduction Alternatives for Sexual Choking](https://ncsfreedom.org/2026/04/21/harm-reduction-alternatives-for-sexual-choking/)

*Editorial status: draft. Requires independent medical/safety, source, and accessibility review before publication. This article intentionally avoids actionable techniques for asphyxiation or strangulation.*
`,ri=`# Impact Anatomy and Control: Understanding Where Risk Changes

*Why body location, movement, accuracy, and communication are central to reducing impact-play injuries.*

**Level:** Beginner–Intermediate  
**Estimated reading time:** 8 minutes  
**Topics:** Impact Play · Anatomy · Accuracy · Body Position · Injury Prevention

**Content note:** Discusses injuries to nerves, organs, bones, and soft tissue. It is not a safe-target diagram, technical striking lesson, or medical clearance to participate.

---

## Why Anatomy Matters More Than a Diagram

Anatomical guides are sometimes presented as maps of "safe places" and "unsafe places" to strike.

That framing is misleading.

There are **comparatively lower-risk** locations for light, controlled contact, but no body area is guaranteed safe. The same apparent contact can affect people differently depending on health, physical position, implement, force, repetition, and other factors.

A map cannot show how much force an individual tissue can safely tolerate, and a person's expression of enjoyment cannot reveal every injury.

A better starting question is: **What structures could be harmed, and what would make us stop?**

## Soft Tissue, Bone, Nerves, and Organs

### Fleshy Areas Are Not Risk-Free

For some beginners, the central fleshy portions of the buttocks are generally considered comparatively lower risk for low-intensity contact. Even there, bruising, hematomas, soft-tissue injuries, and unexpected pain are possible.

The upper posterior thighs may have substantial muscle but can be more sensitive. They are not interchangeable with the central buttocks, and the nearby inner-thigh area has additional vulnerable structures.

Avoid interpreting "more muscle" as automatic permission for greater intensity.

### Bony Areas and Joints

Bones, joints, and structures close to the skin can be vulnerable to focused force.

Impact near the spine, tailbone, joints, and prominent bones can cause injuries that extend beyond temporary soreness. These are not appropriate experimental targets.

### Nerves and Circulation

Nerves and blood vessels follow complex paths through the body. Trauma may produce tingling, numbness, weakness, changes in sensation, or restricted movement—sometimes without dramatic surface markings.

Those symptoms call for stopping and appropriate medical assessment rather than continuing to test whether an area feels better.

### Internal Organs

The kidneys and other internal organs can be injured by trauma, including impact to nearby body surfaces.

An area that looks muscular or appears padded from the outside may still overlie vulnerable organs or ribs.

Do not attempt to compensate for anatomical risk by guessing at a supposedly safe amount of force.

## A Practical Risk-Awareness Table

| Region | Why it matters |
| --- | --- |
| Central, fleshy buttocks | Comparatively lower risk for light controlled contact, **not safe from tissue injury** |
| Upper back of the thighs | Sensitivity and local structures warrant additional caution; not equivalent to central buttocks |
| Spine, tailbone, joints, exposed bones | Potential bone, joint, or nerve damage |
| Kidney/flank area, abdomen | Risk to internal organs; avoid impact |
| Chest and ribs | Bone, lung, and other internal injury risks; avoid impact |
| Head, face, neck, throat | Potentially catastrophic neurological, vascular, or airway harm; avoid impact |
| Genital area and inner thighs | Vulnerable tissues and structures; avoid impact |
| Areas already injured or bruised | Repeated trauma can worsen or prolong damage; avoid impact |

**This table is not a permission chart.** It communicates why location matters, not a tested safe striking plan.

## The Role of Body Position

The position of the person receiving an activity can affect balance, muscle tension, available movement, and the ability to communicate discomfort.

Someone may find a position comfortable at first and painful after a short period. Fatigue, hypermobility, injury, disability, and limited range of motion can change how long a position is tolerable.

Do not expect a participant to maintain an uncomfortable position simply to keep the scene going.

Restraint introduces its own nerve, circulation, and emergency-release hazards. It should not be added casually to an impact scene.

**Position is something to negotiate and reassess, not something to enforce at the cost of someone's health.**

## Tool Control Is Not the Same as Force

Experienced-looking movement can give a false impression of safety.

A person can swing confidently and still contact the wrong location or deliver more energy than expected.

Risk-relevant differences include:

- **Contact area:** an edge or narrow tip can concentrate force differently from a broad surface.
- **Flexibility:** tails or flexible parts can move past the intended contact area and wrap around contours.
- **Momentum:** an implement's weight and movement affect what happens when it contacts or passes a target.
- **Repetition:** repeated contact can increase tissue trauma even when individual contacts seem mild.
- **Spacing and surroundings:** people, furniture, and other objects can be struck accidentally.
- **Changing body position:** a receiving partner may shift unexpectedly, voluntarily or in response to discomfort.

No short written guide can teach safe mastery of different implements. High-risk equipment requires competent, in-person instruction.

## Why Off-Body Practice Comes First

Before considering contact with another person, someone learning an unfamiliar implement can observe its behavior using an inanimate practice target.

The relevant question is not "How hard can I hit?" but whether the tool moves predictably and can be stopped without uncontrolled travel.

A practice target may reveal unexpected flexibility, reach, or unstable equipment.

It cannot, however, reproduce the complexity of skin, nerves, organs, and human reactions. Success off-body is **not proof** that the technique is safe on a person.

If someone's movement is uncontrolled, or the implement has risks they cannot explain, pause the activity and seek instruction rather than experimenting on a partner.

## Common Sources of Unexpected Contact

### Edges

A tool's edge may make contact when the person expected a broad surface. Different points of contact may produce different sensation and injury risks.

### Wrap

Flexible falls or tips can move beyond the intended area and contact another part of the body.

Wrap is not a minor cosmetic mistake when it can place force on vulnerable structures.

### Changes in Position

A partner's body can move unexpectedly. A movement that looked controlled against an inanimate target may not remain controlled in a dynamic human interaction.

### Escalation Without Reassessment

The sensation may seem manageable, but repeated contact, fatigue, tissue changes, or altered sensation can change risk during the same activity.

**Do not use growing tolerance as evidence that it is safe to increase force.**

## Communication Is Part of Physical Safety

People have different thresholds, sensations, and ways of communicating.

Agree on a reliable stop system. Check in frequently enough for the actual activity. The person receiving impact should never be required to endure unexpected pain to avoid disappointing the other.

Unusual silence, confusion, loss of responsiveness, dissociation, numbness, weakness, sharp unexpected pain, or difficulty breathing are reasons to stop immediately.

Some injuries can occur too quickly for a safeword to prevent them. Monitoring and caution are necessary, but neither eliminates risk.

## Individual Health Can Change the Picture

Relevant factors can include:

- Bleeding or clotting conditions and blood-thinning medication.
- Reduced sensation, neuropathy, or difficulty detecting injury.
- Connective-tissue conditions, joint instability, hypermobility, or previous injuries.
- Chronic pain or conditions that affect recovery.
- Skin fragility, bruising tendency, or circulation concerns.
- Fatigue, intoxication, or impaired ability to consent and communicate.

People do not owe a partner their entire medical history. They do need enough information to make a genuinely informed decision; if critical safety information cannot be discussed, choosing not to proceed can be appropriate.

## When to Stop and Seek Help

Stop immediately when an impact goes to an unintended or vulnerable area, or when someone experiences concerning symptoms.

Significant swelling, worsening pain, an expanding lump, restricted movement, new numbness, or weakness warrants medical evaluation.

Blood in urine, worsening flank or abdominal pain, fainting, and suspected internal injury need urgent medical assessment. Severe breathing difficulty, loss of consciousness, serious bleeding, or major neurological symptoms require emergency care.

Accurate information about the location and circumstances of an injury helps medical professionals assess it.

## Final Thoughts

The goal of learning anatomy isn't to discover a place where injury cannot happen. It is to understand why different tissues face different hazards and why accuracy, restraint, and communication matter.

**Knowing where *not* to strike, recognizing limits, and stopping when uncertain are more valuable than increasing intensity.**

---

*Editorial status: draft. Requires independent technical and clinical safety review before publication; this is not a striking tutorial.*
`,li=`# Understanding Impact Implements and Sensations

*How material, shape, contact area, and personal perception influence thud, sting, and the experience of impact play.*

**Level:** Beginner–Intermediate  
**Estimated reading time:** 8 minutes  
**Topics:** Impact Play · Implements · Thud · Sting · Sensory Preferences · Equipment Safety

**Content note:** Discusses pain, impact implements, potential bruising and skin injury. This is an educational comparison, not a technique or purchasing guide.

---

## Why Two Implements Can Feel So Different

Imagine two people who both say they enjoy impact play. One likes the broad, dull sensation of a soft padded paddle. The other prefers brief, sharp sensations and dislikes heavy pressure.

Those preferences are not points along a single scale from beginner to advanced.

They are different **sensory qualities**.

An implement's effect is shaped by material, shape, weight, flexibility, contact area, how it is used, and the receiving person's body and sensitivities. It cannot be predicted from the name of the tool alone.

A padded paddle and a paddle with holes may look similar, but their construction changes how they meet the skin. Two floggers can have different numbers, widths, and weights of tails. Crops come in multiple shapes and tip designs.

The goal of comparing implements isn't to identify the "most intense" or "best." It is to develop better questions about which experiences someone wants—and which hazards deserve extra caution.

## Thud and Sting Are Descriptions, Not Ratings

**Thud** usually refers to a broad, dull, heavy-feeling sensation. It can feel spread out or deep.

**Sting** usually refers to a quicker, sharper, more localized sensation.

Neither word is a precise physical measurement. Someone might describe the same contact as thuddy, sharp, warm, overwhelming, pleasant, or unpleasant depending on context and sensory processing.

An implement can also produce **both** sensations.

Broad contact doesn't guarantee a gentle experience: greater force can injure tissue under the skin. Sharp sensations can be associated with concentrated surface contact, but that does not make every stinging strike superficial.

**Pain, enjoyment, perceived intensity, and injury risk are separate dimensions.**

A person may enjoy sting but dislike bruising, or enjoy deep pressure but find an unexpected sharp edge unpleasant. Ask about each rather than assuming one answer predicts the others.

## Four Design Properties Worth Understanding

### Contact Area

The area over which force is delivered changes the way contact may be felt. Broad surfaces often feel different from narrow edges or small tips.

But a smaller area can concentrate force and raise the likelihood of localized tissue damage. A broad surface can still transmit damaging force to deeper structures.

### Weight and Rigidity

Weight and stiffness affect how a tool moves and how its contact may be experienced.

A heavy or rigid implement may transmit more force than its appearance suggests. No single material—leather, wood, silicone, or another—guarantees a particular level of safety.

### Flexibility and Reach

Flexible tools can bend or continue moving beyond the initial point of contact.

With multi-tail implements, individual tails may follow different paths. **Wrap** describes unintended contact as a flexible implement travels around a body contour toward a vulnerable area.

This is one reason accuracy needs to be evaluated off-body, rather than learned through unplanned contact with another person.

### Surface and Texture

Padding, seams, stitching, holes, inlays, edges, and protrusions alter contact.

Added texture may increase friction, pressure concentration, or abrasion risk. An appearance designed to be striking is not evidence that it is suitable for contact with skin.

## A Comparison of Common Implements

| Implement | Typical sensory possibilities | Important considerations |
| --- | --- | --- |
| Open hand | Can feel broad or sharp depending on contact | No equipment, but force and body location still matter |
| Soft padded paddle | Often broad or muted | Edges, weight, and repeated contact can still cause injury |
| Rigid leather or wooden paddle | May feel mixed, concentrated, or heavy | Hard edges and material stiffness change risk |
| Perforated or textured paddle | Different surface feedback | Holes, patterns, and added surfaces may increase localized skin damage |
| Suede or leather flogger | Can be rhythmic, broad, or sharp | Tail length, thickness, weight, tips, and wrap matter |
| Riding crop | Usually more concentrated | Tip design varies; small contact area demands specialized accuracy |
| Cane | Can produce concentrated, sharp sensations | Elevated welting and deeper-injury risk; seek qualified instruction |
| Single-tail whip | Highly concentrated, potentially severe | Specialist training; not appropriate for beginner experimentation |

This table is descriptive, not a recommendation to try the listed tools. An implement's usual reputation tells you little about the precise risk of a particular encounter.

## Paddles: More Than One Shape

Paddles may differ by material, flexibility, thickness, padding, and surface design.

A **padded** paddle may change how initial contact feels, but padding does not remove force or eliminate injury.

A paddle with **holes** may have different contact and airflow characteristics. Holes are not a simple "more intense" setting, and they should not be treated as a predictable safety feature.

**Inlays, raised patterns, studs, or spikes** can concentrate pressure or abrade and puncture skin. Protruding or sharp designs carry additional injury risks and should not be treated as routine beginner options.

These are good examples of why the Catalog might represent **Material**, **Construction**, and **Surface** separately instead of assuming there is one paddle experience.

## Floggers: Tail Design Changes the Experience

Floggers vary in the number of falls (tails), their widths and lengths, the material, overall weight, and the design of their ends.

A broad, soft tail and a narrow, firm tail may feel different. The way a flogger flexes also affects how easily an uncontrolled tail can wrap beyond the intended area.

The term *flogger* therefore doesn't tell us enough to predict a person's preference.

Someone could love one flogger and dislike another, or enjoy the rhythm but dislike the sensation.

As with other flexible implements, observing movement on an inanimate target before bodily contact is an important precaution, not a guarantee of reliable accuracy.

## Crops and Canes: Small Differences, Important Risks

**Crops** are not a single uniform design. Tip shapes, flexibility, weight, and construction vary, including between products originally intended for equestrian use and those marketed for adult play.

**Canes** differ in material, thickness, flexibility, and other characteristics.

Both can produce concentrated contact and carry significant injury risks; specialized instruction is appropriate before considering their use. Do not infer that an item is suitable for human contact simply because it is sold for another purpose.

At the level of personal preference, someone might be curious about a certain design while remaining entirely uninterested in experiencing it physically.

Curiosity does not imply consent.

## Sensory Preference Is Contextual

Someone's perception can vary with body location, temperature, fatigue, stress, anticipation, physical health, and prior sensation during the same interaction.

A sensation that is enjoyable one day may feel unpleasant another day.

A person can also distinguish between what they **fantasize about**, what they've **tried**, and what they **actually enjoy**.

That distinction matters when comparing implements. Someone may expect a wide, soft flogger to appeal to them, but not know until they have relevant experience—and they may decide never to try it.

Avoid converting interest, perceived pain, and risk into one number.

## Care, Condition, and Hygiene

An implement should be inspected for damaged handles, loosened parts, exposed edges, cracks, fraying, or other defects before it is considered for use.

Material matters for cleaning. Porous or damaged surfaces can be difficult to sanitize, and equipment that contacts broken skin or blood needs appropriate infection-control precautions. Do not assume that wiping an item once makes it safe to share.

If safe cleaning cannot be established, do not share the equipment.

Skin irritation, allergies, or sensitivities to material and surface treatments may also influence whether an item is appropriate.

## Questions for Discovering Your Own Preferences

Consider:

- Is the appeal the sensation itself, the rhythm, anticipation, or another person's attention?
- Do I tend to prefer broad, dull feelings or sharper, more localized ones?
- How do weight, texture, or flexible movement affect my comfort?
- Do I care about aesthetics even if I don't want the item used on my body?
- Are my ratings based on actual experience, curiosity, or someone else's description?
- Could an enjoyable sensation still leave an unwanted mark or injury?

The most informative answers may not be "I like paddles" or "I dislike floggers." They might be "I like broad, predictable sensations and dislike sharp edges" or "I enjoy anticipation but not bruising."

## Final Thoughts

Impact implements aren't interchangeable, and there is no single ladder of intensity that every person should climb.

Materials and shapes create different experiences, but the same design features can also introduce distinct hazards.

**The useful comparison is not which tool is strongest. It's what each person values, what they want to avoid, and what risks they understand.**

---

*Editorial status: draft. Technical and medical/safety review required before publication. This guide intentionally does not give striking instructions.*
`,ci=`# Impact Marks, Bruising, and Recovery: What to Notice and When to Get Help

*Understanding redness, welts, bruises, aftercare, and why a visible mark is not a measure of safety or success.*

**Level:** Beginner–Intermediate  
**Estimated reading time:** 8 minutes  
**Topics:** Impact Play · Marking · Bruising · Aftercare · Tissue Injury · Medical Warning Signs

**Content note:** Discusses bruises, broken skin, infection, and potentially serious injury. This guide is educational, not a diagnosis or substitute for medical assessment.

---

## What a Mark Can—and Cannot—Tell You

Some people find marks emotionally meaningful. They may associate visible evidence of an experience with intimacy, intensity, remembrance, or trust.

Others strongly dislike marks or need to avoid them because of work, personal privacy, physical comfort, or health.

Neither preference is universal, and **consenting to an activity does not automatically mean consenting to a mark**.

More importantly, a mark's appearance cannot fully reveal the physical impact beneath the skin.

A dramatic bruise is not proof of skill. An absence of bruising does not prove that there was no tissue injury.

Understanding what different reactions may indicate is one part of reducing harm.

## Redness: Often Temporary, Not Necessarily Harmless

Redness may result from irritation, friction, or changes in blood flow after contact.

It may fade quickly, but appearance alone does not rule out damage below the surface.

Redness can also be harder to identify on some skin tones. A participant's report of unexpected pain, heat, sensitivity, or other changes matters even when a visible color change is subtle.

Stop if the skin reaction is unexpected or concerning. Do not continue on the assumption that a red area simply needs time to "warm up."

## Welts: A Raised Reaction

A **welt** is a raised area that can develop after localized irritation or injury.

It may be painful, tender, or swollen.

Welts vary in shape, size, and duration. Their appearance is not a reliable measure of the force involved or a safe reason to repeat the activity.

Persistent, unusually painful, spreading, or worsening welts deserve medical assessment—especially when accompanied by substantial swelling or other symptoms.

A welt is not an achievement badge.

## Bruises: Bleeding Beneath the Skin

A **bruise** forms when blood leaks from damaged blood vessels into surrounding tissues.

Bruises may appear hours later, change in color over time, and take days to weeks to improve.

Visibility differs by skin tone, and deeper bruising or hematomas may be less obvious initially.

A **hematoma** is a collection of blood outside blood vessels that may present as a swollen or tender lump. An expanding lump, significant pain, or increasing swelling requires medical evaluation.

Someone might experience an unexpected bruise after an apparently low-intensity session, while another person shows few visible marks despite discomfort.

This variation is one reason trying to produce a predictable mark is unsafe.

## Different Bodies, Different Risk

Bruising and recovery vary.

Potentially relevant factors include bleeding disorders, blood-thinning medications, skin fragility, connective-tissue conditions, age, prior injury, and individual healing differences.

Reduced sensation may also make injury harder to recognize.

A person does not have to disclose every detail of their medical history to a partner. But any activity involving injury risk requires enough relevant discussion to make an informed decision.

If easy bruising or an unexpected health factor is present, postponing impact play or asking a healthcare professional about the concern may be appropriate.

## Why Deliberately Chasing Marks Is Risky

Trying to achieve a particular bruise, welt, or level of swelling can shift attention away from pain signals, the participant's changing condition, and the accumulation of tissue trauma.

An agreed visual goal is not permission to ignore signs of damage or increase force until a mark appears.

A visible result may develop well after the activity. Repeatedly contacting the same tissue while waiting for a mark can worsen injury.

**Marking and intensity are not measures of care, ownership, skill, or consent.**

If the emotional appeal is visual or symbolic, participants can also consider noninjurious alternatives such as makeup, photography of a consensual accessory, clothing, or other chosen symbols.

## Basic Care for Minor, Uncomplicated Bruising

For a small bruise without concerning symptoms, general first-aid measures may include:

- Resting the affected area and avoiding further impact while it heals.
- Using a cold pack **wrapped in cloth**, typically for 10–15 minutes at a time early after injury; do not place ice directly on skin.
- Avoiding aggressive massage and activities that make pain or swelling worse.
- Considering gentle warmth later, when swelling is improving, if it feels comfortable.
- Monitoring symptoms rather than assuming everything visible is the full extent of an injury.

These measures are not appropriate substitutes for medical attention when symptoms are severe, worsening, or otherwise concerning.

If there is broken skin, clean the wound with running water, cover it with a clean dressing, and follow appropriate wound care. Equipment that contacted blood or broken skin needs infection-control precautions; some porous or damaged materials cannot be reliably cleaned for reuse or sharing.

## Warning Signs That Need Attention

### Medical Evaluation

Seek medical assessment for concerning symptoms such as:

- Significant or worsening pain, swelling, or unusual bruising.
- A growing lump or suspected hematoma.
- New numbness, tingling, weakness, or restricted movement.
- Redness that spreads, increasing warmth, pus, fever, or other signs of infection.
- A wound that does not appear to be healing normally.

### Urgent or Emergency Assessment

Blood in urine, severe or increasing flank or abdominal pain after a strike, fainting, and suspected internal injury require urgent medical assessment.

Difficulty breathing, loss of consciousness, major neurological symptoms, suspected fracture with serious impairment, or uncontrolled severe bleeding require emergency care.

When seeking care, provide accurate information about the impact, affected area, equipment, and timing. Clinicians can make better assessments when they know what happened.

Do not attempt to assess a possible internal injury solely by whether a bruise is visible.

## Aftercare Includes More Than Skin Care

Aftercare is the support participants may want after an intense or meaningful experience.

One person may want water, rest, or help getting comfortable. Another may need reassurance, quiet, warmth, cuddling, or time alone.

The person delivering impact can also feel emotionally vulnerable or overwhelmed and may need support.

Ask rather than assume. Aftercare does not necessarily mean physical touch.

If someone is hurt or experiencing concerning symptoms, medical evaluation takes priority over finishing a ritual or maintaining a scene role.

## Check In Again Later

Physical and emotional effects do not always emerge immediately.

An unexpected bruise might appear the next day. An area may feel more sore after activity has ended. Someone may also feel differently about the experience once the intensity and anticipation have passed.

A delayed check-in can help partners notice:

- Whether there are new or worsening physical symptoms.
- Whether the actual experience matched what was negotiated.
- Whether an unexpected mark created a privacy or comfort concern.
- Whether the person who provided the activity is also doing okay.
- Whether anything should change—or stop entirely—in future.

Do not resume impact on injured or healing areas.

## Discussing Marks Before Play

Marking preferences deserve their own conversation, distinct from pain preferences.

Someone might say, "I enjoy a moderate sensation but don't want bruises." Another might enjoy the symbolism of marks but be unwilling to accept the physical risks of pursuing them.

Both positions are coherent.

Relevant questions include:

- Are temporary skin changes acceptable? Is visible bruising a hard limit?
- Are there areas where marks would create particular problems?
- Are there medical concerns about bleeding, skin fragility, or recovery?
- What should happen if an unplanned mark appears?
- How should partners respond if symptoms change over the next several days?

A participant may revise their boundaries after an experience. Prior consent does not oblige them to accept future marking.

## Common Misconceptions

**"No bruise means no injury."** Internal or deeper tissue injuries may not create a visible mark right away.

**"A big bruise means an especially good scene."** A bruise reflects tissue injury, not quality or connection.

**"Experienced people don't bruise."** Experience does not eliminate injury risk.

**"If someone asked for marks, every mark is acceptable."** Consent remains specific and revocable.

**"Aftercare is finished when the scene ends."** Delayed symptoms and emotional responses may call for follow-up.

## Final Thoughts

Marks can carry emotional meaning, but that meaning does not change what is happening physically.

A bruise is a tissue injury. A welt is a sign of local reaction or injury. And pain, visible changes, and deeper harm do not always line up.

The most useful questions are not "Did we leave a mark?" or "How long will it last?"

They are: **Is everyone okay, were the boundaries honored, and what support is needed now?**

---

### Further Reading

- [MedlinePlus — Bruises](https://medlineplus.gov/ency/article/007213.htm)
- [National Coalition for Sexual Freedom — Consent Counts](https://ncsfreedom.org/key-programs-2/consent-counts/)

*Editorial status: draft. Requires independent medical/safety and source review before publication.*
`,di=`# Impact Play: A Beginner's Guide to Sensation, Consent, and Safety

*An approachable starting point for understanding impact play, its appeal, and the risks worth learning before trying it.*

**Level:** Beginner  
**Estimated reading time:** 7 minutes  
**Topics:** Impact Play · Sensation · Consent · Anatomy · Safety · Aftercare

**Content note:** Discusses pain, bruising, injury, and physical contact. This introductory guide is not a substitute for activity-specific training or medical advice.

---

## What Is Impact Play?

**Impact play** is consensual striking or rhythmic contact intended to create a particular sensory, emotional, or relational experience. The implement might be an open hand, a paddle, a flogger, a crop, or another purpose-made tool.

People enjoy impact for different reasons. One person may love the physical sensation, another the anticipation or rhythm, and another the attention and trust involved. Some enjoy consensual pain; others specifically want stimulation that *isn't* very painful.

Impact play is not inherently Dominant or submissive. The person giving an impact does not automatically hold authority, and the person receiving it does not automatically want to submit, be punished, or be marked.

**No impact activity is risk-free.** The aim is understanding, consent, and reducing foreseeable harm—not proving how much intensity someone can endure.

## Thud, Sting, and the Sensation in Between

Two words come up frequently in conversations about impact.

**Thud** describes a broad, dull, heavy sensation. It may feel deep or spread across a larger area.

**Sting** describes a sharper, brighter, more concentrated sensation. It may feel sudden or localized.

They are experiences, not objective measurements or safety categories. The same tool can feel different depending on its material, contact area, force, flexibility, body location, and the receiving person's sensitivity.

A broad thud can still involve damaging deep-tissue force. A sharp sting can still produce welts or abrasions. Neither is automatically safer or more advanced.

A useful first question is: **Which sensation do you actually want?** Another is: **What do you dislike, even when someone else enjoys it?**

For a deeper comparison of materials, designs, and individual implements, see *Understanding Impact Implements and Sensations* in Continue Learning.

## Location Changes Risk

Anatomy matters because bones, joints, nerves, blood vessels, and internal organs are not equally protected.

For beginners, the central fleshy portions of the buttocks are generally a comparatively lower-risk location for *light, carefully controlled* contact. That does not make them safe from bruising, muscle injury, or other harm.

**Avoid impact to the head, face, neck, spine, tailbone, kidney/flank area, chest and ribs, abdomen, joints, bony areas, genital region, and inner thighs.** Do not strike an injured or healing area. Unintended contact can be particularly dangerous with flexible implements.

Body positioning, fatigue, existing injuries, medication, and health conditions can change risk. Someone's ability to tolerate pain is not a reliable measure of tissue safety.

The companion guide *Impact Anatomy and Control* explains why these distinctions matter and how off-body practice fits into risk reduction.

## Agree on the Experience Before Starting

Negotiation should cover more than "Do you like impact?"

Discuss the specific implements and body areas involved, which sensations are welcome, which are off-limits, and whether anything may change mid-scene. Decide what "gentle," "moderate," or "intense" means *for this particular interaction* rather than assuming those words have universal definitions.

Ask about existing injuries and relevant health factors. Easy bruising, bleeding or clotting disorders, blood-thinning medications, altered sensation, hypermobility, connective-tissue conditions, and chronic pain can all change the risk picture. In some circumstances, avoiding the activity or obtaining clinical guidance is wiser than trying to adjust it.

Also discuss whether even a temporary mark would create problems with work, clothing, privacy, comfort, or personal boundaries.

**Consent to impact is not consent to bruising, additional implements, higher intensity, or sexual contact.**

If anyone is intoxicated, exhausted to the point of impaired judgment, unable to communicate reliably, or pressured to agree, postpone.

## Safewords and Everyday Communication

Some partners use **green** for comfortable continuation within the agreement, **yellow** for slowing down or checking in, and **red** for stopping. Agree on the meanings first.

Anyone can use a stop signal, including the person delivering impact.

Watch for unusual silence, freezing, confusion, dissociation, numbness, sharp unexpected pain, weakness, or loss of responsiveness. **Stop and check in even without a safeword** when someone seems unwell or unable to communicate.

A safeword does not prevent an injury that happens before the person can recognize or report it.

Our separate guides on Safewords and Negotiating a Scene go into communication in more depth.

## Tools and Control: Start With Knowledge

Different implements have different distributions of force and different failure modes.

A broad padded surface is not the same as a rigid edge. Flexible tails can travel beyond the intended area. Narrow implements can concentrate force, and added texture or protrusions can increase the chance of skin damage.

Beginners should not assume an implement is suitable simply because it is sold for BDSM use.

For unfamiliar tools, learn about design-specific hazards and practice motion and accuracy **off-body** before considering contact. High-risk equipment, including canes and single-tail whips, calls for specialized in-person education rather than experimentation.

A first exploration need not involve implements at all. Partners may choose a short, low-intensity experience with the option to stop immediately, or may discuss and compare sensations without physical play.

There is no required escalation, strike count, or goal to leave a mark.

## Marks Are Not a Measure of Success

Impact can cause temporary redness, raised welts, abrasions, bruises, or more serious injuries.

**Redness** may be temporary irritation but does not prove tissue is unharmed. **Welts** indicate localized reaction or injury. **Bruises** result from blood leaking from damaged vessels into surrounding tissue, and may become visible later.

Some injuries occur without dramatic marks, and appearance differs between skin tones. A bruise is evidence of injury, not proof of care, skill, trust, or a successful scene.

Stop if an area develops unexpected pain, swelling, or other warning signs. Avoid impacting injured tissue again.

Seek prompt medical assessment for significant or increasing pain or swelling, unusual bruising, weakness, numbness, or a growing lump. Blood in urine, worsening flank or abdominal pain, fainting, or suspected internal injury need urgent evaluation. Breathing problems, loss of consciousness, major neurological symptoms, or serious bleeding require emergency care.

*Marks, Bruising, and Recovery* provides more detail about visible reactions, minor wound care, and when to get help.

## Aftercare and Checking In Later

Aftercare might involve rest, water, comfortable positioning, reassurance, quiet, closeness, solitude, or checking for unexpected injuries. The person delivering impact may also want support.

Ask what each participant actually prefers. There is no universally correct aftercare routine.

Soreness, marks, and emotional responses can emerge later, so a next-day check-in may be useful. Do not resume impact on healing tissue.

## Common Misconceptions

**"Thud can't hurt you."** Broad sensations can accompany deep-tissue injury.

**"No safeword means everything is okay."** Someone may freeze or become unable to communicate.

**"Bruising proves good technique."** Bruising is injury, not an achievement.

**"An experienced partner needs no negotiation."** Preferences, health, and circumstances change.

**"A scene needs to get stronger."** Stopping, pausing, or staying gentle can be the right outcome.

## Final Thoughts

Impact play has many possible meanings, and the most important differences aren't always visible from the outside.

The practice is not about reaching a particular level of pain or collecting marks. It's about understanding the sensations people want, recognizing the limits of any technique, and protecting everyone's ability to choose.

**An enjoyable experience is never worth ignoring a boundary or warning sign.**

---

### Further Reading

- [National Coalition for Sexual Freedom — Consent Counts](https://ncsfreedom.org/key-programs-2/consent-counts/)

*Editorial status: draft. Requires independent technical, medical/safety, accessibility, and source review before publication.*
`,hi=Object.assign({"../../../../education/EDITORIAL_GUIDELINES.md":Vt,"../../../../education/fundamentals/bondage-and-discipline.md":Qt,"../../../../education/fundamentals/collars-and-collaring.md":Xt,"../../../../education/fundamentals/dominance-and-submission.md":Zt,"../../../../education/fundamentals/kink-without-power-exchange.md":Jt,"../../../../education/fundamentals/kinks-are-not-roles.md":ei,"../../../../education/fundamentals/negotiating-a-scene.md":ni,"../../../../education/fundamentals/sadism-and-masochism.md":ti,"../../../../education/fundamentals/safewords.md":ii,"../../../../education/fundamentals/total-power-exchange.md":ai,"../../../../education/fundamentals/understanding-mindspaces.md":oi,"../../../../education/practices/breath-play-choking-and-strangulation.md":si,"../../../../education/practices/impact-anatomy-and-control.md":ri,"../../../../education/practices/impact-implements-and-sensations.md":li,"../../../../education/practices/impact-marks-and-recovery.md":ci,"../../../../education/practices/impact-play-safety.md":di}),ui=[{id:"edu-bd",slug:"bondage-and-discipline",folder:"fundamentals",description:"Restraint, structure, and the meaning of chosen limits.",section:"Understanding BDSM",level:"Beginner",minutes:8,related:["edu-ds","edu-safewords"],subjects:[{target:{kind:"concept",id:"movement-restriction"},relation:"explains"}]},{id:"edu-ds",slug:"dominance-and-submission",folder:"fundamentals",description:"Consent, chosen authority, surrender, and trust.",section:"Understanding BDSM",level:"Beginner",minutes:9,related:["edu-roles","edu-tpe"]},{id:"edu-sm",slug:"sadism-and-masochism",folder:"fundamentals",description:"Understanding sensation, intensity, and consensual pain.",section:"Understanding BDSM",level:"Beginner",minutes:10,related:["edu-safewords","edu-negotiation","edu-impact"]},{id:"edu-safewords",slug:"safewords",folder:"fundamentals",description:"Signals to slow down, pause, or stop any scene.",section:"Consent and scenes",level:"Beginner",minutes:9,related:["edu-negotiation","edu-bd"]},{id:"edu-negotiation",slug:"negotiating-a-scene",folder:"fundamentals",description:"Discuss boundaries, activities, roles, and aftercare.",section:"Consent and scenes",level:"Beginner",minutes:11,related:["edu-safewords","edu-roles"]},{id:"edu-roles",slug:"kinks-are-not-roles",folder:"fundamentals",description:"Why performing an activity does not determine someone's authority role.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:10,related:["edu-no-ds","edu-ds"]},{id:"edu-no-ds",slug:"kink-without-power-exchange",folder:"fundamentals",description:"Collaborative kink that requires neither a Dominant nor a submissive.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:9,related:["edu-roles","edu-negotiation"]},{id:"edu-mindspaces",slug:"understanding-mindspaces",folder:"fundamentals",description:"What mindspaces feel like, how they may shift or blend, and why each person's experience is unique.",section:"Kinks, roles, and motivation",level:"Beginner",minutes:11,related:["edu-roles","edu-no-ds","edu-ds","edu-negotiation"]},{id:"edu-tpe",slug:"total-power-exchange",folder:"fundamentals",description:"Ongoing authority, accountability, consent, and autonomy.",section:"Relationship structures",level:"Beginner–Intermediate",minutes:12,related:["edu-ds","edu-collars"]},{id:"edu-collars",slug:"collars-and-collaring",folder:"fundamentals",description:"Commitment, symbolism, sensory expression, and choice.",section:"Collars, symbols, and rituals",level:"Beginner",minutes:11,related:["edu-ds","edu-tpe"],subjects:[{target:{kind:"catalog-item",id:"collars"},relation:"discusses"}]},{id:"edu-impact",slug:"impact-play-safety",folder:"practices",description:"A beginner's guide to impact sensation, consent, anatomy, and recognizing risks.",section:"Practices & safety",level:"Beginner",minutes:7,related:["edu-impact-tools","edu-impact-anatomy","edu-impact-marks","edu-safewords","edu-negotiation","edu-sm"]},{id:"edu-impact-tools",slug:"impact-implements-and-sensations",folder:"practices",description:"Thud, sting, padding, perforations, materials, flogger tails, crop tips, and sensory differences.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-anatomy","edu-impact-marks"]},{id:"edu-impact-anatomy",slug:"impact-anatomy-and-control",folder:"practices",description:"Anatomy, vulnerable areas, accuracy, off-body practice, and when to stop.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-tools","edu-impact-marks"]},{id:"edu-impact-marks",slug:"impact-marks-and-recovery",folder:"practices",description:"Redness, welts, bruises, tissue injury, aftercare, and medical warning signs.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:8,related:["edu-impact","edu-impact-anatomy","edu-safewords"]},{id:"edu-breath-safety",slug:"breath-play-choking-and-strangulation",folder:"practices",description:"Choking, strangulation, and suffocation: different mechanisms, serious risks, emergency signs, and lower-risk alternatives.",section:"Practices & safety",level:"Beginner–Intermediate",minutes:14,related:["edu-safewords","edu-negotiation","edu-ds","edu-bd"]}],Le=ui.map(n=>{const i=`../../../../education/${n.folder}/${n.slug}.md`,a=hi[i];if(typeof a!="string")throw new Error(`Missing Education source for ${n.id}: ${i}`);const t=a.match(/^# (.+)$/m)?.[1];if(!t)throw new Error(`Missing Education title for ${n.id}`);return{id:n.id,slug:n.slug,title:t,description:n.description,section:n.section,level:n.level,readingMinutes:n.minutes,version:"draft-1",links:[...(n.related||[]).map(o=>({target:{kind:"article",id:o},relation:"further-reading"})),...n.subjects||[]],markdown:a}}),ot=new Set(Le.map(n=>n.id));if(ot.size!==Le.length)throw new Error("Duplicate Education article IDs");for(const n of Le)for(const i of n.links)if(i.target.kind==="article"&&!ot.has(i.target.id))throw new Error(`Missing related article ${i.target.id}`);function mi(n){return n.map(({markdown:i,...a})=>a)}function st({latencyMs:n=180,saveLatencyMs:i=850,referenceData:a=pe,initialPreferences:t=wn}={}){const o=structuredClone(a),r=structuredClone(t),l=new Set;async function y(d,s,h){const f=l.delete(d),b=h?.signal;if(b?.aborted)throw new DOMException("Request canceled","AbortError");if(await new Promise((g,x)=>{const C=()=>{clearTimeout(A),x(new DOMException("Request canceled","AbortError"))},A=setTimeout(()=>{b?.removeEventListener("abort",C),g()},d==="save"?i:n);b?.addEventListener("abort",C,{once:!0})}),b?.aborted)throw new DOMException("Request canceled","AbortError");if(f)throw new be("unavailable","The sample service is temporarily unavailable.");return structuredClone(s())}function p(d){if(d.kind==="concept"){if(!o.concepts.some(h=>h.id===d.conceptId))throw new be("invalid-target","This concept is unavailable.");return}const s=o.items.find(h=>h.id===d.itemId);if(d.kind!=="item"&&d.kind!=="modifier"||!s||d.kind==="modifier"&&!s.groups.find(h=>h.id===d.groupId)?.values.some(h=>h.id===d.valueId))throw new be("invalid-target","This preference target is unavailable.")}return{failNext(d){l.add(d)},services:{catalog:{getReferenceData:d=>y("catalog",()=>o,d)},education:{listArticles:d=>y("education",()=>mi(Le),d),getArticle:(d,s)=>y("education",()=>Le.find(h=>h.id===d)??null,s)},search:{search:(d,s)=>y("search",()=>vn(o,d),s)},preferences:{getSnapshot:d=>y("preferences",()=>r,d),setExperience:(d,s,h,f)=>y("save",()=>{if(!o.items.some(g=>g.id===d))throw new be("invalid-target","This Item is unavailable.");if(s!=="tried"&&s!=="comfort")throw new be("invalid-target","Unknown experience field.");if(h!==void 0&&(s==="tried"?h!==!0:!["uncomfortable","somewhat_comfortable","comfortable"].includes(h)))throw new be("invalid-value","Unknown experience value.");r.experience??={};const b={...r.experience[d]};h===void 0?delete b[s]:s==="tried"?b.tried=!0:b.comfort=h,Object.keys(b).length?r.experience[d]=b:delete r.experience[d]},f),setRating:(d,s,h)=>{const f=structuredClone(d);return y("save",()=>{if(p(f),s!==void 0&&!tt.includes(s))throw new be("invalid-value","Unknown preference rating.");const b=it(f);s===void 0?delete r.ratings[b]:r.ratings[b]=s},h)}}}}}function pi(n){const i={};for(const a of n.items){i[a.id+":overall"]={rating:{kind:"item",itemId:a.id}};for(const t of a.groups)for(const o of t.values)i[a.id+":"+t.name+":"+o.name]={rating:{kind:"modifier",itemId:a.id,groupId:t.id,valueId:o.id}};for(const t of["tried","comfort"])i[`experience:${a.id}:${t}`]={itemId:a.id,field:t}}for(const a of n.concepts)i[`concept:${a.id}:preference`]={rating:{kind:"concept",conceptId:a.id}};return i}function rt(n){const i=et(),a=nt(),[t]=c.useState(()=>st({latencyMs:0})),o=i??t.services,r=a?.referenceData??pe,l=a?.snapshot??wn,y=pi(r),[p,d]=c.useState(()=>Object.fromEntries(Object.entries(y).map(([k,E])=>[k,"rating"in E?l.ratings[it(E.rating)]:l.experience?.[E.itemId]?.[E.field]]))),s=c.useRef({}),[h,f]=c.useState({}),[b,g]=c.useState([]),[x,C]=c.useState(!1),[A,M]=c.useState({}),P=c.useRef(p),S=c.useRef({}),w=c.useRef({});c.useEffect(()=>()=>Object.values(w.current).forEach(clearTimeout),[]);const D=c.useCallback((k,E,G=!1)=>{const H=(S.current[k]||0)+1;S.current[k]=H,P.current={...P.current,[k]:E},d(P.current),g(F=>[...F,{target:k,value:E,version:H,recordedAt:new Date().toISOString()}]),f(F=>({...F,[k]:"saving"})),clearTimeout(w.current[k]),G&&(n??(i?void 0:t))?.failNext("save");const U=async()=>{if(S.current[k]===H)try{const F=y[k];if(!F)throw new Error("Unknown explicit record target");if("rating"in F?await o.preferences.setRating(F.rating,E):await o.preferences.setExperience(F.itemId,F.field,E),S.current[k]!==H)return;f(Q=>({...Q,[k]:"saved"})),w.current[k]=setTimeout(()=>{S.current[k]===H&&f(Q=>({...Q,[k]:"idle"}))},1250)}catch{S.current[k]===H&&f(F=>({...F,[k]:"failed"}))}},_=s.current[k],V=_?_.then(U):U();return s.current[k]=V,V.then(()=>{s.current[k]===V&&delete s.current[k]}),H},[o,r,n,i,t]),j=c.useCallback(k=>D(k,P.current[k]),[D]),N=c.useCallback((k,E,G)=>S.current[k]!==E?!1:(D(k,G),!0),[D]);return{values:p,saves:h,revisions:b,helpOpen:x,setHelpOpen:C,views:A,setViews:M,commit:D,retry:j,restore:N}}const xn=c.createContext(null);function gi({children:n,diagnostics:i}){const a=rt(i);return e.jsx(xn.Provider,{value:a,children:n})}function Xe(){const n=c.useContext(xn),i=rt();return n||i}function ve(n,i,a){const t=c.useContext(xn),[o,r]=c.useState(a),l=`${n}:${i}`;return[t?t.views[l]??o:o,p=>{if(!t){r(p);return}t.setViews(d=>({...d,[l]:typeof p=="function"?p(d[l]??o):p}))}]}function yi(){const{saves:n,retry:i}=Xe(),a=Object.keys(n).filter(t=>n[t]==="failed");return a.length?e.jsxs("div",{className:"cc-error-summary",role:"status",children:[e.jsxs("span",{children:[a.length," changes not saved · Latest edits kept in this Lab session"]}),e.jsx("button",{type:"button",onClick:()=>a.forEach(i),children:"Retry all"})]}):null}const kn=tt,fi=["Strong enthusiasm, personal importance, or both; experience is not required.","A positive personal preference; experience is not required.","Potential personal interest in participating, distinct from wanting to learn.","Considered, but no clear preference yet. Distinct from no answer.","Not interested at present; distinct from a firm boundary.","An explicit firm boundary, independent of experience.","This target genuinely does not apply in the stated context; not disinterest or inexperience."];function lt(){return e.jsxs("dl",{children:[kn.map((n,i)=>e.jsxs("div",{children:[e.jsx("dt",{children:n}),e.jsx("dd",{children:fi[i]})]},n)),e.jsx("p",{children:"Preference, Tried and Comfort are independent. These records do not establish consent."})]})}function ct(n){return n.items.map(i=>({...i,groups:i.groups.map(a=>({name:a.name,values:a.values.map(t=>t.name)}))}))}function dt(n){return n.concepts.map(i=>({...i,related:(i.relatedItemIds??[]).map(a=>n.items.find(t=>t.id===a)?.name).filter(a=>!!a)}))}const On=ct(pe);Object.fromEntries([...new Set(On.map(n=>n.category))].map(n=>[n,On.filter(i=>i.category===n).map(i=>i.name)]));function Fe(){const n=nt(),i=n?.referenceData??pe;return{data:i,items:ct(i),concepts:dt(i),classifications:(n?.snapshot??wn).classifications,catalogSeeds:Object.fromEntries([...new Set(i.items.map(a=>a.category))].map(a=>[a,[]]))}}const bi=kn;function Re({initialItem:n,initialGroup:i,initialValue:a,onClose:t,subject:o,compact:r=!1,collection:l="kinks"}){const{data:y,items:p,catalogSeeds:d,classifications:s}=Fe(),h=c.useId(),f=c.useId(),b=c.useId(),g=u=>b+"-"+encodeURIComponent(u),x=l==="rewards",C=`${l}:${o||"all"}:${r?"compact":"list"}`,[A,M]=ve(C,"mine",!1),[P,S]=ve(C,"reward",!1),[w,D]=ve(C,"punishment",!1),[j,N]=ve(C,"answers",[]),[k,E]=c.useState(!1),[G,H]=c.useState(null),U=c.useRef(null),[_,V]=ve(C,"sort","default"),[F,Q]=ve(C,"group","none"),[we,ge]=c.useState(!1),[X,le]=ve(C,"query",""),[T,O]=c.useState(X),Z=!!ue(T),J=!Z&&x&&_==="default"?"az":_,ye=()=>{le(""),O("")},[xe,se]=c.useState(null),[ee,He]=c.useState({}),[ke,je]=c.useState({}),te=Xe(),Se=te.values,W=te.saves,[ne,Ae]=c.useState(!1),[fe,Ue]=c.useState(null),[ce,Te]=c.useState(null),[ie,m]=c.useState(null),[R,Y]=c.useState(!1),Ce=Oe(),Ie=c.useRef(null);c.useEffect(()=>{const u=setTimeout(()=>O(X),275);return()=>clearTimeout(u)},[X]),c.useEffect(()=>{He({})},[T,F,_]),c.useEffect(()=>{x&&Ie.current?.scrollIntoView({block:"start"})},[x,T,A,P,w,j]),c.useEffect(()=>{if(!ce)return;const u=requestAnimationFrame(()=>{const v=[...document.querySelectorAll("[data-field-id]")].find(I=>I.dataset.fieldId===ce);v?.scrollIntoView({block:"nearest"}),(v?.querySelector(".kp-retry")||v?.querySelector(".kp-rating"))?.focus()});return()=>cancelAnimationFrame(u)},[ce,xe,ke]),c.useEffect(()=>{if(!n)return;const u=p.find(v=>v.name===n);u&&(Sn(u.id),i&&a&&(je({[u.id+":"+i]:!0}),Te(null),Ue(u.id+":"+i+":"+a)))},[n,i,a]),c.useEffect(()=>{if(!fe)return;const u=requestAnimationFrame(()=>{const I=[...document.querySelectorAll("[data-field-id]")].find(B=>B.dataset.fieldId===fe);I?.scrollIntoView({block:"nearest"}),I?.querySelector(".kp-rating")?.focus()}),v=setTimeout(()=>Ue(null),1800);return()=>{cancelAnimationFrame(u),clearTimeout(v)}},[fe,xe]);function Sn(u){je({}),Ae(!1),Te(null),se(u);const v=Object.keys(W).find(I=>I.startsWith(u+":")&&W[I]==="failed");v&&ze(v)}function ze(u){const v=p.find(B=>u.startsWith(B.id+":"));if(!v)return;se(v.id);const I=v.groups.find(B=>u.startsWith(v.id+":"+B.name+":"));I&&je(B=>({...B,[v.id+":"+I.name]:!0})),Te(u)}function An(){se(null),t?.()}function yt(){m(null)}const Tn=Ce.notify;function ft(u,v){const I=te.values[u],B=te.commit(u,v,R);Y(!1),v===void 0&&I!==void 0&&Tn({message:"Rating cleared",kind:"info",actionLabel:"Undo",duration:5e3,onAction:()=>{te.restore(u,B,I)||Tn({message:"A newer edit was kept",kind:"info"})}})}function Ze(u){const v=document.activeElement?.getAttribute("aria-label")?.startsWith("Retry saving");te.retry(u),v&&requestAnimationFrame(()=>[...document.querySelectorAll("[data-field-id]")].find(I=>I.dataset.fieldId===u)?.querySelector(".kp-rating")?.focus())}function Je(u,v,I){return e.jsx("span",{"data-field-id":u,children:e.jsx(Xn,{value:Se[u],label:v,saveState:W[u],onRetry:()=>Ze(u),onActivate:()=>m({id:u,label:v,parent:I})})})}const Cn=A||P||w||j.length>0,In=()=>{M(!1),S(!1),D(!1),N([])},bt=new Set(["Praise","Privileges","Protocol","Permission Rituals","Rules","Training","Teasing","Anticipation"]),Ne=new Map(p.map(u=>[u.id,at(u,T)])),de=p.filter(u=>{if(!x)return(!o||y.subjects.find(B=>B.name===o)?.itemIds.includes(u.id)||u.name===o)&&Ne.get(u.id)!==null;const v=s[u.id]??{reward:"unanswered",punishment:"unanswered"};if(!bt.has(u.name)&&v.reward!=="yes"&&v.punishment!=="yes"||A&&v.reward!=="yes"&&v.punishment!=="yes")return!1;const I=P||w?[...P?["reward"]:[],...w?["punishment"]:[]]:["reward","punishment"];return(P||w||j.length>0)&&!I.some(B=>j.length?j.includes(v[B]):v[B]==="yes")?!1:Ne.get(u.id)!==null}).sort((u,v)=>J==="az"?u.name.localeCompare(v.name):J==="za"?v.name.localeCompare(u.name):Z?(Ne.get(v.id)?.score??0)-(Ne.get(u.id)?.score??0)||u.name.localeCompare(v.name):0),en=!r&&!o&&new Set(de.map(u=>u.category)).size>1,nn=en?F:"none",vt=r||nn==="none"?[["All Items",de]]:Object.keys(d).filter(u=>de.some(v=>v.category===u)).map(u=>[u,de.filter(v=>v.category===u)]);c.useEffect(()=>{if(!G)return;const u=I=>{I.key==="Escape"&&(H(null),U.current?.focus())},v=I=>{Ie.current?.querySelector(".cc-rp-popover:not([hidden])")?.parentElement?.contains(I.target)||H(null)};return document.addEventListener("keydown",u),document.addEventListener("pointerdown",v),document.addEventListener("focusin",v),()=>{document.removeEventListener("keydown",u),document.removeEventListener("pointerdown",v),document.removeEventListener("focusin",v)}},[G]);function wt(u){const v=u.id+":overall",I=u.groups.some(q=>q.values.length>0),B=Object.keys(W).filter(q=>q.startsWith(u.id+":")&&q!==v),ae=Object.keys(Se).some(q=>q.startsWith(u.id+":")&&q!==v&&Se[q]!==void 0),Pe=B.some(q=>W[q]==="failed")?"failed":B.some(q=>W[q]==="saving")?"saving":void 0;return e.jsx(Wt,{name:u.name,itemId:u.id,supportingText:$t(Ne.get(u.id)??null,T),indicators:x&&e.jsx("span",{className:"cc-rp-indicators",children:["reward","punishment"].map(q=>{const oe=s[u.id]?.[q]??"unanswered",L=G?.id===u.id&&G.kind===q,De=q==="reward"?"Reward":"Punishment",Dn=oe==="yes"?"Yes":oe==="no"?"No":"Unanswered";return e.jsxs("span",{className:"cc-rp-indicator-anchor",children:[e.jsxs("button",{type:"button",className:"cc-rp-indicator cc-rp-state-"+oe,"aria-label":u.name+": "+De+" — "+Dn+". Show explanation","aria-expanded":L,"aria-controls":g(u.id+q),onClick:kt=>{U.current=kt.currentTarget,H(L?null:{id:u.id,kind:q})},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:q==="reward"?e.jsxs(e.Fragment,{children:[e.jsx("rect",{x:"3",y:"9",width:"18",height:"12",rx:"2"}),e.jsx("path",{d:"M12 9v12M3 13h18M12 9c-7 0-7-7-3-7 2.5 0 3 4 3 7Zm0 0c7 0 7-7 3-7-2.5 0-3 4-3 7Z"})]}):e.jsx(e.Fragment,{children:e.jsx("path",{d:"m13 4 7 7M10 7l7 7M4 20l10-10M2 22l4-4M14 2l8 8"})})}),e.jsx("span",{"aria-hidden":"true",children:oe==="yes"?"✓":oe==="no"?"✕":"?"})]}),e.jsxs("span",{id:g(u.id+q),hidden:!L,className:"cc-rp-popover",role:"note","aria-label":De+" classification for "+u.name,children:[e.jsxs("strong",{children:[De," · ",Dn]}),e.jsx("span",{children:oe==="yes"?"You've classified this Item as a "+De.toLowerCase()+".":oe==="no"?"You've marked this Item as not a "+De.toLowerCase()+".":"You haven't answered whether this Item is a "+De.toLowerCase()+"."}),e.jsx("button",{type:"button",onClick:()=>{H(null),U.current?.focus()},children:"Close"})]})]},q)})}),preference:Je(v,u.name+" overall",u.name),onRefine:I?()=>Sn(u.id):void 0,refined:ae,refineStatus:Pe},u.id)}const re=p.find(u=>u.id===xe);function xt(u){const v=Object.keys(W).filter(B=>B.startsWith(u.id+":")&&B!==u.id+":overall"&&W[B]==="failed"),I=Math.max(0,v.indexOf(ce||""));return e.jsxs("div",{className:"cc-refine-content",children:[v.length>0&&e.jsxs("div",{className:"cc-error-summary",role:"status",children:[e.jsxs("span",{children:["Issue ",I+1," of ",v.length," · Latest edits kept"]}),e.jsx("button",{onClick:()=>v.forEach(Ze),children:"Retry all"}),v.length>1&&e.jsx("button",{onClick:()=>ze(v[(I+1)%v.length]),children:"Next issue"})]}),u.groups.map(B=>{const ae=u.id+":"+B.name,Pe=ke[ae]??!1,q=B.values.map(L=>ae+":"+L),oe=q.some(L=>W[L]==="failed")?"failed":q.some(L=>W[L]==="saving")?"saving":void 0;return e.jsx(yn,{title:B.name,description:B.values.length+" options",open:Pe,status:oe,onToggle:()=>{je(L=>({...L,[ae]:!Pe})),!Pe&&oe==="failed"&&ze(q.find(L=>W[L]==="failed"))},children:e.jsx("div",{className:"cc-values",children:B.values.map(L=>e.jsxs("div",{className:"cc-value"+(ce===ae+":"+L||fe===ae+":"+L?" cc-value-highlight":""),"data-field-id":ae+":"+L,children:[e.jsx("span",{children:L}),Je(ae+":"+L,L,u.name+" / "+B.name)]},L))})},ae)}),e.jsx(Lt,{itemId:u.id,name:u.name,open:ne,onToggle:()=>Ae(!ne),records:te})]})}return e.jsxs("section",{className:"cc",ref:Ie,"aria-label":"Interactive inline Catalog prototype",children:[!r&&e.jsxs("div",{className:"cc-demo cc-demo-compact",children:[e.jsxs("span",{children:[p.length," sample Items · Session only · Local service saves"]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:R,onChange:u=>Y(u.target.checked)})," Test save failure"]})]}),Object.values(W).includes("failed")&&e.jsxs("div",{className:"cc-error-summary",role:"status",children:[e.jsxs("span",{children:[Object.values(W).filter(u=>u==="failed").length," changes not saved · Latest edits kept"]}),e.jsx("button",{onClick:()=>Object.keys(W).filter(u=>W[u]==="failed").forEach(Ze),children:"Retry all"}),e.jsx("button",{onClick:()=>ze(Object.keys(W).find(u=>W[u]==="failed")),children:"Review issues"})]}),e.jsxs("div",{className:"cc-browser",children:[!r&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"cc-search-label",htmlFor:h,children:"Search Items"}),e.jsxs(We,{children:[e.jsx(Me,{mode:"input",inputId:h,placeholder:"Search Items…",ariaLabel:x?"Search Items in rewards and punishments":"Search Items in kinks",value:X,onChange:le,onClear:ye,resultsId:f}),e.jsx(qe,{active:_!=="default"||nn!=="none",groupingAvailable:en,expanded:we,onClick:()=>ge(!0)})]}),x&&e.jsx(Qe,{label:"Reward and punishment filters",options:[{id:"mine",label:"Mine",active:A,onClick:()=>M(!A)},{id:"reward",label:"Reward",active:P,onClick:()=>S(!P)},{id:"punishment",label:"Punishment",active:w,onClick:()=>D(!w)},{id:"answers",opensDialog:!0,expanded:k,label:j.length?"Answers · "+j.length:"Answers",active:j.length>0,onClick:()=>E(!0)}],clear:Cn?In:void 0}),e.jsx("div",{className:"cc-toolbar cc-toolbar--compact",children:e.jsxs("span",{"aria-live":"polite","aria-atomic":"true",children:[de.length," ",de.length===1?"Item":"Items"]})})]}),e.jsxs("div",{className:"cc-sections",id:f,"aria-busy":X!==T,children:[vt.filter(([,u])=>u.length).map(([u,v])=>e.jsxs("section",{className:"cc-section",children:[u!=="All Items"&&e.jsx("h2",{className:"cc-category-heading",children:e.jsxs("button",{className:"cc-section-title","aria-controls":g(u),"aria-expanded":!ee[u],onClick:()=>He(I=>({...I,[u]:!I[u]})),children:[e.jsxs("span",{children:[u==="All Items"?"":u," ",e.jsx("small",{children:u==="All Items"?"":v.length+" Items"})]}),e.jsx("span",{"aria-hidden":"true",children:ee[u]?"⌄":"⌃"})]})}),e.jsx("div",{id:g(u),hidden:!!ee[u],className:"cc-section-items",children:!ee[u]&&v.map(wt)})]},u)),de.length===0&&e.jsxs("div",{className:"cc-empty",children:[e.jsx("p",{children:"No matching Items. Try another search or adjust filters."}),e.jsxs("div",{className:"cc-empty-actions",children:[X&&e.jsx("button",{type:"button",onClick:ye,children:"Clear search"}),x&&Cn&&e.jsx("button",{type:"button",onClick:In,children:"Clear filters"})]})]})]})]}),e.jsxs(me,{open:x&&k,onClose:()=>E(!1),label:"Answer states",closeLabel:"Close answer states",children:[e.jsx(Be,{title:"Answer states",context:"REWARDS & PUNISHMENTS",onClose:()=>E(!1),closeLabel:"Close answer states"}),e.jsx("p",{className:"cc-refine-intro",children:"Filter by your classification answers"}),e.jsx(Qe,{label:"Classification answer states",options:[["unanswered","? Unanswered"],["no","✕ No"],["yes","✓ Yes"]].map(([u,v])=>({id:u,label:v,active:j.includes(u),onClick:()=>N(I=>I.includes(u)?I.filter(B=>B!==u):[...I,u])}))}),e.jsxs("p",{className:"cc-rp-count",children:[de.length," matching Items"]})]}),e.jsx(fn,{open:we,onClose:()=>ge(!1),sort:J,onSort:V,group:nn,onGroup:Q,showGrouping:en,defaultSortLabel:Z?"Best matches":"Catalog order",showDefault:!x||Z}),e.jsx(me,{open:!!re,onClose:An,label:"Refine "+(re?.name||""),closeLabel:"Close refinement",className:ie?"cc-refine-underlay":"",panelClassName:"cc-refine-sheet",children:re&&e.jsxs(e.Fragment,{children:[e.jsx(Be,{title:re.name,context:"REFINE ITEM",onClose:An,closeLabel:"Close refinement",children:e.jsx("div",{className:"cc-refine-overall",children:Je(re.id+":overall",re.name+" overall",re.name)})}),xt(re)]})}),ie&&e.jsx(Zn,{open:!0,onClose:yt,label:ie.label,context:ie.parent,value:Se[ie.id],options:bi,onChange:u=>ft(ie.id,u),help:e.jsx(lt,{}),helpOpen:te.helpOpen,onHelpOpenChange:te.setHelpOpen,className:re?"cc-rating-over-refine":""})]})}class vi extends c.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidUpdate(i){i.resetKey!==this.props.resetKey&&this.state.failed&&this.setState({failed:!1})}render(){return this.state.failed?e.jsxs("main",{className:"kp-view-recovery",role:"alert",children:[e.jsx("h1",{children:"This view could not be displayed"}),e.jsx("p",{children:"Your mounted Lab session records are retained. Try this view again or return Home."}),e.jsx("button",{type:"button",onClick:()=>this.setState({failed:!1}),children:"Try again"}),e.jsx("button",{type:"button",onClick:()=>{this.setState({failed:!1}),this.props.onHome()},children:"Back to Home"})]}):this.props.children}}const K={id:"preference-reflection",version:"reflection-v1",title:"Reflect on your interests",prompts:[{id:"interest",label:"What would you like to understand about your interests?"},{id:"comfort",label:"What helps you feel comfortable while exploring?"},{id:"next",label:"What would you like to learn or explore next?"}]};function wi(){const[n,i]=c.useState([]),[a,t]=c.useState([]);return{dismissed:n,attempts:a,start:p=>{const d=crypto.randomUUID();return t(s=>[...s,{id:d,activityId:K.id,version:K.version,previousAttemptId:p,status:"draft",step:0,answers:{},updatedAt:new Date().toISOString()}]),d},update:(p,d,s)=>t(h=>h.map(f=>f.id===p&&f.status==="draft"?{...f,answers:{...f.answers,[d]:s},updatedAt:new Date().toISOString()}:f)),complete:p=>t(d=>d.map(s=>s.id===p&&s.status==="draft"?{...s,status:"complete",answers:{...s.answers},completedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}:s)),setStep:(p,d)=>t(s=>s.map(h=>h.id===p&&h.status==="draft"?{...h,step:Math.max(0,Math.min(K.prompts.length-1,d))}:h)),dismiss:p=>i(d=>d.includes(p)?d:[...d,p]),restore:p=>i(d=>d.filter(s=>s!==p)),resetDismissals:()=>i([]),remove:p=>t(d=>d.filter(s=>s.id!==p))}}const ht=c.createContext(null);function xi({children:n}){const i=wi();return e.jsx(ht.Provider,{value:i,children:n})}function ut(){const n=c.useContext(ht);if(!n)throw new Error("DiscoverSessionProvider is required");return n}function Fn({open:n,title:i,description:a,confirmLabel:t,onConfirm:o,onCancel:r}){return e.jsxs(me,{open:n,onClose:r,label:i,closeLabel:"Cancel confirmation",children:[e.jsx(Be,{title:i,onClose:r,closeLabel:"Cancel confirmation"}),e.jsx("p",{children:a}),e.jsxs("div",{className:"kp-confirmation-actions",children:[e.jsx("button",{type:"button",onClick:r,children:"Cancel"}),e.jsx("button",{type:"button",onClick:o,children:t})]})]})}function z({title:n,description:i,icon:a,featured:t=!1,onClick:o,href:r,children:l,className:y="",status:p,actionLabel:d}){const s=c.useId(),h=!!(o||r),f=`ui-lab-app-tile lab-card${t?" featured":""}${y?" "+y:""}`,b=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"ui-lab-app-tile-icon","aria-hidden":"true",children:a}),h?e.jsx("strong",{children:n}):e.jsx("h2",{children:n}),i&&e.jsx("small",{id:s,children:i}),p&&e.jsx("span",{id:s+"-status",className:"lab-card-status",children:p}),h&&e.jsx("span",{className:"ui-lab-app-tile-arrow","aria-hidden":"true",children:"↗"})]}),g={"aria-label":d??n,"aria-describedby":[i&&s,p&&s+"-status"].filter(Boolean).join(" ")||void 0};return l?e.jsxs("section",{className:f,"aria-label":n,children:[o?e.jsx("button",{type:"button",className:"lab-card-main",...g,onClick:o,children:b}):b,l]}):r?e.jsx("a",{className:f,...g,href:r,children:b}):o?e.jsx("button",{type:"button",className:f,...g,onClick:o,children:b}):e.jsx("section",{className:f,"aria-label":n,children:b})}const sn=[{id:"reflection",title:K.title,reason:"Optional reflection · Your notes stay separate from profile records.",icon:"✧"},{id:"catalog-subjects",title:"Explore Catalog subjects",reason:"General exploration · Browse by subject at your own pace.",area:"Catalog",workspace:"",icon:"◇"},{id:"concepts",title:"Explore concepts",reason:"General learning · Understand meanings without recording a preference.",area:"Catalog",workspace:"Concept Explorer",icon:"♡"},{id:"education-articles",title:"Read education articles",reason:"Beginner guides · Reading never changes your profile.",area:"Learn",workspace:"",icon:"✧"}];function mt({go:n,card:i=!1,title:a="Continue"}){const{attempts:t}=ut(),o=t.filter(l=>l.status==="draft").sort((l,y)=>y.updatedAt.localeCompare(l.updatedAt)),r=e.jsxs(e.Fragment,{children:[o.length?o.slice(0,3).map(l=>e.jsxs("div",{className:"lab-list-row",children:[e.jsxs("span",{children:[e.jsx("strong",{children:K.title}),e.jsx("small",{children:"Saved in this Lab session"})]}),e.jsx("button",{onClick:()=>n("Discover","Activity",{attempt:l.id}),children:"Resume"})]},l.id)):e.jsx("p",{children:"No unfinished activities. Start one when you choose."}),e.jsx("button",{className:"lab-text-link",onClick:()=>n("Discover","Saved Activities"),children:"View all activities"})]});return i?e.jsx(z,{title:a,icon:a==="Continue"?"✧":"✦",featured:a==="Continue",className:"lab-continue-card",onClick:()=>n("Discover","Saved Activities"),actionLabel:"View saved activities",children:r}):e.jsxs("section",{className:"lab-section",children:[e.jsx("h2",{children:"Continue exploring"}),r]})}function ki({view:n,attemptId:i,go:a}){const t=ut(),{notify:o}=Oe(),[r,l]=c.useState(!1),[y,p]=c.useState(null),d=g=>{a("Discover","Activity",{attempt:t.start(g)})},s=t.attempts.find(g=>g.id===i),h=s?.step||0,f=g=>e.jsxs("div",{className:"lab-list-row",children:[e.jsxs("span",{children:[e.jsx("strong",{children:K.title}),e.jsx("small",{children:g.status==="complete"?`Completed ${new Date(g.completedAt).toLocaleDateString()}`:"Draft · Session only"})]}),e.jsx("button",{onClick:()=>a("Discover","Activity",{attempt:g.id}),children:g.status==="complete"?"Review":"Resume"}),e.jsx("button",{onClick:()=>p(g.id),"aria-label":`Delete activity ${g.id}`,children:"Delete"})]},g.id);let b;return n==="Manage Suggestions"?b=e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"Dismissals apply to the content throughout this Lab session. Restoring affects suggestions only."}),t.dismissed.length?t.dismissed.map(g=>e.jsxs("div",{className:"lab-list-row",children:[e.jsx("span",{children:sn.find(x=>x.id===g)?.title||"Unavailable content"}),e.jsx("button",{onClick:()=>t.restore(g),children:"Restore"})]},g)):e.jsx("p",{children:"No dismissed suggestions."}),t.dismissed.length>0&&e.jsx("button",{onClick:()=>l(!0),children:"Reset all dismissals"})]}):n==="Saved Activities"?b=e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"lab-section",children:[e.jsx("h2",{children:"Unfinished"}),t.attempts.filter(g=>g.status==="draft").map(f),!t.attempts.some(g=>g.status==="draft")&&e.jsx("p",{children:"No unfinished activities."})]}),e.jsxs("section",{className:"lab-section",children:[e.jsx("h2",{children:"Completed"}),t.attempts.filter(g=>g.status==="complete").map(f),!t.attempts.some(g=>g.status==="complete")&&e.jsx("p",{children:"No completed activities."})]}),e.jsx("button",{onClick:()=>d(),children:"Start a reflection"})]}):n==="Activity"?b=s?s.status==="complete"?e.jsxs("section",{className:"lab-section",children:[e.jsxs("p",{children:["Completed reflection · ",s.version,". These notes are a historical snapshot and do not change your profile."]}),e.jsx("dl",{children:K.prompts.map(g=>e.jsxs("div",{children:[e.jsx("dt",{children:g.label}),e.jsx("dd",{children:s.answers[g.id]||"No answer recorded"})]},g.id))}),s.previousAttemptId&&e.jsx("button",{onClick:()=>a("Discover","Activity",{attempt:s.previousAttemptId}),children:"Previous attempt"}),e.jsx("button",{onClick:()=>d(s.id),children:"Repeat with latest version"}),e.jsx("button",{onClick:()=>a("Discover","Saved Activities"),children:"Back to activities"})]}):e.jsxs("section",{className:"lab-section lab-focused-workflow",children:[e.jsxs("p",{children:["Optional prompt ",h+1," of ",K.prompts.length," · ",K.version]}),e.jsx("label",{htmlFor:"lab-reflection-answer",children:K.prompts[h].label}),e.jsx("textarea",{id:"lab-reflection-answer",value:s.answers[K.prompts[h].id]||"",onChange:g=>t.update(s.id,K.prompts[h].id,g.target.value)}),e.jsx("p",{children:"Notes are kept in this Lab session as you type. Finishing does not record preferences, Tried or Comfort."}),e.jsxs("div",{className:"lab-dialog-actions",children:[h>0&&e.jsx("button",{onClick:()=>t.setStep(s.id,h-1),children:"Previous prompt"}),h<K.prompts.length-1?e.jsx("button",{onClick:()=>t.setStep(s.id,h+1),children:"Next prompt"}):e.jsx("button",{onClick:()=>{t.complete(s.id),o({message:"Reflection completed",kind:"success"})},children:"Finish reflection"}),e.jsx("button",{onClick:()=>a("Discover","Saved Activities"),children:"Save and exit"})]})]}):e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"This activity is unavailable in the current Lab session."}),e.jsx("button",{onClick:()=>a("Discover","Saved Activities"),children:"Back to activities"})]}):b=e.jsxs(e.Fragment,{children:[e.jsx("nav",{className:"ui-lab-app-modes","aria-label":"Ways to discover",children:["Learn","React","Play"].map(g=>e.jsx("button",{"aria-current":n===g?"page":void 0,className:n===g?"active":"",onClick:()=>a("Discover",g),children:g},g))}),e.jsxs("div",{className:"ui-lab-app-grid lab-card-grid lab-discover-cards",children:[sn.filter(g=>!t.dismissed.includes(g.id)).map(g=>e.jsx(z,{title:g.title,description:g.reason,icon:g.icon,featured:g.id==="reflection",onClick:()=>g.id==="reflection"?d():a(g.area,g.workspace),actionLabel:`Open ${g.title}`,children:e.jsx("div",{className:"lab-card-actions",children:e.jsx("button",{onClick:()=>t.dismiss(g.id),"aria-label":`Dismiss ${g.title}`,children:"Dismiss"})})},g.id)),sn.every(g=>t.dismissed.includes(g.id))&&e.jsx(z,{title:"Explore something new",icon:"◇",description:"No suggestions shown. Restore content in Manage Suggestions.",onClick:()=>a("Discover","Manage Suggestions")}),e.jsx(mt,{go:a,card:!0,title:"Continue exploring"})]}),e.jsx("div",{className:"lab-card-footer",children:e.jsx("button",{className:"lab-text-link",onClick:()=>a("Discover","Manage Suggestions"),children:"Manage Suggestions"})})]}),e.jsxs(e.Fragment,{children:[b,e.jsx(Fn,{open:r,title:"Reset suggestion dismissals?",description:"Restore all dismissed suggestions in this Lab session. Catalog preferences, experience records and saved activities stay unchanged.",confirmLabel:"Restore all suggestions",onCancel:()=>l(!1),onConfirm:()=>{t.resetDismissals(),l(!1)}}),e.jsx(Fn,{open:!!y,title:"Delete saved activity?",description:"Delete this activity from the current Lab session. Profile records and other attempts stay unchanged.",confirmLabel:"Delete activity",onCancel:()=>p(null),onConfirm:()=>{t.remove(y),p(null)}})]})}function ji({area:n,workspace:i,go:a,shortcuts:t,onShortcuts:o}){const r=Xe(),{items:l}=Fe(),[y,p]=c.useState(!1),d=Object.entries(r.values).filter(([,s])=>s!==void 0);return n==="Home"?e.jsxs("div",{className:"ui-lab-app-grid lab-card-grid lab-home-cards",children:[e.jsx(mt,{go:a,card:!0}),e.jsx(z,{title:"Your profile at a glance",icon:"♡",description:d.length?`${d.length} explicit records in this session.`:"No preferences or experience recorded in this Lab session.",onClick:()=>a("Profile")}),e.jsx(z,{title:"Discover something",icon:"◇",description:"Optional ideas, without pressure",onClick:()=>a("Discover")}),e.jsxs(z,{title:"Your shortcuts",icon:"✦",description:"Quick access to the tools you choose",className:"lab-shortcut-card",children:[e.jsx("div",{className:"lab-shortcuts",children:t.map(s=>e.jsx("button",{type:"button",onClick:()=>a(s),children:s},s))}),e.jsx(yn,{title:"Edit shortcuts",open:y,onToggle:()=>p(!y),children:["Catalog","Profile","Discover","Tools","Creations","Learn"].map(s=>e.jsxs("label",{className:"lab-shortcut-choice",children:[e.jsx("input",{type:"checkbox",checked:t.includes(s),onChange:()=>o(t.includes(s)?t.filter(h=>h!==s):[...t,s])}),s]},s))})]})]}):n==="Profile"&&!i?e.jsxs("div",{className:"ui-lab-app-grid lab-card-grid lab-profile-cards",children:[e.jsx(z,{title:"Your profile",icon:"✧",featured:!0,description:"Roles, themes and preference evidence",status:d.length?`${d.length} explicit records in this session.`:"No explicit records yet.",onClick:()=>a("Profile","My Profile")}),e.jsx(z,{title:"Relationships",icon:"♡",description:"Connections and linked profiles",status:"Connected relationships are not available in this Lab yet.",onClick:()=>a("Relationships")}),e.jsx(z,{title:"Sharing & permissions",icon:"◇",description:"Decide what others can see",onClick:()=>a("Profile","Sharing & Permissions")}),e.jsx(z,{title:"Identity & expression",icon:"✦",description:"Your own words and presentation",status:"Not available in this Lab yet.",onClick:()=>a("Profile","Identity & Expression")})]}):n==="Profile"&&i==="Identity & Expression"?e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"Identity and expression editing is not available in this Lab yet. Your own words and presentation are separate from preference and experience records."}),e.jsx("button",{onClick:()=>a("Profile","My Profile"),children:"Review your records"}),e.jsx("a",{href:`#${Nn.path}`,children:"Open current Profile"})]}):n==="Profile"?e.jsxs("section",{className:"lab-section",children:[e.jsx("h2",{children:i==="Sharing & Permissions"?"Sharing":"Recorded in this session"}),i==="Sharing & Permissions"?e.jsxs(e.Fragment,{children:[e.jsx("p",{children:"Choose deliberate sharing from the current app's Profile. Connected relationship permissions are unavailable in this Lab."}),e.jsx("a",{href:`#${Nn.path}`,children:"Open current Profile"})]}):e.jsxs(e.Fragment,{children:[!d.length&&e.jsx("p",{children:"No explicit records yet. Browsing, learning and activities do not fill in your profile."}),e.jsx("dl",{className:"lab-records",children:d.map(([s,h])=>{const f=l.find(g=>s.startsWith(g.id+":")||s.startsWith("experience:"+g.id+":")),b=f?s.replace("experience:","").replace(f.id,f.name):s;return e.jsxs("div",{children:[e.jsx("dt",{children:b.replaceAll(":"," · ")}),e.jsx("dd",{children:h===!0?"Tried recorded":String(h)})]},s)})}),e.jsx("button",{onClick:()=>a("Catalog","Explore All"),children:"Edit Catalog records"}),e.jsx("button",{onClick:()=>a("Profile","Sharing & Permissions"),children:"Sharing & permissions"})]})]}):n==="Tools"&&!i?e.jsxs("div",{className:"ui-lab-app-grid lab-card-grid lab-tool-cards",children:[e.jsx(z,{title:"Scene Builder",icon:"✧",featured:!0,description:"Plan scenes and save drafts",href:`#${tn.path}`}),e.jsx(z,{title:"Agreements & rituals",icon:"♡",description:"Create and maintain shared practices",status:"Not available in this Lab yet.",onClick:()=>a("Tools","Agreements & Rituals")}),e.jsx(z,{title:"Randomizers & recipes",icon:"◇",description:"Get practical inspiration",onClick:()=>a("Tools","Randomizers & Recipes")}),e.jsx(z,{title:"Compare profiles",icon:"✦",description:"Compare only with permission",href:`#${Pn.path}`})]}):n==="Tools"&&i==="Randomizers & Recipes"?e.jsxs("div",{className:"ui-lab-app-grid lab-card-grid",children:[e.jsx(z,{title:"Reward / Punishment randomizer",icon:"◇",featured:!0,description:"Explore possibilities with your own inputs",href:`#${St.path}`}),e.jsx(z,{title:"Recipes",icon:"✦",description:"Find practical inspiration",href:`#${At.path}`})]}):n==="Tools"&&i==="Agreements & Rituals"?e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"Agreements and rituals do not yet have an editor in this Lab."}),e.jsx("button",{onClick:()=>a("Tools"),children:"Back to tools"})]}):n==="Tools"?e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"Open an existing tool deliberately. Lab preferences and activity notes stay in this session."}),e.jsxs("a",{href:`#${i==="Compare Profiles"?Pn.path:tn.path}`,children:["Open ",i]})]}):n==="Creations"?e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"No creations are stored in this Lab. Scene drafts are managed in the current Scene Builder."}),e.jsx("a",{href:`#${tn.path}`,children:"Open Scene Builder"})]}):n==="Learn"?e.jsxs("section",{className:"lab-section",children:[e.jsx("h2",{children:"Understand the concepts"}),e.jsx("p",{children:"Learning and curiosity are independent of participation, preference and consent."}),e.jsx("button",{onClick:()=>a("Catalog","Concept Explorer"),children:"Browse concepts"}),e.jsx("button",{onClick:()=>a("Discover","Learn"),children:"Explore learning paths"})]}):n==="Relationships"?e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"No connected relationship workspace is available in this Lab."}),e.jsx("p",{children:"Sharing is deliberate. Personal records and permissions are independent."}),e.jsx("button",{onClick:()=>a("Profile","Sharing & Permissions"),children:"Review sharing"})]}):n==="Settings"?e.jsxs("section",{className:"lab-section",children:[e.jsx("h2",{children:"Lab session"}),e.jsx("p",{children:"Preferences, experience, activity notes and suggestion dismissals remain in memory. Reloading or leaving the Lab ends the session. Search queries are not persisted."}),e.jsx("h2",{children:"App settings"}),e.jsx("a",{href:`#${Tt.path}`,children:"Open current app settings"})]}):null}function _e(n){return n.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim()}function Si(n,i){const a=_e(i).replace(/\s+/g," ");if(!a)return n.map(r=>({article:r,matchedField:"title",score:0}));const t=a.split(" ").filter(Boolean),o=[];for(const r of n){const l=_e(r.title),y=_e(r.description),p=_e(r.section+" "+r.level),d=[l,y,p].join(" ");let s,h;if(l===a)s=0,h="title";else if(l.startsWith(a))s=1,h="title";else if(l.split(/[^\p{L}\p{N}]+/u).some(f=>f.startsWith(a)))s=2,h="title";else if(l.includes(a)||t.every(f=>l.includes(f)))s=3,h="title";else if(y.includes(a)||t.every(f=>y.includes(f)))s=4,h="description";else if(p.includes(a)||t.every(f=>p.includes(f)))s=5,h="topic";else if(t.every(f=>d.includes(f)))s=6,h="description";else continue;o.push({article:r,matchedField:h,score:s})}return o.sort((r,l)=>r.score-l.score||r.article.title.localeCompare(l.article.title))}function he(n){return n.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|`[^`]+`)/g).filter(Boolean).map((a,t)=>{if(a.startsWith("**")&&a.endsWith("**"))return e.jsx("strong",{children:a.slice(2,-2)},t);if(a.startsWith("*")&&a.endsWith("*"))return e.jsx("em",{children:a.slice(1,-1)},t);if(a.startsWith("`")&&a.endsWith("`"))return e.jsx("code",{children:a.slice(1,-1)},t);const o=a.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);return o?e.jsxs("a",{href:o[2],target:"_blank",rel:"noopener noreferrer",children:[o[1],e.jsx("span",{className:"lab-education-external","aria-hidden":"true",children:" ↗"})]},t):e.jsx(c.Fragment,{children:a},t)})}function Hn(n){return n.replace(/^\s+/,"").trim()}function Ai(n){const i=n.indexOf(`
---
`);return(i>=0?n.slice(i+5).trim():n.replace(/^# [^\n]+\n/,"").trim()).replace(/\n---\s*\n\s*### Continue Learning\s*\n[\s\S]*?(?=\n### Further Reading|\s*$)/i,`
`).replace(/\n## Related Learning\s*\n[\s\S]*?(?=\n---\s*\n|$)/i,`
`).trim()}function Un(n){return n.match(/^\*\*Content note:\*\*\s*(.+)$/m)?.[1]??null}function Ee(n){return n.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(i=>i.trim())}function Ti(n,i){const a=n[i]?.trim()??"",t=n[i+1]?.trim()??"";return a.startsWith("|")&&t.startsWith("|")&&Ee(t).length===Ee(a).length&&Ee(t).every(o=>/^:?-{3,}:?$/.test(o))}function Ci({markdown:n}){const i=n.replace(/\r\n?/g,`
`).split(`
`),a=[];let t=0;for(;t<i.length;){const o=i[t].trim();if(!o){t++;continue}if(/^---+$/.test(o)){a.push(e.jsx("hr",{},t)),t++;continue}const r=o.match(/^(#{1,4})\s+(.+)$/);if(r){const s=Math.min(r[1].length+1,4),h="education-section-"+t;s===2?a.push(e.jsx("h2",{id:h,children:he(r[2])},t)):s===3?a.push(e.jsx("h3",{id:h,children:he(r[2])},t)):a.push(e.jsx("h4",{id:h,children:he(r[2])},t)),t++;continue}if(Ti(i,t)){const s=t,h=Ee(i[t]);t+=2;const f=[];for(;t<i.length&&i[t].trim().startsWith("|");){const b=Ee(i[t]);if(b.length!==h.length)break;f.push(b),t++}a.push(e.jsx("div",{className:"lab-education-table-scroll",role:"region","aria-label":"Article comparison table",tabIndex:0,children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsx("tr",{children:h.map((b,g)=>e.jsx("th",{scope:"col",children:he(b)},g))})}),e.jsx("tbody",{children:f.map((b,g)=>e.jsx("tr",{children:b.map((x,C)=>e.jsx("td",{children:he(x)},C))},g))})]})},s));continue}const l=/^[-*]\s+/.test(o),y=/^\d+\.\s+/.test(o);if(l||y){const s=t,h=[];for(;t<i.length&&(l?/^[-*]\s+/.test(i[t].trim()):/^\d+\.\s+/.test(i[t].trim()));){const f=i[t].trim().replace(l?/^[-*]\s+/:/^\d+\.\s+/,"");h.push(e.jsx("li",{children:he(f)},t)),t++}a.push(l?e.jsx("ul",{children:h},s):e.jsx("ol",{children:h},s));continue}if(o.startsWith(">")){const s=t,h=[];for(;t<i.length&&i[t].trim().startsWith(">");)h.push(Hn(i[t].trim().slice(1))),t++;a.push(e.jsx("blockquote",{children:he(h.join(" "))},s));continue}const p=t,d=[];for(;t<i.length&&i[t].trim()&&!/^(?:#{1,4}\s+|---+$|[-*]\s+|\d+\.\s+|>)/.test(i[t].trim());)d.push(Hn(i[t])),t++;d.length?a.push(e.jsx("p",{children:he(d.join(" "))},p)):t++}return e.jsx("div",{className:"lab-education-prose",children:a})}const Ii=["Understanding BDSM","Consent and scenes","Kinks, roles, and motivation","Relationship structures","Collars, symbols, and rituals","Practices & safety"],Di=[{id:"all",label:"All topics"},{id:"Understanding BDSM",label:"BDSM basics"},{id:"Consent and scenes",label:"Consent & scenes"},{id:"Kinks, roles, and motivation",label:"Kinks & roles"},{id:"Relationship structures",label:"Relationships"},{id:"Collars, symbols, and rituals",label:"Collars & symbols"},{id:"Practices & safety",label:"Practices & safety"}],Ye=["edu-bd","edu-ds","edu-sm"];function rn({matches:n,go:i,featuredId:a,showMatch:t=!1}){return e.jsx("div",{className:"lab-education-grid",children:n.map(({article:o,matchedField:r})=>e.jsx(z,{title:o.title,icon:"✧",description:o.description,featured:o.id===a,status:o.level+" · "+o.readingMinutes+" min read"+(t&&r!=="title"?" · "+(r==="description"?"Description match":"Topic match"):""),onClick:()=>i("Learn","Article",{id:o.id})},o.id))})}function Ni({view:n,articleId:i,go:a}){const{education:t}=Ut(),[o,r]=c.useState(""),[l,y]=c.useState("all"),[p,d]=c.useState("default"),[s,h]=c.useState(!1),f=c.useCallback(w=>t?t.listArticles(w):Promise.resolve([]),[t]),b=c.useCallback(w=>t?t.getArticle(i,w):Promise.resolve(null),[t,i]),g=mn(f,!!t),x=mn(b,!!t&&n==="Article"&&!!i),C=!!o.trim(),A=c.useMemo(()=>{const w=Si(g.data??[],o).filter(({article:D})=>l==="all"||D.section===l);return(p==="az"||p==="za")&&w.sort((D,j)=>D.article.title.localeCompare(j.article.title)*(p==="az"?1:-1)),w},[g.data,o,l,p]),M=C||l!=="all"||p!=="default";if(!t)return e.jsxs("section",{className:"lab-section",role:"status",children:[e.jsx("h2",{children:"Education isn't connected here yet"}),e.jsx("p",{children:"This adapter does not provide the Education read service. No sample articles were substituted for an unavailable API."})]});if(n==="Article"){if(!i)return e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"No article was selected."}),e.jsx("button",{type:"button",onClick:()=>a("Learn"),children:"Browse articles"})]});if(x.loading)return e.jsx("p",{role:"status",children:"Loading article…"});if(x.error)return e.jsxs("section",{className:"lab-section",role:"alert",children:[e.jsx("p",{children:"Unable to load this article. Nothing has been saved or changed."}),e.jsx("button",{type:"button",onClick:x.retry,children:"Retry article"}),e.jsx("button",{type:"button",onClick:()=>a("Learn"),children:"Browse articles"})]});if(!x.data)return e.jsxs("section",{className:"lab-section",children:[e.jsx("p",{children:"This article is unavailable or its link is out of date."}),e.jsx("button",{type:"button",onClick:()=>a("Learn"),children:"Browse articles"})]});const w=x.data,D=new Set([w.id]),j=[];for(const N of w.links){if(N.target.kind!=="article"||D.has(N.target.id))continue;const k=g.data?.find(E=>E.id===N.target.id);k&&(j.push(k),D.add(k.id))}return e.jsxs("div",{className:"lab-education-reader",children:[e.jsx("button",{type:"button",className:"lab-education-back",onClick:()=>a("Learn"),children:"← All articles"}),e.jsxs("header",{className:"lab-education-article-header",children:[e.jsxs("p",{className:"lab-education-overline",children:[w.section," · ",w.level," · ",w.readingMinutes," min read"]}),e.jsx("h2",{children:w.title}),e.jsx("p",{className:"lab-education-summary",children:w.description}),e.jsx("p",{className:"lab-education-status",children:"Editorial draft · Review required before publication"}),Un(w.markdown)&&e.jsxs("p",{className:"lab-education-note",children:[e.jsx("strong",{children:"Content note:"})," ",Un(w.markdown)]})]}),e.jsx(Ci,{markdown:Ai(w.markdown)}),j.length>0&&e.jsxs("section",{className:"lab-education-related","aria-labelledby":"lab-education-related-heading",children:[e.jsx("h2",{id:"lab-education-related-heading",children:"Continue learning"}),e.jsx("div",{className:"lab-education-related-links",children:j.map(N=>e.jsxs("button",{type:"button",onClick:()=>a("Learn","Article",{id:N.id}),children:[N.title," ",e.jsx("span",{"aria-hidden":"true",children:"↗"})]},N.id))})]})]})}const P=A.filter(({article:w})=>Ye.includes(w.id)).sort((w,D)=>Ye.indexOf(w.article.id)-Ye.indexOf(D.article.id)),S=A.filter(({article:w})=>!Ye.includes(w.id));return e.jsxs("div",{className:"lab-education-library",children:[e.jsxs("div",{className:"lab-education-toolbar",children:[e.jsx("label",{className:"lab-education-search-label",htmlFor:"lab-education-search",children:"Search articles"}),e.jsxs(We,{children:[e.jsx(Me,{mode:"input",inputId:"lab-education-search",ariaLabel:"Search educational articles",resultsId:"lab-education-results",placeholder:"Search articles and topics…",value:o,onChange:r,onClear:()=>r("")}),e.jsx(qe,{onClick:()=>h(!0),groupingAvailable:!1,active:p!=="default",expanded:s})]}),e.jsx(Qe,{label:"Education topics",options:Di.map(w=>({id:w.id,label:w.label,active:l===w.id,onClick:()=>y(w.id)}))}),e.jsx(fn,{open:s,onClose:()=>h(!1),sort:p,onSort:d,showGrouping:!1,defaultSortLabel:C?"Best match: title first":"Editorial order"})]}),g.loading&&e.jsx("p",{role:"status",children:"Loading educational articles…"}),g.error&&e.jsxs("section",{className:"lab-section",role:"alert",children:[e.jsx("p",{children:"Unable to load the Education library."}),e.jsx("button",{type:"button",onClick:g.retry,children:"Retry loading articles"})]}),!g.loading&&!g.error&&e.jsxs(e.Fragment,{children:[e.jsxs("p",{id:"lab-education-results",className:"lab-education-results",role:"status",children:[A.length," ",A.length===1?"article":"articles",C?" matching your search":l!=="all"?" in this topic":""]}),A.length===0&&e.jsxs("div",{className:"lab-education-empty",children:[e.jsx("p",{children:"No articles match. Try a different title or topic."}),(l!=="all"||C)&&e.jsx("button",{type:"button",onClick:()=>{r(""),y("all"),d("default")},children:"Show all articles"})]}),A.length>0&&M&&e.jsxs("section",{className:"lab-education-section","aria-label":"Article results",children:[e.jsx("h2",{children:C?"Search results":l!=="all"?l:"All articles"}),e.jsx(rn,{matches:A,go:a,showMatch:C})]}),A.length>0&&!M&&e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"lab-education-section lab-education-starters","aria-labelledby":"lab-education-start-heading",children:[e.jsxs("div",{className:"lab-education-section-heading",children:[e.jsx("h2",{id:"lab-education-start-heading",children:"Start with the essentials"}),e.jsx("span",{children:"Three introductions to BDSM"})]}),e.jsx(rn,{matches:P,go:a,featuredId:"edu-bd"})]}),e.jsxs("section",{className:"lab-education-more","aria-labelledby":"lab-education-more-heading",children:[e.jsx("h2",{id:"lab-education-more-heading",children:"Explore more"}),Ii.filter(w=>S.some(({article:D})=>D.section===w)).map(w=>e.jsxs("section",{className:"lab-education-section",children:[e.jsx("h3",{children:w}),e.jsx(rn,{matches:S.filter(({article:D})=>D.section===w),go:a})]},w))]})]})]})]})}const Pi=["Home","Catalog","Profile","Discover","Tools"],Ve={Home:"home",Catalog:"catalog",Profile:"profile",Discover:"discover",Tools:"tools",Creations:"creations",Learn:"learn",Relationships:"relationships",Settings:"settings"},gn={Catalog:{"Explore All":"all",Kinks:"kinks","Rewards & Punishments":"rewards-punishments","Concept Explorer":"concepts","Subject Overview":"subject"},Profile:{"My Profile":"records",Preferences:"preferences","Sharing & Permissions":"sharing","Identity & Expression":"identity"},Discover:{Learn:"learn",React:"react",Play:"play","Manage Suggestions":"suggestions","Saved Activities":"activities",Activity:"activity"},Learn:{Article:"article"},Tools:{"Scene Builder":"scenes","Agreements & Rituals":"agreements","Randomizers & Recipes":"randomizers-recipes","Compare Profiles":"compare"}};function pt(n,i="",a){const t=i?gn[n]?.[i]:"",o=new URLSearchParams(a);return`/ui-lab/${Ve[n]}${t?`/${t}`:""}${o.size?`?${o}`:""}`}function Ri(n,i=""){const[,a,t,...o]=n.slice(1).split("/"),r=Object.keys(Ve).find(d=>Ve[d]===a)||"Home",l=Object.keys(gn[r]||{}).find(d=>gn[r]?.[d]===t)||"",y=new URLSearchParams(i),p=!!(a&&!Object.values(Ve).includes(a)||t&&!l||o.length);return{area:r,workspace:l,params:y,unknown:p}}function gt({id:n,onClose:i}){const{concepts:a}=Fe(),t=a.find(d=>d.id===n),[o,r]=c.useState(!1),l=Xe(),{notify:y}=Oe();if(!t)return null;const p=`concept:${n}:preference`;return e.jsxs(me,{open:!0,onClose:i,label:`Concept: ${t.name}`,closeLabel:"Back to search or concepts",children:[e.jsx(Be,{title:t.name,context:"CONCEPT EXPLORER",onClose:i,closeLabel:"Back to search or concepts"}),e.jsx("p",{children:t.description}),e.jsxs("p",{children:["Related sample Items: ",t.related.join(", "),"."]}),e.jsx(Xn,{label:`${t.name} concept`,value:l.values[p],saveState:l.saves[p],onRetry:()=>l.retry(p),onActivate:()=>r(!0)}),e.jsx("p",{className:"ui-lab-app-note",children:"Concept preferences and item-specific modifier ratings remain independent. Illustrative content · Session only."}),e.jsx(Zn,{open:o,onClose:()=>r(!1),label:`${t.name} concept`,context:"GENERAL CONCEPT",value:l.values[p],options:kn,help:e.jsx(lt,{}),helpOpen:l.helpOpen,onHelpOpenChange:l.setHelpOpen,onChange:d=>{const s=l.values[p],h=l.commit(p,d);d===void 0&&s!==void 0&&y({message:"Rating cleared",kind:"info",actionLabel:"Undo",duration:5e3,onAction:()=>{l.restore(p,h,s)||y({message:"A newer edit was kept",kind:"info"})}})}})]})}dt(pe);function jn(n,i){if("conceptId"in n.target)return{...n,conceptId:n.target.conceptId,searchable:n.name};const a=n.target,t=i.items.find(r=>r.id===a.itemId),o=t?.groups.find(r=>r.id===a.groupId);return{...n,itemName:t?.name,group:o?.name,value:o?.values.find(r=>r.id===a.valueId)?.name,searchable:n.name}}function Ei(n){return n.trim()?vn(pe,{text:n}).map(i=>jn(i,pe)):[]}function Bi(n,i,a){const t=n.filter(l=>i==="All"||l.type===i);a!=="default"&&t.sort((l,y)=>(a==="az"?1:-1)*l.name.localeCompare(y.name)||l.path.localeCompare(y.path));const o=a==="default"?t.slice(0,3):[],r=new Set(o.map(l=>l.id));return[{label:"Best matches",rows:o},...["Items","Modifiers","Concepts"].map(l=>({label:l,rows:t.filter(y=>y.type===l&&!r.has(y.id))}))].filter(l=>l.rows.length)}function Mi(n,i=pe){const a=vn(i,{text:""}).find(t=>t.id===n);return a?jn(a,i):void 0}const Wi=async n=>Ei(n);function qi({open:n,onClose:i,origin:a,sort:t,onSort:o,orderOpen:r,onOrderOpen:l,search:y,targetId:p,onTargetChange:d}){const s=et(),{data:h}=Fe(),f=c.useCallback(async(T,O)=>s?(await s.search.search({text:T},O)).map(Z=>jn(Z,h)):Wi(T),[s,h]),b=y??f,g=c.useId(),[x,C]=c.useState(""),[A,M]=c.useState("All"),[P,S]=c.useState([]),[w,D]=c.useState(""),[j,N]=c.useState(!1),[k,E]=c.useState(!1),[G,H]=c.useState(0),[U,_]=c.useState(null),V=c.useRef(null),F=c.useRef(0);c.useEffect(()=>{let T=!0;const O=new AbortController;if(!n)return;if(!x.trim()){S([]),E(!1),N(!1),D("");return}const Z=setTimeout(()=>{N(!0),E(!1),b(x,{signal:O.signal}).then(J=>{T&&(S(J),D(x),E(!1))},()=>{T&&E(!0)}).finally(()=>{T&&N(!1)})},200);return()=>{T=!1,clearTimeout(Z),O.abort()}},[x,G,b,n]),c.useEffect(()=>{p!==void 0&&_(P.find(T=>T.id===p)??Mi(p,h)??null)},[p,h,P]);const Q=()=>{C(""),M("All"),document.getElementById("lab-global-query")?.focus()},we=Bi(P,A,t),ge=P.filter(T=>A==="All"||T.type===A).length,X=()=>{_(null),d?.(null),requestAnimationFrame(()=>{V.current&&(V.current.scrollTop=F.current)})},le=T=>{F.current=V.current?.scrollTop||0,_(T),d?.(T.id)};return e.jsx(me,{open:n,onClose:()=>{l(!1),i()},label:"Global catalog search",closeLabel:"Close search",className:"ui-lab-search-overlay",backdropClassName:"ui-lab-search-backdrop",panelClassName:"ui-lab-search-dialog",children:e.jsxs("div",{className:"ui-lab-search-page",children:[e.jsxs("div",{className:"ui-lab-search-modal-header",children:[e.jsx("span",{children:"Search"}),e.jsx("button",{type:"button",className:"ui-lab-search-close","aria-label":"Close search",onClick:i,children:"×"})]}),e.jsxs("div",{className:"lab-search-sticky",children:[e.jsxs(We,{children:[e.jsx(Me,{mode:"input",autoFocus:!0,inputId:"lab-global-query",ariaLabel:"Search catalog",resultsId:g,placeholder:"Search catalog…",value:x,onChange:C,onClear:Q}),e.jsx(qe,{active:t!=="default",groupingAvailable:!1,expanded:r,onClick:()=>l(!0)})]}),e.jsx(Qe,{label:"Search result types",options:["All","Items","Modifiers","Concepts"].map(T=>({id:T,label:T,active:A===T,onClick:()=>M(T)})),clear:A!=="All"?Q:void 0})]}),!x.trim()&&e.jsxs(e.Fragment,{children:[e.jsxs("p",{className:"ui-lab-search-label",children:["STARTING FROM ",a.toUpperCase()]}),e.jsx("p",{className:"ui-lab-search-hint",children:"Search all sample Catalog content. Choose a type to narrow results."}),e.jsx("p",{className:"ui-lab-search-label",children:"SUGGESTED SEARCHES"}),e.jsx("div",{className:"ui-lab-search-suggestions",children:["Collars","Leather","Ownership"].map(T=>e.jsxs("button",{onClick:()=>C(T),children:[T," ↗"]},T))})]}),j&&e.jsx("div",{className:"lab-search-loading",role:"status","aria-label":"Searching"}),k&&e.jsxs("div",{role:"status",className:"cc-error-summary",children:[e.jsx("span",{children:P.length?"Previous results · Search update failed":"Search failed"}),e.jsx("button",{type:"button",onClick:()=>H(T=>T+1),children:"Retry search"})]}),x.trim()&&e.jsxs("p",{className:"ui-lab-search-label",role:"status","aria-atomic":"true",children:[ge," matches",w!==x&&P.length?" · Previous results":""]}),e.jsxs("div",{className:"ui-lab-search-results lab-search-scroll",id:g,ref:V,"aria-busy":j,onTouchMove:()=>document.getElementById("lab-global-query")?.blur(),onWheel:()=>document.getElementById("lab-global-query")?.blur(),children:[we.map(T=>e.jsxs("section",{className:"lab-search-results-section",children:[e.jsx("h3",{className:"lab-search-results-heading",children:T.label}),T.rows.map(O=>e.jsxs("button",{"data-search-result":O.id,onClick:()=>le(O),children:[e.jsxs("span",{children:[e.jsx("strong",{children:O.name}),e.jsxs("small",{children:[O.path," · ",O.type]})]}),e.jsx("span",{"aria-hidden":"true",children:"›"})]},O.id))]},T.label)),x.trim()&&w===x&&!j&&!k&&!ge&&e.jsx("p",{children:"No matches. Try another term or type."})]}),e.jsx("p",{className:"ui-lab-app-note",children:"Illustrative Catalog index · Search queries stay in this session only."}),e.jsx(fn,{open:r,onClose:()=>l(!1),sort:t,onSort:o,showGrouping:!1,defaultSortLabel:"Best matches"}),U?.type==="Concepts"&&e.jsx(gt,{id:U.conceptId,onClose:X}),U&&U.type!=="Concepts"&&e.jsx("div",{className:"lab-search-destination",children:e.jsx(Re,{compact:!0,initialItem:U.itemName,initialGroup:U.group,initialValue:U.value,subject:U.itemName,onClose:X})})]})})}const Ke=Pi,Li={Home:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"m3.5 10 8.5-7 8.5 7"}),e.jsx("path",{d:"M5.5 9v11h13V9M10 20v-6h4v6"})]}),Catalog:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M12 6.5c-2.8-1.6-5.7-1.7-9-1v13c3.3-.7 6.2-.6 9 1 2.8-1.6 5.7-1.7 9-1v-13c-3.3-.7-6.2-.6-9 1Z"}),e.jsx("path",{d:"M12 6.5v13"})]}),Profile:e.jsxs(e.Fragment,{children:[e.jsx("circle",{cx:"12",cy:"8",r:"3.5"}),e.jsx("path",{d:"M5 20v-1.5a7 7 0 0 1 14 0V20"})]}),Discover:e.jsx(e.Fragment,{children:e.jsx("path",{d:"m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"})}),Tools:e.jsx(e.Fragment,{children:e.jsx("path",{d:"M14.8 6.2a5.3 5.3 0 0 0-6.7 6.7L3 18l3 3 5.1-5.1a5.3 5.3 0 0 0 6.7-6.7l-3.4 3.4-3-3 3.4-3.4Z"})})};function ln({area:n}){return e.jsx("svg",{className:"ui-lab-nav-icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:Li[n]})}function zn(n){if(!n.length)return[];const a=(Math.floor(new Date().setHours(0,0,0,0)/864e5)%n.length+n.length)%n.length;return[n[a],n[(a+2)%n.length]].filter((t,o,r)=>r.findIndex(l=>l.name===t.name)===o)}function Hi({services:n}={}){const i=$n(),a=_n(),[t]=c.useState(st);return e.jsx(Ft,{services:n??t.services,children:e.jsx(Bt,{children:e.jsx(gi,{diagnostics:n?void 0:t,children:e.jsx(xi,{children:e.jsx(vi,{resetKey:i.pathname,onHome:()=>a(pt("Home")),children:e.jsx(Oi,{})})})})})})}function Oi(){const{data:n,concepts:i}=Fe(),a=c.useMemo(()=>n.subjects.filter(m=>m.featured).map(m=>({...m,...m.featured})),[n]),t=a.map(m=>m.name),o=n.subjects.filter(m=>!m.featured).map(m=>m.name),r=c.useRef(null),l=c.useId(),y=c.useRef(!1),p=$n(),d=_n(),{area:s,workspace:h,params:f,unknown:b}=Ri(p.pathname,p.search),g=h==="Subject Overview"?f.get("subject"):null,x=h==="Explore All"?f.get("subject"):null,C=f.get("overlay")==="search"||f.has("target"),A=f.get("concept"),[M,P]=c.useState(!1),[S,w]=c.useState(["Catalog","Discover","Tools"]),[D,j]=c.useState(!1),[N,k]=c.useState(()=>zn(a)),[E,G]=c.useState(!1),[H,U]=c.useState(!1),[_,V]=c.useState("default"),[F,Q]=c.useState(!1),[we,ge]=c.useState("Catalog"),X=m=>p.pathname+(m.size?"?"+m.toString():""),le=(m,R)=>{const Y=new URLSearchParams(f);Y.set(m,R),d(X(Y),{state:{labParent:p.pathname+p.search}})},T=m=>{if(p.state?.labParent){d(-1);return}const R=new URLSearchParams(f);R.delete(m),m==="overlay"&&R.delete("target"),d(X(R),{replace:!0})},O=(m="Catalog",R=!1)=>{ge(m),Q(R),le("overlay","search"),J(!1)},[Z,J]=c.useState(!1),[ye,xe]=c.useState(null),se=c.useRef(null),ee={Home:[],Catalog:["Overview","Explore All","Kinks","Rewards & Punishments","Concept Explorer"],Profile:["Overview","My Profile","Preferences","Sharing & Permissions","Identity & Expression"],Discover:["Overview","Learn","React","Play"],Tools:["Overview","Scene Builder","Agreements & Rituals","Randomizers & Recipes","Compare Profiles"]},He=(m,R)=>W(m,R==="Overview"?"":R),ke=()=>!!document.querySelector('.ui-lab [aria-modal="true"]:not(#ui-lab-full-menu)'),je=m=>{if(ke()){se.current=null;return}const R=m.touches[0];R&&(se.current={x:R.clientX,y:R.clientY})},te=m=>{if(ke()){se.current=null;return}const R=se.current;se.current=null;const Y=m.changedTouches[0];if(!R||!Y)return;const Ce=Y.clientX-R.x,Ie=Y.clientY-R.y;if(Z){Ce<-60&&Math.abs(Ce)>Math.abs(Ie)*1.6&&J(!1);return}Ce>85&&Math.abs(Ce)>Math.abs(Ie)*2.2&&Te()},Se=()=>{window.scrollTo({top:0,left:0,behavior:"instant"}),requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"instant"}))},W=(m,R="",Y)=>{Se(),J(!1),d(pt(m,R,Y))},ne=m=>W(m),Ae=m=>W("Catalog",m),fe=m=>W("Catalog","Subject Overview",{subject:m}),Ue=()=>W("Catalog","Explore All",g?{subject:g}:void 0);c.useEffect(()=>{s==="Catalog"&&k(zn(a))},[s,a]);const ce=m=>m===s?h||"Overview":null,Te=()=>{ke()||(xe(s!=="Home"&&Ke.includes(s)?s:null),J(!0))},ie=g||h||{Home:"Your space.",Discover:"Discover yourself.",Catalog:"Explore the catalog.",Profile:"Your profile.",Tools:"Your tools.",Creations:"Creations",Learn:"Learn",Relationships:"Relationships",Settings:"Settings"}[s];return c.useEffect(()=>{y.current&&r.current?.focus(),y.current=!0},[s,h,g]),c.useEffect(()=>{const m=document.title;return document.title=`${ie} · Kink Profile`,()=>{document.title=m}},[ie]),e.jsxs("div",{className:"ui-lab ui-lab-app"+(M?" lab-rail-collapsed":""),onTouchStart:je,onTouchEnd:te,children:[e.jsx("a",{className:"ui-lab-skip-link",href:`#${l}`,onClick:m=>{m.preventDefault(),r.current?.focus(),r.current?.scrollIntoView({block:"start"})},children:"Skip to content"}),e.jsxs("nav",{className:"ui-lab-app-rail","aria-label":"Primary navigation",children:[e.jsx("button",{className:"lab-rail-toggle","aria-label":M?"Expand sidebar":"Collapse sidebar",onClick:()=>P(!M),children:M?"›":"‹"}),e.jsxs("div",{className:"ui-lab-app-brand",children:["♡ ",e.jsx("strong",{children:"Kink Profile"}),e.jsx("small",{children:"UI LAB"})]}),Ke.map(m=>e.jsxs("button",{type:"button","aria-label":m,"aria-current":s===m?"page":void 0,className:s===m?"active":"",onClick:()=>ne(m),children:[e.jsx("span",{className:"ui-lab-nav-icon-wrap",children:e.jsx(ln,{area:m})}),e.jsx("span",{className:"lab-rail-label",children:m})]},m)),e.jsx("button",{className:"ui-lab-app-rail-lab","aria-expanded":E,onClick:()=>G(!E),children:"⚙ Design lab"})]}),e.jsxs("div",{className:"ui-lab-app-frame",children:[e.jsxs("header",{className:"ui-lab-app-header",children:[e.jsx("button",{type:"button",className:"ui-lab-header-action","aria-label":"Open full menu","aria-expanded":Z,"aria-controls":"ui-lab-full-menu",onClick:Te,children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round","aria-hidden":"true",children:e.jsx("path",{d:"M4 7h16M4 12h16M4 17h16"})})}),e.jsxs("button",{type:"button",className:"ui-lab-app-logo",onClick:()=>ne("Home"),"aria-label":"Kink Profile, go to Home",children:[e.jsx("span",{className:"ui-lab-brand-mark","aria-hidden":"true",children:"♡"}),e.jsx("span",{children:"Kink Profile"})]}),e.jsxs("div",{className:"ui-lab-header-actions",children:[e.jsx("button",{type:"button",className:"ui-lab-header-action","aria-label":"Search",onClick:()=>O(s),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"10.8",cy:"10.8",r:"6.6"}),e.jsx("path",{d:"m16 16 4.5 4.5"})]})}),e.jsx("button",{type:"button",className:"ui-lab-header-action","aria-label":"Profile and settings",onClick:()=>ne("Profile"),children:"♡"})]})]}),e.jsxs(me,{open:Z,onClose:()=>J(!1),label:"Full navigation menu",closeLabel:"Close navigation menu",id:"ui-lab-full-menu",className:"ui-lab-menu-layer",backdropClassName:"ui-lab-menu-backdrop",panelClassName:"ui-lab-menu-drawer",children:[e.jsxs("div",{className:"ui-lab-menu-heading",children:[e.jsxs("span",{className:"ui-lab-menu-title",children:[e.jsx("span",{"aria-hidden":"true",children:"♡"})," Kink Profile"]}),e.jsx("button",{type:"button",className:"ui-lab-menu-close","aria-label":"Close menu",onClick:()=>J(!1),children:"×"})]}),e.jsx("p",{className:"ui-lab-menu-eyebrow",children:"YOUR SPACE"}),e.jsx("nav",{"aria-label":"All destinations",className:"ui-lab-menu-links",children:Ke.map(m=>e.jsxs("div",{className:"ui-lab-menu-group",children:[e.jsxs("button",{type:"button",className:"ui-lab-menu-parent ui-lab-menu-parent-button "+(s===m?"selected":""),"aria-current":s===m&&m==="Home"?"page":void 0,"aria-expanded":ee[m].length?ye===m:void 0,onClick:()=>{ee[m].length?xe(ye===m?null:m):ne(m)},children:[e.jsx("span",{className:"ui-lab-menu-link-icon",children:e.jsx(ln,{area:m})}),e.jsx("span",{className:"ui-lab-menu-parent-label",children:m}),ee[m].length>0&&e.jsx("span",{className:"ui-lab-menu-chevron "+(ye===m?"expanded":""),"aria-hidden":"true",children:"›"})]}),ye===m&&ee[m].length>0&&e.jsx("div",{className:"ui-lab-menu-subitems ui-lab-menu-branches",children:ee[m].map((R,Y)=>e.jsxs("button",{type:"button",style:{animationDelay:Y*55+"ms"},className:"ui-lab-menu-child "+(ce(m)===R?"active":"")+(Y===ee[m].length-1?" last":""),"aria-current":ce(m)===R?"page":void 0,onClick:()=>He(m,R),children:[e.jsxs("svg",{className:"ui-lab-menu-branch",viewBox:"0 0 28 40",preserveAspectRatio:"none","aria-hidden":"true",children:[e.jsx("path",{d:"M2 0 V17 Q2 24 10 24 H27"}),Y!==ee[m].length-1&&e.jsx("path",{d:"M2 17 V40"})]}),e.jsx("span",{children:R})]},R))})]},m))}),e.jsx("div",{className:"ui-lab-menu-divider"}),e.jsx("p",{className:"ui-lab-menu-eyebrow",children:"MORE TO EXPLORE"}),e.jsx("div",{className:"ui-lab-menu-links",children:["Creations","Learn","Relationships"].map((m,R)=>e.jsxs("button",{type:"button","aria-current":s===m?"page":void 0,onClick:()=>ne(m),children:[e.jsx("span",{className:"ui-lab-menu-link-icon","aria-hidden":"true",children:["◇","✧","♡"][R]}),e.jsx("span",{children:m})]},m))}),e.jsxs("div",{className:"ui-lab-menu-bottom",children:[e.jsxs("button",{type:"button",className:"ui-lab-menu-settings","aria-current":s==="Settings"?"page":void 0,onClick:()=>ne("Settings"),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.8 2.8-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.07 1.55V21h-4v-.12A1.7 1.7 0 0 0 8.93 19.3a1.7 1.7 0 0 0-1.87.34L7 19.7l-2.8-2.8.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.07H3v-4h.05A1.7 1.7 0 0 0 4.6 8.86a1.7 1.7 0 0 0-.34-1.87L4.2 6.93l2.8-2.8.06.06a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 10 2.98V3h4v-.02a1.7 1.7 0 0 0 1.07 1.55 1.7 1.7 0 0 0 1.87-.34L17 4.13l2.8 2.8-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.55 1.07H21v4h-.05A1.7 1.7 0 0 0 19.4 15Z"})]}),e.jsx("span",{children:"Settings"}),e.jsx("span",{"aria-hidden":"true",className:"ui-lab-menu-settings-arrow",children:"›"})]}),e.jsx("div",{className:"ui-lab-menu-footer",children:"Explore freely. Your preferences stay yours."})]})]}),e.jsx(qi,{open:C,onClose:()=>{T("overlay"),Q(!1)},origin:we,sort:_,onSort:V,orderOpen:F,onOrderOpen:Q,targetId:f.get("target")||"",onTargetChange:m=>m?le("target",m):T("target")}),A&&e.jsx(gt,{id:A,onClose:()=>T("concept")}),e.jsxs("main",{id:l,className:"ui-lab-app-content"+(s==="Learn"?" lab-education-page":""),"aria-labelledby":"ui-lab-page-heading",children:[b&&e.jsxs("p",{role:"alert",children:["This Lab destination is unavailable. ",e.jsx("button",{onClick:()=>ne("Home"),children:"Return Home"})]}),s!=="Catalog"&&e.jsx(yi,{}),h?e.jsxs("nav",{className:"ui-lab-breadcrumbs","aria-label":"Breadcrumb",children:[e.jsx("button",{type:"button",onClick:()=>ne(s),children:s}),e.jsx("span",{"aria-hidden":"true",children:"›"}),e.jsx("span",{"aria-current":"page",children:h})]}):e.jsx("p",{className:"ui-lab-app-kicker",children:s.toUpperCase()}),e.jsx("h1",{id:"ui-lab-page-heading",ref:r,tabIndex:-1,className:h?"ui-lab-workspace-title":"",children:ie}),!h&&e.jsx("p",{className:"ui-lab-app-lede",children:s==="Home"?"A home for everything you're exploring, building and becoming.":s==="Catalog"?"Browse freely. Record preferences only when you choose.":s==="Discover"?"Learn, react or play — your curiosity sets the pace.":s==="Profile"?"Your story, your preferences, and the people you choose to share with.":s==="Learn"?"A library for curiosity, questions, and safer exploration.":"Practical spaces for scenes, rituals, agreements and more."}),s==="Catalog"&&e.jsxs("div",{className:"ui-lab-catalog",children:[!h&&e.jsxs(e.Fragment,{children:[e.jsxs(We,{children:[e.jsx(Me,{mode:"launch",placeholder:"Search the Catalog…",onActivate:()=>O("Catalog")}),e.jsx(qe,{active:_!=="default",groupingAvailable:!1,onClick:()=>O("Catalog",!0)})]}),e.jsxs("section",{className:"ui-lab-collections","aria-label":"Browse collections",children:[e.jsx("h2",{children:"Browse collections"}),e.jsxs("button",{onClick:()=>Ae("Kinks"),children:[e.jsxs("span",{children:[e.jsx("strong",{children:"Kinks"}),e.jsx("small",{children:"Explore preferences and refinements"})]}),e.jsx("span",{"aria-hidden":"true",children:"→"})]}),e.jsxs("button",{onClick:()=>Ae("Rewards & Punishments"),children:[e.jsxs("span",{children:[e.jsx("strong",{children:"Rewards & Punishments"}),e.jsx("small",{children:"Explore rewards, punishments and personal classifications"})]}),e.jsx("span",{"aria-hidden":"true",children:"→"})]})]}),e.jsxs("section",{className:"ui-lab-subjects-featured","aria-label":"Featured subjects",children:[e.jsxs("div",{className:"ui-lab-subject-section-title",children:[e.jsx("h2",{children:"Featured subjects"}),e.jsx("small",{children:"Today's discoveries"})]}),e.jsx("div",{className:"ui-lab-subject-feature-grid",children:N.map(m=>e.jsxs("button",{type:"button",className:"ui-lab-subject-feature ui-lab-subject-"+m.tone,onClick:()=>fe(m.name),children:[e.jsx("span",{className:"ui-lab-subject-art","aria-hidden":"true",children:m.symbol}),e.jsxs("span",{className:"ui-lab-subject-feature-copy",children:[e.jsx("strong",{children:m.name}),e.jsx("small",{children:m.description})]}),e.jsx("span",{className:"ui-lab-subject-feature-arrow","aria-hidden":"true",children:"↗"})]},m.name))})]}),e.jsxs("button",{className:"ui-lab-catalog-all",onClick:()=>Ae("Explore All"),children:[e.jsxs("span",{children:[e.jsx("strong",{children:"Explore All"}),e.jsx("small",{children:"Browse the complete Catalog"})]}),e.jsx("span",{"aria-hidden":"true",children:"→"})]}),e.jsxs("section",{className:"ui-lab-more-subjects",children:[e.jsx("h2",{children:"More subjects"}),e.jsx("div",{className:"ui-lab-subject-chips",children:[...t.filter(m=>!N.some(R=>R.name===m)),...o].slice(0,D?void 0:6).map(m=>e.jsx("button",{type:"button",onClick:()=>fe(m),children:m},m))}),e.jsx("button",{className:"ui-lab-subject-more","aria-expanded":D,onClick:()=>j(m=>!m),children:D?"Show Less ↑":"Show More ↓"})]})]}),h==="Subject Overview"&&g&&e.jsxs("section",{className:"ui-lab-subject-overview",children:[e.jsx("p",{children:n.subjects.find(m=>m.name===g)?.description||"Explore related Catalog Items and refine your preferences."}),e.jsxs("div",{className:"ui-lab-subject-related-head",children:[e.jsx("h2",{children:"Related Items"}),e.jsx("button",{onClick:Ue,children:"View All Related Items →"})]}),e.jsx(Re,{compact:!0,subject:g,initialItem:void 0})]}),h==="Explore All"&&e.jsxs(e.Fragment,{children:[x&&e.jsxs("div",{className:"ui-lab-subject-filter-note",children:[e.jsxs("span",{children:["Exploring: ",x]}),e.jsx("button",{onClick:()=>W("Catalog","Explore All"),children:"Clear subject ×"})]}),e.jsx(Re,{subject:x||void 0},x||"all")]}),h==="Concept Explorer"&&e.jsxs(e.Fragment,{children:[e.jsxs(We,{children:[e.jsx(Me,{mode:"launch",placeholder:"Search concepts…",onActivate:()=>O("Concept Explorer")}),e.jsx(qe,{active:_!=="default",groupingAvailable:!1,onClick:()=>O("Concept Explorer",!0)})]}),e.jsx("div",{className:"ui-lab-catalog-items",children:i.map(m=>e.jsxs("button",{onClick:()=>le("concept",m.id),children:[m.name,e.jsx("span",{children:"›"})]},m.id))})]}),h==="Kinks"&&e.jsx(Re,{}),h==="Rewards & Punishments"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"ui-lab-rp-note",children:"Illustrative classifications for testing filters · Classification editing in Refine comes later."}),e.jsx(Re,{collection:"rewards"})]}),"    "]}),s==="Discover"&&e.jsx(ki,{view:h,attemptId:f.get("attempt")||void 0,go:W}),s==="Learn"&&e.jsx(Ni,{view:h,articleId:f.get("id")||"",go:W}),s!=="Catalog"&&s!=="Discover"&&s!=="Learn"&&e.jsx(ji,{area:s,workspace:h,go:W,shortcuts:S,onShortcuts:w}),!(s==="Catalog"&&h==="Explore All")&&e.jsx("p",{className:"ui-lab-app-note",children:s==="Learn"?"Experimental reader · Editorial drafts pending review · Reading does not save preferences":"Experimental UI · Illustrative content · Records and activity notes last for this mounted Lab session"}),e.jsxs("button",{type:"button",className:"ui-lab-app-switch",onClick:()=>U(m=>!m),"aria-expanded":H,children:[H?"− Hide":"✦ Open"," Toast Playground"]}),H&&e.jsx(Mt,{}),E&&e.jsxs("section",{className:"ui-lab-app-design",children:[e.jsx("h2",{children:"Design lab"}),e.jsx("p",{children:"This entire screen is the shell prototype, not a preview inside another page."}),e.jsx("div",{className:"ui-lab-app-swatches",children:["#101240","#520E25","#F0D3E7"].map(m=>e.jsx("div",{style:{background:m},children:e.jsx("code",{children:m})},m))}),e.jsx("a",{href:"#/hub",children:"Return to production app"})]})]}),e.jsx("nav",{className:"ui-lab-app-bottom","aria-label":"Primary mobile navigation",children:Ke.map(m=>e.jsxs("button",{type:"button","aria-label":m,"aria-current":s===m?"page":void 0,className:s===m?"active":"",onClick:()=>ne(m),children:[e.jsx("span",{className:"ui-lab-nav-icon-wrap",children:e.jsx(ln,{area:m})}),e.jsx("small",{children:m})]},m))})]})]})}export{Hi as UiLabPage};
