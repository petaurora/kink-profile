import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCoxcombChart } from "../../ProfileCoxcombChart";
import { RankingMovementIndicator } from "../../RankingMovementIndicator";
import { RewardPunishmentProfileSummary } from "../../RewardPunishmentProfileSummary";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { quizResultsPath, quizRoutePath } from "../../app/routes";
import { kinkCategories } from "../../data/kinkCatalog.generated";
import type { OverallFacetId } from "../../data/overallFacets";
import { getQuiz, quizzes } from "../../data/quizzes";
import { loadCatalogProfile } from "../../lib/catalogProfileStorage";
import {
  buildCatalogResultView,
  catalogPreferenceLabels,
} from "../../lib/catalogResults";
import {
  allCatalogDrilldown,
  categoryDrilldown,
  preferenceDrilldown,
  type CatalogDrilldownFocus,
} from "../../lib/catalogDrilldown";
import { buildCanonicalSignalProfile } from "../../lib/overallProfileSignals";
import { scoreOverallFacets } from "../../lib/overallProfileFacets";
import { buildOverallRadarModel } from "../../lib/overallRadar";
import {
  buildProfileExplainability,
  type ProfileExplainabilityAction,
} from "../../lib/profileExplainability";
import { buildProfileHardLimits } from "../../lib/profileHardLimits";
import { buildProfileHeaderModel } from "../../lib/profileHeader";
import { buildProfileInterestAreas } from "../../lib/profileInterestAreas";
import { buildProfileRoleDetails } from "../../lib/profileRoleDetails";
import { buildProfileTopInterests } from "../../lib/profileTopInterests";
import {
  calculateRankingMovement,
  getPreviousComparableRankingSnapshot,
} from "../../lib/kinkRankingMovement";
import { loadProfile } from "../../lib/profileStorage";
import { catalogRoutePath } from "../catalog/catalogRouteState";
import { QuizGlyph } from "../quizzes/QuizCard";
import { getQuizState, stateLabel } from "../quizzes/quizRuntime";

