import { useLocation, useNavigate } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { CurationWorkbench } from "./CurationWorkbench";

type CurationNavigationState = {
  from?: unknown;
};

export function resolveCurationReturnPath(state: unknown) {
  return (state as CurationNavigationState | null)?.from === "/settings"
    ? "/settings"
    : "/";
}

export function CurationRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const returnPath = resolveCurationReturnPath(location.state);

  return (
    <RoutedFeatureFrame activeDestination="curation-workbench">
      <CurationWorkbench onClose={() => navigate(returnPath)} />
    </RoutedFeatureFrame>
  );
}
