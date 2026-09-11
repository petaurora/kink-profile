import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import ProfileAppRoot from "../ProfileAppRoot";
import { HubPage } from "../features/hub/HubPage";
import { QuizRoutePage } from "../features/quizzes/QuizRoutePage";
import { AppShell } from "./AppShell";
import { SettingsRoute } from "./SettingsRoute";
import {
  hubRoute,
  legacyScreenRoutes,
  quizResultsRoute,
  quizRoute,
  settingsRoute,
} from "./routes";

export function RoutedApplication() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={hubRoute.path} element={<HubPage />} />
        <Route path={settingsRoute.path} element={<SettingsRoute />} />
        <Route
          path={quizRoute.path}
          element={<QuizRoutePage mode="quiz" />}
        />
        <Route
          path={quizResultsRoute.path}
          element={<QuizRoutePage mode="results" />}
        />

        {legacyScreenRoutes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={<ProfileAppRoot initialScreen={route.screen} />}
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
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
