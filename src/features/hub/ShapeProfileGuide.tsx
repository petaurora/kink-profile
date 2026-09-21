import {
  IconArrowRight,
  IconBook2,
  IconChecklist,
  IconSparkles,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  shapeProfileStages,
  type ShapeProfileStageId,
} from "./shapeProfileGuide";
import "./ShapeProfileGuide.css";

const stageIconById: Record<
  ShapeProfileStageId,
  typeof IconSparkles
> = {
  discover: IconSparkles,
  refine: IconBook2,
  rewards: IconChecklist,
};

type ShapeProfileGuideProps = {
  completedQuizCount: number;
  totalQuizCount: number;
  rankingChoiceCount: number;
  catalogRatedCount: number;
  contextPreferenceCount: number;
};

export function ShapeProfileGuide({
  completedQuizCount,
  totalQuizCount,
  rankingChoiceCount,
  catalogRatedCount,
  contextPreferenceCount,
}: ShapeProfileGuideProps) {
  const navigate = useNavigate();

  const evidenceByStage: Record<ShapeProfileStageId, string> = {
    discover: `${completedQuizCount}/${totalQuizCount} quizzes · ${rankingChoiceCount} ranking choices`,
    refine: `${catalogRatedCount} preferences defined`,
    rewards: `${contextPreferenceCount} contextual choices`,
  };

  return (
    <section
      className="shape-profile-guide"
      aria-labelledby="shape-profile-guide-title"
    >
      <header className="shape-profile-guide-heading">
        <div>
          <p className="eyebrow">Recommended path</p>
          <h2 id="shape-profile-guide-title">Shape Your Profile</h2>
          <p>
            Build a clearer picture of what you like, how you like it, and what
            matters most.
          </p>
        </div>
        <span className="shape-profile-guide-note">
          Follow the path or skip around — nothing here is gated.
        </span>
      </header>

      <div className="shape-profile-guide-stages">
        {shapeProfileStages.map((stage) => {
          const StageIcon = stageIconById[stage.id];

          return (
            <article className="shape-profile-stage" key={stage.id}>
              <div className="shape-profile-stage-heading">
                <span className="shape-profile-stage-icon" aria-hidden="true">
                  <StageIcon size={22} stroke={1.65} />
                </span>
                <div>
                  <h3>{stage.label}</h3>
                  <p>{stage.summary}</p>
                </div>
              </div>

              <div className="shape-profile-steps">
                {stage.steps.map((step) => (
                  <button
                    className="shape-profile-step"
                    type="button"
                    key={step.id}
                    onClick={() => navigate(step.path)}
                  >
                    <span className="shape-profile-step-number" aria-hidden="true">
                      {step.number}
                    </span>
                    <span className="shape-profile-step-copy">
                      <strong>{step.title}</strong>
                      <span>{step.detail}</span>
                    </span>
                    <IconArrowRight
                      className="shape-profile-step-arrow"
                      size={17}
                      stroke={1.8}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>

              <p className="shape-profile-stage-evidence">
                {evidenceByStage[stage.id]}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
