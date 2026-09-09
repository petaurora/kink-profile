import { describe, expect, it } from "vitest";
import {
  buildCurationChangeSet,
  buildCurationEditorModel,
  createCurationDraft,
  getCurationConsequences,
  validateCurationDraft,
  validateMergeTarget,
} from "./curationEditor";
import { curationInventory } from "../data/curationInventory";

function entry(type: string, id?: string) {
  const found = curationInventory.find(
    (candidate) =>
      candidate.entityType === type && (!id || candidate.entityId === id),
  );
  if (!found) throw new Error(`Missing test entry ${type}:${id ?? "*"}`);
  return found;
}

describe("M16.2 structured curation editor", () => {
  it("builds an editable weighted-question model and starts unchanged", () => {
    const question = entry("quiz-question", "ds-001");
    const model = buildCurationEditorModel(question);

    expect(model).not.toBeNull();
    if (!model) return;

    const draft = createCurationDraft(model);
    expect(buildCurationChangeSet(model, draft)).toEqual({});
    expect(
      model.fields.some(
        (field) => field.kind === "weighted-relations" && field.key === "weights",
      ),
    ).toBe(true);
  });

  it("detects duplicate relationships and invalid weights", () => {
    const question = entry("quiz-question", "ds-001");
    const model = buildCurationEditorModel(question);
    if (!model) throw new Error("Missing model");

    const draft = createCurationDraft(model);
    draft.weights = [
      { id: "receiving_control", weight: 1 },
      { id: "receiving_control", weight: 1.2 },
    ];

    const validation = validateCurationDraft(model, draft);
    expect(validation.errors.some((error) => error.includes("duplicate"))).toBe(
      true,
    );
    expect(validation.errors.some((error) => error.includes("no more than 1"))).toBe(
      true,
    );
  });

  it("detects unknown relationship targets", () => {
    const facet = entry("overall-facet", "power_exchange");
    const model = buildCurationEditorModel(facet);
    if (!model) throw new Error("Missing model");

    const draft = createCurationDraft(model);
    draft.signals = [{ id: "not-a-signal", weight: 1 }];

    expect(
      validateCurationDraft(model, draft).errors.some((error) =>
        error.includes("unknown ID"),
      ),
    ).toBe(true);
  });

  it("exports only fields that differ from current repo values", () => {
    const signal = entry("signal", "service");
    const model = buildCurationEditorModel(signal);
    if (!model) throw new Error("Missing model");

    const draft = createCurationDraft(model);
    draft.label = "Service & Contribution";

    expect(buildCurationChangeSet(model, draft)).toEqual({
      label: "Service & Contribution",
    });
  });

  it("previews downstream consequences for scoring changes", () => {
    const question = entry("quiz-question", "ds-001");
    const consequences = getCurationConsequences(question, {
      weights: [{ id: "receiving_control", weight: 1 }],
    });

    expect(
      consequences.some((consequence) => consequence.includes("quiz version")),
    ).toBe(true);
  });

  it("requires merges to target an existing entity of the same primitive type", () => {
    const signal = entry("signal", "service");

    expect(validateMergeTarget(signal, "service")).not.toEqual([]);
    expect(validateMergeTarget(signal, "not-real")).not.toEqual([]);
    expect(validateMergeTarget(signal, "obedience")).toEqual([]);
  });
});
