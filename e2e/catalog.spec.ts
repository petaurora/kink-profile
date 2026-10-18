import { test, expect } from "./fixtures";

test("overall rating, modifier rating and Experienced stay independent across navigation", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "Hard Limit", exact: true }).click();
  await page.getByRole("button", { name: /^Refine Collars(?:\.|$)/ }).click();
  const refine = page.getByRole("dialog", { name: "Refine Collars", exact: true });
  const experience = refine.getByRole("button", { name: "Collars: Experienced", exact: true });
  await expect(experience).toHaveAttribute("aria-pressed", "false");
  await experience.click();
  await refine.getByRole("button", { name: /^Material/ }).click();
  await refine.getByRole("button", { name: "Leather: Not rated. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "Like", exact: true }).click();
  await expect(refine.getByRole("button", { name: "Collars overall: Hard Limit. Change rating", exact: true })).toBeVisible();
  await expect(experience).toHaveAttribute("aria-pressed", "true");
  await expect(refine.getByRole("status").filter({ hasText: "Leather: Saved" })).toHaveCount(1);
  await refine.getByRole("button", { name: "Close refinement", exact: true }).click();
  await app.menu("Profile", "My Profile");
  const records = page.locator("dl.lab-records");
  await expect(records).toContainText("Collars · overallHard Limit");
  await expect(records).toContainText("Collars · Material · LeatherLike");
  await expect(records).toContainText("Collars · ExperiencedExperienced");
  await page.getByRole("button", { name: "Edit Catalog records", exact: true }).click();
  await page.getByRole("button", { name: /^Refine Collars(?:\.|$)/ }).click();
  await expect(experience).toHaveAttribute("aria-pressed", "true");
  await experience.click();
  await expect(experience).toHaveAttribute("aria-pressed", "false");
  await expect(refine.getByRole("button", { name: "Collars overall: Hard Limit. Change rating", exact: true })).toBeVisible();
});

test("keyboard browsing does not rate; explicit commit, clear and Undo restore the exact value", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  const trigger = page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true });
  await trigger.click();
  await expect(page.getByRole("heading", { name: "Collars overall", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Love", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "Like", exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Like", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(page.getByRole("heading", { name: "Collars overall", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Collars overall: Like. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "Clear rating", exact: true }).click();
  await expect(trigger).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Collars overall: Like. Change rating", exact: true })).toBeVisible();
});

test("failed saves retain the edit and can be retried through the visible recovery controls", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("checkbox", { name: "Test save failure", exact: true }).check();
  await page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "Curious", exact: true }).click();
  const retry = page.getByRole("button", { name: "Retry saving Collars overall", exact: true });
  await expect(retry).toBeVisible();
  await expect(page.getByRole("button", { name: "Collars overall: Curious. Change rating", exact: true })).toBeVisible();
  await retry.click();
  await expect(page.getByRole("status").filter({ hasText: "Collars overall: Saved" })).toHaveCount(1);
  await expect(retry).toBeHidden();
  await expect(page.getByText("changes not saved", { exact: false })).toHaveCount(0);
});

test("Catalog session records clear on reload rather than pretending to be durable", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "Love", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Collars overall: Saved" })).toHaveCount(1);
  await page.reload();
  await app.continuePreview();
  await expect(page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true })).toBeVisible();
});
