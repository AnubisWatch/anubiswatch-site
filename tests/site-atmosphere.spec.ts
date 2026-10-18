import { test, expect, type Page } from "@playwright/test";

declare global { interface Window { fieldWrites: number } }
const field = (page: Page) => page.locator("svg.site-atmosphere");
async function animate(page: Page) {
  await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
  await page.addInitScript(() => {
    window.fieldWrites = 0;
    const set = SVGElement.prototype.setAttribute;
    SVGElement.prototype.setAttribute = function (key, value) {
      if (this.closest(".site-atmosphere, .site-interaction-layer")) window.fieldWrites++;
      return set.call(this, key, value);
    };
  });
  await page.clock.install({ time: new Date("2030-01-01T00:00:00Z") });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(field(page)).toHaveAttribute("data-probes", /\d+/);
  await page.clock.pauseAt(new Date("2030-01-01T01:00:00Z"));
  await page.clock.runFor(1800);
}

test("organic cursor companions drift while verdict energy travels through bounded neighbour relays", async ({ page }, info) => {
  await animate(page);
  const overlay = page.locator(".site-interaction-layer");
  await page.mouse.move(160, 330); await page.clock.runFor(300);
  const companion = overlay.locator("[data-orbit]").first();
  const initial = await companion.getAttribute("transform");
  await page.clock.runFor(700);
  expect(await companion.getAttribute("transform")).not.toBe(initial);
  const y = await field(page).locator('[data-unit][visibility="visible"]').evaluateAll(nodes => {
    const near = nodes.map(node => node.getBoundingClientRect()).filter(r => r.x < 180 && r.y > 180 && r.y < innerHeight - 100).sort((a, b) => a.x - b.x)[0];
    if (!near) throw new Error("No visible probe near the page margin");
    return near.y + near.height / 2;
  });
  await page.mouse.click(8, y);
  let peak = 0, resonance = 0, linkOpacity = 0;
  for (let i = 0; i < 18; i++) {
    await page.clock.runFor(80);
    const active = overlay.locator('[data-relay][visibility="visible"]');
    const count = await active.count(); peak = Math.max(peak, count);
    resonance = Math.max(resonance, await overlay.locator("[data-resonance]").evaluateAll(nodes => Math.max(...nodes.map(n => Number(n.getAttribute("opacity"))))));
    if (count) {
      expect(await active.first().locator("path").getAttribute("d")).toMatch(/^M.+Q/);
      linkOpacity = Math.max(linkOpacity, Number(await active.first().getAttribute("opacity")));
      if (info.project.name === "desktop" && i === 7) await page.screenshot({ path: "artifacts/svg-organic-cascade.png" });
    }
  }
  expect(peak).toBeGreaterThan(0); expect(peak).toBeLessThanOrEqual(info.project.name === "mobile" ? 8 : 24);
  expect(resonance).toBeGreaterThan(0.05);
  expect(linkOpacity).toBeGreaterThan(0.02);
  await page.mouse.move(-10, -10); await page.clock.runFor(4500);
  expect(await overlay.locator('[data-relay][visibility="visible"]').count()).toBe(0);
  expect(await overlay.locator('[data-response][visibility="visible"]').count()).toBe(0);
});

