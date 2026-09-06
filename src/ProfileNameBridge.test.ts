import { describe, expect, it } from "vitest";
import { profileOwnerLabels } from "./ProfileNameBridge";

describe("profile owner labels", () => {
  it("uses the configured display name for every owner-facing profile label", () => {
    expect(profileOwnerLabels("babygirl")).toEqual({
      brand: "babygirl's Profile",
      header: "babygirl's profile",
      hub: "babygirl's profile",
      overall: "babygirl's overall profile",
    });
  });

  it("does not special-case the default Pet name", () => {
    expect(profileOwnerLabels("Pet").overall).toBe("Pet's overall profile");
  });
});
