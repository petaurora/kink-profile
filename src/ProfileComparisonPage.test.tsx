import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfileComparisonPage } from "./ProfileComparisonPage";

describe("ProfileComparisonPage", () => {
  it("presents upload as a non-destructive temporary comparison", () => {
    const html = renderToStaticMarkup(
      <ProfileComparisonPage
        current={{
          displayName: "Jackie",
          profile: {
            schemaVersion: 2,
            quizzes: {},
          },
          catalogProfile: {
            schemaVersion: 1,
            preferences: {},
            comparisons: [],
          },
        }}
        onClose={() => undefined}
      />,
    );

    expect(html).toContain("Compare profiles.");
    expect(html).toContain("Jackie");
    expect(html).toContain("Upload profile JSON");
    expect(html).toContain(
      "Your profile will not be replaced or modified.",
    );
    expect(html).toContain("This is not an import.");
    expect(html).toContain("The file is processed locally");
    expect(html).toContain('aria-describedby="comparison-upload-safety"');
  });
});
