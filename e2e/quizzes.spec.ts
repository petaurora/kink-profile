import { type Page } from "@playwright/test";
import { quizzes } from "../src/data/quizzes";
import { test, expect } from "./fixtures";
import { auditAccessibility } from "./accessibility";

// The registry supplies stable IDs/counts only. Do not call scoring, lifecycle
// or persistence functions here: exercise those through the bundled app.
for (const quiz of quizzes.filter(quiz => quiz.contributesToOverall)) {
  test(`${quiz.title}: save, reload and resume the earliest unanswered question`, async ({ app, page, isMobile }) => {
    await app.open("/ui-lab/quizzes");
    await page.getByRole("button", { name: `${quiz.title}: Explore quiz.`, exact: false }).click();
    await expect(page.getByRole("heading", { level: 2, name: /^Question 1 of/ })).toBeFocused();
    const progress = page.getByRole("progressbar", { name: "Quiz answers saved" });
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    if (!isMobile) await expect(page.getByRole("button", { name: "Next questions", exact: false })).toBeDisabled();
    await page.getByRole("group", { name: "Answer question 1", exact: true }).getByRole("button", { name: /Absolutely/ }).click();
    if (isMobile) await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
    await page.getByRole("button", { name: "Save & exit", exact: true }).click();
    await page.reload();
    await app.continuePreview();
    await page.getByRole("button", { name: `${quiz.title}: Continue.`, exact: false }).click();
    await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
    await expect(progress).toHaveAttribute("aria-valuenow", "1");
    const saved = (await app.profile())!.quizzes[quiz.id]!;
    expect(saved.answers).toEqual({ [quiz.questionIds[0]]: 4 });
    expect(saved.completedAt).toBeUndefined();
  });
}

