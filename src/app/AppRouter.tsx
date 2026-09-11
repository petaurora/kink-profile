import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import ProfileAppRoot from "../ProfileAppRoot";
import { AppShell } from "./AppShell";
import { legacyScreenRoutes, reservedRoutes } from "./routes";

export function RoutedApplication() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {legacyScreenRoutes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={<ProfileAppRoot initialScreen={route.screen} />}
          />
        ))}

        {reservedRoutes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={<Navigate to="/" replace />}
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
