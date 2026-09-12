import { Navigate, useLocation } from "react-router-dom";
import {
  catalogRewardsRoute,
  rewardsToolsRandomizerRoute,
} from "../../app/routes";

export function legacyRewardsDestination(search: string) {
  const workspace = new URLSearchParams(search).get("workspace");
  return workspace === "tools"
    ? rewardsToolsRandomizerRoute.path
    : catalogRewardsRoute.path;
}

export function RewardsRoute() {
  const location = useLocation();

  return (
    <Navigate
      to={legacyRewardsDestination(location.search)}
      replace
      state={location.state}
    />
  );
}