test("pointer reactions cross text and clipped cards above content, with viewport coordinates during scroll", async ({ page }, info) => {
  test.setTimeout(60_000);
  await animate(page);
  const svg = field(page), overlay = page.locator("svg.site-interaction-layer");
  const title = await page.locator("#hero-title").boundingBox();
  const x = title!.x + title!.width / 2, y = title!.y + title!.height / 2;
  await page.mouse.move(x - 24, y); await page.clock.runFor(80);
  await page.mouse.move(x + 24, y); await page.clock.runFor(200);
  await expect(svg).toHaveAttribute("data-trails", /[1-9]/);
  await expect(overlay).toHaveCount(1);
  await expect(overlay.locator("[data-aura]")).toHaveAttribute("visibility", "visible");
  expect(Number(await overlay.locator("[data-aura]").getAttribute("opacity"))).toBeGreaterThan(0.1);
  const geometry = await overlay.evaluate(el => ({ parent: el.parentElement?.tagName, z: Number(getComputedStyle(el).zIndex), events: getComputedStyle(el).pointerEvents, mask: getComputedStyle(el).maskImage, position: getComputedStyle(el).position }));
  expect(geometry).toEqual({ parent: "BODY", z: 10, events: "none", mask: "none", position: "fixed" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.querySelector(".features")!.scrollIntoView(); });
  await page.clock.runFor(250);
  // Scrolling does not deactivate the stationary pointer or add document offsets.
  await expect(overlay.locator("[data-aura]")).toHaveAttribute("transform", `translate(${(x + 24).toFixed(2)} ${y.toFixed(2)})`);
  expect(Number(await overlay.locator("[data-aura]").getAttribute("opacity"))).toBeGreaterThan(0.1);
  const card = await page.locator(".feature-card").first().boundingBox();
  const cx = card!.x + card!.width / 2, cy = Math.max(180, Math.min(card!.y + 120, 600));
  for (const px of [cx - 50, cx, cx + 50]) { await page.mouse.move(px, cy); await page.clock.runFor(100); }
  expect(await overlay.locator('[data-trail][visibility="visible"]').count()).toBeGreaterThan(0);
  expect(await overlay.locator('[data-response][visibility="visible"]').count()).toBeGreaterThan(0);
  // A nearby probe really moves, rather than only changing a diagnostic counter.
  const probe = overlay.locator('[data-response][visibility="visible"]').first();
  const before = await probe.getAttribute("transform");
  await page.mouse.move(cx + 10, cy + 35); await page.clock.runFor(450);
  expect(await probe.getAttribute("transform")).not.toBe(before);
  await page.mouse.click(card!.x + 8, card!.y + 8); await page.clock.runFor(200);
  const crossing = overlay.locator('[data-wave][visibility="visible"]').first();
  const circle = await crossing.locator("circle").first().boundingBox();
  expect(circle!.x).toBeLessThan(card!.x);
  expect(circle!.x + circle!.width).toBeGreaterThan(card!.x + 20);
  // A card's overflow:hidden cannot clip a sibling viewport layer.
  if (info.project.name === "desktop") await page.screenshot({ path: "artifacts/svg-reaction-card-dark.png" });
  await page.mouse.move(8, 300); await page.mouse.click(8, 300); await page.clock.runFor(200);
  await expect(overlay.locator('[data-wave][visibility="visible"]').last()).toHaveAttribute("transform", "translate(8 300)");
  await page.mouse.move(-10, -10); await page.clock.runFor(4000);
  await expect(overlay.locator("[data-aura]")).toHaveAttribute("visibility", "hidden");
  await expect(overlay.locator("[data-orbit]").first()).toBeHidden();
  expect(await overlay.locator('[data-response][visibility="visible"]').count()).toBe(0);
});

