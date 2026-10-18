import { test, expect } from "@playwright/test";

declare global { interface Window { backgroundSignals: AbortSignal[]; backgroundWrites: number } }
const key = "anubiswatch-background-motion";
const field = "svg.site-atmosphere";

test("the mouse toggle clears effects, detaches input and stops its loop without freezing artwork", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    window.backgroundSignals = []; window.backgroundWrites = 0;
    const listen = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, callback, options) {
      if ((this === document || this === window) && ["pointermove", "pointerdown", "pointerup", "pointercancel", "pointerout", "scroll", "resize", "blur", "visibilitychange"].includes(type) && typeof options === "object" && options?.signal) window.backgroundSignals.push(options.signal);
      return listen.call(this, type, callback, options);
    };
    const write = SVGElement.prototype.setAttribute;
    SVGElement.prototype.setAttribute = function (name, value) {
      if (this.closest(".site-atmosphere, .site-interaction-layer")) window.backgroundWrites++;
      return write.call(this, name, value);
    };
  });
  await page.clock.install({ time: new Date("2030-01-01T00:00:00Z") });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(field)).toHaveAttribute("data-probes", /\d+/);
  await page.clock.pauseAt(new Date("2030-01-01T01:00:00Z")); await page.clock.runFor(1800);
  const active = () => page.evaluate(() => window.backgroundSignals.filter(signal => !signal.aborted).length);
  const initial = await active(); expect(initial).toBeGreaterThan(0);
  await page.mouse.click(8, 300); await page.clock.runFor(200);
  await expect(page.locator(field)).toHaveAttribute("data-ripples", "1");
  const off = page.getByRole("button", { name: "Animasyonları kapat", exact: true });
  await expect(off).toHaveAttribute("aria-pressed", "true");
  await expect(off).toHaveAttribute("title", "Animasyonları kapat");
  await off.focus(); await page.keyboard.press("Space");
  const on = page.getByRole("button", { name: "Animasyonları aç", exact: true });
  await expect(on).toHaveAttribute("aria-pressed", "false");
  await expect(on).toHaveAttribute("title", "Animasyonları aç");
  await expect(on.locator(".lucide-mouse-off")).toHaveCount(1);
  await expect.poll(active).toBe(0);
  for (const attribute of ["data-ripples", "data-sparks", "data-trails"]) await expect(page.locator(field)).toHaveAttribute(attribute, "0");
  await expect(page.locator(".site-interaction-layer")).toBeHidden();
  await expect(page.locator(".celestial-sweep")).toHaveCSS("animation-play-state", "running");
  await page.clock.runFor(200);
  const writes = await page.evaluate(() => window.backgroundWrites);
  await page.mouse.move(8, 400); await page.mouse.click(8, 400); await page.clock.runFor(1200);
  expect(await page.evaluate(() => window.backgroundWrites)).toBe(writes);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe("off");
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Animasyonları aç", exact: true }).click();
    await expect.poll(active).toBe(initial);
    await page.getByRole("button", { name: "Animasyonları kapat", exact: true }).click();
    await expect.poll(active).toBe(0);
  }
  await on.focus(); await page.keyboard.press("Enter"); await page.clock.runFor(250);
  expect(await page.evaluate(() => window.backgroundWrites)).toBeGreaterThan(writes);
});

test("first use follows reduced motion, explicit opt-in works and the choice persists across pages and tabs", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(field)).toHaveAttribute("data-state", "reduced");
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  const on = page.getByRole("button", { name: "Animasyonları aç", exact: true });
  await expect(on).toBeEnabled(); await expect(on).toHaveAttribute("aria-pressed", "false");
  await on.click();
  await expect(page.locator(field)).toHaveAttribute("data-state", /running|idle/);
  await expect(page.locator(".site-interaction-layer")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Animasyonları kapat", exact: true })).toHaveAttribute("aria-pressed", "true");
  const docs = await context.newPage(); await docs.emulateMedia({ reducedMotion: "reduce" });
  await docs.goto("/docs/installation/");
  await expect(docs.locator(field)).toHaveAttribute("data-state", /running|idle/);
  await docs.getByRole("button", { name: "Animasyonları kapat", exact: true }).click();
  await expect(page.locator(field)).toHaveAttribute("data-state", "paused");
  await expect(on).toBeVisible();
  await page.reload(); await expect(on).toBeVisible();
  await docs.evaluate(key => localStorage.removeItem(key), key);
  await expect(page.locator(field)).toHaveAttribute("data-state", "reduced");
  await docs.close();
});

test("both headers keep the adjacent mouse button touchable at narrow and wide widths", async ({ page }, info) => {
  test.setTimeout(60_000);
  for (const route of ["/", "/docs/installation/"]) {
    await page.goto(route); await page.evaluate(() => document.fonts.ready);
    for (const width of info.project.name === "mobile" ? [320, 375, 768, 1024] : [320, 375, 768, 1440, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      const button = page.locator("header .background-toggle");
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(await button.evaluate(el => el.nextElementSibling?.contains(document.querySelector('[aria-label^="Color theme:"]')))).toBe(true);
      if (route !== "/") {
        const overlap = await page.evaluate(() => document.querySelector(".docs-header .brand > span")!.getBoundingClientRect().right > document.querySelector(".docs-search-trigger")!.getBoundingClientRect().left + .5);
        expect(overlap, `Documentation header at ${width}px`).toBe(false);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
      if (info.project.name === "desktop" && width === 1440) await page.screenshot({ path: `artifacts/mouse-toggle-${route === "/" ? "home" : "docs"}.png` });
    }
    await page.setViewportSize({ width: 375, height: 1000 });
    const button = page.locator("header .background-toggle"), box = await button.boundingBox();
    if (info.project.name === "mobile") {
      const before = await button.getAttribute("aria-pressed");
      await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(button).toHaveAttribute("aria-pressed", before === "true" ? "false" : "true");
    }
  }
});
