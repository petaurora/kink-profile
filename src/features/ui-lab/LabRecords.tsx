import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { SaveState } from "../../components/ui/PreferenceControl";

export type LabValue = string | boolean | undefined;
export type LabRevision = { target: string; value: LabValue; recordedAt: string; version: number };
function useSessionRecords() {
  const [values, setValues] = useState<Record<string, LabValue>>({});
  const [saves, setSaves] = useState<Record<string, SaveState>>({});
  const [revisions, setRevisions] = useState<LabRevision[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const current = useRef<Record<string, LabValue>>({});
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
    // This is an explicitly labelled simulation, never a durable save.
    timers.current[target] = setTimeout(() => {
      if (versions.current[target] !== version) return;
      setSaves(previous => ({ ...previous, [target]: fail ? "failed" : "saved" }));
      if (!fail) timers.current[target] = setTimeout(() => {
        if (versions.current[target] === version) setSaves(previous => ({ ...previous, [target]: "idle" }));
      }, 1250);
    }, 850);
    return version;
  }, []);
  const retry = useCallback((target: string) => commit(target, current.current[target]), [commit]);
  const restore = useCallback((target: string, version: number, previous: LabValue) => {
    if (versions.current[target] !== version) return false;
    commit(target, previous);
    return true;
  }, [commit]);
  return { values, saves, revisions, helpOpen, setHelpOpen, commit, retry, restore };
}
export type Records = ReturnType<typeof useSessionRecords>;
const RecordsContext = createContext<Records | null>(null);
export function LabRecordsProvider({ children }: { children: ReactNode }) {
  const records = useSessionRecords();
  return <RecordsContext.Provider value={records}>{children}</RecordsContext.Provider>;
}
export function useLabRecords() {
  const shared = useContext(RecordsContext);
  const standalone = useSessionRecords();
  return shared || standalone;
}

export function LabSaveSummary() {
  const { saves, retry } = useLabRecords();
  const failures = Object.keys(saves).filter(target => saves[target] === "failed");
  if (!failures.length) return null;
  return <div className="cc-error-summary" role="status"><span>{failures.length} changes not saved · Latest edits kept in this Lab session</span><button type="button" onClick={() => failures.forEach(retry)}>Retry all</button></div>;
}
