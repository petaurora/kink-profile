import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ProfilePageActions } from "../features/profile/ProfilePageActions";

export function RoutedFeatureFrame({
  children,
  activeDestination,
}: {
  children: ReactNode;
  activeDestination?: string;
}) {
  const location = useLocation();
  const showProfileActions =
    activeDestination === "profile" && location.pathname === "/profile";

  return (
    <main className="app-shell">
      {showProfileActions ? <ProfilePageActions /> : null}
      {children}
    </main>
  );
}
