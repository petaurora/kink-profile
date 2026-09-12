import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import {
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
} from "../../app/routes";
import { SegmentedControl } from "../../components/SegmentedControl";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import { RewardPunishmentRanking } from "../../RewardPunishmentRanking";
import { loadRewardPunishmentProfile } from "../../lib/rewardPunishmentProfileStorage";
import { RewardPunishmentProfiles } from "./RewardPunishmentProfiles";
import "../catalog/CatalogWorkspaceRoute.css";
import "./RewardsCatalogRoute.css";

export type RewardsCatalogWorkspaceView = "browse" | "rank";

const workspaceOptions = [
  { value: "browse", label: "Browse" },
  { value: "rank", label: "Rank" },
] as const;

export function RewardsCatalogRoute({
  view = "browse",
}: {
  view?: RewardsCatalogWorkspaceView;
}) {
  const [snapshot] = useState(() => loadCurrentProfileSnapshot());
  const [rewardPunishmentProfile] = useState(() =>
    loadRewardPunishmentProfile(),
  );
  const navigate = useNavigate();

  const changeView = (nextView: RewardsCatalogWorkspaceView) => {
    navigate(
      nextView === "browse"
        ? catalogRewardsRoute.path
        : catalogRewardsRankingRoute.path,
    );
  };

  return (
    <RoutedFeatureFrame activeDestination="catalog">
      <section className="catalog-workspace-shell">
        <div className="catalog-workspace-navigation">
          <div>
            <p className="eyebrow">Catalog · Rewards & Punishments</p>
            <strong>Define contextual fit, then compare what works best.</strong>
          </div>
          <SegmentedControl
            value={view}
            options={workspaceOptions}
            onChange={changeView}
            ariaLabel="Rewards and punishments catalog view"
          />
        </div>

        {view === "browse" ? (
          <div className="catalog-rewards-browse">
            <RewardPunishmentProfiles
              catalogProfile={snapshot.catalogProfile}
              catalogResultView={snapshot.catalogResultView}
              canonicalSignals={snapshot.canonicalSignals}
              onClose={() => navigate("/")}
            />
          </div>
        ) : (
          <section className="catalog-rewards-ranking">
            <article className="rp-heading panel">
              <div>
                <p className="eyebrow">Rewards & Punishments · Rank</p>
                <h1>Compare what actually wins in context.</h1>
                <p>
                  Reward and punishment rankings remain independent contextual evidence.
                  Existing comparisons and ranking history stay exactly where they are.
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => navigate(catalogRewardsRoute.path)}
              >
                Back to Browse
              </button>
            </article>

            <RewardPunishmentRanking
              profile={rewardPunishmentProfile}
              onReclassify={() => navigate(catalogRewardsRoute.path)}
            />
          </section>
        )}
      </section>
    </RoutedFeatureFrame>
  );
}
