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
import { signalDefinitions } from "../data/signals";
import { overallFacetDefinitions } from "../data/overallFacets";
import { rewardPunishmentCategories } from "./rewardPunishmentLibrary";

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

  it("shows every Overall Facet in the Signal theme matrix", () => {
    const praise = entry("signal", "praise_approval");
    const model = buildCurationEditorModel(praise);
    if (!model) throw new Error("Missing signal editor");

    const matrix = model.fields.find(
      (field) =>
        field.kind === "facet-matrix" &&
        field.key === "facetRelationships",
    );

    expect(matrix).toBeDefined();
    if (!matrix || matrix.kind !== "facet-matrix") return;

    expect(matrix.options).toHaveLength(overallFacetDefinitions.length);
    expect(matrix.value).toHaveLength(overallFacetDefinitions.length);
    expect(
      matrix.value.every((relationship) =>
        ["supports", "neutral", "opposes"].includes(
          relationship.relationship,
        ),
      ),
    ).toBe(true);
  });

  it("exposes the complete valid target universe for shared relation editors", () => {
    const signalTargetCases = [
      ["catalog-item", "rope-bondage", "signalMappings"],
      ["catalog-category", "bondage-restraint", "signalMappings"],
      ["reward-punishment-category", "impact", "signalMappings"],
      ["quiz-question", "ds-001", "weights"],
      ["dynamic-mode", "power_exchange_mode", "weights"],
      ["role-headspace", "pet", "weights"],
      ["overall-facet", "power_exchange", "signals"],
    ] as const;

    for (const [type, id, key] of signalTargetCases) {
      const model = buildCurationEditorModel(entry(type, id));
      if (!model) throw new Error(`Missing model ${type}:${id}`);

      const field = model.fields.find(
        (candidate) =>
          candidate.kind === "weighted-relations" && candidate.key === key,
      );
      if (!field || field.kind !== "weighted-relations") {
        throw new Error(`Missing relation field ${type}:${id}:${key}`);
      }

      expect(
        field.options.length,
        `${type}:${id} should expose every canonical Signal`,
      ).toBe(signalDefinitions.length);
    }

    const signalModel = buildCurationEditorModel(
      entry("signal", "praise_approval"),
    );
    if (!signalModel) throw new Error("Missing Signal model");
    const facetMatrix = signalModel.fields.find(
      (field) =>
        field.kind === "facet-matrix" &&
        field.key === "facetRelationships",
    );
    if (!facetMatrix || facetMatrix.kind !== "facet-matrix") {
      throw new Error("Missing Signal facet relationship matrix");
    }
    expect(facetMatrix.options.length).toBe(overallFacetDefinitions.length);
    expect(facetMatrix.value.length).toBe(overallFacetDefinitions.length);

    const actionModel = buildCurationEditorModel(
      entry("reward-punishment-action", "action-achievement-ceremony"),
    );
    if (!actionModel) throw new Error("Missing R/P action model");
    const contextCategories = actionModel.fields.find(
      (field) =>
        field.kind === "weighted-relations" &&
        field.key === "contextCategories",
    );
    if (!contextCategories || contextCategories.kind !== "weighted-relations") {
      throw new Error("Missing R/P action context category field");
    }
    expect(contextCategories.options.length).toBe(
      rewardPunishmentCategories.length,
    );
  });

  it("keeps Overall Facet editing theme-only with support/opposition semantics", () => {
    const model = buildCurationEditorModel(
      entry("overall-facet", "power_exchange"),
    );
    if (!model) throw new Error("Missing Overall Facet model");

    expect(model.fields.some((field) => field.key === "directional")).toBe(false);

    const signals = model.fields.find(
      (field) =>
        field.kind === "weighted-relations" && field.key === "signals",
    );
    if (!signals || signals.kind !== "weighted-relations") {
      throw new Error("Missing Overall Facet signal relationships");
    }

    expect(signals.allowDirection).toBeFalsy();
    expect(signals.allowRelationship).toBe(true);
  });

  it("exposes category semantic bridges as shared weighted-relation editors", () => {
    const catalogCategory = entry("catalog-category", "bondage-restraint");
    const catalogModel = buildCurationEditorModel(catalogCategory);
    if (!catalogModel) throw new Error("Missing catalog category editor");

    expect(
      catalogModel.fields.some(
        (field) =>
          field.kind === "weighted-relations" &&
          field.key === "signalMappings" &&
          field.allowDirection,
      ),
    ).toBe(true);

    const rpCategory = entry("reward-punishment-category", "impact");
    const rpModel = buildCurationEditorModel(rpCategory);
    if (!rpModel) throw new Error("Missing R/P category editor");

    expect(
      rpModel.fields.some(
        (field) =>
          field.kind === "weighted-relations" &&
          field.key === "signalMappings",
      ),
    ).toBe(true);
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
