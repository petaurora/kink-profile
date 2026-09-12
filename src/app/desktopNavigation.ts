import { primaryDestinationForLocation } from "./mobilePrimaryNavigation";
import { curationRoute, settingsRoute } from "./routes";

export type DesktopCatalogWorkspace = "kinks" | "rewards" | null;
export type DesktopToolsWorkspace = "scenes" | "rewards" | "compare" | null;

export type DesktopNavigationState = {
  visible: boolean;
  primary: ReturnType<typeof primaryDestinationForLocation>;
  settingsActive: boolean;
  catalogWorkspace: DesktopCatalogWorkspace;
  toolsWorkspace: DesktopToolsWorkspace;
};

export function desktopNavigationStateForLocation(
  pathname: string,
  search = "",
): DesktopNavigationState {
  const primary = primaryDestinationForLocation(pathname, search);

  let catalogWorkspace: DesktopCatalogWorkspace = null;
  if (primary === "catalog") {
    catalogWorkspace =
      pathname.startsWith("/catalog/rewards") ||
      (pathname === "/rewards" &&
        new URLSearchParams(search).get("workspace") !== "tools")
        ? "rewards"
        : "kinks";
  }

  let toolsWorkspace: DesktopToolsWorkspace = null;
  if (primary === "tools") {
    if (pathname === "/compare") toolsWorkspace = "compare";
    else if (
      pathname.startsWith("/tools/rewards") ||
      (pathname === "/rewards" &&
        new URLSearchParams(search).get("workspace") === "tools")
    ) {
      toolsWorkspace = "rewards";
    } else {
      toolsWorkspace = "scenes";
    }
  }

  return {
    visible: pathname !== curationRoute.path,
    primary,
    settingsActive: pathname === settingsRoute.path,
    catalogWorkspace,
    toolsWorkspace,
  };
}
