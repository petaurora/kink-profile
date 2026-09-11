import { useNavigate } from "react-router-dom";
import { CurationWorkbench } from "../../CurationWorkbench";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";

export function CurationRoute() {
  const navigate = useNavigate();

  return (
    <RoutedFeatureFrame activeDestination="curation-workbench">
      <CurationWorkbench onClose={() => navigate("/")} />
    </RoutedFeatureFrame>
  );
}
