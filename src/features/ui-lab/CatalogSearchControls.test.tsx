import { ToastProvider } from "../../components/ui/ToastProvider";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CatalogComposite } from "./CatalogComposite";

describe("Catalog collection search presentation", () => {
  it("offers grouping when the full collection contains multiple categories", () => {
    const markup = renderToStaticMarkup(<ToastProvider><CatalogComposite /></ToastProvider>);
    expect(markup).toContain('aria-label="Sort and group results"');
  });

  it("omits grouping for a single-subject collection", () => {
    const markup = renderToStaticMarkup(
      <ToastProvider><CatalogComposite subject="Power Exchange" /></ToastProvider>,
    );
    expect(markup).toContain('aria-label="Sort results"');
    expect(markup).not.toContain('aria-label="Sort and group results"');
  });

  it("keeps Rewards & Punishments classification filters independent", () => {
    const markup = renderToStaticMarkup(
      <ToastProvider><CatalogComposite collection="rewards" /></ToastProvider>,
    );
    expect(markup).toContain('aria-label="Reward and punishment filters"');
    expect(markup).toContain(">Reward<");
    expect(markup).toContain(">Punishment<");
    expect(markup).toContain(">Answers<");
  });
});
