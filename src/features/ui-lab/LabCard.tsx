import { AppIcon } from "../../components/ui/AppIcon";
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
    {navigates&&<span className="ui-lab-app-tile-arrow" aria-hidden="true"><AppIcon name="details" size={20} /></span>}</>;
  const name=actionLabel&&!actionLabel.toLowerCase().includes(title.toLowerCase())?`${title}: ${actionLabel}`:actionLabel??title;
  const label={"aria-label":name,"aria-describedby":[description&&descriptionId,status&&descriptionId+"-status"].filter(Boolean).join(" ")||undefined};
  // The title labels the control; supporting copy is its description. Keep
  // descriptions outside the control so visible labels and voice names agree.
  return <section className={classes} aria-label={title} data-navigation={navigates||undefined}>
    {onClick?<button type="button" className="lab-card-main" {...label} onClick={onClick}>{body}</button>
      :href?<a className="lab-card-main" {...label} href={href}>{body}</a>:body}
    {description&&<small id={descriptionId}>{description}</small>}
    {status&&<span id={descriptionId+"-status"} className="lab-card-status">{status}</span>}
    {children}
  </section>;
}
