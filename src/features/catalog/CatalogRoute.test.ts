import { describe, expect, it } from "vitest";
import {
  defaultKinkCatalogWorkspaceView,
  kinkCatalogWorkspaceOptions,
  resolveCatalogRankingMode,
  resolveCatalogReturnPath,
} from "./CatalogRoute";

describe("CatalogRoute workspace defaults", () => {
  it("uses Rank as the primary/default Kinks workspace view", () => {
    expect(defaultKinkCatalogWorkspaceView).toBe("rank");
    expect(kinkCatalogWorkspaceOptions.map((option) => option.value)).toEqual([
      "rank",
      "browse",
    ]);
  });
});

describe("CatalogRoute return navigation", () => {
  it("returns profile drill-downs to the profile", () => {
    expect(resolveCatalogReturnPath({ from: "/profile" })).toBe("/profile");
  });

  it("falls back to Explore for direct entry or unrelated state", () => {
    expect(resolveCatalogReturnPath(undefined)).toBe("/");
    expect(resolveCatalogReturnPath({ from: "/settings" })).toBe("/");
    expect(resolveCatalogReturnPath({ from: "https://example.com" })).toBe("/");
  });
});


describe("CatalogRoute ranking mode deep links", () => {
  it("honors explicit URL mode before legacy navigation state", () => {
    expect(resolveCatalogRankingMode("?mode=overall")).toBe("overall");
    expect(resolveCatalogRankingMode("?mode=category")).toBe("category");
    expect(
      resolveCatalogRankingMode("?mode=overall", { rankingMode: "category" }),
    ).toBe("overall");
    expect(
      resolveCatalogRankingMode("?mode=category", { rankingMode: "overall" }),
    ).toBe("category");
  });

  it("falls back to legacy state when no valid mode is in the URL", () => {
    expect(resolveCatalogRankingMode("", { rankingMode: "overall" })).toBe(
      "overall",
    );
    expect(resolveCatalogRankingMode("?mode=nope")).toBe("category");
  });
});
