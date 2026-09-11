import { useNavigate } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { CurationWorkbench } from "./CurationWorkbench";

export function CurationRoute() {
  const navigate = useNavigate();

  return (
    <RoutedFeatureFrame activeDestination="curation-workbench">
      <CurationWorkbench onClose={() => navigate("/")} />
    </RoutedFeatureFrame>
  );
}
