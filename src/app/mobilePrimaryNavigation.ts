export type PrimaryNavigationDestination =
  | "quiz"
  | "catalog"
  | "hub"
  | "profile"
  | "tools";

export function primaryDestinationForLocation(
  pathname: string,
  search = "",
): PrimaryNavigationDestination | null {
  if (pathname === "/") return "hub";

  if (pathname === "/profile" || pathname === "/settings") {
    return "profile";
  }

  if (
    pathname === "/catalog" ||
    pathname === "/ranking" ||
    pathname.startsWith("/catalog/")
  ) {
    return "catalog";
  }

  if (pathname === "/rewards") {
    const workspace = new URLSearchParams(search).get("workspace");
    return workspace === "tools" ? "tools" : "catalog";
  }

  if (pathname === "/scene-builder" || pathname === "/compare") {
    return "tools";
  }

  if (pathname === "/quizzes" || pathname.startsWith("/quizzes/")) {
    return "quiz";
  }

  return null;
}

export function shouldShowMobilePrimaryNavigation(pathname: string) {
  return pathname !== "/curation";
}
