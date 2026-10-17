import { useCallback, useEffect, useState } from "react";
import type { RequestOptions } from "./contracts";
/** Caller memoizes request. Reads cancel on replacement/unmount; stale results are ignored. */
export function useServiceQuery<T>(request: (options: RequestOptions) => Promise<T>, enabled = true) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{request: typeof request; attempt:number; data?:T; error?:Error} | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setResult(null);
    // Promise boundary also handles adapters that throw before returning a Promise.
    void Promise.resolve().then(() => request({signal:controller.signal})).then(
      data => {if (!controller.signal.aborted) setResult({request,attempt,data});},
      error => {if (!controller.signal.aborted) setResult({request,attempt,error:error instanceof Error ? error : new Error("Unable to load data.")});},
    );
    return () => controller.abort();
  }, [request, attempt, enabled]);
  const current = enabled && result?.request === request && result.attempt === attempt ? result : null;
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  return {data:current?.data,error:current?.error,loading:enabled && !current,retry};
}
