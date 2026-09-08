import { useState } from "react";
import {
  IconChevronDown,
  IconPaw,
  IconSettings,
} from "@tabler/icons-react";

export type SiteHeaderDestination =
  | "hub"
  | "profile"
  | "ranking"
  | "catalog"
  | "rewards-punishments";

type SiteHeaderProps = {
  displayName: string;
  onNavigate: (destination: SiteHeaderDestination) => void;
  onOpenSettings: () => void;
  settingsActive?: boolean;
};

export function SiteHeader({
  displayName,
  onNavigate,
  onOpenSettings,
  settingsActive = false,
}: SiteHeaderProps) {
  const [navOpen, setNavOpen] = useState(false);

  const navigate = (destination: SiteHeaderDestination) => {
    setNavOpen(false);
    onNavigate(destination);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-nav">
        <button
          type="button"
          className={"site-nav-trigger" + (navOpen ? " is-open" : "")}
          aria-label="Open navigation"
          aria-expanded={navOpen}
          aria-controls="site-navigation-menu"
          onClick={() => setNavOpen((open) => !open)}
        >
          <IconPaw size={18} stroke={2} aria-hidden="true" />
          <IconChevronDown
            className="site-nav-chevron"
            size={13}
            stroke={2}
            aria-hidden="true"
          />
        </button>

        {navOpen && (
          <nav
            id="site-navigation-menu"
            className="site-nav-menu panel"
            aria-label="Primary navigation"
          >
            <button type="button" onClick={() => navigate("hub")}>
              Explore
            </button>
            <button type="button" onClick={() => navigate("profile")}>
              View profile
            </button>
            <button type="button" onClick={() => navigate("ranking")}>
              This or That
            </button>
            <button type="button" onClick={() => navigate("catalog")}>
              Catalog
            </button>
            <button type="button" onClick={() => navigate("rewards-punishments")}>
              Rewards / Punishments
            </button>
          </nav>
        )}

        <button
          type="button"
          className="brand"
          onClick={() => navigate("profile")}
          aria-label={"View " + displayName + "'s profile"}
        >
          <span>{displayName}'s Profile</span>
        </button>
      </div>

        <div className="header-actions">
          <button
            type="button"
            className={"header-icon-button" + (settingsActive ? " is-active" : "")}
            onClick={onOpenSettings}
            aria-label={settingsActive ? "Close settings" : "Open settings"}
            aria-pressed={settingsActive}
          >
            <IconSettings size={20} stroke={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
