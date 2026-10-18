import { auditAccessibility } from "./accessibility";
import { test, expect } from "./fixtures";

const preferenceKey = "kink-profile:preview:pr-0:kink-profile:appearance";
const presets = [
  { name: "Dusty Rose", id: "dusty-rose", scheme: "light", chrome: "#f4e9e8" },
  { name: "Oxblood", id: "oxblood", scheme: "dark", chrome: "#170e13" },
  { name: "Midnight", id: "midnight", scheme: "dark", chrome: "#0b0c25" },
  { name: "Crimson Depths", id: "crimson-depths", scheme: "dark", chrome: "#190707" },
  { name: "INFJ", id: "infj", scheme: "light", chrome: "#f4f1ea" },
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
    // The same signature pink remains visible in every palette; labels on
    // that light fill use dark ink, including in the two light themes.
    await expect(page.locator(".appearance-preview-card b").first()).toHaveCSS("background-color", "rgb(240, 211, 231)");
    await expect(page.locator("button.primary").first()).toHaveCSS("background-color", "rgb(240, 211, 231)");
    await expect(page.locator("button.primary").first()).toHaveCSS("color", "rgb(16, 18, 64)");
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
  for (const name of ["Dusty Rose", "Oxblood", "Crimson Depths", "INFJ"]) {
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: new RegExp(name) })).toBeChecked();
  }
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowLeft");
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

test("mounted progress, loading and quiz bars use the selected theme's fills and glow", async ({ app, page }) => {
  await app.open("/ui-lab/settings");
  await page.getByRole("button", { name: "Open Progress & Loading Playground", exact: true }).click();
  await page.getByRole("button", { name: "Open Loading Playground", exact: true }).click();
  const gradients: string[] = [], sweeps: string[] = [], glows: string[] = [];
  for (const preset of presets) {
    await page.getByRole("radio", { name: new RegExp(preset.name) }).check();
    const sample = await page.locator(".kp-feedback-playground").evaluate(gallery => {
      // Resolve the shared public tokens through the browser's real CSS cascade.
      const probe = document.createElement("span");
      probe.hidden = true; document.body.append(probe);
      probe.style.background = "var(--kp-progress-fill)";
      const expectedFill = getComputedStyle(probe).backgroundImage;
      probe.style.background = "var(--kp-progress-loading-fill)";
      const expectedSweep = getComputedStyle(probe).backgroundImage;
      probe.style.background = "var(--kp-progress-track)";
      const expectedTrack = getComputedStyle(probe).backgroundColor;
      probe.style.boxShadow = "0 0 7px var(--kp-progress-glow)";
      const expectedGlow = getComputedStyle(probe).boxShadow;
      probe.style.color = "var(--accent-text)";
      const expectedInk = getComputedStyle(probe).color;
      probe.remove();
      const bar = gallery.querySelector<HTMLElement>('.kp-step-progress [role="progressbar"]')!;
      const fill = getComputedStyle(bar.firstElementChild!);
      const loading = getComputedStyle(gallery.querySelector(".kp-loading-bar > span")!);
      return {
        expectedFill, expectedSweep, expectedTrack, expectedGlow, expectedInk,
        fill: fill.backgroundImage, glow: fill.boxShadow, track: getComputedStyle(bar).backgroundColor,
        sweep: loading.backgroundImage, animation: loading.animationName, width: (bar.firstElementChild as HTMLElement).style.width,
        indicator: getComputedStyle(gallery.querySelector(".kp-loading-indicator")!).color,
        artwork: getComputedStyle(document.querySelector(".kp-loading-playground .kp-loading")!).color,
      };
    });
    expect(sample.fill).toBe(sample.expectedFill);
    expect(sample.sweep).toBe(sample.expectedSweep);
    expect(sample.track).toBe(sample.expectedTrack);
    expect(sample.glow).toBe(sample.expectedGlow);
    expect(sample.indicator).toBe(sample.expectedInk);
    expect(sample.artwork).toBe(sample.expectedInk);
    expect(sample.width).toBe("37.5%");
    expect(sample.animation).toBe("kp-loading-sweep");
    gradients.push(sample.fill); sweeps.push(sample.sweep); glows.push(sample.glow);
    await app.open("/ui-lab/quizzes/question?id=dominance-submission");
    const quiz = page.getByRole("progressbar", { name: "Quiz answers saved", exact: true });
    await expect(quiz).toBeVisible();
    expect(await quiz.locator("span").evaluate(node => getComputedStyle(node).backgroundImage)).toBe(sample.fill);
    await app.open("/ui-lab/settings");
  }
  expect(new Set(gradients).size).toBe(presets.length);
  expect(new Set(sweeps).size).toBe(presets.length);
  expect(new Set(glows).size).toBe(presets.length);
});

test("each palette keeps representative screens and rating dialog readable and within the viewport", { tag: "@a11y" }, async ({ app, page }, testInfo) => {
  test.setTimeout(60_000 * presets.length);
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
