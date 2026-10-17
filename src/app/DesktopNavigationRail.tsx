import { IconGift, IconHeart } from "@tabler/icons-react";
import { AppIcon } from "../components/ui/AppIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { desktopNavigationStateForLocation } from "./desktopNavigation";
import {
  catalogRewardsRoute,
  catalogRoute,
  compareRoute,
  hubRoute,
  profileRoute,
  quizHomeRoute,
  rewardsToolsRandomizerRoute,
  sceneBuilderRoute,
  settingsRoute,
} from "./routes";
import "./DesktopNavigationRail.css";

function itemClass(active: boolean, parentActive = false) {
  return [
    "desktop-nav-item",
    active ? "is-active" : "",
    parentActive ? "is-parent-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function DesktopNavigationRail({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = desktopNavigationStateForLocation(
    location.pathname,
    location.search,
  );

  if (!state.visible) return null;

  const go = (path: string) => navigate(path);
  const openSettings = () => {
    if (state.settingsActive) return;
    navigate(settingsRoute.path, {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  return (
    <aside
      className={
        "desktop-navigation-rail" + (expanded ? " is-expanded" : " is-collapsed")
      }
      aria-label="Desktop navigation"
    >
      <button
        type="button"
        className="desktop-navigation-toggle"
        aria-label={expanded ? "Hide navigation" : "Show navigation"}
        aria-expanded={expanded}
        title={expanded ? "Hide navigation" : "Show navigation"}
        onClick={onToggle}
      >
        <AppIcon name={expanded ? "collapseSidebar" : "expandSidebar"} size={20} />
      </button>

      {expanded ? (
        <div className="desktop-navigation-rail-inner">
          <div className="desktop-nav-brand">
            <strong>Kink Profile</strong>
          </div>

          <nav className="desktop-nav-primary" aria-label="Primary navigation">
            <button
              type="button"
              className={`${itemClass(state.primary === "hub")} desktop-nav-item--hub`}
              aria-current={state.primary === "hub" ? "page" : undefined}
              onClick={() => go(hubRoute.path)}
            >
              <AppIcon name="home" size={20} />
              <span>Hub</span>
            </button>

            <button
              type="button"
              className={itemClass(state.primary === "quiz")}
              aria-current={state.primary === "quiz" ? "page" : undefined}
              onClick={() => go(quizHomeRoute.path)}
            >
              <AppIcon name="quiz" size={19} />
              <span>Quiz</span>
            </button>

            <div className="desktop-nav-group">
              <button
                type="button"
                className={itemClass(false, state.primary === "catalog")}
                aria-expanded={state.primary === "catalog"}
                onClick={() => go(catalogRoute.path)}
              >
                <AppIcon name="catalog" size={19} />
                <span>Catalog</span>
              </button>

              {state.primary === "catalog" ? (
                <div className="desktop-nav-children" aria-label="Catalog workspaces">
                  <button
                    type="button"
                    className={state.catalogWorkspace === "kinks" ? "is-active" : ""}
                    aria-current={state.catalogWorkspace === "kinks" ? "page" : undefined}
                    onClick={() => go(catalogRoute.path)}
                  >
                    <IconHeart size={16} stroke={1.9} aria-hidden="true" />
                    <span>Kinks</span>
                  </button>
                  <button
                    type="button"
                    className={state.catalogWorkspace === "rewards" ? "is-active" : ""}
                    aria-current={state.catalogWorkspace === "rewards" ? "page" : undefined}
                    onClick={() => go(catalogRewardsRoute.path)}
                  >
                    <IconGift size={16} stroke={1.9} aria-hidden="true" />
                    <span>Rewards & Punishments</span>
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={itemClass(
                state.primary === "profile" && !state.settingsActive,
                state.settingsActive,
              )}
              aria-current={
                state.primary === "profile" && !state.settingsActive
                  ? "page"
                  : undefined
              }
              onClick={() => go(profileRoute.path)}
            >
              <AppIcon name="profile" size={19} />
              <span>Profile</span>
            </button>

            <div className="desktop-nav-group">
              <button
                type="button"
                className={itemClass(false, state.primary === "tools")}
                aria-expanded={state.primary === "tools"}
                onClick={() => go(sceneBuilderRoute.path)}
              >
                <AppIcon name="tools" size={19} />
                <span>Tools</span>
              </button>

              {state.primary === "tools" ? (
                <div className="desktop-nav-children" aria-label="Tools workspaces">
                  <button
                    type="button"
                    className={state.toolsWorkspace === "scenes" ? "is-active" : ""}
                    aria-current={state.toolsWorkspace === "scenes" ? "page" : undefined}
                    onClick={() => go(sceneBuilderRoute.path)}
                  >
                    <AppIcon name="scenes" size={16} />
                    <span>Scenes</span>
                  </button>
                  <button
                    type="button"
                    className={state.toolsWorkspace === "rewards" ? "is-active" : ""}
                    aria-current={state.toolsWorkspace === "rewards" ? "page" : undefined}
                    onClick={() => go(rewardsToolsRandomizerRoute.path)}
                  >
                    <IconGift size={16} stroke={1.9} aria-hidden="true" />
                    <span>R/P Tools</span>
                  </button>
                  <button
                    type="button"
                    className={state.toolsWorkspace === "compare" ? "is-active" : ""}
                    aria-current={state.toolsWorkspace === "compare" ? "page" : undefined}
                    onClick={() => go(compareRoute.path)}
                  >
                    <AppIcon name="compare" size={16} />
                    <span>Compare</span>
                  </button>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="desktop-nav-footer">
            <button
              type="button"
              className={itemClass(state.settingsActive)}
              aria-current={state.settingsActive ? "page" : undefined}
              onClick={openSettings}
            >
              <AppIcon name="settings" size={19} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
