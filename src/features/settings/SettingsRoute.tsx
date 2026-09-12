import { useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SiteHeader } from "../../app/SiteHeader";
import { loadDeveloperToolsEnabled, saveDeveloperToolsEnabled } from "../../lib/developerSettings";
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
    return "/profile";
  }

  return from;
}

export function SettingsRoute() {
  const { settings, setSettings } = useProfileSettings();
  const [developerToolsEnabled, setDeveloperToolsEnabled] = useState(() =>
    loadDeveloperToolsEnabled(),
  );
  const location = useLocation();
  const navigate = useNavigate();
  const returnPath = resolveSettingsReturnPath(location.state);
  const initialSection = new URLSearchParams(location.search).get("section");

  const closeSettings = () => {
    navigate(returnPath, { replace: true });
  };

  const changeDeveloperTools = (enabled: boolean) => {
    saveDeveloperToolsEnabled(enabled);
    setDeveloperToolsEnabled(enabled);
  };

  return (
    <>
      <SiteHeader
        displayName={settings.displayName}
        activeDestination="profile"
        settingsActive
        onNavigate={() => undefined}
        onOpenSettings={closeSettings}
      />
      <main className="app-shell settings-route-shell">
        <header className="settings-local-header" aria-label="Settings navigation">
          <button type="button" className="settings-back-button" onClick={closeSettings}>
            <IconArrowLeft size={19} stroke={2} aria-hidden="true" />
            <span>Profile</span>
          </button>
          <strong>Settings</strong>
        </header>

        <ProfileSettingsPage
          settings={settings}
          onChange={setSettings}
          onClose={closeSettings}
          initialSection={initialSection === "sharing" ? "sharing" : undefined}
          developerToolsEnabled={developerToolsEnabled}
          onDeveloperToolsChange={changeDeveloperTools}
          onOpenCuration={() =>
            navigate("/curation", { state: { from: "/settings" } })
          }
        />
      </main>
    </>
  );
}
