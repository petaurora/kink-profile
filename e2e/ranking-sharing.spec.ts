import { test, expect } from "./fixtures";

test("pairwise choices, equal and skip persist independently of quiz answers and explicit preferences", async ({ app, page }) => {
  await app.saveQuizDraft();
  const quiz = await app.profile();
  await app.open("/catalog/kinks/rank");
  await page.getByRole("button", { name: "Tap to start ranking", exact: true }).click();
  const comparison = page.getByRole("article", { name: "Kink comparison", exact: true });
  await comparison.locator(".pairwise-choice").first().click();
  await comparison.getByRole("button", { name: "Both / equal", exact: true }).click();
  await comparison.getByRole("button", { name: "Skip / don't know", exact: true }).click();
  await expect(page.locator(".ranking-category-strip-meta")).toContainText("2 comparisons");
  await page.reload();
  await app.continuePreview();
  await expect(page.locator(".ranking-category-strip-meta")).toContainText("2 comparisons");
  const backup = await app.backup();
  expect(backup.data.profile.catalog.comparisons.map(choice => choice.result)).toEqual(["left", "equal", "skip"]);
  expect(backup.data.profile.catalog.preferences).toEqual({});
  expect(await app.profile()).toEqual(quiz);
});

test("share summary exports standalone HTML with the chosen identity and excludes raw quiz answers", async ({ app, page, context }) => {
  await app.saveQuizDraft();
  const questionId = Object.keys((await app.profile())!.quizzes["dominance-submission"]!.answers)[0];
  await app.open("/settings");
  await page.getByRole("textbox", { name: "Profile name", exact: true }).fill("Synthetic share owner");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export HTML", exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/\.html$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const html = Buffer.concat(chunks).toString();
  expect(html).toContain("Synthetic share owner");
  expect(html).not.toContain(questionId);
  expect(html).not.toContain("pet-profile-v2");
  expect(html).not.toMatch(/<script\b/i);
  const exported = await context.newPage();
  await exported.setContent(html);
  await expect(exported.getByRole("heading").first()).toContainText("Synthetic share owner");
});
