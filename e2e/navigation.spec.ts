import { test, expect } from "./fixtures";

test("unknown Lab destination recovers Home and shortcut edits survive shell navigation", async ({ app, page }) => {
  await app.open("/ui-lab/synthetic-missing");
  await expect(page.getByRole("alert")).toContainText("This Lab destination is unavailable.");
  await page.getByRole("button", { name: "Return Home", exact: true }).click();
  await page.getByRole("button", { name: "Edit shortcuts", exact: true }).click();
  await page.getByRole("checkbox", { name: "Learn", exact: true }).check();
  await page.getByRole("checkbox", { name: "Tools", exact: true }).uncheck();
  const shortcuts = page.locator(".lab-shortcuts");
  await shortcuts.getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Learn", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Kink Profile, go to Home", exact: true }).click();
  await expect(shortcuts.getByRole("button", { name: "Learn", exact: true })).toBeVisible();
  await expect(shortcuts.getByRole("button", { name: "Tools", exact: true })).toHaveCount(0);
});

test("rapid global searches show the latest term and empty results recover", async ({ app, page }) => {
  await app.open();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const search = page.getByRole("dialog", { name: "Global catalog search", exact: true });
  const query = search.getByRole("searchbox", { name: "Search catalog", exact: true });
  await query.fill("Leather");
  await query.fill("Collars");
  await search.getByRole("button", { name: "Items", exact: true }).click();
  const results = search.locator("[data-search-result]");
  await expect(results.locator("strong")).toHaveText(["Collars", "Collaring"]);
  await query.fill("synthetic-no-global-result-6329");
  await expect(search.getByText("No matches. Try another term or type.", { exact: true })).toBeVisible();
  await search.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(query).toHaveValue("");
  await expect(search.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await search.getByRole("button", { name: "Close search", exact: true }).click();
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeFocused();
  expect(await app.profile()).toBeNull();
});

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
