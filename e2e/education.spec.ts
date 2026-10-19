import { test, expect } from "./fixtures";

test("article search, reader navigation and Back preserve library context without profile writes", async ({ app, page }) => {
  await app.open("/ui-lab/learn");
  const search = page.getByRole("searchbox", { name: "Search educational articles", exact: true });
  await search.fill("collars");
  await page.getByRole("button", { name: /Collars & Collaring/ }).click();
  await expect(page).toHaveURL(/id=edu-collars$/);
  await expect(page.getByRole("heading", { name: /Different Types of Collars/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Continue learning", exact: true })).toBeVisible();
  await page.goBack();
  await expect(search).toHaveValue("collars");
  await page.getByRole("button", { name: /Collars & Collaring/ }).click();
  await page.getByRole("button", { name: "All articles", exact: true }).click();
  await expect(search).toHaveValue("collars");
  expect(await app.profile()).toBeNull();
});

test("empty education search recovers by clearing both topic and query", async ({ app, page }) => {
  await app.open("/ui-lab/learn");
  const search = page.getByRole("searchbox", { name: "Search educational articles", exact: true });
  await expect(page.locator("#lab-education-results")).toHaveText(/^[1-9]\d* articles$/);
  const initial = await page.locator("#lab-education-results").textContent();
  await page.getByRole("group", { name: "Education topics", exact: true }).getByRole("button").nth(1).click();
  await search.fill("synthetic-no-matching-article-9832");
  await expect(page.getByText("No articles match. Try a different title or topic.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show all articles", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator("#lab-education-results")).toHaveText(initial!);
});

test("education sort changes actual article order and omits meaningless grouping", async ({ app, page }) => {
  await app.open("/ui-lab/learn");
  await page.getByRole("button", { name: "Sort results", exact: true }).click();
  const sort = page.getByRole("dialog", { name: "Sort", exact: true });
  await expect(sort.getByRole("group", { name: "Group by", exact: true })).toHaveCount(0);
  await sort.getByRole("button", { name: "Name: A–Z", exact: true }).click();
  await sort.getByRole("button", { name: "Done", exact: true }).click();
  // Compare the same visible cards in reverse order, without importing search implementation.
  const cards = page.locator(".lab-education-grid button");
  const ascending = await cards.allTextContents();
  expect(ascending.length).toBeGreaterThan(3);
  await page.getByRole("button", { name: "Sort results", exact: true }).click();
  await sort.getByRole("button", { name: "Name: Z–A", exact: true }).click();
  await sort.getByRole("button", { name: "Done", exact: true }).click();
  expect(await cards.allTextContents()).toEqual([...ascending].reverse());
});

test("stable article deep links render tables and related articles", async ({ app, page }) => {
  await app.open("/ui-lab/learn/article?id=edu-impact-tools");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Implement", exact: true })).toBeVisible();
  const related = page.locator(".lab-education-related").getByRole("button").first();
  const title = (await related.textContent())!.trim();
  await related.click();
  await expect(page.locator(".lab-education-article-header h2")).toHaveText(title);
  expect(await app.profile()).toBeNull();
});

test("missing articles recover to the library without substituted content", async ({ app, page }) => {
  await app.open("/ui-lab/learn/article?id=synthetic-missing");
  await expect(page.getByText("This article is unavailable or its link is out of date.", { exact: true })).toBeVisible();
  await expect(page.locator(".lab-education-prose")).toHaveCount(0);
  await page.getByRole("button", { name: "Browse articles", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Search educational articles", exact: true })).toBeVisible();
});
