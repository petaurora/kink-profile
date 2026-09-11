import { useLocation, useNavigate } from "react-router-dom";
import { SiteHeader } from "../../app/SiteHeader";
import { useProfileSettings } from "../../lib/profileSettingsContext";
import { ProfileSettingsPage } from "./ProfileSettingsPage";
import "./settings.css";

type SettingsNavigationState = {
  from?: unknown;
};

export function resolveSettingsReturnPath(state: unknown) {
  const from = (state as SettingsNavigationState | null)?.from;
  if (
    typeof from !== "string" ||
    !from.startsWith("/") ||
    from.startsWith("//") ||
    from === "/settings"
  ) {
    return "/";
  }

  return from;
}

export function SettingsRoute() {
  const { settings, setSettings } = useProfileSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const returnPath = resolveSettingsReturnPath(location.state);

  const closeSettings = () => {
    navigate(returnPath, { replace: true });
  };

  return (
    <>
      <SiteHeader
        displayName={settings.displayName}
        settingsActive
        onNavigate={() => undefined}
        onOpenSettings={closeSettings}
      />
      <main className="app-shell">
        <ProfileSettingsPage
          settings={settings}
          onChange={setSettings}
          onClose={closeSettings}
        />
      </main>
    </>
  );
}