test("light-mode reading areas retain local reactions, short waves and idle fade without intercepting selection", async ({ page }, info) => {
  test.setTimeout(60_000);
  await animate(page);
  await page.getByRole("button", { name: /Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await page.keyboard.press("Escape");
  await page.goto("/docs/installation/"); await page.clock.runFor(1800);
  const overlay = page.locator("svg.site-interaction-layer");
  const reading = page.locator(".docs-reading");
  await reading.locator("p").first().scrollIntoViewIfNeeded();
  const r = await reading.locator("p").first().boundingBox();
  const x = r!.x + Math.min(r!.width / 2, 200), y = r!.y + 14;
  await page.mouse.move(x - 25, y); await page.clock.runFor(100);
  await page.mouse.move(x + 25, y); await page.clock.runFor(350);
  await expect(overlay.locator("[data-aura]")).toHaveAttribute("visibility", "visible");
  const hit = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest(".docs-reading"), { x, y });
  expect(hit).toBe(true);
  if (info.project.name === "desktop") await page.screenshot({ path: "artifacts/svg-reaction-docs-light.png" });
  // A stationary cursor decays, even while still over reading content.
  await page.clock.runFor(4200);
  await expect(overlay.locator("[data-aura]")).toHaveAttribute("visibility", "hidden");
  await expect(overlay.locator("[data-orbit]").first()).toBeHidden();
  await page.mouse.move(x, y); await page.clock.runFor(200);
  await expect(overlay.locator("[data-aura]")).toHaveAttribute("visibility", "visible");
  await page.mouse.move(x - 60, y); await page.mouse.down();
  await page.mouse.move(x + 60, y, { steps: 8 }); await page.mouse.up();
  expect(await page.evaluate(() => getSelection()?.toString().length ?? 0)).toBeGreaterThan(0);
  await expect(field(page)).toHaveAttribute("data-ripples", "0");
  await page.getByRole("button", { name: /Search documentation/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
});

test("a single vector field fills marketing and documentation at mobile, desktop and 4K widths in both themes", async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  for (const route of ["/", "/docs/installation/"]) {
    await page.setViewportSize({ width: 375, height: 1080 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ["dark", "light"]) {
      await page.getByRole("button", { name: /Color theme:/ }).click();
      await page.getByRole("radio", { name: theme === "dark" ? "Dark" : "Light", exact: true }).check();
      await page.keyboard.press("Escape");
      // Phone/tablet orientation changes and desktop/4K are separate device cases.
      for (const width of info.project.name === "mobile" ? [320, 375, 768, 1024] : [375, 1440, 3840]) {
        await page.setViewportSize({ width, height: 1080 });
        await expect(field(page)).toHaveCount(1);
        await expect(field(page)).toHaveAttribute("data-state", "reduced");
        await expect(field(page)).toHaveAttribute("data-theme", theme);
        await expect(field(page)).toHaveAttribute("viewBox", `0 0 ${width} 1080`);
        const result = await field(page).evaluate(svg => {
          const box = svg.getBoundingClientRect();
          const uses = [...svg.querySelectorAll("use")];
          const brand = document.querySelector(".docs-header .brand > span"), search = document.querySelector(".docs-search-trigger");
          const brandOverlap = !!(brand && search && brand.getBoundingClientRect().right > search.getBoundingClientRect().left + 0.5);
          return { width: box.width, top: box.top, left: box.left, position: getComputedStyle(svg).position, events: getComputedStyle(svg).pointerEvents, pool: uses.length, active: Number(svg.dataset.probes), visible: Number(svg.dataset.visible), refs: uses.every(use => !!document.getElementById(use.getAttribute("href")!.slice(1))), brandOverlap, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, clipped: [...document.querySelectorAll("header button,header a")].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < 0 || r.right > document.documentElement.clientWidth + 1); }).map(el => el.className) };
        });
        expect(result.width).toBe(width); expect(result.top).toBe(0); expect(result.left).toBe(0);
        expect(result.position).toBe("fixed"); expect(result.events).toBe("none");
        expect(result.pool).toBeLessThanOrEqual(112); expect(result.active).toBeLessThanOrEqual(width < 700 ? 28 : 112);
        expect(result.refs).toBe(true); expect(result.overflow).toBe(false); expect(result.clipped).toEqual([]);
        expect(result.brandOverlap, `${route} ${theme} ${width}px`).toBe(false);
        if (info.project.name === "desktop" && width === 1440) await page.screenshot({ path: `artifacts/svg-${route === "/" ? "home" : "docs"}-${theme}-${width}.png` });
        if (info.project.name === "mobile" && route !== "/" && theme === "light" && width === 320) await page.screenshot({ path: "artifacts/svg-docs-light-320.png" });
      }
    }
  }
  expect(errors).toEqual([]);
});

test("the same SVG continues below the hero and through the footer, and visible vectors respond to pointer input", async ({ page }, info) => {
  await animate(page);
  const svg = field(page);
  const identity = await svg.getAttribute("class");
  for (const selector of ["#platform", ".features", "#faq", ".site-footer"]) {
    await page.evaluate(selector => { document.documentElement.style.scrollBehavior = "auto"; document.querySelector(selector)!.scrollIntoView(); }, selector);
    await page.clock.runFor(350);
    expect(await svg.getAttribute("class")).toBe(identity);
    const box = await svg.boundingBox(); expect(box!.y).toBe(0); expect(box!.height).toBe(info.project.use.viewport?.height ?? 839);
    const before = await svg.locator("[data-route]").evaluateAll(nodes => nodes.map(node => node.getAttribute("d")).join("|"));
    await page.mouse.move(8, 300);
    await page.clock.runFor(300);
    const after = await svg.locator("[data-route]").evaluateAll(nodes => nodes.map(node => node.getAttribute("d")).join("|"));
    expect(after).not.toBe(before);
    await expect(svg).toHaveAttribute("data-state", /idle|running/);
  }
  await page.mouse.click(8, 300); await page.clock.runFor(250);
  await expect(svg).toHaveAttribute("data-ripples", "1");
  const wave = page.locator('.site-interaction-layer [data-wave][visibility="visible"]').first();
  const radius = Number(await wave.locator("circle").first().getAttribute("r"));
  expect(radius).toBeGreaterThan(10); expect(radius).toBeLessThan(280);
  if (info.project.name === "desktop") await page.screenshot({ path: "artifacts/svg-footer-wave.png" });
});

