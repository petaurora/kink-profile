import { useLocation, useNavigate } from "react-router-dom";
import App, { type Screen } from "./App";
import { useProfileSettings } from "./lib/profileSettingsContext";

type ProfileAppRootProps = {
  initialScreen?: Screen;
};

export default function ProfileAppRoot({
  initialScreen = "hub",
}: ProfileAppRootProps) {
  const { settings } = useProfileSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const openSettings = () => {
    navigate("/settings", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  return (
    <App
      key={initialScreen}
      initialScreen={initialScreen}
      displayName={settings.displayName}
      onOpenSettings={openSettings}
    />
  );
}
