import { test, expect } from "./fixtures";

test("Catalog empty-search recovery restores results without recording preferences", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  const rows = page.locator(".kp-item-name");
  await expect(rows.first()).toBeVisible();
  const initial = await rows.allTextContents();
  expect(initial.length).toBeGreaterThan(5);
  await page.getByRole("searchbox", { name: "Search Items in kinks", exact: true }).fill("synthetic-no-item-37921");
  await expect(page.getByText("No matching Items. Try another search or adjust filters.", { exact: true })).toBeVisible();
  await page.locator(".cc-empty-actions").getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(rows).toHaveText(initial);
  await app.menu("Profile", "My Profile");
  await expect(page.locator("dl.lab-records > div")).toHaveCount(0);
});

test("Catalog sort and category grouping preserve the same Items and survive navigation", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  const rows = page.locator(".kp-item-name");
  await expect(rows.first()).toBeVisible();
  const original = await rows.allTextContents();
  await page.getByRole("button", { name: "Sort and group results", exact: true }).click();
  const sort = page.getByRole("dialog", { name: "Sort & Group", exact: true });
  await sort.getByRole("button", { name: "Name: A–Z", exact: true }).click();
  await sort.getByRole("button", { name: "Done", exact: true }).click();
  const ascending = await rows.allTextContents();
  expect([...ascending].sort()).toEqual([...original].sort());
  await page.getByRole("button", { name: "Sort and group results", exact: true }).click();
  await sort.getByRole("button", { name: "Name: Z–A", exact: true }).click();
  await sort.getByRole("button", { name: "Done", exact: true }).click();
  expect(await rows.allTextContents()).toEqual([...ascending].reverse());
  await page.getByRole("button", { name: "Sort and group results", exact: true }).click();
  await sort.getByRole("button", { name: "Category", exact: true }).click();
  await sort.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".cc-category-heading").nth(1)).toBeVisible();
  expect([...(await rows.allTextContents())].sort()).toEqual([...original].sort());
  const category = page.locator(".cc-category-heading button").first();
  await category.click();
  await expect(category).toHaveAttribute("aria-expanded", "false");
  await category.click();
  await app.menu("Profile", "My Profile");
  await page.getByRole("button", { name: "Edit Catalog records", exact: true }).click();
  await expect(page.locator(".cc-category-heading").nth(1)).toBeVisible();
  await page.getByRole("button", { name: "Sort and group results", exact: true }).click();
  await expect(sort.getByRole("button", { name: "Name: Z–A", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(sort.getByRole("button", { name: "Category", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("subject handoff filters related Items and omits grouping until the subject is cleared", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/subject?subject=Power%20Exchange");
  await page.getByRole("button", { name: "View All Related Items", exact: true }).click();
  await expect(page.getByText("Exploring: Power Exchange", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sort results", exact: true }).click();
  const sort = page.getByRole("dialog", { name: "Sort", exact: true });
  await expect(sort.getByRole("button", { name: "Category", exact: true })).toHaveCount(0);
  await sort.getByRole("button", { name: "Done", exact: true }).click();
  const related = await page.locator(".kp-item-name").allTextContents();
  expect(related.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Clear subject", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sort and group results", exact: true })).toBeVisible();
  const all = await page.locator(".kp-item-name").allTextContents();
  expect(all.length).toBeGreaterThan(related.length);
  expect(all).toEqual(expect.arrayContaining(related));
});

test("Reward and Punishment classification filters combine independently and clear together", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/rewards-punishments");
  const rows = page.locator(".kp-item-name");
  await expect(rows.first()).toBeVisible();
  const initial = await rows.allTextContents();
  const filters = page.getByRole("group", { name: "Reward and punishment filters", exact: true });
  await filters.getByRole("button", { name: "Reward", exact: true }).click();
  await expect(filters.getByRole("button", { name: "Reward", exact: true })).toHaveAttribute("aria-pressed", "true");
  const rewards = await rows.allTextContents();
  await filters.getByRole("button", { name: "Punishment", exact: true }).click();
  expect(await rows.allTextContents()).toEqual(expect.arrayContaining(rewards));
  await filters.getByRole("button", { name: "Answers", exact: true }).click();
  const answers = page.getByRole("dialog", { name: "Answer states", exact: true });
  await answers.getByRole("button", { name: "? Unanswered", exact: true }).click();
  await answers.getByRole("button", { name: "Close answer states", exact: true }).click();
  await expect(filters.getByRole("button", { name: "Answers · 1", exact: true })).toHaveAttribute("aria-pressed", "true");
  await filters.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(rows).toHaveText(initial);
  await expect(filters.getByRole("button", { name: "Reward", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(filters.getByRole("button", { name: "Punishment", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("nested modifier cancellation returns focus and does not change an existing rating", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  const origin = page.getByRole("button", { name: "Refine Collars", exact: true });
  await origin.click();
  const refine = page.getByRole("dialog", { name: "Refine Collars", exact: true });
  await refine.getByRole("button", { name: /^Material/ }).click();
  const leather = refine.getByRole("button", { name: "Leather: Not rated. Change rating", exact: true });
  await leather.click();
  await page.keyboard.press("Escape");
  await expect(leather).toBeFocused();
  await expect(refine).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(origin).toBeFocused();
  await origin.click();
  await refine.getByRole("button", { name: /^Material/ }).click();
  await expect(leather).toBeVisible();
});

test("concept preferences do not propagate into related Item ratings", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/concepts");
  await page.locator(".ui-lab-catalog-items button").first().click();
  const concept = page.getByRole("dialog", { name: /^Concept:/ });
  await concept.getByRole("button", { name: /concept: Not rated\. Change rating$/ }).click();
  await page.getByRole("button", { name: "Love", exact: true }).click();
  await expect(concept.getByRole("button", { name: /concept: Love\. Change rating$/ })).toBeVisible();
  await concept.getByRole("button", { name: "Back to search or concepts", exact: true }).click();
  await app.menu("Catalog", "Explore All");
  await expect(page.locator(".kp-item-name").first()).toBeVisible();
  await expect(page.getByRole("button", { name: / overall: Not rated\. Change rating$/ })).toHaveCount(await page.locator(".kp-item-name").count());
  await app.menu("Profile", "My Profile");
  await expect(page.locator("dl.lab-records > div")).toHaveCount(1);
  await expect(page.locator("dl.lab-records")).toContainText("Love");
});
