import { appIcons, appIconDefaults } from "../../components/ui/appIcons";
import { useState } from "react";
import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { compareRoute, profileRoute, quizHomeRoute, rewardsToolsRandomizerRoute, rewardsToolsRecipesRoute, sceneBuilderRoute, settingsRoute } from "../../app/routes";
import { ContinueActivities } from "./DiscoverWorkspace";
import { useLabRecords } from "./LabRecords";
import { useLabCatalog } from "./LabCatalog";
import type { LabArea } from "./LabNavigation";
import { LabCard } from "./LabCard";

type Go=(area:LabArea,workspace?:string,params?:Record<string,string>)=>void;
export function LabOverview({area,workspace,go,shortcuts,onShortcuts}:{area:LabArea;workspace:string;go:Go;shortcuts:LabArea[];onShortcuts:(areas:LabArea[])=>void}) {
  const records=useLabRecords();
  const {items}=useLabCatalog();
  const [editing,setEditing]=useState(false);
  const entries=Object.entries(records.values).filter(([,value])=>value!==undefined);
  const recordLabel=(target:string)=>{
    const isExperience=target.startsWith("experience:");
    const key=isExperience?target.slice("experience:".length):target;
    const item=items.find(item=>key===item.id||key.startsWith(item.id+":"));
    if(!item)return key.replaceAll(":", " · ");
    const suffix=key.slice(item.id.length).replace(/^:/,"").replaceAll(":", " · ");
    return [item.name,suffix].filter(Boolean).join(" · ");
  };
  if(area==="Home")return <div className="ui-lab-app-grid lab-card-grid lab-home-cards">
    <ContinueActivities go={go} card/>
    <LabCard title="Your profile at a glance" icon={<appIcons.profile {...appIconDefaults} />} description={entries.length?`${entries.length} explicit records in this session.`:"No preferences or experience recorded in this Lab session."} onClick={()=>go("Profile")}/>
    <LabCard title="Discover something" icon={<appIcons.discover {...appIconDefaults} />} description="Optional ideas, without pressure" onClick={()=>go("Discover")}/>
    <LabCard title="Your shortcuts" icon={<appIcons.tools {...appIconDefaults} />} description="Quick access to the tools you choose" className="lab-shortcut-card"><div className="lab-shortcuts">{shortcuts.map(area=><button type="button" key={area} onClick={()=>go(area)}>{area}</button>)}</div><DisclosureSection title="Edit shortcuts" open={editing} onToggle={()=>setEditing(!editing)}>{(["Catalog","Profile","Discover","Tools","Creations","Learn"] as LabArea[]).map(area=><label className="lab-shortcut-choice" key={area}><input type="checkbox" checked={shortcuts.includes(area)} onChange={()=>onShortcuts(shortcuts.includes(area)?shortcuts.filter(value=>value!==area):[...shortcuts,area])}/>{area}</label>)}</DisclosureSection><a className="lab-text-link" href={`#${quizHomeRoute.path}`}>Explore quizzes →</a></LabCard>
  </div>;
  if(area==="Profile"&&!workspace)return <div className="ui-lab-app-grid lab-card-grid lab-profile-cards">
    <LabCard title="Your profile" icon={<appIcons.profile {...appIconDefaults} />} featured description="Roles, themes and preference evidence" status={entries.length?`${entries.length} explicit records in this session.`:"No explicit records yet."} onClick={()=>go("Profile","My Profile")}><a className="lab-text-link" href={`#${quizHomeRoute.path}`}>Build your profile with quizzes →</a></LabCard>
    <LabCard title="Relationships" icon={<appIcons.shared {...appIconDefaults} />} description="Connections and linked profiles" status="Connected relationships are not available in this Lab yet." onClick={()=>go("Relationships")}/>
    <LabCard title="Sharing & permissions" icon={<appIcons.private {...appIconDefaults} />} description="Decide what others can see" onClick={()=>go("Profile","Sharing & Permissions")}/>
    <LabCard title="Identity & expression" icon={<appIcons.profile {...appIconDefaults} />} description="Your own words and presentation" status="Not available in this Lab yet." onClick={()=>go("Profile","Identity & Expression")}/>
  </div>;
  if(area==="Profile"&&workspace==="Identity & Expression")return <section className="lab-section"><p>Identity and expression editing is not available in this Lab yet. Your own words and presentation are separate from preference and experience records.</p><button onClick={()=>go("Profile","My Profile")}>Review your records</button><a href={`#${profileRoute.path}`}>Open current Profile</a></section>;
  if(area==="Profile")return <section className="lab-section"><h2>{workspace==="Sharing & Permissions"?"Sharing":"Recorded in this session"}</h2>{workspace==="Sharing & Permissions"?<><p>Choose deliberate sharing from the current app's Profile. Connected relationship permissions are unavailable in this Lab.</p><a href={`#${profileRoute.path}`}>Open current Profile</a></>:<>{!entries.length&&<p>No explicit records yet. Browsing, learning and activities do not fill in your profile.</p>}<dl className="lab-records">{entries.map(([target,value])=>{return <div key={target}><dt>{recordLabel(target)}</dt><dd>{value===true?"Tried":String(value)}</dd></div>})}</dl><button onClick={()=>go("Catalog","Explore All")}>Edit Catalog records</button><button onClick={()=>go("Profile","Sharing & Permissions")}>Sharing & permissions</button></>}</section>;
  if(area==="Tools"&&!workspace)return <div className="ui-lab-app-grid lab-card-grid lab-tool-cards">
    <LabCard title="Scene Builder" icon={<appIcons.scenes {...appIconDefaults} />} featured description="Plan scenes and save drafts" href={`#${sceneBuilderRoute.path}`}/>
    <LabCard title="Agreements & rituals" icon={<appIcons.collection {...appIconDefaults} />} description="Create and maintain shared practices" status="Not available in this Lab yet." onClick={()=>go("Tools","Agreements & Rituals")}/>
    <LabCard title="Randomizers & recipes" icon={<appIcons.tools {...appIconDefaults} />} description="Get practical inspiration" onClick={()=>go("Tools","Randomizers & Recipes")}/>
    <LabCard title="Compare profiles" icon={<appIcons.compare {...appIconDefaults} />} description="Compare only with permission" href={`#${compareRoute.path}`}/>
  </div>;
  if(area==="Tools"&&workspace==="Randomizers & Recipes")return <div className="ui-lab-app-grid lab-card-grid">
    <LabCard title="Reward / Punishment randomizer" icon={<appIcons.tools {...appIconDefaults} />} featured description="Explore possibilities with your own inputs" href={`#${rewardsToolsRandomizerRoute.path}`}/>
    <LabCard title="Recipes" icon={<appIcons.collection {...appIconDefaults} />} description="Find practical inspiration" href={`#${rewardsToolsRecipesRoute.path}`}/>
  </div>;
  if(area==="Tools"&&workspace==="Agreements & Rituals")return <section className="lab-section"><p>Agreements and rituals do not yet have an editor in this Lab.</p><button onClick={()=>go("Tools")}>Back to tools</button></section>;
  if(area==="Tools")return <section className="lab-section"><p>Open an existing tool deliberately. Lab preferences and activity notes stay in this session.</p><a href={`#${workspace==="Compare Profiles"?compareRoute.path:sceneBuilderRoute.path}`}>Open {workspace}</a></section>;
  if(area==="Creations")return <section className="lab-section"><p>No creations are stored in this Lab. Scene drafts are managed in the current Scene Builder.</p><a href={`#${sceneBuilderRoute.path}`}>Open Scene Builder</a></section>;
  if(area==="Learn")return <section className="lab-section"><h2>Understand the concepts</h2><p>Learning and curiosity are independent of participation, preference and consent.</p><button onClick={()=>go("Catalog","Concept Explorer")}>Browse concepts</button><button onClick={()=>go("Learn")}>Browse learning articles</button></section>;
  if(area==="Relationships")return <section className="lab-section"><p>No connected relationship workspace is available in this Lab.</p><p>Sharing is deliberate. Personal records and permissions are independent.</p><button onClick={()=>go("Profile","Sharing & Permissions")}>Review sharing</button></section>;
  if(area==="Settings")return <section className="lab-section"><h2>Lab session</h2><p>Preferences, experience, activity notes and suggestion dismissals remain in memory. Reloading or leaving the Lab ends the session. Search queries are not persisted.</p><h2>App settings</h2><a href={`#${settingsRoute.path}`}>Open current app settings</a></section>;
  return null;
}
