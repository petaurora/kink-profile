import { useState } from "react";
import App, { type Screen } from "./App";
import { ProfileSettingsPage } from "./ProfileSettingsPage";
import {
  SiteHeader,
  type SiteHeaderDestination,
} from "./SiteHeader";
import { useProfileSettings } from "./lib/profileSettingsContext";

type ProfileAppRootProps = {
  initialScreen?: Screen;
};

export default function ProfileAppRoot({
  initialScreen = "hub",
}: ProfileAppRootProps) {
  const { settings, setSettings } = useProfileSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resumeScreen, setResumeScreen] = useState<Screen>(initialScreen);

  const openSettings = (returnScreen: Screen) => {
    setResumeScreen(returnScreen);
    setSettingsOpen(true);
  };

  const leaveSettingsFor = (destination: SiteHeaderDestination) => {
    setResumeScreen(destination);
    setSettingsOpen(false);
  };

  return settingsOpen ? (
    <>
      <SiteHeader
        displayName={settings.displayName}
        settingsActive
        onNavigate={leaveSettingsFor}
        onOpenSettings={() => setSettingsOpen(false)}
      />
      <main className="app-shell">
        <ProfileSettingsPage
          settings={settings}
          onChange={setSettings}
          onClose={() => leaveSettingsFor("hub")}
        />
      </main>
    </>
  ) : (
    <App
      initialScreen={resumeScreen}
      displayName={settings.displayName}
      onOpenSettings={openSettings}
    />
  );
}
