import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadProfile } from "../../lib/profileStorage";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { rankingRoute } from "../../app/routes";
import { KinkThisOrThat } from "../ranking/KinkThisOrThat";
import { KinkCatalogPreferences } from "./KinkCatalogPreferences";
import {
  catalogRoutePath,
  parseCatalogRouteFocus,
} from "./catalogRouteState";
import "./CatalogWorkspaceRoute.css";

type CatalogNavigationState = {
  from?: unknown;
};

export type KinkCatalogWorkspaceView = "browse" | "rank";

export const defaultKinkCatalogWorkspaceView: KinkCatalogWorkspaceView = "rank";

export const kinkCatalogWorkspaceOptions = [
  { value: "rank", label: "Rank" },
  { value: "browse", label: "Browse" },
] as const;

export function resolveCatalogReturnPath(state: unknown) {
  const from = (state as CatalogNavigationState | null)?.from;
  return from === "/profile" ? "/profile" : "/";
}

export function CatalogRoute({
  view = defaultKinkCatalogWorkspaceView,
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
    navigate(nextView === "browse" ? catalogRoutePath() : rankingRoute.path);
  };

  return (
    <RoutedFeatureFrame activeDestination="catalog">
      <section className="catalog-workspace-shell">
        <div className="catalog-workspace-navigation">
          <strong className="catalog-workspace-title">Kinks</strong>
          <nav className="catalog-workspace-tabs" aria-label="Kink catalog view">
            {kinkCatalogWorkspaceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  view === option.value
                    ? "catalog-workspace-tab is-active"
                    : "catalog-workspace-tab"
                }
                aria-current={view === option.value ? "page" : undefined}
                onClick={() => changeView(option.value)}
              >
                {option.label}
              </button>
            ))}
          </nav>
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
            onClose={() => navigate("/")}
          />
        )}
      </section>
    </RoutedFeatureFrame>
  );
}
