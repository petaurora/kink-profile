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
      className={`quiz-list-row panel quiz-state-${state}`}
      onClick={() => onOpen(quiz)}
      disabled={isUnavailable}
      aria-label={`${quiz.title}: ${action}`}
    >
      <span className="quiz-icon" aria-hidden="true">
        <QuizGlyph name={quiz.icon} />
      </span>

      <span className="quiz-list-copy">
        {quiz.eyebrow !== "Core section" && (
          <span className="eyebrow">{quiz.eyebrow}</span>
        )}
        <strong>{quiz.title}</strong>
        <span className="quiz-list-meta">{meta}</span>
      </span>

      <span className="quiz-list-action" aria-hidden="true">
        <span>{action}</span>
        {!isUnavailable && <span className="quiz-list-chevron">›</span>}
      </span>

      {(state === "in-progress" || state === "retake-in-progress") && (
        <span className="card-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      )}
    </button>
  );
}
