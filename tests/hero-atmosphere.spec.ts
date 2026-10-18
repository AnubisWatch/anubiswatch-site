import { test, expect, type Page } from "@playwright/test";

declare global { interface Window { atmosphereDraws: number } }
const scene = (page: Page) => page.locator(".hero-atmosphere");

async function animate(page: Page) {
  await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
  await page.addInitScript(() => {
    window.atmosphereDraws = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.classList.contains("hero-atmosphere")) window.atmosphereDraws++;
      return clear.apply(this, args);
    };
  });
  await page.clock.install({ time: new Date("2030-01-01T00:00:00Z") });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(scene(page)).toHaveAttribute("data-probes", /\d+/);
  await page.clock.pauseAt(new Date("2030-01-01T01:00:00Z"));
  await page.clock.runFor(1800);
}

test("the calm alternative fills the viewport in both themes, with a bounded 4K backing store", async ({ page }, info) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ["dark", "light"]) {
    if (theme === "light") {
      await page.getByRole("button", { name: /Color theme:/ }).click();
      await page.getByRole("radio", { name: "Light", exact: true }).check();
      await page.keyboard.press("Escape");
    }
    for (const width of [375, 1440, 3840]) {
      await page.setViewportSize({ width, height: 1080 });
      await expect(scene(page)).toHaveAttribute("data-state", "reduced");
      await expect(scene(page)).toHaveAttribute("data-theme", theme);
      await expect.poll(() => scene(page).evaluate((canvas: HTMLCanvasElement) => {
        const box = canvas.getBoundingClientRect();
        return Math.abs(canvas.width - box.width * Number(canvas.dataset.dpr));
      })).toBeLessThan(3);
      const result = await scene(page).evaluate((canvas: HTMLCanvasElement) => {
        const box = canvas.getBoundingClientRect();
        const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
        const quarters = [0, 0, 0, 0];
        for (let y = 4; y < canvas.height; y += 13) for (let x = 4; x < canvas.width; x += 13) quarters[Math.min(3, Math.floor(x / canvas.width * 4))] += data[(y * canvas.width + x) * 4 + 3];
        return { left: box.left, width: box.width, pixels: canvas.width * canvas.height, dpr: Number(canvas.dataset.dpr), probes: Number(canvas.dataset.probes), quarters, pointerEvents: getComputedStyle(canvas).pointerEvents, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(result.left).toBe(0);
      expect(result.width).toBe(width);
      expect(result.pixels).toBeLessThan(4_505_000);
      expect(result.dpr).toBeLessThanOrEqual(1.75);
      expect(result.probes).toBeLessThanOrEqual(width < 700 ? 30 : 144);
      expect(result.quarters.every((alpha) => alpha > 0)).toBe(true);
      expect(result.pointerEvents).toBe("none");
      expect(result.overflow).toBe(false);
      if (info.project.name === "desktop") await page.locator(".hero-stage").screenshot({ path: `artifacts/atmosphere-${theme}-${width}.png` });
    }
  }
  expect(errors).toEqual([]);
});

test("background taps are bounded and expire; text, controls, drags and touch scrolling stay independent", async ({ page, context }, info) => {
  test.setTimeout(60_000);
  await animate(page);
  const canvas = scene(page);
  if (info.project.name === "mobile") await page.touchscreen.tap(10, 180);
  else await page.mouse.click(10, 180);
  await expect(canvas).toHaveAttribute("data-ripples", "1");
  for (let i = 0; i < 14; i++) await page.mouse.click(10, 160 + i % 7 * 70);
  const limits = await canvas.evaluate((element) => ({ ripples: Number(element.dataset.ripples), sparks: Number(element.dataset.sparks) }));
  expect(limits.ripples).toBeGreaterThan(0);
  expect(limits.ripples).toBeLessThanOrEqual(info.project.name === "mobile" ? 3 : 6);
  expect(limits.sparks).toBeLessThanOrEqual(info.project.name === "mobile" ? 24 : 64);
  const before = await canvas.getAttribute("data-ripples");
  await page.getByRole("button", { name: "Copy quick-start command" }).click();
  await page.locator("#hero-title").click();
  await expect(canvas).toHaveAttribute("data-ripples", before!);
  const image = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.clock.runFor(450);
  expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(image);
  if (info.project.name === "desktop") await page.screenshot({ path: "artifacts/atmosphere-verdict.png" });
  await page.mouse.move(10, 450);
  await page.clock.runFor(50);
  await page.mouse.move(10, 350);
  await expect(canvas).toHaveAttribute("data-trails", /[1-9]/);
  await page.mouse.move(0, 1079);
  await page.clock.runFor(4000);
  await expect(canvas).toHaveAttribute("data-ripples", "0");
  await expect(canvas).toHaveAttribute("data-sparks", "0");
  await expect(canvas).toHaveAttribute("data-trails", "0");
  await expect(canvas).toHaveAttribute("data-state", "idle");
  // Native mouse drag across empty background must not count as a tap.
  await page.mouse.move(10, 400); await page.mouse.down(); await page.mouse.move(10, 200); await page.mouse.up();
  await expect(canvas).toHaveAttribute("data-ripples", "0");
  if (info.project.name === "mobile") {
    const client = await context.newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 10, y: 650 }] });
    for (const y of [590, 500, 400, 300, 200]) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 10, y }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect(canvas).toHaveAttribute("data-ripples", "0");
    await client.detach();
  }
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
  await page.locator(".hero-actions a").first().click();
  await expect(page).toHaveURL(/#get-started$/);
  await expect(canvas).toHaveAttribute("data-ripples", "0");
});

