import { describe, expect, it } from "vitest";
import { resolveProfileIdentityClaim } from "./profileIdentityClaim";

describe("profile identity-adjacent claims", () => {
  it("keeps unknown distinct when no calculated identity is established", () => {
    expect(resolveProfileIdentityClaim("unknown", "Still emerging")).toEqual({
      state: "unknown",
      label: "Still emerging",
      source: "none",
      calculatedState: "unknown",
      calculatedLabel: "Still emerging",
    });
  });

  it("keeps low match distinct from balanced/no-leader", () => {
    expect(
      resolveProfileIdentityClaim("low_match", "No strong D/s match").state,
    ).toBe("low_match");
    expect(
      resolveProfileIdentityClaim("balanced", "Balanced / no clear lean").state,
    ).toBe("balanced");
  });

  it("preserves a normal calculated match", () => {
    const claim = resolveProfileIdentityClaim(
      "calculated_match",
      "Submissive",
    );

    expect(claim.state).toBe("calculated_match");
    expect(claim.source).toBe("calculated");
  });

  it("lets direct self-identification wrap without rewriting the calculation", () => {
    const claim = resolveProfileIdentityClaim(
      "calculated_match",
      "Submissive",
      { kind: "self_identified", label: "Switch" },
    );

    expect(claim).toEqual({
      state: "self_identified",
      label: "Switch",
      source: "direct",
      calculatedState: "calculated_match",
      calculatedLabel: "Submissive",
    });
  });

  it("lets explicit none wrap without erasing the calculated result", () => {
    const claim = resolveProfileIdentityClaim(
      "balanced",
      "Balanced / no clear lean",
      { kind: "explicit_none" },
    );

    expect(claim).toEqual({
      state: "explicit_none",
      label: "No self-identified label",
      source: "direct",
      calculatedState: "balanced",
      calculatedLabel: "Balanced / no clear lean",
    });
  });
});
