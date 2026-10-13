import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { AppServices, CatalogReferenceData, RequestOptions } from "./contracts";
import type { PreferenceSnapshot } from "./contracts";
import { useServiceQuery } from "./useServiceQuery";

const ServicesContext = createContext<AppServices | null>(null);
const DataContext = createContext<{referenceData:CatalogReferenceData;snapshot:PreferenceSnapshot} | null>(null);
export function ServiceQueryStatus({loading,error,onRetry,label}: {loading:boolean;error?:Error;onRetry:()=>void;label:string}) {
  if (loading) return <p role="status">Loading {label}…</p>;
  if (error) return <div role="alert"><p>Unable to load {label}. Your existing preferences are unchanged.</p><button type="button" onClick={onRetry}>Retry loading {label}</button></div>;
  return null;
}
export function AppServicesProvider({services,children}: {services:AppServices;children:ReactNode}) {
  return <ServicesContext.Provider value={services}><ServiceData services={services}>{children}</ServiceData></ServicesContext.Provider>;
}
function ServiceData({services,children}: {services:AppServices;children:ReactNode}) {
  const load = useCallback(async (options:RequestOptions) => {
    const [referenceData,snapshot] = await Promise.all([services.catalog.getReferenceData(options),services.preferences.getSnapshot(options)]);
    return {referenceData,snapshot};
  }, [services]);
  const query = useServiceQuery(load);
  const data = useMemo(() => query.data ? {referenceData:query.data.referenceData,snapshot:query.data.snapshot} : null,[query.data,services]);
  if (!data) return <section className="ui-lab kp-ui" aria-label="UI Lab data"><ServiceQueryStatus loading={query.loading} error={query.error} onRetry={query.retry} label="UI Lab data"/></section>;
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}
export function useAppServices() {
  const services = useContext(ServicesContext);
  if (!services) throw new Error("AppServicesProvider is required.");
  return services;
}
export function useReferenceData() {
  const data = useContext(DataContext);
  if (!data) throw new Error("Loaded AppServicesProvider is required.");
  return data.referenceData;
}
export function useOptionalServices(){return useContext(ServicesContext);}
export function useOptionalServiceData(){return useContext(DataContext);}
