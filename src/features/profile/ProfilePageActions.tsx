import { IconSettings, IconShare3 } from "@tabler/icons-react";
import "./ProfilePageActions.css";

export function ProfilePageActions({
  onShare,
  onOpenSettings,
}: {
  onShare: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <nav className="profile-page-actions" aria-label="Profile actions">
      <button type="button" className="secondary compact" onClick={onShare}>
        <IconShare3 size={18} stroke={1.9} aria-hidden="true" />
        <span>Share</span>
      </button>
      <button
        type="button"
        className="secondary compact"
        onClick={onOpenSettings}
      >
        <IconSettings size={18} stroke={1.9} aria-hidden="true" />
        <span>Settings</span>
      </button>
    </nav>
  );
}