test("manual pause, offscreen and hidden tabs stop real drawing; reduced motion stays static", async ({ page }) => {
  test.setTimeout(60_000);
  await animate(page);
  const canvas = scene(page), frames = () => page.evaluate(() => window.atmosphereDraws);
  const moving = await frames(); await page.clock.runFor(300); expect(await frames()).toBeGreaterThan(moving);
  await page.getByRole("button", { name: "Pause animations", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-state", "paused");
  const paused = await frames(); await page.clock.runFor(1000); expect(await frames()).toBe(paused);
  await page.getByRole("button", { name: "Resume animations", exact: true }).click();
  await page.clock.runFor(300); expect(await frames()).toBeGreaterThan(paused);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector(".hero-stage")!.getBoundingClientRect().bottom + scrollY + 32); });
  await expect(canvas).toHaveAttribute("data-state", "offscreen");
  const offscreen = await frames(); await page.clock.runFor(1000); expect(await frames()).toBe(offscreen);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(canvas).toHaveAttribute("data-state", /idle|running/);
  await page.mouse.click(10, 200); await page.clock.runFor(100);
  await expect(canvas).toHaveAttribute("data-ripples", "1");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(canvas).toHaveAttribute("data-state", "hidden");
  const hidden = await frames(); await page.clock.runFor(60_000); expect(await frames()).toBe(hidden);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.runFor(200);
  // A minute in a hidden tab cannot turn into a minute-long simulation step.
  await expect(canvas).toHaveAttribute("data-ripples", "1");
  expect(await frames()).toBeGreaterThan(hidden);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-state", "reduced");
  const reduced = await frames(); await page.clock.runFor(1000); expect(await frames()).toBe(reduced);
  await page.mouse.click(10, 220); await expect(canvas).toHaveAttribute("data-ripples", "0");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.runFor(300); expect(await frames()).toBeGreaterThan(reduced);
  await page.getByRole("button", { name: "Pause animations", exact: true }).click();
  await page.reload();
  await expect(canvas).toHaveAttribute("data-state", "paused");
  expect(await canvas.evaluate((c: HTMLCanvasElement) => c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data.some((value, i) => i % 4 === 3 && value > 0))).toBe(true);
});
