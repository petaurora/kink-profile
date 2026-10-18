import { test, expect } from "@playwright/test";
test("published commit, assets, PWA scope and deep link load", async ({ request, page, baseURL }, testInfo) => {
  const base = new URL(baseURL!);
  expect(base.pathname.endsWith("/")).toBe(true);
  // Pages/CDN publication can lag behind the publishing commit. Reject old builds.
  await expect.poll(async () => {
    const response = await request.get(new URL(`build-info.json?smoke=${Date.now()}`, base).href, { headers: { "Cache-Control": "no-cache" } });
    if (!response.ok() || !response.headers()["content-type"]?.includes("json")) return null;
    const info = await response.json();
    return { commit: info.commit, base: info.base };
  }, { timeout: 120_000, intervals: [1000, 3000, 5000] }).toEqual({ commit: process.env.SMOKE_EXPECTED_SHA, base: base.pathname });
  const manifestResponse = await request.get(new URL("manifest.webmanifest", base).href);
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ scope: base.pathname, start_url: base.pathname, id: base.pathname });
  expect(manifest.icons.length).toBeGreaterThan(0);
  for (const icon of manifest.icons) {
    const response = await request.get(new URL(icon.src, base).href);
    expect(response.ok(), icon.src).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/");
    expect((await response.body()).length).toBeGreaterThan(100);
  }
  const worker = await request.get(new URL("sw.js", base).href);
  expect(worker.ok()).toBe(true);
  expect(await worker.text()).toContain(`const SCOPE_PATH = ${JSON.stringify(base.pathname)}`);
  expect(await worker.text()).toContain(`${base.pathname}index.html`);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("requestfailed", request => errors.push(`${request.failure()?.errorText} ${request.url()}`));
  for (const route of ["/ui-lab/home", "/ui-lab/quizzes"]) {
    await page.goto(`${base.href}#${route}`);
    if (base.pathname.match(/\/pr-\d+\//) && route === "/ui-lab/home") await page.getByRole("button", { name: "Continue to KP", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: route.endsWith("home") ? "Your space." : "Explore quizzes.", exact: true })).toBeVisible();
  }
  const assets = await page.locator('script[type="module"][src], link[rel="stylesheet"][href]').evaluateAll(elements =>
    elements.map(element => element.getAttribute("src") ?? element.getAttribute("href")!));
  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) {
    const url = new URL(asset, base);
    expect(url.pathname.startsWith(base.pathname)).toBe(true);
    const response = await request.get(url.href);
    expect(response.ok(), url.href).toBe(true);
    expect(response.headers()["content-type"]).not.toContain("text/html");
  }
  expect(errors).toEqual([]);
  await testInfo.attach("published-build", { body: JSON.stringify({ commit: process.env.SMOKE_EXPECTED_SHA, base: base.href, assets }), contentType: "application/json" });
});
