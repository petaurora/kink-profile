import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileComparisonPage } from "../../ProfileComparisonPage";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import { useProfileSettings } from "../../lib/profileSettingsContext";

export function CompareRoute() {
  const [snapshot] = useState(() => loadCurrentProfileSnapshot());
  const { settings } = useProfileSettings();
  const navigate = useNavigate();

  return (
    <RoutedFeatureFrame activeDestination="compare-profiles">
      <ProfileComparisonPage
        current={{
          displayName: settings.displayName,
          profile: snapshot.profile,
          catalogProfile: snapshot.catalogProfile,
        }}
        onClose={() => navigate("/")}
      />
    </RoutedFeatureFrame>
  );
}
