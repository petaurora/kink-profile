import { createContext, useContext, type ReactNode } from "react";
import { useModalOpen } from "./ModalLayer";
import { ToastViewport } from "./ToastViewport";
import { useToastQueue } from "./useToastQueue";

const ToastContext = createContext<ReturnType<typeof useToastQueue> | null>(
  null,
);

/** Mount once at an application boundary, so all consumers share one queue. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const queue = useToastQueue();
  const modalOpen = useModalOpen();
  return (
    <ToastContext.Provider value={queue}>
      {children}
      <ToastViewport
        items={queue.items}
        onDismiss={queue.dismiss}
        position={modalOpen ? "modal" : "above-navigation"}
      />
    </ToastContext.Provider>
  );
}
export function useToasts() {
  const queue = useContext(ToastContext);
  if (!queue) throw new Error("useToasts must be used within ToastProvider");
  return queue;
}