export function ProfileRoute() {
  const navigate = useNavigate();
  const [profile] = useState(() => loadProfile());
  const [catalogProfile] = useState(() => loadCatalogProfile());
  const [showAllHeadspaces, setShowAllHeadspaces] = useState(false);
  const [showAllHardLimits, setShowAllHardLimits] = useState(false);
  const [openProfileMovementId, setOpenProfileMovementId] =
    useState<string | null>(null);

  const coreQuizzes = quizzes.filter((quiz) => quiz.contributesToOverall);
  const canonicalSignals = useMemo(
    () => buildCanonicalSignalProfile(profile, catalogProfile),
    [catalogProfile, profile],
  );
  const overallFacets = useMemo(
    () => scoreOverallFacets(canonicalSignals),
    [canonicalSignals],
  );
  const profileHeader = useMemo(
    () => buildProfileHeaderModel(canonicalSignals, overallFacets),
    [canonicalSignals, overallFacets],
  );
  const profileRoleDetails = useMemo(
    () => buildProfileRoleDetails(canonicalSignals),
    [canonicalSignals],
  );
  const overallRadar = useMemo(
    () =>
      buildOverallRadarModel(
        overallFacets,
        profileHeader.strongestFacetIds,
      ),
    [overallFacets, profileHeader.strongestFacetIds],
  );
  const profileExplainability = useMemo(
    () => buildProfileExplainability(canonicalSignals, overallFacets, profile),
    [canonicalSignals, overallFacets, profile],
  );
  const catalogResultView = useMemo(
    () => buildCatalogResultView(profile, catalogProfile),
    [catalogProfile, profile],
  );
  const topOverallInterests = useMemo(
    () => buildProfileTopInterests(catalogResultView),
    [catalogResultView],
  );
  const previousOverallRankingSnapshot = useMemo(
    () =>
      getPreviousComparableRankingSnapshot(catalogProfile, { type: "overall" }),
    [catalogProfile],
  );
  const profileHardLimits = useMemo(
    () => buildProfileHardLimits(catalogResultView),
    [catalogResultView],
  );
  const profileInterestAreas = useMemo(
    () => buildProfileInterestAreas(catalogResultView, kinkCategories),
    [catalogResultView],
  );

  const visibleHeadspaces = showAllHeadspaces
    ? profileRoleDetails.headspaces
    : profileRoleDetails.featuredHeadspaces;
  const visibleHardLimits = showAllHardLimits
    ? profileHardLimits.all
    : profileHardLimits.featured;

  const openCatalog = (focus: CatalogDrilldownFocus) => {
    navigate(catalogRoutePath(focus), { state: { from: "/profile" } });
  };

  const openQuiz = (quizId: Parameters<typeof getQuiz>[0]) => {
    const quiz = getQuiz(quizId);
    if (!quiz || quiz.availability !== "available") return;

    navigate(
      getQuizState(quiz, profile) === "complete"
        ? quizResultsPath(quiz.id)
        : quizRoutePath(quiz.id),
    );
  };

  const openExplainabilityAction = (action: ProfileExplainabilityAction) => {
    if (action.type === "quiz") {
      openQuiz(action.quizId);
      return;
    }

    openCatalog(allCatalogDrilldown());
  };

  const openFacetDetail = (facetId: OverallFacetId) => {
    const element = document.getElementById(`facet-detail-${facetId}`);
    if (element instanceof HTMLDetailsElement) {
      element.open = true;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        element
          .querySelector<HTMLElement>("summary")
          ?.focus({ preventScroll: true });
      }, 250);
    }
  };

  return (
    <RoutedFeatureFrame activeDestination="profile">
      <section className="profile-stack">
        <article className="profile-identity-header panel">
          <div className="profile-identity-top">
            <div>
              <p className="eyebrow">Your kink profile</p>
              <h1>{profileHeader.summary}</h1>
            </div>
          </div>

          <div
            className="profile-trait-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            <section className="profile-trait-group">
              <span className="profile-trait-label">Orientation</span>
              <strong className="profile-orientation">
                {profileHeader.orientation.label}
              </strong>
            </section>

            <section className="profile-trait-group">
              <span className="profile-trait-label">Headspaces</span>
              {profileHeader.headspaces.length > 0 ? (
                <div className="profile-trait-chips">
                  {profileHeader.headspaces.map((trait) => (
                    <span className="profile-trait-chip" key={trait.id}>
                      <strong>{trait.label}</strong>
                    </span>
                  ))}
                </div>
              ) : (
                <strong className="profile-trait-emerging">Still emerging</strong>
              )}
            </section>
          </div>
        </article>

        <article className="overall-radar-panel panel">
          <div className="overall-radar-heading">
            <div>
              <p className="eyebrow">Overall profile</p>
              <h2>The shape of your profile.</h2>
            </div>
            <p>
              Each petal is one overall facet. Larger petals mean stronger affinity;
              unexplored facets stay outlined instead of being treated as zero.
            </p>
          </div>

          <ProfileCoxcombChart
            axes={overallRadar.axes}
            onSelectFacet={openFacetDetail}
          />

          <div className="overall-radar-footer">
            <div>
              <span className="profile-trait-label">Strongest themes</span>
              {overallRadar.strongestThemes.length > 0 ? (
                <div className="overall-radar-theme-list">
                  {overallRadar.strongestThemes.map((theme) => (
                    <button
                      key={theme.facetId}
                      type="button"
                      className="overall-radar-theme"
                      onClick={() => openFacetDetail(theme.facetId)}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              ) : (
                <strong className="profile-trait-emerging">Still emerging</strong>
              )}
            </div>

            {!overallRadar.hasCompleteShape && (
              <p className="overall-radar-partial-note">
                Some facets are still emerging. Outlined petals remain genuinely
                unknown; dashed petals mark results with limited evidence.
              </p>
            )}
          </div>
        </article>

        <section className="profile-role-detail-grid">
          <article
            className="profile-role-panel panel"
            style={{ gridColumn: "1 / -1" }}
          >
            <div className="profile-role-heading">
              <div>
                <p className="eyebrow">Recognizable roles</p>
                <h2>Headspaces</h2>
              </div>
              <p>
                These scores can overlap. They describe recognizable role and
                headspace patterns, not one assigned identity or authority position.
              </p>
            </div>

            {visibleHeadspaces.length > 0 ? (
              <div className="profile-role-list">
                {visibleHeadspaces.map((item, index) => (
                  <div className="profile-role-row" key={item.id}>
                    <span className="profile-role-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="profile-role-main">
                      <div className="profile-role-title">
                        <strong>{item.label}</strong>
                        <span>{item.affinity}%</span>
                      </div>
                      <div className="profile-role-track" aria-hidden="true">
                        <span style={{ width: `${item.affinity}%` }} />
                      </div>
                      {item.state === "limited" && (
                        <small>Limited evidence so far</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="profile-role-empty">
                These headspace patterns are still emerging.
              </p>
            )}

            {profileRoleDetails.headspaces.length >
              profileRoleDetails.featuredHeadspaces.length && (
              <button
                className="text-button profile-role-toggle"
                onClick={() => setShowAllHeadspaces((shown) => !shown)}
              >
                {showAllHeadspaces ? "Show less" : "Show all headspaces"}
              </button>
            )}
          </article>
        </section>

        <article className="profile-top-interests panel">
          <div className="profile-top-interests-heading">
            <div>
              <p className="eyebrow">Concrete preferences</p>
              <h2>Top Overall</h2>
            </div>
            <p>
              Built only from things you directly marked or ranked. Quiz-derived
              suggestions cannot put something on this list by themselves.
            </p>
          </div>

          {topOverallInterests.length > 0 ? (
            <div className="profile-top-interest-list">
              {topOverallInterests.map((item, index) => (
                <div className="profile-top-interest-row" key={item.catalogId}>
                  <span className="profile-top-interest-rank">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="profile-top-interest-main">
                    <strong>{item.label}</strong>
                    <div className="profile-top-interest-sources">
                      {item.explicitState && (
                        <span className="profile-source-chip">
                          {catalogPreferenceLabels[item.explicitState]}
                        </span>
                      )}
                      {item.overallRank && (
                        <span className="profile-source-chip profile-source-chip-ranking">
                          <span>This or That · #{item.overallRank.rank}</span>
                          {(() => {
                            const movement = calculateRankingMovement(
                              {
                                id: item.catalogId,
                                rank: item.overallRank.rank,
                                comparisons: item.overallRank.comparisons,
                              },
                              previousOverallRankingSnapshot,
                            );
                            if (!movement) return null;

                            return (
                              <RankingMovementIndicator
                                movement={movement}
                                open={openProfileMovementId === item.catalogId}
                                onToggle={() =>
                                  setOpenProfileMovementId((current) =>
                                    current === item.catalogId
                                      ? null
                                      : item.catalogId,
                                  )
                                }
                              />
                            );
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-top-interests-empty">
              No direct Top Overall results yet. Set a few catalog preferences or
              compare finalists in This or That to start building this list.
            </p>
          )}

          <div className="profile-top-interests-footer">
            <span>
              {topOverallInterests.length === 10
                ? "Showing your current top 10 direct-evidence interests."
                : `Showing ${topOverallInterests.length} direct-evidence ${
                    topOverallInterests.length === 1 ? "interest" : "interests"
                  } — no filler added.`}
            </span>
            <button
              type="button"
              className="secondary compact"
              onClick={() => openCatalog(allCatalogDrilldown())}
            >
              Refine preferences
            </button>
          </div>
        </article>

        <RewardPunishmentProfileSummary
          canonicalSignals={canonicalSignals}
          catalogResultView={catalogResultView}
          onOpenToolbox={() => navigate("/rewards", { state: { from: "/profile" } })}
        />

        <article className="profile-limits panel">
          <div className="profile-limits-heading">
            <div>
              <p className="eyebrow">Boundaries</p>
              <h2>Hard Limits</h2>
            </div>
            <p>
              Only things you explicitly marked Hard Limit appear here. Low rank,
              uncertainty, and disinterest are not treated as limits.
            </p>
          </div>

          {visibleHardLimits.length > 0 ? (
            <div className="profile-limit-list">
              {visibleHardLimits.map((item) => (
                <div className="profile-limit-item" key={item.catalogId}>
                  <strong>{item.label}</strong>
                  <span>Hard Limit</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-limits-empty">No hard limits marked.</p>
          )}

          {profileHardLimits.hiddenCount > 0 && (
            <button
              className="text-button profile-limits-toggle"
              onClick={() => setShowAllHardLimits((shown) => !shown)}
            >
              {showAllHardLimits
                ? "Show less"
                : `Show all limits (+${profileHardLimits.hiddenCount})`}
            </button>
          )}
        </article>

        <article className="profile-interest-areas panel">
          <div className="profile-interest-areas-heading">
            <div>
              <p className="eyebrow">Category themes</p>
              <h2>Interest Areas</h2>
            </div>
            <p>
              A compact view of the catalog areas with the strongest direct
              evidence. Only a few representative interests are shown here.
            </p>
          </div>

          {profileInterestAreas.length > 0 ? (
            <div className="profile-interest-area-grid">
              {profileInterestAreas.map((area) => (
                <button
                  type="button"
                  className="profile-interest-area"
                  key={area.categoryId}
                  onClick={() => openCatalog(categoryDrilldown(area.categoryId))}
                >
                  <span>
                    <strong>{area.label}</strong>
                    <small>Explore category →</small>
                  </span>
                  <p>
                    {area.representativeItems
                      .map((item) => item.label)
                      .join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="profile-interest-areas-empty">
              Interest areas will appear as you directly mark or rank catalog items.
            </p>
          )}

          <div className="profile-interest-area-actions">
            <button
              type="button"
              className="secondary compact"
              onClick={() => openCatalog(allCatalogDrilldown())}
            >
              Explore all categories
            </button>

            <div className="profile-interest-shortcuts">
              <span>Quick filters</span>
              <button
                className="text-button"
                onClick={() => openCatalog(preferenceDrilldown("curious"))}
              >
                Curious
              </button>
              <button
                className="text-button"
                onClick={() => openCatalog(preferenceDrilldown("unsure"))}
              >
                Unsure
              </button>
              <button
                className="text-button"
                onClick={() => openCatalog(preferenceDrilldown("hard_limit"))}
              >
                Hard Limits
              </button>
            </div>
          </div>
        </article>

        <article className="profile-explainability panel">
          <div className="profile-explainability-heading">
            <div>
              <p className="eyebrow">Behind the profile</p>
              <h2>Why these themes show up.</h2>
              <p>
                Affinity describes how strongly a theme currently resonates.
                Evidence describes how much relevant information is behind that
                result. A strong score can still be lightly explored.
              </p>
            </div>
          </div>

          <div className="profile-explainability-list">
            {profileExplainability.facets.map((facet) => (
              <details
                className={`profile-explanation profile-explanation-${facet.evidenceState}`}
                id={`facet-detail-${facet.facetId}`}
                key={facet.facetId}
              >
                <summary>
                  <div className="profile-explanation-name">
                    <strong>{facet.label}</strong>
                    <span>{facet.description}</span>
                  </div>
                  <div className="profile-explanation-summary">
                    <span>
                      <strong>
                        {facet.affinity === null ? "—" : `${facet.affinity}%`}
                      </strong>
                      affinity
                    </span>
                    <span className="profile-evidence-state">
                      {facet.evidenceLabel}
                    </span>
                  </div>
                </summary>

                <div className="profile-explanation-detail">
                  <p className="profile-evidence-message">
                    {facet.evidenceMessage}
                    {facet.coverage > 0 && (
                      <span> Evidence coverage: {facet.coverage}%.</span>
                    )}
                  </p>

                  {facet.hasSourceConflict && facet.conflictMessage && (
                    <p className="profile-evidence-conflict">
                      {facet.conflictMessage}
                    </p>
                  )}

                  {facet.contributingSignals.length > 0 && (
                    <section className="profile-explanation-section">
                      <span className="profile-trait-label">What contributes</span>
                      <div className="profile-explanation-signals">
                        {facet.contributingSignals.map((signal) => (
                          <div
                            className="profile-explanation-signal"
                            key={signal.signalId}
                          >
                            <strong>{signal.label}</strong>
                            <span>
                              {signal.affinity}% affinity · {signal.coverage}% evidence
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {facet.sources.length > 0 && (
                    <section className="profile-explanation-section">
                      <span className="profile-trait-label">Evidence sources</span>
                      <div className="profile-explanation-sources">
                        {facet.sources.map((source) => (
                          <div
                            className="profile-explanation-source"
                            key={source.id}
                          >
                            <div>
                              <strong>{source.label}</strong>
                              <span>{source.detail}</span>
                            </div>
                            <span>
                              {source.affinity}% signal · {source.evidence}% evidence
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {facet.nextStep && (
                    <button
                      className="secondary compact profile-explanation-action"
                      onClick={() => openExplainabilityAction(facet.nextStep!)}
                    >
                      {facet.nextStep.label}
                    </button>
                  )}
                </div>
              </details>
            ))}
          </div>

          <details className="profile-exploration-status">
            <summary>
              <div>
                <strong>Exploration status</strong>
                <span>
                  Guided sections are shown here only as context for evidence, not
                  as part of your identity.
                </span>
              </div>
              <strong>
                {profileExplainability.exploredQuizCount} of{" "}
                {profileExplainability.totalQuizCount}
              </strong>
            </summary>

            <div className="profile-exploration-list">
              {coreQuizzes.map((quiz) => {
                const state = getQuizState(quiz, profile);
                return (
                  <div className="profile-exploration-row" key={quiz.id}>
                    <span className="quiz-icon small">
                      <QuizGlyph name={quiz.icon} size={19} />
                    </span>
                    <div>
                      <strong>{quiz.title}</strong>
                      <span>{stateLabel(state)}</span>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => openQuiz(quiz.id)}
                    >
                      {state === "complete"
                        ? "View results"
                        : state === "in-progress"
                          ? "Continue"
                          : "Explore"}
                    </button>
                  </div>
                );
              })}
            </div>
          </details>
        </article>
      </section>
    </RoutedFeatureFrame>
  );
}
