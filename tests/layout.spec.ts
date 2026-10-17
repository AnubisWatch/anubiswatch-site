import { test, expect } from "@playwright/test";

test("shared containers align, wide grids use space and prose stays readable", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const widths = [375, 768, 1024, 1440, 1920, 2560];
  const measurements: unknown[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  for (const route of ["/", "/docs/configuration/"]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ["dark", "light"]) {
      if (theme === "light") {
        await page.getByRole("button", { name: /Color theme:/ }).click();
        await page.getByRole("radio", { name: "Light", exact: true }).check();
        await page.keyboard.press("Escape");
      }
      for (const width of widths) {
        await page.setViewportSize({ width, height: width >= 1920 ? 1080 : 900 });
        // Measure a painted layout, after viewport-dependent font units settle.
        await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        const result = await page.evaluate((isDocs) => {
          const selectors = isDocs ? [".docs-header-inner", ".docs-workspace", ".docs-studio-wrap", ".docs-footer"] : [".header-inner", ".hero", ".platform", ".features", ".site-footer"];
          const bounds = selectors.map((selector) => {
            const box = document.querySelector(selector)!.getBoundingClientRect();
            return { selector, left: box.left, right: box.right, width: box.width };
          });
          const clipped = [...document.querySelectorAll("header a, header button, .service-row, .feature-card, .docs-table-wrap, .docs-code")].filter((element) => {
            const box = element.getBoundingClientRect();
            return box.width > 0 && (box.left < -.5 || box.right > innerWidth + .5);
          }).map((element) => element.className);
          const prose = document.querySelector(isDocs ? ".docs-prose > p" : ".feature-cluster p")!;
          const data = document.querySelector(isDocs ? ".docs-code" : ".dashboard-frame")!;
          const grid = document.querySelector(".feature-grid");
          return { bounds, clipped, overflow: document.documentElement.scrollWidth > innerWidth, prose: prose.getBoundingClientRect().width, data: data.getBoundingClientRect().width, columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : null };
        }, route !== "/");
        expect(result.overflow, route + " " + width + " " + theme).toBe(false);
        expect(result.clipped, route + " " + width + " " + theme).toEqual([]);
        for (const box of result.bounds) {
          expect(Math.abs(box.left - result.bounds[0].left), box.selector + " aligns at " + width).toBeLessThan(1);
          expect(Math.abs(box.width - result.bounds[0].width), box.selector + " width at " + width).toBeLessThan(1);
          expect(box.width).toBeLessThanOrEqual(width);
          if (width === 1440) expect(box.width).toBeGreaterThanOrEqual(1300);
          if (width >= 1920) {
            expect(box.width).toBeGreaterThanOrEqual(1680);
            expect(box.width).toBeLessThanOrEqual(1750);
          }
        }
        if (width >= 1920) {
          expect(result.prose).toBeLessThan(850);
          expect(result.data).toBeGreaterThan(result.prose);
          if (route === "/") expect(result.columns).toBe(4);
        }
        measurements.push({ route, theme, width, ...result });
        if (testInfo.project.name === "desktop" && theme === "dark") {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: "artifacts/layout-" + (route === "/" ? "home" : "docs") + "-" + width + ".png" });
          if (route === "/") await page.locator(".feature-grid").screenshot({ path: "artifacts/layout-cards-" + width + ".png", style: ".site-header, .skip-link { visibility: hidden !important; }" });
        }
      }
      if (theme === "light") {
        await page.getByRole("button", { name: /Color theme:/ }).click();
        await page.getByRole("radio", { name: "Dark", exact: true }).check();
        await page.keyboard.press("Escape");
      }
    }
  }
  expect(errors).toEqual([]);
  await testInfo.attach("layout-measurements", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
});
