import { useState } from "react";
import { KPLoading } from "../../components/ui/KPLoading";
import "./loadingPlayground.css";

/** Visual QA sandbox, not a simulated asynchronous operation. */
export function LoadingPlayground() {
  const [paused, setPaused] = useState(false);
  return (
    <section id="kp-loading-playground" className={"kp-loading-playground" + (paused ? " is-paused" : "")} aria-label="Loading Playground">
      <div className="kp-loading-playground-heading">
        <div>
          <p className="kp-loading-playground-kicker">DESIGN LAB / LOADING</p>
          <h2>Loading Playground</h2>
          <p>Temporary three-swirl SVG placeholder — the commissioned illustration will replace the symbol, not the loading behavior.</p>
        </div>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? "Resume animation" : "Pause animation"}
        </button>
      </div>
      <div className="kp-loading-playground-grid">
        <div><p>Compact · 32px</p><KPLoading compact label="Loading an item…" size={32}/></div>
        <div><p>Inline · 56px</p><KPLoading label="Loading results…" size={56}/></div>
        <div><p>Screen · 104px</p><KPLoading label="Loading your profile…" size={104}/></div>
      </div>
      <p className="kp-loading-playground-note">Loading means work is pending. Failures retain Retry; completed operations never show this spinner. Reduced-motion preferences stop rotation automatically. No licensed stock asset is shipped.</p>
    </section>
  );
}
