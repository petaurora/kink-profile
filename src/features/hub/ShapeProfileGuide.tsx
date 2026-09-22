import {
  IconArrowRight,
  IconCheck,
  IconLock,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { ShapeProfileJourney } from "./shapeProfileGuide";
import "./ShapeProfileGuide.css";

export function ShapeProfileGuide({
  journey,
}: {
  journey: ShapeProfileJourney;
}) {
  const navigate = useNavigate();

  if (journey.complete) {
    return (
      <section
        className="shape-profile-guide shape-profile-guide-complete"
        aria-label="Shape Your Profile"
      >
        <div className="shape-profile-guide-complete-copy">
          <span className="shape-profile-guide-complete-icon" aria-hidden="true">
            <IconCheck size={18} stroke={2.2} />
          </span>
          <div>
            <strong>Profile foundation established</strong>
            <span>Quiz, kink, and R/P foundations are in place.</span>
          </div>
        </div>
      </section>
    );
  }

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
        <p>One useful next step at a time.</p>
      </header>

      <div className="shape-profile-sections">
        {journey.sections.map((section) => (
          <section
            className={`shape-profile-section is-${section.state}`}
            key={section.id}
          >
            <div className="shape-profile-section-summary">
              <div>
                <strong>{section.label}</strong>
                <span>{section.summary}</span>
              </div>
              {section.state === "complete" ? (
                <IconCheck size={18} stroke={2} aria-label="Complete" />
              ) : section.state === "upcoming" ? (
                <IconLock size={16} stroke={1.7} aria-label="Upcoming" />
              ) : null}
            </div>

            {section.state === "current" && section.step && (
              <div className="shape-profile-current-step">
                <div className="shape-profile-current-copy">
                  <h3>{section.step.title}</h3>
                  <p>{section.step.detail}</p>
                </div>

                {section.step.progress !== null && (
                  <div className="shape-profile-progress">
                    <progress
                      max={1}
                      value={section.step.progress}
                      aria-label={section.step.progressLabel}
                    />
                    <span>{section.step.progressLabel}</span>
                  </div>
                )}

                {section.step.progress === null && (
                  <p className="shape-profile-progress-label">
                    {section.step.progressLabel}
                  </p>
                )}

                <div className="shape-profile-current-footer">
                  <button
                    className="shape-profile-action"
                    type="button"
                    onClick={() => navigate(section.step?.path ?? "/")}
                  >
                    {section.step.actionLabel}
                    <IconArrowRight size={17} stroke={1.9} aria-hidden="true" />
                  </button>
                  {section.step.trail && (
                    <span className="shape-profile-trail">
                      {section.step.trail}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
