import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// A committed, static image keeps social crawlers independent of a server runtime.
// Regenerate with `npm run generate:og` after installing Playwright Chromium.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = async (file, type) => `data:${type};base64,${(await fs.readFile(path.join(root, file))).toString("base64")}`;
const manrope = await data("node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2", "font/woff2");
const cormorant = await data("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2", "font/woff2");
const logo = (await fs.readFile(path.join(root, "public/images/anubis-logo.svg"), "utf8"))
  .replace('width="400" height="400" viewBox="0 0 400 400"', 'width="330" height="344" viewBox="60 52 280 292"');
const ticks = Array.from({ length: 60 }, (_, i) => `<path d="M 0 -212 v ${i % 5 === 0 ? 12 : 5}" transform="rotate(${i * 6})"/>`).join("");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face{font-family:Manrope;src:url('${manrope}') format('woff2');font-weight:200 800;font-display:block}
@font-face{font-family:Cormorant;src:url('${cormorant}') format('woff2');font-weight:500;font-style:italic;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{font-family:Manrope,sans-serif;color:#f3f1e8;background:#0b100e}
.card{position:relative;width:1200px;height:630px;isolation:isolate;background:radial-gradient(ellipse at 80% 34%,#a98c3926,transparent 46%),radial-gradient(ellipse at 58% 100%,#2cac6d18,transparent 58%),linear-gradient(115deg,#101713,#090d0b)}
.frame{position:absolute;inset:22px;border:1px solid #dcc47730;border-radius:18px}
.corner{position:absolute;inset:22px;z-index:-1}
.brand{position:absolute;left:64px;top:53px;font-size:27px;line-height:36px;font-weight:800;letter-spacing:-.8px}
.brand span{color:#e5c46d}.brand:before{content:'';display:inline-block;width:5px;height:24px;background:#e5c46d;margin-right:15px;vertical-align:-2px;border-radius:2px}
.status{position:absolute;right:64px;top:57px;display:flex;align-items:center;gap:9px;color:#87d9a8;font-size:12px;letter-spacing:1.9px;font-weight:700}
.status:before{content:'';width:7px;height:7px;background:#5bd391;border-radius:50%;box-shadow:0 0 16px #59d18c80}
.copy{position:absolute;left:64px;top:156px;width:688px}
h1{margin:0;font-size:65px;line-height:1.13;font-weight:800;letter-spacing:-3px}
h1 em{display:block;font-family:Cormorant,serif;font-size:96px;font-weight:500;letter-spacing:-3.4px;color:#edce7e;line-height:1.04;margin-top:2px}
.description{margin:26px 0 0;color:#c0c9c1;font-size:25px;font-weight:500;line-height:1.55;letter-spacing:-.4px}
.description strong{color:#f0f2e9;font-weight:650}
.guardian{position:absolute;left:720px;top:121px;width:428px;height:428px}
.orbit{position:absolute;inset:0;width:428px;height:428px;color:#d2b76b}
.logo{position:absolute;left:48px;top:28px;filter:drop-shadow(0 14px 28px #0006)}
.footer{position:absolute;bottom:59px;left:64px;right:64px;display:flex;align-items:center;justify-content:space-between}
.features{display:flex;gap:12px}.feature{display:flex;align-items:center;gap:9px;border:1px solid #d5c68136;background:#17201ba8;border-radius:7px;padding:12px 15px;font-size:15px;font-weight:600;line-height:19px;color:#deded0}
.feature svg{width:18px;height:18px;stroke:#e7c776;stroke-width:1.5;fill:none;stroke-linecap:round;stroke-linejoin:round}
.domain{font-size:23px;font-weight:650;letter-spacing:-.6px;color:#e9cb79}.domain span{color:#8eac96;margin-left:12px;font-weight:400}
.pulse{position:absolute;bottom:129px;left:64px;width:1072px;height:48px;z-index:-1}
</style></head><body><main class="card">
<div class="frame"></div>
<svg class="corner" width="1156" height="586" viewBox="0 0 1156 586" fill="none" stroke="#d4b769" stroke-width="2"><path d="M0 38V18Q0 0 18 0H38M1118 0H1138Q1156 0 1156 18V38M1156 548V568Q1156 586 1138 586H1118M38 586H18Q0 586 0 568V548"/></svg>
<div class="brand">Anubis<span>Watch</span></div><div class="status">THE GUARDIAN IS AWAKE</div>
<div class="copy"><h1>The Judgment<em>Never Sleeps.</em></h1><p class="description">Uptime &amp; synthetic monitoring.<br><strong>Self-hosted. One Go binary.</strong></p></div>
<div class="guardian"><svg class="orbit" viewBox="-224 -224 448 448" fill="none"><circle r="211" stroke="currentColor" stroke-opacity=".12"/><g stroke="currentColor" stroke-opacity=".35">${ticks}</g><circle r="192" stroke="currentColor" stroke-opacity=".2" stroke-dasharray="240 32 30 32 160 110" transform="rotate(-42)"/><circle r="169" stroke="#62ce97" stroke-opacity=".07"/><path d="M-216 0H-228M216 0H228M0-216V-228M0 216V228" stroke="currentColor" stroke-opacity=".7"/><circle cx="151" cy="-151" r="4" fill="#e0c272"/><circle cx="-151" cy="151" r="3" fill="#60c48b"/></svg><div class="logo">${logo}</div></div>
<svg class="pulse" viewBox="0 0 1072 48" fill="none"><defs><linearGradient id="line"><stop stop-color="#5ab883" stop-opacity=".05"/><stop offset=".4" stop-color="#5ab883" stop-opacity=".5"/><stop offset="1" stop-color="#5ab883" stop-opacity=".05"/></linearGradient></defs><path d="M0 28H550L560 22L568 33L578 6L588 44L598 19L607 28H1072" stroke="url(#line)" stroke-width="1.5"/></svg>
<div class="footer"><div class="features"><div class="feature"><svg viewBox="0 0 24 24"><path d="M4 7 12 3 20 7 12 11ZM4 12 12 16 20 12M4 17 12 21 20 17"/></svg>10 protocols</div><div class="feature"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M10 8 6 15M14 8 18 15M8 18H16"/></svg>Raft cluster</div><div class="feature"><svg viewBox="0 0 24 24"><path d="M8 7 3 12 8 17M16 7 21 12 16 17M14 4 10 20"/></svg>Open source</div></div><div class="domain">anubis.watch<span>↗</span></div></div>
</main></body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, "public/images/anubiswatch-og-v2.png"), type: "png" });
  console.log("Generated public/images/anubiswatch-og-v2.png (1200 × 630)");
} finally {
  await browser.close();
}
