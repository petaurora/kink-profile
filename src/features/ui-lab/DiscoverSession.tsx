import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useOptionalServices } from "../../services/AppServicesProvider";
import { ServiceError, type RequestOptions } from "../../services/contracts";
import type { DiscoverAttempt, DiscoverAttemptEdit, DiscoverSnapshot } from "../../services/discoverContracts";
import { useServiceResource } from "../../services/useServiceResource";
// Compatibility export for the separate Surprise Me prototype; service responses own active content.
export { reflection } from "../../services/local/createLocalDiscoverService";
export type Attempt = DiscoverAttempt;

function useDiscoverState() {
  const service = useOptionalServices()?.discover;
  const read = useCallback((options: RequestOptions) => {
    if (!service) return Promise.reject(new ServiceError("unavailable", "Discover is unavailable with this connection."));
    return service.getSnapshot(options);
  }, [service]);
  const resource = useServiceResource(read);
  const [finishingId, setFinishingId] = useState<string>();
  const [drafts, setDrafts] = useState<Record<string, DiscoverAttemptEdit>>({});
  const latestDrafts = useRef(drafts);
  latestDrafts.current = drafts;
  useEffect(() => {setDrafts({});setFinishingId(undefined);}, [service]);
  const attempts = resource.data?.attempts.map(attempt => attempt.status === "draft" && drafts[attempt.id]
    ? {...attempt, ...drafts[attempt.id]} : attempt) ?? [];
  const dirty = Object.keys(drafts)[0];
  const save = (id: string) => {
    const edit = latestDrafts.current[id];
    if (!service || !edit) return;
    resource.run(options => service.saveAttempt(id, edit, options), () => {
      setDrafts(previous => {
        if (previous[id] !== edit) return previous;
        const next = {...previous}; delete next[id]; return next;
      });
    });
  };
  // Unsaved text remains UI-owned until confirmation; navigation inside the Lab keeps this provider.
  useEffect(() => {
    if (!dirty || resource.pending || resource.failed) return;
    const timer = setTimeout(() => save(dirty), 250);
    return () => clearTimeout(timer);
  }, [drafts, dirty, resource.pending, resource.failed, service]);
  const editFor = (id:string) => {
    const attempt = attempts.find(value => value.id === id);
    if (!attempt || attempt.status !== "draft") return undefined;
    return {answers:{...attempt.answers}, step:attempt.step};
  };
  const clearDraft = (id:string) => setDrafts(previous => {const next={...previous};delete next[id];return next;});
  const command = (work:(options:RequestOptions)=>Promise<DiscoverSnapshot>, after?:()=>void) => resource.run(work,after);
  return {
    ...resource, available:!!service, reflection:resource.data?.reflection,
    suggestions:resource.data?.suggestions ?? [], dismissed:resource.data?.dismissed ?? [], attempts,
    hasUnsaved:!!dirty, finishingId,
    start(previous:string|undefined, onStarted:(id:string)=>void) {
      if (!service) return;
      let id:string;
      command(async options => {const value=await service.startAttempt(previous,options);id=value.id;return value.snapshot;},()=>onStarted(id));
    },
    update(id:string,field:string,value:string) {
      const edit=editFor(id);if (!edit) return;
      setDrafts(previous=>({...previous,[id]:{...edit,answers:{...edit.answers,[field]:value}}}));
    },
    setStep(id:string,step:number) {
      const edit=editFor(id);if (!edit) return;
      setDrafts(previous=>({...previous,[id]:{...edit,step}}));
    },
    complete(id:string,after:()=>void) {
      const edit=editFor(id);if (service && edit && !resource.pending) {setFinishingId(id);command(options=>service.completeAttempt(id,edit,options),()=>{clearDraft(id);setFinishingId(undefined);after();});}
    },
    remove(id:string) {if (service) command(options=>service.removeAttempt(id,options),()=>clearDraft(id));},
    dismiss(id:string) {if (service) command(options=>service.setDismissed(id,true,options));},
    restore(id:string) {if (service) command(options=>service.setDismissed(id,false,options));},
    resetDismissals() {if (service) command(options=>service.resetDismissals(options));},
  };
}
type Session=ReturnType<typeof useDiscoverState>;
const DiscoverContext=createContext<Session|null>(null);
export function DiscoverSessionProvider({children}:{children:ReactNode}) {const session=useDiscoverState();return <DiscoverContext.Provider value={session}>{children}</DiscoverContext.Provider>;}
export function useDiscoverSession() {const session=useContext(DiscoverContext);if(!session)throw new Error("DiscoverSessionProvider is required");return session;}
