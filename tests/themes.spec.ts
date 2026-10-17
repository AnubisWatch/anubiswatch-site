import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("theme follows the device until a saved choice overrides it across pages and tabs", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/docs/");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const other = await context.newPage();
  await other.goto("/docs/mcp/");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(other.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("theme switching works when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Unavailable"); };
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("studio attribution and both themes remain readable and responsive", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const studio = page.getByRole("region", { name: "The studio behind AnubisWatch" });
  await expect(studio.getByRole("link", { name: "Visit OXOGNET" })).toHaveAttribute("href", "https://oxog.net");
  await expect(studio.getByRole("navigation", { name: "More from OXOGNET" }).getByRole("link")).toHaveCount(4);
  for (const theme of ["dark", "light"] as const) {
    if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
    for (const width of testInfo.project.name === "desktop" ? [3840, 1920, 1440, 1024, 768] : [412, 390, 320]) {
      await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const control = await page.getByRole("button", { name: /Switch to .* theme/ }).boundingBox();
      expect(control!.x + control!.width).toBeLessThanOrEqual(width);
      const clippedControls = await page.locator(".site-header a, .site-header button").evaluateAll((controls) => controls.filter((control) => {
        const rectangle = control.getBoundingClientRect();
        return rectangle.width > 0 && (rectangle.left < 0 || rectangle.right > innerWidth);
      }).map((control) => control.getAttribute("aria-label") ?? control.textContent));
      expect(clippedControls, "header controls at " + width).toEqual([]);
      const symbol = await studio.locator("svg.oxog-mark").boundingBox();
      expect(symbol!.width).toBeGreaterThanOrEqual(100);
    }
    await page.setViewportSize({ width: testInfo.project.name === "desktop" ? 1440 : 390, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })) }))).toEqual([]);
    await page.screenshot({ path: "artifacts/" + theme + "-" + testInfo.project.name + "-hero.png" });
    await studio.screenshot({ path: "artifacts/" + theme + "-" + testInfo.project.name + "-oxog.png" });
  }
});

test("documentation code, search and studio adapt to the light theme", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/docs/installation/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  for (const width of testInfo.project.name === "desktop" ? [1440, 1024, 768] : [390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const clipped = await page.locator(".docs-header a, .docs-header button").evaluateAll((controls) => controls.filter((control) => {
      const rectangle = control.getBoundingClientRect();
      return rectangle.width > 0 && (rectangle.left < 0 || rectangle.right > innerWidth);
    }).map((control) => control.getAttribute("aria-label") ?? control.textContent));
    expect(clipped, "documentation header controls at " + width).toEqual([]);
  }
  await page.setViewportSize({ width: testInfo.project.name === "desktop" ? 1440 : 390, height: 1000 });
  const colors = await page.evaluate(() => ({ body: getComputedStyle(document.body).backgroundColor, header: getComputedStyle(document.querySelector(".docs-header")!).backgroundColor, code: getComputedStyle(document.querySelector(".docs-code")!).backgroundColor }));
  expect(colors.header).not.toContain("0.155");
  expect(colors.code).not.toBe("rgb(9, 13, 11)");
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })) }))).toEqual([]);
  await page.screenshot({ path: "artifacts/light-" + testInfo.project.name + "-docs.png" });
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  await page.getByRole("combobox", { name: "Search documentation" }).fill("MCP");
  await expect(page.getByRole("option", { name: /MCP & AI agents/ })).toBeVisible();
  const searchAccessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(searchAccessibility.violations.map((violation) => violation.id)).toEqual([]);
  await page.screenshot({ path: "artifacts/light-" + testInfo.project.name + "-search.png" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region", { name: "The studio behind AnubisWatch" })).toBeAttached();
  expect(errors).toEqual([]);
});
