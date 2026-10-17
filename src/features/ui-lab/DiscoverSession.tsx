import type { DiscoveryTheme } from "./Serendipity";
import { createContext, useContext, useState, type ReactNode } from "react";

export const reflection = {
  id:"preference-reflection", version:"reflection-v1", title:"Reflect on your interests",
  prompts:[{id:"interest",label:"What would you like to understand about your interests?"},{id:"comfort",label:"What helps you feel comfortable while exploring?"},{id:"next",label:"What would you like to learn or explore next?"}],
};
export type Attempt = {
  id:string; activityId:string; version:string; previousAttemptId?:string;
  status:"draft"|"complete"; step:number; answers:Record<string,string>; updatedAt:string; completedAt?:string;
};
function useDiscoverState() {
  const [dismissed,setDismissed]=useState<string[]>([]);
  const [seenTopics,setSeenTopics]=useState<string[]>([]);
  const [theme,setTheme]=useState<DiscoveryTheme|null>(null);
  const noteTopic=(id:string)=>setSeenTopics(previous=>previous.includes(id)?previous:[...previous,id]);
  const [attempts,setAttempts]=useState<Attempt[]>([]);
  const start=(previousAttemptId?:string)=>{
    const id=crypto.randomUUID();
    setAttempts(previous=>[...previous,{id,activityId:reflection.id,version:reflection.version,previousAttemptId,status:"draft",step:0,answers:{},updatedAt:new Date().toISOString()}]);
    return id;
  };
  const update=(id:string,field:string,value:string)=>setAttempts(previous=>previous.map(attempt=>attempt.id===id&&attempt.status==="draft"?{...attempt,answers:{...attempt.answers,[field]:value},updatedAt:new Date().toISOString()}:attempt));
  const complete=(id:string)=>setAttempts(previous=>previous.map(attempt=>attempt.id===id&&attempt.status==="draft"?{...attempt,status:"complete",answers:{...attempt.answers},completedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}:attempt));
  const setStep=(id:string,step:number)=>setAttempts(previous=>previous.map(attempt=>attempt.id===id&&attempt.status==="draft"?{...attempt,step:Math.max(0,Math.min(reflection.prompts.length-1,step))}:attempt));
  return {dismissed,seenTopics,noteTopic,theme,setTheme,attempts,start,update,complete,setStep,dismiss:(id:string)=>setDismissed(previous=>previous.includes(id)?previous:[...previous,id]),restore:(id:string)=>setDismissed(previous=>previous.filter(value=>value!==id)),resetDismissals:()=>setDismissed([]),remove:(id:string)=>setAttempts(previous=>previous.filter(attempt=>attempt.id!==id))};
}
type Session=ReturnType<typeof useDiscoverState>;
const DiscoverContext=createContext<Session|null>(null);
export function DiscoverSessionProvider({children}:{children:ReactNode}){const session=useDiscoverState();return <DiscoverContext.Provider value={session}>{children}</DiscoverContext.Provider>;}
export function useDiscoverSession(){const session=useContext(DiscoverContext);if(!session)throw new Error("DiscoverSessionProvider is required");return session;}
