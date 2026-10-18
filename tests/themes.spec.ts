import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function chooseTheme(page: Page, choice: "Light" | "Dark" | "System") {
  await page.getByRole("button", { name: /Color theme:/ }).click();
  await page.getByRole("radio", { name: choice, exact: true }).check();
  await expect(page.getByRole("radio", { name: choice, exact: true })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Appearance" })).not.toBeVisible();
}

test("theme follows the device until a saved choice overrides it across pages and tabs", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await chooseTheme(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/docs/");
  await expect(page.getByRole("button", { name: "Color theme: Dark" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const other = await context.newPage();
  await other.goto("/docs/mcp/");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await chooseTheme(page, "Light");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await other.emulateMedia({ colorScheme: "dark" });
  await chooseTheme(page, "System");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(other.getByRole("button", { name: "Color theme: System" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.getByRole("button", { name: "Color theme: System" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("theme switching works when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Unavailable"); };
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await chooseTheme(page, "Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await chooseTheme(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await chooseTheme(page, "System");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("appearance menu supports keyboard choices, dismissal and responsive previews", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Color theme:/ });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Appearance" });
  await expect(page.getByRole("radio", { name: "System", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Light", exact: true })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))).toEqual([]);
  for (const width of testInfo.project.name === "desktop" ? [3840, 1440, 1024, 768] : [390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const bounds = await menu.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: testInfo.project.name === "desktop" ? 1440 : 390, height: 1000 });
  await page.screenshot({ path: "artifacts/theme-menu-" + testInfo.project.name + "-dark.png" });
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await page.screenshot({ path: "artifacts/theme-menu-" + testInfo.project.name + "-light.png" });
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(menu).not.toBeVisible();
  await trigger.click();
  await page.locator(".site-header").getByRole("link", { name: "AnubisWatch home" }).click();
  await expect(menu).not.toBeVisible();
  await trigger.click();
  await page.keyboard.press("Tab");
  await expect(menu).not.toBeVisible();
});

test("studio attribution and both themes remain readable and responsive", async ({ page }, testInfo) => {
  // Two themes, a viewport matrix and two accessibility scans share this budget.
  test.setTimeout(60_000);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const studio = page.getByRole("region", { name: "The studio behind AnubisWatch" });
  await expect(studio.getByRole("link", { name: "Visit OXOGNET" })).toHaveAttribute("href", "https://oxog.net");
  await expect(studio.getByRole("navigation", { name: "More from OXOGNET" }).getByRole("link")).toHaveCount(4);
  for (const theme of ["dark", "light"] as const) {
    if (theme === "light") await chooseTheme(page, "Light");
    for (const width of testInfo.project.name === "desktop" ? [3840, 1920, 1440, 1024, 768] : [412, 390, 320]) {
      await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1000 });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const control = await page.getByRole("button", { name: /Color theme:/ }).boundingBox();
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
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
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
