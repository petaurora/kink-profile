import { test, expect } from "./fixtures";

test("activity deletion requires confirmation and keeps unrelated Catalog records", async ({ app, page }) => {
  await app.open("/ui-lab/catalog/all");
  await page.getByRole("button", { name: "Collars overall: Not rated. Change rating", exact: true }).click();
  await page.getByRole("button", { name: "Love", exact: true }).click();
  await app.menu("Discover");
  await page.getByRole("button", { name: "Open Reflect on your interests", exact: true }).click();
  await page.getByRole("textbox").fill("Synthetic deletable draft");
  await page.getByRole("button", { name: "Exit reflection", exact: true }).click();
  await page.getByRole("button", { name: /^Delete activity / }).click();
  const dialog = page.getByRole("dialog", { name: "Delete saved activity?", exact: true });
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Delete activity / }).click();
  await dialog.getByRole("button", { name: "Delete activity", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toHaveCount(0);
  await app.menu("Profile", "My Profile");
  await expect(page.locator("dl.lab-records")).toContainText("Collars · overallLove");
});

test("reflection previous prompt preserves notes and a reload expires the session deep link", async ({ app, page }) => {
  await app.open("/ui-lab/discover");
  await page.getByRole("button", { name: "Open Reflect on your interests", exact: true }).click();
  await page.getByRole("textbox").fill("Synthetic first prompt");
  await page.getByRole("button", { name: "Next prompt", exact: true }).click();
  await page.getByRole("textbox").fill("Synthetic second prompt");
  await page.getByRole("button", { name: "Previous prompt", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("Synthetic first prompt");
  await page.getByRole("button", { name: "Next prompt", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("Synthetic second prompt");
  await page.reload();
  await app.continuePreview();
  await expect(page.getByText("This activity is unavailable in the current Lab session.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to activities", exact: true }).click();
  await expect(page.getByText("No unfinished activities.", { exact: true })).toBeVisible();
});

test("dismiss-all fallback keeps Quizzes reachable and bulk restore requires confirmation", async ({ app, page }) => {
  await app.open("/ui-lab/discover");
  for (const title of ["Reflect on your interests", "Explore Catalog subjects", "Explore concepts", "Read education articles"]) {
    await page.getByRole("button", { name: `Dismiss ${title}`, exact: true }).click();
  }
  await expect(page.getByRole("button", { name: "Explore something new", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Quizzes", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Manage Suggestions", exact: true }).click();
  await page.getByRole("button", { name: "Reset all dismissals", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Reset suggestion dismissals?", exact: true });
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restore", exact: true })).toHaveCount(4);
  await page.getByRole("button", { name: "Reset all dismissals", exact: true }).click();
  await dialog.getByRole("button", { name: "Restore all suggestions", exact: true }).click();
  await page.getByRole("navigation", { name: "Breadcrumb", exact: true }).getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open Reflect on your interests", exact: true })).toBeVisible();
});

test("reflection resumes, completes and repeats without creating Catalog records", async ({ app, page }) => {
  await app.open("/ui-lab/discover");
  await page.getByRole("button", { name: "Open Reflect on your interests", exact: true }).click();
  const firstAttempt = page.url();
  await page.getByRole("textbox").fill("Synthetic test interest");
  await page.getByRole("button", { name: "Next prompt", exact: true }).click();
  await page.getByRole("textbox").fill("Synthetic comfort note");
  await page.getByRole("button", { name: "Exit reflection", exact: true }).click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("Synthetic comfort note");
  await page.getByRole("button", { name: "Next prompt", exact: true }).click();
  await page.getByRole("textbox").fill("Synthetic next step");
  await page.getByRole("button", { name: "Finish reflection", exact: true }).click();
  await expect(page.getByText(/Completed reflection/)).toBeVisible();
  await expect(page.getByText("Synthetic test interest", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Repeat with latest version", exact: true }).click();
  expect(page.url()).not.toBe(firstAttempt);
  await expect(page.getByRole("textbox")).toHaveValue("");
  await page.getByRole("button", { name: "Exit reflection", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Review", exact: true })).toHaveCount(1);
  await app.menu("Profile", "My Profile");
  await expect(page.getByText("No explicit records yet. Browsing, learning and activities do not fill in your profile.")).toBeVisible();
  expect(await app.profile()).toBeNull();
});

test("dismiss and restore affect suggestions independently of saved activities", async ({ app, page }) => {
  await app.open("/ui-lab/discover");
  await page.getByRole("button", { name: "Open Reflect on your interests", exact: true }).click();
  await page.getByRole("textbox").fill("Keep this draft");
  await page.getByRole("button", { name: "Exit reflection", exact: true }).click();
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("button", { name: "Discover", exact: true }).click();
  await page.getByRole("button", { name: "Dismiss Reflect on your interests", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open Reflect on your interests", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Manage Suggestions", exact: true }).click();
  await page.getByRole("button", { name: "Restore", exact: true }).click();
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open Reflect on your interests", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("Keep this draft");
});
