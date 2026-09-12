import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { catalogRewardsRoute } from "../../app/routes";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import { RewardPunishmentProfiles } from "./RewardPunishmentProfiles";

type RewardsNavigationState = {
  from?: unknown;
};

export function resolveRewardsReturnPath(state: unknown) {
  const from = (state as RewardsNavigationState | null)?.from;
  return from === "/profile" ? "/profile" : "/";
}

export function RewardsRoute() {
  const [snapshot] = useState(() => loadCurrentProfileSnapshot());
  const location = useLocation();
  const navigate = useNavigate();
  const returnPath = resolveRewardsReturnPath(location.state);
  const workspace = new URLSearchParams(location.search).get("workspace");

  if (workspace !== "tools") {
    return <Navigate to={catalogRewardsRoute.path} replace />;
  }

  return (
    <RoutedFeatureFrame activeDestination="rewards-punishments">
      <RewardPunishmentProfiles
        catalogProfile={snapshot.catalogProfile}
        catalogResultView={snapshot.catalogResultView}
        canonicalSignals={snapshot.canonicalSignals}
        onClose={() => navigate(returnPath)}
      />
    </RoutedFeatureFrame>
  );
}
