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

  const openQuiz = (quiz: QuizDefinition) => {
    if (quiz.availability !== "available") return;

    navigate(
      getQuizState(quiz, profile) === "complete"
        ? quizResultsPath(quiz.id)
        : quizRoutePath(quiz.id),
    );
  };

  return (
    <main className="app-shell">
      <section className="hub-stack">
        <div className="hub-hero">
          <div>
            <p className="eyebrow">Quiz · Guided exploration</p>
            <h1>Start broad. Follow what resonates.</h1>
            <p className="hero-copy">
              Short, focused quizzes help surface the dynamics, roles, and
              experiences that resonate with you. Do one, do them all, or come
              back whenever you want — your progress stays with your profile.
            </p>
          </div>
        </div>

        <div className="hub-section-heading">
          <div>
            <p className="eyebrow">Your quizzes</p>
            <h2>Explore at your own pace.</h2>
          </div>
          <p>
            Completed quizzes open their results. In-progress quizzes pick up
            where you left off, and untouched sections are ready whenever you are.
          </p>
        </div>

        <div className="quiz-card-grid">
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
