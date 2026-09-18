import { describe, expect, it } from "vitest";
import { canonicalQuizSignalRef } from "./canonicalSignals";
import {
  dsQuestionIds,
  dsQuestions,
  legacyDsQuestionIds,
  legacyDsQuestions,
} from "./dsQuiz";

describe("Dominance & Submission v2 question bank", () => {
  it("keeps removed questions hidden but available as legacy definitions", () => {
    expect(dsQuestionIds).toHaveLength(20);
    expect(dsQuestionIds).not.toContain("ds-017");
    expect(dsQuestionIds).not.toContain("ds-018");
    expect(legacyDsQuestionIds).toEqual(["ds-017", "ds-018"]);
    expect(legacyDsQuestions.map((question) => question.id)).toEqual([
      "ds-017",
      "ds-018",
    ]);
  });

  it("uses the approved merged and rewritten question wording", () => {
    const byId = new Map(dsQuestions.map((question) => [question.id, question]));

    expect(byId.get("ds-003")?.prompt).toBe(
      "Deliberately handing over responsibility to someone I trust can make not having to decide feel freeing.",
    );
    expect(byId.get("ds-007")?.prompt).toBe(
      "Repeated rituals that mark or reaffirm a power dynamic can carry a lot of emotional meaning for me.",
    );
    expect(byId.get("ds-011")?.prompt).toBe(
      "Taking responsibility for setting direction when a willing partner wants me to lead can be deeply satisfying.",
    );
    expect(byId.get("ds-012")?.prompt).toBe(
      "Having a willing partner deliberately follow my direction can feel deeply rewarding.",
    );
    expect(byId.get("ds-013")?.prompt).toBe(
      "Creating clear, ongoing rules or expectations for a willing partner can be appealing to me.",
    );
    expect(byId.get("ds-014")?.prompt).toBe(
      "Even in a power dynamic, some important decisions need to remain mine unless I explicitly hand them over.",
    );
    expect(byId.get("ds-016")?.prompt).toBe(
      "Within agreed rules or direction, having meaningful room to choose how I carry them out matters to me.",
    );
  });

  it("removes the semantic leakage identified during review", () => {
    const byId = new Map(dsQuestions.map((question) => [question.id, question]));

    expect(byId.get("ds-001")?.weights.structure).toBeUndefined();
    expect(byId.get("ds-002")?.weights.structure).toBeUndefined();
    expect(byId.get("ds-004")?.weights.structure).toBeUndefined();
    expect(byId.get("ds-005")?.weights.praise_approval).toBeUndefined();
    expect(byId.get("ds-006")?.weights.obedience).toBeUndefined();
    expect(byId.get("ds-007")?.weights.ownership_symbolism).toBeUndefined();
    expect(byId.get("ds-008")?.weights.receiving_control).toBeUndefined();
  });

  it("adds direct reciprocal responsibility, service, ownership, and praise coverage", () => {
    const byId = new Map(dsQuestions.map((question) => [question.id, question]));

    expect(byId.get("ds-019")?.weights).toEqual({
      responsibility_holding: 1,
    });
    expect(byId.get("ds-020")?.weights).toEqual({ service: 1 });
    expect(byId.get("ds-021")?.weights).toEqual({ ownership_symbolism: 1 });
    expect(byId.get("ds-022")?.weights).toEqual({
      praise_approval: 1,
      devotion: 0.6,
    });
  });

  it("projects directional D/s concepts according to the concept perspective", () => {
    expect(canonicalQuizSignalRef("ds-003", "responsibility_transfer")).toEqual({
      signalId: "responsibility",
      channel: "giving",
    });
    expect(canonicalQuizSignalRef("ds-011", "responsibility_holding")).toEqual({
      signalId: "responsibility",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("ds-012", "obedience")).toEqual({
      signalId: "obedience",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("ds-020", "service")).toEqual({
      signalId: "service",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("ds-021", "ownership_symbolism")).toEqual({
      signalId: "ownership_symbolism",
      channel: "giving",
    });
    expect(canonicalQuizSignalRef("ds-022", "praise_approval")).toEqual({
      signalId: "praise_approval",
      channel: "giving",
    });
    expect(canonicalQuizSignalRef("ds-022", "devotion")).toEqual({
      signalId: "devotion",
      channel: "giving",
    });
  });

  it("keeps overall-only D/s concepts broad", () => {
    expect(canonicalQuizSignalRef("ds-007", "ritual_significance")).toEqual({
      signalId: "ritual_significance",
      channel: "overall",
    });
    expect(canonicalQuizSignalRef("ds-015", "ownership_symbolism")).toEqual({
      signalId: "ownership_symbolism",
      channel: "overall",
    });
    expect(canonicalQuizSignalRef("ds-016", "autonomy")).toEqual({
      signalId: "autonomy",
      channel: "overall",
    });
  });
});
