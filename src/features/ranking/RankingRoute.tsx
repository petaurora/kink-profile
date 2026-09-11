import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { loadProfile } from "../../lib/profileStorage";
import { KinkThisOrThat } from "./KinkThisOrThat";

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
