import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("page renders without runtime errors, stays within the viewport and is accessible", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The JudgmentNever Sleeps.");
  await expect(page.getByRole("link", { name: "Summon your guardian" })).toHaveAttribute("href", "#get-started");
  for (const width of testInfo.project.name === "desktop" ? [1440, 1024, 768] : [412, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: testInfo.project.name === "desktop" ? 1440 : 390, height: 1000 });
  await expect(page.locator(".guardian-logo")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })) }))).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({ path: "artifacts/" + testInfo.project.name + "-full.png", fullPage: true });
  await page.screenshot({ path: "artifacts/" + testInfo.project.name + "-hero.png" });
  if (testInfo.project.name === "desktop") {
    await page.locator("#platform").screenshot({ path: "artifacts/desktop-platform.png" });
    await page.locator(".features").screenshot({ path: "artifacts/desktop-features.png" });
  }
});

test("demo follows an incident through the overview and recovery", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Simulate an incident" }).click();
  await expect(page.getByText("Attention required", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Incidents", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Production API is degraded" })).toBeVisible();
  await expect(page.getByText("Slack notified")).toBeVisible();
  await page.getByRole("button", { name: "Restore service" }).click();
  await expect(page.getByRole("heading", { name: "Nothing disturbs the balance." })).toBeVisible();
  await expect(page.getByText("All systems operational", { exact: true })).toBeVisible();
});

test("protocols and workflow can be explored with keyboard navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "HTTP / HTTPS", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "TLS", exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { name: "A certificate deserves a guardian." })).toBeVisible();
  await page.getByRole("tab", { name: /Define a soul/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Send the jackals/ })).toBeFocused();
  await expect(page.locator("#workflow-panel")).toContainText("region-aware distribution");
  await page.getByRole("button", { name: "jackal-03, AP SOUTH" }).click();
  await expect(page.locator(".cluster-node-detail")).toContainText("jackal-03");
});

test("install choices update commands and copy handles success and failure", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Windows x64" }).click();
  await expect(page.locator(".install-code")).toContainText("Expand-Archive");
  await expect(page.locator(".install-code")).toContainText("Move-Item .\\anubis-windows-amd64.exe");
  await page.getByRole("button", { name: "Copy installation command" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Command copied to clipboard" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("anubis-windows-amd64.zip");
  await page.getByRole("tab", { name: "Docker", exact: true }).click();
  await expect(page.locator(".install-code")).toContainText("-v anubis-data:/data");
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("Denied"); }; });
  await page.getByRole("button", { name: "Copy installation command" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Clipboard unavailable" })).toBeVisible();
  await page.getByRole("tab", { name: "From source", exact: true }).click();
  await expect(page.locator(".install-code")).toContainText("./run.sh");
});

test("FAQ expands and navigation reaches the installation section", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Get started" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
  } else {
    await page.locator(".header-start").click();
  }
  await expect(page).toHaveURL(/#get-started$/);
  await page.getByText("How does the Egyptian mythology fit?", { exact: true }).click();
  await expect(page.locator("details[open]")).toContainText("feather of Ma’at");
});

test("SVG motion pauses offscreen, remembers the manual choice and respects device preferences", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const sweep = page.locator(".celestial-sweep");
  const beam = page.locator(".balance-beam");
  await expect(sweep).toHaveCSS("animation-play-state", "running");
  await expect(beam).toHaveCSS("animation-play-state", "paused");
  await page.getByRole("button", { name: "Pause animations", exact: true }).click();
  await expect(sweep).toHaveCSS("animation-play-state", "paused");
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume animations", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(sweep).toHaveCSS("animation-play-state", "paused");
  await page.getByRole("button", { name: "Resume animations", exact: true }).click();
  await expect(sweep).toHaveCSS("animation-play-state", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(sweep).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(sweep).toHaveCSS("animation-play-state", "running");
  await page.locator(".myth-art").scrollIntoViewIfNeeded();
  await expect(beam).toHaveCSS("animation-play-state", "running");
  await expect(sweep).toHaveCSS("animation-play-state", "paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(beam).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("button", { name: "Motion reduced by device settings" })).toBeDisabled();
});

test("motion controls still work when browser storage is unavailable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Pause animations", exact: true }).click();
  await expect(page.locator(".celestial-sweep")).toHaveCSS("animation-play-state", "paused");
  await page.getByRole("button", { name: "Resume animations", exact: true }).click();
  await expect(page.locator(".celestial-sweep")).toHaveCSS("animation-play-state", "running");
  expect(errors).toEqual([]);
});
