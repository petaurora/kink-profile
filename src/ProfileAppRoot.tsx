import { useEffect, useState } from "react";
import App from "./App";
import { ProfileSettingsPage } from "./ProfileSettingsPage";
import {
  loadProfileSettings,
  saveProfileSettings,
} from "./lib/profileSettings";
import { ProfileSettingsProvider } from "./lib/profileSettingsContext";
import "./settings.css";

export default function ProfileAppRoot() {
  const [settings, setSettings] = useState(() => loadProfileSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    saveProfileSettings(settings);
  }, [settings]);

  return (
    <ProfileSettingsProvider value={{ settings, setSettings }}>
      {settingsOpen ? (
        <main className="app-shell">
          <ProfileSettingsPage
            settings={settings}
            onChange={setSettings}
            onClose={() => setSettingsOpen(false)}
          />
        </main>
      ) : (
        <>
          <App />
          <button
            type="button"
            className="settings-launcher"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </>
      )}
    </ProfileSettingsProvider>
  );
}
