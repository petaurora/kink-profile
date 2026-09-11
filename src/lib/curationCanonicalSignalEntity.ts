import { canonicalSignalDefinitions } from "../data/canonicalSignals";
import type { CurationInventoryEntry } from "../data/curationInventory";
import { overallFacetDefinitions } from "../data/overallFacets";
import type { CurationFacetRelationship } from "./curationWorkspace";
import type { CurationEditorModel } from "./curationEditor";

/**
 * The runtime still keeps the old SignalId vocabulary for compatibility, but
 * the Workbench Signal primitive is the canonical concept itself. Build that
 * editor directly so legacy pseudo-signals never become editable entities.
 */
export function buildCanonicalSignalEntityModel(
  entry: CurationInventoryEntry,
): CurationEditorModel | null {
  if (entry.entityType !== "signal") return null;

  const signal = canonicalSignalDefinitions.find(
    (candidate) => candidate.id === entry.entityId,
  );
  if (!signal) return null;

  const facetRelationships: CurationFacetRelationship[] =
    overallFacetDefinitions.map((facet) => {
      const mappings = facet.signals.filter(
        (mapping) => mapping.signalId === signal.id,
      );
      const primary =
        mappings.find((mapping) => (mapping.channel ?? "overall") === "overall") ??
        mappings[0];

      return {
        id: facet.id,
        relationship:
          primary?.relationship ?? (primary ? "supports" : "neutral"),
        weight: primary?.weight ?? 1,
      };
    });

  return {
    fields: [
      {
        kind: "text",
        key: "label",
        label: "Label",
        value: signal.label,
        required: true,
      },
      {
        kind: "text",
        key: "shortLabel",
        label: "Short label",
        value: signal.shortLabel,
        required: true,
      },
      {
        kind: "textarea",
        key: "description",
        label: "Description",
        value: signal.description,
        required: true,
      },
      {
        kind: "facet-matrix",
        key: "facetRelationships",
        label: "Overall Facet relationships",
        value: facetRelationships,
        options: overallFacetDefinitions.map((facet) => ({
          value: facet.id,
          label: facet.label,
        })),
        helper:
          "This is the concept-level Signal → Overall Facet view. Channel-specific facet relationships are authored from the Overall Facet primitive so receiving/giving nuance is not flattened here.",
      },
    ],
  };
}
