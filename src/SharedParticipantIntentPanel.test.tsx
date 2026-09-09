import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SharedParticipantIntentPanel } from "./SharedParticipantIntentPanel";

describe("SharedParticipantIntentPanel", () => {
  it("explains that current choices do not change either permanent profile", () => {
    const html = renderToStaticMarkup(
      <SharedParticipantIntentPanel
        profileAName="Jackie"
        profileBName="Taylor"
        profileAIntent={{ selectedConcepts: [] }}
        profileBIntent={{ selectedConcepts: [] }}
        onProfileAIntentChange={() => undefined}
        onProfileBIntentChange={() => undefined}
      />,
    );

    expect(html).toContain("What do you each want to bring tonight?");
    expect(html).toContain("Jackie");
    expect(html).toContain("Taylor");
    expect(html).toContain(
      "They do not change either permanent profile",
    );
    expect(html).toContain("Headspace / role");
    expect(html).toContain("Dynamic mode");
    expect(html).toContain("Activity side");
  });

  it("shows a validated current pairing when both people select complementary intent", () => {
    const html = renderToStaticMarkup(
      <SharedParticipantIntentPanel
        profileAName="Jackie"
        profileBName="Taylor"
        profileAIntent={{
          selectedConcepts: [
            { kind: "headspace", id: "prey" },
          ],
        }}
        profileBIntent={{
          selectedConcepts: [
            { kind: "headspace", id: "predator" },
          ],
        }}
        onProfileAIntentChange={() => undefined}
        onProfileBIntentChange={() => undefined}
      />,
    );

    expect(html).toContain("Tonight&#x27;s pairings");
    expect(html).toContain("Prey");
    expect(html).toContain("Predator");
    expect(html).toContain("without assigning D/s authority");
  });

  it("labels unrelated choices as non-paired rather than a mismatch", () => {
    const html = renderToStaticMarkup(
      <SharedParticipantIntentPanel
        profileAName="A"
        profileBName="B"
        profileAIntent={{
          selectedConcepts: [
            { kind: "headspace", id: "prey" },
          ],
        }}
        profileBIntent={{
          selectedConcepts: [
            { kind: "headspace", id: "pet" },
          ],
        }}
        onProfileAIntentChange={() => undefined}
        onProfileBIntentChange={() => undefined}
      />,
    );

    expect(html).toContain(
      "That is not a mismatch",
    );
  });
});
