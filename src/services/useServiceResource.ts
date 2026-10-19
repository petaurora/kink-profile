import { useCallback, useEffect, useRef, useState } from "react";
import type { RequestOptions } from "./contracts";
import { useServiceQuery } from "./useServiceQuery";

/** One confirmed resource and one command at a time. UI state is scoped to the adapter. */
export function useServiceResource<T>(read: (options: RequestOptions) => Promise<T>) {
  const query = useServiceQuery(read);
  const [confirmed, setConfirmed] = useState<{ read: typeof read; value: T }>();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<{ read: typeof read; retry: () => void }>();
  const current = useRef(read);
  current.current = read;
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setPending(false);
    return () => { mounted.current = false; active.current?.abort(); active.current = null; };
  }, [read]);
  const run = useCallback((command: (options: RequestOptions) => Promise<T>, after?: (value: T) => void) => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setFailure(undefined);
    const valid = () => mounted.current && current.current === read && !controller.signal.aborted;
    void Promise.resolve().then(() => command({signal:controller.signal})).then(value => {
      if (!valid()) return;
      setConfirmed({read,value});
      after?.(value);
    }, () => {
      if (valid()) setFailure({read, retry:() => run(command, after)});
    }).finally(() => {
      if (valid()) { active.current = null; setPending(false); }
    });
  }, [read]);
  return {
    data: confirmed?.read === read ? confirmed.value : query.data,
    loading: query.loading && confirmed?.read !== read,
    loadError: query.error, retryLoad:query.retry,
    pending, failed:failure?.read === read, retry:failure?.read === read ? failure.retry : undefined, run,
  };
}
