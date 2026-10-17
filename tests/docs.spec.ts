import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage links to embedded documentation and every page exports with working navigation", async ({ page, request }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Documentation", exact: true })).toHaveAttribute("href", "/docs/");
  const response = await request.get("/docs-search.json");
  expect(response.ok()).toBe(true);
  const entries: { href: string; slug: string }[] = await response.json();
  expect(entries.length).toBe(17);
  const exportedPages = new Map<string, { ids: string[]; links: string[] }>();
  for (const entry of entries) {
    const result = await request.get(entry.href);
    expect(result.status(), entry.href).toBe(200);
    const html = await result.text();
    expect(html).toContain('class="docs-article"');
    const references = await page.evaluate((source) => {
      const document = new DOMParser().parseFromString(source, "text/html");
      return { ids: [...document.querySelectorAll("[id]")].map((node) => node.id), links: [...document.querySelectorAll("a[href]")].map((node) => node.getAttribute("href")!) };
    }, html);
    expect(new Set(references.ids).size, entry.href + " has unique anchors").toBe(references.ids.length);
    exportedPages.set(entry.href, references);
  }
  for (const [href, references] of exportedPages) {
    for (const link of references.links.filter((value) => value.startsWith("/docs/") || value.startsWith("#"))) {
      const target = new URL(link, "http://localhost" + href);
      const targetPage = exportedPages.get(target.pathname);
      expect(targetPage, href + " links to " + link).toBeDefined();
      if (target.hash) expect(targetPage!.ids, href + " links to " + link).toContain(decodeURIComponent(target.hash.slice(1)));
    }
  }
  await page.goto("/docs/installation/");
  await expect(page.getByRole("heading", { name: "Installation", exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://anubis.watch/docs/installation/");
  await expect(page.locator(".docs-code").first()).toContainText("mv anubis-linux-amd64 anubis");
  for (const width of testInfo.project.name === "desktop" ? [3840, 1920, 1440, 1024] : [412, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width === 3840) {
      const sizes = await page.evaluate(() => [".docs-prose", ".docs-code pre", ".docs-sidebar a"].map((selector) => parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize)));
      expect(sizes[0]).toBeGreaterThanOrEqual(30);
      expect(sizes[1]).toBeGreaterThanOrEqual(26);
      expect(sizes[2]).toBeGreaterThanOrEqual(24);
      await page.screenshot({ path: "artifacts/docs-4k.png" });
    }
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))).toEqual([]);
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: testInfo.project.name === "desktop" ? 1440 : 390, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/docs-" + testInfo.project.name + "-viewport.png" });
  await page.screenshot({ path: "artifacts/docs-" + testInfo.project.name + ".png", fullPage: true });
  expect((await request.get("/docs/not-a-real-page/")).status()).toBe(404);
});

test("search supports keyboard navigation, empty results and a recoverable loading failure", async ({ page }) => {
  let fail = true;
  await page.route("**/docs-search.json", async (route) => {
    if (fail) await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.continue();
  });
  await page.goto("/docs/");
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Search the hall" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry search" })).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Retry search" }).click();
  const query = page.getByRole("combobox", { name: "Search documentation" });
  await query.fill("not-a-real-subject-xyz");
  await expect(page.getByRole("status").filter({ hasText: "No pages match" })).toBeVisible();
  await query.fill("MCP");
  await expect(page.getByRole("option", { name: /MCP & AI agents/ })).toBeVisible();
  await query.press("Enter");
  await expect(page).toHaveURL(/\/docs\/mcp\/$/);
  await expect(page.getByRole("heading", { name: "MCP & AI agents", exact: true })).toBeVisible();
  await expect(page.locator(".docs-prose")).toContainText("/api/v1/mcp");
  await expect(page.locator(".docs-prose")).toContainText("force_check");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("code examples copy successfully and explain clipboard failures", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/installation/");
  await page.getByRole("button", { name: "Copy code example" }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Code copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("anubis-linux-amd64.tar.gz");
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("Denied"); }; });
  await page.getByRole("button", { name: "Copy code example" }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Clipboard unavailable" })).toBeVisible();
});

test("documentation menu, page anchors and next-page links work", async ({ page }, testInfo) => {
  await page.goto("/docs/installation/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open documentation menu" }).click();
    await page.getByRole("navigation", { name: "Mobile documentation" }).getByRole("link", { name: "Configuration", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Mobile documentation" })).not.toBeVisible();
    await expect(page).toHaveURL(/\/docs\/configuration\/$/);
  } else {
    await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Windows x64", exact: true }).click();
    await expect(page).toHaveURL(/#windows-x64$/);
    await expect(page.locator("#windows-x64")).toBeInViewport();
    await page.getByRole("navigation", { name: "Documentation pagination" }).getByRole("link", { name: /Your first monitor/ }).click();
    await expect(page).toHaveURL(/\/docs\/first-monitor\/$/);
  }
  await expect(page.locator(".docs-prose")).toBeVisible();
});
