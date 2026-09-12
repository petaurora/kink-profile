import { IconSettings, IconShare3 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import "./ProfilePageActions.css";

export function ProfilePageActions() {
  const navigate = useNavigate();

  const openSettings = (section?: "sharing") => {
    navigate(section ? `/settings?section=${section}` : "/settings", {
      state: { from: "/profile" },
    });
  };

  return (
    <nav className="profile-page-actions" aria-label="Profile actions">
      <button type="button" className="profile-page-action" onClick={() => openSettings("sharing")}>
        <IconShare3 size={20} stroke={1.9} aria-hidden="true" />
        <span>Share</span>
      </button>
      <button type="button" className="profile-page-action" onClick={() => openSettings()}>
        <IconSettings size={20} stroke={1.9} aria-hidden="true" />
        <span>Settings</span>
      </button>
    </nav>
  );
}
