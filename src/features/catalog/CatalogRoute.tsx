import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadProfile } from "../../lib/profileStorage";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { rankingRoute } from "../../app/routes";
import {
  KinkThisOrThat,
  type RankingMode,
} from "../ranking/KinkThisOrThat";
import { KinkCatalogPreferences } from "./KinkCatalogPreferences";
import {
  catalogRoutePath,
  parseCatalogRouteFocus,
} from "./catalogRouteState";
import "./CatalogWorkspaceRoute.css";

type CatalogNavigationState = {
  from?: unknown;
  rankingMode?: unknown;
};

export type KinkCatalogWorkspaceView = "browse" | "rank";

type CatalogWorkspaceTab = "compare" | "overall" | "explore";

export const defaultKinkCatalogWorkspaceView: KinkCatalogWorkspaceView = "rank";

export const kinkCatalogWorkspaceOptions = [
  { value: "rank", label: "Rank" },
  { value: "browse", label: "Browse" },
] as const;

const catalogWorkspaceTabs: ReadonlyArray<{
  value: CatalogWorkspaceTab;
  label: string;
}> = [
  { value: "compare", label: "Compare" },
  { value: "overall", label: "Overall" },
  { value: "explore", label: "Explore" },
];

export function resolveCatalogReturnPath(state: unknown) {
  const from = (state as CatalogNavigationState | null)?.from;
  return from === "/profile" ? "/profile" : "/";
}

export function resolveCatalogRankingMode(
  search: string,
  state?: unknown,
): RankingMode {
  const requested = new URLSearchParams(search).get("mode");
  if (requested === "overall" || requested === "category") return requested;

  return (state as CatalogNavigationState | null)?.rankingMode === "overall"
    ? "overall"
    : "category";
}

export function CatalogRoute({
  view = defaultKinkCatalogWorkspaceView,
}: {
  view?: KinkCatalogWorkspaceView;
}) {
  const [quizProfile] = useState(() => loadProfile());
  const location = useLocation();
  const navigate = useNavigate();
  const requestedRankingMode = useMemo(
    () => resolveCatalogRankingMode(location.search, location.state),
    [location.search, location.state],
  );
  const [rankingMode, setRankingMode] =
    useState<RankingMode>(requestedRankingMode);
  const initialFocus = useMemo(
    () => parseCatalogRouteFocus(location.search),
    [location.search],
  );
  const returnPath = resolveCatalogReturnPath(location.state);

  useEffect(() => {
    setRankingMode(requestedRankingMode);
  }, [requestedRankingMode]);

  const navigateToRankingMode = (nextMode: RankingMode) => {
    setRankingMode(nextMode);
    navigate(`${rankingRoute.path}?mode=${nextMode}`, {
      state: location.state,
    });
  };

  const activeTab: CatalogWorkspaceTab =
    view === "browse"
      ? "explore"
      : rankingMode === "overall"
        ? "overall"
        : "compare";

  const changeTab = (nextTab: CatalogWorkspaceTab) => {
    if (nextTab === "explore") {
      navigate(catalogRoutePath());
      return;
    }

    const nextRankingMode: RankingMode =
      nextTab === "overall" ? "overall" : "category";
    navigateToRankingMode(nextRankingMode);
  };

  return (
    <RoutedFeatureFrame activeDestination="catalog">
      <section className="catalog-workspace-shell">
        <header className="catalog-workspace-navigation">
          <strong className="catalog-workspace-title">Kinks</strong>
          <nav className="catalog-workspace-tabs" aria-label="Kink catalog view">
            {catalogWorkspaceTabs.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  activeTab === option.value
                    ? "catalog-workspace-tab is-active"
                    : "catalog-workspace-tab"
                }
                aria-current={activeTab === option.value ? "page" : undefined}
                onClick={() => changeTab(option.value)}
              >
                {option.label}
              </button>
            ))}
          </nav>
        </header>

        {view === "browse" ? (
          <KinkCatalogPreferences
            key={location.search}
            quizProfile={quizProfile}
            initialFocus={initialFocus}
            closeLabel={returnPath === "/profile" ? "Back to profile" : "Back to hub"}
            onClose={() => navigate(returnPath)}
            onPlayRanking={() => {
              navigateToRankingMode("category");
            }}
          />
        ) : (
          <KinkThisOrThat
            quizProfile={quizProfile}
            initialMode={rankingMode}
            onModeChange={navigateToRankingMode}
            onClose={() => navigate("/")}
          />
        )}
      </section>
    </RoutedFeatureFrame>
  );
}
