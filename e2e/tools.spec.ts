import { test, expect } from "./fixtures";

for (const kind of ["reward", "punishment"] as const) {
  test(`${kind} recipe can be saved, reloaded, edited, duplicated and deleted independently`, async ({ app, page }) => {
    await app.open("/tools/rewards/recipes");
    await page.getByRole("button", { name: `Build a ${kind}`, exact: true }).click();
    const save = page.getByRole("button", { name: `Save ${kind}`, exact: true });
    await page.getByRole("textbox", { name: "Name", exact: true }).fill(`Synthetic ${kind}`);
    await expect(save).toBeDisabled();
    await page.getByPlaceholder("e.g. verbal check-in afterward", { exact: true }).fill("Synthetic recipe-only step");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByRole("textbox", { name: "Notes", exact: true }).fill("Synthetic private note");
    await save.click();
    await expect(page.getByRole("heading", { name: `Synthetic ${kind}`, exact: true })).toBeVisible();
    await page.reload();
    await app.continuePreview();
    const card = page.locator(".rp-recipe-card").filter({ has: page.getByRole("heading", { name: `Synthetic ${kind}`, exact: true }) });
    await card.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Notes", exact: true })).toHaveValue("Synthetic private note");
    await page.getByRole("textbox", { name: "Name", exact: true }).fill(`Updated ${kind}`);
    await save.click();
    await page.getByRole("button", { name: "Duplicate", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Notes", exact: true })).toHaveValue("Synthetic private note");
    await page.getByRole("button", { name: "Back to recipes", exact: true }).click();
    await expect(page.locator(".rp-recipe-card")).toHaveCount(2);
    const remove = page.locator(".rp-recipe-card").filter({ has: page.getByRole("heading", { name: `Updated ${kind}`, exact: true }) })
      .getByRole("button", { name: "Delete", exact: true });
    page.once("dialog", dialog => dialog.dismiss());
    await remove.click();
    await expect(page.locator(".rp-recipe-card")).toHaveCount(2);
    page.once("dialog", dialog => dialog.accept());
    await remove.click();
    await expect(page.locator(".rp-recipe-card")).toHaveCount(1);
    await page.reload();
    await app.continuePreview();
    await expect(page.locator(".rp-recipe-card")).toHaveCount(1);
    expect(await app.profile()).toBeNull();
  });
}

test("empty randomizer pools cannot fabricate picks and hand off to pool setup", async ({ app, page }) => {
  await app.open("/tools/rewards/randomizer");
  await expect(page.getByRole("button", { name: "Pick a reward", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Pick a punishment", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Set up this pool", exact: true }).first().click();
  await expect(page).toHaveURL(/#\/catalog\/rewards$/);
  expect(await app.profile()).toBeNull();
});

test("Scene Builder theme selection clears without creating source evidence or a saved scene", async ({ app, page }) => {
  await app.open("/scene-builder");
  const theme = page.locator(".scene-theme-chip").first();
  await theme.click();
  await expect(theme).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Make a starter scene", exact: true })).toBeDisabled();
  await page.locator(".scene-library summary").click();
  await expect(page.getByText("Build a scene above, give it a name, and save it here for later.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear themes", exact: true }).click();
  await expect(theme).toHaveAttribute("aria-pressed", "false");
  expect(await app.profile()).toBeNull();
});

test("durable Catalog preference feeds a saved scene whose copy and confirmed deletion survive reload", async ({ app, page }) => {
  await app.open("/catalog/kinks?view=browse&category=impact-play");
  await page.getByRole("searchbox", { name: "Search kinks or aliases", exact: true }).fill("Hand spanking");
  await page.getByRole("combobox", { name: "Preference for Hand spanking", exact: true }).selectOption("love");
  await page.reload();
  await app.continuePreview();
  await page.getByRole("searchbox", { name: "Search kinks or aliases", exact: true }).fill("Hand spanking");
  await expect(page.getByRole("combobox", { name: "Preference for Hand spanking", exact: true })).toHaveValue("love");
  await app.open("/scene-builder");
  await page.getByRole("button", { name: /^Pain\./ }).click();
  await page.getByRole("button", { name: "Make a starter scene", exact: true }).click();
  await page.getByRole("textbox", { name: "Save this scene", exact: true }).fill("Synthetic saved scene");
  await page.getByRole("button", { name: "Save scene", exact: true }).click();
  await page.reload();
  await app.continuePreview();
  await page.getByRole("button", { name: /^Pain\./ }).click();
  await page.locator(".scene-library summary").click();
  const library = page.locator(".scene-library");
  await expect(library.getByText("Synthetic saved scene", { exact: true })).toBeVisible();
  await library.getByRole("button", { name: "Duplicate Synthetic saved scene", exact: true }).click();
  await expect(library.locator(".scene-library-card")).toHaveCount(2);
  await library.getByRole("button", { name: "Delete Synthetic saved scene", exact: true }).click();
  await expect(library.locator(".scene-library-card")).toHaveCount(2);
  await library.getByRole("button", { name: "Confirm delete Synthetic saved scene", exact: true }).click();
  await expect(library.locator(".scene-library-card")).toHaveCount(1);
  await page.reload();
  await app.continuePreview();
  await page.getByRole("button", { name: /^Pain\./ }).click();
  await page.locator(".scene-library summary").click();
  await expect(library.locator(".scene-library-card")).toHaveCount(1);
});
