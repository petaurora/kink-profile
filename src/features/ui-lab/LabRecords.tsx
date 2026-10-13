import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type SetStateAction } from "react";
import type { SaveState } from "../../components/ui/PreferenceControl";
import { useOptionalServices, useOptionalServiceData } from "../../services/AppServicesProvider";
import { ratingKey, type CatalogReferenceData, type PreferenceTarget, type PreferenceRating, type ExperienceValue } from "../../services/contracts";
import { createUiLabServices, type UiLabAdapter } from "./services/createUiLabServices";
import { labReferenceData, labInitialPreferences } from "./services/fixtures";

type Descriptor={rating:PreferenceTarget}|{itemId:string;field:"tried"|"comfort"};
function recordTargets(data:CatalogReferenceData){
 const targets:Record<string,Descriptor>={};
 for(const item of data.items){
  targets[item.id+":overall"]={rating:{kind:"item",itemId:item.id}};
  for(const group of item.groups)for(const value of group.values)targets[item.id+":"+group.name+":"+value.name]={rating:{kind:"modifier",itemId:item.id,groupId:group.id,valueId:value.id}};
  for(const field of ["tried","comfort"] as const)targets[`experience:${item.id}:${field}`]={itemId:item.id,field};
 }
 for(const concept of data.concepts)targets[`concept:${concept.id}:preference`]={rating:{kind:"concept",conceptId:concept.id}};
 return targets;
}

export type LabValue = string | boolean | undefined;
export type LabRevision = { target: string; value: LabValue; recordedAt: string; version: number };
function useSessionRecords(diagnostics?:UiLabAdapter) {
  const sharedServices=useOptionalServices();const loaded=useOptionalServiceData();
  const [standalone]=useState(()=>createUiLabServices({latencyMs:0}));
  const services=sharedServices??standalone.services;
  const data=loaded?.referenceData??labReferenceData;const snapshot=loaded?.snapshot??labInitialPreferences;
  const targets=recordTargets(data);
  const [values, setValues] = useState<Record<string, LabValue>>(()=>Object.fromEntries(Object.entries(targets).map(([key,target])=>[key,"rating" in target?snapshot.ratings[ratingKey(target.rating)]:snapshot.experience?.[target.itemId]?.[target.field]])));
  const queues=useRef<Record<string,Promise<unknown>>>({});
  const [saves, setSaves] = useState<Record<string, SaveState>>({});
  const [revisions, setRevisions] = useState<LabRevision[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [views, setViews] = useState<Record<string, unknown>>({});
  const current = useRef<Record<string, LabValue>>(values);
  const versions = useRef<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);
  const commit = useCallback((target: string, value: LabValue, fail = false) => {
    const version = (versions.current[target] || 0) + 1;
    versions.current[target] = version;
    current.current = { ...current.current, [target]: value };
    setValues(current.current);
    setRevisions(previous => [...previous, { target, value, version, recordedAt: new Date().toISOString() }]);
    setSaves(previous => ({ ...previous, [target]: "saving" }));
    clearTimeout(timers.current[target]);
    if(fail)(diagnostics??(sharedServices?undefined:standalone))?.failNext("save");
    const write=async()=>{
      if(versions.current[target]!==version)return;
      try{
        const descriptor=targets[target];if(!descriptor)throw new Error("Unknown explicit record target");
        if("rating" in descriptor)await services.preferences.setRating(descriptor.rating,value as PreferenceRating|undefined);
        else await services.preferences.setExperience(descriptor.itemId,descriptor.field,value as ExperienceValue|undefined);
        if(versions.current[target]!==version)return;
        setSaves(previous=>({...previous,[target]:"saved"}));
        timers.current[target]=setTimeout(()=>{if(versions.current[target]===version)setSaves(previous=>({...previous,[target]:"idle"}));},1250);
      }catch{if(versions.current[target]===version)setSaves(previous=>({...previous,[target]:"failed"}));}
    };
    const pending=queues.current[target];const task=pending?pending.then(write):write();queues.current[target]=task;
    void task.then(()=>{if(queues.current[target]===task)delete queues.current[target];});
    return version;
  }, [services,data,diagnostics,sharedServices,standalone]);
  const retry = useCallback((target: string) => commit(target, current.current[target]), [commit]);
  const restore = useCallback((target: string, version: number, previous: LabValue) => {
    if (versions.current[target] !== version) return false;
    commit(target, previous);
    return true;
  }, [commit]);
  return { values, saves, revisions, helpOpen, setHelpOpen, views, setViews, commit, retry, restore };
}
export type Records = ReturnType<typeof useSessionRecords>;
const RecordsContext = createContext<Records | null>(null);
export function LabRecordsProvider({ children, diagnostics }: { children: ReactNode;diagnostics?:UiLabAdapter }) {
  const records = useSessionRecords(diagnostics);
  return <RecordsContext.Provider value={records}>{children}</RecordsContext.Provider>;
}
export function useLabRecords() {
  const shared = useContext(RecordsContext);
  const standalone = useSessionRecords();
  return shared || standalone;
}
/** Navigation/view state is session continuity, separate from explicit records. */
export function useLabViewState<T>(scope: string, key: string, initial: T): [T, (update: SetStateAction<T>) => void] {
  const shared = useContext(RecordsContext);
  const [local, setLocal] = useState(initial);
  const field = `${scope}:${key}`;
  const value = shared ? (shared.views[field] as T | undefined) ?? local : local;
  return [value, update => {
    if (!shared) { setLocal(update); return; }
    shared.setViews(previous => ({ ...previous, [field]: typeof update === "function" ? (update as (value:T)=>T)((previous[field] as T | undefined) ?? local) : update }));
  }];
}

export function LabSaveSummary() {
  const { saves, retry } = useLabRecords();
  const failures = Object.keys(saves).filter(target => saves[target] === "failed");
  if (!failures.length) return null;
  return <div className="cc-error-summary" role="status"><span>{failures.length} changes not saved · Latest edits kept in this Lab session</span><button type="button" onClick={() => failures.forEach(retry)}>Retry all</button></div>;
}
