# AnubisWatch website

The public website for [AnubisWatch](https://github.com/AnubisWatch/AnubisWatch).
Canonical domain: **https://anubis.watch**.

Next.js 16.4.2 App Router, React 19.3.1, Motion, Lucide and locally served fonts.
The site exports static HTML to `out/` for GitHub Pages. No runtime server,
database or third-party tracking is required.

## Development

    npm ci
    npm run dev

## Verification

    npm run typecheck
    npm run build
    npx playwright install chromium
    npm run test:e2e

Tests exercise desktop/mobile rendering, WCAG A/AA checks through axe,
incident simulation/recovery, protocol and workflow keyboard navigation,
installation choices, clipboard success/failure, mobile navigation and FAQ.
`npm run preview` serves the exported site locally on port 3000.
Browser tests own a separate static server on port 4173 and never reuse a
potentially unrelated preview server.
Set `PLAYWRIGHT_PORT` to another free port when a different workspace is already
using 4173; the test base URL and owned server change together.

## Deployment

`.github/workflows/pages.yml` verifies every push and pull request.
A successful push to `main` publishes `out/` to the `github-pages` environment
using the official Pages actions. Pull requests only run checks.
Actions are pinned by commit, installation uses `package-lock.json`, and deployment
uses GitHub OIDC with no stored deployment credentials.

Set **Settings → Pages → Source → GitHub Actions** and custom domain
`anubis.watch`. `public/CNAME` also records the domain and is copied into
the export. With Actions publishing, the Pages custom-domain setting is authoritative.

### DNS at Spaceship

At the DNS provider, configure **either** an apex ALIAS/ANAME pointing to
`anubiswatch.github.io`, **or** these four A records:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | anubiswatch.github.io |

Optional IPv6: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

After DNS validation and GitHub certificate provisioning, enable **Enforce HTTPS**
in Pages settings. Verify:

    Resolve-DnsName anubis.watch -Type A
    gh api repos/AnubisWatch/anubiswatch-site/pages

`anubiswatch.com` can be forwarded at the domain provider to
`https://anubis.watch` with a permanent redirect, preserving paths.
It is not a second Pages custom domain.

Official reference: [GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Content and identity

- Product claims and CLI commands are grounded in the AnubisWatch README,
  configuration reference and published release assets.
- The current project supports **10 protocols**, superseding the eight in the
  supplied introduction card. Update `src/lib/content.ts` when capabilities change.
- Dashboard telemetry and incident simulation are explicitly illustrative.
- Original logo and presentation card were supplied by the project owner.
  `public/images/anubis-logo.svg` reconstructs the logo as editable vector paths
  and gold gradients, with a transparent background and no embedded raster.
  The header, hero, dashboard preview, footer and favicon use this SVG.
  The original PNG is retained as a reference and Apple touch icon.
- All typography is bundled locally; continuous decorative motion respects
  `prefers-reduced-motion`, with keyboard support for all tabs.
- Native SVG scenes add celestial scanning, globe/probe rings, alert dispatch,
  stacked binary layers, protocol packets, balanced scales and a winged solar disc.
  The Motion control pauses animations and stores the visitor's preference.
  Offscreen scenes and hidden tabs pause automatically through IntersectionObserver
  and the Page Visibility API. Device reduced-motion settings take precedence.
- Shared geometry in src/app/layout.css aligns the header, sections and footer.
  Containers use fluid 20–64px gutters and a 1728px cap independent of typography:
  1344px of content at 1440px, and 1728px at 1920px and above. The root type scale
  is 16–22px; paragraphs stay within 68ch and 760px while tables and panels use
  the wider reading area. Desktop cards use four columns, tablet cards two and
  mobile cards one. Layout checks cover 375, 768, 1024, 1440, 1920 and 2560px in
  both themes, including alignment, usable width and visible-element overflow.
  Mobile dashboard rows and workflow steps reflow into readable arrangements.
- The Ma’at passage links to the Metropolitan Museum’s explanation of the
  weighing of the heart. It is a metaphor, not a technical product claim.

## Social sharing image

`public/og.png` (served at `/og.png`) is the 1200 × 630 Open Graph and Twitter
card shared by the homepage and all documentation pages. It uses the existing
SVG logo and bundled fonts, with a simplified message for small previews.
Page metadata explicitly includes the image because Next.js replaces nested
Open Graph objects rather than merging their fields. Sharing titles remain
specific to each documentation page.

After installing Playwright Chromium, regenerate the committed image with
`npm run generate:og`. Its HTML, vector ornament and local font inputs live in
`scripts/generate-og.mjs`; rendering needs no network access or image service.
The exported PNG is served directly by GitHub Pages. Tests inspect initial HTML
for every route and verify the image response, format and dimensions.
While the custom domain's HTTPS certificate is pending, sharing metadata points
to the public PNG on `raw.githubusercontent.com` so crawler image downloads
use a valid HTTPS connection. Once the domain certificate is ready, the shared
image URL in `src/lib/social-image.ts` can use the site's own HTTPS URL.

## Site-wide SVG atmosphere

`SiteAtmosphere` is mounted once in the root layout on the marketing site and
all documentation pages. Two fixed SVG siblings share one simulation: the calm
ambient field behind content and a transparent interaction layer above content
(z-index 10), below headers, menus and dialogs. Section overflow, isolation and
panel backgrounds cannot clip or hide the interaction layer. Only the viewport
clips either SVG; no full-screen mask, blur filter or blend mode is needed.
Native SVG symbols, paths and circles form Ma'at feathers, scales, pyramids and
heartbeat probes. Three continuous signal routes and depth-dependent scroll
parallax keep the field coherent through every section and the footer.

Each SVG stays the size of the viewport instead of growing with the document.
A fixed pool of at most 112 units (28 on mobile) wraps outside the visible edges;
hidden ambient units receive no transform/opacity updates. Text, headers,
panels and the transparent logo have soft quiet zones. Normal content rectangles
are cached in document coordinates; sticky elements are measured when scrolling.
Colors inherit the shared gold/green theme variables, with lower light-mode
opacity. No Canvas, raster backing store, animation library or dependency is added.

Passive document listeners track hover over text, cards and controls alike,
using client coordinates that stay anchored during scrolling. Local attraction,
repulsion and tangential drift, foreground glyph echoes, small
orbiting probes and fading light trails make the reaction visible on panels
without a rectangular reading-area mask. Hover fades after inactivity; mobile
uses fewer probes and no simulated touch hover. Taps produce one of three
verdict wave variants and short-lived sparks, capped at six waves and 54
sparks (three and 18 on mobile). Nearby rapid taps merge. Controls, reading text,
drags, selected text, cancelled touches and native scrolling never create
background bursts. Blank card areas can emit waves across card boundaries.
Both decorative SVGs use pointer-events:none and cannot receive keyboard focus.

Probe offsets use damped springs with substeps, cursor momentum and local eddies.
The cursor companions follow drifting elliptical paths at different speeds and
lags. A verdict wave can seed two shapes, which relay attenuated energy through
two neighbour generations. Each burst visits at most 12 shapes (five on mobile),
and at most 24 relay paths (eight on mobile) can exist globally. Neighbours are
searched on hits only; no all-pairs neighbour scan runs each frame. Relays and
small resonance halos fade quickly, without raising the existing opacity limits.
The DOM-free physics live in `src/lib/atmosphere-dynamics.ts`.

Density, lifetimes, radii, parallax, quiet zones and frame rates are centralized in
`src/lib/site-atmosphere.ts`. Elapsed-time motion runs outside React rendering.
Idle activity drops; the loop stops when hidden or outside the viewport,
and resumes with a fresh timestamp. Device reduced motion keeps ambient artwork
static, redrawing only for layout changes. Every observer, listener and frame is
cleaned up on unmount. The mouse icon beside the theme picker controls only
cursor and click effects. Turning it off clears transient effects and aborts
pointer listeners; ambient shapes, signal routes, illustrated artwork and content
transitions continue. Ambient motion keeps its phase across toggles, and retains
scroll, resize and visibility handling independently of mouse effects.
The shared store uses `anubiswatch-background-motion` in localStorage, follows
reduced motion until an explicit choice, and synchronizes both headers and tabs.
Users can explicitly opt into mouse effects even with reduced motion, while
ambient motion still respects the device preference. Blocked storage retains a
session-only choice. Its pressed state means mouse effects are enabled, and its
English accessible label/tooltip describes the next action: “Disable mouse effects”
or “Enable mouse effects”.

Tests cover SVG symbol references, bounded pools, section/footer continuity,
actual vector changes and suspension, invisible units, effect expiry, native
mobile scrolling, control isolation, cross-page mouse preference, reduced motion, both
themes and widths up to 3840px. Shared layout tests additionally check 375, 768,
1024, 1440, 1920 and 2560px.

## Embedded documentation

The website exports 17 documentation pages under /docs/, with local search,
grouped navigation, a page table of contents, syntax highlighting, code copying,
previous/next links, mobile navigation and per-page canonical metadata.
All documentation pages are in the sitemap.

Content lives in content/docs/. source.json pins its upstream reference commit,
and LICENSE.txt retains the AnubisWatch documentation license. Curated guides
correct known drift in archive downloads, initialization ports and MCP examples;
reference pages preserve the project material with website presentation changes.
See content/docs/README.md before updating the source snapshot.

The search index is generated before build and dev, then fetched only when
search opens. Shiki runs at build time; its highlighter is not shipped to the
browser. Every reference page works from the static export without GitHub APIs.
Browser tests check page exports, search failure/retry, keyboard navigation,
clipboard paths, in-page anchors, mobile navigation and accessibility.

## Themes and studio

Space Grotesk is the shared UI typeface and JetBrains Mono is used for code and
technical values. `src/app/fonts.ts` configures self-hosted variable fonts through
`next/font/local`; styles use the `--font-space-grotesk` and `--font-jetbrains`
tokens rather than generated class names. Normal and italic code faces include
Turkish glyphs. Font licenses are in `public/fonts/`. Quicksand is a reserved
token and is not downloaded or applied without a defined accent use.

The header Appearance menu has Light, Dark and System preview cards, like the
theme picker on cobaltdb.dev. System follows device changes; explicit choices
select the original dark palette or a light papyrus palette with contrasting gold
and green accents, including documentation
and syntax highlighting. A pre-paint script applies the saved preference or device
theme; choices persist locally and synchronize across tabs. Storage failures do
not prevent switching within the current session.

The OXOG studio signature below the site and documentation matches the footer on
mammothengine.com: the same four-path SVG, six-second repeating draw animation,
Space Grotesk heading, copy and single oxog.net link. No project list is included.
The scoped styles preserve the reference's layout and two palettes. The bundled
heading font includes its SIL Open Font License in `public/fonts/`.
Its animation pauses offscreen or in a hidden tab, respects reduced motion and
continues independently of the mouse-effects switch.
Theme and design-quality tests cover both palettes, accessibility, responsive header controls,
cross-tab preference updates and unavailable browser storage.
Navigation disclosures support Escape, focus entry/return, outside dismissal and
closing when their desktop breakpoint is reached. Search keeps its input visible
while keyboard selection scrolls the result list, including short landscape views.
