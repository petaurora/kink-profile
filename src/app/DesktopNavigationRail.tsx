import {
  IconBook2,
  IconGift,
  IconHeart,
  IconHome,
  IconQuestionMark,
  IconSettings,
  IconSparkles,
  IconTool,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfileSettings } from "../lib/profileSettingsContext";
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

export function DesktopNavigationRail() {
  const { settings } = useProfileSettings();
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
    <aside className="desktop-navigation-rail" aria-label="Desktop navigation">
      <div className="desktop-navigation-rail-inner">
        <div className="desktop-nav-brand">
          <span className="desktop-nav-brand-mark" aria-hidden="true">◆</span>
          <div>
            <span>Profile</span>
            <strong>{settings.displayName}</strong>
          </div>
        </div>

        <nav className="desktop-nav-primary" aria-label="Primary navigation">
          <button
            type="button"
            className={`${itemClass(state.primary === "hub")} desktop-nav-item--hub`}
            aria-current={state.primary === "hub" ? "page" : undefined}
            onClick={() => go(hubRoute.path)}
          >
            <IconHome size={20} stroke={2} aria-hidden="true" />
            <span>Hub</span>
          </button>

          <button
            type="button"
            className={itemClass(state.primary === "quiz")}
            aria-current={state.primary === "quiz" ? "page" : undefined}
            onClick={() => go(quizHomeRoute.path)}
          >
            <IconQuestionMark size={19} stroke={2} aria-hidden="true" />
            <span>Quiz</span>
          </button>

          <div className="desktop-nav-group">
            <button
              type="button"
              className={itemClass(false, state.primary === "catalog")}
              aria-expanded={state.primary === "catalog"}
              onClick={() => go(catalogRoute.path)}
            >
              <IconBook2 size={19} stroke={2} aria-hidden="true" />
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
            <IconUser size={19} stroke={2} aria-hidden="true" />
            <span>Profile</span>
          </button>

          <div className="desktop-nav-group">
            <button
              type="button"
              className={itemClass(false, state.primary === "tools")}
              aria-expanded={state.primary === "tools"}
              onClick={() => go(sceneBuilderRoute.path)}
            >
              <IconTool size={19} stroke={2} aria-hidden="true" />
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
                  <IconSparkles size={16} stroke={1.9} aria-hidden="true" />
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
                  <IconUsers size={16} stroke={1.9} aria-hidden="true" />
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
            <IconSettings size={19} stroke={2} aria-hidden="true" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
