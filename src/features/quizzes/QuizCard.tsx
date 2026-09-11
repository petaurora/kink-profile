import {
  IconAdjustmentsHeart,
  IconBolt,
  IconHeart,
  IconMasksTheater,
  IconTransfer,
} from "@tabler/icons-react";
import type { QuizDefinition } from "../../data/quizzes";
import type { StoredProfile } from "../../lib/profileStorage";
import { getAnsweredCount, getQuizState, stateLabel } from "./quizRuntime";

export function QuizGlyph({
  name,
  size = 26,
}: {
  name: string;
  size?: number;
}) {
  const props = { size, stroke: 1.8, "aria-hidden": true as const };

  switch (name) {
    case "adjustments-heart":
      return <IconAdjustmentsHeart {...props} />;
    case "transfer":
      return <IconTransfer {...props} />;
    case "bolt":
      return <IconBolt {...props} />;
    case "masks-theater":
      return <IconMasksTheater {...props} />;
    default:
      return <IconHeart {...props} />;
  }
}

export function QuizCard({
  quiz,
  profile,
  onOpen,
}: {
  quiz: QuizDefinition;
  profile: StoredProfile;
  onOpen: (quiz: QuizDefinition) => void;
}) {
  const state = getQuizState(quiz, profile);
  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(quiz, answers);
  const progress =
    quiz.questionIds.length > 0
      ? Math.round((answeredCount / quiz.questionIds.length) * 100)
      : 0;

  if (state === "complete") {
    return (
      <article className="quiz-card quiz-card-complete panel quiz-state-complete">
        <span className="quiz-icon" aria-hidden="true">
          <QuizGlyph name={quiz.icon} />
        </span>

        <div className="quiz-card-complete-copy">
          {quiz.eyebrow !== "Core section" && (
            <p className="eyebrow">{quiz.eyebrow}</p>
          )}
          <h2>{quiz.title}</h2>
        </div>

        <span className="status-chip status-complete">Complete</span>

        <button className="secondary compact" onClick={() => onOpen(quiz)}>
          View results
        </button>
      </article>
    );
  }

  return (
    <article className={`quiz-card panel quiz-state-${state}`}>
      <div className="quiz-card-top">
        <span className="quiz-icon" aria-hidden="true">
          <QuizGlyph name={quiz.icon} />
        </span>
        <span className={`status-chip status-${state}`}>
          {stateLabel(state)}
        </span>
      </div>

      <div className="quiz-card-copy">
        {quiz.eyebrow !== "Core section" && (
          <p className="eyebrow">{quiz.eyebrow}</p>
        )}
        <h2>{quiz.title}</h2>
        <p>{quiz.description}</p>
      </div>

      <div className="quiz-card-footer">
        <div>
          <strong>
            {quiz.questionIds.length > 0
              ? `${quiz.questionIds.length} questions`
              : "Question bank next"}
          </strong>
          <span>
            {quiz.availability === "available"
              ? `~${quiz.estimatedMinutes} min`
              : "Planned section"}
          </span>
        </div>

        {quiz.availability === "available" ? (
          <button className="primary compact" onClick={() => onOpen(quiz)}>
            {state === "in-progress" ? "Continue" : "Explore"}
          </button>
        ) : (
          <button className="secondary compact" disabled>
            Soon
          </button>
        )}
      </div>

      {state === "in-progress" && (
        <div className="card-progress" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  );
}
