import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadProfile } from "../../lib/profileStorage";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { KinkCatalogPreferences } from "./KinkCatalogPreferences";
import { parseCatalogRouteFocus } from "./catalogRouteState";

type CatalogNavigationState = {
  from?: unknown;
};

export function resolveCatalogReturnPath(state: unknown) {
  const from = (state as CatalogNavigationState | null)?.from;
  return from === "/profile" ? "/profile" : "/";
}

export function CatalogRoute() {
  const [quizProfile] = useState(() => loadProfile());
  const location = useLocation();
  const navigate = useNavigate();
  const initialFocus = useMemo(
    () => parseCatalogRouteFocus(location.search),
    [location.search],
  );
  const returnPath = resolveCatalogReturnPath(location.state);

  return (
    <RoutedFeatureFrame activeDestination="catalog">
      <KinkCatalogPreferences
        key={location.search}
        quizProfile={quizProfile}
        initialFocus={initialFocus}
        closeLabel={returnPath === "/profile" ? "Back to profile" : "Back to hub"}
        onClose={() => navigate(returnPath)}
        onPlayRanking={() => navigate("/ranking")}
      />
    </RoutedFeatureFrame>
  );
}
