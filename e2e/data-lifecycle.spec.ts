import { test, expect } from "./fixtures";

test("profile name validation normalizes whitespace and persists after reload", async ({ app, page }) => {
  await app.open("/settings");
  const name = page.getByRole("textbox", { name: "Profile name", exact: true });
  const save = page.getByRole("button", { name: "Save name", exact: true });
  await expect(save).toBeDisabled();
  await name.fill("   ");
  await expect(page.getByRole("alert")).toContainText("Profile name cannot be blank.");
  await expect(save).toBeDisabled();
  await name.fill("  Synthetic Explorer  ");
  await save.click();
  await expect(name).toHaveValue("Synthetic Explorer");
  await page.reload();
  await app.continuePreview();
  await expect(name).toHaveValue("Synthetic Explorer");
  await expect(save).toBeDisabled();
});

test("downloaded backup restores actual quiz answers and name only after explicit confirmation", async ({ app, page }) => {
  await app.saveQuizDraft();
  const savedQuiz = (await app.profile())!.quizzes;
  await app.open("/settings");
  await page.getByRole("textbox", { name: "Profile name", exact: true }).fill("Backup Explorer");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  const backup = await app.backup();
  expect(backup.data.format).toBe("kink-profile");
  expect(backup.data.version).toBe(3);
  expect(backup.data.profile.quizzes.quizzes).toEqual(savedQuiz);
  expect(backup.data.profile.settings.displayName).toBe("Backup Explorer");
  await page.getByRole("textbox", { name: "Profile name", exact: true }).fill("Changed Explorer");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await app.saveQuizDraft("sadism-masochism");
  expect((await app.profile())!.quizzes["sadism-masochism"]).toBeTruthy();
  await app.open("/settings");
  await page.getByRole("button", { name: "Choose backup", exact: true }).click();
  await page.getByLabel("Choose backup file", { exact: true }).setInputFiles({ name: "synthetic-backup.json", mimeType: "application/json", buffer: backup.contents });
  await expect(page.getByRole("heading", { name: "Review this backup.", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Profile name", exact: true })).toHaveValue("Changed Explorer");
  await page.getByRole("button", { name: "Restore this backup", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Backup Explorer's profile is restored.", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load restored profile", exact: true }).click();
  await app.open("/settings");
  await expect(page.getByRole("textbox", { name: "Profile name", exact: true })).toHaveValue("Backup Explorer");
  expect((await app.profile())!.quizzes).toEqual(savedQuiz);
});

for (const [label, contents] of [["malformed JSON", "{broken"], ["unrecognized backup", '{"format":"wrong","version":999}']] as const) {
  test(`import rejects ${label} and preserves the current profile`, async ({ app, page }) => {
    await app.saveQuizDraft();
    const original = await app.profile();
    await app.open("/settings");
    await page.getByRole("button", { name: "Choose backup", exact: true }).click();
    await page.getByLabel("Choose backup file", { exact: true }).setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from(contents) });
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: "Restore this backup", exact: true })).toHaveCount(0);
    expect(await app.profile()).toEqual(original);
  });
}

test("reset review can be canceled without changing saved answers", async ({ app, page }) => {
  await app.saveQuizDraft();
  const original = await app.profile();
  await app.open("/settings");
  await page.getByRole("button", { name: "Choose data", exact: true }).click();
  await expect(page.getByRole("button", { name: "Review reset", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Select all", exact: true }).click();
  await page.getByRole("button", { name: "Review reset", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Review before deleting.", exact: true })).toBeVisible();
  expect(await app.profile()).toEqual(original);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await app.profile()).toEqual(original);
});

test("selective quiz reset preserves the saved profile name across reload", async ({ app, page }) => {
  await app.saveQuizDraft();
  await app.saveQuizDraft("sadism-masochism");
  const otherQuiz = (await app.profile())!.quizzes["sadism-masochism"];
  await app.open("/settings");
  await page.getByRole("textbox", { name: "Profile name", exact: true }).fill("Keep This Name");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await page.getByRole("button", { name: "Choose data", exact: true }).click();
  await page.getByRole("checkbox", { name: /^Dominance/ }).check();
  await page.getByRole("button", { name: "Review reset", exact: true }).click();
  await page.getByRole("button", { name: "Reset selected data", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await app.continuePreview();
  await expect(page.getByRole("textbox", { name: "Profile name", exact: true })).toHaveValue("Keep This Name");
  expect((await app.profile())!.quizzes["sadism-masochism"]).toEqual(otherQuiz);
  await app.open("/ui-lab/quizzes/question?id=dominance-submission");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});

test("developer tools opt-in persists and controls workbench discoverability", async ({ app, page }) => {
  await app.open("/settings");
  const toggle = page.getByRole("switch");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("button", { name: "Open workbench", exact: true })).toHaveCount(0);
  await toggle.click();
  await expect(page.getByRole("button", { name: "Open workbench", exact: true })).toBeVisible();
  await page.reload();
  await app.continuePreview();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(page.getByRole("button", { name: "Open workbench", exact: true })).toHaveCount(0);
});
