import { useState } from "react";
import { AppIcon } from "../../components/ui/AppIcon";
import { LoadingState, SkeletonBlock } from "../../components/ui/LoadingState";
import { LoadingBar, ProgressBar, StepProgress } from "../../components/ui/ProgressBar";
import "./feedbackPlayground.css";

/** Isolated interactive preview. No fake saves, network calls, or persisted state. */
export function FeedbackPlayground() {
  const [completed, setCompleted] = useState(3);
  return (
    <section className="kp-feedback-playground" aria-label="Progress and loading playground">
      <header>
        <h2>Progress & loading</h2>
        <p>Reusable treatments with the quiz progress gradient. Change the step count to preview real transitions.</p>
      </header>
      <div className="kp-feedback-demo-grid">
        <div className="kp-feedback-demo">
          <h3>Quiz-style step progress</h3>
          <StepProgress title="Discovering your preferences" completed={completed} total={8} />
          <label htmlFor="kp-feedback-preview-range">Completed questions: {completed} of 8</label>
          <input id="kp-feedback-preview-range" type="range" min="0" max="8" step="1" value={completed} onChange={event => setCompleted(Number(event.target.value))} />
          <p>Actual completed steps control the width — not time elapsed.</p>
        </div>
        <div className="kp-feedback-demo">
          <h3>Compact / prominent progress</h3>
          <ProgressBar value={completed} max={8} label="Compact profile progress" size="hairline" />
          <ProgressBar value={completed} max={8} label="Prominent profile progress" size="prominent" />
          <h3>Unknown duration</h3>
          <LoadingBar label="Loading recommendations" />
          <p>Indeterminate loading never displays a fabricated percentage.</p>
        </div>
        <div className="kp-feedback-demo">
          <h3>Inline loading</h3>
          <LoadingState label="Finding related items…" size="small" />
          <h3>Panel loading</h3>
          <LoadingState label="Loading your discoveries" detail="Checking for updated suggestions." presentation="panel" showBar />
        </div>
        <div className="kp-feedback-demo">
          <h3>Placeholder content</h3>
          <div className="kp-feedback-skeleton-row" role="status" aria-label="Loading content preview">
            <SkeletonBlock height="42px" width="42px" radius="medium" />
            <div>
              <SkeletonBlock height="14px" width="72%" />
              <SkeletonBlock height="10px" width="93%" />
              <SkeletonBlock height="10px" width="61%" />
            </div>
          </div>
          <h3>Future custom artwork</h3>
          <LoadingState label="Loading artwork slot" artwork={<AppIcon name="discover" size={26} />} />
          <p>The glyph can later be replaced by commissioned flame artwork without rewriting the loader.</p>
        </div>
      </div>
    </section>
  );
}
