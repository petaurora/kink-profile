import { describe, expect, it } from "vitest";
import { rankingModeFromSearchParams } from "./RankingRoute";

describe("RankingRoute mode deep links", () => {
  it("opens overall ranking when requested", () => {
    expect(rankingModeFromSearchParams(new URLSearchParams("mode=overall"))).toBe(
      "overall",
    );
  });

  it("defaults unknown or missing modes to category ranking", () => {
    expect(rankingModeFromSearchParams(new URLSearchParams())).toBe("category");
    expect(
      rankingModeFromSearchParams(new URLSearchParams("mode=something-else")),
    ).toBe("category");
  });
});
