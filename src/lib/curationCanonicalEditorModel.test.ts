import { describe, expect, it } from "vitest";
import { curationInventory } from "../data/curationInventory";
import { canonicalSignalDefinitions } from "../data/canonicalSignals";
import {
  buildCurationEditorModel,
  createCurationDraft,
} from "./curationEditor";
import {
  buildCanonicalCurationChangeSet,
  canonicalizeCurationEditorModel,
  validateCanonicalCurationDraft,
} from "./curationCanonicalEditorModel";

function entry(type: string, id: string) {
  const found = curationInventory.find(
    (candidate) =>
      candidate.entityType === type && candidate.entityId === id,
  );
  if (!found) throw new Error(`Missing test entry ${type}:${id}`);
  return found;
}

function canonicalModel(type: string, id: string) {
  const item = entry(type, id);
  const model = canonicalizeCurationEditorModel(
    item,
    buildCurationEditorModel(item),
  );
  if (!model) throw new Error(`Missing canonical model ${type}:${id}`);
  return model;
}

describe("M16.2 canonical Workbench editor model", () => {
  it("replaces the legacy Signal picker universe on every Signal relation surface", () => {
    const cases = [
      ["catalog-item", "rope-bondage", "signalMappings"],
      ["catalog-category", "bondage-restraint", "signalMappings"],
      ["reward-punishment-category", "impact", "signalMappings"],
      ["quiz-question", "ds-001", "weights"],
      ["dynamic-mode", "power_exchange_mode", "weights"],
      ["role-headspace", "pet", "weights"],
      ["overall-facet", "power_exchange", "signals"],
    ] as const;

    for (const [type, id, key] of cases) {
      const model = canonicalModel(type, id);
      const field = model.fields.find(
        (candidate) =>
          candidate.kind === "weighted-relations" && candidate.key === key,
      );
      if (!field || field.kind !== "weighted-relations") {
        throw new Error(`Missing relation field ${type}:${id}:${key}`);
      }

      expect(field.options).toHaveLength(canonicalSignalDefinitions.length);
      expect(
        field.options.some(
          (option) => option.value === "receiving_control",
        ),
      ).toBe(false);
      expect(field.allowDirection).toBe(true);
    }
  });

  it("preserves quiz-specific channel semantics", () => {
    const model = canonicalModel("quiz-question", "ds-001");
    const weights = model.fields.find(
      (field) => field.kind === "weighted-relations" && field.key === "weights",
    );
    if (!weights || weights.kind !== "weighted-relations") {
      throw new Error("Missing quiz weights");
    }

    expect(
      weights.value.some(
        (relation) =>
          relation.id === "structure" && relation.channel === "receiving",
      ),
    ).toBe(true);
  });

  it("preserves canonical channel-aware Overall Facet references", () => {
    const model = canonicalModel("overall-facet", "service_devotion");
    const signals = model.fields.find(
      (field) => field.kind === "weighted-relations" && field.key === "signals",
    );
    if (!signals || signals.kind !== "weighted-relations") {
      throw new Error("Missing facet Signal relationships");
    }

    expect(
      signals.value.some(
        (relation) =>
          relation.id === "care" && relation.channel === "giving",
      ),
    ).toBe(true);
  });

  it("allows the same Signal concept in distinct channels", () => {
    const model = canonicalModel("overall-facet", "service_devotion");
    const draft = createCurationDraft(model);
    draft.signals = [
      { id: "care", channel: "receiving", weight: 0.5, relationship: "supports" },
      { id: "care", channel: "giving", weight: 0.75, relationship: "supports" },
    ];

    const errors = validateCanonicalCurationDraft(model, draft).errors;
    expect(errors.some((error) => error.includes("duplicate"))).toBe(false);
  });

  it("rejects channels that are not semantically supported", () => {
    const model = canonicalModel("quiz-question", "ds-001");
    const draft = createCurationDraft(model);
    draft.weights = [{ id: "autonomy", channel: "receiving", weight: 1 }];

    expect(
      validateCanonicalCurationDraft(model, draft).errors.some((error) =>
        error.includes("invalid channel"),
      ),
    ).toBe(true);
  });

  it("persists channel changes as part of the proposal", () => {
    const model = canonicalModel("quiz-question", "ds-001");
    const draft = createCurationDraft(model);
    const weights = draft.weights;
    if (!Array.isArray(weights)) throw new Error("Missing weights draft");

    const structure = weights.find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        item.id === "structure",
    );
    if (!structure || typeof structure !== "object" || !("id" in structure)) {
      throw new Error("Missing structure relation");
    }

    (structure as { channel?: string }).channel = "giving";

    expect(buildCanonicalCurationChangeSet(model, draft)).toHaveProperty(
      "weights",
    );
    expect(JSON.stringify(buildCanonicalCurationChangeSet(model, draft))).toContain(
      '"channel":"giving"',
    );
  });
});
