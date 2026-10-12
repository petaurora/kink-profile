import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CatalogComposite } from "./CatalogComposite";
import { SearchChips, SearchFilterButton, SortGroupSheet } from "./CatalogSearchControls";

describe("shared search controls", () => {
  it("uses the same options trigger with a context-aware accessible name", () => {
    const grouped = renderToStaticMarkup(
      <SearchFilterButton onClick={() => {}} groupingAvailable />,
    );
    const sortOnly = renderToStaticMarkup(
      <SearchFilterButton onClick={() => {}} groupingAvailable={false} />,
    );

    expect(grouped).toContain('class="lab-search-filter-trigger"');
    expect(sortOnly).toContain('class="lab-search-filter-trigger"');
    expect(grouped).toContain('aria-label="Sort and group results"');
    expect(sortOnly).toContain('aria-label="Sort results"');
  });

  it("hides grouping in a sort-only sheet without hiding sorting", () => {
    const markup = renderToStaticMarkup(
      <SortGroupSheet
        open
        onClose={() => {}}
        sort="default"
        onSort={() => {}}
        showGrouping={false}
        defaultSortLabel="Best matches"
      />,
    );

    expect(markup).toContain("Sort by");
    expect(markup).toContain("Best matches");
    expect(markup).not.toContain("Group by");
    expect(markup).not.toContain("Group by Category");
  });

  it("presents grouping as a separate choice only when enabled", () => {
    const markup = renderToStaticMarkup(
      <SortGroupSheet
        open
        onClose={() => {}}
        sort="az"
        onSort={() => {}}
        group="category"
        onGroup={() => {}}
        showGrouping
      />,
    );

    expect(markup).toContain("Sort by");
    expect(markup).toContain("Group by");
    expect(markup).toContain(">Category<");
    expect(markup).toContain(">None<");
  });

  it("keeps classification filters in chips rather than the sort/group sheet", () => {
    const markup = renderToStaticMarkup(
      <SearchChips
        label="Result types"
        options={[
          { id: "all", label: "All", active: true, onClick: () => {} },
          { id: "items", label: "Items", active: false, onClick: () => {} },
        ]}
      />,
    );
    expect(markup).toContain('aria-label="Result types"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain("Group by");
  });
});

describe("Catalog collection search presentation", () => {
  it("offers grouping when the full collection contains multiple categories", () => {
    const markup = renderToStaticMarkup(<CatalogComposite />);
    expect(markup).toContain('aria-label="Sort and group results"');
  });

  it("omits grouping for a single-subject collection", () => {
    const markup = renderToStaticMarkup(
      <CatalogComposite subject="Power Exchange" />,
    );
    expect(markup).toContain('aria-label="Sort results"');
    expect(markup).not.toContain('aria-label="Sort and group results"');
  });

  it("keeps Rewards & Punishments classification filters independent", () => {
    const markup = renderToStaticMarkup(
      <CatalogComposite collection="rewards" />,
    );
    expect(markup).toContain('aria-label="Reward and punishment filters"');
    expect(markup).toContain(">Reward<");
    expect(markup).toContain(">Punishment<");
    expect(markup).toContain(">Answers<");
  });
});
