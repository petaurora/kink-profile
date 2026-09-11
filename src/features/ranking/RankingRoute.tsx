import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KinkThisOrThat } from "../../KinkThisOrThat";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { loadProfile } from "../../lib/profileStorage";

export function RankingRoute() {
  const [quizProfile] = useState(() => loadProfile());
  const navigate = useNavigate();

  return (
    <RoutedFeatureFrame activeDestination="ranking">
      <KinkThisOrThat
        quizProfile={quizProfile}
        onClose={() => navigate("/")}
      />
    </RoutedFeatureFrame>
  );
}
