import { test, expect } from "./fixtures";

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
