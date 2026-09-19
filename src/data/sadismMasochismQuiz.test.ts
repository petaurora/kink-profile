import { describe, expect, it } from "vitest";
import { canonicalQuizSignalRef } from "./canonicalSignals";
import {
  legacySadismMasochismQuestionIds,
  legacySadismMasochismQuestions,
  sadismMasochismQuestionIds,
  sadismMasochismQuestions,
} from "./sadismMasochismQuiz";

describe("Sadism & Masochism v2 question bank", () => {
  it("keeps the approved 14-question active bank and hides retired v1 questions", () => {
    expect(sadismMasochismQuestionIds).toHaveLength(14);

    for (const retiredId of [
      "sm-004",
      "sm-006",
      "sm-008",
      "sm-009",
      "sm-010",
      "sm-011",
      "sm-012",
      "sm-016",
      "sm-018",
      "sm-020",
      "sm-021",
      "sm-022",
      "sm-023",
      "sm-024",
    ]) {
      expect(sadismMasochismQuestionIds).not.toContain(retiredId);
    }

    expect(legacySadismMasochismQuestionIds).toEqual([
      "sm-004",
      "sm-006",
      "sm-008",
      "sm-009",
      "sm-010",
      "sm-011",
      "sm-012",
      "sm-016",
      "sm-018",
      "sm-020",
      "sm-021",
      "sm-022",
      "sm-023",
      "sm-024",
    ]);

    expect(legacySadismMasochismQuestions).toHaveLength(14);
  });

  it("uses the approved rewritten endurance wording", () => {
    const byId = new Map(
      sadismMasochismQuestions.map((question) => [question.id, question]),
    );

    expect(byId.get("sm-005")?.prompt).toBe(
      "Remaining in an intense physical experience for a sustained period can feel rewarding in its own right.",
    );
    expect(byId.get("sm-017")?.prompt).toBe(
      "Sustaining an intense physical experience for a willing partner over time can feel rewarding in its own right.",
    );
  });

  it("removes reviewed secondary-weight leakage from the active bank", () => {
    const byId = new Map(
      sadismMasochismQuestions.map((question) => [question.id, question]),
    );

    expect(byId.get("sm-002")?.weights).toEqual({ pain_receiving: 1 });
    expect(byId.get("sm-003")?.weights).toEqual({ receiving_intensity: 1 });
    expect(byId.get("sm-005")?.weights).toEqual({ receiving_endurance: 1 });
    expect(byId.get("sm-007")?.weights).toEqual({ receiving_challenge: 1 });
    expect(byId.get("sm-014")?.weights).toEqual({ pain_giving: 1 });
    expect(byId.get("sm-015")?.weights).toEqual({ giving_intensity: 1 });
    expect(byId.get("sm-017")?.weights).toEqual({ giving_endurance: 1 });
    expect(byId.get("sm-019")?.weights).toEqual({ giving_challenge: 1 });
    expect(byId.get("sm-025")?.weights).toEqual({ anticipation: 1 });
    expect(byId.get("sm-026")?.weights).toEqual({ emotional_intensity: 1 });
  });

  it("adds direct psychological pain coverage in both directions", () => {
    const byId = new Map(
      sadismMasochismQuestions.map((question) => [question.id, question]),
    );

    expect(byId.get("sm-027")?.weights).toEqual({
      psychological_pain_receiving: 1,
    });
    expect(byId.get("sm-028")?.weights).toEqual({
      psychological_pain_giving: 1,
    });

    expect(
      canonicalQuizSignalRef("sm-027", "psychological_pain_receiving"),
    ).toEqual({
      signalId: "psychological_pain",
      channel: "receiving",
    });
    expect(
      canonicalQuizSignalRef("sm-028", "psychological_pain_giving"),
    ).toEqual({
      signalId: "psychological_pain",
      channel: "giving",
    });
  });

  it("keeps anticipation and emotional intensity overall-only", () => {
    expect(canonicalQuizSignalRef("sm-025", "anticipation")).toEqual({
      signalId: "anticipation",
      channel: "overall",
    });
    expect(canonicalQuizSignalRef("sm-026", "emotional_intensity")).toEqual({
      signalId: "emotional_intensity",
      channel: "overall",
    });
  });
});
