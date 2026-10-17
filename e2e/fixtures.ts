import { test as base, expect, type Page } from "@playwright/test";
import type { StoredProfile } from "../src/lib/profileStorage";

export class KpApp {
  constructor(readonly page: Page) {}

  async open(route = "/ui-lab/home") {
    const response = await this.page.goto(`./#${route}`);
    // Changing only a hash is same-document navigation, so an acknowledged
    // preview gate stays acknowledged until a genuine reload/new document.
    if (response) {
      await this.continuePreview();
    }
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible();
  }

  async continuePreview() {
    await this.page.getByRole("button", { name: "Continue to KP" }).click();
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible();
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