async function finishQuiz(page: Page, count: number, isMobile: boolean, label: string) {
  for (let index = 0; index < count; index++) {
    if (!isMobile && index > 0 && index % 3 === 0) {
      await page.getByRole("button", { name: "Next questions", exact: false }).click();
    }
    const answers = page.getByRole("group", { name: `Answer question ${index + 1}`, exact: true });
    await answers.getByRole("button", { name: new RegExp(label) }).click();
    if (isMobile && index < count - 1) {
      await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^Question ${index + 2} of`) })).toBeFocused();
    }
  }
  await expect(page).toHaveURL(/#\/ui-lab\/quizzes\/results\?id=/);
  await expect(page.getByRole("heading", { name: "At a glance", exact: true })).toBeVisible();
}

for (const quiz of quizzes.filter(quiz => quiz.contributesToOverall)) {
  test(`${quiz.title}: completion and retake preserve old results until the new attempt is fully finished`, { tag: "@a11y" }, async ({ app, page, isMobile }, testInfo) => {
    test.setTimeout(180_000);
    await app.open(`/ui-lab/quizzes/question?id=${quiz.id}`);
    await finishQuiz(page, quiz.questionIds.length, isMobile, "Absolutely");
    const completed = (await app.profile())!.quizzes[quiz.id]!;
    expect(Object.keys(completed.answers)).toHaveLength(quiz.questionIds.length);
    expect(Object.values(completed.answers)).toEqual(Array(quiz.questionIds.length).fill(4));
    expect(completed.completedAt).toBeTruthy();
    await auditAccessibility(page, testInfo, "quiz-completed-results");
    const oldResults = (await page.getByRole("heading", { name: "At a glance", exact: true }).locator("..").textContent())!;
    await page.getByText("Explore the full breakdown", { exact: true }).click();
    await expect(page.getByRole("region", { name: "All signals", exact: true })).toBeVisible();
    await auditAccessibility(page, testInfo, "quiz-expanded-breakdown");
    expect((await app.profile())!.quizzes[quiz.id]).toEqual(completed);

    await page.getByRole("button", { name: "Retake this quiz", exact: true }).click();
    await page.getByRole("group", { name: "Answer question 1", exact: true }).getByRole("button", { name: /Nope/ }).click();
    if (isMobile) await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
    await page.getByRole("button", { name: "Save & exit", exact: true }).click();
    await page.reload();
    await app.continuePreview();
    await expect(page.getByRole("button", { name: `${quiz.title}: Continue retake.`, exact: false })).toBeVisible();
    const draft = (await app.profile())!.quizzes[quiz.id]!;
    expect(draft.answers).toEqual(completed.answers);
    expect(draft.completedAt).toEqual(completed.completedAt);
    expect(draft.retake?.answers).toEqual({ [quiz.questionIds[0]]: 0 });

    // Browser deep link must show the established result while a retake exists.
    await app.open(`/ui-lab/quizzes/results?id=${quiz.id}`);
    await expect(page.getByText(/These remain your last completed results/)).toBeVisible();
    await auditAccessibility(page, testInfo, "quiz-established-results-during-retake");
    await expect(page.getByRole("heading", { name: "At a glance", exact: true }).locator("..")).toHaveText(oldResults);
    await page.getByRole("button", { name: "Continue retake", exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
    // Return to question one to exercise the intra-quiz Back control as well.
    if (isMobile) await page.getByRole("button", { name: "← Back", exact: true }).click();
    await finishQuiz(page, quiz.questionIds.length, isMobile, "Nope");
    const replaced = (await app.profile())!.quizzes[quiz.id]!;
    expect(Object.values(replaced.answers)).toEqual(Array(quiz.questionIds.length).fill(0));
    expect(replaced.retake).toBeUndefined();
    expect(replaced.completedAt).not.toEqual(completed.completedAt);
    await auditAccessibility(page, testInfo, "quiz-replacement-results");
    await expect(page.getByRole("heading", { name: "At a glance", exact: true }).locator("..")).not.toHaveText(oldResults);
    await page.reload();
    await app.continuePreview();
    await expect(page.getByRole("heading", { name: "At a glance", exact: true })).toBeVisible();
    expect((await app.profile())!.quizzes[quiz.id]).toEqual(replaced);
  });
}

test("phone confirmation locks repeated taps while retaining the selected answer", async ({ app, page, isMobile }) => {
  test.skip(!isMobile, "Desktop intentionally allows editing within a three-question group");
  await app.open("/ui-lab/quizzes/question?id=dominance-submission");
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1_000));
  const answers = page.getByRole("group", { name: "Answer question 1", exact: true });
  const selected = answers.getByRole("button", { name: /Absolutely/ });
  await selected.dblclick({ delay: 20 });
  await expect(selected).toBeDisabled();
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect(answers.getByRole("button")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Save & exit", exact: true })).toBeDisabled();
  const progress = (await app.profile())!.quizzes["dominance-submission"]!;
  expect(Object.values(progress.answers)).toEqual([4]);
  await page.clock.runFor(500);
  await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  expect((await app.profile())!.quizzes["dominance-submission"]!.answers).toEqual(progress.answers);
});

test("320px reduced-motion quiz remains reachable and advances with keyboard input", async ({ app, page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await app.open("/ui-lab/quizzes/question?id=dominance-submission");
  const first = page.getByRole("heading", { level: 2, name: /^Question 1 of/ });
  await expect(first).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Nope/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: /^Question 2 of/ })).toBeFocused();
  await expect(page.getByRole("button", { name: "Save & exit", exact: true })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Save & exit", exact: true }).click();
  await expect(page.getByRole("region", { name: "Quiz selection" })).toBeVisible();
});

test("legacy quiz URLs redirect and unavailable results recover without inventing answers", async ({ app, page }) => {
  await app.open("/quizzes/dominance-submission/results");
  await expect(page).toHaveURL(/#\/ui-lab\/quizzes\/results\?id=dominance-submission$/);
  await expect(page.getByRole("alert")).toContainText("No completed results are available");
  await page.getByRole("button", { name: "Continue quiz", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  expect(await app.profile()).toBeNull();
  await app.open("/ui-lab/quizzes/question?id=missing-quiz");
  await expect(page.getByRole("alert")).toContainText("That quiz is unavailable");
  await page.getByRole("button", { name: "Back to Quizzes", exact: true }).click();
  await expect(page.getByRole("region", { name: "Quiz selection" }).getByRole("button")).toHaveCount(4);
});
