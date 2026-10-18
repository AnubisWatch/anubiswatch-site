import { test, expect } from "@playwright/test";

test("static pages expose a fetchable social image and route-specific sharing titles", async ({ page, request }) => {
  const catalog = await request.get("/docs-search.json");
  const docs: { href: string }[] = await catalog.json();
  for (const route of ["/", ...docs.map((doc) => doc.href)]) {
    // Inspect initial HTML, as crawlers do, without needing hydration.
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    const meta = await page.evaluate((html) => {
      const document = new DOMParser().parseFromString(html, "text/html");
      const content = (selector: string) => [...document.querySelectorAll(selector)].map((node) => node.getAttribute("content"));
      return {
        og: content('meta[property="og:image"]'),
        twitter: content('meta[name="twitter:image"]'),
        width: content('meta[property="og:image:width"]'),
        height: content('meta[property="og:image:height"]'),
        type: content('meta[property="og:image:type"]'),
        alt: content('meta[property="og:image:alt"]'),
        card: content('meta[name="twitter:card"]'),
        title: content('meta[property="og:title"]'),
        twitterTitle: content('meta[name="twitter:title"]'),
      };
    }, await response.text());
    expect(meta.og, route).toEqual(["https://raw.githubusercontent.com/AnubisWatch/anubiswatch-site/main/public/og.png"]);
    expect(meta.twitter, route).toEqual(meta.og);
    expect(meta.width, route).toEqual(["1200"]);
    expect(meta.height, route).toEqual(["630"]);
    expect(meta.type, route).toEqual(["image/png"]);
    expect(meta.alt[0], route).toContain("AnubisWatch");
    expect(meta.card, route).toEqual(["summary_large_image"]);
    expect(meta.twitterTitle, route).toEqual(meta.title);
    if (route.startsWith("/docs/")) expect(meta.title[0], route).not.toBe("AnubisWatch — The Judgment Never Sleeps");
  }
  const image = await request.get("/og.png");
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  const bytes = await image.body();
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
  expect(bytes.length).toBeLessThan(1_000_000);
});
