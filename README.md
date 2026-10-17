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
  The hero uses the original logo rather than replacing the project identity.
- All typography is bundled locally; continuous decorative motion respects
  `prefers-reduced-motion`, with keyboard support for all tabs.
- The Ma’at passage links to the Metropolitan Museum’s explanation of the
  weighing of the heart. It is a metaphor, not a technical product claim.
