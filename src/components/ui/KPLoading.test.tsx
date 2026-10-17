import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KPLoading } from "./KPLoading";

describe("KPLoading temporary SVG", () => {
  it("announces real loading context without exposing decorative SVG", () => {
    const html = renderToStaticMarkup(<KPLoading label="Loading results…" size={56} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading results…"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('viewBox="0 0 100 100"');
    expect(html).toContain('kp-loading-rotor');
    expect(html).toContain('Loading results…');
    expect(html).toContain('56px');
  });
  it("supports a compact, still-accessible small loading mark", () => {
    const html = renderToStaticMarkup(<KPLoading compact label="Loading a card…" size={8} />);
    expect(html).toContain("kp-loading-compact");
    expect(html).toContain('aria-label="Loading a card…"');
    expect(html).toContain("24px");
    expect(html).not.toContain("kp-loading-label");
  });
});
