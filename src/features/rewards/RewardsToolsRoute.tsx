import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import {
  catalogRewardsRoute,
  rewardsToolsRandomizerRoute,
  rewardsToolsRecipesRoute,
} from "../../app/routes";
import { SegmentedControl } from "../../components/SegmentedControl";
import { RewardPunishmentRandomizer } from "../../RewardPunishmentRandomizer";
import { RewardPunishmentRecipes } from "../../RewardPunishmentRecipes";
import { loadRewardPunishmentProfile } from "../../lib/rewardPunishmentProfileStorage";
import "./RewardsToolsRoute.css";

export type RewardsToolsWorkspaceView = "randomizer" | "recipes";

const workspaceOptions = [
  { value: "randomizer", label: "Randomizer" },
  { value: "recipes", label: "Recipes" },
] as const;

export function RewardsToolsRoute({
  view = "randomizer",
}: {
  view?: RewardsToolsWorkspaceView;
}) {
  const [snapshot] = useState(() => loadCurrentProfileSnapshot());
  const [rewardPunishmentProfile] = useState(() =>
    loadRewardPunishmentProfile(),
  );
  const navigate = useNavigate();

  const changeView = (nextView: RewardsToolsWorkspaceView) => {
    navigate(
      nextView === "randomizer"
        ? rewardsToolsRandomizerRoute.path
        : rewardsToolsRecipesRoute.path,
    );
  };

  return (
    <RoutedFeatureFrame>
      <section className="tools-workspace-shell">
        <div className="tools-workspace-navigation">
          <div>
            <p className="eyebrow">Tools · Rewards & Punishments</p>
            <strong>Pick from approved pools or build reusable combinations.</strong>
          </div>
          <SegmentedControl
            value={view}
            options={workspaceOptions}
            onChange={changeView}
            ariaLabel="Rewards and punishments tools view"
          />
        </div>

        {view === "randomizer" ? (
          <RewardPunishmentRandomizer
            profile={rewardPunishmentProfile}
            onSetupPool={() => navigate(catalogRewardsRoute.path)}
          />
        ) : (
          <RewardPunishmentRecipes
            profile={rewardPunishmentProfile}
            canonicalSignals={snapshot.canonicalSignals}
            catalogResultView={snapshot.catalogResultView}
          />
        )}
      </section>
    </RoutedFeatureFrame>
  );
}
