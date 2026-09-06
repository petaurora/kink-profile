import { useEffect } from "react";
import type { ProfileSettings } from "./lib/profileSettings";

export function profileOwnerLabels(displayName: string) {
  return {
    brand: `${displayName}'s Profile`,
    header: `${displayName}'s profile`,
    hub: `${displayName}'s profile`,
    overall: `${displayName}'s overall profile`,
  };
}

const PROFILE_OWNER_SELECTORS = {
  brand: ".site-header .brand > span:last-child",
  header: ".site-header .header-actions .header-link",
  hub: ".hub-hero .profile-summary .eyebrow",
  overall: ".profile-stack > .results-heading .eyebrow",
} as const;

function applyProfileOwnerLabels(displayName: string) {
  const labels = profileOwnerLabels(displayName);

  for (const key of Object.keys(PROFILE_OWNER_SELECTORS) as Array<
    keyof typeof PROFILE_OWNER_SELECTORS
  >) {
    const element = document.querySelector(PROFILE_OWNER_SELECTORS[key]);
    if (element && element.textContent !== labels[key]) {
      element.textContent = labels[key];
    }
  }
}

/**
 * Temporary M9.1 compatibility bridge.
 *
 * M7.3 is actively changing App.tsx/profile header markup in parallel, so M9.1 avoids
 * competing edits there. This bridge updates only the four legacy profile-owner labels.
 * Taxonomy labels such as the Pet headspace are intentionally untouched.
 *
 * Once the M7 profile header lands, App.tsx should consume useProfileSettings() directly
 * and this bridge can be removed.
 */
export function ProfileNameBridge({
  settings,
}: {
  settings: ProfileSettings;
}) {
  useEffect(() => {
    applyProfileOwnerLabels(settings.displayName);

    const observer = new MutationObserver(() => {
      applyProfileOwnerLabels(settings.displayName);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [settings.displayName]);

  return null;
}
