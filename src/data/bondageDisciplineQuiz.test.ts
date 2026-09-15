import { describe, expect, it } from "vitest";
import {
  bondageDisciplineQuestionIds,
  bondageDisciplineQuestions,
  legacyBondageDisciplineQuestionIds,
  legacyBondageDisciplineQuestions,
} from "./bondageDisciplineQuiz";

describe("Bondage & Discipline v2 question bank", () => {
  it("keeps removed questions hidden but available as legacy definitions", () => {
    expect(bondageDisciplineQuestionIds).toHaveLength(27);
    expect(bondageDisciplineQuestionIds).not.toContain("bd-007");
    expect(bondageDisciplineQuestionIds).not.toContain("bd-018");
    expect(legacyBondageDisciplineQuestionIds).toEqual(["bd-007", "bd-018"]);

    expect(
      legacyBondageDisciplineQuestions.map((question) => question.id),
    ).toEqual(["bd-007", "bd-018"]);
  });

  it("uses the approved merged and rewritten question wording", () => {
    const byId = new Map(
      bondageDisciplineQuestions.map((question) => [question.id, question]),
    );

    expect(byId.get("bd-005")?.prompt).toBe(
      "Part of the appeal of restraint can be surrendering control of my movement to someone I trust.",
    );
    expect(byId.get("bd-006")?.prompt).toBe(
      "Testing or struggling against agreed restraint—including trying to get free—can make the experience more exciting for me.",
    );
    expect(byId.get("bd-020")?.prompt).toBe(
      "Helping a willing partner correct their behavior toward an agreed expectation can feel meaningful even when no consequence is needed.",
    );
    expect(byId.get("bd-024")?.prompt).toBe(
      "Knowing in advance that a consequence or correction is coming can build appealing anticipation.",
    );
  });

  it("removes the semantic leakage identified during review", () => {
    const byId = new Map(
      bondageDisciplineQuestions.map((question) => [question.id, question]),
    );

    expect(byId.get("bd-006")?.weights.playful_resistance).toBeUndefined();
    expect(byId.get("bd-012")?.weights.guidance_shaping).toBeUndefined();
    expect(byId.get("bd-020")?.weights.giving_discipline).toBeUndefined();
    expect(byId.get("bd-024")?.weights.ritual_significance).toBeUndefined();
    expect(byId.get("bd-024")?.weights.accountability).toBeUndefined();
  });

  it("adds responsibility, sensory-control, and aesthetic-form coverage", () => {
    const byId = new Map(
      bondageDisciplineQuestions.map((question) => [question.id, question]),
    );

    expect(byId.get("bd-027")?.weights).toMatchObject({
      responsibility_holding: 1,
      giving_restraint: 0.4,
      giving_constraint_control: 0.2,
    });
    expect(byId.get("bd-028")?.weights).toMatchObject({
      receiving_constraint_control: 1,
      receiving_control: 0.4,
    });
    expect(byId.get("bd-029")?.weights).toMatchObject({
      ritual_significance: 1,
      receiving_positioning: 0.6,
      receiving_restraint: 0.2,
    });
  });
});
