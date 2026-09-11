import { describe, expect, it } from "vitest";
import { curationInventory } from "../data/curationInventory";
import { validateCurationWorkspaceForExport } from "./curationExportValidation";
import {
  createEmptyCurationWorkspace,
  type CurationWorkspace,
} from "./curationWorkspace";

function firstEntry(entityType: (typeof curationInventory)[number]["entityType"]) {
  const entry = curationInventory.find(
    (candidate) => candidate.entityType === entityType,
  );
  if (!entry) throw new Error(`Missing ${entityType} fixture`);
  return entry;
}

describe("curation export validation", () => {
  it("accepts a normal reviewed workspace", () => {
    const signal = firstEntry("signal");
    const workspace: CurationWorkspace = {
      ...createEmptyCurationWorkspace(),
      changes: [
        {
          entityType: signal.entityType,
          entityId: signal.entityId,
          action: "keep",
          reviewedAt: "2026-09-11T00:00:00.000Z",
        },
      ],
    };

    expect(validateCurationWorkspaceForExport(workspace).errors).toEqual([]);
  });

  it("re-validates saved Modify proposals before export", () => {
    const quiz = firstEntry("quiz-definition");
    const workspace: CurationWorkspace = {
      ...createEmptyCurationWorkspace(),
      changes: [
        {
          entityType: quiz.entityType,
          entityId: quiz.entityId,
          action: "modify",
          changes: { title: "" },
          reviewedAt: "2026-09-11T00:00:00.000Z",
        },
      ],
    };

    expect(validateCurationWorkspaceForExport(workspace).errors).toContain(
      `${quiz.entityType}:${quiz.entityId}: Title cannot be empty.`,
    );
  });

  it("rejects stale or hand-edited proposal fields", () => {
    const quiz = firstEntry("quiz-definition");
    const workspace: CurationWorkspace = {
      ...createEmptyCurationWorkspace(),
      changes: [
        {
          entityType: quiz.entityType,
          entityId: quiz.entityId,
          action: "modify",
          changes: { definitelyNotAField: "nope" },
          reviewedAt: "2026-09-11T00:00:00.000Z",
        },
      ],
    };

    expect(validateCurationWorkspaceForExport(workspace).errors).toContain(
      `${quiz.entityType}:${quiz.entityId}: proposal contains unknown field "definitelyNotAField".`,
    );
  });

  it("requires merge targets to exist in the same primitive type", () => {
    const signal = firstEntry("signal");
    const workspace: CurationWorkspace = {
      ...createEmptyCurationWorkspace(),
      changes: [
        {
          entityType: signal.entityType,
          entityId: signal.entityId,
          action: "merge",
          replacementId: "definitely-not-a-real-signal",
          reviewedAt: "2026-09-11T00:00:00.000Z",
        },
      ],
    };

    expect(validateCurationWorkspaceForExport(workspace).errors).toContain(
      `${signal.entityType}:${signal.entityId}: replacement ID "definitely-not-a-real-signal" is not an existing signal.`,
    );
  });

  it("rejects catalog mapping weights the source format cannot represent", () => {
    const category = curationInventory.find(
      (entry) =>
        entry.entityType === "catalog-category" &&
        entry.entityId === "asymmetry-incompleteness-irritation",
    );
    if (!category) throw new Error("Missing asymmetry catalog category fixture");

    const workspace: CurationWorkspace = {
      ...createEmptyCurationWorkspace(),
      changes: [
        {
          entityType: category.entityType,
          entityId: category.entityId,
          action: "modify",
          changes: {
            signalMappings: [
              {
                id: "emotional_intensity",
                weight: 0.2,
                channel: "overall",
              },
            ],
          },
          reviewedAt: "2026-09-11T01:36:53.330Z",
        },
      ],
    };

    expect(validateCurationWorkspaceForExport(workspace).errors).toContain(
      'catalog-category:asymmetry-incompleteness-irritation: signalMappings weight for "emotional_intensity" must be 0.25, 0.50, 0.75, or 1.00 for the catalog source format.',
    );
  });
});
