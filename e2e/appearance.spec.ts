import { auditAccessibility } from "./accessibility";
import { test, expect } from "./fixtures";

const preferenceKey = "kink-profile:preview:pr-0:kink-profile:appearance";
const presets = [
  { name: "Dusty Rose", id: "dusty-rose", scheme: "light", chrome: "#f4e9e8" },
  { name: "Oxblood", id: "oxblood", scheme: "dark", chrome: "#170e13" },
  { name: "Midnight", id: "midnight", scheme: "dark", chrome: "#0b0c25" },
];

test("theme choices persist across reload and both UI generations without changing saved profile data", async ({ app, page }) => {
  await app.saveQuizDraft();
  const original = await app.profile();
  await app.open("/settings");
  for (const preset of presets) {
    const radio = page.getByRole("radio", { name: new RegExp(preset.name) });
    await radio.check();
    await expect(radio).toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-theme", preset.id);
    await page.emulateMedia({ colorScheme: preset.scheme === "light" ? "dark" : "light" });
    await page.reload(); await app.continuePreview();
    await expect(page.getByRole("radio", { name: new RegExp(preset.name) })).toBeChecked();
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", preset.chrome);
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", preset.scheme);
    await app.open("/ui-lab/home");
    await expect(page.locator("html")).toHaveAttribute("data-theme", preset.id);
    expect(await app.profile()).toEqual(original);
    await app.open("/settings");
  }
});

test("theme selection supports keyboard arrows in V2 Settings", async ({ app, page }) => {
  await app.open("/ui-lab/settings");
  const midnight = page.getByRole("radio", { name: /Midnight/ });
  await midnight.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /Dusty Rose/ })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /Oxblood/ })).toBeFocused();
  await expect(page.getByRole("radio", { name: /Oxblood/ })).toBeChecked();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(midnight).toBeChecked();
});

test("invalid preview preference defaults safely and never reads production appearance", async ({ app, page }) => {
  await page.addInitScript(({ key }) => {
    localStorage.setItem("kink-profile:appearance", "oxblood");
    localStorage.setItem(key, "unknown-theme");
  }, { key: preferenceKey });
  await app.open("/ui-lab/settings");
  await expect(page.getByRole("radio", { name: /Midnight/ })).toBeChecked();
  await page.getByRole("radio", { name: /Dusty Rose/ }).check();
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)))).toMatchObject({
    "kink-profile:appearance": "oxblood", [preferenceKey]: "dusty-rose",
  });
});

test("saved palette is applied by the HTML head before the application bundle runs", async ({ page }) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, "dusty-rose"), { key: preferenceKey });
  await page.route("**/assets/*.js", route => route.abort());
  await page.goto("./#/ui-lab/settings");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dusty-rose");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f4e9e8");
  expect(await page.locator("html").evaluate(element => getComputedStyle(element).colorScheme)).toBe("light");
  await expect(page.locator("#root")).toBeEmpty();
});

test("blocked appearance storage preserves the choice through navigation and explains that it was not saved", async ({ app, page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function(key) { if (key.endsWith("kink-profile:appearance")) throw new Error("Blocked"); return get.call(this, key); };
    Storage.prototype.setItem = function(key, value) { if (key.endsWith("kink-profile:appearance")) throw new Error("Blocked"); return set.call(this, key, value); };
  });
  await app.open("/ui-lab/settings");
  await expect(page.getByRole("radio", { name: /Midnight/ })).toBeChecked();
  await page.getByRole("radio", { name: /Oxblood/ }).check();
  await expect(page.getByRole("status").filter({ hasText: "Theme applied for this visit" })).toBeVisible();
  await app.open("/ui-lab/home");
  await app.open("/settings");
  await expect(page.getByRole("radio", { name: /Oxblood/ })).toBeChecked();
});

test("each palette keeps representative screens and rating dialog readable and within the viewport", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  test.setTimeout(180_000);
  if (testInfo.project.name !== "desktop-chromium") await page.setViewportSize({ width: 320, height: 780 });
  for (const preset of presets) {
    await app.open("/ui-lab/settings");
    await page.getByRole("radio", { name: new RegExp(preset.name) }).check();
    for (const route of ["/ui-lab/settings", "/ui-lab/home", "/ui-lab/catalog/all", "/ui-lab/learn", "/ui-lab/learn/article?id=edu-collars", "/ui-lab/quizzes/question?id=dominance-submission", "/settings"]) {
      await app.open(route);
      if (route === "/ui-lab/learn") await expect(page.locator("#lab-education-content")).toHaveAttribute("aria-busy", "false");
      await auditAccessibility(page, testInfo, `${preset.id}-${route.replace(/[^a-z0-9]/gi, "-")}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${preset.name}: ${route} fits`).toBe(true);
    }
    await app.open("/ui-lab/catalog/all");
    await page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await auditAccessibility(page, testInfo, `${preset.id}-rating-dialog`);
    await page.screenshot({ path: testInfo.outputPath(`${preset.id}-rating.png`) });
    await page.keyboard.press("Escape");
  }
});
