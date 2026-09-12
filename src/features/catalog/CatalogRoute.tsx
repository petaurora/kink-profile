import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadProfile } from "../../lib/profileStorage";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { SegmentedControl } from "../../components/SegmentedControl";
import { catalogRoute, rankingRoute } from "../../app/routes";
import { KinkThisOrThat } from "../ranking/KinkThisOrThat";
import { KinkCatalogPreferences } from "./KinkCatalogPreferences";
import { parseCatalogRouteFocus } from "./catalogRouteState";
import "./CatalogWorkspaceRoute.css";

type CatalogNavigationState = {
  from?: unknown;
};

export type KinkCatalogWorkspaceView = "browse" | "rank";

const workspaceOptions = [
  { value: "browse", label: "Browse" },
  { value: "rank", label: "Rank" },
] as const;

export function resolveCatalogReturnPath(state: unknown) {
  const from = (state as CatalogNavigationState | null)?.from;
  return from === "/profile" ? "/profile" : "/";
}

export function CatalogRoute({
  view = "browse",
}: {
  view?: KinkCatalogWorkspaceView;
}) {
  const [quizProfile] = useState(() => loadProfile());
  const location = useLocation();
  const navigate = useNavigate();
  const initialFocus = useMemo(
    () => parseCatalogRouteFocus(location.search),
    [location.search],
  );
  const returnPath = resolveCatalogReturnPath(location.state);

  const changeView = (nextView: KinkCatalogWorkspaceView) => {
    navigate(nextView === "browse" ? catalogRoute.path : rankingRoute.path);
  };

  return (
    <RoutedFeatureFrame activeDestination="catalog">
      <section className="catalog-workspace-shell">
        <div className="catalog-workspace-navigation">
          <div>
            <p className="eyebrow">Catalog · Kinks</p>
            <strong>Define it directly or compare what wins.</strong>
          </div>
          <SegmentedControl
            value={view}
            options={workspaceOptions}
            onChange={changeView}
            ariaLabel="Kink catalog view"
          />
        </div>

        {view === "browse" ? (
          <KinkCatalogPreferences
            key={location.search}
            quizProfile={quizProfile}
            initialFocus={initialFocus}
            closeLabel={returnPath === "/profile" ? "Back to profile" : "Back to hub"}
            onClose={() => navigate(returnPath)}
            onPlayRanking={() => navigate(rankingRoute.path)}
          />
        ) : (
          <KinkThisOrThat
            quizProfile={quizProfile}
            onClose={() => navigate(catalogRoute.path)}
          />
        )}
      </section>
    </RoutedFeatureFrame>
  );
}
