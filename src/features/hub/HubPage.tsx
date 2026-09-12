import { useNavigate } from "react-router-dom";
import { quizHomeRoute } from "../../app/routes";

export function HubPage() {
  const navigate = useNavigate();

  return (
    <main className="app-shell">
      <section className="hub-stack">
        <div className="hub-hero">
          <div>
            <p className="eyebrow">Build it your way</p>
            <h1>Not one giant fucking test.</h1>
            <p className="hero-copy hub-hero-copy-desktop">
              Use guided quizzes to spot patterns, This or That to compare what
              actually wins, and the catalog to get specific. Start anywhere,
              revisit anything, and refine as much or as little as you want.
            </p>
            <p className="hero-copy hub-hero-copy-mobile">
              Explore broadly, configure what works for you, then add context
              where it matters. Revisit anything whenever you want.
            </p>
          </div>
        </div>

        <div className="hub-section-heading">
          <div>
            <p className="eyebrow">01 · Guided exploration</p>
            <h2>Start broad.</h2>
          </div>
          <p>
            Short, focused quizzes surface broad patterns without turning Hub
            into the quiz catalog. Your quiz progress and results now live together
            in Quiz Home.
          </p>
        </div>

        <div className="catalog-hub-grid catalog-hub-grid-single">
          <article className="catalog-hub-card panel">
            <div>
              <span className="catalog-kicker">Quiz Home</span>
              <h3>Explore your guided quizzes</h3>
              <p>
                Start a new section, continue one in progress, or revisit completed
                results from one dedicated quiz workspace.
              </p>
            </div>
            <button
              className="primary"
              onClick={() => navigate(quizHomeRoute.path)}
            >
              Open quizzes
            </button>
          </article>
        </div>

        <div className="hub-section-heading catalog-hub-heading">
          <div>
            <p className="eyebrow">02 · Configure your kinks</p>
            <h2>Define what works for you.</h2>
          </div>
          <p>
            Compare interests to discover preference order, then fine-tune
            individual interests and limits directly. Use either path, or both.
          </p>
        </div>

        <div className="catalog-hub-preference-stack">
          <article className="catalog-hub-card catalog-hub-game panel">
            <div>
              <span className="catalog-kicker">Comparative discovery</span>
              <h3>Play This or That</h3>
              <p>
                Make quick pairwise choices to see what wins when two interests
                compete. Work within categories first, then compare the strongest
                choices overall.
              </p>
            </div>
            <button className="primary" onClick={() => navigate("/ranking")}>
              Play This or That
            </button>
          </article>

          <article className="catalog-hub-card catalog-hub-card-compact panel">
            <div className="catalog-hub-compact-copy">
              <span className="catalog-kicker">Detailed refinement</span>
              <h3>Browse & set preferences</h3>
              <p>
                Fine-tune individual interests, curiosity, uncertainty, and
                limits directly in the full catalog.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => navigate("/catalog")}
            >
              Browse catalog
            </button>
          </article>
        </div>

        <div className="hub-section-heading catalog-hub-heading">
          <div>
            <p className="eyebrow">03 · Contextual toolbox</p>
            <h2>What works as a reward or punishment?</h2>
          </div>
          <p>
            Classify contextual use separately from your general kink preference.
            The same activity can work as a reward, punishment, both, or neither.
          </p>
        </div>

        <div className="catalog-hub-grid catalog-hub-grid-single">
          <article className="catalog-hub-card panel">
            <div>
              <span className="catalog-kicker">Rewards & Punishments</span>
              <h3>Build the contextual profiles</h3>
              <p>
                Sort contextual use, rank confirmed options, roll from approved
                pools, and build reusable reward/punishment recipes without
                changing general kink preference.
              </p>
            </div>
            <button className="primary" onClick={() => navigate("/rewards")}>
              Open rewards & punishments
            </button>
          </article>
        </div>

        <div className="hub-section-heading catalog-hub-heading">
          <div>
            <p className="eyebrow">04 · Put it together</p>
            <h2>Build a scene without remembering everything.</h2>
          </div>
          <p>
            Pick the themes that fit the moment and shrink your profile into a
            small, relevant play space. Nothing inferred becomes automatic.
          </p>
        </div>

        <div className="catalog-hub-grid catalog-hub-grid-single">
          <article className="catalog-hub-card panel">
            <div>
              <span className="catalog-kicker">Scene Builder</span>
              <h3>What sounds good right now?</h3>
              <p>
                Combine themes like Pain + Surrender or Pet + Playful, tune the
                current vibe, and get a small menu backed by your actual profile.
              </p>
            </div>
            <button
              className="primary"
              onClick={() => navigate("/scene-builder")}
            >
              Build a scene
            </button>
          </article>
        </div>

        <div className="hub-section-heading catalog-hub-heading">
          <div>
            <p className="eyebrow">05 · Compare profiles</p>
            <h2>See where two profiles overlap and complement.</h2>
          </div>
          <p>
            Upload someone else's Full Profile Export for a temporary,
            non-destructive comparison. Their data is not imported into yours.
          </p>
        </div>

        <div className="catalog-hub-grid catalog-hub-grid-single">
          <article className="catalog-hub-card panel">
            <div>
              <span className="catalog-kicker">Shared profile</span>
              <h3>Compare with someone else</h3>
              <p>
                Keep both people independent while surfacing mutual interests,
                complementary patterns, curiosity, different contexts, and
                boundaries.
              </p>
            </div>
            <button className="primary" onClick={() => navigate("/compare")}>
              Compare profiles
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
