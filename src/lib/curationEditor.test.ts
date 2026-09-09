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
  it("provides a shared structured editor model for every runtime primitive", () => {
    const missing = curationInventory
      .filter((item) => buildCurationEditorModel(item) === null)
      .map((item) => `${item.entityType}:${item.entityId}`);

    expect(missing).toEqual([]);
  });

  it("covers every primitive type with the shared editor pipeline", () => {
    const types = new Set(curationInventory.map((item) => item.entityType));
    const modeledTypes = new Set(
      curationInventory
        .filter((item) => buildCurationEditorModel(item) !== null)
        .map((item) => item.entityType),
    );

    expect(modeledTypes).toEqual(types);
  });

  it("keeps editor field keys unique for every workbench primitive", () => {
    for (const item of curationInventory) {
      const model = buildCurationEditorModel(item);
      if (!model) continue;

      const keys = model.fields.map((field) => field.key);
      expect(
        new Set(keys).size,
        `duplicate editor field on ${item.entityType}:${item.entityId}`,
      ).toBe(keys.length);
    }
  });

  it("does not expose legacy catalog Primary Mode as editable free text", () => {
    const kink = entry("catalog-item", "rope-bondage");
    const model = buildCurationEditorModel(kink);
    if (!model) throw new Error("Missing kink editor model");

    expect(model.fields.some((field) => field.key === "primaryMode")).toBe(false);
  });

  it("renders the Pet role basics exactly once", () => {
    const pet = entry("role-headspace", "pet");
    const model = buildCurationEditorModel(pet);
    if (!model) throw new Error("Missing Pet editor model");

    expect(model.fields.map((field) => field.label)).toEqual([
      "Label",
      "Short label",
      "Description",
      "Signal composition",
    ]);
  });

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
