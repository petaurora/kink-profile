import { test as base, expect, type Page } from "@playwright/test";
import type { StoredProfile } from "../src/lib/profileStorage";
import type { ProfileBackupV3 } from "../src/lib/profileBackup";

export class KpApp {
  constructor(readonly page: Page) {}

  async open(route = "/ui-lab/home") {
    const response = await this.page.goto(`./#${route}`);
    // Changing only a hash is same-document navigation, so an acknowledged
    // preview gate stays acknowledged until a genuine reload/new document.
    if (response) {
      await this.continuePreview();
    }
    await expect(this.page.getByRole("heading").first()).toBeVisible();
  }

  async continuePreview() {
    await this.page.getByRole("button", { name: "Continue to KP" }).click();
    await expect(this.page.getByRole("heading").first()).toBeVisible();
  }

  async menu(area: string, workspace?: string) {
    await this.page.getByRole("button", { name: "Open full menu", exact: true }).click();
    const menu = this.page.getByRole("dialog", { name: "Full navigation menu" });
    const areaButton = menu.getByRole("button", { name: area, exact: true });
    if (workspace) {
      if (await areaButton.getAttribute("aria-expanded") !== "true") await areaButton.click();
      await menu.getByRole("button", { name: workspace, exact: true }).click();
    } else {
      await areaButton.click();
      // Primary destinations are expandable parents; Overview is their link.
      if (await menu.isVisible()) await menu.getByRole("button", { name: "Overview", exact: true }).click();
    }
    await expect(menu).toBeHidden();
  }

  async profile(): Promise<StoredProfile | null> {
    // Read only: all writes under test go through the actual application UI.
    return this.page.evaluate(() => JSON.parse(localStorage.getItem("pet-profile-v2") || "null"));
  }

  async saveQuizDraft(quizId = "dominance-submission") {
    await this.open(`/ui-lab/quizzes/question?id=${quizId}`);
    await this.page.getByRole("group", { name: "Answer question 1", exact: true })
      .getByRole("button", { name: /Absolutely/ }).click();
    await expect(this.page.getByRole("button", { name: "Save & exit", exact: true })).toBeEnabled();
    await this.page.getByRole("button", { name: "Save & exit", exact: true }).click();
  }

  async backup(): Promise<{ contents: Buffer; data: ProfileBackupV3 }> {
    await this.open("/settings");
    await this.page.getByRole("button", { name: "Download backup", exact: true }).click();
    const downloaded = this.page.waitForEvent("download");
    await this.page.getByRole("region", { name: "Download the complete profile.", exact: true })
      .getByRole("button", { name: "Download backup", exact: true }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const contents = Buffer.concat(chunks);
    return { contents, data: JSON.parse(contents.toString()) };
  }
}

export const test = base.extend<{ app: KpApp }>({
  app: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await use(new KpApp(page));
    expect(errors, "No uncaught application errors during the journey").toEqual([]);
  },
});
export { expect };
