import { useMemo, useState } from "react";
import type { CatalogResultView } from "./lib/catalogResults";
import type { CanonicalSignalResult } from "./lib/overallProfileSignals";
import { loadRewardPunishmentProfile } from "./lib/rewardPunishmentProfileStorage";
import { loadRewardPunishmentRankingState } from "./lib/rewardPunishmentRankingStorage";
import {
  buildRewardPunishmentOverallProfileSummary,
  type RewardPunishmentProfileLane,
} from "./lib/rewardPunishmentProfileSummary";
import "./rewardPunishmentProfileSummary.css";

function renderLane(
  lane: RewardPunishmentProfileLane,
) {
  const contextLabel =
    lane.context === "reward" ? "Rewards" : "Punishments";

  return (
    <section
      className="profile-rp-lane"
      aria-labelledby={`profile-rp-${lane.context}-heading`}
    >
      <div className="profile-rp-lane-heading">
        <div>
          <p className="eyebrow">{contextLabel}</p>
          <h3 id={`profile-rp-${lane.context}-heading`}>
            {lane.positiveCount > 0
              ? lane.heading
              : `No confirmed ${contextLabel.toLocaleLowerCase()} yet`}
          </h3>
        </div>
        <span>
          {lane.directCount} classified
          {lane.positiveCount > 0
            ? ` · ${lane.positiveCount} positive`
            : ""}
        </span>
      </div>

      {lane.categories.length > 0 && (
        <div
          className="profile-rp-categories"
          aria-label={`Strongest ${contextLabel.toLocaleLowerCase()} categories`}
        >
          {lane.categories.map((category) => (
            <span
              className="profile-rp-category"
              key={category.categoryId}
              title={`${category.coverage}% evidence coverage · ${category.evidenceCount} direct item${category.evidenceCount === 1 ? "" : "s"}`}
            >
              <strong>{category.label}</strong>
              <small>{category.affinity}%</small>
            </span>
          ))}
        </div>
      )}

      {lane.confirmedItems.length > 0 ? (
        <div className="profile-rp-confirmed">
          {lane.confirmedItems.map((item, index) => (
            <div
              className="profile-rp-confirmed-row"
              key={item.primitiveKey}
            >
              <span className="profile-rp-rank">
                {item.rank
                  ? String(item.rank).padStart(2, "0")
                  : String(index + 1).padStart(2, "0")}
              </span>
              <div className="profile-rp-confirmed-main">
                <strong>{item.label}</strong>
                <span>
                  {item.suitabilityLabel}
                  {item.categoryLabels.length > 0
                    ? ` · ${item.categoryLabels.join(" · ")}`
                    : ""}
                </span>
              </div>
              <span className="profile-rp-source">
                {item.rank
                  ? `Rank #${item.rank}`
                  : item.sourceType === "catalog"
                    ? "Catalog"
                    : "Action"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="profile-rp-empty">
          Classify a few items in the contextual toolbox and confirmed
          {lane.context === "reward" ? " rewards" : " punishments"} will
          appear here.
        </p>
      )}

      {lane.positiveCount >= 2 && !lane.rankingReady && (
        <p className="profile-rp-ranking-note">
          Contextual ranking is still lightly explored. These are confirmed
          items, not a claimed top order yet.
        </p>
      )}

      {lane.suggestions.length > 0 && (
        <div className="profile-rp-suggestions">
          <div className="profile-rp-suggestions-heading">
            <span>Suggested to explore</span>
            <small>Inferred · not confirmed</small>
          </div>
          <div className="profile-rp-suggestion-list">
            {lane.suggestions.map((suggestion) => (
              <div
                className="profile-rp-suggestion"
                key={suggestion.primitiveKey}
                title={suggestion.reason}
              >
                <strong>{suggestion.label}</strong>
                <span>
                  {suggestion.band === "likely" ? "Likely" : "Possible"}
                  {" · "}
                  {suggestion.fit}% fit
                  {" · "}
                  {suggestion.confidence}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function RewardPunishmentProfileSummary({
  canonicalSignals,
  catalogResultView,
  onOpenToolbox,
}: {
  canonicalSignals: readonly CanonicalSignalResult[];
  catalogResultView: CatalogResultView;
  onOpenToolbox: () => void;
}) {
  const [profile] = useState(() => loadRewardPunishmentProfile());
  const [rankingState] = useState(() =>
    loadRewardPunishmentRankingState(),
  );

  const summary = useMemo(
    () =>
      buildRewardPunishmentOverallProfileSummary(
        profile,
        rankingState.comparisons,
        canonicalSignals,
        catalogResultView,
      ),
    [
      canonicalSignals,
      catalogResultView,
      profile,
      rankingState.comparisons,
    ],
  );

  const hasAnyData =
    summary.reward.directCount > 0 ||
    summary.punishment.directCount > 0 ||
    summary.reward.suggestions.length > 0 ||
    summary.punishment.suggestions.length > 0;

  return (
    <article className="profile-rp panel">
      <div className="profile-rp-heading">
        <div>
          <p className="eyebrow">Contextual toolbox</p>
          <h2>Rewards &amp; Punishments</h2>
        </div>
        <div className="profile-rp-heading-copy">
          <p>
            What works in these contexts is tracked separately from your
            general kink preferences and does not change the overall radar.
          </p>
          <button
            type="button"
            className="secondary compact"
            onClick={onOpenToolbox}
          >
            Open toolbox
          </button>
        </div>
      </div>

      {hasAnyData ? (
        <div className="profile-rp-lanes">
          {renderLane(summary.reward)}
          {renderLane(summary.punishment)}
        </div>
      ) : (
        <div className="profile-rp-whole-empty">
          <strong>No contextual profile yet.</strong>
          <span>
            Sort a few items as Reward, Punishment, Both, or Neither and this
            section will build itself from direct evidence.
          </span>
          <button
            type="button"
            className="primary compact"
            onClick={onOpenToolbox}
          >
            Start contextual profile
          </button>
        </div>
      )}
    </article>
  );
}
