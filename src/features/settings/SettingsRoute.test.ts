import { describe, expect, it } from "vitest";
import { resolveSettingsReturnPath } from "./SettingsRoute";

describe("Settings return navigation", () => {
  it("returns Profile-owned visits to Profile", () => {
    expect(resolveSettingsReturnPath({ from: "/profile" })).toBe("/profile");
  });

  it("preserves a valid invoking route", () => {
    expect(resolveSettingsReturnPath({ from: "/catalog/kinks" })).toBe(
      "/catalog/kinks",
    );
  });

  it("uses Profile as the safe direct-entry fallback", () => {
    expect(resolveSettingsReturnPath(undefined)).toBe("/profile");
    expect(resolveSettingsReturnPath({ from: "/settings" })).toBe("/profile");
    expect(resolveSettingsReturnPath({ from: "https://example.com" })).toBe(
      "/profile",
    );
    expect(resolveSettingsReturnPath({ from: "//example.com" })).toBe(
      "/profile",
    );
  });
});
