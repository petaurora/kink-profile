import { test, expect } from "./fixtures";

test("comparison validates a real exported backup without replacing the local profile", async ({ app, page }) => {
  await app.saveQuizDraft();
  const original = await app.profile();
  const backup = await app.backup();
  await page.getByRole("textbox", { name: "Profile name", exact: true }).fill("Local comparison owner");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await app.open("/compare");
  await page.locator('input[type="file"]').setInputFiles({ name: "synthetic-comparison.json", mimeType: "application/json", buffer: backup.contents });
  await expect(page.getByRole("button", { name: "Build shared scene", exact: true })).toBeVisible();
  expect(await app.profile()).toEqual(original);
  await page.getByRole("button", { name: "Build shared scene", exact: true }).click();
  await expect(page.getByRole("heading", { name: "What sounds good right now?", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to comparison", exact: true }).click();
  await page.getByRole("button", { name: "Choose another", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Compare profiles.", exact: true })).toBeVisible();
  expect(await app.profile()).toEqual(original);
  await app.open("/settings");
  await expect(page.getByRole("textbox", { name: "Profile name", exact: true })).toHaveValue("Local comparison owner");
});

test("invalid comparison upload shows recovery and never changes quiz data", async ({ app, page }) => {
  await app.saveQuizDraft();
  const original = await app.profile();
  await app.open("/compare");
  await page.locator('input[type="file"]').setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "Build shared scene", exact: true })).toHaveCount(0);
  expect(await app.profile()).toEqual(original);
});
