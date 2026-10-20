import { test, expect } from "@playwright/test";

test("mobile navigation manages focus, dismissal and breakpoint changes on both layouts", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  for (const [route, selector, name, desktop] of [
    ["/", "#menu-toggle", "Mobile navigation", 768],
    ["/docs/installation/", ".docs-mobile-toggle", "Mobile documentation", 1024],
  ] as const) {
    await page.goto(route);
    const trigger = page.locator(selector), nav = page.getByRole("navigation", { name, exact: true });
    await trigger.click(); await expect(nav.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape"); await expect(nav).toBeHidden(); await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await trigger.click(); await page.getByRole("button", { name: /Color theme:/ }).click();
    await expect(nav).toBeHidden(); await page.keyboard.press("Escape");
    await trigger.click(); await page.setViewportSize({ width: desktop, height: 667 });
    await expect(nav).toBeHidden(); await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
});

test("theme and search panels remain usable on short landscape screens", async ({ page }) => {
  for (const height of [256, 320, 390]) {
    await page.setViewportSize({ width: 768, height }); await page.goto("/docs/installation/");
    const trigger = page.getByRole("button", { name: /Color theme:/ });
    await trigger.click(); const panel = page.getByRole("dialog", { name: "Appearance" });
    const box = await panel.boundingBox(); expect(box!.y).toBeGreaterThanOrEqual(0); expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    await panel.getByRole("radio", { name: "Light", exact: true }).check();
    await panel.getByRole("radio", { name: "Dark", exact: true }).check();
    await page.keyboard.press("Escape"); await expect(trigger).toBeFocused();
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    const search = page.getByRole("dialog", { name: "Search the hall" }), input = search.getByRole("combobox");
    await expect(input).toBeFocused();
    const rect = await search.boundingBox(); expect(rect!.y).toBeGreaterThanOrEqual(0); expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
    await input.fill("MCP"); await expect(search.getByRole("option").first()).toBeInViewport();
    await page.keyboard.press("Escape");
  }
});

test("keyboard search keeps the selected result and input visible through wrapping and empty states", async ({ page }) => {
  for (const [width, height] of [[375, 667], [768, 320]]) {
    await page.setViewportSize({ width, height }); await page.goto("/docs/");
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    const input = page.getByRole("combobox", { name: "Search documentation" });
    await expect(page.getByRole("option")).toHaveCount(8);
    for (let i = 0; i < 10; i++) {
      await input.press("ArrowDown");
      await expect.poll(() => page.locator('[role="option"][aria-selected="true"]').evaluate(el => {
        const r = el.getBoundingClientRect(), list = el.parentElement!.getBoundingClientRect();
        return r.top >= list.top - 1 && r.bottom <= list.bottom + 1;
      })).toBe(true);
      await expect(input).toBeInViewport();
    }
    await input.fill("no-such-topic-123xyz"); await expect(page.getByRole("option")).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("No pages match");
    await input.fill("TLS"); await expect(page.getByRole("option").first()).toBeInViewport();
    await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "Search documentation", exact: true })).toBeFocused();
  }
});

test("UI and technical text use the bundled fonts including Turkish glyphs", async ({ page }) => {
  await page.goto("/docs/installation/"); await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, code: getComputedStyle(document.querySelector("pre")!).fontFamily }));
  expect(fonts.body.toLowerCase()).toContain("spacegrotesk"); expect(fonts.code.toLowerCase()).toContain("jetbrainsmono");
  await page.evaluate(() => {
    const sample = document.createElement("div"); sample.innerHTML = '<span id="font-ui">ÇĞİÖŞÜçğıöşü</span><code id="font-code">ÇĞİÖŞÜçğıöşü</code>'; document.body.append(sample);
  });
  const session = await page.context().newCDPSession(page); await session.send("DOM.enable"); await session.send("CSS.enable");
  const { root } = await session.send("DOM.getDocument");
  for (const [selector, family] of [["#font-ui", "Space Grotesk"], ["#font-code", "JetBrains Mono"]]) {
    const { nodeId } = await session.send("DOM.querySelector", { nodeId: root.nodeId, selector });
    const { fonts: actual } = await session.send("CSS.getPlatformFontsForNode", { nodeId });
    expect(actual.some(font => font.isCustomFont && font.familyName.startsWith(family) && font.glyphCount >= 12)).toBe(true);
    expect(actual.filter(font => !font.isCustomFont && font.glyphCount > 0)).toEqual([]);
  }
  await session.detach();
});

test("content remains visible and usable when custom font requests fail", async ({ page }) => {
  await page.route("**/*.woff2", route => route.abort());
  await page.goto("/"); await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Summon your guardian", exact: true })).toBeVisible();
  await page.goto("/docs/installation/"); await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  await expect(page.getByRole("combobox")).toBeFocused();
});

test("every documentation page has readable syntax colors in both themes", async ({ page, request }) => {
  test.setTimeout(120_000);
  const entries: { href: string }[] = await (await request.get("/docs-search.json")).json();
  for (const theme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const { href } of entries) {
      await page.goto(href);
      const failures = await page.evaluate(() => {
        const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d")!, saved = new Map<string, number>();
        const luminance = (color: string) => {
          if (saved.has(color)) return saved.get(color)!;
          context.fillStyle = color; context.fillRect(0, 0, 1, 1);
          const c = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
          const value = c[0] * .2126 + c[1] * .7152 + c[2] * .0722; saved.set(color, value); return value;
        };
        return [...document.querySelectorAll(".docs-code-line > span")].filter(el => el.textContent?.trim()).flatMap(el => {
          const background = luminance(getComputedStyle(el.closest(".docs-code")!).backgroundColor), foreground = luminance(getComputedStyle(el).color);
          const ratio = (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
          return ratio < 4.5 ? [{ text: el.textContent?.slice(0, 40), ratio }] : [];
        });
      });
      expect(failures, theme + " " + href).toEqual([]);
    }
  }
});

test("documentation checklists expose their visible text as native checkbox labels", async ({ page }) => {
  await page.goto("/docs/deployment/");
  const checkboxes = page.getByRole("checkbox"); await expect(checkboxes).toHaveCount(26);
  await expect(page.getByRole("checkbox", { name: "Enable TLS for all communications", exact: true })).toBeDisabled();
  expect(await checkboxes.evaluateAll(inputs => inputs.every(input => (input as HTMLInputElement).labels?.[0]?.textContent?.trim()))).toBe(true);
});
