import { test, expect } from "./fixtures";
import { auditAccessibility, tabTo } from "./accessibility";

const pages = [
  ["Home", "/ui-lab/home", "Continue"],
  ["Catalog", "/ui-lab/catalog", "Browse collections"],
  ["Catalog Items", "/ui-lab/catalog/all", "Collars"],
  ["Rewards and Punishments", "/ui-lab/catalog/rewards-punishments", "classifications are currently read-only"],
  ["Profile", "/ui-lab/profile", "Your profile"],
  ["Discover", "/ui-lab/discover", "Reflect on your interests"],
  ["Education", "/ui-lab/learn", "Collars & Collaring"],
  ["Quizzes", "/ui-lab/quizzes", "Bondage & Discipline"],
  ["Quiz questions", "/ui-lab/quizzes/question?id=dominance-submission", "Question 1 ·"],
  ["Settings", "/settings", "Profile name"],
  ["Comparison", "/compare", "Upload profile JSON"],
  ["Scene Builder", "/scene-builder", "Choose one or more themes"],
  ["Recipes", "/tools/rewards/recipes", "Build a reward"],
  ["Randomizer", "/tools/rewards/randomizer", "Pick a reward"],
  ["Ranking", "/catalog/kinks/rank", "Tap to start"],
] as const;

for (const [name, route, readyText] of pages) {
  test(`${name}: rendered WCAG A/AA scan`, { tag: "@a11y" }, async ({ app, page }, testInfo) => {
    await app.open(route);
    await expect(page.getByText(readyText, { exact: false }).first()).toBeVisible();
    await auditAccessibility(page, testInfo, name.toLowerCase().replaceAll(" ", "-"));
    if (name === "Home" || name === "Quizzes") {
      await testInfo.attach(`rendered-${name.toLowerCase()}`, { body: await page.screenshot(), contentType: "image/png" });
    }
  });
}

test("card descriptions keep their full click area and separate accessible description", { tag: "@a11y" }, async ({ app, page, isMobile }) => {
  async function activateDescription(description: ReturnType<typeof page.getByText>) {
    await description.scrollIntoViewIfNeeded();
    const box = await description.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2, y = box!.y + box!.height / 2;
    if (isMobile) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
  }
  await app.open();
  const profile = page.getByRole("button", { name: "Your profile at a glance", exact: true });
  await expect(profile).toHaveAccessibleDescription("No preferences or experience recorded in this Lab session.");
  await activateDescription(page.getByText("No preferences or experience recorded in this Lab session.", { exact: true }));
  await expect(page).toHaveURL(/#\/ui-lab\/profile$/);
  await app.menu("Discover");
  const ambient = page.locator(".lab-serendipity-card-main");
  await expect(ambient).toHaveAccessibleDescription(/Editorial discovery · Not personalized/);
  await activateDescription(page.locator(".lab-serendipity-card-description"));
  await expect(page.locator(".lab-serendipity-preview")).toBeVisible();
  await app.menu("Discover", "Overview");
  await activateDescription(page.getByText("Guided questions about dynamics, roles, restraint, and intensity.", { exact: true }));
  await expect(page).toHaveURL(/#\/ui-lab\/quizzes$/);
  const first = page.getByRole("region", { name: "Quiz selection", exact: true }).getByRole("button").first();
  expect(await first.getAttribute("aria-describedby")).toBeTruthy();
  await activateDescription(page.locator(".lab-quiz-card-description").first());
  await expect(page.getByRole("heading", { level: 2, name: /^Question 1 of/ })).toBeFocused();
});

// The active app preset, rather than OS preference, owns both UI generations.
for (const preset of ["Dusty Rose", "Oxblood", "Crimson Depths", "INFJ"]) {
  for (const [name, route, readyText] of pages.filter(([, route]) => !route.startsWith("/ui-lab/"))) {
    test(`${name}: ${preset} rendered WCAG A/AA scan`, { tag: "@a11y" }, async ({ app, page }, testInfo) => {
      await app.open("/settings");
      await page.getByRole("radio", { name: new RegExp(preset) }).check();
      await app.open(route);
      await expect(page.getByText(readyText, { exact: false }).first()).toBeVisible();
      await auditAccessibility(page, testInfo, `${preset.toLowerCase().replaceAll(" ", "-")}-${name.toLowerCase().replaceAll(" ", "-")}`);
    });
  }
}

test("keyboard skip link, drawer wrapping and focus restoration", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  await app.open();
  const skip = page.getByRole("link", { name: "Skip to content", exact: true });
  await tabTo(page, skip);
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  const trigger = page.getByRole("button", { name: "Open full menu", exact: true });
  await tabTo(page, trigger);
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: "Full navigation menu", exact: true });
  await auditAccessibility(page, testInfo, "navigation-drawer");
  const first = menu.getByRole("button").first();
  const last = menu.getByRole("button").last();
  await tabTo(page, last);
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("keyboard global search and nested refinement return through each layer", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  await app.open();
  const trigger = page.getByRole("button", { name: "Search", exact: true });
  await tabTo(page, trigger);
  await page.keyboard.press("Enter");
  const search = page.getByRole("dialog", { name: "Global catalog search", exact: true });
  const query = search.getByRole("searchbox", { name: "Search catalog", exact: true });
  await expect(query).toBeFocused();
  await auditAccessibility(page, testInfo, "search-empty");
  await page.keyboard.type("Leather");
  await tabTo(page, search.getByRole("button", { name: "Modifiers", exact: true }));
  await page.keyboard.press("Space");
  const result = search.getByRole("button", { name: /^Leather Collars/ });
  await expect(result).toBeVisible();
  await auditAccessibility(page, testInfo, "search-modifier-results");
  await tabTo(page, result);
  await page.keyboard.press("Enter");
  const refine = page.getByRole("dialog", { name: "Refine Collars", exact: true });
  const leather = refine.getByRole("button", { name: "Leather: Not rated. Change rating", exact: true });
  await expect(leather).toBeFocused();
  await page.keyboard.press("Enter");
  await auditAccessibility(page, testInfo, "nested-modifier-rating");
  await page.keyboard.press("Escape");
  await expect(leather).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(refine).toBeHidden();
  await expect(query).toHaveValue("Leather");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("rating guidance, classification filters and failed-save recovery stay accessible", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  test.setTimeout(120_000);
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("checkbox", { name: "Test save failure", exact: true }).check();
  await page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "What do these ratings mean?", exact: true }).click();
  await auditAccessibility(page, testInfo, "rating-guidance");
  await page.getByRole("button", { name: "Curious", exact: true }).click();
  const retry = page.getByRole("button", { name: "Retry saving Collars overall", exact: true });
  await expect(retry).toBeVisible();
  await auditAccessibility(page, testInfo, "failed-rating-save");
  await tabTo(page, retry);
  await page.keyboard.press("Enter");
  const rating = page.getByRole("button", { name: "Collars overall: Curious. Change rating", exact: true });
  await expect(rating).toBeFocused();
  await expect(retry).toBeHidden();
  await page.getByRole("button", { name: /^Refine Collars(?:\.|$)/ }).click();
  const refine = page.getByRole("dialog", { name: "Refine Collars", exact: true });
  await refine.getByRole("button", { name: /^About experience/ }).click();
  await auditAccessibility(page, testInfo, "refinement-experience-guidance");
  await page.keyboard.press("Escape");
  await app.menu("Catalog", "Rewards & Punishments");
  await page.getByRole("button", { name: "Answers", exact: true }).click();
  await auditAccessibility(page, testInfo, "classification-answer-filter");
});

