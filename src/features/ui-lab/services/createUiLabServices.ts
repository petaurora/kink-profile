import { preferenceRatings, ratingKey, ServiceError, type AppServices, type CatalogReferenceData, type PreferenceSnapshot, type PreferenceTarget, type RequestOptions } from "../../../services/contracts";
import { searchReferenceData } from "../../../services/search";
import { labInitialPreferences, labReferenceData } from "./fixtures";

export type LabOperation = "catalog" | "search" | "preferences" | "save";
export type UiLabAdapter = { services: AppServices; failNext(operation: LabOperation): void };
/** Every factory call owns an isolated session. No fetch, production storage or accounts. */
export function createUiLabServices({ latencyMs = 180, saveLatencyMs = 850, referenceData = labReferenceData, initialPreferences = labInitialPreferences }: {
  latencyMs?: number; saveLatencyMs?: number;
  referenceData?: CatalogReferenceData; initialPreferences?: PreferenceSnapshot;
} = {}): UiLabAdapter {
  const data = structuredClone(referenceData);
  const snapshot = structuredClone(initialPreferences);
  const failures = new Set<LabOperation>();
  async function request<T>(operation: LabOperation, work: () => T, options?: RequestOptions): Promise<T> {
    const fail = failures.delete(operation);
    const signal = options?.signal;
    if (signal?.aborted) throw new DOMException("Request canceled", "AbortError");
    await new Promise<void>((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(new DOMException("Request canceled", "AbortError")); };
      const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, operation === "save" ? saveLatencyMs : latencyMs);
      signal?.addEventListener("abort", abort, {once:true});
    });
    if (signal?.aborted) throw new DOMException("Request canceled", "AbortError");
    if (fail) throw new ServiceError("unavailable", "The sample service is temporarily unavailable.");
    return structuredClone(work());
  }
  function validateTarget(target: PreferenceTarget) {
    const item = data.items.find(item => item.id === target.itemId);
    if ((target.kind !== "item" && target.kind !== "modifier") || !item || (target.kind === "modifier" && !item.groups.find(group => group.id === target.groupId)?.values.some(value => value.id === target.valueId))) {
      throw new ServiceError("invalid-target", "This preference target is unavailable.");
    }
  }
  return {
    failNext(operation) { failures.add(operation); },
    services: {
      catalog: {getReferenceData: options => request("catalog", () => data, options)},
      search: {search: (query, options) => request("search", () => searchReferenceData(data, query), options)},
      preferences: {
        getSnapshot: options => request("preferences", () => snapshot, options),
        setRating: (target, value, options) => {
          // Capture input before the asynchronous boundary; callers cannot mutate a pending write.
          const capturedTarget = structuredClone(target);
          return request("save", () => {
            validateTarget(capturedTarget);
            if (value !== undefined && !preferenceRatings.includes(value)) throw new ServiceError("invalid-value", "Unknown preference rating.");
            const key = ratingKey(capturedTarget);
            if (value === undefined) delete snapshot.ratings[key]; else snapshot.ratings[key] = value;
          }, options);
        },
      },
    },
  };
}
