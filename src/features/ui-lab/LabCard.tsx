import { useId, type ReactNode } from "react";

/** Shared workspace card. Secondary controls stay outside the navigation button. */
export function LabCard({title,description,icon,featured=false,onClick,href,children,className="",status,actionLabel}: {
  title:string; description?:string; icon:ReactNode; featured?:boolean;
  onClick?:()=>void; href?:string; children?:ReactNode; className?:string;
  status?:string; actionLabel?:string;
}) {
  const descriptionId=useId();
  const navigates=Boolean(onClick||href);
  const classes=`ui-lab-app-tile lab-card${featured?" featured":""}${className?" "+className:""}`;
  const body=<><span className="ui-lab-app-tile-icon" aria-hidden="true">{icon}</span>
    {navigates?<strong>{title}</strong>:<h2>{title}</h2>}
    {description&&<small id={descriptionId}>{description}</small>}
    {status&&<span id={descriptionId+"-status"} className="lab-card-status">{status}</span>}
    {navigates&&<span className="ui-lab-app-tile-arrow" aria-hidden="true">↗</span>}</>;
  const label={"aria-label":actionLabel??title,"aria-describedby":[description&&descriptionId,status&&descriptionId+"-status"].filter(Boolean).join(" ")||undefined};
  if(children)return <section className={classes} aria-label={title}>
    {onClick?<button type="button" className="lab-card-main" {...label} onClick={onClick}>{body}</button>:body}
    {children}
  </section>;
  if(href)return <a className={classes} {...label} href={href}>{body}</a>;
  if(onClick)return <button type="button" className={classes} {...label} onClick={onClick}>{body}</button>;
  return <section className={classes} aria-label={title}>{body}</section>;
}
