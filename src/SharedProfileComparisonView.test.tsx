import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SharedProfileComparisonView } from "./SharedProfileComparisonView";
import type {
  SharedCatalogItemComparison,
  SharedItemState,
  SharedProfileComparison,
} from "./lib/sharedProfileComparison";

function catalogItem(
  catalogId: string,
  label: string,
  state: SharedItemState,
  explanation = "Why this belongs here.",
): SharedCatalogItemComparison {
  return {
    catalogId,
    label,
    categoryId: "test",
    state,
    profileA: { meaningfulPairwiseComparisons: 0 },
    profileB: { meaningfulPairwiseComparisons: 0 },
    explanation,
  };
}

function model(): SharedProfileComparison {
  const mutual = catalogItem("mutual", "Mutual Item", "mutual_positive");
  const complementary = catalogItem(
    "complement",
    "Complementary Item",
    "complementary",
  );
  const curious = catalogItem("curious", "Curious Item", "mutual_curious");
  const mixed = catalogItem(
    "mixed",
    "One Likes One Curious",
    "one_positive_one_curious",
  );
  const different = catalogItem(
    "different",
    "Different Context",
    "different_context",
  );
  const excluded = catalogItem("excluded", "Excluded Item", "excluded");
  const unknown = catalogItem("unknown", "Unknown Item", "unknown");

  return {
    catalogItems: [
      mutual,
      complementary,
      curious,
      mixed,
      different,
      excluded,
      unknown,
    ],
    catalogByState: {
      mutual_positive: [mutual],
      complementary: [complementary],
      mutual_curious: [curious],
      one_positive_one_curious: [mixed],
      different_context: [different],
      excluded: [excluded],
      unknown: [unknown],
    },
    semanticComplements: [
      {
        mappingId: "headspace-predator-prey",
        relationshipKind: "headspace_complement",
        authoritySemantics: "contextual_role",
        strength: 1,
        fitScore: 70,
        profileA: {
          concept: { kind: "headspace", id: "predator" },
          label: "Predator",
          affinity: 90,
          coverage: 80,
          source: "headspace",
        },
        profileB: {
          concept: { kind: "headspace", id: "prey" },
          label: "Prey",
          affinity: 88,
          coverage: 80,
          source: "headspace",
        },
        explanation:
          "Predator and Prey can form a complementary pursuit headspace without assigning D/s authority.",
      },
    ],
  };
}

describe("SharedProfileComparisonView", () => {
  it("renders the scoped comparison sections and both profile names", () => {
    const html = renderToStaticMarkup(
      <SharedProfileComparisonView
        model={model()}
        profileAName="Jackie"
        profileBName="Taylor"
      />,
    );

    expect(html).toContain("Jackie");
    expect(html).toContain("Taylor");
    expect(html).toContain("We both love");
    expect(html).toContain("We fit together here");
    expect(html).toContain("Maybe explore");
    expect(html).toContain("Different flavors");
    expect(html).toContain("Not for shared suggestions");
    expect(html).toContain("Still unexplored");
  });

  it("shows semantic complements as profile-to-profile patterns", () => {
    const html = renderToStaticMarkup(
      <SharedProfileComparisonView
        model={model()}
        profileAName="A"
        profileBName="B"
      />,
    );

    expect(html).toContain("Predator");
    expect(html).toContain("Prey");
    expect(html).toContain(
      "without assigning D/s authority",
    );
  });

  it("keeps unknown data separate from exclusions", () => {
    const html = renderToStaticMarkup(
      <SharedProfileComparisonView
        model={model()}
        profileAName="A"
        profileBName="B"
      />,
    );

    const excludedIndex = html.indexOf("Not for shared suggestions");
    const unknownIndex = html.indexOf("Still unexplored");

    expect(excludedIndex).toBeGreaterThan(-1);
    expect(unknownIndex).toBeGreaterThan(excludedIndex);
    expect(html).toContain(
      "Unknown means there is not enough direct evidence yet",
    );
  });

  it("does not present a synthetic compatibility percentage", () => {
    const html = renderToStaticMarkup(
      <SharedProfileComparisonView
        model={model()}
        profileAName="A"
        profileBName="B"
      />,
    );

    expect(html.toLowerCase()).not.toContain("compatibility");
    expect(html).not.toContain("70%");
  });
});
