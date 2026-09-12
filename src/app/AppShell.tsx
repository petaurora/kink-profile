import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { IconArrowUp } from "@tabler/icons-react";
import { Outlet, useLocation } from "react-router-dom";
import { ProfileNameBridge } from "../ProfileNameBridge";
import {
  loadProfileSettings,
  saveProfileSettings,
} from "../lib/profileSettings";
import { ProfileSettingsProvider } from "../lib/profileSettingsContext";
import { DesktopNavigationRail } from "./DesktopNavigationRail";
import { desktopNavigationStateForLocation } from "./desktopNavigation";
import { MobilePrimaryNav } from "./MobilePrimaryNav";

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

type ShellErrorBoundaryState = {
  failed: boolean;
};

class ShellErrorBoundary extends Component<
  { children: ReactNode },
  ShellErrorBoundaryState
> {
  state: ShellErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ShellErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("Application route failed to render", error, errorInfo);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="app-shell">
          <section className="panel">
            <p className="eyebrow">Navigation error</p>
            <h1>That page could not be loaded.</h1>
            <p>Your saved profile data has not been changed.</p>
            <a className="primary compact" href="#/">
              Back to Explore
            </a>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export function AppShell() {
  const [settings, setSettings] = useState(() => loadProfileSettings());
  const location = useLocation();
  const desktopNavigation = desktopNavigationStateForLocation(
    location.pathname,
    location.search,
  );

  useEffect(() => {
    saveProfileSettings(settings);
  }, [settings]);

  return (
    <ProfileSettingsProvider value={{ settings, setSettings }}>
      <ProfileNameBridge settings={settings} />
      <DesktopNavigationRail />
      <div
        className={
          "desktop-shell-content" +
          (desktopNavigation.visible ? " has-desktop-navigation" : "")
        }
      >
        <ShellErrorBoundary>
          <Outlet />
        </ShellErrorBoundary>
      </div>
      <ReturnToTop />
      <MobilePrimaryNav />
    </ProfileSettingsProvider>
  );
}
