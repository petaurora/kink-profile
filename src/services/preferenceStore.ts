import { ratingKey, type AppServices, type PreferenceRating, type PreferenceSnapshot, type PreferenceTarget } from "./contracts";
export type SaveStatus = "idle" | "saving" | "failed";
export type PreferenceState = PreferenceSnapshot & { saves: Record<string, SaveStatus> };
export type SaveOutcome = "saved" | "failed" | "superseded";
/** Session coordinator. Serializes each target independently, and keeps the latest edit visible. */
export function createPreferenceStore(service: AppServices["preferences"], initial: PreferenceSnapshot) {
  let state: PreferenceState = {...structuredClone(initial), saves:{}};
  const listeners = new Set<() => void>();
  const revisions = new Map<string, number>();
  const queues = new Map<string, Promise<unknown>>();
  function publish(next: PreferenceState) { state = next; listeners.forEach(listener => listener()); }
  function setRating(target: PreferenceTarget, value: PreferenceRating | undefined): Promise<SaveOutcome> {
    const capturedTarget = structuredClone(target);
    const key = ratingKey(capturedTarget);
    const revision = (revisions.get(key) ?? 0) + 1;
    revisions.set(key, revision);
    const ratings = {...state.ratings};
    if (value === undefined) delete ratings[key]; else ratings[key] = value;
    publish({...state, ratings, saves:{...state.saves,[key]:"saving"}});
    const task = (queues.get(key) ?? Promise.resolve()).then(async (): Promise<SaveOutcome> => {
      // Coalesce edits still waiting behind an earlier request.
      if (revisions.get(key) !== revision) return "superseded";
      try {
        await service.setRating(capturedTarget, value);
        if (revisions.get(key) !== revision) return "superseded";
        publish({...state,saves:{...state.saves,[key]:"idle"}});
        return "saved";
      } catch {
        if (revisions.get(key) !== revision) return "superseded";
        publish({...state,saves:{...state.saves,[key]:"failed"}});
        return "failed";
      }
    });
    queues.set(key, task);
    void task.then(() => {if (queues.get(key) === task) queues.delete(key);});
    return task;
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => {listeners.delete(listener);}; },
    setRating,
  };
}
