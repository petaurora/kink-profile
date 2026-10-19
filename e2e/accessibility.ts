import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

/** Rendered WCAG A/AA scans. No rules or page regions are excluded. */
export async function auditAccessibility(page: Page, testInfo: TestInfo, state: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Let finite entrance animations finish without freezing the application or
    // waiting forever for decorative looping animations.
    await Promise.all(document.getAnimations()
      .filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
      .map(animation => animation.finished.catch(() => {})));
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  await testInfo.attach(`axe-${state}`, {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
  expect(results.violations.map(violation => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map(node => ({ target: node.target, reason: node.failureSummary })),
  })), `No automatically detectable WCAG A/AA violations: ${state}`).toEqual([]);
}

/** Reach a control through real Tab presses, without programmatically focusing it. */
export async function tabTo(page: Page, target: Locator, backwards = false) {
  for (let stop = 0; stop < 80; stop++) {
    if (await target.evaluate(node => node === document.activeElement)) return;
    await page.keyboard.press(backwards ? "Shift+Tab" : "Tab");
  }
  await expect(target, "Control is reachable by keyboard in a bounded number of stops").toBeFocused();
}
