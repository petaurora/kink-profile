import { useState } from "react";
import {
  IconChevronDown,
  IconHome,
  IconList,
  IconPaw,
  IconSettings,
  IconSparkles,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

export type SiteHeaderDestination =
  | "hub"
  | "profile"
  | "ranking"
  | "catalog"
  | "rewards-punishments"
  | "scene-builder"
  | "compare-profiles"
  | "curation-workbench";

type SiteHeaderProps = {
  displayName: string;
  onNavigate: (destination: SiteHeaderDestination) => void;
  onOpenSettings: () => void;
  activeDestination?: SiteHeaderDestination;
  settingsActive?: boolean;
};

export function SiteHeader({
  displayName,
  onNavigate,
  onOpenSettings,
  activeDestination,
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
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
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
              <button
                type="button"
                aria-current={activeDestination === "hub" ? "page" : undefined}
                onClick={() => navigate("hub")}
              >
                <IconHome size={17} stroke={1.9} aria-hidden="true" />
                <span>Explore</span>
              </button>
              <button
                type="button"
                aria-current={activeDestination === "profile" ? "page" : undefined}
                onClick={() => navigate("profile")}
              >
                <IconUser size={17} stroke={1.9} aria-hidden="true" />
                <span>View profile</span>
              </button>
              <button
                type="button"
                aria-current={activeDestination === "catalog" ? "page" : undefined}
                onClick={() => navigate("catalog")}
              >
                <IconList size={17} stroke={1.9} aria-hidden="true" />
                <span>Catalog</span>
              </button>
              <button
                type="button"
                aria-current={
                  activeDestination === "scene-builder" ? "page" : undefined
                }
                onClick={() => navigate("scene-builder")}
              >
                <IconSparkles size={17} stroke={1.9} aria-hidden="true" />
                <span>Scene Builder</span>
              </button>
              <button
                type="button"
                aria-current={
                  activeDestination === "compare-profiles" ? "page" : undefined
                }
                onClick={() => navigate("compare-profiles")}
              >
                <IconUsers size={17} stroke={1.9} aria-hidden="true" />
                <span>Compare profiles</span>
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
