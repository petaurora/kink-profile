import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { KPLoading } from "../components/ui/KPLoading";
import "./loadingPreview.css";

/**
 * Temporary review-only hold, intentionally separate from actual data loading.
 * PR preview builds use it by default; ?loading-preview=1 opts in elsewhere.
 * Production navigation never waits for user acknowledgement.
 */
export function LoadingPreviewGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [continued, setContinued] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";
  const isPrPreview = /(?:^|\/)pr-\d+(?:\/|$)/.test(baseUrl);
  const isExplicitPreview = new URLSearchParams(location.search).get("loading-preview") === "1";
  if ((!isPrPreview && !isExplicitPreview) || continued) return <>{children}</>;
  return (
    <main className="kp-loading-preview" aria-label="Loading animation preview">
      <div className="kp-loading-preview-content">
        <p className="kp-loading-preview-eyebrow">KINK PROFILE · ANIMATION PREVIEW</p>
        <KPLoading label="Loading animation preview" size={116} />
        <p className="kp-loading-preview-note">A temporary loading illustration. Take as long as you like to watch the motion.</p>
        <button type="button" className="kp-loading-preview-continue" onClick={() => setContinued(true)}>
          Continue to KP <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}
