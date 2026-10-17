import { test, expect } from "./fixtures";

test("preview gate preserves a deep link and shell navigation supports browser history", async ({ app, page }) => {
  await page.goto("./#/ui-lab/discover");
  await expect(page.getByRole("main", { name: "Loading animation preview" })).toBeVisible();
  await app.continuePreview();
  await expect(page.getByRole("heading", { name: "Discover yourself.", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Quizzes", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Quizzes", exact: true }).click();
  await expect(page).toHaveURL(/#\/ui-lab\/quizzes$/);
  await expect(page.getByRole("heading", { name: "Explore quizzes.", exact: true })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Discover yourself.", exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("region", { name: "Quiz selection" }).getByRole("button")).toHaveCount(4);
  const primary = page.getByRole("navigation", { name: /^(Primary navigation|Primary mobile navigation)$/ });
  await expect(primary).toHaveCount(1);
  await expect(primary.getByRole("button", { name: /^(Home|Catalog|Profile|Discover|Tools)$/ })).toHaveCount(5);
  await expect(primary.getByRole("button", { name: "Quizzes", exact: true })).toHaveCount(0);
  expect(await app.profile()).toBeNull();
});

test("menu traps keyboard focus and restores its trigger when dismissed", async ({ app, page }) => {
  await app.open();
  const trigger = page.getByRole("button", { name: "Open full menu", exact: true });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Full navigation menu" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(await menu.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Tab");
  expect(await menu.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await app.menu("Catalog", "Explore All");
  await expect(page).toHaveURL(/#\/ui-lab\/catalog\/all$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("global modifier search restores its query through nested browser Back", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("searchbox", { name: "Search Items in kinks", exact: true }).fill("Collars");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const search = page.getByRole("dialog", { name: "Global catalog search" });
  await search.getByRole("searchbox", { name: "Search catalog", exact: true }).fill("Leather");
  await search.getByRole("button", { name: "Modifiers", exact: true }).click();
  await search.getByRole("button", { name: /^Leather Collars/ }).click();
  const refine = page.getByRole("dialog", { name: "Refine Collars", exact: true });
  await expect(refine.getByRole("button", { name: "Leather: Not rated. Change rating", exact: true })).toBeFocused();
  await page.goBack();
  await expect(refine).toBeHidden();
  await expect(search.getByRole("searchbox", { name: "Search catalog", exact: true })).toHaveValue("Leather");
  await page.goBack();
  await expect(search).toBeHidden();
  await expect(page.getByRole("searchbox", { name: "Search Items in kinks", exact: true })).toHaveValue("Collars");
  expect(await app.profile()).toBeNull();
});
