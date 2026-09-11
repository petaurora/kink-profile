import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import { SceneBuilder } from "./SceneBuilder";

export function SceneBuilderRoute() {
  const [snapshot] = useState(() => loadCurrentProfileSnapshot());
  const navigate = useNavigate();

  return (
    <RoutedFeatureFrame activeDestination="scene-builder">
      <SceneBuilder
        catalogResultView={snapshot.catalogResultView}
        onClose={() => navigate("/")}
      />
    </RoutedFeatureFrame>
  );
}
