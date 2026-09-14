import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import packageMetadata from "../../../package.json";
import { BUILD_IDENTIFIER } from "../../lib/buildMetadata";
import { PROFILE_SCHEMA_VERSION } from "../../lib/profileStorage";
import { BuildDiagnostics } from "./BuildDiagnostics";

describe("BuildDiagnostics", () => {
  it("displays app, build, and persisted-data schema metadata", () => {
    const html = renderToStaticMarkup(<BuildDiagnostics />);

    expect(html).toContain(`App v${packageMetadata.version}`);
    expect(html).toContain(`data schema v${PROFILE_SCHEMA_VERSION}`);
    expect(html).toContain(`Build <code>${BUILD_IDENTIFIER}</code>`);
  });
});
