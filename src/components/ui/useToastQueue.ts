import { useCallback, useRef, useState } from "react";
import type { ToastMessage } from "./ToastViewport";

export type ToastInput = Omit<ToastMessage, "id">;
const ordinarySuccess = (toast: ToastMessage) =>
  toast.kind === "success" && !toast.actionLabel;

/** Keep the visible notification and every independent action/error. Only
 * queued ordinary successes may consolidate; duplicates of actions stay distinct. */
export function enqueueToast(
  items: ToastMessage[],
  toast: ToastMessage,
): ToastMessage[] {
  if (!ordinarySuccess(toast)) return [...items, toast];
  if (
    items.some(
      (item) => ordinarySuccess(item) && item.message === toast.message,
    )
  )
    return items;
  return [
    ...items.filter((item, index) => index === 0 || !ordinarySuccess(item)),
    toast,
  ];
}
export function useToastQueue() {
  const [items, setItems] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const notify = useCallback((input: ToastInput) => {
    const toast = { ...input, id: ++nextId.current };
    setItems((previous) => enqueueToast(previous, toast));
  }, []);
  const dismiss = useCallback(
    (id: number) =>
      setItems((previous) => previous.filter((item) => item.id !== id)),
    [],
  );
  const clear = useCallback(() => setItems([]), []);
  return { items, notify, dismiss, clear };
}
