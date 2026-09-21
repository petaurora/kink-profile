import { describe, expect, it } from "vitest";
import { rankingRoute } from "../../app/routes";
import { shapeProfileStages } from "./shapeProfileGuide";

describe("Shape Your Profile guide", () => {
  it("keeps the recommended journey in the intended seven-step order", () => {
    expect(
      shapeProfileStages.flatMap((stage) =>
        stage.steps.map((step) => step.title),
      ),
    ).toEqual([
      "Complete quizzes",
      "Rank each category",
      "Rank overall",
      "Browse & define",
      "Review what fits",
      "Rank them",
      "Browse & define details",
    ]);
  });

  it("deep-links category and overall ranking into distinct modes", () => {
    const rankingSteps = shapeProfileStages[0].steps.slice(1);

    expect(rankingSteps.map((step) => step.path)).toEqual([
      `${rankingRoute.path}?mode=category`,
      `${rankingRoute.path}?mode=overall`,
    ]);
  });
});
