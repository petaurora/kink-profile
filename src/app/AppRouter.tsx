import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { CatalogRoute } from "../features/catalog/CatalogRoute";
import { CompareRoute } from "../features/comparison/CompareRoute";
import { CurationRoute } from "../features/curation/CurationRoute";
import { HubPage } from "../features/hub/HubPage";
import { ProfileRoute } from "../features/profile/ProfileRoute";
import { QuizHomePage } from "../features/quizzes/QuizHomePage";
import { QuizRoutePage } from "../features/quizzes/QuizRoutePage";
import { RankingRoute } from "../features/ranking/RankingRoute";
import { RewardsRoute } from "../features/rewards/RewardsRoute";
import { SceneBuilderRoute } from "../features/scenes/SceneBuilderRoute";
import { SettingsRoute } from "../features/settings/SettingsRoute";
import { AppShell } from "./AppShell";
import {
  catalogRoute,
  compareRoute,
  curationRoute,
  hubRoute,
  profileRoute,
  quizHomeRoute,
  quizResultsRoute,
  quizRoute,
  rankingRoute,
  rewardsRoute,
  sceneBuilderRoute,
  settingsRoute,
  unknownRouteFallbackPath,
} from "./routes";

export function RoutedApplication() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={hubRoute.path} element={<HubPage />} />
        <Route path={profileRoute.path} element={<ProfileRoute />} />
        <Route path={quizHomeRoute.path} element={<QuizHomePage />} />
        <Route path={catalogRoute.path} element={<CatalogRoute />} />
        <Route path={rankingRoute.path} element={<RankingRoute />} />
        <Route path={rewardsRoute.path} element={<RewardsRoute />} />
        <Route path={sceneBuilderRoute.path} element={<SceneBuilderRoute />} />
        <Route path={compareRoute.path} element={<CompareRoute />} />
        <Route path={curationRoute.path} element={<CurationRoute />} />
        <Route path={settingsRoute.path} element={<SettingsRoute />} />
        <Route
          path={quizRoute.path}
          element={<QuizRoutePage mode="quiz" />}
        />
        <Route
          path={quizResultsRoute.path}
          element={<QuizRoutePage mode="results" />}
        />

        <Route
          path="*"
          element={<Navigate to={unknownRouteFallbackPath} replace />}
        />
      </Route>
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <HashRouter>
      <RoutedApplication />
    </HashRouter>
  );
}
