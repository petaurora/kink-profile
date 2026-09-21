import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RoutedFeatureFrame } from "../../app/RoutedFeatureFrame";
import { loadProfile } from "../../lib/profileStorage";
import { KinkThisOrThat, type RankingMode } from "./KinkThisOrThat";

export function rankingModeFromSearchParams(
  searchParams: URLSearchParams,
): RankingMode {
  return searchParams.get("mode") === "overall" ? "overall" : "category";
}

export function RankingRoute() {
  const [quizProfile] = useState(() => loadProfile());
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = rankingModeFromSearchParams(searchParams);

  const changeMode = (nextMode: RankingMode) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("mode", nextMode);
    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <RoutedFeatureFrame activeDestination="ranking">
      <KinkThisOrThat
        quizProfile={quizProfile}
        onClose={() => navigate("/")}
        initialMode={mode}
        onModeChange={changeMode}
      />
    </RoutedFeatureFrame>
  );
}
