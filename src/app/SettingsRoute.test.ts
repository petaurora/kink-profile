import { describe, expect, it } from "vitest";
import { resolveSettingsReturnPath } from "./SettingsRoute";

describe("Settings route return navigation", () => {
  it("returns to the routed page that opened Settings", () => {
    expect(resolveSettingsReturnPath({ from: "/profile" })).toBe("/profile");
    expect(resolveSettingsReturnPath({ from: "/catalog?filter=curious" })).toBe(
      "/catalog?filter=curious",
    );
  });

  it("uses Profile for direct entry or unsafe return paths", () => {
    expect(resolveSettingsReturnPath(null)).toBe("/profile");
    expect(resolveSettingsReturnPath({})).toBe("/profile");
    expect(resolveSettingsReturnPath({ from: "https://example.com" })).toBe(
      "/profile",
    );
    expect(resolveSettingsReturnPath({ from: "//example.com" })).toBe(
      "/profile",
    );
    expect(resolveSettingsReturnPath({ from: "/settings" })).toBe("/profile");
  });
});
