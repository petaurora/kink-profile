import { describe, expect, it } from "vitest";
import {
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
  rankingRoute,
} from "../../app/routes";
import { shapeProfileGroups } from "./shapeProfileGuide";

describe("Shape Your Profile guide", () => {
  it("matches the product workflow grouping and eight-step order", () => {
    expect(
      shapeProfileGroups.map((group) => ({
        label: group.label,
        steps: group.steps.map((step) => step.title),
      })),
    ).toEqual([
      { label: "Quiz", steps: ["Complete quizzes"] },
      { label: "Kink Rank", steps: ["Categories", "Overall"] },
      { label: "Kink Browse", steps: ["Browse & define"] },
      { label: "R/P Fit", steps: ["Sort fit"] },
      { label: "R/P Rank", steps: ["Rewards", "Punishments"] },
      { label: "R/P Browse", steps: ["Browse & define"] },
    ]);
  });

  it("deep-links both kink ranking lanes", () => {
    const kinkRank = shapeProfileGroups.find(
      (group) => group.id === "kink-rank",
    );

    expect(kinkRank?.steps.map((step) => step.path)).toEqual([
      `${rankingRoute.path}?mode=category`,
      `${rankingRoute.path}?mode=overall`,
    ]);
  });

  it("deep-links R/P fit, both ranking lanes, and detailed browse", () => {
    const fit = shapeProfileGroups.find((group) => group.id === "rp-fit");
    const rank = shapeProfileGroups.find((group) => group.id === "rp-rank");
    const browse = shapeProfileGroups.find((group) => group.id === "rp-browse");

    expect(fit?.steps[0].path).toBe(
      `${catalogRewardsRoute.path}?view=sorter`,
    );
    expect(rank?.steps.map((step) => step.path)).toEqual([
      `${catalogRewardsRankingRoute.path}?context=reward`,
      `${catalogRewardsRankingRoute.path}?context=punishment`,
    ]);
    expect(browse?.steps[0].path).toBe(
      `${catalogRewardsRoute.path}?view=details`,
    );
  });
});
