import { describe, expect, it } from "vitest";
import {
  rewardsBrowseViewFromSearchParams,
  rewardsRankingContextFromSearchParams,
} from "./RewardsCatalogRoute";

describe("Rewards catalog guide deep links", () => {
  it("opens the quick sorter for fit and detailed profiles for browse", () => {
    expect(
      rewardsBrowseViewFromSearchParams(new URLSearchParams("view=sorter")),
    ).toBe("sorter");
    expect(
      rewardsBrowseViewFromSearchParams(new URLSearchParams("view=details")),
    ).toBe("details");
  });

  it("opens reward and punishment ranking lanes independently", () => {
    expect(
      rewardsRankingContextFromSearchParams(
        new URLSearchParams("context=reward"),
      ),
    ).toBe("reward");
    expect(
      rewardsRankingContextFromSearchParams(
        new URLSearchParams("context=punishment"),
      ),
    ).toBe("punishment");
  });
});
