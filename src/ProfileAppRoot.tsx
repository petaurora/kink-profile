import { useEffect, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";
import App, { type Screen } from "./App";
import { ProfileSettingsPage } from "./ProfileSettingsPage";
import { ProfileNameBridge } from "./ProfileNameBridge";
import {
  SiteHeader,
  type SiteHeaderDestination,
} from "./SiteHeader";
import {
  loadProfileSettings,
  saveProfileSettings,
} from "./lib/profileSettings";
import { ProfileSettingsProvider } from "./lib/profileSettingsContext";
import "./settings.css";

function ReturnToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 600);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="return-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Return to top"
    >
      <IconArrowUp size={17} stroke={2} aria-hidden="true" />
      <span>Return to top</span>
    </button>
  );
}

export default function ProfileAppRoot() {
  const [settings, setSettings] = useState(() => loadProfileSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resumeScreen, setResumeScreen] = useState<Screen>("hub");

  useEffect(() => {
    saveProfileSettings(settings);
  }, [settings]);

  const openSettings = (returnScreen: Screen) => {
    setResumeScreen(returnScreen);
    setSettingsOpen(true);
  };

  const leaveSettingsFor = (destination: SiteHeaderDestination) => {
    setResumeScreen(destination);
    setSettingsOpen(false);
  };

  return (
    <ProfileSettingsProvider value={{ settings, setSettings }}>
      <ProfileNameBridge settings={settings} />

      {settingsOpen ? (
        <main className="app-shell">
          <SiteHeader
            displayName={settings.displayName}
            settingsActive
            onNavigate={leaveSettingsFor}
            onOpenSettings={() => setSettingsOpen(false)}
          />
          <ProfileSettingsPage
            settings={settings}
            onChange={setSettings}
            onClose={() => leaveSettingsFor("hub")}
          />
        </main>
      ) : (
        <App
          initialScreen={resumeScreen}
          displayName={settings.displayName}
          onOpenSettings={openSettings}
        />
      )}

      <ReturnToTop />
    </ProfileSettingsProvider>
  );
}
