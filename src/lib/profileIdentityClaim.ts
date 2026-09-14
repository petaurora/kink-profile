export type ProfileIdentityClaimState =
  | "unknown"
  | "low_match"
  | "balanced"
  | "calculated_match"
  | "explicit_none"
  | "self_identified";

export type CalculatedIdentityClaimState = Exclude<
  ProfileIdentityClaimState,
  "explicit_none" | "self_identified"
>;

export type ProfileIdentityClaimOverride =
  | {
      kind: "self_identified";
      label: string;
    }
  | {
      kind: "explicit_none";
      label?: string;
    };

export type ProfileIdentityClaim = {
  state: ProfileIdentityClaimState;
  label: string;
  source: "calculated" | "direct" | "none";
  calculatedState: CalculatedIdentityClaimState;
  calculatedLabel: string;
};

/**
 * Personal identity-adjacent presentation must not overwrite calculated truth.
 * Direct self-identification or explicit-none may wrap the calculated result,
 * but the underlying calculated state/label remain available for explainability.
 */
export function resolveProfileIdentityClaim(
  calculatedState: CalculatedIdentityClaimState,
  calculatedLabel: string,
  override?: ProfileIdentityClaimOverride,
): ProfileIdentityClaim {
  if (override?.kind === "self_identified") {
    return {
      state: "self_identified",
      label: override.label,
      source: "direct",
      calculatedState,
      calculatedLabel,
    };
  }

  if (override?.kind === "explicit_none") {
    return {
      state: "explicit_none",
      label: override.label ?? "No self-identified label",
      source: "direct",
      calculatedState,
      calculatedLabel,
    };
  }

  return {
    state: calculatedState,
    label: calculatedLabel,
    source: calculatedState === "unknown" ? "none" : "calculated",
    calculatedState,
    calculatedLabel,
  };
}
