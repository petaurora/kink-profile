import { test, expect } from "../e2e/fixtures";
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-18T12:00:00Z"));
});
async function snapshot(page: import("@playwright/test").Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  // Commit labels change on every build; all product content remains compared.
  await expect(page).toHaveScreenshot(name, { mask: [page.locator(".ui-lab-rail-version")] });
}
test("V2 home layout", async ({ app, page }) => {
  await app.open();
  await expect(page.getByRole("button", { name: "Open full menu", exact: true })).toBeVisible();
  await snapshot(page, "home.png");
});
test("partial quiz progress and selected answer", async ({ app, page, isMobile }) => {
  await app.open("/ui-lab/quizzes/question?id=dominance-submission");
  await page.getByRole("group", { name: "Answer question 1", exact: true }).getByRole("button", { name: /Absolutely/ }).click();
  await expect(page.getByRole("button", { name: "Save & exit", exact: true })).toBeEnabled();
  await expect(page.getByRole("progressbar", { name: "Quiz answers saved" })).toHaveAttribute("aria-valuenow", "1");
  if (isMobile) {
    await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
    await expect(page.getByRole("group", { name: "Answer question 2", exact: true }).getByRole("button", { name: /Absolutely/ })).toHaveAttribute("aria-pressed", "false");
  }
  await expect(page.locator(".lab-quiz-question.is-confirming")).toHaveCount(0);
  await snapshot(page, "quiz-progress.png");
});
test("catalog refinement dialog layout", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("button", { name: /^Refine Collars(?:\.|$)/ }).click();
  await expect(page.getByRole("dialog", { name: "Refine Collars", exact: true })).toBeVisible();
  await snapshot(page, "catalog-refinement.png");
});
for (const colorScheme of ["light", "dark"] as const) {
  test(`settings ${colorScheme} theme`, async ({ app, page }) => {
    await page.emulateMedia({ colorScheme });
    await app.open("/settings");
    await expect(page.getByRole("button", { name: "Download backup", exact: true })).toBeVisible();
    await snapshot(page, `settings-${colorScheme}.png`);
  });
}
