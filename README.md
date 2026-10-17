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
- Typography and layout use rem units with a fluid 16–30px root size. At 4K,
  the main content spans 2325px, body copy is around 32–34px, and navigation
  around 28px. Desktop tests include 1920, 2560 and 3840px widths with explicit
  readability checks. Mobile dashboard rows and workflow steps reflow instead
  of shrinking into unreadable labels.
- The Ma’at passage links to the Metropolitan Museum’s explanation of the
  weighing of the heart. It is a metaphor, not a technical product claim.

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

The header Appearance menu has Light, Dark and System preview cards, like the
theme picker on cobaltdb.dev. System follows device changes; explicit choices
select the original dark palette or a light papyrus palette with contrasting gold
and green accents, including documentation
and syntax highlighting. A pre-paint script applies the saved preference or device
theme; choices persist locally and synchronize across tabs. Storage failures do
not prevent switching within the current session.

The OXOGNET studio section appears below the site and documentation, with a native
SVG signature animation and the four project links shown on ninedeploy.com.
Its animation follows reduced-motion and the homepage motion control.
Theme tests cover both palettes, accessibility, responsive header controls,
cross-tab preference updates and unavailable browser storage.
