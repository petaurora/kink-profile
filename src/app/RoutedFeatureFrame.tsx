import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfilePageActions } from "../features/profile/ProfilePageActions";
import { useProfileSettings } from "../lib/profileSettingsContext";
import {
  SiteHeader,
  type SiteHeaderDestination,
} from "./SiteHeader";
import { siteHeaderRoutePaths } from "./routes";

export function RoutedFeatureFrame({
  children,
  activeDestination,
}: {
  children: ReactNode;
  activeDestination?: SiteHeaderDestination;
}) {
  const { settings } = useProfileSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const navigateFromHeader = (destination: SiteHeaderDestination) => {
    navigate(siteHeaderRoutePaths[destination]);
  };

  const openSettings = () => {
    navigate("/settings", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const showProfileActions =
    activeDestination === "profile" && location.pathname === "/profile";

  return (
    <>
      <SiteHeader
        displayName={settings.displayName}
        activeDestination={activeDestination}
        onNavigate={navigateFromHeader}
        onOpenSettings={openSettings}
      />
      <main className="app-shell">
        {showProfileActions ? <ProfilePageActions /> : null}
        {children}
      </main>
    </>
  );
}