test("tap bursts are capped and expire, while controls, text selection, drags and native touch scrolling stay independent", async ({ page, context }, info) => {
  test.setTimeout(60_000);
  await animate(page);
  const svg = field(page);
  if (info.project.name === "mobile") await page.touchscreen.tap(8, 180);
  else await page.mouse.click(8, 180);
  await expect(svg).toHaveAttribute("data-ripples", "1");
  for (let i = 0; i < 14; i++) await page.mouse.click(8, 160 + i % 7 * 70);
  const counts = await svg.evaluate(el => ({ waves: Number(el.dataset.ripples), sparks: Number(el.dataset.sparks) }));
  expect(counts.waves).toBeGreaterThan(0); expect(counts.waves).toBeLessThanOrEqual(info.project.name === "mobile" ? 3 : 6);
  expect(counts.sparks).toBeLessThanOrEqual(info.project.name === "mobile" ? 18 : 54);
  const waves = await svg.getAttribute("data-ripples");
  await page.getByRole("button", { name: "Copy quick-start command" }).click(); await page.locator("#hero-title").click();
  await expect(svg).toHaveAttribute("data-ripples", waves!);
  await page.mouse.move(8, 450); await page.clock.runFor(60); await page.mouse.move(8, 350);
  await expect(svg).toHaveAttribute("data-trails", /[1-9]/);
  await page.mouse.move(-10, -10); await page.clock.runFor(4000);
  await expect(svg).toHaveAttribute("data-ripples", "0"); await expect(svg).toHaveAttribute("data-sparks", "0"); await expect(svg).toHaveAttribute("data-trails", "0");
  await page.mouse.move(8, 400); await page.mouse.down(); await page.mouse.move(8, 200); await page.mouse.up();
  await expect(svg).toHaveAttribute("data-ripples", "0");
  if (info.project.name === "mobile") {
    const client = await context.newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 8, y: 650 }] });
    for (const y of [590, 500, 400, 300, 200]) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 8, y }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect(svg).toHaveAttribute("data-ripples", "0"); await client.detach();
  }
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
  await page.locator(".hero-actions a").first().click(); await expect(page).toHaveURL(/#get-started$/);
  await expect(svg).toHaveAttribute("data-ripples", "0");
});

test("hidden and occluded vectors stop updating, pause persists into docs, and reduced motion is static", async ({ page, context }) => {
  test.setTimeout(60_000);
  await animate(page);
  const svg = field(page), writes = () => page.evaluate(() => window.fieldWrites);
  const active = await writes(); await page.clock.runFor(300); expect(await writes()).toBeGreaterThan(active);
  const invisible = svg.locator('[data-unit][data-active="true"][data-visible="false"]').first();
  expect(await invisible.count()).toBe(1);
  const transform = await invisible.getAttribute("transform"); await page.clock.runFor(200);
  expect(await invisible.getAttribute("transform")).toBe(transform);
  await page.getByRole("button", { name: "Animasyonları kapat", exact: true }).click();
  await expect(svg).toHaveAttribute("data-state", "paused"); await page.clock.runFor(100);
  await expect(page.locator("svg.site-interaction-layer")).toBeHidden();
  const paused = await writes(); await page.clock.runFor(1000); expect(await writes()).toBe(paused);
  const docs = await context.newPage();
  await docs.emulateMedia({ reducedMotion: "no-preference" });
  await docs.goto("/docs/installation/");
  await expect(field(docs)).toHaveAttribute("data-state", "paused");
  await docs.getByRole("button", { name: "Animasyonları aç", exact: true }).click();
  await expect(svg).toHaveAttribute("data-state", /running|idle/);
  await docs.close(); await page.bringToFront(); await page.clock.runFor(250);
  await page.mouse.click(8, 200); await page.clock.runFor(100);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(svg).toHaveAttribute("data-state", "hidden");
  const hidden = await writes(); await page.clock.runFor(60_000); expect(await writes()).toBe(hidden);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.runFor(200); await expect(svg).toHaveAttribute("data-ripples", "1");
  await page.evaluate(() => { localStorage.removeItem("anubiswatch-background-motion"); window.dispatchEvent(new StorageEvent("storage", { key: "anubiswatch-background-motion" })); });
  await page.emulateMedia({ reducedMotion: "reduce" }); await expect(svg).toHaveAttribute("data-state", "reduced"); await page.clock.runFor(100);
  const reduced = await writes(); await page.clock.runFor(1000); expect(await writes()).toBe(reduced);
  await page.mouse.click(8, 220); await expect(svg).toHaveAttribute("data-ripples", "0");
  await page.emulateMedia({ reducedMotion: "no-preference" }); await page.clock.runFor(300); expect(await writes()).toBeGreaterThan(reduced);
  // A quota/read-only failure must not undo the user's current-session choice.
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("Read-only storage"); }; });
  await page.getByRole("button", { name: "Animasyonları kapat", exact: true }).click();
  await expect(svg).toHaveAttribute("data-state", "paused");
});
