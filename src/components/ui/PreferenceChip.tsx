import type { PreferenceRating } from "../../services/contracts";
import { AppIcon } from "./AppIcon";
import type { AppIconMeaning } from "./appIcons";
import "./preference.css";

export const preferenceIconMeanings = {
  Love: "preferenceLove",
  Like: "preferenceLike",
  Curious: "preferenceCurious",
  Unsure: "preferenceUnsure",
  "Not Interested": "preferenceNotInterested",
  "Hard Limit": "preferenceHardLimit",
  "Not Applicable": "preferenceNotApplicable",
} as const satisfies Record<PreferenceRating, AppIconMeaning>;

export function isPreferenceRating(value: unknown): value is PreferenceRating {
  return typeof value === "string" && Object.hasOwn(preferenceIconMeanings, value);
}

/** A display-only chip; editable surfaces opt in through PreferenceControl. */
export function PreferenceChip({ value }: { value?: string }) {
  const rated = isPreferenceRating(value);
  return <span className="kp-preference-chip" data-preference={rated ? value : undefined}>
    <AppIcon name={rated ? preferenceIconMeanings[value] : "unrated"} size={16} />
    <span>{value || "Not rated"}</span>
  </span>;
}
