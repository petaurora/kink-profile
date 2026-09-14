import { describe, expect, it } from "vitest";
import {
  buildHubComposition,
  isHubQuizResumable,
} from "./hubComposition";

describe("Hub composition semantics", () => {
  it("keeps an unformed profile intentionally small even when optional flags are present", () => {
    expect(
      buildHubComposition({
        maturity: "unformed",
        hasResumableQuiz: true,
        hasLatestPreference: true,
        randomizerReady: true,
      }),
    ).toEqual({
      maturity: "unformed",
      modules: ["onboarding"],
      intentDoors: [],
    });
  });

  it("gives an emerging profile only truthful baseline modules when optional content is absent", () => {
    expect(
      buildHubComposition({
        maturity: "emerging",
        hasResumableQuiz: false,
        hasLatestPreference: false,
        randomizerReady: false,
      }),
    ).toEqual({
      maturity: "emerging",
      modules: ["reflection", "intent-doors"],
      intentDoors: ["profile", "catalog"],
    });
  });

  it("adds emerging optional modules only when they have eligible content", () => {
    expect(
      buildHubComposition({
        maturity: "emerging",
        hasResumableQuiz: true,
        hasLatestPreference: true,
        randomizerReady: true,
      }).modules,
    ).toEqual([
      "reflection",
      "quiz-resume",
      "latest-preference",
      "intent-doors",
      "randomizer",
    ]);
  });

  it("expands established exploration doors without inventing optional content", () => {
    const composition = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: false,
      hasLatestPreference: false,
      randomizerReady: false,
    });

    expect(composition.modules).toEqual(["reflection", "intent-doors"]);
    expect(composition.intentDoors).toEqual([
      "profile",
      "compare",
      "scene-builder",
      "catalog",
    ]);
  });

  it("only exposes the resume module for actual resumable work", () => {
    const withoutResume = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: false,
      hasLatestPreference: true,
      randomizerReady: true,
    });
    const withResume = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: true,
      hasLatestPreference: true,
      randomizerReady: true,
    });

    expect(withoutResume.modules).not.toContain("quiz-resume");
    expect(withResume.modules).toContain("quiz-resume");
  });

  it("treats only first attempts and retakes in progress as resumable", () => {
    expect(isHubQuizResumable("in-progress")).toBe(true);
    expect(isHubQuizResumable("retake-in-progress")).toBe(true);
    expect(isHubQuizResumable("not-started")).toBe(false);
    expect(isHubQuizResumable("complete")).toBe(false);
    expect(isHubQuizResumable("coming-soon")).toBe(false);
    expect(isHubQuizResumable("error")).toBe(false);
  });

  it("lets established dashboards vary as eligible content changes", () => {
    const sparse = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: false,
      hasLatestPreference: false,
      randomizerReady: false,
    });
    const active = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: true,
      hasLatestPreference: true,
      randomizerReady: true,
    });

    expect(active.modules.length).toBeGreaterThan(sparse.modules.length);
    expect(sparse.modules).not.toContain("randomizer");
    expect(active.modules).toContain("randomizer");
  });
});
