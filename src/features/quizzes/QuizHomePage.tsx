import { useNavigate } from "react-router-dom";
import { quizzes, type QuizDefinition } from "../../data/quizzes";
import { loadProfile } from "../../lib/profileStorage";
import { quizResultsPath, quizRoutePath } from "../../app/routes";
import { QuizCard } from "./QuizCard";
import { getQuizState } from "./quizRuntime";

export function QuizHomePage() {
  const profile = loadProfile();
  const navigate = useNavigate();
  const coreQuizzes = quizzes.filter((quiz) => quiz.contributesToOverall);
  const completedCount = coreQuizzes.filter(
    (quiz) => getQuizState(quiz, profile) === "complete",
  ).length;

  const openQuiz = (quiz: QuizDefinition) => {
    if (quiz.availability !== "available") return;

    const state = getQuizState(quiz, profile);
    if (state === "error") return;

    navigate(
      state === "complete"
        ? quizResultsPath(quiz.id)
        : quizRoutePath(quiz.id),
    );
  };

  return (
    <main className="app-shell">
      <section className="hub-stack quiz-home-stack">
        <header className="hub-hero quiz-home-hero">
          <div>
            <p className="eyebrow">Quiz · Guided exploration</p>
            <h1>Explore what resonates.</h1>
            <p className="hero-copy">
              Short quizzes surface dynamics, roles, and experiences. Do one,
              do them all, or come back whenever you want — your progress stays
              with your profile.
            </p>
            <p className="quiz-home-progress">
              {completedCount} of {coreQuizzes.length} complete
            </p>
          </div>
        </header>

        <div className="quiz-card-grid quiz-list">
          {coreQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              profile={profile}
              onOpen={openQuiz}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
