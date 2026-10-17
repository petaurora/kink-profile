import { appIcons } from "../../components/ui/appIcons";
import {
  IconAdjustmentsHeart,
  IconBolt,
  IconHeart,
  IconMasksTheater,
  IconTransfer,
} from "@tabler/icons-react";
import type { QuizDefinition } from "../../data/quizzes";
import type { StoredProfile } from "../../lib/profileStorage";
import { resolveQuizLifecycle } from "./quizRuntime";

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
  const lifecycle = resolveQuizLifecycle(quiz, profile);
  const state = lifecycle.state;
  const isUnavailable =
    state === "error" || quiz.availability !== "available";

  const progress =
    lifecycle.totalQuestions > 0
      ? Math.round((lifecycle.answeredCount / lifecycle.totalQuestions) * 100)
      : 0;

  const meta =
    state === "complete"
      ? "Complete"
      : state === "retake-in-progress"
        ? `${lifecycle.answeredCount} of ${lifecycle.totalQuestions} answered · previous result saved`
        : state === "in-progress"
          ? `${lifecycle.answeredCount} of ${lifecycle.totalQuestions} answered`
          : state === "error"
            ? "Question data unavailable"
            : quiz.availability === "available"
              ? `${quiz.questionIds.length} questions · ~${quiz.estimatedMinutes} min`
              : "Planned section";

  const action =
    state === "complete"
      ? "View results"
      : state === "retake-in-progress"
        ? "Continue retake"
        : state === "in-progress"
          ? "Continue"
          : state === "error"
            ? "Unavailable"
            : quiz.availability === "available"
              ? "Explore"
              : "Soon";

  return (
    <button
      type="button"
      className={`quiz-visual-card panel quiz-state-${state}`}
      onClick={() => onOpen(quiz)}
      disabled={isUnavailable}
      aria-label={`${quiz.title}: ${action}. ${meta}`}
    >
      <span className="quiz-visual-card-top">
        <span className="quiz-icon" aria-hidden="true">
          <QuizGlyph name={quiz.icon} size={27} />
        </span>
        {!isUnavailable && (
          <span className="quiz-visual-card-arrow" aria-hidden="true">
            <appIcons.details size={19} stroke={1.65} />
          </span>
        )}
      </span>

      <span className="quiz-visual-card-copy">
        <strong>{quiz.title}</strong>
        <span className="quiz-visual-card-description">{quiz.description}</span>
      </span>

      <span className="quiz-visual-card-footer">
        <span className="quiz-visual-card-status">{meta}</span>
        <span className="quiz-visual-card-action">{action}</span>
      </span>

      {(state === "in-progress" || state === "retake-in-progress") && (
        <span className="card-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      )}
    </button>
  );
}
