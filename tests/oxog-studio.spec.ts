import { test, expect } from "@playwright/test";

test("the shared OXOG signature repeats the reference drawing and pauses only for visibility or reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const route of ["/", "/docs/installation/"]) {
    await page.goto(route); await page.evaluate(() => document.fonts.ready);
    const studio = page.getByRole("link", { name: "Meet oxog.net", exact: true });
    const paths = studio.locator(".oxog-mark path"), stroke = paths.first();
    await expect(studio).toHaveAttribute("data-visible", "false");
    await expect(stroke).toHaveCSS("animation-play-state", "paused");
    await studio.scrollIntoViewIfNeeded();
    await expect(studio).toHaveAttribute("data-visible", "true");
    await expect(paths).toHaveCount(4);
    await expect(stroke).toHaveCSS("animation-name", "oxog-draw");
    await expect(stroke).toHaveCSS("animation-duration", "6s");
    await expect(stroke).toHaveCSS("animation-iteration-count", "infinite");
    await expect(stroke).toHaveCSS("animation-play-state", "running");
    for (const [i, delay] of ["0s", "0.15s", "0.3s", "0.45s"].entries()) await expect(paths.nth(i)).toHaveCSS("animation-delay", delay);
    // Sample the actual SVG drawing at two points in its six-second cycle.
    await stroke.evaluate(el => { for (const animation of el.getAnimations()) animation.currentTime = 100; });
    expect(await stroke.evaluate(el => parseFloat(getComputedStyle(el).strokeDashoffset))).toBeGreaterThan(300);
    await stroke.evaluate(el => { for (const animation of el.getAnimations()) animation.currentTime = 2500; });
    await expect(stroke).toHaveCSS("stroke-dashoffset", "0px");
    const mouse = page.locator("header .background-toggle");
    if (await mouse.getAttribute("aria-pressed") === "true") await mouse.click();
    await expect(stroke).toHaveCSS("animation-play-state", "running");
    await studio.hover(); await expect(studio).toHaveCSS("border-top-color", "rgb(237, 8, 120)");
    await studio.focus(); await expect(studio).toBeFocused();
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
    await expect(stroke).toHaveCSS("animation-play-state", "paused");
    await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
    await expect(stroke).toHaveCSS("animation-play-state", "running");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
    await expect(studio).toHaveAttribute("data-visible", "false");
    await expect(stroke).toHaveCSS("animation-play-state", "paused");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await studio.scrollIntoViewIfNeeded();
    await expect(stroke).toHaveCSS("animation-name", "none");
    await expect(stroke).toHaveCSS("stroke-dashoffset", "0px");
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
});
