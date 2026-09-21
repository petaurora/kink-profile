import { useNavigate } from "react-router-dom";
import { shapeProfileStages } from "./shapeProfileGuide";
import "./ShapeProfileGuide.css";

export function ShapeProfileGuide() {
  const navigate = useNavigate();

  return (
    <section
      className="shape-profile-guide"
      aria-labelledby="shape-profile-guide-title"
    >
      <header className="shape-profile-guide-heading">
        <div>
          <p className="eyebrow">Recommended path</p>
          <h2 id="shape-profile-guide-title">Shape Your Profile</h2>
        </div>
        <p>Suggested order — skip around anytime.</p>
      </header>

      <div className="shape-profile-guide-stages">
        {shapeProfileStages.map((stage) => (
          <section className="shape-profile-stage" key={stage.id}>
            <div className="shape-profile-stage-heading">
              <strong>{stage.label}</strong>
              <span>{stage.summary}</span>
            </div>

            <div
              className="shape-profile-steps"
              data-step-count={stage.steps.length}
            >
              {stage.steps.map((step) => (
                <button
                  className="shape-profile-step"
                  type="button"
                  key={step.id}
                  onClick={() => navigate(step.path)}
                  aria-label={`${step.number}. ${step.title}. ${step.detail}`}
                >
                  <span className="shape-profile-step-number" aria-hidden="true">
                    {step.number}
                  </span>
                  <strong>{step.title}</strong>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