test("reflection notes and deletion confirmation expose names and keyboard recovery", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  await app.open("/ui-lab/discover");
  await page.getByRole("button", { name: "Open Reflect on your interests", exact: true }).click();
  await page.getByRole("textbox").fill("Synthetic accessibility reflection");
  await auditAccessibility(page, testInfo, "reflection-note");
  await page.getByRole("button", { name: "Exit reflection", exact: true }).click();
  const remove = page.getByRole("button", { name: /^Delete activity / });
  await tabTo(page, remove);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Delete saved activity?", exact: true });
  await auditAccessibility(page, testInfo, "activity-delete-confirmation");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(remove).toBeFocused();
});

test("settings validation, rejected import and reset review retain accessible feedback", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  await app.open("/settings");
  await page.getByRole("textbox", { name: "Profile name", exact: true }).fill(" ");
  await expect(page.getByRole("alert")).toContainText("Profile name cannot be blank");
  await auditAccessibility(page, testInfo, "invalid-profile-name");
  await page.getByRole("button", { name: "Choose backup", exact: true }).click();
  await page.getByLabel("Choose backup file", { exact: true }).setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  await expect(page.getByRole("region", { name: "Choose a profile backup.", exact: true }).getByRole("alert")).toBeVisible();
  await auditAccessibility(page, testInfo, "rejected-backup-import");
  await page.getByRole("button", { name: "Choose data", exact: true }).click();
  await page.getByRole("button", { name: "Select all", exact: true }).click();
  await page.getByRole("button", { name: "Review reset", exact: true }).click();
  await auditAccessibility(page, testInfo, "selective-reset-review");
});

test("quiz answers and save-exit work by keyboard at the active viewport", { tag: "@a11y" }, async ({ app, page, isMobile }, testInfo) => {
  await app.open("/ui-lab/quizzes/question?id=dominance-submission");
  const answer = page.getByRole("group", { name: "Answer question 1", exact: true }).getByRole("button", { name: /Absolutely/ });
  await tabTo(page, answer);
  await page.keyboard.press("Space");
  if (isMobile) await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
  else await expect(answer).toHaveAttribute("aria-pressed", "true");
  await auditAccessibility(page, testInfo, "quiz-keyboard-answer-saved");
  const exit = page.getByRole("button", { name: "Save & exit", exact: true });
  await tabTo(page, exit);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Explore quizzes.", exact: true })).toBeFocused();
  await auditAccessibility(page, testInfo, "quiz-keyboard-save-exit");
});

test("320px reduced-motion text reflow keeps quiz controls reachable", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await app.open("/ui-lab/quizzes/question?id=dominance-submission");
  // A user stylesheet tests text enlargement/spacing. Actual browser zoom and
  // OS font scaling still require the separate physical-device checklist.
  const heading = page.getByRole("heading", { level: 2, name: /^Question 1 of/ });
  const originalSize = await heading.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  await page.evaluate(() => {
    // Snapshot first so inherited sizes do not compound; root-only scaling
    // would leave the app's explicit pixel-sized text unchanged.
    const sizes = [...document.querySelectorAll("body, body *")]
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .map(node => ({ node, size: parseFloat(getComputedStyle(node).fontSize) }));
    for (const { node, size } of sizes) node.style.setProperty("font-size", `${size * 2}px`, "important");
  });
  await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-bottom: 2em !important }" });
  await expect(heading).toHaveCSS("font-size", `${originalSize * 2}px`);
  await auditAccessibility(page, testInfo, "quiz-320px-enlarged-text-reduced-motion");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const first = page.getByRole("group", { name: "Answer question 1", exact: true }).getByRole("button", { name: /Nope/ });
  await tabTo(page, first);
  await expect(first).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
  await tabTo(page, page.getByRole("button", { name: "Save & exit", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Quiz selection", exact: true })).toBeVisible();
});
