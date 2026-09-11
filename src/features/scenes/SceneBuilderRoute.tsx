import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SceneBuilder } from "../../SceneBuilder";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";

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
